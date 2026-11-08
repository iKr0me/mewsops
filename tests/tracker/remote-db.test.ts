import { describe, expect, it } from "vitest";
import { createRemoteDatabase } from "../../src/db/remote.js";
import { createTrackerStore } from "../../src/tracker/store.js";
import { trackerDescriptions } from "../../src/tracker/store.js";
import { createServices } from "../../src/domain/index.js";
import { actorFromVerifiedSession } from "../../src/api/session.js";
import { prepareAnalysis } from "../../src/api/agent-context.js";
import { analyzeReport } from "../../src/agent/index.js";

describe("libSQL adapter", () => {
  it("enables integrity checks and seeds the shared tracker", () => {
    const db = createRemoteDatabase(":memory:", "test");
    try {
      createTrackerStore(db);
      expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
      expect((db.prepare("SELECT COUNT(*) AS count FROM cats").get() as {count: number}).count).toBe(51);
      expect(() => db.prepare("INSERT INTO colony_assignments (user_id, colony_id) VALUES ('missing', 'missing')").run()).toThrow();
      db.prepare("INSERT INTO audit_events (id,actor_id,action,entity_type,entity_id,reason,created_at) VALUES ('guard-test','luz','original','cat','marigold','test','2026-01-01')").run();
      expect(() => db.prepare("INSERT OR REPLACE INTO audit_events (id,actor_id,action,entity_type,entity_id,reason,created_at) VALUES ('guard-test','luz','changed','cat','marigold','test','2026-01-01')").run()).toThrow();
      expect((db.prepare("SELECT action FROM audit_events WHERE id='guard-test'").get() as {action:string}).action).toBe("original");
    } finally {
      db.close();
    }
  });
  it("passes only supported fields from libSQL into the agent", async () => {
    const db = createRemoteDatabase(":memory:", "test");
    try {
      createTrackerStore(db);
      const actor = actorFromVerifiedSession(db, {userId: "beatriz"});
      const id = (db.prepare("SELECT id FROM reports LIMIT 1").get() as {id: string}).id;
      const report = createServices(db).getReport(actor, id);
      const input = await prepareAnalysis(db, "unused", actor, report, trackerDescriptions);
      expect((await analyzeReport(input, {mode:"fixture"})).reportId).toBe(id);
    } finally { db.close(); }
  });
});
