"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, TrendingUp, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const floatingCards = [
  { icon: Users, value: "500+", label: "Étudiants", color: "from-blue-500 to-indigo-600", delay: 0 },
  { icon: Award, value: "50+", label: "Cours", color: "from-emerald-500 to-teal-600", delay: 0.2 },
  { icon: TrendingUp, value: "10+", label: "Années", color: "from-amber-500 to-orange-600", delay: 0.4 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="default" className="mb-6 bg-white/10 text-white border-white/20 text-xs font-semibold tracking-wide">
                <Star className="w-3 h-3 fill-current" />
                Nouveau : E-Learning disponible
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              L&apos;excellence{" "}
              <span className="gradient-text">académique</span>{" "}
              au service de l&apos;Afrique
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-4"
            >
              <span className="text-white/40 text-sm tracking-widest uppercase">
                Conseil · Formation · Recherche · E-Learning
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base text-white/55 leading-relaxed mb-10 max-w-lg"
            >
              Cabinet MARC vous accompagne dans votre développement professionnel et institutionnel
              grâce à une expertise pointue en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Button size="xl" asChild className="group">
                <Link href="/courses">
                  Explorer nos formations
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline-white" size="xl" asChild className="group">
                <Link href="/about">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Découvrir MARC
                </Link>
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-emerald-400/60 border-2 border-[#0A0F1E] flex items-center justify-center text-xs text-white font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-white/50">
                  <span className="text-white/80 font-semibold">500+</span> professionnels formés
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Central card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-80 h-80"
            >
              {/* Main visual card */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center gap-4 overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-2xl shadow-primary/50 animate-float">
                  <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
                    <path d="M20 4L4 12v2l16 8 16-8v-2L20 4zM4 26l16 8 16-8M4 20l16 8 16-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-xl">Cabinet MARC</div>
                  <div className="text-white/50 text-sm">Excellence & Innovation</div>
                </div>
                <div className="flex gap-2">
                  {["Éco", "Droit", "TIC", "Stats"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating stat cards */}
              {floatingCards.map(({ icon: Icon, value, label, color, delay }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + delay }}
                  className={`absolute ${
                    i === 0 ? "-top-6 -left-12" : i === 1 ? "-top-6 -right-10" : "-bottom-6 -left-8"
                  } bg-[#0A0F1E]/80 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm leading-none">{value}</div>
                    <div className="text-white/50 text-xs">{label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-72 h-72 rounded-full border border-primary/10 animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
