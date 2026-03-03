/* ========================================
   Phantom Tac Toe - Online Lobby Page
   Public/Private Rooms + Quick Join
   ======================================== */

import { multiplayer } from "../multiplayer/connection.js";
import { loadData } from "../data/storage.js";
import { shareChallenge } from "../utils/share.js";
import { audio } from "../utils/audio.js";
import { showToast } from "../components/toast.js";
import { router } from "../router.js";
import {
  iconArrowLeft,
  iconGlobe,
  iconDice,
  iconShare,
  iconRocket,
  iconCheckCircle,
  iconXCircle,
  iconAlert,
  iconBolt,
  iconStar,
  iconUser,
} from "../utils/icons.js";

let publicRoomsPollInterval = null;

export function renderOnlineLobby(container) {
  const data = loadData();

  container.innerHTML = `
    <div class="page online-lobby-page" id="online-lobby">
      <button class="btn btn-ghost btn-icon" id="btn-back-lobby" aria-label="Back" style="margin-bottom: var(--space-lg)">${iconArrowLeft}</button>
      
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); text-align: center; margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-sm)">
        <span class="icon-header">${iconGlobe}</span> Online Battle
      </h1>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--space-2xl)">
        Create or join a room to battle other players
      </p>

      <div style="max-width: 500px; margin: 0 auto;">

        <!-- Quick Join -->
        <div class="card" style="margin-bottom: var(--space-lg); text-align: center; border: 1px solid var(--neon-cyan); box-shadow: var(--shadow-neon-cyan)">
          <h3 style="margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-xs)">
            ${iconBolt} Quick Join
          </h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
            Instantly jump into a public game
          </p>
          <button class="btn btn-primary btn-lg btn-block" id="btn-quick-join" style="background: var(--gradient-main); box-shadow: var(--shadow-neon-purple)">
            ${iconRocket} Quick Join
          </button>
        </div>

        <!-- Create Room -->
        <div class="card" style="margin-bottom: var(--space-lg); text-align: center;">
          <h3 style="margin-bottom: var(--space-md)">${iconDice} Create a Room</h3>
          
          <!-- Public/Private Toggle -->
          <div class="room-type-toggle" style="display: flex; gap: var(--space-xs); margin-bottom: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-lg); padding: 4px">
            <button class="room-type-btn active" data-type="public" id="btn-type-public" style="flex:1; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-display); font-weight: 600; transition: all var(--transition-fast)">
              ${iconGlobe} Public
            </button>
            <button class="room-type-btn" data-type="private" id="btn-type-private" style="flex:1; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-display); font-weight: 600; transition: all var(--transition-fast)">
              ${iconUser} Private
            </button>
          </div>
          <p id="room-type-desc" style="color: var(--text-tertiary); font-size: var(--text-xs); margin-bottom: var(--space-md)">
            Public rooms are listed for anyone to join
          </p>

          <button class="btn btn-primary btn-lg btn-block" id="btn-create-room">
            ${iconDice} Create Room
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
            ${iconShare} Share Room Link
          </button>
        </div>

        <div style="text-align: center; color: var(--text-tertiary); margin: var(--space-lg) 0">— or —</div>

        <!-- Join by Code -->
        <div class="card" style="text-align: center; margin-bottom: var(--space-lg)">
          <h3 style="margin-bottom: var(--space-md)">Join by Code</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md)">
            Enter a room code from a friend
          </p>
          <input type="text" id="join-code-input" placeholder="Enter 6-letter code" 
            style="text-align: center; text-transform: uppercase; font-size: var(--text-xl); 
            font-family: var(--font-display); font-weight: 700; letter-spacing: 0.15em;
            width: 100%; margin-bottom: var(--space-md)"
            maxlength="6" autocomplete="off" spellcheck="false" />
          <button class="btn btn-primary btn-lg btn-block" id="btn-join-room">
            ${iconRocket} Join Room
          </button>
        </div>

        <!-- Public Rooms Browser -->
        <div class="section-header">
          <h2 class="section-title">${iconGlobe} Open Rooms</h2>
          <button class="btn btn-ghost btn-sm" id="btn-refresh-rooms">${iconDice} Refresh</button>
        </div>
        <div id="public-rooms-list" style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-xl)">
          <div style="text-align: center; padding: var(--space-2xl); color: var(--text-tertiary)">
            Loading open rooms...
          </div>
        </div>

      </div>
    </div>
  `;

  addLobbyStyles();
  let isPublicRoom = true;

  // Back
  document.getElementById("btn-back-lobby")?.addEventListener("click", () => {
    audio.playClick();
    cleanupPolling();
    router.navigate("/");
  });

  // Room type toggle
  document.getElementById("btn-type-public")?.addEventListener("click", () => {
    isPublicRoom = true;
    updateRoomTypeUI(true);
  });

  document.getElementById("btn-type-private")?.addEventListener("click", () => {
    isPublicRoom = false;
    updateRoomTypeUI(false);
  });

  // Quick Join
  document
    .getElementById("btn-quick-join")
    ?.addEventListener("click", async () => {
      audio.playClick();
      const btn = document.getElementById("btn-quick-join");
      btn.innerHTML = "Finding match...";
      btn.disabled = true;

      try {
        let room = null;
        if (window.convexClient) {
          room = await window.convexClient.query("rooms:quickJoin");
        }

        if (room) {
          await multiplayer.joinRoom(room.code);
          if (window.convexClient) {
            await window.convexClient.mutation("rooms:joinRoom", {
              code: room.code,
            });
          }
          showToast("Connected! Starting game...", "check", 2000);
          cleanupPolling();
          setTimeout(() => router.navigate("/play/online"), 1000);
        } else {
          // No rooms available — create a public one
          showToast("No open rooms. Creating one for you...", "alert", 2000);
          isPublicRoom = true;
          document.getElementById("btn-create-room")?.click();
        }
      } catch (err) {
        showToast("Quick join failed", "alert", 3000);
        btn.innerHTML = `${iconRocket} Quick Join`;
        btn.disabled = false;
      }
    });

  // Create Room
  document
    .getElementById("btn-create-room")
    ?.addEventListener("click", async () => {
      audio.playClick();
      const createBtn = document.getElementById("btn-create-room");
      createBtn.innerHTML = "Creating...";
      createBtn.disabled = true;

      try {
        const code = await multiplayer.createRoom();

        // Register in Convex
        if (window.convexClient && data.profile.clerkUserId) {
          try {
            await window.convexClient.mutation("rooms:createRoom", {
              code,
              hostClerkId: data.profile.clerkUserId,
              hostName: data.profile.name,
              hostLevel: data.profile.level || 1,
              isPublic: isPublicRoom,
            });
          } catch (e) {
            console.warn("Failed to register room in Convex:", e);
          }
        }

        // Show room code
        createBtn.closest(".card").style.display = "none";
        const roomCreated = document.getElementById("room-created");
        roomCreated.style.display = "block";

        const codeDisplay = document.getElementById("room-code-display");
        codeDisplay.innerHTML = code
          .split("")
          .map((c) => `<div class="room-code-char">${c}</div>`)
          .join("");

        // Wait for opponent
        multiplayer.onConnected = () => {
          showToast("Opponent connected! Starting game...", "check", 3000);
          cleanupPolling();
          if (window.convexClient) {
            window.convexClient
              .mutation("rooms:joinRoom", { code })
              .catch(() => {});
          }
          setTimeout(() => router.navigate("/play/online"), 1000);
        };
      } catch (err) {
        showToast("Failed to create room", "alert", 3000);
        createBtn.innerHTML = `${iconDice} Create Room`;
        createBtn.disabled = false;
      }
    });

  // Share Room
  document.getElementById("btn-share-room")?.addEventListener("click", () => {
    audio.playClick();
    shareChallenge(multiplayer.roomCode);
    showToast("Link copied!", "check", 2000);
  });

  // Join by Code
  document
    .getElementById("btn-join-room")
    ?.addEventListener("click", async () => {
      const input = document.getElementById("join-code-input");
      const code = input.value.trim().toUpperCase();

      if (code.length !== 6) {
        showToast("Enter a 6-letter code", "alert", 2000);
        return;
      }

      audio.playClick();
      const joinBtn = document.getElementById("btn-join-room");
      joinBtn.innerHTML = "Joining...";
      joinBtn.disabled = true;

      try {
        await multiplayer.joinRoom(code);
        if (window.convexClient) {
          window.convexClient
            .mutation("rooms:joinRoom", { code })
            .catch(() => {});
        }
        showToast("Connected! Starting game...", "check", 2000);
        cleanupPolling();
        setTimeout(() => router.navigate("/play/online"), 1000);
      } catch (err) {
        showToast("Room not found or connection failed", "alert", 3000);
        joinBtn.innerHTML = `${iconRocket} Join Room`;
        joinBtn.disabled = false;
      }
    });

  // Refresh public rooms
  document
    .getElementById("btn-refresh-rooms")
    ?.addEventListener("click", () => {
      audio.playClick();
      loadPublicRooms();
    });

  // Load public rooms initially and poll
  loadPublicRooms();
  publicRoomsPollInterval = setInterval(loadPublicRooms, 8000);
}

