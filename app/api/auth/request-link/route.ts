import { NextResponse } from "next/server";

import { AuthConfigurationError } from "@/storage/auth/auth-config";
import { AuthRequestError, getAuthProvider } from "@/storage/auth/auth-provider";
import { MailDeliveryError } from "@/storage/auth/mail-delivery";

export const dynamic = "force-dynamic";

interface MagicLinkRequestBody {
  email?: string;
  redirectTo?: string;
}

export async function POST(request: Request) {
  let body: MagicLinkRequestBody;

  try {
    body = (await request.json()) as MagicLinkRequestBody;
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
    const url = new URL(request.url);
    const link = await getAuthProvider().requestMagicLink({
      email: body.email ?? "",
      origin: url.origin,
      redirectTo: body.redirectTo,
    });

    return NextResponse.json(link);
  } catch (error) {
    if (error instanceof AuthRequestError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    if (error instanceof MailDeliveryError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Could not request magic link.",
      },
      {
        status: 500,
      },
    );
  }
}
