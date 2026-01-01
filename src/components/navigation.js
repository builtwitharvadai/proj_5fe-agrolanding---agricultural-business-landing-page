/**
 * ============================================
 * AgroLanding - Navigation Component
 * Production-ready mobile navigation with smooth scrolling
 * ============================================
 * 
 * @module navigation
 * @description ES module for navigation functionality with mobile menu,
 * smooth scrolling, active section detection, and keyboard navigation
 * 
 * Features:
 * - Responsive hamburger menu for mobile devices
 * - Smooth scrolling to page sections
 * - Active section detection using Intersection Observer
 * - Keyboard navigation support (Tab, Enter, Escape)
 * - Touch-friendly interactions (44px+ tap targets)
 * - Auto-close menu on mobile after selection
 * - Scroll-based navigation styling
 * - Accessibility compliant (ARIA, focus management)
 * 
 * @generated-from task-id:AGRO-008
 * @modifies index.html navigation structure
 * @dependencies DOM API, Intersection Observer API
 */

// ============================================
// Constants and Configuration
// ============================================

const NAVIGATION_CONFIG = Object.freeze({
  MOBILE_BREAKPOINT: 768,
  SCROLL_OFFSET: 80,
  SCROLL_BEHAVIOR: 'smooth',
  INTERSECTION_THRESHOLD: 0.5,
  INTERSECTION_ROOT_MARGIN: '-80px 0px -50% 0px',
  DEBOUNCE_DELAY: 100,
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 50,
});

const SELECTORS = Object.freeze({
  NAV_CONTAINER: '.nav-container',
  NAV_TOGGLE: '.nav-toggle',
  NAV_MENU: '.nav-menu',
  NAV_OVERLAY: '.nav-overlay',
  NAV_LINKS: '.nav-link',
  NAV_BRAND: '.nav-brand',
  SECTIONS: 'section[id]',
});

const CLASSES = Object.freeze({
  SCROLLED: 'scrolled',
  ACTIVE: 'active',
  MENU_VISIBLE: 'data-visible',
  OVERLAY_VISIBLE: 'data-visible',
});

const ARIA_ATTRIBUTES = Object.freeze({
  EXPANDED: 'aria-expanded',
  CURRENT: 'aria-current',
  HIDDEN: 'aria-hidden',
  BUSY: 'aria-busy',
});

const KEYBOARD_KEYS = Object.freeze({
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
});

// ============================================
// State Management
// ============================================

