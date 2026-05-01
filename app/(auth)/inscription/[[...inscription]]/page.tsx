import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function InscriptionPage() {
  const t = await getTranslations("auth");

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10 p-8">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="relative w-9 h-9 rounded-xl bg-white/5 overflow-hidden">
            <Image src="/logo.png" alt="Cabinet MARC" fill sizes="36px" className="object-contain p-1" />
          </div>
          <span className="text-white font-bold">
            Cabinet <span className="text-primary">MARC</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t("sign_up_title")}</h1>
            <p className="text-white/60">{t("sign_up_description")}</p>
          </div>
          <SignUp
            path="/inscription"
            routing="path"
            signInUrl="/connexion"
            forceRedirectUrl="/completer-profil"
            fallbackRedirectUrl="/completer-profil"
            appearance={{
              variables: {
                colorPrimary: "#7B3A10",
                colorBackground: "#ffffff",
                colorText: "#0A0F1E",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
