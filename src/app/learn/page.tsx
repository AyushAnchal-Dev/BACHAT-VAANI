'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/components/LanguageProvider';
import {
  BookOpen, PiggyBank, ShieldCheck, CreditCard, AlertTriangle,
  Lightbulb, CheckCircle2, ChevronRight, Sparkles, TrendingUp,
  Filter, Search, Eye, Bookmark, BarChart3
} from 'lucide-react';

// ---------- Category Config ----------
interface Category {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  descEn: string;
  descHi: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'ALL',
    labelEn: 'All Tips',
    labelHi: 'सभी सुझाव',
    icon: <BookOpen size={18} />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    descEn: 'Browse all financial literacy tips',
    descHi: 'सभी वित्तीय साक्षरता सुझाव देखें',
  },
  {
    id: 'SAVINGS',
    labelEn: 'Saving Basics',
    labelHi: 'बचत की मूल बातें',
    icon: <PiggyBank size={18} />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    descEn: 'Learn the fundamentals of saving money daily',
    descHi: 'प्रतिदिन पैसे बचाने की मूल बातें सीखें',
  },
  {
    id: 'EMERGENCY',
    labelEn: 'Emergency Funds',
    labelHi: 'आपातकालीन कोष',
    icon: <ShieldCheck size={18} />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    descEn: 'Build a safety net for unexpected expenses',
    descHi: 'अप्रत्याशित खर्चों के लिए सुरक्षा कोष बनाएं',
  },
  {
    id: 'LOANS',
    labelEn: 'Debt Management',
    labelHi: 'कर्ज प्रबंधन',
    icon: <AlertTriangle size={18} />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    descEn: 'Avoid debt traps and manage loans wisely',
    descHi: 'कर्ज के जाल से बचें और ऋण को बुद्धिमानी से प्रबंधित करें',
  },
  {
    id: 'DIGITAL',
    labelEn: 'Digital Payments',
    labelHi: 'डिजिटल भुगतान',
    icon: <CreditCard size={18} />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    descEn: 'Understand UPI, mobile wallets & digital safety',
    descHi: 'UPI, मोबाइल वॉलेट और डिजिटल सुरक्षा को समझें',
  },
];

// ---------- Built-in Content Library ----------
interface TipContent {
  id: string;
  contentEn: string;
  contentHi: string;
  category: string;
}

