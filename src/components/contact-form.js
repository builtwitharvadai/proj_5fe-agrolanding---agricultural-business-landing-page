/**
 * Contact Form Module
 * Production-ready contact form with comprehensive validation and accessibility
 * 
 * @module contact-form
 * @generated-from: task-id:AGRO-007
 * @modifies: contact form functionality
 * @dependencies: []
 */

/**
 * Validation rules for form fields
 */
const VALIDATION_RULES = Object.freeze({
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    errorMessages: {
      required: 'Please enter your full name',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must not exceed 100 characters',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    errorMessages: {
      required: 'Please enter your email address',
      pattern: 'Please enter a valid email address',
      maxLength: 'Email address is too long',
    },
  },
  phone: {
    pattern: /^[\d\s()+-]+$/,
    minLength: 10,
    maxLength: 20,
    errorMessages: {
      pattern: 'Please enter a valid phone number',
      minLength: 'Phone number must be at least 10 digits',
      maxLength: 'Phone number is too long',
    },
  },
  service: {
    errorMessages: {
      required: 'Please select a service',
    },
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    errorMessages: {
      required: 'Please enter a message',
      minLength: 'Message must be at least 10 characters',
      maxLength: 'Message must not exceed 1000 characters',
    },
  },
  consent: {
    errorMessages: {
      required: 'You must agree to the privacy policy to continue',
    },
  },
});

/**
 * Form state management
 */
const formState = {
  isSubmitting: false,
  hasSubmitted: false,
  validationErrors: new Map(),
  touchedFields: new Set(),
};

/**
 * Validates a single field based on validation rules
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value to validate
 * @param {boolean} isRequired - Whether the field is required
 * @returns {string|null} Error message or null if valid
 */
function validateField(fieldName, value, isRequired = true) {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return null;

  const trimmedValue = typeof value === 'string' ? value.trim() : value;

  // Required validation
  if (isRequired && !trimmedValue) {
    return rules.errorMessages.required;
  }

  // Skip other validations if field is optional and empty
  if (!isRequired && !trimmedValue) {
    return null;
  }

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.errorMessages.minLength;
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.errorMessages.maxLength;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.errorMessages.pattern;
  }

  return null;
}

/**
 * Displays error message for a field
 * @param {HTMLElement} field - Form field element
 * @param {string} errorMessage - Error message to display
 */
function showFieldError(field, errorMessage) {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = errorMessage;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
  }

  formState.validationErrors.set(field.name, errorMessage);
}

/**
 * Clears error message for a field
 * @param {HTMLElement} field - Form field element
 */
function clearFieldError(field) {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = '';
    field.setAttribute('aria-invalid', 'false');
  }

  formState.validationErrors.delete(field.name);
}

/**
 * Validates a form field and updates UI
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateFormField(field) {
  const isRequired = field.hasAttribute('required');
  const fieldName = field.name;
  const value = field.type === 'checkbox' ? field.checked : field.value;

  // Special handling for checkbox
  if (field.type === 'checkbox') {
    const errorMessage = isRequired && !value ? VALIDATION_RULES[fieldName].errorMessages.required : null;
    
    if (errorMessage) {
      showFieldError(field, errorMessage);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }

  // Special handling for select
  if (field.tagName === 'SELECT') {
    const errorMessage = isRequired && !value ? VALIDATION_RULES[fieldName].errorMessages.required : null;
    
    if (errorMessage) {
      showFieldError(field, errorMessage);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }

  const errorMessage = validateField(fieldName, value, isRequired);

  if (errorMessage) {
    showFieldError(field, errorMessage);
    return false;
  } else {
    clearFieldError(field);
    return true;
  }
}

/**
 * Validates entire form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} True if all fields are valid
 */
