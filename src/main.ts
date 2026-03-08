/* ========================================
   Phantom Tac Toe - Main Entry Point
   ======================================== */

// Styles
import './styles/main.css';

// Core modules
import { router } from './core/Router';
import { ThemeManager } from './core/ThemeManager';
import { loadData, getSettings, updateProfile } from './data/storage';
import { audio } from './utils/audio';
import { initClerk, getClerkProfile, onAuthChange } from './auth/auth';
import { ConvexClient } from 'convex/browser';
import { syncWithCloud } from './data/storage';
import {
  iconHome,
  iconPlay,
  iconLeaderboard,
  iconRewards,
  iconSettings,
  iconHeart,
} from './utils/icons';

// Pages - Now lazy loaded
// renderHome, renderGame, etc. are imported dynamically in initApp

// Initialize Convex as Global Source of Truth
const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;
export const convex = CONVEX_URL ? new ConvexClient(CONVEX_URL) : null;
if (convex) (window as any).convexClient = convex;

// ---- Initialize App ---- //
async function initApp(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Create app shell
  const pageContainer = document.createElement('div');
  pageContainer.id = 'page-container';
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

  // Initialize ThemeManager with saved theme
  const data = loadData();
  if (data.cosmetics.activeTheme) {
    ThemeManager.apply(data.cosmetics.activeTheme);
  }

  // Setup router
  router.setContainer(pageContainer);

  router.addRoute('/', async (c) => {
    const { renderHome } = await import('./pages/HomePage');
    renderHome(c);
    updateNav('/');
  });
  router.addRoute('/play/solo', async (c) => {
    updateNav('/play');
    const { renderGame } = await import('./pages/GamePage');
    return renderGame(c, { mode: 'solo' });
  });
  router.addRoute('/play/local', async (c) => {
    updateNav('/play');
    const { renderGame } = await import('./pages/GamePage');
    return renderGame(c, { mode: 'local' });
  });
  router.addRoute('/play/online', async (c) => {
    updateNav('/play');
    const { renderGame } = await import('./pages/GamePage');
    return renderGame(c, { mode: 'online' });
  });
  router.addRoute('/play/online/lobby', async (c) => {
    updateNav('/play');
    const { renderOnlineLobby } = await import('./pages/OnlineLobbyPage');
    renderOnlineLobby(c);
  });
  router.addRoute('/play/local-network', async (c) => {
    updateNav('/play');
    const { renderGame } = await import('./pages/GamePage');
    return renderGame(c, { mode: 'local-network' });
  });
  router.addRoute('/play/local-network/lobby', async (c) => {
    updateNav('/play');
    const { renderLocalNetworkLobby } = await import('./pages/LocalNetworkLobbyPage');
    return renderLocalNetworkLobby(c);
  });
  router.addRoute('/join/:code', async (c, params) => {
    updateNav('/play');
    const { renderJoinRoom } = await import('./pages/OnlineLobbyPage');
    renderJoinRoom(c, params);
  });
  router.addRoute('/rewards', async (c) => {
    updateNav('/rewards');
    const { renderRewards } = await import('./pages/RewardsPage');
    renderRewards(c);
  });
  router.addRoute('/leaderboard', async (c) => {
    updateNav('/leaderboard');
    const { renderLeaderboard } = await import('./pages/LeaderboardPage');
    renderLeaderboard(c);
  });
  router.addRoute('/settings', async (c) => {
    updateNav('/settings');
    const { renderSettings } = await import('./pages/SettingsPage');
    renderSettings(c);
  });
  router.addRoute('/friends', async (c) => {
    updateNav('/friends');
    const { renderFriends } = await import('./pages/FriendsPage');
    return renderFriends(c);
  });

  // Initialize audio on first interaction
  document.addEventListener('pointerdown', () => audio.init(), { once: true });

  // Apply saved settings
  const settings = getSettings();
  audio.setEnabled(settings.soundEnabled);
  audio.setMusicEnabled(settings.musicEnabled);

  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('hidden');
    // Start router
    router.start();
  }, 300);
}

function createNavigation(app: HTMLElement): void {
  // Desktop nav
  const desktopNav = document.createElement('nav');
  desktopNav.className = 'desktop-nav';
  desktopNav.style.display = 'none';
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
      <a class="nav-item" href="#/friends" data-route="/friends">
        <span class="nav-icon">${iconHeart}</span>
        <span class="nav-label">Friends</span>
      </a>
    </div>
  `;
  app.appendChild(desktopNav);

  // Bottom nav (mobile)
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'bottom-nav';
  bottomNav.setAttribute('aria-label', 'Main navigation');
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
      <a class="nav-item" href="#/friends" data-route="/friends">
        <span class="nav-icon">${iconHeart}</span>
        <span class="nav-label">Friends</span>
      </a>
      <a class="nav-item" href="#/settings" data-route="/settings">
        <span class="nav-icon">${iconSettings}</span>
        <span class="nav-label">Settings</span>
      </a>
    </div>
  `;
  app.appendChild(bottomNav);
}

function updateNav(route: string): void {
  document.querySelectorAll('.nav-item').forEach((item) => {
    const htmlItem = item as HTMLElement;
    const itemRoute = htmlItem.dataset.route;
    htmlItem.classList.toggle('active', itemRoute === route);
  });
}

function createBackgroundParticles(app: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'bg-particles';
  container.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
    particle.style.setProperty('--delay', `${Math.random() * 5}s`);
    particle.style.width = `${2 + Math.random() * 3}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }

  app.insertBefore(container, app.firstChild);
}

// ---- Start ---- //

// ---- Start ---- //
let isInitialized = false;

async function startApp() {
  if (isInitialized) return;
  isInitialized = true;
  await initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
