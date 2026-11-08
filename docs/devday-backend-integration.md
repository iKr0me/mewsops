# DevDay backend integration — 8 November 2026

The shared Hackathon DevDay handoff asked the coordinator to review and merge
agent PR #2 and API PR #3. Both branches are combined here without frontend changes.

- Agent: `82906420e36444c02bdc85b6a5fc77668ff87dcc`.
- API: `7bd11cee7620c57703d47524eeffb9bc10c9d3fd`.
- Shared baseline: `fc7b0e7`.

The agent validates scoped report/cat/colony/evidence IDs and returns proposals
for staff review. It has no record-writing tools. The API retains full sanitized
private PNG evidence while reducing large analysis copies to fit the agent's
base64 limit. Cat suggestions require image evidence and a vetted description.

Two independent read-only reviewers examined the combined changes: agent
validation/failure handling and API/media/identity safeguards. The HTTP smoke's
live-inference claim was removed: adapter health alone cannot distinguish a
fixture from a live call.

## Coordinator verification

Clean root and API lockfile installs; TypeScript passed; all 60 tests across 12
files passed on this Mac. The coordinator upgraded the oversized-JPEG test to
call the actual agent module in explicit fixture mode and added an HTTP test
covering volunteer processing denial, provider failure, retained urgent alert,
staff retry, and idempotent repeat processing. No credential or paid live call
was needed for these checks. This does not measure model visual accuracy.

## Running the combined backend

```sh
npm ci
npm ci --prefix src/api
MEWSOPS_DEMO=1 MEWSOPS_ANALYSIS=agent MEWSOPS_AGENT_MODE=fixture npx tsx src/app.ts
```

This starts the local-only synthetic backend on 127.0.0.1:3000. See
[integration.md](integration.md) and [api-contract.md](api-contract.md) for
routes, sessions, media upload and staff review contracts.

## Remaining integration boundaries

- Native phone / separate-origin web authentication is not provided by the
  loopback-only demo persona endpoint. Do not expose persona switching publicly.
- SQLite and private filesystem uploads are local; durable hosted storage and
  verified production sessions are still required before deployment.
- Visual identity evaluation still needs grounded synthetic images and vetted
  descriptions. The default safely leaves identity unresolved.
- The second reviewer flagged a follow-up for multi-photo evaluation: image IDs
  are supplied separately from image blocks in matching order. Before claiming
  verified per-photo citations, label each image explicitly and evaluate
  attribution; the current guard proves ID scope, not semantic attribution.
- The frontend is a separate branch; this backend merge does not wire its screens.
- Fixture tests and dependency audit results are not a guarantee of production
  security or live model behavior.

Shared handoff: https://docs.google.com/document/d/1W2g1D4wm2NTOPY_1f7Ow-BGas8qcBD2VxVJP-ti3PsI/edit
