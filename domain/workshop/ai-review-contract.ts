import type {
  ReviewInsight,
  SectionReviewInsight,
  WorkshopReviewInsight,
} from "@/domain/workshop/review";
import type { WorkshopProject } from "@/domain/workshop/types";

export type AiReviewProviderId = "off" | "groq";
export type AiReviewSource = "ai" | "fallback";
export type AiReviewTarget = "block" | "section" | "workshop" | "sharpen-invitation";

export interface InvitationRefinement {
  learningPoints: string[];
  needsChange: boolean;
  rationale: string;
  text: string;
}

export interface AiReviewRuntimeStatus {
  configured: boolean;
  fallbackProviderLabel: string;
  model: string | null;
  providerId: AiReviewProviderId;
  providerLabel: string;
  reason: string | null;
}

export interface AiReviewRequest {
  itemId?: string;
  promptLabel?: string;
  promptText?: string;
  project: WorkshopProject;
  sectionId?: string;
  target: AiReviewTarget;
}

interface AiReviewResponseBase {
  model: string | null;
  providerId: AiReviewProviderId | "heuristic-local";
  providerLabel: string;
  source: AiReviewSource;
  target: AiReviewTarget;
  warning?: string;
}

export type AiReviewResponse =
  | (AiReviewResponseBase & {
      refinement?: never;
      review: ReviewInsight | SectionReviewInsight | WorkshopReviewInsight;
    })
  | (AiReviewResponseBase & {
      refinement: InvitationRefinement;
      review?: never;
    });
