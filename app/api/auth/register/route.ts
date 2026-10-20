import { NextResponse } from "next/server";
import { AccountError, registerCustomer } from "@/lib/accounts";
import { setCustomerCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; password?: string } | null;
  try {
    const account = registerCustomer({
      name: String(body?.name || ""),
      email: String(body?.email || ""),
      password: String(body?.password || ""),
    });
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
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
