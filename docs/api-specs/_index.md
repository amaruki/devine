# API Specs Index

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Draft  
**Phase:** Sprint Planning

This directory defines the reviewable API and server-action contracts for Devine. Route handlers and server actions should match these contracts before frontend wiring begins.

## Specs

| Spec                                                                 | Sprint | Scope                                                                                          |
| -------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| [Foundation Contracts](foundation-contracts.md)                      | 1      | Auth, sessions, dashboard state, activity submission, scoring reads, health, reset-state       |
| [Demo Share Contracts](demo-share-contracts.md)                      | 2      | Demo mode, judge accounts, dashboard companion reads, recent activity, minimal share snapshots |
| [Quest Nudge Contracts](quest-nudge-contracts.md)                    | 3      | Quests, power-ups, next best action, anti-doomscrolling, activity explainability               |
| [daily.dev Integration Contracts](dailydev-integration-contracts.md) | 4      | Token validation, connection management, external API fallback, pagination, connected activity |
| [Recovery Retention Contracts](recovery-retention-contracts.md)      | 5      | Share snapshot soft deletion, retention cleanup, optional email recovery scope                 |

## Shared response envelope

All JSON endpoints return one of these shapes unless a spec states otherwise.

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
```

## Shared HTTP rules

| Concern       | Contract                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | Private routes require the session cookie described in `../technical-specs/09-authentication-and-authorization.md`.                                                  |
| Validation    | Validate all request bodies at route or server-action boundaries.                                                                                                    |
| Secrets       | Responses never include passwords, password hashes, session tokens, daily.dev tokens, encryption payload internals, authorization headers, or raw exception details. |
| Ownership     | Authenticated mutations apply only to the current user's state unless the caller is a superadmin route.                                                              |
| Public routes | Public routes expose only explicit public projections.                                                                                                               |
| Errors        | Use stable `error.code` strings so frontend wiring can map empty, loading, degraded, unauthorized, validation, and not-found states.                                 |
