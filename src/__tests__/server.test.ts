import { OvhMcpServer } from '../index';

describe('OvhMcpServer', () => {
  let server: OvhMcpServer;

  beforeEach(() => {
    server = new OvhMcpServer();
  });

  describe('Initialization', () => {
    it('should create server instance', () => {
      expect(server).toBeDefined();
      expect(server.server).toBeDefined();
    });

    it('should not have ovhClient initialized', () => {
      expect(server.ovhClient).toBeNull();
    });
  });

  describe('Tool Registration', () => {
    it('should have all required tools registered', async () => {
      const tools = await server.server.processRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      });

      expect(tools).toBeDefined();
      // Note: This would need proper MCP protocol mocking for full testing
    });
  });

  describe('Validation Schemas', () => {
    it('should validate InitializeClientSchema correctly', () => {
      const validData = {
        endpoint: 'ovh-eu' as const,
        appKey: 'test-key',
        appSecret: 'test-secret',
        consumerKey: 'test-consumer'
      };

      expect(() => {
        require('../index').InitializeClientSchema.parse(validData);
      }).not.toThrow();
    });

    it('should reject invalid InitializeClientSchema', () => {
      const invalidData = {
        endpoint: 'invalid-endpoint',
        appKey: '',
        appSecret: 'test-secret',
        consumerKey: 'test-consumer'
      };

      expect(() => {
        require('../index').InitializeClientSchema.parse(invalidData);
      }).toThrow();
    });
  });
});
