import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pageKey = searchParams.get("page");
  const locale = searchParams.get("locale") ?? "fr";

  const supabase = getAdminSupabase();
  let query = supabase.from("page_content").select("*").eq("locale", locale);
  if (pageKey) query = query.eq("page_key", pageKey);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("page_content")
      .upsert(
        { ...body, updated_at: new Date().toISOString() },
        { onConflict: "page_key,section_key,locale" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
