'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './LanguageProvider';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { performOptimisticSaveUpdate, rollbackOptimisticSaveUpdate } from '@/lib/optimistic';

export function VoiceAssistant({ onSaveSuccess, currentBalance: propCurrentBalance, dailyTip }: {
  onSaveSuccess?: () => void;
  currentBalance?: number;
  dailyTip?: { contentEn: string; contentHi: string } | null;
}) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processingSave, setProcessingSave] = useState(false);
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setLocalBalance(data.user.currentBalance);
        }
      }
    } catch (e) {
      console.error('Error fetching balance locally:', e);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    if (propCurrentBalance !== undefined) {
      setLocalBalance(propCurrentBalance);
    }
  }, [propCurrentBalance]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        
        recog.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setFeedback(null);
        };
        
        recog.onend = () => {
          setIsListening(false);
        };
        
        recog.onerror = (e: any) => {
          console.error(e);
          setIsListening(false);
          setFeedback('Speech recognition error. Please try again.');
        };
        
        recog.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          processVoiceCommand(resultText);
        };
        
        setRecognition(recog);
      }
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognition) {
      setFeedback(t('voice.unsupported'));
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.start();
    }
  };

  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(language));
      if (voice) utterance.voice = voice;
      
      if (onEnd) {
        utterance.onend = () => {
          onEnd();
        };
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      if (onEnd) onEnd();
    }
  };

  const processVoiceCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Ignore echo transcriptions of the assistant's own spoken prompts
    const isSelfPrompt = 
      lowerText.includes('do you want') || 
      lowerText.includes('want to save') || 
      lowerText.includes('please confirm') || 
      lowerText.includes('saved successfully') ||
      lowerText.includes('balance is') ||
      lowerText.includes('financial tip') ||
      lowerText.includes('चाहते हैं') || 
      lowerText.includes('बचाना चाहते') || 
      lowerText.includes('पुष्टि करें') ||
      lowerText.includes('pusti kare') ||
      lowerText.includes('pustee kare');
      
    if (isSelfPrompt) {
      console.log('Ignored speech synthesis echo:', text);
      setTimeout(() => {
        if (recognition) {
          try {
            recognition.start();
          } catch (e) {
            // ignore if already started
          }
        }
      }, 300);
      return;
    }

    let intent = 'UNKNOWN';
    let responseSpeech = '';

    const logCommand = async (recognizedIntent: string) => {
      try {
        await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commandText: text, recognizedIntent }),
        });
      } catch (e) {
        console.error('Error logging voice command', e);
      }
    };

    // 1. Navigation Command: Show Transaction History
    const isHistoryCmd = 
      lowerText.includes('transaction') || 
      lowerText.includes('history') || 
      lowerText.includes('ledger') || 
      lowerText.includes('saving page') || 
      lowerText.includes('savings page') || 
      lowerText.includes('लेनदेन') || 
      lowerText.includes('इतिहास') || 
      lowerText.includes('history dikhao') || 
      lowerText.includes('ledger dikhao');

    if (isHistoryCmd) {
      intent = 'HISTORY';
      const speech = language === 'hi'
        ? 'आपके लेनदेन इतिहास पृष्ठ पर जा रहे हैं।'
        : 'Navigating to your transaction history.';
      setFeedback(speech);
      speakText(speech);
      showToast(speech, 'success');
      setTimeout(() => {
        router.push('/dashboard/savings');
      }, 1000);
      await logCommand(intent);
      return;
    }

    // 2. Navigation Command: Open Rewards
    const isRewardsCmd = 
      lowerText.includes('reward') || 
      lowerText.includes('rewards') || 
      lowerText.includes('badge') || 
      lowerText.includes('badges') || 
      lowerText.includes('streak') || 
      lowerText.includes('streaks') || 
      lowerText.includes('इनाम') || 
      lowerText.includes('बिल्ला') || 
      lowerText.includes('बिल्ले') || 
      lowerText.includes('badges page') || 
      lowerText.includes('reward kholo') || 
      lowerText.includes('badge kholo');

    if (isRewardsCmd) {
      intent = 'REWARDS';
      const speech = language === 'hi'
        ? 'आपके पुरस्कार और बिल्ला पृष्ठ पर जा रहे हैं।'
        : 'Navigating to your rewards and badges.';
      setFeedback(speech);
      speakText(speech);
      showToast(speech, 'success');
      setTimeout(() => {
        router.push('/dashboard/rewards');
      }, 1000);
      await logCommand(intent);
      return;
    }

    // 3. Action Command: Withdraw Money
    const enWithdrawMatch = lowerText.match(/(?:withdraw|withdrawal|take out|remove|nikalna|nikalo)\s*(?:rs\.?|₹|rupees|rupee)?\s*(\d+)/) || lowerText.match(/(?:rs\.?|₹)?\s*(\d+)\s*(?:rupees|rupee)?\s*(?:withdraw|nikal)/);
    const hiWithdrawMatch = lowerText.match(/(\d+)\s*(?:rupaye|rufee|rupee|rupya|rs|रुपये|रुपया|₹)?\s*(?:nikalo|nikalna|निकालो|निकालना)/);
    const withdrawAmount = enWithdrawMatch ? Number(enWithdrawMatch[1]) : (hiWithdrawMatch ? Number(hiWithdrawMatch[1]) : null);

    if (withdrawAmount && !isNaN(withdrawAmount)) {
      intent = 'WITHDRAW';
      setProcessingSave(true);
      
      let balance = localBalance ?? propCurrentBalance ?? 0;
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            balance = data.user.currentBalance;
            setLocalBalance(balance);
          }
        }
      } catch (e) {
        console.error('Error fetching balance inline:', e);
      }

      if (withdrawAmount > balance) {
        const errorSpeech = language === 'hi'
          ? `अपर्याप्त राशि। आपका वर्तमान बैलेंस ₹${balance} है।`
          : `Insufficient balance. Your current balance is ₹${balance}.`;
        setFeedback(errorSpeech);
        speakText(errorSpeech);
        showToast(errorSpeech, 'error');
        setProcessingSave(false);
        await logCommand(intent);
        return;
      }

      try {
        const res = await fetch('/api/withdrawals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: withdrawAmount }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit withdrawal.');
        }

        await fetchBalance();
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        
        const successSpeech = language === 'hi'
          ? `${withdrawAmount} रुपये की निकासी का अनुरोध भेजा गया।`
          : `Withdrawal request for ${withdrawAmount} rupees submitted successfully.`;
        
        setFeedback(successSpeech);
        speakText(successSpeech);
        showToast(successSpeech, 'success');
        if (onSaveSuccess) onSaveSuccess();
      } catch (e: any) {
        const errMsg = e.message || 'Error processing withdrawal.';
        setFeedback(errMsg);
        speakText(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setProcessingSave(false);
      }
      await logCommand(intent);
      return;
    }

    // 4. Action Command: Save Money
    const enSaveMatch = lowerText.match(/(?:save|saving|savings|deposit|add|invest)\s*(?:rs\.?|₹|rupees|rupee)?\s*(\d+)/) || lowerText.match(/(?:rs\.?|₹)?\s*(\d+)\s*(?:rupees|rupee)?\s*(?:save|deposit|add|invest)/);
    const hiSaveMatch = lowerText.match(/(\d+)\s*(?:rupaye|rufee|rupee|rupya|rs|रुपये|रुपया|₹)?\s*(?:save|saving|savings|jama|bachat|daalo|bachao|जमा|बचत|डालो|बचाओ)/);
    const saveAmount = enSaveMatch ? Number(enSaveMatch[1]) : (hiSaveMatch ? Number(hiSaveMatch[1]) : null);

    if (saveAmount && !isNaN(saveAmount)) {
      intent = 'SAVE';
      setProcessingSave(true);

      // Perform real-time optimistic update
      let optimisticContext;
      try {
        optimisticContext = await performOptimisticSaveUpdate(queryClient, {
          amount: saveAmount,
          description: 'Voice Ingested Saving',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Error during voice save optimistic update:', e);
      }

      try {
        const res = await fetch('/api/savings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: saveAmount, description: 'Voice Ingested Saving' }),
        });
        if (!res.ok) throw new Error();
        
        await fetchBalance();
        
        // Reconcile and synchronize queries
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['admin-reports-analytics'] });
        
        const successSpeech = language === 'hi'
          ? `${saveAmount} रुपये सफलतापूर्वक बचाए गए!`
          : `${saveAmount} rupees saved successfully!`;
        
        setFeedback(successSpeech);
        speakText(successSpeech);
        showToast(successSpeech, 'success');
        if (onSaveSuccess) onSaveSuccess();
      } catch (e) {
        // Rollback on error
        if (optimisticContext) {
          rollbackOptimisticSaveUpdate(queryClient, optimisticContext);
        }
        const errText = 'Error processing savings.';
        setFeedback(errText);
        speakText(errText);
        showToast(errText, 'error');
      } finally {
        setProcessingSave(false);
      }
      await logCommand(intent);
      return;
    }

    // 5. Action Command: Balance Inquiry
    const isBalanceCmd = 
      lowerText.includes('balance') || 
      lowerText.includes('बैलेंस') || 
      lowerText.includes('total savings') || 
      lowerText.includes('कुल बचत') || 
      lowerText.includes('बचत दिखाओ') || 
      lowerText.includes('पैसे बताओ') || 
      lowerText.includes('paisa check') || 
      lowerText.includes('paise check') || 
      lowerText.includes('paisa batao') || 
      lowerText.includes('paise batao') || 
      lowerText.includes('kitna paisa') || 
      lowerText.includes('kitne paise') || 
      lowerText.includes('kitni bachat') || 
      lowerText.includes('mera paisa') || 
      lowerText.includes('mere paise') || 
      lowerText.includes('kitna hai');

    if (isBalanceCmd) {
      intent = 'BALANCE';
      let balance = localBalance ?? propCurrentBalance ?? 0;
      
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            balance = data.user.currentBalance;
            setLocalBalance(balance);
          }
        }
      } catch (e) {
        console.error('Error fetching balance inline:', e);
      }

      responseSpeech = language === 'hi'
        ? `आपका कुल बैलेंस ${balance} रुपये है।`
        : `Your total savings balance is ${balance} rupees.`;
      
      setFeedback(responseSpeech);
      speakText(responseSpeech);
      showToast(responseSpeech, 'success');
      await logCommand(intent);
      return;
    }

    // 6. Action Command: Play financial tip
    const isTipCmd = 
      lowerText.includes('tip') || 
      lowerText.includes('literacy') || 
      lowerText.includes('टिप') || 
      lowerText.includes('सुझाव');

    if (isTipCmd && dailyTip) {
      intent = 'TIP';
      const tipContent = language === 'hi' ? dailyTip.contentHi : dailyTip.contentEn;
      responseSpeech = language === 'hi'
        ? `आज की वित्तीय सलाह है: ${tipContent}`
        : `Today's financial tip is: ${tipContent}`;
      
      setFeedback(responseSpeech);
      speakText(responseSpeech);
      showToast(language === 'hi' ? 'वित्तीय सलाह बज रही है' : 'Playing financial tip', 'success');
      await logCommand(intent);
      return;
    }

    // 7. Fallback when command is not recognized
    responseSpeech = language === 'hi'
      ? `क्षमा करें, मैं समझ नहीं सका। कृपया कहें: 50 रुपये बचाएं, या मेरा बैलेंस बताओ।`
      : `Sorry, I couldn't understand. Please say: Save 50 rupees, or check my balance.`;
    setFeedback(responseSpeech);
    speakText(responseSpeech);
    showToast(responseSpeech, 'error');
    await logCommand('UNKNOWN');
  };

  return (
    <div className="space-y-4 w-full">
      <div className="fintech-card p-6 bg-card text-center relative overflow-hidden flex flex-col items-center justify-center">
        
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5 mb-2">
          <Sparkles size={14} className="text-accent" />
          {t('dashboard.quickVoice')}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-6 max-w-xs leading-normal">
          {t('dashboard.voicePrompt')}
        </p>

        {processingSave ? (
          <div className="h-10 flex items-center justify-center gap-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        ) : isListening ? (
          <div className="h-10 flex items-center justify-center gap-1.5 mb-6">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full voice-wave-bar"></span>
            <span className="w-1.5 h-10 bg-accent rounded-full voice-wave-bar"></span>
            <span className="w-1.5 h-8 bg-blue-600 rounded-full voice-wave-bar"></span>
            <span className="w-1.5 h-5 bg-accent rounded-full voice-wave-bar"></span>
            <span className="w-1.5 h-7 bg-blue-600 rounded-full voice-wave-bar"></span>
          </div>
        ) : (
          <div className="h-10 flex items-center justify-center mb-6">
            <span className="text-xs text-muted-foreground font-medium italic">
              {transcript ? `"${transcript}"` : t('voice.idle')}
            </span>
          </div>
        )}

        <button
          onClick={toggleListening}
          disabled={processingSave}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isListening 
              ? 'bg-destructive text-white scale-105' 
              : 'bg-blue-600 text-white hover:bg-blue-700 scale-100 hover:scale-105'
          } ${processingSave ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {feedback && (
          <div className="mt-6 p-3 bg-secondary/20 rounded-lg text-xs max-w-xs flex gap-2 items-center justify-center text-foreground leading-normal border border-border">
            <Volume2 size={16} className="text-blue-500 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 border text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-accent/15 border-accent/25 text-accent'
                : 'bg-destructive/15 border-destructive/25 text-destructive'
            }`}
          >
            <span>{toast.type === 'success' ? '✓' : '✗'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
