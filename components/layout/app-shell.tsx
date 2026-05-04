import type { ReactNode } from "react";

import { AppTopbar } from "@/components/layout/app-topbar";

type NavKey = "projects" | "setup" | "builder" | "preview";

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="app-frame">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />
      <div className="grain" />
      <AppTopbar active={active} />
      <main className="page-shell">{children}</main>
      <footer className="app-credit" aria-label="Third-party material attribution">
        LS method names, references, and official icons are third-party materials under{" "}
        <a href="https://creativecommons.org/licenses/by-nc/3.0/" rel="noreferrer" target="_blank">
          CC BY-NC 3.0
        </a>
        . Sources:{" "}
        <a href="https://www.liberatingstructures.com/" rel="noreferrer" target="_blank">
          liberatingstructures.com
        </a>{" "}
        and{" "}
        <a
          href="https://liberatingstructures.de/liberating-structures-menue/"
          rel="noreferrer"
          target="_blank"
        >
          liberatingstructures.de
        </a>
        . Independent project; no endorsement implied.
      </footer>
    </div>
  );
}
