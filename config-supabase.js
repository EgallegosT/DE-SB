#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configurando Supabase para el Frontend');
console.log('==========================================\n');

// Función para hacer pregunta
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Función para actualizar archivo de configuración
function updateSupabaseConfig(supabaseUrl, supabaseAnonKey) {
  const configPath = path.join(__dirname, 'assets/js/supabase-config.js');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Actualizar URL de Supabase
    configContent = configContent.replace(
      /const SUPABASE_URL = 'https:\/\/tu-proyecto\.supabase\.co';/,
      `const SUPABASE_URL = '${supabaseUrl}';`
    );
    
    // Actualizar clave anónima
    configContent = configContent.replace(
      /const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';/,
      `const SUPABASE_ANON_KEY = '${supabaseAnonKey}';`
    );
    
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Configuración de Supabase actualizada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error.message);
    return false;
  }
}

// Función para verificar configuración
function checkConfiguration() {
  const configPath = path.join(__dirname, 'assets/js/supabase-config.js');
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Verificar si ya está configurado
    if (configContent.includes('tu-proyecto.supabase.co') || 
        configContent.includes('tu-anon-key-aqui')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Función principal
async function main() {
  try {
    // Verificar si ya está configurado
    if (checkConfiguration()) {
      console.log('✅ Supabase ya está configurado en el frontend');
      console.log('💡 Si necesitas cambiar la configuración, edita manualmente:');
      console.log('   assets/js/supabase-config.js\n');
      return;
    }
    
    console.log('📝 Por favor, proporciona las credenciales de tu proyecto Supabase:\n');
    
    // Solicitar URL de Supabase
    const supabaseUrl = await askQuestion('🔗 URL de Supabase (ej: https://tu-proyecto.supabase.co): ');
    
    if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
      console.log('❌ URL de Supabase inválida');
      return;
    }
    
    // Solicitar clave anónima
    const supabaseAnonKey = await askQuestion('🔑 Clave anónima de Supabase: ');
    
    if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
      console.log('❌ Clave anónima inválida');
      return;
    }
    
    console.log('\n🔄 Actualizando configuración...');
    
    // Actualizar configuración
    const success = updateSupabaseConfig(supabaseUrl, supabaseAnonKey);
    
    if (success) {
      console.log('\n🎉 ¡Configuración completada!');
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
      console.log('   2. Inicia el servidor de desarrollo del frontend');
      console.log('   3. Prueba la aplicación en http://localhost:8080');
      console.log('\n🔧 Comandos útiles:');
      console.log('   # Terminal 1 - Backend');
      console.log('   cd backend && node serverSupabase.js');
      console.log('\n   # Terminal 2 - Frontend');
      console.log('   cd frontend && node start-dev-server.js');
      console.log('\n✨ ¡Listo para probar Despedida Eterna con Supabase!');
    }
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = {
  updateSupabaseConfig,
  checkConfiguration
}; 