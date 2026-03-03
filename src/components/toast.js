/* ========================================
   InfiniToe - Toast Notification System
   ======================================== */

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, icon = "✨", duration = 3000) {
  const c = ensureContainer();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
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
    `<strong>Achievement Unlocked!</strong><br>${achievement.icon} ${achievement.name}`,
    "🏆",
    4000,
  );
}

export function showXPToast(amount) {
  showToast(`+${amount} XP`, "⚡", 2000);
}

export function showCoinsToast(amount) {
  showToast(`+${amount} coins`, "🪙", 2000);
}

export function showLevelUpToast(level) {
  showToast(`Level Up! You're now Level ${level}`, "🎉", 4000);
}
