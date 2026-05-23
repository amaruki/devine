---

name: Feature card
description: Track one approved implementation card from TASK_BREAKDOWN.md
title: "[Card ID] Title"
labels: ["type:feature"]
body:

- type: input
  id: card-id
  attributes:
  label: Card ID
  description: Card identifier from docs/TASK_BREAKDOWN.md.
  placeholder: BE-S1-01
  validations:
  required: true
- type: input
  id: acceptance-criteria
  attributes:
  label: Acceptance criteria
  description: Linked US/AC IDs covered by this card.
  placeholder: AC-02.01, AC-02.02
  validations:
  required: true
- type: textarea
  id: description
  attributes:
  label: Description
  description: Task description and scope.
  validations:
  required: true
- type: textarea
  id: definition-of-done
  attributes:
  label: Definition of done
  value: | - [ ] Cited AC IDs are implemented or explicitly verified. - [ ] User-owned data is scoped to the authenticated owner where applicable. - [ ] Public routes expose only documented public projections where applicable. - [ ] Tests cover changed behavior. - [ ] UI changes are manually verified in the running app. - [ ] Documentation references remain valid.
  validations:
  required: true
