import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isAdmin(req: NextRequest): boolean {
  const { userId } = getAuth(req);
  if (!userId) return false;
  return (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).includes(userId);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ext = "jpg" } = await req.json();
  const path = `covers/${Date.now()}.${ext.toLowerCase()}`;

  const { data, error } = await getAdmin()
    .storage.from("blog-covers")
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signedUrl: data.signedUrl, path });
}
