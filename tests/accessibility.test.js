/**
 * Accessibility Utilities Test Suite
 * Comprehensive testing for WCAG AA compliance, keyboard navigation,
 * focus management, ARIA attributes, and screen reader announcements
 * 
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  // Focus Management
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  setFocus,
  restoreFocus,
  
  // Focus Trap
  createFocusTrap,
  
  // Keyboard Navigation
  createRovingTabindex,
  
  // ARIA Helpers
  setAriaAttributes,
  toggleAriaExpanded,
  toggleAriaHidden,
  setAriaLive,
  
  // Screen Reader
  announce,
  
  // Skip Links
  initializeSkipLinks,
  
  // Color Contrast
  getContrastRatio,
  meetsWCAGAA,
  
  // Constants
  KEYS,
  ARIA_LIVE,
  FOCUSABLE_ELEMENTS,
} from '../src/utils/accessibility.js';

// ============================================
// Test Utilities and Helpers
// ============================================

/**
 * Create a mock focusable element
 */
function createFocusableElement(tag = 'button', attributes = {}) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  document.body.appendChild(element);
  return element;
}

/**
 * Create multiple focusable elements
 */
function createFocusableElements(count, tag = 'button') {
  return Array.from({ length: count }, (_, i) => 
    createFocusableElement(tag, { id: `element-${i}` })
  );
}

/**
 * Clean up DOM elements
 */
function cleanupDOM() {
  document.body.innerHTML = '';
}

/**
 * Wait for async operations
 */
function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate keyboard event
 */
function simulateKeydown(element, key, options = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
}

/**
 * Simulate mouse event
 */
function simulateMouseEvent(element, type, options = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
  return event;
}

