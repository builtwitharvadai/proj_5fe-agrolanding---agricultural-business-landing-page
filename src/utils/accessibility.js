/**
 * Accessibility Utilities Module
 * Production-ready accessibility enhancement functions for agricultural business landing page
 * 
 * @module utils/accessibility
 * @description Comprehensive accessibility utilities including keyboard navigation,
 * focus management, ARIA attribute helpers, and WCAG AA compliance features
 */

// ============================================
// Constants and Configuration
// ============================================

/**
 * Focusable element selectors for keyboard navigation
 * @constant {string}
 */
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

/**
 * Keyboard key codes for navigation
 * @constant {Object}
 */
const KEYS = Object.freeze({
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
});

/**
 * ARIA live region politeness levels
 * @constant {Object}
 */
const ARIA_LIVE = Object.freeze({
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
});

/**
 * Focus trap state management
 * @type {WeakMap<Element, Object>}
 */
const focusTrapState = new WeakMap();

/**
 * Announcement queue for screen readers
 * @type {Array<Object>}
 */
let announcementQueue = [];

/**
 * Live region element reference
 * @type {HTMLElement|null}
 */
let liveRegion = null;

// ============================================
// Focus Management Utilities
// ============================================

/**
 * Get all focusable elements within a container
 * @param {Element} container - Container element to search within
 * @returns {Array<Element>} Array of focusable elements
 */
export function getFocusableElements(container = document) {
  if (!container || !(container instanceof Element || container === document)) {
    console.error('[Accessibility] Invalid container provided to getFocusableElements');
    return [];
  }

  try {
    const elements = Array.from(container.querySelectorAll(FOCUSABLE_ELEMENTS));
    
    return elements.filter((element) => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true' &&
        window.getComputedStyle(element).visibility !== 'hidden'
      );
    });
  } catch (error) {
    console.error('[Accessibility] Error getting focusable elements:', error);
    return [];
  }
}

/**
 * Get the first focusable element within a container
 * @param {Element} container - Container element to search within
 * @returns {Element|null} First focusable element or null
 */
export function getFirstFocusableElement(container) {
  const elements = getFocusableElements(container);
  return elements.length > 0 ? elements[0] : null;
}

/**
 * Get the last focusable element within a container
 * @param {Element} container - Container element to search within
 * @returns {Element|null} Last focusable element or null
 */
export function getLastFocusableElement(container) {
  const elements = getFocusableElements(container);
  return elements.length > 0 ? elements[elements.length - 1] : null;
}

/**
 * Set focus to an element with error handling
 * @param {Element} element - Element to focus
 * @param {Object} options - Focus options
 * @param {boolean} options.preventScroll - Prevent scrolling on focus
 * @param {boolean} options.setTabIndex - Set tabindex if not focusable
 * @returns {boolean} True if focus was successful
 */
export function setFocus(element, options = {}) {
  const { preventScroll = false, setTabIndex = false } = options;

  if (!element || !(element instanceof Element)) {
    console.error('[Accessibility] Invalid element provided to setFocus');
    return false;
  }

  try {
    if (setTabIndex && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }

    element.focus({ preventScroll });
    
    return document.activeElement === element;
  } catch (error) {
    console.error('[Accessibility] Error setting focus:', error);
    return false;
  }
}

/**
 * Restore focus to a previously focused element
 * @param {Element} element - Element to restore focus to
 * @returns {boolean} True if focus was restored
 */
export function restoreFocus(element) {
  if (!element || !(element instanceof Element)) {
    return false;
  }

  return setFocus(element);
}

// ============================================
// Focus Trap Implementation
// ============================================

/**
 * Create a focus trap within a container
 * @param {Element} container - Container element to trap focus within
 * @param {Object} options - Focus trap options
 * @param {Element} options.initialFocus - Element to focus initially
 * @param {Element} options.returnFocus - Element to return focus to on release
 * @param {boolean} options.allowOutsideClick - Allow clicks outside the trap
 * @returns {Object} Focus trap controller
 */
