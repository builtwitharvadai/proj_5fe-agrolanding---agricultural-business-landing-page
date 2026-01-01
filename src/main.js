/**
 * AgroLanding - Main JavaScript Entry Point
 * Production-ready ES module initialization
 * 
 * @module main
 * @description Main application entry point for importing styles and initializing
 * the agricultural business landing page application
 */

// ============================================
// Style Imports - CSS Module Loading
// ============================================

/**
 * Import main stylesheet containing design system, typography, and base styles
 * This includes CSS custom properties, responsive breakpoints, and layout utilities
 */
import './styles/main.css';

/**
 * Import component-specific styles for reusable UI components
 * This includes buttons, cards, forms, navigation, and other interactive elements
 */
import './styles/components.css';

/**
 * Import navigation component styles for responsive navigation
 * This includes mobile menu, hamburger button, and navigation interactions
 */
import './styles/components/navigation.css';

/**
 * Import hero section styles for full-viewport hero design
 * This includes hero layout, typography, CTA buttons, and responsive behavior
 */
import './styles/sections/hero.css';

/**
 * Import services section styles for responsive grid layout
 * This includes service cards, icons, hover effects, and responsive behavior
 */
import './styles/sections/services.css';

/**
 * Import about section styles for content-focused layout
 * This includes typography hierarchy, trust indicators, and responsive behavior
 */
import './styles/sections/about.css';

/**
 * Import contact section styles for contact layout and form styling
 * This includes contact information display, form fields, and responsive behavior
 */
import './styles/sections/contact.css';

/**
 * Import accessibility styles for WCAG AA compliance
 * This includes focus indicators, skip links, screen reader support, and high contrast mode
 */
import './styles/accessibility.css';

// ============================================
// Component Imports - Module Loading
// ============================================

/**
 * Import navigation functionality for mobile menu and smooth scrolling
 * This includes hamburger menu, section detection, and keyboard navigation
 */
import { initNavigation } from './components/navigation.js';

/**
 * Import hero section functionality for interactive features
 * This includes CTA button handling, smooth scrolling, and image optimization
 */
import { initializeHeroSection } from './components/hero.js';

/**
 * Import services section functionality for interactive features
 * This includes service card interactions, grid optimization, and accessibility
 */
import { initializeServicesSection } from './components/services.js';

/**
 * Import about section functionality for interactive features
 * This includes content rendering, statistics animation, and trust indicators
 */
import { initializeAboutSection } from './components/about.js';

/**
 * Import contact form functionality for form validation and submission
 * This includes client-side validation, error handling, and form state management
 */
import { initContactForm } from './components/contact-form.js';

// ============================================
// Performance Optimization Imports
// ============================================

/**
 * Import lazy loading utilities for image optimization
 * This includes Intersection Observer-based lazy loading and progressive enhancement
 */
import { initLazyLoading } from './utils/lazy-loading.js';

/**
 * Import performance monitoring utilities for tracking and optimization
 * This includes performance metrics, budget validation, and load time tracking
 */
import { initPerformanceMonitoring } from './utils/performance.js';

// ============================================
// Accessibility Imports
// ============================================

/**
 * Import accessibility utilities for WCAG AA compliance
 * This includes focus management, keyboard navigation, ARIA helpers, and screen reader support
 */
import {
  initializeSkipLinks,
  announce,
  createFocusTrap,
  setAriaAttributes,
} from './utils/accessibility.js';

// ============================================
// Application State
// ============================================

/**
 * Application state object for managing global application state
 * @type {Object}
 */
const appState = {
  initialized: false,
  formSubmitting: false,
  navigationOpen: false,
  performanceMonitoring: null,
  lazyLoading: null,
  focusTrap: null,
};

// ============================================
// DOM Element References
// ============================================

/**
 * Cache DOM element references for performance optimization
 * Elements are queried once during initialization
 */
