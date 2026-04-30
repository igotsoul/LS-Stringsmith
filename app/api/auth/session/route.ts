import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_SESSION_COOKIE,
  getAuthRuntimePublicConfig,
} from "@/storage/auth/auth-config";
import { getAuthProvider } from "@/storage/auth/auth-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  const auth = getAuthRuntimePublicConfig();

  if (!sessionId) {
    return NextResponse.json({
      auth,
      session: null,
    });
  }

  const session = await getAuthProvider().readSession(sessionId);

  if (!session) {
    cookieStore.delete(AUTH_SESSION_COOKIE);

    return NextResponse.json({
      auth,
      session: null,
    });
  }

  return NextResponse.json({
    auth,
    session,
  });
}
