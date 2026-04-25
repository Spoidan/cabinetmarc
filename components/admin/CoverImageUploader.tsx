"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadCoverImage } from "@/app/(admin)/admin/cours/[id]/editor-actions";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function CoverImageUploader({
  courseId,
  initialUrl,
}: {
  courseId: string;
  initialUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = React.useState<string | null>(initialUrl);
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Image trop volumineuse (max 5 Mo).");
      return;
    }
    setPending(true);
    try {
      const buf = await file.arrayBuffer();
      const res = await uploadCoverImage(courseId, {
        name: file.name,
        type: file.type,
        bytes: buf,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.data) setUrl(res.data.url);
      toast.success("Image téléversée.");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted border border-border">
        {url ? (
          <Image src={url} alt="Cover" fill sizes="640px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <Upload className="w-4 h-4" />
        {pending ? "Téléversement..." : url ? "Remplacer l'image" : "Téléverser une image"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Formats : JPG, PNG, WebP, AVIF · taille max 5 Mo · ratio recommandé 16:9
      </p>
    </div>
  );
}
