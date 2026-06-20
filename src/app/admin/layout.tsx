'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar showDashboardLinks={true} />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        <div className="border-b border-border/50 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-600">BachatVaani Administration</h1>
            <p className="text-xs text-muted-foreground">Manage cohort savings, review withdrawals, and publish tips.</p>
          </div>
          
          <nav className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/admin" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Overview</Link>
            <Link href="/admin/withdrawals" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Review Withdrawals</Link>
            <Link href="/admin/users" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Manage Users</Link>
            <Link href="/admin/transactions" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Audit Ledger</Link>
            <Link href="/admin/tips" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Manage Tips</Link>
            <Link href="/admin/reports" className="px-3 py-1.5 glass hover:bg-secondary/40 rounded-lg">Platform Reports</Link>
          </nav>
        </div>
        
        {children}
      </main>
      <Footer />
    </div>
  );
}
