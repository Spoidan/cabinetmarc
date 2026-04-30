"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, X, Moon, Sun, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/cours", key: "courses" },
  { href: "/blog", key: "news" },
  { href: "/team", key: "team" },
  { href: "/contact", key: "contact" },
] as const;

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { isSignedIn } = useUser();

  const isHomePage = pathname === "/";

  React.useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setIsOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const closeMobile = () => setIsOpen(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        (scrolled || !isHomePage)
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Cabinet MARC"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className={cn(
                "text-[11px] uppercase tracking-widest leading-none mb-0.5",
                (!scrolled && isHomePage) ? "text-white/50" : "text-muted-foreground"
              )}>
                Le Cabinet
              </p>
              <span
                className="text-lg font-bold tracking-tight transition-colors duration-300"
                style={{ color: (!scrolled && isHomePage) ? "white" : "#7B3A10" }}
              >
                MARC
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label={t("ariaPrimary")}
            className="hidden lg:flex items-center gap-1"
          >
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                  isActive(href)
                    ? (!scrolled && isHomePage) ? "text-white" : "text-primary"
                    : (!scrolled && isHomePage)
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {t(key)}
                {isActive(href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                      (!scrolled && isHomePage) ? "bg-white" : "bg-primary"
                    )}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  (!scrolled && isHomePage)
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted"
                )}
                aria-label={t("toggleTheme")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {!isSignedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={(!scrolled && isHomePage) ? "text-white hover:text-white hover:bg-white/10" : ""}
                >
                  <Link href="/connexion">{t("login")}</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className={(!scrolled && isHomePage) ? "bg-white text-[#7B3A10] hover:bg-white/90 border-0" : ""}
                >
                  <Link href="/inscription">{t("register")}</Link>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={(!scrolled && isHomePage) ? "text-white hover:text-white hover:bg-white/10" : ""}
                >
                  <Link href="/mes-cours">{t("myCourses")}</Link>
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className={(!scrolled && isHomePage) ? "border-white/30 text-white hover:bg-white/10" : ""}
                  >
                    <Link href="/admin">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  </Button>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-xl ring-2 ring-primary/20",
                    },
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                (!scrolled && isHomePage)
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-foreground/60 hover:text-foreground hover:bg-muted"
              )}
              aria-label={t("ariaMobile")}
              aria-expanded={isOpen}
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
            <nav
              aria-label={t("ariaPrimary")}
              className="container mx-auto py-4 space-y-1"
            >
              {navLinks.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
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
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {!isSignedIn ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/connexion" onClick={closeMobile}>
                        {t("login")}
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/inscription" onClick={closeMobile}>
                        {t("register")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/mes-cours" onClick={closeMobile}>
                        {t("myCourses")}
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/admin" onClick={closeMobile}>
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Panneau d&apos;administration
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
