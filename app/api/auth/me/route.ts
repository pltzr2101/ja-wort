import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";

/** Gibt zurueck, ob die aktuelle Anfrage als Admin angemeldet ist. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: requireAdmin(req) });
}
