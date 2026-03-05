/* ========================================
   Phantom Tac Toe - Achievements System
   ======================================== */

import { loadData, saveData, MODE_MULTIPLIERS, type Stats } from '../data/storage';
import type { GameMode } from '../game/state';
import {
  iconTrophy,
  iconStar,
  iconCrown,
  iconMedal,
  iconFire,
  iconBolt,
  iconTarget,
  iconGamepad,
  iconRobot,
  iconGlobe,
} from '../utils/icons';

export interface AchievementReward {
  coins: number;
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: (s: Stats) => boolean;
  reward: AchievementReward;
  /** If set, this achievement is only earnable in these modes */
  eligibleModes?: GameMode[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Blood',
    desc: 'Win your first game',
    icon: iconTrophy,
    condition: (s) => s.wins >= 1,
    reward: { coins: 25, xp: 50 },
  },
  {
    id: 'win_5',
    name: 'Getting Good',
    desc: 'Win 5 games',
    icon: iconStar,
    condition: (s) => s.wins >= 5,
    reward: { coins: 50, xp: 100 },
  },
  {
    id: 'win_25',
    name: 'Champion',
    desc: 'Win 25 games',
    icon: iconCrown,
    condition: (s) => s.wins >= 25,
    reward: { coins: 100, xp: 250 },
  },
  {
    id: 'win_100',
    name: 'Legend',
    desc: 'Win 100 games',
    icon: iconMedal,
    condition: (s) => s.wins >= 100,
    reward: { coins: 250, xp: 500 },
  },
  {
    id: 'streak_3',
    name: 'Hot Streak',
    desc: 'Win 3 games in a row',
    icon: iconFire,
    condition: (s) => s.bestStreak >= 3,
    reward: { coins: 30, xp: 75 },
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    desc: 'Win 5 games in a row',
    icon: iconBolt,
    condition: (s) => s.bestStreak >= 5,
    reward: { coins: 75, xp: 150 },
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    desc: 'Win 10 games in a row',
    icon: iconTarget,
    condition: (s) => s.bestStreak >= 10,
    reward: { coins: 200, xp: 400 },
  },
  {
    id: 'play_10',
    name: 'Dedicated',
    desc: 'Play 10 games',
    icon: iconGamepad,
    condition: (s) => s.totalGames >= 10,
    reward: { coins: 20, xp: 40 },
  },
  {
    id: 'play_50',
    name: 'Addict',
    desc: 'Play 50 games',
    icon: iconFire,
    condition: (s) => s.totalGames >= 50,
    reward: { coins: 75, xp: 150 },
  },
  {
    id: 'play_200',
    name: 'No Life',
    desc: 'Play 200 games',
    icon: iconTarget,
    condition: (s) => s.totalGames >= 200,
    reward: { coins: 200, xp: 400 },
  },
  {
    id: 'solo_king',
    name: 'Solo King',
    desc: 'Win 10 solo games',
    icon: iconRobot,
    condition: (s) => s.soloWins >= 10,
    reward: { coins: 50, xp: 100 },
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    desc: 'Win 5 online games',
    icon: iconGlobe,
    condition: (s) => s.onlineWins >= 5,
    reward: { coins: 75, xp: 150 },
    eligibleModes: ['online'], // Only earnable in online mode
  },
];

export function checkAchievements(stats: Stats, mode: GameMode = 'online'): Achievement[] {
  const data = loadData();
  const newUnlocks: Achievement[] = [];
  const multiplier = MODE_MULTIPLIERS[mode];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (data.achievements[achievement.id]) continue;

    // Skip if not eligible for this mode
    if (achievement.eligibleModes && !achievement.eligibleModes.includes(mode)) continue;

    if (achievement.condition(stats)) {
      data.achievements[achievement.id] = {
        unlockedAt: Date.now(),
      };

      // Grant rewards with mode-specific multiplier
      data.profile.coins += Math.round(achievement.reward.coins * multiplier.coins);
      data.profile.xp += Math.round(achievement.reward.xp * multiplier.xp);

      newUnlocks.push(achievement);
    }
  }

  if (newUnlocks.length > 0) {
    saveData(data);
  }

  return newUnlocks;
}

export interface AchievementStatus extends Achievement {
  unlocked: boolean;
  unlockedAt?: number;
}

export function getAchievementStatus(): AchievementStatus[] {
  const data = loadData();
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: !!data.achievements[a.id],
    unlockedAt: data.achievements[a.id]?.unlockedAt,
  }));
}
