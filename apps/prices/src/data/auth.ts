/**
 * FAKE authentication — no network, no real accounts.
 * Replace with a real provider (e.g. Better Auth / Supabase) later.
 */

export type Session = {
  name: string;
  email: string;
  provider: 'password' | 'google';
  signedInAt: number;
};

/** The only credentials accepted by the fake password login. */
export const DEMO_CREDENTIALS = {
  email: 'jose@gmail.com',
  password: 'password',
} as const;

export class AuthError extends Error {}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const nameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? '';
  return local.charAt(0).toUpperCase() + local.slice(1);
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  await wait(700); // pretend to hit a server
  const normalized = email.trim().toLowerCase();
  if (normalized !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    throw new AuthError('Correo o contraseña incorrectos.');
  }
  return { name: nameFromEmail(normalized), email: normalized, provider: 'password', signedInAt: Date.now() };
}

export async function signInWithGoogle(): Promise<Session> {
  await wait(900); // pretend OAuth round-trip
  return {
    name: nameFromEmail(DEMO_CREDENTIALS.email),
    email: DEMO_CREDENTIALS.email,
    provider: 'google',
    signedInAt: Date.now(),
  };
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
