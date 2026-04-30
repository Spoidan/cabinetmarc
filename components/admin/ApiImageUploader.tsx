"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, ImageIcon, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

export function ApiImageUploader({
  uploadApiPath,
  bucket,
  value,
  onChange,
  aspect = "landscape",
  label,
}: {
  uploadApiPath: string;
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: "square" | "landscape";
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [state, setState] = React.useState<UploadState>({ status: "idle" });

  const onFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo).");
      return;
    }
    setState({ status: "uploading", progress: 0 });

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const res = await fetch(uploadApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ext }),
      });
      if (!res.ok) throw new Error("Impossible d'obtenir l'URL de téléversement.");
      const { signedUrl, path } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable)
            setState({ status: "uploading", progress: Math.min(99, Math.round((e.loaded / e.total) * 100)) });
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Erreur ${xhr.status}: ${xhr.responseText}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Erreur réseau.")));
        xhr.send(file);
      });

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
      onChange(publicUrl);
      setState({ status: "success" });
      toast.success("Image téléversée avec succès.");
      setTimeout(() => setState({ status: "idle" }), 2500);
    } catch (err) {
      const msg = (err as Error).message || "Erreur lors du téléversement.";
      setState({ status: "error", message: msg });
      toast.error(msg);
    }
  };

  const isUploading = state.status === "uploading";
  const progress = state.status === "uploading" ? state.progress : 0;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-muted border border-border group",
          aspect === "square" ? "aspect-square max-w-[200px]" : "aspect-[16/9]"
        )}
      >
        {value ? (
          <Image src={value} alt={label ?? "Image"} fill sizes="400px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <p className="text-xs text-center px-4">{label ?? "Aucune image"}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <span className="text-white text-2xl font-bold tabular-nums">{progress}%</span>
            <div className="w-2/3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {state.status === "success" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        )}

        {value && !isUploading && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {state.status === "error" && (
        <div className="flex items-center gap-2 text-destructive text-xs rounded-lg bg-destructive/10 px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.message}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        <Upload className="w-3.5 h-3.5" />
        {isUploading ? `Téléversement… ${progress}%` : value ? "Changer l'image" : "Téléverser une image"}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG ou WebP · max 5 Mo</p>
    </div>
  );
}
