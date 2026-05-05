"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { useProjectStore } from "@/components/providers/project-store-provider";
import { StatusPill } from "@/components/ui/status-pill";
import {
  inspectProjectBundle,
  serializeProjectBundle,
  type ProjectBundleInspection,
} from "@/domain/workshop/project-bundle";
import { buildProjectCards } from "@/domain/workshop/project-selectors";
import { downloadFile } from "@/lib/download-file";
import {
  getAvailableProjectStorageModes,
  getClientRuntimeTarget,
  getStorageModeDetails,
  type RuntimeTarget,
} from "@/storage/projects/storage-mode";

function BundleActionIcon({ action }: { action: "download" | "import" }) {
  if (action === "download") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 4.75v9.5m0 0 3.75-3.75M12 14.25 8.25 10.5M5.75 16.25v1.25a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-1.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 19.25v-9.5m0 0 3.75 3.75M12 9.75 8.25 13.5M5.75 7.75V6.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v1.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ProjectsScreen() {
  const {
    activeProjectId,
    claimProject,
    createProject,
    deleteProject,
    duplicateProject,
    importProject,
    ownerEmail,
    project,
    projectRecords,
    releaseProjectClaim,
    renameProject,
    selectProject,
    storageMode,
    switchStorageMode,
  } = useProjectStore();
  const {
    pendingLink,
    requestMagicLink,
    runtime: authRuntime,
    session,
    signOut,
    status: authStatus,
  } = useAuth();
  const cards = buildProjectCards(projectRecords, activeProjectId, storageMode);
  const storage = getStorageModeDetails(storageMode);
  const [runtimeTarget, setRuntimeTarget] = useState<RuntimeTarget>("hosted-demo");
  const availableStorageModes = getAvailableProjectStorageModes(runtimeTarget);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importInspection, setImportInspection] = useState<ProjectBundleInspection | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importTargetProjectId, setImportTargetProjectId] = useState(activeProjectId);
  const [claimEmail, setClaimEmail] = useState("");
  const [authNotice, setAuthNotice] = useState<{
    message: string;
    tone: "info" | "success" | "warning";
  } | null>(null);
  const [magicLinkRequestStatus, setMagicLinkRequestStatus] = useState<
    "idle" | "requesting" | "sent" | "failed"
  >("idle");
  const normalizedSessionEmail = session?.email?.trim().toLowerCase() ?? null;
  const normalizedOwnerEmail = ownerEmail?.trim().toLowerCase() ?? null;
  const isClaimedBySignedInIdentity =
    Boolean(normalizedSessionEmail) && normalizedSessionEmail === normalizedOwnerEmail;
  const isClaimedByAnotherIdentity =
    Boolean(normalizedOwnerEmail) && normalizedOwnerEmail !== normalizedSessionEmail;
  const activeProjectHref = `/project/${encodeURIComponent(activeProjectId)}`;
  const deliveryLabel =
    authRuntime?.isDemoDelivery ? "Demo mail" : authRuntime?.mailProviderLabel ?? "Mail delivery";

  useEffect(() => {
    setRuntimeTarget(getClientRuntimeTarget());
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authState = searchParams.get("auth");

    if (authState === "signed-in") {
      setAuthNotice({
        message: "Magic link activated. You can now claim this server draft.",
        tone: "success",
      });
      setImportMessage("Magic link activated. You can now claim this server draft.");
      return;
    }

    if (authState === "expired-link") {
      setAuthNotice({
        message: "That magic link expired. Request a fresh one to continue.",
        tone: "warning",
      });
      setImportMessage("That magic link expired. Request a fresh one.");
      return;
    }

    if (authState === "invalid-link") {
      setAuthNotice({
        message: "That magic link is no longer valid. Request a fresh one to continue.",
        tone: "warning",
      });
      setImportMessage("That magic link is no longer valid. Request a fresh one.");
      return;
    }

    if (authState === "missing-token") {
      setAuthNotice({
        message: "The magic link was incomplete. Please request another one.",
        tone: "warning",
      });
      setImportMessage("The magic link was incomplete. Please request another one.");
    }
  }, []);

  useEffect(() => {
    if (projectRecords.some((record) => record.id === importTargetProjectId)) {
      return;
    }

    setImportTargetProjectId(activeProjectId);
  }, [activeProjectId, importTargetProjectId, projectRecords]);

  function openProject(projectId: string, surface: "setup" | "builder" | "preview" = "builder") {
    selectProject(projectId);
    router.push(`/project/${encodeURIComponent(projectId)}/${surface}`);
  }

  function handleCreateProject() {
    const nextProjectId = createProject();
    setImportMessage("Created a new project.");
    openProject(nextProjectId, "setup");
  }

  function handleRenameProject(projectId: string, currentTitle: string) {
    const nextTitle = window.prompt("Rename project", currentTitle);

    if (nextTitle === null) {
      return;
    }

    const renamed = renameProject(projectId, nextTitle);
    setImportMessage(
      renamed ? `Renamed project to "${nextTitle.trim()}".` : "Project title cannot be empty.",
    );
  }

  function handleDuplicateProject(projectId: string) {
    const nextProjectId = duplicateProject(projectId);

    if (!nextProjectId) {
      setImportMessage("Could not duplicate that project.");
      return;
    }

    setImportMessage("Duplicated project.");
    openProject(nextProjectId, "builder");
  }

  async function handleDeleteProject(projectId: string, title: string) {
    if (projectRecords.length <= 1) {
      setImportMessage("Keep at least one project in this storage mode.");
      return;
    }

    const confirmed = window.confirm(`Delete "${title}" from ${storage.label}?`);

    if (!confirmed) {
      return;
    }

    const nextActiveProjectId = await deleteProject(projectId);

    if (!nextActiveProjectId) {
      setImportMessage("Could not delete that project.");
      return;
    }

    setImportMessage(`Deleted "${title}".`);
  }

  async function handleImportFile(file: File | null) {
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const nextInspection = inspectProjectBundle(raw);
      setImportInspection(nextInspection);
      setImportFileName(file.name);
      setImportMessage(
        nextInspection.canImport
          ? `Review "${file.name}" before importing it into the ${storage.importingLabel}.`
          : `Could not prepare "${file.name}" for import.`,
      );
    } catch {
      setImportMessage("Could not import that bundle. Please check the file format.");
      setImportInspection(null);
      setImportFileName(null);
    }
  }

  return (
    <section className="screen-page">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Playful studio board</p>
          <h2>Shape workshop flows that feel thoughtful, warm, and easy to run.</h2>
          <p className="hero-text">
            Assemble Liberating Structures like modular building pieces, keep
            invitations visible, and turn the whole flow into a facilitation
            manual.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href={`${activeProjectHref}/builder`}>
              Open active builder
            </Link>
            <Link className="secondary-button" href={`${activeProjectHref}/setup`}>
              Review active setup
            </Link>
          </div>
          <div className="feedback-callout">
            <span>Feedback welcome</span>
            <p>
              This public alpha is intentionally early. Open a GitHub issue or
              send a LinkedIn note if something feels useful, confusing, or missing.
            </p>
            <a
              className="text-button"
              href="https://github.com/igotsoul/LS-Stringsmith/issues"
              rel="noreferrer"
              target="_blank"
            >
              Share feedback on GitHub
            </a>
          </div>
        </div>

        <div className="hero-orbit">
          <div className="orbit-card orbit-card-one">
            <span className="orbit-label">Purpose</span>
            <strong>Improve collaboration & communication</strong>
          </div>
          <div className="orbit-card orbit-card-two">
            <span className="orbit-label">Section</span>
            <strong>Increase psychological safety</strong>
          </div>
          <div className="orbit-card orbit-card-three">
            <span className="orbit-label">Export</span>
            <strong>Manual + Markdown + PDF</strong>
          </div>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="filter-row">
          <span className="meta-note">Current storage target: {storage.label}</span>
        </div>
        <div className="toolbar-actions">
          <input
            accept="application/json"
            className="sr-only"
            onChange={(event) => {
              void handleImportFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="secondary-button button-with-icon"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <BundleActionIcon action="import" />
            <span>Import bundle</span>
          </button>
          <button
            className="secondary-button button-with-icon"
            onClick={() =>
              downloadFile(
                serializeProjectBundle(project, {
                  exportedFrom: storageMode,
                }),
                `${project.id}-bundle.json`,
                "application/json",
              )
            }
            type="button"
          >
            <BundleActionIcon action="download" />
            <span>Download bundle</span>
          </button>
          <button
            className="primary-button project-create-button"
            onClick={handleCreateProject}
            type="button"
          >
            <span>Start new workshop</span>
          </button>
        </div>
      </div>

      {importMessage ? <p className="import-message">{importMessage}</p> : null}

      {importInspection ? (
        <div className="paper-card bundle-review-card">
          <div className="storage-runtime-head">
            <div>
              <p className="eyebrow">Import bundle review</p>
              <h3>
                {importInspection.project?.title ??
                  importFileName ??
                  "Bundle preview unavailable"}
              </h3>
            </div>
            <StatusPill
              tone={
                !importInspection.canImport
                  ? "warning"
                  : importInspection.warnings.length > 0
                    ? "info"
                    : "success"
              }
            >
              {!importInspection.canImport
                ? "Needs fixes"
                : importInspection.warnings.length > 0
                  ? "Review warnings"
                  : "Ready to import"}
            </StatusPill>
          </div>

          {importInspection.metadata ? (
            <div className="bundle-meta-grid">
              <div className="bundle-meta-cell">
                <span className="meta-note">File</span>
                <strong>{importFileName ?? "Current selection"}</strong>
              </div>
              <div className="bundle-meta-cell">
                <span className="meta-note">Schema</span>
                <strong>
                  {importInspection.schemaVersion === null
                    ? "Legacy / unknown"
                    : `v${importInspection.schemaVersion}`}
                </strong>
              </div>
              <div className="bundle-meta-cell">
                <span className="meta-note">Origin</span>
                <strong>{importInspection.metadata.exportedFrom}</strong>
              </div>
              <div className="bundle-meta-cell">
                <span className="meta-note">Exported</span>
                <strong>
                  {new Date(importInspection.metadata.exportedAt).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </div>
              <div className="bundle-meta-cell">
                <span className="meta-note">Language</span>
                <strong>{importInspection.metadata.language}</strong>
              </div>
              <div className="bundle-meta-cell">
                <span className="meta-note">Sections</span>
                <strong>
                  {importInspection.metadata.sectionCount} sections ·{" "}
                  {importInspection.metadata.blockCount} blocks ·{" "}
                  {importInspection.metadata.transitionCount} bridges
                </strong>
              </div>
            </div>
          ) : null}

          {importInspection.error ? (
            <p className="bundle-warning-copy">{importInspection.error}</p>
          ) : null}

          {importInspection.warnings.length > 0 ? (
            <ul className="bundle-warning-list">
              {importInspection.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p className="bundle-success-copy">
              The bundle looks compatible. Choose an existing project to replace,
              or import it as a separate project in {storage.importingLabel}.
            </p>
          )}

          <label className="import-target-field">
            <span className="meta-note">Replace existing project</span>
            <select
              disabled={!importInspection.canImport}
              onChange={(event) => setImportTargetProjectId(event.target.value)}
              value={importTargetProjectId}
            >
              {projectRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.project.title}
                </option>
              ))}
            </select>
          </label>

          <div className="toolbar-actions">
            <button
              className="primary-button"
              disabled={
                !importInspection.canImport ||
                !importInspection.project ||
                !projectRecords.some((record) => record.id === importTargetProjectId)
              }
              onClick={() => {
                if (!importInspection.project) {
                  return;
                }

                const importedProjectId = importProject(importInspection.project, {
                  targetProjectId: importTargetProjectId,
                });
                setImportMessage(
                  `Imported "${importInspection.project.title}" into the selected project.`,
                );
                setImportInspection(null);
                setImportFileName(null);
                openProject(importedProjectId, "builder");
              }}
              type="button"
            >
              Import into selected
            </button>
            <button
              className="secondary-button"
              disabled={!importInspection.canImport || !importInspection.project}
              onClick={() => {
                if (!importInspection.project) {
                  return;
                }

                const importedProjectId = importProject(importInspection.project, {
                  targetProjectId: null,
                });
                setImportMessage(
                  `Imported "${importInspection.project.title}" as a new project.`,
                );
                setImportInspection(null);
                setImportFileName(null);
                openProject(importedProjectId, "builder");
              }}
              type="button"
            >
              Import as new
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setImportInspection(null);
                setImportFileName(null);
                setImportMessage("Import preview dismissed.");
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="paper-card storage-runtime-card">
        <div className="storage-runtime-head">
          <div>
            <p className="eyebrow">Where should your drafts live?</p>
            <h3>Choose the mode that matches what you want to do now.</h3>
          </div>
          <StatusPill tone={storageMode === "server-persisted" ? "warning" : "success"}>
            {storage.shortLabel}
          </StatusPill>
        </div>
        <p>
          For a public demo, the safest answer is browser-only. Your draft stays
          on this device and other visitors cannot touch it.
        </p>
        <div className="storage-choice-grid">
          {availableStorageModes.map((mode) => {
            const option = getStorageModeDetails(mode);

            return (
              <button
                key={mode}
                className={`storage-choice-button ${storageMode === mode ? "is-active" : ""}`}
                onClick={() => {
                  switchStorageMode(mode);
                  setImportMessage(`Switched to ${option.label}. Showing projects saved there.`);
                }}
                type="button"
              >
                <span>{option.label}</span>
                <strong>{option.questionLabel}</strong>
                <small>{option.questionHelp}</small>
              </button>
            );
          })}
        </div>
        {runtimeTarget === "hosted-demo" ? (
          <p className="storage-runtime-note">
            Server draft is hidden here because this looks like a hosted demo. Use
            local install or set <code>NEXT_PUBLIC_LSD_RUNTIME_TARGET=local-app</code>
            if you intentionally want to test SQLite-backed drafts.
          </p>
        ) : null}
      </div>

      {storageMode === "server-persisted" ? (
        <div className="paper-card storage-runtime-card">
          <div className="storage-runtime-head">
            <div>
              <p className="eyebrow">Claim this server draft</p>
              <h3>
                {normalizedOwnerEmail
                  ? `Claimed by ${normalizedOwnerEmail}`
                  : authStatus === "authenticated" && normalizedSessionEmail
                    ? `Ready to claim as ${normalizedSessionEmail}`
                    : pendingLink
                      ? `Magic link ready for ${pendingLink.email}`
                      : "No owner attached yet"}
              </h3>
            </div>
            <StatusPill
              tone={
                isClaimedBySignedInIdentity
                  ? "success"
                  : authStatus === "authenticated"
                    ? "info"
                    : "warning"
              }
            >
              {isClaimedBySignedInIdentity
                ? "Claimed"
                : authStatus === "authenticated"
                  ? "Signed in"
                  : deliveryLabel}
            </StatusPill>
          </div>

          {authNotice ? (
            <p className={`auth-flow-notice auth-flow-notice-${authNotice.tone}`}>
              {authNotice.message}
            </p>
          ) : null}

          {authStatus === "hydrating" ? (
            <>
              <p>
                Checking whether this browser already has a signed-in session for hosted
                drafts.
              </p>
            </>
          ) : isClaimedBySignedInIdentity && normalizedOwnerEmail ? (
            <>
              <p>
                This server draft is attached to your signed-in identity. The running app
                instance now keeps project ownership separate from the project document
                itself.
              </p>
              <div className="filter-row">
                <button
                  className="secondary-button"
                  onClick={async () => {
                    const released = await releaseProjectClaim();

                    if (released) {
                      setImportMessage("Released the server draft claim for this project.");
                    }
                  }}
                  type="button"
                >
                  Release claim
                </button>
                <button
                  className="text-button"
                  onClick={async () => {
                    await signOut();
                    setAuthNotice(null);
                    setImportMessage("Signed out of the local hosted session.");
                  }}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : authStatus === "authenticated" && normalizedSessionEmail ? (
            <>
              <p>
                {isClaimedByAnotherIdentity
                  ? `This draft is currently attached to ${normalizedOwnerEmail}. Sign out and return with that identity if you want the ownership states to line up.`
                  : `You are signed in as ${normalizedSessionEmail}. Claim this server draft when you want to anchor it to your hosted identity.`}
              </p>
              <div className="claim-flow-row">
                <button
                  className="primary-button"
                  disabled={Boolean(isClaimedByAnotherIdentity)}
                  onClick={async () => {
                    const claimed = await claimProject(normalizedSessionEmail);

                    if (claimed) {
                      setImportMessage(`Claimed this server draft as ${normalizedSessionEmail}.`);
                    }
                  }}
                  type="button"
                >
                  Claim this draft
                </button>
                <button
                  className="text-button"
                  onClick={async () => {
                    await signOut();
                    setAuthNotice(null);
                    setImportMessage("Signed out of the local hosted session.");
                  }}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                {authRuntime?.isDemoDelivery
                  ? "Demo mail mode prepares a local magic link for this app instance."
                  : `Magic links are delivered through ${authRuntime?.mailProviderLabel ?? "the configured mail provider"}.`}
                {" "}Once activated, you can claim the server draft without leaving the
                browser-first flow.
              </p>
              <div className="claim-flow-row">
                <input
                  onChange={(event) => setClaimEmail(event.target.value)}
                  placeholder="facilitator@example.com"
                  type="email"
                  value={claimEmail}
                />
                <button
                  className="primary-button"
                  disabled={!claimEmail.trim() || magicLinkRequestStatus === "requesting"}
                  onClick={async () => {
                    const normalizedEmail = claimEmail.trim().toLowerCase();
                    setAuthNotice(null);
                    setMagicLinkRequestStatus("requesting");

                    try {
                      const nextLink = await requestMagicLink(normalizedEmail, "/projects");
                      setClaimEmail(normalizedEmail);
                      setMagicLinkRequestStatus("sent");
                      setAuthNotice({
                        message:
                          nextLink.delivery.mode === "demo"
                            ? `Demo magic link is ready for ${nextLink.email}.`
                            : `Magic link sent to ${nextLink.email} through ${nextLink.delivery.label}.`,
                        tone: "success",
                      });
                      setImportMessage(
                        nextLink.delivery.mode === "demo"
                          ? `Prepared a demo magic link for ${nextLink.email}.`
                          : `Sent a magic link to ${nextLink.email}.`,
                      );
                    } catch (error) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : "Could not request magic link.";
                      setMagicLinkRequestStatus("failed");
                      setAuthNotice({
                        message,
                        tone: "warning",
                      });
                      setImportMessage("Magic link request failed.");
                    }
                  }}
                  type="button"
                >
                  {magicLinkRequestStatus === "requesting"
                    ? "Requesting..."
                    : "Request magic link"}
                </button>
              </div>
              {pendingLink ? (
                <div className="claim-link-card">
                  <p>
                    {pendingLink.activationUrl
                      ? "Demo magic link ready for "
                      : "Magic link sent to "}
                    <strong>{pendingLink.email}</strong>
                    {pendingLink.activationUrl
                      ? ". Open it in this browser to activate the hosted session."
                      : `. Delivery provider: ${pendingLink.delivery.label}.`}
                  </p>
                  <div className="filter-row">
                    {pendingLink.activationUrl ? (
                      <a className="primary-button" href={pendingLink.activationUrl}>
                        Open magic link
                      </a>
                    ) : null}
                    <span className="meta-note">
                      Expires {new Date(pendingLink.expiresAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="project-grid">
        {cards.map((card) => {
          const href = `/project/${encodeURIComponent(card.id)}/builder`;

          return (
            <article
              key={card.id}
              className={`project-card ${card.featured ? "is-featured" : ""}`}
            >
              <Link
                className="project-card-main"
                href={href}
                onClick={() => selectProject(card.id)}
              >
                <div className="project-card-top">
                  <StatusPill tone={card.badgeTone}>{card.badgeLabel}</StatusPill>
                  <span className="project-meta">{card.storageLabel}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.purposePreview}</p>
                <div className="project-tags">
                  <span>{card.sectionCountLabel}</span>
                  <span>{card.languageLabel}</span>
                  <span>{card.aiLabel}</span>
                </div>
                <div className="project-foot">
                  <span>{card.updatedLabel}</span>
                  <span>{card.footerLabel}</span>
                </div>
              </Link>
              <div className="project-card-actions">
                <button
                  className="tiny-button"
                  onClick={() => handleRenameProject(card.id, card.title)}
                  type="button"
                >
                  Rename
                </button>
                <button
                  className="tiny-button"
                  onClick={() => handleDuplicateProject(card.id)}
                  type="button"
                >
                  Duplicate
                </button>
                <button
                  className="tiny-button tiny-button-danger"
                  disabled={projectRecords.length <= 1}
                  onClick={() => {
                    void handleDeleteProject(card.id, card.title);
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
