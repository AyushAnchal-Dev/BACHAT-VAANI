'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from './LanguageProvider';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-card border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>
          © {new Date().getFullYear()} {t('app.title')}. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-blue-500 transition-colors">About</Link>
          <Link href="/features" className="hover:text-blue-500 transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-blue-500 transition-colors">How It Works</Link>
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
