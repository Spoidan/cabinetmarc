"use client";

import * as React from "react";
import { toast } from "sonner";
import { Upload, Video, CheckCircle2, AlertCircle, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createVideoUploadUrl,
  saveVideoPath,
} from "@/app/(admin)/admin/cours/[id]/editor-actions";

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

function isExternalUrl(v: string) {
  return /^https?:\/\//i.test(v);
}

export function LessonVideoUploader({
  lessonId,
  value,
  onChange,
}: {
  lessonId: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [state, setState] = React.useState<UploadState>({ status: "idle" });
  const [urlInput, setUrlInput] = React.useState(isExternalUrl(value) ? value : "");

  const isUploading = state.status === "uploading";
  const progress = state.status === "uploading" ? state.progress : 0;

  const hasStoragePath = value && !isExternalUrl(value);
  const hasExternalUrl = value && isExternalUrl(value);

  const onFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Fichier trop volumineux (max 500 Mo).");
      return;
    }

    setState({ status: "uploading", progress: 0 });

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const urlRes = await createVideoUploadUrl(lessonId, ext);
      if (!urlRes.ok) {
        setState({ status: "error", message: urlRes.error });
        toast.error(urlRes.error);
        return;
      }
      const { signedUrl, path } = urlRes.data!;

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
          else reject(new Error(`Erreur Supabase ${xhr.status}: ${xhr.responseText}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Erreur réseau.")));
        xhr.addEventListener("abort", () => reject(new Error("Téléversement annulé.")));

        xhr.send(file);
      });

      setState({ status: "uploading", progress: 100 });
      const saveRes = await saveVideoPath(lessonId, path);
      if (!saveRes.ok) {
        setState({ status: "error", message: saveRes.error });
        toast.error(saveRes.error);
        return;
      }

      onChange(path);
      setUrlInput("");
      setState({ status: "success" });
      toast.success("Vidéo téléversée.");
      setTimeout(() => setState({ status: "idle" }), 2500);
    } catch (err) {
      const msg = (err as Error).message || "Erreur lors du téléversement.";
      setState({ status: "error", message: msg });
      toast.error(msg);
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!isExternalUrl(trimmed)) {
      toast.error("URL invalide. Entrez une URL YouTube, Vimeo ou http(s).");
      return;
    }
    onChange(trimmed);
    toast.success("URL vidéo enregistrée.");
  };

  const clearVideo = () => {
    onChange("");
    setUrlInput("");
    setState({ status: "idle" });
  };

  return (
    <div className="space-y-3">
      {/* Current video indicator */}
      {(hasStoragePath || hasExternalUrl) && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <Video className="w-4 h-4 shrink-0" />
          <span className="flex-1 truncate">
            {hasStoragePath ? `Stockage : ${value.split("/").pop()}` : value}
          </span>
          <button
            type="button"
            onClick={clearVideo}
            className="ml-1 hover:text-destructive transition-colors"
            aria-label="Supprimer la vidéo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* URL input */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">URL YouTube / Vimeo</Label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            placeholder="https://youtu.be/..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={applyUrl} disabled={!urlInput.trim()}>
            <LinkIcon className="w-3.5 h-3.5" />
            Appliquer
          </Button>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Upload section */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Téléverser un fichier vidéo</Label>

        {isUploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Téléversement en cours…</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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

        {state.status === "success" && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Vidéo enregistrée avec succès.
          </div>
        )}

        {state.status === "error" && (
          <div className="flex items-center gap-2 text-destructive text-xs rounded-lg bg-destructive/10 px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
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
          className="w-full"
        >
          <Upload className="w-4 h-4" />
          {isUploading
            ? `Téléversement… ${progress}%`
            : "Téléverser une vidéo"}
        </Button>
        <p className="text-xs text-muted-foreground">MP4, WebM, MOV · max 500 Mo</p>
      </div>
    </div>
  );
}
