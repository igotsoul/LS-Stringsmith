import { getReviewProvider } from "@/domain/workshop/review-provider";
import type { AiReviewRuntimeStatus } from "@/domain/workshop/ai-review-contract";
import type { WorkshopProject } from "@/domain/workshop/types";
import {
  getStorageModeDetails,
  type ProjectStorageMode,
} from "@/storage/projects/storage-mode";

export interface RuntimeCapabilities {
  aiActionsAvailable: boolean;
  aiStatusLabel: string;
  aiToggleLabel: string;
  reviewProviderLabel: string;
  reviewAvailabilityLabel: string;
  reviewDisabledNote: string;
  storageLabel: string;
}

export function getRuntimeCapabilities(
  project: Pick<WorkshopProject, "aiEnabled">,
  storageMode: ProjectStorageMode = "guest-local",
  aiReviewRuntime?: AiReviewRuntimeStatus,
) {
  const reviewProvider = getReviewProvider(project);
  const aiActionsAvailable = project.aiEnabled;
  const reviewProviderLabel = aiReviewRuntime?.providerLabel ?? reviewProvider.label;
  const storage = getStorageModeDetails(storageMode);
  const reviewAvailabilityLabel = !aiActionsAvailable
    ? "Review assistance paused"
    : aiReviewRuntime?.configured
      ? `${reviewProviderLabel} ready`
      : aiReviewRuntime?.providerId === "groq"
        ? "Local fallback ready; Groq needs configuration"
        : "Local fallback ready";

  return {
    aiActionsAvailable,
    aiStatusLabel: aiActionsAvailable ? "AI assist on" : "AI assist off",
    aiToggleLabel: aiActionsAvailable ? "Turn AI assistance off" : "Turn AI assistance on",
    reviewProviderLabel,
    reviewAvailabilityLabel,
    reviewDisabledNote:
      "Reviews and invitation sharpening are paused for this project until AI assistance is turned back on.",
    storageLabel: storage.savedLabel,
  } satisfies RuntimeCapabilities;
}
