/* ========================================
   InfiniToe - Haptic Feedback
   ======================================== */

export function vibrate(pattern = 10) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function vibrateMove() {
  vibrate(5);
}
export function vibrateWin() {
  vibrate([50, 30, 50, 30, 100]);
}
export function vibrateLose() {
  vibrate([100, 50, 100]);
}
export function vibrateClick() {
  vibrate(3);
}
