import LibSql from "libsql";
import type { Db } from "./types.js";

const remoteDatabases = new WeakSet<object>();
export const isRemoteDatabase = (db: Db) => remoteDatabases.has(db);

/** Open a remote libSQL database; local development continues to use SQLite. */
export function createRemoteDatabase(url: string, authToken: string): Db {
  if (!url || !authToken) throw new Error("Remote database URL and token are required");
  // The upstream TypeScript definitions omit the documented remote option.
  const options = { authToken, readonly: false };
  const db = new LibSql(url, options);
  const transaction = db.transaction.bind(db);
  let depth = 0;
  let sequence = 0;
  db.transaction = ((work: (...args: any[]) => unknown) => {
    const outer = transaction(work);
    const invoke = (mode: "deferred" | "immediate" | "exclusive", args: any[]) => {
      if (depth > 0) {
        const name = `nested_${++sequence}`;
        db.exec(`SAVEPOINT ${name}`);
        depth++;
        try {
          const value = work(...args);
          db.exec(`RELEASE SAVEPOINT ${name}`);
          return value;
        } catch (error) {
          db.exec(`ROLLBACK TO SAVEPOINT ${name}`);
          db.exec(`RELEASE SAVEPOINT ${name}`);
          throw error;
        } finally { depth--; }
      }
      depth++;
      try { return outer[mode](...args); } finally { depth--; }
    };
    const wrapped = (...args: any[]) => invoke("deferred", args);
    wrapped.deferred = (...args: any[]) => invoke("deferred", args);
    wrapped.immediate = (...args: any[]) => invoke("immediate", args);
    wrapped.exclusive = (...args: any[]) => invoke("exclusive", args);
    return wrapped;
  }) as typeof db.transaction;
  const pragma = db.pragma.bind(db);
  db.pragma = ((source: string, options?: {simple?: boolean}) => {
    const value = pragma(source, options);
    if (options?.simple && value && typeof value === "object" && !Array.isArray(value)) {
      const entry = Object.entries(value).find(([key]) => key !== "_metadata");
      return entry?.[1];
    }
    return value;
  }) as typeof db.pragma;
  db.pragma("foreign_keys = ON");
  // Hosted libSQL does not allow enabling recursive triggers. The migration
  // installs and verifies an explicit audit REPLACE guard instead.
  remoteDatabases.add(db);
  return db as unknown as Db;
}
