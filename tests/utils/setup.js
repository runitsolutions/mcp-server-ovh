/**
 * Jest setup file
 * Global configuration for all tests
 */

const { setupTestEnvironment, cleanupTestEnvironment } = require('./test-config');

// Setup test environment before all tests
beforeAll(() => {
  setupTestEnvironment({
    nodeEnv: 'test',
    useRealCredentials: false // Use mocks by default
  });
});

// Cleanup after all tests
afterAll(() => {
  cleanupTestEnvironment();
});

// Setup global mocks if necessary
global.console = {
  ...console,
  // Suppress logs in tests unless there's an error
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Setup global test variables
global.testConfig = {
  timeout: 30000,
  retries: 3,
  endpoints: {
    base: 'https://eu.api.ovh.com/v1',
    console: 'https://eu.api.ovh.com/console'
  }
};

// Global utilities for tests
global.testUtils = {
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  createMockResponse: (data, status = 200) => ({
    status,
    data,
    headers: { 'content-type': 'application/json' }
  }),

  createMockError: (message, code = 500) => ({
    response: {
      status: code,
      data: { message }
    }
  })
};

// Configure Jest to handle unhandled Promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In tests, fail the test if there's an unhandled promise
  if (typeof expect !== 'undefined') {
    expect(reason).toBeUndefined();
  }
});
