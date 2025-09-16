/**
 * Mobile-specific fullscreen utilities
 * Provides fullscreen-like experience on mobile devices where native fullscreen API is limited
 */

import {
  isBrowser,
  isMobileDevice,
  isIOSDevice,
  supportsMobileFullscreen,
} from "./device";

/**
 * Mobile fullscreen state interface
 */
export interface MobileFullscreenState {
  isActive: boolean;
  element: HTMLElement | null;
}

/**
 * Extended HTMLElement interface for vendor-prefixed fullscreen methods
 */
interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

/**
 * Extended Navigator interface for iOS standalone detection
 */
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

/**
 * Mobile fullscreen manager class
 * Handles fullscreen-like experience on mobile devices
 */
class MobileFullscreenManager {
  private state: MobileFullscreenState = {
    isActive: false,
    element: null,
  };

  private originalBodyStyle: string = "";
  private originalDocumentStyle: string = "";
  private originalViewportMeta: string = "";

  /**
   * Check if mobile fullscreen mode is currently active
   */
  public isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Enter mobile fullscreen mode
   */
  public async enter(): Promise<void> {
    if (!isBrowser() || !isMobileDevice()) {
      throw new Error("Mobile fullscreen only available on mobile devices");
    }

    if (this.state.isActive) {
      return; // Already in fullscreen
    }

    try {
      // Store original styles
      this.storeOriginalStyles();

      // Apply mobile fullscreen styles
      this.applyFullscreenStyles();

      // Update viewport meta tag for better fullscreen experience
      this.updateViewportMeta();

      // Try to trigger browser fullscreen if supported (Android)
      if (supportsMobileFullscreen()) {
        try {
          await this.tryNativeFullscreen();
        } catch {
          console.log("Native fullscreen not available, using CSS fallback");
        }
      }

      // Hide browser UI on scroll (iOS specific)
      if (isIOSDevice()) {
        this.triggerIOSFullscreen();
      }

      this.state.isActive = true;
      this.state.element = document.documentElement;

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("mobileFullscreenChange", {
          detail: { isFullscreen: true },
        })
      );
    } catch (error) {
      console.error("Failed to enter mobile fullscreen:", error);
      throw error;
    }
  }

  /**
   * Exit mobile fullscreen mode
   */
  public async exit(): Promise<void> {
    if (!this.state.isActive) {
      return; // Not in fullscreen
    }

    try {
      // Restore original styles
      this.restoreOriginalStyles();

      // Restore original viewport meta tag
      this.restoreViewportMeta();

      // Exit native fullscreen if it was used
      if (supportsMobileFullscreen() && document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.log("Native fullscreen exit failed:", error);
        }
      }

      this.state.isActive = false;
      this.state.element = null;

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("mobileFullscreenChange", {
          detail: { isFullscreen: false },
        })
      );
    } catch (error) {
      console.error("Failed to exit mobile fullscreen:", error);
      throw error;
    }
  }

  /**
   * Toggle mobile fullscreen mode
   */
  public async toggle(): Promise<void> {
    if (this.state.isActive) {
      await this.exit();
    } else {
      await this.enter();
    }
  }

  /**
   * Store original styles before entering fullscreen
   */
  private storeOriginalStyles(): void {
    this.originalBodyStyle = document.body.style.cssText;
    this.originalDocumentStyle = document.documentElement.style.cssText;
  }

  /**
   * Apply CSS styles for mobile fullscreen effect
   */
  private applyFullscreenStyles(): void {
    // Apply styles to body
    Object.assign(document.body.style, {
      margin: "0",
      padding: "0",
      overflow: "hidden",
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "9999",
      backgroundColor: "#000",
    });

    // Apply styles to document element
    Object.assign(document.documentElement.style, {
      margin: "0",
      padding: "0",
      overflow: "hidden",
      width: "100vw",
      height: "100vh",
    });

    // Add CSS class for additional styling
    document.body.classList.add("mobile-fullscreen-active");
    document.documentElement.classList.add("mobile-fullscreen-active");
  }

  /**
   * Restore original styles when exiting fullscreen
   */
  private restoreOriginalStyles(): void {
    document.body.style.cssText = this.originalBodyStyle;
    document.documentElement.style.cssText = this.originalDocumentStyle;

    document.body.classList.remove("mobile-fullscreen-active");
    document.documentElement.classList.remove("mobile-fullscreen-active");
  }

  /**
   * Update viewport meta tag for better mobile fullscreen experience
   */
  private updateViewportMeta(): void {
    const viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement;
    if (viewportMeta) {
      this.originalViewportMeta = viewportMeta.content;
      viewportMeta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, minimal-ui";
    }
  }

  /**
   * Restore original viewport meta tag
   */
  private restoreViewportMeta(): void {
    const viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement;
    if (viewportMeta && this.originalViewportMeta) {
      viewportMeta.content = this.originalViewportMeta;
    }
  }

  /**
   * Try to use native fullscreen API (for Android devices)
   */
  private async tryNativeFullscreen(): Promise<void> {
    const element = document.documentElement as ExtendedHTMLElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    }
  }

  /**
   * Trigger iOS-specific fullscreen behavior
   * iOS hides the browser UI when the user scrolls, so we can simulate this
   */
  private triggerIOSFullscreen(): void {
    // On iOS, scrolling down slightly can trigger the browser UI to hide
    // We'll use a timeout to restore scroll position
    const originalScrollY = window.scrollY;

    window.scrollTo(0, 1);

    setTimeout(() => {
      window.scrollTo(0, originalScrollY);
    }, 100);

    // Also try using the standalone mode meta tag behavior
    const nav = navigator as ExtendedNavigator;
    if ("standalone" in nav && !nav.standalone) {
      // Not in standalone mode, add visual cue that this is fullscreen-like
      console.log("iOS fullscreen mode activated (non-standalone)");
    }
  }
}

