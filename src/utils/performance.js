/**
 * Performance Monitoring and Optimization Utilities Module
 * Production-ready ES module for comprehensive performance tracking and optimization
 * 
 * @module performance
 * @description Implements performance measurement, bundle size monitoring, load time tracking,
 * and performance budget validation with structured logging and metrics collection
 */

// ============================================
// Constants and Configuration
// ============================================

/**
 * Performance budget thresholds for agricultural business requirements
 * @type {Object}
 */
const PERFORMANCE_BUDGETS = Object.freeze({
  // Page load metrics (milliseconds)
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  timeToInteractive: 3000,
  totalBlockingTime: 300,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  
  // Resource budgets (bytes)
  totalPageSize: 1500000, // 1.5MB for rural connections
  imageSize: 500000, // 500KB per image
  scriptSize: 300000, // 300KB total scripts
  styleSize: 100000, // 100KB total styles
  fontSize: 100000, // 100KB total fonts
  
  // Network metrics
  maxRequests: 50,
  maxDomainConnections: 6,
  
  // Rendering metrics
  maxDomNodes: 1500,
  maxDomDepth: 15,
});

/**
 * Performance metric categories
 * @type {Object}
 */
const METRIC_CATEGORIES = Object.freeze({
  NAVIGATION: 'navigation',
  RESOURCE: 'resource',
  PAINT: 'paint',
  LAYOUT: 'layout',
  CUSTOM: 'custom',
});

/**
 * Performance observer types
 * @type {Array<string>}
 */
const OBSERVER_TYPES = Object.freeze([
  'navigation',
  'resource',
  'paint',
  'largest-contentful-paint',
  'first-input',
  'layout-shift',
  'longtask',
]);

/**
 * Metrics storage
 * @type {Map<string, Object>}
 */
const metricsStore = new Map();

/**
 * Performance observers cache
 * @type {Map<string, PerformanceObserver>}
 */
const observersCache = new Map();

/**
 * Budget violations tracking
 * @type {Array<Object>}
 */
const budgetViolations = [];

/**
 * Performance marks tracking
 * @type {Map<string, number>}
 */
const performanceMarks = new Map();

// ============================================
// Utility Functions
// ============================================

/**
 * Generate unique identifier for tracking
 * @returns {string} Unique identifier
 */
function generateMetricId() {
  return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely get performance API
 * @returns {Performance|null} Performance API or null
 */
function getPerformanceAPI() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }
  return window.performance;
}

/**
 * Check if Performance Observer is supported
 * @returns {boolean} True if supported
 */
