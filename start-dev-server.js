#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Función para obtener el tipo MIME
function getMimeType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  return mimeTypes[extname] || 'application/octet-stream';
}

// Función para servir archivos estáticos
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Archivo no encontrado</h1>');
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// Función para manejar rutas
function handleRoute(pathname, res) {
  // Ruta por defecto
  if (pathname === '/' || pathname === '/index.html') {
    serveStaticFile('./index.html', res);
    return;
  }

  // Buscar archivo en el directorio actual
  const filePath = path.join(__dirname, pathname);
  
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si no existe, intentar con .html
      const htmlPath = filePath + '.html';
      fs.access(htmlPath, fs.constants.F_OK, (err2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - Página no encontrada</h1>');
        } else {
          serveStaticFile(htmlPath, res);
        }
      });
    } else {
      serveStaticFile(filePath, res);
    }
  });
}

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Log de requests
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname} - ${req.connection.remoteAddress}`);

  // Manejar rutas
  handleRoute(pathname, res);
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log('🚀 Servidor de desarrollo iniciado');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📁 Directorio: ${__dirname}`);
  console.log('');
  console.log('📋 Páginas disponibles:');
  console.log(`   🏠 Inicio: http://localhost:${PORT}/`);
  console.log(`   📝 Registro: http://localhost:${PORT}/register.html`);
  console.log(`   🔐 Login: http://localhost:${PORT}/login.html`);
  console.log(`   📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`   🏪 Tienda: http://localhost:${PORT}/store.html`);
  console.log(`   🕯️ Memoriales: http://localhost:${PORT}/public-memorials.html`);
  console.log(`   👑 Admin: http://localhost:${PORT}/admin-dashboard.html`);
  console.log('');
  console.log('💡 Para detener el servidor, presiona Ctrl+C');
  console.log('');
  console.log('✨ Despedida Eterna - Frontend Development Server');
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor de desarrollo...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor de desarrollo...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
}); 