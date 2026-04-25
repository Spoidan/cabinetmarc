import { notFound, redirect } from "next/navigation";
import { getCourseOutline } from "@/lib/elearning/queries";

export default async function ApprendreRedirectPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const outline = await getCourseOutline(courseSlug);
  if (!outline) notFound();

  const first = outline.modules.find((m) => m.lessons.length > 0)?.lessons[0];
  if (!first) notFound();

  redirect(`/cours/${courseSlug}/apprendre/${first.slug}`);
}
