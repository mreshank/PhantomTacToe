/* ========================================
   Phantom Tac Toe - Friends Page
   ======================================== */

import { loadData } from "../data/storage";
import { router } from "../core/Router";
import { audio } from "../utils/audio";
import { showToast } from "../components/toast";
import {
  iconUser,
  iconSearch,
  iconCheck,
  iconXCircle,
  iconHeart,
  iconGlobe,
  iconBolt,
  iconRocket,
  avatarIcons,
} from "../utils/icons";
import { multiplayer } from "../multiplayer/connection";

let chatTarget: string | null = null;

export async function renderFriends(container: HTMLElement) {
  const data = loadData();
  const clerkId = data.profile.clerkUserId;

  if (!clerkId) {
    container.innerHTML = `
      <div class="page friends-page">
        <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
          <span class="icon-header" style="color:var(--neon-cyan)">${iconHeart}</span> Friends
        </h1>
        <div class="card" style="text-align: center; padding: var(--space-3xl)">
          <p style="color: var(--text-secondary); margin-bottom: var(--space-md)">Sign in to add friends, message them, and invite them to matches!</p>
          <button class="btn btn-primary btn-lg" onclick="window.location.hash='#/settings'">${iconUser} Go to Settings to Sign In</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="page friends-page">
      <h1 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xl); display: flex; align-items: center; gap: var(--space-sm)">
        <span class="icon-header" style="color:var(--neon-cyan)">${iconHeart}</span> Friends
      </h1>

      <!-- Search Bar -->
      <div class="card" style="margin-bottom: var(--space-lg); display: flex; gap: var(--space-sm); align-items: center">
        <span class="icon-inline" style="color: var(--text-tertiary)">${iconSearch}</span>
        <input type="text" id="friend-search" placeholder="Search players by name..." 
          style="flex: 1; background: transparent; border: none; color: var(--text-primary); outline: none; font-size: var(--text-base)" />
        <button class="btn btn-sm btn-secondary" id="btn-search-go">Search</button>
      </div>

      <!-- Search Results (hidden by default) -->
      <div id="search-results" style="display: none; margin-bottom: var(--space-lg)">
        <div class="section-header">
          <h2 class="section-title">Search Results</h2>
          <button class="btn btn-ghost btn-sm" id="btn-close-search">${iconXCircle} Close</button>
        </div>
        <div id="search-list" style="display: flex; flex-direction: column; gap: var(--space-sm)"></div>
      </div>

      <!-- Pending Requests -->
      <div id="pending-section" style="display: none; margin-bottom: var(--space-lg)">
        <div class="section-header">
          <h2 class="section-title">${iconBolt} Pending Requests</h2>
          <span class="badge badge-gold" id="pending-count">0</span>
        </div>
        <div id="pending-list" style="display: flex; flex-direction: column; gap: var(--space-sm)"></div>
      </div>

      <!-- Friends List -->
      <div class="section-header">
        <h2 class="section-title">Your Friends</h2>
      </div>
      <div id="friends-list" style="display: flex; flex-direction: column; gap: var(--space-sm)">
        <div style="text-align: center; padding: var(--space-2xl); color: var(--text-tertiary)">Loading friends...</div>
      </div>

      <!-- Chat Panel (hidden by default) -->
      <div id="chat-panel" style="display: none">
        <div class="section-header" style="margin-top: var(--space-xl)">
          <h2 class="section-title" id="chat-target-name">Chat</h2>
          <button class="btn btn-ghost btn-sm" id="btn-close-chat">${iconXCircle} Close</button>
        </div>
        <div class="card" style="max-height: 300px; overflow-y: auto; margin-bottom: var(--space-sm)" id="chat-messages">
          <div style="text-align: center; color: var(--text-tertiary)">Loading messages...</div>
        </div>
        <div style="display: flex; gap: var(--space-sm)">
          <input type="text" id="chat-input" placeholder="Type a message..." 
            style="flex: 1" maxlength="200" />
          <button class="btn btn-primary btn-sm" id="btn-send-msg">${iconRocket}</button>
        </div>
      </div>
    </div>
  `;

  addFriendsStyles();

  // Load data from Convex
  await loadFriendsData(clerkId, container);

  // Search
  const searchInput = document.getElementById("friend-search") as HTMLInputElement;
  const searchBtn = document.getElementById("btn-search-go") as HTMLButtonElement;

  searchBtn?.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q.length >= 2) doSearch(q, clerkId);
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (q.length >= 2) doSearch(q, clerkId);
    }
  });

  document.getElementById("btn-close-search")?.addEventListener("click", () => {
    const results = document.getElementById("search-results");
    if (results) results.style.display = "none";
  });

  document.getElementById("btn-close-chat")?.addEventListener("click", () => {
    const chat = document.getElementById("chat-panel");
    if (chat) chat.style.display = "none";
    chatTarget = null;
  });

  document.getElementById("btn-send-msg")?.addEventListener("click", () => {
    sendChatMessage(clerkId);
  });

  document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage(clerkId);
  });
}

