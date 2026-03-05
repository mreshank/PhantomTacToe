/* ========================================
   Phantom Tac Toe - Game State Machine
   Infinite Tic-Tac-Toe with sliding window
   ======================================== */

export type Player = 'X' | 'O';

export enum GamePhase {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  PAUSED = 'PAUSED',
}

export type GameMode = 'solo' | 'local' | 'online' | 'local-network';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CellState {
  player: Player;
  moveNumber: number;
}

export interface Move {
  cellIndex: number;
  player: Player;
  moveNumber: number;
}

export interface MoveResult {
  valid: boolean;
  reason?: string;
  won?: boolean;
  winner?: Player;
  winLine?: number[];
  removedCell?: number | null;
  cellIndex?: number;
  nextPlayer?: Player;
  expiringCell?: number | null;
  moveNumber?: number;
}

export interface GameConfig {
  mode?: GameMode;
  difficulty?: Difficulty;
  timerEnabled?: boolean;
  timerDuration?: number;
}

export interface GameState {
  board: (CellState | null)[];
  currentPlayer: Player;
  phase: GamePhase;
  moveHistory: Move[];
  moveNumber: number;
  winner: Player | null;
  winLine: number[] | null;
  scores: Record<Player, number>;
  mode: GameMode;
  difficulty: Difficulty;
  timerEnabled: boolean;
  timerDuration: number;
  timeRemaining: number;
  expiringCell: number | null;
  lastRemovedCell: number | null;
}

export const PLAYERS: Record<string, Player> = { X: 'X', O: 'O' };
export const PHASES = GamePhase;
export const MAX_PIECES_PER_PLAYER = 3;
export const TOTAL_VISIBLE_MOVES = 6;

const WIN_LINES: number[][] = [
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

export function createGameState(config: GameConfig = {}): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    phase: GamePhase.WAITING,
    moveHistory: [],
    moveNumber: 0,
    winner: null,
    winLine: null,
    scores: { X: 0, O: 0 },
    mode: config.mode || 'local',
    difficulty: config.difficulty || 'medium',
    timerEnabled: config.timerEnabled || false,
    timerDuration: config.timerDuration || 15,
    timeRemaining: config.timerDuration || 15,
    expiringCell: null,
    lastRemovedCell: null,
  };
}

export function makeMove(state: GameState, cellIndex: number): MoveResult {
  // Validate move
  if (state.phase !== GamePhase.PLAYING)
    return { valid: false, reason: 'Game not in play' };
  if (cellIndex < 0 || cellIndex > 8)
    return { valid: false, reason: 'Invalid cell' };
  if (state.board[cellIndex] !== null)
    return { valid: false, reason: 'Cell occupied' };

  const player = state.currentPlayer;
  state.moveNumber++;

  // Track the move
  const move: Move = { cellIndex, player, moveNumber: state.moveNumber };
  state.moveHistory.push(move);

  // Place the piece
  state.board[cellIndex] = { player, moveNumber: state.moveNumber };

  // Check if we need to remove oldest piece for this player
  const playerMoves = state.moveHistory.filter((m) => m.player === player);
  let removedCell: number | null = null;

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
  const nextPlayer: Player = player === 'X' ? 'O' : 'X';
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
    state.phase = GamePhase.WON;
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

function checkWin(board: (CellState | null)[], player: Player): number[] | null {
  for (const line of WIN_LINES) {
    if (line.every((i) => board[i] && board[i]!.player === player)) {
      return line;
    }
  }
  return null;
}

export function getValidMoves(state: GameState): number[] {
  const moves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (state.board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

export function resetGame(state: GameState): GameState {
  state.board = Array(9).fill(null);
  state.currentPlayer = 'X';
  state.phase = GamePhase.PLAYING;
  state.moveHistory = [];
  state.moveNumber = 0;
  state.winner = null;
  state.winLine = null;
  state.expiringCell = null;
  state.lastRemovedCell = null;
  state.timeRemaining = state.timerDuration;
  return state;
}

export function startGame(state: GameState): GameState {
  state.phase = GamePhase.PLAYING;
  state.timeRemaining = state.timerDuration;
  return state;
}

export function pauseGame(state: GameState): GameState {
  state.phase = GamePhase.PAUSED;
  return state;
}

export function serializeState(state: GameState): string {
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

export function deserializeState(state: GameState, data: string): GameState {
  const parsed = JSON.parse(data);
  Object.assign(state, parsed);
  return state;
}
