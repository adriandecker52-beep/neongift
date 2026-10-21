import { NextResponse } from "next/server";

export function localRedirect(path: string, status = 307) {
  return new NextResponse(null, { status, headers: { Location: path } });
}
