"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Trash2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";

type MediaFile = {
  name: string;
  metadata?: { size?: number; mimetype?: string };
  url: string;
};

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then(({ data }) => { setFiles(data ?? []); setLoading(false); })
      .catch(() => { toast.error("Erreur de chargement des fichiers"); setLoading(false); });
  }, []);

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true);
    for (const file of accepted) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        const { data, error } = await res.json();
        if (error) {
          toast.error(`Erreur: ${error}`);
        } else {
          toast.success(`${file.name} uploadé`);
          setFiles((prev) => [data, ...prev]);
        }
      } catch {
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }
    setUploading(false);
  }, []);

  const deleteFile = async (name: string) => {
    if (!confirm("Supprimer ce fichier définitivement ?")) return;
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.name !== name));
      toast.success("Fichier supprimé");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [], "application/pdf": [] },
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Médiathèque</h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "Chargement..." : `${files.length} fichier${files.length !== 1 ? "s" : ""} dans Supabase Storage`}
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors mb-8 ${
          uploading
            ? "opacity-60 cursor-not-allowed border-border"
            : isDragActive
            ? "border-primary bg-primary/5 cursor-copy"
            : "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {uploading
            ? <Loader2 className="w-7 h-7 text-primary animate-spin" />
            : <Upload className="w-7 h-7 text-primary" />}
        </div>
        <p className="font-semibold mb-1">
          {uploading
            ? "Upload en cours..."
            : isDragActive
            ? "Déposez les fichiers ici"
            : "Glissez-déposez vos fichiers"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">Images, vidéos, PDF · Max 10 MB</p>
        {!uploading && (
          <Button variant="outline" size="sm" type="button">
            Parcourir
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          Chargement des fichiers...
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Aucun fichier. Uploadez vos premiers médias ci-dessus.
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((f) => {
            const isImage =
              f.metadata?.mimetype?.startsWith("image/") ??
              /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(f.name);
            const size = f.metadata?.size ?? 0;
            return (
              <div key={f.name} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <File className="w-10 h-10 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(f.url); toast.success("URL copiée !"); }}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                      title="Copier l'URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFile(f.name)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-white"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate" title={f.name}>{f.name}</p>
                  <p className="text-xs text-muted-foreground">{size ? formatFileSize(size) : "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
