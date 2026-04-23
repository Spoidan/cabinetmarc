"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, BookOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockCourses = [
  { id: "1", title: "Macroéconomie Avancée", category: "Économie", level: "Avancé", status: "active", students: 84, gradient: "from-emerald-500 to-teal-600" },
  { id: "2", title: "Gestion de Projet PMI", category: "Gestion", level: "Intermédiaire", status: "active", students: 112, gradient: "from-sky-500 to-blue-600" },
  { id: "3", title: "Droit des Affaires en Afrique", category: "Droit", level: "Débutant", status: "active", students: 67, gradient: "from-violet-500 to-purple-600" },
  { id: "4", title: "Économétrie Appliquée", category: "Statistiques", level: "Avancé", status: "active", students: 45, gradient: "from-amber-500 to-orange-600" },
  { id: "5", title: "Créer sa Startup en Afrique", category: "Entrepreneuriat", level: "Débutant", status: "active", students: 203, gradient: "from-rose-500 to-red-600" },
  { id: "6", title: "Transformation Digitale", category: "TICs", level: "Intermédiaire", status: "draft", students: 0, gradient: "from-cyan-500 to-sky-600" },
];

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Formations</h1>
          <p className="text-muted-foreground mt-1">{mockCourses.length} formations au total</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle formation
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une formation..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Formation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Catégorie</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Niveau</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Étudiants</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Statut</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course, i) => (
                <tr key={course.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center shrink-0`}>
                        <BookOpen className="w-4 h-4 text-white/70" />
                      </div>
                      <span className="font-medium text-sm">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{course.category}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{course.level}</td>
                  <td className="px-5 py-4 text-sm font-medium">{course.students}</td>
                  <td className="px-5 py-4">
                    <Badge variant={course.status === "active" ? "emerald" : "outline"} className="text-xs">
                      {course.status === "active" ? "Actif" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => toast.info("Prévisualisation...")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => toast.info("Édition...")}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => toast.error("Suppression...")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            Aucune formation trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
