import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l&apos;accueil
        </Link>
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : Janvier 2024</p>

        <div className="prose max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Collecte des données</h2>
            <p>Cabinet MARC collecte uniquement les données nécessaires à la fourniture de ses services : nom, prénom, adresse email, et informations de contact fournies volontairement via nos formulaires.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour : répondre à vos demandes de contact, vous envoyer notre newsletter (avec votre consentement explicite), améliorer nos services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Protection des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Vos droits</h2>
            <p>Vous disposez du droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@cabinetmarc.org" className="text-primary hover:underline">privacy@cabinetmarc.org</a></p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Contact</h2>
            <p>Pour toute question relative à notre politique de confidentialité, contactez : Cabinet MARC, Bujumbura, Burundi — <a href="mailto:info@cabinetmarc.org" className="text-primary hover:underline">info@cabinetmarc.org</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