function supportsPerformanceObserver() {
  return typeof PerformanceObserver !== 'undefined';
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable time
 * @param {number} ms - Milliseconds to format
 * @returns {string} Formatted time
 */
function formatTime(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Calculate percentile from array of numbers
 * @param {Array<number>} values - Array of values
 * @param {number} percentile - Percentile (0-100)
 * @returns {number} Percentile value
 */
function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[Math.max(0, index)];
}

/**
 * Deep clone object safely
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('[Performance] Deep clone failed:', error);
    return obj;
  }
}

// ============================================
// Performance Measurement
// ============================================

/**
 * Start performance measurement
 * @param {string} name - Measurement name
 * @returns {string} Measurement ID
 */
export function startMeasure(name) {
  const perf = getPerformanceAPI();
  
  if (!perf || !perf.mark) {
    console.warn('[Performance] Performance API not available');
    return null;
  }
  
  const measureId = `${name}-${generateMetricId()}`;
  const markName = `${measureId}-start`;
  
  try {
    perf.mark(markName);
    performanceMarks.set(measureId, Date.now());
    
    console.log('[Performance] Started measure:', { name, measureId });
    
    return measureId;
  } catch (error) {
    console.error('[Performance] Failed to start measure:', { name, error });
    return null;
  }
}

/**
 * End performance measurement
 * @param {string} measureId - Measurement ID from startMeasure
 * @param {Object} metadata - Additional metadata
 * @returns {Object|null} Measurement result
 */
export function endMeasure(measureId, metadata = {}) {
  const perf = getPerformanceAPI();
  
  if (!perf || !measureId) {
    return null;
  }
  
  const startTime = performanceMarks.get(measureId);
  
  if (!startTime) {
    console.warn('[Performance] No start mark found:', measureId);
    return null;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  try {
    const startMarkName = `${measureId}-start`;
    const endMarkName = `${measureId}-end`;
    
    if (perf.mark && perf.measure) {
      perf.mark(endMarkName);
      perf.measure(measureId, startMarkName, endMarkName);
      
      const measure = perf.getEntriesByName(measureId, 'measure')[0];
      
      const result = {
        id: measureId,
        duration: measure ? measure.duration : duration,
        startTime,
        endTime,
        timestamp: Date.now(),
        category: METRIC_CATEGORIES.CUSTOM,
        ...metadata,
      };
      
      metricsStore.set(measureId, result);
      
      console.log('[Performance] Measurement complete:', {
        id: measureId,
        duration: formatTime(result.duration),
        ...metadata,
      });
      
      // Cleanup marks
      perf.clearMarks(startMarkName);
      perf.clearMarks(endMarkName);
      perf.clearMeasures(measureId);
    }
    
    performanceMarks.delete(measureId);
    
    return metricsStore.get(measureId);
  } catch (error) {
    console.error('[Performance] Failed to end measure:', { measureId, error });
    return null;
  }
}

/**
 * Measure function execution time
 * @param {Function} fn - Function to measure
 * @param {string} name - Measurement name
 * @returns {Function} Wrapped function
 */
export function measureFunction(fn, name) {
  return async function measured(...args) {
    const measureId = startMeasure(name || fn.name || 'anonymous');
    
    try {
      const result = await fn.apply(this, args);
      endMeasure(measureId, { success: true });
      return result;
    } catch (error) {
      endMeasure(measureId, { success: false, error: error.message });
      throw error;
    }
  };
}

// ============================================
// Navigation Timing
// ============================================

/**
 * Get navigation timing metrics
 * @returns {Object|null} Navigation timing data
 */
export function getNavigationTiming() {
  const perf = getPerformanceAPI();
  
  if (!perf || !perf.timing) {
    return null;
  }
  
  const timing = perf.timing;
  const navigation = perf.navigation;
  
  const metrics = {
    // DNS lookup
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    
    // TCP connection
    tcpConnection: timing.connectEnd - timing.connectStart,
    
    // SSL negotiation
    sslNegotiation: timing.secureConnectionStart > 0 
      ? timing.connectEnd - timing.secureConnectionStart 
      : 0,
    
    // Request/Response
    requestTime: timing.responseStart - timing.requestStart,
    responseTime: timing.responseEnd - timing.responseStart,
    
    // DOM processing
    domProcessing: timing.domComplete - timing.domLoading,
    domInteractive: timing.domInteractive - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    
    // Page load
    pageLoad: timing.loadEventEnd - timing.navigationStart,
    
    // Total time
    totalTime: timing.loadEventEnd - timing.fetchStart,
    
    // Navigation type
    navigationType: navigation ? navigation.type : null,
    redirectCount: navigation ? navigation.redirectCount : 0,
  };
  
  metricsStore.set('navigation-timing', {
    ...metrics,
    timestamp: Date.now(),
    category: METRIC_CATEGORIES.NAVIGATION,
  });
  
  return metrics;
}

// ============================================
// Resource Timing
// ============================================

/**
 * Get resource timing metrics
 * @returns {Array<Object>} Resource timing data
 */
export function getResourceTiming() {
  const perf = getPerformanceAPI();
  
  if (!perf || !perf.getEntriesByType) {
    return [];
  }
  
  const resources = perf.getEntriesByType('resource');
  
  const metrics = resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize || 0,
    encodedSize: resource.encodedBodySize || 0,
    decodedSize: resource.decodedBodySize || 0,
    startTime: resource.startTime,
    fetchStart: resource.fetchStart,
    domainLookupStart: resource.domainLookupStart,
    domainLookupEnd: resource.domainLookupEnd,
    connectStart: resource.connectStart,
    connectEnd: resource.connectEnd,
    requestStart: resource.requestStart,
    responseStart: resource.responseStart,
    responseEnd: resource.responseEnd,
    protocol: resource.nextHopProtocol || 'unknown',
  }));
  
  metricsStore.set('resource-timing', {
    resources: metrics,
    timestamp: Date.now(),
    category: METRIC_CATEGORIES.RESOURCE,
  });
  
  return metrics;
}

/**
 * Get resource timing summary by type
 * @returns {Object} Resource summary
 */
