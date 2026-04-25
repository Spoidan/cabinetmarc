"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Quiz = {
  id: string;
  title: string;
  pass_score_percent: number;
  module_id: string | null;
  module_title: string | null;
  course_id: string;
  course_title: string;
  course_slug: string;
  question_count: number;
  attempt_count: number;
};

export function QuizzesTable({ quizzes }: { quizzes: Quiz[] }) {
  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState<"all" | "module" | "final">("all");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return quizzes.filter((qz) => {
      if (scope === "module" && qz.module_id === null) return false;
      if (scope === "final" && qz.module_id !== null) return false;
      if (
        q &&
        !`${qz.title} ${qz.module_title ?? ""} ${qz.course_title}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [quizzes, search, scope]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un quiz..."
            className="pl-9 h-9"
          />
        </div>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Type de quiz"
        >
          <option value="all">Tous</option>
          <option value="module">Quiz de module</option>
          <option value="final">Examens finaux</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Quiz</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Questions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Score min.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tentatives</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {quizzes.length === 0
                    ? "Aucun quiz n'a encore été créé."
                    : "Aucun quiz ne correspond à vos filtres."}
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.title}</p>
                    {q.module_title && (
                      <p className="text-xs text-muted-foreground">{q.module_title}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/cours/${q.course_id}/editer`} className="hover:text-primary">
                      {q.course_title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {q.module_id ? (
                      <Badge variant="outline">Module</Badge>
                    ) : (
                      <Badge variant="gold">Examen final</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{q.question_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{q.pass_score_percent} %</td>
                  <td className="px-4 py-3 text-muted-foreground">{q.attempt_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/cours/${q.course_id}/editer`}
                        title="Éditer"
                        aria-label="Ouvrir l'éditeur"
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
