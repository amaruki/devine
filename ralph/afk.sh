#!/bin/bash
set -eo pipefail

# -------------------------------------------------------
# Guards
# -------------------------------------------------------
if [ -z "$RALPH_YOLO_ENABLED" ]; then
  echo "Error: Set RALPH_YOLO_ENABLED=1 to enable AFK yolo mode" >&2
  echo "Warning: This mode auto-accepts ALL tool calls including destructive operations" >&2
  exit 1
fi

if [ "$APP_ENV" = "production" ]; then
  echo "Error: Cannot run AFK mode in production environment" >&2
  exit 1
fi

if [ "$RALPH_YOLO_ACK" != "I_UNDERSTAND_THE_RISKS" ]; then
  echo "Error: Set RALPH_YOLO_ACK='I_UNDERSTAND_THE_RISKS' to acknowledge:" >&2
  echo "  - Auto-accepted git push, branch delete, file overwrite, and other destructive ops" >&2
  echo "  - No undo for committed changes" >&2
  echo "  - Full repository write access" >&2
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <issues>" >&2
  exit 1
fi

for cmd in gh jq claude; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Cannot find $cmd. Install it or run from an environment with it available." >&2
    exit 1
  fi
done

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

# -------------------------------------------------------
# Setup
# -------------------------------------------------------
LOG_DIR="ralph/logs"
mkdir -p "$LOG_DIR"
SESSION_ID="afk-$(date +%Y%m%d-%H%M%S)"
LOG_CHAT="$LOG_DIR/$SESSION_ID.log"
LOG_RAW="$LOG_DIR/$SESSION_ID.log.raw"
MAX_RUNTIME="${RALPH_MAX_RUNTIME:-3600}"
MAX_ISSUES="$1"
MAX_RETRIES=5

tmpfile=$(mktemp)
trap "rm -f $tmpfile" EXIT

stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'
final_result='select(.type == "result").result // empty'

# -------------------------------------------------------
# Session progress tracker
# -------------------------------------------------------
completed_issues=()
skipped_issues=()

session_progress() {
  local lines=()
  if [ ${#completed_issues[@]} -gt 0 ]; then
    local comp
    comp=$(printf '#%s,' "${completed_issues[@]}")
    comp="${comp%,}"
    lines+=("Completed: $comp")
  fi
  if [ ${#skipped_issues[@]} -gt 0 ]; then
    local skip
    skip=$(printf '#%s,' "${skipped_issues[@]}")
    skip="${skip%,}"
    lines+=("Skipped (retries exhausted): $skip")
  fi
  printf '%s\n' "${lines[@]}"
}

# -------------------------------------------------------
# Startup: auto-commit dirty working tree via Claude
# -------------------------------------------------------
resolve_dirty_tree() {
  if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
    return 0
  fi
  echo "Working tree has uncommitted changes. Auto-committing via Claude..." >&2
  local diff_file="$tmpfile.dirty"
  git diff --no-color > "$diff_file"
  git diff --cached --no-color >> "$diff_file"
  if [ ! -s "$diff_file" ]; then
    return 0
  fi
  local msg
  msg=$(claude --print --dangerously-skip-permissions \
    "Read the file at $diff_file which contains a git diff of all uncommitted changes. Output ONLY a single conventional commit message line (no backticks, no explanation).")
  if [ -n "$msg" ]; then
    git add -A
    git commit -m "$msg"
    echo "Auto-committed with message: $msg" >&2
  fi
  rm -f "$diff_file"
}

# -------------------------------------------------------
# Build prompt for a single iteration
# -------------------------------------------------------
build_prompt() {
  local issue_brief="$1"
  local progress
  progress=$(session_progress)
  if [ -n "$progress" ]; then
    printf 'Session progress:\n%s\n\n%s' "$progress" "$issue_brief"
  else
    printf '%s' "$issue_brief"
  fi
}

# -------------------------------------------------------
# Close issue with claude's result as comment
# -------------------------------------------------------
close_issue() {
  local number="$1"
  local comment="$2"
  local state
  state=$(gh issue view "$number" --json state --jq .state 2>/dev/null)
  if [ "$state" = "OPEN" ]; then
    if [ -n "$comment" ]; then
      gh issue close "$number" --comment "$comment"
    else
      gh issue close "$number"
    fi
  fi
}

# -------------------------------------------------------
# Run one claude invocation for an issue
# -------------------------------------------------------
run_iteration() {
  local issue_brief="$1"
  : > "$tmpfile"
  local prompt
  prompt=$(build_prompt "$issue_brief")

  echo "Starting iteration at $(date -Iseconds)" >> "$LOG_RAW"

  timeout "$MAX_RUNTIME" claude --verbose \
    --print \
    --dangerously-skip-permissions \
    --output-format stream-json \
    "$prompt" \
  | tee -a "$tmpfile" "$LOG_RAW" \
  | jq --unbuffered -rj "$stream_text" \
  | tee -a "$LOG_CHAT" || true

  return 0
}

# -------------------------------------------------------
# Main loop
# -------------------------------------------------------
resolve_dirty_tree

echo "AFK session started." >&2
echo "  Chat log: $LOG_CHAT" >&2
echo "  Raw log:  $LOG_RAW" >&2
echo "  Issues: $MAX_ISSUES | Timeout: ${MAX_RUNTIME}s | Retries: $MAX_RETRIES" >&2

issues_completed=0

while [ "$issues_completed" -lt "$MAX_ISSUES" ]; do
  issue_brief=$(bash scripts/afk-task.sh autonomous-prompt next 2>/dev/null) || {
    echo "No unblocked AFK issues remaining. Ralph complete after $issues_completed issues." | tee -a "$LOG_CHAT" >&2
    exit 0
  }

  issue_number=$(echo "$issue_brief" | sed -n '1s/.*#\([0-9]*\).*/\1/p')
  echo "--- Issue #$issue_number ($((issues_completed + 1))/$MAX_ISSUES) ---" | tee -a "$LOG_CHAT" >&2

  retries=0
  success=false
  result=""

  while [ "$retries" -lt "$MAX_RETRIES" ] && [ "$success" = false ]; do
    echo "  Attempt $((retries + 1))/$MAX_RETRIES" >&2

    run_iteration "$issue_brief"

    result=$(jq -r "$final_result" "$tmpfile" 2>/dev/null || true)

    if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
      echo "Ralph complete after $issues_completed issues." | tee -a "$LOG_CHAT"
      exit 0
    fi

    if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
      success=true
    else
      retries=$((retries + 1))
      if [ "$retries" -lt "$MAX_RETRIES" ]; then
        echo "  Dirty tree after attempt $retries/$MAX_RETRIES. Retrying..." | tee -a "$LOG_CHAT" >&2
      fi
    fi
  done

  if [ "$success" = true ]; then
    close_issue "$issue_number" "$result"
    completed_issues+=("$issue_number")
    issues_completed=$((issues_completed + 1))
    echo "  Issue #$issue_number completed. ($issues_completed/$MAX_ISSUES)" | tee -a "$LOG_CHAT" >&2
  else
    skipped_issues+=("$issue_number")
    echo "  Issue #$issue_number skipped after $MAX_RETRIES failed attempts." | tee -a "$LOG_CHAT" >&2
  fi
done

echo "Ralph completed $MAX_ISSUES issues." | tee -a "$LOG_CHAT"
