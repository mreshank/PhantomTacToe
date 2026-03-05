/* ========================================
   Phantom Tac Toe - Router (Hash-based SPA)
   Typed version with route params support
   ======================================== */

export type RouteParams = Record<string, string>;
export type RouteHandler = (container: HTMLElement, params: RouteParams) => void | (() => void) | Promise<void | (() => void)>;

export interface Route {
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentRoute: string | null = null;
  private currentCleanup: (() => void) | null = null;
  private appContainer: HTMLElement | null = null;

  constructor() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  setContainer(container: HTMLElement): void {
    this.appContainer = container;
  }

  addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  navigate(path: string): void {
    window.location.hash = path;
  }

  getCurrentRoute(): string | null {
    return this.currentRoute;
  }

  handleRoute(): void {
    const hash = window.location.hash.slice(1) || '/';

    // Match route (supports params like /join/:code)
    let matchedHandler: RouteHandler | null = null;
    let params: RouteParams = {};

    for (const [pattern, handler] of this.routes) {
      const match = this.matchRoute(pattern, hash);
      if (match) {
        matchedHandler = handler;
        params = match;
        break;
      }
    }

    if (!matchedHandler) {
      // Fallback to home
      matchedHandler = this.routes.get('/') || null;
      params = {};
    }

    // Clean up previous page
    if (this.currentCleanup) {
      this.currentCleanup();
      this.currentCleanup = null;
    }

    // Render new page
    if (matchedHandler && this.appContainer) {
      this.currentRoute = hash;
      const result = matchedHandler(this.appContainer, params);

      // Handle async handlers
      if (result instanceof Promise) {
        result.then((cleanup) => {
          if (typeof cleanup === 'function') {
            this.currentCleanup = cleanup;
          }
        });
      } else if (typeof result === 'function') {
        this.currentCleanup = result;
      }
    }
  }

  private matchRoute(pattern: string, path: string): RouteParams | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }

  start(): void {
    this.handleRoute();
  }
}

export const router = new Router();
