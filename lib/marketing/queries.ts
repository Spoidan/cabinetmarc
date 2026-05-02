import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type TeamMember = {
  id: string;
  name: string;
  role_fr: string;
  bio_fr: string;
  image_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  order_index: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title_fr: string;
  excerpt_fr: string;
  content_fr: string;
  category: string;
  tags: string[];
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  read_time: number;
  created_at: string;
  author_name: string | null;
};

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type OwnTestimonial = Testimonial & { is_approved: boolean };

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  try {
    const { data } = await getSupabase()
      .from("testimonials")
      .select("id, name, rating, comment, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getUserOwnTestimonial(userId: string): Promise<OwnTestimonial | null> {
  try {
    const { data } = await getSupabase()
      .from("testimonials")
      .select("id, name, rating, comment, is_approved, created_at")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data } = await getSupabase()
      .from("team_members")
      .select("id, name, role_fr, bio_fr, image_url, linkedin_url, email, order_index")
      .eq("is_active", true)
      .order("order_index", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("id, slug, title_fr, excerpt_fr, category, image_url, published_at, read_time, created_at, author:team_members(name)")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    return (data ?? []).map((p: Record<string, unknown>) => {
      const { author, ...rest } = p;
      return {
        ...rest,
        content_fr: "",
        tags: [],
        is_published: true,
        author_name: (author as { name: string } | null)?.name ?? null,
      } as unknown as BlogPost;
    });
  } catch {
    return [];
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("id, slug, title_fr, excerpt_fr, content_fr, category, tags, image_url, is_published, published_at, read_time, created_at, author:team_members(name)")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    return (data ?? []).map((p: Record<string, unknown>) => {
      const { author, ...rest } = p;
      return {
        ...rest,
        author_name: (author as { name: string } | null)?.name ?? null,
      } as unknown as BlogPost;
    });
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("id, slug, title_fr, excerpt_fr, content_fr, category, tags, image_url, is_published, published_at, read_time, created_at, author:team_members(name)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (!data) return null;
    const { author, ...rest } = data as Record<string, unknown>;
    return {
      ...rest,
      author_name: (author as { name: string } | null)?.name ?? null,
    } as unknown as BlogPost;
  } catch {
    return null;
  }
}
