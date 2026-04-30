"use client";

import { useEffect, useRef, useState } from "react";

import type {
  AiReviewRequest,
  AiReviewResponse,
  AiReviewSource,
} from "@/domain/workshop/ai-review-contract";

type AiReviewLoadState = "idle" | "loading" | "ready" | "fallback";

interface UseAiReviewOptions<TReview> {
  enabled: boolean;
  fallbackProviderLabel?: string;
  fallbackReview: TReview;
  request: AiReviewRequest | null;
}

interface UseAiReviewResult<TReview> {
  providerLabel: string;
  review: TReview;
  source: AiReviewSource;
  state: AiReviewLoadState;
  warning: string | null;
}

function isReviewResponse(value: AiReviewResponse): value is AiReviewResponse & { review: unknown } {
  return "review" in value;
}

export function useAiReview<TReview>({
  enabled,
  fallbackProviderLabel = "Local heuristic review",
  fallbackReview,
  request,
}: UseAiReviewOptions<TReview>): UseAiReviewResult<TReview> {
  const requestKey = request ? JSON.stringify(request) : "";
  const hasRequest = requestKey.length > 0;
  const fallbackReviewRef = useRef(fallbackReview);
  const [result, setResult] = useState<UseAiReviewResult<TReview>>({
    providerLabel: fallbackProviderLabel,
    review: fallbackReview,
    source: "fallback",
    state: "idle",
    warning: null,
  });

  useEffect(() => {
    fallbackReviewRef.current = fallbackReview;

    setResult((current) => {
      if (current.source !== "fallback" || current.state === "loading") {
        return current;
      }

      return {
        ...current,
        providerLabel: fallbackProviderLabel,
        review: fallbackReview,
      };
    });
  }, [fallbackProviderLabel, fallbackReview]);

  useEffect(() => {
    setResult({
      providerLabel: fallbackProviderLabel,
      review: fallbackReviewRef.current,
      source: "fallback",
      state: enabled && hasRequest ? "loading" : "idle",
      warning: null,
    });

    if (!enabled || !hasRequest) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    async function loadReview() {
      try {
        const response = await fetch("/api/ai-review", {
          body: requestKey,
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Review request failed.");
        }

        const payload = (await response.json()) as AiReviewResponse;

        if (!isReviewResponse(payload)) {
          throw new Error("Review response was invalid.");
        }

        if (active) {
          setResult({
            providerLabel: payload.providerLabel ?? fallbackProviderLabel,
            review: payload.review as TReview,
            source: payload.source,
            state: payload.source === "ai" ? "ready" : "fallback",
            warning: payload.warning ?? null,
          });
        }
      } catch (error) {
        if (!active || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setResult({
          providerLabel: fallbackProviderLabel,
          review: fallbackReviewRef.current,
          source: "fallback",
          state: "fallback",
          warning: "Review provider unavailable; showing local fallback.",
        });
      }
    }

    void loadReview();

    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, fallbackProviderLabel, hasRequest, requestKey]);

  return result;
}
