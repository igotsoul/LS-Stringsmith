import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppProviders } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Liberating Structure Designer",
  description:
    "Browser-first workshop design studio for Liberating Structures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
