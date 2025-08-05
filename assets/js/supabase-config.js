// =====================================================
// CONFIGURACIÓN DE SUPABASE PARA FRONTEND
// =====================================================

// Importar Supabase desde CDN
// Nota: En producción, considera usar npm y un bundler
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';

// Cliente de Supabase para el frontend
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración de la API
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
      VERIFY_EMAIL: '/auth/verify-email',
      RESET_PASSWORD: '/auth/reset-password',
      REQUEST_RESET: '/auth/request-reset'
    },
    MEMORIALS: {
      LIST: '/memorials',
      CREATE: '/memorials',
      GET: '/memorials/:id',
      UPDATE: '/memorials/:id',
      DELETE: '/memorials/:id',
      PUBLIC: '/memorials/public'
    },
    EVENTS: {
      LIST: '/events',
      CREATE: '/events',
      GET: '/events/:id',
      UPDATE: '/events/:id',
      DELETE: '/events/:id'
    },
    PRODUCTS: {
      LIST: '/products',
      GET: '/products/:id'
    },
    PAYMENTS: {
      CREATE_PREFERENCE: '/payments/create-preference',
      WEBHOOK: '/payments/webhook'
    },
    USERS: {
      LIST: '/users',
      GET: '/users/:id',
      UPDATE: '/users/:id'
    }
  }
};

// Funciones helper para manejo de errores
const handleApiError = (error) => {
  console.error('Error en API:', error);
  
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    return {
      success: false,
      error: data.error || 'Error del servidor',
      message: data.message || 'Ha ocurrido un error',
      status: status
    };
  } else if (error.request) {
    // Error de red
    return {
      success: false,
      error: 'Error de conexión',
      message: 'No se pudo conectar con el servidor',
      status: 0
    };
  } else {
    // Error general
    return {
      success: false,
      error: 'Error inesperado',
      message: error.message || 'Ha ocurrido un error inesperado',
      status: 500
    };
  }
};

// Función para hacer peticiones HTTP
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data
        }
      };
    }

    return {
      success: true,
      data: data,
      status: response.status
    };

  } catch (error) {
    return handleApiError(error);
  }
};

// Funciones para autenticación
const auth = {
  // Registrar usuario
  async register(userData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Iniciar sesión
  async login(credentials) {
    const result = await apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (result.success && result.data.token) {
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
    }

    return result;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obtener datos del usuario
  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Verificar token
  async verifyToken() {
    return await apiRequest(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }
};

// Funciones para memoriales
const memorials = {
  // Obtener lista de memoriales
  async getList(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return await apiRequest(`${API_CONFIG.ENDPOINTS.MEMORIALS.LIST}?${queryParams}`);
  },

  // Obtener memorial público
  async getPublic(id) {
    return await apiRequest(`${API_CONFIG.ENDPOINTS.MEMORIALS.PUBLIC}/${id}`);
  },

  // Crear memorial
  async create(memorialData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.MEMORIALS.CREATE, {
      method: 'POST',
      body: JSON.stringify(memorialData)
    });
  },

  // Obtener memorial específico
  async get(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.MEMORIALS.GET.replace(':id', id));
  },

  // Actualizar memorial
  async update(id, memorialData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.MEMORIALS.UPDATE.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify(memorialData)
    });
  },

  // Eliminar memorial
  async delete(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.MEMORIALS.DELETE.replace(':id', id), {
      method: 'DELETE'
    });
  }
};

// Funciones para eventos
const events = {
  // Obtener lista de eventos
  async getList(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return await apiRequest(`${API_CONFIG.ENDPOINTS.EVENTS.LIST}?${queryParams}`);
  },

  // Crear evento
  async create(eventData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.EVENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  // Obtener evento específico
  async get(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.EVENTS.GET.replace(':id', id));
  },

  // Actualizar evento
  async update(id, eventData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.EVENTS.UPDATE.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  // Eliminar evento
  async delete(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.EVENTS.DELETE.replace(':id', id), {
      method: 'DELETE'
    });
  }
};

// Funciones para productos
const products = {
  // Obtener lista de productos
  async getList(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams}`);
  },

  // Obtener producto específico
  async get(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.GET.replace(':id', id));
  }
};

// Funciones para pagos
const payments = {
  // Crear preferencia de pago
  async createPreference(paymentData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_PREFERENCE, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }
};

// Funciones para usuarios
const users = {
  // Obtener lista de usuarios (admin)
  async getList(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return await apiRequest(`${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams}`);
  },

  // Obtener usuario específico
  async get(id) {
    return await apiRequest(API_CONFIG.ENDPOINTS.USERS.GET.replace(':id', id));
  },

  // Actualizar usuario
  async update(id, userData) {
    return await apiRequest(API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// Funciones de utilidad
const utils = {
  // Mostrar notificación
  showNotification(message, type = 'info') {
    // Implementar sistema de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);
  },

  // Validar email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Formatear fecha
  formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Formatear precio
  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Verificar si es admin
  isAdmin() {
    const user = auth.getUser();
    return user && user.role === 'admin';
  },

  // Redirigir si no está autenticado
  requireAuth() {
    if (!auth.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  // Redirigir si no es admin
  requireAdmin() {
    if (!utils.requireAuth()) return false;
    if (!utils.isAdmin()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  }
};

// Exportar funciones para uso global
window.API = {
  auth,
  memorials,
  events,
  products,
  payments,
  users,
  utils,
  supabase
};

// Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Frontend configurado para Supabase');
  console.log('📡 API Base URL:', API_CONFIG.BASE_URL);
  
  // Verificar autenticación en páginas protegidas
  const protectedPages = ['dashboard.html', 'create-memorial.html', 'edit-memorial.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage)) {
    utils.requireAuth();
  }
  
  // Verificar admin en páginas de admin
  const adminPages = ['admin-dashboard.html'];
  if (adminPages.includes(currentPage)) {
    utils.requireAdmin();
  }
}); 