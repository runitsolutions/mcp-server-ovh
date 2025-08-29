/**
 * Unit tests for MCP OVH Server
 * Tests the core server functionality in isolation
 */

const { OvhMcpServer } = require('../../dist/index');
const { createMockOvhClient } = require('../utils/test-config');
const { startTestServer, sendJsonRpcRequest } = require('../utils/test-helpers');

describe('OvhMcpServer', () => {
  let testServer;
  let mockClient;

  beforeAll(async () => {
    mockClient = createMockOvhClient();
    testServer = await startTestServer();
  });

  afterAll(async () => {
    if (testServer) {
      await testServer.stop();
    }
  });

  describe('Server Initialization', () => {
    test('should start server successfully', () => {
      expect(testServer).toBeDefined();
      expect(testServer.process).toBeDefined();
      expect(testServer.stop).toBeDefined();
    });
  });

  describe('MCP Protocol', () => {
    test('should respond to tools/list request', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const response = await sendJsonRpcRequest(testServer, request);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeDefined();
      expect(Array.isArray(response.result.tools)).toBe(true);
    });

    test('should include expected OVH tools', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      const response = await sendJsonRpcRequest(testServer, request);
      const toolNames = response.result.tools.map(tool => tool.name);

      const expectedTools = [
        'ovh_initialize_client',
        'ovh_oauth2_initialize',
        'ovh_request'
      ];

      expectedTools.forEach(toolName => {
        expect(toolNames).toContain(toolName);
      });
    });
  });

  describe('OVH Tools', () => {
    test('should handle ovh_get_user_info tool call', async () => {
      // First initialize the client
      const initRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'ovh_initialize_client',
          arguments: {
            endpoint: 'ovh-us',
            appKey: 'test-key',
            appSecret: 'test-secret',
            consumerKey: 'test-consumer'
          }
        }
      };

      const initResponse = await sendJsonRpcRequest(testServer, initRequest);
      expect(initResponse.result).toBeDefined();

      // Then test user info
      const userInfoRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'ovh_get_user_info',
          arguments: {}
        }
      };

      const userInfoResponse = await sendJsonRpcRequest(testServer, userInfoRequest);
      expect(userInfoResponse.result).toBeDefined();
      expect(userInfoResponse.result.content).toBeDefined();
    });

    test('should handle invalid tool calls', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
          arguments: {}
        }
      };

      const response = await sendJsonRpcRequest(testServer, request);
      expect(response.error).toBeDefined();
      expect(response.error.message).toContain('Unknown tool');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed requests', async () => {
      const malformedRequest = {
        jsonrpc: '2.0',
        id: 6,
        method: 'invalid_method',
        params: {}
      };

      const response = await sendJsonRpcRequest(testServer, malformedRequest);
      expect(response.error).toBeDefined();
    });
  });
});
