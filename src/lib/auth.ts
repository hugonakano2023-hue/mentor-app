/**
 * Simple Auth Layer (localStorage-based)
 *
 * NOT for production — uses btoa encoding instead of real hashing.
 * Will be replaced with proper bcrypt + DB when migrating to real backend.
 */

import { v4 as uuidv4 } from 'uuid';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
};

const USERS_KEY = 'mentor_auth_users';
const SESSION_KEY = 'mentor_auth_session';

// ─── Hash helpers (demo only — NOT cryptographically secure) ────────────────

export function simpleHash(str: string): string {
  if (typeof btoa === 'undefined') return str;
  return btoa(encodeURIComponent(str));
}

export function verifyHash(str: string, hash: string): boolean {
  return simpleHash(str) === hash;
}

// ─── Internal storage ───────────────────────────────────────────────────────

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── Session management ─────────────────────────────────────────────────────

export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ─── Auth operations ────────────────────────────────────────────────────────

export function login(email: string, password: string): AuthUser | null {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) return null;
  if (!verifyHash(password, user.passwordHash)) return null;

  const session: AuthUser = { id: user.id, name: user.name, email: user.email };
  setSession(session);
  return session;
}

export function signup(
  name: string,
  email: string,
  password: string
): { user: AuthUser } | { error: string } {
  const users = getStoredUsers();

  // Check duplicate email
  const exists = users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    return { error: 'Este e-mail já está cadastrado.' };
  }

  const newUser: StoredUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStoredUsers(users);

  const session: AuthUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
  setSession(session);

  return { user: session };
}

export function logout(): void {
  clearSession();
}
