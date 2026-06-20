'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Award, HelpCircle } from 'lucide-react';

export default function ImpactCalculator() {
  const [dailySaving, setDailySaving] = useState<number>(20);

  // Constants for realistic calculations
  const annualInterestRate = 0.06; // 6% compound interest return
  const monthlyRate = annualInterestRate / 12;
  const avgDaysInMonth = 365 / 12;
  const monthlyDeposit = dailySaving * avgDaysInMonth;

  // Projections
  const monthlySavings = Math.round(dailySaving * 30);
  const yearlySavings = Math.round(dailySaving * 365);
  const threeYearSavings = Math.round(dailySaving * 365 * 3);

  // Calculate compound interest projections over 36 months
  const calculateCompoundBalance = (months: number) => {
    if (months === 0) return 0;
    // Future Value of an Ordinary Annuity: PMT * [((1 + r)^n - 1) / r]
    return Math.round(monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  };

  const monthlyCompound = calculateCompoundBalance(1);
  const yearlyCompound = calculateCompoundBalance(12);
  const threeYearCompound = calculateCompoundBalance(36);

  // Generate chart data for 12 points (every 3 months up to 36 months)
  const chartData = Array.from({ length: 13 }, (_, idx) => {
    const months = idx * 3;
    const simple = Math.round(dailySaving * avgDaysInMonth * months);
    const compound = calculateCompoundBalance(months);
    const label = months === 0 ? 'Start' : `Mo ${months}`;

    return {
      name: label,
      'Simple Savings': simple,
      'Compounded Wealth': compound,
    };
  });

  const quickAmounts = [10, 20, 50, 100, 200];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
            <TrendingUp size={28} className="text-blue-500" />
            Savings Impact Calculator
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto">
            Small daily savings add up to create a large financial safety net. Slide or select an amount below to see the impact.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Inputs Panel */}
          <div className="md:col-span-5 fintech-card p-6 bg-card space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-500">Select Daily Saving</h2>
              <p className="text-[11px] text-muted-foreground">Adjust the slider to simulate your daily contribution.</p>
            </div>

            {/* Numeric display */}
            <div className="p-4 rounded-xl border border-border bg-secondary/15 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Your Daily Deposit</span>
              <div className="text-4xl font-extrabold mt-1 text-foreground">₹{dailySaving}</div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={dailySaving}
                onChange={(e) => setDailySaving(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>₹10</span>
                <span>₹100</span>
                <span>₹250</span>
                <span>₹500</span>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Quick Presets</label>
              <div className="grid grid-cols-5 gap-1.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDailySaving(amt)}
                    className={`py-1.5 border text-xs font-bold rounded-lg transition-all ${
                      dailySaving === amt 
                        ? 'border-blue-600 bg-blue-600/5 text-blue-500' 
                        : 'border-border bg-secondary/10 hover:bg-secondary/35 text-foreground'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Govt matching micro-tip info */}
            <div className="p-3.5 border-l-4 border-l-accent bg-accent/5 rounded-r-lg space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                <Award size={12} />
                Govt Co-Contribution Bonus
              </h4>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Micro-savings accounts qualify for a matching Govt 10% co-contribution bonus under social security schemes.
              </p>
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Monthly */}
              <div className="fintech-card p-5 bg-card flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Monthly saving</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">₹{monthlySavings.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                  <span>with growth:</span>
                  <span className="font-extrabold">₹{monthlyCompound.toLocaleString()}</span>
                </div>
              </div>

              {/* Yearly */}
              <div className="fintech-card p-5 bg-card flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Yearly saving</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">₹{yearlySavings.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                  <span>with growth:</span>
                  <span className="font-extrabold">₹{yearlyCompound.toLocaleString()}</span>
                </div>
              </div>

              {/* 3 Years */}
              <div className="fintech-card p-5 bg-card flex flex-col justify-between space-y-2 border-blue-600/30">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-blue-500">3 year saving</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">₹{threeYearSavings.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                  <span>with growth:</span>
                  <span className="font-extrabold">₹{threeYearCompound.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Interactive chart */}
            <div className="fintech-card p-6 bg-card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                  <TrendingUp size={16} />
                  3-Year Savings & Compound Interest Curve (₹)
                </h3>
                <div className="text-[9px] font-bold text-muted-foreground bg-secondary/35 px-2 py-0.5 rounded border border-border">
                  Interactive Chart
                </div>
              </div>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip
                      contentStyle={{ background: '#111624', border: '1px solid #1d2433', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                    
                    <defs>
                      <linearGradient id="colorSimple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d09c" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#00d09c" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>

                    <Area type="monotone" dataKey="Simple Savings" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSimple)" />
                    <Area type="monotone" dataKey="Compounded Wealth" stroke="#00d09c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompound)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
