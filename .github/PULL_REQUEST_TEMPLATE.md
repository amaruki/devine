## Task

- Card ID:
- US/AC covered:
- Target branch:

## Summary

-

## How to test

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run format`
- [ ] `bun run test`
- [ ] `bun run test:e2e`
- [ ] `bun run build`

## Self-review

- [ ] I reviewed `docs/CODE_REVIEW_CHECKLIST.md`.
- [ ] Source files stay under 300 lines, or are split before merge.
- [ ] Domain logic remains in `lib/<module>/` and route handlers or actions stay thin.
- [ ] Direct database access remains under `lib/db/`.
- [ ] Secrets, tokens, private activity, and raw user identifiers are not exposed publicly.
- [ ] UI changes were manually verified in the running app where applicable.