export function getResourceSummary() {
  const resources = getResourceTiming();
  
  const summary = {
    total: {
      count: resources.length,
      size: 0,
      duration: 0,
    },
    byType: {},
  };
  
  resources.forEach(resource => {
    summary.total.size += resource.size;
    summary.total.duration += resource.duration;
    
    if (!summary.byType[resource.type]) {
      summary.byType[resource.type] = {
        count: 0,
        size: 0,
        duration: 0,
      };
    }
    
    summary.byType[resource.type].count++;
    summary.byType[resource.type].size += resource.size;
    summary.byType[resource.type].duration += resource.duration;
  });
  
  return summary;
}

// ============================================
// Paint Timing
// ============================================

/**
 * Get paint timing metrics
 * @returns {Object|null} Paint timing data
 */
export function getPaintTiming() {
  const perf = getPerformanceAPI();
  
  if (!perf || !perf.getEntriesByType) {
    return null;
  }
  
  const paintEntries = perf.getEntriesByType('paint');
  
  const metrics = {
    firstPaint: null,
    firstContentfulPaint: null,
  };
  
  paintEntries.forEach(entry => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    } else if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });
  
  metricsStore.set('paint-timing', {
    ...metrics,
    timestamp: Date.now(),
    category: METRIC_CATEGORIES.PAINT,
  });
  
  return metrics;
}

// ============================================
// Performance Observers
// ============================================

/**
 * Initialize performance observer
 * @param {string} type - Observer type
 * @param {Function} callback - Callback function
 * @returns {PerformanceObserver|null} Observer instance
 */
function initializeObserver(type, callback) {
  if (!supportsPerformanceObserver()) {
    return null;
  }
  
  try {
    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: [type], buffered: true });
    
    observersCache.set(type, observer);
    
    console.log('[Performance] Observer initialized:', type);
    
    return observer;
  } catch (error) {
    console.error('[Performance] Failed to initialize observer:', { type, error });
    return null;
  }
}

/**
 * Observe Largest Contentful Paint
 * @param {Function} callback - Callback function
 * @returns {PerformanceObserver|null} Observer instance
 */
export function observeLCP(callback) {
  return initializeObserver('largest-contentful-paint', (list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry) {
      const metric = {
        value: lastEntry.renderTime || lastEntry.loadTime,
        element: lastEntry.element,
        url: lastEntry.url,
        timestamp: Date.now(),
      };
      
      metricsStore.set('lcp', metric);
      
      if (callback) {
        callback(metric);
      }
    }
  });
}

/**
 * Observe First Input Delay
 * @param {Function} callback - Callback function
 * @returns {PerformanceObserver|null} Observer instance
 */
export function observeFID(callback) {
  return initializeObserver('first-input', (list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      const metric = {
        value: entry.processingStart - entry.startTime,
        name: entry.name,
        timestamp: Date.now(),
      };
      
      metricsStore.set('fid', metric);
      
      if (callback) {
        callback(metric);
      }
    });
  });
}

/**
 * Observe Cumulative Layout Shift
 * @param {Function} callback - Callback function
 * @returns {PerformanceObserver|null} Observer instance
 */
export function observeCLS(callback) {
  let clsValue = 0;
  
  return initializeObserver('layout-shift', (list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    
    const metric = {
      value: clsValue,
      timestamp: Date.now(),
    };
    
    metricsStore.set('cls', metric);
    
    if (callback) {
      callback(metric);
    }
  });
}

// ============================================
// Performance Budget Validation
// ============================================

/**
 * Check if metric exceeds budget
 * @param {string} metricName - Metric name
 * @param {number} value - Metric value
 * @returns {boolean} True if budget exceeded
 */
function checkBudget(metricName, value) {
  const budget = PERFORMANCE_BUDGETS[metricName];
  
  if (budget === undefined) {
    return false;
  }
  
  const exceeded = value > budget;
  
  if (exceeded) {
    const violation = {
      metric: metricName,
      value,
      budget,
      excess: value - budget,
      timestamp: Date.now(),
    };
    
    budgetViolations.push(violation);
    
    console.warn('[Performance] Budget exceeded:', {
      metric: metricName,
      value: typeof value === 'number' && metricName.includes('Size') 
        ? formatBytes(value) 
        : formatTime(value),
      budget: typeof budget === 'number' && metricName.includes('Size')
        ? formatBytes(budget)
        : formatTime(budget),
    });
  }
  
  return exceeded;
}

/**
 * Validate all performance budgets
 * @returns {Object} Validation results
 */
