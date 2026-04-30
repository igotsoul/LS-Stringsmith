"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useAiReviewRuntime } from "@/components/providers/ai-review-provider";
import { useProjectStore } from "@/components/providers/project-store-provider";
import {
  buildProjectPulse,
  buildSetupHotspots,
} from "@/domain/workshop/project-selectors";
import { getRuntimeCapabilities } from "@/domain/workshop/runtime-capabilities";
import type { WorkshopSection } from "@/domain/workshop/types";

type SetupStepId = "goal" | "frame" | "dynamics" | "review";

const setupSteps: Array<{
  id: SetupStepId;
  label: string;
  kicker: string;
}> = [
  { id: "goal", label: "Goal", kicker: "Purpose" },
  { id: "frame", label: "Frame", kicker: "Room" },
  { id: "dynamics", label: "Group", kicker: "Dynamics" },
  { id: "review", label: "Review", kicker: "Ready" },
];

const formatChoices = ["Onsite", "Online", "Hybrid"];
const languageChoices = ["English", "German", "Bilingual"];
const energyChoices = ["Low", "Medium", "High"];
const trustChoices = ["Low", "Growing", "Established", "Unknown"];
const conflictChoices = ["Low", "Moderate", "High"];
const decisionChoices = ["Explore options", "Align direction", "Practical agreements", "Make decisions"];

function prepLevelWidth(level: "Light" | "Medium" | "Deep") {
  if (level === "Light") {
    return "34%";
  }

  if (level === "Medium") {
    return "62%";
  }

  return "100%";
}

type WorkshopDurationInput = {
  days: number;
  hours: number;
};

function hasReadyValue(value?: string) {
  return Boolean(value?.trim());
}

function countReadyFields(values: Array<string | undefined>) {
  return values.filter(hasReadyValue).length;
}

function parseDecimalInput(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDays(value: number) {
  return Math.max(0, Math.floor(value));
}

function normalizeHours(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, "");
}

function parseWorkshopDuration(durationLabel?: string): WorkshopDurationInput {
  const label = durationLabel?.trim().toLowerCase();

  if (!label) {
    return { days: 0, hours: 0 };
  }

  const dayMatch = label.match(/(\d+(?:[.,]\d+)?)\s*(?:day|days|tag|tage|d)\b/);
  const hourMatch = label.match(
    /(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|hour|hours|stunde|stunden)\b/,
  );
  const minuteMatch = label.match(/(\d+(?:[.,]\d+)?)\s*(?:min|minute|minutes|minuten)\b/);
  const fallbackNumberMatch = label.match(/(\d+(?:[.,]\d+)?)/);

  return {
    days: normalizeDays(dayMatch ? parseDecimalInput(dayMatch[1]) : 0),
    hours: normalizeHours(
      hourMatch
        ? parseDecimalInput(hourMatch[1])
        : minuteMatch
          ? parseDecimalInput(minuteMatch[1]) / 60
          : !dayMatch && fallbackNumberMatch
            ? parseDecimalInput(fallbackNumberMatch[1])
            : 0,
    ),
  };
}

function formatWorkshopDuration(duration: WorkshopDurationInput) {
  const days = normalizeDays(duration.days);
  const hours = normalizeHours(duration.hours);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }

  if (hours > 0) {
    parts.push(`${formatDecimal(hours)} hr${hours === 1 ? "" : "s"}`);
  }

  return parts.join(", ");
}

function parseParticipantCount(participantsLabel: string) {
  const match = participantsLabel.match(/\d+/);
  const parsed = match ? Number(match[0]) : 1;

  return Number.isFinite(parsed) ? Math.max(1, Math.round(parsed)) : 1;
}

function formatParticipantCount(count: number) {
  const normalizedCount = Math.max(1, Math.round(count));

  return `${normalizedCount} participant${normalizedCount === 1 ? "" : "s"}`;
}

type StoryDayGroup = {
  dayLabel: string;
  sections: WorkshopSection[];
};

function groupSectionsByDay(sections: WorkshopSection[]) {
  const groups = new Map<string, StoryDayGroup>();

  sections.forEach((section) => {
    const dayLabel = section.dayLabel || "Day 1";
    const group = groups.get(dayLabel);

    if (group) {
      group.sections.push(section);
      return;
    }

    groups.set(dayLabel, {
      dayLabel,
      sections: [section],
    });
  });

  return Array.from(groups.values());
}

