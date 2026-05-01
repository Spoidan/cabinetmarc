import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isAdmin(req: NextRequest): boolean {
  const { userId } = getAuth(req);
  if (!userId) return false;
  return (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).includes(userId);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await db()
    .from("testimonials")
    .select("*")
    .order("is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await db().from("testimonials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
