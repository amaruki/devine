# Ralph — AFK autonomous issue runner

Drives Claude Code through GitHub issues marked `Type: AFK` one at a time, with retry logic, audit logging, and session progress tracking.

## Prerequisites

| Requirement         | Check                                            |
| ------------------- | ------------------------------------------------ |
| GitHub CLI          | `gh auth login` and `gh auth status`             |
| jq                  | `jq --version`                                   |
| Claude Code CLI     | `claude --version`                               |
| Yolo opt-in         | `export RALPH_YOLO_ENABLED=1`                    |
| Risk acknowledgment | `export RALPH_YOLO_ACK="I_UNDERSTAND_THE_RISKS"` |

## Usage

```bash
export RALPH_YOLO_ENABLED=1
export RALPH_YOLO_ACK="I_UNDERSTAND_THE_RISKS"

# Run through 5 issues
bash ralph/afk.sh 5
```

## How it works

```
Startup
  ├─ Guard: env vars, production block, deps, gh auth
  ├─ Dirty tree? → Claude infers conventional commit, auto-commits
  └─ Create log files

Loop (counts issues completed, not claude invocations)
  └─ Per issue:
       ├─ afk-task.sh autonomous-prompt next  → validated brief
       ├─ Build prompt (session progress + brief)
       ├─ Run claude with timeout
       │    ├─ stdout: streaming text → .log (readable)
       │    └─ raw JSON → .log.raw (forensic)
       ├─ Tree clean? → close issue with claude's result as comment
       ├─ Tree dirty? → retry (up to 5× on same issue)
       └─ Retries exhausted? → skip, leave issue open for manual triage
```

## Security

| Layer              | Mechanism                                                    |
| ------------------ | ------------------------------------------------------------ |
| Yolo gate          | `RALPH_YOLO_ENABLED=1` required                              |
| Acknowledgment     | `RALPH_YOLO_ACK="I_UNDERSTAND_THE_RISKS"`                    |
| Production block   | Refuses to run when `APP_ENV=production`                     |
| Claude flag        | `--dangerously-skip-permissions` (bypasses all tool prompts) |
| Runaway protection | `RALPH_MAX_RUNTIME` (default 3600s) timeout per invocation   |
| Audit trail        | Full stream-json logged to `ralph/logs/`                     |

## Output files

Written to `ralph/logs/afk-<timestamp>.*`:

| File       | Content                                                           |
| ---------- | ----------------------------------------------------------------- |
| `.log`     | Readable conversation text from each iteration                    |
| `.log.raw` | Full stream-json from claude (system events, tool calls, results) |

## Environment variables

| Variable             | Default | Purpose                            |
| -------------------- | ------- | ---------------------------------- |
| `RALPH_YOLO_ENABLED` | —       | Must be `1` to run                 |
| `RALPH_YOLO_ACK`     | —       | Must be `I_UNDERSTAND_THE_RISKS`   |
| `RALPH_MAX_RUNTIME`  | `3600`  | Max seconds per claude invocation  |
| `APP_ENV`            | —       | Blocks execution when `production` |

## Issue format

Ralph only picks up issues with:

```
## Slice metadata

- Type: AFK
- User stories covered: ...
```

Issues without `Type: AFK` or with open blockers are skipped. Blockers are declared as:

```
## Blocked by

#5, #6
```

## Related

| File                  | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `ralph/once.sh`       | Single-shot AFK issue execution (no loop)                            |
| `ralph/prompt.md`     | System prompt for `once.sh`                                          |
| `scripts/afk-task.sh` | Issue intelligence: validation, brief generation, blocker resolution |
