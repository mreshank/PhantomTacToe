/* ========================================
   Phantom Tac Toe - Settings Page
   ======================================== */

import { loadData, updateSettings, updateProfile } from "../data/storage.js";
import { audio } from "../utils/audio.js";
import { showToast } from "../components/toast.js";
import {
  iconSettings,
  iconTrash,
  iconHeart,
  iconUser,
  avatarIcons,
} from "../utils/icons.js";
import {
  isAuthAvailable,
  isSignedIn,
  getClerkProfile,
  signIn,
  signOut,
  openUserProfile,
} from "../auth/auth.js";

export function renderSettings(container) {
  const data = loadData();
  const settings = data.settings;

  // Defensive defaults for cosmetics (old localStorage may not have these)
  if (!data.cosmetics) data.cosmetics = {};
  if (!data.cosmetics.unlockedThemes) data.cosmetics.unlockedThemes = ["neon"];
  if (!data.cosmetics.unlockedFrames) data.cosmetics.unlockedFrames = ["none"];
  if (!data.cosmetics.activeTheme) data.cosmetics.activeTheme = "neon";
  if (!data.cosmetics.activeFrame) data.cosmetics.activeFrame = "none";
  if (!data.profile.activeTheme)
    data.profile.activeTheme = data.cosmetics.activeTheme;
  if (!data.profile.activeFrame)
    data.profile.activeFrame = data.cosmetics.activeFrame;

  const avatarLabels = [
    "Cool",
    "Cowboy",
    "Ninja",
    "Alien",
    "Robot",
    "Jack",
    "Fox",
    "Cat",
    "Star",
    "Skull",
    "Fire",
    "Brain",
  ];
  const currentAvatarIdx =
    typeof data.profile.avatar === "number" ? data.profile.avatar : 0;
  const authAvailable = isAuthAvailable();
  const signedIn = isSignedIn();
  const clerkProfile = getClerkProfile();

  container.innerHTML = `
    <div class="page settings-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header">${iconSettings}</span> Settings
      </h1>

      <!-- Account -->
      ${
        authAvailable
          ? `
      <div class="section-header">
        <h2 class="section-title">Account</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        ${
          signedIn
            ? `
          <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md)">
            ${clerkProfile?.avatarUrl ? `<img src="${clerkProfile.avatarUrl}" alt="Avatar" style="width: 48px; height: 48px; border-radius: var(--radius-full); object-fit: cover" />` : `<div class="player-avatar" style="width: 48px; height: 48px; background: var(--bg-tertiary); color: var(--neon-purple)">${iconUser}</div>`}
            <div style="flex: 1">
              <div style="font-family: var(--font-display); font-weight: 600">${clerkProfile?.name || "Player"}</div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary)">${clerkProfile?.email || ""}</div>
            </div>
          </div>
          <div style="display: flex; gap: var(--space-sm)">
            <button class="btn btn-secondary btn-block" id="btn-manage-account">Manage Account</button>
            <button class="btn btn-ghost btn-block" id="btn-sign-out">Sign Out</button>
          </div>
        `
            : `
          <p style="color: var(--text-secondary); margin-bottom: var(--space-md)">Sign in to sync your progress and play online with your identity.</p>
          <button class="btn btn-primary btn-lg btn-block" id="btn-sign-in" style="background: var(--gradient-main)">${iconUser} Sign in with Google</button>
        `
        }
      </div>
      `
          : ""
      }

      <!-- Profile -->
      <div class="section-header">
        <h2 class="section-title">Profile</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="margin-bottom: var(--space-md)">
          <label style="display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-xs)">Display Name</label>
          <input type="text" id="player-name" value="${data.profile.name}" maxlength="16" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-xs)">Avatar</label>
          <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-sm)">
            ${avatarIcons
              .map(
                (svg, i) => `
              <button class="avatar-pick-btn ${i === currentAvatarIdx ? "active" : ""}" data-avatar-index="${i}"
                title="${avatarLabels[i]}"
                style="${i === currentAvatarIdx ? "border: 2px solid var(--neon-purple); box-shadow: var(--shadow-neon-purple)" : ""}">
                ${svg}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <!-- Theme & Appearance -->
      <div class="section-header">
        <h2 class="section-title">Appearance</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="margin-bottom: var(--space-md)">
          <label style="display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-xs)">Global Theme</label>
          <div class="theme-selector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: var(--space-sm)">
            ${["neon", "gold", "emerald", "obsidian", "royal"]
              .map((t) => {
                const isUnlocked = data.cosmetics.unlockedThemes.includes(t);
                const isActive = data.profile.activeTheme === t;
                return `
                <button class="theme-option ${isActive ? "active" : ""} ${!isUnlocked ? "locked" : ""}" 
                  data-theme="${t}" 
                  ${!isUnlocked ? "disabled" : ""}
                  title="${!isUnlocked ? "Unlock in Rewards" : t}">
                  <div class="theme-dot theme-${t}"></div>
                  <span style="font-size: 10px">${t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>
        <div>
          <label style="display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-xs)">Profile Frame</label>
          <div class="frame-selector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: var(--space-sm)">
            ${["none", "neon", "gold", "emerald", "royal"]
              .map((f) => {
                const isUnlocked = data.cosmetics.unlockedFrames.includes(f);
                const isActive = data.profile.activeFrame === f;
                return `
                <button class="frame-option ${isActive ? "active" : ""} ${!isUnlocked ? "locked" : ""}" 
                  data-frame="${f}" 
                  ${!isUnlocked ? "disabled" : ""}
                  title="${!isUnlocked ? "Unlock in Rewards" : f}">
                  <div class="profile-frame frame-${f}" style="width: 20px; height: 20px; border-radius: 50%"></div>
                  <span style="font-size: 10px">${f === "none" ? "None" : f.charAt(0).toUpperCase() + f.slice(1)}</span>
                </button>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>

      <!-- Gameplay -->
      <div class="section-header">
        <h2 class="section-title">Gameplay</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="margin-bottom: var(--space-md)">
          <label style="display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-xs)">Default AI Difficulty</label>
          <div class="difficulty-selector">
            <div class="difficulty-option ${settings.difficulty === "easy" ? "active" : ""}" data-diff="easy">Easy</div>
            <div class="difficulty-option ${settings.difficulty === "medium" ? "active" : ""}" data-diff="medium">Medium</div>
            <div class="difficulty-option ${settings.difficulty === "hard" ? "active" : ""}" data-diff="hard">Hard</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md)">
          <span>Turn Timer</span>
          <label class="toggle">
            <input type="checkbox" id="timer-toggle" ${settings.timerEnabled ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div id="timer-duration-row" style="display: ${settings.timerEnabled ? "flex" : "none"}; justify-content: space-between; align-items: center">
          <span style="font-size: var(--text-sm)">Timer Duration</span>
          <select id="timer-duration">
            <option value="10" ${settings.timerDuration === 10 ? "selected" : ""}>10s</option>
            <option value="15" ${settings.timerDuration === 15 ? "selected" : ""}>15s</option>
            <option value="20" ${settings.timerDuration === 20 ? "selected" : ""}>20s</option>
            <option value="30" ${settings.timerDuration === 30 ? "selected" : ""}>30s</option>
          </select>
        </div>
      </div>

      <!-- Visual -->
      <div class="section-header">
        <h2 class="section-title">Visual</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>Particle Effects</span>
          <label class="toggle">
            <input type="checkbox" id="particles-toggle" ${settings.particlesEnabled ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="section-header">
        <h2 class="section-title" style="color: var(--neon-pink)">Danger Zone</h2>
      </div>
      <div class="card" style="border-color: rgba(255, 55, 95, 0.2)">
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
          This will delete all your progress, stats, and achievements.
        </p>
        <button class="btn btn-block" id="btn-reset" style="background: rgba(255, 55, 95, 0.15); color: var(--neon-pink); border: 1px solid rgba(255, 55, 95, 0.3)">
          ${iconTrash} Reset All Data
        </button>
      </div>

      <div style="text-align: center; padding: var(--space-2xl) 0; color: var(--text-tertiary); font-size: var(--text-xs); display: flex; align-items: center; justify-content: center; gap: 4px">
        Phantom Tac Toe v1.0.0 • Made with <span class="icon-xs" style="color:var(--neon-pink)">${iconHeart}</span>
      </div>
    </div>
  `;

  addSettingsStyles();

  // Events
  document.getElementById("player-name")?.addEventListener("change", (e) => {
    updateProfile({ name: e.target.value.trim() || "Player" });
    showToast("Name updated!", "check", 1500);
  });

  document.querySelectorAll(".avatar-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".avatar-pick-btn").forEach((b) => {
        b.classList.remove("active");
        b.style.border = "";
        b.style.boxShadow = "";
      });
      btn.classList.add("active");
      btn.style.border = "2px solid var(--neon-purple)";
      btn.style.boxShadow = "var(--shadow-neon-purple)";
      updateProfile({ avatar: parseInt(btn.dataset.avatarIndex, 10) });
      audio.playClick();
    });
  });

  // Theme selection
  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".theme-option")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateProfile({ activeTheme: btn.dataset.theme });
      audio.playClick();
      showToast(`${btn.dataset.theme} theme applied!`, "sparkle");
    });
  });

  // Frame selection
  document.querySelectorAll(".frame-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".frame-option")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateProfile({ activeFrame: btn.dataset.frame });
      audio.playClick();
      showToast(`${btn.dataset.frame} frame equipped!`, "sparkle");
    });
  });

  // Clerk auth buttons
  document
    .getElementById("btn-sign-in")
    ?.addEventListener("click", async () => {
      audio.playClick();
      await signIn();
    });

  document
    .getElementById("btn-sign-out")
    ?.addEventListener("click", async () => {
      audio.playClick();
      await signOut();
      showToast("Signed out", "check", 2000);
      renderSettings(container); // Re-render to update UI
    });

  document
    .getElementById("btn-manage-account")
    ?.addEventListener("click", () => {
      audio.playClick();
      openUserProfile();
    });

  document.getElementById("sound-toggle")?.addEventListener("change", (e) => {
    updateSettings({ soundEnabled: e.target.checked });
    audio.setEnabled(e.target.checked);
  });

  document.getElementById("music-toggle")?.addEventListener("change", (e) => {
    updateSettings({ musicEnabled: e.target.checked });
    audio.setMusicEnabled(e.target.checked);
  });

  document.querySelectorAll(".difficulty-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document
        .querySelectorAll(".difficulty-option")
        .forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      updateSettings({ difficulty: opt.dataset.diff });
      audio.playClick();
    });
  });

  document.getElementById("timer-toggle")?.addEventListener("change", (e) => {
    updateSettings({ timerEnabled: e.target.checked });
    document.getElementById("timer-duration-row").style.display = e.target
      .checked
      ? "flex"
      : "none";
  });

  document.getElementById("timer-duration")?.addEventListener("change", (e) => {
    updateSettings({ timerDuration: parseInt(e.target.value) });
  });

  document
    .getElementById("particles-toggle")
    ?.addEventListener("change", (e) => {
      updateSettings({ particlesEnabled: e.target.checked });
    });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Are you sure? This cannot be undone!")) {
      localStorage.removeItem("phantomtactoe_data");
      showToast("All data reset!", "check", 2000);
      renderSettings(container);
    }
  });
}

function addSettingsStyles() {
  if (document.getElementById("settings-styles")) return;
  const style = document.createElement("style");
  style.id = "settings-styles";
  style.textContent = `
    .toggle {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
      flex-shrink: 0;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
      transition: all var(--transition-base);
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: all var(--transition-base);
    }
    .toggle input:checked + .toggle-slider {
      background: var(--neon-purple);
    }
    .toggle input:checked + .toggle-slider::before {
      transform: translateX(22px);
    }
    .avatar-pick-btn {
      width: 100%;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 2px solid transparent;
      color: var(--text-secondary);
      padding: 6px;
    }
    .avatar-pick-btn:hover {
      color: var(--neon-purple);
      border-color: rgba(191, 90, 242, 0.3);
      transform: scale(1.1);
    }
    .avatar-pick-btn.active {
      color: var(--neon-purple);
    }
    .avatar-pick-btn .icon {
      width: 100%;
      height: 100%;
    }
    .theme-option, .frame-option {
      background: var(--bg-tertiary);
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--text-secondary);
    }
    .theme-option:hover, .frame-option:hover {
      border-color: rgba(191, 90, 242, 0.3);
      transform: translateY(-2px);
    }
    .theme-option.active, .frame-option.active {
      border-color: var(--neon-purple);
      color: var(--neon-purple);
      background: rgba(191, 90, 242, 0.1);
    }
    .theme-option.locked, .frame-option.locked {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }
    .theme-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--neon-purple);
    }
    .theme-gold .theme-dot { background: #ffd60a; }
    .theme-emerald .theme-dot { background: #30d158; }
    .theme-obsidian .theme-dot { background: #ffffff; }
    .theme-royal .theme-dot { background: #ff375f; }
  `;
  document.head.appendChild(style);
}
