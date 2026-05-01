"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { User, Phone, MapPin, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CompleterProfilPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const derivedName = isLoaded && user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || ""
    : "";

  const [fullName, setFullName] = useState(derivedName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync name once Clerk user loads (first render may be empty)
  if (isLoaded && user && !fullName) {
    const n = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "";
    if (n) setFullName(n);
  }

  const save = async () => {
    if (!fullName.trim()) { toast.error("Veuillez entrer votre nom complet."); return; }
    if (!phone.trim()) { toast.error("Veuillez entrer votre numéro de téléphone."); return; }
    if (!address.trim()) { toast.error("Veuillez entrer votre adresse."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone, address }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Profil complété !");
        router.push("/mes-cours");
      } else {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
      }
    } catch {
      toast.error("Erreur réseau.");
    }
    setSaving(false);
  };

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

      {/* Logo */}
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Complétez votre profil</h1>
            <p className="text-white/60">
              Ces informations nous permettent de personnaliser votre expérience.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex : Jean Dupont"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Numéro de téléphone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+257 XX XXX XXX"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Adresse *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex : Bujumbura, Quartier Rohero"
                  className="pl-9"
                />
              </div>
            </div>

            <Button onClick={save} disabled={saving} className="w-full bg-black hover:bg-black/90 text-white border-0">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                : <><ArrowRight className="w-4 h-4" /> Accéder à mon espace</>
              }
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/mes-cours" className="underline underline-offset-4 hover:text-foreground transition-colors">
                Passer cette étape
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
