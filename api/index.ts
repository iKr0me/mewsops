import type { IncomingMessage, ServerResponse } from "node:http";
import { createRemoteDatabase } from "../src/db/remote.js";
import { createCloudSessions } from "../src/tracker/cloud-sessions.js";
import { createConnectedTracker } from "../src/tracker/server.js";
import { analyzeReport } from "../src/agent/index.js";

// The tracker consumes the request stream itself for private photo uploads.
export const config = { api: { bodyParser: false } };

let tracker: ReturnType<typeof createConnectedTracker> | undefined;
function getTracker() {
  if (tracker) return tracker;
  const db = createRemoteDatabase(process.env.TURSO_DATABASE_URL ?? "", process.env.TURSO_AUTH_TOKEN ?? "");
  const sessions = createCloudSessions(db, {
    luz: process.env.DEMO_LUZ_CODE ?? "",
    nico: process.env.DEMO_NICO_CODE ?? "",
    beatriz: process.env.DEMO_BEATRIZ_CODE ?? "",
  });
  const mode = process.env.OPENAI_API_KEY?.trim() ? "live" : "manual";
  tracker = createConnectedTracker(db, "__blob__", mode, mode === "live" ? analyzeReport : undefined, { sessions, awaitAnalysis: true });
  return tracker;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = getTracker();
    await new Promise<void>((resolve, reject) => {
      res.once("finish", resolve);
      res.once("error", reject);
      app.server.emit("request", req, res);
    });
  } catch {
    if (!res.headersSent) {
      res.statusCode = 503;
      res.end("Tracker is temporarily unavailable.");
    } else res.destroy();
  }
}
