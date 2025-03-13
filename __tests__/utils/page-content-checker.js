/**
 * Utility functions for checking page content
 */

/**
 * Check if a page has the required basic elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkBasicPageElements(document) {
  const mainElement = document.querySelector('main');
  const headings = document.querySelectorAll('h1, h2');
  const contentLength = mainElement ? mainElement.textContent.length : 0;
  
  return {
    hasMain: !!mainElement,
    hasHeading: headings.length > 0,
    hasSufficientContent: contentLength > 100,
    contentLength,
  };
}

/**
 * Check if a form page has the required form elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkFormPageElements(document) {
  const formElement = document.querySelector('form');
  const inputElements = document.querySelectorAll('input, textarea, select');
  const buttonElements = document.querySelectorAll('button[type="submit"], input[type="submit"]');
  
  return {
    hasForm: !!formElement,
    hasInputs: inputElements.length > 0,
    hasSubmitButton: buttonElements.length > 0,
    inputCount: inputElements.length,
  };
}

/**
 * Check if a dashboard page has the required dashboard elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkDashboardPageElements(document) {
  const cardElements = document.querySelectorAll('.card, [class*="card"], [class*="Card"]');
  const chartElements = document.querySelectorAll('[class*="chart"], [class*="Chart"], canvas');
  const tableElements = document.querySelectorAll('table, [role="table"]');
  
  return {
    hasCards: cardElements.length > 0,
    hasCharts: chartElements.length > 0,
    hasTables: tableElements.length > 0,
    cardCount: cardElements.length,
  };
}

/**
 * Check if a list page has the required list elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkListPageElements(document) {
  const listElements = document.querySelectorAll('ul, ol, [role="list"]');
  const listItemElements = document.querySelectorAll('li, [role="listitem"]');
  
  return {
    hasLists: listElements.length > 0,
    hasListItems: listItemElements.length > 0,
    listItemCount: listItemElements.length,
  };
}

/**
 * Check if a detail page has the required detail elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkDetailPageElements(document) {
  const titleElement = document.querySelector('h1');
  const descriptionElements = document.querySelectorAll('p');
  const imageElements = document.querySelectorAll('img');
  const actionElements = document.querySelectorAll('button, a.btn, [role="button"]');
  
  return {
    hasTitle: !!titleElement,
    hasDescriptions: descriptionElements.length > 0,
    hasImages: imageElements.length > 0,
    hasActions: actionElements.length > 0,
  };
}

/**
 * Check if a page has the required SEO elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkSEOElements(document) {
  const titleElement = document.querySelector('title');
  const metaDescriptionElement = document.querySelector('meta[name="description"]');
  const canonicalElement = document.querySelector('link[rel="canonical"]');
  const schemaOrgElements = document.querySelectorAll('script[type="application/ld+json"]');
  
  return {
    hasTitle: !!titleElement,
    hasMetaDescription: !!metaDescriptionElement,
    hasCanonical: !!canonicalElement,
    hasSchemaOrg: schemaOrgElements.length > 0,
  };
}

/**
 * Check if a page has the required accessibility elements
 * @param {HTMLElement} document - The document object
 * @returns {Object} - Result of the check
 */
export function checkAccessibilityElements(document) {
  const imgWithAlt = document.querySelectorAll('img[alt]');
  const imgWithoutAlt = document.querySelectorAll('img:not([alt])');
  const ariaLabeledElements = document.querySelectorAll('[aria-label]');
  const skipLinkElement = document.querySelector('a[href="#main"], a[href="#content"]');
  
  return {
    imagesHaveAlt: imgWithoutAlt.length === 0,
    hasAriaLabels: ariaLabeledElements.length > 0,
    hasSkipLink: !!skipLinkElement,
    imgWithAltCount: imgWithAlt.length,
    imgWithoutAltCount: imgWithoutAlt.length,
  };
}

/**
 * Checks if a page has the minimum required content
 * @param {Object} page - Playwright page object
 * @param {string} url - URL to navigate to
 * @param {Object} options - Options for checking content
 * @param {string} options.title - Expected title or part of title
 * @param {string} options.heading - Expected heading text (optional)
 * @param {number} options.minContentLength - Minimum content length (default: 100)
 * @param {boolean} options.checkNavigation - Whether to check for navigation elements (default: true)
 * @param {boolean} options.checkFooter - Whether to check for footer (default: true)
 * @param {boolean} options.takeScreenshot - Whether to take a screenshot (default: true)
 * @param {string} options.screenshotPath - Path to save screenshot (default: based on URL)
 * @returns {Promise<boolean>} - Whether the page has the minimum required content
 */
