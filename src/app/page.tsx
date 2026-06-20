'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImpactSimulator } from '@/components/ImpactSimulator';
import { useTranslation } from '@/components/LanguageProvider';
import { Mic, Flame, Shield, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-secondary/20 via-background to-background">
          <div className="container mx-auto px-6 max-w-6xl grid md:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-[11px] font-bold text-accent tracking-wide uppercase">
                <span>⚡</span>
                <span>Hackathon Prototype</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {t('app.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t('app.tagline')}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="px-6 py-3.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  Start Saving Now
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#simulator"
                  className="px-6 py-3.5 rounded-lg border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary/20 transition-all"
                >
                  Try Simulator
                </a>
              </div>
            </motion.div>

            {/* Voice Assistant Promo Graphic */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="md:col-span-5 fintech-card p-8 bg-card border border-border relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <Mic size={24} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Say saving command</h3>
                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 text-sm font-semibold text-accent flex items-center justify-between">
                  <span>"20 rupaye bachat karo"</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Hindi</span>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 text-sm font-semibold text-blue-500 flex items-center justify-between">
                  <span>"Save 50 rupees"</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">English</span>
                </div>
              </div>

              <div className="mt-8 border-t border-border/50 pt-6 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Voice Ingestion Platform
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save instantly by speaking in your language. Designed for daily wage workers, vendors, and helpers.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-border/30 bg-secondary/15">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight">Why workers love BachatVaani</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                We make savings a seamless daily habit, removing complex banking jargon and paperwork.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="fintech-card p-6 bg-card space-y-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
                  <Mic size={20} />
                </div>
                <h3 className="text-sm font-bold">Voice Savings</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No forms or typing. Just tap the microphone and speak to save your daily wages in English or Hindi.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="fintech-card p-6 bg-card space-y-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
                  <Flame size={20} />
                </div>
                <h3 className="text-sm font-bold">Daily Streak System</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stay motivated with our gamified daily streak counters. Keep saving consistently to level up.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="fintech-card p-6 bg-card space-y-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
                  <Award size={20} />
                </div>
                <h3 className="text-sm font-bold">Milestone Badges</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlock rewards and community recognition badges like First Save, 7-Day Streak, and ₹1000 Club.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="fintech-card p-6 bg-card space-y-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
                  <Shield size={20} />
                </div>
                <h3 className="text-sm font-bold">Secure PIN Lock</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Login securely with a 4-digit PIN. Your money is secured on Neon Postgres database with full auditing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-20 border-t border-border/30">
          <div className="container mx-auto px-6 max-w-4xl text-center space-y-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-[9px] font-bold text-accent uppercase tracking-widest">
                Interactive Tool
              </div>
              <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight">Simulate Your Savings Growth</h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto">
                Small micro-savings every single day grow into a massive financial buffer over time. Slide to see your projections.
              </p>
            </div>

            <ImpactSimulator />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
