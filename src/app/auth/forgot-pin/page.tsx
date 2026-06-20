'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/LanguageProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Phone, KeyRound, LockKeyhole } from 'lucide-react';

export default function ForgotPin() {
  const { t } = useTranslation();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError(t('auth.errorPhone'));
      return;
    }
    setStep(2);
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (otp.length !== 4 || !/^\d+$/.test(otp)) {
      setError('OTP must be 4 digits');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError(t('auth.errorPin'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPin }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      setSuccess('PIN reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="glass-premium p-8 rounded-3xl w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 mx-auto">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold">{t('auth.resetPin')}</h2>
            <p className="text-xs text-muted-foreground">
              {step === 1 ? 'Enter phone number to receive reset code' : 'Verify reset code and choose a new PIN'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl text-center">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.phoneNumber')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 mt-6"
              >
                Send Reset Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPin} className="space-y-4">
              {/* OTP */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Verification Code</label>
                  <span className="text-[9px] text-blue-600 font-semibold bg-blue-600/5 px-2 py-0.5 rounded-md border border-blue-600/10">Demo OTP: 1234</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                    <LockKeyhole size={16} />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter 1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
                    required
                  />
                </div>
              </div>

              {/* New PIN */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">New 4-Digit PIN</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm tracking-widest focus:outline-none focus:border-blue-600/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 mt-6"
              >
                {loading ? 'Processing...' : 'Reset PIN'}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
