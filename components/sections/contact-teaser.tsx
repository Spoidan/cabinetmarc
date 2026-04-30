"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const contactInfo = [
  { icon: Mail, label: "Email", value: "info@cabinetmarc.org", href: "mailto:info@cabinetmarc.org" },
  { icon: Phone, label: "Téléphone", value: "+257 00 000 000", href: "tel:+25700000000" },
  { icon: MapPin, label: "Adresse", value: "Bujumbura, Burundi", href: "#" },
];

export function ContactTeaser() {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0A0F1E] to-[#0f1f3d] p-1">
          <div className="rounded-[calc(1.5rem-4px)] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }} />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">
                  <MessageSquare className="w-3 h-3" />
                  Nous Contacter
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
                  Prêt à développer{" "}
                  <span className="gradient-text">votre excellence</span> ?
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Notre équipe d&apos;experts est à votre disposition pour répondre à vos besoins spécifiques
                  en conseil, formation ou recherche. Écrivez-nous dès aujourd&apos;hui.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="group bg-white text-[#7B3A10] hover:bg-white/90 shadow-lg border-0">
                    <Link href="/contact">
                      Nous écrire
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline-white" size="lg" asChild>
                    <Link href="/services">Voir nos services</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Right: contact cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                {contactInfo.map(({ icon: Icon, label, value, href }, i) => (
                  <motion.a
                    key={label}
                    href={href}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-0.5">{label}</div>
                      <div className="text-white font-medium">{value}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto group-hover:translate-x-1 transition-all" />
                  </motion.a>
                ))}

                {/* Response time badge */}
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Réponse rapide</div>
                    <div className="text-white/50 text-xs">Nous répondons sous 24h ouvrées</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
