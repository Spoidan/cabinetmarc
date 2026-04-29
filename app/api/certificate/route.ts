import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const number = new URL(req.url).searchParams.get("number");
  if (!number) {
    return NextResponse.json({ error: "Missing number" }, { status: 400 });
  }

  const admin = getAdmin();

  const { data: cert, error } = await admin
    .from("course_certificates")
    .select("*")
    .eq("certificate_number", number)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!cert) return NextResponse.json({ data: null });

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("user_id, course_id")
    .eq("id", cert.enrollment_id)
    .maybeSingle();

  if (!enrollment) return NextResponse.json({ data: null });

  const [{ data: profile }, { data: course }] = await Promise.all([
    admin.from("profiles").select("full_name, email").eq("id", enrollment.user_id).maybeSingle(),
    admin.from("courses").select("title").eq("id", enrollment.course_id).maybeSingle(),
  ]);

  return NextResponse.json({
    data: {
      user_name: profile?.full_name ?? profile?.email ?? "Participant",
      course_name: course?.title ?? "Formation",
      certificate_number: cert.certificate_number,
      issued_at: cert.issued_at,
    },
  });
}