export function validateBudgets() {
  const results = {
    passed: [],
    failed: [],
    timestamp: Date.now(),
  };
  
  // Check paint metrics
  const paintTiming = getPaintTiming();
  if (paintTiming) {
    if (paintTiming.firstContentfulPaint !== null) {
      const exceeded = checkBudget('firstContentfulPaint', paintTiming.firstContentfulPaint);
      (exceeded ? results.failed : results.passed).push({
        metric: 'firstContentfulPaint',
        value: paintTiming.firstContentfulPaint,
      });
    }
  }
  
  // Check LCP
  const lcp = metricsStore.get('lcp');
  if (lcp) {
    const exceeded = checkBudget('largestContentfulPaint', lcp.value);
    (exceeded ? results.failed : results.passed).push({
      metric: 'largestContentfulPaint',
      value: lcp.value,
    });
  }
  
  // Check FID
  const fid = metricsStore.get('fid');
  if (fid) {
    const exceeded = checkBudget('firstInputDelay', fid.value);
    (exceeded ? results.failed : results.passed).push({
      metric: 'firstInputDelay',
      value: fid.value,
    });
  }
  
  // Check CLS
  const cls = metricsStore.get('cls');
  if (cls) {
    const exceeded = checkBudget('cumulativeLayoutShift', cls.value);
    (exceeded ? results.failed : results.passed).push({
      metric: 'cumulativeLayoutShift',
      value: cls.value,
    });
  }
  
  // Check resource sizes
  const resourceSummary = getResourceSummary();
  
  if (resourceSummary.total.size > 0) {
    const exceeded = checkBudget('totalPageSize', resourceSummary.total.size);
    (exceeded ? results.failed : results.passed).push({
      metric: 'totalPageSize',
      value: resourceSummary.total.size,
    });
  }
  
  // Check resource counts
  if (resourceSummary.total.count > 0) {
    const exceeded = checkBudget('maxRequests', resourceSummary.total.count);
    (exceeded ? results.failed : results.passed).push({
      metric: 'maxRequests',
      value: resourceSummary.total.count,
    });
  }
  
  console.log('[Performance] Budget validation:', {
    passed: results.passed.length,
    failed: results.failed.length,
  });
  
  return results;
}

/**
 * Get budget violations
 * @returns {Array<Object>} Budget violations
 */
export function getBudgetViolations() {
  return deepClone(budgetViolations);
}

// ============================================
// Bundle Size Monitoring
// ============================================

/**
 * Estimate bundle size from resources
 * @returns {Object} Bundle size estimates
 */
export function estimateBundleSize() {
  const resources = getResourceTiming();
  
  const bundles = {
    scripts: { count: 0, size: 0, files: [] },
    styles: { count: 0, size: 0, files: [] },
    images: { count: 0, size: 0, files: [] },
    fonts: { count: 0, size: 0, files: [] },
    other: { count: 0, size: 0, files: [] },
  };
  
  resources.forEach(resource => {
    const category = resource.type === 'script' ? 'scripts'
      : resource.type === 'css' ? 'styles'
      : resource.type === 'img' ? 'images'
      : resource.type === 'font' ? 'fonts'
      : 'other';
    
    bundles[category].count++;
    bundles[category].size += resource.size;
    bundles[category].files.push({
      name: resource.name,
      size: resource.size,
    });
  });
  
  // Check budgets
  checkBudget('scriptSize', bundles.scripts.size);
  checkBudget('styleSize', bundles.styles.size);
  checkBudget('fontSize', bundles.fonts.size);
  
  return bundles;
}

// ============================================
// Load Time Tracking
// ============================================

/**
 * Track page load time
 * @returns {Object|null} Load time metrics
 */
export function trackLoadTime() {
  const navigationTiming = getNavigationTiming();
  const paintTiming = getPaintTiming();
  
  if (!navigationTiming) {
    return null;
  }
  
  const metrics = {
    domContentLoaded: navigationTiming.domContentLoaded,
    pageLoad: navigationTiming.pageLoad,
    firstPaint: paintTiming ? paintTiming.firstPaint : null,
    firstContentfulPaint: paintTiming ? paintTiming.firstContentfulPaint : null,
    timestamp: Date.now(),
  };
  
  // Check budget
  if (metrics.pageLoad) {
    checkBudget('timeToInteractive', metrics.pageLoad);
  }
  
  console.log('[Performance] Load time tracked:', {
    domContentLoaded: formatTime(metrics.domContentLoaded),
    pageLoad: formatTime(metrics.pageLoad),
    firstContentfulPaint: metrics.firstContentfulPaint 
      ? formatTime(metrics.firstContentfulPaint) 
      : 'N/A',
  });
  
  return metrics;
}

