/**
 * Company Information Data Module
 * 
 * Provides comprehensive business information for the agricultural company
 * including background, experience, mission, values, certifications, and trust indicators.
 * 
 * @module data/company
 * @generated-from: task-id:AGRO-006
 * @modifies: none
 * @dependencies: []
 */

/**
 * Company information object containing all business details
 * @type {Object}
 * @property {Object} background - Company background and history
 * @property {number} yearsOfExperience - Years in agricultural business
 * @property {Object} mission - Mission statement and commitment
 * @property {string[]} values - Core company values
 * @property {Object[]} certifications - Industry certifications and awards
 * @property {Object[]} trustIndicators - Trust-building elements
 * @property {Object[]} statistics - Key business statistics
 */
const companyInfo = Object.freeze({
  background: Object.freeze({
    title: 'Our Story',
    subtitle: 'Rooted in Agricultural Excellence',
    description: `Founded with a passion for sustainable agriculture and a commitment to supporting farmers, 
    we have grown from a small local operation into a trusted partner for agricultural businesses across the region. 
    Our journey began with a simple mission: to provide high-quality agricultural solutions that help farmers thrive 
    while protecting the land for future generations.`,
    extendedDescription: `Over the years, we have built strong relationships with farmers, suppliers, and agricultural 
    experts, creating a network of knowledge and support that benefits everyone we serve. Our team combines traditional 
    farming wisdom with modern agricultural science to deliver solutions that are both effective and environmentally responsible.`,
    foundedYear: 1998,
    location: 'Serving agricultural communities nationwide',
    teamSize: '50+ dedicated professionals',
  }),

  yearsOfExperience: 25,

  mission: Object.freeze({
    statement: `To empower agricultural businesses with innovative solutions, expert guidance, and unwavering support, 
    fostering sustainable growth and prosperity in farming communities.`,
    commitment: `We are committed to agricultural excellence through continuous innovation, sustainable practices, 
    and building lasting partnerships with the farmers and businesses we serve.`,
    vision: `To be the most trusted partner in agricultural success, recognized for our integrity, expertise, 
    and dedication to sustainable farming practices.`,
  }),

  values: Object.freeze([
    'Integrity in every interaction and transaction',
    'Sustainability as a core principle, not an afterthought',
    'Innovation driven by real agricultural needs',
    'Partnership built on trust and mutual success',
    'Excellence in service, products, and support',
    'Community commitment to farming families',
    'Expertise backed by decades of agricultural experience',
    'Responsibility to land, environment, and future generations',
  ]),

  certifications: Object.freeze([
    Object.freeze({
      id: 'cert-1',
      name: 'Organic Certification',
      issuer: 'USDA National Organic Program',
      year: 2015,
      description: 'Certified organic practices and product handling',
      icon: '🌱',
    }),
    Object.freeze({
      id: 'cert-2',
      name: 'Sustainable Agriculture Award',
      issuer: 'National Agricultural Association',
      year: 2020,
      description: 'Recognition for sustainable farming practices',
      icon: '🏆',
    }),
    Object.freeze({
      id: 'cert-3',
      name: 'Quality Assurance Certification',
      issuer: 'Agricultural Quality Institute',
      year: 2018,
      description: 'Certified quality management systems',
      icon: '✓',
    }),
    Object.freeze({
      id: 'cert-4',
      name: 'Environmental Stewardship Recognition',
      issuer: 'Environmental Protection Agency',
      year: 2021,
      description: 'Excellence in environmental protection',
      icon: '🌍',
    }),
  ]),

  trustIndicators: Object.freeze([
    Object.freeze({
      id: 'trust-1',
      metric: 'Customer Satisfaction',
      value: '98%',
      description: 'of customers rate our service as excellent',
      icon: '⭐',
    }),
    Object.freeze({
      id: 'trust-2',
      metric: 'Repeat Business',
      value: '95%',
      description: 'of clients return for continued partnership',
      icon: '🔄',
    }),
    Object.freeze({
      id: 'trust-3',
      metric: 'Expert Team',
      value: '50+',
      description: 'agricultural specialists and advisors',
      icon: '👥',
    }),
    Object.freeze({
      id: 'trust-4',
      metric: 'Product Quality',
      value: '100%',
      description: 'quality guaranteed on all products',
      icon: '✓',
    }),
  ]),

  statistics: Object.freeze([
    Object.freeze({
      id: 'stat-1',
      number: '25+',
      label: 'Years of Experience',
      description: 'Serving agricultural communities',
    }),
    Object.freeze({
      id: 'stat-2',
      number: '5000+',
      label: 'Satisfied Customers',
      description: 'Farmers and agricultural businesses',
    }),
    Object.freeze({
      id: 'stat-3',
      number: '50+',
      label: 'Expert Team Members',
      description: 'Agricultural specialists',
    }),
    Object.freeze({
      id: 'stat-4',
      number: '98%',
      label: 'Customer Satisfaction',
      description: 'Rated excellent service',
    }),
  ]),

  testimonials: Object.freeze([
    Object.freeze({
      id: 'testimonial-1',
      name: 'John Anderson',
      role: 'Farm Owner',
      location: 'Iowa',
      quote: `Working with this team has transformed our farming operation. Their expertise and 
      dedication to sustainable practices have helped us increase yields while protecting our land.`,
      rating: 5,
      year: 2023,
    }),
    Object.freeze({
      id: 'testimonial-2',
      name: 'Sarah Mitchell',
      role: 'Agricultural Consultant',
      location: 'Nebraska',
      quote: `I recommend them to all my clients. Their knowledge of modern agricultural techniques 
      combined with respect for traditional farming wisdom is unmatched.`,
      rating: 5,
      year: 2023,
    }),
    Object.freeze({
      id: 'testimonial-3',
      name: 'Robert Chen',
      role: 'Organic Farm Manager',
      location: 'California',
      quote: `The support and guidance we received during our transition to organic farming was invaluable. 
      They were with us every step of the way.`,
      rating: 5,
      year: 2022,
    }),
  ]),

  contact: Object.freeze({
    phone: '1-800-AGRO-HELP',
    email: 'info@agroexcellence.com',
    address: '123 Agricultural Way, Farmville, USA',
    hours: 'Monday - Friday: 8:00 AM - 6:00 PM',
    emergencySupport: '24/7 Emergency Agricultural Support Available',
  }),
});