export function createFocusTrap(container, options = {}) {
  const {
    initialFocus = null,
    returnFocus = document.activeElement,
    allowOutsideClick = false,
  } = options;

  if (!container || !(container instanceof Element)) {
    console.error('[Accessibility] Invalid container provided to createFocusTrap');
    return null;
  }

  const state = {
    active: false,
    container,
    returnFocus,
    allowOutsideClick,
  };

  /**
   * Handle tab key navigation within trap
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleTabKey = (event) => {
    if (event.key !== KEYS.TAB) return;

    const focusableElements = getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentElement = document.activeElement;

    if (event.shiftKey) {
      if (currentElement === firstElement || !container.contains(currentElement)) {
        event.preventDefault();
        setFocus(lastElement);
      }
    } else {
      if (currentElement === lastElement || !container.contains(currentElement)) {
        event.preventDefault();
        setFocus(firstElement);
      }
    }
  };

  /**
   * Handle escape key to release trap
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleEscapeKey = (event) => {
    if (event.key === KEYS.ESCAPE) {
      controller.release();
    }
  };

  /**
   * Handle clicks outside the trap
   * @param {MouseEvent} event - Mouse event
   */
  const handleOutsideClick = (event) => {
    if (!allowOutsideClick && !container.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      
      const firstElement = getFirstFocusableElement(container);
      if (firstElement) {
        setFocus(firstElement);
      }
    }
  };

  const controller = {
    /**
     * Activate the focus trap
     */
    activate() {
      if (state.active) return;

      state.active = true;
      focusTrapState.set(container, state);

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleOutsideClick, true);

      if (initialFocus) {
        setFocus(initialFocus);
      } else {
        const firstElement = getFirstFocusableElement(container);
        if (firstElement) {
          setFocus(firstElement);
        }
      }

      console.log('[Accessibility] Focus trap activated');
    },

    /**
     * Release the focus trap
     */
    release() {
      if (!state.active) return;

      state.active = false;
      focusTrapState.delete(container);

      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleOutsideClick, true);

      if (returnFocus && returnFocus instanceof Element) {
        restoreFocus(returnFocus);
      }

      console.log('[Accessibility] Focus trap released');
    },

    /**
     * Check if trap is active
     * @returns {boolean} True if trap is active
     */
    isActive() {
      return state.active;
    },
  };

  return controller;
}

// ============================================
// Keyboard Navigation Utilities
// ============================================

/**
 * Handle roving tabindex navigation for a group of elements
 * @param {Array<Element>} elements - Elements to manage
 * @param {Object} options - Navigation options
 * @param {string} options.orientation - Navigation orientation (horizontal/vertical)
 * @param {boolean} options.wrap - Wrap navigation at boundaries
 * @returns {Object} Navigation controller
 */
export function createRovingTabindex(elements, options = {}) {
  const { orientation = 'horizontal', wrap = true } = options;

  if (!Array.isArray(elements) || elements.length === 0) {
    console.error('[Accessibility] Invalid elements provided to createRovingTabindex');
    return null;
  }

  let currentIndex = 0;

  /**
   * Update tabindex attributes
   */
  const updateTabindex = () => {
    elements.forEach((element, index) => {
      if (index === currentIndex) {
        element.setAttribute('tabindex', '0');
      } else {
        element.setAttribute('tabindex', '-1');
      }
    });
  };

  /**
   * Move focus to specific index
   * @param {number} index - Target index
   */
  const moveTo = (index) => {
    if (index < 0 || index >= elements.length) return;

    currentIndex = index;
    updateTabindex();
    setFocus(elements[currentIndex]);
  };

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeydown = (event) => {
    const { key } = event;
    let handled = false;

    if (orientation === 'horizontal') {
      if (key === KEYS.ARROW_LEFT) {
        const newIndex = currentIndex - 1;
        moveTo(wrap && newIndex < 0 ? elements.length - 1 : newIndex);
        handled = true;
      } else if (key === KEYS.ARROW_RIGHT) {
        const newIndex = currentIndex + 1;
        moveTo(wrap && newIndex >= elements.length ? 0 : newIndex);
        handled = true;
      }
    } else if (orientation === 'vertical') {
      if (key === KEYS.ARROW_UP) {
        const newIndex = currentIndex - 1;
        moveTo(wrap && newIndex < 0 ? elements.length - 1 : newIndex);
        handled = true;
      } else if (key === KEYS.ARROW_DOWN) {
        const newIndex = currentIndex + 1;
        moveTo(wrap && newIndex >= elements.length ? 0 : newIndex);
        handled = true;
      }
    }

    if (key === KEYS.HOME) {
      moveTo(0);
      handled = true;
    } else if (key === KEYS.END) {
      moveTo(elements.length - 1);
      handled = true;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  elements.forEach((element, index) => {
    element.addEventListener('keydown', handleKeydown);
    element.addEventListener('focus', () => {
      currentIndex = index;
      updateTabindex();
    });
  });

  updateTabindex();

  return {
    /**
     * Move to specific index
     * @param {number} index - Target index
     */
    moveTo,

    /**
     * Get current index
     * @returns {number} Current index
     */
    getCurrentIndex() {
      return currentIndex;
    },

    /**
     * Destroy the controller
     */
    destroy() {
      elements.forEach((element) => {
        element.removeEventListener('keydown', handleKeydown);
      });
    },
  };
}

// ============================================
// ARIA Attribute Helpers
// ============================================

/**
 * Set ARIA attributes on an element
 * @param {Element} element - Target element
 * @param {Object} attributes - ARIA attributes to set
 */
export function setAriaAttributes(element, attributes) {
  if (!element || !(element instanceof Element)) {
    console.error('[Accessibility] Invalid element provided to setAriaAttributes');
    return;
  }

  if (!attributes || typeof attributes !== 'object') {
    console.error('[Accessibility] Invalid attributes provided to setAriaAttributes');
    return;
  }

  try {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      
      if (value === null || value === undefined) {
        element.removeAttribute(ariaKey);
      } else {
        element.setAttribute(ariaKey, String(value));
      }
    });
  } catch (error) {
    console.error('[Accessibility] Error setting ARIA attributes:', error);
  }
}

