// Configuración de la API
var API_BASE_URL = 'http://localhost:3000/api';

// Utilidades
const utils = {
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    },
    
    // Validar email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Formatear fecha
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Formatear precio
    formatPrice: (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price);
    },
    
    // Obtener token del localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    // Guardar token en localStorage
    setToken: (token) => {
        localStorage.setItem('token', token);
    },
    
    // Remover token del localStorage
    removeToken: () => {
        localStorage.removeItem('token');
    },
    
    // Verificar si el usuario está autenticado
    isAuthenticated: () => {
        return !!utils.getToken();
    },
    
    // Redirigir a login si no está autenticado
    requireAuth: () => {
        if (!utils.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },
    
    // Hacer request a la API
    apiRequest: async (endpoint, options = {}) => {
        const token = utils.getToken();
        const defaultOptions = {
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
        
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('🌐 Haciendo request a:', url);
        console.log('📋 Config:', config);
        
        try {
            const response = await fetch(url, config);
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);
            
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
};

// Navegación
const navigation = {
    init: () => {
        const navbarToggle = document.getElementById('navbarToggle');
        const navbarMenu = document.getElementById('navbarMenu');
        
        if (navbarToggle && navbarMenu) {
            navbarToggle.addEventListener('click', () => {
                navbarMenu.classList.toggle('active');
                navbarToggle.classList.toggle('active');
            });
            
            // Cerrar menú al hacer clic en un enlace
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                });
            });
        }
        
        // Scroll suave para enlaces internos
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerElement = document.querySelector('.header');
                    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    // Actualizar navegación según autenticación
    updateAuthStatus: () => {
        const navbarActions = document.querySelector('.navbar-actions');
        
        if (navbarActions) {
            if (utils.isAuthenticated()) {
                navbarActions.innerHTML = `
                    <a href="/dashboard.html" class="btn btn-dashboard">Dashboard</a>
                    <button class="btn btn-logout" onclick="auth.logout()">Cerrar Sesión</button>
                    <div class="header-icons-mobile">
                        <a href="/dashboard.html" title="Dashboard"><i class="fa-solid fa-gauge"></i></a>
                        <a href="#" title="Cerrar Sesión" onclick="auth.logout()"><i class="fa-solid fa-right-from-bracket"></i></a>
                    </div>
                `;
            } else {
                navbarActions.innerHTML = `
                    <a href="/login.html" class="btn btn-login">Iniciar Sesión</a>
                    <a href="/register.html" class="btn btn-register">Registrarse</a>
                    <div class="header-icons-mobile">
                        <a href="/login.html" title="Iniciar Sesión"><i class="fa-solid fa-user"></i></a>
                        <a href="/register.html" title="Registrarse"><i class="fa-solid fa-user-plus"></i></a>
                    </div>
                `;
            }
        }
    }
};