// ============================================
// Test Suite Setup
// ============================================

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    cleanupDOM();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupDOM();
  });

  // ============================================
  // Constants Tests
  // ============================================

  describe('Constants', () => {
    it('should export KEYS constant with all keyboard keys', () => {
      expect(KEYS).toBeDefined();
      expect(KEYS.TAB).toBe('Tab');
      expect(KEYS.ENTER).toBe('Enter');
      expect(KEYS.SPACE).toBe(' ');
      expect(KEYS.ESCAPE).toBe('Escape');
      expect(KEYS.ARROW_UP).toBe('ArrowUp');
      expect(KEYS.ARROW_DOWN).toBe('ArrowDown');
      expect(KEYS.ARROW_LEFT).toBe('ArrowLeft');
      expect(KEYS.ARROW_RIGHT).toBe('ArrowRight');
      expect(KEYS.HOME).toBe('Home');
      expect(KEYS.END).toBe('End');
    });

    it('should export ARIA_LIVE constant with politeness levels', () => {
      expect(ARIA_LIVE).toBeDefined();
      expect(ARIA_LIVE.OFF).toBe('off');
      expect(ARIA_LIVE.POLITE).toBe('polite');
      expect(ARIA_LIVE.ASSERTIVE).toBe('assertive');
    });

    it('should export FOCUSABLE_ELEMENTS selector string', () => {
      expect(FOCUSABLE_ELEMENTS).toBeDefined();
      expect(typeof FOCUSABLE_ELEMENTS).toBe('string');
      expect(FOCUSABLE_ELEMENTS).toContain('a[href]');
      expect(FOCUSABLE_ELEMENTS).toContain('button:not([disabled])');
      expect(FOCUSABLE_ELEMENTS).toContain('input:not([disabled])');
    });

    it('should freeze KEYS constant to prevent modifications', () => {
      expect(Object.isFrozen(KEYS)).toBe(true);
      expect(() => { KEYS.NEW_KEY = 'test'; }).toThrow();
    });

    it('should freeze ARIA_LIVE constant to prevent modifications', () => {
      expect(Object.isFrozen(ARIA_LIVE)).toBe(true);
      expect(() => { ARIA_LIVE.NEW_LEVEL = 'test'; }).toThrow();
    });
  });

  // ============================================
  // Focus Management Tests
  // ============================================

  describe('getFocusableElements', () => {
    it('should return all focusable elements in container', () => {
      const button1 = createFocusableElement('button');
      const button2 = createFocusableElement('button');
      const link = createFocusableElement('a', { href: '#' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(3);
      expect(focusable).toContain(button1);
      expect(focusable).toContain(button2);
      expect(focusable).toContain(link);
    });

    it('should filter out disabled elements', () => {
      createFocusableElement('button');
      createFocusableElement('button', { disabled: 'true' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(1);
    });

    it('should filter out hidden elements', () => {
      const visible = createFocusableElement('button');
      const hidden = createFocusableElement('button');
      hidden.style.display = 'none';

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toBe(visible);
    });

    it('should filter out aria-hidden elements', () => {
      createFocusableElement('button');
      createFocusableElement('button', { 'aria-hidden': 'true' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(1);
    });

    it('should filter out elements with visibility hidden', () => {
      const visible = createFocusableElement('button');
      const hidden = createFocusableElement('button');
      hidden.style.visibility = 'hidden';

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toBe(visible);
    });

    it('should return empty array for invalid container', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = getFocusableElements(null);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const invalidContainer = { querySelectorAll: () => { throw new Error('Test error'); } };

      const result = getFocusableElements(invalidContainer);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should work with custom container', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const button = createFocusableElement('button');
      container.appendChild(button);
      createFocusableElement('button'); // Outside container

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toBe(button);
    });

    it('should include all standard focusable element types', () => {
      createFocusableElement('a', { href: '#' });
      createFocusableElement('button');
      createFocusableElement('input', { type: 'text' });
      createFocusableElement('select');
      createFocusableElement('textarea');

      const focusable = getFocusableElements(document.body);

      expect(focusable.length).toBeGreaterThanOrEqual(5);
    });

    it('should include elements with tabindex', () => {
      createFocusableElement('div', { tabindex: '0' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(1);
    });

    it('should exclude elements with tabindex -1', () => {
      createFocusableElement('div', { tabindex: '-1' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toHaveLength(0);
    });
  });

  describe('getFirstFocusableElement', () => {
    it('should return first focusable element', () => {
      const first = createFocusableElement('button', { id: 'first' });
      createFocusableElement('button', { id: 'second' });

      const result = getFirstFocusableElement(document.body);

      expect(result).toBe(first);
    });

    it('should return null when no focusable elements exist', () => {
      const result = getFirstFocusableElement(document.body);

      expect(result).toBeNull();
    });

    it('should work with custom container', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      const button = createFocusableElement('button');
      container.appendChild(button);

      const result = getFirstFocusableElement(container);

      expect(result).toBe(button);
    });
  });

  describe('getLastFocusableElement', () => {
    it('should return last focusable element', () => {
      createFocusableElement('button', { id: 'first' });
      const last = createFocusableElement('button', { id: 'last' });

      const result = getLastFocusableElement(document.body);

      expect(result).toBe(last);
    });

    it('should return null when no focusable elements exist', () => {
      const result = getLastFocusableElement(document.body);

      expect(result).toBeNull();
    });

    it('should work with single element', () => {
      const button = createFocusableElement('button');

      const result = getLastFocusableElement(document.body);

      expect(result).toBe(button);
    });
  });

  describe('setFocus', () => {
    it('should set focus to element', () => {
      const button = createFocusableElement('button');

      const result = setFocus(button);

      expect(result).toBe(true);
      expect(document.activeElement).toBe(button);
    });

    it('should return false for invalid element', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = setFocus(null);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should set tabindex when setTabIndex option is true', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      setFocus(div, { setTabIndex: true });

      expect(div.getAttribute('tabindex')).toBe('-1');
    });

    it('should not set tabindex when element already has it', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      document.body.appendChild(div);

      setFocus(div, { setTabIndex: true });

      expect(div.getAttribute('tabindex')).toBe('0');
    });

    it('should support preventScroll option', () => {
      const button = createFocusableElement('button');
      const focusSpy = jest.spyOn(button, 'focus');

      setFocus(button, { preventScroll: true });

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

      focusSpy.mockRestore();
    });

    it('should handle focus errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const element = createFocusableElement('button');
      jest.spyOn(element, 'focus').mockImplementation(() => {
        throw new Error('Focus error');
      });

      const result = setFocus(element);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('restoreFocus', () => {
    it('should restore focus to element', () => {
      const button = createFocusableElement('button');

      const result = restoreFocus(button);

      expect(result).toBe(true);
      expect(document.activeElement).toBe(button);
    });

    it('should return false for invalid element', () => {
      const result = restoreFocus(null);

      expect(result).toBe(false);
    });

    it('should work with previously focused element', () => {
      const button1 = createFocusableElement('button');
      const button2 = createFocusableElement('button');

      button1.focus();
      button2.focus();
      restoreFocus(button1);

      expect(document.activeElement).toBe(button1);
    });
  });

  // ============================================
  // Focus Trap Tests
  // ============================================

  describe('createFocusTrap', () => {
    it('should create focus trap controller', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const trap = createFocusTrap(container);

      expect(trap).toBeDefined();
      expect(trap.activate).toBeInstanceOf(Function);
      expect(trap.release).toBeInstanceOf(Function);
      expect(trap.isActive).toBeInstanceOf(Function);
    });

    it('should return null for invalid container', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const trap = createFocusTrap(null);

      expect(trap).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should activate focus trap', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button = createFocusableElement('button');
      container.appendChild(button);

      const trap = createFocusTrap(container);
      trap.activate();

      expect(trap.isActive()).toBe(true);
      expect(document.activeElement).toBe(button);
    });

    it('should focus initial element when provided', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button1 = createFocusableElement('button');
      const button2 = createFocusableElement('button');
      container.appendChild(button1);
      container.appendChild(button2);

      const trap = createFocusTrap(container, { initialFocus: button2 });
      trap.activate();

      expect(document.activeElement).toBe(button2);
    });

    it('should trap tab navigation within container', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const buttons = createFocusableElements(3);
      buttons.forEach(btn => container.appendChild(btn));

      const trap = createFocusTrap(container);
      trap.activate();

      buttons[2].focus();
      simulateKeydown(buttons[2], KEYS.TAB);

      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should trap shift+tab navigation within container', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const buttons = createFocusableElements(3);
      buttons.forEach(btn => container.appendChild(btn));

      const trap = createFocusTrap(container);
      trap.activate();

      buttons[0].focus();
      simulateKeydown(buttons[0], KEYS.TAB, { shiftKey: true });

      expect(document.activeElement).toBe(buttons[2]);
    });

    it('should release focus trap on escape key', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button = createFocusableElement('button');
      container.appendChild(button);

      const trap = createFocusTrap(container);
      trap.activate();

      simulateKeydown(document, KEYS.ESCAPE);

      expect(trap.isActive()).toBe(false);
    });

    it('should restore focus on release', () => {
      const outsideButton = createFocusableElement('button');
      outsideButton.focus();

      const container = document.createElement('div');
      document.body.appendChild(container);
      const insideButton = createFocusableElement('button');
      container.appendChild(insideButton);

      const trap = createFocusTrap(container);
      trap.activate();
      trap.release();

      expect(document.activeElement).toBe(outsideButton);
    });

    it('should prevent outside clicks when allowOutsideClick is false', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const insideButton = createFocusableElement('button');
      container.appendChild(insideButton);
      const outsideButton = createFocusableElement('button');

      const trap = createFocusTrap(container, { allowOutsideClick: false });
      trap.activate();

      const event = simulateMouseEvent(outsideButton, 'mousedown');

      expect(event.defaultPrevented).toBe(true);
    });

    it('should allow outside clicks when allowOutsideClick is true', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const insideButton = createFocusableElement('button');
      container.appendChild(insideButton);
      const outsideButton = createFocusableElement('button');

      const trap = createFocusTrap(container, { allowOutsideClick: true });
      trap.activate();

      const event = simulateMouseEvent(outsideButton, 'mousedown');

      expect(event.defaultPrevented).toBe(false);
    });

    it('should handle empty container gracefully', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const trap = createFocusTrap(container);
      trap.activate();

      simulateKeydown(document, KEYS.TAB);

      expect(trap.isActive()).toBe(true);
    });

    it('should not activate if already active', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button = createFocusableElement('button');
      container.appendChild(button);

      const trap = createFocusTrap(container);
      trap.activate();
      const firstActive = document.activeElement;
      trap.activate();

      expect(document.activeElement).toBe(firstActive);
    });

    it('should not release if not active', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const trap = createFocusTrap(container);
      trap.release();

      expect(trap.isActive()).toBe(false);
    });
  });

  // ============================================
  // Roving Tabindex Tests
  // ============================================

  describe('createRovingTabindex', () => {
    it('should create roving tabindex controller', () => {
      const elements = createFocusableElements(3);

      const controller = createRovingTabindex(elements);

      expect(controller).toBeDefined();
      expect(controller.moveTo).toBeInstanceOf(Function);
      expect(controller.getCurrentIndex).toBeInstanceOf(Function);
      expect(controller.destroy).toBeInstanceOf(Function);
    });

    it('should return null for invalid elements', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const controller = createRovingTabindex([]);

      expect(controller).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should set initial tabindex correctly', () => {
      const elements = createFocusableElements(3);

      createRovingTabindex(elements);

      expect(elements[0].getAttribute('tabindex')).toBe('0');
      expect(elements[1].getAttribute('tabindex')).toBe('-1');
      expect(elements[2].getAttribute('tabindex')).toBe('-1');
    });

    it('should navigate right with arrow key in horizontal mode', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements, { orientation: 'horizontal' });

      elements[0].focus();
      simulateKeydown(elements[0], KEYS.ARROW_RIGHT);

      expect(document.activeElement).toBe(elements[1]);
      expect(controller.getCurrentIndex()).toBe(1);
    });

    it('should navigate left with arrow key in horizontal mode', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements, { orientation: 'horizontal' });

      elements[1].focus();
      simulateKeydown(elements[1], KEYS.ARROW_LEFT);

      expect(document.activeElement).toBe(elements[0]);
      expect(controller.getCurrentIndex()).toBe(0);
    });

    it('should navigate down with arrow key in vertical mode', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements, { orientation: 'vertical' });

      elements[0].focus();
      simulateKeydown(elements[0], KEYS.ARROW_DOWN);

      expect(document.activeElement).toBe(elements[1]);
      expect(controller.getCurrentIndex()).toBe(1);
    });

    it('should navigate up with arrow key in vertical mode', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements, { orientation: 'vertical' });

      elements[1].focus();
      simulateKeydown(elements[1], KEYS.ARROW_UP);

      expect(document.activeElement).toBe(elements[0]);
      expect(controller.getCurrentIndex()).toBe(0);
    });

    it('should wrap navigation when wrap is true', () => {
      const elements = createFocusableElements(3);
      createRovingTabindex(elements, { orientation: 'horizontal', wrap: true });

      elements[2].focus();
      simulateKeydown(elements[2], KEYS.ARROW_RIGHT);

      expect(document.activeElement).toBe(elements[0]);
    });

    it('should not wrap navigation when wrap is false', () => {
      const elements = createFocusableElements(3);
      createRovingTabindex(elements, { orientation: 'horizontal', wrap: false });

      elements[2].focus();
      const initialActive = document.activeElement;
      simulateKeydown(elements[2], KEYS.ARROW_RIGHT);

      expect(document.activeElement).toBe(initialActive);
    });

    it('should navigate to first element with Home key', () => {
      const elements = createFocusableElements(3);
      createRovingTabindex(elements);

      elements[2].focus();
      simulateKeydown(elements[2], KEYS.HOME);

      expect(document.activeElement).toBe(elements[0]);
    });

    it('should navigate to last element with End key', () => {
      const elements = createFocusableElements(3);
      createRovingTabindex(elements);

      elements[0].focus();
      simulateKeydown(elements[0], KEYS.END);

      expect(document.activeElement).toBe(elements[2]);
    });

    it('should update current index on focus', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements);

      elements[2].focus();

      expect(controller.getCurrentIndex()).toBe(2);
    });

    it('should move to specific index programmatically', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements);

      controller.moveTo(2);

      expect(document.activeElement).toBe(elements[2]);
      expect(controller.getCurrentIndex()).toBe(2);
    });

    it('should prevent default on handled keys', () => {
      const elements = createFocusableElements(3);
      createRovingTabindex(elements, { orientation: 'horizontal' });

      elements[0].focus();
      const event = simulateKeydown(elements[0], KEYS.ARROW_RIGHT);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should destroy controller and remove listeners', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements);

      controller.destroy();

      elements[0].focus();
      const event = simulateKeydown(elements[0], KEYS.ARROW_RIGHT);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  // ============================================
  // ARIA Attribute Tests
  // ============================================

  describe('setAriaAttributes', () => {
    it('should set ARIA attributes on element', () => {
      const element = createFocusableElement('button');

      setAriaAttributes(element, {
        label: 'Test Button',
        expanded: 'false',
        controls: 'menu',
      });

      expect(element.getAttribute('aria-label')).toBe('Test Button');
      expect(element.getAttribute('aria-expanded')).toBe('false');
      expect(element.getAttribute('aria-controls')).toBe('menu');
    });

    it('should handle aria- prefix in attribute names', () => {
      const element = createFocusableElement('button');

      setAriaAttributes(element, {
        'aria-label': 'Test',
        label: 'Test2',
      });

      expect(element.getAttribute('aria-label')).toBe('Test2');
    });

    it('should remove attributes when value is null', () => {
      const element = createFocusableElement('button');
      element.setAttribute('aria-label', 'Test');

      setAriaAttributes(element, { label: null });

      expect(element.hasAttribute('aria-label')).toBe(false);
    });

    it('should remove attributes when value is undefined', () => {
      const element = createFocusableElement('button');
      element.setAttribute('aria-label', 'Test');

      setAriaAttributes(element, { label: undefined });

      expect(element.hasAttribute('aria-label')).toBe(false);
    });

    it('should handle invalid element gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      setAriaAttributes(null, { label: 'Test' });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle invalid attributes gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const element = createFocusableElement('button');

      setAriaAttributes(element, null);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle errors during attribute setting', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const element = createFocusableElement('button');
      jest.spyOn(element, 'setAttribute').mockImplementation(() => {
        throw new Error('Test error');
      });

      setAriaAttributes(element, { label: 'Test' });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should convert non-string values to strings', () => {
      const element = createFocusableElement('button');

      setAriaAttributes(element, {
        level: 2,
        expanded: true,
      });

      expect(element.getAttribute('aria-level')).toBe('2');
      expect(element.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('toggleAriaExpanded', () => {
    it('should set aria-expanded to true', () => {
      const element = createFocusableElement('button');

      toggleAriaExpanded(element, true);

      expect(element.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded to false', () => {
      const element = createFocusableElement('button');

      toggleAriaExpanded(element, false);

      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    it('should handle truthy values', () => {
      const element = createFocusableElement('button');

      toggleAriaExpanded(element, 'yes');

      expect(element.getAttribute('aria-expanded')).toBe('true');
    });

    it('should handle falsy values', () => {
      const element = createFocusableElement('button');

      toggleAriaExpanded(element, 0);

      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    it('should handle invalid element gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      toggleAriaExpanded(null, true);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('toggleAriaHidden', () => {
    it('should set aria-hidden to true', () => {
      const element = createFocusableElement('div');

      toggleAriaHidden(element, true);

      expect(element.getAttribute('aria-hidden')).toBe('true');
    });

    it('should remove aria-hidden when false', () => {
      const element = createFocusableElement('div');
      element.setAttribute('aria-hidden', 'true');

      toggleAriaHidden(element, false);

      expect(element.hasAttribute('aria-hidden')).toBe(false);
    });

    it('should handle invalid element gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      toggleAriaHidden(null, true);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setAriaLive', () => {
    it('should set aria-live attributes with defaults', () => {
      const element = createFocusableElement('div');

      setAriaLive(element);

      expect(element.getAttribute('aria-live')).toBe('polite');
      expect(element.getAttribute('aria-atomic')).toBe('false');
      expect(element.getAttribute('aria-relevant')).toBe('additions text');
    });

    it('should set custom politeness level', () => {
      const element = createFocusableElement('div');

      setAriaLive(element, { politeness: ARIA_LIVE.ASSERTIVE });

      expect(element.getAttribute('aria-live')).toBe('assertive');
    });

    it('should set atomic option', () => {
      const element = createFocusableElement('div');

      setAriaLive(element, { atomic: true });

      expect(element.getAttribute('aria-atomic')).toBe('true');
    });

    it('should set relevant option', () => {
      const element = createFocusableElement('div');

      setAriaLive(element, { relevant: 'all' });

      expect(element.getAttribute('aria-relevant')).toBe('all');
    });

    it('should handle invalid element gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      setAriaLive(null);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Screen Reader Announcement Tests
  // ============================================

  describe('announce', () => {
    beforeEach(() => {
      // Clean up any existing live regions
      const existingRegions = document.querySelectorAll('[role="status"]');
      existingRegions.forEach(region => region.remove());
    });

    it('should create live region on first announcement', async () => {
      announce('Test message');

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    });

    it('should announce message to screen readers', async () => {
      announce('Test message');

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.textContent).toBe('Test message');
    });

    it('should support assertive politeness', async () => {
      announce('Urgent message', { politeness: ARIA_LIVE.ASSERTIVE });

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    });

    it('should queue multiple announcements', async () => {
      announce('First message');
      announce('Second message');

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.textContent).toBe('First message');

      await waitFor(1200);

      expect(liveRegion.textContent).toBe('Second message');
    });

    it('should clear previous announcements when clear is true', async () => {
      announce('First message');
      await waitFor(150);

      announce('Second message', { clear: true });
      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.textContent).toBe('Second message');
    });

    it('should handle custom delay', async () => {
      announce('Test message', { delay: 500 });

      await waitFor(200);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.textContent).toBe('');

      await waitFor(400);

      expect(liveRegion.textContent).toBe('Test message');
    });

    it('should handle invalid message gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      announce(null);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should apply sr-only styles to live region', async () => {
      announce('Test message');

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.style.position).toBe('absolute');
      expect(liveRegion.style.width).toBe('1px');
      expect(liveRegion.style.height).toBe('1px');
    });
  });

  // ============================================
  // Skip Link Tests
  // ============================================

  describe('initializeSkipLinks', () => {
    it('should initialize skip links', () => {
      const main = document.createElement('main');
      main.id = 'main';
      document.body.appendChild(main);

      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      skipLink.textContent = 'Skip to main content';
      document.body.appendChild(skipLink);

      initializeSkipLinks();

      expect(skipLink).toBeDefined();
    });

    it('should focus target element on skip link click', () => {
      const main = document.createElement('main');
      main.id = 'main';
      document.body.appendChild(main);

      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      document.body.appendChild(skipLink);

      initializeSkipLinks();

      skipLink.click();

      expect(document.activeElement).toBe(main);
    });

    it('should prevent default link behavior', () => {
      const main = document.createElement('main');
      main.id = 'main';
      document.body.appendChild(main);

      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      document.body.appendChild(skipLink);

      initializeSkipLinks();

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      skipLink.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should support custom main content ID', () => {
      const content = document.createElement('div');
      content.id = 'content';
      document.body.appendChild(content);

      const skipLink = document.createElement('a');
      skipLink.href = '#content';
      document.body.appendChild(skipLink);

      initializeSkipLinks({ mainContentId: 'content' });

      skipLink.click();

      expect(document.activeElement).toBe(content);
    });

    it('should support additional skip links', () => {
      const nav = document.createElement('nav');
      nav.id = 'nav';
      document.body.appendChild(nav);

      const skipLink = document.createElement('a');
      skipLink.href = '#nav';
      document.body.appendChild(skipLink);

      initializeSkipLinks({
        additionalLinks: [
          { text: 'Skip to navigation', target: '#nav' },
        ],
      });

      skipLink.click();

      expect(document.activeElement).toBe(nav);
    });

    it('should handle missing target element gracefully', () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#nonexistent';
      document.body.appendChild(skipLink);

      initializeSkipLinks();

      expect(() => skipLink.click()).not.toThrow();
    });
  });

  // ============================================
  // Color Contrast Tests
  // ============================================

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');

      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#000000', '#000000');

      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate contrast ratio for gray colors', () => {
      const ratio = getContrastRatio('#767676', '#FFFFFF');

      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'FFFFFF');

      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should handle lowercase hex colors', () => {
      const ratio = getContrastRatio('#ffffff', '#000000');

      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 0 for invalid colors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const ratio = getContrastRatio('invalid', '#FFFFFF');

      expect(ratio).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should calculate ratio for brand colors', () => {
      const ratio = getContrastRatio('#2E7D32', '#FFFFFF');

      expect(ratio).toBeGreaterThan(3);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should return true for normal text with 4.5:1 ratio', () => {
      expect(meetsWCAGAA(4.5, 'normal')).toBe(true);
    });

    it('should return false for normal text with 4:1 ratio', () => {
      expect(meetsWCAGAA(4, 'normal')).toBe(false);
    });

    it('should return true for large text with 3:1 ratio', () => {
      expect(meetsWCAGAA(3, 'large')).toBe(true);
    });

    it('should return false for large text with 2.5:1 ratio', () => {
      expect(meetsWCAGAA(2.5, 'large')).toBe(false);
    });

    it('should use normal text threshold by default', () => {
      expect(meetsWCAGAA(4.5)).toBe(true);
      expect(meetsWCAGAA(4)).toBe(false);
    });

    it('should handle edge cases at threshold', () => {
      expect(meetsWCAGAA(4.5, 'normal')).toBe(true);
      expect(meetsWCAGAA(3, 'large')).toBe(true);
    });

    it('should handle very high contrast ratios', () => {
      expect(meetsWCAGAA(21, 'normal')).toBe(true);
      expect(meetsWCAGAA(21, 'large')).toBe(true);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration: Focus Trap with Roving Tabindex', () => {
    it('should work together for modal with tabs', () => {
      const modal = document.createElement('div');
      document.body.appendChild(modal);

      const tabs = createFocusableElements(3, 'button');
      tabs.forEach(tab => modal.appendChild(tab));

      const trap = createFocusTrap(modal);
      const tabController = createRovingTabindex(tabs, { orientation: 'horizontal' });

      trap.activate();

      expect(trap.isActive()).toBe(true);
      expect(document.activeElement).toBe(tabs[0]);

      simulateKeydown(tabs[0], KEYS.ARROW_RIGHT);

      expect(document.activeElement).toBe(tabs[1]);

      trap.release();
      tabController.destroy();
    });
  });

  describe('Integration: ARIA Attributes with Announcements', () => {
    it('should announce state changes with ARIA updates', async () => {
      const button = createFocusableElement('button');

      toggleAriaExpanded(button, true);
      announce('Menu expanded');

      await waitFor(150);

      expect(button.getAttribute('aria-expanded')).toBe('true');
      
      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion.textContent).toBe('Menu expanded');
    });
  });

  describe('Integration: Skip Links with Focus Management', () => {
    it('should focus main content and set tabindex', () => {
      const main = document.createElement('main');
      main.id = 'main';
      document.body.appendChild(main);

      const skipLink = document.createElement('a');
      skipLink.href = '#main';
      document.body.appendChild(skipLink);

      initializeSkipLinks();
      skipLink.click();

      expect(document.activeElement).toBe(main);
      expect(main.getAttribute('tabindex')).toBe('-1');
    });
  });

  // ============================================
  // Performance Tests
  // ============================================

  describe('Performance', () => {
    it('should handle large number of focusable elements efficiently', () => {
      const elements = createFocusableElements(100);

      const startTime = performance.now();
      const focusable = getFocusableElements(document.body);
      const endTime = performance.now();

      expect(focusable).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in < 50ms
    });

    it('should handle rapid focus trap activation/release', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button = createFocusableElement('button');
      container.appendChild(button);

      const trap = createFocusTrap(container);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        trap.activate();
        trap.release();
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle rapid announcements efficiently', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        announce(`Message ${i}`);
      }

      await waitFor(200);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(300);
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================

  describe('Edge Cases', () => {
    it('should handle elements being removed from DOM', () => {
      const button = createFocusableElement('button');
      button.focus();

      button.remove();

      expect(document.activeElement).not.toBe(button);
    });

    it('should handle focus trap with dynamically added elements', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button1 = createFocusableElement('button');
      container.appendChild(button1);

      const trap = createFocusTrap(container);
      trap.activate();

      const button2 = createFocusableElement('button');
      container.appendChild(button2);

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(2);
    });

    it('should handle nested focusable elements', () => {
      const parent = document.createElement('div');
      document.body.appendChild(parent);
      
      const child = document.createElement('div');
      parent.appendChild(child);
      
      const button = createFocusableElement('button');
      child.appendChild(button);

      const focusable = getFocusableElements(parent);

      expect(focusable).toHaveLength(1);
      expect(focusable[0]).toBe(button);
    });

    it('should handle elements with display: contents', () => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'contents';
      document.body.appendChild(wrapper);
      
      const button = createFocusableElement('button');
      wrapper.appendChild(button);

      const focusable = getFocusableElements(document.body);

      expect(focusable).toContain(button);
    });

    it('should handle shadow DOM elements', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      
      const shadow = host.attachShadow({ mode: 'open' });
      const button = document.createElement('button');
      shadow.appendChild(button);

      const focusable = getFocusableElements(shadow);

      expect(focusable).toHaveLength(1);
    });
  });

  // ============================================
  // Accessibility Compliance Tests
  // ============================================

  describe('WCAG AA Compliance', () => {
    it('should ensure all interactive elements are keyboard accessible', () => {
      const button = createFocusableElement('button');
      const link = createFocusableElement('a', { href: '#' });
      const input = createFocusableElement('input', { type: 'text' });

      const focusable = getFocusableElements(document.body);

      expect(focusable).toContain(button);
      expect(focusable).toContain(link);
      expect(focusable).toContain(input);
    });

    it('should provide proper ARIA labels for screen readers', () => {
      const button = createFocusableElement('button');

      setAriaAttributes(button, {
        label: 'Close dialog',
        describedby: 'dialog-description',
      });

      expect(button.getAttribute('aria-label')).toBe('Close dialog');
      expect(button.getAttribute('aria-describedby')).toBe('dialog-description');
    });

    it('should maintain focus visibility', () => {
      const button = createFocusableElement('button');

      setFocus(button);

      expect(document.activeElement).toBe(button);
      expect(button.matches(':focus')).toBe(true);
    });

    it('should support screen reader announcements', async () => {
      announce('Form submitted successfully');

      await waitFor(150);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion.textContent).toBe('Form submitted successfully');
    });

    it('should meet color contrast requirements', () => {
      const darkGreen = '#2E7D32';
      const white = '#FFFFFF';

      const ratio = getContrastRatio(darkGreen, white);

      expect(meetsWCAGAA(ratio, 'normal')).toBe(true);
    });
  });

  // ============================================
  // Browser Compatibility Tests
  // ============================================

  describe('Browser Compatibility', () => {
    it('should work with different focus methods', () => {
      const button = createFocusableElement('button');

      button.focus();
      expect(document.activeElement).toBe(button);

      button.blur();
      setFocus(button);
      expect(document.activeElement).toBe(button);
    });

    it('should handle keyboard events consistently', () => {
      const elements = createFocusableElements(2);
      createRovingTabindex(elements, { orientation: 'horizontal' });

      elements[0].focus();
      
      const event1 = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      elements[0].dispatchEvent(event1);

      expect(document.activeElement).toBe(elements[1]);
    });

    it('should support both addEventListener and on* handlers', () => {
      const button = createFocusableElement('button');
      let clicked = false;

      button.addEventListener('click', () => { clicked = true; });
      button.click();

      expect(clicked).toBe(true);
    });
  });

  // ============================================
  // Memory Leak Prevention Tests
  // ============================================

  describe('Memory Management', () => {
    it('should clean up focus trap listeners on release', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const button = createFocusableElement('button');
      container.appendChild(button);

      const trap = createFocusTrap(container);
      trap.activate();
      trap.release();

      const event = simulateKeydown(document, KEYS.TAB);

      expect(event.defaultPrevented).toBe(false);
    });

    it('should clean up roving tabindex listeners on destroy', () => {
      const elements = createFocusableElements(3);
      const controller = createRovingTabindex(elements);

      controller.destroy();

      elements[0].focus();
      const event = simulateKeydown(elements[0], KEYS.ARROW_RIGHT);

      expect(event.defaultPrevented).toBe(false);
    });

    it('should not leak memory with repeated announcements', async () => {
      for (let i = 0; i < 50; i++) {
        announce(`Message ${i}`);
      }

      await waitFor(200);

      const liveRegions = document.querySelectorAll('[role="status"]');
      expect(liveRegions.length).toBe(1);
    });
  });
});