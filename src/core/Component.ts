/* ========================================
   Phantom Tac Toe - Base Component
   Lightweight component system for typed,
   composable UI rendering
   ======================================== */

export abstract class Component {
  protected element: HTMLElement;
  protected children: Component[] = [];
  protected mounted = false;
  protected eventCleanups: Array<() => void> = [];

  constructor(protected container: HTMLElement) {
    this.element = document.createElement('div');
  }

  /** Returns the HTML string for this component */
  abstract render(): string;

  /** Mount the component into the container */
  mount(): void {
    this.element.innerHTML = this.render();
    this.container.innerHTML = '';
    this.container.appendChild(this.element);
    this.mounted = true;
    this.bindEvents();
    this.children.forEach(child => child.mount());
    this.onMount();
  }

  /** Called after mount — override for post-mount logic */
  protected onMount(): void {}

  /** Unmount and cleanup */
  unmount(): void {
    this.children.forEach(child => child.unmount());
    this.eventCleanups.forEach(cleanup => cleanup());
    this.eventCleanups = [];
    this.mounted = false;
    this.onUnmount();
  }

  /** Called during unmount — override for custom cleanup */
  protected onUnmount(): void {}

  /** Re-render while preserving scroll position */
  update(): void {
    if (!this.mounted) return;
    const scrollTop = this.element.scrollTop;
    this.element.innerHTML = this.render();
    this.bindEvents();
    this.element.scrollTop = scrollTop;
  }

  /** Add a child component */
  addChild(child: Component): void {
    this.children.push(child);
    if (this.mounted) {
      child.mount();
    }
  }

  /** Remove a child component */
  removeChild(child: Component): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      child.unmount();
      this.children.splice(idx, 1);
    }
  }

  /** Override to bind DOM event listeners after render */
  protected bindEvents(): void {}

  /** Helper to add event listeners with automatic cleanup */
  protected listen<K extends keyof HTMLElementEventMap>(
    selector: string,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void
  ): void {
    const el = this.element.querySelector(selector) as HTMLElement | null;
    if (el) {
      el.addEventListener(event, handler as EventListener);
      this.eventCleanups.push(() => el.removeEventListener(event, handler as EventListener));
    }
  }

  /** Helper to add event listeners to multiple elements */
  protected listenAll<K extends keyof HTMLElementEventMap>(
    selector: string,
    event: K,
    handler: (e: HTMLElementEventMap[K], el: HTMLElement) => void
  ): void {
    const elements = this.element.querySelectorAll(selector);
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const wrappedHandler = (e: HTMLElementEventMap[K]) => handler(e, htmlEl);
      htmlEl.addEventListener(event, wrappedHandler as EventListener);
      this.eventCleanups.push(() => htmlEl.removeEventListener(event, wrappedHandler as EventListener));
    });
  }

  /** Query a child element within this component */
  protected query<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return this.element.querySelector(selector) as T | null;
  }

  /** Query all child elements within this component */
  protected queryAll<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    return Array.from(this.element.querySelectorAll(selector)) as T[];
  }
}
