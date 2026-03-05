/* ========================================
   Phantom Tac Toe - Game Page
   Main gameplay screen
   ======================================== */

import { GameScene } from "../engine/scene";
import { GameBoard } from "../engine/board";
import { PieceManager } from "../engine/pieces";
import { EffectsManager } from "../engine/effects";
import { InteractionHandler } from "../engine/interaction";
import {
  createGameState,
  makeMove,
  resetGame,
  startGame,
  PLAYERS,
  PHASES,
} from "../game/state";
import { getAIMove, getAIMoveDelay } from "../game/ai";
import { TurnTimer } from "../game/timer";
import {
  loadData,
  recordGameResult,
  addXP,
  getXPProgress,
  getSettings,
} from "../data/storage";
import { checkAchievements } from "../rewards/achievements";
import { multiplayer } from "../multiplayer/connection";
import { shareResult, shareChallenge } from "../utils/share";
import { audio } from "../utils/audio";
import { vibrateMove, vibrateWin, vibrateLose } from "../utils/haptics";
import {
  showToast,
  showAchievementToast,
  showXPToast,
  showLevelUpToast,
} from "../components/toast";
import { router } from "../core/Router";
import {
  iconArrowLeft,
  iconRefresh,
  iconShare,
  iconHome,
  iconTrophy,
  iconFrown,
  iconFire,
  iconRobot,
  iconSmile,
  iconLaugh,
  iconClap,
  iconClock,
  iconAlert,
  iconWifi,
  iconWifiOff,
  iconHeart,
  avatarIcons,
} from "../utils/icons";

import type { GameState, MoveResult, GameMode, Difficulty, Player } from "../game/state";
import type { GameScene as GameSceneType } from "../engine/scene";
import type { GameBoard as GameBoardType } from "../engine/board";
import type { PieceManager as PieceManagerType } from "../engine/pieces";
import type { EffectsManager as EffectsManagerType } from "../engine/effects";
import type { InteractionHandler as InteractionHandlerType } from "../engine/interaction";
import type { TurnTimer as TurnTimerType } from "../game/timer";

let gameScene: GameSceneType | null = null;
let board: GameBoardType | null = null;
let pieceManager: PieceManagerType | null = null;
let effects: EffectsManagerType | null = null;
let interaction: InteractionHandlerType | null = null;
let timer: TurnTimerType | null = null;
let gameState: GameState | null = null;
let aiThinking = false;
let isOnlineGame = false;
let onlinePlayer: Player | null = null; // Which player we are in online mode

