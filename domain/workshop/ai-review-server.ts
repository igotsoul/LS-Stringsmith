import { getInspectableEntry } from "@/domain/workshop/demo-project";
import type {
  AiReviewProviderId,
  AiReviewRequest,
  AiReviewResponse,
  AiReviewRuntimeStatus,
  InvitationRefinement,
} from "@/domain/workshop/ai-review-contract";
import {
  reviewBlockInSection,
  reviewSection,
  reviewWorkshop,
  sharpenInvitation,
  type ReviewInsight,
  type SectionReviewInsight,
  type WorkshopReviewInsight,
} from "@/domain/workshop/review";
import type {
  BlockItem,
  ReviewTone,
  SectionItem,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

type ReviewPayload = ReviewInsight | SectionReviewInsight | WorkshopReviewInsight;

interface AiReviewRuntimeConfig {
  groqApiKey: string | null;
  groqBaseUrl: string;
  model: string;
  provider: AiReviewProviderId;
  timeoutMs: number;
}

interface ResolvedReviewRequest<TFallback> {
  fallback: TFallback;
  item?: BlockItem;
  promptLabel?: string;
  promptText?: string;
  project: WorkshopProject;
  section?: WorkshopSection;
  target: AiReviewRequest["target"];
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

class AiReviewRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiReviewRequestError";
  }
}

class AiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiProviderError";
  }
}

const fallbackProvider = {
  id: "heuristic-local" as const,
  label: "Local heuristic review",
};

const defaultGroqBaseUrl = "https://api.groq.com/openai/v1";
const defaultGroqModel = "openai/gpt-oss-20b";
const defaultTimeoutMs = 12_000;

const reviewToneValues = ["success", "info", "warning"] satisfies ReviewTone[];
const reviewLabelValues = [
  "Strong fit",
  "Good fit",
  "Promising fit",
  "Needs another pass",
] as const;
const invitationCriteria = [
  "does not judge or frame the answer in any particular way",
  "opens avenues for thinking instead of closing them",
  "is specific about the problem space, but ambiguous about the perspective",
  "is slightly abstract",
] as const;

const blockReviewSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "score", "tone", "summary", "why", "fitCues", "suggestions"],
  properties: {
    label: { type: "string", enum: reviewLabelValues },
    score: { type: "number", minimum: 1, maximum: 5 },
    tone: { type: "string", enum: reviewToneValues },
    summary: { type: "string" },
    why: { type: "string" },
    fitCues: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" },
    },
    suggestions: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
  },
} as const;

const sectionReviewSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "score", "tone", "summary", "highlights", "suggestions"],
  properties: {
    label: { type: "string", enum: reviewLabelValues },
    score: { type: "number", minimum: 1, maximum: 5 },
    tone: { type: "string", enum: reviewToneValues },
    summary: { type: "string" },
    highlights: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
    suggestions: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
  },
} as const;

const invitationRefinementSchema = {
  type: "object",
  additionalProperties: false,
  required: ["needsChange", "text", "rationale", "learningPoints"],
  properties: {
    needsChange: {
      type: "boolean",
      description:
        "False when the current prompt already satisfies the invitation criteria well enough and no meaningful rewrite is needed. True only when the suggested wording materially improves the invitation.",
    },
    text: {
      type: "string",
      description:
        "The refined invitation prompt. If needsChange is false, return the exact current prompt unchanged. If true, keep it specific to the problem space, open in perspective, neutral in framing, and slightly abstract.",
    },
    rationale: {
      type: "string",
      description:
        "Two concise sentences tied to the user's original prompt. If no change is needed, state clearly that the invitation is already strong and why. If changed, mention a concrete phrase or move from the original, explain what it did to the invitation, and compare it with the suggested version.",
    },
    learningPoints: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      description:
        "Short coaching points that help the user learn how to formulate better invitations. Each point must be specific to the original prompt, not a generic restatement of the criteria.",
      items: {
        type: "string",
      },
    },
  },
} as const;

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readPositiveIntegerEnv(name: string, fallback: number) {
  const rawValue = readEnv(name);

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AiProviderError(`${name} must be a positive integer.`);
  }

  return parsed;
}

