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

// DNS-specific schemas
const DnsZoneSchema = z.object({
    zone: z.string().min(1).describe("DNS zone name (e.g., example.com)"),
});

const DnsRecordFilterSchema = z.object({
    zone: z.string().min(1).describe("DNS zone name (e.g., example.com)"),
    fieldType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "DKIM", "SPF", "DMARC", "LOC", "NAPTR", "PTR", "SSHFP", "TLSA"]).optional().describe("Filter by record type"),
    subDomain: z.string().optional().describe("Filter by subdomain (empty string for root)"),
});

const DnsRecordIdSchema = z.object({
    zone: z.string().min(1).describe("DNS zone name (e.g., example.com)"),
    recordId: z.number().describe("DNS record ID"),
});

const CreateDnsRecordSchema = z.object({
    zone: z.string().min(1).describe("DNS zone name (e.g., example.com)"),
    fieldType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "DKIM", "SPF", "DMARC", "LOC", "NAPTR", "PTR", "SSHFP", "TLSA"]).describe("DNS record type"),
    subDomain: z.string().default("").describe("Subdomain (empty string for root domain)"),
    target: z.string().min(1).describe("Record value (IP address, hostname, or text)"),
    ttl: z.number().default(3600).describe("Time to live in seconds (default: 3600)"),
});

const UpdateDnsRecordSchema = z.object({
    zone: z.string().min(1).describe("DNS zone name (e.g., example.com)"),
    recordId: z.number().describe("DNS record ID to update"),
    subDomain: z.string().optional().describe("New subdomain value"),
    target: z.string().optional().describe("New target value"),
    ttl: z.number().optional().describe("New TTL value in seconds"),
});

// Email-specific schemas
const EmailDomainSchema = z.object({
    domain: z.string().min(1).describe("Email domain (e.g., example.com)"),
});

const EmailAccountSchema = z.object({
    domain: z.string().min(1).describe("Email domain (e.g., example.com)"),
    accountName: z.string().min(1).describe("Email account name (without @domain)"),
});

const CreateEmailAccountSchema = z.object({
    domain: z.string().min(1).describe("Email domain (e.g., example.com)"),
    accountName: z.string().min(1).describe("Email account name (without @domain)"),
    password: z.string().min(8).describe("Password for the email account (min 8 chars)"),
    description: z.string().optional().describe("Account description"),
    size: z.number().default(5000000000).describe("Mailbox size in bytes (default: 5GB)"),
});

const UpdateEmailAccountSchema = z.object({
    domain: z.string().min(1).describe("Email domain"),
    accountName: z.string().min(1).describe("Email account name"),
    description: z.string().optional().describe("New description"),
    size: z.number().optional().describe("New mailbox size in bytes"),
});

const ChangeEmailPasswordSchema = z.object({
    domain: z.string().min(1).describe("Email domain"),
    accountName: z.string().min(1).describe("Email account name"),
    password: z.string().min(8).describe("New password (min 8 chars)"),
});

// Email redirection schemas
const EmailRedirectionSchema = z.object({
    domain: z.string().min(1).describe("Email domain (e.g., example.com)"),
    redirectionId: z.string().min(1).describe("Redirection ID"),
});

const CreateEmailRedirectionSchema = z.object({
    domain: z.string().min(1).describe("Email domain (e.g., example.com)"),
    from: z.string().min(1).describe("Source email address (local part without @domain, or full address)"),
    to: z.string().email().describe("Destination email address"),
    localCopy: z.boolean().default(false).describe("Keep a local copy of emails"),
});

class OvhMcpServer {
    server: any;
    ovhClient: any;

