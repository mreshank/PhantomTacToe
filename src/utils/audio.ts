/* ========================================
   Phantom Tac Toe - Audio Manager
   Web Audio API sound effects
   ======================================== */

type OscillatorWaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private musicEnabled = false;
  private volume = 0.5;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (_e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext(): void {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq: number, duration = 0.15, type: OscillatorWaveType = 'sine', vol = 0.3): void {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

    gain.gain.setValueAtTime(vol * this.volume, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx!.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start(this.ctx!.currentTime);
    osc.stop(this.ctx!.currentTime + duration);
  }

  playMove(): void {
    this.playTone(800, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(1200, 0.06, 'sine', 0.15), 50);
  }

  playWin(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 100);
    });
  }

  playLose(): void {
    this.playTone(400, 0.15, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(300, 0.3, 'sawtooth', 0.1), 150);
  }

  playExpire(): void {
    this.playTone(300, 0.15, 'triangle', 0.1);
  }

  playClick(): void {
    this.playTone(600, 0.05, 'square', 0.1);
  }

  playAchievement(): void {
    const notes = [784, 988, 1175, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25), i * 80);
    });
  }

  playLevelUp(): void {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 120);
    });
  }

  playCoins(): void {
    this.playTone(1200, 0.06, 'sine', 0.15);
    setTimeout(() => this.playTone(1500, 0.06, 'sine', 0.12), 60);
    setTimeout(() => this.playTone(1800, 0.06, 'sine', 0.1), 120);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}

export const audio = new AudioManager();