let domElements = {
  contactForm: null,
  formStatus: null,
  submitButton: null,
  navLinks: null,
  skipLink: null,
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
    console.error(`[AgroLanding] Failed to query selector: ${selector}`, error);
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
    console.error(`[AgroLanding] Failed to query selector all: ${selector}`, error);
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

// ============================================
// Form Validation
// ============================================

/**
 * Validation rules for form fields
 * @type {Object}
 */
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Please enter a valid name (2-100 characters, letters only)',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: false,
    pattern: /^[\d\s()+-]+$/,
    message: 'Please enter a valid phone number',
  },
  service: {
    required: true,
    message: 'Please select a service',
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Please enter a message (10-1000 characters)',
  },
  consent: {
    required: true,
    message: 'You must agree to the privacy policy',
  },
};

/**
 * Validate a single form field
 * @param {string} fieldName - Name of the field to validate
 * @param {string|boolean} value - Value to validate
 * @returns {Object} Validation result with isValid and error properties
 */
function validateField(fieldName, value) {
  const rules = validationRules[fieldName];
  
  if (!rules) {
    return { isValid: true, error: '' };
  }

  // Required field check
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, error: rules.message };
  }

  // Skip further validation if field is optional and empty
  if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: true, error: '' };
  }

  // String-specific validations
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    // Min length check
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return { isValid: false, error: rules.message };
    }

    // Max length check
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return { isValid: false, error: rules.message };
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return { isValid: false, error: rules.message };
    }
  }

  return { isValid: true, error: '' };
}

/**
 * Display validation error for a field
 * @param {Element} field - Form field element
 * @param {string} error - Error message to display
 */
function showFieldError(field, error) {
  if (!field) return;

  const errorId = `${field.id}-error`;
  const errorElement = safeQuerySelector(`#${errorId}`);

  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
  
  if (errorElement) {
    errorElement.textContent = error;
    errorElement.style.display = 'block';
  }

  // Announce error to screen readers
  announce(`Error: ${error}`, { politeness: 'assertive' });
}

/**
 * Clear validation error for a field
 * @param {Element} field - Form field element
 */