function readProvider(): AiReviewProviderId {
  const rawValue = readEnv("LSD_AI_PROVIDER") ?? (readEnv("GROQ_API_KEY") ? "groq" : "off");

  if (rawValue === "off" || rawValue === "groq") {
    return rawValue;
  }

  throw new AiProviderError(`Unsupported LSD_AI_PROVIDER "${rawValue}". Use "off" or "groq".`);
}

function getAiReviewRuntimeConfig(): AiReviewRuntimeConfig {
  return {
    groqApiKey: readEnv("GROQ_API_KEY"),
    groqBaseUrl: (readEnv("GROQ_BASE_URL") ?? defaultGroqBaseUrl).replace(/\/+$/, ""),
    model: readEnv("LSD_AI_MODEL") ?? defaultGroqModel,
    provider: readProvider(),
    timeoutMs: readPositiveIntegerEnv("LSD_AI_TIMEOUT_MS", defaultTimeoutMs),
  };
}

export function getAiReviewRuntimeStatus(): AiReviewRuntimeStatus {
  try {
    const config = getAiReviewRuntimeConfig();
    const configured = config.provider === "groq" && Boolean(config.groqApiKey);

    if (config.provider === "off") {
      return {
        configured: false,
        fallbackProviderLabel: fallbackProvider.label,
        model: null,
        providerId: "off",
        providerLabel: fallbackProvider.label,
        reason: "AI provider is disabled.",
      };
    }

    return {
      configured,
      fallbackProviderLabel: fallbackProvider.label,
      model: config.model,
      providerId: "groq",
      providerLabel: "Groq AI review",
      reason: configured ? null : "GROQ_API_KEY is not configured.",
    };
  } catch (error) {
    return {
      configured: false,
      fallbackProviderLabel: fallbackProvider.label,
      model: null,
      providerId: "off",
      providerLabel: fallbackProvider.label,
      reason: error instanceof Error ? error.message : "AI provider configuration is invalid.",
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWorkshopProject(value: unknown): value is WorkshopProject {
  return isRecord(value) && typeof value.id === "string" && Array.isArray(value.sections);
}

function getSection(project: WorkshopProject, sectionId: string | undefined) {
  const section = sectionId
    ? project.sections.find((candidate) => candidate.id === sectionId)
    : null;

  if (!section) {
    throw new AiReviewRequestError("Review request references an unknown section.");
  }

  return section;
}

function getBlock(section: WorkshopSection, itemId: string | undefined) {
  const item = itemId
    ? section.items.find(
        (candidate): candidate is BlockItem =>
          candidate.kind === "block" && candidate.id === itemId,
      )
    : null;

  if (!item) {
    throw new AiReviewRequestError("Review request references an unknown block.");
  }

  return item;
}

function resolveReviewRequest(request: AiReviewRequest): ResolvedReviewRequest<ReviewPayload> {
  if (!isWorkshopProject(request.project)) {
    throw new AiReviewRequestError("Review request must include a valid project.");
  }

  if (request.target === "workshop") {
    return {
      fallback: reviewWorkshop(request.project),
      project: request.project,
      target: "workshop",
    };
  }

  const section = getSection(request.project, request.sectionId);

  if (request.target === "section") {
    return {
      fallback: reviewSection(section),
      project: request.project,
      section,
      target: "section",
    };
  }

  if (request.target === "block") {
    const item = getBlock(section, request.itemId);

    return {
      fallback: reviewBlockInSection(section, item),
      item,
      project: request.project,
      section,
      target: "block",
    };
  }

  throw new AiReviewRequestError("Unsupported review target.");
}

function resolveInvitationRequest(
  request: AiReviewRequest,
): ResolvedReviewRequest<InvitationRefinement> {
  if (!isWorkshopProject(request.project)) {
    throw new AiReviewRequestError("Review request must include a valid project.");
  }

  const section = getSection(request.project, request.sectionId);
  const item = getBlock(section, request.itemId);
  const promptText = request.promptText?.trim() || item.invitation;
  const fallback =
    request.promptText === undefined
      ? sharpenInvitation(item)
      : {
          learningPoints: [
            "Keep the current wording visible so you can compare it with the next refinement attempt.",
          ],
          needsChange: false,
          rationale: "Kept the current prompt available because AI refinement was unavailable.",
          text: promptText,
        };

  return {
    fallback,
    item,
    promptLabel: request.promptLabel?.trim() || "Invitation",
    promptText,
    project: request.project,
    section,
    target: "sharpen-invitation",
  };
}

function fallbackReviewResponse(
  resolved: ResolvedReviewRequest<ReviewPayload>,
  warning?: string,
): AiReviewResponse {
  return {
    model: null,
    providerId: fallbackProvider.id,
    providerLabel: fallbackProvider.label,
    review: resolved.fallback,
    source: "fallback",
    target: resolved.target,
    warning,
  };
}

function fallbackInvitationResponse(
  resolved: ResolvedReviewRequest<InvitationRefinement>,
  warning?: string,
): AiReviewResponse {
  return {
    model: null,
    providerId: fallbackProvider.id,
    providerLabel: fallbackProvider.label,
    refinement: resolved.fallback,
    source: "fallback",
    target: resolved.target,
    warning,
  };
}

function numberFromScore(value: unknown, fallback: string) {
  const rawNumber =
    typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : NaN;
  const parsed = Number.isFinite(rawNumber) ? rawNumber : Number.parseFloat(fallback);

  if (!Number.isFinite(parsed)) {
    return 3.5;
  }

  return Math.min(Math.max(parsed, 1), 5);
}

function scoreLabel(value: number) {
  return `${value.toFixed(1)} / 5`;
}

function toneFromScore(score: number): ReviewTone {
  if (score >= 4.15) {
    return "success";
  }

  if (score >= 3.45) {
    return "info";
  }

  return "warning";
}

function normalizeTone(value: unknown, score: number, fallback: ReviewTone) {
  return value === "success" || value === "info" || value === "warning"
    ? value
    : fallback ?? toneFromScore(score);
}

function normalizeString(value: unknown, fallback: string, maxLength = 700) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return fallback;
  }

  return text.replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeStringList(
  value: unknown,
  fallback: string[],
  maxItems: number,
  maxLength = 180,
) {
  const source = Array.isArray(value) ? value : [];
  const items = source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/\s+/g, " ").slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);

  return items.length ? items : fallback.slice(0, maxItems);
}

