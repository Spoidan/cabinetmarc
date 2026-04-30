"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createCoverUploadUrl,
  saveCoverImageUrl,
} from "@/app/(admin)/admin/cours/[id]/editor-actions";

const MAX_BYTES = 5 * 1024 * 1024;

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

export function CoverImageUploader({
  courseId,
  initialUrl,
}: {
  courseId: string;
  initialUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = React.useState<string | null>(initialUrl);
  const [state, setState] = React.useState<UploadState>({ status: "idle" });

  const onFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Image trop volumineuse (max 5 Mo).");
      return;
    }

    setState({ status: "uploading", progress: 0 });

    try {
      // 1 — Get a signed upload URL from the server
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const urlRes = await createCoverUploadUrl(courseId, ext);
      if (!urlRes.ok) {
        setState({ status: "error", message: urlRes.error });
        toast.error(urlRes.error);
        return;
      }
      const { signedUrl, path } = urlRes.data!;

      // 2 — PUT the file directly to Supabase Storage via XHR (for progress events)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader("x-upsert", "true");

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setState({
              status: "uploading",
              progress: Math.min(99, Math.round((e.loaded / e.total) * 100)),
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Supabase a retourné ${xhr.status}: ${xhr.responseText}`));
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Erreur réseau pendant le téléversement."))
        );
        xhr.addEventListener("abort", () =>
          reject(new Error("Téléversement annulé."))
        );

        xhr.send(file);
      });

      // 3 — Record the public URL in the database
      setState({ status: "uploading", progress: 100 });
      const saveRes = await saveCoverImageUrl(courseId, path);
      if (!saveRes.ok) {
        setState({ status: "error", message: saveRes.error });
        toast.error(saveRes.error);
        return;
      }

      setUrl(saveRes.data!.url);
      setState({ status: "success" });
      toast.success("Image de couverture mise à jour.");
      router.refresh();

      // Reset to idle after showing success briefly
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
      {/* Preview area */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
        {url ? (
          <Image
            src={url}
            alt="Image de couverture"
            fill
            sizes="640px"
            className="object-cover"
            unoptimized={url.startsWith("blob:")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">Aucune image de couverture</p>
          </div>
        )}

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
            <span className="text-white text-2xl font-bold tabular-nums">{progress}%</span>
            <div className="w-2/3 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/70 text-xs">Téléversement en cours…</span>
          </div>
        )}

        {/* Success overlay (brief) */}
        {state.status === "success" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-12 h-12 text-white drop-shadow" />
              <span className="text-white text-sm font-medium">Image enregistrée</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar below image */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Téléversement en cours…</span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-150",
                progress === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {state.status === "error" && (
        <div className="flex items-center gap-2 text-destructive text-xs rounded-lg bg-destructive/10 px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full sm:w-auto"
      >
        <Upload className="w-4 h-4" />
        {isUploading
          ? `Téléversement… ${progress}%`
          : url
          ? "Remplacer l'image"
          : "Téléverser une image"}
      </Button>

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP ou AVIF · max 5 Mo · ratio recommandé 16:9
      </p>
    </div>
  );
}
