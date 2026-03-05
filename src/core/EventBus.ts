/* ========================================
   Phantom Tac Toe - Typed Event Bus
   Decoupled pub/sub communication
   ======================================== */

type EventHandler<T = unknown> = (data: T) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  emit<T = unknown>(event: string, data?: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  off(event: string): void {
    this.handlers.delete(event);
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Global event bus singleton
export const eventBus = new EventBus();

// Typed event names for the app
export const AppEvents = {
  THEME_CHANGED: 'theme:changed',
  AUTH_STATE_CHANGED: 'auth:stateChanged',
  GAME_STARTED: 'game:started',
  GAME_ENDED: 'game:ended',
  XP_GAINED: 'xp:gained',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  COINS_CHANGED: 'coins:changed',
  ROUTE_CHANGED: 'route:changed',
  MULTIPLAYER_CONNECTED: 'mp:connected',
  MULTIPLAYER_DISCONNECTED: 'mp:disconnected',
  LOCAL_PEER_DISCOVERED: 'local:peerDiscovered',
} as const;
