#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/afk-task.sh <issue-number>
  bash scripts/afk-task.sh next
  bash scripts/afk-task.sh autonomous-prompt [issue-number|next]
  bash scripts/afk-task.sh run-next
  bash scripts/afk-task.sh run-loop [max-issues]

Examples:
  bash scripts/afk-task.sh 5
  bash scripts/afk-task.sh next
  bash scripts/afk-task.sh autonomous-prompt next
  bash scripts/afk-task.sh run-next
  bash scripts/afk-task.sh run-loop 3

Commands:
  <issue-number>            Print an agent-executable implementation brief for one AFK GitHub issue.
  next                      Find the lowest-numbered open AFK issue with no open blockers and print its brief.
  autonomous-prompt target  Print a full autonomous implementation prompt for Claude Code.
  run-next                  Invoke Claude Code to implement the next unblocked AFK issue, then stop.
  run-loop [max-issues]     Repeatedly invoke Claude Code for unblocked AFK issues until blocked or max is reached.

The issue body must include:
  ## Blocked by
  ...

  ## Slice metadata
  - Type: AFK
  - User stories covered: ...

HITL issues and issues with open blockers are rejected.
USAGE
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 2
fi

command_arg="$1"
target_arg="${2:-}"
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if ! command -v gh >/dev/null 2>&1; then
  printf 'Cannot find gh. Install GitHub CLI or run from an environment with gh authenticated.\n' >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  python_cmd=(python3)
elif command -v python >/dev/null 2>&1; then
  python_cmd=(python)
else
  printf 'Cannot find python3 or python.\n' >&2
  exit 1
fi

