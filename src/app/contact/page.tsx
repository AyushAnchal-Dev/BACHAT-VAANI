'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-3xl">
        <div className="glass-premium p-8 rounded-3xl space-y-6">
          <h1 className="text-3xl font-extrabold text-blue-600">Contact Us</h1>
          <p className="text-sm text-muted-foreground">
            Have questions or need support? Reach out to the BachatVaani team and we'll get back to you immediately.
          </p>
          <div className="space-y-4 border-t border-border/50 pt-6">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-blue-600" />
              <span className="text-xs">support@bachatvaani.org</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-blue-600" />
              <span className="text-xs">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-blue-600" />
              <span className="text-xs">BachatVaani Foundation, Delhi, India</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
