import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Verify signature
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  let event: { type: string; data: { id: string } };
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.deleted") {
    return NextResponse.json({ received: true });
  }

  const userId = event.data.id;
  const supabase = db();

  // Check if user has any certificates — if so, keep all records intact.
  const { count } = await supabase
    .from("course_certificates")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) {
    // User has certificates — preserve their data for record integrity.
    return NextResponse.json({ received: true, action: "preserved" });
  }

  // No certificates — delete all user data from every table.
  await Promise.allSettled([
    supabase.from("testimonials").delete().eq("user_id", userId),
    supabase.from("lesson_completions").delete().eq("user_id", userId),
    supabase.from("quiz_attempts").delete().eq("user_id", userId),
    supabase.from("course_enrollments").delete().eq("user_id", userId),
  ]);
  // Delete profile last (other tables may FK to it).
  await supabase.from("profiles").delete().eq("id", userId);

  return NextResponse.json({ received: true, action: "deleted" });
}
