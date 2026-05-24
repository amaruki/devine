#!/bin/bash
set -eo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "Cannot find gh. Install GitHub CLI or run from an environment with gh authenticated." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Cannot find jq. Install jq or run from an environment with jq available." >&2
  exit 1
fi

issues=$(gh issue list --state open --limit 100 --json number,title,body,labels 2>/dev/null \
  | jq -r '.[] | "---\n### #\(.number) \(.title)\nLabels: \(.labels | map(.name) | join(", ") // "None")\n\n\(.body // "No description")\n"' \
  2>/dev/null || echo "No issues found")
commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
prompt=$(cat ralph/prompt.md)

claude --permission-mode acceptEdits \
  "Previous commits: $commits Issues: $issues $prompt"