const navigationState = {
  isMenuOpen: false,
  activeSection: null,
  isScrolling: false,
  lastScrollY: 0,
  intersectionObserver: null,
  resizeObserver: null,
  elements: {
    navContainer: null,
    navToggle: null,
    navMenu: null,
    navOverlay: null,
    navLinks: [],
    sections: [],
  },
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
 * Check if device is mobile based on viewport width
 * @returns {boolean} True if mobile viewport
 */
function isMobileViewport() {
  return window.innerWidth < NAVIGATION_CONFIG.MOBILE_BREAKPOINT;
}

/**
 * Get scroll offset for smooth scrolling
 * @returns {number} Offset in pixels
 */
function getScrollOffset() {
  const navHeight = navigationState.elements.navContainer?.offsetHeight || 0;
  return navHeight + NAVIGATION_CONFIG.SCROLL_OFFSET;
}

/**
 * Safely query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Found element or null
 */
function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`[Navigation] Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safely query all selectors with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Array<Element>} Array of found elements
 */
function safeQuerySelectorAll(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.error(`[Navigation] Invalid selector: ${selector}`, error);
    return [];
  }
}

// ============================================
// DOM Element Initialization
// ============================================

/**
 * Initialize and cache DOM elements
 * @returns {boolean} True if all required elements found
 */
function initializeElements() {
  try {
    navigationState.elements.navContainer = safeQuerySelector(SELECTORS.NAV_CONTAINER);
    navigationState.elements.navToggle = safeQuerySelector(SELECTORS.NAV_TOGGLE);
    navigationState.elements.navMenu = safeQuerySelector(SELECTORS.NAV_MENU);
    navigationState.elements.navLinks = safeQuerySelectorAll(SELECTORS.NAV_LINKS);
    navigationState.elements.sections = safeQuerySelectorAll(SELECTORS.SECTIONS);

    // Create overlay if it doesn't exist
    let overlay = safeQuerySelector(SELECTORS.NAV_OVERLAY);
    if (!overlay && navigationState.elements.navContainer) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.setAttribute(ARIA_ATTRIBUTES.HIDDEN, 'true');
      navigationState.elements.navContainer.parentElement?.appendChild(overlay);
    }
    navigationState.elements.navOverlay = overlay;

    const requiredElements = [
      navigationState.elements.navContainer,
      navigationState.elements.navMenu,
    ];

    const allElementsFound = requiredElements.every((el) => el !== null);

    if (!allElementsFound) {
      console.warn('[Navigation] Some required elements not found');
    }

    return allElementsFound;
  } catch (error) {
    console.error('[Navigation] Error initializing elements:', error);
    return false;
  }
}

// ============================================
// Mobile Menu Management
// ============================================

/**
 * Open mobile navigation menu
 */
function openMobileMenu() {
  if (!isMobileViewport() || navigationState.isMenuOpen) return;

  try {
    navigationState.isMenuOpen = true;

    const { navToggle, navMenu, navOverlay } = navigationState.elements;

    if (navToggle) {
      navToggle.setAttribute(ARIA_ATTRIBUTES.EXPANDED, 'true');
    }

    if (navMenu) {
      navMenu.setAttribute(CLASSES.MENU_VISIBLE, 'true');
      // Focus first link for keyboard navigation
      const firstLink = navMenu.querySelector(SELECTORS.NAV_LINKS);
      if (firstLink) {
        setTimeout(() => firstLink.focus(), NAVIGATION_CONFIG.ANIMATION_DURATION);
      }
    }

    if (navOverlay) {
      navOverlay.setAttribute(CLASSES.OVERLAY_VISIBLE, 'true');
      navOverlay.setAttribute(ARIA_ATTRIBUTES.HIDDEN, 'false');
    }

    // Prevent body scroll on mobile when menu is open
    document.body.style.overflow = 'hidden';

    console.log('[Navigation] Mobile menu opened');
  } catch (error) {
    console.error('[Navigation] Error opening mobile menu:', error);
  }
}

/**
 * Close mobile navigation menu
 */
function closeMobileMenu() {
  if (!navigationState.isMenuOpen) return;

  try {
    navigationState.isMenuOpen = false;

    const { navToggle, navMenu, navOverlay } = navigationState.elements;

    if (navToggle) {
      navToggle.setAttribute(ARIA_ATTRIBUTES.EXPANDED, 'false');
      // Return focus to toggle button
      navToggle.focus();
    }

    if (navMenu) {
      navMenu.setAttribute(CLASSES.MENU_VISIBLE, 'false');
    }

    if (navOverlay) {
      navOverlay.setAttribute(CLASSES.OVERLAY_VISIBLE, 'false');
      navOverlay.setAttribute(ARIA_ATTRIBUTES.HIDDEN, 'true');
    }

    // Restore body scroll
    document.body.style.overflow = '';

    console.log('[Navigation] Mobile menu closed');
  } catch (error) {
    console.error('[Navigation] Error closing mobile menu:', error);
  }
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
  if (navigationState.isMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

// ============================================
// Smooth Scrolling
// ============================================

/**
 * Smooth scroll to target section
 * @param {string} targetId - ID of target section
 * @param {Event} event - Original event (optional)
 */
function smoothScrollToSection(targetId, event = null) {
  if (event) {
    event.preventDefault();
  }

  try {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) {
      console.warn(`[Navigation] Section not found: ${targetId}`);
      return;
    }

    navigationState.isScrolling = true;

    const offset = getScrollOffset();
    const targetPosition = targetSection.offsetTop - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: NAVIGATION_CONFIG.SCROLL_BEHAVIOR,
    });

    // Close mobile menu after navigation
    if (isMobileViewport()) {
      setTimeout(() => {
        closeMobileMenu();
      }, NAVIGATION_CONFIG.ANIMATION_DURATION);
    }

    // Update URL hash without jumping
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `#${targetId}`);
    }

    // Reset scrolling flag after animation
    setTimeout(() => {
      navigationState.isScrolling = false;
    }, NAVIGATION_CONFIG.ANIMATION_DURATION * 2);

    console.log(`[Navigation] Scrolled to section: ${targetId}`);
  } catch (error) {
    console.error('[Navigation] Error during smooth scroll:', error);
    navigationState.isScrolling = false;
  }
}

