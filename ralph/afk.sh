#!/bin/bash
set -eo pipefail

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

# jq filter to extract streaming text from assistant messages
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result
final_result='select(.type == "result").result // empty'

fetch_issues() {
  gh issue list --state open --limit 100 --json number,title,body,labels 2>/dev/null \
    | jq -r '.[] | "---\n### #\(.number) \(.title)\nLabels: \(.labels | map(.name) | join(", ") // "None")\n\n\(.body // "No description")\n"' \
    2>/dev/null || echo "No issues found"
}

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

  docker sandbox run claude . -- \
    --verbose \
    --print \
    --output-format stream-json \
    "Previous commits: $commits Issues: $issues $prompt" \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi

  next_issue=$(bash scripts/afk-task.sh next-number 2>/dev/null || true)
  if [ -z "$next_issue" ]; then
    echo "No unblocked AFK issues remaining. Ralph complete after $i iterations."
    exit 0
  fi
  echo "Iteration $i done. Next unblocked AFK issue: #$next_issue" >&2
done