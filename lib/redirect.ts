import { NextResponse } from "next/server";
import { appUrl } from "@/lib/trybit";

export function localRedirect(path: string, status = 307) {
  return NextResponse.redirect(new URL(path, appUrl()), status);
}
