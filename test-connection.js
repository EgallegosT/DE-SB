#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 Probando conexiones con Supabase y Backend');
console.log('=============================================\n');

// Función para hacer petición HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const request = client.request(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: response.statusCode,
            data: jsonData,
            headers: response.headers
          });
        } catch (error) {
          resolve({
            status: response.statusCode,
            data: data,
            headers: response.headers
          });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      request.write(options.body);
    }
    
    request.end();
  });
}

// Función para probar backend
async function testBackend() {
  console.log('🔍 Probando conexión con Backend...');
  
  try {
    const response = await makeRequest('http://localhost:3000/api/health');
    
    if (response.status === 200) {
      console.log('✅ Backend conectado correctamente');
      console.log(`   📊 Status: ${response.status}`);
      console.log(`   🕐 Timestamp: ${response.data.timestamp}`);
      console.log(`   🌍 Environment: ${response.data.environment}`);
    } else {
      console.log('⚠️ Backend respondió con status:', response.status);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error conectando con Backend:', error.message);
    console.log('💡 Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
    return false;
  }
}

// Función para probar información del sistema
async function testSystemInfo() {
  console.log('\n🔍 Probando información del sistema...');
  
  try {
    const response = await makeRequest('http://localhost:3000/api/info');
    
    if (response.status === 200) {
      console.log('✅ Información del sistema obtenida');
      console.log(`   📱 Nombre: ${response.data.name}`);
      console.log(`   🔢 Versión: ${response.data.version}`);
      console.log(`   🗄️ Base de datos: ${response.data.database}`);
      console.log(`   ⚡ Características: ${response.data.features.length} disponibles`);
    } else {
      console.log('⚠️ Error obteniendo información del sistema:', response.status);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo información del sistema:', error.message);
    return false;
  }
}

// Función para probar Supabase (simulación)
async function testSupabase() {
  console.log('\n🔍 Probando configuración de Supabase...');
  
  try {
    // Leer archivo de configuración
    const fs = require('fs');
    const configPath = require('path').join(__dirname, 'assets/js/supabase-config.js');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // Verificar si está configurado
      if (configContent.includes('tu-proyecto.supabase.co') || 
          configContent.includes('tu-anon-key-aqui')) {
        console.log('⚠️ Supabase no está configurado completamente');
        console.log('💡 Ejecuta: node config-supabase.js');
        return false;
      } else {
        console.log('✅ Configuración de Supabase detectada');
        return true;
      }
    } else {
      console.log('❌ Archivo de configuración de Supabase no encontrado');
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando configuración de Supabase:', error.message);
    return false;
  }
}

// Función para probar archivos del frontend
function testFrontendFiles() {
  console.log('\n🔍 Verificando archivos del frontend...');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'index.html',
    'assets/js/supabase-config.js',
    'assets/js/main.js',
    'start-dev-server.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - No encontrado`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Función para mostrar resumen
function showSummary(backendOk, systemOk, supabaseOk, frontendOk) {
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('=====================');
  console.log(`🔧 Backend: ${backendOk ? '✅ OK' : '❌ ERROR'}`);
  console.log(`📱 Sistema: ${systemOk ? '✅ OK' : '❌ ERROR'}`);
  console.log(`🗄️ Supabase: ${supabaseOk ? '✅ OK' : '⚠️ CONFIGURAR'}`);
  console.log(`🌐 Frontend: ${frontendOk ? '✅ OK' : '❌ ERROR'}`);
  
  console.log('\n📋 Próximos pasos:');
  
  if (!backendOk) {
    console.log('   1. Inicia el backend: cd backend && node serverSupabase.js');
  }
  
  if (!supabaseOk) {
    console.log('   2. Configura Supabase: cd frontend && node config-supabase.js');
  }
  
  if (backendOk && supabaseOk) {
    console.log('   3. Inicia el frontend: cd frontend && node start-dev-server.js');
    console.log('   4. Abre http://localhost:8080 en tu navegador');
  }
  
  console.log('\n✨ ¡Listo para probar Despedida Eterna!');
}

// Función principal
async function main() {
  try {
    // Probar backend
    const backendOk = await testBackend();
    
    // Probar información del sistema
    const systemOk = await testSystemInfo();
    
    // Probar Supabase
    const supabaseOk = await testSupabase();
    
    // Probar archivos del frontend
    const frontendOk = testFrontendFiles();
    
    // Mostrar resumen
    showSummary(backendOk, systemOk, supabaseOk, frontendOk);
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = {
  testBackend,
  testSystemInfo,
  testSupabase,
  testFrontendFiles
}; 