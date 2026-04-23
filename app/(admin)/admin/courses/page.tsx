"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Eye, BookOpen, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Course = {
  id: string;
  title_fr: string;
  title_en: string;
  level: string;
  is_active: boolean;
  is_featured: boolean;
  is_free: boolean;
  price: number;
  instructor: string;
  course_categories: { name_fr: string; gradient: string } | null;
};

const levelLabel: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then(({ data }) => { setCourses(data ?? []); setLoading(false); })
      .catch(() => { toast.error("Erreur de chargement"); setLoading(false); });
  }, []);

  const toggleActive = async (course: Course) => {
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: course.id, is_active: !course.is_active }),
    });
    if (res.ok) {
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_active: !course.is_active } : c));
      toast.success(course.is_active ? "Formation désactivée" : "Formation activée");
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteCourse = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" définitivement ?`)) return;
    const res = await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Formation supprimée");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.title_fr.toLowerCase().includes(search.toLowerCase()) ||
      (c.course_categories?.name_fr ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Formations</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Chargement..." : `${courses.length} formation${courses.length !== 1 ? "s" : ""} au total`}
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Ajoutez vos formations directement depuis Supabase ou via l'API.")}>
          <Plus className="w-4 h-4" />
          Nouvelle formation
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une formation..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            Chargement des formations...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Formation</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Catégorie</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Niveau</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Prix</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${course.course_categories?.gradient ?? "from-gray-400 to-gray-600"} flex items-center justify-center shrink-0`}
                        >
                          <BookOpen className="w-4 h-4 text-white/70" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{course.title_fr}</p>
                          {course.title_en && <p className="text-xs text-muted-foreground">{course.title_en}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{course.course_categories?.name_fr ?? "—"}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{levelLabel[course.level] ?? course.level}</td>
                    <td className="px-5 py-4 text-sm">
                      {course.is_free ? (
                        <Badge variant="emerald" className="text-xs">Gratuit</Badge>
                      ) : (
                        `${course.price} BIF`
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={course.is_active ? "emerald" : "outline"} className="text-xs">
                        {course.is_active ? "Actif" : "Brouillon"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => window.open(`/courses/${course.id}`, "_blank")}
                          title="Prévisualiser"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleActive(course)}
                          title={course.is_active ? "Désactiver" : "Activer"}
                        >
                          {course.is_active
                            ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                            : <ToggleLeft className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => deleteCourse(course.id, course.title_fr)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                {courses.length === 0
                  ? "Aucune formation. Ajoutez vos premières formations dans Supabase."
                  : "Aucune formation trouvée pour cette recherche."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
