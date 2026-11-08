import { readFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../src/db/index.js";
import { createTrackerStore } from "../../src/tracker/store.js";
import { createCloudSessions } from "../../src/tracker/cloud-sessions.js";
import { actorFromVerifiedSession } from "../../src/api/session.js";
import { saveMedia, loadMedia } from "../../src/api/media.js";

const req = (cookie = "") => ({ headers: { cookie } }) as IncomingMessage;
const codes = { luz: "AAAAAAAAAAAA", nico: "BBBBBBBBBBBB", beatriz: "CCCCCCCCCCCC" };

describe("shared demo storage", () => {
  it("shares and revokes authenticated sessions across server instances", () => {
    const db = createDatabase(":memory:");
    try {
      const first = createCloudSessions(db, codes);
      const second = createCloudSessions(db, codes);
      expect(first.login(req(), "luz", codes.nico)).toBeUndefined();
      const header = first.login(req(), "luz", codes.luz)!;
      const request = req(header.split(";")[0]);
      expect(second.get(request)?.userId).toBe("luz");
      second.logout(request);
      expect(first.get(request)).toBeUndefined();
      expect(header).toContain("Secure");
    } finally { db.close(); }
  });

  it("stores sanitized photos in the database and enforces uploader access", async () => {
    const db = createDatabase(":memory:");
    try {
      createTrackerStore(db);
      const luz = actorFromVerifiedSession(db, { userId: "luz" });
      const nico = actorFromVerifiedSession(db, { userId: "nico" });
      const beatriz = actorFromVerifiedSession(db, { userId: "beatriz" });
      const image = await readFile(new URL("../../mobile/web/calico1.jpg", import.meta.url));
      const saved = await saveMedia(db, "__database__", luz, image, "image/jpeg");
      expect((await loadMedia(db, "__database__", beatriz, saved.id)).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      await expect(loadMedia(db, "__database__", nico, saved.id)).rejects.toMatchObject({ status: 403 });
    } finally { db.close(); }
  });
});
