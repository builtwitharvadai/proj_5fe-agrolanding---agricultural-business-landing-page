/**
 * About Section Component Module
 * 
 * Handles dynamic content rendering for the company overview section,
 * including background information, statistics, certifications, and trust indicators.
 * Implements progressive enhancement with accessibility and performance optimization.
 * 
 * @module components/about
 * @generated-from: task-id:AGRO-006
 * @modifies: none
 * @dependencies: ["data/company"]
 */

import {
  getBackground,
  getYearsOfExperience,
  getMission,
  getValues,
  getCertifications,
  getTrustIndicators,
  getStatistics,
  getTestimonials,
  validateCompanyInfo,
} from '../data/company.js';

/**
 * Performance timing marks for observability
 */
const PERF_MARKS = Object.freeze({
  INIT_START: 'about-init-start',
  INIT_END: 'about-init-end',
  RENDER_START: 'about-render-start',
  RENDER_END: 'about-render-end',
  INTERACTIVE_START: 'about-interactive-start',
  INTERACTIVE_END: 'about-interactive-end',
});

/**
 * Feature flag for company overview section
 */
const FEATURE_FLAGS = Object.freeze({
  COMPANY_OVERVIEW: true,
  ANIMATED_STATS: true,
  TESTIMONIALS: false,
  CERTIFICATIONS_MODAL: false,
});

/**
 * Configuration constants
 */
const CONFIG = Object.freeze({
  ANIMATION_DURATION: 2000,
  INTERSECTION_THRESHOLD: 0.2,
  STAT_COUNT_DURATION: 1500,
  ERROR_RETRY_ATTEMPTS: 3,
  ERROR_RETRY_DELAY: 1000,
});

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} content - Raw content to sanitize
 * @returns {string} Sanitized content
 */
const sanitizeContent = (content) => {
  if (typeof content !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = content;
  return div.innerHTML;
};

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Node|Node[]} content - Element content
 * @returns {HTMLElement} Created element
 */
const createElement = (tag, attributes = {}, content = null) => {
  try {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('aria-') || key === 'role') {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });

    if (content !== null) {
      if (typeof content === 'string') {
        element.textContent = content;
      } else if (Array.isArray(content)) {
        content.forEach((child) => {
          if (child instanceof Node) {
            element.appendChild(child);
          }
        });
      } else if (content instanceof Node) {
        element.appendChild(content);
      }
    }

    return element;
  } catch (error) {
    console.error('[About] Error creating element:', {
      tag,
      attributes,
      error: error.message,
    });
    throw new Error(`Failed to create element: ${tag}`);
  }
};

/**
 * Render background section with company story
 * @param {HTMLElement} container - Container element
 * @returns {void}
 */
