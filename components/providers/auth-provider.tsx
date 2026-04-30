"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthSession {
  createdAt: string;
  email: string;
  expiresAt: string;
  sessionId: string;
}

interface AuthRuntimeInfo {
  authProvider: "magic-link";
  deliveryMode: "demo" | "email";
  isDemoDelivery: boolean;
  magicLinkTtlMinutes: number;
  mailProvider: "demo" | "http";
  mailProviderLabel: string;
  sessionTtlDays: number;
}

interface PendingMagicLink {
  activationUrl?: string;
  delivery: {
    label: string;
    mode: "demo" | "email";
    provider: "demo" | "http";
  };
  email: string;
  expiresAt: string;
}

interface AuthContextValue {
  pendingLink: PendingMagicLink | null;
  requestMagicLink(email: string, redirectTo?: string): Promise<PendingMagicLink>;
  runtime: AuthRuntimeInfo | null;
  session: AuthSession | null;
  signOut(): Promise<void>;
  status: "hydrating" | "guest" | "authenticated";
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load auth session.");
  }

  const payload = (await response.json()) as {
    auth: AuthRuntimeInfo;
    session: AuthSession | null;
  };

  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("hydrating");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingLink, setPendingLink] = useState<PendingMagicLink | null>(null);
  const [runtime, setRuntime] = useState<AuthRuntimeInfo | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await loadSession();

        if (!active) {
          return;
        }

        setRuntime(payload.auth);
        setSession(payload.session);
        if (payload.session) {
          setPendingLink(null);
        }
        setStatus(payload.session ? "authenticated" : "guest");
      } catch {
        if (!active) {
          return;
        }

        setSession(null);
        setStatus("guest");
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      pendingLink,
      async requestMagicLink(email, redirectTo = "/projects") {
        setPendingLink(null);
        const response = await fetch("/api/auth/request-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            redirectTo,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Could not request magic link.");
        }

        const payload = (await response.json()) as PendingMagicLink;
        setPendingLink(payload);
        return payload;
      },
      runtime,
      session,
      async signOut() {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        setSession(null);
        setPendingLink(null);
        setStatus("guest");
      },
      status,
    }),
    [pendingLink, runtime, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
