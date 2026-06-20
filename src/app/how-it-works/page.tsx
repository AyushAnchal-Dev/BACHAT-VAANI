'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { UserCheck, Mic, RefreshCw } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600">How It Works</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            BachatVaani simplifies saving into three easy steps, customized specifically for busy daily wage workers.
          </p>
        </div>

        <div className="relative border-l border-blue-600/20 ml-4 md:ml-1/2 space-y-8 md:space-y-12">
          {/* Step 1 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
              1
            </div>
            <div className="glass-premium p-6 rounded-2xl border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <UserCheck size={20} />
                <h3 className="font-bold text-sm">Register with Your Phone</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your name, 10-digit phone number, and a secure 4-digit PIN. Choose your preferred language (Hindi or English). It takes less than a minute!
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
              2
            </div>
            <div className="glass-premium p-6 rounded-2xl border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Mic size={20} />
                <h3 className="font-bold text-sm">Deposit via Voice Commands</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Go to the dashboard, tap the microphone button, and speak! Speak naturally: "Save 50 rupees" or "50 rupaye save karo". Confirm the amount, and it immediately adds to your savings ledger.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
              3
            </div>
            <div className="glass-premium p-6 rounded-2xl border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw size={20} />
                <h3 className="font-bold text-sm">Withdrawal & Goals</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Set specific goals (e.g., medical fund, children's school fees). If you need cash, submit a withdrawal request. Once approved by the administrator, your savings are securely transferred back to you.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
