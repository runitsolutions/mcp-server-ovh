const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");
const dotenv = require("dotenv");
// Types are available but not currently used in this file

// Type definitions
/** @typedef {import("@modelcontextprotocol/sdk/server/index.js").Server} Server */
/** @typedef {import("@modelcontextprotocol/sdk/server/stdio.js").StdioServerTransport} StdioServerTransport */

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
    server: any;
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
                    },
                    {
                        name: "ovh_get_payment_methods",
                        description: "Get user payment methods",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_orders",
                        description: "Get user orders",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_cloud_projects",
                        description: "Get cloud projects",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_dedicated_servers",
                        description: "Get dedicated servers",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_vps",
                        description: "Get VPS instances",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_ips",
                        description: "Get IP addresses",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_vrack",
                        description: "Get vRack information",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_load_balancers",
                        description: "Get load balancers",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_ssl_certificates",
                        description: "Get SSL certificates",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_dbaas_logs",
                        description: "Get DBaaS Logs services",
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
                    case "ovh_get_payment_methods":
                    case "ovh_get_orders":
                    case "ovh_get_cloud_projects":
                    case "ovh_get_dedicated_servers":
                    case "ovh_get_vps":
                    case "ovh_get_ips":
                    case "ovh_get_vrack":
                    case "ovh_get_load_balancers":
                    case "ovh_get_ssl_certificates":
                    case "ovh_get_dbaas_logs":
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
        try {
            if (!ovh) {
                ovh = require('@ovhcloud/node-ovh');
            }

            // Validate credentials format
            if (!args.appKey || !args.appSecret || !args.consumerKey) {
                throw new Error("Missing required credentials: appKey, appSecret, and consumerKey are required");
            }

            console.error(`Initializing OVH client with endpoint: ${args.endpoint}`);

            this.ovhClient = ovh({
                endpoint: args.endpoint,
                appKey: args.appKey,
                appSecret: args.appSecret,
                consumerKey: args.consumerKey
            });

            console.error("OVH client initialized successfully");

            return {
                content: [
                    {
                        type: "text",
                        text: `OVH client initialized successfully with endpoint: ${args.endpoint}`
                    }
                ]
            };
        } catch (error: any) {
            console.error("Failed to initialize OVH client:", error);

            let errorMessage = "Unknown initialization error";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Failed to initialize OVH client: ${errorMessage}`
                    }
                ]
            };
        }
    }

    async initializeOAuth2(args: any) {
        try {
            if (!ovh) {
                ovh = require('@ovhcloud/node-ovh');
            }

            // Validate OAuth2 credentials format
            if (!args.clientID || !args.clientSecret) {
                throw new Error("Missing required OAuth2 credentials: clientID and clientSecret are required");
            }

            console.error(`Initializing OVH OAuth2 client with endpoint: ${args.endpoint}`);

            this.ovhClient = ovh({
                endpoint: args.endpoint,
                clientID: args.clientID,
                clientSecret: args.clientSecret
            });

            console.error("OVH OAuth2 client initialized successfully");

            return {
                content: [
                    {
                        type: "text",
                        text: `OVH OAuth2 client initialized successfully with endpoint: ${args.endpoint}`
                    }
                ]
            };
        } catch (error: any) {
            console.error("Failed to initialize OVH OAuth2 client:", error);

            let errorMessage = "Unknown OAuth2 initialization error";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Failed to initialize OVH OAuth2 client: ${errorMessage}`
                    }
                ]
            };
        }
    }

    async makeRequest(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised(args.method, args.path, args.data);

            // Validate response format
            if (result === null || result === undefined) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Warning: API returned empty response"
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            console.error(`OVH API request failed for ${args.method} ${args.path}:`, error);

            let errorMessage = "Unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                // Handle OVH API specific error format
                if (error.errorCode) {
                    errorMessage = `OVH API Error ${error.errorCode}: ${error.message || 'Unknown error'}`;
                } else if (error.message) {
                    errorMessage = error.message;
                } else {
                    errorMessage = JSON.stringify(error);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Error: OVH API request failed: ${errorMessage}`
                    }
                ]
            };
        }
    }

    async handleSimpleRequest(toolName: string) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            let path: string;
            let operation: string;

            switch (toolName) {
                case "ovh_get_user_info":
                    path = "/me";
                    operation = "user information retrieval";
                    break;
                case "ovh_get_bills":
                    path = "/me/bill";
                    operation = "billing information retrieval";
                    break;
                case "ovh_get_services":
                    path = "/service";
                    operation = "services information retrieval";
                    break;
                case "ovh_get_payment_methods":
                    path = "/me/payment/method";
                    operation = "payment methods retrieval";
                    break;
                case "ovh_get_orders":
                    path = "/me/order";
                    operation = "orders retrieval";
                    break;
                case "ovh_get_cloud_projects":
                    path = "/cloud/project";
                    operation = "cloud projects retrieval";
                    break;
                case "ovh_get_dedicated_servers":
                    path = "/dedicated/server";
                    operation = "dedicated servers retrieval";
                    break;
                case "ovh_get_vps":
                    path = "/vps";
                    operation = "VPS instances retrieval";
                    break;
                case "ovh_get_ips":
                    path = "/ip";
                    operation = "IP addresses retrieval";
                    break;
                case "ovh_get_vrack":
                    path = "/vrack";
                    operation = "vRack information retrieval";
                    break;
                case "ovh_get_load_balancers":
                    path = "/ipLoadbalancing";
                    operation = "load balancers retrieval";
                    break;
                case "ovh_get_ssl_certificates":
                    path = "/ssl";
                    operation = "SSL certificates retrieval";
                    break;
                case "ovh_get_dbaas_logs":
                    path = "/dbaas/logs";
                    operation = "DBaaS Logs services retrieval";
                    break;
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }

            console.error(`Executing ${operation} for ${toolName}...`);

            const result = await this.ovhClient.requestPromised('GET', path);

            // Validate response
            if (result === null || result === undefined) {
                console.warn(`Warning: ${operation} returned empty response`);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Warning: No data available for ${operation}`
                        }
                    ]
                };
            }

            // Additional validation for specific endpoints
            if (toolName === "ovh_get_services" && Array.isArray(result)) {
                console.error(`Retrieved ${result.length} services`);
            } else if (toolName === "ovh_get_bills" && Array.isArray(result)) {
                console.error(`Retrieved ${result.length} bills`);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            console.error(`Failed to execute ${toolName}:`, error);

            let errorMessage = "Unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                // Handle OVH API specific error format
                if (error.errorCode) {
                    errorMessage = `OVH API Error ${error.errorCode}: ${error.message || 'Unknown error'}`;
                } else if (error.message) {
                    errorMessage = error.message;
                } else {
                    errorMessage = JSON.stringify(error);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Error: Failed to execute ${toolName}: ${errorMessage}`
                    }
                ]
            };
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
