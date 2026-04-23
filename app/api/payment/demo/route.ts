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

  const { course_id, card_number, card_name, card_expiry, card_cvv } = await req.json();

  if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });
  if (!card_number || !card_name || !card_expiry || !card_cvv) {
    return NextResponse.json({ error: "Informations de carte incomplètes" }, { status: 400 });
  }

  const last4 = card_number.replace(/\s/g, "").slice(-4);
  const db = getAdmin();

  const { data: course } = await db
    .from("courses")
    .select("id, title_fr, price, is_free")
    .eq("id", course_id)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Simulate processing delay (0ms in reality)
  const amount = course.is_free ? 0 : course.price;

  const { data: payment, error: payErr } = await db
    .from("payments")
    .insert({
      user_id: userId,
      course_id,
      amount,
      currency: "BIF",
      status: "completed",
      payment_method: "demo",
      demo_card_last4: last4,
    })
    .select()
    .single();

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // Auto-enroll
  const { data: existing } = await db
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (!existing) {
    await db.from("enrollments").insert({
      user_id: userId,
      course_id,
      payment_id: payment.id,
      status: "active",
    });
  }

  return NextResponse.json({ success: true, payment_id: payment.id });
}
