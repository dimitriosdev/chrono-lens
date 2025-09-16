/**
 * Device detection utilities
 * Provides reliable cross-browser device and platform detection
 */

/**
 * Check if code is running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Check if the current device is mobile
 * Uses multiple detection methods for reliability
 */
export const isMobileDevice = (): boolean => {
  if (!isBrowser()) return false;

  // Method 1: User agent detection
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileUserAgents = [
    "android",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
    "mobile",
    "webos",
    "opera mini",
  ];

  const hasAgentMatch = mobileUserAgents.some((agent) =>
    userAgent.includes(agent)
  );

  // Method 2: Touch capability check
  const hasTouchSupport =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints >
      0;

  // Method 3: Screen size check (mobile-like dimensions)
  const hasSmallScreen =
    window.screen.width <= 768 || window.screen.height <= 768;

  // Method 4: CSS media query check
  const matchesMobileMediaQuery =
    window.matchMedia("(max-width: 768px)").matches;

  // Combine multiple methods for more reliable detection
  return (
    hasAgentMatch ||
    (hasTouchSupport && (hasSmallScreen || matchesMobileMediaQuery))
  );
};

/**
 * Check if the current device is iOS (iPhone, iPad, iPod)
 */
export const isIOSDevice = (): boolean => {
  if (!isBrowser()) return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  // Additional check for iOS 13+ on iPad which might report as desktop
  const isMacLike = /mac/.test(userAgent);
  const isTouchDevice = "ontouchstart" in window;

  return isIOS || (isMacLike && isTouchDevice);
};

/**
 * Check if the current device is Android
 */
export const isAndroidDevice = (): boolean => {
  if (!isBrowser()) return false;

  return /android/.test(navigator.userAgent.toLowerCase());
};

/**
 * Check if running in a mobile browser that supports fullscreen API properly
 * Returns false for iOS devices as they have limited fullscreen support
 */
export const supportsMobileFullscreen = (): boolean => {
  if (!isBrowser()) return false;

  // iOS devices have very limited fullscreen API support
  if (isIOSDevice()) {
    return false;
  }

  // Android Chrome and other Android browsers generally support fullscreen
  if (isAndroidDevice()) {
    return true;
  }

  // For other mobile devices, assume no support to be safe
  if (isMobileDevice()) {
    return false;
  }

  // Desktop devices generally support fullscreen
  return true;
};

/**
 * Get device type information
 */
export const getDeviceInfo = () => {
  if (!isBrowser()) {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      supportsFullscreen: false,
      userAgent: "",
      screenWidth: 0,
      screenHeight: 0,
    };
  }

  return {
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    isAndroid: isAndroidDevice(),
    supportsFullscreen: supportsMobileFullscreen(),
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };
};

/**
 * Check if the browser is Safari (including iOS Safari)
 */
export const isSafari = (): boolean => {
  if (!isBrowser()) return false;

  const userAgent = navigator.userAgent.toLowerCase();
  return /safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent);
};

/**
 * Check if the browser is Chrome on iOS (which is actually Safari under the hood)
 */
export const isChromeOnIOS = (): boolean => {
  if (!isBrowser()) return false;

  const userAgent = navigator.userAgent.toLowerCase();
  return isIOSDevice() && /crios/.test(userAgent);
};
