"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, Clock, Trash2, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Testimonial = {
  id: string;
  user_id: string;
  name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
};

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-sky-600",
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then(({ data }) => setTestimonials(data ?? []))
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (t: Testimonial, is_approved: boolean) => {
    const res = await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, is_approved }),
    });
    if (res.ok) {
      setTestimonials((prev) => prev.map((x) => x.id === t.id ? { ...x, is_approved } : x));
      toast.success(is_approved ? "Témoignage approuvé et mis en ligne." : "Témoignage retiré du site.");
    } else {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Supprimer le témoignage de "${name}" définitivement ?`)) return;
    const res = await fetch("/api/admin/testimonials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTestimonials((prev) => prev.filter((x) => x.id !== id));
      toast.success("Témoignage supprimé.");
    } else {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const pending = testimonials.filter((t) => !t.is_approved);
  const approved = testimonials.filter((t) => t.is_approved);

  const TestimonialCard = ({ t, idx }: { t: Testimonial; idx: number }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${GRADIENTS[idx % GRADIENTS.length]}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {getInitials(t.name)}
            </div>
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.created_at ? format(new Date(t.created_at), "d MMM yyyy", { locale: fr }) : "—"}
              </p>
            </div>
          </div>
          <Badge variant={t.is_approved ? "emerald" : "outline"} className={cn("text-[10px] shrink-0", t.is_approved ? "text-white" : "")}>
            {t.is_approved ? (
              <><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Approuvé</>
            ) : (
              <><Clock className="w-2.5 h-2.5 mr-1" />En attente</>
            )}
          </Badge>
        </div>

        <StarDisplay rating={t.rating} />

        <p className="text-sm text-muted-foreground mt-3 mb-4 line-clamp-3 italic">
          &ldquo;{t.comment}&rdquo;
        </p>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {t.is_approved ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex-1"
              onClick={() => approve(t, false)}
            >
              <ThumbsDown className="w-3 h-3" />
              Retirer
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 px-2 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => approve(t, true)}
            >
              <ThumbsUp className="w-3 h-3" />
              Approuver
            </Button>
          )}
          <button
            onClick={() => remove(t.id, t.name)}
            className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Témoignages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {loading ? "Chargement…" : `${testimonials.length} témoignage${testimonials.length !== 1 ? "s" : ""} · ${pending.length} en attente · ${approved.length} en ligne`}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          Chargement des témoignages…
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Aucun témoignage pour l&apos;instant</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Les témoignages soumis par les utilisateurs apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">En attente d&apos;approbation</h2>
                <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">
                  {pending.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((t, i) => <TestimonialCard key={t.id} t={t} idx={i} />)}
              </div>
            </section>
          )}

          {approved.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">Approuvés — visibles sur le site</h2>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">
                  {approved.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approved.map((t, i) => <TestimonialCard key={t.id} t={t} idx={pending.length + i} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
