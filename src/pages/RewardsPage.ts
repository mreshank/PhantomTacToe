/* ========================================
   Phantom Tac Toe - Rewards Page
   ======================================== */

import {
  loadData,
  saveData,
  getXPProgress,
  canClaimDailyReward,
  claimDailyReward,
} from "../data/storage";
import { getAchievementStatus } from "../rewards/achievements";
import { audio } from "../utils/audio";
import { showToast, showCoinsToast, showXPToast } from "../components/toast";
import {
  iconRewards,
  iconCoin,
  iconGift,
  iconFire,
  iconCheck,
  iconSparkle,
  iconDiamond,
  iconStar,
  iconTarget,
  iconHeart,
  iconBolt,
  avatarIcons,
} from "../utils/icons";

export function renderRewards(container: HTMLElement) {
  const data = loadData();
  const xp = getXPProgress();
  const achievements = getAchievementStatus();
  const canClaim = canClaimDailyReward();

  // Defensive defaults for cosmetics
  if (!data.cosmetics) data.cosmetics = {} as any;
  if (!data.cosmetics.unlockedThemes) data.cosmetics.unlockedThemes = ["neon"];
  if (!data.cosmetics.unlockedFrames) data.cosmetics.unlockedFrames = ["none"];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Use numeric avatar index from profile
  const avatarIdx =
    typeof data.profile.avatar === "number" ? data.profile.avatar : 0;
  const avatarImgHtml = avatarIcons[avatarIdx] || avatarIcons[0];

  container.innerHTML = `
    <div class="page rewards-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header" style="color:var(--neon-gold)">${iconRewards}</span> Rewards
      </h1>

      <!-- Level Progress -->
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-md)">
          <div style="width:48px;height:48px;color:var(--neon-purple); border-radius: 50%; overflow: hidden; background: var(--bg-tertiary)">
            ${avatarImgHtml}
          </div>
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

      <!-- Elite Personalization -->
      <div class="section-header">
        <h2 class="section-title"><span class="icon-header" style="color:var(--neon-purple)">${iconSparkle}</span> Elite Personalization</h2>
      </div>
      <div class="personalization-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl)">
        <!-- Global Themes -->
        <div class="card">
          <h3 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-md)">Global Themes</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-sm)">
            ${["neon", "gold", "emerald", "obsidian", "royal"]
              .map((t) => {
                const isUnlocked = data.cosmetics.unlockedThemes.includes(t);
                const price = t === "neon" ? 0 : t === "gold" ? 1000 : 500;
                return `
                <div class="shop-item-horizontal ${isUnlocked ? "unlocked" : ""}" data-purchase="theme" data-id="${t}" data-price="${price}">
                  <div class="theme-dot theme-${t}"></div>
                  <div style="flex: 1">
                    <div style="font-weight: 600">${t.charAt(0).toUpperCase() + t.slice(1)}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Global site colors</div>
                  </div>
                  <div class="price-tag">${isUnlocked ? `<span style="color:var(--neon-green)">${iconCheck}</span>` : `<span class="icon-xs">${iconCoin}</span> ${price}`}</div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Animated Frames -->
        <div class="card">
          <h3 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-md)">Animated Frames</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-sm)">
            ${["none", "neon", "gold", "emerald", "royal"]
              .map((f) => {
                const isUnlocked = data.cosmetics.unlockedFrames.includes(f);
                const price = f === "none" ? 0 : f === "gold" ? 2000 : 800;
                return `
                <div class="shop-item-horizontal ${isUnlocked ? "unlocked" : ""}" data-purchase="frame" data-id="${f}" data-price="${price}">
                  <div class="profile-frame frame-${f}" style="width: 24px; height: 24px; border-radius: 50%"></div>
                  <div style="flex: 1">
                    <div style="font-weight: 600">${f === "none" ? "No Frame" : f.charAt(0).toUpperCase() + f.slice(1) + " Pulsar"}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Avatar border effect</div>
                  </div>
                  <div class="price-tag">${isUnlocked ? `<span style="color:var(--neon-green)">${iconCheck}</span>` : `<span class="icon-xs">${iconCoin}</span> ${price}`}</div>
                </div>
              `;
              })
              .join("")}
          </div>
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
      showToast(`Day ${reward.streak} streak!`, "fire", 3000);
      // Re-render
      renderRewards(container);
    }
  });

  // Purchase listeners
  container.querySelectorAll(".shop-item-horizontal").forEach((item) => {
    item.addEventListener("click", () => {
      const { purchase, id, price } = (item as HTMLElement).dataset;
      const numPrice = parseInt(price || "0");

      const isUnlocked =
        purchase === "theme"
          ? data.cosmetics.unlockedThemes.includes(id as string)
          : data.cosmetics.unlockedFrames.includes(id as string);

      if (isUnlocked) {
        showToast("Already unlocked! Equip in Settings.", "check");
        return;
      }

      if (data.profile.coins >= numPrice) {
        data.profile.coins -= numPrice;
        if (purchase === "theme" && id) data.cosmetics.unlockedThemes.push(id);
        if (purchase === "frame" && id) data.cosmetics.unlockedFrames.push(id);

        saveData(data);
        audio.playCoins();
        showToast(`Unlocked ${id} ${purchase}!`, "sparkle");
        renderRewards(container);
      } else {
        showToast("Not enough coins!", "alert");
      }
    });
  });
}
