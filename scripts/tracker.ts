import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { basename, join, resolve } from "node:path";
import { createDatabase } from "../src/db/index.js";
import { createConnectedTracker, type AnalysisMode } from "../src/tracker/server.js";

config({ path: process.env.DOTENV_CONFIG_PATH || [".env.local", ".env"], quiet: true });
const requested = process.env.MEWSOPS_AGENT_MODE || (process.env.OPENAI_API_KEY?.trim() ? "live" : "manual");
if (!["manual", "fixture", "live"].includes(requested)) throw new Error("Use live, fixture or manual for MEWSOPS_AGENT_MODE");
const mode = requested as AnalysisMode;
if (mode === "live" && !process.env.OPENAI_API_KEY?.trim()) throw new Error("Set OPENAI_API_KEY on the laptop for live analysis.");
const analyze = mode === "manual" ? undefined : (await import("../src/agent/index.js")).analyzeReport;
const lan = process.argv.includes("--lan");
const port = Number(process.env.TRACKER_PORT || 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid TRACKER_PORT");
const session = process.argv.includes("--fresh") ? "tracker-" + randomBytes(4).toString("hex") : "tracker";
const dataDir = resolve("storage", session);
await mkdir(dataDir, { recursive: true, mode: 0o700 });
const db = createDatabase(join(dataDir, "tracker.db"));
const { server, accounts } = createConnectedTracker(db, join(dataDir, "uploads"), mode, analyze);
server.once("error", (err: NodeJS.ErrnoException) => {
  console.error(err.code === "EADDRINUSE" ? `Port ${port} is in use. Stop the previous tracker or choose another TRACKER_PORT.` : err.message);
  db.close();
  process.exitCode = 1;
});
server.listen(port, lan ? "0.0.0.0" : "127.0.0.1", () => {
  const addresses = Object.entries(networkInterfaces())
    .sort(([a], [b]) => Number(b === "en0") - Number(a === "en0"))
    .flatMap(([, interfaces]) => interfaces ?? [])
    .filter(info => !info.internal && info.family === "IPv4")
    .map(info => `http://${info.address}:${port}`);
  const lines = [
    "Mangrove Mews · connected fictional rescue demo",
    `Laptop: http://127.0.0.1:${port}`,
    ...(lan ? [...new Set(addresses)].map(url => "Phone (same private Wi-Fi): " + url) : []),
    `Analysis: ${mode}. Database: storage/${basename(dataDir)}/tracker.db`,
    "", "Use the access code for your name:",
    ...accounts.map(({person, code}) => `${person.display}: ${code}`),
    "", "Keep these codes off the recording. They expire when the server stops.",
  ];
  const details = lines.join("\n") + "\n";
  console.log(details);
  // Only access codes and local addresses. This private directory is ignored by Git.
  void writeFile(join(dataDir, "access.txt"), details, { mode: 0o600 }).catch(() => {
    console.warn("Use the sign-in codes printed above; the local access file could not be saved.");
  });
});
for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => {
  server.close(() => { db.close(); process.exit(0); });
  server.closeAllConnections();
});
