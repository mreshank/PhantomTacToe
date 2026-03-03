/* ========================================
   InfiniToe - Leaderboard Page
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

export function renderLeaderboard(container) {
  const data = loadData();
  const leaderboard = data.leaderboard || [];

  container.innerHTML = `
    <div class="page leaderboard-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header" style="color:var(--neon-gold)">${iconMedal}</span> Leaderboard
      </h1>

      <div class="tabs">
        <div class="tab active" data-tab="all">All Time</div>
        <div class="tab" data-tab="weekly">This Week</div>
        <div class="tab" data-tab="daily">Today</div>
      </div>

      ${
        leaderboard.length > 0
          ? `
      <div class="leaderboard-list" style="display: flex; flex-direction: column; gap: var(--space-sm)">
        ${leaderboard
          .slice(0, 20)
          .map(
            (entry, i) => `
          <div class="leaderboard-entry ${entry.name === data.profile.name ? "card-glow" : ""}" style="animation-delay: ${i * 50}ms; animation: slideInUp 0.4s ease ${i * 50}ms both">
            <div class="leaderboard-rank">${getRankDisplay(i + 1)}</div>
            <div class="player-avatar" style="width: 40px; height: 40px; background: var(--bg-tertiary); color: var(--neon-purple)">
              ${getAvatarIcon(i)}
            </div>
            <div style="flex: 1; min-width: 0">
              <div style="font-family: var(--font-display); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${entry.name}${entry.name === data.profile.name ? ' <span style="color: var(--neon-purple)">(You)</span>' : ""}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); display: flex; align-items: center; gap: 4px">
                <span class="icon-xs" style="color: var(--neon-gold)">${iconFire}</span> ${entry.streak || 0} streak
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
      `
          : `
      <div style="text-align: center; padding: var(--space-3xl); color: var(--text-tertiary)">
        <div class="icon-lg" style="margin-bottom: var(--space-md); color: var(--neon-gold)">${iconTrophy}</div>
        <h3 style="margin-bottom: var(--space-sm); color: var(--text-secondary)">No entries yet</h3>
        <p>Start playing to climb the ranks! Every win gets recorded here.</p>
      </div>
      `
      }
    </div>
  `;

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
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
