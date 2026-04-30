"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AiReviewRuntimeStatus } from "@/domain/workshop/ai-review-contract";

type AiReviewRuntimeLoadState = "loading" | "ready" | "error";

interface AiReviewRuntimeContextValue {
  loadState: AiReviewRuntimeLoadState;
  runtime: AiReviewRuntimeStatus;
}

const fallbackRuntime: AiReviewRuntimeStatus = {
  configured: false,
  fallbackProviderLabel: "Local heuristic review",
  model: null,
  providerId: "off",
  providerLabel: "Local heuristic review",
  reason: "Review provider status has not loaded yet.",
};

const AiReviewRuntimeContext = createContext<AiReviewRuntimeContextValue>({
  loadState: "loading",
  runtime: fallbackRuntime,
});

function isRuntimeStatus(value: unknown): value is AiReviewRuntimeStatus {
  return (
    typeof value === "object" &&
    value !== null &&
    "providerId" in value &&
    "providerLabel" in value
  );
}

export function AiReviewProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<AiReviewRuntimeStatus>(fallbackRuntime);
  const [loadState, setLoadState] = useState<AiReviewRuntimeLoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadRuntime() {
      try {
        const response = await fetch("/api/ai-review", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load review provider status.");
        }

        const nextRuntime = (await response.json()) as unknown;

        if (!isRuntimeStatus(nextRuntime)) {
          throw new Error("Review provider status response was invalid.");
        }

        if (active) {
          setRuntime(nextRuntime);
          setLoadState("ready");
        }
      } catch {
        if (active) {
          setRuntime({
            ...fallbackRuntime,
            reason: "Review provider status could not be loaded.",
          });
          setLoadState("error");
        }
      }
    }

    void loadRuntime();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      loadState,
      runtime,
    }),
    [loadState, runtime],
  );

  return (
    <AiReviewRuntimeContext.Provider value={value}>
      {children}
    </AiReviewRuntimeContext.Provider>
  );
}

export function useAiReviewRuntime() {
  return useContext(AiReviewRuntimeContext);
}
