import type { IconId } from "@/domain/workshop/types";
import { getOfficialLsIcon } from "@/domain/workshop/ls-icon-assets";

interface LsIconProps {
  icon: IconId;
  alt: string;
}

export function LsIcon({ icon, alt }: LsIconProps) {
  const officialIcon = getOfficialLsIcon(icon);

  if (officialIcon) {
    return (
      <span className="ls-icon-shell">
        <img className="ls-icon-image" src={officialIcon.publicPath} alt={alt} />
      </span>
    );
  }

  const token =
    icon === "intro"
      ? "CT"
      : icon === "input"
        ? "IN"
        : icon === "reflection"
          ? "RF"
          : "WN";

  return (
    <span className={`ls-icon-shell ls-icon-token ls-icon-token-${icon}`}>
      {token}
    </span>
  );
}
