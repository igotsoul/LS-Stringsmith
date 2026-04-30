export type AuthProviderId = "magic-link";
export type MailProviderId = "demo" | "http";
export type MailDeliveryMode = "demo" | "email";

export const AUTH_SESSION_COOKIE = "lsd_auth_session";

export interface AuthRuntimeConfig {
  appBaseUrl: string | null;
  authProvider: AuthProviderId;
  cookieSecure: "auto" | "always" | "never";
  magicLinkTtlMs: number;
  mailFrom: string | null;
  mailHttpBearerToken: string | null;
  mailHttpEndpoint: string | null;
  mailProvider: MailProviderId;
  mailProviderLabel: string;
  sessionTtlMs: number;
}

export interface AuthRuntimePublicConfig {
  authProvider: AuthProviderId;
  deliveryMode: MailDeliveryMode;
  isDemoDelivery: boolean;
  magicLinkTtlMinutes: number;
  mailProvider: MailProviderId;
  mailProviderLabel: string;
  sessionTtlDays: number;
}

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const DEFAULT_MAGIC_LINK_TTL_MINUTES = 20;
const DEFAULT_SESSION_TTL_DAYS = 14;

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readPositiveNumberEnv(name: string, fallback: number) {
  const rawValue = readEnv(name);

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AuthConfigurationError(`${name} must be a positive number.`);
  }

  return parsed;
}

function readAuthProvider(): AuthProviderId {
  const rawValue = readEnv("LSD_AUTH_PROVIDER") ?? "magic-link";

  if (rawValue === "magic-link") {
    return rawValue;
  }

  throw new AuthConfigurationError(
    `Unsupported LSD_AUTH_PROVIDER "${rawValue}". Use "magic-link".`,
  );
}

function readMailProvider(): MailProviderId {
  const rawValue = readEnv("LSD_MAIL_PROVIDER") ?? "demo";

  if (rawValue === "demo" || rawValue === "http") {
    return rawValue;
  }

  throw new AuthConfigurationError(
    `Unsupported LSD_MAIL_PROVIDER "${rawValue}". Use "demo" or "http".`,
  );
}

function readCookieSecure() {
  const rawValue = readEnv("LSD_AUTH_COOKIE_SECURE") ?? "auto";

  if (rawValue === "auto" || rawValue === "always" || rawValue === "never") {
    return rawValue;
  }

  throw new AuthConfigurationError(
    `Unsupported LSD_AUTH_COOKIE_SECURE "${rawValue}". Use "auto", "always", or "never".`,
  );
}

function normalizeBaseUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    throw new AuthConfigurationError("LSD_AUTH_BASE_URL must be a valid absolute URL.");
  }
}

export function getAuthRuntimeConfig(): AuthRuntimeConfig {
  const mailProvider = readMailProvider();
  const mailProviderLabel =
    readEnv("LSD_MAIL_PROVIDER_LABEL") ??
    (mailProvider === "demo" ? "Local demo mail" : "HTTP mail hook");

  return {
    appBaseUrl: normalizeBaseUrl(readEnv("LSD_AUTH_BASE_URL")),
    authProvider: readAuthProvider(),
    cookieSecure: readCookieSecure(),
    magicLinkTtlMs:
      readPositiveNumberEnv(
        "LSD_AUTH_MAGIC_LINK_TTL_MINUTES",
        DEFAULT_MAGIC_LINK_TTL_MINUTES,
      ) * MINUTE_MS,
    mailFrom: readEnv("LSD_MAIL_FROM"),
    mailHttpBearerToken: readEnv("LSD_MAIL_HTTP_BEARER_TOKEN"),
    mailHttpEndpoint: readEnv("LSD_MAIL_HTTP_ENDPOINT"),
    mailProvider,
    mailProviderLabel,
    sessionTtlMs:
      readPositiveNumberEnv("LSD_AUTH_SESSION_TTL_DAYS", DEFAULT_SESSION_TTL_DAYS) *
      DAY_MS,
  };
}

export function getAuthRuntimePublicConfig(): AuthRuntimePublicConfig {
  const config = getAuthRuntimeConfig();

  return {
    authProvider: config.authProvider,
    deliveryMode: config.mailProvider === "demo" ? "demo" : "email",
    isDemoDelivery: config.mailProvider === "demo",
    magicLinkTtlMinutes: Math.round(config.magicLinkTtlMs / MINUTE_MS),
    mailProvider: config.mailProvider,
    mailProviderLabel: config.mailProviderLabel,
    sessionTtlDays: Math.round(config.sessionTtlMs / DAY_MS),
  };
}

export function shouldUseSecureSessionCookie(requestUrl: string) {
  const config = getAuthRuntimeConfig();

  if (config.cookieSecure === "always") {
    return true;
  }

  if (config.cookieSecure === "never") {
    return false;
  }

  return new URL(requestUrl).protocol === "https:";
}
