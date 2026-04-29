"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  Layers,
  HelpCircle,
  Users,
  GraduationCap,
  UserCog,
  Newspaper,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Award,
  Wallet,
  Settings,
  Home,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "",
    items: [
      { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/categories", label: "Catégories", icon: FolderTree },
      { href: "/admin/cours", label: "Cours", icon: BookOpen },
      { href: "/admin/lecons", label: "Modules & Leçons", icon: Layers },
      { href: "/admin/quiz", label: "Quiz", icon: HelpCircle },
    ],
  },
  {
    title: "Utilisateurs",
    items: [
      { href: "/admin/utilisateurs", label: "Étudiants", icon: Users },
      { href: "/admin/instructeurs", label: "Instructeurs", icon: GraduationCap },
      { href: "/admin/administrateurs", label: "Administrateurs", icon: UserCog },
      { href: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/admin/content", label: "Actualités", icon: Newspaper },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/media", label: "Médias", icon: ImageIcon },
    ],
  },
  {
    title: "Rapports",
    items: [
      { href: "/admin/rapports/progression", label: "Progression", icon: BarChart3 },
      { href: "/admin/certificats", label: "Certificats", icon: Award },
      { href: "/admin/rapports/revenus", label: "Revenus", icon: Wallet },
    ],
  },
  {
    title: "",
    items: [{ href: "/admin/settings", label: "Paramètres", icon: Settings }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (item: Item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside
      aria-label="Navigation administration"
      className="fixed top-0 left-0 h-full w-64 bg-[#0A0F1E] border-r border-white/5 z-40 hidden lg:flex flex-col"
    >
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-white/5 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Cabinet MARC"
              fill
              sizes="36px"
              className="object-contain p-1"
            />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] text-white/60 uppercase tracking-widest leading-none mb-0.5">
              Le Cabinet
            </p>
            <span className="text-sm font-bold text-white">
              MARC <span className="text-primary">· Admin</span>
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {GROUPS.map((group, i) => (
          <div key={i}>
            {group.title && (
              <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-white/10 text-white border border-white/15"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home className="w-4 h-4" />
          Voir le site
        </Link>
      </div>
    </aside>
  );
}
