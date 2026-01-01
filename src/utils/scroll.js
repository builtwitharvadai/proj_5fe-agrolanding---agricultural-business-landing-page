/**
 * ============================================
 * AgroLanding - Scroll Utilities
 * Production-ready smooth scrolling and section detection
 * ============================================
 * 
 * @module scroll
 * @description ES module for smooth scrolling functionality, section offset
 * calculation, Intersection Observer setup, and scroll performance optimization
 * 
 * Features:
 * - Smooth scrolling with configurable easing
 * - Section offset calculation with dynamic navigation height
 * - Intersection Observer for active section detection
 * - Scroll performance optimization with debouncing
 * - Scroll position restoration
 * - Scroll lock/unlock for modals
 * - Scroll direction detection
 * - Scroll progress tracking
 * - Cross-browser compatibility
 * 
 * @generated-from task-id:AGRO-008
 * @modifies Navigation component scroll behavior
 * @dependencies Intersection Observer API, requestAnimationFrame
 */

// ============================================
// Constants and Configuration
// ============================================

const SCROLL_CONFIG = Object.freeze({
  SMOOTH_DURATION: 800,
  EASING: 'easeInOutCubic',
  OFFSET_TOP: 80,
  DEBOUNCE_DELAY: 100,
  THROTTLE_DELAY: 16,
  INTERSECTION_THRESHOLD: [0, 0.25, 0.5, 0.75, 1],
  INTERSECTION_ROOT_MARGIN: '-80px 0px -50% 0px',
  SCROLL_LOCK_CLASS: 'scroll-locked',
  MIN_SCROLL_DISTANCE: 10,
});

const EASING_FUNCTIONS = Object.freeze({
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
});

// ============================================
// State Management
// ============================================

