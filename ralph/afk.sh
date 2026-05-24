#!/bin/bash
set -eo pipefail

# Security: Require explicit opt-in for yolo mode
if [ -z "$RALPH_YOLO_ENABLED" ]; then
  echo "Error: Set RALPH_YOLO_ENABLED=1 to enable AFK yolo mode" >&2
  echo "Warning: This mode auto-accepts ALL tool calls including destructive operations" >&2
  exit 1
fi

# Security: Block production environment
if [ "$APP_ENV" = "production" ]; then
  echo "Error: Cannot run AFK mode in production environment" >&2
  exit 1
fi

# Security: Require explicit acknowledgment of risks
if [ "$RALPH_YOLO_ACK" != "I_UNDERSTAND_THE_RISKS" ]; then
  echo "Error: Set RALPH_YOLO_ACK='I_UNDERSTAND_THE_RISKS' to acknowledge:" >&2
  echo "  - Auto-accepted git push, branch delete, file overwrite, and other destructive ops" >&2
  echo "  - No undo for committed changes" >&2
  echo "  - Full repository write access" >&2
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Cannot find gh. Install GitHub CLI or run from an environment with gh authenticated." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Cannot find jq. Install jq or run from an environment with jq available." >&2
  exit 1
fi

# Security: Create audit log directory
LOG_DIR="ralph/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/afk-$(date +%Y%m%d-%H%M%S).log"

# Security: Maximum runtime (1 hour default, configurable)
MAX_RUNTIME_SECONDS="${RALPH_MAX_RUNTIME:-3600}"

# jq filter to extract streaming text from assistant messages
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result
final_result='select(.type == "result").result // empty'

fetch_issues() {
  gh issue list --state open --limit 100 --json number,title,body,labels 2>/dev/null \
    | jq -r '.[] | "---\n### #\(.number) \(.title)\nLabels: \(.labels | map(.name) | join(", ") // "None")\n\n\(.body // "No description")\n"' \
    2>/dev/null || echo "No issues found"
}

echo "AFK session started. Audit log: $LOG_FILE" >&2
echo "Max runtime: ${MAX_RUNTIME_SECONDS}s, Max iterations: $1" >&2

for ((i=1; i<=$1; i++)); do
  tmpfile=$(mktemp)
  trap "rm -f $tmpfile" EXIT

  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  issues=$(fetch_issues)
  prompt=$(cat ralph/prompt.md)

  if [[ "$issues" == "No issues found" ]]; then
    echo "Ralph complete after $((i-1)) iterations. No open issues remaining."
    exit 0
  fi

  echo "--- Iteration $i of $1 ---" >&2
  echo "Open issues available:" >&2
  echo "$issues" | grep -c '^###' 2>/dev/null | xargs -I{} echo "  {} issue(s) open" >&2
  echo "Starting iteration at $(date -Iseconds)" >> "$LOG_FILE"

  # Security: Wrap with timeout to prevent runaway sessions
  timeout "$MAX_RUNTIME_SECONDS" claude --verbose \
    --print \
    --dangerously-skip-permissions \
    --output-format stream-json \
    "Previous commits: $commits Issues: $issues $prompt" \
  | grep --line-buffered '^{' \
  | tee -a "$tmpfile" "$LOG_FILE" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iterations." | tee -a "$LOG_FILE"
    exit 0
  fi

  next_issue=$(bash scripts/afk-task.sh next-number 2>/dev/null || true)
  if [ -z "$next_issue" ]; then
    echo "No unblocked AFK issues remaining. Ralph complete after $i iterations." | tee -a "$LOG_FILE"
    exit 0
  fi
  echo "Iteration $i done. Next unblocked AFK issue: #$next_issue" | tee -a "$LOG_FILE" >&2
done