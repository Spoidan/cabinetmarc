import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Logo */}
      <div className="relative z-10 p-8">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">Cabinet <span className="text-primary">MARC</span></span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-white/60">Rejoignez la communauté Cabinet MARC</p>
          </div>
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#059669",
                colorBackground: "#ffffff",
                colorText: "#0A0F1E",
                borderRadius: "0.75rem",
              },
            }}
          />
          <p className="text-center text-sm text-white/50 mt-6">
            Déjà un compte ?{" "}
            <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