async function loadPublicRooms() {
  const listEl = document.getElementById("public-rooms-list");
  if (!listEl) return;

  if (!window.convexClient) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: var(--space-lg); color: var(--text-tertiary)">
        Cloud connection required to see public rooms
      </div>
    `;
    return;
  }

  try {
    const rooms = await window.convexClient.query("rooms:listPublicRooms");

    if (!rooms.length) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: var(--space-lg); color: var(--text-tertiary)">
          <p>No open rooms right now</p>
          <p style="font-size: var(--text-xs); margin-top: var(--space-xs)">Create one or use Quick Join!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = rooms
      .map((room) => {
        const waitTime = Math.max(
          0,
          Math.floor((Date.now() - room.createdAt) / 1000),
        );
        const waitStr =
          waitTime < 60 ? `${waitTime}s` : `${Math.floor(waitTime / 60)}m`;

        return `
        <div class="card public-room-entry" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); cursor: pointer" data-code="${room.code}">
          <div class="player-avatar" style="width: 36px; height: 36px; background: var(--bg-tertiary); color: var(--neon-purple)">
            ${iconUser}
          </div>
          <div style="flex: 1; min-width: 0">
            <div style="font-family: var(--font-display); font-weight: 600">${room.hostName}</div>
            <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Lv.${room.hostLevel} • Waiting ${waitStr}</div>
          </div>
          <button class="btn btn-sm btn-primary btn-join-public" data-code="${room.code}">${iconRocket} Join</button>
        </div>
      `;
      })
      .join("");

    // Join handlers
    listEl.querySelectorAll(".btn-join-public").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        audio.playClick();
        const code = btn.dataset.code;
        btn.innerHTML = "Joining...";
        btn.disabled = true;

        try {
          await multiplayer.joinRoom(code);
          if (window.convexClient) {
            window.convexClient
              .mutation("rooms:joinRoom", { code })
              .catch(() => {});
          }
          showToast("Connected! Starting game...", "check", 2000);
          cleanupPolling();
          setTimeout(() => router.navigate("/play/online"), 1000);
        } catch (err) {
          showToast("Failed to join room", "alert", 3000);
          btn.innerHTML = `${iconRocket} Join`;
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: var(--space-lg); color: var(--text-tertiary)">
        Failed to load rooms
      </div>
    `;
  }
}