async function loadFriendsData(clerkId: string, container: HTMLElement) {
  const fl = document.getElementById("friends-list");
  if (!fl) return;

  if (!(window as any).convexClient) {
    fl.innerHTML = `
      <div style="text-align: center; padding: var(--space-2xl); color: var(--text-tertiary)">
        Cloud connection required to view friends.
      </div>
    `;
    return;
  }

  try {
    // Load friends
    const friends: any[] = await (window as any).convexClient.query("friends:getFriends", {
      clerkId,
    });
    renderFriendsList(friends, clerkId);

    // Load pending requests
    const pending: any[] = await (window as any).convexClient.query(
      "friends:getPendingRequests",
      { clerkId },
    );
    renderPendingRequests(pending, clerkId);
  } catch (err) {
    console.error("Failed to load friends:", err);
    fl.innerHTML = `
      <div style="text-align: center; padding: var(--space-2xl); color: var(--text-tertiary)">
        Failed to load friends. Make sure Convex is running.
      </div>
    `;
  }
}

function renderFriendsList(friends: any[], myClerkId: string) {
  const listEl = document.getElementById("friends-list") as HTMLElement;
  if (!listEl) return;

  if (!friends.length) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: var(--space-2xl); color: var(--text-tertiary)">
        <div style="font-size: 2rem; margin-bottom: var(--space-md)">${iconHeart}</div>
        <p>No friends yet. Search for players above!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = friends
    .map(
      (f) => `
    <div class="friend-entry card" data-clerk-id="${f.clerkId}">
      <div class="profile-frame frame-${f.activeFrame || "none"}" style="border-radius: 50%">
        <div class="player-avatar" style="width: 40px; height: 40px; background: var(--bg-tertiary); color: var(--neon-purple); border-radius: 50%; overflow: hidden">
          ${avatarIcons[f.avatarIndex || 0]}
        </div>
      </div>
      <div style="flex: 1; min-width: 0">
        <div style="font-family: var(--font-display); font-weight: 600; display: flex; align-items: center; gap: var(--space-xs)">
          ${f.name}
          <span class="online-dot ${f.isOnline ? "online" : "offline"}"></span>
        </div>
        <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Lv.${f.level} • ${f.wins} wins</div>
      </div>
      <div class="friend-actions">
        <button class="btn btn-sm btn-secondary btn-chat" data-id="${f.clerkId}" data-name="${f.name}" title="Message">${iconRocket}</button>
        <button class="btn btn-sm btn-primary btn-invite" data-id="${f.clerkId}" data-name="${f.name}" title="Invite to Match">${iconGlobe}</button>
      </div>
    </div>
  `,
    )
    .join("");

  // Chat buttons
  listEl.querySelectorAll(".btn-chat").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.playClick();
      const { id, name } = (btn as HTMLElement).dataset;
      if (id && name) openChat(id, name, myClerkId);
    });
  });

  // Invite buttons
  listEl.querySelectorAll(".btn-invite").forEach((btn) => {
    btn.addEventListener("click", async () => {
      audio.playClick();
      try {
        const { id, name } = (btn as HTMLElement).dataset;
        if (!id) return;
        const code = await multiplayer.createRoom();
        await (window as any).convexClient.mutation("messages:inviteToMatch", {
          fromClerkId: myClerkId,
          toClerkId: id,
          roomCode: code,
          fromName: loadData().profile.name,
        });
        showToast(`Invite sent to ${name}!`, "check");
        router.navigate("/play/online");
      } catch (err) {
        showToast("Failed to create invite", "alert");
      }
    });
  });
}