/**
 * Handle navigation link click
 * @param {Event} event - Click event
 */
function handleNavLinkClick(event) {
  const link = event.currentTarget;
  const href = link.getAttribute('href');

  if (!href || !href.startsWith('#')) return;

  const targetId = href.substring(1);
  if (targetId) {
    smoothScrollToSection(targetId, event);
  }
}

// ============================================
// Active Section Detection
// ============================================

/**
 * Update active navigation link
 * @param {string} sectionId - ID of active section
 */
function updateActiveNavLink(sectionId) {
  if (navigationState.activeSection === sectionId) return;

  try {
    navigationState.activeSection = sectionId;

    navigationState.elements.navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${sectionId}`;

      if (isActive) {
        link.classList.add(CLASSES.ACTIVE);
        link.setAttribute(ARIA_ATTRIBUTES.CURRENT, 'page');
      } else {
        link.classList.remove(CLASSES.ACTIVE);
        link.removeAttribute(ARIA_ATTRIBUTES.CURRENT);
      }
    });

    console.log(`[Navigation] Active section: ${sectionId}`);
  } catch (error) {
    console.error('[Navigation] Error updating active link:', error);
  }
}

/**
 * Initialize Intersection Observer for section detection
 */
function initializeIntersectionObserver() {
  try {
    const options = {
      root: null,
      rootMargin: NAVIGATION_CONFIG.INTERSECTION_ROOT_MARGIN,
      threshold: NAVIGATION_CONFIG.INTERSECTION_THRESHOLD,
    };

    navigationState.intersectionObserver = new IntersectionObserver((entries) => {
      if (navigationState.isScrolling) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          updateActiveNavLink(sectionId);
        }
      });
    }, options);

    // Observe all sections
    navigationState.elements.sections.forEach((section) => {
      navigationState.intersectionObserver.observe(section);
    });

    console.log('[Navigation] Intersection Observer initialized');
  } catch (error) {
    console.error('[Navigation] Error initializing Intersection Observer:', error);
  }
}

// ============================================
// Scroll Event Handling
// ============================================

/**
 * Handle scroll events for navigation styling
 */
function handleScroll() {
  try {
    const currentScrollY = window.scrollY;
    const { navContainer } = navigationState.elements;

    if (!navContainer) return;

    // Add scrolled class when scrolled past threshold
    if (currentScrollY > NAVIGATION_CONFIG.SCROLL_THRESHOLD) {
      navContainer.classList.add(CLASSES.SCROLLED);
    } else {
      navContainer.classList.remove(CLASSES.SCROLLED);
    }

    navigationState.lastScrollY = currentScrollY;
  } catch (error) {
    console.error('[Navigation] Error handling scroll:', error);
  }
}

const debouncedHandleScroll = debounce(handleScroll, NAVIGATION_CONFIG.DEBOUNCE_DELAY);

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Handle keyboard events for navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
  const { key } = event;

  try {
    // Close menu on Escape
    if (key === KEYBOARD_KEYS.ESCAPE && navigationState.isMenuOpen) {
      event.preventDefault();
      closeMobileMenu();
      return;
    }

    // Handle Enter/Space on toggle button
    if (
      (key === KEYBOARD_KEYS.ENTER || key === KEYBOARD_KEYS.SPACE) &&
      event.target === navigationState.elements.navToggle
    ) {
      event.preventDefault();
      toggleMobileMenu();
      return;
    }

    // Trap focus within menu when open on mobile
    if (key === KEYBOARD_KEYS.TAB && navigationState.isMenuOpen && isMobileViewport()) {
      const { navMenu, navToggle } = navigationState.elements;
      if (!navMenu) return;

      const focusableElements = navMenu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        navToggle?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        navToggle?.focus();
      }
    }
  } catch (error) {
    console.error('[Navigation] Error handling keyboard navigation:', error);
  }
}

// ============================================
// Resize Handling
// ============================================

/**
 * Handle window resize events
 */
function handleResize() {
  try {
    // Close mobile menu when resizing to desktop
    if (!isMobileViewport() && navigationState.isMenuOpen) {
      closeMobileMenu();
    }
  } catch (error) {
    console.error('[Navigation] Error handling resize:', error);
  }
}

const debouncedHandleResize = debounce(handleResize, NAVIGATION_CONFIG.DEBOUNCE_DELAY);

// ============================================
// Event Listeners Setup
// ============================================

/**
 * Attach all event listeners
 */
function attachEventListeners() {
  try {
    const { navToggle, navOverlay, navLinks } = navigationState.elements;

    // Mobile menu toggle
    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Overlay click to close menu
    if (navOverlay) {
      navOverlay.addEventListener('click', closeMobileMenu);
    }

    // Navigation links
    navLinks.forEach((link) => {
      link.addEventListener('click', handleNavLinkClick);
    });

    // Scroll events
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Resize events
    window.addEventListener('resize', debouncedHandleResize);

    console.log('[Navigation] Event listeners attached');
  } catch (error) {
    console.error('[Navigation] Error attaching event listeners:', error);
  }
}

/**
 * Remove all event listeners (cleanup)
 */
function removeEventListeners() {
  try {
    const { navToggle, navOverlay, navLinks } = navigationState.elements;

    if (navToggle) {
      navToggle.removeEventListener('click', toggleMobileMenu);
    }

    if (navOverlay) {
      navOverlay.removeEventListener('click', closeMobileMenu);
    }

    navLinks.forEach((link) => {
      link.removeEventListener('click', handleNavLinkClick);
    });

    window.removeEventListener('scroll', debouncedHandleScroll);
    document.removeEventListener('keydown', handleKeyboardNavigation);
    window.removeEventListener('resize', debouncedHandleResize);

    console.log('[Navigation] Event listeners removed');
  } catch (error) {
    console.error('[Navigation] Error removing event listeners:', error);
  }
}

// ============================================
// Initialization and Cleanup
// ============================================

/**
 * Initialize navigation component
 * @returns {boolean} True if initialization successful
 */
export function initNavigation() {
  try {
    console.log('[Navigation] Initializing navigation component...');

    // Initialize DOM elements
    if (!initializeElements()) {
      console.error('[Navigation] Failed to initialize elements');
      return false;
    }

    // Attach event listeners
    attachEventListeners();

    // Initialize Intersection Observer
    initializeIntersectionObserver();

    // Initial scroll check
    handleScroll();

    // Handle initial hash in URL
    const initialHash = window.location.hash;
    if (initialHash) {
      const targetId = initialHash.substring(1);
      setTimeout(() => {
        smoothScrollToSection(targetId);
      }, 100);
    }

    console.log('[Navigation] Navigation component initialized successfully');
    return true;
  } catch (error) {
    console.error('[Navigation] Fatal error during initialization:', error);
    return false;
  }
}

/**
 * Cleanup navigation component
 */
export function cleanupNavigation() {
  try {
    console.log('[Navigation] Cleaning up navigation component...');

    // Remove event listeners
    removeEventListeners();

    // Disconnect observers
    if (navigationState.intersectionObserver) {
      navigationState.intersectionObserver.disconnect();
      navigationState.intersectionObserver = null;
    }

    // Close menu if open
    if (navigationState.isMenuOpen) {
      closeMobileMenu();
    }

    // Reset state
    navigationState.isMenuOpen = false;
    navigationState.activeSection = null;
    navigationState.isScrolling = false;

    console.log('[Navigation] Navigation component cleaned up');
  } catch (error) {
    console.error('[Navigation] Error during cleanup:', error);
  }
}

// ============================================
// Public API
// ============================================

/**
 * Navigate to specific section programmatically
 * @param {string} sectionId - ID of section to navigate to
 * @returns {boolean} True if navigation successful
 */
export function navigateToSection(sectionId) {
  try {
    if (!sectionId || typeof sectionId !== 'string') {
      console.error('[Navigation] Invalid section ID provided');
      return false;
    }

    smoothScrollToSection(sectionId);
    return true;
  } catch (error) {
    console.error('[Navigation] Error navigating to section:', error);
    return false;
  }
}

/**
 * Get current active section
 * @returns {string|null} ID of active section or null
 */
export function getActiveSection() {
  return navigationState.activeSection;
}

/**
 * Check if mobile menu is open
 * @returns {boolean} True if menu is open
 */
export function isMenuOpen() {
  return navigationState.isMenuOpen;
}

// ============================================
// Auto-initialization
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  // DOM already loaded
  initNavigation();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupNavigation);

// Export for module usage
export default {
  init: initNavigation,
  cleanup: cleanupNavigation,
  navigateToSection,
  getActiveSection,
  isMenuOpen,
};