/**
 * Get company background information
 * @returns {Object} Background information object
 */
export const getBackground = () => companyInfo.background;

/**
 * Get years of experience
 * @returns {number} Years in business
 */
export const getYearsOfExperience = () => companyInfo.yearsOfExperience;

/**
 * Get mission statement and commitment
 * @returns {Object} Mission information object
 */
export const getMission = () => companyInfo.mission;

/**
 * Get company values
 * @returns {string[]} Array of company values
 */
export const getValues = () => companyInfo.values;

/**
 * Get certifications and awards
 * @returns {Object[]} Array of certification objects
 */
export const getCertifications = () => companyInfo.certifications;

/**
 * Get trust indicators
 * @returns {Object[]} Array of trust indicator objects
 */
export const getTrustIndicators = () => companyInfo.trustIndicators;

/**
 * Get business statistics
 * @returns {Object[]} Array of statistic objects
 */
export const getStatistics = () => companyInfo.statistics;

/**
 * Get customer testimonials
 * @returns {Object[]} Array of testimonial objects
 */
export const getTestimonials = () => companyInfo.testimonials;

/**
 * Get contact information
 * @returns {Object} Contact information object
 */
export const getContact = () => companyInfo.contact;

/**
 * Get complete company information
 * @returns {Object} Complete company information object
 */
export const getCompanyInfo = () => companyInfo;

/**
 * Get certification by ID
 * @param {string} certId - Certification ID
 * @returns {Object|null} Certification object or null if not found
 */
export const getCertificationById = (certId) => {
  if (typeof certId !== 'string' || !certId) {
    return null;
  }
  return companyInfo.certifications.find((cert) => cert.id === certId) || null;
};

/**
 * Get testimonial by ID
 * @param {string} testimonialId - Testimonial ID
 * @returns {Object|null} Testimonial object or null if not found
 */
export const getTestimonialById = (testimonialId) => {
  if (typeof testimonialId !== 'string' || !testimonialId) {
    return null;
  }
  return companyInfo.testimonials.find((t) => t.id === testimonialId) || null;
};

/**
 * Get statistics formatted for display
 * @returns {Object[]} Array of formatted statistic objects
 */
export const getFormattedStatistics = () => {
  return companyInfo.statistics.map((stat) => ({
    ...stat,
    displayNumber: stat.number,
    displayLabel: stat.label,
    ariaLabel: `${stat.number} ${stat.label}: ${stat.description}`,
  }));
};

/**
 * Validate company information structure
 * @returns {boolean} True if structure is valid
 */
export const validateCompanyInfo = () => {
  try {
    const requiredFields = [
      'background',
      'yearsOfExperience',
      'mission',
      'values',
      'certifications',
      'trustIndicators',
      'statistics',
      'testimonials',
      'contact',
    ];

    return requiredFields.every((field) => field in companyInfo);
  } catch (_error) {
    return false;
  }
};

export default companyInfo;