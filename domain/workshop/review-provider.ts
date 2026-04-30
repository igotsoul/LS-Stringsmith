import {
  reviewBlockInSection as heuristicReviewBlockInSection,
  reviewEntryFallback as heuristicReviewEntryFallback,
  reviewSection as heuristicReviewSection,
  reviewTransitionInSection as heuristicReviewTransitionInSection,
  reviewWorkshop as heuristicReviewWorkshop,
  sharpenInvitation as heuristicSharpenInvitation,
  type ReviewInsight,
  type SectionReviewInsight,
  type WorkshopReviewInsight,
} from "@/domain/workshop/review";
import type { InvitationRefinement } from "@/domain/workshop/ai-review-contract";
import type {
  BlockItem,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

export interface ReviewProvider {
  id: string;
  label: string;
  reviewBlock(section: WorkshopSection, block: BlockItem): ReviewInsight;
  reviewEntry(entryId: string): ReviewInsight;
  reviewSection(section: WorkshopSection): SectionReviewInsight;
  reviewTransition(section: WorkshopSection, transition: TransitionItem): ReviewInsight;
  reviewWorkshop(project: WorkshopProject): WorkshopReviewInsight;
  sharpenInvitation(block: BlockItem): InvitationRefinement;
}

export const heuristicReviewProvider: ReviewProvider = {
  id: "heuristic-local",
  label: "Local heuristic review",
  reviewBlock: heuristicReviewBlockInSection,
  reviewEntry: heuristicReviewEntryFallback,
  reviewSection: heuristicReviewSection,
  reviewTransition: heuristicReviewTransitionInSection,
  reviewWorkshop: heuristicReviewWorkshop,
  sharpenInvitation: heuristicSharpenInvitation,
};

const aiBackedReviewProvider: ReviewProvider = {
  ...heuristicReviewProvider,
  id: "ai-backed",
  label: "AI review with local fallback",
};

export function getReviewProvider(project?: Pick<WorkshopProject, "aiEnabled">) {
  return project?.aiEnabled ? aiBackedReviewProvider : heuristicReviewProvider;
}
