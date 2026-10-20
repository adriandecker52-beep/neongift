import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/session";
import { appUrl } from "@/lib/trybit";

export const runtime = "nodejs";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin", appUrl()), 303);
}
