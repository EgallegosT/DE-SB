// =====================================================
// MAIN.JS ADAPTADO PARA SUPABASE
// =====================================================

// Esperar a que el cliente de Supabase esté disponible
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que el cliente de Supabase se inicialice
    await new Promise(resolve => {
        const checkSupabase = () => {
            if (window.supabaseClient) {
                resolve();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
    
    // Inicializar la aplicación
    initApp();
});

// Función principal de inicialización
function initApp() {
    const client = window.supabaseClient;
    
    // Configurar listeners de autenticación
    window.addEventListener('authStateChanged', (event) => {
        const { user } = event.detail;
        updateUIForAuth(user);
    });
    
    // Verificar estado inicial de autenticación
    updateUIForAuth(client.getUser());
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar formularios
    setupForms();
    
    // Configurar elementos interactivos
    setupInteractiveElements();
}

// Actualizar UI según el estado de autenticación
function updateUIForAuth(user) {
    const authElements = document.querySelectorAll('[data-auth]');
    const guestElements = document.querySelectorAll('[data-guest]');
    
    if (user) {
        // Usuario autenticado
        authElements.forEach(el => el.style.display = 'block');
        guestElements.forEach(el => el.style.display = 'none');
        
        // Actualizar información del usuario
        updateUserInfo(user);
    } else {
        // Usuario no autenticado
        authElements.forEach(el => el.style.display = 'none');
        guestElements.forEach(el => el.style.display = 'block');
        
        // Limpiar información del usuario
        clearUserInfo();
    }
}

// Actualizar información del usuario en la UI
function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('[data-user-name]');
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    
    userNameElements.forEach(el => {
        el.textContent = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
    });
    
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });
}

// Limpiar información del usuario
function clearUserInfo() {
    const userNameElements = document.querySelectorAll('[data-user-name]');
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    
    userNameElements.forEach(el => {
        el.textContent = '';
    });
    
    userEmailElements.forEach(el => {
        el.textContent = '';
    });
}

// Configurar navegación
function setupNavigation() {
    // Navegación principal
    const navLinks = document.querySelectorAll('nav a, .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Si es un enlace interno, prevenir navegación por defecto
            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href);
            }
        });
    });
    
    // Menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
}

// Configurar formularios
function setupForms() {
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Formulario de newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Configurar elementos interactivos
function setupInteractiveElements() {
    // Botones de CTA
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const client = window.supabaseClient;
            
            // Si no está autenticado, redirigir a registro
            if (!client.isAuthenticated()) {
                e.preventDefault();
                window.location.href = '/register.html';
            }
        });
    });
    
    // Tooltips
    setupTooltips();
    
    // Animaciones de scroll
    setupScrollAnimations();
}

// Manejar envío de formulario de contacto
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const client = window.supabaseClient;
    
    try {
        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Aquí podrías enviar a una Edge Function de Supabase
        // Por ahora, simulamos el envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        client.showNotification('Mensaje enviado exitosamente. Te contactaremos pronto.', 'success');
        form.reset();
        
    } catch (error) {
        client.showNotification('Error al enviar el mensaje. Intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Manejar envío de formulario de newsletter
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const client = window.supabaseClient;
    
    if (!client.validateEmail(email)) {
        client.showNotification('Por favor ingresa un email válido.', 'error');
        return;
    }
    
    try {
        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Suscribiendo...';
        submitBtn.disabled = true;
        
        // Aquí podrías guardar en Supabase
        // Por ahora, simulamos la suscripción
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        client.showNotification('¡Te has suscrito exitosamente a nuestro newsletter!', 'success');
        form.reset();
        
    } catch (error) {
        client.showNotification('Error al suscribirse. Intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Scroll suave a secciones
function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Configurar tooltips
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        
        element.addEventListener('mouseenter', () => {
            showTooltip(element, tooltipText);
        });
        
        element.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });
}

// Mostrar tooltip
function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    // Remover tooltip anterior
    const existingTooltip = document.querySelector('.tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

// Ocultar tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Configurar animaciones de scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos con animación
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

// Formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
}

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// =====================================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// =====================================================

window.AppUtils = {
    formatPrice,
    formatDate,
    validateEmail,
    generateId
}; 