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

**Status**: 🟢 **FULLY OPERATIONAL**

- ✅ **Build**: TypeScript compilation successful
- ✅ **Runtime**: Server starts without errors
- ✅ **Schema Validation**: Input validation working correctly
- ✅ **MCP Integration**: Compatible with MCP clients
- ✅ **CommonJS**: Uses `require()` for module loading
- ✅ **TypeScript**: Full type safety with proper declarations

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
git clone https://github.com/yourusername/mcp-server-ovh.git
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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Clean build artifacts
npm run clean
```

### Testing

The project includes comprehensive tests covering:

- Input validation schemas
- Server initialization
- Tool registration
- Error handling
- API interactions (mocked)

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- server.test.ts
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

The server provides access to OVH's REST API endpoints:

- `/me` - User account information
- `/me/bill` - Billing information
- `/me/service` - Service listings
- And any other OVH API endpoint via the generic `ovh_request` tool

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

Built with ❤️ by [RunIT Solutions](https://runitcr.com) using the Model Context Protocol
