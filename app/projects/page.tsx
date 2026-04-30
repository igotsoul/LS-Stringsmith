import { AppShell } from "@/components/layout/app-shell";
import { ProjectsScreen } from "@/features/projects/projects-screen";

export default function ProjectsPage() {
  return (
    <AppShell active="projects">
      <ProjectsScreen />
    </AppShell>
  );
}
