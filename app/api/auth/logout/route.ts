import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await clearCustomerCookie();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
