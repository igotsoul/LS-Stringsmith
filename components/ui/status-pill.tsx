import type { ReactNode } from "react";

import type { ReviewTone } from "@/domain/workshop/types";

interface StatusPillProps {
  tone?: ReviewTone;
  children: ReactNode;
  subtle?: boolean;
}

export function StatusPill({
  tone = "info",
  children,
  subtle = false,
}: StatusPillProps) {
  const classes = ["status-pill", `status-pill-${tone}`];

  if (subtle) {
    classes.push("status-pill-subtle");
  }

  return <span className={classes.join(" ")}>{children}</span>;
}
