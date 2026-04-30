import { NextResponse } from "next/server";

import {
  deleteServerPersistedProject,
  readServerPersistedProject,
  writeServerPersistedProject,
  writeServerPersistedProjectWithOwner,
} from "@/storage/projects/server-store";
import type { WorkshopProject } from "@/domain/workshop/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const record = await readServerPersistedProject(projectId);

  if (!record) {
    return NextResponse.json(
      {
        error: "Project not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(record);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  await deleteServerPersistedProject(projectId);

  return NextResponse.json({
    deleted: true,
    projectId,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const body = (await request.json()) as {
    ownerEmail?: string | null;
    project?: WorkshopProject;
  };

  if (!body.project || body.project.id !== projectId) {
    return NextResponse.json(
      {
        error: "Project payload is missing or mismatched.",
      },
      {
        status: 400,
      },
    );
  }

  const record =
    body.ownerEmail !== undefined
      ? await writeServerPersistedProjectWithOwner(body.project, body.ownerEmail)
      : await writeServerPersistedProject(body.project);
  return NextResponse.json(record);
}
