/* ========================================
   Phantom Tac Toe - Home Page
   ======================================== */

import {
  loadData,
  getXPProgress,
  canClaimDailyReward,
  claimDailyReward,
} from "../data/storage.js";
import { router } from "../router.js";
import { audio } from "../utils/audio.js";
import { vibrateClick } from "../utils/haptics.js";
import { showToast, showCoinsToast, showXPToast } from "../components/toast.js";
import {
  iconRobot,
  iconGamepad,
  iconGlobe,
  iconCoin,
  iconGift,
  iconFire,
  iconPhantomty,
  iconSparkle,
  iconMuscle,
  avatarIcons,
} from "../utils/icons.js";

export function renderHome(container) {
  const data = loadData();
  const xp = getXPProgress();
  const canClaim = canClaimDailyReward();

  // Use numeric avatar index from profile (or Clerk avatar URL if available)
  const avatarIdx =
    typeof data.profile.avatar === "number" ? data.profile.avatar : 0;
  const avatarSvg = avatarIcons[avatarIdx] || avatarIcons[0];

  container.innerHTML = `
    <div class="page home-page" id="home-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">
          <span class="logo-inf">Phantom</span><span class="logo-toe">Toe</span>
        </h1>
        <p class="hero-subtitle">Infinite 3D Tic-Tac-Toe ${iconPhantomty}</p>
        <p class="hero-tagline">No draws. No limits. Just vibes.</p>
      </div>

      <!-- Player Stats Bar -->
      <div class="home-stats-bar card">
        <div class="home-avatar">${avatarSvg}</div>
        <div class="home-player-info">
          <div class="home-player-name">${data.profile.name}</div>
          <div class="home-level-row">
            <span class="badge badge-purple">Lv.${data.profile.level}</span>
            <div class="progress-bar" style="flex:1">
              <div class="progress-bar-fill" style="width:${xp.percent}%"></div>
            </div>
            <span class="home-xp-text">${xp.current}/${xp.max} XP</span>
          </div>
        </div>
        <div class="home-coins">
          <span class="icon-inline">${iconCoin}</span>
          <span>${data.profile.coins}</span>
        </div>
      </div>

      <!-- Streak Banner -->
      ${
        data.stats.currentStreak > 0
          ? `
      <div class="streak-banner animate-slide-up">
        <span class="streak-fire">${iconFire}</span>
        <div class="streak-info">
          <div class="streak-count">${data.stats.currentStreak} Win Streak!</div>
          <div class="streak-label">Keep it going ${iconMuscle}</div>
        </div>
      </div>
      `
          : ""
      }

      <!-- Daily Reward -->
      ${
        canClaim
          ? `
      <button class="daily-claim-btn btn btn-lg btn-block" id="claim-daily-btn" style="background: var(--gradient-gold); color: #000; margin-bottom: var(--space-lg)">
        ${iconGift} Claim Daily Reward
      </button>
      `
          : ""
      }

      <!-- Game Mode Cards -->
      <div class="section-header">
        <h2 class="section-title">Play</h2>
      </div>
      <div class="mode-cards">
        <button class="mode-card" data-mode="solo" id="btn-solo">
          <span class="mode-icon">${iconRobot}</span>
          <div class="mode-title">Solo Play</div>
          <div class="mode-desc">Challenge the AI</div>
        </button>
        <button class="mode-card" data-mode="local" id="btn-local">
          <span class="mode-icon">${iconGamepad}</span>
          <div class="mode-title">Local Duel</div>
          <div class="mode-desc">Same device, 2 players</div>
        </button>
        <button class="mode-card" data-mode="online" id="btn-online">
          <span class="mode-icon">${iconGlobe}</span>
          <div class="mode-title">Online Battle</div>
          <div class="mode-desc">Play with friends</div>
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
        <h3 style="font-family: var(--font-display); margin-bottom: var(--space-md)">${iconPhantomty} How Infinite Mode Works</h3>
        <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.8">
          Each player can have <strong style="color: var(--neon-gold)">max 3 pieces</strong> on the board at once.
          When you place your 4th piece, your oldest one fades away ${iconSparkle}<br>
          This means <strong style="color: var(--neon-pink)">no more draws</strong> — the game continues until someone wins!
        </p>
      </div>
    </div>
  `;

  // Add styles specific to home
  addHomeStyles();

  // Event listeners
  const soloBtn = document.getElementById("btn-solo");
  const localBtn = document.getElementById("btn-local");
  const onlineBtn = document.getElementById("btn-online");
  const claimBtn = document.getElementById("claim-daily-btn");

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

function addHomeStyles() {
  if (document.getElementById("home-styles")) return;
  const style = document.createElement("style");
  style.id = "home-styles";
  style.textContent = `
    .hero-section {
      text-align: center;
      padding: var(--space-2xl) 0 var(--space-xl);
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: var(--text-hero);
      font-weight: 900;
      line-height: 1;
      margin-bottom: var(--space-sm);
    }
    .hero-subtitle {
      font-size: var(--text-xl);
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }
    .hero-tagline {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      font-style: italic;
    }
    .home-stats-bar {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      margin-bottom: var(--space-lg);
    }
    .home-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      color: var(--neon-purple);
    }
    .home-player-info {
      flex: 1;
      min-width: 0;
    }
    .home-player-name {
      font-family: var(--font-display);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .home-level-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .home-xp-text {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
      white-space: nowrap;
    }
    .home-coins {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--neon-gold);
      font-size: var(--text-lg);
    }
    .mode-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .how-it-works {
      border-color: rgba(255, 214, 10, 0.15);
    }
    .how-it-works h3 {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
  `;
  document.head.appendChild(style);
}
