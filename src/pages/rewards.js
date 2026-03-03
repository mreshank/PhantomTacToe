/* ========================================
   InfiniToe - Rewards Page
   ======================================== */

import {
  loadData,
  getXPProgress,
  canClaimDailyReward,
  claimDailyReward,
} from "../data/storage.js";
import { getAchievementStatus } from "../rewards/achievements.js";
import { audio } from "../utils/audio.js";
import { showToast, showCoinsToast, showXPToast } from "../components/toast.js";
import {
  iconRewards,
  iconCoin,
  iconGift,
  iconFire,
  iconCheckCircle,
  iconSparkle,
  iconShoppingBag,
  iconCheck,
  iconDiamond,
  iconStar,
  iconTarget,
  iconHeart,
  iconBolt,
  avatarIcons,
} from "../utils/icons.js";

export function renderRewards(container) {
  const data = loadData();
  const xp = getXPProgress();
  const achievements = getAchievementStatus();
  const canClaim = canClaimDailyReward();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Map old emoji avatars to SVG
  const avatarIdx = [
    "😎",
    "🤠",
    "🥷",
    "👽",
    "🤖",
    "🎃",
    "🦊",
    "🐱",
    "🌟",
    "💀",
    "🔥",
    "🧠",
  ].indexOf(data.profile.avatar);
  const avatarSvg = avatarIdx >= 0 ? avatarIcons[avatarIdx] : avatarIcons[0];

  // Shop theme icons
  const shopIcons = {
    neon: `<span style="color:var(--neon-purple)">${iconDiamond}</span>`,
    retro: `<span style="color:var(--neon-cyan)">${iconTarget}</span>`,
    galaxy: `<span style="color:var(--neon-pink)">${iconStar}</span>`,
    minimal: `<span style="color:var(--text-secondary)">${iconTarget}</span>`,
    fire: `<span style="color:var(--neon-gold)">${iconFire}</span>`,
    crystal: `<span style="color:var(--neon-cyan)">${iconDiamond}</span>`,
  };

  container.innerHTML = `
    <div class="page rewards-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header" style="color:var(--neon-gold)">${iconRewards}</span> Rewards
      </h1>

      <!-- Level Progress -->
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-md)">
          <div style="width:48px;height:48px;color:var(--neon-purple)">${avatarSvg}</div>
          <div style="flex: 1">
            <div style="font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl)">
              Level ${xp.level}
            </div>
            <div style="color: var(--text-secondary); font-size: var(--text-sm)">
              ${xp.current} / ${xp.max} XP to Level ${xp.level + 1}
            </div>
          </div>
          <div class="home-coins" style="display: flex; align-items: center; gap: 4px; font-family: var(--font-display); font-weight: 700; color: var(--neon-gold); font-size: var(--text-xl)">
            <span class="icon-inline">${iconCoin}</span>
            <span>${data.profile.coins}</span>
          </div>
        </div>
        <div class="progress-bar" style="height: 12px">
          <div class="progress-bar-fill" style="width: ${xp.percent}%"></div>
        </div>
      </div>

      <!-- Daily Reward -->
      <div class="section-header">
        <h2 class="section-title">Daily Reward</h2>
        <span class="badge ${canClaim ? "badge-gold" : "badge-green"}">
          ${canClaim ? `${iconSparkle} Available` : `${iconCheck} Claimed`}
        </span>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl); text-align: center;">
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
          <span class="icon-inline" style="color:var(--neon-gold)">${iconFire}</span> Current daily streak: <strong style="color: var(--neon-gold)">${data.dailyReward.streak} days</strong>
        </p>
        ${
          canClaim
            ? `
          <button class="btn btn-lg btn-block" id="claim-daily" style="background: var(--gradient-gold); color: #000">
            ${iconGift} Claim Today's Reward
          </button>
        `
            : `
          <p style="color: var(--text-tertiary); font-size: var(--text-sm)">Come back tomorrow for more rewards!</p>
        `
        }
      </div>

      <!-- Achievements -->
      <div class="section-header">
        <h2 class="section-title">Achievements</h2>
        <span class="badge badge-purple">${unlockedCount}/${achievements.length}</span>
      </div>
      <div class="achievements-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl)">
        ${achievements
          .map(
            (a) => `
          <div class="achievement-card ${a.unlocked ? "unlocked" : "locked"}">
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-info">
              <div class="achievement-title">${a.name}</div>
              <div class="achievement-desc">${a.desc}</div>
              ${
                a.unlocked
                  ? `<span class="badge badge-green" style="margin-top: 4px">${iconCheck} Unlocked</span>`
                  : `<span class="badge" style="margin-top: 4px"><span class="icon-xs">${iconCoin}</span> ${a.reward.coins} + <span class="icon-xs">${iconBolt}</span>${a.reward.xp} XP</span>`
              }
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <!-- Cosmetic Shop Preview -->
      <div class="section-header">
        <h2 class="section-title">${iconShoppingBag} Shop</h2>
      </div>
      <div class="shop-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-md)">
        ${["neon", "retro", "galaxy", "minimal", "fire", "crystal"]
          .map((theme) => {
            const isEquipped = data.cosmetics.equippedBoard === theme;
            const isOwned =
              data.cosmetics.owned.includes(theme) || theme === "neon";
            const prices = {
              neon: 0,
              retro: 200,
              galaxy: 500,
              minimal: 150,
              fire: 300,
              crystal: 400,
            };
            return `
          <div class="shop-item ${isEquipped ? "equipped" : isOwned ? "owned" : ""}">
            <div class="shop-preview">${shopIcons[theme]}</div>
            <div class="shop-name">${theme.charAt(0).toUpperCase() + theme.slice(1)}</div>
            <div class="shop-price">${isEquipped ? `${iconCheck} Equipped` : isOwned ? `${iconCheck} Owned` : `<span class="icon-xs">${iconCoin}</span> ${prices[theme]}`}</div>
          </div>`;
          })
          .join("")}
      </div>
    </div>
  `;

  // Daily claim
  document.getElementById("claim-daily")?.addEventListener("click", () => {
    const reward = claimDailyReward();
    if (reward) {
      audio.playCoins();
      showCoinsToast(reward.coins);
      setTimeout(() => showXPToast(reward.xp), 500);
      showToast(`Day ${reward.streak} streak!`, "fire", 3000);
      // Re-render
      renderRewards(container);
    }
  });
}
