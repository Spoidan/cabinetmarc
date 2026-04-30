import { createClient } from "@supabase/supabase-js";
import {
  HERO_DEFAULTS,
  HOME_HERO_DEFAULTS,
  type HeroContent,
  type HomeHeroContent,
} from "./content-defaults";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getHeroContent(page: string): Promise<HeroContent> {
  try {
    const { data } = await getSupabase()
      .from("page_content")
      .select("content")
      .eq("page_key", page)
      .eq("section_key", "hero")
      .eq("locale", "fr")
      .maybeSingle();

    if (data?.content) {
      return { ...HERO_DEFAULTS[page], ...JSON.parse(data.content) };
    }
  } catch {
    // fall through
  }
  return HERO_DEFAULTS[page] ?? {};
}

export async function getHomeHeroContent(): Promise<HomeHeroContent> {
  try {
    const { data } = await getSupabase()
      .from("hero_content")
      .select("*")
      .eq("locale", "fr")
      .maybeSingle();

    if (data) {
      const { id: _id, created_at: _c, updated_at: _u, locale: _l, ...rest } = data;
      return { ...HOME_HERO_DEFAULTS, ...rest };
    }
  } catch {
    // fall through
  }
  return HOME_HERO_DEFAULTS;
}

export type { HeroContent, HomeHeroContent };
