import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, User, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Aperçu de l'article" };

type BlogPostRow = {
  id: string;
  title_fr: string;
  excerpt_fr: string | null;
  content_fr: string | null;
  category: string | null;
  image_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  read_time: number;
  author: { name: string } | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Économie":        "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Gestion":         "text-sky-600 bg-sky-50 border-sky-200",
  "Droit":           "text-violet-600 bg-violet-50 border-violet-200",
  "Statistiques":    "text-amber-600 bg-amber-50 border-amber-200",
  "Entrepreneuriat": "text-rose-600 bg-rose-50 border-rose-200",
  "TICs":            "text-cyan-600 bg-cyan-50 border-cyan-200",
};

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (admin as any)
    .from("blog_posts")
    .select("*, author:team_members(name)")
    .eq("id", id)
    .maybeSingle() as { data: BlogPostRow | null };

  if (!post) notFound();

  const authorName = (post.author as { name: string } | null)?.name ?? null;

  return (
    <div>
      {/* Admin preview banner */}
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 flex flex-wrap items-center gap-3">
        <Eye className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400 flex-1">
          Mode aperçu — ceci n&apos;est pas encore visible par les visiteurs tant que l&apos;article n&apos;est pas publié.
        </span>
        <Badge variant={post.is_published ? "emerald" : "outline"} className="text-xs shrink-0">
          {post.is_published ? "Publié" : "Brouillon"}
        </Badge>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={`/admin/blog/${id}`}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à l&apos;édition
          </Link>
        </Button>
      </div>

      {/* Article content — mirrors the public /blog/[slug] layout */}
      <div className="max-w-3xl mx-auto">
        {post.image_url && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image_url}
              alt={post.title_fr}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.category && (
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${
              CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"
            }`}
          >
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
          {post.title_fr || (
            <span className="text-muted-foreground italic">Sans titre</span>
          )}
        </h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          {authorName && (
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {authorName}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(post.published_at ?? post.created_at)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {post.read_time} min de lecture
          </span>
        </div>

        {post.excerpt_fr && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 italic border-l-4 border-primary/30 pl-4">
            {post.excerpt_fr}
          </p>
        )}

        {post.content_fr ? (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content_fr }}
          />
        ) : (
          <p className="text-muted-foreground italic">
            Aucun contenu rédigé pour le moment.
          </p>
        )}

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
            {(post.tags as string[]).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
