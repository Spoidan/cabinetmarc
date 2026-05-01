import { NextRequest, NextResponse } from "next/server";
import { isAdminFromRequest } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminFromRequest(req as NextRequest)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: cert } = await admin
    .from("course_certificates")
    .select("pdf_path")
    .eq("id", id)
    .maybeSingle();
  if (!cert?.pdf_path) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  const { data: signed } = await admin.storage
    .from("certificates")
    .createSignedUrl(cert.pdf_path, 60 * 5);
  if (!signed?.signedUrl) return NextResponse.json({ error: "Storage error" }, { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
