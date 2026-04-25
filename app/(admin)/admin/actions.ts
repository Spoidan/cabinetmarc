"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

export async function toggleCoursePublished(id: string, publish: boolean): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("courses")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cours");
  revalidatePath("/cours");
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cours");
  return { ok: true };
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_categories").update({ is_active: active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_categories").insert({
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    icon: input.icon ?? null,
    is_active: true,
    sort_order: 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function createCourse(input: {
  title: string;
  slug: string;
  category_id: string;
  level?: "debutant" | "intermediaire" | "avance";
  price_bif?: number;
}): Promise<Result & { id?: string }> {
  const userId = await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("courses")
    .insert({
      title: input.title,
      slug: input.slug,
      category_id: input.category_id,
      level: input.level ?? "debutant",
      price_bif: input.price_bif ?? 0,
      author_id: userId,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Échec de la création." };
  revalidatePath("/admin/cours");
  return { ok: true, id: data.id };
}

export async function setUserRole(userId: string, role: "student" | "instructor" | "admin"): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/instructeurs");
  revalidatePath("/admin/administrateurs");
  return { ok: true };
}

export async function bulkUpdateCourses(
  ids: string[],
  op: "publish" | "unpublish" | "delete"
): Promise<Result & { affected?: number }> {
  await requireAdmin();
  if (ids.length === 0) return { ok: false, error: "Aucun cours sélectionné." };
  const admin = createSupabaseAdminClient();

  if (op === "delete") {
    const { error, count } = await admin.from("courses").delete({ count: "exact" }).in("id", ids);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/cours");
    revalidatePath("/cours");
    return { ok: true, affected: count ?? ids.length };
  }

  const publish = op === "publish";
  const { error, count } = await admin
    .from("courses")
    .update(
      {
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      },
      { count: "exact" }
    )
    .in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cours");
  revalidatePath("/cours");
  return { ok: true, affected: count ?? ids.length };
}
