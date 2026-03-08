/* ========================================
   Phantom Tac Toe - Home Page
   ======================================== */

import {
  loadData,
  getXPProgress,
  canClaimDailyReward,
  claimDailyReward,
} from "../data/storage";
import { router } from "../core/Router";
import { audio } from "../utils/audio";
import { vibrateClick } from "../utils/haptics";
import { showToast, showCoinsToast, showXPToast } from "../components/toast";
import {
  iconRobot,
  iconGamepad,
  iconGlobe,
  iconCoin,
  iconGift,
  iconFire,
  iconInfinite,
  iconSparkle,
  iconMuscle,
  iconRocket,
  iconWifi,
  iconBolt,
  iconUser,
  avatarIcons,
} from "../utils/icons";

export function renderHome(container: HTMLElement) {
  const data = loadData();
  const xp = getXPProgress();
  const canClaim = canClaimDailyReward();

  // Use numeric avatar index from profile (or Clerk avatar URL if available)
  const avatarIdx =
    typeof data.profile.avatar === "number" ? data.profile.avatar : 0;
  const avatarSvg = avatarIcons[avatarIdx] || avatarIcons[0];

  container.innerHTML = `
    <div class="page home-page" id="home-page">
      <!-- Player Stats Bar (Compact) -->
      <div class="home-stats-bar card animate-fade-in flex flex-1 gap-4 justify-center items-center">
        <div class="profile-frame frame-${data.profile.activeFrame || "none"}" style="border-radius: 50%">
          <div class="player-avatar" style="width: 32px; height: 32px; background: var(--bg-tertiary); color: var(--neon-purple); border-radius: 50%; overflow: hidden">
            ${avatarIcons[avatarIdx % avatarIcons.length]}
          </div>
        </div>
        <div class="profile-info flex-nowrap flex">
          <div class="profile-name">${data.profile.name || "Guest Player"}</div>
          <div class="profile-rank">Level ${data?.stats?.level || ":)"}</div>
        </div>
        <div class="home-level-row flex-1 -translate-y-3">
            <span class="badge badge-purple" style="font-size: 8px; padding: 1px 4px">Lv.${data.profile.level}</span>
            <div class="progress-bar" style="flex:1; height: 4px">
              <div class="progress-bar-fill" style="width:${xp.percent}%"></div>
            </div>
          </div>
        <div class="home-coins" style="font-size: var(--text-sm)">
          <span class="icon-inline">${iconCoin}</span>
          <span>${data.profile.coins}</span>
        </div>
      </div>

      <!-- Hero Section -->
      <section class="hero-section animate-fade-in" style="text-align: center; padding: var(--space-xl) 0 var(--space-2xl); position: relative">
        <div class="hero-glow"></div>
        <h1 class="hero-title" style="font-size: var(--text-hero); line-height: 1; margin-bottom: var(--space-sm); position: relative">
          <span class="logo-inf">Phantom</span><span class="logo-toe" style="color: white"> Tac Toe</span>
        </h1>
        <p class="hero-subtitle" style="color: var(--text-secondary); font-size: var(--text-lg); max-width: 600px; margin: 0 auto var(--space-xl); opacity: 0.8">
          The infinite 3D Tic-Tac-Toe. No draws. Pure strategy.
        </p>
        <div class="hero-actions" style="display: flex; gap: var(--space-md); justify-content: center; margin-bottom: var(--space-2xl)">
          <button class="btn btn-primary btn-lg btn-glow" id="btn-quick-play" style="min-width: 200px">
            ${iconRocket} Quick Join Match
          </button>
        </div>
      </section>

      <!-- Mode Selection Grid -->
      <div class="mode-grid home-mode-grid">
        <div class="mode-card mode-card-featured grid-full animate-fade-in" data-mode="online" id="btn-online" 
             style="animation-delay: 0.2s; border-color: var(--neon-cyan); box-shadow: var(--shadow-neon-cyan);">
          <div class="mode-badge">POPULAR</div>
          <span class="mode-icon" style="color: var(--neon-cyan)">${iconGlobe}</span>
          <span class="icon-clip" style="color: var(--neon-cyan)">${iconGlobe}</span>
          <h3 class="mode-title">Online Battle</h3>
          <p class="mode-desc">Play with friends</p>
        </div>

        <div class="mode-card max-sm:grid-full animate-fade-in" data-mode="solo" id="btn-solo" style="animation-delay: 0.3s">
          <span class="mode-icon" style="color: var(--neon-pink)">${iconBolt}</span>
          <span class="icon-clip" style="color: var(--neon-pink)">${iconBolt}</span>
          <h3 class="mode-title">Solo Play</h3>
          <p class="mode-desc">Challenge the AI</p>
        </div>

        <div class="mode-card max-sm:grid-full animate-fade-in" data-mode="local" id="btn-local" style="animation-delay: 0.4s">
          <span class="mode-icon" style="color: var(--neon-gold)">${iconUser}</span>
          <span class="icon-clip" style="color: var(--neon-gold)">${iconUser}</span>
          <h3 class="mode-title">Local Duel</h3>
          <p class="mode-desc">Same device, 2 players</p>
        </div>
        
        <button class="mode-card mode-card-lan grid-full animate-fade-in" data-mode="local-network" id="btn-local-network" 
                style="animation-delay: 0.5s; border-color: var(--neon-green)">
          <span class="offline-badge">OFFLINE</span>
          <span class="mode-icon" style="color: var(--neon-green)">${iconWifi}</span>
          <span class="icon-clip" style="color: var(--neon-green)">${iconWifi}</span>
          <h3 class="mode-title">Local Multiplayer</h3>
          <p class="mode-desc">Play on the same WiFi</p>
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="section-header" style="margin-top: var(--space-2xl)">
        <h2 class="section-title">Your Stats</h2>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">${data.stats.wins}</div>
          <div class="stat-label">Wins</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${data.stats.totalGames}</div>
          <div class="stat-label">Games</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${data.stats.bestStreak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${data.stats.totalGames > 0 ? Math.round((data.stats.wins / data.stats.totalGames) * 100) : 0}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="how-it-works card" style="margin-top: var(--space-2xl)">
        <h3 style="font-family: var(--font-display); margin-bottom: var(--space-md)">${iconInfinite} How Phantom Tac Toe Works</h3>
        <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.8">
          Each player can have <strong style="color: var(--neon-gold)">max 3 pieces</strong> on the board at once.
          When you place your 4th piece, your oldest one fades away ${iconSparkle}<br>
          This means <strong style="color: var(--neon-pink)">no more draws</strong> — the game continues until someone wins!
        </p>
      </div>
    </div>
  `;

  // Event listeners
  const soloBtn = document.getElementById("btn-solo");
  const localBtn = document.getElementById("btn-local");
  const onlineBtn = document.getElementById("btn-online");
  const quickPlayBtn = document.getElementById("btn-quick-play");
  const claimBtn = document.getElementById("claim-daily-btn");
  const lanBtn = document.getElementById("btn-local-network");

  quickPlayBtn?.addEventListener("click", () => {
    audio.playClick();
    vibrateClick();
    router.navigate("/play/online/lobby");
  });

  soloBtn?.addEventListener("click", () => {
    audio.playClick();
    vibrateClick();
    router.navigate("/play/solo");
  });

  localBtn?.addEventListener("click", () => {
    audio.playClick();
    vibrateClick();
    router.navigate("/play/local");
  });

  onlineBtn?.addEventListener("click", () => {
    audio.playClick();
    vibrateClick();
    router.navigate("/play/online/lobby");
  });

  lanBtn?.addEventListener("click", () => {
    audio.playClick();
    vibrateClick();
    router.navigate("/play/local-network/lobby");
  });

  claimBtn?.addEventListener("click", () => {
    const reward = claimDailyReward();
    if (reward) {
      audio.playCoins();
      showCoinsToast(reward.coins);
      setTimeout(() => showXPToast(reward.xp), 500);
      showToast(`Day ${reward.streak} streak!`, "fire", 3000);
      claimBtn.remove();
    }
  });
}
