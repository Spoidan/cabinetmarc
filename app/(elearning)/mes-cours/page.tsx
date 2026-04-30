export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { GraduationCap, BookOpen, Award } from "lucide-react";
import { listMyCourses } from "@/lib/elearning/queries";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Mes cours" };

type Enrollment = Awaited<ReturnType<typeof listMyCourses>>[number];

export default async function MyCoursesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/connexion?redirect_url=%2Fmes-cours");

  const enrollments = await listMyCourses(userId);

  const inProgress = enrollments.filter((e) => !e.completed_at);
  const completed = enrollments.filter((e) => e.completed_at);

  return (
    <section className="container mx-auto py-12">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Mes cours</h1>
          <p className="text-muted-foreground mt-2">
            Reprenez là où vous vous êtes arrêté.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cours">
            <BookOpen className="w-4 h-4" />
            Parcourir les cours
          </Link>
        </Button>
      </header>

      <Tabs defaultValue="in_progress">
        <TabsList>
          <TabsTrigger value="in_progress">En cours ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminés ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">Tous ({enrollments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="in_progress">
          <EnrollmentList enrollments={inProgress} empty="Aucun cours en cours." />
        </TabsContent>
        <TabsContent value="completed">
          <EnrollmentList enrollments={completed} empty="Vous n'avez pas encore terminé de cours." />
        </TabsContent>
        <TabsContent value="all">
          <EnrollmentList enrollments={enrollments} empty="Vous n'êtes inscrit à aucun cours pour le moment." />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function EnrollmentList({
  enrollments,
  empty,
}: {
  enrollments: Enrollment[];
  empty: string;
}) {
  if (enrollments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center mt-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <GraduationCap className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-5">{empty}</p>
        <Button asChild>
          <Link href="/cours">Parcourir les cours</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
      {enrollments.map((e) => (
        <EnrollmentCard key={e.id} enrollment={e} />
      ))}
    </div>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const course = (enrollment as any).course as {
    slug: string;
    title: string;
    subtitle: string | null;
    cover_image: string | null;
  } | null;
  const cert = enrollment.certificate;
  const completed = Boolean(enrollment.completed_at);
  if (!course) return null;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <div className="relative aspect-[16/9] bg-muted">
        {course.cover_image ? (
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 380px, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <GraduationCap className="w-10 h-10 text-primary/50" />
          </div>
        )}
        {completed && (
          <Badge variant="emerald" className="absolute top-3 right-3">
            Terminé
          </Badge>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <div className="mt-auto space-y-3">
          <Progress value={enrollment.progress_percent} />
          <p className="text-xs text-muted-foreground">
            {enrollment.progress_percent}% complété
          </p>
          <div className="flex gap-2">
            <Button size="sm" asChild className="flex-1">
              <Link href={`/cours/${course.slug}${completed ? "" : "/apprendre"}`}>
                {completed ? "Revoir" : "Continuer"}
              </Link>
            </Button>
            {cert && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/cours/${course.slug}/certificat`}>
                  <Award className="w-4 h-4" />
                  Certificat
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
