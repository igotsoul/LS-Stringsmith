import {
  AuthConfigurationError,
  type AuthRuntimeConfig,
  type MailDeliveryMode,
  type MailProviderId,
} from "@/storage/auth/auth-config";

export interface MagicLinkMailMessage {
  activationUrl: string;
  email: string;
  expiresAt: string;
}

export interface MailDeliveryReceipt {
  label: string;
  mode: MailDeliveryMode;
  provider: MailProviderId;
}

export interface MailDeliveryProvider {
  id: MailProviderId;
  label: string;
  mode: MailDeliveryMode;
  sendMagicLink(message: MagicLinkMailMessage): Promise<MailDeliveryReceipt>;
}

export class MailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailDeliveryError";
  }
}

function createDemoMailProvider(config: AuthRuntimeConfig): MailDeliveryProvider {
  return {
    id: "demo",
    label: config.mailProviderLabel,
    mode: "demo",
    async sendMagicLink() {
      return {
        label: config.mailProviderLabel,
        mode: "demo",
        provider: "demo",
      };
    },
  };
}

function createHttpMailProvider(config: AuthRuntimeConfig): MailDeliveryProvider {
  if (!config.mailHttpEndpoint) {
    throw new AuthConfigurationError(
      "LSD_MAIL_HTTP_ENDPOINT is required when LSD_MAIL_PROVIDER=http.",
    );
  }

  return {
    id: "http",
    label: config.mailProviderLabel,
    mode: "email",
    async sendMagicLink(message) {
      let response: Response;

      try {
        response = await fetch(config.mailHttpEndpoint as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.mailHttpBearerToken
              ? { Authorization: `Bearer ${config.mailHttpBearerToken}` }
              : {}),
          },
          body: JSON.stringify({
            from: config.mailFrom,
            html: `<p>Open this magic link to sign in:</p><p><a href="${message.activationUrl}">Sign in to LS Stringsmith</a></p><p>This link expires at ${message.expiresAt}.</p>`,
            subject: "Your LS Stringsmith sign-in link",
            text: `Open this magic link to sign in: ${message.activationUrl}\n\nThis link expires at ${message.expiresAt}.`,
            to: message.email,
            type: "magic-link",
          }),
        });
      } catch {
        throw new MailDeliveryError("Could not reach the configured mail provider.");
      }

      if (!response.ok) {
        throw new MailDeliveryError(
          `Mail provider returned ${response.status} while sending the magic link.`,
        );
      }

      return {
        label: config.mailProviderLabel,
        mode: "email",
        provider: "http",
      };
    },
  };
}

export function getMailDeliveryProvider(config: AuthRuntimeConfig): MailDeliveryProvider {
  if (config.mailProvider === "http") {
    return createHttpMailProvider(config);
  }

  return createDemoMailProvider(config);
}
