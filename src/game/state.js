/* ========================================
   Phantom Tac Toe - Game State Machine
   Infinite Tic-Tac-Toe with sliding window
   ======================================== */

export const PLAYERS = { X: "X", O: "O" };
export const PHASES = {
  WAITING: "WAITING",
  PLAYING: "PLAYING",
  WON: "WON",
  PAUSED: "PAUSED",
};
export const MAX_PIECES_PER_PLAYER = 3; // Each player can have max 3 pieces (total 5-6 on board at transition)
export const TOTAL_VISIBLE_MOVES = 6; // Transition point where oldest starts fading

const WIN_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export function createGameState(config = {}) {
  return {
    board: Array(9).fill(null), // Each cell: { player, moveNumber } or null
    currentPlayer: PLAYERS.X,
    phase: PHASES.WAITING,
    moveHistory: [], // Array of { cellIndex, player, moveNumber }
    moveNumber: 0,
    winner: null,
    winLine: null,
    scores: { X: 0, O: 0 },
    mode: config.mode || "local", // 'solo', 'local', 'online'
    difficulty: config.difficulty || "medium",
    timerEnabled: config.timerEnabled || false,
    timerDuration: config.timerDuration || 15,
    timeRemaining: config.timerDuration || 15,
    expiringCell: null, // Cell about to be removed (for ghost animation)
    lastRemovedCell: null,
  };
}

export function makeMove(state, cellIndex) {
  // Validate move
  if (state.phase !== PHASES.PLAYING)
    return { valid: false, reason: "Game not in play" };
  if (cellIndex < 0 || cellIndex > 8)
    return { valid: false, reason: "Invalid cell" };
  if (state.board[cellIndex] !== null)
    return { valid: false, reason: "Cell occupied" };

  const player = state.currentPlayer;
  state.moveNumber++;

  // Track the move
  const move = { cellIndex, player, moveNumber: state.moveNumber };
  state.moveHistory.push(move);

  // Place the piece
  state.board[cellIndex] = { player, moveNumber: state.moveNumber };

  // Check if we need to remove oldest piece for this player
  const playerMoves = state.moveHistory.filter((m) => m.player === player);
  let removedCell = null;

  if (playerMoves.length > MAX_PIECES_PER_PLAYER) {
    // Remove the oldest move for this player
    const oldestMove = playerMoves[0];
    removedCell = oldestMove.cellIndex;
    state.board[oldestMove.cellIndex] = null;
    state.lastRemovedCell = removedCell;

    // Remove from history
    const histIdx = state.moveHistory.indexOf(oldestMove);
    if (histIdx !== -1) state.moveHistory.splice(histIdx, 1);
  }

  // Determine next expiring cell (for ghost effect preview)
  const nextPlayer = player === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
  const nextPlayerMoves = state.moveHistory.filter(
    (m) => m.player === nextPlayer,
  );
  state.expiringCell =
    nextPlayerMoves.length >= MAX_PIECES_PER_PLAYER
      ? nextPlayerMoves[0].cellIndex
      : null;

  // Check for win
  const winResult = checkWin(state.board, player);
  if (winResult) {
    state.phase = PHASES.WON;
    state.winner = player;
    state.winLine = winResult;
    state.scores[player]++;
    return {
      valid: true,
      won: true,
      winner: player,
      winLine: winResult,
      removedCell,
      cellIndex,
      moveNumber: state.moveNumber,
    };
  }

  // Switch turn
  state.currentPlayer = nextPlayer;

  // Reset timer
  state.timeRemaining = state.timerDuration;

  return {
    valid: true,
    won: false,
    removedCell,
    cellIndex,
    nextPlayer: state.currentPlayer,
    expiringCell: state.expiringCell,
    moveNumber: state.moveNumber,
  };
}

function checkWin(board, player) {
  for (const line of WIN_LINES) {
    if (line.every((i) => board[i] && board[i].player === player)) {
      return line;
    }
  }
  return null;
}

export function getValidMoves(state) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (state.board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

export function resetGame(state) {
  state.board = Array(9).fill(null);
  state.currentPlayer = PLAYERS.X;
  state.phase = PHASES.PLAYING;
  state.moveHistory = [];
  state.moveNumber = 0;
  state.winner = null;
  state.winLine = null;
  state.expiringCell = null;
  state.lastRemovedCell = null;
  state.timeRemaining = state.timerDuration;
  return state;
}

export function startGame(state) {
  state.phase = PHASES.PLAYING;
  state.timeRemaining = state.timerDuration;
  return state;
}

export function pauseGame(state) {
  state.phase = PHASES.PAUSED;
  return state;
}

export function serializeState(state) {
  return JSON.stringify({
    board: state.board,
    currentPlayer: state.currentPlayer,
    phase: state.phase,
    moveHistory: state.moveHistory,
    moveNumber: state.moveNumber,
    scores: state.scores,
    expiringCell: state.expiringCell,
  });
}

export function deserializeState(state, data) {
  const parsed = JSON.parse(data);
  Object.assign(state, parsed);
  return state;
}
