import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve,dirname } from "node:path";
import { previewEnabled } from "./config";

const globals = globalThis as typeof globalThis & { flowelixDb?: DatabaseSync };
export function db() {
  if (!previewEnabled()) throw new Error("Local workspace unavailable.");
  if (globals.flowelixDb) return globals.flowelixDb;
  const file = resolve(process.env.FLOWELIX_DB || ".flowelix/demo.sqlite");
  mkdirSync(dirname(file),{recursive:true});
  const connection = new DatabaseSync(file,{timeout:5000});
  connection.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT, kind TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('admin','customer')));
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS workflows (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES accounts(id), graph TEXT NOT NULL, updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS workflows_owner ON workflows(owner);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES accounts(id), product TEXT NOT NULL, graph TEXT NOT NULL, currency TEXT NOT NULL CHECK(currency IN ('EUR','RON')), amount INTEGER NOT NULL CHECK(amount>0), mode TEXT NOT NULL CHECK(mode IN ('simulation','stripe-test')), status TEXT NOT NULL CHECK(status IN ('pending','paid','failed','cancelled','refunded')), provider_session TEXT UNIQUE, payment TEXT UNIQUE, artifact_version TEXT, invoice TEXT NOT NULL DEFAULT 'pending_configuration', created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS orders_owner ON orders(owner);
    CREATE TABLE IF NOT EXISTS payment_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), type TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS downloads (id INTEGER PRIMARY KEY, owner TEXT NOT NULL REFERENCES accounts(id), order_id TEXT NOT NULL REFERENCES orders(id), created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, owner TEXT REFERENCES accounts(id), source TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', payload TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS requests_owner ON requests(owner);
    CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id), revision INTEGER NOT NULL, scope TEXT NOT NULL, milestones TEXT NOT NULL, exclusions TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount>0), currency TEXT NOT NULL CHECK(currency IN ('EUR','RON')), state TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(request_id,revision));
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, subject TEXT NOT NULL, action TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS catalog_overrides (id TEXT PRIMARY KEY, product TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS advisory_projects (
      request_id TEXT PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
      assigned_service TEXT NOT NULL, notes TEXT NOT NULL, milestones TEXT NOT NULL,
      deliverable_title TEXT NOT NULL, deliverable_body TEXT NOT NULL,
      approved INTEGER NOT NULL CHECK(approved IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS advisory_quote_costs (
      quote_id INTEGER PRIMARY KEY REFERENCES quotes(id) ON DELETE CASCADE, costs TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS advisory_support (
      id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      message TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'open' CHECK(state IN ('open','reviewing','resolved')),
      created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS advisory_support_request ON advisory_support(request_id,created);
  `);
  globals.flowelixDb = connection;
  return connection;
}
export function transaction<T>(work: (connection:DatabaseSync)=>T):T {
  const connection = db();
  connection.exec("BEGIN IMMEDIATE");
  try {const result = work(connection); connection.exec("COMMIT"); return result;}
  catch (error) {connection.exec("ROLLBACK");throw error;}
}
export function allow(key:string,limit:number,windowMs:number) {
  const window=Math.floor(Date.now()/windowMs);
  return Number(db().prepare(`INSERT INTO rate_limits VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END,window=excluded.window RETURNING count`).get(key,window)?.count) <= limit;
}
