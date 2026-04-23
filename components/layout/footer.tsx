"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

const footerLinks = {
  quickLinks: [
    { href: "/", label_key: "home" },
    { href: "/about", label_key: "about" },
    { href: "/courses", label_key: "courses" },
    { href: "/services", label_key: "services" },
    { href: "/team", label_key: "team" },
    { href: "/blog", label_key: "blog" },
  ],
  services: [
    { href: "/services#consulting", label: "Conseil & Expertise" },
    { href: "/services#training", label: "Formation Professionnelle" },
    { href: "/services#research", label: "Recherche Appliquée" },
    { href: "/services#elearning", label: "E-Learning" },
  ],
};

export function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const newsletterT = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success(newsletterT("success"));
        setEmail("");
      } else {
        toast.error(newsletterT("error"));
      }
    } catch {
      toast.error(newsletterT("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0A0F1E] text-white">
      {/* Top section */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Cabinet <span className="text-primary">MARC</span></span>
                <p className="text-[10px] text-white/40 leading-none tracking-wider uppercase">Excellence & Innovation</p>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{t("description")}</p>
            <div className="flex items-center gap-3">
              {[
                { href: "#", label: "Facebook" },
                { href: "#", label: "Twitter" },
                { href: "#", label: "LinkedIn" },
                { href: "#", label: "YouTube" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors duration-200 text-xs font-bold"
                >
                  {label[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">{t("quick_links")}</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map(({ href, label_key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white flex items-center gap-2 group transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {navT(label_key as Parameters<typeof navT>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">{t("services")}</h4>
            <ul className="space-y-3">
              {footerLinks.services.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white flex items-center gap-2 group transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 mt-8">{t("contact")}</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>info@cabinetmarc.org</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>+257 00 000 000</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Bujumbura, Burundi</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">{t("newsletter")}</h4>
            <p className="text-sm text-white/60 mb-5 leading-relaxed">{newsletterT("description")}</p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <Input
                type="email"
                placeholder={newsletterT("placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                {loading ? "..." : newsletterT("cta")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Bottom bar */}
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Cabinet MARC. {t("rights")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white/70 transition-colors">{t("privacy")}</Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white/70 transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
