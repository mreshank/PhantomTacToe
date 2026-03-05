/* ========================================
   Phantom Tac Toe - Data Storage (localStorage)
   ======================================== */

import type { GameMode, Difficulty } from '../game/state';

const STORAGE_KEY = 'phantomtactoe_data';
const STORAGE_VERSION = 1;

// ---- Type Definitions ---- //

export interface Profile {
  name: string;
  avatar: number;
  avatarUrl: string | null;
  avatarIndex?: number;
  clerkUserId: string | null;
  level: number;
  xp: number;
  coins: number;
  createdAt: number | null;
  activeTheme?: string;
}

export interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  totalMoves: number;
  timePlayed: number;
  soloWins: number;
  localWins: number;
  onlineWins: number;
  localNetworkWins: number;
  // Per-mode tracking
  soloGames: number;
  localGames: number;
  onlineGames: number;
  localNetworkGames: number;
}

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  particlesEnabled: boolean;
  difficulty: Difficulty;
  timerEnabled: boolean;
  timerDuration: number;
  boardTheme: string;
  pieceStyle: string;
}

export interface Cosmetics {
  owned: string[];
  equippedBoard: string;
  equippedPiece: string;
  activeTheme: string;
  unlockedThemes: string[];
  activeFrame: string;
  unlockedFrames: string[];
}

export interface DailyReward {
  lastClaimed: string | null;
  streak: number;
  history: Array<{
    date: string;
    coins: number;
    xp: number;
    streak: number;
  }>;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  streak: number;
  date: number;
}

export interface RecentOpponent {
  clerkId: string;
  name: string;
  playedAt: number;
}

export interface StorageData {
  version: number;
  profile: Profile;
  stats: Stats;
  achievements: Record<string, { unlockedAt: number }>;
  settings: Settings;
  cosmetics: Cosmetics;
  dailyReward: DailyReward;
  leaderboard: LeaderboardEntry[];
  recentOpponents: RecentOpponent[];
}

// ---- XP/Coin Multipliers by Game Mode ---- //

export const MODE_MULTIPLIERS: Record<GameMode, { xp: number; coins: number }> = {
  solo: { xp: 0.5, coins: 0.5 },
  local: { xp: 0.75, coins: 0.75 },
  online: { xp: 1.0, coins: 1.0 },
  'local-network': { xp: 0.75, coins: 0.75 },
};

// ---- Convex Sync ---- //

let syncInProgress = false;

export async function syncWithCloud(convexClient: any): Promise<void> {
  if (syncInProgress) return;

  const data = loadData();
  if (!data.profile.clerkUserId) return;

  try {
    syncInProgress = true;
    console.log('Cloud Sync: Synchronizing stats...');

    const cloudProfile = await convexClient.mutation('users:syncUser', {
      clerkId: data.profile.clerkUserId,
      name: data.profile.name,
      avatarUrl: data.profile.avatarUrl || '',
      avatarIndex: data.profile.avatarIndex || 0,
      level: data.profile.level,
      xp: data.profile.xp,
      wins: data.stats.wins,
      losses: data.stats.losses,
      streak: data.stats.currentStreak,
      bestStreak: data.stats.bestStreak,
      coins: data.profile.coins || 0,
      achievements: Object.keys(data.achievements),
      activeFrame: data.cosmetics.activeFrame,
    });

    if (cloudProfile) {
      const needsUpdate =
        cloudProfile.xp > data.profile.xp ||
        cloudProfile.level > data.profile.level ||
        cloudProfile.coins > data.profile.coins;

      if (needsUpdate) {
        console.log('Cloud Sync: Local profile updated from cloud');
        saveData({
          ...data,
          profile: {
            ...data.profile,
            level: cloudProfile.level,
            xp: cloudProfile.xp,
          },
          stats: {
            ...data.stats,
            wins: cloudProfile.wins,
            losses: cloudProfile.losses,
            bestStreak: cloudProfile.bestStreak,
          },
          cosmetics: {
            ...data.cosmetics,
            activeFrame: cloudProfile.activeFrame || data.cosmetics.activeFrame,
          },
        });
      }
    }
  } catch (err) {
    console.error('Cloud Sync Error:', err);
  } finally {
    syncInProgress = false;
  }
}

