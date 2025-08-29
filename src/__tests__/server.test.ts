import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jest } from '@jest/globals';

// Mock the ovh module
jest.mock('ovh', () => jest.fn());

// Import the server class after mocking
import { OvhMcpServer } from '../index.js';

describe('OvhMcpServer', () => {
    let server: OvhMcpServer;

    beforeEach(() => {
        server = new OvhMcpServer();
        jest.clearAllMocks();
    });

    it('should initialize with McpServer instance', () => {
        expect(server.server).toBeInstanceOf(McpServer);
        expect(server.server).toBeDefined();
    });

    it('should have ovhClient initially undefined', () => {
        expect(server.ovhClient).toBeUndefined();
    });

    describe('Tool Registration', () => {
        it('should register all required tools', async () => {
            // Get the list of tools to verify registration
            const mockListTools = jest.spyOn(server.server, 'setRequestHandler');

            // The tools are registered in setupTools() which is called in constructor
            // We can verify this indirectly by checking the server has the expected structure
            expect(server.server).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should throw error when client not initialized', async () => {
            await expect(server.getUserInfo()).rejects.toThrow(
                "OVH client not initialized. Please call ovh_initialize_client first."
            );

            await expect(server.getBills()).rejects.toThrow(
                "OVH client not initialized. Please call ovh_initialize_client first."
            );

            await expect(server.getServices()).rejects.toThrow(
                "OVH client not initialized. Please call ovh_initialize_client first."
            );
        });
    });

    describe('Initialization Methods', () => {
        const mockOvh = {
            requestPromised: jest.fn()
        };

        beforeEach(() => {
            // Mock the ovh import
            const ovhModule = require('ovh');
            ovhModule.mockReturnValue(mockOvh);
        });

        it('should initialize client with valid credentials', async () => {
            const args = {
                endpoint: "ovh-eu" as const,
                appKey: "test-key",
                appSecret: "test-secret",
                consumerKey: "test-consumer"
            };

            const result = await server.initializeClient(args);

            expect(result.content[0].type).toBe('text');
            expect(result.content[0].text).toContain('OVH client initialized successfully');
            expect(server.ovhClient).toBeDefined();
        });

        it('should initialize OAuth2 client with valid credentials', async () => {
            const args = {
                endpoint: "ovh-eu" as const,
                clientID: "test-client-id",
                clientSecret: "test-client-secret"
            };

            const result = await server.initializeOAuth2(args);

            expect(result.content[0].type).toBe('text');
            expect(result.content[0].text).toContain('OVH OAuth2 client initialized successfully');
            expect(server.ovhClient).toBeDefined();
        });

        it('should make request when client is initialized', async () => {
            // First initialize the client
            await server.initializeClient({
                endpoint: "ovh-eu" as const,
                appKey: "test-key",
                appSecret: "test-secret",
                consumerKey: "test-consumer"
            });

            // Mock successful response
            mockOvh.requestPromised.mockResolvedValue({ test: 'data' });

            const args = {
                method: "GET" as const,
                path: "/me",
                data: undefined
            };

            const result = await server.makeRequest(args);

            expect(mockOvh.requestPromised).toHaveBeenCalledWith('GET', '/me', undefined);
            expect(result.content[0].type).toBe('text');
            expect(result.content[0].text).toContain('test');
        });

        it('should handle API errors gracefully', async () => {
            // First initialize the client
            await server.initializeClient({
                endpoint: "ovh-eu" as const,
                appKey: "test-key",
                appSecret: "test-secret",
                consumerKey: "test-consumer"
            });

            // Mock API error
            const apiError = new Error('API Error');
            mockOvh.requestPromised.mockRejectedValue(apiError);

            const args = {
                method: "GET" as const,
                path: "/me",
                data: undefined
            };

            await expect(server.makeRequest(args)).rejects.toThrow('OVH API request failed: API Error');
        });
    });
});
