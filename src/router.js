/* ========================================
   Phantom Tac Toe - Router (Hash-based SPA)
   ======================================== */

export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentCleanup = null;
    this.appContainer = null;

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  setContainer(container) {
    this.appContainer = container;
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "/";

    // Match route (supports params like /join/:code)
    let matchedHandler = null;
    let params = {};

    for (const [pattern, handler] of Object.entries(this.routes)) {
      const match = this.matchRoute(pattern, hash);
      if (match) {
        matchedHandler = handler;
        params = match;
        break;
      }
    }

    if (!matchedHandler) {
      // Fallback to home
      matchedHandler = this.routes["/"];
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

      // Handle async handlers (like the new Leaderboard)
      if (result instanceof Promise) {
        result.then((cleanup) => {
          if (typeof cleanup === "function") {
            this.currentCleanup = cleanup;
          }
        });
      } else if (typeof result === "function") {
        this.currentCleanup = result;
      }
    }
  }

  matchRoute(pattern, path) {
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) return null;

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }

  start() {
    this.handleRoute();
  }
}

export const router = new Router();
