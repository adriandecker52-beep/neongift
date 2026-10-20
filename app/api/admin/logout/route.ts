import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
