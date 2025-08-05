# 🌐 Frontend - Despedida Eterna con Supabase

Esta guía te ayudará a ejecutar el frontend de **Despedida Eterna** conectado a Supabase.

## 🚀 Inicio Rápido

### **1. Configurar Supabase**

```bash
# Navegar al directorio frontend
cd frontend

# Configurar credenciales de Supabase
node config-supabase.js
```

### **2. Probar Conexiones**

```bash
# Verificar que todo esté funcionando
node test-connection.js
```

### **3. Iniciar Servidor de Desarrollo**

```bash
# Iniciar servidor de desarrollo
node start-dev-server.js
```

### **4. Abrir en Navegador**

Abre [http://localhost:8080](http://localhost:8080) en tu navegador.

## 📋 Prerequisitos

### **Backend Ejecutándose**
Asegúrate de que el backend esté ejecutándose en `http://localhost:3000`:

```bash
# Terminal 1 - Backend
cd backend
node serverSupabase.js
```

### **Supabase Configurado**
- Proyecto creado en Supabase
- Script de migración ejecutado
- Variables de entorno configuradas

## 🔧 Configuración Detallada

### **Configurar Supabase**

1. **Ejecutar script de configuración:**
   ```bash
   node config-supabase.js
   ```

2. **Proporcionar credenciales:**
   - URL de Supabase (ej: `https://tu-proyecto.supabase.co`)
   - Clave anónima de Supabase

3. **Verificar configuración:**
   ```bash
   node test-connection.js
   ```

### **Archivos de Configuración**

- `assets/js/supabase-config.js` - Configuración de Supabase
- `start-dev-server.js` - Servidor de desarrollo
- `config-supabase.js` - Script de configuración
- `test-connection.js` - Script de pruebas

## 🌐 Páginas Disponibles

### **Páginas Públicas:**
- **Inicio:** `http://localhost:8080/`
- **Registro:** `http://localhost:8080/register.html`
- **Login:** `http://localhost:8080/login.html`
- **Tienda:** `http://localhost:8080/store.html`
- **Memoriales Públicos:** `http://localhost:8080/public-memorials.html`

### **Páginas Protegidas (requieren login):**
- **Dashboard:** `http://localhost:8080/dashboard.html`
- **Crear Memorial:** `http://localhost:8080/create-memorial.html`
- **Editar Memorial:** `http://localhost:8080/edit-memorial.html`
- **Eventos:** `http://localhost:8080/event.html`

### **Páginas de Admin:**
- **Admin Dashboard:** `http://localhost:8080/admin-dashboard.html`

## 🔍 Pruebas y Debugging

### **Probar Conexiones**

```bash
# Probar backend, Supabase y archivos
node test-connection.js
```

### **Verificar Backend**

```bash
# Probar salud del backend
curl http://localhost:3000/api/health

# Ver información del sistema
curl http://localhost:3000/api/info
```

### **Debugging en Navegador**

1. **Abrir DevTools** (F12)
2. **Verificar Console** para errores
3. **Verificar Network** para peticiones HTTP
4. **Verificar Application** para localStorage

## 🚨 Troubleshooting

### **Error: "Backend no conectado"**
```bash
# Verificar que el backend esté ejecutándose
cd backend && node serverSupabase.js
```

### **Error: "Supabase no configurado"**
```bash
# Configurar Supabase
cd frontend && node config-supabase.js
```

### **Error: "CORS"**
- Verificar que el backend tenga CORS configurado
- Verificar que las URLs estén permitidas

### **Error: "Archivo no encontrado"**
```bash
# Verificar archivos del frontend
node test-connection.js
```

### **Error: "Token inválido"**
- Limpiar localStorage del navegador
- Volver a hacer login

## 📱 Características del Frontend

### **Integración con Supabase:**
- ✅ **Autenticación** con JWT
- ✅ **API REST** para memoriales
- ✅ **Storage** para imágenes
- ✅ **Real-time** (preparado para futuras implementaciones)

### **Funcionalidades:**
- ✅ **Registro y Login** de usuarios
- ✅ **Crear y editar** memoriales
- ✅ **Subir imágenes** a Supabase Storage
- ✅ **Tienda** con productos
- ✅ **Eventos** con confirmaciones
- ✅ **Dashboard** personalizado
- ✅ **Admin panel** para gestión

### **Tecnologías:**
- ✅ **HTML5** semántico
- ✅ **CSS3** moderno
- ✅ **JavaScript** ES6+
- ✅ **Supabase** para backend
- ✅ **Fetch API** para peticiones
- ✅ **LocalStorage** para sesiones

## 🔧 Comandos Útiles

### **Desarrollo:**
```bash
# Configurar Supabase
node config-supabase.js

# Probar conexiones
node test-connection.js

# Iniciar servidor
node start-dev-server.js

# Verificar archivos
ls -la assets/js/
```

### **Debugging:**
```bash
# Ver logs del servidor
tail -f logs/frontend.log

# Probar API endpoints
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/info
```

### **Limpieza:**
```bash
# Limpiar cache del navegador
# En DevTools > Application > Storage > Clear site data
```

## 📊 Monitoreo

### **Logs del Servidor:**
- Requests HTTP
- Errores de archivos
- CORS issues

### **Console del Navegador:**
- Errores de JavaScript
- Peticiones API
- Autenticación

### **Network Tab:**
- Peticiones HTTP
- Headers de autorización
- Respuestas de API

## 🚀 Próximos Pasos

### **1. Configurar Vercel:**
- Crear proyecto en Vercel
- Configurar variables de entorno
- Desplegar frontend

### **2. Optimizar Rendimiento:**
- Minificar CSS/JS
- Optimizar imágenes
- Implementar caché

### **3. Agregar Funcionalidades:**
- Real-time updates
- Push notifications
- Progressive Web App

### **4. Mejorar UX:**
- Loading states
- Error handling
- Success feedback

## 🆘 Soporte

### **Documentación:**
- [Supabase Docs](https://supabase.com/docs)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### **Comunidad:**
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### **Debugging:**
```javascript
// En la consola del navegador
console.log('API:', window.API);
console.log('Supabase:', window.supabase);
console.log('User:', localStorage.getItem('userData'));
```

---

**🎉 ¡El frontend está listo para usar con Supabase!** 