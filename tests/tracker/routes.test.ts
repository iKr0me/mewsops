import { mkdtemp, readFile, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { createApiServer } from "../../src/app.js";
import { syntheticFixture, type AnalyzeReport } from "../../src/api/processing.js";
import { createDatabase } from "../../src/db/index.js";
import { trackerDescriptions } from "../../src/tracker/fixtures.js";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const clean of cleanups.splice(0)) await clean();
});

async function tracker(analyzeReport?: AnalyzeReport) {
  const dir = await mkdtemp(join(tmpdir(), "mews-tracker-http-"));
  const db = createDatabase(join(dir, "tracker.db"));
  const server = createApiServer({
    db, uploadDir: dir, analyzeReport, vettedDemoDescriptions: trackerDescriptions,
    tracker: { analysisMode: analyzeReport ? "fixture" : "manual", processorUserId: "beatriz" },
    verifiedSubject: async req => req.headers.cookie
      ? { userId: req.headers.cookie.replace("verified-test=", "") } : undefined,
  });
  cleanups.push(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
    db.close();
    await rm(dir, { recursive: true, force: true });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  const req = (path: string, user?: string, body?: unknown) => fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { ...(user && { cookie: "verified-test=" + user }), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  async function upload(user: string, file: string) {
    const photo = await readFile(new URL(`../../mobile/web/${file}`, import.meta.url));
    const response = await fetch(base + "/media", {
      method: "POST", headers: { cookie: "verified-test=" + user, "content-type": "image/jpeg" },
      body: new Uint8Array(photo),
    });
    expect(response.status).toBe(201);
    return (await response.json()).data.id as string;
  }
  return { db, req, upload };
}

const report = {
  clientRequestId: "first-photo", c: 0, time: "2026-11-08T12:10:00Z",
  text: "Fed the colony. The calico is limping.", mediaIds: [], demoLocationId: "demo-location-1",
};

it("routes a shared fictional pin to the assigned colony and rejects conflicting or unauthorized pins", async () => {
  const { db, req } = await tracker();
  const pinReport = { ...report, c: undefined, demoLocationId: "demo-location-2" };
  const response = await req("/tracker/reports", "luz", pinReport);
  expect(response.status).toBe(201);
  const { reportId } = await response.json();
  expect(db.prepare("SELECT selected_colony_id FROM reports WHERE id=?").get(reportId))
    .toEqual({ selected_colony_id: "colony-2" });
  expect((await req("/tracker/reports", "luz", { ...pinReport, c: 0 })).status).toBe(400);
  expect((await req("/tracker/reports", "luz", { ...pinReport, demoLocationId: "unknown" })).status).toBe(400);
  db.prepare("DELETE FROM colony_assignments WHERE user_id='nico' AND colony_id='colony-2'").run();
  expect((await req("/tracker/reports", "nico", pinReport)).status).toBe(403);
});

it("persists a scoped report even when analysis fails, allowing staff retry without duplicate runs", async () => {
  let attempts = 0;
  const { db, req } = await tracker(async (input, dependencies) => {
    attempts++;
    if (attempts === 1) throw Error("provider unavailable");
    expect(input.context.catCandidates.find(c => c.catId === "marigold")?.knownDescription).toBeTruthy();
    return syntheticFixture(input, dependencies);
  });
  expect((await req("/tracker/state")).status).toBe(401);
  const response = await req("/tracker/reports", "luz", report);
  expect(response.status).toBe(201);
  const { reportId, state } = await response.json();
  expect(state.reports.some((row: { id: string }) => row.id === reportId)).toBe(true);
  const status = () => db.prepare("SELECT status FROM reports WHERE id=?").get(reportId);
  await expect.poll(status).toEqual({ status: "failed" });
  const retryUrl = "/tracker/reports/" + reportId + "/retry";
  expect((await req(retryUrl, "luz", {})).status).toBe(403);
  expect((await req(retryUrl, "beatriz", {})).status).toBe(202);
  await expect.poll(status).toEqual({ status: "needs_review" });
  expect((await (await req("/tracker/reports", "luz", report)).json()).reportId).toBe(reportId);
  expect((await req(retryUrl, "beatriz", {})).status).toBe(202);
  expect(attempts).toBe(2);
});

it("allows staff to confirm two actual photos when the agent is unavailable, preserving the census", async () => {
  const { db, req, upload } = await tracker();
  const before = db.prepare("SELECT COUNT(*) AS n FROM cats WHERE identity_confirmed=1").get();
  const ids = [];
  for (const [user, filename] of [["luz", "calico1.jpg"], ["nico", "calico2.jpg"]]) {
    const mediaId = await upload(user, filename);
    const response = await req("/tracker/reports", user, {
      ...report, clientRequestId: user + "-sighting", mediaIds: [mediaId],
    });
    expect(response.status).toBe(201);
    ids.push((await response.json()).reportId);
  }
  expect((await req("/tracker/match", "luz", { reportIds: ids })).status).toBe(403);
  const confirmed = await req("/tracker/match", "beatriz", { reportIds: ids });
  expect(confirmed.status).toBe(200);
  expect(db.prepare("SELECT COUNT(*) AS n FROM cats WHERE identity_confirmed=1").get()).toEqual(before);
  const links = db.prepare("SELECT DISTINCT report_id FROM observations WHERE cat_id='marigold'").all();
  expect(links).toEqual(expect.arrayContaining(ids.map(report_id => ({ report_id }))));
  const alert = db.prepare("SELECT id FROM alerts WHERE report_id=? AND status='open'").get(ids[0]) as { id: string };
  const issue = "/tracker/issues/" + alert.id;
  expect((await req(issue + "/claim", "nico", {})).status).toBe(403);
  expect((await req(issue + "/claim", "beatriz", {})).status).toBe(200);
  expect((await req(issue + "/resolve", "beatriz", {})).status).toBe(200);
  expect(db.prepare("SELECT status FROM alerts WHERE id=?").get(alert.id)).toEqual({ status: "resolved" });
});
