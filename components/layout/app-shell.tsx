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
    </div>
  );
}
