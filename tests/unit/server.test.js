/**
 * Unit tests for MCP OVH Server
 * Tests the core server functionality in isolation
 */

const { OvhMcpServer } = require('../../dist/index');
const { createMockOvhClient } = require('../utils/test-config');

describe('OvhMcpServer', () => {
  let server;
  let mockClient;

  beforeEach(() => {
    server = new OvhMcpServer();
    mockClient = createMockOvhClient();
    server.ovhClient = mockClient;
  });

  afterEach(() => {
    server = null;
    mockClient = null;
  });

  describe('Initialization', () => {
    test('should create server instance', () => {
      expect(server).toBeInstanceOf(OvhMcpServer);
      expect(server.server).toBeDefined();
      expect(server.ovhClient).toBeDefined();
    });

    test('should have null ovhClient initially', () => {
      const newServer = new OvhMcpServer();
      expect(newServer.ovhClient).toBeNull();
    });
  });

  describe('Tool Registration', () => {
    test('should register all MCP tools', async () => {
      const toolsResponse = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      });

      expect(toolsResponse.result).toBeDefined();
      expect(toolsResponse.result.tools).toBeDefined();
      expect(Array.isArray(toolsResponse.result.tools)).toBe(true);
      expect(toolsResponse.result.tools.length).toBeGreaterThan(0);
    });

    test('should include all expected tools', async () => {
      const toolsResponse = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      });

      const toolNames = toolsResponse.result.tools.map(tool => tool.name);
      const expectedTools = [
        'ovh_initialize_client',
        'ovh_oauth2_initialize',
        'ovh_request',
        'ovh_get_user_info',
        'ovh_get_bills',
        'ovh_get_services',
        'ovh_get_payment_methods',
        'ovh_get_orders',
        'ovh_get_cloud_projects',
        'ovh_get_dedicated_servers',
        'ovh_get_vps',
        'ovh_get_ips',
        'ovh_get_vrack',
        'ovh_get_load_balancers',
        'ovh_get_ssl_certificates',
        'ovh_get_dbaas_logs'
      ];

      expectedTools.forEach(toolName => {
        expect(toolNames).toContain(toolName);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tool calls', async () => {
      const response = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
          arguments: {}
        }
      });

      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('Unknown tool');
    });

    test('should handle calls without initialized client', async () => {
      server.ovhClient = null;

      const response = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'ovh_get_user_info',
          arguments: {}
        }
      });

      expect(response.result).toBeDefined();
      expect(response.result.content[0].text).toContain('OVH client not initialized');
    });
  });

  describe('Request Processing', () => {
    test('should process valid requests', async () => {
      const response = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'ovh_get_user_info',
          arguments: {}
        }
      });

      expect(response.result).toBeDefined();
      expect(response.result.content).toBeDefined();
      expect(Array.isArray(response.result.content)).toBe(true);
    });

    test('should validate request parameters', async () => {
      const response = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'ovh_initialize_client',
          arguments: {
            endpoint: 'ovh-eu',
            appKey: 'test-key',
            appSecret: 'test-secret',
            consumerKey: 'test-consumer'
          }
        }
      });

      expect(response.result).toBeDefined();
      expect(response.result.content[0].text).toContain('OVH client initialized successfully');
    });
  });
});
