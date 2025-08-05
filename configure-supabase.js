#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 CONFIGURACIÓN DE SUPABASE PARA FRONTEND');
console.log('==========================================\n');

// Función para hacer pregunta
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

// Función para actualizar el archivo de configuración
const updateSupabaseConfig = (url, anonKey) => {
    const configPath = path.join(__dirname, 'assets', 'js', 'supabase-client.js');
    
    try {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Reemplazar las variables de configuración
        content = content.replace(
            /const SUPABASE_URL = 'https:\/\/tu-proyecto\.supabase\.co';/,
            `const SUPABASE_URL = '${url}';`
        );
        
        content = content.replace(
            /const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';/,
            `const SUPABASE_ANON_KEY = '${anonKey}';`
        );
        
        fs.writeFileSync(configPath, content, 'utf8');
        
        console.log('✅ Configuración actualizada exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error al actualizar la configuración:', error.message);
        return false;
    }
};

// Función principal
const main = async () => {
    try {
        console.log('📋 Instrucciones:');
        console.log('1. Ve a tu proyecto de Supabase');
        console.log('2. En Settings > API, copia la URL y la Anon Key');
        console.log('3. Pégala aquí cuando te lo solicite\n');
        
        const url = await question('🔗 URL de Supabase (ej: https://abc123.supabase.co): ');
        
        if (!url.includes('supabase.co')) {
            console.log('❌ URL inválida. Debe ser una URL de Supabase');
            process.exit(1);
        }
        
        const anonKey = await question('🔑 Anon Key (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...): ');
        
        if (!anonKey.startsWith('eyJ')) {
            console.log('❌ Anon Key inválida. Debe comenzar con "eyJ"');
            process.exit(1);
        }
        
        console.log('\n🔄 Actualizando configuración...');
        
        if (updateSupabaseConfig(url, anonKey)) {
            console.log('\n🎉 ¡Configuración completada!');
            console.log('\n📝 Próximos pasos:');
            console.log('1. Ejecuta: node test-connection.js');
            console.log('2. Ejecuta: node start-dev-server.js');
            console.log('3. Abre http://localhost:8080 en tu navegador');
        } else {
            console.log('\n❌ Error en la configuración');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { updateSupabaseConfig }; 