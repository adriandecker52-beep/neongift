import { localRedirect } from "@/lib/redirect";
import { clearCustomerCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  await clearCustomerCookie();
  return localRedirect("/", 303);
}
