'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/components/LanguageProvider';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-3xl">
        <div className="glass-premium p-8 rounded-3xl space-y-6">
          <h1 className="text-3xl font-extrabold text-blue-600">About BachatVaani</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            BachatVaani is dedicated to empowering daily wage workers, street vendors, and helpers by making micro-savings extremely accessible. Many workers store cash at home, exposing it to theft, loss, or impulse spending. Traditional banking apps are complex, requiring reading/writing English and navigating complicated menus.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            With BachatVaani, workers can save small daily increments (as little as ₹10) using simple voice commands in their native language (English or Hindi). It is secure, fully-audited, and gamified with daily streaks to encourage savings discipline.
          </p>
          <div className="border-t border-border/50 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Our Core Principles</h2>
            <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground">
              <li><strong>Accessibility First:</strong> Designed for non-tech-savvy users with speech-to-text.</li>
              <li><strong>Financial Literacy:</strong> Exposing daily tips to encourage sound savings habits.</li>
              <li><strong>Trust & Transparency:</strong> Full audit logs of all transaction actions.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
