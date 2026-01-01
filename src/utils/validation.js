/**
 * Form Validation Utility Module
 * Production-ready validation functions for contact form with comprehensive error handling
 * 
 * @module validation
 * @generated-from: task-id:AGRO-007
 * @modifies: contact form validation
 * @dependencies: []
 */

/**
 * Email validation pattern (RFC 5322 simplified)
 * Validates standard email format with proper domain structure
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation pattern
 * Accepts digits, spaces, parentheses, plus signs, and hyphens
 */
const PHONE_PATTERN = /^[\d\s()+-]+$/;

/**
 * Name validation pattern
 * Accepts letters, spaces, hyphens, and apostrophes (for names like O'Brien, Mary-Jane)
 */
const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;

/**
 * Validation constraints for agricultural business context
 */
const VALIDATION_CONSTRAINTS = Object.freeze({
  name: {
    minLength: 2,
    maxLength: 100,
  },
  email: {
    maxLength: 254, // RFC 5321 maximum
  },
  phone: {
    minLength: 10,
    maxLength: 20,
  },
  message: {
    minLength: 10,
    maxLength: 1000,
  },
});

/**
 * Sanitizes string input by trimming whitespace and removing control characters
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace and remove control characters (except newlines and tabs for textarea)
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateEmail(email) {
  const sanitized = sanitizeInput(email);

  if (!sanitized) {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  if (sanitized.length > VALIDATION_CONSTRAINTS.email.maxLength) {
    return {
      isValid: false,
      error: 'Email address is too long',
    };
  }

  if (!EMAIL_PATTERN.test(sanitized)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., name@example.com)',
    };
  }

  // Additional validation: check for consecutive dots
  if (sanitized.includes('..')) {
    return {
      isValid: false,
      error: 'Email address cannot contain consecutive dots',
    };
  }

  // Validate domain has at least one character before and after the dot
  const [_localPart, domain] = sanitized.split('@');
  if (domain) {
    const domainParts = domain.split('.');
    const hasInvalidPart = domainParts.some(part => part.length === 0);
    if (hasInvalidPart) {
      return {
        isValid: false,
        error: 'Please enter a valid email domain',
      };
    }
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @param {boolean} required - Whether phone is required
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validatePhone(phone, required = false) {
  const sanitized = sanitizeInput(phone);

  if (!sanitized) {
    if (required) {
      return {
        isValid: false,
        error: 'Phone number is required',
      };
    }
    return {
      isValid: true,
      error: null,
    };
  }

  if (!PHONE_PATTERN.test(sanitized)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, spaces, parentheses, plus signs, and hyphens',
    };
  }

  // Extract digits only for length validation
  const digitsOnly = sanitized.replace(/\D/g, '');

  if (digitsOnly.length < VALIDATION_CONSTRAINTS.phone.minLength) {
    return {
      isValid: false,
      error: `Phone number must contain at least ${VALIDATION_CONSTRAINTS.phone.minLength} digits`,
    };
  }

  if (digitsOnly.length > VALIDATION_CONSTRAINTS.phone.maxLength) {
    return {
      isValid: false,
      error: 'Phone number is too long',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates name field (full name, first name, last name)
 * @param {string} name - Name to validate
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateName(name) {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return {
      isValid: false,
      error: 'Name is required',
    };
  }

  if (sanitized.length < VALIDATION_CONSTRAINTS.name.minLength) {
    return {
      isValid: false,
      error: `Name must be at least ${VALIDATION_CONSTRAINTS.name.minLength} characters`,
    };
  }

  if (sanitized.length > VALIDATION_CONSTRAINTS.name.maxLength) {
    return {
      isValid: false,
      error: `Name must not exceed ${VALIDATION_CONSTRAINTS.name.maxLength} characters`,
    };
  }

  if (!NAME_PATTERN.test(sanitized)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }

  // Validate no excessive consecutive spaces or special characters
  if (/\s{2,}/.test(sanitized) || /[-']{2,}/.test(sanitized)) {
    return {
      isValid: false,
      error: 'Name contains invalid character sequences',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates required field (generic)
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateRequired(value, fieldName = 'This field') {
  const sanitized = sanitizeInput(value);

  if (!sanitized) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates message/textarea field with agricultural business context
 * @param {string} message - Message to validate
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateMessage(message) {
  const sanitized = sanitizeInput(message);

  if (!sanitized) {
    return {
      isValid: false,
      error: 'Message is required',
    };
  }

  if (sanitized.length < VALIDATION_CONSTRAINTS.message.minLength) {
    return {
      isValid: false,
      error: `Message must be at least ${VALIDATION_CONSTRAINTS.message.minLength} characters`,
    };
  }

  if (sanitized.length > VALIDATION_CONSTRAINTS.message.maxLength) {
    return {
      isValid: false,
      error: `Message must not exceed ${VALIDATION_CONSTRAINTS.message.maxLength} characters`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates select/dropdown field
 * @param {string} value - Selected value
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateSelect(value, fieldName = 'Selection') {
  const sanitized = sanitizeInput(value);

  if (!sanitized || sanitized === '' || sanitized === 'default') {
    return {
      isValid: false,
      error: `Please select a ${fieldName.toLowerCase()}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates checkbox field (e.g., consent, terms agreement)
 * @param {boolean} checked - Checkbox state
 * @param {string} fieldName - Name of the field for error message
 * @returns {{ isValid: boolean, error: string|null }} Validation result
 */
