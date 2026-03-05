/* ========================================
   Phantom Tac Toe - Turn Timer
   ======================================== */

export type TimerTickCallback = (remaining: number, total: number) => void;
export type TimerTimeoutCallback = () => void;

export class TurnTimer {
  private duration: number;
  private remaining: number;
  private onTick: TimerTickCallback | null;
  private onTimeout: TimerTimeoutCallback | null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    duration = 15,
    onTick?: TimerTickCallback,
    onTimeout?: TimerTimeoutCallback,
  ) {
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick || null;
    this.onTimeout = onTimeout || null;
  }

  start(): void {
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

  reset(): void {
    this.remaining = this.duration;
    if (this.onTick) this.onTick(this.remaining, this.duration);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  pause(): void {
    this.stop();
  }

  resume(): void {
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

  setDuration(duration: number): void {
    this.duration = duration;
    this.remaining = duration;
  }

  getProgress(): number {
    return this.remaining / this.duration;
  }

  isRunning(): boolean {
    return this.running;
  }
}
