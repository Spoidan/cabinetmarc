"use client";

import { motion } from "framer-motion";
import { Star, Quote, Clock, CheckCircle2, LogIn, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import type { Testimonial, OwnTestimonial } from "@/lib/marketing/queries";

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-sky-600",
];

// Shown only when the DB has zero approved testimonials yet.
const FALLBACK: Testimonial[] = [
  { id: "f1", name: "Amina Nkurunziza", rating: 5, comment: "Cabinet MARC a transformé notre approche de la gestion financière. Les formations sont d'une qualité exceptionnelle et parfaitement adaptées au contexte africain. Je recommande vivement.", created_at: "" },
  { id: "f2", name: "Jean-Baptiste Hakizimana", rating: 5, comment: "Une expertise remarquable en économie et statistiques. L'équipe est professionnelle, rigoureuse et toujours à l'écoute des besoins spécifiques. Cabinet MARC est un partenaire de choix.", created_at: "" },
  { id: "f3", name: "Marie-Claire Nduwimana", rating: 5, comment: "Grâce au programme Entrepreneuriat de Cabinet MARC, j'ai pu structurer et lancer mon entreprise tech avec succès. Une expérience d'apprentissage transformatrice.", created_at: "" },
  { id: "f4", name: "Pierre Ntirampeba", rating: 5, comment: "La formation en statistiques et économétrie m'a fourni des outils pratiques immédiatement applicables. L'excellence pédagogique de Cabinet MARC est incomparable.", created_at: "" },
];

function StarRow({ rating, interactive = false, value = 0, hover = 0, onRate, onHover, onLeave }: {
  rating?: number;
  interactive?: boolean;
  value?: number;
  hover?: number;
  onRate?: (n: number) => void;
  onHover?: (n: number) => void;
  onLeave?: () => void;
}) {
  if (!interactive) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={cn("w-4 h-4", s <= (rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-white/20")} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onRate?.(s)}
          onMouseEnter={() => onHover?.(s)}
          onMouseLeave={() => onLeave?.()}
          className="focus:outline-none"
        >
          <Star className={cn(
            "w-8 h-8 transition-colors",
            s <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-white/20 hover:text-amber-400/50"
          )} />
        </button>
      ))}
    </div>
  );
}

export function Testimonials({
  approvedTestimonials = [],
  userId = null,
  ownTestimonial = null,
}: {
  approvedTestimonials?: Testimonial[];
  userId?: string | null;
  ownTestimonial?: OwnTestimonial | null;
}) {
  const list = approvedTestimonials.length > 0 ? approvedTestimonials : FALLBACK;
  const [activeIndex, setActiveIndex] = useState(0);
  const [myTestimonial, setMyTestimonial] = useState<OwnTestimonial | null>(ownTestimonial);

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setActiveIndex((p) => (p + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Veuillez entrer votre nom."); return; }
    if (!rating) { toast.error("Veuillez choisir une note."); return; }
    if (!comment.trim()) { toast.error("Veuillez écrire un commentaire."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setMyTestimonial(json.data);
        toast.success("Témoignage soumis ! Il sera visible après approbation par l'équipe.");
      } else {
        toast.error(json.error ?? "Erreur lors de la soumission.");
      }
    } catch {
      toast.error("Erreur réseau.");
    }
    setSubmitting(false);
  };

  const active = list[activeIndex];

  return (
    <section className="section-padding bg-[#0A0F1E] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">
            Témoignages
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 text-white">
            Ce que disent{" "}
            <span className="gradient-text">nos clients</span>
          </h2>
          <p className="text-white/50 leading-relaxed">
            La satisfaction de nos clients est notre plus grande récompense.
          </p>
        </motion.div>

        {/* Featured testimonial carousel */}
        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative"
          >
            <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/20" />
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("w-5 h-5", s <= active.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
              ))}
            </div>
            <blockquote className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 italic">
              &ldquo;{active.comment}&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRADIENTS[activeIndex % GRADIENTS.length]} flex items-center justify-center text-white font-bold text-sm`}>
                {getInitials(active.name)}
              </div>
              <div>
                <div className="text-white font-semibold">{active.name}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {list.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
                i === activeIndex
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/5 text-white/40 hover:border-white/15 hover:text-white/60"
              )}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-xs font-bold`}>
                {getInitials(t.name)}
              </div>
              <span className="text-xs font-medium hidden sm:block">{t.name}</span>
            </button>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-16">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="max-w-3xl mx-auto border-t border-white/10 mb-12" />

        {/* User section */}
        {userId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            {myTestimonial ? (
              myTestimonial.is_approved ? (
                /* Approved — testimonial is live */
                <div className="bg-white/5 border border-emerald-500/30 rounded-3xl p-8 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">Votre témoignage est en ligne</p>
                    <p className="text-white/50 text-sm mb-4">Il est maintenant visible par tous les visiteurs.</p>
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("w-4 h-4", s <= myTestimonial.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm italic">&ldquo;{myTestimonial.comment}&rdquo;</p>
                  </div>
                </div>
              ) : (
                /* Pending approval */
                <div className="bg-white/5 border border-amber-500/30 rounded-3xl p-8 flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">Votre témoignage est en attente d&apos;approbation</p>
                    <p className="text-white/50 text-sm mb-4">Notre équipe le vérifiera prochainement. Il sera visible dès validation.</p>
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("w-4 h-4", s <= myTestimonial.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm italic">&ldquo;{myTestimonial.comment}&rdquo;</p>
                  </div>
                </div>
              )
            ) : (
              /* Form */
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-white font-bold text-xl mb-1">Partagez votre expérience</h3>
                <p className="text-white/50 text-sm mb-8">Votre témoignage sera visible après validation par notre équipe.</p>

                <div className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-medium">Votre nom</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Jean Dupont"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-colors text-sm"
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-medium">Note</label>
                    <StarRow
                      interactive
                      value={rating}
                      hover={hoverRating}
                      onRate={setRating}
                      onHover={setHoverRating}
                      onLeave={() => setHoverRating(0)}
                    />
                    {rating > 0 && (
                      <p className="text-white/40 text-xs">
                        {["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"][rating]}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm font-medium">Commentaire</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Décrivez votre expérience avec Cabinet MARC…"
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-colors text-sm resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full text-white"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
                      : <><Send className="w-4 h-4" /> Soumettre mon témoignage</>
                    }
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Not logged in — subtle prompt */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-white/40 text-sm mb-3">Vous souhaitez partager votre expérience ?</p>
            <Button variant="outline" size="sm" asChild className="border-white/20 text-white/60 hover:text-white hover:border-white/40">
              <Link href="/connexion">
                <LogIn className="w-3.5 h-3.5" />
                Se connecter pour laisser un témoignage
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
