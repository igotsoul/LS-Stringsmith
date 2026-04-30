import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/storage/auth/auth-config";
import { getAuthProvider } from "@/storage/auth/auth-provider";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionId) {
    await getAuthProvider().endSession(sessionId);
  }

  cookieStore.delete(AUTH_SESSION_COOKIE);

  return NextResponse.json({
    ok: true,
  });
}
