import { NextResponse } from "next/server";

import type { AiReviewRequest } from "@/domain/workshop/ai-review-contract";
import {
  AiReviewRequestError,
  getAiReviewRuntimeStatus,
  runAiReview,
} from "@/domain/workshop/ai-review-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAiReviewRuntimeStatus());
}

export async function POST(request: Request) {
  let body: AiReviewRequest;

  try {
    body = (await request.json()) as AiReviewRequest;
  } catch {
    return NextResponse.json(
      {
        error: "Request body must be valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    return NextResponse.json(await runAiReview(body));
  } catch (error) {
    if (error instanceof AiReviewRequestError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Could not run review.",
      },
      {
        status: 500,
      },
    );
  }
}
