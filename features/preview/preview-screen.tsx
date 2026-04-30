"use client";

import { useEffect, useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import { useAiReviewRuntime } from "@/components/providers/ai-review-provider";
import { useProjectStore } from "@/components/providers/project-store-provider";
import { getInspectableEntry } from "@/domain/workshop/demo-project";
import { exportProjectMarkdown } from "@/domain/workshop/export-markdown";
import { getReviewProvider } from "@/domain/workshop/review-provider";
import type { WorkshopReviewInsight } from "@/domain/workshop/review";
import {
  buildPreviewFocus,
  buildPreviewWarnings,
} from "@/domain/workshop/project-selectors";
import { getRuntimeCapabilities } from "@/domain/workshop/runtime-capabilities";
import { useAiReview } from "@/features/reviews/use-ai-review";
import { downloadFile } from "@/lib/download-file";
import type { BlockItem, WorkshopProject, WorkshopSection } from "@/domain/workshop/types";

type PreviewRunItem = {
  id: string;
  sectionId: string;
  sectionTitle: string;
  title: string;
  durationLabel: string;
  kind: "block" | "transition";
  primaryText: string;
  facilitatorCue?: string;
  meta: string;
  warning?: string;
};

function stripStepIndex(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function buildPreviewRunItems(project: WorkshopProject): PreviewRunItem[] {
  return project.sections.flatMap((section) =>
    section.items.map((item) => {
      if (item.kind === "transition") {
        return {
          id: item.id,
          sectionId: section.id,
          sectionTitle: section.title,
          title: "Transition",
          durationLabel: item.durationLabel,
          kind: "transition",
          primaryText: item.note,
          meta: `${section.indexLabel} · Bridge`,
        } satisfies PreviewRunItem;
      }

      const entry = getInspectableEntry(item.entryId);
      const block = item as BlockItem;

      return {
        id: item.id,
        sectionId: section.id,
        sectionTitle: section.title,
        title: entry.title,
        durationLabel: block.durationLabel,
        kind: "block",
        primaryText: block.invitation,
        facilitatorCue: block.facilitatorCue,
        meta: `${section.indexLabel} · ${entry.libraryGroupSize ?? "Group"} · ${entry.libraryCategoryLabel ?? entry.typeLabel}`,
        warning: block.warning,
      } satisfies PreviewRunItem;
    }),
  );
}

function renderSection(
  project: { sections: WorkshopSection[] },
  section: WorkshopSection,
  index: number,
  includeNotes: boolean,
) {
  const previous = project.sections[index - 1];
  const startsNewDay = previous && previous.dayLabel !== section.dayLabel;

  if (section.status === "draft") {
    return (
      <div
        key={section.id}
        className={`manual-section manual-section-draft ${startsNewDay ? "manual-section-new-day" : ""}`}
      >
        <div className="manual-section-top">
          <div>
            <div className="manual-divider">{section.dayLabel}</div>
            <h4>
              Section {section.indexLabel} · {section.title}
            </h4>
          </div>
          <p className="manual-section-focus">Prep focus: {section.prepNote}</p>
        </div>
        <p className="manual-intro">{section.subgoal}</p>
        <div className="manual-draft-callout">
          <strong>Draft section</strong>
          <p>
            Planned shape: short input -&gt; agreement-making structure -&gt;
            closing reflection. The closing block is not selected yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      key={section.id}
      className={`manual-section ${startsNewDay ? "manual-section-new-day" : ""}`}
    >
      <div className="manual-section-top">
        <div>
          <div className="manual-divider">{section.dayLabel}</div>
          <h4>
            Section {section.indexLabel} · {section.title}
          </h4>
        </div>
        <p className="manual-section-focus">Prep focus: {section.prepNote}</p>
      </div>
      <p className="manual-intro">{section.subgoal}</p>

      {section.items.map((item) => {
        const entry = getInspectableEntry(item.entryId);

        if (item.kind === "transition") {
          return (
            <div key={item.id} className="manual-transition">
              <strong>Transition</strong>
              <p>{item.note}</p>
            </div>
          );
        }

        const block = item as BlockItem;

        const steps = block.steps ?? entry.steps;
        const stepsWithPrompts =
          steps?.filter((step) => step.prompt || step.facilitatorCue) ?? [];

        if (block.showDetailedSteps && steps?.length) {
          return (
            <div key={item.id} className="manual-step manual-step-detailed">
              <div className="manual-step-head">
                <strong>{entry.title}</strong>
                <span>{block.durationLabel}</span>
              </div>
              <div className="manual-step-copy">
                <p>
                  Core move: {block.invitation}
                </p>
                {includeNotes && block.facilitatorCue ? (
                  <p className="manual-facilitator-note">
                    Facilitator cue: {block.facilitatorCue}
                  </p>
                ) : null}
              </div>
              <div className="manual-substeps">
                {steps.map((step, stepIndex) => (
                  <div key={step.title} className="manual-substep">
                    <span>{stepIndex + 1}.</span>
                    <div>
                      <strong>{stripStepIndex(step.title)}</strong>
                      {step.prompt ? <p>Prompt: {step.prompt}</p> : null}
                      <p className="manual-subcue">Cue: {step.facilitatorCue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={item.id} className="manual-step">
            <strong>{entry.title}</strong>
            <span>{block.durationLabel}</span>
            <div className="manual-step-copy">
              <p>Invitation: {block.invitation}</p>
              {block.flowSummary ? (
                <div className="manual-flow-glance">
                  <span>Flow</span>
                  <p>{block.flowSummary}</p>
                </div>
              ) : null}
              {includeNotes && block.facilitatorCue ? (
                <p className="manual-facilitator-note">
                  Facilitator cue: {block.facilitatorCue}
                </p>
              ) : null}
              {includeNotes && stepsWithPrompts.length ? (
                <div className="manual-subprompt-list">
                  <span className="manual-subprompt-kicker">Step prompts</span>
                  <div className="manual-subprompt-stack">
                    {stepsWithPrompts.map((step, stepIndex) => (
                      <div key={step.title} className="manual-subprompt-item">
                        <span>{stepIndex + 1}.</span>
                        <div>
                          <strong>{stripStepIndex(step.title)}</strong>
                          {step.prompt ? <p>Prompt: {step.prompt}</p> : null}
                          {step.facilitatorCue ? (
                            <p className="manual-subcue">Cue: {step.facilitatorCue}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {includeNotes && block.warning ? (
                <p className="manual-facilitator-note manual-facilitator-warning">
                  Review note: {block.warning}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PreviewScreen() {
  const { project, storageMode } = useProjectStore();
  const { runtime: aiReviewRuntime } = useAiReviewRuntime();
  const [activeRunItemId, setActiveRunItemId] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [facilitatorNotes, setFacilitatorNotes] = useState("");
  const [includeNotesInScript, setIncludeNotesInScript] = useState(true);
  const previewWarnings = buildPreviewWarnings(project);
  const previewFocus = buildPreviewFocus(project);
  const runItems = useMemo(() => buildPreviewRunItems(project), [project]);
  const activeRunIndex = Math.max(
    0,
    runItems.findIndex((item) => item.id === activeRunItemId),
  );
  const activeRunItem = runItems[activeRunIndex] ?? runItems[0] ?? null;
  const runtime = useMemo(
    () => getRuntimeCapabilities(project, storageMode, aiReviewRuntime),
    [aiReviewRuntime, project.aiEnabled, storageMode],
  );
  const reviewProvider = useMemo(() => getReviewProvider(project), [project.aiEnabled]);
  const workshopReviewFallback = useMemo(
    () => reviewProvider.reviewWorkshop(project),
    [project, reviewProvider],
  );
  const workshopReviewState = useAiReview<WorkshopReviewInsight>({
    enabled: project.aiEnabled,
    fallbackProviderLabel: runtime.reviewProviderLabel,
    fallbackReview: workshopReviewFallback,
    request: {
      project,
      target: "workshop",
    },
  });
  const workshopReview = workshopReviewState.review;

  useEffect(() => {
    if (!runItems.length) {
      setActiveRunItemId("");
      return;
    }

    if (!activeRunItemId || !runItems.some((item) => item.id === activeRunItemId)) {
      setActiveRunItemId(runItems[0].id);
    }
  }, [activeRunItemId, runItems]);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  function selectRelativeRunItem(offset: number) {
    if (!runItems.length) {
      return;
    }

    const nextIndex = Math.min(Math.max(activeRunIndex + offset, 0), runItems.length - 1);
    setActiveRunItemId(runItems[nextIndex].id);
  }

  return (
    <section className="screen-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Preview studio</p>
          <h2>Run the workshop flow, then print the facilitator script.</h2>
        </div>
        <div className="header-actions">
          <label className="script-note-toggle">
            <input
              checked={includeNotesInScript}
              onChange={(event) => setIncludeNotesInScript(event.target.checked)}
              type="checkbox"
            />
            <span>Notes in script</span>
          </label>
          <button className="secondary-button" onClick={() => window.print()} type="button">
            Print / Save PDF
          </button>
          <button
            className="primary-button"
            onClick={() =>
              downloadFile(
                exportProjectMarkdown(project),
                `${project.id}-manual.md`,
                "text/markdown;charset=utf-8",
              )
            }
            type="button"
          >
            Export Markdown
          </button>
        </div>
      </div>

      <div className="preview-live-shell">
        <div className="preview-timer-bar">
          <div>
            <span className="preview-timer-label">Timer</span>
            <strong>{formatTimer(timerSeconds)}</strong>
          </div>
          <div className="preview-timer-actions">
            <button
              className="tiny-button"
              onClick={() => setTimerRunning((current) => !current)}
              type="button"
            >
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button
              className="tiny-button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        <article className="paper-surface preview-current-step">
          {activeRunItem ? (
            <>
              <div className="preview-current-head">
                <div>
                  <p className="eyebrow">Current step</p>
                  <h3>{activeRunItem.title}</h3>
                </div>
                <span className="preview-step-duration">{activeRunItem.durationLabel}</span>
              </div>
              <p className="preview-step-meta">
                {activeRunItem.sectionTitle} · {activeRunItem.meta}
              </p>
              <div className="preview-instruction-card">
                <span>{activeRunItem.kind === "transition" ? "Bridge" : "Invitation"}</span>
                <p>{activeRunItem.primaryText}</p>
              </div>
              {activeRunItem.facilitatorCue ? (
                <p className="preview-facilitator-cue">
                  {activeRunItem.facilitatorCue}
                </p>
              ) : null}
              {activeRunItem.warning ? (
                <p className="preview-warning-line">{activeRunItem.warning}</p>
              ) : null}
              <div className="preview-step-controls">
                <button
                  className="secondary-button"
                  disabled={activeRunIndex === 0}
                  onClick={() => selectRelativeRunItem(-1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="primary-button"
                  disabled={activeRunIndex >= runItems.length - 1}
                  onClick={() => selectRelativeRunItem(1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="preview-instruction-card">
              <span>No steps</span>
              <p>Add structures in the builder before using preview mode.</p>
            </div>
          )}
        </article>

        <aside className="paper-surface preview-agenda-panel">
          <p className="eyebrow">Agenda</p>
          <div className="preview-agenda-list">
            {runItems.map((item, index) => (
              <button
                key={item.id}
                className={`preview-agenda-item ${
                  activeRunItem?.id === item.id ? "is-active" : ""
                }`}
                onClick={() => setActiveRunItemId(item.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
                <small>{item.durationLabel}</small>
              </button>
            ))}
          </div>
        </aside>

        <details className="paper-surface preview-notes-panel">
          <summary>Facilitator notes</summary>
          <textarea
            onChange={(event) => setFacilitatorNotes(event.target.value)}
            placeholder="Add notes for the live run."
            rows={5}
            value={facilitatorNotes}
          />
        </details>
      </div>

      <div className="preview-layout">
        <aside className="preview-side-stack">
          {project.aiEnabled ? (
            <div className="review-card preview-review-card">
              <p className="eyebrow">Workshop review</p>
              <p className="review-provider-line">{workshopReviewState.providerLabel}</p>
              <div className="review-head">
                <StatusPill tone={workshopReview.tone}>{workshopReview.label}</StatusPill>
                <span className="review-score">{workshopReview.score}</span>
              </div>
              <p>{workshopReview.summary}</p>
              {workshopReview.highlights.length ? (
                <div className="review-list-block">
                  <span className="review-list-label">Highlights</span>
                  <ul className="review-list">
                    {workshopReview.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {workshopReview.suggestions.length ? (
                <div className="review-list-block">
                  <span className="review-list-label">Suggestions</span>
                  <ul className="review-list">
                    {workshopReview.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="paper-card preview-ai-muted-card">
              <p className="eyebrow">AI assistance paused</p>
              <h3>Workshop review is hidden in preview while AI is off.</h3>
              <p>{runtime.reviewDisabledNote}</p>
            </div>
          )}

          <div className="paper-card">
            <p className="eyebrow">Soft warnings</p>
            <ul className="summary-list">
              {previewWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>

          <div className="paper-card preview-focus-card">
            <p className="eyebrow">Facilitation focus</p>
            <h3>Deeper prep is concentrated in a few high-value moments.</h3>
            <div className="focus-list">
              {previewFocus.map((item) => (
                <div key={item.title} className="focus-item">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

        </aside>

        <main className="preview-script-stack">
          <div className="script-preview-head">
            <div>
              <p className="eyebrow">Script preview</p>
              <h3>Facilitator run sheet</h3>
            </div>
            <span className="meta-note">
              {includeNotesInScript ? "Notes included" : "Notes hidden"}
            </span>
          </div>

        <article className="manual-document">
          <div className="manual-header">
            <p className="eyebrow">Workshop manual</p>
            <h3>{project.title}</h3>
            <p>{project.globalPurpose}</p>
            <div className="manual-header-meta">
              <span>{project.durationLabel ?? "Duration open"}</span>
              <span>{project.format}</span>
              <span>{project.participantsLabel}</span>
              <span>{project.language}</span>
              <span>Detailed where needed</span>
            </div>
            {project.aiEnabled ? (
              <div className="manual-top-review">
                <StatusPill tone={workshopReview.tone}>{workshopReview.label}</StatusPill>
                <span className="manual-review-score">{workshopReview.score}</span>
                <p>{workshopReview.summary}</p>
              </div>
            ) : null}
          </div>

          <div className="manual-print-cover print-only">
            <div className="manual-print-cover-top">
              <div>
                <p className="eyebrow">Print note</p>
                <h4>Facilitation run sheet</h4>
              </div>
              <span className="manual-print-stamp">
                Prepared in LS Stringsmith
              </span>
            </div>

            <div className="manual-print-meta">
              <div className="manual-print-meta-item">
                <span>Workshop</span>
                <strong>{project.title}</strong>
              </div>
              <div className="manual-print-meta-item">
                <span>Format</span>
                <strong>
                  {project.durationLabel ?? "Duration open"} · {project.format} ·{" "}
                  {project.participantsLabel} · {project.language}
                </strong>
              </div>
              <div className="manual-print-meta-item">
                <span>Purpose</span>
                <strong>{project.globalPurpose}</strong>
              </div>
            </div>

            <div className="manual-print-alerts">
              <strong>Preparation notes before final delivery</strong>
              <ul>
                {previewWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>

          {project.sections.map((section, index) =>
            renderSection(project, section, index, includeNotesInScript),
          )}
        </article>
        </main>
      </div>
    </section>
  );
}
