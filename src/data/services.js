/**
 * Services Data Module
 * Production-ready ES module for agricultural business service offerings
 * 
 * @module services-data
 * @description Comprehensive agricultural services data with structured information
 * for crop consulting, equipment services, soil analysis, harvest planning, and more
 */

// ============================================
// Service Category Constants
// ============================================

/**
 * Service category enumeration
 * @readonly
 * @enum {string}
 */
const ServiceCategory = Object.freeze({
  CONSULTING: 'consulting',
  TECHNOLOGY: 'technology',
  ANALYSIS: 'analysis',
  EQUIPMENT: 'equipment',
  SUSTAINABILITY: 'sustainability',
  PLANNING: 'planning',
  MANAGEMENT: 'management',
});

// ============================================
// Service Data Structure
// ============================================

/**
 * Service data type definition
 * @typedef {Object} ServiceData
 * @property {string} id - Unique service identifier (kebab-case)
 * @property {string} title - Service display title
 * @property {string} description - Detailed service description
 * @property {string} icon - Icon reference path or identifier
 * @property {string} category - Service category from ServiceCategory enum
 * @property {boolean} featured - Whether service should be prominently displayed
 * @property {string[]} keywords - Search and categorization keywords
 * @property {Object} metadata - Additional service metadata
 * @property {string} metadata.duration - Typical service duration
 * @property {string} metadata.availability - Service availability status
 * @property {number} metadata.priority - Display priority (lower = higher priority)
 */

// ============================================
// Agricultural Services Data
// ============================================

/**
 * Comprehensive agricultural business service offerings
 * @type {ServiceData[]}
 */
