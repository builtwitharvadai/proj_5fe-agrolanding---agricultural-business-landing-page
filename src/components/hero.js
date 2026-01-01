/**
 * AgroLanding - Hero Section Interactive Functionality
 * Production-ready ES module for hero section enhancements
 * 
 * @module hero
 * @description Handles hero section interactive features including CTA button clicks,
 * smooth scrolling, responsive image loading optimization, and performance monitoring
 */

// ============================================
// Constants and Configuration
// ============================================

/**
 * Hero section configuration
 * @type {Object}
 */
const HERO_CONFIG = Object.freeze({
  SECTION_ID: 'home',
  TITLE_ID: 'hero-title',
  CTA_PRIMARY_SELECTOR: '.hero-actions .btn-primary',
  CTA_SECONDARY_SELECTOR: '.hero-actions .btn-secondary',
  HERO_IMAGE_SELECTOR: '.hero-image img',
  SCROLL_BEHAVIOR: 'smooth',
  SCROLL_BLOCK: 'start',
  IMAGE_LOAD_TIMEOUT: 5000,
  PERFORMANCE_MARK_PREFIX: 'hero',
});

/**
 * Performance metrics tracking
 * @type {Object}
 */
const performanceMetrics = {
  heroLoadStart: 0,
  heroLoadEnd: 0,
  imageLoadStart: 0,
  imageLoadEnd: 0,
  ctaClicks: 0,
  scrollEvents: 0,
};

// ============================================
// DOM Element References
// ============================================

/**
 * Cached DOM element references for hero section
 * @type {Object}
 */
let heroElements = {
  section: null,
  title: null,
  ctaPrimary: null,
  ctaSecondary: null,
  heroImage: null,
  allCTAButtons: [],
};

// ============================================
// Utility Functions
// ============================================

/**
 * Safely query DOM element with error handling and logging
 * @param {string} selector - CSS selector string
 * @param {Element} [context=document] - Context element for scoped queries
 * @returns {Element|null} Found element or null
 */
function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`[Hero] Failed to query selector: ${selector}`, {
      error: error.message,
      selector,
      context: context.nodeName,
    });
    return null;
  }
}

/**
 * Safely query all DOM elements with error handling
 * @param {string} selector - CSS selector string
 * @param {Element} [context=document] - Context element for scoped queries
 * @returns {NodeList|Array} Found elements or empty array
 */
function safeQuerySelectorAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.error(`[Hero] Failed to query selector all: ${selector}`, {
      error: error.message,
      selector,
    });
    return [];
  }
}

/**
 * Create performance mark with error handling
 * @param {string} markName - Name of the performance mark
 */
function createPerformanceMark(markName) {
  try {
    if (window.performance && window.performance.mark) {
      performance.mark(`${HERO_CONFIG.PERFORMANCE_MARK_PREFIX}-${markName}`);
    }
  } catch (error) {
    console.warn(`[Hero] Failed to create performance mark: ${markName}`, error);
  }
}

/**
 * Measure performance between two marks
 * @param {string} measureName - Name of the measurement
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 * @returns {number|null} Duration in milliseconds or null
 */
function measurePerformance(measureName, startMark, endMark) {
  try {
    if (window.performance && window.performance.measure) {
      const fullStartMark = `${HERO_CONFIG.PERFORMANCE_MARK_PREFIX}-${startMark}`;
      const fullEndMark = `${HERO_CONFIG.PERFORMANCE_MARK_PREFIX}-${endMark}`;
      
      performance.measure(
        `${HERO_CONFIG.PERFORMANCE_MARK_PREFIX}-${measureName}`,
        fullStartMark,
        fullEndMark
      );
      
      const measure = performance.getEntriesByName(
        `${HERO_CONFIG.PERFORMANCE_MARK_PREFIX}-${measureName}`
      )[0];
      
      return measure ? measure.duration : null;
    }
  } catch (error) {
    console.warn(`[Hero] Failed to measure performance: ${measureName}`, error);
  }
  return null;
}

// ============================================
// Image Loading Optimization
// ============================================

/**
 * Optimize hero image loading with responsive srcset and lazy loading
 * @param {HTMLImageElement} imageElement - Image element to optimize
 */
