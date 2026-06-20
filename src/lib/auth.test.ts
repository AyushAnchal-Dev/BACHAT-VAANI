import { describe, it, expect } from 'vitest';
import { hashPin, comparePin, signToken, verifyToken } from './auth';

describe('Authentication Utilities', () => {
  it('should hash a 4-digit PIN and verify it successfully', async () => {
    const pin = '1234';
    const hashed = await hashPin(pin);
    
    expect(hashed).not.toBe(pin);
    expect(hashed.length).toBeGreaterThan(10);
    
    const isValid = await comparePin(pin, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await comparePin('4321', hashed);
    expect(isInvalid).toBe(false);
  });

  it('should sign a JWT token and verify it correctly', async () => {
    const payload = { userId: 'test-user-id', role: 'USER' };
    const token = await signToken(payload);
    
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.role).toBe(payload.role);
  });

  it('should return null for invalid or tampered tokens', async () => {
    const invalidToken = 'abc.def.ghi';
    const verified = await verifyToken(invalidToken);
    expect(verified).toBeNull();
  });
});