const servicesData = [
  {
    id: 'crop-consulting',
    title: 'Crop Consulting Services',
    description:
      'Expert agricultural consulting for crop selection, rotation planning, and yield optimization. Our agronomists provide data-driven recommendations tailored to your soil conditions, climate, and business goals to maximize profitability and sustainability.',
    icon: '/images/icons/crop-consulting.svg',
    category: ServiceCategory.CONSULTING,
    featured: true,
    keywords: [
      'crop selection',
      'rotation planning',
      'yield optimization',
      'agronomy',
      'farm consulting',
    ],
    metadata: {
      duration: 'Ongoing consultation',
      availability: 'Year-round',
      priority: 1,
    },
  },
  {
    id: 'soil-analysis',
    title: 'Comprehensive Soil Analysis',
    description:
      'Advanced soil testing and analysis services using state-of-the-art laboratory equipment. We provide detailed reports on nutrient levels, pH balance, organic matter content, and contamination screening to guide precise fertilization and amendment strategies.',
    icon: '/images/icons/soil-analysis.svg',
    category: ServiceCategory.ANALYSIS,
    featured: true,
    keywords: [
      'soil testing',
      'nutrient analysis',
      'pH testing',
      'soil health',
      'fertilization planning',
    ],
    metadata: {
      duration: '5-7 business days',
      availability: 'Year-round',
      priority: 2,
    },
  },
  {
    id: 'equipment-services',
    title: 'Agricultural Equipment Services',
    description:
      'Full-service equipment solutions including sales, leasing, maintenance, and repair of modern farming machinery. From tractors and harvesters to precision agriculture technology, we ensure your operations run smoothly with minimal downtime.',
    icon: '/images/icons/equipment.svg',
    category: ServiceCategory.EQUIPMENT,
    featured: true,
    keywords: [
      'farm equipment',
      'machinery sales',
      'equipment leasing',
      'maintenance',
      'repair services',
    ],
    metadata: {
      duration: 'Variable by service',
      availability: 'Year-round',
      priority: 3,
    },
  },
  {
    id: 'harvest-planning',
    title: 'Harvest Planning & Management',
    description:
      'Strategic harvest planning services that optimize timing, logistics, and resource allocation. We help coordinate labor, equipment, storage, and transportation to ensure efficient harvest operations and minimize post-harvest losses.',
    icon: '/images/icons/harvest-planning.svg',
    category: ServiceCategory.PLANNING,
    featured: true,
    keywords: [
      'harvest timing',
      'logistics planning',
      'resource management',
      'post-harvest',
      'operations',
    ],
    metadata: {
      duration: 'Seasonal planning',
      availability: 'Pre-harvest season',
      priority: 4,
    },
  },
  {
    id: 'precision-agriculture',
    title: 'Precision Agriculture Technology',
    description:
      'Implementation of cutting-edge precision agriculture solutions including GPS-guided equipment, drone monitoring, variable rate application systems, and IoT sensors. Leverage data analytics and automation to optimize inputs and maximize yields.',
    icon: '/images/icons/precision-ag.svg',
    category: ServiceCategory.TECHNOLOGY,
    featured: true,
    keywords: [
      'precision farming',
      'GPS technology',
      'drone monitoring',
      'IoT sensors',
      'data analytics',
    ],
    metadata: {
      duration: 'Implementation varies',
      availability: 'Year-round',
      priority: 5,
    },
  },
  {
    id: 'irrigation-management',
    title: 'Irrigation System Management',
    description:
      'Design, installation, and management of efficient irrigation systems tailored to your crops and terrain. We specialize in drip irrigation, center pivot systems, and smart water management solutions that conserve resources while ensuring optimal crop hydration.',
    icon: '/images/icons/irrigation.svg',
    category: ServiceCategory.MANAGEMENT,
    featured: true,
    keywords: [
      'irrigation design',
      'water management',
      'drip irrigation',
      'pivot systems',
      'water conservation',
    ],
    metadata: {
      duration: 'Project-based',
      availability: 'Year-round',
      priority: 6,
    },
  },
  {
    id: 'sustainable-practices',
    title: 'Sustainable Farming Practices',
    description:
      'Guidance on implementing environmentally responsible farming methods including organic certification, integrated pest management, cover cropping, and regenerative agriculture techniques. Build long-term soil health while meeting sustainability standards.',
    icon: '/images/icons/sustainability.svg',
    category: ServiceCategory.SUSTAINABILITY,
    featured: false,
    keywords: [
      'organic farming',
      'regenerative agriculture',
      'IPM',
      'cover crops',
      'soil health',
    ],
    metadata: {
      duration: 'Long-term transition',
      availability: 'Year-round',
      priority: 7,
    },
  },
  {
    id: 'pest-disease-management',
    title: 'Pest & Disease Management',
    description:
      'Integrated pest and disease management programs combining monitoring, identification, and targeted treatment strategies. We emphasize biological controls and precision application to minimize chemical use while protecting crop health.',
    icon: '/images/icons/pest-management.svg',
    category: ServiceCategory.MANAGEMENT,
    featured: false,
    keywords: [
      'pest control',
      'disease prevention',
      'IPM',
      'crop protection',
      'monitoring',
    ],
    metadata: {
      duration: 'Seasonal monitoring',
      availability: 'Growing season',
      priority: 8,
    },
  },
  {
    id: 'crop-insurance-advisory',
    title: 'Crop Insurance Advisory',
    description:
      'Expert guidance on crop insurance options, risk assessment, and claims management. We help you navigate federal programs and private insurance products to protect your investment against weather, pests, and market volatility.',
    icon: '/images/icons/insurance.svg',
    category: ServiceCategory.CONSULTING,
    featured: false,
    keywords: [
      'crop insurance',
      'risk management',
      'federal programs',
      'claims assistance',
      'financial protection',
    ],
    metadata: {
      duration: 'Annual review',
      availability: 'Year-round',
      priority: 9,
    },
  },
  {
    id: 'market-analysis',
    title: 'Agricultural Market Analysis',
    description:
      'Comprehensive market intelligence and commodity price analysis to inform planting decisions and marketing strategies. Access real-time market data, trend forecasts, and expert insights to optimize your selling opportunities.',
    icon: '/images/icons/market-analysis.svg',
    category: ServiceCategory.CONSULTING,
    featured: false,
    keywords: [
      'market intelligence',
      'commodity prices',
      'trend analysis',
      'marketing strategy',
      'price forecasting',
    ],
    metadata: {
      duration: 'Ongoing updates',
      availability: 'Year-round',
      priority: 10,
    },
  },
  {
    id: 'farm-automation',
    title: 'Farm Automation Solutions',
    description:
      'Implementation of automated systems for feeding, climate control, monitoring, and data collection. Reduce labor costs and improve consistency with robotics, automated gates, and smart control systems tailored to your operation.',
    icon: '/images/icons/automation.svg',
    category: ServiceCategory.TECHNOLOGY,
    featured: false,
    keywords: [
      'automation',
      'robotics',
      'smart systems',
      'labor efficiency',
      'monitoring',
    ],
    metadata: {
      duration: 'Project-based',
      availability: 'Year-round',
      priority: 11,
    },
  },
  {
    id: 'nutrient-management',
    title: 'Nutrient Management Planning',
    description:
      'Customized nutrient management plans that optimize fertilizer application based on soil tests, crop requirements, and environmental regulations. Improve nutrient use efficiency while reducing costs and environmental impact.',
    icon: '/images/icons/nutrient-management.svg',
    category: ServiceCategory.PLANNING,
    featured: false,
    keywords: [
      'fertilizer planning',
      'nutrient efficiency',
      'soil fertility',
      'environmental compliance',
      'cost optimization',
    ],
    metadata: {
      duration: 'Seasonal planning',
      availability: 'Year-round',
      priority: 12,
    },
  },
];

// ============================================
// Data Validation
// ============================================