function optimizeImageLoading(imageElement) {
  if (!imageElement) {
    console.warn('[Hero] Image element not found for optimization');
    return;
  }

  createPerformanceMark('image-load-start');
  performanceMetrics.imageLoadStart = Date.now();

  // Set loading priority for hero image
  imageElement.loading = 'eager';
  imageElement.fetchPriority = 'high';

  // Add load event listener for performance tracking
  imageElement.addEventListener('load', handleImageLoad, { once: true });
  
  // Add error event listener for fallback handling
  imageElement.addEventListener('error', handleImageError, { once: true });

  // Set timeout for image loading
  const loadTimeout = setTimeout(() => {
    if (!imageElement.complete) {
      console.warn('[Hero] Image loading timeout exceeded', {
        src: imageElement.src,
        timeout: HERO_CONFIG.IMAGE_LOAD_TIMEOUT,
      });
    }
  }, HERO_CONFIG.IMAGE_LOAD_TIMEOUT);

  // Store timeout reference for cleanup
  imageElement.dataset.loadTimeout = loadTimeout;
}

/**
 * Handle successful image load
 * @param {Event} event - Load event
 */
function handleImageLoad(event) {
  const imageElement = event.target;
  
  createPerformanceMark('image-load-end');
  performanceMetrics.imageLoadEnd = Date.now();

  const loadDuration = performanceMetrics.imageLoadEnd - performanceMetrics.imageLoadStart;
  
  console.log('[Hero] Image loaded successfully', {
    src: imageElement.src,
    duration: `${loadDuration}ms`,
    naturalWidth: imageElement.naturalWidth,
    naturalHeight: imageElement.naturalHeight,
  });

  // Clear timeout
  if (imageElement.dataset.loadTimeout) {
    clearTimeout(parseInt(imageElement.dataset.loadTimeout, 10));
    delete imageElement.dataset.loadTimeout;
  }

  // Measure performance
  const duration = measurePerformance('image-load', 'image-load-start', 'image-load-end');
  if (duration !== null) {
    console.log('[Hero] Image load performance:', {
      duration: `${duration.toFixed(2)}ms`,
      metric: 'hero-image-load-time',
    });
  }
}

/**
 * Handle image load error with fallback
 * @param {Event} event - Error event
 */
function handleImageError(event) {
  const imageElement = event.target;
  
  console.error('[Hero] Image failed to load', {
    src: imageElement.src,
    error: 'Image load error',
  });

  // Clear timeout
  if (imageElement.dataset.loadTimeout) {
    clearTimeout(parseInt(imageElement.dataset.loadTimeout, 10));
    delete imageElement.dataset.loadTimeout;
  }

  // Apply fallback styling
  const imageContainer = imageElement.closest('.hero-image');
  if (imageContainer) {
    imageContainer.style.backgroundColor = 'var(--color-primary-100)';
    imageContainer.setAttribute('aria-label', 'Hero image unavailable');
  }
}

// ============================================
// CTA Button Interaction Handling
// ============================================

/**
 * Handle CTA button click events
 * @param {Event} event - Click event
 */
function handleCTAClick(event) {
  const button = event.currentTarget;
  const href = button.getAttribute('href');

  // Track CTA click
  performanceMetrics.ctaClicks += 1;

  console.log('[Hero] CTA button clicked', {
    buttonText: button.textContent.trim(),
    href,
    clickCount: performanceMetrics.ctaClicks,
    timestamp: new Date().toISOString(),
  });

  // If it's an anchor link, handle smooth scrolling
  if (href && href.startsWith('#')) {
    event.preventDefault();
    
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      smoothScrollToElement(targetElement, href);
    } else {
      console.warn('[Hero] Target element not found for CTA', {
        targetId,
        href,
      });
    }
  }

  // Add visual feedback
  addButtonClickFeedback(button);
}

/**
 * Add visual feedback to button click
 * @param {HTMLElement} button - Button element
 */
function addButtonClickFeedback(button) {
  if (!button) return;

  // Add active class temporarily
  button.classList.add('btn-active');
  
  setTimeout(() => {
    button.classList.remove('btn-active');
  }, 200);
}

/**
 * Smooth scroll to target element with accessibility support
 * @param {HTMLElement} targetElement - Element to scroll to
 * @param {string} href - Original href for history update
 */
