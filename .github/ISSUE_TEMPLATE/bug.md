---

name: Bug report
description: Report a defect against the approved Devine behavior
title: "Bug: "
labels: ["type:bug"]
body:

- type: textarea
  id: observed
  attributes:
  label: Observed behavior
  description: What happened?
  validations:
  required: true
- type: textarea
  id: expected
  attributes:
  label: Expected behavior
  description: What should have happened?
  validations:
  required: true
- type: input
  id: acceptance-criteria
  attributes:
  label: Related US/AC IDs
  description: Link the affected requirements when known.
  placeholder: AC-19.04
- type: textarea
  id: reproduction
  attributes:
  label: Reproduction steps
  description: Minimal steps to reproduce the issue.
  placeholder: | 1. Go to ... 2. Click ... 3. See ...
  validations:
  required: true
- type: textarea
  id: verification
  attributes:
  label: Verification
  value: | - [ ] `bun run type-check` - [ ] `bun run lint` - [ ] `bun run format` - [ ] `bun run test` - [ ] `bun run test:e2e` - [ ] `bun run build`