/**
 * Validate service data structure
 * @param {ServiceData} service - Service object to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
function validateServiceData(service) {
  const requiredFields = [
    'id',
    'title',
    'description',
    'icon',
    'category',
    'featured',
    'keywords',
    'metadata',
  ];

  for (const field of requiredFields) {
    if (!(field in service)) {
      throw new Error(
        `[Services Data] Invalid service: missing required field '${field}' in service '${service.id || 'unknown'}'`
      );
    }
  }

  if (typeof service.id !== 'string' || service.id.length === 0) {
    throw new Error(
      `[Services Data] Invalid service ID: must be non-empty string`
    );
  }

  if (typeof service.title !== 'string' || service.title.length === 0) {
    throw new Error(
      `[Services Data] Invalid service title in '${service.id}': must be non-empty string`
    );
  }

  if (
    typeof service.description !== 'string' ||
    service.description.length === 0
  ) {
    throw new Error(
      `[Services Data] Invalid service description in '${service.id}': must be non-empty string`
    );
  }

  if (!Object.values(ServiceCategory).includes(service.category)) {
    throw new Error(
      `[Services Data] Invalid category '${service.category}' in service '${service.id}': must be one of ${Object.values(ServiceCategory).join(', ')}`
    );
  }

  if (typeof service.featured !== 'boolean') {
    throw new Error(
      `[Services Data] Invalid featured flag in '${service.id}': must be boolean`
    );
  }

  if (!Array.isArray(service.keywords) || service.keywords.length === 0) {
    throw new Error(
      `[Services Data] Invalid keywords in '${service.id}': must be non-empty array`
    );
  }

  if (
    !service.metadata ||
    typeof service.metadata !== 'object' ||
    !service.metadata.duration ||
    !service.metadata.availability ||
    typeof service.metadata.priority !== 'number'
  ) {
    throw new Error(
      `[Services Data] Invalid metadata in '${service.id}': must include duration, availability, and priority`
    );
  }

  return true;
}

// ============================================
// Data Integrity Checks
// ============================================

/**
 * Validate all services data on module load
 * @throws {Error} If any service data is invalid
 */
function validateAllServices() {
  try {
    const serviceIds = new Set();

    for (const service of servicesData) {
      validateServiceData(service);

      if (serviceIds.has(service.id)) {
        throw new Error(
          `[Services Data] Duplicate service ID detected: '${service.id}'`
        );
      }
      serviceIds.add(service.id);
    }

    console.log(
      `[Services Data] Validated ${servicesData.length} services successfully`
    );
  } catch (error) {
    console.error('[Services Data] Validation failed:', error);
    throw error;
  }
}

// Run validation on module load
validateAllServices();

// ============================================
// Data Access Utilities
// ============================================

/**
 * Get service by ID with error handling
 * @param {string} serviceId - Service identifier
 * @returns {ServiceData|null} Service data or null if not found
 */
export function getServiceById(serviceId) {
  if (typeof serviceId !== 'string' || serviceId.length === 0) {
    console.warn('[Services Data] Invalid service ID provided');
    return null;
  }

  const service = servicesData.find((s) => s.id === serviceId);

  if (!service) {
    console.warn(`[Services Data] Service not found: '${serviceId}'`);
  }

  return service || null;
}

/**
 * Get services by category
 * @param {string} category - Service category
 * @returns {ServiceData[]} Array of services in category
 */
export function getServicesByCategory(category) {
  if (!Object.values(ServiceCategory).includes(category)) {
    console.warn(`[Services Data] Invalid category: '${category}'`);
    return [];
  }

  return servicesData.filter((service) => service.category === category);
}

/**
 * Get featured services
 * @returns {ServiceData[]} Array of featured services sorted by priority
 */
export function getFeaturedServices() {
  return servicesData
    .filter((service) => service.featured)
    .sort((a, b) => a.metadata.priority - b.metadata.priority);
}

/**
 * Get all services sorted by priority
 * @returns {ServiceData[]} Array of all services sorted by priority
 */
export function getAllServicesSorted() {
  return [...servicesData].sort(
    (a, b) => a.metadata.priority - b.metadata.priority
  );
}

/**
 * Search services by keyword
 * @param {string} keyword - Search keyword
 * @returns {ServiceData[]} Array of matching services
 */
export function searchServicesByKeyword(keyword) {
  if (typeof keyword !== 'string' || keyword.length === 0) {
    console.warn('[Services Data] Invalid search keyword');
    return [];
  }

  const normalizedKeyword = keyword.toLowerCase().trim();

  return servicesData.filter(
    (service) =>
      service.title.toLowerCase().includes(normalizedKeyword) ||
      service.description.toLowerCase().includes(normalizedKeyword) ||
      service.keywords.some((kw) => kw.toLowerCase().includes(normalizedKeyword))
  );
}

/**
 * Get service categories with counts
 * @returns {Object} Object mapping categories to service counts
 */
export function getServiceCategoryCounts() {
  const counts = {};

  for (const category of Object.values(ServiceCategory)) {
    counts[category] = servicesData.filter(
      (service) => service.category === category
    ).length;
  }

  return counts;
}

// ============================================
// Module Exports
// ============================================

export { servicesData, ServiceCategory };

export default servicesData;