#!/usr/bin/env node

const path = require('path');
const { OvhMcpServer } = require(path.join(__dirname, '../../dist/index.js'));

async function testEndpoints() {
  const server = new OvhMcpServer();

  // Simulate OVH client initialization
  const ovh = require('@ovhcloud/node-ovh');
  server.ovhClient = ovh({
    endpoint: 'ovh-us',
    appKey: process.env.OVH_APP_KEY || 'test-app-key',
    appSecret: process.env.OVH_APP_SECRET || 'test-app-secret',
    consumerKey: process.env.OVH_CONSUMER_KEY || 'test-consumer-key'
  });

  console.log('🔍 Testing different endpoints for services...\n');

  // ALL OVH API ENDPOINTS (according to https://eu.api.ovh.com/v1/)
  const endpoints = [
    // ✅ ALREADY VERIFIED WORKING:
    '/me',                    // User information ✅
    '/me/bill',              // User bills ✅ (5 items)
    '/me/payment/method',    // Payment methods ✅ (1 item)
    '/service',              // Services list ✅ (2 items)
    '/dedicated/server',     // Dedicated servers ✅ (0 items - no have)
    '/vps',                  // VPS ✅ (0 items - no have)
    '/me/order',             // User orders ✅ (5 items)
    '/me/api/application',   // API applications ✅ (1 item)
    '/cloud/project',        // Cloud projects ✅ (1 item)

    // 🔍 IMPORTANT ENDPOINTS TO TEST:
    '/services',             // Services (plural - different from /service)
    '/order',                // Orders (without /me)
    '/domain',               // Domains
    '/hosting/web',          // Web hosting
    '/email/domain',         // Email domains
    '/ip',                   // IPs
    '/ipLoadbalancing',      // Load balancing
    '/dedicatedCloud',       // Dedicated Cloud
    '/telephony',            // Telephony
    '/support',              // Support
    '/metrics',              // Metrics
    '/storage',              // Storage
    '/license/windows',      // Windows licenses
    '/dbaas/logs',           // DBaaS Logs
    '/ssl',                  // SSL
    '/vrack',                // vRack
    '/veeamCloudConnect',    // Veeam Cloud Connect
    '/nutanix',              // Nutanix
    '/price',                // Prices
    '/products',             // Products

    // ❌ ENDPOINTS THAT PROBABLY REQUIRE PERMISSIONS:
    // '/me/services',        // ❌ Already tested - requires permissions
    // '/me/api/logs',        // ❌ Already tested - requires permissions
    // '/sms',                // ❌ Probably requires permissions
    // '/auth',               // ❌ Authentication system
    // '/secret'              // ❌ Secrets - requires high permissions
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const result = await server.ovhClient.requestPromised('GET', endpoint);
      console.log(`✅ ${endpoint}: ${Array.isArray(result) ? result.length + ' items' : 'OK'}\n`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}\n`);
    }
  }
}

testEndpoints().catch(console.error);

