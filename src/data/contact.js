/**
 * Contact Information Data Module
 * Production-ready contact data with comprehensive business information
 * 
 * @module contact
 * @generated-from: task-id:AGRO-007
 * @modifies: contact information data
 * @dependencies: []
 */

/**
 * Business hours configuration
 * Structured format for easy parsing and display
 */
const BUSINESS_HOURS = Object.freeze({
  weekdays: {
    days: 'Monday - Friday',
    hours: '8:00 AM - 6:00 PM',
    open: '08:00',
    close: '18:00',
  },
  saturday: {
    days: 'Saturday',
    hours: '9:00 AM - 4:00 PM',
    open: '09:00',
    close: '16:00',
  },
  sunday: {
    days: 'Sunday',
    hours: 'Closed',
    open: null,
    close: null,
  },
  timezone: 'EST',
  note: 'Emergency services available 24/7',
});

/**
 * Contact methods with accessibility and functionality metadata
 */
const CONTACT_METHODS = Object.freeze({
  phone: {
    display: '(555) 123-4567',
    raw: '+15551234567',
    type: 'tel',
    label: 'Call us',
    icon: 'phone',
    primary: true,
    description: 'Speak directly with our agricultural experts',
  },
  email: {
    display: 'info@agroservices.com',
    raw: 'info@agroservices.com',
    type: 'mailto',
    label: 'Email us',
    icon: 'email',
    primary: true,
    description: 'Send us a detailed inquiry',
  },
  emergency: {
    display: '(555) 999-8888',
    raw: '+15559998888',
    type: 'tel',
    label: '24/7 Emergency',
    icon: 'emergency',
    primary: false,
    description: 'For urgent agricultural emergencies',
  },
});

/**
 * Physical address with structured components
 */
const BUSINESS_ADDRESS = Object.freeze({
  street: '1234 Farm Road',
  city: 'Greenfield',
  state: 'CA',
  zip: '95123',
  country: 'United States',
  formatted: '1234 Farm Road, Greenfield, CA 95123',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  mapUrl: 'https://maps.google.com/?q=1234+Farm+Road+Greenfield+CA+95123',
  directionsUrl: 'https://maps.google.com/maps/dir//1234+Farm+Road+Greenfield+CA+95123',
});

/**
 * Service areas for agricultural operations
 */
const SERVICE_AREAS = Object.freeze([
  'Greenfield',
  'Springfield',
  'Riverside',
  'Oakdale',
  'Meadowbrook',
  'Within 50 miles of Greenfield, CA',
]);

/**
 * Social media and additional contact channels
 */
const SOCIAL_MEDIA = Object.freeze({
  facebook: {
    url: 'https://facebook.com/agroservices',
    label: 'Facebook',
    icon: 'facebook',
  },
  instagram: {
    url: 'https://instagram.com/agroservices',
    label: 'Instagram',
    icon: 'instagram',
  },
  linkedin: {
    url: 'https://linkedin.com/company/agroservices',
    label: 'LinkedIn',
    icon: 'linkedin',
  },
});

/**
 * Complete contact information object
 * Immutable data structure with all business contact details
 */
export const contactInfo = Object.freeze({
  businessName: 'AgroServices',
  tagline: 'Your Trusted Agricultural Partner',
  
  // Contact methods
  phone: CONTACT_METHODS.phone,
  email: CONTACT_METHODS.email,
  emergency: CONTACT_METHODS.emergency,
  
  // All contact methods for iteration
  allContactMethods: Object.values(CONTACT_METHODS),
  
  // Physical location
  address: BUSINESS_ADDRESS,
  
  // Operating hours
  hours: BUSINESS_HOURS,
  
  // Service coverage
  serviceAreas: SERVICE_AREAS,
  
  // Social presence
  social: SOCIAL_MEDIA,
  
  // Additional metadata
  metadata: {
    established: '2010',
    licenseNumber: 'AG-12345-CA',
    certifications: [
      'Certified Crop Advisor',
      'Licensed Pest Control Advisor',
      'Organic Certification',
    ],
    languages: ['English', 'Spanish'],
  },
});

