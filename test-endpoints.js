#!/usr/bin/env node

const { OvhMcpServer } = require('./dist/index.js');

async function testEndpoints() {
  const server = new OvhMcpServer();

  // Simular inicialización del cliente OVH
  const ovh = require('@ovhcloud/node-ovh');
  server.ovhClient = ovh({
    endpoint: 'ovh-us',
    appKey: process.env.OVH_APP_KEY || 'test-app-key',
    appSecret: process.env.OVH_APP_SECRET || 'test-app-secret',
    consumerKey: process.env.OVH_CONSUMER_KEY || 'test-consumer-key'
  });

  console.log('🔍 Probando diferentes endpoints para servicios...\n');

  // TODOS LOS ENDPOINTS DE LA API DE OVH (según https://eu.api.ovh.com/v1/)
  const endpoints = [
    // ✅ YA VERIFICADOS FUNCIONANDO:
    '/me',                    // Información del usuario ✅
    '/me/bill',              // Facturas del usuario ✅ (5 items)
    '/me/payment/method',    // Métodos de pago ✅ (1 item)
    '/service',              // Lista de servicios ✅ (2 items)
    '/dedicated/server',     // Servidores dedicados ✅ (0 items - no tiene)
    '/vps',                  // VPS ✅ (0 items - no tiene)
    '/me/order',             // Órdenes del usuario ✅ (5 items)
    '/me/api/application',   // Aplicaciones API ✅ (1 item)
    '/cloud/project',        // Proyectos de cloud ✅ (1 item)

    // 🔍 ENDPOINTS IMPORTANTES PARA PROBAR:
    '/services',             // Servicios (plural - diferente a /service)
    '/order',                // Órdenes (sin /me)
    '/domain',               // Dominios
    '/hosting/web',          // Hosting web
    '/email/domain',         // Dominios de email
    '/ip',                   // IPs
    '/ipLoadbalancing',      // Load balancing
    '/dedicatedCloud',       // Dedicated Cloud
    '/telephony',            // Telefonía
    '/support',              // Soporte
    '/metrics',              // Métricas
    '/storage',              // Almacenamiento
    '/license/windows',      // Licencias Windows
    '/dbaas/logs',           // DBaaS Logs
    '/ssl',                  // SSL
    '/vrack',                // vRack
    '/veeamCloudConnect',    // Veeam Cloud Connect
    '/nutanix',              // Nutanix
    '/price',                // Precios
    '/products',             // Productos

    // ❌ ENDPOINTS QUE PROBABLEMENTE REQUIERAN PERMISOS:
    // '/me/services',        // ❌ Ya probado - requiere permisos
    // '/me/api/logs',        // ❌ Ya probado - requiere permisos
    // '/sms',                // ❌ Probablemente requiere permisos
    // '/auth',               // ❌ Sistema de autenticación
    // '/secret'              // ❌ Secretos - requiere permisos altos
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando: ${endpoint}`);
      const result = await server.ovhClient.requestPromised('GET', endpoint);
      console.log(`✅ ${endpoint}: ${Array.isArray(result) ? result.length + ' items' : 'OK'}\n`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}\n`);
    }
  }
}

testEndpoints().catch(console.error);