const scrollState = {
  isScrolling: false,
  scrollDirection: null,
  lastScrollY: 0,
  scrollProgress: 0,
  activeSection: null,
  intersectionObserver: null,
  scrollLocked: false,
  scrollPosition: 0,
  animationFrameId: null,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get easing function by name
 * @param {string} name - Easing function name
 * @returns {Function} Easing function
 */
function getEasingFunction(name) {
  return EASING_FUNCTIONS[name] || EASING_FUNCTIONS.easeInOutCubic;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} offset - Offset from top
 * @returns {boolean} True if element is in viewport
 */
function isElementInViewport(element, offset = 0) {
  if (!element) return false;

  try {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top <= windowHeight - offset && rect.bottom >= offset;
  } catch (error) {
    console.error('[Scroll] Error checking viewport:', error);
    return false;
  }
}

// ============================================
// Scroll Offset Calculation
// ============================================

/**
 * Get dynamic navigation height
 * @returns {number} Navigation height in pixels
 */
function getNavigationHeight() {
  try {
    const navContainer = document.querySelector('.nav-container');
    return navContainer ? navContainer.offsetHeight : 0;
  } catch (error) {
    console.error('[Scroll] Error getting navigation height:', error);
    return 0;
  }
}

/**
 * Calculate scroll offset for target element
 * @param {Element} element - Target element
 * @param {number} additionalOffset - Additional offset to apply
 * @returns {number} Calculated offset in pixels
 */
export function calculateScrollOffset(element, additionalOffset = 0) {
  if (!element) {
    console.warn('[Scroll] No element provided for offset calculation');
    return 0;
  }

  try {
    const navHeight = getNavigationHeight();
    const configOffset = SCROLL_CONFIG.OFFSET_TOP;
    const totalOffset = navHeight + configOffset + additionalOffset;

    return totalOffset;
  } catch (error) {
    console.error('[Scroll] Error calculating scroll offset:', error);
    return SCROLL_CONFIG.OFFSET_TOP;
  }
}

/**
 * Get element position relative to document
 * @param {Element} element - Target element
 * @returns {number} Element position in pixels
 */
export function getElementPosition(element) {
  if (!element) {
    console.warn('[Scroll] No element provided for position calculation');
    return 0;
  }

  try {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return rect.top + scrollTop;
  } catch (error) {
    console.error('[Scroll] Error getting element position:', error);
    return 0;
  }
}

/**
 * Calculate target scroll position
 * @param {Element} element - Target element
 * @param {number} additionalOffset - Additional offset to apply
 * @returns {number} Target scroll position
 */
export function calculateTargetPosition(element, additionalOffset = 0) {
  if (!element) {
    console.warn('[Scroll] No element provided for target calculation');
    return 0;
  }

  try {
    const elementPosition = getElementPosition(element);
    const offset = calculateScrollOffset(element, additionalOffset);
    const targetPosition = elementPosition - offset;

    return Math.max(0, targetPosition);
  } catch (error) {
    console.error('[Scroll] Error calculating target position:', error);
    return 0;
  }
}

// ============================================
// Smooth Scrolling Implementation
// ============================================

/**
 * Smooth scroll to position using requestAnimationFrame
 * @param {number} targetPosition - Target scroll position
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} easingName - Easing function name
 * @returns {Promise<void>} Promise that resolves when scroll completes
 */
export function smoothScrollToPosition(
  targetPosition,
  duration = SCROLL_CONFIG.SMOOTH_DURATION,
  easingName = SCROLL_CONFIG.EASING
) {
  return new Promise((resolve, reject) => {
    try {
      if (scrollState.animationFrameId) {
        cancelAnimationFrame(scrollState.animationFrameId);
      }

      const startPosition = window.pageYOffset || document.documentElement.scrollTop;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
      const easingFunction = getEasingFunction(easingName);

      scrollState.isScrolling = true;

      function animate(currentTime) {
        try {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easingFunction(progress);
          const currentPosition = startPosition + distance * easedProgress;

          window.scrollTo(0, currentPosition);

          if (progress < 1) {
            scrollState.animationFrameId = requestAnimationFrame(animate);
          } else {
            scrollState.isScrolling = false;
            scrollState.animationFrameId = null;
            resolve();
          }
        } catch (error) {
          scrollState.isScrolling = false;
          scrollState.animationFrameId = null;
          reject(error);
        }
      }

      scrollState.animationFrameId = requestAnimationFrame(animate);
    } catch (error) {
      console.error('[Scroll] Error during smooth scroll:', error);
      scrollState.isScrolling = false;
      reject(error);
    }
  });
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Target element or selector
 * @param {Object} options - Scroll options
 * @returns {Promise<void>} Promise that resolves when scroll completes
 */
export async function smoothScrollToElement(target, options = {}) {
  try {
    const element =
      typeof target === 'string' ? document.querySelector(target) : target;

    if (!element) {
      console.warn(`[Scroll] Element not found: ${target}`);
      return;
    }

    const {
      offset = 0,
      duration = SCROLL_CONFIG.SMOOTH_DURATION,
      easing = SCROLL_CONFIG.EASING,
    } = options;

    const targetPosition = calculateTargetPosition(element, offset);

    await smoothScrollToPosition(targetPosition, duration, easing);

    console.log(`[Scroll] Scrolled to element: ${element.id || 'unnamed'}`);
  } catch (error) {
    console.error('[Scroll] Error scrolling to element:', error);
    throw error;
  }
}

/**
 * Cancel ongoing scroll animation
 */
export function cancelScroll() {
  try {
    if (scrollState.animationFrameId) {
      cancelAnimationFrame(scrollState.animationFrameId);
      scrollState.animationFrameId = null;
    }
    scrollState.isScrolling = false;
    console.log('[Scroll] Scroll animation cancelled');
  } catch (error) {
    console.error('[Scroll] Error cancelling scroll:', error);
  }
}

// ============================================
// Intersection Observer Setup
// ============================================

/**
 * Create Intersection Observer for section detection
 * @param {Function} callback - Callback function for intersections
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver|null} Observer instance or null
 */
export function createSectionObserver(callback, options = {}) {
  try {
    if (!('IntersectionObserver' in window)) {
      console.warn('[Scroll] IntersectionObserver not supported');
      return null;
    }

    const defaultOptions = {
      root: null,
      rootMargin: SCROLL_CONFIG.INTERSECTION_ROOT_MARGIN,
      threshold: SCROLL_CONFIG.INTERSECTION_THRESHOLD,
    };

    const observerOptions = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver((entries) => {
      try {
        if (scrollState.isScrolling) return;

        entries.forEach((entry) => {
          if (typeof callback === 'function') {
            callback(entry);
          }
        });
      } catch (error) {
        console.error('[Scroll] Error in intersection callback:', error);
      }
    }, observerOptions);

    scrollState.intersectionObserver = observer;

    console.log('[Scroll] Intersection Observer created');
    return observer;
  } catch (error) {
    console.error('[Scroll] Error creating Intersection Observer:', error);
    return null;
  }
}

/**
 * Observe sections for active state detection
 * @param {string} selector - Section selector
 * @param {Function} callback - Callback for active section changes
 * @returns {IntersectionObserver|null} Observer instance or null
 */
export function observeSections(selector = 'section[id]', callback) {
  try {
    const sections = document.querySelectorAll(selector);

    if (sections.length === 0) {
      console.warn(`[Scroll] No sections found with selector: ${selector}`);
      return null;
    }

    const observer = createSectionObserver((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const sectionId = entry.target.id;
        if (scrollState.activeSection !== sectionId) {
          scrollState.activeSection = sectionId;
          if (typeof callback === 'function') {
            callback(sectionId, entry.target);
          }
        }
      }
    });

    if (observer) {
      sections.forEach((section) => observer.observe(section));
      console.log(`[Scroll] Observing ${sections.length} sections`);
    }

    return observer;
  } catch (error) {
    console.error('[Scroll] Error observing sections:', error);
    return null;
  }
}

/**
 * Disconnect Intersection Observer
 */
export function disconnectObserver() {
  try {
    if (scrollState.intersectionObserver) {
      scrollState.intersectionObserver.disconnect();
      scrollState.intersectionObserver = null;
      console.log('[Scroll] Intersection Observer disconnected');
    }
  } catch (error) {
    console.error('[Scroll] Error disconnecting observer:', error);
  }
}

// ============================================
// Scroll State Detection
// ============================================

/**
 * Detect scroll direction
 * @returns {string|null} 'up', 'down', or null
 */
export function getScrollDirection() {
  try {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const difference = currentScrollY - scrollState.lastScrollY;

    if (Math.abs(difference) < SCROLL_CONFIG.MIN_SCROLL_DISTANCE) {
      return null;
    }

    const direction = difference > 0 ? 'down' : 'up';
    scrollState.scrollDirection = direction;
    scrollState.lastScrollY = currentScrollY;

    return direction;
  } catch (error) {
    console.error('[Scroll] Error detecting scroll direction:', error);
    return null;
  }
}

/**
 * Calculate scroll progress (0-1)
 * @returns {number} Scroll progress between 0 and 1
 */
export function getScrollProgress() {
  try {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    const scrollableHeight = documentHeight - windowHeight;
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    const progress = scrollableHeight > 0 ? currentScroll / scrollableHeight : 0;
    scrollState.scrollProgress = clamp(progress, 0, 1);

    return scrollState.scrollProgress;
  } catch (error) {
    console.error('[Scroll] Error calculating scroll progress:', error);
    return 0;
  }
}

/**
 * Check if scrolling is in progress
 * @returns {boolean} True if scrolling
 */
export function isScrolling() {
  return scrollState.isScrolling;
}

/**
 * Get current active section
 * @returns {string|null} Active section ID or null
 */
export function getActiveSection() {
  return scrollState.activeSection;
}

// ============================================
// Scroll Lock/Unlock
// ============================================

/**
 * Lock scroll (for modals, overlays)
 */
export function lockScroll() {
  try {
    if (scrollState.scrollLocked) return;

    scrollState.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.body.classList.add(SCROLL_CONFIG.SCROLL_LOCK_CLASS);
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollState.scrollPosition}px`;
    document.body.style.width = '100%';

    scrollState.scrollLocked = true;
    console.log('[Scroll] Scroll locked');
  } catch (error) {
    console.error('[Scroll] Error locking scroll:', error);
  }
}

/**
 * Unlock scroll and restore position
 */
export function unlockScroll() {
  try {
    if (!scrollState.scrollLocked) return;

    document.body.classList.remove(SCROLL_CONFIG.SCROLL_LOCK_CLASS);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    window.scrollTo(0, scrollState.scrollPosition);

    scrollState.scrollLocked = false;
    console.log('[Scroll] Scroll unlocked');
  } catch (error) {
    console.error('[Scroll] Error unlocking scroll:', error);
  }
}

/**
 * Check if scroll is locked
 * @returns {boolean} True if scroll is locked
 */
export function isScrollLocked() {
  return scrollState.scrollLocked;
}

// ============================================
// Scroll Event Handlers
// ============================================

/**
 * Create optimized scroll handler
 * @param {Function} callback - Callback function
 * @param {Object} options - Handler options
 * @returns {Function} Optimized scroll handler
 */
export function createScrollHandler(callback, options = {}) {
  const { debounce: useDebounce = false, throttle: useThrottle = true } = options;

  if (typeof callback !== 'function') {
    console.error('[Scroll] Invalid callback provided');
    return () => {};
  }

  let handler = callback;

  if (useDebounce) {
    handler = debounce(callback, SCROLL_CONFIG.DEBOUNCE_DELAY);
  } else if (useThrottle) {
    handler = throttle(callback, SCROLL_CONFIG.THROTTLE_DELAY);
  }

  return handler;
}

// ============================================
// Scroll to Top
// ============================================

/**
 * Scroll to top of page
 * @param {Object} options - Scroll options
 * @returns {Promise<void>} Promise that resolves when scroll completes
 */
export async function scrollToTop(options = {}) {
  try {
    const { duration = SCROLL_CONFIG.SMOOTH_DURATION, easing = SCROLL_CONFIG.EASING } =
      options;

    await smoothScrollToPosition(0, duration, easing);
    console.log('[Scroll] Scrolled to top');
  } catch (error) {
    console.error('[Scroll] Error scrolling to top:', error);
    throw error;
  }
}

// ============================================
// Cleanup
// ============================================

/**
 * Cleanup scroll utilities
 */
export function cleanupScroll() {
  try {
    cancelScroll();
    disconnectObserver();
    unlockScroll();

    scrollState.activeSection = null;
    scrollState.scrollDirection = null;
    scrollState.lastScrollY = 0;
    scrollState.scrollProgress = 0;

    console.log('[Scroll] Scroll utilities cleaned up');
  } catch (error) {
    console.error('[Scroll] Error during cleanup:', error);
  }
}

// ============================================
// Public API
// ============================================

export default {
  calculateScrollOffset,
  calculateTargetPosition,
  getElementPosition,
  smoothScrollToElement,
  smoothScrollToPosition,
  cancelScroll,
  createSectionObserver,
  observeSections,
  disconnectObserver,
  getScrollDirection,
  getScrollProgress,
  isScrolling,
  getActiveSection,
  lockScroll,
  unlockScroll,
  isScrollLocked,
  createScrollHandler,
  scrollToTop,
  cleanup: cleanupScroll,
};