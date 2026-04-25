import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  Scale,
  ClipboardList,
  TrendingUp,
  BarChart2,
  Rocket,
  Monitor,
  BookOpen,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  cover_image: string | null;
  course_count: number;
};

const ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  calculator: Calculator,
  scale: Scale,
  clipboard: ClipboardList,
  "clipboard-list": ClipboardList,
  "trending-up": TrendingUp,
  "bar-chart": BarChart2,
  "bar-chart-2": BarChart2,
  rocket: Rocket,
  monitor: Monitor,
  book: BookOpen,
  "book-open": BookOpen,
  landmark: Landmark,
};

function iconFor(name: string | null): LucideIcon {
  if (!name) return BookOpen;
  return ICONS[name.toLowerCase()] ?? BookOpen;
}

async function fetchCategories(): Promise<CategoryCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("course_categories")
      .select(
        "id, name, slug, description, icon, cover_image, is_active, sort_order, courses:courses(count)"
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("is_active" as any, true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .order("sort_order" as any, { ascending: true });

    if (error) {
      console.error("[course-categories] query failed", error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      const countRow = Array.isArray(r.courses) ? r.courses[0] : null;
      return {
        id: String(r.id),
        name: String(r.name ?? r.name_fr ?? ""),
        slug: String(r.slug),
        description: r.description ?? r.description_fr ?? null,
        icon: r.icon ?? null,
        cover_image: r.cover_image ?? r.image_url ?? null,
        course_count: countRow?.count ?? 0,
      } satisfies CategoryCard;
    });
  } catch (err) {
    console.error("[course-categories] threw", err);
    return [];
  }
}

export function CourseCategories() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesInner />
    </Suspense>
  );
}

async function CategoriesInner() {
  const [t, tCommon, categories] = await Promise.all([
    getTranslations("home.coursesAvailable"),
    getTranslations("common"),
    fetchCategories(),
  ]);

  return (
    <section className="section-padding bg-muted/20" aria-labelledby="courses-available-heading">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="navy" className="mb-4">
            {t("badge")}
          </Badge>
          <h2
            id="courses-available-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
          >
            {t("title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("subtitle")}</p>
        </div>

        {categories.length === 0 ? (
          <EmptyState message={t("empty")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((cat) => {
              const Icon = iconFor(cat.icon);
              return (
                <article
                  key={cat.id}
                  className={cn(
                    "group relative rounded-2xl border border-border bg-card p-6 shadow-sm",
                    "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  )}
                >
                  {cat.cover_image ? (
                    <div className="relative w-full aspect-[16/9] mb-5 rounded-xl overflow-hidden">
                      <Image
                        src={cat.cover_image}
                        alt={cat.name}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-5 shadow-md">
                      <Icon className="w-6 h-6 text-primary-foreground" aria-hidden />
                    </div>
                  )}

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                      {cat.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                      {t("countPlural", { count: cat.course_count })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-primary hover:text-primary"
                    >
                      <Link
                        href={`/cours?categorie=${encodeURIComponent(cat.slug)}`}
                        aria-label={`${t("cardCta")} — ${cat.name}`}
                      >
                        {t("cardCta")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/cours">
              {t("browseAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        <span className="sr-only">{tCommon("view_all")}</span>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-primary" aria-hidden />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <section className="section-padding bg-muted/20" aria-hidden>
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="mx-auto h-6 w-32 rounded-full bg-muted animate-pulse" />
          <div className="mx-auto h-10 w-3/4 rounded-lg bg-muted animate-pulse" />
          <div className="mx-auto h-5 w-full rounded-lg bg-muted/70 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/70 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/70 animate-pulse" />
              <div className="flex items-center justify-between pt-4">
                <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
