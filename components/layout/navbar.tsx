"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, X, BookOpen, Moon, Sun, Globe, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/courses", key: "courses" },
  { href: "/services", key: "services" },
  { href: "/team", key: "team" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { isSignedIn } = useUser();

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-background" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-foreground">
                Cabinet <span className="text-primary">MARC</span>
              </span>
              <p className="text-[10px] text-muted-foreground leading-none -mt-0.5 tracking-wider uppercase">
                Excellence & Innovation
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive(href)
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {t(key)}
                {isActive(href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {!isSignedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">{t("signin")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">{t("signup")}</Link>
                </Button>
              </div>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-xl ring-2 ring-primary/20",
                  },
                }}
              />
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="container mx-auto py-4 space-y-1">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t(key)}
                </Link>
              ))}
              <div className="pt-3 border-t border-border flex gap-2">
                {!isSignedIn ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/sign-in">{t("signin")}</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/sign-up">{t("signup")}</Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
