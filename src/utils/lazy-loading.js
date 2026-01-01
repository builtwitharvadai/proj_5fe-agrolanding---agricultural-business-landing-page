/**
 * Lazy Loading Utility Module
 * Production-ready ES module for image and content lazy loading optimization
 * 
 * @module lazy-loading
 * @description Implements Intersection Observer-based lazy loading with progressive
 * image enhancement, performance monitoring, and comprehensive error handling
 */

// ============================================
// Constants and Configuration
// ============================================

/**
 * Default configuration for lazy loading behavior
 * @type {Object}
 */
const DEFAULT_CONFIG = Object.freeze({
  rootMargin: '50px',
  threshold: 0.01,
  enablePerformanceMonitoring: true,
  retryAttempts: 3,
  retryDelay: 1000,
  placeholderClass: 'lazy-placeholder',
  loadedClass: 'lazy-loaded',
  errorClass: 'lazy-error',
  loadingClass: 'lazy-loading',
});

/**
 * Performance metrics storage
 * @type {Map<string, Object>}
 */
const performanceMetrics = new Map();

/**
 * Loading state tracking
 * @type {WeakMap<Element, Object>}
 */
const loadingStates = new WeakMap();

/**
 * Intersection Observer instance cache
 * @type {WeakMap<Object, IntersectionObserver>}
 */
const observerCache = new WeakMap();

// ============================================
// Utility Functions
// ============================================

/**
 * Generate unique identifier for tracking
 * @returns {string} Unique identifier
 */
function generateId() {
  return `lazy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely get element attribute with fallback
 * @param {Element} element - DOM element
 * @param {string} attribute - Attribute name
 * @param {string} fallback - Fallback value
 * @returns {string} Attribute value or fallback
 */
function getAttributeSafe(element, attribute, fallback = '') {
  try {
    return element.getAttribute(attribute) || fallback;
  } catch (error) {
    console.error('[LazyLoading] Failed to get attribute:', { attribute, error });
    return fallback;
  }
}

/**
 * Safely set element attribute with error handling
 * @param {Element} element - DOM element
 * @param {string} attribute - Attribute name
 * @param {string} value - Attribute value
 */
function setAttributeSafe(element, attribute, value) {
  try {
    element.setAttribute(attribute, value);
  } catch (error) {
    console.error('[LazyLoading] Failed to set attribute:', { attribute, value, error });
  }
}

/**
 * Add class to element with error handling
 * @param {Element} element - DOM element
 * @param {string} className - Class name to add
 */
function addClassSafe(element, className) {
  try {
    element.classList.add(className);
  } catch (error) {
    console.error('[LazyLoading] Failed to add class:', { className, error });
  }
}

/**
 * Remove class from element with error handling
 * @param {Element} element - DOM element
 * @param {string} className - Class name to remove
 */
function removeClassSafe(element, className) {
  try {
    element.classList.remove(className);
  } catch (error) {
    console.error('[LazyLoading] Failed to remove class:', { className, error });
  }
}

/**
 * Check if browser supports Intersection Observer
 * @returns {boolean} True if supported
 */
function supportsIntersectionObserver() {
  return (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

/**
 * Check if browser supports WebP format
 * @returns {Promise<boolean>} True if WebP is supported
 */
async function supportsWebP() {
  if (!('createImageBitmap' in window)) {
    return false;
  }

  const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  
  try {
    const blob = await fetch(webpData).then(r => r.blob());
    return await createImageBitmap(blob).then(() => true, () => false);
  } catch {
    return false;
  }
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Performance Monitoring
// ============================================

/**
 * Start performance measurement
 * @param {string} id - Unique identifier for measurement
 * @returns {string} Measurement ID
 */
function startPerformanceMeasure(id) {
  const measureId = `lazy-load-${id}`;
  
  try {
    if (performance && performance.mark) {
      performance.mark(`${measureId}-start`);
    }
  } catch (error) {
    console.error('[LazyLoading] Performance mark failed:', error);
  }
  
  return measureId;
}

/**
 * End performance measurement and record metrics
 * @param {string} measureId - Measurement identifier
 * @param {Object} metadata - Additional metadata
 */
function endPerformanceMeasure(measureId, metadata = {}) {
  try {
    if (performance && performance.mark && performance.measure) {
      performance.mark(`${measureId}-end`);
      performance.measure(measureId, `${measureId}-start`, `${measureId}-end`);
      
      const measure = performance.getEntriesByName(measureId)[0];
      
      if (measure) {
        performanceMetrics.set(measureId, {
          duration: measure.duration,
          timestamp: Date.now(),
          ...metadata,
        });
        
        console.log('[LazyLoading] Performance:', {
          id: measureId,
          duration: `${measure.duration.toFixed(2)}ms`,
          ...metadata,
        });
      }
      
      // Cleanup marks and measures
      performance.clearMarks(`${measureId}-start`);
      performance.clearMarks(`${measureId}-end`);
      performance.clearMeasures(measureId);
    }
  } catch (error) {
    console.error('[LazyLoading] Performance measure failed:', error);
  }
}

/**
 * Get performance metrics summary
 * @returns {Object} Performance metrics summary
 */
function getPerformanceMetrics() {
  const metrics = Array.from(performanceMetrics.values());
  
  if (metrics.length === 0) {
    return {
      count: 0,
      averageDuration: 0,
      totalDuration: 0,
    };
  }
  
  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  
  return {
    count: metrics.length,
    averageDuration: totalDuration / metrics.length,
    totalDuration,
    metrics: metrics.slice(-10), // Last 10 measurements
  };
}

// ============================================
// Image Loading
// ============================================

/**
 * Load image with retry logic
 * @param {string} src - Image source URL
 * @param {number} retryCount - Current retry attempt
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
async function loadImageWithRetry(src, retryCount = 0, maxRetries = 3, retryDelay = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const handleLoad = () => {
      cleanup();
      resolve(img);
    };
    
    const handleError = async () => {
      cleanup();
      
      if (retryCount < maxRetries) {
        console.warn('[LazyLoading] Image load failed, retrying:', {
          src,
          attempt: retryCount + 1,
          maxRetries,
        });
        
        await delay(retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        
        try {
          const retryImg = await loadImageWithRetry(src, retryCount + 1, maxRetries, retryDelay);
          resolve(retryImg);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Failed to load image after ${maxRetries} attempts: ${src}`));
      }
    };
    
    const cleanup = () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
    
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    // Set crossOrigin before src to avoid CORS issues
    if (src.startsWith('http') && !src.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  });
}

