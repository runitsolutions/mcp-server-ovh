import {
  InitializeClientSchema,
  InitializeOAuth2Schema,
  MakeRequestSchema
} from '../index';

describe('Input Validation Schemas', () => {
  describe('InitializeClientSchema', () => {
    it('should accept valid OVH client initialization data', () => {
      const validData = {
        endpoint: 'ovh-eu',
        appKey: 'test-app-key',
        appSecret: 'test-app-secret',
        consumerKey: 'test-consumer-key'
      };

      const result = InitializeClientSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept all valid endpoints', () => {
      const endpoints = [
        'ovh-eu', 'ovh-us', 'ovh-ca',
        'soyoustart-eu', 'soyoustart-ca',
        'kimsufi-eu', 'kimsufi-ca'
      ];

      endpoints.forEach(endpoint => {
        const data = {
          endpoint,
          appKey: 'test-key',
          appSecret: 'test-secret',
          consumerKey: 'test-consumer'
        };

        expect(() => InitializeClientSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject empty app key', () => {
      const invalidData = {
        endpoint: 'ovh-eu',
        appKey: '',
        appSecret: 'test-secret',
        consumerKey: 'test-consumer'
      };

      expect(() => InitializeClientSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid endpoint', () => {
      const invalidData = {
        endpoint: 'invalid-endpoint',
        appKey: 'test-key',
        appSecret: 'test-secret',
        consumerKey: 'test-consumer'
      };

      expect(() => InitializeClientSchema.parse(invalidData)).toThrow();
    });
  });

  describe('InitializeOAuth2Schema', () => {
    it('should accept valid OAuth2 initialization data', () => {
      const validData = {
        endpoint: 'ovh-eu',
        clientID: 'test-client-id',
        clientSecret: 'test-client-secret'
      };

      const result = InitializeOAuth2Schema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject OAuth2 endpoints that are not supported', () => {
      const invalidData = {
        endpoint: 'soyoustart-eu', // Not supported for OAuth2
        clientID: 'test-client-id',
        clientSecret: 'test-client-secret'
      };

      expect(() => InitializeOAuth2Schema.parse(invalidData)).toThrow();
    });
  });

  describe('MakeRequestSchema', () => {
    it('should accept valid request data', () => {
      const validData = {
        method: 'GET',
        path: '/me',
        data: { test: 'data' }
      };

      const result = MakeRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept request without optional data', () => {
      const validData = {
        method: 'POST',
        path: '/me/bill'
      };

      const result = MakeRequestSchema.parse(validData);
      expect(result.method).toBe('POST');
      expect(result.path).toBe('/me/bill');
      expect(result.data).toBeUndefined();
    });

    it('should reject empty path', () => {
      const invalidData = {
        method: 'GET',
        path: ''
      };

      expect(() => MakeRequestSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid HTTP method', () => {
      const invalidData = {
        method: 'INVALID',
        path: '/me'
      };

      expect(() => MakeRequestSchema.parse(invalidData)).toThrow();
    });
  });
});