function renderPendingRequests(requests: any[], myClerkId: string) {
  const section = document.getElementById("pending-section") as HTMLElement;
  const listEl = document.getElementById("pending-list") as HTMLElement;
  const countEl = document.getElementById("pending-count") as HTMLElement;

  if (!section || !listEl || !countEl) return;

  if (!requests.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  countEl.textContent = requests.length.toString();

  listEl.innerHTML = requests
    .map(
      (r) => `
    <div class="friend-entry card">
      <div class="player-avatar" style="width: 36px; height: 36px; background: var(--bg-tertiary); color: var(--neon-purple); border-radius: 50%; overflow: hidden">
        ${avatarIcons[r.fromAvatarIndex || 0]}
      </div>
      <div style="flex: 1">
        <div style="font-family: var(--font-display); font-weight: 600">${r.fromName}</div>
        <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Wants to be friends</div>
      </div>
      <button class="btn btn-sm btn-primary btn-accept" data-id="${r._id}">${iconCheck}</button>
      <button class="btn btn-sm btn-ghost btn-decline" data-id="${r._id}">${iconXCircle}</button>
    </div>
  `,
    )
    .join("");

  listEl.querySelectorAll(".btn-accept").forEach((btn) => {
    btn.addEventListener("click", async () => {
      audio.playClick();
      try {
        const rid = (btn as HTMLElement).dataset.id;
        await (window as any).convexClient.mutation("friends:acceptFriendRequest", {
          requestId: rid,
        });
        showToast("Friend added!", "check");
        const pc = document.getElementById("page-container");
        if (pc) renderFriends(pc);
      } catch (err) {
        showToast("Failed to accept", "alert");
      }
    });
  });

  listEl.querySelectorAll(".btn-decline").forEach((btn) => {
    btn.addEventListener("click", async () => {
      audio.playClick();
      try {
        const rid = (btn as HTMLElement).dataset.id;
        await (window as any).convexClient.mutation("friends:declineFriendRequest", {
          requestId: rid,
        });
        (btn.closest(".friend-entry") as HTMLElement).remove();
      } catch (err) {
        showToast("Failed", "alert");
      }
    });
  });
}

async function doSearch(query: string, myClerkId: string) {
  if (!(window as any).convexClient) {
    showToast("Cloud connection required", "alert");
    return;
  }

  const resultsSection = document.getElementById("search-results") as HTMLElement;
  const searchList = document.getElementById("search-list") as HTMLElement;
  if (!resultsSection || !searchList) return;

  resultsSection.style.display = "block";
  searchList.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: var(--space-md)">Searching...</div>`;

  try {
    const results: any[] = await (window as any).convexClient.query("friends:searchUsers", {
      query,
      myClerkId,
    });

    if (!results.length) {
      searchList.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: var(--space-md)">No players found</div>`;
      return;
    }

    searchList.innerHTML = results
      .map(
        (u) => `
      <div class="friend-entry card">
        <div class="player-avatar" style="width: 36px; height: 36px; background: var(--bg-tertiary); color: var(--neon-purple); border-radius: 50%; overflow: hidden">
          ${avatarIcons[u.avatarIndex || 0]}
        </div>
        <div style="flex: 1">
          <div style="font-family: var(--font-display); font-weight: 600">${u.name}</div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary)">Lv.${u.level}</div>
        </div>
        <button class="btn btn-sm btn-primary btn-add-friend" data-id="${u.clerkId}">${iconHeart} Add</button>
      </div>
    `,
      )
      .join("");

    searchList.querySelectorAll(".btn-add-friend").forEach((btn) => {
      btn.addEventListener("click", async () => {
        audio.playClick();
        try {
          const tid = (btn as HTMLElement).dataset.id;
          const result = await (window as any).convexClient.mutation(
            "friends:sendFriendRequest",
            {
              fromClerkId: myClerkId,
              toClerkId: tid,
              fromName: loadData().profile.name,
            },
          );
          if (result.autoAccepted) {
            showToast("You're now friends!", "check");
          } else {
            showToast("Friend request sent!", "check");
          }
          (btn as HTMLButtonElement).textContent = "Sent ✓";
          (btn as HTMLButtonElement).disabled = true;
        } catch (err: any) {
          showToast(err.message || "Failed to send request", "alert");
        }
      });
    });
  } catch (err) {
    searchList.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: var(--space-md)">Search failed</div>`;
  }
}

async function openChat(targetClerkId: string, targetName: string, myClerkId: string) {
  chatTarget = targetClerkId;
  const panel = document.getElementById("chat-panel") as HTMLElement;
  const nameEl = document.getElementById("chat-target-name") as HTMLElement;
  const messagesEl = document.getElementById("chat-messages") as HTMLElement;

  if (!panel || !nameEl || !messagesEl) return;

  panel.style.display = "block";
  nameEl.textContent = `Chat with ${targetName}`;
  messagesEl.innerHTML = `<div style="text-align: center; color: var(--text-tertiary)">Loading...</div>`;

  if (!(window as any).convexClient) return;

  try {
    const messages: any[] = await (window as any).convexClient.query(
      "messages:getConversation",
      {
        clerkId1: myClerkId,
        clerkId2: targetClerkId,
      },
    );

    if (!messages.length) {
      messagesEl.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: var(--space-md)">No messages yet. Say hi!</div>`;
      return;
    }

    messagesEl.innerHTML = messages
      .map((m) => {
        const isMine = m.fromClerkId === myClerkId;
        const isInvite = m.type === "invite";
        return `
        <div class="chat-msg ${isMine ? "mine" : "theirs"} ${isInvite ? "invite" : ""}">
          <div class="chat-bubble">${m.text}${isInvite && !isMine && m.roomCode ? `<br><button class="btn btn-sm btn-primary join-invite-btn" data-code="${m.roomCode}" style="margin-top: 4px">${iconRocket} Join Match</button>` : ""}</div>
          <div class="chat-time">${new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      `;
      })
      .join("");

    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Join invite buttons
    messagesEl.querySelectorAll(".join-invite-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        audio.playClick();
        try {
          const code = (btn as HTMLElement).dataset.code;
          if (code) {
             await multiplayer.joinRoom(code);
             router.navigate("/play/online");
          }
        } catch (err) {
          showToast("Room not found or expired", "alert");
        }
      });
    });
  } catch (err) {
    messagesEl.innerHTML = `<div style="text-align: center; color: var(--text-tertiary)">Failed to load messages</div>`;
  }
}

