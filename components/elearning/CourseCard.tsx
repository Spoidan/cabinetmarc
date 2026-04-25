import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBIF, formatDuration } from "@/lib/format";
import type { CourseWithCategory } from "@/lib/elearning/queries";

export function levelLabel(level: string) {
  switch (level) {
    case "debutant":
      return "Débutant";
    case "intermediaire":
      return "Intermédiaire";
    case "avance":
      return "Avancé";
    default:
      return level;
  }
}

export function CourseCard({ course }: { course: CourseWithCategory }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/9] bg-muted">
        {course.cover_image ? (
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <GraduationCap className="w-10 h-10 text-primary/50" aria-hidden />
          </div>
        )}
        {course.category && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-background/90 backdrop-blur px-2.5 py-1 rounded-full">
            {course.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.subtitle}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto mb-4">
          <Badge variant="outline" className="text-[10px]">{levelLabel(course.level)}</Badge>
          {course.duration_minutes ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden />
              {formatDuration(course.duration_minutes)}
            </span>
          ) : null}
          <span className={course.price_bif === 0 ? "text-emerald-600 font-semibold ml-auto" : "ml-auto font-semibold text-foreground"}>
            {course.price_bif === 0 ? "Gratuit" : formatBIF(course.price_bif)}
          </span>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/cours/${course.slug}`}>
            Voir le cours
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
