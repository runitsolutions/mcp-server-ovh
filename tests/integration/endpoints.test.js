/**
 * Integration tests for OVH API endpoints
 * Tests real endpoint connectivity and responses
 */

const { createTestOvhClient } = require('../utils/test-config');

describe('OVH API Endpoints Integration', () => {
  let ovhClient;

  beforeAll(() => {
    ovhClient = createTestOvhClient();
  });

  describe('User Information Endpoints', () => {
    test('GET /me should return user information', async () => {
      const result = await ovhClient.requestPromised('GET', '/me');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('GET /me/bill should return billing information', async () => {
      const result = await ovhClient.requestPromised('GET', '/me/bill');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Service Endpoints', () => {
    test('GET /service should return services list', async () => {
      const result = await ovhClient.requestPromised('GET', '/service');
      expect(Array.isArray(result)).toBe(true);
    });

    test('GET /cloud/project should return cloud projects', async () => {
      const result = await ovhClient.requestPromised('GET', '/cloud/project');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Infrastructure Endpoints', () => {
    test('GET /dedicated/server should return dedicated servers', async () => {
      const result = await ovhClient.requestPromised('GET', '/dedicated/server');
      expect(Array.isArray(result)).toBe(true);
    });

    test('GET /vps should return VPS instances', async () => {
      const result = await ovhClient.requestPromised('GET', '/vps');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Network Endpoints', () => {
    test('GET /ip should return IP addresses', async () => {
      const result = await ovhClient.requestPromised('GET', '/ip');
      expect(Array.isArray(result)).toBe(true);
    });

    test('GET /vrack should return vRack information', async () => {
      const result = await ovhClient.requestPromised('GET', '/vrack');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
