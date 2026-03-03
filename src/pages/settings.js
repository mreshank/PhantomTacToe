/* ========================================
   InfiniToe - Settings Page
   ======================================== */

import { loadData, updateSettings, updateProfile } from "../data/storage.js";
import { audio } from "../utils/audio.js";
import { showToast } from "../components/toast.js";
import {
  iconSettings,
  iconTrash,
  iconHeart,
  avatarIcons,
} from "../utils/icons.js";

export function renderSettings(container) {
  const data = loadData();
  const settings = data.settings;

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

  container.innerHTML = `
    <div class="page settings-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header">${iconSettings}</span> Settings
      </h1>

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
              <button class="avatar-pick-btn ${avatarMap[i] === data.profile.avatar ? "active" : ""}" data-avatar="${avatarMap[i]}" data-index="${i}"
                title="${avatarLabels[i]}"
                style="${avatarMap[i] === data.profile.avatar ? "border: 2px solid var(--neon-purple); box-shadow: var(--shadow-neon-purple)" : ""}">
                ${svg}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <!-- Audio -->
      <div class="section-header">
        <h2 class="section-title">Audio</h2>
      </div>
      <div class="card" style="margin-bottom: var(--space-xl)">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md)">
          <span>Sound Effects</span>
          <label class="toggle">
            <input type="checkbox" id="sound-toggle" ${settings.soundEnabled ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>Music</span>
          <label class="toggle">
            <input type="checkbox" id="music-toggle" ${settings.musicEnabled ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
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
        InfiniToe v1.0.0 • Made with <span class="icon-xs" style="color:var(--neon-pink)">${iconHeart}</span>
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
      updateProfile({ avatar: btn.dataset.avatar });
      audio.playClick();
    });
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
      localStorage.removeItem("infinitoe_data");
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
  `;
  document.head.appendChild(style);
}