export function renderGame(container: HTMLElement, params: Record<string, string>) {
  const mode = params.mode || "local";
  const settings = getSettings();
  const data = loadData();

  isOnlineGame = mode === "online";
  const isLocalNetwork = mode === "local-network";
  const showReactions = isOnlineGame; // Reactions only in online games

  // Guard: if online but not connected, redirect to lobby
  if (isOnlineGame && !multiplayer.connected) {
    router.navigate("/play/online/lobby");
    return;
  }

  gameState = createGameState({
    mode,
    difficulty: settings.difficulty,
    timerEnabled: settings.timerEnabled,
    timerDuration: settings.timerDuration,
  });

  container.innerHTML = `
    <div class="page game-page" id="game-page">
      <!-- Game Header -->
      <div class="game-header">
        <button class="btn btn-ghost btn-icon" id="btn-back" aria-label="Back to menu">${iconArrowLeft}</button>
        <div class="turn-indicator" id="turn-indicator">
          <span id="turn-text">X's Turn</span>
        </div>
        <div class="game-header-actions">
          ${mode === "online" ? `<div class="badge badge-green" id="connection-status"><span class="icon-xs">${iconWifi}</span> Connected</div>` : ""}
          ${isLocalNetwork ? `<div class="badge badge-green" id="connection-status"><span class="icon-xs">${iconWifi}</span> LAN</div>` : ""}
        </div>
      </div>

      <!-- Game Layout -->
      <div class="game-layout">
        <!-- Player 1 Panel (Left/Top) -->
        <div class="game-sidebar">
          <div class="player-panel player-x ${gameState.currentPlayer === "X" ? "active" : ""}" id="panel-x">
            <div class="profile-frame frame-${data.cosmetics.activeFrame || "none"}">
              <div class="player-avatar player-avatar-x" style="background: rgba(255,55,95,0.15); color: var(--neon-pink)">
                ${data.profile.avatarUrl 
                  ? `<img src="${data.profile.avatarUrl}" alt="avatar" class="avatar-img" />` 
                  : `<span class="avatar-symbol">✕</span>`}
              </div>
            </div>
            <div class="player-info">
              <div class="player-name" id="name-x">${mode === "solo" ? data.profile.name : "Player X"}</div>
              <div class="player-score">Score: <span id="score-x">0</span></div>
            </div>
          </div>
        </div>

        <!-- Game Center (3D Board) -->
        <div class="game-center">
          <div id="game-canvas-container"></div>
          
          <!-- Move Counter -->
          <div class="game-info-bar">
            <div class="move-counter">
              Move <span id="move-number">0</span>
              ${
                settings.timerEnabled
                  ? `
              <div class="timer-bar" id="timer-bar" style="margin-top:4px">
                <div class="progress-bar" style="height:4px">
                  <div class="progress-bar-fill" id="timer-fill" style="width:100%;background:var(--neon-green)"></div>
                </div>
              </div>
              `
                  : ""
              }
            </div>
            <div class="reaction-bar" ${!showReactions ? 'style="display:none"' : ''}>
              <button class="reaction-btn" data-reaction="smile" title="Smile">${iconSmile}</button>
              <button class="reaction-btn" data-reaction="fire" title="Fire">${iconFire}</button>
              <button class="reaction-btn" data-reaction="love" title="Love">${iconHeart}</button>
              <button class="reaction-btn" data-reaction="laugh" title="Laugh">${iconLaugh}</button>
              <button class="reaction-btn" data-reaction="clap" title="GG">${iconClap}</button>
              <button class="reaction-btn" data-reaction="frown" title="Rage">${iconFrown}</button>
            </div>
          </div>

          ${
            mode === "solo"
              ? `
          <div class="difficulty-selector" style="margin-top: var(--space-md)">
            <div class="difficulty-option ${settings.difficulty === "easy" ? "active" : ""}" data-diff="easy">Easy</div>
            <div class="difficulty-option ${settings.difficulty === "medium" ? "active" : ""}" data-diff="medium">Medium</div>
            <div class="difficulty-option ${settings.difficulty === "hard" ? "active" : ""}" data-diff="hard">Hard</div>
          </div>
          `
              : ""
          }
        </div>

        <!-- Player 2 Panel (Right/Bottom) -->
        <div class="game-sidebar">
          <div class="player-panel player-o" id="panel-o">
            <div class="player-avatar player-avatar-o" style="background: rgba(100,210,255,0.15); color: var(--neon-cyan)">
              ${mode === "solo" 
                ? `<span class="avatar-symbol">${iconRobot}</span>`
                : `<span class="avatar-symbol">○</span>`}
            </div>
            <div class="player-info">
              <div class="player-name" id="name-o">${mode === "solo" ? `AI Bot <span class="icon-xs">${iconRobot}</span>` : "Player O"}</div>
              <div class="player-score">Score: <span id="score-o">0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add game styles
  addGameStyles();

  // Initialize 3D scene
  const canvasContainer = document.getElementById("game-canvas-container");
  gameScene = new GameScene(canvasContainer);
  board = new GameBoard(gameScene);
  pieceManager = new PieceManager(gameScene);
  effects = new EffectsManager(gameScene);

  interaction = new InteractionHandler(
    gameScene,
    board,
    (cellIndex) => handleCellClick(cellIndex, mode),
    (cellIndex) => handleCellHover(cellIndex),
  );

  // Timer
  if (settings.timerEnabled) {
    timer = new TurnTimer(
      settings.timerDuration,
      (remaining, total) => updateTimerUI(remaining, total),
      () => handleTimeout(mode),
    );
  }

  // Start the game
  startGame(gameState);

  // If online mode, set up multiplayer
  if (mode === "online") {
    setupOnlineGame();
  }

  // If AI goes first (shouldn't normally, X always first, but just in case)
  if (mode === "solo" && gameState.currentPlayer === PLAYERS.O) {
    scheduleAIMove();
  }

  if (timer) timer.start();

  // Event listeners
  setupGameEvents(mode, settings);

  // Return cleanup function
  return () => {
    if (timer) timer.stop();
    if (interaction) interaction.dispose();
    if (effects) effects.dispose();
    if (pieceManager) pieceManager.dispose();
    if (board) board.dispose();
    if (gameScene) gameScene.dispose();
    if (isOnlineGame) multiplayer.disconnect();
  };
}

function handleCellClick(cellIndex: number, mode: string) {
  if (gameState.phase !== PHASES.PLAYING) return;
  if (aiThinking) return;

  // In online mode, only allow moves for our piece type
  if (isOnlineGame && gameState.currentPlayer !== onlinePlayer) return;

  // In solo mode, only allow moves when it's X's turn (player)
  if (mode === "solo" && gameState.currentPlayer !== PLAYERS.X) return;

  executeMove(cellIndex, mode);
}

function executeMove(cellIndex: number, mode: string) {
  const result: MoveResult = makeMove(gameState!, cellIndex);
  if (!result.valid) return;

  const player = result.won
    ? gameState.winner
    : gameState.currentPlayer === PLAYERS.X
      ? PLAYERS.O
      : PLAYERS.X;

  // Audio & haptics
  audio.playMove();
  vibrateMove();

  // Place piece in 3D
  const position = board.getCellPosition(cellIndex);
  const sparkleColor = player === PLAYERS.X ? 0xff375f : 0x64d2ff;

  pieceManager.placePiece(cellIndex, player, position);
  effects.createPlaceSparkle(position, sparkleColor);

  // Remove expired piece
  if (result.removedCell !== null && result.removedCell !== undefined) {
    const removedPos = board.getCellPosition(result.removedCell);
    pieceManager.removePiece(result.removedCell, true);
    if (removedPos) effects.createRemoveEffect(removedPos);
    audio.playExpire();
  }

  // Update ghost pieces
  updateGhostPieces();

  // Update UI
  updateGameUI();

  // Send move to opponent (online)
  if (isOnlineGame) {
    multiplayer.sendMove(cellIndex, result.moveNumber);
  }

  // Timer reset
  if (timer) timer.reset();

  if (result.won) {
    handleWin(result, mode);
  } else if (mode === "solo" && gameState.currentPlayer === PLAYERS.O) {
    scheduleAIMove();
  }
}

function handleWin(result: MoveResult, mode: string) {
  const winner = result.winner;

  // Win line
  board.showWinLine(result.winLine);

  // Explosion effects
  for (const cellIdx of result.winLine) {
    const pos = board.getCellPosition(cellIdx);
    if (pos) effects.createWinExplosion(pos);
  }

  // Audio & haptics
  let isPlayerWin = false;
  if (mode === "solo") {
    isPlayerWin = winner === PLAYERS.X;
  } else if (mode === "online") {
    isPlayerWin = winner === onlinePlayer;
  } else {
    // Local 2P (shared screen)
    isPlayerWin = true;
  }

  if (isPlayerWin) {
    audio.playWin();
    vibrateWin();
  } else {
    audio.playLose();
    vibrateLose();
  }

  // Disable interaction
  interaction.setEnabled(false);
  if (timer) timer.stop();

  // Record result
  const data = loadData();
  let xpGained = 0;

  if (mode === "solo") {
    const won = winner === PLAYERS.X;
    recordGameResult("solo", won);
    if (won) {
      xpGained = 50;
      const streakBonus = Math.min(data.stats.currentStreak, 5) * 10;
      xpGained += streakBonus;
    }
  } else if (mode === "online") {
    const won = winner === onlinePlayer;
    recordGameResult("online", won);
    xpGained = won ? 40 : 10;
  } else {
    // Local 2P
    recordGameResult("local", true);
    xpGained = 20;
  }

  if (xpGained > 0) {
    const prevLevel = data.profile.level;
    const profile = addXP(xpGained);
    showXPToast(xpGained);

    if (profile.level > prevLevel) {
      setTimeout(() => {
        showLevelUpToast(profile.level);
        audio.playLevelUp();
      }, 1000);
    }
  }

  // Check achievements
  const updatedData = loadData();
  const newAchievements = checkAchievements(updatedData.stats);
  newAchievements.forEach((a, i) => {
    setTimeout(
      () => {
        showAchievementToast(a);
        audio.playAchievement();
      },
      1500 + i * 1000,
    );
  });

  // Show result modal
  setTimeout(() => showResultModal(winner, mode), 1200);

  // Notify opponent of game over (online)
  if (isOnlineGame) {
    multiplayer.sendGameOver(winner, result.winLine);
  }
}

function scheduleAIMove() {
  aiThinking = true;
  const delay = getAIMoveDelay(gameState.difficulty);

  setTimeout(() => {
    if (gameState.phase !== PHASES.PLAYING) {
      aiThinking = false;
      return;
    }

    const move = getAIMove(gameState, gameState.difficulty);
    if (move !== null) {
      executeMove(move, "solo");
    }
    aiThinking = false;
  }, delay);
}

function handleTimeout(mode: string) {
  // On timeout, make random move
  const validMoves = [];
  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === null) validMoves.push(i);
  }
  if (validMoves.length > 0) {
    const randomMove =
      validMoves[Math.floor(Math.random() * validMoves.length)];
    executeMove(randomMove, mode);
    showToast("Time's up! Auto-move", "clock", 2000);
  }
}

function handleCellHover(cellIndex: number | null) {
  if (gameState.phase !== PHASES.PLAYING) return;
  if (aiThinking) return;

  if (cellIndex !== null && gameState.board[cellIndex] !== null) {
    board.hideHover();
    return;
  }

  board.showHover(cellIndex, gameState.currentPlayer);
}

function updateGhostPieces() {
  // Clear all ghost states first
  for (let i = 0; i < 9; i++) {
    pieceManager.setGhost(i, false);
  }

  // Set ghost on expiring cell
  if (gameState.expiringCell !== null) {
    pieceManager.setGhost(gameState.expiringCell, true);
  }
}

function updateGameUI() {
  // Turn indicator
  const turnIndicator = document.getElementById("turn-indicator");
  const turnText = document.getElementById("turn-text");
  if (turnIndicator && turnText) {
    turnIndicator.className = `turn-indicator turn-${gameState.currentPlayer.toLowerCase()}`;
    turnText.textContent = `${gameState.currentPlayer}'s Turn`;
  }

  // Player panels
  const panelX = document.getElementById("panel-x");
  const panelO = document.getElementById("panel-o");
  if (panelX)
    panelX.classList.toggle("active", gameState.currentPlayer === PLAYERS.X);
  if (panelO)
    panelO.classList.toggle("active", gameState.currentPlayer === PLAYERS.O);

  // Scores
  const scoreX = document.getElementById("score-x");
  const scoreO = document.getElementById("score-o");
  if (scoreX) scoreX.textContent = gameState.scores.X;
  if (scoreO) scoreO.textContent = gameState.scores.O;

  // Move counter
  const moveNum = document.getElementById("move-number");
  if (moveNum) moveNum.textContent = gameState.moveNumber;
}

