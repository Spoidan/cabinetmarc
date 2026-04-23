import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5),
  service: z.string().optional(),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Use untyped client to avoid generic constraint issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      subject: data.subject,
      message: data.message,
      service: data.service ?? null,
    });

    if (dbError) {
      console.error("DB error:", dbError);
    }

    // Send email via Resend (optional — gracefully skip if key not set)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resendKey !== "re_your_resend_api_key") {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@cabinetmarc.org",
          to: process.env.RESEND_TO_EMAIL ?? "info@cabinetmarc.org",
          subject: `[Cabinet MARC] Nouveau message: ${data.subject}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Téléphone:</strong> ${data.phone}</p>` : ""}
            ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ""}
            <p><strong>Objet:</strong> ${data.subject}</p>
            <hr/>
            <p>${data.message.replace(/\n/g, "<br>")}</p>
          `,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
