/* ========================================
   InfiniToe - Audio Manager
   Web Audio API sound effects
   ======================================== */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicEnabled = false;
    this.volume = 0.5;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, duration = 0.15, type = "sine", vol = 0.3) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playMove() {
    this.playTone(800, 0.08, "sine", 0.2);
    setTimeout(() => this.playTone(1200, 0.06, "sine", 0.15), 50);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, "sine", 0.3), i * 100);
    });
  }

  playLose() {
    this.playTone(400, 0.15, "sawtooth", 0.15);
    setTimeout(() => this.playTone(300, 0.3, "sawtooth", 0.1), 150);
  }

  playExpire() {
    this.playTone(300, 0.15, "triangle", 0.1);
  }

  playClick() {
    this.playTone(600, 0.05, "square", 0.1);
  }

  playAchievement() {
    const notes = [784, 988, 1175, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, "sine", 0.25), i * 80);
    });
  }

  playLevelUp() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, "sine", 0.3), i * 120);
    });
  }

  playCoins() {
    this.playTone(1200, 0.06, "sine", 0.15);
    setTimeout(() => this.playTone(1500, 0.06, "sine", 0.12), 60);
    setTimeout(() => this.playTone(1800, 0.06, "sine", 0.1), 120);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
  }
}

export const audio = new AudioManager();
