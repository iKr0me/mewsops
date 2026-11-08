# Mangrove Mews mobile tracker

From the repository root, run `npm --prefix mobile start` and open the printed URL. The frontend requires Node.js 20+ and no package installation. For a portable offline copy, run `npm --prefix mobile run build` and open `mobile/dist/login.html`.

Choose Luz or Nico to report a fictional sighting, or Beatriz to review it. Use demo passcode **MEWS7**. The demo stores fictional reports in this browser. Change roles under **Account → Sign out**. The map supports touch panning, zoom controls and keyboard arrows. Select a pin and open **Colony details** for care needs, last feeding and reports.

The runner serves the self-contained rehearsal. Its demo accounts and local storage are independent of the repository's server-managed sessions. The repository backend and API contracts remain under `src/` and `docs/api-contract.md`. The replacement frontend does not currently translate the hosted tracker's state API to those contracts.

The original fictional vector map is included with its optimized WebP. The two JPEGs are synthetic images of the same fictional calico. All three demo accounts and all colony locations are fictional.