function updateRoomTypeUI(isPublic) {
  const pubBtn = document.getElementById("btn-type-public");
  const privBtn = document.getElementById("btn-type-private");
  const desc = document.getElementById("room-type-desc");

  if (isPublic) {
    pubBtn.classList.add("active");
    privBtn.classList.remove("active");
    desc.textContent = "Public rooms are listed for anyone to join";
  } else {
    privBtn.classList.add("active");
    pubBtn.classList.remove("active");
    desc.textContent = "Private rooms require the room code to join";
  }
}

function cleanupPolling() {
  if (publicRoomsPollInterval) {
    clearInterval(publicRoomsPollInterval);
    publicRoomsPollInterval = null;
  }
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

function addLobbyStyles() {
  if (document.getElementById("lobby-styles")) return;
  const style = document.createElement("style");
  style.id = "lobby-styles";
  style.textContent = `
    .room-type-btn {
      background: transparent;
      color: var(--text-secondary);
    }
    .room-type-btn.active {
      background: var(--neon-purple);
      color: white;
      box-shadow: var(--shadow-neon-purple);
    }
    .public-room-entry {
      transition: all var(--transition-fast);
    }
    .public-room-entry:hover {
      transform: translateY(-2px);
      border-color: rgba(100, 210, 255, 0.3);
    }
  `;
  document.head.appendChild(style);
}
