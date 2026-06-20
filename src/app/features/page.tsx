'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mic, Flame, Award, Shield, LayoutGrid, CheckCircle } from 'lucide-react';

export default function Features() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600">Platform Features</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            A comprehensive suite of tools designed to build sustainable daily savings habits for low-income workers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-premium p-6 rounded-2xl border border-border/50 flex gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Mic size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Voice-Driven Transaction Ingestion</h3>
              <p className="text-xs text-muted-foreground">
                Allows users to deposit funds by simply saying "Save 50 rupees" or "50 rupaye save karo". The browser's Web Speech engine parses the amount and opens a confirmation dialogue instantly.
              </p>
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl border border-border/50 flex gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Flame size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Daily Streak Engine</h3>
              <p className="text-xs text-muted-foreground">
                Tracks consecutive saving days in real time. If a user saves two days in a row, the streak incrementor keeps the user engaged. A visual flame changes intensity based on progress.
              </p>
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl border border-border/50 flex gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Award size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Badges & Gamification</h3>
              <p className="text-xs text-muted-foreground">
                Dynamic achievements system that awards visual badges such as "First Saver", "7-Day Warrior", and "₹1000 Club" to motivate and incentivize users to continue their savings journey.
              </p>
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl border border-border/50 flex gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Shield size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Audit Logs & Security</h3>
              <p className="text-xs text-muted-foreground">
                All login actions, PIN resets, deposits, and withdrawal approvals are recorded in a permanent audit log ledger to protect users against unauthorized access and maintain safety.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
