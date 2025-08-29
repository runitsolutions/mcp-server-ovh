# MCP OVH Server - Test Suite

This folder contains the complete test suite for the OVH MCP server, organized in a structured and standardized manner.

## 📁 Test Structure

```
tests/
├── unit/           # Unit tests
│   ├── server.test.js     # Main server tests
│   └── validation.test.js # Input validation tests
├── integration/    # Integration tests
│   ├── endpoints.test.js  # API endpoints tests
│   └── client.test.js     # MCP client tests
├── e2e/            # End-to-end tests
│   └── full-integration.test.js # Complete flow tests
└── utils/          # Testing utilities
    ├── test-config.js     # Test configuration
    ├── test-helpers.js    # Common helpers
    └── README.md          # Utilities documentation
```

## 🧪 Test Types

### Unit Tests (`tests/unit/`)
Tests that verify individual components in isolation:
- Zod schema validation
- MCP server functions
- Error handling
- Response parsing

### Integration Tests (`tests/integration/`)
Tests that verify interaction between components:
- OVH API connectivity
- Endpoint verification
- Client-server communication
- Authentication

### End-to-End Tests (`tests/e2e/`)
Tests that verify the complete application flow:
- Server initialization
- Complete MCP communication
- Real tool calls
- Response handling

## 🛠️ Testing Utilities

### `test-config.js`
Centralized test configuration:
- Test credentials (secure)
- Endpoint configuration
- Mock/real client creation

### `test-helpers.js`
Common functions for tests:
- Test server start/stop
- JSON-RPC request sending
- Response validation
- Wait utilities

## 🚀 Running Tests

### All tests:
```bash
npm test
```

### Specific test types:
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Individual tests:
```bash
# Specific test
npm test -- tests/unit/server.test.js

# With watch mode
npm run test:watch
```

## 📝 Conventions

### File naming:
- `*.test.js` - Main tests
- `*.spec.js` - Specification tests
- `*.integration.js` - Integration tests

### Test structure:
```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Feature', () => {
    it('should do something', () => {
      // Test
    });
  });
});
```

## 🔒 Test Security

### Credentials:
- ✅ **NEVER** include real credentials
- ✅ Use environment variables
- ✅ Implement test value fallbacks
- ✅ Use mock clients when possible

### Sensitive files:
- ✅ `.env` is in `.gitignore`
- ✅ Test credentials are secure
- ✅ Never commit files with real data

## 📊 Test Coverage

Tests cover:
- ✅ **API Endpoints**: 17/17 verified
- ✅ **MCP Tools**: 16 tools available
- ✅ **Authentication**: API Key and OAuth2
- ✅ **Validation**: Zod schemas
- ✅ **Errors**: Complete error handling
- ✅ **Security**: No credential leaks

## 🔄 CI/CD Integration

Tests run automatically on:
- ✅ **Push** to main branch
- ✅ **Pull Requests**
- ✅ **Releases**

### CI Workflow:
1. **Linting** - ESLint
2. **TypeScript** - Compilation
3. **Unit Tests** - Jest
4. **Integration Tests** - With API mock
5. **E2E Tests** - With real server (optional)

## 📈 Quality Metrics

- **Coverage**: >80% code coverage
- **Performance**: Tests complete in <30s
- **Reliability**: Tests pass consistently
- **Maintainability**: Clean and documented test code
