import { describe, it, expect } from 'vitest';

// Emulated parsing logic identical to VoiceAssistant.tsx
function parseVoiceCommand(text: string): { intent: 'SAVE' | 'BALANCE' | 'TIP' | 'UNKNOWN'; amount: number | null } {
  const lowerText = text.toLowerCase();
  
  // Regex parsing for Save
  const enSaveMatch = lowerText.match(/(?:save|saving|savings|deposit|add|invest)\s+(\d+)/);
  const hiSaveMatch = lowerText.match(/(\d+)\s*(?:rupaye|rupee|rupya|rs|रुपये|रुपया)?\s*(?:save|saving|savings|jama|bachat|daalo|जमा|बचत|डालो)/);
  const saveAmount = enSaveMatch ? Number(enSaveMatch[1]) : (hiSaveMatch ? Number(hiSaveMatch[1]) : null);

  if (saveAmount && !isNaN(saveAmount)) {
    return { intent: 'SAVE', amount: saveAmount };
  }

  // Regex parsing for Balance inquiry
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
    return { intent: 'BALANCE', amount: null };
  }

  // Regex parsing for Tip reading
  const isTipCmd = 
    lowerText.includes('tip') || 
    lowerText.includes('literacy') || 
    lowerText.includes('टिप') || 
    lowerText.includes('सुझाव');

  if (isTipCmd) {
    return { intent: 'TIP', amount: null };
  }

  return { intent: 'UNKNOWN', amount: null };
}