/**
 * Get responsive image source based on viewport
 * @param {Element} element - Image element
 * @returns {string} Optimal image source
 */
function getResponsiveSource(element) {
  const srcset = getAttributeSafe(element, 'data-srcset');
  
  if (!srcset) {
    return getAttributeSafe(element, 'data-src');
  }
  
  const sources = srcset.split(',').map(src => {
    const [url, descriptor] = src.trim().split(/\s+/);
    const width = descriptor ? parseInt(descriptor) : 0;
    return { url, width };
  });
  
  const viewportWidth = window.innerWidth * (window.devicePixelRatio || 1);
  
  // Find the smallest image that's larger than viewport
  const optimalSource = sources
    .filter(s => s.width >= viewportWidth)
    .sort((a, b) => a.width - b.width)[0];
  
  return optimalSource ? optimalSource.url : sources[sources.length - 1].url;
}

/**
 * Apply loaded image to element
 * @param {Element} element - Target element
 * @param {HTMLImageElement} img - Loaded image
 * @param {Object} config - Configuration object
 */
function applyLoadedImage(element, img, config) {
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'img') {
    element.src = img.src;
    
    const srcset = getAttributeSafe(element, 'data-srcset');
    if (srcset) {
      setAttributeSafe(element, 'srcset', srcset);
    }
    
    const sizes = getAttributeSafe(element, 'data-sizes');
    if (sizes) {
      setAttributeSafe(element, 'sizes', sizes);
    }
  } else {
    // Background image for other elements
    element.style.backgroundImage = `url('${img.src}')`;
  }
  
  // Update classes
  removeClassSafe(element, config.loadingClass);
  removeClassSafe(element, config.placeholderClass);
  addClassSafe(element, config.loadedClass);
  
  // Remove data attributes
  element.removeAttribute('data-src');
  element.removeAttribute('data-srcset');
  element.removeAttribute('data-sizes');
  
  // Set loaded state
  setAttributeSafe(element, 'data-lazy-loaded', 'true');
}

