import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { verifySession } from "@/lib/session";
import { UPLOADS_DIR } from "@/lib/paths";
import { isSafeFilename } from "@/lib/upload";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Liefert ein Bild aus. Nur fuer angemeldete Gaeste oder Admins –
 * so bleiben die Bilder hinter dem Gaeste-Gate geschuetzt.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;

  if (!isSafeFilename(filename)) {
    return new NextResponse("Nicht gefunden.", { status: 404 });
  }

  const guestToken = req.cookies.get("guest_session")?.value;
  const adminToken = req.cookies.get("admin_session")?.value;
  const guest = verifySession(guestToken);
  const admin = verifySession(adminToken);

  if (guest?.kind !== "guest" && admin?.kind !== "admin") {
    return new NextResponse("Nicht autorisiert.", { status: 401 });
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Nicht gefunden.", { status: 404 });
  }

  const extension = filename.split(".").pop() ?? "jpg";
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPE[extension] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