function normalizeBlockReview(value: unknown, fallback: ReviewInsight): ReviewInsight {
  const record = isRecord(value) ? value : {};
  const score = numberFromScore(record.score, fallback.score);

  return {
    label: normalizeString(record.label, fallback.label, 80),
    score: scoreLabel(score),
    tone: normalizeTone(record.tone, score, fallback.tone),
    summary: normalizeString(record.summary, fallback.summary),
    why: normalizeString(record.why, fallback.why),
    fitCues: normalizeStringList(record.fitCues, fallback.fitCues, 4, 80),
    suggestions: normalizeStringList(record.suggestions, fallback.suggestions, 4),
  };
}

function normalizeAggregateReview<TReview extends SectionReviewInsight | WorkshopReviewInsight>(
  value: unknown,
  fallback: TReview,
): TReview {
  const record = isRecord(value) ? value : {};
  const score = numberFromScore(record.score, fallback.score);
  const normalized: SectionReviewInsight | WorkshopReviewInsight = {
    highlights: normalizeStringList(record.highlights, fallback.highlights, 4),
    label: normalizeString(record.label, fallback.label, 80),
    score: scoreLabel(score),
    suggestions: normalizeStringList(record.suggestions, fallback.suggestions, 4),
    summary: normalizeString(record.summary, fallback.summary),
    tone: normalizeTone(record.tone, score, fallback.tone),
  };

  return normalized as TReview;
}

