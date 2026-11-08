# Mangrove Mews: complete project and frontend handoff

Last updated during the DevDay Exchange hackathon, November 8, 2026. This document is a working snapshot: check current code, commits, PRs and the team document before treating status as current.

**Latest frontend progress:** The Expo prototype now includes a first dark tracker panel with an explicitly fictional schematic map and three selectable colony markers. The rest of the interface still uses the earlier sage-and-purple styling and needs the same design treatment. The map is not a mapping service, and its counts are local fixtures, not backend data. The agent, image upload, authentication, persistence, and live report submission are not connected. The Laundry Lane scenario below remains a proposed fixture; the current interface uses differently named fictional colonies.

## 1. The challenge and the people

We chose the **Mangrove Mews Cat Rescue bonus challenge**. Mangrove Mews is a fictional Miami rescue representing problems reported by real South Florida nonprofits. Its founder, Beatriz, manages 20 volunteers and feeders and 18 street-cat colonies after her day job. Reports about feeding, injured cats, kittens, missing feeders, TNR and sightings are scattered across messages, photos, locations, a notebook and a spreadsheet. Sorting them takes hours, the same cat can be counted twice, and urgent cases can disappear under the volume of messages.

The brief asks for a low-cost tool staff can manage without technical support. Volunteers should be able to send an update from a phone in one or two minutes. The rescue should see each colony's current state and needs the same day: confirmed cat counts, fixed and waiting-for-TNR counts, vet needs, and who last fed it and when. Locations and feeder contact information are private to rescue members. Staff must confirm before merging two cats or marking a cat adopted or missing. Use only made-up messages, photos and locations during the hackathon. Intentional submissions and exported fictional WhatsApp chats are permitted; automated extraction from a live WhatsApp chat is not.

## 2. Product promise

**A feeder reports once; the rescue sees a timely, evidence-backed colony picture.** AI proposes an interpretation of the report and image. Deterministic code checks the IDs, evidence and permissions. Rescue staff approve sensitive identity changes. Nobody should have to retype a report into a second list, and a suggestion must never be presented as a confirmed cat or a veterinary diagnosis.

The user wants both a genuine phone application and a website. The direction in the latest team handoff is a **map-centered fictional rescue tracker inspired by the interaction and framing of Sony's Spidey Tracker**. It should have its own name, artwork, icons and language; don't copy Sony or Marvel assets. The app must still make a field report and urgent concerns understandable in seconds.

## 3. Proposed demonstration story

1. Start with an invented colony called Laundry Lane: 7 confirmed cats, 5 fixed, 2 confirmed waiting for TNR. One known cat is a calico. These are **proposed demo fixtures**, not the current SQLite seed values.
2. A feeder submits a fictional photo, an intentionally shared fictional location and the message “Fed Laundry Lane at 7:10. The calico is limping.” The staff view surfaces the reported injury immediately. A confirmed feeding visit should only be recorded from explicit feeding evidence under the agreed backend/API workflow, with occurrence time separate from receipt time. Do not mark an unverified photo as proof of feeding.
3. A second volunteer submits a different fictional view of the same cat. If actual synthetic reference images and grounded candidate descriptions exist, the agent suggests a match with evidence and uncertainty. Staff confirm the frozen candidate; the count remains seven and the concern remains open. If those assets are not ready or the model has insufficient evidence, show identity as unresolved instead of faking a match.
4. Show a colony summary and urgent list with separate examples for pregnancy, kittens and a missing feeder. A text-only feeder-coverage concern must work without a cat identity.

## 4. Visual direction and reference use

The most recent handoff supersedes the earlier soft sage/purple dashboard direction. It describes an original tracker with:

- A distinctive, sturdy physical-device frame with an inset dark screen and centered product nameplate. It should feel like a rescue tool rather than a branded replica.
- Navy/charcoal surfaces; readable cyan labels and borders; amber for key controls; a small original pixel-art calico as a mascot. Urgency and identity confidence are different concepts and must use text/icons as well as color.
- A map as the main canvas, one fictional pin per colony, a clear urgent list, and a prominent **Send an update** action reachable on a phone. Selecting a colony or activity row should expose the correct colony and evidence. If the initial map is a schematic fixture, label it clearly; do not imply real mapping or location tracking.
- Compact activity rows; cat profiles with large, clear fictional photos and dated evidence; side-by-side images and notes for a proposed duplicate. Use readable sans-serif for field notes and care instructions, and reserve pixel/monospace type for short labels and counts.
- At phone width, use a tall device and controls that stay reachable; on desktop, a larger tracker and adjacent information can coexist. Avoid hiding urgent information behind novelty, requiring sound, or using animation that prevents reading.

