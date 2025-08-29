#!/usr/bin/env node

// Simple test script to demonstrate MCP OVH functionality
const { OvhMcpServer, InitializeClientSchema, InitializeOAuth2Schema, MakeRequestSchema } = require('./dist/index.js');

console.log('🚀 Testing MCP OVH Server...\n');

// Test 1: Validate schemas
console.log('✅ Testing schema validation:');

try {
    // Test valid client initialization
    const validClient = {
        endpoint: 'ovh-eu',
        appKey: 'test-key',
        appSecret: 'test-secret',
        consumerKey: 'test-consumer'
    };
    InitializeClientSchema.parse(validClient);
    console.log('  ✅ InitializeClientSchema validation passed');
} catch (error) {
    console.log('  ❌ InitializeClientSchema validation failed:', error.message);
}

try {
    // Test valid OAuth2 initialization
    const validOAuth2 = {
        endpoint: 'ovh-eu',
        clientID: 'test-client-id',
        clientSecret: 'test-client-secret'
    };
    InitializeOAuth2Schema.parse(validOAuth2);
    console.log('  ✅ InitializeOAuth2Schema validation passed');
} catch (error) {
    console.log('  ❌ InitializeOAuth2Schema validation failed:', error.message);
}

try {
    // Test valid request
    const validRequest = {
        method: 'GET',
        path: '/me'
    };
    MakeRequestSchema.parse(validRequest);
    console.log('  ✅ MakeRequestSchema validation passed');
} catch (error) {
    console.log('  ❌ MakeRequestSchema validation failed:', error.message);
}

// Test 2: Server initialization
console.log('\n✅ Testing server initialization:');
try {
    const server = new OvhMcpServer();
    console.log('  ✅ OvhMcpServer instance created successfully');
    console.log('  ✅ Server has tools registered:', !!server.server);
    console.log('  ✅ OVH client not initialized:', server.ovhClient === null);
} catch (error) {
    console.log('  ❌ Server initialization failed:', error.message);
}

console.log('\n🎉 MCP OVH Server tests completed!');
console.log('💡 To use the server, run: npm start');
console.log('💡 To initialize OVH client, call the ovh_initialize_client tool with your credentials');
