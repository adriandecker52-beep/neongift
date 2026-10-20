import { NextResponse } from "next/server";
import { AccountError, loginCustomer } from "@/lib/accounts";
import { setCustomerCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  try {
    const account = loginCustomer(String(body?.email || ""), String(body?.password || ""));
    await setCustomerCookie({
      sub: account.id,
      email: account.email,
      name: account.name,
      picture: "",
      provider: "password",
      emailVerified: false,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccountError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Sign-in failed." }, { status: 500 });
  }
}