function updateTimerUI(remaining: number, total: number) {
  const fill = document.getElementById("timer-fill");
  if (!fill) return;

  const percent = (remaining / total) * 100;
  fill.style.width = `${percent}%`;

  if (percent < 30) {
    fill.style.background = "var(--neon-pink)";
  } else if (percent < 60) {
    fill.style.background = "var(--neon-gold)";
  } else {
    fill.style.background = "var(--neon-green)";
  }
}

function showResultModal(winner: string, mode: string) {
  const data = loadData();
  const isPlayerWin = mode === "solo" ? winner === PLAYERS.X : true;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal animate-pop">
      <div style="margin-bottom: var(--space-md); color: ${isPlayerWin ? "var(--neon-gold)" : "var(--neon-pink)"}">
        ${isPlayerWin ? iconTrophy : iconFrown}
      </div>
      <h2 style="background: var(--gradient-main); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        ${isPlayerWin ? "Victory!" : "Defeat!"}
      </h2>
      <p>${winner} wins${mode === "solo" ? (isPlayerWin ? " — nice one!" : " — try again!") : " this round!"}</p>
      
      <div style="margin: var(--space-lg) 0">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">${data.stats.currentStreak}</div>
            <div class="stat-label">Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${data.stats.wins}</div>
            <div class="stat-label">Total Wins</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: var(--space-md); flex-direction: column">
        <button class="btn btn-primary btn-lg btn-block" id="btn-rematch">${iconRefresh} Rematch</button>
        <button class="btn btn-secondary btn-block" id="btn-share-result">${iconShare} Share Result</button>
        <button class="btn btn-ghost btn-block" id="btn-home">${iconHome} Home</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("btn-rematch").addEventListener("click", () => {
    audio.playClick();
    overlay.remove();
    startRematch(mode);
  });

  document.getElementById("btn-share-result").addEventListener("click", () => {
    audio.playClick();
    shareResult({
      won: isPlayerWin,
      opponent: mode === "solo" ? "AI" : "Friend",
      streak: data.stats.currentStreak,
      level: data.profile.level,
    });
    showToast("Copied to clipboard!", "check", 2000);
  });

  document.getElementById("btn-home").addEventListener("click", () => {
    audio.playClick();
    overlay.remove();
    router.navigate("/");
  });
}

