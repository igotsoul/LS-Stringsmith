import { AppShell } from "@/components/layout/app-shell";
import { PreviewScreen } from "@/features/preview/preview-screen";

export default function PreviewPage() {
  return (
    <AppShell active="preview">
      <PreviewScreen />
    </AppShell>
  );
}
