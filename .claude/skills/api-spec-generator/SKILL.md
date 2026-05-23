---
name: api-spec-generator
description: Generate enterprise-grade API specifications from product requirements, user stories, business rules, domain logic, acceptance criteria, or backend feature descriptions. Use this skill whenever the user asks to create, refine, audit, or standardize API specs, REST contracts, endpoint documentation, OpenAPI files, response schemas, error models, pagination contracts, rate-limit behavior, request tracing, or API documentation from business logic, even if they do not explicitly say “API spec”.
---

# Enterprise API Spec Generator

Use this skill to turn business requirements into a solid, implementation-ready API specification. The output should help backend, frontend, QA, product, and security reviewers agree on the contract before code is written.

The standard has three layers:

1. Consistent response structure.
2. RFC 7807-style error handling.
3. Documentation standards, especially OpenAPI 3.1.

## First, extract the business contract

Before writing endpoints, identify:

- Actors and authorization boundaries.
- Resources and lifecycle states.
- Business actions, not just CRUD verbs.
- Required inputs and derived outputs.
- Invariants, idempotency rules, and state transitions.
- Privacy/security constraints and fields that must not be exposed.
- Pagination, filtering, sorting, and search needs.
- Async behavior and external dependency failures.

If requirements are underspecified, state reasonable assumptions in an `Assumptions` section rather than inventing hidden behavior. Ask questions only when the missing detail changes the API shape materially.

## Default output structure

Produce the spec in this order unless the user asks for a different format:

```markdown
# API Spec: [Feature or Resource Name]

## Scope

## Assumptions

## Standards

## Authentication and Authorization

## Endpoints

## Schemas

## Response Envelope

## Error Model

## Status Code Map

## Pagination, Filtering, and Sorting

## Rate Limiting

## Correlation and Tracing

## Security and Privacy Notes

## OpenAPI 3.1 Snippet

## Acceptance Criteria Mapping
```

For small tasks, keep sections concise but do not omit the standards that affect client/server integration: envelopes, errors, status codes, request IDs, and OpenAPI schemas.

## Response envelope standard

Use a consistent success envelope for JSON responses:

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "timestamp": "2026-05-23T07:00:00Z",
    "request_id": "req_01JV...",
    "version": "v1"
  }
}
```

For list endpoints, include pagination metadata and navigational links:

```json
{
  "status": "success",
  "data": [],
  "meta": {
    "timestamp": "2026-05-23T07:00:00Z",
    "request_id": "req_01JV...",
    "version": "v1",
    "page": 1,
    "per_page": 20,
    "total": 340,
    "total_pages": 17
  },
  "links": {
    "self": "/api/v1/orders?page=1",
    "next": "/api/v1/orders?page=2",
    "last": "/api/v1/orders?page=17"
  }
}
```

Use `204 No Content` for successful operations that intentionally return no body. Do not wrap errors in the success envelope.

## Error model standard

Use `application/problem+json` with RFC 7807-style Problem Details. Include extension members for operational diagnostics when useful:

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Field 'email' must be a valid email address.",
  "instance": "/api/v1/users",
  "request_id": "req_01JV...",
  "timestamp": "2026-05-23T07:00:00Z",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Must be a valid email address"
    }
  ]
}
```

Rules:

- `type` is a stable URI and should identify the error class.
- `title` is a stable human-readable summary.
- `status` matches the HTTP status code.
- `detail` is safe for clients and must not leak secrets or raw internal exception messages.
- `instance` is the request path or problem occurrence URI.
- `request_id` matches the `X-Request-ID` response header.
- `errors[]` is for field-level or item-level validation details.
- Never return HTTP 200 for errors.

## HTTP status code map

Use this default map unless the business requirement justifies a different status:

| Situation                                                    | Status |
| ------------------------------------------------------------ | -----: |
| Successful read                                              |    200 |
| Resource created                                             |    201 |
| Async process accepted                                       |    202 |
| Success with no body                                         |    204 |
| Partial content returned for range requests                  |    206 |
| Resource not modified; client cache is still valid           |    304 |
| Malformed request or syntactic validation failure            |    400 |
| Missing, invalid, or expired token                           |    401 |
| Valid identity without permission                            |    403 |
| Resource not found or hidden by authorization policy         |    404 |
| Method not allowed                                           |    405 |
| Client does not accept any available response format         |    406 |
| Request timed out from the client side                       |    408 |
| State conflict, duplicate resource, idempotency conflict     |    409 |
| Resource permanently deleted and intentionally unavailable   |    410 |
| Precondition failed, such as ETag or `If-Match` mismatch     |    412 |
| Payload too large                                            |    413 |
| Unsupported media type or `Content-Type`                     |    415 |
| Semantic validation failure                                  |    422 |
| Resource locked by in-progress mutation or pessimistic lock  |    423 |
| Rate limit exceeded                                          |    429 |
| Request headers too large                                    |    431 |
| Unexpected server error                                      |    500 |
| Endpoint not implemented                                     |    501 |
| Gateway received an invalid upstream response                |    502 |
| Dependency unavailable, database down, or third-party outage |    503 |
| Upstream service timed out                                   |    504 |

When writing endpoint specs, list success and expected failure statuses explicitly for each endpoint. Include caching, conditional request, and gateway statuses only when the endpoint behavior or architecture makes them relevant.

## Caching and conditional request standard

