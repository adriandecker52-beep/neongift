import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/session";
import { appUrl } from "@/lib/trybit";

export const runtime = "nodejs";

export async function POST() {
  await clearCustomerCookie();
  return NextResponse.redirect(new URL("/", appUrl()), 303);
}
