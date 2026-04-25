import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML produced by the TipTap editor. Allows a rich but safe subset.
 * Keep this in one place so both SSR and client use identical rules.
 */
export function sanitizeLessonHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
      "rel",
      "loading",
    ],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });
}
