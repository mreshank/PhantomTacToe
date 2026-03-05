/* ========================================
   Phantom Tac Toe - AI Engine
   Minimax with alpha-beta for infinite mode
   ======================================== */

import { type Player, type GameState, type CellState, type Move, type Difficulty, MAX_PIECES_PER_PLAYER } from './state';

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinForPlayer(board: (CellState | null)[], player: Player): boolean {
  for (const line of WIN_LINES) {
    if (line.every((i) => board[i] && board[i]!.player === player)) {
      return true;
    }
  }
  return false;
}

function getEmptyCells(board: (CellState | null)[]): number[] {
  const cells: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) cells.push(i);
  }
  return cells;
}

interface SimulationResult {
  board: (CellState | null)[];
  history: Move[];
  removedCell: number | null;
}

function simulateMove(
  board: (CellState | null)[],
  moveHistory: Move[],
  cellIndex: number,
  player: Player,
  moveNumber: number,
): SimulationResult {
  const newBoard = board.map((c) => (c ? { ...c } : null));
  const newHistory = [...moveHistory, { cellIndex, player, moveNumber }];

  newBoard[cellIndex] = { player, moveNumber };

  // Check if this player needs to remove oldest
  const playerMoves = newHistory.filter((m) => m.player === player);
  let removedCell: number | null = null;
  if (playerMoves.length > MAX_PIECES_PER_PLAYER) {
    const oldest = playerMoves[0];
    newBoard[oldest.cellIndex] = null;
    removedCell = oldest.cellIndex;
    const idx = newHistory.indexOf(oldest);
    newHistory.splice(idx, 1);
  }

  return { board: newBoard, history: newHistory, removedCell };
}

function evaluateBoard(board: (CellState | null)[], aiPlayer: Player): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  if (checkWinForPlayer(board, aiPlayer)) return 100;
  if (checkWinForPlayer(board, humanPlayer)) return -100;

  let score = 0;

  // Evaluate each line
  for (const line of WIN_LINES) {
    let aiCount = 0;
    let humanCount = 0;
    for (const i of line) {
      if (board[i]) {
        if (board[i]!.player === aiPlayer) aiCount++;
        else humanCount++;
      }
    }

    // Favorable positions
    if (aiCount === 2 && humanCount === 0) score += 10;
    if (humanCount === 2 && aiCount === 0) score -= 10;
    if (aiCount === 1 && humanCount === 0) score += 1;
    if (humanCount === 1 && aiCount === 0) score -= 1;
  }

  // Prefer center
  if (board[4] && board[4]!.player === aiPlayer) score += 3;

  return score;
}

function minimax(
  board: (CellState | null)[],
  moveHistory: Move[],
  moveNumber: number,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  if (checkWinForPlayer(board, aiPlayer)) return 100 - depth;
  if (checkWinForPlayer(board, humanPlayer)) return -100 + depth;
  if (depth >= 6) return evaluateBoard(board, aiPlayer);

  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return 0;

  const currentPlayer: Player = isMaximizing ? aiPlayer : humanPlayer;

  if (isMaximizing) {
    let best = -Infinity;
    for (const cell of emptyCells) {
      const sim = simulateMove(
        board,
        moveHistory,
        cell,
        currentPlayer,
        moveNumber + 1,
      );
      const val = minimax(
        sim.board,
        sim.history,
        moveNumber + 1,
        depth + 1,
        false,
        alpha,
        beta,
        aiPlayer,
      );
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const cell of emptyCells) {
      const sim = simulateMove(
        board,
        moveHistory,
        cell,
        currentPlayer,
        moveNumber + 1,
      );
      const val = minimax(
        sim.board,
        sim.history,
        moveNumber + 1,
        depth + 1,
        true,
        alpha,
        beta,
        aiPlayer,
      );
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getAIMove(state: GameState, difficulty: Difficulty = 'medium'): number | null {
  const aiPlayer = state.currentPlayer;
  const emptyCells = getEmptyCells(state.board);

  if (emptyCells.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      return getEasyMove(state, aiPlayer, emptyCells);
    case 'medium':
      return getMediumMove(state, aiPlayer, emptyCells);
    case 'hard':
      return getHardMove(state, aiPlayer, emptyCells);
    default:
      return getMediumMove(state, aiPlayer, emptyCells);
  }
}

function getEasyMove(state: GameState, aiPlayer: Player, emptyCells: number[]): number {
  // 30% chance of making a smart move
  if (Math.random() < 0.3) {
    return getHardMove(state, aiPlayer, emptyCells);
  }
  // Otherwise random
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumMove(state: GameState, aiPlayer: Player, emptyCells: number[]): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // First check for winning move
  for (const cell of emptyCells) {
    const sim = simulateMove(
      state.board,
      state.moveHistory,
      cell,
      aiPlayer,
      state.moveNumber + 1,
    );
    if (checkWinForPlayer(sim.board, aiPlayer)) return cell;
  }

  // Block opponent win
  for (const cell of emptyCells) {
    const sim = simulateMove(
      state.board,
      state.moveHistory,
      cell,
      humanPlayer,
      state.moveNumber + 1,
    );
    if (checkWinForPlayer(sim.board, humanPlayer)) return cell;
  }

  // 60% smart, 40% random
  if (Math.random() < 0.6) {
    return getHardMove(state, aiPlayer, emptyCells);
  }

  // Prefer center
  if (emptyCells.includes(4)) return 4;

  // Random
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getHardMove(state: GameState, aiPlayer: Player, emptyCells: number[]): number {
  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const cell of emptyCells) {
    const sim = simulateMove(
      state.board,
      state.moveHistory,
      cell,
      aiPlayer,
      state.moveNumber + 1,
    );
    const score = minimax(
      sim.board,
      sim.history,
      state.moveNumber + 1,
      0,
      false,
      -Infinity,
      Infinity,
      aiPlayer,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }

  return bestMove;
}

export function getAIMoveDelay(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 300 + Math.random() * 400;
    case 'medium':
      return 400 + Math.random() * 500;
    case 'hard':
      return 600 + Math.random() * 600;
    default:
      return 500;
  }
}
