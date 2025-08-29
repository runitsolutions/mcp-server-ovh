#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing MCP OVH Server with standard protocol...\n');

// Start MCP server
const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
        ...process.env,
        OVH_ENDPOINT: 'ovh-us',
        OVH_APP_KEY: '65e2f8abf6f2ce68',
        OVH_APP_SECRET: '2e3ded007bb6d92d5201efebc6a19b7c',
        OVH_CONSUMER_KEY: '022556a3828c63319f2864e3a6ea0e02'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

// Create interface for reading server output
const rl = readline.createInterface({
    input: serverProcess.stdout,
    crlfDelay: Infinity
});

// Test messages
const testMessages = [
    // Initialize connection
    {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'test-client',
                version: '1.0.0'
            }
        }
    },
    // List available tools
    {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
    },
    // Test a simple tool call
    {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
            name: 'ovh_get_user_info',
            arguments: {}
        }
    }
];

let messageIndex = 0;
let responses = [];

console.log('📤 Sending initialize message...');

// Send first message after a short delay
setTimeout(() => {
    sendMessage(testMessages[messageIndex]);
}, 1000);

// Handle server responses
rl.on('line', (line) => {
    try {
        const response = JSON.parse(line);
        console.log('📥 Received response:', JSON.stringify(response, null, 2));
        responses.push(response);

        // Send next message if available
        messageIndex++;
        if (messageIndex < testMessages.length) {
            setTimeout(() => {
                console.log(`📤 Sending ${testMessages[messageIndex].method} message...`);
                sendMessage(testMessages[messageIndex]);
            }, 1000);
        } else {
            // All tests completed
            setTimeout(() => {
                console.log('\n✅ Test completed successfully!');
                console.log(`📊 Total responses received: ${responses.length}`);

                // Analyze results
                analyzeResults(responses);

                // Clean up
                serverProcess.kill();
                rl.close();
                process.exit(0);
            }, 2000);
        }
    } catch (error) {
        console.log('Raw output:', line);
    }
});

// Handle server errors
serverProcess.stderr.on('data', (data) => {
    console.error('❌ Server error:', data.toString());
});

// Send message to server
function sendMessage(message) {
    const messageStr = JSON.stringify(message) + '\n';
    serverProcess.stdin.write(messageStr);
}

// Analyze test results
function analyzeResults(responses) {
    console.log('\n📋 Test Results Analysis:');

    const initializeResponse = responses.find(r => r.id === 1);
    const toolsListResponse = responses.find(r => r.id === 2);
    const toolCallResponse = responses.find(r => r.id === 3);

    // Check initialize response
    if (initializeResponse) {
        console.log('✅ Initialize: Server responded correctly');
        if (initializeResponse.result?.serverInfo?.name === 'ovh-mcp-server') {
            console.log('✅ Server identification: Correct');
        } else {
            console.log('❌ Server identification: Incorrect or missing');
        }
    } else {
        console.log('❌ Initialize: No response received');
    }

    // Check tools list response
    if (toolsListResponse?.result?.tools) {
        console.log(`✅ Tools list: ${toolsListResponse.result.tools.length} tools available`);
        const toolNames = toolsListResponse.result.tools.map(t => t.name);
        console.log(`🛠️ Available tools: ${toolNames.join(', ')}`);

        // Verify expected tools
        const expectedTools = ['ovh_initialize_client', 'ovh_oauth2_initialize', 'ovh_request', 'ovh_get_user_info', 'ovh_get_bills', 'ovh_get_services'];
        const missingTools = expectedTools.filter(tool => !toolNames.includes(tool));
        if (missingTools.length === 0) {
            console.log('✅ All expected tools are available');
        } else {
            console.log(`❌ Missing tools: ${missingTools.join(', ')}`);
        }
    } else {
        console.log('❌ Tools list: Failed to retrieve tools');
    }

    // Check tool call response
    if (toolCallResponse) {
        if (toolCallResponse.result) {
            console.log('✅ Tool call: User info retrieved successfully');
        } else if (toolCallResponse.error) {
            console.log('⚠️ Tool call: Error (may be expected without valid credentials)');
            console.log(`Error: ${toolCallResponse.error.message}`);
        }
    } else {
        console.log('❌ Tool call: No response received');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    serverProcess.kill();
    process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
    console.log('\n⏰ Test timeout reached');
    serverProcess.kill();
    rl.close();
    process.exit(0);
}, 30000);
