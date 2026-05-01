"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, ExternalLink, ArrowRight, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { HeroContent } from "@/lib/content-defaults";
import type { TeamMember } from "@/lib/marketing/queries";
import { getInitials } from "@/lib/utils";

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-sky-600",
];

export function TeamPageContent({
  heroContent = {},
  members = [],
}: {
  heroContent?: HeroContent;
  members?: TeamMember[];
}) {
  const badge = heroContent.badge ?? "Notre Équipe";
  const title = heroContent.title ?? "Des experts à votre service";
  const description =
    heroContent.description ??
    "Notre équipe pluridisciplinaire réunit les meilleurs experts pour vous accompagner vers l'excellence.";

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div className="container mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">{badge}</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{title}</h1>
            <p className="text-white/60 text-lg">{description}</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Team grid */}
      <section className="section-padding">
        <div className="container mx-auto">
          {members.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <UserCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>L&apos;équipe sera présentée prochainement.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Top gradient with photo */}
                  <div className={`h-36 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} relative`}>
                    <div className="absolute -bottom-14 left-6">
                      {member.image_url ? (
                        <div className="w-28 h-28 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-muted">
                          <Image
                            src={member.image_url}
                            alt={member.name}
                            width={112}
                            height={112}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-2xl font-bold border-4 border-card shadow-lg`}>
                          {getInitials(member.name)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-20 p-6">
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-4">{member.role_fr}</p>
                    {member.bio_fr && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{member.bio_fr}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedin_url && member.linkedin_url !== "#" && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                          aria-label="LinkedIn"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-12 rounded-3xl bg-muted/30 border border-border"
          >
            <h2 className="text-2xl font-bold mb-3">Rejoignez notre équipe</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Vous êtes expert dans votre domaine et souhaitez contribuer à l&apos;excellence africaine ?
              Nous serions ravis de vous rencontrer.
            </p>
            <Button asChild className="group">
              <Link href="/contact">
                Nous contacter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