// Autenticación
const auth = {
    // Login
    login: async (email, password) => {
        try {
            console.log('🔐 Intentando login con:', email);
            const data = await utils.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            console.log('✅ Login exitoso:', data);
            utils.setToken(data.token);
            utils.showNotification('Inicio de sesión exitoso', 'success');
            
            // Redirigir al dashboard inmediatamente
            console.log('🔄 Redirigiendo al dashboard...');
            window.location.href = '/dashboard.html';
            
            return data;
        } catch (error) {
            console.error('❌ Error en login:', error);
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Registro
    register: async (userData) => {
        try {
            const data = await utils.apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            utils.showNotification('Registro exitoso. Revisa tu email para verificar tu cuenta.', 'success');
            
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Logout
    logout: () => {
        utils.removeToken();
        utils.showNotification('Sesión cerrada exitosamente', 'info');
        
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    },
    
    // Verificar email
    verifyEmail: async (token) => {
        try {
            const data = await utils.apiRequest(`/auth/verify-email/${token}`);
            utils.showNotification('Email verificado exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Reset password
    requestPasswordReset: async (email) => {
        try {
            const data = await utils.apiRequest('/auth/request-password-reset', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            
            utils.showNotification('Se ha enviado un enlace de recuperación a tu email', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Reset password con token
    resetPassword: async (token, newPassword) => {
        try {
            const data = await utils.apiRequest('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword })
            });
            
            utils.showNotification('Contraseña actualizada exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Perfiles Memoriales
const memorials = {
    // Crear perfil memorial
    create: async (memorialData, images = []) => {
        try {
            const formData = new FormData();
            
            // Agregar datos del memorial
            Object.keys(memorialData).forEach(key => {
                formData.append(key, memorialData[key]);
            });
            
            // Agregar imágenes
            images.forEach(image => {
                formData.append('memorial_images', image);
            });
            
            const token = utils.getToken();
            const response = await fetch(`${API_BASE_URL}/memorials`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el perfil memorial');
            }
            
            utils.showNotification('Perfil memorial creado exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener perfiles del usuario
    getUserMemorials: async (page = 1, limit = 10) => {
        try {
            const data = await utils.apiRequest(`/memorials/my-memorials?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener perfil público
    getPublicMemorial: async (id) => {
        try {
            const data = await utils.apiRequest(`/memorials/${id}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Agregar mensaje
    addMessage: async (memorialId, messageData) => {
        try {
            const data = await utils.apiRequest(`/memorials/${memorialId}/messages`, {
                method: 'POST',
                body: JSON.stringify(messageData)
            });
            
            utils.showNotification('Mensaje agregado exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Encender vela virtual
    lightCandle: async (memorialId, candleData) => {
        try {
            const data = await utils.apiRequest(`/memorials/${memorialId}/candles`, {
                method: 'POST',
                body: JSON.stringify(candleData)
            });
            
            utils.showNotification('Vela encendida exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Eventos
const events = {
    // Crear evento
    create: async (eventData) => {
        try {
            const data = await utils.apiRequest('/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
            
            utils.showNotification('Evento creado exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener eventos del usuario
    getUserEvents: async (page = 1, limit = 10) => {
        try {
            const data = await utils.apiRequest(`/events/my-events?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener evento público
    getPublicEvent: async (id) => {
        try {
            const data = await utils.apiRequest(`/events/${id}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Agregar invitado
    addGuest: async (eventId, guestData) => {
        try {
            const data = await utils.apiRequest(`/events/${eventId}/guests`, {
                method: 'POST',
                body: JSON.stringify(guestData)
            });
            
            utils.showNotification('Invitado agregado exitosamente', 'success');
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Productos
const products = {
    // Obtener todos los productos
    getAll: async (page = 1, limit = 12) => {
        try {
            const data = await utils.apiRequest(`/products?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener producto por ID
    getById: async (id) => {
        try {
            const data = await utils.apiRequest(`/products/${id}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Buscar productos
    search: async (query, filters = {}) => {
        try {
            const params = new URLSearchParams({ q: query, ...filters });
            const data = await utils.apiRequest(`/products/search?${params}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Obtener productos por categoría
    getByCategory: async (category, page = 1, limit = 12) => {
        try {
            const data = await utils.apiRequest(`/products/category/${category}?page=${page}&limit=${limit}`);
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Pagos
const payments = {
    // Crear preferencia de suscripción
    createSubscriptionPreference: async (memorialId, planType) => {
        try {
            const data = await utils.apiRequest('/payments/subscription', {
                method: 'POST',
                body: JSON.stringify({ memorialId, planType })
            });
            
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Crear preferencia de productos
    createProductPreference: async (items, shippingAddress = null) => {
        try {
            const data = await utils.apiRequest('/payments/products', {
                method: 'POST',
                body: JSON.stringify({ items, shippingAddress })
            });
            
            return data;
        } catch (error) {
            utils.showNotification(error.message, 'error');
            throw error;
        }
    },
    
    // Inicializar MercadoPago
    initMercadoPago: (preferenceId) => {
        return new Promise((resolve, reject) => {
            if (typeof MercadoPago === 'undefined') {
                reject(new Error('MercadoPago SDK no está cargado'));
                return;
            }
            
            const mp = new MercadoPago('TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            const checkout = mp.checkout({
                preference: {
                    id: preferenceId
                },
                render: {
                    container: '.cho-container',
                    label: 'Pagar'
                }
            });
            
            resolve(checkout);
        });
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar navegación
    navigation.init();
    
    // Actualizar estado de autenticación
    navigation.updateAuthStatus();
    
    // Agregar estilos para notificaciones
    const notificationStyles = `
        <style>
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #4A5568;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-success {
                border-left-color: #48BB78;
            }
            
            .notification-error {
                border-left-color: #E53E3E;
            }
            
            .notification-warning {
                border-left-color: #ED8936;
            }
            
            .notification-info {
                border-left-color: #4299E1;
            }
            
            .notification-content {
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .notification-message {
                color: #2D3748;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #718096;
                cursor: pointer;
                margin-left: 12px;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                color: #2D3748;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', notificationStyles);
    
    // Verificar si hay token de verificación en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('token');
    
    if (verificationToken) {
        auth.verifyEmail(verificationToken);
    }
    
    // Verificar si hay token de reset en la URL
    const resetToken = urlParams.get('reset_token');
    if (resetToken) {
        // Mostrar formulario de reset de contraseña
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.style.display = 'block';
            document.getElementById('resetToken').value = resetToken;
        }
    }
});

// Exportar para uso global
window.utils = utils;
window.auth = auth;
window.memorials = memorials;
window.events = events;
window.products = products;
window.payments = payments; 