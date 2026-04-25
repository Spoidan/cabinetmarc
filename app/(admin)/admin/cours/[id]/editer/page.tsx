import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseOutline } from "@/lib/elearning/queries";
import { adminListCategories } from "@/lib/admin/queries";
import { CourseEditor } from "@/components/admin/CourseEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Édition de cours" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const [outline, categories] = await Promise.all([
    getCourseOutline(course.slug, { includeDraft: true }),
    adminListCategories(),
  ]);
  if (!outline) notFound();

  return (
    <CourseEditor
      outline={outline}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
