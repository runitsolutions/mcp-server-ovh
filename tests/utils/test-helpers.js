/**
 * Test helper utilities for MCP OVH Server
 * Common functions used across different test files
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Start MCP server process for testing
 * @param {Object} options - Server options
 * @returns {Promise<Object>} Server process and utilities
 */
async function startTestServer(options = {}) {
  const serverPath = path.join(__dirname, '../../dist/index.js');
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    OVH_ENDPOINT: options.endpoint || 'ovh-us',
    OVH_APP_KEY: options.appKey || 'test-app-key',
    OVH_APP_SECRET: options.appSecret || 'test-app-secret',
    OVH_CONSUMER_KEY: options.consumerKey || 'test-consumer-key',
    ...options.env
  };

  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [serverPath], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '../..')
    });

    let isReady = false;
    const output = [];
    const errors = [];

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output.push(text);
      console.log('[SERVER]', text.trim());

      if (text.includes('OVH MCP Server started') && !isReady) {
        isReady = true;
        resolve({
          process: serverProcess,
          output,
          errors,
          stop: () => serverProcess.kill('SIGTERM')
        });
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errors.push(text);
      console.error('[SERVER ERROR]', text.trim());
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!isReady) {
        serverProcess.kill('SIGTERM');
        reject(new Error('Server failed to start within timeout'));
      }
    }, 10000);
  });
}

/**
 * Send JSON-RPC request to MCP server
 * @param {Object} server - Server instance
 * @param {Object} request - JSON-RPC request object
 * @returns {Promise<Object>} Response from server
 */
async function sendJsonRpcRequest(server, request) {
  return new Promise((resolve, reject) => {
    const requestJson = JSON.stringify(request) + '\n';

    server.process.stdin.write(requestJson);

    let responseData = '';
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);

    const responseHandler = (data) => {
      responseData += data.toString();

      try {
        const response = JSON.parse(responseData.trim());
        clearTimeout(timeout);
        server.process.stdout.removeListener('data', responseHandler);
        resolve(response);
      } catch (e) {
        // Response not complete yet, continue listening
      }
    };

    server.process.stdout.on('data', responseHandler);
  });
}

/**
 * Wait for a specific condition
 * @param {Function} condition - Function that returns true when condition is met
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise}
 */
function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition not met within timeout'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };

    checkCondition();
  });
}

/**
 * Create a standard JSON-RPC request
 * @param {string} method - RPC method
 * @param {Object} params - Method parameters
 * @param {number} id - Request ID
 * @returns {Object} JSON-RPC request object
 */
function createJsonRpcRequest(method, params, id = 1) {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
}

/**
 * Create a tool call request
 * @param {string} toolName - Name of the tool to call
 * @param {Object} args - Tool arguments
 * @param {number} id - Request ID
 * @returns {Object} JSON-RPC tool call request
 */
function createToolCallRequest(toolName, args, id = 1) {
  return createJsonRpcRequest('tools/call', {
    name: toolName,
    arguments: args
  }, id);
}

/**
 * Validate JSON-RPC response
 * @param {Object} response - Response object
 * @param {number} expectedId - Expected request ID
 * @returns {boolean} True if response is valid
 */
function isValidJsonRpcResponse(response, expectedId) {
  return response &&
         response.jsonrpc === '2.0' &&
         response.id === expectedId &&
         (response.result || response.error);
}

/**
 * Extract result from JSON-RPC response
 * @param {Object} response - Response object
 * @returns {*} Response result
 */
function extractResult(response) {
  if (response.error) {
    throw new Error(`RPC Error: ${response.error.message}`);
  }
  return response.result;
}

module.exports = {
  startTestServer,
  sendJsonRpcRequest,
  waitFor,
  createJsonRpcRequest,
  createToolCallRequest,
  isValidJsonRpcResponse,
  extractResult
};
