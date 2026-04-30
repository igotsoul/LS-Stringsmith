import rawIconSources from "@/domain/workshop/ls-icon-sources.json";
import type { IconId } from "@/domain/workshop/types";

export interface LsIconSource {
  icon: IconId;
  entryId: string;
  title: string;
  pageUrl: string;
  sourceImageUrl?: string;
  sourceImagePattern: string;
  fileName: string;
  publicPath: string;
}

export const lsIconSources = rawIconSources as LsIconSource[];

export const lsIconAssets = Object.fromEntries(
  lsIconSources.map((source) => [source.icon, source]),
) as Partial<Record<IconId, LsIconSource>>;

export function getOfficialLsIcon(icon: IconId) {
  return lsIconAssets[icon] ?? null;
}
