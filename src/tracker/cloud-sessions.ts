import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Db } from "../db/index.js";

const people = [
  { userId: "luz", display: "Luz", role: "volunteer" },
  { userId: "nico", display: "Nico", role: "volunteer" },
  { userId: "beatriz", display: "Beatriz", role: "founder" },
] as const;
const cookie = /(?:^|;\s*)mews_tracker=([0-9a-f]{64})(?:;|$)/;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const maxAge = 4 * 60 * 60;

/** Public, fictional demo accounts; sessions survive separate serverless instances. */
export function createCloudSessions(db: Db, codes: Record<string, string>) {
  db.exec("CREATE TABLE IF NOT EXISTS tracker_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL)");
  const accounts = people.map(person => {
    const code = codes[person.userId]?.trim().toUpperCase();
    if (!code || !/^[A-F0-9]{12}$/.test(code)) throw new Error("Missing valid fictional demo code");
    return { person, code };
  });
  const token = (req: IncomingMessage) => cookie.exec(req.headers.cookie ?? "")?.[1];
  const forget = (req: IncomingMessage) => {
    const value = token(req);
    if (value) db.prepare("DELETE FROM tracker_sessions WHERE token_hash=?").run(hash(value));
  };
  return {
    accounts,
    get(req: IncomingMessage) {
      const value = token(req);
      if (!value) return;
      const entry = db.prepare("SELECT user_id FROM tracker_sessions WHERE token_hash=? AND expires>?").get(hash(value), Date.now()) as {user_id: string} | undefined;
      return people.find(person => person.userId === entry?.user_id);
    },
    login(req: IncomingMessage, user: string, submitted: string) {
      const account = accounts.find(item => item.person.userId === user);
      const code = submitted.trim().toUpperCase();
      if (!account || !/^[A-F0-9]{12}$/.test(code) || !timingSafeEqual(Buffer.from(code), Buffer.from(account.code))) return;
      forget(req);
      db.prepare("DELETE FROM tracker_sessions WHERE expires<=?").run(Date.now());
      const value = randomBytes(32).toString("hex");
      db.prepare("INSERT INTO tracker_sessions (token_hash,user_id,expires) VALUES (?,?,?)").run(hash(value), account.person.userId, Date.now() + maxAge * 1000);
      return `mews_tracker=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
    },
    logout(req: IncomingMessage) {
      forget(req);
      return "mews_tracker=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
    },
  };
}
