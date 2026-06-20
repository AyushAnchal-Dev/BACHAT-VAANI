'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-3xl">
        <div className="glass-premium p-8 rounded-3xl space-y-6">
          <h1 className="text-3xl font-extrabold text-blue-600">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 20, 2026</p>
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <p>
              At BachatVaani, we value your privacy and trust. This Privacy Policy describes how we collect, use, and safeguard your personal information when you use our micro-savings platform.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">1. Information We Collect</h2>
            <p>
              We collect your name, phone number, language preference, and a hashed version of your 4-digit PIN. We also record transaction histories (deposits and withdrawals) and audit logs of login actions.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">2. How We Use Your Information</h2>
            <p>
              Your data is used solely to facilitate micro-savings deposits, process withdrawal requests, display village leaderboards, and improve the client voice recognition commands. We never sell or share your personal data with third parties.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">3. Security</h2>
            <p>
              We use standard bcrypt PIN hashing, secure cookies, and CSRF protection headers. Your account balances are protected using isolated Neon database schemas.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
