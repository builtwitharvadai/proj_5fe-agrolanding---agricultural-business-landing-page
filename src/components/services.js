/**
 * Services Section JavaScript Module
 * Production-ready ES module for services functionality
 * 
 * @module services
 * @description Manages service data, card interactions, and responsive grid behavior
 * for the agricultural services showcase section
 */

// ============================================
// Service Data Management
// ============================================

/**
 * Service data structure with comprehensive information
 * @typedef {Object} ServiceData
 * @property {string} id - Unique service identifier
 * @property {string} title - Service title
 * @property {string} description - Service description
 * @property {string} icon - Icon file path
 * @property {string} category - Service category
 * @property {boolean} featured - Whether service is featured
 */

/**
 * Agricultural services data
 * @type {ServiceData[]}
 */
const servicesData = [
  {
    id: 'crop-management',
    title: 'Crop Management',
    description: 'Advanced crop monitoring and management systems using precision agriculture technology to optimize growth and yield.',
    icon: '/images/icons/crop-management.svg',
    category: 'technology',
    featured: true,
  },
  {
    id: 'soil-analysis',
    title: 'Soil Analysis',
    description: 'Comprehensive soil testing and analysis services to determine optimal fertilization and crop selection strategies.',
    icon: '/images/icons/soil-analysis.svg',
    category: 'analysis',
    featured: true,
  },
  {
    id: 'irrigation',
    title: 'Irrigation Solutions',
    description: 'Smart irrigation systems and water management solutions to conserve resources while maximizing crop health.',
    icon: '/images/icons/irrigation.svg',
    category: 'technology',
    featured: true,
  },
  {
    id: 'consulting',
    title: 'Agricultural Consulting',
    description: 'Expert guidance on farm operations, crop selection, sustainability practices, and business optimization.',
    icon: '/images/icons/consulting.svg',
    category: 'consulting',
    featured: true,
  },
  {
    id: 'equipment',
    title: 'Equipment & Technology',
    description: 'Access to modern farming equipment and agricultural technology solutions for efficient farm operations.',
    icon: '/images/icons/equipment.svg',
    category: 'technology',
    featured: false,
  },
  {
    id: 'sustainability',
    title: 'Sustainable Practices',
    description: 'Implementation of eco-friendly farming methods and sustainable agriculture practices for long-term success.',
    icon: '/images/icons/sustainability.svg',
    category: 'sustainability',
    featured: false,
  },
];

// ============================================
// DOM Element References
// ============================================

/**
 * Cached DOM element references
 * @type {Object}
 */
let domElements = {
  servicesSection: null,
  servicesGrid: null,
  serviceCards: null,
  serviceLinks: null,
};

// ============================================
// State Management
// ============================================

/**
 * Services section state
 * @type {Object}
 */
const servicesState = {
  initialized: false,
  activeCard: null,
  interactionCount: 0,
  lastInteractionTime: 0,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Safely query DOM element with error handling
 * @param {string} selector - CSS selector string
 * @param {Element} [context=document] - Context element for scoped queries
 * @returns {Element|null} Found element or null
 */
function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`[Services] Failed to query selector: ${selector}`, error);
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
    console.error(`[Services] Failed to query selector all: ${selector}`, error);
    return [];
  }
}

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
 * Throttle function to limit execution frequency
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

// ============================================
// Service Data Operations
// ============================================

/**
 * Get service by ID
 * @param {string} serviceId - Service identifier
 * @returns {ServiceData|null} Service data or null if not found
 */
function getServiceById(serviceId) {
  return servicesData.find((service) => service.id === serviceId) || null;
}

/**
 * Get services by category
 * @param {string} category - Service category
 * @returns {ServiceData[]} Array of services in category
 */
function getServicesByCategory(category) {
  return servicesData.filter((service) => service.category === category);
}

/**
 * Get featured services
 * @returns {ServiceData[]} Array of featured services
 */
function getFeaturedServices() {
  return servicesData.filter((service) => service.featured);
}

// ============================================
// Card Interaction Handling
// ============================================

/**
 * Handle service card mouse enter event
 * @param {Event} event - Mouse enter event
 */
