export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import {
  getCourseOutline,
  getLesson,
  getEnrollment,
  getCompletedLessonIds,
  getPassedQuizIds,
} from "@/lib/elearning/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedStorageUrl } from "@/app/(elearning)/actions";
import { sanitizeLessonHtml } from "@/lib/elearning/sanitize";
import { LessonViewer } from "@/components/elearning/LessonViewer";
import type { LessonAttachment } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const record = await getLesson(courseSlug, lessonSlug);
  if (!record) return { title: "Leçon introuvable" };
  return { title: `${record.lesson.title} — ${record.course.title}` };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;

  const outline = await getCourseOutline(courseSlug);
  if (!outline) notFound();
  const record = await getLesson(courseSlug, lessonSlug);
  if (!record) notFound();
  const { course, module: currentModule, lesson } = record;

  const { userId } = await auth();
  const enrollment = userId ? await getEnrollment(userId, course.id) : null;
  const isEnrolled = Boolean(enrollment);

  // Access guard: non-enrolled user can only view free-preview lessons.
  if (!lesson.is_free_preview && !isEnrolled) {
    if (!userId) {
      redirect(`/connexion?redirect_url=${encodeURIComponent(`/cours/${courseSlug}/apprendre/${lessonSlug}`)}`);
    }
    redirect(`/cours/${courseSlug}`);
  }

  const completedIds = enrollment ? await getCompletedLessonIds(enrollment.id) : new Set<string>();
  const passedQuizIds = enrollment ? await getPassedQuizIds(enrollment.id) : new Set<string>();

  // Signed URL for video if stored in Supabase Storage
  let videoSignedUrl: string | null = null;
  if (lesson.video_url && !/^https?:\/\//i.test(lesson.video_url)) {
    videoSignedUrl = await createSignedStorageUrl("lesson-videos", lesson.video_url, 60 * 60);
  }

  // Signed URLs for attachments
  const attachmentList: LessonAttachment[] = Array.isArray(lesson.attachments) ? lesson.attachments : [];
  const attachments = await Promise.all(
    attachmentList.map(async (att) => {
      const signedUrl = isEnrolled || lesson.is_free_preview
        ? await createSignedStorageUrl("lesson-attachments", att.path, 5 * 60)
        : null;
      return { ...att, signedUrl };
    })
  );

  // Profile bootstrap for enrolled user (idempotent upsert)
  if (userId && enrollment) {
    const admin = createSupabaseAdminClient();
    await admin
      .from("profiles")
      .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });
  }

  return (
    <LessonViewer
      mode="student"
      courseSlug={courseSlug}
      outline={outline}
      currentLesson={lesson}
      currentModule={currentModule}
      lessonContentHtml={sanitizeLessonHtml(lesson.content)}
      videoSignedUrl={videoSignedUrl}
      attachments={attachments}
      initialCompletedIds={[...completedIds]}
      initialPassedQuizIds={[...passedQuizIds]}
      enrolled={isEnrolled}
    />
  );
}