// ---- Default Data ---- //

const DEFAULT_DATA: StorageData = {
  version: STORAGE_VERSION,
  profile: {
    name: 'Player',
    avatar: 0,
    avatarUrl: null,
    clerkUserId: null,
    level: 1,
    xp: 0,
    coins: 0,
    createdAt: null,
  },
  stats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalMoves: 0,
    timePlayed: 0,
    soloWins: 0,
    localWins: 0,
    onlineWins: 0,
    localNetworkWins: 0,
    soloGames: 0,
    localGames: 0,
    onlineGames: 0,
    localNetworkGames: 0,
  },
  achievements: {},
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    particlesEnabled: true,
    difficulty: 'medium',
    timerEnabled: false,
    timerDuration: 15,
    boardTheme: 'neon',
    pieceStyle: 'classic',
  },
  cosmetics: {
    owned: ['neon', 'classic'],
    equippedBoard: 'neon',
    equippedPiece: 'classic',
    activeTheme: 'neon',
    unlockedThemes: ['neon'],
    activeFrame: 'none',
    unlockedFrames: ['none'],
  },
  dailyReward: {
    lastClaimed: null,
    streak: 0,
    history: [],
  },
  leaderboard: [],
  recentOpponents: [],
};

// ---- Data Operations ---- //

let cachedData: StorageData | null = null;

export function loadData(): StorageData {
  if (cachedData) return cachedData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<StorageData>;
      if (data.version === STORAGE_VERSION) {
        // Deep merge with defaults to handle missing fields from older versions
        cachedData = deepMerge(DEFAULT_DATA, data) as StorageData;
        return cachedData;
      }
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }

  cachedData = {
    ...DEFAULT_DATA,
    profile: { ...DEFAULT_DATA.profile, createdAt: Date.now() },
  };
  saveData(cachedData);

  if (cachedData.profile.activeTheme) {
    applyTheme(cachedData.profile.activeTheme);
  }

  return cachedData;
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function saveData(data: StorageData): void {
  try {
    cachedData = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if ((window as any).convexClient && data.profile.clerkUserId && !syncInProgress) {
      syncWithCloud((window as any).convexClient);
    }
  } catch (e) {
    console.warn('Failed to save data:', e);
  }
}

export function updateProfile(updates: Partial<Profile>): StorageData {
  const data = loadData();
  Object.assign(data.profile, updates);
  saveData(data);

  if (updates.activeTheme) {
    applyTheme(updates.activeTheme);
  }

  return data;
}

export function applyTheme(themeId: string): void {
  const themes = ['neon', 'gold', 'emerald', 'obsidian', 'royal'];
  document.body.classList.remove(...themes.map((t) => `theme-${t}`));
  if (themeId !== 'neon') {
    document.body.classList.add(`theme-${themeId}`);
  }
}

export function updateStats(updates: Partial<Stats>): StorageData {
  const data = loadData();
  Object.assign(data.stats, updates);
  saveData(data);
  return data;
}

export function recordGameResult(mode: GameMode, won: boolean): StorageData {
  const data = loadData();
  data.stats.totalGames++;

  // Track per-mode games
  switch (mode) {
    case 'solo': data.stats.soloGames++; break;
    case 'local': data.stats.localGames++; break;
    case 'online': data.stats.onlineGames++; break;
    case 'local-network': data.stats.localNetworkGames++; break;
  }

  if (won) {
    data.stats.wins++;
    data.stats.currentStreak++;
    data.stats.bestStreak = Math.max(
      data.stats.bestStreak,
      data.stats.currentStreak,
    );

    if (mode === 'solo') data.stats.soloWins++;
    if (mode === 'local') data.stats.localWins++;
    if (mode === 'online') data.stats.onlineWins++;
    if (mode === 'local-network') data.stats.localNetworkWins++;

    // Add to leaderboard
    data.leaderboard.push({
      name: data.profile.name,
      score: data.stats.wins,
      streak: data.stats.currentStreak,
      date: Date.now(),
    });
    data.leaderboard.sort((a, b) => b.score - a.score);
    data.leaderboard = data.leaderboard.slice(0, 50);
  } else {
    data.stats.losses++;
    data.stats.currentStreak = 0;
  }

  saveData(data);
  return data;
}

