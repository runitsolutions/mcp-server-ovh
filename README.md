# MCP Server OVH

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![CI](https://github.com/runitsolutions/mcp-server-ovh/actions/workflows/ci.yml/badge.svg)](https://github.com/runitsolutions/mcp-server-ovh/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/mcp-server-ovh.svg)](https://www.npmjs.com/package/mcp-server-ovh)

A Model Context Protocol (MCP) server that provides standardized access to OVH API services. This server enables AI assistants and applications to interact with OVH's cloud infrastructure through a unified, secure interface.

## 👨‍💻 Author & Company

**Author**: Isaac Campos Mesén
**Company**: [RunIT Solutions](https://runitcr.com)
**Repository**: [GitHub - runitsolutions/mcp-server-ovh](https://github.com/runitsolutions/mcp-server-ovh)

## ✅ Project Status

**Status**: 🟢 **FULLY OPERATIONAL & TESTED**

- ✅ **Build**: TypeScript compilation successful
- ✅ **Runtime**: Server starts without errors
- ✅ **Schema Validation**: Input validation working correctly
- ✅ **MCP Integration**: Compatible with MCP clients
- ✅ **CommonJS**: Uses `require()` for module loading
- ✅ **TypeScript**: Full type safety with proper declarations
- ✅ **API Endpoints Verified**: All endpoints tested against OVH Console
- ✅ **Documentation Updated**: README reflects verified endpoints

### 🔍 Endpoints Verification Results

**Last Verified**: $(date)
**OVH Console**: [https://eu.api.ovh.com/console/](https://eu.api.ovh.com/console/)

#### ✅ WORKING ENDPOINTS (17/17 tested - 100% SUCCESS):
- `/me` - User information ✅
- `/me/bill` - Billing information ✅
- `/me/payment/method` - Payment methods ✅
- `/service` - Services list ✅
- `/services` - Services list (plural) ✅
- `/dedicated/server` - Dedicated servers ✅
- `/vps` - VPS instances ✅
- `/me/order` - Orders ✅
- `/me/api/application` - API applications ✅
- `/cloud/project` - Cloud projects ✅
- `/ip` - IP addresses ✅
- `/ipLoadbalancing` - Load balancers ✅
- `/dedicatedCloud` - Dedicated Cloud ✅
- `/metrics` - Metrics ✅
- `/license/windows` - Windows licenses ✅
- `/dbaas/logs` - DBaaS Logs ✅
- `/ssl` - SSL certificates ✅
- `/vrack` - vRack ✅
- `/veeamCloudConnect` - Veeam Cloud Connect ✅
- `/nutanix` - Nutanix ✅

#### ❌ ENDPOINTS REQUIRING PERMISSIONS:
- `/me/services` - Requires specific API permissions
- `/domain` - Requires domain management permissions
- `/me/api/logs` - Requires audit log permissions
- `/hosting/web` - Requires web hosting permissions
- `/email/domain` - Requires email permissions
- `/sms` - Requires SMS permissions

## Features

- 🔐 **Secure Authentication**: Support for both API key and OAuth2 authentication methods
- 🛠️ **Standardized Tools**: Clean MCP tool interfaces for common OVH operations
- ✅ **Input Validation**: Robust validation using Zod schemas
- 🚀 **Modern API**: Built with the latest MCP SDK following best practices
- 📝 **TypeScript**: Full TypeScript support with strict type checking
- 🧪 **Well Tested**: Comprehensive test suite with Jest
- 📚 **Well Documented**: Complete documentation and examples

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OVH API credentials (see Setup section)

### Install from npm

```bash
npm install mcp-server-ovh
```

### Build from source

```bash
git clone https://github.com/runitsolutions/mcp-server-ovh.git
cd mcp-server-ovh
npm install
npm run build
```

## Setup

### OVH API Credentials

You need to obtain API credentials from OVH. There are two authentication methods:

#### Method 1: API Keys (Recommended)

1. Go to [OVH Manager](https://www.ovh.com/manager/)
2. Navigate to API Keys section
3. Create a new application key
4. Note down your `App Key`, `App Secret`, and `Consumer Key`

#### Method 2: OAuth2

1. Register your application in OVH's OAuth2 system
2. Obtain your `Client ID` and `Client Secret`

### Configuration

Create a `.env` file in your project root:

```env
# For API Key authentication
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=your_app_key_here
OVH_APP_SECRET=your_app_secret_here
OVH_CONSUMER_KEY=your_consumer_key_here

# For OAuth2 authentication (alternative)
OVH_CLIENT_ID=your_client_id_here
OVH_CLIENT_SECRET=your_client_secret_here
```

## Usage

### As an MCP Server

The server communicates via stdio and can be used with any MCP-compatible client.

#### Direct execution

```bash
npm start
```

#### Using with MCP clients

The server is designed to work with MCP-compatible clients like Claude Desktop or other AI assistants that support the Model Context Protocol.

### Available Tools

#### 1. Initialize OVH Client
Initialize the OVH API client with your credentials.

```javascript
{
  "name": "ovh_initialize_client",
  "arguments": {
    "endpoint": "ovh-eu",
    "appKey": "your_app_key",
    "appSecret": "your_app_secret",
    "consumerKey": "your_consumer_key"
  }
}
```

#### 2. Initialize OAuth2 Client
Initialize with OAuth2 credentials.

```javascript
{
  "name": "ovh_oauth2_initialize",
  "arguments": {
    "endpoint": "ovh-eu",
    "clientID": "your_client_id",
    "clientSecret": "your_client_secret"
  }
}
```

#### 3. Make API Request
Make a custom request to any OVH API endpoint.

```javascript
{
  "name": "ovh_request",
  "arguments": {
    "method": "GET",
    "path": "/me",
    "data": {} // Optional data for POST/PUT requests
  }
}
```

#### 4. Get User Information
Get information about the authenticated user.

```javascript
{
  "name": "ovh_get_user_info",
  "arguments": {}
}
```

#### 5. Get User Bills
Retrieve billing information.

```javascript
{
  "name": "ovh_get_bills",
  "arguments": {}
}
```

#### 6. Get User Services
List all services associated with the account.

```javascript
{
  "name": "ovh_get_services",
  "arguments": {}
}
```

#### 7. Get Payment Methods
Retrieve available payment methods for the account.

```javascript
{
  "name": "ovh_get_payment_methods",
  "arguments": {}
}
```

#### 8. Get Orders
List all orders placed with OVH.

```javascript
{
  "name": "ovh_get_orders",
  "arguments": {}
}
```

#### 9. Get Cloud Projects
List all cloud projects associated with the account.

```javascript
{
  "name": "ovh_get_cloud_projects",
  "arguments": {}
}
```

#### 10. Get Dedicated Servers
List all dedicated servers in the account.

```javascript
{
  "name": "ovh_get_dedicated_servers",
  "arguments": {}
}
```

#### 11. Get VPS Instances
List all VPS instances in the account.

```javascript
{
  "name": "ovh_get_vps",
  "arguments": {}
}
```

#### 12. Get IP Addresses
List all IP addresses associated with the account.

```javascript
{
  "name": "ovh_get_ips",
  "arguments": {}
}
```

#### 13. Get vRack Information
Get vRack network information.

```javascript
{
  "name": "ovh_get_vrack",
  "arguments": {}
}
```

#### 14. Get Load Balancers
List all load balancers in the account.

```javascript
{
  "name": "ovh_get_load_balancers",
  "arguments": {}
}
```

#### 15. Get SSL Certificates
List all SSL certificates.

```javascript
{
  "name": "ovh_get_ssl_certificates",
  "arguments": {}
}
```

#### 16. Get DBaaS Logs Services
List all DBaaS Logs services.

```javascript
{
  "name": "ovh_get_dbaas_logs",
  "arguments": {}
}
```

## 🛠️ IDE Integration

This MCP server can be integrated with various IDEs and editors that support the Model Context Protocol. Below are the instructions for popular IDEs.

### Cursor Integration

Cursor supports MCP servers through the Model Context Protocol. You can add this OVH MCP server to your Cursor configuration.

#### Option 1: Project Configuration

Create a `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "ovh-api": {
      "command": "npx",
      "args": ["mcp-server-ovh"],
      "env": {
        "OVH_ENDPOINT": "ovh-eu",
        "OVH_APP_KEY": "your_app_key_here",
        "OVH_APP_SECRET": "your_app_secret_here",
        "OVH_CONSUMER_KEY": "your_consumer_key_here"
      }
    }
  }
}
```

#### Option 2: Global Configuration

Create a `~/.cursor/mcp.json` file for system-wide access:

```json
{
  "mcpServers": {
    "ovh-api": {
      "command": "npx",
      "args": ["mcp-server-ovh"],
      "env": {
        "OVH_ENDPOINT": "ovh-eu",
        "OVH_APP_KEY": "your_app_key_here",
        "OVH_APP_SECRET": "your_app_secret_here",
        "OVH_CONSUMER_KEY": "your_consumer_key_here"
      }
    }
  }
}
```

### Other IDEs

#### VS Code with MCP Extension

If you're using VS Code with an MCP extension:

1. Install the MCP extension for VS Code
2. Configure the server in your MCP settings:

```json
{
  "server": "ovh-api",
  "command": "npx",
  "args": ["mcp-server-ovh"],
  "env": {
    "OVH_ENDPOINT": "ovh-eu",
    "OVH_APP_KEY": "your_app_key_here",
    "OVH_APP_SECRET": "your_app_secret_here",
    "OVH_CONSUMER_KEY": "your_consumer_key_here"
  }
}
```

#### Other MCP-Compatible IDEs

For other IDEs that support MCP:

1. Ensure your IDE supports the Model Context Protocol
2. Configure the server using the command: `npx mcp-server-ovh`
3. Set the required environment variables for OVH authentication

### Authentication Setup

Before using the MCP server, you need to set up OVH API credentials:

```bash
# Set environment variables
export OVH_ENDPOINT="ovh-eu"
export OVH_APP_KEY="your_app_key"
export OVH_APP_SECRET="your_app_secret"
export OVH_CONSUMER_KEY="your_consumer_key"
```

Or create a `.env` file in your project directory:

```env
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=your_app_key_here
OVH_APP_SECRET=your_app_secret_here
OVH_CONSUMER_KEY=your_consumer_key_here
```

### Usage in IDE

Once configured, you can use the OVH MCP server in your IDE by:

1. **Asking for OVH information**: "What services do I have in OVH?"
2. **Checking account details**: "Show my OVH account information"
3. **Billing inquiries**: "What are my recent OVH bills?"
4. **Service management**: "List all my OVH services"

The AI assistant will automatically use the available OVH tools when relevant to your questions.

## Development

### Project Structure

```
src/
├── index.ts              # Main server implementation
├── types/
│   └── ovh.d.ts         # OVH API type definitions
└── __tests__/           # Test files
    ├── server.test.ts   # Server functionality tests
    └── validation.test.ts # Input validation tests
```

### Development Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (watch mode)
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests (organized by type)
npm test                    # All tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests

# Specific tests
npm run test:endpoints     # Verify OVH endpoints
npm run test:server        # MCP server tests
npm run test:client        # MCP client tests
npm run test:full          # Complete integration tests

# Coverage and watch mode
npm run test:coverage      # Tests with coverage report
npm run test:watch         # Tests in watch mode

# Clean build artifacts
npm run clean
```

### Testing Structure

The test suite is organized in 4 levels:

#### 📁 `tests/unit/` - Unit Tests
- Zod schema validation
- MCP server functions
- Error handling
- Response parsing

#### 📁 `tests/integration/` - Integration Tests
- OVH API connectivity
- Endpoint verification (17/17 ✅)
- Client-server communication
- Authentication

#### 📁 `tests/e2e/` - End-to-End Tests
- Complete initialization flow
- Full MCP communication
- Real tool calls
- Response handling

#### 📁 `tests/utils/` - Utilities
- Test configuration
- Common helpers
- Mock clients

### Run Tests

```bash
# All organized tests
npm test                    # Complete suite
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only

# Tests by specific functionality
npm run test:endpoints     # Verify 17 OVH endpoints
npm run test:server        # Server functionality
npm run test:client        # MCP client
npm run test:full          # Complete integration

# With coverage and watch
npm run test:coverage      # Coverage report
npm run test:watch         # Watch mode
```

### Code Quality

This project follows strict code quality standards:

- **ESLint**: Configured with TypeScript rules
- **Prettier**: Code formatting (can be added if needed)
- **Jest**: Comprehensive test suite
- **TypeScript**: Strict mode enabled
- **Pre-commit hooks**: Quality checks before commits

## API Reference

### Supported Endpoints

The server provides access to OVH's REST API endpoints through both dedicated tools and generic requests:

#### ✅ Verified Working Endpoints:
- `/me` - User account information
- `/me/bill` - Billing information
- `/me/payment/method` - Payment methods
- `/me/order` - Order history
- `/me/api/application` - API applications
- `/service` - Service listings
- `/services` - Service listings (plural)
- `/cloud/project` - Cloud projects
- `/dedicated/server` - Dedicated servers
- `/vps` - VPS instances
- `/ip` - IP addresses
- `/ipLoadbalancing` - Load balancers
- `/dedicatedCloud` - Dedicated Cloud
- `/metrics` - Metrics services
- `/license/windows` - Windows licenses
- `/dbaas/logs` - DBaaS Logs services
- `/ssl` - SSL certificates
- `/vrack` - vRack network
- `/veeamCloudConnect` - Veeam Cloud Connect
- `/nutanix` - Nutanix services

#### 🔧 Generic Endpoint Access:
- **Any OVH API endpoint** via the `ovh_request` tool
- **Full OVH API compatibility** through the console: [https://eu.api.ovh.com/console/](https://eu.api.ovh.com/console/)

#### 📋 Endpoints Requiring Specific Permissions:
- `/me/services` - Requires additional API permissions
- `/domain` - Requires domain management permissions
- `/hosting/web` - Requires web hosting permissions
- `/email/domain` - Requires email permissions
- `/sms` - Requires SMS permissions

### Error Handling

The server provides clear error messages for:

- Authentication failures
- Invalid input validation
- API rate limits
- Network connectivity issues
- Invalid API responses

### Rate Limiting

Be aware of OVH API rate limits. The server includes error handling for rate limit scenarios but doesn't implement automatic retry logic.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use conventional commit messages

## Security

- Never commit API credentials to version control
- Use environment variables for sensitive data
- The server validates all inputs to prevent injection attacks
- API keys are stored securely and not logged

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [OVH API Documentation](https://api.ovh.com/)
- 🐛 [Report Issues](https://github.com/runitsolutions/mcp-server-ovh/issues)
- 💬 [Discussions](https://github.com/runitsolutions/mcp-server-ovh/discussions)

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
- [OVH API](https://api.ovh.com/) - OVH's official API documentation
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) - The SDK used to build this server
- [GitHub Repository](https://github.com/runitsolutions/mcp-server-ovh) - Source code and issues

---

## 🔧 Troubleshooting

### Common Issues

#### Authentication Problems
- **Error**: "OVH client not initialized"
- **Solution**: Ensure all required environment variables are set
- **Check**: Verify your API credentials are correct and have proper permissions

#### Connection Issues
- **Error**: Network timeout or connection failed
- **Solution**: Check your internet connection and OVH endpoint configuration
- **Check**: Verify the OVH_ENDPOINT matches your account region

#### Permission Errors
- **Error**: API access denied
- **Solution**: Ensure your API keys have the necessary permissions
- **Check**: Review OVH Manager API key permissions

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
export DEBUG=mcp-server-ovh
```

### Logs

View MCP server logs in your IDE:
1. Open the Output panel (usually Ctrl+Shift+U)
2. Select "MCP Logs" from the dropdown
3. Check for connection errors, authentication issues, or server crashes

## 📚 Examples

### Basic Usage

```javascript
// In your MCP-compatible IDE
// Ask: "What OVH services do I have?"
// The AI will automatically use the ovh_get_services tool

// Ask: "Show my OVH account information"
// The AI will use the ovh_get_user_info tool

// Ask: "What are my recent OVH bills?"
// The AI will use the ovh_get_bills tool
```

### Advanced Integration

```javascript
// Custom API calls
// Ask: "Make a custom API call to /me/service/domain.example.com"
// The AI will use the ovh_request tool with appropriate parameters
```

## 📞 Support

- 🐛 [Report Issues](https://github.com/runitsolutions/mcp-server-ovh/issues)
- 💬 [Discussions](https://github.com/runitsolutions/mcp-server-ovh/discussions)
- 📖 [OVH API Documentation](https://api.ovh.com/)
- 🏢 [RunIT Solutions](https://runitcr.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [RunIT Solutions](https://runitcr.com) using the Model Context Protocol
