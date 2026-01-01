/**
 * Cross-Browser Compatibility Test Suite
 * 
 * Comprehensive testing for browser compatibility, responsive design,
 * feature detection, and cross-browser functionality validation.
 * 
 * Tests cover:
 * - Browser feature detection and polyfills
 * - CSS compatibility and vendor prefixes
 * - JavaScript API availability
 * - Responsive design breakpoints
 * - Touch and mouse event handling
 * - Storage API compatibility
 * - Network and connectivity features
 * - Performance API availability
 * - Media query support
 * - Accessibility features across browsers
 * 
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// ============================================
// Test Utilities and Helpers
// ============================================

/**
 * Mock user agent for browser simulation
 */
function mockUserAgent(userAgent) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
}

/**
 * Mock window dimensions for responsive testing
 */
function mockWindowDimensions(width, height) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

/**
 * Mock matchMedia for media query testing
 */
function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Create mock touch event
 */
function createTouchEvent(type, touches = []) {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches,
    targetTouches: touches,
    changedTouches: touches,
  });
}

/**
 * Create mock pointer event
 */
function createPointerEvent(type, options = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType: 'mouse',
    ...options,
  });
}

/**
 * Wait for async operations
 */
function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean up DOM
 */
function cleanupDOM() {
  document.body.innerHTML = '';
}

// ============================================
// Browser Detection Utilities
// ============================================

/**
 * Detect browser type from user agent
 */
function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edge')) {
    return 'chrome';
  }
  if (ua.includes('firefox')) {
    return 'firefox';
  }
  if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'safari';
  }
  if (ua.includes('edge')) {
    return 'edge';
  }
  if (ua.includes('trident') || ua.includes('msie')) {
    return 'ie';
  }
  
  return 'unknown';
}

/**
 * Check if browser supports a feature
 */
function supportsFeature(feature) {
  const features = {
    localStorage: () => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    },
    sessionStorage: () => {
      try {
        const test = '__test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    },
    indexedDB: () => 'indexedDB' in window,
    serviceWorker: () => 'serviceWorker' in navigator,
    webWorker: () => typeof Worker !== 'undefined',
    webSocket: () => 'WebSocket' in window,
    geolocation: () => 'geolocation' in navigator,
    notifications: () => 'Notification' in window,
    vibration: () => 'vibrate' in navigator,
    battery: () => 'getBattery' in navigator,
    mediaDevices: () => 'mediaDevices' in navigator,
    intersectionObserver: () => 'IntersectionObserver' in window,
    mutationObserver: () => 'MutationObserver' in window,
    resizeObserver: () => 'ResizeObserver' in window,
    performanceObserver: () => 'PerformanceObserver' in window,
    requestAnimationFrame: () => 'requestAnimationFrame' in window,
    requestIdleCallback: () => 'requestIdleCallback' in window,
    fetch: () => 'fetch' in window,
    promise: () => 'Promise' in window,
    proxy: () => 'Proxy' in window,
    weakMap: () => 'WeakMap' in window,
    weakSet: () => 'WeakSet' in window,
    symbol: () => typeof Symbol !== 'undefined',
    bigInt: () => typeof BigInt !== 'undefined',
    intl: () => 'Intl' in window,
    crypto: () => 'crypto' in window && 'subtle' in crypto,
    clipboard: () => 'clipboard' in navigator,
    share: () => 'share' in navigator,
    bluetooth: () => 'bluetooth' in navigator,
    usb: () => 'usb' in navigator,
    webGL: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    },
    webGL2: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch {
        return false;
      }
    },
    canvas: () => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    },
    svg: () => !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,
    audio: () => !!document.createElement('audio').canPlayType,
    video: () => !!document.createElement('video').canPlayType,
    webAudio: () => 'AudioContext' in window || 'webkitAudioContext' in window,
    webRTC: () => 'RTCPeerConnection' in window,
    pointerEvents: () => 'PointerEvent' in window,
    touchEvents: () => 'ontouchstart' in window,
    customElements: () => 'customElements' in window,
    shadowDOM: () => 'attachShadow' in Element.prototype,
    cssGrid: () => CSS.supports('display', 'grid'),
    cssFlexbox: () => CSS.supports('display', 'flex'),
    cssVariables: () => CSS.supports('--test', '0'),
    cssBackdropFilter: () => CSS.supports('backdrop-filter', 'blur(10px)'),
    cssClipPath: () => CSS.supports('clip-path', 'circle(50%)'),
    cssScrollSnap: () => CSS.supports('scroll-snap-type', 'x mandatory'),
    cssSticky: () => CSS.supports('position', 'sticky'),
    cssAspectRatio: () => CSS.supports('aspect-ratio', '16/9'),
    cssContainerQueries: () => CSS.supports('container-type', 'inline-size'),
  };
  
  return features[feature] ? features[feature]() : false;
}