function normalizeInvitationRefinement(
  value: unknown,
  fallback: InvitationRefinement,
): InvitationRefinement {
  const record = isRecord(value) ? value : {};

  return {
    learningPoints: normalizeStringList(
      record.learningPoints,
      fallback.learningPoints,
      3,
      260,
    ),
    needsChange:
      typeof record.needsChange === "boolean" ? record.needsChange : fallback.needsChange,
    rationale: normalizeString(record.rationale, fallback.rationale, 560),
    text: normalizeString(record.text, fallback.text, 320),
  };
}

function describeItem(item: SectionItem) {
  if (item.kind === "transition") {
    return {
      durationLabel: item.durationLabel,
      kind: "transition",
      note: item.note,
    };
  }

  const entry = getInspectableEntry(item.entryId);

  return {
    durationLabel: item.durationLabel,
    entry: {
      fitCues: entry.fitCues,
      kind: entry.kind,
      matchmakerCategory: entry.matchmakerCategory ?? null,
      output: entry.output,
      shortDescription: entry.shortDescription,
      title: entry.title,
      typeLabel: entry.typeLabel,
    },
    invitation: item.invitation,
    kind: "block",
  };
}

function compactSection(section: WorkshopSection) {
  return {
    dayLabel: section.dayLabel,
    indexLabel: section.indexLabel,
    items: section.items.map(describeItem),
    prepNote: section.prepNote,
    status: section.status,
    subgoal: section.subgoal,
    timeRange: section.timeRange ?? null,
    title: section.title,
    totalLabel: section.totalLabel,
  };
}

function compactProject(project: WorkshopProject) {
  return {
    context: project.context,
    desiredFeel: project.desiredFeel,
    format: project.format,
    globalPurpose: project.globalPurpose,
    language: project.language,
    participantsLabel: project.participantsLabel,
    targetAudience: project.targetAudience,
    title: project.title,
  };
}

function buildPromptInput(resolved: ResolvedReviewRequest<ReviewPayload | InvitationRefinement>) {
  const base = {
    project: compactProject(resolved.project),
    reviewStyle: {
      guardrails: [
        "assist the facilitator; do not redesign the workshop autonomously",
        "prefer concrete facilitation observations over generic praise",
        "keep each list item concise and directly actionable",
        "respond in the workshop language when it is clear; otherwise use English",
      ],
    },
    target: resolved.target,
  };

  if (resolved.target === "workshop") {
    return {
      ...base,
      sections: resolved.project.sections.map(compactSection),
    };
  }

  if (resolved.target === "section" && resolved.section) {
    return {
      ...base,
      section: compactSection(resolved.section),
    };
  }

  if (
    (resolved.target === "block" || resolved.target === "sharpen-invitation") &&
    resolved.section &&
    resolved.item
  ) {
    const invitationTask =
      resolved.target === "sharpen-invitation"
        ? {
            criteria: invitationCriteria,
            currentPrompt: resolved.promptText ?? resolved.item.invitation,
            promptLabel: resolved.promptLabel ?? "Invitation",
            instruction:
              "Evaluate the current prompt against the invitation criteria. Be bold about saying no rewrite is needed: if the current prompt is already neutral, open, specific enough, perspective-ambiguous, and slightly abstract, set needsChange=false and return the exact current prompt unchanged. Do not make tiny style edits, synonym swaps, or endless micro-optimizations. Only set needsChange=true when the suggested wording materially improves invitation quality. When a change is needed, repair awkward phrasing, remove blame, avoid direct fixing language, and avoid assigning a solution owner unless the role is essential to the problem space. Prefer wording that asks where patterns emerge or what is worth exploring over wording that prescribes what should be fixed. The feedback must teach invitation craft: quote or name a concrete wording choice from the user's current prompt, explain its effect, and explain how the suggested version changes that effect. Do not write generic checklist summaries like 'removes judgment, stays open-ended, and is slightly abstract'. Return needsChange, a prompt text, a grounded two-sentence rationale, and 2-3 specific learning points.",
          }
        : undefined;

    return {
      ...base,
      block: describeItem(resolved.item),
      invitationTask,
      section: compactSection(resolved.section),
    };
  }

  return base;
}

