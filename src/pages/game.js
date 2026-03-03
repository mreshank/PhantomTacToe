/* ========================================
   InfiniToe - Game Page
   Main gameplay screen
   ======================================== */

import { GameScene } from "../engine/scene.js";
import { GameBoard } from "../engine/board.js";
import { PieceManager } from "../engine/pieces.js";
import { EffectsManager } from "../engine/effects.js";
import { InteractionHandler } from "../engine/interaction.js";
import {
  createGameState,
  makeMove,
  resetGame,
  startGame,
  PLAYERS,
  PHASES,
} from "../game/state.js";
import { getAIMove, getAIMoveDelay } from "../game/ai.js";
import { TurnTimer } from "../game/timer.js";
import {
  loadData,
  recordGameResult,
  addXP,
  getXPProgress,
  getSettings,
} from "../data/storage.js";
import { checkAchievements } from "../rewards/achievements.js";
import { multiplayer } from "../multiplayer/connection.js";
import { shareResult, shareChallenge } from "../utils/share.js";
import { audio } from "../utils/audio.js";
import { vibrateMove, vibrateWin, vibrateLose } from "../utils/haptics.js";
import {
  showToast,
  showAchievementToast,
  showXPToast,
  showLevelUpToast,
} from "../components/toast.js";
import { router } from "../router.js";
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
} from "../utils/icons.js";

let gameScene, board, pieceManager, effects, interaction, timer;
let gameState;
let aiThinking = false;
let isOnlineGame = false;
let onlinePlayer = null; // Which player we are in online mode

export function renderGame(container, params) {
  const mode = params.mode || "local";
  const settings = getSettings();
  const data = loadData();

  isOnlineGame = mode === "online";

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
        </div>
      </div>

      <!-- Game Layout -->
      <div class="game-layout">
        <!-- Player 1 Panel (Left/Top) -->
        <div class="game-sidebar">
          <div class="player-panel player-x ${gameState.currentPlayer === "X" ? "active" : ""}" id="panel-x">
            <div class="player-avatar" style="background: rgba(255,55,95,0.15); color: var(--neon-pink)">✕</div>
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
            <div class="reaction-bar">
              <button class="reaction-btn" data-reaction="smile" title="Smile">${iconSmile}</button>
              <button class="reaction-btn" data-reaction="fire" title="Fire">${iconFire}</button>
              <button class="reaction-btn" data-reaction="frown" title="Rage">${iconFrown}</button>
              <button class="reaction-btn" data-reaction="laugh" title="Laugh">${iconLaugh}</button>
              <button class="reaction-btn" data-reaction="clap" title="Clap">${iconClap}</button>
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
            <div class="player-avatar" style="background: rgba(100,210,255,0.15); color: var(--neon-cyan)">○</div>
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

function handleCellClick(cellIndex, mode) {
  if (gameState.phase !== PHASES.PLAYING) return;
  if (aiThinking) return;

  // In online mode, only allow moves for our piece type
  if (isOnlineGame && gameState.currentPlayer !== onlinePlayer) return;

  // In solo mode, only allow moves when it's X's turn (player)
  if (mode === "solo" && gameState.currentPlayer !== PLAYERS.X) return;

  executeMove(cellIndex, mode);
}

function executeMove(cellIndex, mode) {
  const result = makeMove(gameState, cellIndex);
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

function handleWin(result, mode) {
  const winner = result.winner;

  // Win line
  board.showWinLine(result.winLine);

  // Explosion effects
  for (const cellIdx of result.winLine) {
    const pos = board.getCellPosition(cellIdx);
    if (pos) effects.createWinExplosion(pos);
  }

  // Audio & haptics
  const isPlayerWin =
    (mode === "solo" && winner === PLAYERS.X) || mode !== "solo";
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
  } else {
    // For local, count as a game for the winning player
    recordGameResult(mode, true);
    xpGained = 30;
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

function handleTimeout(mode) {
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

function handleCellHover(cellIndex) {
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

function updateTimerUI(remaining, total) {
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

function showResultModal(winner, mode) {
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

function startRematch(mode) {
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
  }

  // Send our info
  multiplayer.sendPlayerInfo(data.profile.name);

  multiplayer.onMessage = (msg) => {
    switch (msg.type) {
      case "move":
        if (gameState.currentPlayer !== onlinePlayer) {
          executeMove(msg.cellIndex, "online");
        }
        break;
      case "reaction":
        showFloatingReaction(msg.reaction);
        break;
      case "rematch":
        startRematch("online");
        break;
      case "playerInfo":
        updateOpponentName(msg.name);
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
  };
}

function updateOpponentName(name) {
  const nameX = document.getElementById("name-x");
  const nameO = document.getElementById("name-o");
  if (multiplayer.isHost) {
    if (nameO) nameO.textContent = name;
  } else {
    if (nameX) nameX.textContent = name;
  }
  multiplayer.opponentName = name;
}

function showFloatingReaction(reactionKey) {
  const reactionMap = {
    smile: iconSmile,
    fire: iconFire,
    frown: iconFrown,
    laugh: iconLaugh,
    clap: iconClap,
  };
  const el = document.createElement("div");
  el.className = "floating-reaction";
  el.innerHTML = reactionMap[reactionKey] || iconSmile;
  el.style.left = `${30 + Math.random() * 40}%`;
  el.style.top = "60%";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function setupGameEvents(mode, settings) {
  // Back button
  document.getElementById("btn-back")?.addEventListener("click", () => {
    audio.playClick();
    if (isOnlineGame) multiplayer.disconnect();
    router.navigate("/");
  });

  // Reaction buttons (replaced emoji buttons)
  document.querySelectorAll(".reaction-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reaction = btn.dataset.reaction;
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
