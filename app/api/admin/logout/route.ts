import { localRedirect } from "@/lib/redirect";
import { clearAdminCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  await clearAdminCookie();
  return localRedirect("/admin", 303);
}
