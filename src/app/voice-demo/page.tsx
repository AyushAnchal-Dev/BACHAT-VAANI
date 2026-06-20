'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/components/LanguageProvider';
import { 
  Mic, MicOff, Volume2, Sparkles, ArrowRight, 
  Wallet, Trophy, PiggyBank, Eye, CircleDollarSign,
  CheckCircle2, AlertCircle, Lightbulb, Zap
} from 'lucide-react';

// ---------- Types ----------
interface DemoAction {
  intent: string;
  label: string;
  icon: React.ReactNode;
  response: string;
  responseHi: string;
  color: string;
  bgColor: string;
}

// ---------- Canvas Waveform ----------
function LiveWaveform({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Cleanup
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      // Draw flat line
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext;

    const startVisualization = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animRef.current = requestAnimationFrame(draw);
          analyser.getByteTimeDomainData(dataArray);

          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Gradient stroke
          const gradient = ctx.createLinearGradient(0, 0, w, 0);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(0.5, '#00d09c');
          gradient.addColorStop(1, '#2563eb');

          ctx.lineWidth = 3;
          ctx.strokeStyle = gradient;
          ctx.beginPath();

          const sliceWidth = w / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }

          ctx.lineTo(w, h / 2);
          ctx.stroke();

          // Glow effect
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#2563eb';
          ctx.stroke();
          ctx.shadowBlur = 0;
        };

        draw();
      } catch (err) {
        // Fallback: animated sine wave
        let phase = 0;
        const drawFallback = () => {
          animRef.current = requestAnimationFrame(drawFallback);
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const gradient = ctx.createLinearGradient(0, 0, w, 0);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(0.5, '#00d09c');
          gradient.addColorStop(1, '#2563eb');

          ctx.lineWidth = 3;
          ctx.strokeStyle = gradient;
          ctx.beginPath();

          for (let x = 0; x < w; x++) {
            const y = h / 2 + Math.sin((x / w) * 4 * Math.PI + phase) * (h / 4) * (0.5 + Math.random() * 0.5);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          phase += 0.08;
        };
        drawFallback();
      }
    };

    startVisualization();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full h-[120px] rounded-xl"
    />
  );
}

