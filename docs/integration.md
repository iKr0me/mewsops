# Running the HTTP demo

From the repository root, with a supported Node runtime (verified on Node 24):

```sh
npm ci
npm ci --prefix src/api
MEWSOPS_DEMO=1 npx tsx src/app.ts
```

In PowerShell set `$env:MEWSOPS_DEMO='1'` before `npx tsx src/app.ts`. The server binds 127.0.0.1:3000, migrates and seeds the local demo database, and uses the synthetic fixture. Open /api/health first. See [the HTTP contract](api-contract.md) for the phone-to-staff walkthrough. The root dev script still runs the backend CLI.

### Running teammate 3's adapter

The local command uses `MEWSOPS_ANALYSIS=fixture` by default. To exercise teammate 3's implementation, use a checkout containing [agent PR #2](https://github.com/svertexy/mewsops/pull/2) and set `MEWSOPS_DEMO=1 MEWSOPS_ANALYSIS=agent MEWSOPS_AGENT_MODE=fixture` for a keyless integration run. For live inference, set `MEWSOPS_AGENT_MODE=live` and configure `OPENAI_API_KEY` in the server environment. The entry point loads the named `analyzeReport` export from `src/agent/index.ts`. Startup fails if the module or export is missing. Health reports `adapter` when the module loads. A successful real inference requires a separate processing run with the agent configured for live use.

For the same-cat demo, the server optionally reads `fixtures/agent/demo-cat-descriptions.json` at startup. Supply a JSON object mapping existing fixture cat IDs to short vetted synthetic descriptions (1–400 characters). Document the synthetic source for each entry in the agent handoff. Missing files or entries produce no description. The server ignores descriptions outside the report's scoped candidate set. The seed's two Pebble photo references are unavailable. Upload actual synthetic image bytes before testing two-angle matching.

## Integration interfaces

- `src/contracts/index.ts` exports ReportInputSchema, AgentProposalSchema, DecisionInputSchema, ReportStatusSchema, ReviewSchema, Envelope and shared domain input types. Report and proposal validation delegates to the backend's strict parsers. Coordinate changes to those parsers with the services owner.
- `createApiServer({db,uploadDir,analyzeReport,verifiedSubject,timeoutMs,demo})` returns a Node HTTP server. Supply a migrated database and private storage directory. The optional verifiedSubject adapter must verify the session and return only the authenticated userId. The server reloads roles and assignments per request. Demo sessions are in memory, expire in one hour and reset on restart. Enable persona switching only in an isolated local synthetic demo.
- `AnalyzeReport` in src/api/processing.ts accepts AnalyzeReportInput and { signal }. The API supplies sanitized PNG bytes as raw base64, the report ID as text evidence, optional observedAt, the selected colony and up to 20 active confirmed canonical cats. In synthetic demo mode, pass vettedDemoDescriptions as a server-owned Map keyed by cat ID. Only scoped candidates receive matching descriptions. The seed includes no vetted appearance descriptions or reference images, so the default fixture leaves identity unresolved. Return unknown for strict schema and evidence validation. The demo startup connects the agent export through this function. The API checks every returned candidate and evidence ID against this call. Every cat suggestion must cite a submitted image and have a vetted candidate description. The only public process command takes an empty body. Staff decisions remain separate. Inject API keys server-side; request bodies, cookies, filenames and agent exceptions are not logged.
- The backend creates an immediate unverified alert and uses transaction receipts to deduplicate proposals and approvals. One process coalesces competing work by rejecting concurrent attempts. A crash before applying a proposal leaves the saved report retryable. An analyzer that misses the deadline cannot apply a late result. Backends handling multiple instances should coordinate processing leases and budgets.
- Exact input bytes determine the private storage key. Sharp decodes, auto-orients and re-encodes sanitized PNGs; filenames, original metadata and raw uploads are discarded. PR #2 accepts up to 8,000,000 base64 characters per image. If the private PNG exceeds 6,000,000 bytes, the API passes an sRGB PNG fitted inside 1024 × 1024 to the agent and retains the full sanitized image under the same evidence ID for staff. Each upload has a separate ownership record. A shared file hash does not link a cat. Seed-only media references return 503 until a real synthetic upload is supplied.
- The API-local npm manifest pins Sharp to keep dependency changes inside this lane. The coordinator may consolidate the manifest/lockfile into the root install. Git ignores `.env` and `.env.*` at any depth and permits `.env.example` templates. The local request log contains only a generated request ID and HTTP status.

## Verification and deployment

Run `npm run typecheck`, `npx vitest run tests/api` and `npm test`. The HTTP suite uses temporary real SQLite databases, synthetic JPEG/PNG handling and loopback cookies. Live inference requires a separate agent integration check. The current deployment target is local only. Before hosting on Vercel, replace filesystem SQLite and uploads with durable external transactional storage and private object storage, provide verified production sessions, disable demo switching, and test persistence and private access across redeploys. No provider is provisioned by this lane.

On Node 24.22.1, `npm ci --prefix src/api` installed Sharp 0.35.5 from the lockfile. The production API dependency audit reported zero known vulnerabilities. Typecheck passed for the API branch and for a local checkout combined with agent PR #2 at `8290642`. All 19 focused API and agent tests passed together. On the API branch, 49 of 50 full-suite tests passed. The Windows account lacks permission to create the symlink in the existing database reset test.

A local HTTP smoke test loaded PR #2's exported adapter, uploaded a synthetic 2,061,104-byte JPEG and retrieved a full 9,473,852-byte sanitized PNG with EXIF removed. Live mode with no key produced a saved failed report and preserved the same-day alert. A staff retry using the agent's explicit fixture mode accepted the reduced PNG, recorded one reporter observation and left identity unresolved. Repeating processing returned the same record. The agent owner's [verification notes](https://github.com/svertexy/mewsops/pull/2) report a separate live text run. Live visual matching still requires grounded synthetic references and an evaluation with those assets.

Reusable frontend inputs are exported as `demoReport` and `demoDecision` from `src/contracts/fixtures.ts`.
