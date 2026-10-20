import { NextResponse } from "next/server";
import { checkAdminLogin, setAdminCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!checkAdminLogin(String(body?.email || ""), String(body?.password || ""))) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
