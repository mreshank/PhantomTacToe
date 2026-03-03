/* ========================================
   InfiniToe - Online Lobby Page
   Create/Join room
   ======================================== */

import { multiplayer } from "../multiplayer/connection.js";
import { shareChallenge } from "../utils/share.js";
import { audio } from "../utils/audio.js";
import { showToast } from "../components/toast.js";
import { router } from "../router.js";

export function renderOnlineLobby(container) {
  container.innerHTML = `
    <div class="page online-lobby-page" id="online-lobby">
      <button class="btn btn-ghost btn-icon" id="btn-back-lobby" aria-label="Back" style="margin-bottom: var(--space-lg)">←</button>
      
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); text-align: center; margin-bottom: var(--space-sm)">
        🌐 Online Battle
      </h1>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-2xl)">
        Challenge a friend via peer-to-peer connection
      </p>

      <div style="max-width: 400px; margin: 0 auto;">
        <!-- Create Room -->
        <div class="card" style="margin-bottom: var(--space-lg); text-align: center;">
          <h3 style="margin-bottom: var(--space-md)">Create a Room</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-lg)">
            Generate a room code and share it with a friend
          </p>
          <button class="btn btn-primary btn-lg btn-block" id="btn-create-room">
            🎲 Create Room
          </button>
        </div>

        <!-- Room Created State (hidden initially) -->
        <div class="card" id="room-created" style="display: none; text-align: center; margin-bottom: var(--space-lg)">
          <h3 style="margin-bottom: var(--space-md)">Your Room Code</h3>
          <div class="room-code" id="room-code-display"></div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: var(--space-md) 0">
            Waiting for opponent to join...
          </p>
          <div class="loader-dots" style="margin-bottom: var(--space-md)">
            <span style="color: var(--neon-purple); animation: pulse-glow 1.5s infinite">●</span>
            <span style="color: var(--neon-cyan); animation: pulse-glow 1.5s 0.3s infinite">●</span>
            <span style="color: var(--neon-pink); animation: pulse-glow 1.5s 0.6s infinite">●</span>
          </div>
          <button class="btn btn-secondary btn-block" id="btn-share-room">
            📤 Share Room Link
          </button>
        </div>

        <div style="text-align: center; color: var(--text-tertiary); margin: var(--space-lg) 0">— or —</div>

        <!-- Join Room -->
        <div class="card" style="text-align: center;">
          <h3 style="margin-bottom: var(--space-md)">Join a Room</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-lg)">
            Enter the room code from your friend
          </p>
          <input type="text" id="join-code-input" placeholder="Enter 6-letter code" 
            style="text-align: center; text-transform: uppercase; font-size: var(--text-xl); 
            font-family: var(--font-display); font-weight: 700; letter-spacing: 0.15em;
            width: 100%; margin-bottom: var(--space-md)"
            maxlength="6" autocomplete="off" spellcheck="false" />
          <button class="btn btn-primary btn-lg btn-block" id="btn-join-room">
            🚀 Join Room
          </button>
        </div>
      </div>
    </div>
  `;

  // Events
  document.getElementById("btn-back-lobby")?.addEventListener("click", () => {
    audio.playClick();
    router.navigate("/");
  });

  document
    .getElementById("btn-create-room")
    ?.addEventListener("click", async () => {
      audio.playClick();
      const createBtn = document.getElementById("btn-create-room");
      createBtn.textContent = "Creating...";
      createBtn.disabled = true;

      try {
        const code = await multiplayer.createRoom();

        // Show room code
        document
          .getElementById("btn-create-room")
          .closest(".card").style.display = "none";
        const roomCreated = document.getElementById("room-created");
        roomCreated.style.display = "block";

        const codeDisplay = document.getElementById("room-code-display");
        codeDisplay.innerHTML = code
          .split("")
          .map((c) => `<div class="room-code-char">${c}</div>`)
          .join("");

        // Wait for opponent
        multiplayer.onConnected = () => {
          showToast("Opponent connected! 🎮", "✅", 3000);
          setTimeout(() => router.navigate("/play/online"), 1000);
        };
      } catch (err) {
        showToast("Failed to create room", "❌", 3000);
        createBtn.textContent = "🎲 Create Room";
        createBtn.disabled = false;
      }
    });

  document.getElementById("btn-share-room")?.addEventListener("click", () => {
    audio.playClick();
    shareChallenge(multiplayer.roomCode);
    showToast("Link copied! 📋", "✅", 2000);
  });

  document
    .getElementById("btn-join-room")
    ?.addEventListener("click", async () => {
      const input = document.getElementById("join-code-input");
      const code = input.value.trim().toUpperCase();

      if (code.length !== 6) {
        showToast("Enter a 6-letter code", "⚠️", 2000);
        return;
      }

      audio.playClick();
      const joinBtn = document.getElementById("btn-join-room");
      joinBtn.textContent = "Joining...";
      joinBtn.disabled = true;

      try {
        await multiplayer.joinRoom(code);
        showToast("Connected! Starting game...", "✅", 2000);
        setTimeout(() => router.navigate("/play/online"), 1000);
      } catch (err) {
        showToast("Room not found or connection failed", "❌", 3000);
        joinBtn.textContent = "🚀 Join Room";
        joinBtn.disabled = false;
      }
    });
}

// Auto-join from URL (e.g. #/join/ABC123)
export function renderJoinRoom(container, params) {
  const code = params.code;
  if (code) {
    renderOnlineLobby(container);
    const input = document.getElementById("join-code-input");
    if (input) {
      input.value = code;
      // Auto-click join
      setTimeout(() => {
        document.getElementById("btn-join-room")?.click();
      }, 500);
    }
  } else {
    renderOnlineLobby(container);
  }
}
