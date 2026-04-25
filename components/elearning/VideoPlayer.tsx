"use client";

import { useMemo } from "react";

function parseYouTube(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function parseVimeo(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[0];
      if (/^\d+$/.test(id)) return id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const kind = useMemo(() => {
    const yt = parseYouTube(src);
    if (yt) return { type: "youtube" as const, id: yt };
    const vm = parseVimeo(src);
    if (vm) return { type: "vimeo" as const, id: vm };
    return { type: "file" as const };
  }, [src]);

  if (kind.type === "youtube") {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${kind.id}?modestbranding=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  if (kind.type === "vimeo") {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${kind.id}?dnt=1`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <video
        src={src}
        controls
        controlsList="nodownload"
        className="absolute inset-0 w-full h-full"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
