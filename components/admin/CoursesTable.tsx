"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowSelectionState,
  type Column,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  toggleCoursePublished,
  deleteCourse,
  bulkUpdateCourses,
} from "@/app/(admin)/admin/actions";
import { formatBIF, formatDateFr } from "@/lib/format";
import { cn } from "@/lib/utils";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  price_bif: number;
  level: string;
  author_id: string | null;
  category_id: string;
  category_name?: string;
  enrollments_count: number;
};

type Cat = { id: string; name: string };

const LEVELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export function CoursesTable({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: Cat[];
}) {
  const router = useRouter();

  const [globalSearch, setGlobalSearch] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updated_at", desc: true },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; title: string } | null>(null);
  const [bulkConfirm, setBulkConfirm] = React.useState<
    { op: "publish" | "unpublish" | "delete"; ids: string[]; titles: string[] } | null
  >(null);
  const [bulkPending, setBulkPending] = React.useState(false);

  const togglePublish = React.useCallback(
    async (course: CourseRow) => {
      setPendingId(course.id);
      const target = !course.is_published;
      const res = await toggleCoursePublished(course.id, target);
      setPendingId(null);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(target ? "Cours publié." : "Cours dépublié.");
      router.refresh();
    },
    [router]
  );

  const onDeleteSingle = async () => {
    if (!confirmDelete) return;
    setPendingId(confirmDelete.id);
    const res = await deleteCourse(confirmDelete.id);
    setPendingId(null);
    setConfirmDelete(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Cours supprimé.");
    router.refresh();
  };

  const performBulk = async () => {
    if (!bulkConfirm) return;
    setBulkPending(true);
    const res = await bulkUpdateCourses(bulkConfirm.ids, bulkConfirm.op);
    setBulkPending(false);
    setBulkConfirm(null);
    setRowSelection({});
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const labels: Record<typeof bulkConfirm.op, string> = {
      publish: "Cours publiés",
      unpublish: "Cours dépubliés",
      delete: "Cours supprimés",
    };
    toast.success(`${labels[bulkConfirm.op]} : ${res.affected ?? bulkConfirm.ids.length}`);
    router.refresh();
  };

  const columns = React.useMemo<ColumnDef<CourseRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Tout sélectionner"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Sélectionner ce cours"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: ({ column }) => <SortHeader column={column}>Titre</SortHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "category_id",
        header: "Catégorie",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.category_name ?? "—"}</span>
        ),
        filterFn: (row, _id, value) => {
          if (!value || value === "all") return true;
          return row.original.category_id === value;
        },
      },
      {
        accessorKey: "level",
        header: "Niveau",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {LEVELS[row.original.level] ?? row.original.level}
          </span>
        ),
      },
      {
        accessorKey: "price_bif",
        header: ({ column }) => <SortHeader column={column}>Prix</SortHeader>,
        cell: ({ row }) =>
          row.original.price_bif === 0 ? (
            <Badge variant="emerald">Gratuit</Badge>
          ) : (
            <span className="font-medium">{formatBIF(row.original.price_bif)}</span>
          ),
      },
      {
        accessorKey: "is_published",
        header: "Statut",
        cell: ({ row }) => (
          <Badge variant={row.original.is_published ? "emerald" : "outline"}>
            {row.original.is_published ? "Publié" : "Brouillon"}
          </Badge>
        ),
        filterFn: (row, _id, value) => {
          if (!value || value === "all") return true;
          if (value === "published") return row.original.is_published;
          if (value === "draft") return !row.original.is_published;
          return true;
        },
      },
      {
        accessorKey: "enrollments_count",
        header: ({ column }) => <SortHeader column={column}>Inscriptions</SortHeader>,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.enrollments_count}</span>
        ),
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => <SortHeader column={column}>Mise à jour</SortHeader>,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {formatDateFr(row.original.updated_at, "d MMM yyyy")}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <IconBtn
                title={c.is_published ? "Dépublier" : "Publier"}
                onClick={() => togglePublish(c)}
                loading={pendingId === c.id}
              >
                {c.is_published ? (
                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
              </IconBtn>
              <Link
                href={`/cours/${c.slug}`}
                target="_blank"
                title="Aperçu"
                aria-label="Aperçu côté étudiant"
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/cours/${c.id}/editer`}
                title="Éditer"
                aria-label="Ouvrir l'éditeur"
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <IconBtn
                title="Supprimer"
                onClick={() => setConfirmDelete({ id: c.id, title: c.title })}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </IconBtn>
            </div>
          );
        },
      },
    ],
    [pendingId, togglePublish]
  );

  const table = useReactTable({
    data: courses,
    columns,
    state: { sorting, columnFilters, rowSelection, globalFilter: globalSearch },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalSearch,
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      const r = row.original;
      return `${r.title} ${r.slug} ${r.category_name ?? ""}`.toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const selectedRows = table.getSelectedRowModel().flatRows;
  const selectedCount = selectedRows.length;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            className="pl-9 h-9"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
        <select
          value={(table.getColumn("is_published")?.getFilterValue() as string) ?? "all"}
          onChange={(e) =>
            table.getColumn("is_published")?.setFilterValue(e.target.value === "all" ? undefined : e.target.value)
          }
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
        <select
          value={(table.getColumn("category_id")?.getFilterValue() as string) ?? "all"}
          onChange={(e) =>
            table.getColumn("category_id")?.setFilterValue(e.target.value === "all" ? undefined : e.target.value)
          }
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Filtrer par catégorie"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border bg-primary/5">
          <p className="text-sm font-medium">
            {selectedCount} cours sélectionné{selectedCount > 1 ? "s" : ""}
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setBulkConfirm({
                  op: "publish",
                  ids: selectedRows.map((r) => r.original.id),
                  titles: selectedRows.map((r) => r.original.title),
                })
              }
            >
              <ToggleRight className="w-4 h-4" />
              Publier
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setBulkConfirm({
                  op: "unpublish",
                  ids: selectedRows.map((r) => r.original.id),
                  titles: selectedRows.map((r) => r.original.title),
                })
              }
            >
              <ToggleLeft className="w-4 h-4" />
              Dépublier
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                setBulkConfirm({
                  op: "delete",
                  ids: selectedRows.map((r) => r.original.id),
                  titles: selectedRows.map((r) => r.original.title),
                })
              }
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "text-left px-4 py-3 text-xs font-semibold text-muted-foreground",
                      header.column.id === "actions" && "text-right"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  {courses.length === 0
                    ? "Aucun cours pour le moment."
                    : "Aucun cours ne correspond à vos filtres."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/20",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border text-sm">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} cours · {selectedCount} sélectionné
          {selectedCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Supprimer ce cours ?"
        description={
          confirmDelete
            ? `Cette action supprimera définitivement « ${confirmDelete.title} ». Les leçons, quiz et inscriptions associés seront également supprimés.`
            : ""
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={onDeleteSingle}
      />

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onOpenChange={(open) => !open && !bulkPending && setBulkConfirm(null)}
        title={
          bulkConfirm?.op === "delete"
            ? `Supprimer ${bulkConfirm.ids.length} cours ?`
            : bulkConfirm?.op === "publish"
              ? `Publier ${bulkConfirm.ids.length} cours ?`
              : `Dépublier ${bulkConfirm?.ids.length ?? 0} cours ?`
        }
        description={
          bulkConfirm
            ? bulkConfirm.op === "delete"
              ? `${bulkConfirm.ids.length} cours seront supprimés définitivement avec leurs leçons, quiz et inscriptions. Cours concernés : ${bulkConfirm.titles.slice(0, 3).join(" · ")}${bulkConfirm.titles.length > 3 ? ` et ${bulkConfirm.titles.length - 3} autres` : ""}.`
              : `Cours concernés : ${bulkConfirm.titles.slice(0, 3).join(" · ")}${bulkConfirm.titles.length > 3 ? ` et ${bulkConfirm.titles.length - 3} autres` : ""}.`
            : ""
        }
        confirmLabel={
          bulkConfirm?.op === "delete"
            ? "Supprimer"
            : bulkConfirm?.op === "publish"
              ? "Publier"
              : "Dépublier"
        }
        destructive={bulkConfirm?.op === "delete"}
        onConfirm={performBulk}
      />
    </div>
  );
}

function SortHeader({
  column,
  children,
}: {
  column: Column<CourseRow, unknown>;
  children: React.ReactNode;
}) {
  const sort = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="inline-flex items-center gap-1 text-left"
    >
      {children}
      {sort === "asc" ? (
        <ArrowUp className="w-3 h-3" />
      ) : sort === "desc" ? (
        <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );
}

function IconBtn({
  title,
  onClick,
  loading,
  children,
}: {
  title: string;
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
