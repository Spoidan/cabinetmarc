"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  HelpCircle,
  Users,
  ClipboardList,
  Award,
  Settings,
  PlusCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const COMMANDS = [
  { group: "Raccourcis", items: [
    { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { label: "Cours", href: "/admin/cours", icon: BookOpen },
    { label: "Catégories", href: "/admin/categories", icon: FolderTree },
    { label: "Quiz", href: "/admin/quiz", icon: HelpCircle },
    { label: "Étudiants", href: "/admin/utilisateurs", icon: Users },
    { label: "Inscriptions", href: "/admin/inscriptions", icon: ClipboardList },
    { label: "Certificats", href: "/admin/certificats", icon: Award },
    { label: "Paramètres", href: "/admin/settings", icon: Settings },
  ]},
  { group: "Actions", items: [
    { label: "Nouveau cours", href: "/admin/cours?nouveau=1", icon: PlusCircle },
    { label: "Nouvelle catégorie", href: "/admin/categories?nouvelle=1", icon: PlusCircle },
  ]},
];

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-xl">
        <Command className="bg-transparent">
          <Command.Input
            placeholder="Rechercher une page, un cours, un étudiant..."
            className="w-full h-12 px-4 bg-background border-b border-border text-sm outline-none"
          />
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat
            </Command.Empty>
            {COMMANDS.map((group) => (
              <Command.Group
                key={group.group}
                heading={group.group}
                className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest"
              >
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={item.label}
                      onSelect={() => go(item.href)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
