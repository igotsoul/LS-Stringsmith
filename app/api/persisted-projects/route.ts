import { NextResponse } from "next/server";

import { listServerPersistedProjects } from "@/storage/projects/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const records = await listServerPersistedProjects();
  return NextResponse.json(records);
}
