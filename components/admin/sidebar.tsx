"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, LayoutDashboard, FileText, BookMarked, Users, Image,
  Settings, Home, ChevronRight, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Contenu", icon: FileText },
  { href: "/admin/courses", label: "Formations", icon: BookMarked },
  { href: "/admin/team", label: "Équipe", icon: Users },
  { href: "/admin/media", label: "Médias", icon: Image },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0A0F1E] border-r border-white/5 z-40 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">Cabinet <span className="text-primary">MARC</span></span>
            <p className="text-[10px] text-white/30 leading-none">Administration</p>
          </div>
        </Link>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-semibold">Panneau Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive(href, exact)
                ? "bg-primary/15 text-primary border border-primary/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4" />
              {label}
            </div>
            <ChevronRight className={cn(
              "w-3 h-3 transition-opacity",
              isActive(href, exact) ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            )} />
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home className="w-4 h-4" />
          Voir le site
        </Link>
      </div>
    </aside>
  );
}
