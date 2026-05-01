import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { full_name, phone, address } = await req.json();
  if (!full_name?.trim() || !phone?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  const { error } = await db()
    .from("profiles")
    .upsert(
      { id: userId, full_name: full_name.trim(), phone: phone.trim(), address: address.trim() },
      { onConflict: "id", ignoreDuplicates: false }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