// Global instance
const mobileFullscreenManager = new MobileFullscreenManager();

/**
 * Hook-friendly functions for mobile fullscreen
 */
export const mobileFullscreen = {
  /**
   * Check if mobile fullscreen is active
   */
  isActive: (): boolean => mobileFullscreenManager.isActive(),

  /**
   * Enter mobile fullscreen mode
   */
  enter: (): Promise<void> => mobileFullscreenManager.enter(),

  /**
   * Exit mobile fullscreen mode
   */
  exit: (): Promise<void> => mobileFullscreenManager.exit(),

  /**
   * Toggle mobile fullscreen mode
   */
  toggle: (): Promise<void> => mobileFullscreenManager.toggle(),

  /**
   * Add event listener for mobile fullscreen changes
   */
  addEventListener: (
    callback: (isFullscreen: boolean) => void
  ): (() => void) => {
    const handler = (event: CustomEvent) => {
      callback(event.detail.isFullscreen);
    };

    window.addEventListener("mobileFullscreenChange", handler as EventListener);

    // Return cleanup function
    return () => {
      window.removeEventListener(
        "mobileFullscreenChange",
        handler as EventListener
      );
    };
  },
};

/**
 * CSS to be injected for mobile fullscreen support
 */
export const MOBILE_FULLSCREEN_CSS = `
  .mobile-fullscreen-active {
    /* Ensure no scroll bars */
    overflow: hidden !important;
    
    /* iOS Safari specific fixes */
    -webkit-overflow-scrolling: touch;
    
    /* Prevent zoom on input focus */
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Hide elements that might interfere with fullscreen on mobile */
  .mobile-fullscreen-active .mobile-hide-in-fullscreen {
    display: none !important;
  }

  /* Ensure proper dimensions in mobile fullscreen */
  .mobile-fullscreen-active main,
  .mobile-fullscreen-active .mobile-fullscreen-content {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* iOS specific improvements */
  @supports (-webkit-appearance: none) {
    .mobile-fullscreen-active {
      /* Better iOS Safari fullscreen experience */
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      
      /* Prevent bounce scrolling */
      overscroll-behavior: none;
    }
  }
`;
