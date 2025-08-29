const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");
const dotenv = require("dotenv");
// Types are available but not currently used in this file

// Dynamic require to avoid TypeScript issues
let ovh: any;

dotenv.config({ path: '.env' });

// Input validation schemas
const InitializeClientSchema = z.object({
    endpoint: z.enum(["ovh-eu", "ovh-us", "ovh-ca", "soyoustart-eu", "soyoustart-ca", "kimsufi-eu", "kimsufi-ca"]),
    appKey: z.string().min(1),
    appSecret: z.string().min(1),
    consumerKey: z.string().min(1),
});

const InitializeOAuth2Schema = z.object({
    endpoint: z.enum(["ovh-eu", "ovh-us", "ovh-ca"]),
    clientID: z.string().min(1),
    clientSecret: z.string().min(1),
});

const MakeRequestSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    path: z.string().min(1),
    data: z.record(z.any()).optional(),
});

class OvhMcpServer {
    server: Server;
    ovhClient: any;

    constructor() {
        this.server = new Server(
            {
                name: "ovh-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        this.ovhClient = null;
        this.setupTools();
        this.setupErrorHandling();
    }

        setupTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "ovh_initialize_client",
                        description: "Initialize OVH API client with credentials",
                        inputSchema: {
                            type: "object",
                            properties: {
                                endpoint: {
                                    type: "string",
                                    description: "OVH API endpoint (ovh-eu, ovh-us, ovh-ca, etc.)",
                                    enum: ["ovh-eu", "ovh-us", "ovh-ca", "soyoustart-eu", "soyoustart-ca", "kimsufi-eu", "kimsufi-ca"]
                                },
                                appKey: {
                                    type: "string",
                                    description: "Application key from OVH"
                                },
                                appSecret: {
                                    type: "string",
                                    description: "Application secret from OVH"
                                },
                                consumerKey: {
                                    type: "string",
                                    description: "Consumer key from OVH"
                                }
                            },
                            required: ["endpoint", "appKey", "appSecret", "consumerKey"]
                        }
                    },
                    {
                        name: "ovh_oauth2_initialize",
                        description: "Initialize OVH API client with OAuth2 credentials",
                        inputSchema: {
                            type: "object",
                            properties: {
                                endpoint: {
                                    type: "string",
                                    description: "OVH API endpoint",
                                    enum: ["ovh-eu", "ovh-us", "ovh-ca"]
                                },
                                clientID: {
                                    type: "string",
                                    description: "OAuth2 client ID"
                                },
                                clientSecret: {
                                    type: "string",
                                    description: "OAuth2 client secret"
                                }
                            },
                            required: ["endpoint", "clientID", "clientSecret"]
                        }
                    },
                    {
                        name: "ovh_request",
                        description: "Make a request to OVH API",
                        inputSchema: {
                            type: "object",
                            properties: {
                                method: {
                                    type: "string",
                                    description: "HTTP method (GET, POST, PUT, DELETE)",
                                    enum: ["GET", "POST", "PUT", "DELETE"]
                                },
                                path: {
                                    type: "string",
                                    description: "API path (e.g., /me, /me/bill, /sms)"
                                },
                                data: {
                                    type: "object",
                                    description: "Request data for POST/PUT requests"
                                }
                            },
                            required: ["method", "path"]
                        }
                    },
                    {
                        name: "ovh_get_user_info",
                        description: "Get current user information",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_bills",
                        description: "Get user bills",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_services",
                        description: "Get user services",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                // Validate arguments using Zod schemas
                switch (name) {
                    case "ovh_initialize_client":
                        InitializeClientSchema.parse(args);
                        return await this.initializeClient(args);
                    case "ovh_oauth2_initialize":
                        InitializeOAuth2Schema.parse(args);
                        return await this.initializeOAuth2(args);
                    case "ovh_request":
                        MakeRequestSchema.parse(args);
                        return await this.makeRequest(args);
                    case "ovh_get_user_info":
                    case "ovh_get_bills":
                    case "ovh_get_services":
                        return await this.handleSimpleRequest(name);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${errorMessage}`
                        }
                    ]
                };
            }
        });
    }

    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }

        async initializeClient(args: any) {
        if (!ovh) {
            ovh = require('@ovhcloud/node-ovh');
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

    async initializeOAuth2(args: any) {
        if (!ovh) {
            ovh = require('@ovhcloud/node-ovh');
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

    async makeRequest(args: any) {
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

    async handleSimpleRequest(toolName: string) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            let path: string;
            switch (toolName) {
                case "ovh_get_user_info":
                    path = "/me";
                    break;
                case "ovh_get_bills":
                    path = "/me/bill";
                    break;
                case "ovh_get_services":
                    path = "/me/service";
                    break;
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }

            const result = await this.ovhClient.requestPromised('GET', path);

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
            throw new Error(`Failed to execute ${toolName}: ${errorMessage}`);
        }
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("OVH MCP Server started");
    }
}

const server = new OvhMcpServer();

// Export for external usage
module.exports = {
    OvhMcpServer,
    InitializeClientSchema,
    InitializeOAuth2Schema,
    MakeRequestSchema
};

// Start server if run directly
if (require.main === module) {
    server.start().catch(console.error);
}
