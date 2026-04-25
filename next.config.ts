import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      // English legacy routes → French canonical routes
      { source: "/courses", destination: "/cours", permanent: true },
      { source: "/courses/:slug*", destination: "/cours/:slug*", permanent: true },
      { source: "/learn/:slug/:rest*", destination: "/cours/:slug/apprendre/:rest*", permanent: true },
      { source: "/checkout/:slug", destination: "/cours/:slug", permanent: false },
      { source: "/dashboard", destination: "/mes-cours", permanent: true },
      { source: "/dashboard/:path*", destination: "/mes-cours", permanent: true },
      // Legacy auth routes
      { source: "/sign-in", destination: "/connexion", permanent: true },
      { source: "/sign-in/:path*", destination: "/connexion/:path*", permanent: true },
      { source: "/sign-up", destination: "/inscription", permanent: true },
      { source: "/sign-up/:path*", destination: "/inscription/:path*", permanent: true },
      // Admin French aliases
      { source: "/admin/courses", destination: "/admin/cours", permanent: true },
      { source: "/admin/courses/:path*", destination: "/admin/cours/:path*", permanent: true },
      { source: "/admin/team", destination: "/admin/utilisateurs", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