function startRematch(mode: string) {
  resetGame(gameState);
  pieceManager.clearAllPieces();
  board.clearWinLine();
  interaction.setEnabled(true);
  updateGameUI();

  if (timer) timer.start();

  if (mode === "solo" && gameState.currentPlayer === PLAYERS.O) {
    scheduleAIMove();
  }

  if (isOnlineGame) {
    multiplayer.sendRematch();
  }
}

function setupOnlineGame() {
  onlinePlayer = multiplayer.isHost ? PLAYERS.X : PLAYERS.O;

  const nameX = document.getElementById("name-x");
  const nameO = document.getElementById("name-o");
  const data = loadData();

  if (multiplayer.isHost) {
    if (nameX) nameX.textContent = data.profile.name + " (You)";
    if (nameO) nameO.textContent = multiplayer.opponentName || "Opponent";
  } else {
    if (nameX) nameX.textContent = multiplayer.opponentName || "Opponent";
    if (nameO) nameO.textContent = data.profile.name + " (You)";

    // Apply local frame to O
    const panelO = document.getElementById("panel-o");
    if (panelO) {
      const frameEl = panelO.querySelector(".profile-frame");
      if (frameEl) {
        frameEl.className = `profile-frame frame-${data.profile.activeFrame || "none"}`;
      }
    }
  }

  // Send our info
  multiplayer.sendPlayerInfo(data.profile.name, data.profile.activeFrame);

  // Disable interaction until both players ready
  interaction.setEnabled(false);

  // Track readiness
  let localReady = false;
  let remoteReady = false;
  let rematchPending = false;

  function checkBothReady() {
    if (localReady && remoteReady) {
      interaction.setEnabled(true);
      showToast(
        "Game on! " +
          (onlinePlayer === PLAYERS.X ? "Your turn" : "Opponent's turn"),
        "check",
        2000,
      );
    }
  }

  // Signal ready after a brief delay (ensures connection is stable)
  setTimeout(() => {
    localReady = true;
    multiplayer.sendReady();
    checkBothReady();
  }, 500);

  multiplayer.onMessage = (msg) => {
    switch (msg.type) {
      case "move":
        // Validate: only accept moves when it's the opponent's turn
        if (gameState.currentPlayer === onlinePlayer) {
          console.warn("Ignoring out-of-turn move from opponent");
          break;
        }
        // Validate: cell must be empty
        if (gameState.board[msg.cellIndex] !== null) {
          console.warn("Ignoring move on occupied cell:", msg.cellIndex);
          break;
        }
        executeMove(msg.cellIndex, "online");
        break;

      case "reaction":
        showFloatingReaction(msg.reaction);
        break;

      case "rematch":
        // Opponent wants a rematch — auto-accept and start
        rematchPending = false;
        localReady = false;
        remoteReady = false;
        startRematch("online");
        multiplayer.sendRematchAccept();
        // Re-enter ready flow
        setTimeout(() => {
          localReady = true;
          multiplayer.sendReady();
          checkBothReady();
        }, 500);
        break;

      case "rematchAccept":
        // Our rematch request was accepted
        rematchPending = false;
        localReady = false;
        remoteReady = false;
        startRematch("online");
        setTimeout(() => {
          localReady = true;
          multiplayer.sendReady();
          checkBothReady();
        }, 500);
        break;

      case "playerInfo":
        updateOpponentName(msg.name, msg.frame);
        break;

      case "ready":
        remoteReady = true;
        checkBothReady();
        break;

      case "gameOver":
        // Opponent reports game over (in case we missed it)
        if (gameState.phase === PHASES.PLAYING) {
          console.log("Received gameOver from opponent:", msg.winner);
        }
        break;
    }
  };

  multiplayer.onDisconnected = () => {
    const statusEl = document.getElementById("connection-status");
    if (statusEl) {
      statusEl.innerHTML = `<span class="icon-xs">${iconWifiOff}</span> Disconnected`;
      statusEl.className = "badge badge-pink";
    }
    showToast("Opponent disconnected", "alert", 3000);
    interaction.setEnabled(false);
  };
}

