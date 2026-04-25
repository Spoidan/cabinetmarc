"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

function segmentLabel(segment: string) {
  const map: Record<string, string> = {
    admin: "Admin",
    categories: "Catégories",
    cours: "Cours",
    lecons: "Modules & Leçons",
    quiz: "Quiz",
    utilisateurs: "Étudiants",
    instructeurs: "Instructeurs",
    administrateurs: "Administrateurs",
    inscriptions: "Inscriptions",
    content: "Actualités",
    pages: "Pages",
    media: "Médias",
    certificats: "Certificats",
    rapports: "Rapports",
    progression: "Progression",
    revenus: "Revenus",
    settings: "Paramètres",
    editer: "Éditer",
    apercu: "Aperçu",
  };
  if (map[segment]) return map[segment];
  // UUID-like? show truncated
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return segment.slice(0, 8);
  return segment;
}

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>Administration</SheetTitle>
          </SheetHeader>
          <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
            <AdminSidebar />
          </div>
        </SheetContent>
      </Sheet>

      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm min-w-0">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const href = "/" + segments.slice(0, i + 1).join("/");
          return (
            <React.Fragment key={`${seg}-${i}`}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
              {isLast ? (
                <span className="text-foreground font-medium truncate">
                  {segmentLabel(seg)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground truncate"
                >
                  {segmentLabel(seg)}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
          aria-label="Ouvrir la recherche rapide (Cmd+K)"
        >
          <Search className="w-4 h-4" />
          <span>Rechercher...</span>
          <kbd className="ml-3 text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-sans">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <UserButton />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
