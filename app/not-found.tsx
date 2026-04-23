import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center text-center px-4">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div className="relative z-10 max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-bold text-white/10 mb-4 leading-none select-none">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-white/50 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Retournez à l&apos;accueil pour continuer.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button variant="outline-white" size="lg" asChild>
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