const BUILT_IN_TIPS: TipContent[] = [
  // SAVINGS
  { id: 'b1', category: 'SAVINGS', contentEn: 'Save at least 10% of your daily wage before spending on non-essentials. This simple rule can transform your financial future.', contentHi: 'गैर-जरूरी चीजों पर खर्च करने से पहले अपनी दैनिक मजदूरी का कम से कम 10% बचाएं। यह सरल नियम आपका वित्तीय भविष्य बदल सकता है।' },
  { id: 'b2', category: 'SAVINGS', contentEn: 'Track your daily expenses. Even saving ₹20 a day adds up to over ₹7,000 in a single year!', contentHi: 'अपने दैनिक खर्चों को ट्रैक करें। एक दिन में ₹20 बचाने से भी एक साल में ₹7,000 से अधिक हो जाते हैं!' },
  { id: 'b3', category: 'SAVINGS', contentEn: 'A savings streak keeps you disciplined. Try to deposit a small amount every single day without fail.', contentHi: 'बचत की लकीर आपको अनुशासित रखती है। हर दिन बिना चूके एक छोटी राशि जमा करने का प्रयास करें।' },
  { id: 'b4', category: 'SAVINGS', contentEn: 'Pay yourself first. Before paying bills or buying groceries, set aside your savings amount.', contentHi: 'पहले अपने आप को भुगतान करें। बिल या किराने का सामान खरीदने से पहले अपनी बचत राशि अलग रखें।' },
  { id: 'b5', category: 'SAVINGS', contentEn: 'Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Adapt it to your daily wage.', contentHi: '50/30/20 नियम अपनाएं: 50% जरूरतों के लिए, 30% इच्छाओं के लिए, और 20% बचत के लिए।' },
  // EMERGENCY
  { id: 'b6', category: 'EMERGENCY', contentEn: 'Set a clear savings goal for emergency healthcare so you don\'t need to borrow when someone falls sick.', contentHi: 'आपातकालीन स्वास्थ्य देखभाल के लिए एक स्पष्ट बचत लक्ष्य निर्धारित करें ताकि किसी के बीमार होने पर आपको उधार न लेना पड़े।' },
  { id: 'b7', category: 'EMERGENCY', contentEn: 'Aim to save at least 3 months of expenses as an emergency fund. Start small — even ₹10/day helps.', contentHi: 'आपातकालीन कोष के रूप में कम से कम 3 महीने के खर्च की बचत करने का लक्ष्य रखें। छोटी शुरुआत करें — ₹10/दिन भी मदद करता है।' },
  { id: 'b8', category: 'EMERGENCY', contentEn: 'Keep your emergency fund separate from your regular savings. Don\'t touch it for daily expenses.', contentHi: 'अपने आपातकालीन कोष को अपनी नियमित बचत से अलग रखें। दैनिक खर्चों के लिए इसे न छुएं।' },
  { id: 'b9', category: 'EMERGENCY', contentEn: 'Natural disasters, medical emergencies, and job loss are real risks. A small daily saving builds your safety net.', contentHi: 'प्राकृतिक आपदाएं, चिकित्सा आपातकाल और नौकरी का नुकसान वास्तविक जोखिम हैं। छोटी दैनिक बचत आपका सुरक्षा जाल बनाती है।' },
  // LOANS
  { id: 'b10', category: 'LOANS', contentEn: 'Avoid high-interest local money lenders. Rely on micro-savings and self-help groups instead.', contentHi: 'उच्च ब्याज वाले स्थानीय साहूकारों से बचें। इसके बजाय माइक्रो-बचत और स्वयं सहायता समूहों पर भरोसा करें।' },
  { id: 'b11', category: 'LOANS', contentEn: 'If you must borrow, compare interest rates. Government schemes often offer loans at 4-7% versus local lenders at 36-60%.', contentHi: 'यदि उधार लेना ही पड़े, तो ब्याज दरों की तुलना करें। सरकारी योजनाएं 4-7% पर ऋण देती हैं जबकि स्थानीय साहूकार 36-60% लेते हैं।' },
  { id: 'b12', category: 'LOANS', contentEn: 'Never borrow to pay for celebrations or festivals. Save in advance using a dedicated goal instead.', contentHi: 'उत्सव या त्योहारों के लिए कभी उधार न लें। इसके बजाय एक समर्पित लक्ष्य बनाकर पहले से बचत करें।' },
  { id: 'b13', category: 'LOANS', contentEn: 'If you have existing debt, focus on paying the highest-interest loan first. This saves the most money over time.', contentHi: 'यदि आप पर कर्ज है, तो सबसे अधिक ब्याज वाले ऋण को पहले चुकाने पर ध्यान दें। इससे समय के साथ सबसे अधिक पैसे बचते हैं।' },
  // DIGITAL  
  { id: 'b14', category: 'DIGITAL', contentEn: 'UPI payments are free and instant. Use apps like BHIM, Google Pay, or PhonePe for cashless transactions.', contentHi: 'UPI भुगतान मुफ्त और तत्काल हैं। कैशलेस लेनदेन के लिए BHIM, Google Pay या PhonePe जैसे ऐप का उपयोग करें।' },
  { id: 'b15', category: 'DIGITAL', contentEn: 'Never share your OTP or UPI PIN with anyone — not even bank employees. Legitimate services will never ask for it.', contentHi: 'अपना OTP या UPI PIN किसी के साथ साझा न करें — बैंक कर्मचारियों के साथ भी नहीं। वैध सेवाएं कभी नहीं मांगती।' },
  { id: 'b16', category: 'DIGITAL', contentEn: 'Always verify the receiver\'s name before confirming a UPI payment. Double-check the amount to avoid errors.', contentHi: 'UPI भुगतान की पुष्टि करने से पहले हमेशा प्राप्तकर्ता का नाम सत्यापित करें। गलतियों से बचने के लिए राशि दोबारा जांचें।' },
  { id: 'b17', category: 'DIGITAL', contentEn: 'Digital records of all transactions help you track expenses automatically. No need to maintain paper notebooks.', contentHi: 'सभी लेनदेन के डिजिटल रिकॉर्ड आपको स्वचालित रूप से खर्चों को ट्रैक करने में मदद करते हैं। कागज की नोटबुक रखने की जरूरत नहीं।' },
  // BUDGETING (maps to SAVINGS for display purposes)
  { id: 'b18', category: 'SAVINGS', contentEn: 'Before buying anything, ask: "Do I need this or do I want this?" This simple question saves thousands every month.', contentHi: 'कुछ भी खरीदने से पहले पूछें: "क्या मुझे इसकी जरूरत है या यह मेरी इच्छा है?" यह सरल सवाल हर महीने हजारों बचाता है।' },
];

