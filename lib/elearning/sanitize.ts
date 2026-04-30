import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  // Structure
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "div", "span",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "strong", "b", "em", "i", "u", "s", "mark",
  "sup", "sub",
  // Media / embeds
  "img", "figure", "figcaption",
  "iframe",
  // Links
  "a",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["class", "id", "style"],
  "a": ["href", "target", "rel"],
  "img": ["src", "alt", "width", "height", "loading"],
  "iframe": [
    "src", "width", "height",
    "allow", "allowfullscreen", "frameborder", "scrolling",
  ],
  "td": ["colspan", "rowspan"],
  "th": ["colspan", "rowspan", "scope"],
};

export function sanitizeLessonHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: [
      "www.youtube.com", "youtube.com",
      "player.vimeo.com", "vimeo.com",
      "www.loom.com",
    ],
  });
}
