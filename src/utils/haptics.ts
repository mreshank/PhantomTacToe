/* ========================================
   Phantom Tac Toe - Haptic Feedback
   ======================================== */

export function vibrate(pattern: number | number[] = 10): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export function vibrateMove(): void {
  vibrate(5);
}

export function vibrateWin(): void {
  vibrate([50, 30, 50, 30, 100]);
}

export function vibrateLose(): void {
  vibrate([100, 50, 100]);
}

export function vibrateClick(): void {
  vibrate(3);
}
