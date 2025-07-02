import '@testing-library/jest-dom';

// Mock DOM globals for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  writable: true,
});

// Mock document.getElementById and other DOM methods commonly used
global.document.getElementById = vi.fn();
global.document.createElement = vi.fn();
global.document.createTextNode = vi.fn();

// Mock console methods if needed
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};