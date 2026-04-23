import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l&apos;accueil
        </Link>
        <h1 className="text-3xl font-bold mb-2">Conditions d&apos;utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : Janvier 2024</p>

        <div className="prose max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>En utilisant le site web de Cabinet MARC, vous acceptez les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Propriété intellectuelle</h2>
            <p>Tous les contenus présents sur ce site (textes, images, vidéos, formations) sont protégés par les droits d&apos;auteur et appartiennent à Cabinet MARC sauf indication contraire.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Utilisation du site</h2>
            <p>Vous vous engagez à utiliser ce site conformément à la loi applicable et aux présentes conditions, sans porter atteinte aux droits de tiers ou à l&apos;image de Cabinet MARC.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Limitation de responsabilité</h2>
            <p>Cabinet MARC s&apos;efforce de maintenir les informations de ce site à jour et exactes. Cependant, nous ne garantissons pas l&apos;exhaustivité ou l&apos;exactitude des informations fournies.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Contact</h2>
            <p>Pour toute question : <a href="mailto:info@cabinetmarc.org" className="text-primary hover:underline">info@cabinetmarc.org</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