// ---------- Demo Actions Config ----------
const DEMO_ACTIONS: DemoAction[] = [
  {
    intent: 'SAVE',
    label: 'Save 20 rupees',
    icon: <PiggyBank size={18} />,
    response: 'Saved ₹20 successfully! Your new balance is ₹4,520. Keep up the great habit! 🎉',
    responseHi: '₹20 सफलतापूर्वक बचाए! आपका नया बैलेंस ₹4,520 है। अच्छी आदत बनाए रखें! 🎉',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    intent: 'BALANCE',
    label: 'Show my balance',
    icon: <Wallet size={18} />,
    response: 'Your total savings balance is ₹4,500. You saved ₹600 this month. Amazing progress! 💰',
    responseHi: 'आपका कुल बैलेंस ₹4,500 है। इस महीने आपने ₹600 बचाए। शानदार प्रगति! 💰',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    intent: 'REWARDS',
    label: 'Open rewards',
    icon: <Trophy size={18} />,
    response: 'Opening your rewards! You have 3 badges: First Saver, 7-Day Warrior, and Thousand Club. 🏆',
    responseHi: 'आपके पुरस्कार खोल रहे हैं! आपके 3 बिल्ले हैं: पहला बचतकर्ता, 7-दिवसीय योद्धा, और हजार क्लब। 🏆',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    intent: 'WITHDRAW',
    label: 'Withdraw 100 rupees',
    icon: <CircleDollarSign size={18} />,
    response: 'Withdrawal request of ₹100 submitted for admin approval. You\'ll be notified once processed. ✅',
    responseHi: '₹100 की निकासी का अनुरोध प्रशासक मंजूरी के लिए भेजा गया। प्रोसेस होने पर सूचना मिलेगी। ✅',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    intent: 'TIP',
    label: 'Play financial tip',
    icon: <Lightbulb size={18} />,
    response: 'Today\'s tip: Save at least 10% of your daily earnings. Even ₹20/day becomes ₹7,300 in a year! 📈',
    responseHi: 'आज की सलाह: अपनी दैनिक कमाई का कम से कम 10% बचाएं। ₹20/दिन भी एक साल में ₹7,300 बन जाते हैं! 📈',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

// ---------- Command Log Entry ----------
interface CommandLog {
  id: number;
  transcript: string;
  intent: string;
  response: string;
  timestamp: Date;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

// ---------- Main Page ----------
export default function VoiceDemoPage() {
  const { language, t } = useTranslation();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [currentResponseColor, setCurrentResponseColor] = useState('text-foreground');
  const [commandLog, setCommandLog] = useState<CommandLog[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        recog.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setCurrentResponse(null);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += t;
            } else {
              interimTranscript += t;
            }
          }
          setTranscript(finalTranscript || interimTranscript);
          if (finalTranscript) {
            processDemoCommand(finalTranscript);
          }
        };

        setRecognition(recog);
      } else {
        setSupported(false);
      }
    }
  }, [language]);

  // Auto-scroll command log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandLog]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      try { recognition.start(); } catch {}
    }
  }, [recognition, isListening, language]);

  const processDemoCommand = (text: string) => {
    const lower = text.toLowerCase();
    setProcessing(true);

    // Match intent
    let matched: DemoAction | null = null;

    // Save
    if (/(?:save|saving|deposit|bachat|bachao|बचा|जमा)\s*\d*/i.test(lower) || /\d+\s*(?:rupee|rupaye|रुपय|save)/i.test(lower)) {
      matched = DEMO_ACTIONS[0];
    }
    // Balance
    else if (/balance|बैलेंस|total|कुल|paisa|paise|kitna/i.test(lower)) {
      matched = DEMO_ACTIONS[1];
    }
    // Rewards
    else if (/reward|badge|streak|इनाम|बिल्ला|पुरस्कार/i.test(lower)) {
      matched = DEMO_ACTIONS[2];
    }
    // Withdraw
    else if (/withdraw|nikalo|निकाल/i.test(lower)) {
      matched = DEMO_ACTIONS[3];
    }
    // Tip
    else if (/tip|सलाह|टिप|सुझाव|financial/i.test(lower)) {
      matched = DEMO_ACTIONS[4];
    }

    // Simulate processing delay
    setTimeout(() => {
      if (matched) {
        const response = language === 'hi' ? matched.responseHi : matched.response;
        setCurrentResponse(response);
        setCurrentResponseColor(matched.color);
        
        // Speak the response
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(v => v.lang.startsWith(language));
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        }

        setCommandLog(prev => [...prev, {
          id: Date.now(),
          transcript: text,
          intent: matched!.intent,
          response,
          timestamp: new Date(),
          color: matched!.color,
          bgColor: matched!.bgColor,
          icon: matched!.icon,
        }]);
      } else {
        const fallback = language === 'hi' 
          ? 'क्षमा करें, कृपया कहें: "20 रुपये बचाओ" या "मेरा बैलेंस बताओ"'
          : 'Sorry, try saying: "Save 20 rupees" or "Show my balance"';
        setCurrentResponse(fallback);
        setCurrentResponseColor('text-destructive');
        
        setCommandLog(prev => [...prev, {
          id: Date.now(),
          transcript: text,
          intent: 'UNKNOWN',
          response: fallback,
          timestamp: new Date(),
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          icon: <AlertCircle size={18} />,
        }]);
      }
      setProcessing(false);
    }, 800);
  };

  // Quick demo command (click)
  const triggerDemo = (action: DemoAction) => {
    setTranscript(action.label);
    setProcessing(true);

    setTimeout(() => {
      const response = language === 'hi' ? action.responseHi : action.response;
      setCurrentResponse(response);
      setCurrentResponseColor(action.color);

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }

      setCommandLog(prev => [...prev, {
        id: Date.now(),
        transcript: action.label,
        intent: action.intent,
        response,
        timestamp: new Date(),
        color: action.color,
        bgColor: action.bgColor,
        icon: action.icon,
      }]);
      setProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">

        {/* Hero Header */}
        <div className="text-center mb-10 voice-demo-hero-enter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-500/20">
            <Sparkles size={12} />
            Interactive Demo
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            Voice-Powered{' '}
            <span className="bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
              Micro-Savings
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Tap the microphone and speak a command. BachatVaani understands English and Hindi voice commands for saving, withdrawals, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Panel: Command Examples */}
          <div className="lg:col-span-1 space-y-4 voice-demo-panel-enter" style={{ animationDelay: '100ms' }}>
            <div className="fintech-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-4 flex items-center gap-1.5">
                <Zap size={14} />
                Try These Commands
              </h3>
              <div className="space-y-2">
                {DEMO_ACTIONS.map((action) => (
                  <button
                    key={action.intent}
                    onClick={() => triggerDemo(action)}
                    disabled={processing || isListening}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 text-left transition-all hover:border-border hover:bg-secondary/10 active:scale-[0.98] group ${
                      processing || isListening ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center ${action.color} shrink-0`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                        &ldquo;{action.label}&rdquo;
                      </p>
                    </div>
                    <ArrowRight size={12} className="text-muted-foreground/40 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Hindi commands */}
            <div className="fintech-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">
                हिन्दी Commands
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-secondary/10 border border-border/30">
                  <span className="text-blue-500 font-semibold">&ldquo;20 रुपये बचाओ&rdquo;</span>
                  <span className="text-muted-foreground ml-2">→ Save ₹20</span>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/10 border border-border/30">
                  <span className="text-blue-500 font-semibold">&ldquo;मेरा बैलेंस बताओ&rdquo;</span>
                  <span className="text-muted-foreground ml-2">→ Balance</span>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/10 border border-border/30">
                  <span className="text-blue-500 font-semibold">&ldquo;इनाम दिखाओ&rdquo;</span>
                  <span className="text-muted-foreground ml-2">→ Rewards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Microphone + Waveform */}
          <div className="lg:col-span-2 space-y-4 voice-demo-panel-enter" style={{ animationDelay: '200ms' }}>
            <div className="fintech-card p-6 md:p-8">
              {/* Status label */}
              <div className="text-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isListening
                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                    : processing
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-secondary/20 text-muted-foreground border-border'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isListening ? 'bg-red-500 animate-pulse' : processing ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground/40'
                  }`} />
                  {isListening ? 'Listening...' : processing ? 'Processing...' : 'Ready'}
                </span>
              </div>

              {/* Live Waveform */}
              <div className="mb-6 rounded-xl overflow-hidden bg-secondary/5 border border-border/30 p-2">
                <LiveWaveform isActive={isListening} />
              </div>

              {/* Transcript display */}
              <div className="min-h-[48px] flex items-center justify-center mb-6">
                {transcript ? (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground/60 mb-1">Recognized Speech</p>
                    <p className="text-lg font-bold text-foreground">&ldquo;{transcript}&rdquo;</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50 italic">
                    {isListening ? 'Speak now...' : 'Tap the microphone to start'}
                  </p>
                )}
              </div>

              {/* Microphone Button */}
              <div className="flex justify-center mb-6">
                {!supported ? (
                  <div className="text-center">
                    <p className="text-sm text-destructive font-semibold">Speech Recognition Not Supported</p>
                    <p className="text-xs text-muted-foreground mt-1">Use Chrome or Edge for voice features. You can still click the example commands.</p>
                  </div>
                ) : (
                  <button
                    onClick={toggleListening}
                    disabled={processing}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110'
                        : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] hover:scale-105'
                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Toggle Microphone"
                  >
                    {/* Pulse rings when listening */}
                    {isListening && (
                      <>
                        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                        <span className="absolute -inset-3 rounded-full border-2 border-red-500/20 mic-ring-pulse" />
                        <span className="absolute -inset-6 rounded-full border border-red-500/10 mic-ring-pulse" style={{ animationDelay: '0.3s' }} />
                      </>
                    )}
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                  </button>
                )}
              </div>

              {/* Response Display */}
              {currentResponse && (
                <div className={`p-4 rounded-xl border border-border/50 bg-secondary/5 voice-response-enter`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Volume2 size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">BachatVaani Response</p>
                      <p className={`text-sm font-medium leading-relaxed ${currentResponseColor}`}>
                        {currentResponse}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Command Activity Log */}
            {commandLog.length > 0 && (
              <div className="fintech-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Eye size={14} />
                  Command Activity Log
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {commandLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-border/30 notification-item-enter"
                    >
                      <div className={`w-7 h-7 rounded-md ${entry.bgColor} flex items-center justify-center ${entry.color} shrink-0 mt-0.5`}>
                        {entry.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${entry.bgColor} ${entry.color}`}>
                            {entry.intent}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">
                            {entry.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium">
                          &ldquo;{entry.transcript}&rdquo;
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                          → {entry.response}
                        </p>
                      </div>
                      <CheckCircle2 size={14} className="text-emerald-500/60 shrink-0 mt-1" />
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 voice-demo-panel-enter" style={{ animationDelay: '400ms' }}>
          <div className="fintech-card inline-flex items-center gap-4 px-8 py-5">
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">Ready to start saving with your voice?</p>
              <p className="text-xs text-muted-foreground">Create a free account and make your first micro-saving today.</p>
            </div>
            <a
              href="/auth/register"
              className="shrink-0 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
