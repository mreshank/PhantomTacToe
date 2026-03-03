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

export function renderRewards(container) {
  const data = loadData();
  const xp = getXPProgress();
  const achievements = getAchievementStatus();
  const canClaim = canClaimDailyReward();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  container.innerHTML = `
    <div class="page rewards-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl)">
        🏆 Rewards
      </h1>

      <!-- Level Progress -->
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-md)">
          <div style="font-size: 2.5rem">${data.profile.avatar}</div>
          <div style="flex: 1">
            <div style="font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl)">
              Level ${xp.level}
            </div>
            <div style="color: var(--text-secondary); font-size: var(--text-sm)">
              ${xp.current} / ${xp.max} XP to Level ${xp.level + 1}
            </div>
          </div>
          <div class="home-coins" style="display: flex; align-items: center; gap: 4px; font-family: var(--font-display); font-weight: 700; color: var(--neon-gold); font-size: var(--text-xl)">
            <span>🪙</span>
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
          ${canClaim ? "✨ Available" : "✅ Claimed"}
        </span>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl); text-align: center;">
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
          🔥 Current daily streak: <strong style="color: var(--neon-gold)">${data.dailyReward.streak} days</strong>
        </p>
        ${
          canClaim
            ? `
          <button class="btn btn-lg btn-block" id="claim-daily" style="background: var(--gradient-gold); color: #000">
            🎁 Claim Today's Reward
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
                  ? `<span class="badge badge-green" style="margin-top: 4px">✅ Unlocked</span>`
                  : `<span class="badge" style="margin-top: 4px">🪙 ${a.reward.coins} + ⚡${a.reward.xp} XP</span>`
              }
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <!-- Cosmetic Shop Preview -->
      <div class="section-header">
        <h2 class="section-title">Shop</h2>
      </div>
      <div class="shop-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-md)">
        <div class="shop-item ${data.cosmetics.equippedBoard === "neon" ? "equipped" : "owned"}">
          <div class="shop-preview">💜</div>
          <div class="shop-name">Neon</div>
          <div class="shop-price">${data.cosmetics.equippedBoard === "neon" ? "✅ Equipped" : "✅ Owned"}</div>
        </div>
        <div class="shop-item ${data.cosmetics.owned.includes("retro") ? "owned" : ""}">
          <div class="shop-preview">🕹️</div>
          <div class="shop-name">Retro</div>
          <div class="shop-price">${data.cosmetics.owned.includes("retro") ? "✅ Owned" : "🪙 200"}</div>
        </div>
        <div class="shop-item ${data.cosmetics.owned.includes("galaxy") ? "owned" : ""}">
          <div class="shop-preview">🌌</div>
          <div class="shop-name">Galaxy</div>
          <div class="shop-price">${data.cosmetics.owned.includes("galaxy") ? "✅ Owned" : "🪙 500"}</div>
        </div>
        <div class="shop-item ${data.cosmetics.owned.includes("minimal") ? "owned" : ""}">
          <div class="shop-preview">⬜</div>
          <div class="shop-name">Minimal</div>
          <div class="shop-price">${data.cosmetics.owned.includes("minimal") ? "✅ Owned" : "🪙 150"}</div>
        </div>
        <div class="shop-item ${data.cosmetics.owned.includes("fire") ? "owned" : ""}">
          <div class="shop-preview">🔥</div>
          <div class="shop-name">Fire</div>
          <div class="shop-price">${data.cosmetics.owned.includes("fire") ? "✅ Owned" : "🪙 300"}</div>
        </div>
        <div class="shop-item ${data.cosmetics.owned.includes("crystal") ? "owned" : ""}">
          <div class="shop-preview">💎</div>
          <div class="shop-name">Crystal</div>
          <div class="shop-price">${data.cosmetics.owned.includes("crystal") ? "✅ Owned" : "🪙 400"}</div>
        </div>
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
      showToast(`🔥 Day ${reward.streak} streak!`, "🎁", 3000);
      // Re-render
      renderRewards(container);
    }
  });
}