describe('Voice Command Parser', () => {
  describe('Savings Commands (English & Hindi)', () => {
    it('should parse standard English save commands', () => {
      expect(parseVoiceCommand('Save 50 rupees')).toEqual({ intent: 'SAVE', amount: 50 });
      expect(parseVoiceCommand('saving 100')).toEqual({ intent: 'SAVE', amount: 100 });
      expect(parseVoiceCommand('savings 250')).toEqual({ intent: 'SAVE', amount: 250 });
      expect(parseVoiceCommand('deposit 500 rupees')).toEqual({ intent: 'SAVE', amount: 500 });
    });

    it('should parse Hindi/mixed save commands', () => {
      expect(parseVoiceCommand('50 rupaye save karo')).toEqual({ intent: 'SAVE', amount: 50 });
      expect(parseVoiceCommand('100 bachat karo')).toEqual({ intent: 'SAVE', amount: 100 });
      expect(parseVoiceCommand('500 jama')).toEqual({ intent: 'SAVE', amount: 500 });
      expect(parseVoiceCommand('200 daalo')).toEqual({ intent: 'SAVE', amount: 200 });
    });
  });

  describe('Balance Inquiry Commands', () => {
    it('should parse English balance inquiries', () => {
      expect(parseVoiceCommand('check balance')).toEqual({ intent: 'BALANCE', amount: null });
      expect(parseVoiceCommand('what is my balance')).toEqual({ intent: 'BALANCE', amount: null });
      expect(parseVoiceCommand('show my total savings')).toEqual({ intent: 'BALANCE', amount: null });
    });

    it('should parse Hindi balance inquiries', () => {
      expect(parseVoiceCommand('mera balance batao')).toEqual({ intent: 'BALANCE', amount: null });
      expect(parseVoiceCommand('mera paisa kitna hai')).toEqual({ intent: 'BALANCE', amount: null });
      expect(parseVoiceCommand('paisa check karo')).toEqual({ intent: 'BALANCE', amount: null });
    });
  });

  describe('Tip reading commands', () => {
    it('should parse tips requests', () => {
      expect(parseVoiceCommand('show daily tip')).toEqual({ intent: 'TIP', amount: null });
      expect(parseVoiceCommand('aaj ki tip sunao')).toEqual({ intent: 'TIP', amount: null });
    });
  });

  describe('Separation of Concerns', () => {
    it('should NOT trigger balance intent when saying a save command', () => {
      // E.g. "Save 50 rupees" contains "save" but shouldn't trigger balance even if "saving" was a keyword.
      expect(parseVoiceCommand('Save 50 rupees').intent).toBe('SAVE');
      expect(parseVoiceCommand('saving 100').intent).toBe('SAVE');
      expect(parseVoiceCommand('savings 250').intent).toBe('SAVE');
    });
  });

  describe('Confirmation Flows', () => {
    const checkConfirmation = (text: string, parsedSaveAmount: number) => {
      const lowerText = text.toLowerCase();
      
      const isSelfPrompt = 
        lowerText.includes('do you want') || 
        lowerText.includes('want to save') || 
        lowerText.includes('please confirm') || 
        lowerText.includes('चाहते हैं') || 
        lowerText.includes('बचाना चाहते') || 
        lowerText.includes('पुष्टि करें') ||
        lowerText.includes('pusti kare');
        
      if (isSelfPrompt) {
        return { action: 'IGNORE', newAmount: null };
      }

      const isConfirm = 
        lowerText.includes('yes') || 
        lowerText.includes('confirm') || 
        lowerText.includes('ok') || 
        lowerText.includes('sure') || 
        lowerText.includes('haan') || 
        lowerText.includes('han') || 
        lowerText.includes('karo') || 
        lowerText.includes('theek') || 
        lowerText.includes('हाँ') || 
        lowerText.includes('हा');

      const isCancel = 
        lowerText.includes('no') || 
        lowerText.includes('cancel') || 
        lowerText.includes('na') || 
        lowerText.includes('nahi') || 
        lowerText.includes('ना') || 
        lowerText.includes('नहीं');

      const enSaveMatch = lowerText.match(/(?:save|saving|savings|deposit|add|invest)\s+(\d+)/);
      const hiSaveMatch = lowerText.match(/(\d+)\s*(?:rupaye|rufee|rufee|rupee|rupya|rs|रुपये|रुपया)?\s*(?:save|saving|savings|jama|bachat|daalo|जमा|बचत|डालो)/);
      const repeatAmount = enSaveMatch ? Number(enSaveMatch[1]) : (hiSaveMatch ? Number(hiSaveMatch[1]) : null);

      if (repeatAmount) {
        if (repeatAmount === parsedSaveAmount) {
          return { action: 'CONFIRM', newAmount: null };
        } else {
          return { action: 'UPDATE', newAmount: repeatAmount };
        }
      }

      const numberMatch = lowerText.match(/^\s*(\d+)\s*$/);
      const spokenNumber = numberMatch ? Number(numberMatch[1]) : null;

      if (isConfirm || (spokenNumber && spokenNumber === parsedSaveAmount)) {
        return { action: 'CONFIRM', newAmount: null };
      } else if (isCancel) {
        return { action: 'CANCEL', newAmount: null };
      }

      return { action: 'UNKNOWN', newAmount: null };
    };

    it('should evaluate confirmation flows correctly', () => {
      // 1. Standard Confirmations
      expect(checkConfirmation('yes', 50).action).toBe('CONFIRM');
      expect(checkConfirmation('Haan, jama karo', 50).action).toBe('CONFIRM');
      expect(checkConfirmation('ok', 50).action).toBe('CONFIRM');
      expect(checkConfirmation('हाँ, कर दो', 50).action).toBe('CONFIRM');

      // 2. Same-Amount Repetition
      expect(checkConfirmation('Save 50 rupees', 50).action).toBe('CONFIRM');
      expect(checkConfirmation('50 rupaye save karo', 50).action).toBe('CONFIRM');
      
      // 3. Spoken Number confirmation
      expect(checkConfirmation('50', 50).action).toBe('CONFIRM');

      // 4. Cancellations
      expect(checkConfirmation('no', 50).action).toBe('CANCEL');
      expect(checkConfirmation('cancel', 50).action).toBe('CANCEL');
      expect(checkConfirmation('nahi', 50).action).toBe('CANCEL');

      // 5. Echo Ignorance (Self prompt)
      expect(checkConfirmation('Do you want to save 50 rupees? Please confirm.', 50).action).toBe('IGNORE');
      expect(checkConfirmation('क्या आप 50 रुपये बचाना चाहते हैं? कृपया पुष्टि करें।', 50).action).toBe('IGNORE');

      // 6. Updated Amount
      expect(checkConfirmation('Save 100 rupees', 50)).toEqual({ action: 'UPDATE', newAmount: 100 });
      expect(checkConfirmation('100 rupaye bachat karo', 50)).toEqual({ action: 'UPDATE', newAmount: 100 });
    });
  });
});
