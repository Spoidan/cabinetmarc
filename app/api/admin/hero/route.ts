import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminFromRequest } from "@/lib/admin";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locale = new URL(req.url).searchParams.get("locale") ?? "fr";

  const { data, error } = await getAdmin()
    .from("hero_content")
    .select("*")
    .eq("locale", locale)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  if (!await isAdminFromRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, updated_at, ...rest } = await req.json();

  let result;
  if (id) {
    result = await getAdmin()
      .from("hero_content")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
  } else {
    result = await getAdmin()
      .from("hero_content")
      .insert({ ...rest, updated_at: new Date().toISOString() })
      .select()
      .single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ data: result.data });
}
