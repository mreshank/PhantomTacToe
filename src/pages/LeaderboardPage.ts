/* ========================================
   Phantom Tac Toe - Leaderboard Page
   My Circle (Friends + Recent Opponents) + Global
   ======================================== */

import { loadData } from "../data/storage";
import { showToast } from "../components/toast";
import {
  iconMedal,
  iconFire,
  iconTrophy,
  iconCrown,
  iconStar,
  iconHeart,
  iconGlobe,
  avatarIcons,
} from "../utils/icons";

export async function renderLeaderboard(container: HTMLElement) {
  const data = loadData();
  let currentTab = "circle";
  let leaderboardData = [];

  async function updateView() {
    container.innerHTML = `
      <div class="page leaderboard-page">
        <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
          <span class="icon-header" style="color:var(--neon-gold)">${iconMedal}</span> Leaderboard
        </h1>

        <div class="tabs">
          <div class="tab ${currentTab === "circle" ? "active" : ""}" data-tab="circle">${iconHeart} My Circle</div>
          <div class="tab ${currentTab === "global" ? "active" : ""}" data-tab="global">${iconGlobe} Global</div>
        </div>

        <div id="leaderboard-content">
          ${currentTab === "circle" ? '<div style="text-align:center; padding: 40px; color: var(--text-tertiary)">Loading your circle...</div>' : ""}
          ${currentTab === "global" ? '<div style="text-align:center; padding: 40px; color: var(--text-tertiary)">Loading global scores...</div>' : ""}
        </div>
      </div>
    `;

    // Load data based on tab
    if (currentTab === "circle") {
      await loadCircleData(data);
    } else {
      await loadGlobalData(data);
    }

    // Tab switching
    container.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", async () => {
        const tabType = (tab as HTMLElement).dataset.tab;
        if (!tabType || tabType === currentTab) return;
        currentTab = tabType;
        updateView();
      });
    });
  }

  async function loadCircleData(data: any) {
    const content = container.querySelector("#leaderboard-content") as HTMLElement;
    const clerkId = data.profile.clerkUserId;

    if (!clerkId || !(window as any).convexClient) {
      if (content) content.innerHTML = renderEmptyState("circle");
      return;
    }

    try {
      // Get friends data
      const friends: any[] = await (window as any).convexClient.query("friends:getFriends", {
        clerkId,
      });

      // Get recent opponents from local storage
      const recentOpponents = data.recentOpponents || [];
      const recentIds = recentOpponents
        .map((o: any) => o.clerkId)
        .filter((id: string) => id && !friends.some((f: any) => f.clerkId === id));

      let recentUsers: any[] = [];
      if (recentIds.length > 0) {
        try {
          recentUsers = await (window as any).convexClient.query("users:getUsersByIds", {
            clerkIds: recentIds,
          });
        } catch (e) {
          console.warn("Failed to fetch recent opponents:", e);
        }
      }

      // Combine friends + recent opponents + self
      const circleEntries = [];

      // Add self
      circleEntries.push({
        name: data.profile.name,
        clerkId,
        score: data.stats.wins,
        streak: data.stats.bestStreak,
        level: data.profile.level,
        activeFrame: data.cosmetics?.activeFrame || "none",
        avatarIndex: data.profile.avatar || 0,
        isSelf: true,
      });

      // Add friends
      for (const f of friends) {
        circleEntries.push({
          name: f.name,
          clerkId: f.clerkId,
          score: f.wins,
          streak: f.bestStreak,
          level: f.level,
          activeFrame: f.activeFrame || "none",
          avatarIndex: f.avatarIndex || 0,
          isFriend: true,
        });
      }

      // Add recent opponents (not already friends)
      for (const u of recentUsers) {
        circleEntries.push({
          name: u.name,
          clerkId: u.clerkId,
          score: u.wins,
          streak: u.bestStreak,
          level: u.level,
          activeFrame: u.activeFrame || "none",
          avatarIndex: u.avatarIndex || 0,
          isRecent: true,
        });
      }

      // Sort by wins
      circleEntries.sort((a, b) => b.score - a.score);

      if (content) content.innerHTML = renderList(circleEntries, "circle", data);
    } catch (err) {
      console.error("Failed to load circle data:", err);
      if (content) content.innerHTML = renderEmptyState("circle");
    }
  }

  async function loadGlobalData(data: any) {
    const content = container.querySelector("#leaderboard-content") as HTMLElement;

    if (!(window as any).convexClient) {
      if (content) content.innerHTML = renderEmptyState("global");
      return;
    }

    try {
      const globalData: any[] = await (window as any).convexClient.query(
        "leaderboard:getGlobalLeaderboard",
      );
      const entries = globalData.map((u: any) => ({
        name: u.name,
        score: u.wins,
        streak: u.bestStreak,
        activeFrame: u.activeFrame || "none",
        avatarIndex: u.avatarIndex || 0,
        isGlobal: true,
      }));
      if (content) content.innerHTML = renderList(entries, "global", data);
    } catch (err) {
      console.error("Failed to fetch global leaderboard:", err);
      showToast("Failed to load global scores", "alert");
      if (content) content.innerHTML = renderEmptyState("global");
    }
  }

  function renderEmptyState(type: string) {
    return `
      <div style="text-align: center; padding: var(--space-3xl); color: var(--text-tertiary)">
        <div class="icon-lg" style="margin-bottom: var(--space-md); color: var(--neon-gold)">${iconTrophy}</div>
        <h3 style="margin-bottom: var(--space-sm); color: var(--text-secondary)">
          ${type === "global" ? "Cloud connection required" : "Add friends to see your circle"}
        </h3>
        <p>${type === "global" ? "Sign in to see how you stack up against the world!" : "Your friends and recent opponents will appear here"}</p>
      </div>
    `;
  }

  function renderList(list: any[], type: string, data: any) {
    if (list.length === 0) return renderEmptyState(type);

    return `
      <div class="leaderboard-list" style="display: flex; flex-direction: column; gap: var(--space-sm)">
        ${list
          .slice(0, 50)
          .map(
            (entry: any, i: number) => `
          <div class="leaderboard-entry ${entry.isSelf ? "card-glow" : ""}" style="animation: slideInUp 0.4s ease ${i * 30}ms both">
            <div class="leaderboard-rank">${getRankDisplay(i + 1)}</div>
            <div class="profile-frame frame-${entry.activeFrame || "none"}" style="border-radius: 50%">
              <div class="player-avatar" style="width: 40px; height: 40px; background: var(--bg-tertiary); color: var(--neon-purple); border-radius: 50%; overflow: hidden">
                ${avatarIcons[entry.avatarIndex % avatarIcons.length]}
              </div>
            </div>
            <div style="flex: 1; min-width: 0">
              <div style="font-family: var(--font-display); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px">
                ${entry.name}
                ${entry.isSelf ? ' <span style="color: var(--neon-purple)">(You)</span>' : ""}
                ${entry.isFriend ? ` <span style="color: var(--neon-cyan); font-size: 10px">${iconHeart}</span>` : ""}
                ${entry.isRecent ? ' <span style="font-size: 10px; color: var(--text-tertiary)">Recent</span>' : ""}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); display: flex; align-items: center; gap: 4px">
                <span class="icon-xs" style="color: var(--neon-gold)">${iconFire}</span> ${entry.streak || 0} best streak
                ${entry.level ? ` • Lv.${entry.level}` : ""}
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

function getRankDisplay(rank: number) {
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
