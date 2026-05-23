#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash .agents/scripts/afk-task.sh <issue-number>

Examples:
  bash .agents/scripts/afk-task.sh 1
  bash .agents/scripts/afk-task.sh 3

This prints an agent-executable implementation brief for one AFK issue from issues.md.
Paste the output into an implementation agent, or run it from an agent session to get the exact task scope.
USAGE
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 2
fi

issue_number="$1"

case "$issue_number" in
  ''|*[!0-9]*)
    printf 'Issue number must be numeric.\n' >&2
    exit 2
    ;;
esac

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
issues_file="$repo_root/issues.md"
prd_file="$repo_root/prd.md"
mvp_file="$repo_root/mvp.md"

if [[ ! -f "$issues_file" ]]; then
  printf 'Cannot find issues.md at %s\n' "$issues_file" >&2
  exit 1
fi

python - "$issues_file" "$prd_file" "$mvp_file" "$issue_number" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

issues_path = Path(sys.argv[1])
prd_path = Path(sys.argv[2])
mvp_path = Path(sys.argv[3])
issue_number = sys.argv[4]

issues = issues_path.read_text(encoding="utf-8")
match = re.search(
    rf"(^## Issue {re.escape(issue_number)}: .*?)(?=\n---\n\n## Issue \d+:|\Z)",
    issues,
    flags=re.MULTILINE | re.DOTALL,
)

if not match:
    print(f"Issue {issue_number} was not found in {issues_path}", file=sys.stderr)
    sys.exit(1)

issue = match.group(1).strip()
summary_match = re.search(
    rf"^\s*{re.escape(issue_number)}\. \*\*(.*?)\*\*\n\s*- \*\*Type:\*\* (.*?)\n\s*- \*\*Blocked by:\*\* (.*?)\n\s*- \*\*User stories covered:\*\* (.*?)$",
    issues,
    flags=re.MULTILINE,
)

if summary_match and summary_match.group(2).strip().upper() != "AFK":
    print(
        f"Issue {issue_number} is marked {summary_match.group(2).strip()}, not AFK. Do not run unattended.",
        file=sys.stderr,
    )
    sys.exit(1)

blocked_by = summary_match.group(3).strip() if summary_match else "Unknown"
stories = summary_match.group(4).strip() if summary_match else "Unknown"

context_files = [path.name for path in (prd_path, mvp_path, issues_path) if path.exists()]

print(f"""# Agent-executable AFK task: Issue {issue_number}

You are implementing one AFK issue in this repository.

Repository root: {issues_path.parent}
Context files to read first: {', '.join(context_files)}
Blocked by: {blocked_by}
User stories covered: {stories}

## Operating rules

- Work only on this issue's scope and its acceptance criteria.
- Prefer the approved stack from the PRD/MVP: Next.js, TypeScript, Tailwind CSS, motion, Drizzle-ready structure, Neon/Postgres-ready persistence when relevant.
- Keep demo mode reliable and do not require daily.dev credentials unless the issue explicitly asks for token/API work.
- Do not implement out-of-scope features such as full AI chat, leaderboard, browser extension, background cron, or image export.
- Keep tokens and credentials out of client code, localStorage, logs, and committed files.
- Add or update tests when the issue acceptance criteria mention tests or when adding pure domain logic.
- After implementation, run the relevant checks and report exactly what passed or failed.
- If blocked by missing dependencies, environment variables, API access, or an earlier issue not implemented, stop and report the blocker instead of inventing a workaround.

## Issue scope

{issue}

## Expected final response

Return a concise report with:

1. Files changed.
2. Acceptance criteria completed.
3. Checks run and results.
4. Any blockers or follow-up needed.
""")
PY
