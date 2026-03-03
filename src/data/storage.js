/* ========================================
   Phantom Tac Toe - Data Storage (localStorage)
   ======================================== */

const STORAGE_KEY = "phantomtactoe_data";
const STORAGE_VERSION = 1;

let syncInProgress = false;

/**
 * Sync local data with Convex (Global Source of Truth)
 */
export async function syncWithCloud(convexClient) {
  if (syncInProgress) return;

  const data = loadData();
  if (!data.profile.clerkUserId) return;

  try {
    syncInProgress = true;
    console.log("Cloud Sync: Synchronizing stats...");

    // Call Convex mutation to sync stats
    const cloudProfile = await convexClient.mutation("users:syncUser", {
      clerkId: data.profile.clerkUserId,
      name: data.profile.name,
      avatarUrl: data.profile.avatarUrl || "",
      avatarIndex: data.profile.avatarIndex || 0,
      level: data.profile.level,
      xp: data.profile.xp,
      wins: data.stats.wins,
      losses: data.stats.losses,
      streak: data.stats.currentStreak,
      bestStreak: data.stats.bestStreak,
      coins: data.stats.coins,
      achievements: data.stats.achievements || [],
      activeFrame: data.cosmetics.activeFrame,
    });

    if (cloudProfile) {
      // If cloud profile is more advanced, update local
      const needsUpdate =
        cloudProfile.xp > data.profile.xp ||
        cloudProfile.level > data.profile.level ||
        cloudProfile.coins > data.stats.coins;

      if (needsUpdate) {
        console.log("Cloud Sync: Local profile updated from cloud");
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
            coins: cloudProfile.coins,
            bestStreak: cloudProfile.bestStreak,
            achievements: cloudProfile.achievements,
          },
          cosmetics: {
            ...data.cosmetics,
            activeFrame: cloudProfile.activeFrame || data.cosmetics.activeFrame,
          },
        });
      }
    }
  } catch (err) {
    console.error("Cloud Sync Error:", err);
  } finally {
    syncInProgress = false;
  }
}

const DEFAULT_DATA = {
  version: STORAGE_VERSION,
  profile: {
    name: "Player",
    avatar: 0, // Index into avatarIcons array
    avatarUrl: null, // Clerk profile image URL (if signed in)
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
    timePlayed: 0, // seconds
    soloWins: 0,
    localWins: 0,
    onlineWins: 0,
  },
  achievements: {},
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    particlesEnabled: true,
    difficulty: "medium",
    timerEnabled: false,
    timerDuration: 15,
    boardTheme: "neon",
    pieceStyle: "classic",
  },
  cosmetics: {
    owned: ["neon", "classic"],
    equippedBoard: "neon",
    equippedPiece: "classic",
    activeTheme: "neon",
    unlockedThemes: ["neon"],
    activeFrame: "none",
    unlockedFrames: ["none"],
  },
  dailyReward: {
    lastClaimed: null,
    streak: 0,
    history: [],
  },
  leaderboard: [],
};

let cachedData = null;

export function loadData() {
  if (cachedData) return cachedData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === STORAGE_VERSION) {
        cachedData = { ...DEFAULT_DATA, ...data };
        return cachedData;
      }
    }
  } catch (e) {
    console.warn("Failed to load save data:", e);
  }

  cachedData = {
    ...DEFAULT_DATA,
    profile: { ...DEFAULT_DATA.profile, createdAt: Date.now() },
  };
  saveData(cachedData);

  // Apply theme on load
  if (cachedData.profile.activeTheme) {
    applyTheme(cachedData.profile.activeTheme);
  }

  return cachedData;
}

export function saveData(data) {
  try {
    cachedData = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Trigger cloud sync if authenticated and convex is ready
    if (window.convexClient && data.profile.clerkUserId && !syncInProgress) {
      syncWithCloud(window.convexClient);
    }
  } catch (e) {
    console.warn("Failed to save data:", e);
  }
}

export function updateProfile(updates) {
  const data = loadData();
  Object.assign(data.profile, updates);
  saveData(data);

  // Auto-apply theme if changed
  if (updates.activeTheme) {
    applyTheme(updates.activeTheme);
  }

  return data;
}

/**
 * Apply a theme class to the body
 */
export function applyTheme(themeId) {
  const themes = ["neon", "gold", "emerald", "obsidian", "royal"];
  document.body.classList.remove(...themes.map((t) => `theme-${t}`));
  if (themeId !== "neon") {
    document.body.classList.add(`theme-${themeId}`);
  }
}

export function updateStats(updates) {
  const data = loadData();
  Object.assign(data.stats, updates);
  saveData(data);
  return data;
}

export function recordGameResult(mode, won) {
  const data = loadData();
  data.stats.totalGames++;

  if (won) {
    data.stats.wins++;
    data.stats.currentStreak++;
    data.stats.bestStreak = Math.max(
      data.stats.bestStreak,
      data.stats.currentStreak,
    );

    if (mode === "solo") data.stats.soloWins++;
    if (mode === "local") data.stats.localWins++;
    if (mode === "online") data.stats.onlineWins++;

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

export function getSettings() {
  return loadData().settings;
}

export function updateSettings(updates) {
  const data = loadData();
  Object.assign(data.settings, updates);
  saveData(data);
  return data.settings;
}

export function addXP(amount) {
  const data = loadData();
  data.profile.xp += amount;

  // Level up check
  let levelThreshold = data.profile.level * 200 + 100;
  while (data.profile.xp >= levelThreshold) {
    data.profile.xp -= levelThreshold;
    data.profile.level++;
    data.profile.coins += 50; // Level up bonus
    levelThreshold = data.profile.level * 200 + 100;
  }

  saveData(data);
  return data.profile;
}

export function addCoins(amount) {
  const data = loadData();
  data.profile.coins += amount;
  saveData(data);
  return data.profile;
}

export function spendCoins(amount) {
  const data = loadData();
  if (data.profile.coins < amount) return false;
  data.profile.coins -= amount;
  saveData(data);
  return true;
}

export function unlockCosmetic(id) {
  const data = loadData();
  if (!data.cosmetics.owned.includes(id)) {
    data.cosmetics.owned.push(id);
  }
  saveData(data);
  return data;
}

export function equipCosmetic(type, id) {
  const data = loadData();
  if (type === "board") data.cosmetics.equippedBoard = id;
  if (type === "piece") data.cosmetics.equippedPiece = id;
  saveData(data);
  return data;
}

export function getXPProgress() {
  const data = loadData();
  const threshold = data.profile.level * 200 + 100;
  return {
    current: data.profile.xp,
    max: threshold,
    percent: (data.profile.xp / threshold) * 100,
    level: data.profile.level,
  };
}

export function claimDailyReward() {
  const data = loadData();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (data.dailyReward.lastClaimed === today) {
    return null; // Already claimed
  }

  // Check if streak continues
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (data.dailyReward.lastClaimed === yesterdayStr) {
    data.dailyReward.streak++;
  } else {
    data.dailyReward.streak = 1;
  }

  data.dailyReward.lastClaimed = today;

  // Calculate reward
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

export function canClaimDailyReward() {
  const data = loadData();
  const today = new Date().toISOString().split("T")[0];
  return data.dailyReward.lastClaimed !== today;
}