// ============================================
// Performance Report
// ============================================

/**
 * Generate comprehensive performance report
 * @returns {Object} Performance report
 */
export function generateReport() {
  const report = {
    timestamp: Date.now(),
    navigation: getNavigationTiming(),
    paint: getPaintTiming(),
    resources: getResourceSummary(),
    bundles: estimateBundleSize(),
    loadTime: trackLoadTime(),
    budgets: validateBudgets(),
    violations: getBudgetViolations(),
    metrics: Array.from(metricsStore.entries()).map(([key, value]) => ({
      key,
      ...value,
    })),
  };
  
  console.log('[Performance] Report generated:', {
    navigationMetrics: Object.keys(report.navigation || {}).length,
    resourceCount: report.resources.total.count,
    budgetsPassed: report.budgets.passed.length,
    budgetsFailed: report.budgets.failed.length,
  });
  
  return report;
}

/**
 * Log performance report to console
 */
export function logReport() {
  const report = generateReport();
  
  console.group('[Performance] Detailed Report');
  
  if (report.navigation) {
    console.group('Navigation Timing');
    console.table(report.navigation);
    console.groupEnd();
  }
  
  if (report.paint) {
    console.group('Paint Timing');
    console.table(report.paint);
    console.groupEnd();
  }
  
  if (report.resources) {
    console.group('Resource Summary');
    console.log('Total:', {
      count: report.resources.total.count,
      size: formatBytes(report.resources.total.size),
      duration: formatTime(report.resources.total.duration),
    });
    console.table(report.resources.byType);
    console.groupEnd();
  }
  
  if (report.bundles) {
    console.group('Bundle Sizes');
    Object.entries(report.bundles).forEach(([type, data]) => {
      console.log(`${type}:`, {
        count: data.count,
        size: formatBytes(data.size),
      });
    });
    console.groupEnd();
  }
  
  if (report.budgets) {
    console.group('Budget Validation');
    console.log('Passed:', report.budgets.passed.length);
    console.log('Failed:', report.budgets.failed.length);
    if (report.budgets.failed.length > 0) {
      console.table(report.budgets.failed);
    }
    console.groupEnd();
  }
  
  console.groupEnd();
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize performance monitoring
 * @param {Object} options - Configuration options
 * @returns {Object} Control interface
 */
export function initPerformanceMonitoring(options = {}) {
  const config = {
    observeLCP: true,
    observeFID: true,
    observeCLS: true,
    autoReport: false,
    reportInterval: 30000,
    ...options,
  };
  
  console.log('[Performance] Initializing monitoring:', config);
  
  const observers = [];
  
  // Initialize observers
  if (config.observeLCP) {
    const lcpObserver = observeLCP();
    if (lcpObserver) observers.push(lcpObserver);
  }
  
  if (config.observeFID) {
    const fidObserver = observeFID();
    if (fidObserver) observers.push(fidObserver);
  }
  
  if (config.observeCLS) {
    const clsObserver = observeCLS();
    if (clsObserver) observers.push(clsObserver);
  }
  
  // Auto reporting
  let reportTimer = null;
  
  if (config.autoReport) {
    reportTimer = setInterval(() => {
      logReport();
    }, config.reportInterval);
  }
  
  // Track load time on page load
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      trackLoadTime();
    } else {
      window.addEventListener('load', () => {
        trackLoadTime();
      });
    }
  }
  
  console.log('[Performance] Monitoring initialized successfully');
  
  return {
    disconnect: () => {
      observers.forEach(observer => observer.disconnect());
      if (reportTimer) clearInterval(reportTimer);
      console.log('[Performance] Monitoring disconnected');
    },
    getReport: generateReport,
    logReport,
    validateBudgets,
  };
}

// ============================================
// Module Exports
// ============================================

export default {
  initPerformanceMonitoring,
  startMeasure,
  endMeasure,
  measureFunction,
  getNavigationTiming,
  getResourceTiming,
  getResourceSummary,
  getPaintTiming,
  observeLCP,
  observeFID,
  observeCLS,
  validateBudgets,
  getBudgetViolations,
  estimateBundleSize,
  trackLoadTime,
  generateReport,
  logReport,
  PERFORMANCE_BUDGETS,
};