# ISSUES

Use `scripts/afk-task.sh next` to find the next open, unblocked AFK issue from GitHub.

You will work on the AFK issues only, not the HITL ones.

Review recent commits with `git log --oneline -10` to understand what work has been done.

If all AFK tasks are complete, output <promise>NO MORE TASKS</promise>.

# TASK SELECTION

Pick the next task. Prioritize tasks in this order:

1. Critical bugfixes
2. Development infrastructure

Getting development infrastructure like tests and types and dev scripts ready is an important precursor to building features.

3. Tracer bullets for new features

Tracer bullets are small slices of functionality that go through all layers of the system, allowing you to test and validate your approach early. This helps in identifying potential issues and ensures that the overall architecture is sound before investing significant time in development.

TL;DR - build a tiny, end-to-end slice of the feature first, then expand it out.

4. Polish and quick wins
5. Refactors

# EXPLORATION

Explore the repo.

# IMPLEMENTATION

Use /tdd to complete the task.

# FEEDBACK LOOPS

Before committing, run the full verification gate:

```bash
bun run complete-check
```

This runs type-check, lint, format, test, test:e2e, and build in order.

# COMMIT

Make a git commit. The commit message must:

1. Include key decisions made
2. Include files changed
3. Blockers or notes for next iteration

# THE ISSUE

If the task is complete, close the GitHub issue with `gh issue close <number>`, including a comment summarizing files changed, acceptance criteria completed, and checks run.

If the task is not complete, add a comment to the issue with what was done and what remains blocked.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
