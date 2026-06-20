import bcrypt from 'bcryptjs';
import { signJWT, verifyJWT } from './jwt';

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function signToken(payload: { userId: string; role: string }): Promise<string> {
  return signJWT(payload);
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  return verifyJWT(token);
}
