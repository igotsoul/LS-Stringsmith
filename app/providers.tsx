"use client";

import type { ReactNode } from "react";

import { AiReviewProvider } from "@/components/providers/ai-review-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ProjectStoreProvider } from "@/components/providers/project-store-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AiReviewProvider>
        <ProjectStoreProvider>{children}</ProjectStoreProvider>
      </AiReviewProvider>
    </AuthProvider>
  );
}
