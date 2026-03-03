/* ========================================
   Phantom Tac Toe - Turn Timer
   ======================================== */

export class TurnTimer {
  constructor(duration = 15, onTick, onTimeout) {
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    this.intervalId = null;
    this.running = false;
  }

  start() {
    this.stop();
    this.remaining = this.duration;
    this.running = true;
    this.intervalId = setInterval(() => {
      this.remaining = Math.max(0, this.remaining - 0.1);
      if (this.onTick) this.onTick(this.remaining, this.duration);
      if (this.remaining <= 0) {
        this.stop();
        if (this.onTimeout) this.onTimeout();
      }
    }, 100);
  }

  reset() {
    this.remaining = this.duration;
    if (this.onTick) this.onTick(this.remaining, this.duration);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  pause() {
    this.stop();
  }

  resume() {
    if (!this.running) {
      this.running = true;
      this.intervalId = setInterval(() => {
        this.remaining = Math.max(0, this.remaining - 0.1);
        if (this.onTick) this.onTick(this.remaining, this.duration);
        if (this.remaining <= 0) {
          this.stop();
          if (this.onTimeout) this.onTimeout();
        }
      }, 100);
    }
  }

  setDuration(duration) {
    this.duration = duration;
    this.remaining = duration;
  }

  getProgress() {
    return this.remaining / this.duration;
  }
}
