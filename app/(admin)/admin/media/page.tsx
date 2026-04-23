"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, File, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";

const mockFiles = [
  { id: "1", name: "hero-bg.jpg", size: 245760, type: "image/jpeg", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200" },
  { id: "2", name: "logo.png", size: 12288, type: "image/png", url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=200" },
  { id: "3", name: "about-team.jpg", size: 189440, type: "image/jpeg", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200" },
];

export default function AdminMediaPage() {
  const [files, setFiles] = useState(mockFiles);

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach((f) => {
      toast.success(`${f.name} uploadé (simulation)`);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [], "application/pdf": [] },
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Médiathèque</h1>
        <p className="text-muted-foreground mt-1">Gérez vos images, vidéos et fichiers</p>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors mb-8 ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-primary" />
        </div>
        <p className="font-semibold mb-1">
          {isDragActive ? "Déposez les fichiers ici" : "Glissez-déposez vos fichiers"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          ou cliquez pour sélectionner — Images, vidéos, PDF · Max 10 MB
        </p>
        <Button variant="outline" size="sm" type="button">
          Parcourir
        </Button>
      </div>

      {/* Note */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 mb-6">
        Connectez Supabase Storage pour activer l&apos;upload et la gestion réels de fichiers.
      </div>

      {/* Files grid */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map(({ id, name, size, type, url }) => (
          <div key={id} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
              {type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <File className="w-10 h-10 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(url); toast.success("URL copiée !"); }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setFiles((prev) => prev.filter((f) => f.id !== id)); toast.success("Fichier supprimé"); }}
                  className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
