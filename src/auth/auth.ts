/* ========================================
   Phantom Tac Toe - Auth (Clerk)
   ======================================== */

import { Clerk } from '@clerk/clerk-js';

export interface ClerkProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  role: string;
}

let clerkInstance: any = null;
let authListeners: Array<(profile: ClerkProfile | null) => void> = [];
const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

export async function initClerk(): Promise<any> {
  if (!CLERK_KEY) {
    console.warn('Clerk: No publishable key found. Auth disabled.');
    return null;
  }
  try {
    clerkInstance = new Clerk(CLERK_KEY);
    await clerkInstance.load();
    notifyListeners();
    return clerkInstance;
  } catch (err) {
    console.error('Clerk init failed:', err);
    return null;
  }
}

export function getClerkUser(): any {
  return clerkInstance?.user || null;
}

export function isAuthAvailable(): boolean {
  return !!clerkInstance;
}

export function isSignedIn(): boolean {
  return !!clerkInstance?.user;
}

export function getClerkProfile(): ClerkProfile | null {
  const user = getClerkUser();
  if (!user) return null;
  return {
    id: user.id,
    name:
      user.username ||
      user.firstName ||
      user.fullName ||
      user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      'Player',
    avatarUrl: user.imageUrl || null,
    email: user.primaryEmailAddress?.emailAddress || null,
    role: user.publicMetadata?.role || 'player',
  };
}

const CLERK_APPEARANCE = {
  layout: {
    logoPlacement: 'inside' as const,
    socialButtonsPlacement: 'bottom' as const,
    showOptionalFields: false,
  },
  elements: {
    formButtonPrimary: 'cl-button-primary',
    card: 'cl-card',
  },
  variables: {
    colorPrimary: '#bc13fe',
    colorBackground: '#0a0a12',
    colorText: '#ffffff',
    colorTextSecondary: '#94a3b8',
    colorInputBackground: '#1a1a2e',
    colorInputText: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
  },
};

export async function signIn(): Promise<void> {
  if (clerkInstance) {
    try {
      await clerkInstance.openSignIn({
        appearance: CLERK_APPEARANCE,
      });
    } catch (_err) { /* silently fail */ }
  }
}

export async function signUp(): Promise<void> {
  if (clerkInstance) {
    try {
      await clerkInstance.openSignUp({
        appearance: CLERK_APPEARANCE,
      });
    } catch (_err) { /* silently fail */ }
  }
}

export async function signOut(): Promise<void> {
  if (clerkInstance) {
    try {
      await clerkInstance.signOut();
      notifyListeners();
    } catch (_err) { /* silently fail */ }
  }
}

export function openUserProfile(): void {
  if (clerkInstance) {
    clerkInstance.openUserProfile({
      appearance: CLERK_APPEARANCE,
    });
  }
}

export function onAuthChange(callback: (profile: ClerkProfile | null) => void): () => void {
  authListeners.push(callback);
  if (clerkInstance) clerkInstance.addListener(() => notifyListeners());
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners(): void {
  const profile = getClerkProfile();
  authListeners.forEach((cb) => cb(profile));
}
