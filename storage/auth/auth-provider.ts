import {
  AuthConfigurationError,
  getAuthRuntimeConfig,
  type MailDeliveryMode,
  type MailProviderId,
} from "@/storage/auth/auth-config";
import { getMailDeliveryProvider } from "@/storage/auth/mail-delivery";
import {
  consumeMagicLink,
  createMagicLink,
  readAuthSession,
  removeMagicLink,
  removeAuthSession,
  type AuthSessionRecord,
  type MagicLinkConsumeResult,
} from "@/storage/auth/server-auth-store";

export interface MagicLinkRequestResult {
  activationUrl?: string;
  delivery: {
    label: string;
    mode: MailDeliveryMode;
    provider: MailProviderId;
  };
  email: string;
  expiresAt: string;
}

export interface AuthProvider {
  id: "magic-link";
  label: string;
  activateMagicLink(token: string): Promise<MagicLinkConsumeResult>;
  endSession(sessionId: string): Promise<void>;
  readSession(sessionId: string): Promise<AuthSessionRecord | null>;
  requestMagicLink(options: {
    email: string;
    origin: string;
    redirectTo?: string | null;
  }): Promise<MagicLinkRequestResult>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase() ?? "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new AuthRequestError("Enter a valid email address.");
  }

  return email;
}

export function normalizeRedirectPath(value: string | null | undefined) {
  if (!value) {
    return "/projects";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/projects";
  }

  return value;
}

function createActivationUrl(origin: string, token: string, redirectTo: string) {
  const config = getAuthRuntimeConfig();
  const baseUrl = config.appBaseUrl ?? origin;
  const url = new URL("/auth/activate", baseUrl);

  url.searchParams.set("token", token);
  url.searchParams.set("redirectTo", redirectTo);

  return url.toString();
}

const magicLinkAuthProvider: AuthProvider = {
  id: "magic-link",
  label: "Magic link auth",
  activateMagicLink(token) {
    return consumeMagicLink(token);
  },
  endSession(sessionId) {
    return removeAuthSession(sessionId);
  },
  readSession(sessionId) {
    return readAuthSession(sessionId);
  },
  async requestMagicLink(options) {
    const config = getAuthRuntimeConfig();

    if (config.authProvider !== "magic-link") {
      throw new AuthConfigurationError("Only magic-link auth is supported in this slice.");
    }

    const email = normalizeEmail(options.email);
    const redirectTo = normalizeRedirectPath(options.redirectTo);
    const mailProvider = getMailDeliveryProvider(config);
    const link = await createMagicLink(email);
    const activationUrl = createActivationUrl(options.origin, link.token, redirectTo);
    let delivery: Awaited<ReturnType<typeof mailProvider.sendMagicLink>>;

    try {
      delivery = await mailProvider.sendMagicLink({
        activationUrl,
        email: link.email,
        expiresAt: link.expiresAt,
      });
    } catch (error) {
      await removeMagicLink(link.token);
      throw error;
    }

    return {
      activationUrl: delivery.mode === "demo" ? activationUrl : undefined,
      delivery,
      email: link.email,
      expiresAt: link.expiresAt,
    };
  },
};

export function getAuthProvider(): AuthProvider {
  return magicLinkAuthProvider;
}
