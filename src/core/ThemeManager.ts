/* ========================================
   Phantom Tac Toe - Theme Manager
   Centralized theme service for design-ready
   theme switching with typed theme definitions
   ======================================== */

import { eventBus, AppEvents } from './EventBus';

export interface ThemeColors {
  neonPurple: string;
  neonPurpleGlow: string;
  neonCyan: string;
  neonCyanGlow: string;
  neonPink: string;
  neonPinkGlow: string;
  neonGold: string;
  neonGoldGlow: string;
  neonGreen: string;
  neonGreenGlow: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: Partial<ThemeColors>;
  unlockRequirement?: string;
}

// CSS variable name mapping
const COLOR_TO_CSS: Record<keyof ThemeColors, string> = {
  neonPurple: '--neon-purple',
  neonPurpleGlow: '--neon-purple-glow',
  neonCyan: '--neon-cyan',
  neonCyanGlow: '--neon-cyan-glow',
  neonPink: '--neon-pink',
  neonPinkGlow: '--neon-pink-glow',
  neonGold: '--neon-gold',
  neonGoldGlow: '--neon-gold-glow',
  neonGreen: '--neon-green',
  neonGreenGlow: '--neon-green-glow',
  accentPrimary: '--accent-primary',
  accentSecondary: '--accent-secondary',
  accentTertiary: '--accent-tertiary',
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgTertiary: '--bg-tertiary',
};

class ThemeManagerService {
  private themes: Map<string, Theme> = new Map();
  private activeThemeId = 'neon';
  private defaultThemeId = 'neon';

  constructor() {
    // Register built-in themes
    this.register({
      id: 'neon',
      name: 'Neon',
      description: 'Default neon cyberpunk theme',
      colors: {}, // Default — no overrides needed
    });

    this.register({
      id: 'gold',
      name: 'Cyber Gold',
      description: 'Master Tier golden theme',
      colors: {
        neonPurple: '#ff9f0a',
        neonPurpleGlow: 'rgba(255, 159, 10, 0.4)',
        neonCyan: '#ffd60a',
        neonCyanGlow: 'rgba(255, 214, 10, 0.4)',
        accentPrimary: '#ff9f0a',
        accentSecondary: '#ffd60a',
      },
      unlockRequirement: 'Level 25+',
    });

    this.register({
      id: 'emerald',
      name: 'Emerald Matrix',
      description: 'Level 50+ exclusive green theme',
      colors: {
        neonPurple: '#30d158',
        neonPurpleGlow: 'rgba(48, 209, 88, 0.4)',
        neonCyan: '#64d2ff',
        neonCyanGlow: 'rgba(100, 210, 255, 0.4)',
        accentPrimary: '#30d158',
        accentSecondary: '#64d2ff',
      },
      unlockRequirement: 'Level 50+',
    });

    this.register({
      id: 'obsidian',
      name: 'Obsidian Phantom',
      description: 'Dark Knight monochrome theme',
      colors: {
        bgPrimary: '#050505',
        bgSecondary: '#0a0a0a',
        neonPurple: '#ffffff',
        neonPurpleGlow: 'rgba(255, 255, 255, 0.2)',
        neonCyan: '#404040',
        neonCyanGlow: 'rgba(64, 64, 64, 0.2)',
        accentPrimary: '#ffffff',
        accentSecondary: '#404040',
      },
      unlockRequirement: 'Win 50 games',
    });

    this.register({
      id: 'royal',
      name: 'Royal Crimson',
      description: 'Daily Streak 30+ exclusive',
      colors: {
        neonPurple: '#ff375f',
        neonPurpleGlow: 'rgba(255, 55, 95, 0.4)',
        neonCyan: '#ffd60a',
        neonCyanGlow: 'rgba(255, 214, 10, 0.4)',
        accentPrimary: '#ff375f',
        accentSecondary: '#ffd60a',
      },
      unlockRequirement: 'Daily Streak 30+',
    });
  }

  /** Register a new theme (design-ready: add themes without code changes elsewhere) */
  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /** Apply a theme by ID */
  apply(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`Theme "${themeId}" not found, falling back to default`);
      this.apply(this.defaultThemeId);
      return;
    }

    // Remove all theme classes
    const allThemeIds = Array.from(this.themes.keys());
    document.body.classList.remove(
      ...allThemeIds.filter(id => id !== this.defaultThemeId).map(id => `theme-${id}`)
    );

    // Apply theme class (skip for default theme)
    if (themeId !== this.defaultThemeId) {
      document.body.classList.add(`theme-${themeId}`);
    }

    this.activeThemeId = themeId;
    eventBus.emit(AppEvents.THEME_CHANGED, { themeId, theme });
  }

  /** Get the currently active theme */
  getActive(): Theme | undefined {
    return this.themes.get(this.activeThemeId);
  }

  /** Get the active theme ID */
  getActiveId(): string {
    return this.activeThemeId;
  }

  /** Get all registered themes */
  getAll(): Theme[] {
    return Array.from(this.themes.values());
  }

  /** Get a theme by ID */
  get(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }
}

// Singleton
export const ThemeManager = new ThemeManagerService();