run_python() {
  "${python_cmd[@]}" - "$repo_root" "$1" "${2:-}" <<'PY'
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

repo_root = Path(sys.argv[1])
command_arg = sys.argv[2]
target_arg = sys.argv[3]


def fail(message: str, code: int = 1) -> None:
    print(message, file=sys.stderr)
    sys.exit(code)


def gh(args: list[str]) -> str:
    return subprocess.check_output(["gh", *args], text=True, encoding="utf-8")


def issue_view(number: int | str) -> dict:
    return json.loads(gh(["issue", "view", str(number), "--json", "number,title,body,state,labels,url"]))


def issue_state(number: int | str) -> dict:
    return json.loads(gh(["issue", "view", str(number), "--json", "number,title,state,url"]))


def parse_type(body: str) -> str:
    match = re.search(r"^- Type:\s*(\S+)\s*$", body, flags=re.MULTILINE)
    return match.group(1).strip().upper() if match else "UNKNOWN"


def parse_blocked_by(body: str) -> str:
    match = re.search(r"^## Blocked by\s*\n\s*(.*?)(?=\n## |\Z)", body, flags=re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else "Unknown"


def parse_stories(body: str) -> str:
    match = re.search(r"^- User stories covered:\s*(.*?)\s*$", body, flags=re.MULTILINE)
    return match.group(1).strip() if match else "Unknown"


def labels(issue: dict) -> list[str]:
    return sorted(label["name"] for label in issue.get("labels", []))


def blocker_refs(blocked_by: str) -> list[int]:
    return sorted({int(match) for match in re.findall(r"#(\d+)", blocked_by)})


def open_blockers(blocked_by: str) -> list[str]:
    blockers: list[str] = []
    for number in blocker_refs(blocked_by):
        issue = issue_state(number)
        if issue["state"].upper() == "OPEN":
            blockers.append(f"#{number} {issue['title']} ({issue['url']})")
    return blockers


def validate_afk_issue(issue: dict) -> None:
    if issue["state"].upper() != "OPEN":
        fail(f"Issue {issue['number']} is {issue['state']}, not OPEN. Do not run unattended.")
    metadata_type = parse_type(issue.get("body") or "")
    if metadata_type != "AFK":
        fail(f"Issue {issue['number']} is marked {metadata_type}, not AFK. Do not run unattended.")
    blockers = open_blockers(parse_blocked_by(issue.get("body") or ""))
    if blockers:
        print(f"Issue {issue['number']} still has open blockers. Do not run unattended.", file=sys.stderr)
        for blocker in blockers:
            print(f"- {blocker}", file=sys.stderr)
        sys.exit(1)


def list_open_issues() -> list[dict]:
    return json.loads(gh(["issue", "list", "--state", "open", "--limit", "100", "--json", "number,title,body,state,labels,url"]))


def find_next_afk_issue() -> dict:
    for issue in sorted(list_open_issues(), key=lambda item: item["number"]):
        body = issue.get("body") or ""
        if parse_type(body) != "AFK":
            continue
        if open_blockers(parse_blocked_by(body)):
            continue
        return issue_view(issue["number"])
    fail("No open, unblocked AFK issue was found.")


def context_files() -> list[str]:
    candidates = ["CLAUDE.md", "docs/CODING_STANDARD.md", "docs/TASK_BREAKDOWN.md", "docs/business", "docs/technical-specs"]
    return [candidate for candidate in candidates if (repo_root / candidate).exists()]


def build_brief(issue: dict) -> str:
    validate_afk_issue(issue)
    body = (issue.get("body") or "").strip()
    blocked_by = parse_blocked_by(body)
    stories = parse_stories(body)
    issue_labels = labels(issue)
    files = context_files()
    return f"""# Agent-executable AFK task: GitHub issue #{issue['number']}

You are implementing one AFK issue in this repository.

Repository root: {repo_root}
GitHub issue: {issue['url']}
Issue title: {issue['title']}
Labels: {', '.join(issue_labels) if issue_labels else 'None'}
Context files to read first: {', '.join(files) if files else 'None found'}
Blocked by: {blocked_by}
User stories covered: {stories}

## Operating rules

- Work only on this issue's scope and its acceptance criteria.
- Read the GitHub issue body and listed context files before editing code.
- Follow CLAUDE.md, docs/CODING_STANDARD.md, docs/business/, and docs/technical-specs/.
- Respect module boundaries, security/privacy rules, strict TypeScript, and the Bun-only workflow.
- Keep demo mode reliable and do not require daily.dev credentials unless the issue explicitly asks for token/API work.
- Do not implement out-of-scope features such as full AI chat, leaderboard, browser extension, background cron, or image export.
- Keep tokens and credentials out of client code, localStorage, logs, and committed files.
- Add or update tests when acceptance criteria mention tests or when adding pure domain logic.
- Run relevant verification checks and report exactly what passed or failed.
- If blocked by missing dependencies, environment variables, API access, or an earlier issue not implemented, stop and report the blocker instead of inventing a workaround.

## Issue scope

{body}

## Expected final response

Return a concise report with:

1. Files changed.
2. Acceptance criteria completed.
3. Checks run and results.
4. Any blockers or follow-up needed.
"""


def build_autonomous_prompt(issue: dict) -> str:
    return f"""{build_brief(issue)}
## Autonomous workflow

Proceed autonomously within this issue only:

1. Inspect the current code and source docs needed for this issue.
2. Implement the smallest vertical slice that satisfies every acceptance criterion.
3. Run focused checks as you work, then run the project verification gate required by CLAUDE.md before completion.
4. Perform a review pass on your own diff and fix correctness, privacy, security, and coding-standard issues.
5. If all checks pass, create one Conventional Commit for this issue.
6. Close GitHub issue #{issue['number']} with a comment summarizing files changed, acceptance criteria completed, and checks run.
7. Stop after closing this issue. Do not start another issue unless explicitly instructed by the user or an outer loop.

Stop instead of committing or closing if checks fail, browser verification is required but cannot be completed, requirements are ambiguous, external credentials/services are missing, or the working tree contains unrelated user changes.
"""


def resolve_target(command: str, target: str) -> dict:
    if command in {"next", "next-number"}:
        return find_next_afk_issue()
    if command == "autonomous-prompt":
        if not target:
            fail("autonomous-prompt requires an issue number or next.", 2)
        if target == "next":
            return find_next_afk_issue()
        if not target.isdigit():
            fail("Issue number must be numeric, or use next.", 2)
        return issue_view(target)
    if command.isdigit():
        return issue_view(command)
    fail("Unknown command. Use an issue number, next, autonomous-prompt, or next-number.", 2)


selected_issue = resolve_target(command_arg, target_arg)
if command_arg == "autonomous-prompt":
    print(build_autonomous_prompt(selected_issue), end="")
elif command_arg == "next-number":
    validate_afk_issue(selected_issue)
    print(selected_issue["number"], end="")
else:
    print(build_brief(selected_issue), end="")
PY
}

run_next() {
  if ! command -v claude >/dev/null 2>&1; then
    printf 'Cannot find claude. Install Claude Code or run this from an environment where claude is on PATH.\n' >&2
    exit 1
  fi

  issue_number="$(run_python next-number)"
  printf 'Starting autonomous Claude Code run for issue #%s.\n' "$issue_number" >&2
  prompt="$(run_python autonomous-prompt "$issue_number")"
  claude "$prompt"
}

run_loop() {
  local max_issues="${target_arg:-1}"
  case "$max_issues" in
    ''|*[!0-9]*)
      printf 'run-loop max-issues must be numeric.\n' >&2
      exit 2
      ;;
  esac

  local completed=0
  while (( completed < max_issues )); do
    if ! run_next; then
      printf 'Autonomous loop stopped after %s completed run(s).\n' "$completed" >&2
      exit 1
    fi
    completed=$((completed + 1))
  done
  printf 'Autonomous loop reached max issue count: %s.\n' "$max_issues" >&2
}

case "$command_arg" in
  run-next)
    run_next
    ;;
  run-loop)
    run_loop
    ;;
  *)
    run_python "$command_arg" "$target_arg"
    ;;
esac
