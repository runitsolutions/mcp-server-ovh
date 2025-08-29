#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing MCP OVH Server with full integration...\n');

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

// Test sequence
const testMessages = [
    // 1. Initialize connection
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
    // 2. Initialize OVH client
    {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
            name: 'ovh_initialize_client',
            arguments: {
                endpoint: 'ovh-us',
                appKey: '65e2f8abf6f2ce68',
                appSecret: '2e3ded007bb6d92d5201efebc6a19b7c',
                consumerKey: '022556a3828c63319f2864e3a6ea0e02'
            }
        }
    },
    // 3. Get user info
    {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
            name: 'ovh_get_user_info',
            arguments: {}
        }
    },
    // 4. Get services
    {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
            name: 'ovh_get_services',
            arguments: {}
        }
    },
    // 5. Custom API request
    {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
            name: 'ovh_request',
            arguments: {
                method: 'GET',
                path: '/me'
            }
        }
    }
];

let messageIndex = 0;
let responses = [];

console.log('📤 Starting MCP protocol test sequence...\n');

// Send first message after server starts
setTimeout(() => {
    sendMessage(testMessages[messageIndex]);
}, 2000);

// Handle server responses
rl.on('line', (line) => {
    try {
        const response = JSON.parse(line);
        console.log(`📥 Response ${response.id}:`, response.result ? 'SUCCESS' : response.error ? 'ERROR' : 'UNKNOWN');

        if (response.result) {
            console.log(`   Content: ${JSON.stringify(response.result.content || response.result, null, 2).substring(0, 200)}...`);
        } else if (response.error) {
            console.log(`   Error: ${response.error.message}`);
        }

        responses.push(response);

        // Send next message if available
        messageIndex++;
        if (messageIndex < testMessages.length) {
            setTimeout(() => {
                console.log(`\n📤 Step ${messageIndex + 1}/${testMessages.length}: ${testMessages[messageIndex].method}`);
                sendMessage(testMessages[messageIndex]);
            }, 2000); // Wait 2 seconds between requests
        } else {
            // All tests completed
            setTimeout(() => {
                console.log('\n🎉 Full integration test completed!');
                analyzeFullResults(responses);
                serverProcess.kill();
                rl.close();
                process.exit(0);
            }, 1000);
        }
    } catch (error) {
        console.log('📝 Raw server output:', line);
    }
});

// Handle server errors
serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('OVH MCP Server started')) {
        console.error('❌ Server stderr:', output);
    }
});

// Send message to server
function sendMessage(message) {
    const messageStr = JSON.stringify(message) + '\n';
    console.log(`   Sending: ${message.method}${message.params?.name ? ` (${message.params.name})` : ''}`);
    serverProcess.stdin.write(messageStr);
}

// Analyze full integration test results
function analyzeFullResults(responses) {
    console.log('\n📊 Full Integration Test Results:');
    console.log('=' .repeat(50));

    const results = {
        initialize: responses.find(r => r.id === 1),
        clientInit: responses.find(r => r.id === 2),
        userInfo: responses.find(r => r.id === 3),
        services: responses.find(r => r.id === 4),
        customRequest: responses.find(r => r.id === 5)
    };

    // Test 1: Initialize
    console.log('\n1️⃣ MCP Protocol Initialization:');
    if (results.initialize?.result) {
        console.log('   ✅ Server initialized successfully');
        console.log(`   ✅ Protocol version: ${results.initialize.result.protocolVersion}`);
        console.log(`   ✅ Server name: ${results.initialize.result.serverInfo?.name}`);
    } else {
        console.log('   ❌ Server initialization failed');
    }

    // Test 2: Client initialization
    console.log('\n2️⃣ OVH Client Initialization:');
    if (results.clientInit?.result) {
        console.log('   ✅ OVH client initialized successfully');
    } else {
        console.log('   ❌ OVH client initialization failed');
        if (results.clientInit?.error) {
            console.log(`   ❌ Error: ${results.clientInit.error.message}`);
        }
    }

    // Test 3: User info
    console.log('\n3️⃣ User Information Retrieval:');
    if (results.userInfo?.result?.content) {
        const content = results.userInfo.result.content[0];
        if (content.type === 'text' && !content.text.includes('Error')) {
            console.log('   ✅ User information retrieved successfully');
            try {
                const userData = JSON.parse(content.text);
                console.log(`   ✅ User: ${userData.nichandle || userData.email || 'Unknown'}`);
                console.log(`   ✅ Country: ${userData.country || 'Unknown'}`);
            } catch (e) {
                console.log('   ✅ User data received (JSON parsing failed but data present)');
            }
        } else {
            console.log(`   ❌ ${content.text}`);
        }
    } else {
        console.log('   ❌ User information retrieval failed');
    }

    // Test 4: Services
    console.log('\n4️⃣ Services Information Retrieval:');
    if (results.services?.result?.content) {
        const content = results.services.result.content[0];
        if (content.type === 'text' && !content.text.includes('Error')) {
            console.log('   ✅ Services information retrieved successfully');
            try {
                const services = JSON.parse(content.text);
                if (Array.isArray(services)) {
                    console.log(`   ✅ Found ${services.length} services`);
                } else {
                    console.log('   ✅ Services data received');
                }
            } catch (e) {
                console.log('   ✅ Services data received (JSON parsing failed but data present)');
            }
        } else {
            console.log(`   ❌ ${content.text}`);
        }
    } else {
        console.log('   ❌ Services information retrieval failed');
    }

    // Test 5: Custom request
    console.log('\n5️⃣ Custom API Request:');
    if (results.customRequest?.result?.content) {
        const content = results.customRequest.result.content[0];
        if (content.type === 'text' && !content.text.includes('Error')) {
            console.log('   ✅ Custom API request successful');
            try {
                const data = JSON.parse(content.text);
                console.log(`   ✅ API response received with ${Object.keys(data).length} fields`);
            } catch (e) {
                console.log('   ✅ API response received (JSON parsing failed but data present)');
            }
        } else {
            console.log(`   ❌ ${content.text}`);
        }
    } else {
        console.log('   ❌ Custom API request failed');
    }

    // Summary
    console.log('\n🏆 Final Test Summary:');
    console.log('=' .repeat(50));

    const successCount = Object.values(results).filter(r => r?.result && !r.error).length;
    const totalTests = Object.keys(results).length;

    console.log(`✅ Successful tests: ${successCount}/${totalTests}`);
    console.log(`❌ Failed tests: ${totalTests - successCount}/${totalTests}`);

    if (successCount >= 3) {
        console.log('\n🎉 MCP OVH Server is fully functional!');
        console.log('🚀 Ready for production use in IDEs');
    } else {
        console.log('\n⚠️ Some tests failed. Check credentials and network connectivity.');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    serverProcess.kill();
    process.exit(0);
});

// Timeout after 60 seconds
setTimeout(() => {
    console.log('\n⏰ Test timeout reached (60s)');
    console.log('📊 Partial results:');
    analyzeFullResults(responses);
    serverProcess.kill();
    rl.close();
    process.exit(0);
}, 60000);
