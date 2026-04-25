"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CourseCard } from "./CourseCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CourseWithCategory } from "@/lib/elearning/queries";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["course_categories"]["Row"];
type Level = "debutant" | "intermediaire" | "avance";
type Price = "all" | "free" | "paid";

const LEVELS: { value: Level; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CatalogClient({
  courses,
  categories,
  initialCategorySlug,
}: {
  courses: CourseWithCategory[];
  categories: Category[];
  initialCategorySlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState("");
  const debounced = useDebounced(query, 300);

  const initialCategories = React.useMemo(
    () => (initialCategorySlug ? new Set<string>([initialCategorySlug]) : new Set<string>()),
    [initialCategorySlug]
  );
  const [selectedCats, setSelectedCats] = React.useState<Set<string>>(initialCategories);
  const [selectedLevels, setSelectedLevels] = React.useState<Set<Level>>(new Set());
  const [price, setPrice] = React.useState<Price>("all");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 12;

  const toggleCat = (slug: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setPage(1);
  };
  const toggleLevel = (lvl: Level) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl);
      else next.add(lvl);
      return next;
    });
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return courses.filter((c) => {
      if (q && !`${c.title} ${c.subtitle ?? ""}`.toLowerCase().includes(q)) return false;
      if (selectedCats.size > 0 && (!c.category || !selectedCats.has(c.category.slug))) return false;
      if (selectedLevels.size > 0 && !selectedLevels.has(c.level)) return false;
      if (price === "free" && c.price_bif !== 0) return false;
      if (price === "paid" && c.price_bif === 0) return false;
      return true;
    });
  }, [courses, debounced, selectedCats, selectedLevels, price]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Sync categorie= query param (only the first selected category for deep-link)
  React.useEffect(() => {
    const current = searchParams.get("categorie") ?? "";
    const next = selectedCats.size === 1 ? [...selectedCats][0] : "";
    if (current !== next) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (next) params.set("categorie", next);
      else params.delete("categorie");
      router.replace(`/cours${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }
  }, [selectedCats, router, searchParams]);

  const reset = () => {
    setQuery("");
    setSelectedCats(new Set());
    setSelectedLevels(new Set());
    setPrice("all");
    setPage(1);
  };

  const hasFilters =
    query || selectedCats.size > 0 || selectedLevels.size > 0 || price !== "all";

  return (
    <div className="container mx-auto py-10">
      <header className="max-w-3xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Tous nos cours</h1>
        <p className="text-muted-foreground">
          Parcourez notre catalogue complet de formations en ligne.
        </p>
        <div className="relative mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Rechercher un cours"
            placeholder="Rechercher un cours..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-11"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
        <aside className="hidden lg:block">
          <FiltersPanel
            categories={categories}
            selectedCats={selectedCats}
            toggleCat={toggleCat}
            selectedLevels={selectedLevels}
            toggleLevel={toggleLevel}
            price={price}
            setPrice={setPrice}
            hasFilters={Boolean(hasFilters)}
            reset={reset}
          />
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm text-muted-foreground">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-5">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FiltersPanel
                    categories={categories}
                    selectedCats={selectedCats}
                    toggleCat={toggleCat}
                    selectedLevels={selectedLevels}
                    toggleLevel={toggleLevel}
                    price={price}
                    setPrice={setPrice}
                    hasFilters={Boolean(hasFilters)}
                    reset={reset}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">
                {query ? `Aucun résultat pour « ${query} ».` : "Aucun cours ne correspond à vos filtres."}
              </p>
              {hasFilters && (
                <Button size="sm" variant="ghost" className="mt-3" onClick={reset}>
                  <X className="w-4 h-4" />
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="flex items-center justify-center gap-2 mt-10"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({
  categories,
  selectedCats,
  toggleCat,
  selectedLevels,
  toggleLevel,
  price,
  setPrice,
  hasFilters,
  reset,
}: {
  categories: Category[];
  selectedCats: Set<string>;
  toggleCat: (slug: string) => void;
  selectedLevels: Set<Level>;
  toggleLevel: (lvl: Level) => void;
  price: Price;
  setPrice: (p: Price) => void;
  hasFilters: boolean;
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
          Catégorie
        </h2>
        <ul className="space-y-2">
          {categories.map((cat) => {
            const id = `cat-${cat.slug}`;
            return (
              <li key={cat.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={selectedCats.has(cat.slug)}
                  onCheckedChange={() => toggleCat(cat.slug)}
                />
                <Label htmlFor={id} className="text-sm cursor-pointer">
                  {cat.name}
                </Label>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
          Niveau
        </h2>
        <ul className="space-y-2">
          {LEVELS.map((lvl) => {
            const id = `lvl-${lvl.value}`;
            return (
              <li key={lvl.value} className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={selectedLevels.has(lvl.value)}
                  onCheckedChange={() => toggleLevel(lvl.value)}
                />
                <Label htmlFor={id} className="text-sm cursor-pointer">
                  {lvl.label}
                </Label>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
          Prix
        </h2>
        <div className="space-y-2 text-sm">
          {(["all", "free", "paid"] as Price[]).map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                value={p}
                checked={price === p}
                onChange={() => setPrice(p)}
                className="accent-primary"
              />
              <span>{p === "all" ? "Tous" : p === "free" ? "Gratuit" : "Payant"}</span>
            </label>
          ))}
        </div>
      </section>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="w-full" onClick={reset}>
          <X className="w-4 h-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