    constructor() {
        this.server = new Server(
            {
                name: "ovh-mcp-server",
                version: "2.1.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        this.ovhClient = null;
        this.autoInitFromEnv();
        this.setupTools();
        this.setupErrorHandling();
    }

    // Auto-initialize from environment variables if present
    autoInitFromEnv() {
        const endpoint = process.env.OVH_ENDPOINT;
        const appKey = process.env.OVH_APP_KEY;
        const appSecret = process.env.OVH_APP_SECRET;
        const consumerKey = process.env.OVH_CONSUMER_KEY;

        if (endpoint && appKey && appSecret && consumerKey) {
            try {
                if (!ovh) {
                    ovh = require('@ovhcloud/node-ovh');
                }
                this.ovhClient = ovh({
                    endpoint,
                    appKey,
                    appSecret,
                    consumerKey
                });
                console.error(`OVH client auto-initialized from environment variables (endpoint: ${endpoint})`);
            } catch (error) {
                console.error("Failed to auto-initialize OVH client from env:", error);
            }
        } else {
            console.error("OVH credentials not found in environment. Use ovh_initialize_client to initialize manually.");
        }
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
                    },
                    // DNS Tools
                    {
                        name: "ovh_get_domains",
                        description: "List all DNS zones in your OVH account",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_domain_zone",
                        description: "Get detailed information about a specific DNS zone",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                }
                            },
                            required: ["zone"]
                        }
                    },
                    {
                        name: "ovh_get_dns_records",
                        description: "List DNS records for a zone with optional filtering by type and subdomain",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                },
                                fieldType: {
                                    type: "string",
                                    description: "Filter by record type",
                                    enum: ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "DKIM", "SPF", "DMARC", "LOC", "NAPTR", "PTR", "SSHFP", "TLSA"]
                                },
                                subDomain: {
                                    type: "string",
                                    description: "Filter by subdomain (empty string for root)"
                                }
                            },
                            required: ["zone"]
                        }
                    },
                    {
                        name: "ovh_get_dns_record",
                        description: "Get details of a specific DNS record by ID",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                },
                                recordId: {
                                    type: "number",
                                    description: "DNS record ID"
                                }
                            },
                            required: ["zone", "recordId"]
                        }
                    },
                    {
                        name: "ovh_create_dns_record",
                        description: "Create a new DNS record in a zone. Remember to call ovh_refresh_dns_zone after to apply changes.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                },
                                fieldType: {
                                    type: "string",
                                    description: "DNS record type",
                                    enum: ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "DKIM", "SPF", "DMARC", "LOC", "NAPTR", "PTR", "SSHFP", "TLSA"]
                                },
                                subDomain: {
                                    type: "string",
                                    description: "Subdomain (empty string for root domain)",
                                    default: ""
                                },
                                target: {
                                    type: "string",
                                    description: "Record value (IP address, hostname, or text)"
                                },
                                ttl: {
                                    type: "number",
                                    description: "Time to live in seconds",
                                    default: 3600
                                }
                            },
                            required: ["zone", "fieldType", "target"]
                        }
                    },
                    {
                        name: "ovh_update_dns_record",
                        description: "Update an existing DNS record. Remember to call ovh_refresh_dns_zone after to apply changes.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                },
                                recordId: {
                                    type: "number",
                                    description: "DNS record ID to update"
                                },
                                subDomain: {
                                    type: "string",
                                    description: "New subdomain value"
                                },
                                target: {
                                    type: "string",
                                    description: "New target value"
                                },
                                ttl: {
                                    type: "number",
                                    description: "New TTL value in seconds"
                                }
                            },
                            required: ["zone", "recordId"]
                        }
                    },
                    {
                        name: "ovh_delete_dns_record",
                        description: "Delete a DNS record. Remember to call ovh_refresh_dns_zone after to apply changes.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                },
                                recordId: {
                                    type: "number",
                                    description: "DNS record ID to delete"
                                }
                            },
                            required: ["zone", "recordId"]
                        }
                    },
                    {
                        name: "ovh_refresh_dns_zone",
                        description: "Apply pending DNS changes to a zone. Required after create/update/delete operations.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                }
                            },
                            required: ["zone"]
                        }
                    },
                    {
                        name: "ovh_get_dns_zone_status",
                        description: "Get the current status of a DNS zone (propagation status, errors)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                }
                            },
                            required: ["zone"]
                        }
                    },
                    {
                        name: "ovh_export_dns_zone",
                        description: "Export DNS zone in BIND format (text file format)",
                        inputSchema: {
                            type: "object",
                            properties: {
                                zone: {
                                    type: "string",
                                    description: "DNS zone name (e.g., example.com)"
                                }
                            },
                            required: ["zone"]
                        }
                    },
                    // Email Tools
                    {
                        name: "ovh_get_email_domains",
                        description: "List all email domains in your OVH account",
                        inputSchema: {
                            type: "object",
                            properties: {}
                        }
                    },
                    {
                        name: "ovh_get_email_domain",
                        description: "Get detailed information about a specific email domain",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                }
                            },
                            required: ["domain"]
                        }
                    },
                    {
                        name: "ovh_get_email_accounts",
                        description: "List all email accounts for a domain",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                }
                            },
                            required: ["domain"]
                        }
                    },
                    {
                        name: "ovh_get_email_account",
                        description: "Get details of a specific email account",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                },
                                accountName: {
                                    type: "string",
                                    description: "Email account name (without @domain)"
                                }
                            },
                            required: ["domain", "accountName"]
                        }
                    },
                    {
                        name: "ovh_create_email_account",
                        description: "Create a new email account",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                },
                                accountName: {
                                    type: "string",
                                    description: "Email account name (without @domain)"
                                },
                                password: {
                                    type: "string",
                                    description: "Password for the email account (min 8 chars)"
                                },
                                description: {
                                    type: "string",
                                    description: "Account description"
                                },
                                size: {
                                    type: "number",
                                    description: "Mailbox size in bytes (default: 5GB)",
                                    default: 5000000000
                                }
                            },
                            required: ["domain", "accountName", "password"]
                        }
                    },
                    {
                        name: "ovh_update_email_account",
                        description: "Update an email account settings",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain"
                                },
                                accountName: {
                                    type: "string",
                                    description: "Email account name"
                                },
                                description: {
                                    type: "string",
                                    description: "New description"
                                },
                                size: {
                                    type: "number",
                                    description: "New mailbox size in bytes"
                                }
                            },
                            required: ["domain", "accountName"]
                        }
                    },
                    {
                        name: "ovh_change_email_password",
                        description: "Change password for an email account",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain"
                                },
                                accountName: {
                                    type: "string",
                                    description: "Email account name"
                                },
                                password: {
                                    type: "string",
                                    description: "New password (min 8 chars)"
                                }
                            },
                            required: ["domain", "accountName", "password"]
                        }
                    },
                    {
                        name: "ovh_delete_email_account",
                        description: "Delete an email account",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain"
                                },
                                accountName: {
                                    type: "string",
                                    description: "Email account name"
                                }
                            },
                            required: ["domain", "accountName"]
                        }
                    },
                    // Email Redirection Tools
                    {
                        name: "ovh_get_email_redirections",
                        description: "List all email redirections for a domain",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                }
                            },
                            required: ["domain"]
                        }
                    },
                    {
                        name: "ovh_get_email_redirection",
                        description: "Get details of a specific email redirection",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain"
                                },
                                redirectionId: {
                                    type: "string",
                                    description: "Redirection ID"
                                }
                            },
                            required: ["domain", "redirectionId"]
                        }
                    },
                    {
                        name: "ovh_create_email_redirection",
                        description: "Create a new email redirection",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain (e.g., example.com)"
                                },
                                from: {
                                    type: "string",
                                    description: "Source email (local part without @domain)"
                                },
                                to: {
                                    type: "string",
                                    description: "Destination email address"
                                },
                                localCopy: {
                                    type: "boolean",
                                    description: "Keep a local copy of emails",
                                    default: false
                                }
                            },
                            required: ["domain", "from", "to"]
                        }
                    },
                    {
                        name: "ovh_delete_email_redirection",
                        description: "Delete an email redirection",
                        inputSchema: {
                            type: "object",
                            properties: {
                                domain: {
                                    type: "string",
                                    description: "Email domain"
                                },
                                redirectionId: {
                                    type: "string",
                                    description: "Redirection ID"
                                }
                            },
                            required: ["domain", "redirectionId"]
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
                    case "ovh_get_domains":
                        return await this.handleSimpleRequest(name);
                    // DNS Tools with arguments
                    case "ovh_get_domain_zone":
                        DnsZoneSchema.parse(args);
                        return await this.getDomainZone(args);
                    case "ovh_get_dns_records":
                        DnsRecordFilterSchema.parse(args);
                        return await this.getDnsRecords(args);
                    case "ovh_get_dns_record":
                        DnsRecordIdSchema.parse(args);
                        return await this.getDnsRecord(args);
                    case "ovh_create_dns_record":
                        CreateDnsRecordSchema.parse(args);
                        return await this.createDnsRecord(args);
                    case "ovh_update_dns_record":
                        UpdateDnsRecordSchema.parse(args);
                        return await this.updateDnsRecord(args);
                    case "ovh_delete_dns_record":
                        DnsRecordIdSchema.parse(args);
                        return await this.deleteDnsRecord(args);
                    case "ovh_refresh_dns_zone":
                        DnsZoneSchema.parse(args);
                        return await this.refreshDnsZone(args);
                    case "ovh_get_dns_zone_status":
                        DnsZoneSchema.parse(args);
                        return await this.getDnsZoneStatus(args);
                    case "ovh_export_dns_zone":
                        DnsZoneSchema.parse(args);
                        return await this.exportDnsZone(args);
                    // Email Tools
                    case "ovh_get_email_domains":
                        return await this.getEmailDomains();
                    case "ovh_get_email_domain":
                        EmailDomainSchema.parse(args);
                        return await this.getEmailDomain(args);
                    case "ovh_get_email_accounts":
                        EmailDomainSchema.parse(args);
                        return await this.getEmailAccounts(args);
                    case "ovh_get_email_account":
                        EmailAccountSchema.parse(args);
                        return await this.getEmailAccount(args);
                    case "ovh_create_email_account":
                        CreateEmailAccountSchema.parse(args);
                        return await this.createEmailAccount(args);
                    case "ovh_update_email_account":
                        UpdateEmailAccountSchema.parse(args);
                        return await this.updateEmailAccount(args);
                    case "ovh_change_email_password":
                        ChangeEmailPasswordSchema.parse(args);
                        return await this.changeEmailPassword(args);
                    case "ovh_delete_email_account":
                        EmailAccountSchema.parse(args);
                        return await this.deleteEmailAccount(args);
                    // Email Redirection Tools
                    case "ovh_get_email_redirections":
                        EmailDomainSchema.parse(args);
                        return await this.getEmailRedirections(args);
                    case "ovh_get_email_redirection":
                        EmailRedirectionSchema.parse(args);
                        return await this.getEmailRedirection(args);
                    case "ovh_create_email_redirection":
                        CreateEmailRedirectionSchema.parse(args);
                        return await this.createEmailRedirection(args);
                    case "ovh_delete_email_redirection":
                        EmailRedirectionSchema.parse(args);
                        return await this.deleteEmailRedirection(args);
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
                case "ovh_get_domains":
                    path = "/domain/zone";
                    operation = "DNS zones retrieval";
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

    // DNS Methods
    async getDomainZone(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `get zone ${args.zone}`);
        }
    }

    async getDnsRecords(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            // Build query parameters
            const params: string[] = [];
            if (args.fieldType) params.push(`fieldType=${args.fieldType}`);
            if (args.subDomain !== undefined) params.push(`subDomain=${encodeURIComponent(args.subDomain)}`);

            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            const path = `/domain/zone/${args.zone}/record${queryString}`;

            // Get record IDs
            const recordIds = await this.ovhClient.requestPromised('GET', path);

            if (!Array.isArray(recordIds) || recordIds.length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ records: [], count: 0 }, null, 2)
                    }]
                };
            }

            // Fetch details for each record (limit to 50 to avoid timeout)
            const limitedIds = recordIds.slice(0, 50);
            const records = await Promise.all(
                limitedIds.map(async (id: number) => {
                    try {
                        return await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/record/${id}`);
                    } catch (e) {
                        return { id, error: 'Failed to fetch record details' };
                    }
                })
            );

            const result = {
                records,
                count: records.length,
                totalIds: recordIds.length,
                truncated: recordIds.length > 50
            };

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `list records for ${args.zone}`);
        }
    }

    async getDnsRecord(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/record/${args.recordId}`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `get record ${args.recordId} in ${args.zone}`);
        }
    }

    async createDnsRecord(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const data = {
                fieldType: args.fieldType,
                subDomain: args.subDomain || '',
                target: args.target,
                ttl: args.ttl || 3600
            };

            const result = await this.ovhClient.requestPromised('POST', `/domain/zone/${args.zone}/record`, data);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `DNS record created successfully. Remember to call ovh_refresh_dns_zone to apply changes.`,
                        record: result
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `create record in ${args.zone}`);
        }
    }

    async updateDnsRecord(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            // Build update data with only provided fields
            const data: any = {};
            if (args.subDomain !== undefined) data.subDomain = args.subDomain;
            if (args.target !== undefined) data.target = args.target;
            if (args.ttl !== undefined) data.ttl = args.ttl;

            if (Object.keys(data).length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: "Error: No fields to update. Provide at least one of: subDomain, target, ttl"
                    }]
                };
            }

            await this.ovhClient.requestPromised('PUT', `/domain/zone/${args.zone}/record/${args.recordId}`, data);

            // Fetch updated record
            const updated = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/record/${args.recordId}`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `DNS record updated successfully. Remember to call ovh_refresh_dns_zone to apply changes.`,
                        record: updated
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `update record ${args.recordId} in ${args.zone}`);
        }
    }

    async deleteDnsRecord(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            // First get record details for confirmation
            const record = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/record/${args.recordId}`);

            await this.ovhClient.requestPromised('DELETE', `/domain/zone/${args.zone}/record/${args.recordId}`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `DNS record deleted successfully. Remember to call ovh_refresh_dns_zone to apply changes.`,
                        deletedRecord: record
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `delete record ${args.recordId} in ${args.zone}`);
        }
    }

    async refreshDnsZone(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            await this.ovhClient.requestPromised('POST', `/domain/zone/${args.zone}/refresh`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `DNS zone ${args.zone} refreshed successfully. Changes are now being propagated.`
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `refresh zone ${args.zone}`);
        }
    }

    async getDnsZoneStatus(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/status`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `get status for ${args.zone}`);
        }
    }

    async exportDnsZone(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/domain/zone/${args.zone}/export`);
            return {
                content: [{
                    type: "text",
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleDnsError(error, `export zone ${args.zone}`);
        }
    }

    // Helper method for DNS error handling
    handleDnsError(error: any, operation: string) {
        console.error(`DNS operation failed (${operation}):`, error);

        let errorMessage = "Unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object') {
            if (error.errorCode) {
                errorMessage = `OVH API Error ${error.errorCode}: ${error.message || 'Unknown error'}`;
            } else if (error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = JSON.stringify(error);
            }
        }

        return {
            content: [{
                type: "text",
                text: `Error: Failed to ${operation}: ${errorMessage}`
            }]
        };
    }

    // Email Methods
    async getEmailDomains() {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', '/email/domain');
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, 'list email domains');
        }
    }

    async getEmailDomain(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `get domain ${args.domain}`);
        }
    }

    async getEmailAccounts(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const accountNames = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/account`);

            if (!Array.isArray(accountNames) || accountNames.length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ accounts: [], count: 0 }, null, 2)
                    }]
                };
            }

            // Fetch details for each account (limit to 50)
            const limitedNames = accountNames.slice(0, 50);
            const accounts = await Promise.all(
                limitedNames.map(async (name: string) => {
                    try {
                        return await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/account/${name}`);
                    } catch (e) {
                        return { accountName: name, error: 'Failed to fetch account details' };
                    }
                })
            );

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        accounts,
                        count: accounts.length,
                        total: accountNames.length,
                        truncated: accountNames.length > 50
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `list accounts for ${args.domain}`);
        }
    }

    async getEmailAccount(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/account/${args.accountName}`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `get account ${args.accountName}@${args.domain}`);
        }
    }

    async createEmailAccount(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const data: any = {
                accountName: args.accountName,
                password: args.password
            };
            if (args.description) data.description = args.description;
            if (args.size) data.size = args.size;

            const result = await this.ovhClient.requestPromised('POST', `/email/domain/${args.domain}/account`, data);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Email account ${args.accountName}@${args.domain} created successfully`,
                        result
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `create account ${args.accountName}@${args.domain}`);
        }
    }

    async updateEmailAccount(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const data: any = {};
            if (args.description !== undefined) data.description = args.description;
            if (args.size !== undefined) data.size = args.size;

            if (Object.keys(data).length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: "Error: No fields to update. Provide at least one of: description, size"
                    }]
                };
            }

            await this.ovhClient.requestPromised('PUT', `/email/domain/${args.domain}/account/${args.accountName}`, data);

            const updated = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/account/${args.accountName}`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Email account ${args.accountName}@${args.domain} updated successfully`,
                        account: updated
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `update account ${args.accountName}@${args.domain}`);
        }
    }

    async changeEmailPassword(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            await this.ovhClient.requestPromised('POST', `/email/domain/${args.domain}/account/${args.accountName}/changePassword`, {
                password: args.password
            });

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Password changed successfully for ${args.accountName}@${args.domain}`
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `change password for ${args.accountName}@${args.domain}`);
        }
    }

    async deleteEmailAccount(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            // Get account details before deletion
            const account = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/account/${args.accountName}`);

            await this.ovhClient.requestPromised('DELETE', `/email/domain/${args.domain}/account/${args.accountName}`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Email account ${args.accountName}@${args.domain} deleted successfully`,
                        deletedAccount: account
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `delete account ${args.accountName}@${args.domain}`);
        }
    }

    // Email Redirection Methods
    async getEmailRedirections(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const redirectionIds = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/redirection`);

            if (!Array.isArray(redirectionIds) || redirectionIds.length === 0) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ redirections: [], count: 0 }, null, 2)
                    }]
                };
            }

            // Fetch details for each redirection (limit to 50)
            const limitedIds = redirectionIds.slice(0, 50);
            const redirections = await Promise.all(
                limitedIds.map(async (id: string) => {
                    try {
                        return await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/redirection/${id}`);
                    } catch (e) {
                        return { id, error: 'Failed to fetch redirection details' };
                    }
                })
            );

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        redirections,
                        count: redirections.length,
                        total: redirectionIds.length,
                        truncated: redirectionIds.length > 50
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `list redirections for ${args.domain}`);
        }
    }

    async getEmailRedirection(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const result = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/redirection/${args.redirectionId}`);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `get redirection ${args.redirectionId}`);
        }
    }

    async createEmailRedirection(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            const data = {
                from: args.from.includes('@') ? args.from : `${args.from}@${args.domain}`,
                to: args.to,
                localCopy: args.localCopy || false
            };

            const result = await this.ovhClient.requestPromised('POST', `/email/domain/${args.domain}/redirection`, data);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Email redirection created: ${data.from} → ${data.to}`,
                        result
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `create redirection from ${args.from}`);
        }
    }

    async deleteEmailRedirection(args: any) {
        if (!this.ovhClient) {
            throw new Error("OVH client not initialized. Please call ovh_initialize_client first.");
        }

        try {
            // Get redirection details before deletion
            const redirection = await this.ovhClient.requestPromised('GET', `/email/domain/${args.domain}/redirection/${args.redirectionId}`);

            await this.ovhClient.requestPromised('DELETE', `/email/domain/${args.domain}/redirection/${args.redirectionId}`);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: `Email redirection deleted successfully`,
                        deletedRedirection: redirection
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return this.handleEmailError(error, `delete redirection ${args.redirectionId}`);
        }
    }

    // Helper method for Email error handling
    handleEmailError(error: any, operation: string) {
        console.error(`Email operation failed (${operation}):`, error);

        let errorMessage = "Unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object') {
            if (error.errorCode) {
                errorMessage = `OVH API Error ${error.errorCode}: ${error.message || 'Unknown error'}`;
            } else if (error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = JSON.stringify(error);
            }
        }

        return {
            content: [{
                type: "text",
                text: `Error: Failed to ${operation}: ${errorMessage}`
            }]
        };
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
    MakeRequestSchema,
    // DNS Schemas
    DnsZoneSchema,
    DnsRecordFilterSchema,
    DnsRecordIdSchema,
    CreateDnsRecordSchema,
    UpdateDnsRecordSchema,
    // Email Schemas
    EmailDomainSchema,
    EmailAccountSchema,
    CreateEmailAccountSchema,
    UpdateEmailAccountSchema,
    ChangeEmailPasswordSchema,
    EmailRedirectionSchema,
    CreateEmailRedirectionSchema
};

// Start server if run directly
if (require.main === module) {
    server.start().catch(console.error);
}