function updateOpponentName(name: string, frame = "none") {
  const nameX = document.getElementById("name-x");
  const nameO = document.getElementById("name-o");
  const panelX = document.getElementById("panel-x");
  const panelO = document.getElementById("panel-o");

  if (multiplayer.isHost) {
    if (nameO) nameO.textContent = name;
    if (panelO) {
      const frameEl = panelO.querySelector(".profile-frame");
      if (frameEl) frameEl.className = `profile-frame frame-${frame}`;
    }
  } else {
    if (nameX) nameX.textContent = name;
    if (panelX) {
      const frameEl = panelX.querySelector(".profile-frame");
      if (frameEl) frameEl.className = `profile-frame frame-${frame}`;
    }
  }
  multiplayer.opponentName = name;
  multiplayer.opponentFrame = frame;
}

function showFloatingReaction(reactionKey: string): void {
  const reactionMap: Record<string, string> = {
    smile: iconSmile,
    fire: iconFire,
    frown: iconFrown,
    laugh: iconLaugh,
    clap: iconClap,
    love: iconHeart,
  };

  const colorMap: Record<string, string> = {
    smile: 'var(--neon-purple)',
    fire: '#ff9500',
    frown: 'var(--neon-cyan)',
    laugh: 'var(--neon-gold)',
    clap: 'var(--neon-green)',
    love: 'var(--neon-pink)',
  };

  const icon = reactionMap[reactionKey] || iconSmile;
  const color = colorMap[reactionKey] || 'var(--neon-cyan)';
  const baseLeft = 25 + Math.random() * 50;

  // Main reaction
  const el = document.createElement('div');
  el.className = 'floating-reaction';
  el.innerHTML = icon;
  el.style.left = `${baseLeft}%`;
  el.style.top = '55%';
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);

  // Trailing particles (smaller, offset, delayed)
  for (let i = 0; i < 2; i++) {
    const trail = document.createElement('div');
    trail.className = 'floating-reaction trail';
    trail.innerHTML = icon;
    trail.style.left = `${baseLeft + (Math.random() - 0.5) * 20}%`;
    trail.style.top = `${58 + Math.random() * 8}%`;
    trail.style.color = color;
    trail.style.animationDelay = `${0.15 + i * 0.2}s`;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 2800);
  }
}

