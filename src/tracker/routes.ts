import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { actorFromVerifiedSession } from "../api/session.js";
import type { processor } from "../api/processing.js";
import type { Db } from "../db/index.js";
import { createServices, fail, staff, type Actor } from "../domain/index.js";
import { createTrackerStore } from "./store.js";

export type TrackerOptions = {
  analysisMode: "manual" | "fixture" | "live";
  /** A server-provisioned identity permitted to process reports for this rescue. */
  processorUserId: string;
};

const id = z.string().trim().min(1).max(200);
const submission = z.object({
  clientRequestId: id,
  c: z.number().int().nonnegative(),
  text: z.string().trim().min(1).max(20_000),
  time: z.string().max(30),
  mediaIds: z.array(id).max(10),
  demoLocationId: id.optional(),
}).strict();
const matchRequest = z.object({ reportIds: z.array(id).min(1).max(2) }).strict();
const empty = z.object({}).strict();

export function createTrackerRoutes(
  db: Db,
  config: TrackerOptions,
  processReport: ReturnType<typeof processor>,
  readJson: (req: IncomingMessage) => Promise<unknown>,
) {
  const store = createTrackerStore(db);
  const services = createServices(db);
  const running = new Map<string, Promise<void>>();
  async function emptyAction(req: IncomingMessage) {
    if (req.headers["transfer-encoding"] || Number(req.headers["content-length"]) > 0)
      empty.parse(await readJson(req));
  }

  function schedule(reportId: string, status: string) {
    if (status !== "received" && status !== "failed") return;
    if (running.has(reportId)) return;
    const mode = config.analysisMode;
    if (mode === "manual") {
      store.setAnalysis(reportId, "unavailable");
      return;
    }
    // Re-check this server-owned identity on every attempt. No caller supplies
    // a role, candidate list, model output, or the identity used for processing.
    const task = (async () => {
      try {
        const worker = actorFromVerifiedSession(db, { userId: config.processorUserId });
        await processReport(worker, reportId);
        store.setAnalysis(reportId, mode);
      } catch {
        store.setAnalysis(reportId, "failed");
      }
    })();
    running.set(reportId, task);
    void task.finally(() => running.delete(reportId)).catch(() => {
      // The original report is already durable. A later retry can recover an
      // interrupted attempt, including after storage is temporarily unavailable.
    });
  }

  return async function trackerRoute(
    req: IncomingMessage,
    res: ServerResponse,
    path: string,
    actor: Actor,
  ) {
    function reply(data: unknown, status = 200) {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    }
    if (req.method === "GET" && path === "/api/tracker/state")
      return reply({ state: store.state(actor) });
    if (req.method !== "POST") return fail("NOT_FOUND", "Unknown tracker endpoint", 404);
    if (path === "/api/tracker/reports") {
      const report = store.submit(actor, submission.parse(await readJson(req)));
      schedule(report.id, report.status);
      return reply({ reportId: report.id, state: store.state(actor) }, 201);
    }
    staff(actor);
    if (path === "/api/tracker/match") {
      const { reportIds } = matchRequest.parse(await readJson(req));
      // Wait only for in-flight work on the evidence the staff member chose.
      // This keeps a late model proposal from racing a confirmed manual link.
      await Promise.allSettled(reportIds.map((reportId) => running.get(reportId)));
      const currentActor = actorFromVerifiedSession(db, { userId: actor.id });
      store.review(currentActor, reportIds);
      return reply({ state: store.state(currentActor) });
    }
    const retry = /^\/api\/tracker\/reports\/([^/]+)\/retry$/.exec(path);
    if (retry) {
      await emptyAction(req);
      const report = services.getReport(actor, retry[1]);
      schedule(report.id, report.status);
      return reply({ reportId: report.id, state: store.state(actor) }, 202);
    }
    const issue = /^\/api\/tracker\/issues\/([^/]+)\/(claim|resolve)$/.exec(path);
    if (issue) {
      await emptyAction(req);
      if (issue[2] === "resolve") {
        // Apply any pending triage of this report before clearing its alert.
        const alert = db.prepare("SELECT report_id FROM alerts WHERE id=?").get(issue[1]) as
          { report_id: string } | undefined;
        if (alert) await running.get(alert.report_id);
      }
      const currentActor = actorFromVerifiedSession(db, { userId: actor.id });
      store.issue(currentActor, issue[1], issue[2] === "claim" ? "claim" : "resolve");
      return reply({ state: store.state(currentActor) });
    }
    return fail("NOT_FOUND", "Unknown tracker endpoint", 404);
  };
}