const renderBackground = (container) => {
  try {
    const background = getBackground();

    const textContainer = createElement('div', { className: 'about-text' });

    const title = createElement('h2', { id: 'about-title' }, background.title);
    textContainer.appendChild(title);

    const subtitle = createElement('h3', {}, background.subtitle);
    textContainer.appendChild(subtitle);

    const description = createElement('p', {}, background.description);
    textContainer.appendChild(description);

    if (background.extendedDescription) {
      const extendedDesc = createElement('p', {}, background.extendedDescription);
      textContainer.appendChild(extendedDesc);
    }

    const detailsList = createElement('ul', { role: 'list' });
    const details = [
      `Founded: ${background.foundedYear}`,
      `Location: ${background.location}`,
      `Team: ${background.teamSize}`,
    ];

    details.forEach((detail) => {
      const listItem = createElement('li', {}, detail);
      detailsList.appendChild(listItem);
    });

    textContainer.appendChild(detailsList);

    container.appendChild(textContainer);

    console.info('[About] Background section rendered successfully');
  } catch (error) {
    console.error('[About] Error rendering background:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Render mission and values section
 * @param {HTMLElement} container - Container element
 * @returns {void}
 */
const renderMissionAndValues = (container) => {
  try {
    const mission = getMission();
    const values = getValues();

    const missionSection = createElement('div', { className: 'mission-section' });

    const missionTitle = createElement('h3', {}, 'Our Mission');
    missionSection.appendChild(missionTitle);

    const missionStatement = createElement('p', {}, mission.statement);
    missionSection.appendChild(missionStatement);

    const commitmentPara = createElement('p', {}, mission.commitment);
    missionSection.appendChild(commitmentPara);

    container.appendChild(missionSection);

    const valuesSection = createElement('div', { className: 'values-section' });

    const valuesTitle = createElement('h3', {}, 'Our Values');
    valuesSection.appendChild(valuesTitle);

    const valuesList = createElement('ul', { role: 'list' });

    values.forEach((value) => {
      const listItem = createElement('li', {}, value);
      valuesList.appendChild(listItem);
    });

    valuesSection.appendChild(valuesList);
    container.appendChild(valuesSection);

    console.info('[About] Mission and values rendered successfully');
  } catch (error) {
    console.error('[About] Error rendering mission and values:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Animate number counting effect
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 * @returns {void}
 */
const animateNumber = (element, target, duration) => {
  const start = 0;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(start + (target - start) * easeOutQuad);

    element.textContent = current.toString();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = target.toString();
    }
  };

  requestAnimationFrame(animate);
};

/**
 * Render statistics grid with animated counters
 * @param {HTMLElement} container - Container element
 * @returns {void}
 */
const renderStatistics = (container) => {
  try {
    const statistics = getStatistics();

    const statsGrid = createElement('div', {
      className: 'stats-grid',
      role: 'region',
      'aria-label': 'Company statistics',
    });

    statistics.forEach((stat) => {
      const statItem = createElement('div', {
        className: 'stat-item',
        dataset: { statId: stat.id },
      });

      const numberMatch = stat.number.match(/\d+/);
      const numericValue = numberMatch ? parseInt(numberMatch[0], 10) : 0;
      const suffix = stat.number.replace(/\d+/, '');

      const statNumber = createElement('span', {
        className: 'stat-number',
        'aria-label': stat.description,
        dataset: { target: numericValue, suffix },
      }, '0' + suffix);

      const statLabel = createElement('span', {
        className: 'stat-label',
      }, stat.label);

      statItem.appendChild(statNumber);
      statItem.appendChild(statLabel);
      statsGrid.appendChild(statItem);
    });

    container.appendChild(statsGrid);

    if (FEATURE_FLAGS.ANIMATED_STATS && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const numbers = entry.target.querySelectorAll('.stat-number');
              numbers.forEach((numberEl) => {
                const target = parseInt(numberEl.dataset.target, 10);
                const suffix = numberEl.dataset.suffix || '';

                const tempSpan = createElement('span', {}, '0');
                numberEl.textContent = '';
                numberEl.appendChild(tempSpan);

                animateNumber(tempSpan, target, CONFIG.STAT_COUNT_DURATION);

                setTimeout(() => {
                  numberEl.textContent = target + suffix;
                }, CONFIG.STAT_COUNT_DURATION);
              });

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: CONFIG.INTERSECTION_THRESHOLD }
      );

      observer.observe(statsGrid);
    }

    console.info('[About] Statistics rendered successfully', {
      count: statistics.length,
      animated: FEATURE_FLAGS.ANIMATED_STATS,
    });
  } catch (error) {
    console.error('[About] Error rendering statistics:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Render trust indicators section
 * @param {HTMLElement} container - Container element
 * @returns {void}
 */
const renderTrustIndicators = (container) => {
  try {
    const trustIndicators = getTrustIndicators();

    const trustSection = createElement('div', {
      className: 'trust-indicators',
      role: 'region',
      'aria-label': 'Trust indicators',
    });

    const trustTitle = createElement('h3', {}, 'Why Trust Us');
    trustSection.appendChild(trustTitle);

    const trustGrid = createElement('div', { className: 'trust-grid' });

    trustIndicators.forEach((indicator) => {
      const indicatorCard = createElement('div', {
        className: 'trust-card',
        dataset: { trustId: indicator.id },
      });

      const icon = createElement('span', {
        className: 'trust-icon',
        'aria-hidden': 'true',
      }, indicator.icon);

      const metric = createElement('strong', {
        className: 'trust-metric',
      }, indicator.value);

      const label = createElement('span', {
        className: 'trust-label',
      }, indicator.metric);

      const description = createElement('p', {
        className: 'trust-description',
      }, indicator.description);

      indicatorCard.appendChild(icon);
      indicatorCard.appendChild(metric);
      indicatorCard.appendChild(label);
      indicatorCard.appendChild(description);

      trustGrid.appendChild(indicatorCard);
    });

    trustSection.appendChild(trustGrid);
    container.appendChild(trustSection);

    console.info('[About] Trust indicators rendered successfully', {
      count: trustIndicators.length,
    });
  } catch (error) {
    console.error('[About] Error rendering trust indicators:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Render certifications section
 * @param {HTMLElement} container - Container element
 * @returns {void}
 */
const renderCertifications = (container) => {
  try {
    const certifications = getCertifications();

    const certSection = createElement('div', {
      className: 'certifications-section',
      role: 'region',
      'aria-label': 'Certifications and awards',
    });

    const certTitle = createElement('h3', {}, 'Certifications & Awards');
    certSection.appendChild(certTitle);

    const certGrid = createElement('div', { className: 'cert-grid' });

    certifications.forEach((cert) => {
      const certCard = createElement('div', {
        className: 'cert-card',
        dataset: { certId: cert.id },
      });

      const certIcon = createElement('span', {
        className: 'cert-icon',
        'aria-hidden': 'true',
      }, cert.icon);

      const certName = createElement('h4', {
        className: 'cert-name',
      }, cert.name);

      const certIssuer = createElement('p', {
        className: 'cert-issuer',
      }, cert.issuer);

      const certYear = createElement('span', {
        className: 'cert-year',
      }, cert.year.toString());

      const certDesc = createElement('p', {
        className: 'cert-description',
      }, cert.description);

      certCard.appendChild(certIcon);
      certCard.appendChild(certName);
      certCard.appendChild(certIssuer);
      certCard.appendChild(certYear);
      certCard.appendChild(certDesc);

      certGrid.appendChild(certCard);
    });

    certSection.appendChild(certGrid);
    container.appendChild(certSection);

    console.info('[About] Certifications rendered successfully', {
      count: certifications.length,
    });
  } catch (error) {
    console.error('[About] Error rendering certifications:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Initialize about section with error handling and retry logic
 * @param {number} attempt - Current attempt number
 * @returns {Promise<void>}
 */
const initializeAboutSection = async (attempt = 1) => {
  try {
    performance.mark(PERF_MARKS.INIT_START);

    if (!FEATURE_FLAGS.COMPANY_OVERVIEW) {
      console.info('[About] Company overview feature is disabled');
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.style.display = 'none';
      }
      return;
    }

    if (!validateCompanyInfo()) {
      throw new Error('Company information validation failed');
    }

    const aboutSection = document.getElementById('about');
    if (!aboutSection) {
      throw new Error('About section element not found');
    }

    const container = aboutSection.querySelector('.container');
    if (!container) {
      throw new Error('About section container not found');
    }

    performance.mark(PERF_MARKS.RENDER_START);

    const aboutContent = createElement('div', { className: 'about-content' });

    renderBackground(aboutContent);
    renderMissionAndValues(aboutContent);

    container.appendChild(aboutContent);

    renderStatistics(container);
    renderTrustIndicators(container);
    renderCertifications(container);

    performance.mark(PERF_MARKS.RENDER_END);
    performance.measure(
      'about-render-duration',
      PERF_MARKS.RENDER_START,
      PERF_MARKS.RENDER_END
    );

    performance.mark(PERF_MARKS.INIT_END);
    performance.measure(
      'about-init-duration',
      PERF_MARKS.INIT_START,
      PERF_MARKS.INIT_END
    );

    const renderMeasure = performance.getEntriesByName('about-render-duration')[0];
    console.info('[About] Section initialized successfully', {
      renderTime: `${renderMeasure.duration.toFixed(2)}ms`,
      attempt,
    });
  } catch (error) {
    console.error('[About] Initialization error:', {
      attempt,
      error: error.message,
      stack: error.stack,
    });

    if (attempt < CONFIG.ERROR_RETRY_ATTEMPTS) {
      console.warn(`[About] Retrying initialization (attempt ${attempt + 1}/${CONFIG.ERROR_RETRY_ATTEMPTS})`);
      await new Promise((resolve) => setTimeout(resolve, CONFIG.ERROR_RETRY_DELAY * attempt));
      return initializeAboutSection(attempt + 1);
    }

    throw new Error(`About section initialization failed after ${CONFIG.ERROR_RETRY_ATTEMPTS} attempts: ${error.message}`);
  }
};

/**
 * Initialize about section when DOM is ready
 */
const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAboutSection().catch((error) => {
        console.error('[About] Fatal initialization error:', error);
      });
    });
  } else {
    initializeAboutSection().catch((error) => {
      console.error('[About] Fatal initialization error:', error);
    });
  }
};

init();

export { initializeAboutSection, renderStatistics, renderTrustIndicators };