function responseFormatForTarget(target: AiReviewRequest["target"]) {
  if (target === "section" || target === "workshop") {
    return {
      type: "json_schema",
      json_schema: {
        name: `lsd_${target}_review`,
        strict: true,
        schema: sectionReviewSchema,
      },
    };
  }

  if (target === "sharpen-invitation") {
    return {
      type: "json_schema",
      json_schema: {
        name: "lsd_invitation_refinement",
        strict: true,
        schema: invitationRefinementSchema,
      },
    };
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "lsd_block_review",
      strict: true,
      schema: blockReviewSchema,
    },
  };
}

async function postGroqChatCompletion(
  config: AiReviewRuntimeConfig,
  resolved: ResolvedReviewRequest<ReviewPayload | InvitationRefinement>,
) {
  if (!config.groqApiKey) {
    throw new AiProviderError("GROQ_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.groqBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_completion_tokens: resolved.target === "workshop" ? 900 : 650,
        messages: [
          {
            role: "system",
            content:
              "You review Liberating Structures workshop designs. Return only JSON matching the supplied schema. Keep feedback grounded in the supplied project, concise, and facilitation-ready. For invitation refinement, behave like a coach: compare the user's original wording with the suggested wording, name the invitation principle involved, and make the feedback specific enough that the user learns how to formulate better invitations next time.",
          },
          {
            role: "user",
            content: JSON.stringify(buildPromptInput(resolved)),
          },
        ],
        model: config.model,
        reasoning_effort: "low",
        response_format: responseFormatForTarget(resolved.target),
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AiProviderError(`Groq returned ${response.status}.`);
    }

    const payload = (await response.json()) as GroqChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new AiProviderError("Groq returned an empty response.");
    }

    try {
      return JSON.parse(content) as unknown;
    } catch {
      throw new AiProviderError("Groq returned invalid JSON.");
    }
  } catch (error) {
    if (error instanceof AiProviderError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError("Groq review timed out.");
    }

    throw new AiProviderError("Could not reach Groq.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runWithGroq<TFallback extends ReviewPayload | InvitationRefinement>(
  resolved: ResolvedReviewRequest<TFallback>,
) {
  const config = getAiReviewRuntimeConfig();

  if (!resolved.project.aiEnabled) {
    throw new AiProviderError("AI assistance is disabled for this project.");
  }

  if (config.provider === "off") {
    throw new AiProviderError("AI provider is disabled.");
  }

  if (config.provider !== "groq") {
    throw new AiProviderError("AI provider is not supported.");
  }

  const payload = await postGroqChatCompletion(
    config,
    resolved as ResolvedReviewRequest<ReviewPayload | InvitationRefinement>,
  );

  return {
    config,
    payload,
  };
}

export async function runAiReview(request: AiReviewRequest): Promise<AiReviewResponse> {
  if (request.target === "sharpen-invitation") {
    const resolved = resolveInvitationRequest(request);

    try {
      const result = await runWithGroq(resolved);

      return {
        model: result.config.model,
        providerId: "groq",
        providerLabel: "Groq AI review",
        refinement: normalizeInvitationRefinement(result.payload, resolved.fallback),
        source: "ai",
        target: resolved.target,
      };
    } catch (error) {
      return fallbackInvitationResponse(
        resolved,
        error instanceof Error ? error.message : "AI invitation refinement failed.",
      );
    }
  }

  const resolved = resolveReviewRequest(request);

  try {
    const result = await runWithGroq(resolved);
    const review =
      resolved.target === "block"
        ? normalizeBlockReview(result.payload, resolved.fallback as ReviewInsight)
        : normalizeAggregateReview(
            result.payload,
            resolved.fallback as SectionReviewInsight | WorkshopReviewInsight,
          );

    return {
      model: result.config.model,
      providerId: "groq",
      providerLabel: "Groq AI review",
      review,
      source: "ai",
      target: resolved.target,
    };
  } catch (error) {
    return fallbackReviewResponse(
      resolved,
      error instanceof Error ? error.message : "AI review failed.",
    );
  }
}

export { AiReviewRequestError };