function getNextDayLabel(sections: WorkshopSection[]) {
  const highestDay = sections.reduce((highest, section) => {
    const match = section.dayLabel.match(/day\s+(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `Day ${highestDay + 1}`;
}

function SetupControlIcon({ icon }: { icon: "duplicate" | "minus" | "plus" | "trash" }) {
  if (icon === "duplicate") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M8.25 8.25h8.5v8.5h-8.5v-8.5ZM5.25 5.25h8.5v8.5"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "trash") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M9 4.75h6M5.75 7.25h12.5M10 10.25v6.5M14 10.25v6.5M7.75 7.25l.6 9.15a2 2 0 0 0 2 1.85h3.3a2 2 0 0 0 2-1.85l.6-9.15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "minus") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path d="M6.75 12h10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5.75v12.5M6.75 12h10.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function SetupScreen() {
  const {
    addSection,
    activeProjectId,
    duplicateSection,
    project,
    removeSection,
    removeSections,
    storageMode,
    toggleAi,
    updateProject,
    updateSection,
  } = useProjectStore();
  const { runtime: aiReviewRuntime } = useAiReviewRuntime();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const projectPulse = buildProjectPulse(project);
  const setupHotspots = buildSetupHotspots(project);
  const storyDayGroups = useMemo(() => groupSectionsByDay(project.sections), [project.sections]);
  const canRemoveDay = storyDayGroups.length > 1;
  const runtime = useMemo(
    () => getRuntimeCapabilities(project, storageMode, aiReviewRuntime),
    [aiReviewRuntime, project, storageMode],
  );
  const activeProjectHref = `/project/${encodeURIComponent(activeProjectId)}`;
  const activeStep = setupSteps[activeStepIndex] ?? setupSteps[0];
  const workshopDuration = parseWorkshopDuration(project.durationLabel);
  const workshopDurationLabel =
    formatWorkshopDuration(workshopDuration) || project.durationLabel || "Not set";
  const participantCount = parseParticipantCount(project.participantsLabel);
  const setupReadiness = [
    { label: "Title", ready: hasReadyValue(project.title) },
    { label: "Purpose", ready: hasReadyValue(project.globalPurpose) },
    { label: "Context", ready: hasReadyValue(project.context) },
    { label: "Duration", ready: hasReadyValue(project.durationLabel) },
    { label: "Participants", ready: hasReadyValue(project.participantsLabel) },
    { label: "Format", ready: hasReadyValue(project.format) },
    { label: "Audience", ready: hasReadyValue(project.targetAudience) },
    { label: "Desired feel", ready: hasReadyValue(project.desiredFeel) },
  ];
  const missingReadiness = setupReadiness.filter((item) => !item.ready);
  const readyReadiness = setupReadiness.filter((item) => item.ready);
  const readyFieldCount = countReadyFields([
    project.title,
    project.globalPurpose,
    project.context,
    project.durationLabel,
    project.participantsLabel,
    project.format,
    project.targetAudience,
    project.desiredFeel,
  ]);
  const setupStepCompletion: Record<SetupStepId, boolean> = {
    goal: countReadyFields([project.title, project.globalPurpose, project.context]) === 3,
    frame:
      countReadyFields([
        project.durationLabel,
        project.participantsLabel,
        project.format,
      ]) === 3,
    dynamics: countReadyFields([project.targetAudience, project.desiredFeel]) === 2,
    review: project.sections.length > 0,
  };

  function goToNextStep() {
    setActiveStepIndex((current) => Math.min(current + 1, setupSteps.length - 1));
  }

  function goToPreviousStep() {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleAddDay() {
    addSection({
      afterSectionId: project.sections.at(-1)?.id ?? null,
      values: { dayLabel: getNextDayLabel(project.sections) },
    });
  }

  function handleAddSectionToDay(group: StoryDayGroup) {
    addSection({
      afterSectionId: group.sections.at(-1)?.id ?? null,
      values: { dayLabel: group.dayLabel },
    });
  }

  function handleRemoveDay(group: StoryDayGroup) {
    if (!canRemoveDay) {
      return;
    }

    if (window.confirm(`Delete ${group.dayLabel} and its ${group.sections.length} section(s)?`)) {
      removeSections(group.sections.map((section) => section.id));
    }
  }

  function handleRemoveSection(section: WorkshopSection) {
    if (project.sections.length <= 1) {
      return;
    }

    if (window.confirm(`Delete "${section.title}"?`)) {
      removeSection(section.id);
    }
  }

  function updateWorkshopDuration(values: Partial<WorkshopDurationInput>) {
    const durationLabel = formatWorkshopDuration({
      ...workshopDuration,
      ...values,
    });

    updateProject({ durationLabel: durationLabel || undefined });
  }

  function updateParticipantCount(count: number) {
    updateProject({ participantsLabel: formatParticipantCount(count) });
  }

  return (
    <section className="screen-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workshop setup</p>
          <h2>Frame the workshop before the builder starts making decisions.</h2>
        </div>
        <Link className="primary-button" href={`${activeProjectHref}/builder`}>
          Continue to builder
        </Link>
      </div>

      <div className="setup-layout setup-wizard-layout">
        <div className="setup-main paper-surface">
          <nav className="setup-stepper" aria-label="Setup steps">
            {setupSteps.map((step, index) => (
              <button
                key={step.id}
                aria-current={activeStep.id === step.id ? "step" : undefined}
                className={`setup-step-button ${
                  activeStep.id === step.id ? "is-active" : ""
                } ${setupStepCompletion[step.id] ? "is-complete" : ""}`}
                onClick={() => setActiveStepIndex(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <small>{step.kicker}</small>
              </button>
            ))}
          </nav>

          <div className="setup-panel">
            {activeStep.id === "goal" ? (
              <>
                <div className="setup-panel-head">
                  <p className="eyebrow">Goal and occasion</p>
                  <h3>Start with the reason this room exists.</h3>
                </div>

                <div className="setup-form-grid">
                  <div className="field-group">
                    <label>Workshop title</label>
                    <input
                      onChange={(event) => updateProject({ title: event.target.value })}
                      value={project.title}
                    />
                  </div>
                  <div className="field-group">
                    <label>Purpose</label>
                    <textarea
                      onChange={(event) =>
                        updateProject({ globalPurpose: event.target.value })
                      }
                      rows={5}
                      value={project.globalPurpose}
                    />
                  </div>
                  <div className="field-group setup-form-wide">
                    <label>Context</label>
                    <textarea
                      onChange={(event) => updateProject({ context: event.target.value })}
                      rows={5}
                      value={project.context}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {activeStep.id === "frame" ? (
              <>
                <div className="setup-panel-head">
                  <p className="eyebrow">Workshop frame</p>
                  <h3>Make the constraints explicit enough to guide choices.</h3>
                </div>

                <div className="setup-form-grid">
                  <div className="field-group">
                    <label>Duration</label>
                    <div className="duration-input-grid">
                      <div className="duration-unit-field">
                        <input
                          aria-label="Workshop duration in days"
                          className="duration-number-input"
                          min="0"
                          onChange={(event) =>
                            updateWorkshopDuration({
                              days: normalizeDays(
                                event.target.value ? parseDecimalInput(event.target.value) : 0,
                              ),
                            })
                          }
                          placeholder="0"
                          step="1"
                          type="number"
                          value={workshopDuration.days || ""}
                        />
                        <span>Days</span>
                      </div>
                      <div className="duration-unit-field">
                        <input
                          aria-label="Workshop duration in hours"
                          className="duration-number-input"
                          min="0"
                          onChange={(event) =>
                            updateWorkshopDuration({
                              hours: normalizeHours(
                                event.target.value ? parseDecimalInput(event.target.value) : 0,
                              ),
                            })
                          }
                          placeholder="0"
                          step="0.5"
                          type="number"
                          value={workshopDuration.hours || ""}
                        />
                        <span>Hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Participants</label>
                    <div className="number-stepper" role="group" aria-label="Participants">
                      <button
                        aria-label="Decrease participants"
                        className="tiny-button section-icon-button"
                        disabled={participantCount <= 1}
                        onClick={() => updateParticipantCount(participantCount - 1)}
                        title="Decrease participants"
                        type="button"
                      >
                        <SetupControlIcon icon="minus" />
                      </button>
                      <input
                        className="participant-number-input"
                        min="1"
                        onChange={(event) =>
                          updateParticipantCount(
                            event.target.value ? Number(event.target.value) : 1,
                          )
                        }
                        step="1"
                        type="number"
                        value={participantCount}
                      />
                      <button
                        aria-label="Increase participants"
                        className="tiny-button section-icon-button"
                        onClick={() => updateParticipantCount(participantCount + 1)}
                        title="Increase participants"
                        type="button"
                      >
                        <SetupControlIcon icon="plus" />
                      </button>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Format</label>
                    <div className="choice-row" role="group" aria-label="Format">
                      {formatChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.format === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ format: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Language</label>
                    <div className="choice-row" role="group" aria-label="Language">
                      {languageChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.language === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ language: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group setup-form-wide">
                    <label>Target audience</label>
                    <input
                      onChange={(event) =>
                        updateProject({ targetAudience: event.target.value })
                      }
                      value={project.targetAudience}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {activeStep.id === "dynamics" ? (
              <>
                <div className="setup-panel-head">
                  <p className="eyebrow">Group dynamics</p>
                  <h3>Calibrate the room before selecting structures.</h3>
                </div>

                <div className="setup-form-grid">
                  <div className="field-group setup-form-wide">
                    <label>Desired feel</label>
                    <input
                      onChange={(event) =>
                        updateProject({ desiredFeel: event.target.value })
                      }
                      value={project.desiredFeel}
                    />
                  </div>
                  <div className="field-group">
                    <label>Energy</label>
                    <div className="choice-row" role="group" aria-label="Energy">
                      {energyChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.energyLevel === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ energyLevel: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Trust</label>
                    <div className="choice-row" role="group" aria-label="Trust">
                      {trustChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.trustLevel === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ trustLevel: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Conflict</label>
                    <div className="choice-row" role="group" aria-label="Conflict">
                      {conflictChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.conflictLevel === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ conflictLevel: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Decision need</label>
                    <div className="choice-row" role="group" aria-label="Decision need">
                      {decisionChoices.map((choice) => (
                        <button
                          key={choice}
                          className={`choice-button ${
                            project.decisionNeed === choice ? "is-active" : ""
                          }`}
                          onClick={() => updateProject({ decisionNeed: choice })}
                          type="button"
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {activeStep.id === "review" ? (
              <>
                <div className="setup-panel-head">
                  <p className="eyebrow">Review</p>
                  <h3>Check the frame and adjust the story arc.</h3>
                </div>

                <div className="setup-review-grid">
                  <div className="setup-review-card">
                    <span>Title</span>
                    <strong>{project.title}</strong>
                  </div>
                  <div className="setup-review-card">
                    <span>Duration</span>
                    <strong>{workshopDurationLabel}</strong>
                  </div>
                  <div className="setup-review-card">
                    <span>People</span>
                    <strong>{project.participantsLabel}</strong>
                  </div>
                  <div className="setup-review-card">
                    <span>Format</span>
                    <strong>{project.format}</strong>
                  </div>
                </div>

                <div className="setup-review-insights">
                  <div className="setup-insight-card">
                    <p className="eyebrow">Facilitation pulse</p>
                    <h3>Prep depth is concentrated in a few high-value places.</h3>
                    <ul className="summary-list">
                      {projectPulse.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="setup-insight-card">
                    <div className="prep-map-head">
                      <div>
                        <p className="eyebrow">Prep hotspots</p>
                        <h3>Scored from chain complexity, group risk, and readiness.</h3>
                      </div>
                      <span className="prep-scale-label">light -&gt; deep</span>
                    </div>

                    <div className="prep-section-list">
                      {setupHotspots.map((hotspot) => (
                        <div key={hotspot.sectionId} className="prep-section-row">
                          <div className="prep-section-copy">
                            <strong>{hotspot.title}</strong>
                            <p>{hotspot.detail}</p>
                          </div>
                          <div className="prep-section-side">
                            <span className="prep-level">{hotspot.prepLevel}</span>
                            <div className="prep-meter" aria-hidden="true">
                              <span
                                className="prep-fill"
                                style={{ width: prepLevelWidth(hotspot.prepLevel) }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="storyboard-card">
                  <div className="section-list-head">
                    <div>
                      <p className="eyebrow">Story arc</p>
                      <h3>Map the workshop into meaningful modules.</h3>
                    </div>
                    <div className="section-list-actions">
                      <button
                        className="secondary-button button-with-icon"
                        onClick={() => addSection()}
                        type="button"
                      >
                        <SetupControlIcon icon="plus" />
                        <span>Add section</span>
                      </button>
                      <button
                        className="secondary-button button-with-icon"
                        onClick={handleAddDay}
                        type="button"
                      >
                        <SetupControlIcon icon="plus" />
                        <span>Add day</span>
                      </button>
                    </div>
                  </div>

                  <div className="storyboard-lane">
                    {storyDayGroups.map((group, groupIndex) => (
                      <div
                        key={group.dayLabel}
                        className={`story-day-group ${groupIndex % 2 === 1 ? "is-accent" : ""}`}
                      >
                        <div className="story-day-rail" aria-label={`${group.dayLabel} lane`}>
                          <span className="story-day-label">{group.dayLabel}</span>
                          <span className="story-day-line" aria-hidden="true" />
                          <div className="story-day-controls">
                            <button
                              aria-label={`Add section to ${group.dayLabel}`}
                              className="tiny-button section-icon-button"
                              onClick={() => handleAddSectionToDay(group)}
                              title={`Add section to ${group.dayLabel}`}
                              type="button"
                            >
                              <SetupControlIcon icon="plus" />
                            </button>
                            <button
                              aria-label={`Delete ${group.dayLabel}`}
                              className="tiny-button tiny-button-danger section-icon-button"
                              disabled={!canRemoveDay}
                              onClick={() => handleRemoveDay(group)}
                              title={`Delete ${group.dayLabel}`}
                              type="button"
                            >
                              <SetupControlIcon icon="trash" />
                            </button>
                          </div>
                        </div>
                        <div className="story-day-sections">
                          {group.sections.map((section) => (
                            <div
                              key={section.id}
                              className={`story-section-card ${
                                groupIndex % 2 === 1 ? "is-accent" : ""
                              }`}
                            >
                              <div className="setup-section-index">{section.indexLabel}</div>
                              <div className="setup-section-copy">
                                <div className="story-section-card-head">
                                  <input
                                    className="story-section-title-input"
                                    onChange={(event) =>
                                      updateSection(section.id, { title: event.target.value })
                                    }
                                    value={section.title}
                                  />
                                  <div
                                    className="story-section-actions"
                                    aria-label={`${section.title} actions`}
                                  >
                                    <button
                                      aria-label={`Duplicate ${section.title}`}
                                      className="tiny-button section-icon-button"
                                      onClick={() => duplicateSection(section.id)}
                                      title="Duplicate section"
                                      type="button"
                                    >
                                      <SetupControlIcon icon="duplicate" />
                                    </button>
                                    <button
                                      aria-label={`Delete ${section.title}`}
                                      className="tiny-button tiny-button-danger section-icon-button"
                                      disabled={project.sections.length <= 1}
                                      onClick={() => handleRemoveSection(section)}
                                      title="Delete section"
                                      type="button"
                                    >
                                      <SetupControlIcon icon="trash" />
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  className="story-section-subgoal-input"
                                  onChange={(event) =>
                                    updateSection(section.id, { subgoal: event.target.value })
                                  }
                                  rows={3}
                                  value={section.subgoal}
                                />
                                <p className="story-section-meta">{section.storyMeta}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {storyDayGroups.length === 0 ? (
                      <div className="story-empty-state">
                        <p>No sections yet.</p>
                        <button
                          className="secondary-button button-with-icon"
                          onClick={() => addSection()}
                          type="button"
                        >
                          <SetupControlIcon icon="plus" />
                          <span>Add section</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}

            <div className="setup-step-actions">
              <button
                className="secondary-button"
                disabled={activeStepIndex === 0}
                onClick={goToPreviousStep}
                type="button"
              >
                Back
              </button>
              {activeStepIndex < setupSteps.length - 1 ? (
                <button className="primary-button" onClick={goToNextStep} type="button">
                  Next
                </button>
              ) : (
                <Link className="primary-button" href={`${activeProjectHref}/builder`}>
                  Open builder
                </Link>
              )}
            </div>
          </div>
        </div>

        <aside className="setup-side">
          <div className="paper-card setup-live-summary">
            <p className="eyebrow">Live summary</p>
            <h3>{readyFieldCount}/8 framing signals set.</h3>
            <div className="setup-summary-grid">
              <span>Duration</span>
              <strong>{workshopDurationLabel}</strong>
              <span>Participants</span>
              <strong>{project.participantsLabel}</strong>
              <span>Format</span>
              <strong>{project.format}</strong>
              <span>Decision need</span>
              <strong>{project.decisionNeed ?? "Not set"}</strong>
            </div>

            <div className="setup-readiness">
              <div className="setup-readiness-block">
                <div className="setup-readiness-head">
                  <span>Missing</span>
                  <strong>{missingReadiness.length}</strong>
                </div>
                <ul className="setup-readiness-list">
                  {missingReadiness.length > 0 ? (
                    missingReadiness.map((item) => (
                      <li key={item.label} className="is-missing">
                        {item.label}
                      </li>
                    ))
                  ) : (
                    <li className="is-ready">None</li>
                  )}
                </ul>
              </div>

              <div className="setup-readiness-block">
                <div className="setup-readiness-head">
                  <span>Ready</span>
                  <strong>{readyReadiness.length}</strong>
                </div>
                <ul className="setup-readiness-list">
                  {readyReadiness.map((item) => (
                    <li key={item.label} className="is-ready">
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="setup-summary-ai">
              <div>
                <span>AI assistance</span>
                <strong>{project.aiEnabled ? "Enabled" : "Disabled"}</strong>
                <p>{runtime.reviewAvailabilityLabel}</p>
              </div>
              <label className="switch">
                <input checked={project.aiEnabled} onChange={() => toggleAi()} type="checkbox" />
                <span />
              </label>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
