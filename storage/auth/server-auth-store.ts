import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { getAuthRuntimeConfig } from "@/storage/auth/auth-config";

const AUTH_RUNTIME_DIR = path.join(process.cwd(), ".runtime", "auth");
const MAGIC_LINK_DIR = path.join(AUTH_RUNTIME_DIR, "magic-links");
const SESSION_DIR = path.join(AUTH_RUNTIME_DIR, "sessions");

export interface AuthMagicLink {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthSessionRecord {
  sessionId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function magicLinkPath(token: string) {
  return path.join(MAGIC_LINK_DIR, `${sanitizeId(token)}.json`);
}

function sessionPath(sessionId: string) {
  return path.join(SESSION_DIR, `${sanitizeId(sessionId)}.json`);
}

function createSessionExpiry(createdAt: string) {
  const config = getAuthRuntimeConfig();
  return new Date(new Date(createdAt).getTime() + config.sessionTtlMs).toISOString();
}

async function ensureAuthDirs() {
  await Promise.all([
    mkdir(MAGIC_LINK_DIR, {
      recursive: true,
    }),
    mkdir(SESSION_DIR, {
      recursive: true,
    }),
  ]);
}

async function readJsonFile<T>(filePath: string) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function createMagicLink(email: string) {
  await ensureAuthDirs();

  const config = getAuthRuntimeConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const token = randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + config.magicLinkTtlMs);
  const record: AuthMagicLink = {
    token,
    email: normalizedEmail,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await writeFile(magicLinkPath(token), JSON.stringify(record, null, 2), "utf8");

  return record;
}

export async function readMagicLink(token: string) {
  return readJsonFile<AuthMagicLink>(magicLinkPath(token));
}

export async function removeMagicLink(token: string) {
  await rm(magicLinkPath(token), {
    force: true,
  });
}

export type MagicLinkConsumeResult =
  | {
      session: AuthSessionRecord;
      status: "authenticated";
    }
  | {
      status: "expired";
    }
  | {
      status: "invalid";
    };

export async function consumeMagicLink(token: string) {
  const link = await readMagicLink(token);

  if (!link) {
    return {
      status: "invalid",
    } satisfies MagicLinkConsumeResult;
  }

  if (new Date(link.expiresAt).getTime() < Date.now()) {
    await removeMagicLink(token);
    return {
      status: "expired",
    } satisfies MagicLinkConsumeResult;
  }

  const session = await createAuthSession(link.email);

  await removeMagicLink(token);

  return {
    session,
    status: "authenticated",
  } satisfies MagicLinkConsumeResult;
}

export async function createAuthSession(email: string) {
  await ensureAuthDirs();

  const createdAt = new Date().toISOString();
  const sessionId = randomUUID();
  const record: AuthSessionRecord = {
    sessionId,
    email: email.trim().toLowerCase(),
    createdAt,
    expiresAt: createSessionExpiry(createdAt),
  };

  await writeFile(sessionPath(sessionId), JSON.stringify(record, null, 2), "utf8");

  return record;
}

export async function readAuthSession(sessionId: string) {
  const record = await readJsonFile<Partial<AuthSessionRecord>>(sessionPath(sessionId));

  if (!record?.sessionId || !record.email || !record.createdAt) {
    await removeAuthSession(sessionId);
    return null;
  }

  const normalizedRecord: AuthSessionRecord = {
    sessionId: record.sessionId,
    email: record.email.trim().toLowerCase(),
    createdAt: record.createdAt,
    expiresAt: record.expiresAt ?? createSessionExpiry(record.createdAt),
  };

  if (new Date(normalizedRecord.expiresAt).getTime() < Date.now()) {
    await removeAuthSession(sessionId);
    return null;
  }

  if (!record.expiresAt || record.email !== normalizedRecord.email) {
    await writeFile(
      sessionPath(sessionId),
      JSON.stringify(normalizedRecord, null, 2),
      "utf8",
    );
  }

  return normalizedRecord;
}

export async function removeAuthSession(sessionId: string) {
  await rm(sessionPath(sessionId), {
    force: true,
  });
}