/**
 * Utility function to check if business is currently open
 * @returns {boolean} True if business is currently open
 */
export function isBusinessOpen() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;

  // Sunday - closed
  if (day === 0) {
    return false;
  }

  // Saturday
  if (day === 6) {
    const openTime = 9 * 60; // 9:00 AM
    const closeTime = 16 * 60; // 4:00 PM
    return currentTime >= openTime && currentTime < closeTime;
  }

  // Weekdays (Monday-Friday)
  const openTime = 8 * 60; // 8:00 AM
  const closeTime = 18 * 60; // 6:00 PM
  return currentTime >= openTime && currentTime < closeTime;
}

/**
 * Get formatted business hours for display
 * @returns {Array<{days: string, hours: string}>} Formatted hours array
 */
export function getFormattedHours() {
  return [
    {
      days: BUSINESS_HOURS.weekdays.days,
      hours: BUSINESS_HOURS.weekdays.hours,
    },
    {
      days: BUSINESS_HOURS.saturday.days,
      hours: BUSINESS_HOURS.saturday.hours,
    },
    {
      days: BUSINESS_HOURS.sunday.days,
      hours: BUSINESS_HOURS.sunday.hours,
    },
  ];
}

/**
 * Generate click-to-call link
 * @param {string} phoneType - Type of phone ('phone' or 'emergency')
 * @returns {string} Formatted tel: link
 */
export function getPhoneLink(phoneType = 'phone') {
  const contact = CONTACT_METHODS[phoneType];
  if (!contact || contact.type !== 'tel') {
    console.warn(`Invalid phone type: ${phoneType}`);
    return '#';
  }
  return `tel:${contact.raw}`;
}

/**
 * Generate mailto link with optional subject and body
 * @param {Object} options - Email options
 * @param {string} [options.subject] - Email subject
 * @param {string} [options.body] - Email body
 * @returns {string} Formatted mailto: link
 */
export function getEmailLink(options = {}) {
  const { subject, body } = options;
  const email = CONTACT_METHODS.email.raw;
  
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Get directions URL for navigation apps
 * @returns {string} Google Maps directions URL
 */
export function getDirectionsUrl() {
  return BUSINESS_ADDRESS.directionsUrl;
}

/**
 * Get map view URL
 * @returns {string} Google Maps location URL
 */
export function getMapUrl() {
  return BUSINESS_ADDRESS.mapUrl;
}

/**
 * Get contact method by type
 * @param {string} type - Contact method type
 * @returns {Object|null} Contact method object or null
 */
export function getContactMethod(type) {
  return CONTACT_METHODS[type] || null;
}

/**
 * Get primary contact methods
 * @returns {Array<Object>} Array of primary contact methods
 */
export function getPrimaryContactMethods() {
  return Object.values(CONTACT_METHODS).filter((method) => method.primary);
}

/**
 * Validate contact data structure
 * @returns {boolean} True if contact data is valid
 */
export function validateContactData() {
  try {
    // Validate required fields
    if (!contactInfo.businessName || !contactInfo.phone || !contactInfo.email) {
      console.error('Missing required contact information fields');
      return false;
    }

    // Validate phone format
    if (!contactInfo.phone.raw.match(/^\+?[\d\s()-]+$/)) {
      console.error('Invalid phone number format');
      return false;
    }

    // Validate email format
    if (!contactInfo.email.raw.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.error('Invalid email format');
      return false;
    }

    // Validate address
    if (!contactInfo.address.street || !contactInfo.address.city || !contactInfo.address.state) {
      console.error('Incomplete address information');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Contact data validation error:', error);
    return false;
  }
}

// Log module initialization
console.log('Contact data module initialized:', {
  timestamp: new Date().toISOString(),
  businessName: contactInfo.businessName,
  contactMethodsCount: contactInfo.allContactMethods.length,
  serviceAreasCount: contactInfo.serviceAreas.length,
  isValid: validateContactData(),
});