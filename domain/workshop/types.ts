export type MatchmakerCategory =
  | "share"
  | "reveal"
  | "analyze"
  | "strategize"
  | "help"
  | "plan";

export type ReviewTone = "success" | "warning" | "info";
export type EntryKind = "ls" | "neutral" | "transition";
export type SourceStatus = "official" | "unofficial" | "in-development";
export type IconId =
  | `ls-${string}`
  | "winfy"
  | "intro"
  | "input"
  | "reflection";

export interface ReviewSummary {
  label: string;
  score: string;
  tone: ReviewTone;
}

export interface StepFlow {
  title: string;
  role: string;
  prompt?: string;
  facilitatorCue: string;
}

export interface InspectableEntry {
  id: string;
  title: string;
  badge: string;
  kind: EntryKind;
  icon: IconId;
  typeLabel: string;
  shortDescription: string;
  description: string;
  review: string;
  notes: string;
  output: string;
  fitCues: [string, string, string];
  suggestions: string[];
  reviewSummary: ReviewSummary;
  libraryMeta?: string;
  libraryDuration?: string;
  libraryGroupSize?: string;
  libraryCategoryLabel?: string;
  libraryDescription?: string;
  sourceStatus?: SourceStatus;
  matchmakerCategory?: MatchmakerCategory;
  relatedEntryIds?: string[];
  alternativeEntryIds?: string[];
  steps?: StepFlow[];
}

export interface BlockItem {
  id: string;
  kind: "block";
  entryId: string;
  durationLabel: string;
  invitation: string;
  steps?: StepFlow[];
  flowSummary?: string;
  facilitatorCue?: string;
  warning?: string;
  accent?: boolean;
  showDetailedSteps?: boolean;
}

export interface TransitionItem {
  id: string;
  kind: "transition";
  entryId: string;
  durationLabel: string;
  note: string;
}

export type SectionItem = BlockItem | TransitionItem;

export interface SetupHotspot {
  sectionId: string;
  title: string;
  detail: string;
  prepLevel: "Light" | "Medium" | "Deep";
}

export interface PreviewFocus {
  title: string;
  detail: string;
}

export interface WorkshopSection {
  id: string;
  indexLabel: string;
  title: string;
  subgoal: string;
  dayLabel: string;
  timeRange?: string;
  totalLabel: string;
  prepNote: string;
  prepLevel: "Light" | "Medium" | "Deep";
  storyMeta: string;
  reviewSummary?: string;
  collapsedSummary?: string;
  miniPreviewEntryIds?: string[];
  suggestedEntryIds: string[];
  items: SectionItem[];
  status: "ready" | "draft";
}

export interface ProjectCardSummary {
  id: string;
  title: string;
  purposePreview: string;
  sectionCountLabel: string;
  languageLabel: string;
  formatLabel: string;
  aiLabel: string;
  storageLabel: string;
  updatedLabel: string;
  footerLabel: string;
  badgeLabel: string;
  badgeTone: ReviewTone;
  featured?: boolean;
}

export interface WorkshopProject {
  id: string;
  title: string;
  globalPurpose: string;
  context: string;
  targetAudience: string;
  durationLabel?: string;
  participantsLabel: string;
  format: string;
  language: string;
  aiEnabled: boolean;
  desiredFeel: string;
  energyLevel?: string;
  trustLevel?: string;
  conflictLevel?: string;
  decisionNeed?: string;
  moodTags: string[];
  feelTags: string[];
  designIngredients: string[];
  projectPulse: string[];
  setupHotspots: SetupHotspot[];
  previewWarnings: string[];
  previewFocus: PreviewFocus[];
  sections: WorkshopSection[];
}