function handleCardMouseEnter(event) {
  const card = event.currentTarget;
  
  if (!card) return;

  // Update active card state
  servicesState.activeCard = card;
  servicesState.lastInteractionTime = Date.now();

  // Add hover state for accessibility
  card.setAttribute('data-hover', 'true');

  // Log interaction for analytics
  const serviceId = card.getAttribute('data-service-id');
  if (serviceId) {
    logServiceInteraction('hover', serviceId);
  }
}

/**
 * Handle service card mouse leave event
 * @param {Event} event - Mouse leave event
 */
function handleCardMouseLeave(event) {
  const card = event.currentTarget;
  
  if (!card) return;

  // Clear active card state
  if (servicesState.activeCard === card) {
    servicesState.activeCard = null;
  }

  // Remove hover state
  card.removeAttribute('data-hover');
}

/**
 * Handle service card focus event
 * @param {Event} event - Focus event
 */
function handleCardFocus(event) {
  const card = event.currentTarget;
  
  if (!card) return;

  // Update active card state
  servicesState.activeCard = card;

  // Ensure card is visible in viewport
  requestAnimationFrame(() => {
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  });
}

/**
 * Handle service card blur event
 * @param {Event} event - Blur event
 */
function handleCardBlur(event) {
  const card = event.currentTarget;
  
  if (!card) return;

  // Clear active card state
  if (servicesState.activeCard === card) {
    servicesState.activeCard = null;
  }
}

/**
 * Handle service link click event
 * @param {Event} event - Click event
 */
function handleServiceLinkClick(event) {
  const link = event.currentTarget;
  
  if (!link) return;

  const card = link.closest('.service-card');
  const serviceId = card?.getAttribute('data-service-id');

  if (serviceId) {
    servicesState.interactionCount++;
    logServiceInteraction('click', serviceId);
  }
}

/**
 * Log service interaction for analytics
 * @param {string} type - Interaction type (hover, click, etc.)
 * @param {string} serviceId - Service identifier
 */
function logServiceInteraction(type, serviceId) {
  const timestamp = new Date().toISOString();
  const interactionData = {
    type,
    serviceId,
    timestamp,
    sessionCount: servicesState.interactionCount,
  };

  console.log('[Services] Interaction:', interactionData);

  // Send to analytics service if available
  if (typeof window !== 'undefined' && window.analytics) {
    try {
      window.analytics.track('Service Interaction', interactionData);
    } catch (error) {
      console.error('[Services] Analytics error:', error);
    }
  }
}

// ============================================
// Responsive Grid Behavior
// ============================================

/**
 * Optimize grid layout based on viewport
 */
function optimizeGridLayout() {
  const grid = domElements.servicesGrid;
  
  if (!grid) return;

  const viewportWidth = window.innerWidth;
  const cards = domElements.serviceCards;

  // Calculate optimal columns based on viewport
  let columns = 1;
  if (viewportWidth >= 1024) {
    columns = 3;
  } else if (viewportWidth >= 640) {
    columns = 2;
  }

  // Update grid attribute for CSS targeting
  grid.setAttribute('data-columns', columns.toString());

  // Optimize card rendering
  if (cards && cards.length > 0) {
    cards.forEach((card, index) => {
      // Add position metadata for animations
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      card.setAttribute('data-row', row.toString());
      card.setAttribute('data-col', col.toString());
    });
  }
}

/**
 * Handle window resize with debouncing
 */
const handleResize = debounce(() => {
  optimizeGridLayout();
}, 250);

/**
 * Handle intersection observer for lazy loading
 * @param {IntersectionObserverEntry[]} entries - Intersection entries
 */
function handleIntersection(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      
      // Mark card as visible
      card.setAttribute('data-visible', 'true');
      
      // Load service icon if not loaded
      const icon = card.querySelector('.service-icon img');
      if (icon && icon.dataset.src) {
        icon.src = icon.dataset.src;
        icon.removeAttribute('data-src');
      }
    }
  });
}

// ============================================
// Accessibility Enhancements
// ============================================

/**
 * Enhance service cards for accessibility
 */
