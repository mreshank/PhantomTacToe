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

  // Create default leaderboard entries if empty
  const leaderboard =
    data.leaderboard.length > 0
      ? data.leaderboard
      : getDefaultLeaderboard(data);

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

      <div class="leaderboard-list" style="display: flex; flex-direction: column; gap: var(--space-sm)">
        ${leaderboard
          .slice(0, 20)
          .map(
            (entry, i) => `
          <div class="leaderboard-entry ${entry.name === data.profile.name ? "card-glow" : ""}" style="animation-delay: ${i * 50}ms; animation: slideInUp 0.4s ease ${i * 50}ms both">
            <div class="leaderboard-rank">${getRankDisplay(i + 1)}</div>
            <div class="player-avatar" style="width: 40px; height: 40px; background: var(--bg-tertiary); color: var(--neon-purple)">
              ${entry.name === data.profile.name ? getPlayerAvatar(data) : getAvatarIcon(i)}
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

      ${
        leaderboard.length === 0
          ? `
        <div style="text-align: center; padding: var(--space-3xl); color: var(--text-tertiary)">
          <div style="margin-bottom: var(--space-md); color: var(--neon-gold)">${iconTrophy}</div>
          <p>No entries yet. Start playing to climb the ranks!</p>
        </div>
      `
          : ""
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

function getDefaultLeaderboard(data) {
  const bots = [
    { name: "NeonNinja", score: 42, streak: 7 },
    { name: "CyberPunk", score: 38, streak: 5 },
    { name: "PixelQueen", score: 35, streak: 8 },
    { name: "GlowBot", score: 31, streak: 4 },
    { name: "VibeMaster", score: 28, streak: 3 },
    { name: "ZapAttack", score: 24, streak: 6 },
    { name: "StarStrike", score: 20, streak: 2 },
  ];

  const player = {
    name: data.profile.name,
    score: data.stats.wins,
    streak: data.stats.currentStreak,
  };

  const combined = [...bots, player].sort((a, b) => b.score - a.score);
  return combined;
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

function getPlayerAvatar(data) {
  const avatarMap = [
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
  ];
  const idx = avatarMap.indexOf(data.profile.avatar);
  return idx >= 0 ? avatarIcons[idx] : avatarIcons[0];
}

function getAvatarIcon(index) {
  return avatarIcons[index % avatarIcons.length];
}