/**
 * Handle image loading error
 * @param {Element} element - Target element
 * @param {Error} error - Error object
 * @param {Object} config - Configuration object
 */
function handleImageError(element, error, config) {
  console.error('[LazyLoading] Image load error:', {
    element,
    error: error.message,
  });
  
  removeClassSafe(element, config.loadingClass);
  addClassSafe(element, config.errorClass);
  
  setAttributeSafe(element, 'data-lazy-error', error.message);
  
  // Dispatch custom error event
  try {
    const errorEvent = new CustomEvent('lazyloaderror', {
      detail: { element, error },
      bubbles: true,
    });
    element.dispatchEvent(errorEvent);
  } catch (eventError) {
    console.error('[LazyLoading] Failed to dispatch error event:', eventError);
  }
}

/**
 * Load image element
 * @param {Element} element - Image element to load
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function loadImage(element, config) {
  const state = loadingStates.get(element);
  
  // Prevent duplicate loading
  if (state && state.loading) {
    return state.promise;
  }
  
  const loadId = generateId();
  const measureId = config.enablePerformanceMonitoring 
    ? startPerformanceMeasure(loadId) 
    : null;
  
  addClassSafe(element, config.loadingClass);
  
  const loadPromise = (async () => {
    try {
      const src = getResponsiveSource(element);
      
      if (!src) {
        throw new Error('No image source specified');
      }
      
      const img = await loadImageWithRetry(
        src,
        0,
        config.retryAttempts,
        config.retryDelay
      );
      
      applyLoadedImage(element, img, config);
      
      if (measureId) {
        endPerformanceMeasure(measureId, {
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }
      
      // Dispatch custom load event
      try {
        const loadEvent = new CustomEvent('lazyload', {
          detail: { element, src },
          bubbles: true,
        });
        element.dispatchEvent(loadEvent);
      } catch (eventError) {
        console.error('[LazyLoading] Failed to dispatch load event:', eventError);
      }
      
    } catch (error) {
      handleImageError(element, error, config);
      
      if (measureId) {
        endPerformanceMeasure(measureId, {
          error: error.message,
          failed: true,
        });
      }
      
      throw error;
    } finally {
      loadingStates.delete(element);
    }
  })();
  
  loadingStates.set(element, {
    loading: true,
    promise: loadPromise,
  });
  
  return loadPromise;
}

// ============================================
// Intersection Observer
// ============================================

/**
 * Create intersection observer callback
 * @param {Object} config - Configuration object
 * @returns {Function} Observer callback
 */
function createObserverCallback(config) {
  return (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Unobserve immediately to prevent duplicate loads
        observer.unobserve(element);
        
        // Load image
        loadImage(element, config).catch(error => {
          console.error('[LazyLoading] Failed to load image:', error);
        });
      }
    });
  };
}

/**
 * Create or get cached intersection observer
 * @param {Object} config - Configuration object
 * @returns {IntersectionObserver} Observer instance
 */
function getOrCreateObserver(config) {
  const cached = observerCache.get(config);
  
  if (cached) {
    return cached;
  }
  
  const observerOptions = {
    rootMargin: config.rootMargin,
    threshold: config.threshold,
  };
  
  const observer = new IntersectionObserver(
    createObserverCallback(config),
    observerOptions
  );
  
  observerCache.set(config, observer);
  
  return observer;
}

// ============================================
// Fallback for Browsers Without Intersection Observer
// ============================================

/**
 * Check if element is in viewport (fallback)
 * @param {Element} element - Element to check
 * @returns {boolean} True if in viewport
 */
function isInViewport(element) {
  try {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top <= windowHeight &&
      rect.bottom >= 0 &&
      rect.left <= windowWidth &&
      rect.right >= 0
    );
  } catch (error) {
    console.error('[LazyLoading] Viewport check failed:', error);
    return false;
  }
}