export function validateCheckbox(checked, fieldName = 'This field') {
  if (!checked) {
    return {
      isValid: false,
      error: `You must agree to ${fieldName.toLowerCase()}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates entire form data object
 * @param {Object} formData - Form data object with field values
 * @param {Object} validationRules - Validation rules configuration
 * @returns {{ isValid: boolean, errors: Object }} Validation result with all errors
 */
export function validateForm(formData, validationRules = {}) {
  const errors = {};
  let isValid = true;

  // Validate each field based on rules
  Object.entries(validationRules).forEach(([fieldName, rules]) => {
    const value = formData[fieldName];
    let result = { isValid: true, error: null };

    // Apply validation based on field type
    if (rules.type === 'email') {
      result = validateEmail(value);
    } else if (rules.type === 'phone') {
      result = validatePhone(value, rules.required);
    } else if (rules.type === 'name') {
      result = validateName(value);
    } else if (rules.type === 'message') {
      result = validateMessage(value);
    } else if (rules.type === 'select') {
      result = validateSelect(value, rules.label || fieldName);
    } else if (rules.type === 'checkbox') {
      result = validateCheckbox(value, rules.label || fieldName);
    } else if (rules.required) {
      result = validateRequired(value, rules.label || fieldName);
    }

    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
  };
}

/**
 * Formats phone number for display (US format)
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  const sanitized = sanitizeInput(phone);
  const digitsOnly = sanitized.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for 10-digit US numbers
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  // Format as +X (XXX) XXX-XXXX for 11-digit numbers (with country code)
  if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }

  // Return original for other formats
  return sanitized;
}

/**
 * Checks if string contains potentially harmful content
 * @param {string} input - Input to check
 * @returns {boolean} True if input appears safe
 */
export function isSafeInput(input) {
  const sanitized = sanitizeInput(input);

  // Check for common XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(sanitized));
}

/**
 * Validates and sanitizes form data for agricultural business context
 * @param {Object} rawFormData - Raw form data from submission
 * @returns {{ isValid: boolean, data: Object, errors: Object }} Processed form data
 */
export function processContactFormData(rawFormData) {
  const sanitizedData = {};
  const errors = {};
  let isValid = true;

  // Sanitize all inputs
  Object.entries(rawFormData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeInput(value);
      
      // Additional safety check
      if (!isSafeInput(sanitizedData[key])) {
        errors[key] = 'Input contains potentially unsafe content';
        isValid = false;
      }
    } else {
      sanitizedData[key] = value;
    }
  });

  // Validate required fields
  const nameResult = validateName(sanitizedData.name || '');
  if (!nameResult.isValid) {
    errors.name = nameResult.error;
    isValid = false;
  }

  const emailResult = validateEmail(sanitizedData.email || '');
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
    isValid = false;
  }

  // Phone is optional but validate if provided
  if (sanitizedData.phone) {
    const phoneResult = validatePhone(sanitizedData.phone, false);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
      isValid = false;
    }
  }

  const messageResult = validateMessage(sanitizedData.message || '');
  if (!messageResult.isValid) {
    errors.message = messageResult.error;
    isValid = false;
  }

  // Validate service selection if present
  if (sanitizedData.service) {
    const serviceResult = validateSelect(sanitizedData.service, 'Service');
    if (!serviceResult.isValid) {
      errors.service = serviceResult.error;
      isValid = false;
    }
  }

  return {
    isValid,
    data: sanitizedData,
    errors,
  };
}