"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAiReviewRuntime } from "@/components/providers/ai-review-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useProjectStore } from "@/components/providers/project-store-provider";
import { getRuntimeCapabilities } from "@/domain/workshop/runtime-capabilities";

type NavKey = "projects" | "setup" | "builder" | "preview";
type ThemeMode = "light" | "dark";

const themeStorageKey = "ls-designer-theme";

interface AppTopbarProps {
  active: NavKey;
}

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  if (theme === "dark") {
    return (
      <svg aria-hidden="true" className="theme-toggle-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 4.75v1.5M12 17.75v1.5M5.64 5.64 6.7 6.7M17.3 17.3l1.06 1.06M4.75 12h1.5M17.75 12h1.5M5.64 18.36 6.7 17.3M17.3 6.7l1.06-1.06M15.25 12a3.25 3.25 0 1 1-6.5 0a3.25 3.25 0 0 1 6.5 0Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="theme-toggle-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M18.6 14.15A6.75 6.75 0 0 1 9.85 5.4a6.9 6.9 0 1 0 8.75 8.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AppTopbar({ active }: AppTopbarProps) {
  const { activeProjectId, project, saveState, selectProject, status, storageMode, toggleAi } =
    useProjectStore();
  const { runtime: aiReviewRuntime } = useAiReviewRuntime();
  const { session, status: authStatus } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [themeReady, setThemeReady] = useState(false);
  const runtime = getRuntimeCapabilities(project, storageMode, aiReviewRuntime);
  const activeProjectHref = `/project/${encodeURIComponent(activeProjectId)}`;
  const navItems: Array<{ key: NavKey; label: string; href: string }> = [
    { key: "projects", label: "Projects", href: "/projects" },
    { key: "setup", label: "Setup", href: `${activeProjectHref}/setup` },
    { key: "builder", label: "Builder", href: `${activeProjectHref}/builder` },
    { key: "preview", label: "Preview", href: `${activeProjectHref}/preview` },
  ];

  const saveLabel =
    saveState === "saving"
      ? "Saving draft..."
      : saveState === "error"
        ? "Save issue"
        : status === "hydrating"
          ? "Loading draft..."
          : runtime.storageLabel;

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    const nextTheme: ThemeMode =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    setTheme(nextTheme);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme, themeReady]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <img className="brand-logo-mark brand-logo-mark-light" src="/brand/ls-stringsmith-mark.png" alt="" />
          <img
            className="brand-logo-mark brand-logo-mark-dark"
            src="/brand/ls-stringsmith-mark-dark.png"
            alt=""
          />
        </div>
        <div>
          <p className="eyebrow">Scaffold Alpha</p>
          <h1>LS Stringsmith</h1>
        </div>
      </div>

      <nav className="topnav" aria-label="Primary">
        {navItems.map((item) => (
          <Link
            key={item.key}
            className={`nav-chip ${active === item.key ? "is-active" : ""}`}
            href={item.href}
            onClick={() => selectProject(activeProjectId)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-meta">
        <div className="topbar-status-group" aria-label="Workspace status">
          <span className="meta-pill topbar-status-pill">
            {storageMode === "workspace-local"
              ? "Workspace mode"
              : storageMode === "server-persisted"
                ? "Server mode"
                : "Guest mode"}
          </span>
          <span className="meta-pill topbar-status-pill">
            {authStatus === "hydrating" ? "Checking sign-in" : session?.email ?? "Guest"}
          </span>
          <span className="meta-pill topbar-status-pill">{saveLabel}</span>
          <span className="meta-pill topbar-status-pill">{runtime.reviewAvailabilityLabel}</span>
        </div>
        <button
          aria-pressed={project.aiEnabled}
          className={`meta-pill meta-pill-button topbar-ai-toggle ${
            project.aiEnabled ? "is-active" : ""
          }`}
          onClick={toggleAi}
          title={runtime.aiToggleLabel}
          type="button"
        >
          {runtime.aiStatusLabel}
        </button>
        <button
          aria-label={`Switch to ${nextTheme} mode`}
          aria-pressed={theme === "dark"}
          className={`meta-pill meta-pill-button topbar-theme-toggle ${
            theme === "dark" ? "is-active" : ""
          }`}
          onClick={() => setTheme(nextTheme)}
          title={`Switch to ${nextTheme} mode`}
          type="button"
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>
    </header>
  );
}
