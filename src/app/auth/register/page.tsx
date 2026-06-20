'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/LanguageProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, User, Phone, KeyRound, Globe } from 'lucide-react';

export default function Register() {
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [prefLanguage, setPrefLanguage] = useState<'en' | 'hi'>(language);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!name.trim()) {
      setError(t('auth.errorName'));
      return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError(t('auth.errorPhone'));
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError(t('auth.errorPin'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, pin, language: prefLanguage }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
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
            <h2 className="text-2xl font-bold">{t('auth.register')}</h2>
            <p className="text-xs text-muted-foreground">{t('auth.createAccount')}</p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.name')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Ram Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
                  required
                />
              </div>
            </div>

            {/* Phone */}
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

            {/* PIN */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.pin')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                  <KeyRound size={16} />
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl text-sm tracking-widest focus:outline-none focus:border-blue-600/50"
                  required
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('auth.language')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrefLanguage('en')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    prefLanguage === 'en'
                      ? 'bg-blue-600/10 border-blue-600/50 text-blue-600'
                      : 'border-border/50 bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  <Globe size={14} />
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPrefLanguage('hi')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    prefLanguage === 'hi'
                      ? 'bg-blue-600/10 border-blue-600/50 text-blue-600'
                      : 'border-border/50 bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  <Globe size={14} />
                  हिन्दी
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 mt-6"
            >
              {loading ? 'Processing...' : t('auth.register')}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-blue-600 hover:underline">
              {t('auth.alreadyHaveAccount')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
