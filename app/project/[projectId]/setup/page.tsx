import { AppShell } from "@/components/layout/app-shell";
import { SetupScreen } from "@/features/setup/setup-screen";

export default function SetupPage() {
  return (
    <AppShell active="setup">
      <SetupScreen />
    </AppShell>
  );
}