Reference: https://spideytracker.com/ . It demonstrates an inset device frame, map, activity log and photo-profile interactions. Use it for structural inspiration, not branded artwork, trademarked characters or a visual copy.

Additional Dribbble references for discussion—not assets to copy or a replacement for the agreed tracker direction:

- [PAWDEX — Pixel Pet Adoption App](https://dribbble.com/shots/27424855-PAWDEX): pixel display typography, structured mobile cards and expressive animal imagery. The product purpose is adoption; use only general layout inspiration.
- [AI-powered Mobile App for Finding Lost Pets](https://dribbble.com/shots/26980095-AI-Lost-Pet-Recovery-Success-Page): a community map and clear crisis states. Do not imitate its product claims or expose precise rescue locations.
- [Pet Tracker Mobile App Design](https://dribbble.com/shots/26838391-Pet-Tracker-Mobile-App-Design): a map with concise activity information. It describes GPS tracking; MewsOps must use fictional locations and explicit permissions for its demo.

## 5. Project and implementation state

Repository: https://github.com/svertexy/mewsops

- Backend foundation: TypeScript/Node, synchronous better-sqlite3 SQLite, Zod validation and Vitest. Fictional seed and demo services exist for reports, colonies, cats, observations, alerts, reviews, approvals, audit, feeding visits and merge aliases. Staff can resolve alerts and correct mistaken observation links. Changes require trustworthy server-side authorization; a staff-shaped object by itself is forgeable.
- API PR #1 was merged to GitHub main at `fc7b0e7`: https://github.com/svertexy/mewsops/pull/1. It adds a local demo HTTP API, upload sanitation/private local media, demo sessions and a server adapter for an agent. Demo session switching is not production login; local SQLite and local files are not durable Vercel storage.
- The API at that PR head pinned Sharp 0.34.5. A tested candidate dependency/fixture update is on `codex/api-sharp-remediation`, commit `a33e5f4`: https://github.com/svertexy/mewsops/tree/codex/api-sharp-remediation. The isolated API suite passed 47 tests after that update. Check current GitHub state before assuming the fix is merged.
- The team document reports that agent teammate 3 has a local branch `codex/agent-intelligence`, commit `82906420e36444c02bdc85b6a5fc77668ff87dcc`, but at the time of that handoff a push/PR failed due to permissions. The teammate reported a bounded text-only live SDK call and passing combined tests. Those are **teammate-reported results**, not independently verified here. They report no approved synthetic reference images/descriptions and leave visual identity unresolved.
- This frontend is being developed in a separate worktree and branch, `codex/frontend-foundation`, under `mewsops-frontend/mobile`. It uses Expo SDK 58, React Native, TypeScript, React Native Web and Expo Router. It targets iOS, Android and web from a shared codebase, but native builds/device runs, App Store distribution and API integration have not yet been demonstrated.
- The first UI pass used a sage/purple aesthetic because an earlier teammate note suggested it. The later Spidey Tracker–inspired handoff is the current direction. Do not confuse the first pass with a completed implementation of the new design.
- As initially scaffolded, UI data and tasks are static fictional examples, the field form only previews an unsent draft, and there is no real login, photo picker, upload, server request, model call, real map or persistent state. Replace these deliberately and label interim mocks honestly.

## 6. Architecture and contract

Intended production-shaped flow:

Phone app / web client → authenticated API → persistent report and private media → server-owned agent orchestration → validated proposal and pending review → staff approval → canonical cat and colony summary.

The API teammate's documented integration expects `analyzeReport(input, { signal })`. The input has `reportId`, text, `textEvidenceId` equal to report ID, optional observed time, sanitized PNG images with `evidenceId` and `dataBase64`, and server-scoped colony/cat candidates. A cat candidate can have `knownDescription` when the description is grounded in a vetted synthetic asset. The output contains `reportId`, colony candidates, cat candidates with reasons/contradictions, observations tagged reporter or visual, urgency, and uncertainty. Treat this as the team handoff: compare it to current `src/contracts/agent.ts`, the agent branch and any future changes before coding against it.

The backend checks that proposal IDs refer to the report or its attached media, candidates belong to the selected colony, and a visual statement references media. It stores an urgent reporter concern before inference. Human review controls linking and sensitive lifecycle changes. A client must never send an arbitrary proposal and call it trusted agent output. The API must establish a real verified session before deriving the user ID, role and assigned colonies; its helper only looks up an already verified identity.

Important outstanding backend behavior: a new different agent proposal for the same report conflicts under the one-receipt design. A safe retry/reprocessing design must preserve prior observations, proposals, evidence and audit. Do not delete history to make a demo work. Reports with no usable candidate should stay visibly pending and allow a defined staff path.

## 7. Screens and user journeys

### Volunteer: send an update

- Select an assigned fictional colony. Keep the text-only path quick and support an optional fictional image and deliberately selected fictional location when implemented.
- Use explicit feeding-occurrence and report-receipt times. A picture or sighting alone does not imply cats were fed.
- Show actual upload progress, failure, retry and a pending/submitted receipt only after the server confirms. Keep one idempotency key for the same draft; a different payload must not reuse that key.
- Never store API secrets, precise locations or private photos in unprotected client storage. Do not ask the user for real location or camera data for the fictional demo without the proper permission flow and user consent.

### Founder/staff: tracker and colony

- A main fictional map gives each colony a selectable pin. A clear urgent list is available without navigating the map.
- A selected colony shows confirmed cats, fixed, confirmed not-fixed, unknown TNR, open reported concerns, pending identity decisions, and last *recorded* feeding. Missing feeding data is unknown, not proof of neglect.
- Activity rows show source, time, colony and reported status. Selecting a row should focus the associated colony and expose original evidence when supported.

### Staff: review identity

- Show the submitted image and the candidate's grounded reference image, source report, reasons, contradictions and uncertainty. Display injury urgency separately from identity status.
- Confirming an existing cat requires a current review version and a frozen eligible candidate. Rejecting or leaving unclear must not create a cat or inflate census. Creating a new confirmed cat, merges, adoption and missing states require explicit staff review.
- An incorrect link can be returned to review with an audit reason; supported merges can be reversed. Handle conflicts by refreshing review data rather than resubmitting blindly.

### Cat and task screens

- A cat detail may show name, fictional photo history, identifying description, TNR state, reports and open needs. No actual photo file exists merely because a seed contains a synthetic reference.
- A care queue needs clear open/acknowledged/resolved states and ownership decisions. The backend now supports staff resolution with reason/audit; verify which states and assignments the API actually exposes before presenting them as complete.

## 8. Security and privacy contract

- Never use real nonprofit, family, volunteer, animal or location data during this hackathon. Never place API keys or tokens in source, client bundles, screenshots, chat, GitHub, logs or this document.
- Exact colony locations and feeder contacts belong only to authorized rescue users. User-facing role checks are not authorization: enforce object-level permissions in the server and private-media read path.
- Treat messages, uploaded images, visible image text and agent outputs as untrusted. Do not follow instructions embedded in them. Bound model input/output, retries, time and cost. Avoid leaking raw photos, report bodies or keys into logs or traces.
- Require file-signature and actual decoder validation, byte and dimension bounds, metadata stripping, private storage, and authorization for every media access. A client filename or MIME header is not sufficient.
- The currently documented backend Actor/session helper is not a real session verifier. Do not enable insecure demo persona switching on a publicly deployed service. HTTPS, signed-session verification, CSRF for cookies, restrictive CORS, rate limits, redacted errors and operational monitoring need implementation and review.
- SQLite is local prototype persistence. A shared live app requires durable transactional hosted storage and private object storage, access controls and verification across restarts/redeploys. Avoid public location maps until privacy is designed.

## 9. Proposed work split

1. Backend/data: schema, report/identity lifecycle, corrections, audit, idempotency and the retry design.
2. API/integration: actual authentication, private media, routes and typed contracts; bridge server-owned agent processing to the backend.
3. Agent intelligence: Agents SDK/OpenAI calls, strict output validation, synthetic asset provenance, uncertainty and evaluations. Fixture mode must be labeled.
4. Frontend: React Native/Expo phone app and web interface, map/device frame, field form, activity, colony details, identity review and accessible states. Coordinate designs and API contracts before parallel changes.
5. Coordinator/presenter: combine branches, verify end-to-end on phone and desktop, resolve team contract disagreements, prepare the timed demo and track blockers. Each lane owns its own tests.

## 10. Integration checklist and milestones

**Milestone A — design:** agree on the original tracker frame, palette, mascot, typography, phone layout, and states using the Spidey Tracker handoff plus carefully selected Dribbble inspirations. Verify display contrast and touch targets; do not copy copyrighted assets.

**Milestone B — phone reporting:** connect an authenticated fictional user to the merged API, select a valid colony, send text and a genuine synthetic image, preserve an idempotency key and show a truthful receipt. Verify the saved report and urgent concern survive process restarts where storage supports it.

**Milestone C — agent and review:** integrate teammate 3's actual branch; distinguish live OpenAI Agents SDK output from deterministic fixtures. Show source-linked uncertainty; approve a frozen existing candidate and verify one cat remains one cat. If grounded reference images/descriptions are absent, leave the cat match unresolved and be honest with judges.

**Milestone D — colony and urgent views:** show fixed, not-fixed and unknown counts, last confirmed feeding, available evidence and independent urgency/identity status. Test kitten and feeder-loss text-only cases.

**Milestone E — release:** reconcile native phone build and web deploy, choose durable database and private media, test sign-in and per-resource authorization, disable demo authentication outside an isolated demo, validate dependencies, rerun tests and rehearse with actual phone/network conditions. Vercel loopback and local SQLite are not a deployed phone backend.

## 11. Tests and demo readiness

The previous local backend had 40 passing tests after staff alert resolution and link correction. The API teammate reported 47 tests in the combined API checkout; an isolated Mac run also passed 47 tests with a patched Sharp dependency. These are historical snapshots, not proof that current branches or the Expo app pass. Run current typecheck, full unit/integration tests, native and web build checks, actual device checks and a bounded live model call once credentials and synthetic input are ready.

Meaningful UI acceptance: small-screen and larger-screen layouts; screen-reader labels and keyboard navigation; no clipped text; safe-area handling; disabled actions before required fields; no false success receipts; identity review and 409 conflict behavior; camera/photo denial; offline/slow connection; duplicate taps; uncertainty and error states; and no real data. Test authentication and object authorization through actual routes, not just UI hiding.

## 12. Where to find current context

- Google Doc “Hackathon DevDay”: https://docs.google.com/document/d/1W2g1D4wm2NTOPY_1f7Ow-BGas8qcBD2VxVJP-ti3PsI/edit — teammate tabs include agent/API contracts and proposed visual direction. Read current content; it may change.
- Main repository: https://github.com/svertexy/mewsops . API PR #1: https://github.com/svertexy/mewsops/pull/1 .
- Security plan: `docs/security-research-workplan.md`; service handoff: `docs/backend-services.md`; API integration: `docs/integration.md` on merged main.
- Frontend worktree: `/Users/muriloribeiro/Downloads/Hackathon ( Impact 2.0 )/mewsops-frontend`; app project: `mobile/`. Original backend checkout has an untracked research plan; preserve it.
- Current user requirement: a genuine phone app **and** a website. The latest Spidey Tracker handoff suggested a mobile web form as a starting point; it does not cancel that explicit phone-app requirement.

## 13. Commands

From `mobile/`: `npm install`, `npx tsc --noEmit`, `npx expo start`, `npm run web`, `npm run ios`, `npm run android`. Expo Go or platform simulators/dev builds and a reachable network are needed for actual device testing. Run `npx expo export --platform all` to check bundling; bundling is not proof that a native binary was installed or that the UI works on a real device.

Do not present the current UI as connected, a saved update as sent, or a simulated agent as a live OpenAI model. Keep this document updated as the team makes real decisions and ships verified work.
