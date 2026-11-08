# MewsOps

MewsOps gives Mangrove Mews volunteers a phone form for reporting a sighting, photo and location. Rescue staff see feeding visits and urgent care needs on the colony map and can link two sightings to one cat. All demo accounts, locations, messages and photos are fictional.

## Run the connected demo

Use Node.js 24 or 26 on the laptop. In a checkout containing the connected tracker, install the two locked dependency sets once:

```sh
npm ci
npm ci --prefix src/api
```

Start a fresh recording session on your team's private Wi-Fi or hotspot:

```sh
npm run tracker -- --lan --fresh
```

Keep this terminal running. Open its **Laptop** URL on the computer and its **Phone** URL in Chrome or Samsung Internet on the Samsung. Both devices must be on the same network. The app runs in the browser; it requires no phone installation. The terminal prints a different access code for each of the three fictional team members. Complete sign-in before recording.

Port **4174** serves the connected interface, API and private photos. A separate backend on **3001** can keep running for its own tests. If venue Wi-Fi blocks device-to-device traffic, connect both devices through a private hotspot, restart the tracker and use the new phone URL. Omit `--fresh` to use the persistent default demo database. Each use of `--fresh` creates a separate database and preserves previous takes.

## Run with live OpenAI analysis

The tracker reads `OPENAI_API_KEY` from the laptop environment or a local `.env.local` or `.env` file. If the key is already in another checkout, point the launcher at that file. For Atticus's existing setup:

```sh
DOTENV_CONFIG_PATH="/Users/atticuscoffey/Documents/Codex/2026-11-07/request-to-connect/work/mewsops/.env.local" MEWSOPS_AGENT_MODE=live npm run tracker -- --lan --fresh
```

Only the laptop needs the key. A submitted fictional report is saved immediately. Its photo and note are analyzed in the background using the OpenAI Agents SDK. Open the saved report to see its actual analysis outcome. **Live OpenAI analysis** indicates a completed live call; **Analysis failed** offers staff a retry. With no key, the tracker defaults to manual review. The explicit `MEWSOPS_AGENT_MODE=fixture` option runs deterministic test analysis.

Follow the [four-shot recording guide](mobile/README.md#record-the-demo). To check the code, run `npm run typecheck`, `npm test` and `npm --prefix mobile run check`. The [API contract](docs/api-contract.md) and [agent handoff](docs/agent-intelligence.md) describe the underlying report and review services.