/**
 * Get browser version
 */
function getBrowserVersion() {
  const ua = navigator.userAgent;
  const browser = detectBrowser();
  
  const patterns = {
    chrome: /chrome\/(\d+)/i,
    firefox: /firefox\/(\d+)/i,
    safari: /version\/(\d+)/i,
    edge: /edge\/(\d+)/i,
    ie: /(?:msie |rv:)(\d+)/i,
  };
  
  const pattern = patterns[browser];
  if (!pattern) return null;
  
  const match = ua.match(pattern);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if mobile device
 */
function isMobileDevice() {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
}

/**
 * Check if touch device
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ============================================
// Responsive Design Utilities
// ============================================

/**
 * Get current breakpoint
 */
function getCurrentBreakpoint() {
  const width = window.innerWidth;
  
  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  if (width < 1400) return 'xl';
  return 'xxl';
}

/**
 * Check if viewport matches breakpoint
 */
function matchesBreakpoint(breakpoint) {
  const breakpoints = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 991px)',
    lg: '(min-width: 992px) and (max-width: 1199px)',
    xl: '(min-width: 1200px) and (max-width: 1399px)',
    xxl: '(min-width: 1400px)',
  };
  
  return window.matchMedia(breakpoints[breakpoint]).matches;
}

/**
 * Get device pixel ratio
 */
function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

/**
 * Check if retina display
 */
function isRetinaDisplay() {
  return getDevicePixelRatio() > 1;
}

// ============================================
// CSS Compatibility Utilities
// ============================================

/**
 * Get vendor prefix for CSS property
 */
function getVendorPrefix() {
  const styles = window.getComputedStyle(document.documentElement, '');
  const pre = (Array.prototype.slice
    .call(styles)
    .join('') 
    .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
  )[1];
  
  return {
    dom: pre === 'ms' ? 'MS' : pre,
    lowercase: pre,
    css: `-${pre}-`,
    js: pre === 'ms' ? pre : pre.charAt(0).toUpperCase() + pre.slice(1),
  };
}

/**
 * Add vendor prefix to CSS property
 */
function addVendorPrefix(property, value) {
  const prefix = getVendorPrefix();
  const element = document.createElement('div');
  
  // Try standard property first
  element.style[property] = value;
  if (element.style[property]) {
    return { [property]: value };
  }
  
  // Try prefixed versions
  const prefixed = prefix.js + property.charAt(0).toUpperCase() + property.slice(1);
  element.style[prefixed] = value;
  if (element.style[prefixed]) {
    return { [prefixed]: value };
  }
  
  return null;
}

/**
 * Check CSS property support
 */
function supportsCSSProperty(property, value) {
  if (!CSS || !CSS.supports) {
    const element = document.createElement('div');
    element.style[property] = value;
    return element.style[property] === value;
  }
  
  return CSS.supports(property, value);
}

// ============================================
// Event Compatibility Utilities
// ============================================

/**
 * Normalize wheel event
 */
