import { InitializeClientSchema, InitializeOAuth2Schema, MakeRequestSchema } from '../index.js';

describe('Input Validation', () => {
    describe('InitializeClientSchema', () => {
        it('should validate valid client initialization data', () => {
            const validData = {
                endpoint: "ovh-eu" as const,
                appKey: "test-app-key",
                appSecret: "test-app-secret",
                consumerKey: "test-consumer-key"
            };

            expect(() => InitializeClientSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid endpoint', () => {
            const invalidData = {
                endpoint: "invalid-endpoint",
                appKey: "test-app-key",
                appSecret: "test-app-secret",
                consumerKey: "test-consumer-key"
            };

            expect(() => InitializeClientSchema.parse(invalidData)).toThrow();
        });

        it('should reject empty strings', () => {
            const invalidData = {
                endpoint: "ovh-eu" as const,
                appKey: "",
                appSecret: "test-app-secret",
                consumerKey: "test-consumer-key"
            };

            expect(() => InitializeClientSchema.parse(invalidData)).toThrow();
        });
    });

    describe('InitializeOAuth2Schema', () => {
        it('should validate valid OAuth2 initialization data', () => {
            const validData = {
                endpoint: "ovh-eu" as const,
                clientID: "test-client-id",
                clientSecret: "test-client-secret"
            };

            expect(() => InitializeOAuth2Schema.parse(validData)).not.toThrow();
        });

        it('should reject invalid OAuth2 endpoint', () => {
            const invalidData = {
                endpoint: "soyoustart-eu" as const,
                clientID: "test-client-id",
                clientSecret: "test-client-secret"
            };

            expect(() => InitializeOAuth2Schema.parse(invalidData)).toThrow();
        });
    });

    describe('MakeRequestSchema', () => {
        it('should validate valid request data', () => {
            const validData = {
                method: "GET" as const,
                path: "/me",
                data: { test: "value" }
            };

            expect(() => MakeRequestSchema.parse(validData)).not.toThrow();
        });

        it('should validate request without data', () => {
            const validData = {
                method: "GET" as const,
                path: "/me"
            };

            expect(() => MakeRequestSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid HTTP method', () => {
            const invalidData = {
                method: "PATCH" as any,
                path: "/me"
            };

            expect(() => MakeRequestSchema.parse(invalidData)).toThrow();
        });

        it('should reject empty path', () => {
            const invalidData = {
                method: "GET" as const,
                path: ""
            };

            expect(() => MakeRequestSchema.parse(invalidData)).toThrow();
        });
    });
});