export function getSettings(): Settings {
  return loadData().settings;
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const data = loadData();
  Object.assign(data.settings, updates);
  saveData(data);
  return data.settings;
}

export function addXP(amount: number, mode: GameMode = 'online'): Profile {
  const data = loadData();
  const multiplier = MODE_MULTIPLIERS[mode].xp;
  const adjustedAmount = Math.round(amount * multiplier);
  data.profile.xp += adjustedAmount;

  let levelThreshold = data.profile.level * 200 + 100;
  while (data.profile.xp >= levelThreshold) {
    data.profile.xp -= levelThreshold;
    data.profile.level++;
    data.profile.coins += 50;
    levelThreshold = data.profile.level * 200 + 100;
  }

  saveData(data);
  return data.profile;
}

export function addCoins(amount: number, mode: GameMode = 'online'): Profile {
  const data = loadData();
  const multiplier = MODE_MULTIPLIERS[mode].coins;
  data.profile.coins += Math.round(amount * multiplier);
  saveData(data);
  return data.profile;
}

export function spendCoins(amount: number): boolean {
  const data = loadData();
  if (data.profile.coins < amount) return false;
  data.profile.coins -= amount;
  saveData(data);
  return true;
}

export function unlockCosmetic(id: string): StorageData {
  const data = loadData();
  if (!data.cosmetics.owned.includes(id)) {
    data.cosmetics.owned.push(id);
  }
  saveData(data);
  return data;
}

export function equipCosmetic(type: 'board' | 'piece', id: string): StorageData {
  const data = loadData();
  if (type === 'board') data.cosmetics.equippedBoard = id;
  if (type === 'piece') data.cosmetics.equippedPiece = id;
  saveData(data);
  return data;
}

export function getXPProgress(): { current: number; max: number; percent: number; level: number } {
  const data = loadData();
  const threshold = data.profile.level * 200 + 100;
  return {
    current: data.profile.xp,
    max: threshold,
    percent: (data.profile.xp / threshold) * 100,
    level: data.profile.level,
  };
}

export function claimDailyReward(): { coins: number; xp: number; streak: number } | null {
  const data = loadData();
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (data.dailyReward.lastClaimed === today) {
    return null;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (data.dailyReward.lastClaimed === yesterdayStr) {
    data.dailyReward.streak++;
  } else {
    data.dailyReward.streak = 1;
  }

  data.dailyReward.lastClaimed = today;

  const baseCoins = 10;
  const streakBonus = Math.min(data.dailyReward.streak, 7);
  const coins = baseCoins * streakBonus;
  const xp = 25 * streakBonus;

  data.profile.coins += coins;
  addXP(xp);

  data.dailyReward.history.push({
    date: today,
    coins,
    xp,
    streak: data.dailyReward.streak,
  });

  saveData(data);
  return { coins, xp, streak: data.dailyReward.streak };
}

export function canClaimDailyReward(): boolean {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  return data.dailyReward.lastClaimed !== today;
}

export function addRecentOpponent(opponentInfo: { clerkId?: string; name?: string }): void {
  if (!opponentInfo?.clerkId) return;
  const data = loadData();
  if (!data.recentOpponents) data.recentOpponents = [];

  data.recentOpponents = data.recentOpponents.filter(
    (o) => o.clerkId !== opponentInfo.clerkId,
  );

  data.recentOpponents.unshift({
    clerkId: opponentInfo.clerkId!,
    name: opponentInfo.name || 'Unknown',
    playedAt: Date.now(),
  });

  data.recentOpponents = data.recentOpponents.slice(0, 5);
  saveData(data);
}