function clearFieldError(field) {
  if (!field) return;

  const errorId = `${field.id}-error`;
  const errorElement = safeQuerySelector(`#${errorId}`);

  field.setAttribute('aria-invalid', 'false');
  field.removeAttribute('aria-describedby');
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

// ============================================
// Form Handling
// ============================================

/**
 * Handle form field validation on blur
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
  const field = event.target;
  const fieldName = field.name;
  const value = field.type === 'checkbox' ? field.checked : field.value;

  const validation = validateField(fieldName, value);

  if (!validation.isValid) {
    showFieldError(field, validation.error);
  } else {
    clearFieldError(field);
  }
}

/**
 * Handle form field input to clear errors
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
  const field = event.target;
  
  if (field.getAttribute('aria-invalid') === 'true') {
    clearFieldError(field);
  }
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} True if form is valid
 */
function validateForm(form) {
  if (!form) return false;

  let isValid = true;
  const formData = new FormData(form);

  // Validate each field
  for (const [fieldName, value] of formData.entries()) {
    const field = form.elements[fieldName];
    const validation = validateField(fieldName, value);

    if (!validation.isValid) {
      showFieldError(field, validation.error);
      isValid = false;
    } else {
      clearFieldError(field);
    }
  }

  // Validate consent checkbox separately
  const consentField = form.elements.consent;
  if (consentField) {
    const validation = validateField('consent', consentField.checked);
    if (!validation.isValid) {
      showFieldError(consentField, validation.error);
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Show form status message
 * @param {string} message - Status message to display
 * @param {string} type - Message type (success, error, info)
 */
function showFormStatus(message, type = 'info') {
  const statusElement = domElements.formStatus;
  
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.className = `alert alert-${type}`;
  statusElement.style.display = 'block';
  statusElement.setAttribute('role', type === 'error' ? 'alert' : 'status');

  // Announce to screen readers
  announce(message, { 
    politeness: type === 'error' ? 'assertive' : 'polite' 
  });

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Prevent double submission
  if (appState.formSubmitting) {
    return;
  }

  // Validate form
  if (!validateForm(form)) {
    showFormStatus('Please correct the errors in the form.', 'error');
    return;
  }

  // Set submitting state
  appState.formSubmitting = true;
  const submitButton = domElements.submitButton;

  if (submitButton) {
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
    setAriaAttributes(submitButton, { 'aria-label': 'Submitting form, please wait' });
  }

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate API call (replace with actual endpoint)
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Success handling
    showFormStatus('Thank you for your message! We will contact you soon.', 'success');
    form.reset();

    // Clear any remaining error states
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach((field) => clearFieldError(field));

  } catch (error) {
    console.error('[AgroLanding] Form submission error:', error);
    showFormStatus(
      'Sorry, there was an error submitting your message. Please try again later.',
      'error'
    );
  } finally {
    // Reset submitting state
    appState.formSubmitting = false;

    if (submitButton) {
      submitButton.setAttribute('aria-busy', 'false');
      submitButton.disabled = false;
      setAriaAttributes(submitButton, { 'aria-label': 'Submit form' });
    }
  }
}

// ============================================
// Smooth Scrolling
// ============================================

/**
 * Handle smooth scroll to anchor links
 * @param {Event} event - Click event
 */
function handleSmoothScroll(event) {
  const link = event.target.closest('a[href^="#"]');
  
  if (!link) return;

  const href = link.getAttribute('href');
  
  if (!href || href === '#') return;

  const targetId = href.substring(1);
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return;

  event.preventDefault();

  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  // Update focus for accessibility
  targetElement.setAttribute('tabindex', '-1');
  targetElement.focus();

  // Announce navigation to screen readers
  const targetName = targetElement.getAttribute('aria-label') || targetId;
  announce(`Navigated to ${targetName}`, { politeness: 'polite' });

  // Update URL without triggering navigation
  if (window.history && window.history.pushState) {
    window.history.pushState(null, '', href);
  }
}

// ============================================
// Accessibility Initialization
// ============================================

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  try {
    console.log('[AgroLanding] Initializing accessibility features...');

    // Initialize skip links
    initializeSkipLinks({
      mainContentId: 'main',
      additionalLinks: [
        { text: 'Skip to navigation', target: '#navigation' },
        { text: 'Skip to contact form', target: '#contact-form' },
      ],
    });

    // Add ARIA labels to main sections
    const sections = [
      { id: 'home', label: 'Home section' },
      { id: 'services', label: 'Services section' },
      { id: 'about', label: 'About section' },
      { id: 'contact', label: 'Contact section' },
    ];

    sections.forEach(({ id, label }) => {
      const section = document.getElementById(id);
      if (section) {
        setAriaAttributes(section, { 'aria-label': label });
      }
    });

    // Enhance form accessibility
    const form = domElements.contactForm;
    if (form) {
      setAriaAttributes(form, {
        'aria-label': 'Contact form',
        'role': 'form',
      });

      // Add required indicators to labels
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach((field) => {
        const label = form.querySelector(`label[for="${field.id}"]`);
        if (label && !label.querySelector('.required')) {
          const requiredSpan = document.createElement('span');
          requiredSpan.className = 'required';
          requiredSpan.setAttribute('aria-label', 'required');
          requiredSpan.textContent = ' *';
          label.appendChild(requiredSpan);
        }
      });
    }

    // Announce page load completion
    setTimeout(() => {
      announce('Page loaded successfully. Use tab to navigate.', { 
        politeness: 'polite',
        delay: 500 
      });
    }, 1000);

    console.log('[AgroLanding] Accessibility features initialized successfully');
  } catch (error) {
    console.error('[AgroLanding] Failed to initialize accessibility features:', error);
  }
}

// ============================================
// Performance Optimization Initialization
// ============================================

/**
 * Initialize lazy loading for images
 */
function initializeLazyLoading() {
  try {
    console.log('[AgroLanding] Initializing lazy loading...');

    const lazyLoadInstance = initLazyLoading('[data-src]', {
      rootMargin: '50px',
      threshold: 0.01,
      enablePerformanceMonitoring: true,
      retryAttempts: 3,
      retryDelay: 1000,
    });

    if (lazyLoadInstance) {
      appState.lazyLoading = lazyLoadInstance;
      console.log('[AgroLanding] Lazy loading initialized successfully');
    } else {
      console.warn('[AgroLanding] Lazy loading initialization returned null');
    }
  } catch (error) {
    console.error('[AgroLanding] Failed to initialize lazy loading:', error);
  }
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
  try {
    console.log('[AgroLanding] Initializing performance monitoring...');

    const performanceInstance = initPerformanceMonitoring({
      observeLCP: true,
      observeFID: true,
      observeCLS: true,
      autoReport: false,
      reportInterval: 30000,
    });

    if (performanceInstance) {
      appState.performanceMonitoring = performanceInstance;
      console.log('[AgroLanding] Performance monitoring initialized successfully');

      // Log initial performance report after page load
      if (document.readyState === 'complete') {
        setTimeout(() => {
          performanceInstance.logReport();
        }, 2000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            performanceInstance.logReport();
          }, 2000);
        });
      }
    } else {
      console.warn('[AgroLanding] Performance monitoring initialization returned null');
    }
  } catch (error) {
    console.error('[AgroLanding] Failed to initialize performance monitoring:', error);
  }
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize DOM element references
 */
