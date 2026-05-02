import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/marketing/queries";

interface Props {
  posts: BlogPost[];
}

export async function Actualite({ posts }: Props) {
  const t = await getTranslations("home.actualite");

  return (
    <section className="section-padding" aria-labelledby="actualite-heading">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="default" className="mb-4">
            {t("badge")}
          </Badge>
          <h2
            id="actualite-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
          >
            {t("title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("subtitle")}</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Newspaper className="w-7 h-7 text-primary" aria-hidden />
            </div>
            <p className="text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={cn(
                    "group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm",
                    "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  )}
                >
                  {post.image_url ? (
                    <div className="relative w-full aspect-[16/9] shrink-0">
                      <Image
                        src={post.image_url}
                        alt={post.title_fr}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center shrink-0">
                      <Newspaper className="w-10 h-10 text-primary/40" aria-hidden />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {post.category && (
                      <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3 w-fit">
                        {post.category}
                      </span>
                    )}

                    <h3 className="text-base font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title_fr}
                    </h3>

                    {post.excerpt_fr && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
                        {post.excerpt_fr}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                      {post.read_time > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" aria-hidden />
                          {post.read_time} {t("minRead")}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-primary hover:text-primary ml-auto"
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          aria-label={`${t("readMore")} — ${post.title_fr}`}
                        >
                          {t("readMore")}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog">
                  {t("viewAll")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