/**
 * Toggle ARIA expanded state
 * @param {Element} element - Target element
 * @param {boolean} expanded - Expanded state
 */
export function toggleAriaExpanded(element, expanded) {
  if (!element || !(element instanceof Element)) {
    console.error('[Accessibility] Invalid element provided to toggleAriaExpanded');
    return;
  }

  element.setAttribute('aria-expanded', String(Boolean(expanded)));
}

/**
 * Toggle ARIA hidden state
 * @param {Element} element - Target element
 * @param {boolean} hidden - Hidden state
 */
export function toggleAriaHidden(element, hidden) {
  if (!element || !(element instanceof Element)) {
    console.error('[Accessibility] Invalid element provided to toggleAriaHidden');
    return;
  }

  if (hidden) {
    element.setAttribute('aria-hidden', 'true');
  } else {
    element.removeAttribute('aria-hidden');
  }
}

/**
 * Set ARIA live region properties
 * @param {Element} element - Target element
 * @param {Object} options - Live region options
 * @param {string} options.politeness - Politeness level (off/polite/assertive)
 * @param {boolean} options.atomic - Atomic updates
 * @param {string} options.relevant - Relevant changes
 */
export function setAriaLive(element, options = {}) {
  const {
    politeness = ARIA_LIVE.POLITE,
    atomic = false,
    relevant = 'additions text',
  } = options;

  if (!element || !(element instanceof Element)) {
    console.error('[Accessibility] Invalid element provided to setAriaLive');
    return;
  }

  setAriaAttributes(element, {
    'aria-live': politeness,
    'aria-atomic': String(atomic),
    'aria-relevant': relevant,
  });
}

// ============================================
// Screen Reader Announcements
// ============================================

/**
 * Initialize live region for announcements
 */
function initializeLiveRegion() {
  if (liveRegion) return;

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  `;

  document.body.appendChild(liveRegion);
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {Object} options - Announcement options
 * @param {string} options.politeness - Politeness level (polite/assertive)
 * @param {number} options.delay - Delay before announcement (ms)
 * @param {boolean} options.clear - Clear previous announcements
 */
export function announce(message, options = {}) {
  const {
    politeness = ARIA_LIVE.POLITE,
    delay = 100,
    clear = false,
  } = options;

  if (!message || typeof message !== 'string') {
    console.error('[Accessibility] Invalid message provided to announce');
    return;
  }

  initializeLiveRegion();

  if (clear) {
    announcementQueue = [];
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }

  announcementQueue.push({ message, politeness, delay });

  const processQueue = () => {
    if (announcementQueue.length === 0 || !liveRegion) return;

    const announcement = announcementQueue.shift();
    
    liveRegion.setAttribute('aria-live', announcement.politeness);
    
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = announcement.message;
        
        setTimeout(() => {
          if (liveRegion && announcementQueue.length === 0) {
            liveRegion.textContent = '';
          }
          processQueue();
        }, 1000);
      }
    }, announcement.delay);
  };

  if (announcementQueue.length === 1) {
    processQueue();
  }
}

// ============================================
// Skip Link Utilities
// ============================================

/**
 * Initialize skip links for keyboard navigation
 * @param {Object} options - Skip link options
 * @param {string} options.mainContentId - ID of main content element
 * @param {Array<Object>} options.additionalLinks - Additional skip links
 */
export function initializeSkipLinks(options = {}) {
  const {
    mainContentId = 'main',
    additionalLinks = [],
  } = options;

  const skipLinks = [
    { text: 'Skip to main content', target: `#${mainContentId}` },
    ...additionalLinks,
  ];

  skipLinks.forEach(({ text, target }) => {
    const link = document.querySelector(`a[href="${target}"]`);
    
    if (link) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        
        const targetElement = document.querySelector(target);
        
        if (targetElement) {
          setFocus(targetElement, { setTabIndex: true });
          
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', target);
          }
        }
      });
    }
  });

  console.log('[Accessibility] Skip links initialized');
}

// ============================================
// Color Contrast Utilities
// ============================================

/**
 * Calculate relative luminance of a color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} Relative luminance
 */
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex or rgb)
 * @param {string} color2 - Second color (hex or rgb)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const parseColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  };

  try {
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);

    const l1 = getRelativeLuminance(c1.r, c1.g, c1.b);
    const l2 = getRelativeLuminance(c2.r, c2.g, c2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.error('[Accessibility] Error calculating contrast ratio:', error);
    return 0;
  }
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - Text level (normal/large)
 * @returns {boolean} True if meets standards
 */
export function meetsWCAGAA(ratio, level = 'normal') {
  const threshold = level === 'large' ? 3 : 4.5;
  return ratio >= threshold;
}

// ============================================
// Module Exports
// ============================================

export {
  KEYS,
  ARIA_LIVE,
  FOCUSABLE_ELEMENTS,
};