Document caching behavior for read-heavy, public, CDN-backed, or expensive read endpoints.

Use `304 Not Modified` only when an earlier response provides validators such as `ETag` or `Last-Modified`. Clients then send `If-None-Match` or `If-Modified-Since`; the server returns `304` with no body when the resource has not changed.

Use `412 Precondition Failed` for optimistic locking and conditional mutations. A typical flow is: the client reads a resource and receives an `ETag`, then sends an update with `If-Match: <etag>`. If another write changed the resource first, return `412` instead of overwriting newer data.

Use `206 Partial Content` for range requests only when the endpoint explicitly supports `Range` and `Content-Range` semantics.

Distinguish permanent deletion from ordinary absence: use `410 Gone` when the resource definitely existed and was intentionally removed permanently; use `404 Not Found` when the resource might never have existed, is hidden by authorization, or could appear later.

## Gateway and upstream failure standard

For APIs behind a gateway or dependent on upstream services, distinguish infrastructure failures clearly:

- `502 Bad Gateway`: the gateway or API received an invalid response from an upstream service.
- `503 Service Unavailable`: the dependency is unreachable, overloaded, unavailable, or the service is temporarily unable to serve traffic.
- `504 Gateway Timeout`: the upstream service did not respond before the timeout.

Include `Retry-After` for retryable `502`, `503`, and `504` responses when the server can give useful retry guidance.

## Rate limiting standard

Document rate-limit policy when endpoints are public, auth-sensitive, expensive, or integration-facing.

Use these headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 743
X-RateLimit-Reset: 1748030400
Retry-After: 60
```

For `429 Too Many Requests`, return `application/problem+json`:

```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "You have exceeded 1000 requests per hour.",
  "retry_after": 60
}
```

## Versioning standard

Prefer path versioning for enterprise specs:

```text
/api/v1/resources
/api/v2/resources
```

Path versioning is easier for cross-functional teams to discover, route, document, and test. Mention header or date-based versioning only if the user explicitly asks for it or the existing system already uses it.

## Correlation and tracing standard

Every request should have a request ID:

- Accept `X-Request-ID` from trusted clients when provided.
- Generate a server-side request ID when absent.
- Return it in `X-Request-ID` response header.
- Include it in success `meta.request_id` and problem details `request_id`.
- Include it in logs.

For distributed tracing, support W3C Trace Context:

```http
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

## Endpoint spec format

For each endpoint, use this template:

```markdown
### METHOD /api/v1/resource

**Purpose:** One sentence tied to business value.

**Auth:** Required role/scope/session state.

**Request**

- Headers:
- Path params:
- Query params:
- Body schema:

**Success response**

- Status: 200/201/202/204
- Content-Type: application/json
- Body: [schema or example]

**Error responses**

- 400: malformed request
- 401: missing or invalid auth
- 403: authenticated but unauthorized
- 404: not found or hidden
- 405: method not allowed
- 406: unacceptable response format
- 408: client-side request timeout
- 409: state conflict
- 410: permanently deleted resource
- 412: failed conditional request or optimistic locking check
- 413: payload too large
- 415: unsupported media type
- 422: semantic validation
- 423: locked resource
- 429: rate limit exceeded
- 431: request headers too large
- 502: invalid upstream response
- 503: dependency unavailable
- 504: upstream timeout

**Business rules**

- Rule 1
- Rule 2

**Idempotency:** Required/not required, and why.
```

Do not include every possible status if it cannot happen for that endpoint. Include the statuses clients must handle.

## OpenAPI 3.1 requirements

Include an OpenAPI 3.1 snippet for the main endpoints and shared components. Keep it concise but valid enough to implement from.

Always define reusable components for:

- Success envelope.
- Paginated success envelope when list endpoints exist.
- ProblemDetail.
- FieldError.
- Request DTOs.
- Response DTOs.
- Common parameters such as `X-Request-ID`, pagination, and IDs.

Minimum ProblemDetail schema:

```yaml
ProblemDetail:
  type: object
  required: [type, title, status]
  properties:
    type:
      type: string
      format: uri
    title:
      type: string
    status:
      type: integer
    detail:
      type: string
    instance:
      type: string
    request_id:
      type: string
    timestamp:
      type: string
      format: date-time
    errors:
      type: array
      items:
        $ref: "#/components/schemas/FieldError"
```

Use `application/json` for success responses and `application/problem+json` for errors.

## Documentation quality bar

A good API spec should be:

- Stable: clients can rely on field names, statuses, and error codes.
- Explicit: auth, validation, pagination, and idempotency are visible.
- Safe: no secrets, internal IDs, stack traces, or sensitive fields leak.
- Testable: QA can derive test cases from each endpoint and status.
- OpenAPI-aligned: schemas and examples match the prose contract.
- Business-grounded: endpoints map back to acceptance criteria or business rules.

## Final checklist

Before finishing, verify the generated spec includes:

- Consistent success envelope with `status`, `data`, and `meta`.
- List envelope with pagination `meta` and `links` when applicable.
- RFC 7807-style `application/problem+json` errors.
- No HTTP 200 for errors.
- Endpoint-specific status code map.
- Rate-limit headers and 429 body for limited endpoints.
- `/api/v1/` path versioning unless told otherwise.
- `X-Request-ID` and `traceparent` tracing guidance.
- OpenAPI 3.1 snippet with shared schemas.
- Acceptance criteria or business-rule mapping.
