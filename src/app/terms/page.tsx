'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-3xl">
        <div className="glass-premium p-8 rounded-3xl space-y-6">
          <h1 className="text-3xl font-extrabold text-blue-600">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 20, 2026</p>
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <p>
              By accessing or using BachatVaani, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">1. Use of the Platform</h2>
            <p>
              BachatVaani is a prototype voice-enabled micro-savings platform built for daily wage workers. You must register with a valid phone number and set up a secure 4-digit PIN. You are responsible for keeping your PIN confidential.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">2. Micro-Savings Transactions</h2>
            <p>
              All deposits are simulated for testing purposes in this hackathon version, though they follow real database ledgers. Withdrawal requests must be reviewed and approved by administrators before any account adjustments are made.
            </p>
            <h2 className="text-sm font-bold text-foreground mt-4">3. Limitation of Liability</h2>
            <p>
              BachatVaani is provided "as is" without any warranties. We are not liable for any transaction discrepancies or service interruptions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
