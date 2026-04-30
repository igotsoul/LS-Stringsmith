import { AppShell } from "@/components/layout/app-shell";
import { BuilderScreen } from "@/features/builder/builder-screen";

export default function BuilderPage() {
  return (
    <AppShell active="builder">
      <BuilderScreen />
    </AppShell>
  );
}
