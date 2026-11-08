import { randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

const people = [
  { userId: "luz", display: "Luz", role: "volunteer" },
  { userId: "nico", display: "Nico", role: "volunteer" },
  { userId: "beatriz", display: "Beatriz", role: "founder" },
] as const;
type Person = (typeof people)[number];
const cookieName = "mews_tracker";
const lifetime = 4 * 60 * 60;

export function createTrackerSessions() {
  const accounts = people.map(person => ({
    person, code: randomBytes(6).toString("hex").toUpperCase(),
  }));
  const sessions = new Map<string, { person: Person; until: number }>();
  function token(req: IncomingMessage) {
    return req.headers.cookie?.match(/(?:^|;\s*)mews_tracker=([0-9a-f]{64})(?:;|$)/)?.[1];
  }
  function forget(req: IncomingMessage) {
    const previous = token(req);
    if (previous) sessions.delete(previous);
  }
  return {
    accounts,
    get(req: IncomingMessage) {
      const key = token(req);
      const entry = key && sessions.get(key);
      if (entry && entry.until > Date.now()) return entry.person;
      if (key) sessions.delete(key);
    },
    login(req: IncomingMessage, user: string, submitted: string) {
      const account = accounts.find(({ person }) => person.userId === user);
      const code = submitted.trim().toUpperCase();
      if (!account || !/^[A-F0-9]{12}$/.test(code) ||
          !timingSafeEqual(Buffer.from(code), Buffer.from(account.code))) return;
      forget(req);
      for (const [key, entry] of sessions) if (entry.until <= Date.now()) sessions.delete(key);
      const key = randomBytes(32).toString("hex");
      sessions.set(key, { person: account.person, until: Date.now() + lifetime * 1000 });
      return `${cookieName}=${key}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${lifetime}`;
    },
    logout(req: IncomingMessage) {
      forget(req);
      return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
    },
  };
}
