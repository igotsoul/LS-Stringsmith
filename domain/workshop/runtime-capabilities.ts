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
  aiToggleAvailable: boolean;
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
  const aiToggleAvailable = aiReviewRuntime?.configured === true;
  const aiActionsAvailable = project.aiEnabled && aiToggleAvailable;
  const fallbackProviderLabel =
    aiReviewRuntime?.fallbackProviderLabel ?? "Local heuristic review";
  const reviewProviderLabel = aiActionsAvailable
    ? (aiReviewRuntime?.providerLabel ?? "AI review")
    : fallbackProviderLabel;
  const storage = getStorageModeDetails(storageMode);
  const reviewAvailabilityLabel = !aiToggleAvailable
    ? "AI unavailable; local review only"
    : !project.aiEnabled
      ? "AI assistance paused"
      : `${reviewProviderLabel} ready`;

  return {
    aiActionsAvailable,
    aiStatusLabel: !aiToggleAvailable
      ? "AI unavailable"
      : aiActionsAvailable
        ? "AI assist on"
        : "AI assist off",
    aiToggleAvailable,
    aiToggleLabel: !aiToggleAvailable
      ? "Configure GROQ_API_KEY on the server to enable AI assistance."
      : aiActionsAvailable
        ? "Turn AI assistance off"
        : "Turn AI assistance on",
    reviewProviderLabel,
    reviewAvailabilityLabel,
    reviewDisabledNote: !aiToggleAvailable
      ? "AI assistance needs a server-side GROQ_API_KEY. Local heuristic review remains available without sending prompts to an external provider."
      : "Reviews and invitation sharpening are paused for this project until AI assistance is turned back on.",
    storageLabel: storage.savedLabel,
  } satisfies RuntimeCapabilities;
}
