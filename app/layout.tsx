import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
    template: "%s | Cabinet MARC",
  },
  description:
    "Cabinet MARC est une institution spécialisée en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs, basée au Burundi. Conseil, formation professionnelle et e-learning de qualité supérieure.",
  keywords: [
    "Cabinet MARC",
    "formation Burundi",
    "consulting Burundi",
    "économie",
    "gestion",
    "droit",
    "statistiques",
    "entrepreneuriat",
    "TICs",
    "e-learning Afrique",
  ],
  authors: [{ name: "Cabinet MARC" }],
  creator: "Cabinet MARC",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cabinetmarc.org"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: "/",
    siteName: "Cabinet MARC",
    title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
    description:
      "Excellence en conseil, formation professionnelle et e-learning. Spécialisé en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Cabinet MARC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabinet MARC | Conseil, Formation & E-Learning",
    description: "Excellence en conseil, formation et e-learning au Burundi.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