function smoothScrollToElement(targetElement, href) {
  if (!targetElement) return;

  performanceMetrics.scrollEvents += 1;

  console.log('[Hero] Initiating smooth scroll', {
    targetId: targetElement.id,
    scrollEvents: performanceMetrics.scrollEvents,
  });

  try {
    // Perform smooth scroll
    targetElement.scrollIntoView({
      behavior: HERO_CONFIG.SCROLL_BEHAVIOR,
      block: HERO_CONFIG.SCROLL_BLOCK,
    });

    // Update focus for accessibility
    targetElement.setAttribute('tabindex', '-1');
    targetElement.focus({ preventScroll: true });

    // Remove tabindex after focus to restore natural tab order
    setTimeout(() => {
      targetElement.removeAttribute('tabindex');
    }, 100);

    // Update URL without triggering navigation
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', href);
    }

    console.log('[Hero] Smooth scroll completed', {
      targetId: targetElement.id,
    });
  } catch (error) {
    console.error('[Hero] Smooth scroll failed', {
      error: error.message,
      targetId: targetElement.id,
    });
  }
}

// ============================================
// Intersection Observer for Performance
// ============================================

/**
 * Initialize Intersection Observer for hero section visibility tracking
 */
function initializeIntersectionObserver() {
  if (!('IntersectionObserver' in window)) {
    console.warn('[Hero] IntersectionObserver not supported');
    return;
  }

  const heroSection = heroElements.section;
  if (!heroSection) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log('[Hero] Hero section is visible', {
          intersectionRatio: entry.intersectionRatio,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }, observerOptions);

  observer.observe(heroSection);
}

// ============================================
// Initialization Functions
// ============================================

/**
 * Initialize DOM element references for hero section
 */
function initializeHeroDOMReferences() {
  heroElements = {
    section: safeQuerySelector(`#${HERO_CONFIG.SECTION_ID}`),
    title: safeQuerySelector(`#${HERO_CONFIG.TITLE_ID}`),
    ctaPrimary: safeQuerySelector(HERO_CONFIG.CTA_PRIMARY_SELECTOR),
    ctaSecondary: safeQuerySelector(HERO_CONFIG.CTA_SECONDARY_SELECTOR),
    heroImage: safeQuerySelector(HERO_CONFIG.HERO_IMAGE_SELECTOR),
    allCTAButtons: Array.from(safeQuerySelectorAll('.hero-actions .btn')),
  };

  console.log('[Hero] DOM references initialized', {
    section: !!heroElements.section,
    title: !!heroElements.title,
    ctaPrimary: !!heroElements.ctaPrimary,
    ctaSecondary: !!heroElements.ctaSecondary,
    heroImage: !!heroElements.heroImage,
    ctaButtonCount: heroElements.allCTAButtons.length,
  });
}

/**
 * Initialize CTA button event listeners
 */
function initializeCTAListeners() {
  const { allCTAButtons } = heroElements;

  if (allCTAButtons.length === 0) {
    console.warn('[Hero] No CTA buttons found');
    return;
  }

  allCTAButtons.forEach((button) => {
    button.addEventListener('click', handleCTAClick);
  });

  console.log('[Hero] CTA listeners initialized', {
    buttonCount: allCTAButtons.length,
  });
}

/**
 * Initialize hero section functionality
 */
function initializeHeroSection() {
  try {
    console.log('[Hero] Initializing hero section...');

    createPerformanceMark('hero-init-start');
    performanceMetrics.heroLoadStart = Date.now();

    // Initialize DOM references
    initializeHeroDOMReferences();

    // Initialize CTA button listeners
    initializeCTAListeners();

    // Optimize image loading
    if (heroElements.heroImage) {
      optimizeImageLoading(heroElements.heroImage);
    }

    // Initialize intersection observer
    initializeIntersectionObserver();

    createPerformanceMark('hero-init-end');
    performanceMetrics.heroLoadEnd = Date.now();

    const initDuration = performanceMetrics.heroLoadEnd - performanceMetrics.heroLoadStart;

    console.log('[Hero] Hero section initialized successfully', {
      duration: `${initDuration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Measure initialization performance
    const duration = measurePerformance('hero-init', 'hero-init-start', 'hero-init-end');
    if (duration !== null) {
      console.log('[Hero] Initialization performance:', {
        duration: `${duration.toFixed(2)}ms`,
        metric: 'hero-init-time',
      });
    }
  } catch (error) {
    console.error('[Hero] Initialization error:', {
      error: error.message,
      stack: error.stack,
    });
  }
}

// ============================================
// Module Entry Point
// ============================================

/**
 * Wait for DOM to be ready before initializing hero section
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHeroSection);
} else {
  // DOM is already ready
  initializeHeroSection();
}

// ============================================
// Module Exports
// ============================================

export { initializeHeroSection, performanceMetrics };