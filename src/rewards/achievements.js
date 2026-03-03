/* ========================================
   InfiniToe - Achievements System
   ======================================== */

import { loadData, saveData } from "../data/storage.js";

export const ACHIEVEMENTS = [
  {
    id: "first_win",
    name: "First Blood",
    desc: "Win your first game",
    icon: "🏆",
    condition: (s) => s.wins >= 1,
    reward: { coins: 25, xp: 50 },
  },
  {
    id: "win_5",
    name: "Getting Good",
    desc: "Win 5 games",
    icon: "⭐",
    condition: (s) => s.wins >= 5,
    reward: { coins: 50, xp: 100 },
  },
  {
    id: "win_25",
    name: "Champion",
    desc: "Win 25 games",
    icon: "👑",
    condition: (s) => s.wins >= 25,
    reward: { coins: 100, xp: 250 },
  },
  {
    id: "win_100",
    name: "Legend",
    desc: "Win 100 games",
    icon: "🐐",
    condition: (s) => s.wins >= 100,
    reward: { coins: 250, xp: 500 },
  },
  {
    id: "streak_3",
    name: "Hot Streak",
    desc: "Win 3 games in a row",
    icon: "🔥",
    condition: (s) => s.bestStreak >= 3,
    reward: { coins: 30, xp: 75 },
  },
  {
    id: "streak_5",
    name: "On Fire",
    desc: "Win 5 games in a row",
    icon: "💥",
    condition: (s) => s.bestStreak >= 5,
    reward: { coins: 75, xp: 150 },
  },
  {
    id: "streak_10",
    name: "Unstoppable",
    desc: "Win 10 games in a row",
    icon: "☄️",
    condition: (s) => s.bestStreak >= 10,
    reward: { coins: 200, xp: 400 },
  },
  {
    id: "play_10",
    name: "Dedicated",
    desc: "Play 10 games",
    icon: "🎮",
    condition: (s) => s.totalGames >= 10,
    reward: { coins: 20, xp: 40 },
  },
  {
    id: "play_50",
    name: "Addict",
    desc: "Play 50 games",
    icon: "💊",
    condition: (s) => s.totalGames >= 50,
    reward: { coins: 75, xp: 150 },
  },
  {
    id: "play_200",
    name: "No Life",
    desc: "Play 200 games",
    icon: "🧟",
    condition: (s) => s.totalGames >= 200,
    reward: { coins: 200, xp: 400 },
  },
  {
    id: "solo_king",
    name: "Solo King",
    desc: "Win 10 solo games",
    icon: "🤖",
    condition: (s) => s.soloWins >= 10,
    reward: { coins: 50, xp: 100 },
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    desc: "Win 5 online games",
    icon: "🦋",
    condition: (s) => s.onlineWins >= 5,
    reward: { coins: 75, xp: 150 },
  },
];

export function checkAchievements(stats) {
  const data = loadData();
  const newUnlocks = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!data.achievements[achievement.id] && achievement.condition(stats)) {
      data.achievements[achievement.id] = {
        unlockedAt: Date.now(),
      };

      // Grant rewards
      data.profile.coins += achievement.reward.coins;
      data.profile.xp += achievement.reward.xp;

      newUnlocks.push(achievement);
    }
  }

  if (newUnlocks.length > 0) {
    saveData(data);
  }

  return newUnlocks;
}

export function getAchievementStatus() {
  const data = loadData();
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: !!data.achievements[a.id],
    unlockedAt: data.achievements[a.id]?.unlockedAt,
  }));
}
