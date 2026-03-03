/* ========================================
   InfiniToe - Auth (Clerk)
   Manages user authentication via Clerk
   ======================================== */

import { Clerk } from "@clerk/clerk-js";

let clerkInstance = null;
let authListeners = [];

const CLERK_KEY = import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || "";

/**
 * Initialize Clerk. Call once on app startup.
 * If no key is configured, auth features are disabled silently.
 */
export async function initClerk() {
  if (!CLERK_KEY) {
    console.warn("Clerk: No publishable key found. Auth disabled.");
    return null;
  }

  try {
    clerkInstance = new Clerk(CLERK_KEY);
    await clerkInstance.load();
    notifyListeners();
    return clerkInstance;
  } catch (err) {
    console.error("Clerk init failed:", err);
    return null;
  }
}

/** Get the current Clerk user object, or null if not signed in */
export function getClerkUser() {
  return clerkInstance?.user || null;
}

/** Check if auth is available (key configured + loaded) */
export function isAuthAvailable() {
  return !!clerkInstance;
}

/** Check if user is signed in */
export function isSignedIn() {
  return !!clerkInstance?.user;
}

/**
 * Extract a clean profile from the Clerk user object.
 * Returns name, avatar URL, email, and userId.
 */
export function getClerkProfile() {
  const user = getClerkUser();
  if (!user) return null;

  return {
    id: user.id,
    name:
      user.username ||
      user.firstName ||
      user.fullName ||
      user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "Player",
    avatarUrl: user.imageUrl || null,
    email: user.primaryEmailAddress?.emailAddress || null,
  };
}

/** Open Clerk sign-in modal (Google, email, etc.) */
export async function signIn() {
  if (!clerkInstance) return;
  try {
    await clerkInstance.openSignIn({});
  } catch (err) {
    console.error("Sign in error:", err);
  }
}

/** Open Clerk sign-up modal */
export async function signUp() {
  if (!clerkInstance) return;
  try {
    await clerkInstance.openSignUp({});
  } catch (err) {
    console.error("Sign up error:", err);
  }
}

/** Sign out the current user */
export async function signOut() {
  if (!clerkInstance) return;
  try {
    await clerkInstance.signOut();
    notifyListeners();
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

/** Open the Clerk user profile modal */
export function openUserProfile() {
  if (!clerkInstance) return;
  clerkInstance.openUserProfile({});
}

/** Update the user's username in Clerk */
export async function updateUsername(newUsername) {
  const user = getClerkUser();
  if (!user) return false;
  try {
    await user.update({ username: newUsername });
    notifyListeners();
    return true;
  } catch (err) {
    console.error("Username update failed:", err);
    return false;
  }
}

/** Subscribe to auth state changes */
export function onAuthChange(callback) {
  authListeners.push(callback);

  // If Clerk is already loaded, call immediately
  if (clerkInstance) {
    clerkInstance.addListener(() => {
      notifyListeners();
    });
  }

  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners() {
  const profile = getClerkProfile();
  authListeners.forEach((cb) => cb(profile));
}
