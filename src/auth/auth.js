/* ========================================
   Phantom Tac Toe - Auth (Clerk)
   ======================================== */
import { Clerk } from "@clerk/clerk-js";
let clerkInstance = null;
let authListeners = [];
const CLERK_KEY = import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || "";

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

export function getClerkUser() {
  return clerkInstance?.user || null;
}
export function isAuthAvailable() {
  return !!clerkInstance;
}
export function isSignedIn() {
  return !!clerkInstance?.user;
}

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
    role: user.publicMetadata?.role || "player",
  };
}

const CLERK_APPEARANCE = {
  layout: {
    logoPlacement: "inside",
    socialButtonsPlacement: "bottom",
    showOptionalFields: false,
  },
  elements: {
    formButtonPrimary: "cl-button-primary",
    card: "cl-card",
  },
  variables: {
    colorPrimary: "#bc13fe", // --neon-purple
    colorBackground: "#0a0a12", // --bg-primary
    colorText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#1a1a2e",
    colorInputText: "#ffffff",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
};

export async function signIn() {
  if (clerkInstance) {
    try {
      await clerkInstance.openSignIn({
        appearance: CLERK_APPEARANCE,
      });
    } catch (err) {}
  }
}
export async function signUp() {
  if (clerkInstance) {
    try {
      await clerkInstance.openSignUp({
        appearance: CLERK_APPEARANCE,
      });
    } catch (err) {}
  }
}
export async function signOut() {
  if (clerkInstance) {
    try {
      await clerkInstance.signOut();
      notifyListeners();
    } catch (err) {}
  }
}
export function openUserProfile() {
  if (clerkInstance) {
    clerkInstance.openUserProfile({
      appearance: CLERK_APPEARANCE,
    });
  }
}

export function onAuthChange(callback) {
  authListeners.push(callback);
  if (clerkInstance) clerkInstance.addListener(() => notifyListeners());
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}
function notifyListeners() {
  const profile = getClerkProfile();
  authListeners.forEach((cb) => cb(profile));
}