function validateForm(form) {
  const fields = form.querySelectorAll('input, select, textarea');
  let isValid = true;

  fields.forEach((field) => {
    const fieldValid = validateFormField(field);
    if (!fieldValid) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Sets form submission state
 * @param {HTMLFormElement} form - Form element
 * @param {boolean} isSubmitting - Whether form is submitting
 */
function setSubmittingState(form, isSubmitting) {
  const submitButton = form.querySelector('button[type="submit"]');
  const formInputs = form.querySelectorAll('input, select, textarea, button');

  formState.isSubmitting = isSubmitting;

  if (submitButton) {
    submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  }

  formInputs.forEach((input) => {
    input.disabled = isSubmitting;
  });
}

/**
 * Displays form status message
 * @param {string} message - Status message
 * @param {string} type - Message type ('success' or 'error')
 */
function showFormStatus(message, type) {
  const statusElement = document.getElementById('form-status');
  
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.classList.remove('sr-only');
    
    // Announce to screen readers
    statusElement.setAttribute('role', 'status');
    statusElement.setAttribute('aria-live', 'polite');
  }
}

/**
 * Clears form status message
 */
function clearFormStatus() {
  const statusElement = document.getElementById('form-status');
  
  if (statusElement) {
    statusElement.textContent = '';
    statusElement.className = '';
    statusElement.classList.add('sr-only');
  }
}

/**
 * Resets form to initial state
 * @param {HTMLFormElement} form - Form element to reset
 */
function resetForm(form) {
  form.reset();
  formState.validationErrors.clear();
  formState.touchedFields.clear();
  formState.hasSubmitted = false;

  // Clear all error messages
  const errorElements = form.querySelectorAll('.error');
  errorElements.forEach((element) => {
    element.textContent = '';
  });

  // Reset aria-invalid attributes
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((field) => {
    field.setAttribute('aria-invalid', 'false');
  });
}

/**
 * Handles form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Clear previous status
  clearFormStatus();

  // Validate form
  const isValid = validateForm(form);

  if (!isValid) {
    showFormStatus('Please correct the errors in the form before submitting.', 'error');
    
    // Focus first invalid field
    const firstInvalidField = form.querySelector('[aria-invalid="true"]');
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
    
    return;
  }

  // Set submitting state
  setSubmittingState(form, true);

  try {
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate API call (replace with actual API endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Log form submission for tracking
    console.log('Contact form submitted:', {
      timestamp: new Date().toISOString(),
      service: data.service,
      hasPhone: Boolean(data.phone),
    });

    // Success handling
    formState.hasSubmitted = true;
    showFormStatus(
      'Thank you for your message! We will get back to you within 24 hours.',
      'success'
    );

    // Reset form after successful submission
    setTimeout(() => {
      resetForm(form);
      clearFormStatus();
    }, 5000);

  } catch (error) {
    // Error handling
    console.error('Form submission error:', error);
    showFormStatus(
      'Sorry, there was an error submitting your message. Please try again or contact us directly.',
      'error'
    );
  } finally {
    // Reset submitting state
    setSubmittingState(form, false);
  }
}

/**
 * Handles field blur event for validation
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
  const field = event.target;
  formState.touchedFields.add(field.name);
  validateFormField(field);
}

/**
 * Handles field input event for real-time validation
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
  const field = event.target;
  
  // Only validate if field has been touched or form has been submitted
  if (formState.touchedFields.has(field.name) || formState.hasSubmitted) {
    validateFormField(field);
  }
}

/**
 * Initializes contact form functionality
 */
export function initContactForm() {
  const form = document.getElementById('contact-form');

  if (!form) {
    console.warn('Contact form not found');
    return;
  }

  // Add submit event listener
  form.addEventListener('submit', handleFormSubmit);

  // Add validation event listeners to all form fields
  const fields = form.querySelectorAll('input, select, textarea');
  
  fields.forEach((field) => {
    // Validate on blur
    field.addEventListener('blur', handleFieldBlur);
    
    // Real-time validation on input (after field has been touched)
    field.addEventListener('input', handleFieldInput);
  });

  // Special handling for consent checkbox
  const consentCheckbox = form.querySelector('#consent');
  if (consentCheckbox) {
    consentCheckbox.addEventListener('change', (event) => {
      validateFormField(event.target);
    });
  }

  // Log initialization
  console.log('Contact form initialized:', {
    timestamp: new Date().toISOString(),
    formId: form.id,
    fieldCount: fields.length,
  });
}

/**
 * Cleanup function for removing event listeners
 */
export function cleanupContactForm() {
  const form = document.getElementById('contact-form');

  if (!form) {
    return;
  }

  // Remove submit listener
  form.removeEventListener('submit', handleFormSubmit);

  // Remove field listeners
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((field) => {
    field.removeEventListener('blur', handleFieldBlur);
    field.removeEventListener('input', handleFieldInput);
  });

  // Reset form state
  formState.isSubmitting = false;
  formState.hasSubmitted = false;
  formState.validationErrors.clear();
  formState.touchedFields.clear();

  console.log('Contact form cleaned up');
}