// ---------- Read Progress Utilities ----------
const STORAGE_KEY = 'bachatvaani_read_tips';

function getReadTips(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function markTipRead(id: string): string[] {
  const current = getReadTips();
  if (!current.includes(id)) {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

// ---------- Relative date ----------
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ---------- Main Component ----------
export default function LearnPage() {
  const { language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [readTips, setReadTips] = useState<string[]>([]);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbTips, setDbTips] = useState<TipContent[]>([]);

  // Load read progress from localStorage
  useEffect(() => {
    setReadTips(getReadTips());
  }, []);

  // Load tips from DB
  useEffect(() => {
    fetch('/api/tips/all')
      .then(res => res.ok ? res.json() : { tips: [] })
      .then(data => {
        if (data.tips?.length) {
          setDbTips(data.tips.map((t: any) => ({
            id: t.id,
            contentEn: t.contentEn,
            contentHi: t.contentHi,
            category: t.category,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Merge built-in + DB tips (deduplicate by content)
  const allTips = [...BUILT_IN_TIPS];
  dbTips.forEach(dbTip => {
    const exists = allTips.some(t => t.contentEn === dbTip.contentEn);
    if (!exists) allTips.push(dbTip);
  });

  // Get today's tip
  const dayIndex = getDayOfYear() % allTips.length;
  const dailyTip = allTips[dayIndex];

  // Filter tips
  const filteredTips = allTips.filter(tip => {
    const matchesCategory = activeCategory === 'ALL' || tip.category === activeCategory;
    const content = language === 'hi' ? tip.contentHi : tip.contentEn;
    const matchesSearch = !searchQuery || content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stats
  const totalTips = allTips.length;
  const readCount = readTips.length;
  const progressPercent = totalTips > 0 ? Math.round((readCount / totalTips) * 100) : 0;

  // Category stats
  const categoryStats = CATEGORIES.filter(c => c.id !== 'ALL').map(cat => {
    const catTips = allTips.filter(t => t.category === cat.id);
    const catRead = catTips.filter(t => readTips.includes(t.id)).length;
    return { ...cat, total: catTips.length, read: catRead };
  });

  const handleMarkRead = (tipId: string) => {
    const updated = markTipRead(tipId);
    setReadTips(updated);
  };

  const getCategoryMeta = (catId: string): Category => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">

        {/* Hero */}
        <div className="text-center mb-10 voice-demo-hero-enter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-emerald-500/20">
            <BookOpen size={12} />
            {language === 'hi' ? 'वित्तीय साक्षरता' : 'Financial Literacy'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            {language === 'hi' ? 'पैसे की' : 'Master Your'}{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-600 bg-clip-text text-transparent">
              {language === 'hi' ? 'समझ बढ़ाएं' : 'Money Skills'}
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {language === 'hi'
              ? 'बचत, आपातकालीन कोष, कर्ज प्रबंधन और डिजिटल भुगतान के बारे में सीखें।'
              : 'Learn about saving, emergency funds, debt management, and digital payments — one tip at a time.'}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 voice-demo-panel-enter" style={{ animationDelay: '80ms' }}>
          <div className="fintech-card p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-500">{totalTips}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              {language === 'hi' ? 'कुल सुझाव' : 'Total Tips'}
            </p>
          </div>
          <div className="fintech-card p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-500">{readCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              {language === 'hi' ? 'पढ़े गए' : 'Tips Read'}
            </p>
          </div>
          <div className="fintech-card p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-500">{progressPercent}%</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              {language === 'hi' ? 'प्रगति' : 'Progress'}
            </p>
          </div>
          <div className="fintech-card p-4 text-center">
            <p className="text-2xl font-extrabold text-purple-500">{CATEGORIES.length - 1}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              {language === 'hi' ? 'श्रेणियां' : 'Categories'}
            </p>
          </div>
        </div>

        {/* Daily Tip Highlight */}
        <div className="mb-8 voice-demo-panel-enter" style={{ animationDelay: '160ms' }}>
          <div className="fintech-card p-6 border-l-4 border-l-emerald-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Lightbulb size={24} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    {language === 'hi' ? '✨ आज का सुझाव' : '✨ Tip of the Day'}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryMeta(dailyTip.category).bgColor} ${getCategoryMeta(dailyTip.category).color}`}>
                    {language === 'hi' ? getCategoryMeta(dailyTip.category).labelHi : getCategoryMeta(dailyTip.category).labelEn}
                  </span>
                </div>
                <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                  {language === 'hi' ? dailyTip.contentHi : dailyTip.contentEn}
                </p>
                {!readTips.includes(dailyTip.id) && (
                  <button
                    onClick={() => handleMarkRead(dailyTip.id)}
                    className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    {language === 'hi' ? 'पढ़ा हुआ मार्क करें' : 'Mark as Read'}
                  </button>
                )}
                {readTips.includes(dailyTip.id) && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500/50">
                    <CheckCircle2 size={12} />
                    {language === 'hi' ? 'पढ़ा हुआ ✓' : 'Read ✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Sidebar: Categories */}
          <div className="lg:col-span-1 space-y-4 voice-demo-panel-enter" style={{ animationDelay: '240ms' }}>
            {/* Category Cards */}
            <div className="fintech-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Filter size={12} />
                {language === 'hi' ? 'श्रेणियां' : 'Categories'}
              </h3>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => {
                  const stats = categoryStats.find(s => s.id === cat.id);
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        isActive
                          ? `${cat.bgColor} border border-current/10`
                          : 'hover:bg-secondary/10 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md ${cat.bgColor} flex items-center justify-center ${cat.color} shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isActive ? cat.color : 'text-foreground'}`}>
                          {language === 'hi' ? cat.labelHi : cat.labelEn}
                        </p>
                        {stats && (
                          <p className="text-[9px] text-muted-foreground/60">
                            {stats.read}/{stats.total} {language === 'hi' ? 'पढ़े' : 'read'}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="fintech-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 size={12} />
                {language === 'hi' ? 'पढ़ने की प्रगति' : 'Read Progress'}
              </h3>
              <div className="space-y-3">
                {categoryStats.map(cat => {
                  const pct = cat.total > 0 ? Math.round((cat.read / cat.total) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-semibold ${cat.color}`}>
                          {language === 'hi' ? cat.labelHi : cat.labelEn}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cat.color.includes('emerald') ? 'bg-emerald-500' :
                            cat.color.includes('amber') ? 'bg-amber-500' :
                            cat.color.includes('red') ? 'bg-red-500' :
                            cat.color.includes('purple') ? 'bg-purple-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Overall */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">
                      {language === 'hi' ? 'कुल प्रगति' : 'Overall'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-500">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Tips Archive */}
          <div className="lg:col-span-3 space-y-4 voice-demo-panel-enter" style={{ animationDelay: '320ms' }}>
            {/* Search */}
            <div className="fintech-card p-3">
              <div className="flex items-center gap-3">
                <Search size={16} className="text-muted-foreground/50 shrink-0" />
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'सुझाव खोजें...' : 'Search tips...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-xs text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Active Category Header */}
            {activeCategory !== 'ALL' && (
              <div className={`fintech-card p-4 border-l-4 ${
                getCategoryMeta(activeCategory).color.includes('emerald') ? 'border-l-emerald-500' :
                getCategoryMeta(activeCategory).color.includes('amber') ? 'border-l-amber-500' :
                getCategoryMeta(activeCategory).color.includes('red') ? 'border-l-red-500' :
                getCategoryMeta(activeCategory).color.includes('purple') ? 'border-l-purple-500' : 'border-l-blue-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getCategoryMeta(activeCategory).bgColor} flex items-center justify-center ${getCategoryMeta(activeCategory).color}`}>
                    {getCategoryMeta(activeCategory).icon}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${getCategoryMeta(activeCategory).color}`}>
                      {language === 'hi' ? getCategoryMeta(activeCategory).labelHi : getCategoryMeta(activeCategory).labelEn}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {language === 'hi' ? getCategoryMeta(activeCategory).descHi : getCategoryMeta(activeCategory).descEn}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Grid */}
            {filteredTips.length === 0 ? (
              <div className="fintech-card p-12 text-center">
                <BookOpen size={32} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  {language === 'hi' ? 'कोई सुझाव नहीं मिला' : 'No tips found'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'hi' ? 'अपनी खोज या श्रेणी बदलें' : 'Try a different search or category'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTips.map((tip, index) => {
                  const cat = getCategoryMeta(tip.category);
                  const isRead = readTips.includes(tip.id);
                  const isExpanded = expandedTip === tip.id;
                  const content = language === 'hi' ? tip.contentHi : tip.contentEn;

                  return (
                    <div
                      key={tip.id}
                      className={`fintech-card p-4 transition-all cursor-pointer notification-item-enter ${
                        isRead ? 'opacity-75' : ''
                      } ${isExpanded ? 'ring-1 ring-blue-500/30' : ''}`}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => {
                        setExpandedTip(isExpanded ? null : tip.id);
                        if (!isRead) handleMarkRead(tip.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center ${cat.color} shrink-0 mt-0.5`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cat.bgColor} ${cat.color}`}>
                              {language === 'hi' ? cat.labelHi : cat.labelEn}
                            </span>
                            {isRead && (
                              <CheckCircle2 size={10} className="text-emerald-500/50" />
                            )}
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'} ${
                            isRead ? 'text-muted-foreground' : 'text-foreground font-medium'
                          }`}>
                            {content}
                          </p>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-[10px] text-muted-foreground/60 italic">
                                {language === 'hi'
                                  ? (language === 'hi' ? tip.contentEn : tip.contentHi)
                                  : tip.contentHi}
                              </p>
                            </div>
                          )}
                        </div>
                        <ChevronRight size={14} className={`text-muted-foreground/30 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 voice-demo-panel-enter" style={{ animationDelay: '400ms' }}>
          <div className="fintech-card inline-flex items-center gap-4 px-8 py-5">
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">
                {language === 'hi' ? 'अभी बचत शुरू करें' : 'Start saving with knowledge'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'hi' ? 'जानकारी + बचत = वित्तीय स्वतंत्रता' : 'Knowledge + Savings = Financial Freedom'}
              </p>
            </div>
            <a
              href="/auth/register"
              className="shrink-0 px-5 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              <TrendingUp size={14} />
              {language === 'hi' ? 'शुरू करें' : 'Get Started'}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
