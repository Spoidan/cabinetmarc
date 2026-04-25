import "server-only";
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import React from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateFr } from "@/lib/format";

type CertificateInput = {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  completedAt: string;
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 48,
    paddingVertical: 52,
    fontFamily: "Helvetica",
    backgroundColor: "#fffbf5",
  },
  frame: {
    borderWidth: 8,
    borderColor: "#7B3A10",
    borderStyle: "solid",
    padding: 36,
    height: "100%",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "40%",
    textAlign: "center",
    color: "#7B3A10",
    opacity: 0.06,
    fontSize: 120,
    fontWeight: 700,
    letterSpacing: 8,
  },
  header: { textAlign: "center", marginBottom: 18 },
  brandEyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#7B3A10",
    marginBottom: 4,
  },
  brand: { fontSize: 32, fontWeight: 700, color: "#1A1A1A", letterSpacing: 2 },
  title: {
    fontSize: 42,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 14,
    color: "#1A1A1A",
  },
  awardedLine: {
    textAlign: "center",
    fontSize: 14,
    color: "#444",
    marginBottom: 22,
  },
  name: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: 700,
    color: "#7B3A10",
    marginBottom: 8,
  },
  separator: {
    marginHorizontal: "auto",
    width: 160,
    height: 1,
    backgroundColor: "#7B3A10",
    marginBottom: 22,
  },
  forCourse: { textAlign: "center", fontSize: 14, color: "#444", marginBottom: 8 },
  courseTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#1A1A1A",
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5d9c7",
    borderTopStyle: "solid",
  },
  footerCell: { flex: 1 },
  footerLabel: {
    fontSize: 9,
    color: "#7B3A10",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  footerValue: { fontSize: 12, color: "#1A1A1A", fontWeight: 700 },
  signature: {
    marginTop: 14,
    width: 180,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
    borderBottomStyle: "solid",
  },
});

// React.createElement based to keep this file as .ts (no JSX needed)
function renderCertificate(input: CertificateInput) {
  const issuedFr = formatDateFr(input.completedAt, "d MMMM yyyy");
  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      React.createElement(
        View,
        { style: styles.frame },
        React.createElement(Text, { style: styles.watermark }, "CABINET MARC"),
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.brandEyebrow }, "Le Cabinet"),
          React.createElement(Text, { style: styles.brand }, "MARC")
        ),
        React.createElement(Text, { style: styles.title }, "Certificat de réussite"),
        React.createElement(Text, { style: styles.awardedLine }, "Décerné à"),
        React.createElement(Text, { style: styles.name }, input.studentName),
        React.createElement(View, { style: styles.separator }),
        React.createElement(
          Text,
          { style: styles.forCourse },
          "Pour avoir complété avec succès le cours"
        ),
        React.createElement(Text, { style: styles.courseTitle }, `« ${input.courseTitle} »`),
        React.createElement(
          View,
          { style: styles.footerRow },
          React.createElement(
            View,
            { style: styles.footerCell },
            React.createElement(Text, { style: styles.footerLabel }, "Numéro"),
            React.createElement(Text, { style: styles.footerValue }, input.certificateNumber)
          ),
          React.createElement(
            View,
            { style: styles.footerCell },
            React.createElement(Text, { style: styles.footerLabel }, "Délivré le"),
            React.createElement(Text, { style: styles.footerValue }, issuedFr)
          ),
          React.createElement(
            View,
            { style: styles.footerCell },
            React.createElement(Text, { style: styles.footerLabel }, "Signature"),
            React.createElement(View, { style: styles.signature })
          )
        )
      )
    )
  );
}

/** Render the certificate to PDF, upload to Supabase Storage, return the storage path. */
export async function issueCertificatePdf(input: CertificateInput): Promise<string> {
  const buffer = await renderToBuffer(renderCertificate(input));
  const path = `${input.certificateNumber}.pdf`;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from("certificates")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) {
    console.error("[issueCertificatePdf:upload]", error.message);
    throw new Error(error.message);
  }
  return path;
}
