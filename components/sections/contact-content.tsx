"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContactFormData } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(5, "L'objet doit contenir au moins 5 caractères"),
  service: z.string().optional(),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
});

type FormData = z.infer<typeof schema>;

const services = [
  { value: "consulting", label: "Conseil & Expertise" },
  { value: "training", label: "Formation Professionnelle" },
  { value: "research", label: "Recherche Appliquée" },
  { value: "elearning", label: "E-Learning" },
  { value: "other", label: "Autre" },
];

const contactInfo = [
  { icon: Mail, title: "Email", value: "info@cabinetmarc.org", href: "mailto:info@cabinetmarc.org", desc: "Réponse sous 24h" },
  { icon: Phone, title: "Téléphone", value: "+257 00 000 000", href: "tel:+25700000000", desc: "Lun - Ven, 8h - 17h" },
  { icon: MapPin, title: "Adresse", value: "Bujumbura, Burundi", href: "#", desc: "Sur rendez-vous" },
  { icon: Clock, title: "Horaires", value: "Lun - Ven : 8h - 17h", href: "#", desc: "Fermé week-end" },
];

export function ContactContent() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      reset();
      toast.success("Message envoyé avec succès !");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

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
            <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">Contact</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Nous sommes à <span className="gradient-text">votre écoute</span>
            </h1>
            <p className="text-white/60 text-lg">
              Contactez-nous pour vos besoins en conseil, formation ou recherche.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Entrons en contact</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Notre équipe d&apos;experts est disponible pour répondre à toutes vos questions
                  et vous accompagner dans vos projets.
                </p>
              </div>

              {contactInfo.map(({ icon: Icon, title, value, href, desc }) => (
                <a
                  key={title}
                  href={href}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{title}</div>
                    <div className="font-semibold text-sm">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                </a>
              ))}

              {/* Response time */}
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">Réponse rapide garantie</div>
                  <div className="text-emerald-600/70 dark:text-emerald-500/70 text-xs">Sous 24 heures ouvrées</div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Message envoyé !</h3>
                  <p className="text-muted-foreground mb-6">
                    Merci de nous avoir contactés. Notre équipe vous répondra sous 24h ouvrées.
                  </p>
                  <Button onClick={() => setSuccess(false)} variant="outline">
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input id="name" placeholder="Jean Dupont" {...register("name")} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email *</Label>
                      <Input id="email" type="email" placeholder="jean@example.com" {...register("email")} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" type="tel" placeholder="+257 00 000 000" {...register("phone")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Service concerné</Label>
                      <Select onValueChange={(v) => setValue("service", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Objet *</Label>
                    <Input id="subject" placeholder="Demande d'information sur..." {...register("subject")} />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Votre message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre besoin ou votre question..."
                      className="min-h-[140px]"
                      {...register("message")}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        Envoyer le message
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