/**
 * Fallback lazy loading without Intersection Observer
 * @param {NodeList|Array} elements - Elements to lazy load
 * @param {Object} config - Configuration object
 */
function fallbackLazyLoad(elements, config) {
  const checkAndLoad = () => {
    elements.forEach(element => {
      if (isInViewport(element) && !getAttributeSafe(element, 'data-lazy-loaded')) {
        loadImage(element, config).catch(error => {
          console.error('[LazyLoading] Fallback load failed:', error);
        });
      }
    });
  };
  
  // Initial check
  checkAndLoad();
  
  // Throttled scroll and resize handlers
  let ticking = false;
  
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkAndLoad();
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  
  console.log('[LazyLoading] Using fallback lazy loading (no Intersection Observer)');
}

// ============================================
// Public API
// ============================================

/**
 * Initialize lazy loading for elements
 * @param {string|NodeList|Array} selector - CSS selector or element list
 * @param {Object} options - Configuration options
 * @returns {Object} Lazy loading instance with control methods
 */
export function initLazyLoading(selector = '[data-src]', options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  // Get elements
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else if (selector instanceof NodeList || Array.isArray(selector)) {
    elements = selector;
  } else {
    console.error('[LazyLoading] Invalid selector:', selector);
    return null;
  }
  
  if (elements.length === 0) {
    console.warn('[LazyLoading] No elements found for selector:', selector);
    return null;
  }
  
  console.log('[LazyLoading] Initializing lazy loading:', {
    elementCount: elements.length,
    config,
  });
  
  // Check browser support
  if (!supportsIntersectionObserver()) {
    console.warn('[LazyLoading] Intersection Observer not supported, using fallback');
    fallbackLazyLoad(elements, config);
    
    return {
      disconnect: () => {
        console.log('[LazyLoading] Fallback mode - disconnect not applicable');
      },
      observe: () => {
        console.warn('[LazyLoading] Fallback mode - observe not applicable');
      },
    };
  }
  
  // Create observer
  const observer = getOrCreateObserver(config);
  
  // Observe all elements
  elements.forEach(element => {
    addClassSafe(element, config.placeholderClass);
    observer.observe(element);
  });
  
  console.log('[LazyLoading] Lazy loading initialized successfully');
  
  // Return control interface
  return {
    disconnect: () => {
      observer.disconnect();
      console.log('[LazyLoading] Observer disconnected');
    },
    observe: (element) => {
      addClassSafe(element, config.placeholderClass);
      observer.observe(element);
    },
    unobserve: (element) => {
      observer.unobserve(element);
    },
    loadAll: async () => {
      const loadPromises = Array.from(elements).map(element => 
        loadImage(element, config).catch(error => {
          console.error('[LazyLoading] Load all failed for element:', error);
        })
      );
      await Promise.allSettled(loadPromises);
      console.log('[LazyLoading] All images loaded');
    },
  };
}

/**
 * Load single image immediately
 * @param {Element} element - Image element to load
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
export async function loadImageNow(element, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  return loadImage(element, config);
}

/**
 * Check WebP support
 * @returns {Promise<boolean>} True if WebP is supported
 */
export async function checkWebPSupport() {
  return supportsWebP();
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics summary
 */
export function getMetrics() {
  return getPerformanceMetrics();
}

/**
 * Preload images for better UX
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} Array of load results
 */
export async function preloadImages(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    console.warn('[LazyLoading] No URLs provided for preloading');
    return [];
  }
  
  console.log('[LazyLoading] Preloading images:', { count: urls.length });
  
  const loadPromises = urls.map(async url => {
    try {
      const img = await loadImageWithRetry(url, 0, 3, 1000);
      return { url, success: true, width: img.naturalWidth, height: img.naturalHeight };
    } catch (error) {
      console.error('[LazyLoading] Preload failed:', { url, error: error.message });
      return { url, success: false, error: error.message };
    }
  });
  
  const results = await Promise.allSettled(loadPromises);
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
  );
}

// ============================================
// Module Exports
// ============================================

export default {
  initLazyLoading,
  loadImageNow,
  checkWebPSupport,
  getMetrics,
  preloadImages,
};