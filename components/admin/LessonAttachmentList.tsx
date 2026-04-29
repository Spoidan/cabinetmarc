"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadLessonAttachment,
  removeLessonAttachment,
} from "@/app/(admin)/admin/cours/[id]/editor-actions";
import type { LessonAttachment } from "@/types/database";
import { formatFileSize } from "@/lib/format";

const MAX_BYTES = 25 * 1024 * 1024;

export function LessonAttachmentList({
  lessonId,
  attachments,
  onChange,
}: {
  lessonId: string;
  attachments: LessonAttachment[];
  onChange: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  const [list, setList] = React.useState(attachments);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setList(attachments); }, [attachments]);

  const onFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Fichier trop volumineux (max 25 Mo).");
      return;
    }
    setPending("upload");
    try {
      const buf = await file.arrayBuffer();
      const res = await uploadLessonAttachment(lessonId, {
        name: file.name,
        type: file.type,
        size: file.size,
        bytes: buf,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.data) setList((l) => [...l, res.data!.attachment]);
      toast.success("Pièce jointe ajoutée.");
      onChange();
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  const remove = async (path: string) => {
    setPending(path);
    const res = await removeLessonAttachment(lessonId, path);
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setList((l) => l.filter((a) => a.path !== path));
    toast.success("Pièce jointe supprimée.");
    onChange();
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Aucune pièce jointe.</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-xl">
          {list.map((att) => (
            <li
              key={att.path}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{att.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(att.size)} · {att.mime}
                </p>
              </div>
              <button
                type="button"
                disabled={pending === att.path}
                onClick={() => remove(att.path)}
                className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-destructive flex items-center justify-center"
              >
                {pending === att.path ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
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
        disabled={pending === "upload"}
      >
        <Upload className="w-4 h-4" />
        {pending === "upload" ? "Téléversement..." : "Ajouter une pièce jointe"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Taille maximum : 25 Mo par fichier.
      </p>
    </div>
  );
}
