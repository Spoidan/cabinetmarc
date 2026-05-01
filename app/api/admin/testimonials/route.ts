import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminFromRequest } from "@/lib/admin";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await db()
    .from("testimonials")
    .select("*")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, is_approved } = await req.json();
  const { data, error } = await db()
    .from("testimonials")
    .update({ is_approved })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await db().from("testimonials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
