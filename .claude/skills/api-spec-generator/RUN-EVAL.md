# API Spec Generator Eval Workflow

Use this after changing `SKILL.md` to compare outputs with and without the skill.

## 1. Test prompts

Test prompts live in:

```text
.claude/skills/api-spec-generator/evals/evals.json
```

## 2. Workspace convention

Save run outputs under a sibling workspace:

```text
.claude/skills/api-spec-generator-workspace/iteration-1/eval-<id>/with_skill/outputs/
.claude/skills/api-spec-generator-workspace/iteration-1/eval-<id>/without_skill/outputs/
```

For each eval directory, create `eval_metadata.json`:

```json
{
  "eval_id": 1,
  "eval_name": "orders-pagination-and-cancel",
  "prompt": "...",
  "assertions": []
}
```

## 3. Suggested assertions

Use these objective checks when grading outputs:

- Includes `/api/v1/` path versioning.
- Uses a success envelope with `status`, `data`, and `meta`.
- Includes `meta.request_id`, `meta.timestamp`, and `meta.version` for success examples.
- Includes paginated list metadata and `links` for list endpoints.
- Uses `application/problem+json` for errors.
- Defines an RFC 7807-style `ProblemDetail` schema with `type`, `title`, and `status`.
- Does not use HTTP 200 for error responses.
- Documents endpoint-specific status codes.
- Covers caching and conditional request statuses such as 304 and 412 when applicable.
- Distinguishes 404 from 410 when permanent deletion matters.
- Distinguishes gateway/upstream failures with 502, 503, and 504 when dependencies are involved.
- Includes `Retry-After` for retryable 429, 502, 503, or 504 responses when applicable.
- Includes rate-limit headers and a 429 response when rate limiting applies.
- Documents `X-Request-ID` and `traceparent` support.
- Includes an OpenAPI 3.1 snippet.
- Maps endpoints or responses back to business rules / acceptance criteria.

## 4. Generate review viewer

After runs are saved and graded, aggregate benchmark data from the skill-creator directory:

```bash
python -m scripts.aggregate_benchmark ../api-spec-generator-workspace/iteration-1 --skill-name api-spec-generator
```

Then generate the review UI:

```bash
python eval-viewer/generate_review.py ../api-spec-generator-workspace/iteration-1 --skill-name api-spec-generator --benchmark ../api-spec-generator-workspace/iteration-1/benchmark.json
```

In headless environments, add:

```bash
--static ../api-spec-generator-workspace/iteration-1/review.html
```
