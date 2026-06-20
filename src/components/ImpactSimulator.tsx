'use client';

import React, { useState } from 'react';
import { useTranslation } from './LanguageProvider';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ImpactSimulator() {
  const { t } = useTranslation();
  const [dailySaving, setDailySaving] = useState<number>(20);

  // Constants
  const interestRate = 0.06; // 6% compound interest
  const matchRate = 0.10; // 10% match

  // Calculations for 1 to 5 years
  const data = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1;
    const annualPrincipal = dailySaving * 365;
    
    // Simple compound interest calculation
    let totalSavings = 0;
    for (let y = 0; y < year; y++) {
      totalSavings = (totalSavings + annualPrincipal) * (1 + interestRate);
    }
    
    const principal = annualPrincipal * year;
    const matchBonus = principal * matchRate;
    const interest = Math.max(0, totalSavings - principal);
    const totalWealth = Math.round(principal + matchBonus + interest);

    return {
      name: `Yr ${year}`,
      Principal: Math.round(principal),
      Bonus: Math.round(matchBonus),
      Interest: Math.round(interest),
      Total: totalWealth,
    };
  });

  const currentYearData = data[4]; // 5th year

  return (
    <div className="glass-premium p-6 rounded-2xl w-full max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-blue-600">{t('simulator.title')}</h3>
        <p className="text-xs text-muted-foreground">{t('simulator.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold">{t('simulator.sliderLabel')}</label>
          <span className="text-xl font-bold text-primary">₹{dailySaving} / day</span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={dailySaving}
          onChange={(e) => setDailySaving(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>₹10</span>
          <span>₹100</span>
          <span>₹250</span>
          <span>₹500</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">{t('simulator.weekly')}</div>
          <div className="text-lg font-bold text-foreground">₹{dailySaving * 7}</div>
        </div>
        <div className="glass p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">{t('simulator.monthly')}</div>
          <div className="text-lg font-bold text-foreground">₹{dailySaving * 30}</div>
        </div>
        <div className="glass p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">{t('simulator.yearly')}</div>
          <div className="text-lg font-bold text-foreground">₹{dailySaving * 365}</div>
        </div>
        <div className="glass p-3 rounded-xl border border-blue-600/20 bg-blue-600/5">
          <div className="text-[10px] text-blue-600 font-semibold">{t('simulator.fiveYear')}</div>
          <div className="text-lg font-bold text-blue-600">₹{currentYearData.Total}</div>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-xs">
          <span>Principal Saved</span>
          <span className="font-semibold text-foreground">₹{currentYearData.Principal}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>{t('simulator.bonus')}</span>
          <span className="font-semibold text-emerald-500">+₹{currentYearData.Bonus}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>{t('simulator.interest')}</span>
          <span className="font-semibold text-indigo-400">+₹{currentYearData.Interest}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2 text-blue-600">
          <span>{t('simulator.total')}</span>
          <span>₹{currentYearData.Total}</span>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="Total" stroke="#f59e0b" fillOpacity={0.2} fill="url(#colorTotal)" />
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