function setupGameEvents(mode: string, _settings: any) {
  // Back button
  document.getElementById("btn-back")?.addEventListener("click", () => {
    audio.playClick();
    if (isOnlineGame) multiplayer.disconnect();
    router.navigate("/");
  });

  // Reaction buttons (online only — with bounce animation)
  document.querySelectorAll<HTMLElement>(".reaction-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reaction = btn.dataset.reaction || 'smile';
      audio.playClick();

      // Add bounce animation class
      btn.classList.add('reacting');
      setTimeout(() => btn.classList.remove('reacting'), 500);

      showFloatingReaction(reaction);
      if (isOnlineGame) {
        multiplayer.sendReaction(reaction);
      }
    });
  });

  // Difficulty selector
  document.querySelectorAll(".difficulty-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document
        .querySelectorAll(".difficulty-option")
        .forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      gameState.difficulty = opt.dataset.diff;
      audio.playClick();
    });
  });
}

function addGameStyles() {
  if (document.getElementById("game-styles")) return;
  const style = document.createElement("style");
  style.id = "game-styles";
  style.textContent = `
    .game-page {
      max-width: 900px;
    }
    .game-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .game-header-actions {
      display: flex;
      gap: var(--space-sm);
    }
    .game-center {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .game-layout {
      display: flex;
      gap: var(--space-xl);
      align-items: center;
      justify-content: center;
    }
    .player-panels {
      display: flex;
      gap: var(--space-md);
    }
    .floating-reaction {
      position: fixed;
      pointer-events: none;
      z-index: var(--z-toast);
      animation: floatUp 1.5s ease forwards;
      color: var(--neon-cyan);
      width: 48px;
      height: 48px;
    }
    .floating-reaction .icon {
      width: 48px;
      height: 48px;
    }
    @media (max-width: 768px) {
      .game-layout {
        flex-direction: column;
        gap: var(--space-md);
      }
      .game-sidebar {
        width: 100%;
      }
      .game-sidebar:first-child .player-panel,
      .game-sidebar:last-child .player-panel {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}
