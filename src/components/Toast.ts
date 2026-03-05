/* ========================================
   Phantom Tac Toe - Toast Notification System
   ======================================== */

import {
  iconSparkle,
  iconTrophy,
  iconBolt,
  iconCoin,
  iconCheck,
  iconCheckCircle,
  iconAlert,
  iconFire,
  iconClock,
  iconGift,
} from "../utils/icons";

let container = null;

// Map short icon names to SVG icons
const iconMap = {
  sparkle: iconSparkle,
  trophy: iconTrophy,
  bolt: iconBolt,
  coin: iconCoin,
  check: iconCheckCircle,
  alert: iconAlert,
  fire: iconFire,
  clock: iconClock,
  gift: iconGift,
  error: iconAlert,
};

function ensureContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, icon = "sparkle", duration = 3000) {
  const c = ensureContainer();

  const iconHtml = iconMap[icon] || iconSparkle;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-icon">${iconHtml}</span>
    <span class="toast-message">${message}</span>
  `;

  c.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

export function showAchievementToast(achievement) {
  showToast(
    `<strong>Achievement Unlocked!</strong><br>${achievement.name}`,
    "trophy",
    4000,
  );
}

export function showXPToast(amount) {
  showToast(`+${amount} XP`, "bolt", 2000);
}

export function showCoinsToast(amount) {
  showToast(`+${amount} coins`, "coin", 2000);
}

export function showLevelUpToast(level) {
  showToast(`Level Up! You're now Level ${level}`, "sparkle", 4000);
}
