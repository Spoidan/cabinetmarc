import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getBlogPostBySlug } from "@/lib/marketing/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title_fr,
    description: post.excerpt_fr,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Économie":       "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Gestion":        "text-sky-600 bg-sky-50 border-sky-200",
  "Droit":          "text-violet-600 bg-violet-50 border-violet-200",
  "Statistiques":   "text-amber-600 bg-amber-50 border-amber-200",
  "Entrepreneuriat":"text-rose-600 bg-rose-50 border-rose-200",
  "TICs":           "text-cyan-600 bg-cyan-50 border-cyan-200",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au blog
        </Link>

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

        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"}`}>
          {post.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">{post.title_fr}</h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          {post.author_name && (
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" /> {post.author_name}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {formatDate(post.published_at ?? post.created_at)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> {post.read_time} min de lecture
          </span>
        </div>

        {post.excerpt_fr && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 italic border-l-4 border-primary/30 pl-4">
            {post.excerpt_fr}
          </p>
        )}

        <div
          className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content_fr }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
