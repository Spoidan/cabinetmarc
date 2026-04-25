import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCourseOutline } from "@/lib/elearning/queries";
import { sanitizeLessonHtml } from "@/lib/elearning/sanitize";
import { LessonViewer } from "@/components/elearning/LessonViewer";
import { Button } from "@/components/ui/button";
import type { LessonAttachment } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Aperçu du cours" };

export default async function CoursePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lecon?: string }>;
}) {
  const { id } = await params;
  const { lecon } = await searchParams;

  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const outline = await getCourseOutline(course.slug, { includeDraft: true });
  if (!outline) notFound();

  // Pick the lesson: query param wins, else first lesson, else show empty state.
  let currentModule = outline.modules.find((m) => m.lessons.length > 0) ?? null;
  let currentLesson = currentModule?.lessons[0] ?? null;
  if (lecon) {
    for (const m of outline.modules) {
      const l = m.lessons.find((x) => x.slug === lecon);
      if (l) {
        currentModule = m;
        currentLesson = l;
        break;
      }
    }
  }

  if (!currentModule || !currentLesson) {
    return (
      <div className="container mx-auto py-16 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-3">Aperçu indisponible</h1>
        <p className="text-muted-foreground mb-6">
          Ajoutez au moins une leçon pour pouvoir afficher l&apos;aperçu.
        </p>
        <Button asChild variant="outline">
          <Link href={`/admin/cours/${id}/editer`}>
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;éditeur
          </Link>
        </Button>
      </div>
    );
  }

  // Resolve attachments + video like the student view, but no signed URLs needed in preview.
  const attachments: Array<LessonAttachment & { signedUrl: string | null }> = (
    Array.isArray(currentLesson.attachments) ? currentLesson.attachments : []
  ).map((a) => ({ ...a, signedUrl: null }));

  return (
    <LessonViewer
      mode="preview"
      courseSlug={outline.course.slug}
      outline={outline}
      currentLesson={currentLesson}
      currentModule={currentModule}
      lessonContentHtml={sanitizeLessonHtml(currentLesson.content)}
      videoSignedUrl={null}
      attachments={attachments}
      initialCompletedIds={[]}
      initialPassedQuizIds={[]}
      enrolled={false}
    />
  );
}