async function sendChatMessage(myClerkId: string) {
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const text = input.value.trim();
  if (!text || !chatTarget || !(window as any).convexClient) return;

  input.value = "";
  try {
    await (window as any).convexClient.mutation("messages:sendMessage", {
      fromClerkId: myClerkId,
      toClerkId: chatTarget,
      text,
    });
    // Re-load chat
    const nameEl = document.getElementById("chat-target-name");
    const targetName = nameEl?.textContent?.replace("Chat with ", "") || "";
    openChat(chatTarget, targetName, myClerkId);
  } catch (err) {
    showToast("Failed to send message", "alert");
  }
}

function addFriendsStyles() {
  if (document.getElementById("friends-styles")) return;
  const style = document.createElement("style");
  style.id = "friends-styles";
  style.textContent = `
    .friend-entry {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
    }
    .friend-actions {
      display: flex;
      gap: var(--space-xs);
      flex-shrink: 0;
    }
    .online-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .online-dot.online {
      background: var(--neon-green);
      box-shadow: 0 0 8px var(--neon-green-glow);
    }
    .online-dot.offline {
      background: var(--text-tertiary);
    }
    .chat-msg {
      margin-bottom: var(--space-sm);
    }
    .chat-msg.mine {
      text-align: right;
    }
    .chat-msg.theirs {
      text-align: left;
    }
    .chat-bubble {
      display: inline-block;
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-lg);
      max-width: 80%;
      word-wrap: break-word;
      font-size: var(--text-sm);
    }
    .chat-msg.mine .chat-bubble {
      background: rgba(191, 90, 242, 0.2);
      color: var(--text-primary);
    }
    .chat-msg.theirs .chat-bubble {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .chat-msg.invite .chat-bubble {
      background: rgba(100, 210, 255, 0.15);
      border: 1px solid rgba(100, 210, 255, 0.3);
    }
    .chat-time {
      font-size: 10px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);
}
