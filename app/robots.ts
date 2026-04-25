import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cabinetmarc.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cours", "/cours/", "/about", "/services", "/team", "/blog", "/contact"],
        disallow: ["/admin", "/admin/", "/api", "/connexion", "/inscription", "/mes-cours"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