function normalizeWheelEvent(event) {
  let deltaX = 0;
  let deltaY = 0;
  
  if ('deltaX' in event) {
    deltaX = event.deltaX;
    deltaY = event.deltaY;
  } else if ('wheelDeltaX' in event) {
    deltaX = -event.wheelDeltaX;
    deltaY = -event.wheelDeltaY;
  } else if ('wheelDelta' in event) {
    deltaY = -event.wheelDelta;
  } else if ('detail' in event) {
    deltaY = event.detail;
  }
  
  return { deltaX, deltaY };
}

/**
 * Get pointer position from event
 */
function getPointerPosition(event) {
  if (event.touches && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

/**
 * Check if event is touch event
 */
function isTouchEvent(event) {
  return event.type.startsWith('touch');
}

/**
 * Check if event is pointer event
 */
function isPointerEvent(event) {
  return event.type.startsWith('pointer');
}

// ============================================
// Storage Compatibility Utilities
// ============================================

/**
 * Safe localStorage wrapper
 */
class SafeStorage {
  constructor(storage) {
    this.storage = storage;
    this.available = this._checkAvailability();
  }
  
  _checkAvailability() {
    try {
      const test = '__test__';
      this.storage.setItem(test, test);
      this.storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  getItem(key) {
    if (!this.available) return null;
    
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }
  
  setItem(key, value) {
    if (!this.available) return false;
    
    try {
      this.storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
  
  removeItem(key) {
    if (!this.available) return false;
    
    try {
      this.storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
  
  clear() {
    if (!this.available) return false;
    
    try {
      this.storage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Test Suite
// ============================================

describe('Cross-Browser Compatibility', () => {
  beforeEach(() => {
    cleanupDOM();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupDOM();
  });

  // ============================================
  // Browser Detection Tests
  // ============================================

  describe('Browser Detection', () => {
    it('should detect Chrome browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('chrome');
    });

    it('should detect Firefox browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('firefox');
    });

    it('should detect Safari browser', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('safari');
    });

    it('should detect Edge browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('edge');
    });

    it('should detect Internet Explorer', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('ie');
    });

    it('should return unknown for unrecognized browser', () => {
      mockUserAgent('CustomBrowser/1.0');
      
      const browser = detectBrowser();
      
      expect(browser).toBe('unknown');
    });

    it('should extract browser version', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const version = getBrowserVersion();
      
      expect(version).toBe(120);
    });

    it('should detect mobile devices', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
      
      const isMobile = isMobileDevice();
      
      expect(isMobile).toBe(true);
    });

    it('should detect desktop devices', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const isMobile = isMobileDevice();
      
      expect(isMobile).toBe(false);
    });

    it('should detect touch capability', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        configurable: true,
      });
      
      const isTouch = isTouchDevice();
      
      expect(isTouch).toBe(true);
    });
  });

  // ============================================
  // Feature Detection Tests
  // ============================================

  describe('Feature Detection', () => {
    it('should detect localStorage support', () => {
      const supported = supportsFeature('localStorage');
      
      expect(typeof supported).toBe('boolean');
    });

    it('should detect sessionStorage support', () => {
      const supported = supportsFeature('sessionStorage');
      
      expect(typeof supported).toBe('boolean');
    });

    it('should detect IndexedDB support', () => {
      Object.defineProperty(window, 'indexedDB', {
        value: {},
        configurable: true,
      });
      
      const supported = supportsFeature('indexedDB');
      
      expect(supported).toBe(true);
    });

    it('should detect Service Worker support', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
      });
      
      const supported = supportsFeature('serviceWorker');
      
      expect(supported).toBe(true);
    });

    it('should detect Web Worker support', () => {
      global.Worker = class Worker {};
      
      const supported = supportsFeature('webWorker');
      
      expect(supported).toBe(true);
      
      delete global.Worker;
    });

    it('should detect WebSocket support', () => {
      global.WebSocket = class WebSocket {};
      
      const supported = supportsFeature('webSocket');
      
      expect(supported).toBe(true);
      
      delete global.WebSocket;
    });

    it('should detect Geolocation API support', () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {},
        configurable: true,
      });
      
      const supported = supportsFeature('geolocation');
      
      expect(supported).toBe(true);
    });

    it('should detect Notification API support', () => {
      global.Notification = class Notification {};
      
      const supported = supportsFeature('notifications');
      
      expect(supported).toBe(true);
      
      delete global.Notification;
    });

    it('should detect IntersectionObserver support', () => {
      global.IntersectionObserver = class IntersectionObserver {};
      
      const supported = supportsFeature('intersectionObserver');
      
      expect(supported).toBe(true);
      
      delete global.IntersectionObserver;
    });

    it('should detect MutationObserver support', () => {
      global.MutationObserver = class MutationObserver {};
      
      const supported = supportsFeature('mutationObserver');
      
      expect(supported).toBe(true);
      
      delete global.MutationObserver;
    });

    it('should detect ResizeObserver support', () => {
      global.ResizeObserver = class ResizeObserver {};
      
      const supported = supportsFeature('resizeObserver');
      
      expect(supported).toBe(true);
      
      delete global.ResizeObserver;
    });

    it('should detect requestAnimationFrame support', () => {
      const supported = supportsFeature('requestAnimationFrame');
      
      expect(typeof supported).toBe('boolean');
    });

    it('should detect Fetch API support', () => {
      const supported = supportsFeature('fetch');
      
      expect(typeof supported).toBe('boolean');
    });

    it('should detect Promise support', () => {
      const supported = supportsFeature('promise');
      
      expect(supported).toBe(true);
    });

    it('should detect Proxy support', () => {
      const supported = supportsFeature('proxy');
      
      expect(supported).toBe(true);
    });

    it('should detect Symbol support', () => {
      const supported = supportsFeature('symbol');
      
      expect(supported).toBe(true);
    });

    it('should detect BigInt support', () => {
      const supported = supportsFeature('bigInt');
      
      expect(supported).toBe(true);
    });

    it('should detect WebGL support', () => {
      const supported = supportsFeature('webGL');
      
      expect(typeof supported).toBe('boolean');
    });

    it('should detect Canvas support', () => {
      const supported = supportsFeature('canvas');
      
      expect(supported).toBe(true);
    });

    it('should detect SVG support', () => {
      const supported = supportsFeature('svg');
      
      expect(supported).toBe(true);
    });

    it('should detect Audio support', () => {
      const supported = supportsFeature('audio');
      
      expect(supported).toBe(true);
    });

    it('should detect Video support', () => {
      const supported = supportsFeature('video');
      
      expect(supported).toBe(true);
    });

    it('should detect Pointer Events support', () => {
      global.PointerEvent = class PointerEvent {};
      
      const supported = supportsFeature('pointerEvents');
      
      expect(supported).toBe(true);
      
      delete global.PointerEvent;
    });

    it('should detect Touch Events support', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        configurable: true,
      });
      
      const supported = supportsFeature('touchEvents');
      
      expect(supported).toBe(true);
    });

    it('should detect Custom Elements support', () => {
      Object.defineProperty(window, 'customElements', {
        value: {},
        configurable: true,
      });
      
      const supported = supportsFeature('customElements');
      
      expect(supported).toBe(true);
    });

    it('should detect Shadow DOM support', () => {
      Element.prototype.attachShadow = jest.fn();
      
      const supported = supportsFeature('shadowDOM');
      
      expect(supported).toBe(true);
      
      delete Element.prototype.attachShadow;
    });
  });

  // ============================================
  // CSS Feature Detection Tests
  // ============================================

  describe('CSS Feature Detection', () => {
    beforeEach(() => {
      // Mock CSS.supports
      global.CSS = {
        supports: jest.fn((property, value) => {
          const supportedFeatures = {
            'display:grid': true,
            'display:flex': true,
            '--test:0': true,
            'backdrop-filter:blur(10px)': true,
            'clip-path:circle(50%)': true,
            'scroll-snap-type:x mandatory': true,
            'position:sticky': true,
            'aspect-ratio:16/9': false,
            'container-type:inline-size': false,
          };
          
          const key = `${property}:${value}`;
          return supportedFeatures[key] || false;
        }),
      };
    });

    afterEach(() => {
      delete global.CSS;
    });

    it('should detect CSS Grid support', () => {
      const supported = supportsFeature('cssGrid');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Flexbox support', () => {
      const supported = supportsFeature('cssFlexbox');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Variables support', () => {
      const supported = supportsFeature('cssVariables');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Backdrop Filter support', () => {
      const supported = supportsFeature('cssBackdropFilter');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Clip Path support', () => {
      const supported = supportsFeature('cssClipPath');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Scroll Snap support', () => {
      const supported = supportsFeature('cssScrollSnap');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Sticky Position support', () => {
      const supported = supportsFeature('cssSticky');
      
      expect(supported).toBe(true);
    });

    it('should detect CSS Aspect Ratio support', () => {
      const supported = supportsFeature('cssAspectRatio');
      
      expect(supported).toBe(false);
    });

    it('should detect CSS Container Queries support', () => {
      const supported = supportsFeature('cssContainerQueries');
      
      expect(supported).toBe(false);
    });

    it('should check CSS property support without CSS.supports', () => {
      delete global.CSS;
      
      const supported = supportsCSSProperty('display', 'flex');
      
      expect(typeof supported).toBe('boolean');
    });
  });

  // ============================================
  // Responsive Design Tests
  // ============================================

  describe('Responsive Design', () => {
    it('should detect extra small breakpoint', () => {
      mockWindowDimensions(400, 800);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('xs');
    });

    it('should detect small breakpoint', () => {
      mockWindowDimensions(600, 800);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('sm');
    });

    it('should detect medium breakpoint', () => {
      mockWindowDimensions(800, 600);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('md');
    });

    it('should detect large breakpoint', () => {
      mockWindowDimensions(1000, 800);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('lg');
    });

    it('should detect extra large breakpoint', () => {
      mockWindowDimensions(1300, 900);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('xl');
    });

    it('should detect extra extra large breakpoint', () => {
      mockWindowDimensions(1500, 900);
      
      const breakpoint = getCurrentBreakpoint();
      
      expect(breakpoint).toBe('xxl');
    });

    it('should match breakpoint with media query', () => {
      mockWindowDimensions(400, 800);
      mockMatchMedia(true);
      
      const matches = matchesBreakpoint('xs');
      
      expect(typeof matches).toBe('boolean');
    });

    it('should get device pixel ratio', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        configurable: true,
      });
      
      const ratio = getDevicePixelRatio();
      
      expect(ratio).toBe(2);
    });

    it('should detect retina display', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        configurable: true,
      });
      
      const isRetina = isRetinaDisplay();
      
      expect(isRetina).toBe(true);
    });

    it('should detect non-retina display', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 1,
        configurable: true,
      });
      
      const isRetina = isRetinaDisplay();
      
      expect(isRetina).toBe(false);
    });

    it('should handle missing devicePixelRatio', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: undefined,
        configurable: true,
      });
      
      const ratio = getDevicePixelRatio();
      
      expect(ratio).toBe(1);
    });
  });

  // ============================================
  // Vendor Prefix Tests
  // ============================================

  describe('Vendor Prefixes', () => {
    it('should get vendor prefix', () => {
      const prefix = getVendorPrefix();
      
      expect(prefix).toHaveProperty('dom');
      expect(prefix).toHaveProperty('lowercase');
      expect(prefix).toHaveProperty('css');
      expect(prefix).toHaveProperty('js');
    });

    it('should add vendor prefix to CSS property', () => {
      const prefixed = addVendorPrefix('transform', 'rotate(45deg)');
      
      expect(prefixed).toBeDefined();
    });

    it('should return null for unsupported property', () => {
      const prefixed = addVendorPrefix('unsupportedProperty', 'value');
      
      expect(prefixed).toBeNull();
    });

    it('should use standard property when supported', () => {
      const prefixed = addVendorPrefix('display', 'flex');
      
      expect(prefixed).toHaveProperty('display');
    });
  });

  // ============================================
  // Event Compatibility Tests
  // ============================================

  describe('Event Compatibility', () => {
    it('should normalize wheel event with deltaX/deltaY', () => {
      const event = { deltaX: 10, deltaY: 20 };
      
      const normalized = normalizeWheelEvent(event);
      
      expect(normalized.deltaX).toBe(10);
      expect(normalized.deltaY).toBe(20);
    });

    it('should normalize wheel event with wheelDelta', () => {
      const event = { wheelDelta: -120 };
      
      const normalized = normalizeWheelEvent(event);
      
      expect(normalized.deltaY).toBe(120);
    });

    it('should normalize wheel event with detail', () => {
      const event = { detail: 3 };
      
      const normalized = normalizeWheelEvent(event);
      
      expect(normalized.deltaY).toBe(3);
    });

    it('should get pointer position from mouse event', () => {
      const event = { clientX: 100, clientY: 200 };
      
      const position = getPointerPosition(event);
      
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should get pointer position from touch event', () => {
      const event = {
        touches: [{ clientX: 150, clientY: 250 }],
      };
      
      const position = getPointerPosition(event);
      
      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    it('should detect touch event', () => {
      const event = { type: 'touchstart' };
      
      const isTouch = isTouchEvent(event);
      
      expect(isTouch).toBe(true);
    });

    it('should detect non-touch event', () => {
      const event = { type: 'mousedown' };
      
      const isTouch = isTouchEvent(event);
      
      expect(isTouch).toBe(false);
    });

    it('should detect pointer event', () => {
      const event = { type: 'pointerdown' };
      
      const isPointer = isPointerEvent(event);
      
      expect(isPointer).toBe(true);
    });

    it('should detect non-pointer event', () => {
      const event = { type: 'mousedown' };
      
      const isPointer = isPointerEvent(event);
      
      expect(isPointer).toBe(false);
    });

    it('should create touch event', () => {
      const touches = [{ clientX: 100, clientY: 200 }];
      
      const event = createTouchEvent('touchstart', touches);
      
      expect(event.type).toBe('touchstart');
      expect(event.touches).toEqual(touches);
    });

    it('should create pointer event', () => {
      const event = createPointerEvent('pointerdown', { pointerType: 'touch' });
      
      expect(event.type).toBe('pointerdown');
      expect(event.pointerType).toBe('touch');
    });
  });

  // ============================================
  // Storage Compatibility Tests
  // ============================================

  describe('Storage Compatibility', () => {
    it('should create safe localStorage wrapper', () => {
      const storage = new SafeStorage(localStorage);
      
      expect(storage).toBeDefined();
      expect(storage.available).toBe(true);
    });

    it('should get item from storage', () => {
      const storage = new SafeStorage(localStorage);
      localStorage.setItem('test', 'value');
      
      const value = storage.getItem('test');
      
      expect(value).toBe('value');
    });

    it('should set item in storage', () => {
      const storage = new SafeStorage(localStorage);
      
      const result = storage.setItem('test', 'value');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test')).toBe('value');
    });

    it('should remove item from storage', () => {
      const storage = new SafeStorage(localStorage);
      localStorage.setItem('test', 'value');
      
      const result = storage.removeItem('test');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should clear storage', () => {
      const storage = new SafeStorage(localStorage);
      localStorage.setItem('test1', 'value1');
      localStorage.setItem('test2', 'value2');
      
      const result = storage.clear();
      
      expect(result).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('should handle unavailable storage gracefully', () => {
      const mockStorage = {
        setItem: jest.fn(() => { throw new Error('Storage unavailable'); }),
        getItem: jest.fn(() => { throw new Error('Storage unavailable'); }),
        removeItem: jest.fn(() => { throw new Error('Storage unavailable'); }),
        clear: jest.fn(() => { throw new Error('Storage unavailable'); }),
      };
      
      const storage = new SafeStorage(mockStorage);
      
      expect(storage.available).toBe(false);
      expect(storage.getItem('test')).toBeNull();
      expect(storage.setItem('test', 'value')).toBe(false);
      expect(storage.removeItem('test')).toBe(false);
      expect(storage.clear()).toBe(false);
    });

    it('should handle storage quota exceeded', () => {
      const mockStorage = {
        setItem: jest.fn(() => { throw new Error('QuotaExceededError'); }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      
      const storage = new SafeStorage(mockStorage);
      
      const result = storage.setItem('test', 'value');
      
      expect(result).toBe(false);
    });
  });

  // ============================================
  // Touch and Pointer Events Tests
  // ============================================

  describe('Touch and Pointer Events', () => {
    it('should handle touch start event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('touchstart', handler);
      
      const event = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle touch move event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('touchmove', handler);
      
      const event = createTouchEvent('touchmove', [{ clientX: 150, clientY: 250 }]);
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle touch end event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('touchend', handler);
      
      const event = createTouchEvent('touchend', []);
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle pointer down event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('pointerdown', handler);
      
      const event = createPointerEvent('pointerdown');
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle pointer move event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('pointermove', handler);
      
      const event = createPointerEvent('pointermove');
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle pointer up event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('pointerup', handler);
      
      const event = createPointerEvent('pointerup');
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should differentiate pointer types', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      element.addEventListener('pointerdown', handler);
      
      const mouseEvent = createPointerEvent('pointerdown', { pointerType: 'mouse' });
      const touchEvent = createPointerEvent('pointerdown', { pointerType: 'touch' });
      const penEvent = createPointerEvent('pointerdown', { pointerType: 'pen' });
      
      element.dispatchEvent(mouseEvent);
      element.dispatchEvent(touchEvent);
      element.dispatchEvent(penEvent);
      
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================
  // Media Query Tests
  // ============================================

  describe('Media Queries', () => {
    it('should match media query', () => {
      mockMatchMedia(true);
      
      const matches = window.matchMedia('(min-width: 768px)').matches;
      
      expect(matches).toBe(true);
    });

    it('should not match media query', () => {
      mockMatchMedia(false);
      
      const matches = window.matchMedia('(min-width: 768px)').matches;
      
      expect(matches).toBe(false);
    });

    it('should add media query listener', () => {
      mockMatchMedia(true);
      
      const listener = jest.fn();
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addEventListener('change', listener);
      
      expect(mq.addEventListener).toHaveBeenCalledWith('change', listener);
    });

    it('should remove media query listener', () => {
      mockMatchMedia(true);
      
      const listener = jest.fn();
      const mq = window.matchMedia('(min-width: 768px)');
      mq.removeEventListener('change', listener);
      
      expect(mq.removeEventListener).toHaveBeenCalledWith('change', listener);
    });

    it('should support legacy addListener method', () => {
      mockMatchMedia(true);
      
      const listener = jest.fn();
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addListener(listener);
      
      expect(mq.addListener).toHaveBeenCalledWith(listener);
    });

    it('should support legacy removeListener method', () => {
      mockMatchMedia(true);
      
      const listener = jest.fn();
      const mq = window.matchMedia('(min-width: 768px)');
      mq.removeListener(listener);
      
      expect(mq.removeListener).toHaveBeenCalledWith(listener);
    });
  });

  // ============================================
  // Performance Tests
  // ============================================

  describe('Performance', () => {
    it('should detect features quickly', () => {
      const startTime = performance.now();
      
      supportsFeature('localStorage');
      supportsFeature('sessionStorage');
      supportsFeature('indexedDB');
      supportsFeature('fetch');
      supportsFeature('promise');
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle rapid breakpoint checks', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        getCurrentBreakpoint();
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle rapid storage operations', () => {
      const storage = new SafeStorage(localStorage);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        storage.setItem(`key${i}`, `value${i}`);
        storage.getItem(`key${i}`);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      
      storage.clear();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('should combine feature detection with responsive design', () => {
      mockWindowDimensions(400, 800);
      
      const breakpoint = getCurrentBreakpoint();
      const isMobile = isMobileDevice();
      const isTouch = isTouchDevice();
      
      expect(breakpoint).toBe('xs');
      expect(typeof isMobile).toBe('boolean');
      expect(typeof isTouch).toBe('boolean');
    });

    it('should handle storage with feature detection', () => {
      const hasLocalStorage = supportsFeature('localStorage');
      
      if (hasLocalStorage) {
        const storage = new SafeStorage(localStorage);
        storage.setItem('test', 'value');
        
        expect(storage.getItem('test')).toBe('value');
        
        storage.clear();
      }
      
      expect(typeof hasLocalStorage).toBe('boolean');
    });

    it('should combine event handling with browser detection', () => {
      const browser = detectBrowser();
      const element = document.createElement('div');
      document.body.appendChild(element);
      
      const handler = jest.fn();
      
      if (supportsFeature('pointerEvents')) {
        element.addEventListener('pointerdown', handler);
        const event = createPointerEvent('pointerdown');
        element.dispatchEvent(event);
      } else if (supportsFeature('touchEvents')) {
        element.addEventListener('touchstart', handler);
        const event = createTouchEvent('touchstart', []);
        element.dispatchEvent(event);
      } else {
        element.addEventListener('mousedown', handler);
        const event = new MouseEvent('mousedown', { bubbles: true });
        element.dispatchEvent(event);
      }
      
      expect(typeof browser).toBe('string');
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================

  describe('Edge Cases', () => {
    it('should handle missing window properties', () => {
      const originalInnerWidth = window.innerWidth;
      delete window.innerWidth;
      
      expect(() => getCurrentBreakpoint()).not.toThrow();
      
      window.innerWidth = originalInnerWidth;
    });

    it('should handle missing navigator properties', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: undefined,
        configurable: true,
      });
      
      expect(() => detectBrowser()).not.toThrow();
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
    });

    it('should handle storage errors gracefully', () => {
      const mockStorage = {
        setItem: jest.fn(() => { throw new Error('Storage error'); }),
        getItem: jest.fn(() => { throw new Error('Storage error'); }),
        removeItem: jest.fn(() => { throw new Error('Storage error'); }),
        clear: jest.fn(() => { throw new Error('Storage error'); }),
      };
      
      const storage = new SafeStorage(mockStorage);
      
      expect(() => storage.setItem('test', 'value')).not.toThrow();
      expect(() => storage.getItem('test')).not.toThrow();
      expect(() => storage.removeItem('test')).not.toThrow();
      expect(() => storage.clear()).not.toThrow();
    });

    it('should handle invalid CSS properties', () => {
      expect(() => supportsCSSProperty('invalid-property', 'invalid-value')).not.toThrow();
    });

    it('should handle missing CSS.supports', () => {
      const originalCSS = global.CSS;
      delete global.CSS;
      
      expect(() => supportsCSSProperty('display', 'flex')).not.toThrow();
      
      global.CSS = originalCSS;
    });
  });

  // ============================================
  // Accessibility Compatibility Tests
  // ============================================

  describe('Accessibility Compatibility', () => {
    it('should support ARIA attributes across browsers', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-label', 'Test Button');
      element.setAttribute('aria-expanded', 'false');
      
      expect(element.getAttribute('aria-label')).toBe('Test Button');
      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    it('should support focus management', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('should support keyboard navigation', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      const handler = jest.fn();
      button.addEventListener('keydown', handler);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      button.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should support screen reader announcements', () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);
      
      liveRegion.textContent = 'Test announcement';
      
      expect(liveRegion.textContent).toBe('Test announcement');
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    });
  });
});