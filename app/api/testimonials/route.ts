import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const own = req.nextUrl.searchParams.get("own") === "1";

  if (own) {
    if (!userId) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    const { data, error } = await db()
      .from("testimonials")
      .select("id, name, rating, comment, is_approved, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  const { data, error } = await db()
    .from("testimonials")
    .select("id, name, rating, comment, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { name, rating, comment } = await req.json();
  if (!name?.trim() || !comment?.trim() || !rating) {
    return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }

  // One testimonial per user
  const { data: existing } = await db()
    .from("testimonials")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà soumis un témoignage." }, { status: 409 });
  }

  const { data, error } = await db()
    .from("testimonials")
    .insert({ user_id: userId, name: name.trim(), rating, comment: comment.trim(), is_approved: false })
    .select("id, name, rating, comment, is_approved, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
