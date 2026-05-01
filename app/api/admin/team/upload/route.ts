import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminFromRequest } from "@/lib/admin";

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ext = "jpg" } = await req.json();
  const path = `photos/${Date.now()}.${ext.toLowerCase()}`;

  const { data, error } = await getAdmin()
    .storage.from("team-photos")
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signedUrl: data.signedUrl, path });
}