function initializeDOMReferences() {
  domElements = {
    contactForm: safeQuerySelector('#contact-form'),
    formStatus: safeQuerySelector('#form-status'),
    submitButton: safeQuerySelector('.btn-submit'),
    navLinks: safeQuerySelectorAll('nav a[href^="#"]'),
    skipLink: safeQuerySelector('.skip-link'),
  };
}

/**
 * Initialize form event listeners
 */
function initializeFormListeners() {
  const form = domElements.contactForm;

  if (!form) {
    console.warn('[AgroLanding] Contact form not found');
    return;
  }

  // Form submission
  form.addEventListener('submit', handleFormSubmit);

  // Field validation on blur
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((field) => {
    field.addEventListener('blur', handleFieldBlur);
    field.addEventListener('input', debounce(handleFieldInput, 300));
  });

  console.log('[AgroLanding] Form listeners initialized');
}

/**
 * Initialize navigation event listeners
 */
function initializeNavigationListeners() {
  // Smooth scrolling for anchor links
  document.addEventListener('click', handleSmoothScroll);

  console.log('[AgroLanding] Navigation listeners initialized');
}

/**
 * Initialize application
 */
function initializeApp() {
  if (appState.initialized) {
    console.warn('[AgroLanding] Application already initialized');
    return;
  }

  try {
    console.log('[AgroLanding] Initializing application...');

    // Initialize DOM references
    initializeDOMReferences();

    // Initialize navigation component
    initNavigation();

    // Initialize event listeners
    initializeFormListeners();
    initializeNavigationListeners();

    // Initialize hero section
    initializeHeroSection();

    // Initialize services section
    initializeServicesSection();

    // Initialize about section
    initializeAboutSection();

    // Initialize contact form
    initContactForm();

    // Initialize accessibility features
    initializeAccessibility();

    // Initialize performance optimization features
    initializeLazyLoading();
    initializePerformanceMonitoring();

    // Mark as initialized
    appState.initialized = true;

    console.log('[AgroLanding] Application initialized successfully');
  } catch (error) {
    console.error('[AgroLanding] Initialization error:', error);
  }
}

// ============================================
// Application Entry Point
// ============================================

/**
 * Wait for DOM to be ready before initializing
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// ============================================
// Module Exports (for testing and extensibility)
// ============================================

export { initializeApp, validateField, validateForm };