function enhanceAccessibility() {
  const cards = domElements.serviceCards;
  
  if (!cards || cards.length === 0) return;

  cards.forEach((card) => {
    // Ensure proper ARIA attributes
    if (!card.hasAttribute('role')) {
      card.setAttribute('role', 'article');
    }

    // Add keyboard navigation support
    const link = card.querySelector('.service-link');
    if (link) {
      // Ensure link is keyboard accessible
      if (!link.hasAttribute('tabindex')) {
        link.setAttribute('tabindex', '0');
      }

      // Add keyboard event handlers
      link.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          link.click();
        }
      });
    }

    // Enhance icon accessibility
    const icon = card.querySelector('.service-icon img');
    if (icon && !icon.hasAttribute('alt')) {
      icon.setAttribute('alt', '');
    }
  });
}

/**
 * Announce service section to screen readers
 */
function announceServicesSection() {
  const section = domElements.servicesSection;
  
  if (!section) return;

  // Create live region for announcements
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  section.appendChild(liveRegion);

  // Announce services loaded
  const serviceCount = domElements.serviceCards?.length || 0;
  liveRegion.textContent = `${serviceCount} agricultural services available`;
}

// ============================================
// Performance Optimization
// ============================================

/**
 * Implement lazy loading for service icons
 */
function implementLazyLoading() {
  const cards = domElements.serviceCards;
  
  if (!cards || cards.length === 0) return;

  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    cards.forEach((card) => {
      const icon = card.querySelector('.service-icon img');
      if (icon && icon.dataset.src) {
        icon.src = icon.dataset.src;
        icon.removeAttribute('data-src');
      }
    });
    return;
  }

  // Create intersection observer
  const observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
  });

  // Observe all service cards
  cards.forEach((card) => {
    observer.observe(card);
  });
}

/**
 * Prefetch service resources
 */
function prefetchServiceResources() {
  // Prefetch service icons for better performance
  const icons = servicesData.map((service) => service.icon);
  
  icons.forEach((iconPath) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = iconPath;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize DOM element references
 */
function initializeDOMReferences() {
  domElements = {
    servicesSection: safeQuerySelector('#services'),
    servicesGrid: safeQuerySelector('.services-grid'),
    serviceCards: safeQuerySelectorAll('.service-card'),
    serviceLinks: safeQuerySelectorAll('.service-link'),
  };
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  const cards = domElements.serviceCards;
  const links = domElements.serviceLinks;

  if (cards && cards.length > 0) {
    cards.forEach((card) => {
      // Mouse events
      card.addEventListener('mouseenter', handleCardMouseEnter);
      card.addEventListener('mouseleave', handleCardMouseLeave);

      // Focus events
      card.addEventListener('focusin', handleCardFocus);
      card.addEventListener('focusout', handleCardBlur);
    });
  }

  if (links && links.length > 0) {
    links.forEach((link) => {
      link.addEventListener('click', handleServiceLinkClick);
    });
  }

  // Window resize event
  window.addEventListener('resize', handleResize);

  console.log('[Services] Event listeners initialized');
}

/**
 * Initialize services section
 */
export function initializeServicesSection() {
  if (servicesState.initialized) {
    console.warn('[Services] Section already initialized');
    return;
  }

  try {
    console.log('[Services] Initializing services section...');

    // Initialize DOM references
    initializeDOMReferences();

    // Check if services section exists
    if (!domElements.servicesSection) {
      console.warn('[Services] Services section not found');
      return;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Optimize grid layout
    optimizeGridLayout();

    // Enhance accessibility
    enhanceAccessibility();

    // Announce to screen readers
    announceServicesSection();

    // Implement lazy loading
    implementLazyLoading();

    // Prefetch resources
    prefetchServiceResources();

    // Mark as initialized
    servicesState.initialized = true;

    console.log('[Services] Services section initialized successfully');
  } catch (error) {
    console.error('[Services] Initialization error:', error);
  }
}

// ============================================
// Module Exports
// ============================================

export {
  servicesData,
  getServiceById,
  getServicesByCategory,
  getFeaturedServices,
  optimizeGridLayout,
};