import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from "dotenv";
import type { OvhClient, OvhEndpoint, HttpMethod, OvhUserInfo, OvhBill, OvhService } from "./types/ovh.js";

// Dynamic import to avoid TypeScript issues
let ovh: any;

dotenv.config();

// Input validation schemas
export const InitializeClientSchema = z.object({
    endpoint: z.enum(["ovh-eu", "ovh-us", "ovh-ca", "soyoustart-eu", "soyoustart-ca", "kimsufi-eu", "kimsufi-ca"]),
    appKey: z.string().min(1),
    appSecret: z.string().min(1),
    consumerKey: z.string().min(1),
});

export const InitializeOAuth2Schema = z.object({
    endpoint: z.enum(["ovh-eu", "ovh-us", "ovh-ca"]),
    clientID: z.string().min(1),
    clientSecret: z.string().min(1),
});

export const MakeRequestSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    path: z.string().min(1),
    data: z.record(z.any()).optional(),
});

export class OvhMcpServer {
    server: McpServer;
    ovhClient: OvhClient | null;

    constructor() {
        this.server = new McpServer({
            name: "ovh-mcp-server",
            version: "1.0.0",
        });
        this.ovhClient = null;
        this.setupTools();
        this.setupErrorHandling();
    }

    setupTools() {
        // Register tools using the modern McpServer API
        this.server.registerTool(
            "ovh_initialize_client",
            {
                title: "Initialize OVH Client",
                        description: "Initialize OVH API client with credentials",
                inputSchema: InitializeClientSchema
            },
            async (args) => await this.initializeClient(args)
        );

        this.server.registerTool(
            "ovh_oauth2_initialize",
            {
                title: "Initialize OVH OAuth2 Client",
                        description: "Initialize OVH API client with OAuth2 credentials",
                inputSchema: InitializeOAuth2Schema
            },
            async (args) => await this.initializeOAuth2(args)
        );

        this.server.registerTool(
            "ovh_request",
            {
                title: "Make OVH API Request",
                        description: "Make a request to OVH API",
                inputSchema: MakeRequestSchema
            },
            async (args) => await this.makeRequest(args)
        );

        this.server.registerTool(
            "ovh_get_user_info",
            {
                title: "Get User Information",
                        description: "Get current user information",
                inputSchema: z.object({})
                    },
            async () => await this.getUserInfo()
        );

        this.server.registerTool(
            "ovh_get_bills",
                    {
                title: "Get User Bills",
                        description: "Get user bills",
                inputSchema: z.object({})
                    },
            async () => await this.getBills()
        );

        this.server.registerTool(
            "ovh_get_services",
                    {
                title: "Get User Services",
                        description: "Get user services",
                inputSchema: z.object({})
            },
            async () => await this.getServices()
        );
    }

    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }

    async initializeClient(args: z.infer<typeof InitializeClientSchema>) {
        if (!ovh) {
            ovh = await import('ovh');
        }
        
        this.ovhClient = ovh({
            endpoint: args.endpoint,
            appKey: args.appKey,
            appSecret: args.appSecret,
            consumerKey: args.consumerKey
        });

        return {
            content: [
                {
                    type: "text",
                    text: `OVH client initialized successfully with endpoint: ${args.endpoint}`
                }
            ]
        };
    }

    async initializeOAuth2(args: z.infer<typeof InitializeOAuth2Schema>) {
        if (!ovh) {
            ovh = await import('ovh');
        }
        
        this.ovhClient = ovh({
            endpoint: args.endpoint,
            clientID: args.clientID,
            clientSecret: args.clientSecret
        });

        return {
            content: [
                {
                    type: "text",
                    text: `OVH OAuth2 client initialized successfully with endpoint: ${args.endpoint}`
                }
            ]
        };
    }

    async makeRequest(args: z.infer<typeof MakeRequestSchema>) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised(args.method, args.path, args.data);
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`OVH API request failed: ${errorMessage}`);
        }
    }

    async getUserInfo() {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
        const userInfo = await this.ovhClient.requestPromised('GET', '/me');
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(userInfo, null, 2)
                }
            ]
        };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get user info: ${errorMessage}`);
        }
    }

    async getBills() {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
        const bills = await this.ovhClient.requestPromised('GET', '/me/bill');
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(bills, null, 2)
                }
            ]
        };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get bills: ${errorMessage}`);
        }
    }

    async getServices() {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
        const services = await this.ovhClient.requestPromised('GET', '/me/service');
        
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(services, null, 2)
                }
            ]
        };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get services: ${errorMessage}`);
        }
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("OVH MCP Server started");
    }
}

const server = new OvhMcpServer();
server.start().catch(console.error);
