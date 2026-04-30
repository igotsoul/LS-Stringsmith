import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_SESSION_COOKIE,
  shouldUseSecureSessionCookie,
} from "@/storage/auth/auth-config";
import { getAuthProvider, normalizeRedirectPath } from "@/storage/auth/auth-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const safeRedirect = normalizeRedirectPath(url.searchParams.get("redirectTo"));

  if (!token) {
    return NextResponse.redirect(new URL(`${safeRedirect}?auth=missing-token`, url.origin));
  }

  const result = await getAuthProvider().activateMagicLink(token);

  if (result.status === "expired") {
    return NextResponse.redirect(new URL(`${safeRedirect}?auth=expired-link`, url.origin));
  }

  if (result.status === "invalid") {
    return NextResponse.redirect(new URL(`${safeRedirect}?auth=invalid-link`, url.origin));
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, result.session.sessionId, {
    expires: new Date(result.session.expiresAt),
    httpOnly: true,
    secure: shouldUseSecureSessionCookie(request.url),
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(new URL(`${safeRedirect}?auth=signed-in`, url.origin));
}
