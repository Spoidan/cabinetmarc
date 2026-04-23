import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { course_id, payment_id } = await req.json();
  if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });

  const db = getAdmin();

  const { data: existing } = await db
    .from("enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing, already_enrolled: true });
  }

  const { data, error } = await db
    .from("enrollments")
    .insert({ user_id: userId, course_id, payment_id: payment_id ?? null, status: "active" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
