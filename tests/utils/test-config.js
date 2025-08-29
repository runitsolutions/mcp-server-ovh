/**
 * Test configuration utilities for MCP OVH Server
 * This file contains shared utilities and configurations for testing
 */

const path = require('path');

// Test environment variables (never commit real credentials!)
const TEST_CONFIG = {
  endpoint: 'ovh-us',
  appKey: process.env.OVH_APP_KEY || 'test-app-key',
  appSecret: process.env.OVH_APP_SECRET || 'test-app-secret',
  consumerKey: process.env.OVH_CONSUMER_KEY || 'test-consumer-key'
};

/**
 * Create a test OVH client instance
 * @returns {Object} Mock or real OVH client depending on environment
 */
function createTestOvhClient() {
  // For unit tests, return a mock client
  if (process.env.NODE_ENV === 'test') {
    return createMockOvhClient();
  }

  // For integration tests, use real client if credentials are provided
  try {
    const ovh = require('@ovhcloud/node-ovh');
    return ovh(TEST_CONFIG);
  } catch (error) {
    console.warn('OVH client not available, using mock client');
    return createMockOvhClient();
  }
}

/**
 * Create a mock OVH client for testing without real API calls
 * @returns {Object} Mock client with requestPromised method
 */
function createMockOvhClient() {
  return {
    requestPromised: async (method, path, data) => {
      console.log(`[MOCK] ${method} ${path}`, data ? JSON.stringify(data) : '');

      // Mock responses based on path
      const mockResponses = {
        'GET': {
          '/me': { firstname: 'Test', lastname: 'User', email: 'test@example.com' },
          '/me/bill': [{ id: 'bill-123', date: '2024-01-01', amount: 29.99 }],
          '/service': [{ serviceId: 12345, serviceType: 'domain' }],
          '/cloud/project': [{ id: 'project-123', name: 'Test Project' }]
        }
      };

      return mockResponses[method]?.[path] || { mock: true, path, method };
    }
  };
}

/**
 * Get test configuration
 * @returns {Object} Test configuration object
 */
function getTestConfig() {
  return { ...TEST_CONFIG };
}

/**
 * Setup test environment
 * @param {Object} options - Test options
 */
function setupTestEnvironment(options = {}) {
  process.env.NODE_ENV = options.nodeEnv || 'test';
  process.env.OVH_ENDPOINT = options.endpoint || TEST_CONFIG.endpoint;

  if (options.useRealCredentials !== false) {
    process.env.OVH_APP_KEY = TEST_CONFIG.appKey;
    process.env.OVH_APP_SECRET = TEST_CONFIG.appSecret;
    process.env.OVH_CONSUMER_KEY = TEST_CONFIG.consumerKey;
  }
}

/**
 * Cleanup test environment
 */
function cleanupTestEnvironment() {
  delete process.env.NODE_ENV;
  delete process.env.OVH_ENDPOINT;
  delete process.env.OVH_APP_KEY;
  delete process.env.OVH_APP_SECRET;
  delete process.env.OVH_CONSUMER_KEY;
}

module.exports = {
  createTestOvhClient,
  createMockOvhClient,
  getTestConfig,
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG
};
