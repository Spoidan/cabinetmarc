import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminFromRequest } from "@/lib/admin";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await getAdmin()
    .storage.from("media")
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const files = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => ({
      ...f,
      url: `${supabaseUrl}/storage/v1/object/public/media/${f.name}`,
    }));

  return NextResponse.json({ data: files });
}

export async function POST(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await getAdmin()
    .storage.from("media")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return NextResponse.json({
    data: {
      name: path,
      metadata: { size: file.size, mimetype: file.type },
      url: `${supabaseUrl}/storage/v1/object/public/media/${path}`,
    },
  });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  const { error } = await getAdmin().storage.from("media").remove([name]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
