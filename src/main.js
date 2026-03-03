/* ========================================
   Phantom Tac Toe - Main Entry Point
   ======================================== */

// Styles
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/animations.css";
import "./styles/responsive.css";
import "./styles/effects.css";

// Core modules
import { router } from "./router.js";
import { loadData, getSettings, updateProfile } from "./data/storage.js";
import { audio } from "./utils/audio.js";
import { initClerk, getClerkProfile, onAuthChange } from "./auth/auth.js";
import { ConvexClient } from "convex/browser";
import { syncWithCloud } from "./data/storage.js";

// Initialize Convex as Global Source of Truth
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
export const convex = CONVEX_URL ? new ConvexClient(CONVEX_URL) : null;
if (convex) window.convexClient = convex; // Make available for storage.js shadow sync
import {
  iconHome,
  iconPlay,
  iconLeaderboard,
  iconRewards,
  iconSettings,
} from "./utils/icons.js";

// Pages
import { renderHome } from "./pages/home.js";
import { renderGame } from "./pages/game.js";
import { renderOnlineLobby, renderJoinRoom } from "./pages/online.js";
import { renderRewards } from "./pages/rewards.js";
import { renderLeaderboard } from "./pages/leaderboard.js";
import { renderSettings } from "./pages/settings.js";

// ---- Initialize App ---- //
async function initApp() {
  const app = document.getElementById("app");

  // Create app shell
  const pageContainer = document.createElement("div");
  pageContainer.id = "page-container";
  app.appendChild(pageContainer);

  // Create background particles
  createBackgroundParticles(app);

  // Create navigation
  createNavigation(app);

  // Initialize Clerk auth (non-blocking — works without key)
  await initClerk();

  // Sync Clerk profile to local storage when auth changes
  onAuthChange((clerkProfile) => {
    if (clerkProfile) {
      updateProfile({
        name: clerkProfile.name,
        avatarUrl: clerkProfile.avatarUrl,
        clerkUserId: clerkProfile.id,
      });

      // Unified Cloud Sync (Convex as Source of Truth)
      if (convex) {
        syncWithCloud(convex);
      }
    }
  });

  // Setup router
  router.setContainer(pageContainer);

  router.addRoute("/", (c) => {
    renderHome(c);
    updateNav("/");
  });
  router.addRoute("/play/solo", (c) => {
    updateNav("/play");
    return renderGame(c, { mode: "solo" });
  });
  router.addRoute("/play/local", (c) => {
    updateNav("/play");
    return renderGame(c, { mode: "local" });
  });
  router.addRoute("/play/online", (c) => {
    updateNav("/play");
    return renderGame(c, { mode: "online" });
  });
  router.addRoute("/play/online/lobby", (c) => {
    updateNav("/play");
    renderOnlineLobby(c);
  });
  router.addRoute("/join/:code", (c, params) => {
    updateNav("/play");
    renderJoinRoom(c, params);
  });
  router.addRoute("/rewards", (c) => {
    updateNav("/rewards");
    renderRewards(c);
  });
  router.addRoute("/leaderboard", (c) => {
    updateNav("/leaderboard");
    renderLeaderboard(c);
  });
  router.addRoute("/settings", (c) => {
    updateNav("/settings");
    renderSettings(c);
  });

  // Initialize audio on first interaction
  document.addEventListener("pointerdown", () => audio.init(), { once: true });

  // Apply saved settings
  const settings = getSettings();
  audio.setEnabled(settings.soundEnabled);
  audio.setMusicEnabled(settings.musicEnabled);

  // Hide loading screen
  const loadingScreen = document.getElementById("loading-screen");
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add("hidden");
    // Start router
    router.start();
  }, 1200);
}

function createNavigation(app) {
  // Desktop nav
  const desktopNav = document.createElement("nav");
  desktopNav.className = "desktop-nav";
  desktopNav.style.display = "none";
  desktopNav.innerHTML = `
    <div class="nav-items">
      <a class="nav-brand" href="#/">
        <span class="logo-inf">Phantom</span><span> Tac Toe</span>
      </a>
      <a class="nav-item" href="#/" data-route="/">
        <span class="nav-icon">${iconHome}</span>
        <span class="nav-label">Home</span>
      </a>
      <a class="nav-item" href="#/play/solo" data-route="/play">
        <span class="nav-icon">${iconPlay}</span>
        <span class="nav-label">Play</span>
      </a>
      <a class="nav-item" href="#/leaderboard" data-route="/leaderboard">
        <span class="nav-icon">${iconLeaderboard}</span>
        <span class="nav-label">Leaderboard</span>
      </a>
      <a class="nav-item" href="#/rewards" data-route="/rewards">
        <span class="nav-icon">${iconRewards}</span>
        <span class="nav-label">Rewards</span>
      </a>
      <a class="nav-item" href="#/settings" data-route="/settings">
        <span class="nav-icon">${iconSettings}</span>
        <span class="nav-label">Settings</span>
      </a>
    </div>
  `;
  app.appendChild(desktopNav);

  // Bottom nav (mobile)
  const bottomNav = document.createElement("nav");
  bottomNav.className = "bottom-nav";
  bottomNav.setAttribute("aria-label", "Main navigation");
  bottomNav.innerHTML = `
    <div class="nav-items">
      <a class="nav-item active" href="#/" data-route="/">
        <span class="nav-icon">${iconHome}</span>
        <span class="nav-label">Home</span>
      </a>
      <a class="nav-item" href="#/play/solo" data-route="/play">
        <span class="nav-icon">${iconPlay}</span>
        <span class="nav-label">Play</span>
      </a>
      <a class="nav-item" href="#/leaderboard" data-route="/leaderboard">
        <span class="nav-icon">${iconLeaderboard}</span>
        <span class="nav-label">Ranks</span>
      </a>
      <a class="nav-item" href="#/rewards" data-route="/rewards">
        <span class="nav-icon">${iconRewards}</span>
        <span class="nav-label">Rewards</span>
      </a>
      <a class="nav-item" href="#/settings" data-route="/settings">
        <span class="nav-icon">${iconSettings}</span>
        <span class="nav-label">Settings</span>
      </a>
    </div>
  `;
  app.appendChild(bottomNav);
}

function updateNav(route) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    const itemRoute = item.dataset.route;
    item.classList.toggle("active", itemRoute === route);
  });
}

function createBackgroundParticles(app) {
  const container = document.createElement("div");
  container.className = "bg-particles";
  container.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "bg-particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty("--duration", `${6 + Math.random() * 8}s`);
    particle.style.setProperty("--delay", `${Math.random() * 5}s`);
    particle.style.width = `${2 + Math.random() * 3}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }

  app.insertBefore(container, app.firstChild);
}

// ---- Service Worker Registration ---- //
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed, app still works
    });
  });
}

// ---- Start ---- //
document.addEventListener("DOMContentLoaded", initApp);

// If DOM already loaded
if (document.readyState !== "loading") {
  initApp();
}
