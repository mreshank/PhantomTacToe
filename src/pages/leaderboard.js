/* ========================================
   Phantom Tac Toe - Leaderboard Page
   ======================================== */

import { loadData } from "../data/storage.js";
import {
  iconMedal,
  iconFire,
  iconTrophy,
  iconCrown,
  iconStar,
  avatarIcons,
} from "../utils/icons.js";

export async function renderLeaderboard(container) {
  const data = loadData();
  let currentTab = "local";
  let leaderboardData = data.leaderboard || [];

  async function updateView() {
    container.innerHTML = `
      <div class="page leaderboard-page">
        <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
          <span class="icon-header" style="color:var(--neon-gold)">${iconMedal}</span> Leaderboard
        </h1>

        <div class="tabs">
          <div class="tab ${currentTab === "local" ? "active" : ""}" data-tab="local">Local History</div>
          <div class="tab ${currentTab === "global" ? "active" : ""}" data-tab="global">Global Ranking</div>
        </div>

        <div id="leaderboard-content">
          ${renderList(leaderboardData, currentTab)}
        </div>
      </div>
    `;

    // Tab switching
    container.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", async () => {
        const tabType = tab.dataset.tab;
        if (tabType === currentTab) return;

        currentTab = tabType;
        if (currentTab === "global") {
          const content = container.querySelector("#leaderboard-content");
          content.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-tertiary)">Loading global scores...</div>`;

          if (window.convexClient) {
            try {
              const globalData = await window.convexClient.query(
                "leaderboard:getGlobalLeaderboard",
              );
              leaderboardData = globalData.map((u) => ({
                name: u.name,
                score: u.wins,
                streak: u.bestStreak,
                activeFrame: u.activeFrame || "none",
                isGlobal: true,
              }));
            } catch (err) {
              console.error("Failed to fetch global leaderboard:", err);
              showToast("Failed to load global scores", "alert");
            }
          } else {
            leaderboardData = [];
          }
        } else {
          leaderboardData = data.leaderboard || [];
        }
        updateView();
      });
    });
  }

  function renderList(list, type) {
    if (list.length === 0) {
      return `
        <div style="text-align: center; padding: var(--space-3xl); color: var(--text-tertiary)">
          <div class="icon-lg" style="margin-bottom: var(--space-md); color: var(--neon-gold)">${iconTrophy}</div>
          <h3 style="margin-bottom: var(--space-sm); color: var(--text-secondary)">
            ${type === "global" ? "Cloud connection required" : "No entries yet"}
          </h3>
          <p>${type === "global" ? "Sign in to see how you stack up against the world!" : "Start playing to climb the ranks!"}</p>
        </div>
      `;
    }

    return `
      <div class="leaderboard-list" style="display: flex; flex-direction: column; gap: var(--space-sm)">
        ${list
          .slice(0, 50)
          .map(
            (entry, i) => `
          <div class="leaderboard-entry ${entry.name === data.profile.name ? "card-glow" : ""}" style="animation: slideInUp 0.4s ease ${i * 30}ms both">
            <div class="leaderboard-rank">${getRankDisplay(i + 1)}</div>
            <div class="profile-frame frame-${entry.activeFrame || "none"}">
              <div class="player-avatar" style="width: 40px; height: 40px; background: var(--bg-tertiary); color: var(--neon-purple)">
                ${getAvatarIcon(i)}
              </div>
            </div>
            <div style="flex: 1; min-width: 0">
              <div style="font-family: var(--font-display); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${entry.name}${entry.name === data.profile.name ? ' <span style="color: var(--neon-purple)">(You)</span>' : ""}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); display: flex; align-items: center; gap: 4px">
                <span class="icon-xs" style="color: var(--neon-gold)">${iconFire}</span> ${entry.streak || 0} best streak
              </div>
            </div>
            <div style="text-align: right">
              <div style="font-family: var(--font-display); font-weight: 700; color: var(--neon-gold)">${entry.score}</div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary)">wins</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  await updateView();
}

function getRankDisplay(rank) {
  switch (rank) {
    case 1:
      return `<span class="icon-rank" style="color:var(--neon-gold)">${iconCrown}</span>`;
    case 2:
      return `<span class="icon-rank" style="color:#c0c0c0">${iconMedal}</span>`;
    case 3:
      return `<span class="icon-rank" style="color:#cd7f32">${iconStar}</span>`;
    default:
      return `#${rank}`;
  }
}

function getAvatarIcon(index) {
  return avatarIcons[index % avatarIcons.length];
}