async function checkPageContent(page, url, options = {}) {
  const {
    title,
    heading,
    minContentLength = 100,
    checkNavigation = true,
    checkFooter = true,
    takeScreenshot = true,
    screenshotPath
  } = options;

  // Navigate to the page
  await page.goto(url);

  // Check title if provided
  if (title) {
    const pageTitle = await page.title();
    if (!pageTitle.includes(title)) {
      console.error(`Title check failed for ${url}. Expected: ${title}, Got: ${pageTitle}`);
      return false;
    }
  }

  // Check heading if provided
  if (heading) {
    const headingElement = await page.locator('h1, h2').first();
    const headingText = await headingElement.textContent();
    if (!headingText.includes(heading)) {
      console.error(`Heading check failed for ${url}. Expected: ${heading}, Got: ${headingText}`);
      return false;
    }
  }

  // Check for main content
  const mainContent = await page.locator('main').first();
  if (!mainContent) {
    console.error(`Main content check failed for ${url}. No <main> element found.`);
    return false;
  }

  // Check content length
  const bodyContent = await page.locator('body').textContent();
  if (bodyContent.length < minContentLength) {
    console.error(`Content length check failed for ${url}. Expected at least ${minContentLength} characters, got ${bodyContent.length}`);
    return false;
  }

  // Check for navigation elements
  if (checkNavigation) {
    const navElements = await page.locator('nav').first();
    if (!navElements) {
      console.error(`Navigation check failed for ${url}. No <nav> element found.`);
      return false;
    }
  }

  // Check for footer
  if (checkFooter) {
    const footer = await page.locator('footer').first();
    if (!footer) {
      console.error(`Footer check failed for ${url}. No <footer> element found.`);
      return false;
    }
  }

  // Take a screenshot if enabled
  if (takeScreenshot) {
    const path = screenshotPath || `./test-results/screenshots/${url.replace(/\//g, '-').replace(/^-/, '') || 'home'}.png`;
    await page.screenshot({ path });
  }

  return true;
}

/**
 * Checks if a page has the minimum required content for authenticated pages
 * @param {Object} page - Playwright page object
 * @param {string} url - URL to navigate to
 * @param {Object} options - Options for checking content (see checkPageContent)
 * @param {boolean} options.checkUserElements - Whether to check for user elements (default: true)
 * @returns {Promise<boolean>} - Whether the page has the minimum required content
 */
async function checkAuthenticatedPageContent(page, url, options = {}) {
  const { checkUserElements = true, ...restOptions } = options;

  // Check basic content first
  const hasBasicContent = await checkPageContent(page, url, {
    ...restOptions,
    screenshotPath: restOptions.screenshotPath || `./test-results/screenshots/auth-${url.replace(/\//g, '-').replace(/^-/, '')}.png`
  });

  if (!hasBasicContent) {
    return false;
  }

  // Check for authenticated user elements
  if (checkUserElements) {
    const userElements = await page.locator('[data-testid="user-menu"], .user-profile, .avatar').first();
    if (!userElements) {
      console.error(`User elements check failed for ${url}. No user menu or profile elements found.`);
      return false;
    }
  }

  return true;
}

// Helper functions for checking page content in tests
export function checkPageContent(container) {
  const issues = [];

  // Check for main content area
  const mainContent = container.querySelector('main');
  if (!mainContent) {
    issues.push('Page is missing a main content area');
  }

  // Check for headings
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('Page has no headings');
  }

  // Check heading hierarchy
  let previousLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (previousLevel === 0) {
      if (level !== 1) {
        issues.push('First heading is not h1');
      }
    } else if (level > previousLevel + 1) {
      issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  });

  // Check for empty content
  if (container.textContent.trim().length < 10) {
    issues.push('Page has very little or no content');
  }

  // Check images for alt text
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      issues.push('Image is missing alt text');
    }
  });

  // Check links for accessibility
  const links = container.querySelectorAll('a');
  links.forEach((link) => {
    if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
      issues.push('Link has no accessible text');
    }
  });

  return issues;
}

// Helper function to check for required metadata
export function checkMetadata(metadata) {
  const issues = [];
  const requiredFields = ['title', 'description'];

  requiredFields.forEach((field) => {
    if (!metadata[field]) {
      issues.push(`Missing required metadata: ${field}`);
    }
  });

  return issues;
}

// Helper function to check for semantic HTML structure
export function checkSemanticStructure(container) {
  const issues = [];
  const requiredElements = ['header', 'main', 'footer'];

  requiredElements.forEach((element) => {
    if (!container.querySelector(element)) {
      issues.push(`Missing semantic element: <${element}>`);
    }
  });

  return issues;
}

// Helper function to check for responsive design elements
export function checkResponsiveDesign(container) {
  const issues = [];
  
  // Check for viewport meta tag
  const hasViewportMeta = document.querySelector('meta[name="viewport"]');
  if (!hasViewportMeta) {
    issues.push('Missing viewport meta tag');
  }

  // Check for responsive images
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('srcset') && !img.hasAttribute('sizes')) {
      issues.push('Image is not using responsive attributes (srcset/sizes)');
    }
  });

  return issues;
}

// Helper function to check for performance optimizations
export function checkPerformanceOptimizations(container) {
  const issues = [];

  // Check for lazy loading on images
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('loading')) {
      issues.push('Image is not using lazy loading');
    }
  });

  // Check for proper heading structure
  const headings = container.querySelectorAll('h1');
  if (headings.length > 1) {
    issues.push('Multiple h1 elements found on page');
  }

  return issues;
}

module.exports = {
  checkPageContent,
  checkAuthenticatedPageContent
}; 