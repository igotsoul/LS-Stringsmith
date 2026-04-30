import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { WorkshopProject } from "@/domain/workshop/types";
import type { StoredProjectRecord } from "@/storage/projects/adapters";

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const SQLITE_DIR = path.join(RUNTIME_DIR, "sqlite");
const SQLITE_PATH = path.join(SQLITE_DIR, "liberating-structure-designer.db");
const LEGACY_JSON_DIR = path.join(RUNTIME_DIR, "persisted-projects");

interface PersistedProjectRow {
  claimed_at: string | null;
  id: string;
  owner_email: string | null;
  project_json: string;
  saved_at: string;
}

let database: DatabaseSync | null = null;
let didMigrateLegacyJson = false;

function ensureDatabase() {
  if (!database) {
    mkdirSync(SQLITE_DIR, {
      recursive: true,
    });

    database = new DatabaseSync(SQLITE_PATH);
    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;

      CREATE TABLE IF NOT EXISTS persisted_projects (
        id TEXT PRIMARY KEY,
        project_json TEXT NOT NULL,
        saved_at TEXT NOT NULL,
        owner_email TEXT,
        claimed_at TEXT
      );
    `);
  }

  if (!didMigrateLegacyJson) {
    migrateLegacyJsonDrafts(database);
    didMigrateLegacyJson = true;
  }

  return database;
}

function deserializeRow(row: PersistedProjectRow): StoredProjectRecord {
  return {
    id: row.id,
    project: JSON.parse(row.project_json) as WorkshopProject,
    savedAt: row.saved_at,
    ownerEmail: row.owner_email,
    claimedAt: row.claimed_at,
  };
}

function readProjectRow(projectId: string) {
  const db = ensureDatabase();
  const row = db
    .prepare(
      `
        SELECT id, project_json, saved_at, owner_email, claimed_at
        FROM persisted_projects
        WHERE id = ?
      `,
    )
    .get(projectId) as PersistedProjectRow | undefined;

  return row ?? null;
}

function upsertProjectRecord(record: StoredProjectRecord) {
  const db = ensureDatabase();

  db.prepare(
    `
      INSERT INTO persisted_projects (id, project_json, saved_at, owner_email, claimed_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_json = excluded.project_json,
        saved_at = excluded.saved_at,
        owner_email = excluded.owner_email,
        claimed_at = excluded.claimed_at
    `,
  ).run(
    record.id,
    JSON.stringify(record.project),
    record.savedAt,
    record.ownerEmail ?? null,
    record.claimedAt ?? null,
  );

  return record;
}

function migrateLegacyJsonDrafts(db: DatabaseSync) {
  if (!existsSync(LEGACY_JSON_DIR)) {
    return;
  }

  const files = readdirSync(LEGACY_JSON_DIR).filter((entry) => entry.endsWith(".json"));

  const insertLegacyDraft = db.prepare(
    `
      INSERT OR IGNORE INTO persisted_projects (id, project_json, saved_at, owner_email, claimed_at)
      VALUES (?, ?, ?, ?, ?)
    `,
  );

  for (const fileName of files) {
    try {
      const raw = readFileSync(path.join(LEGACY_JSON_DIR, fileName), "utf8");
      const record = JSON.parse(raw) as StoredProjectRecord;

      if (!record?.id || !record.project || !record.savedAt) {
        continue;
      }

      insertLegacyDraft.run(
        record.id,
        JSON.stringify(record.project),
        record.savedAt,
        record.ownerEmail ?? null,
        record.claimedAt ?? null,
      );
    } catch {
      // Leave unreadable legacy files untouched; the active SQLite draft remains usable.
    }
  }
}

export async function readServerPersistedProject(projectId: string) {
  const row = readProjectRow(projectId);
  return row ? deserializeRow(row) : null;
}

export async function listServerPersistedProjects() {
  const db = ensureDatabase();
  const rows = db
    .prepare(
      `
        SELECT id, project_json, saved_at, owner_email, claimed_at
        FROM persisted_projects
        ORDER BY saved_at DESC
      `,
    )
    .all() as unknown as PersistedProjectRow[];

  return rows.map(deserializeRow);
}

export async function writeServerPersistedProject(project: WorkshopProject) {
  const previousRecord = await readServerPersistedProject(project.id);
  const nextOwnerEmail = previousRecord?.ownerEmail ?? null;

  const record: StoredProjectRecord = {
    id: project.id,
    project,
    savedAt: new Date().toISOString(),
    ownerEmail: nextOwnerEmail,
    claimedAt:
      previousRecord?.ownerEmail && previousRecord.ownerEmail === nextOwnerEmail
        ? previousRecord.claimedAt ?? new Date().toISOString()
        : nextOwnerEmail
          ? new Date().toISOString()
          : null,
  };

  return upsertProjectRecord(record);
}

export async function writeServerPersistedProjectWithOwner(
  project: WorkshopProject,
  ownerEmail: string | null,
) {
  const previousRecord = await readServerPersistedProject(project.id);
  const normalizedOwnerEmail = ownerEmail?.trim() ? ownerEmail.trim().toLowerCase() : null;

  const record: StoredProjectRecord = {
    id: project.id,
    project,
    savedAt: new Date().toISOString(),
    ownerEmail: normalizedOwnerEmail,
    claimedAt:
      normalizedOwnerEmail === null
        ? null
        : previousRecord?.ownerEmail === normalizedOwnerEmail
          ? previousRecord.claimedAt ?? new Date().toISOString()
          : new Date().toISOString(),
  };

  return upsertProjectRecord(record);
}

export async function deleteServerPersistedProject(projectId: string) {
  const db = ensureDatabase();

  db.prepare(
    `
      DELETE FROM persisted_projects
      WHERE id = ?
    `,
  ).run(projectId);
}
