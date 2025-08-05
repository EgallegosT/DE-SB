// Memorial View JavaScript - ADAPTADO PARA SUPABASE
// Cliente de Supabase
const client = window.supabaseClient;

class MemorialView {
    constructor() {
        this.memorialId = null;
        this.memorialData = null;
        this.currentTab = 'biography';
        this.messages = [];
        this.candles = [];
        
        this.init();
    }
    
    init() {
        try {
            this.getMemorialId();
            this.setupEventListeners();
            this.loadMemorialData();
            this.setupScrollEffects();
            this.checkReturnFromAuth();
        } catch (error) {
            console.error('Error initializing MemorialView:', error);
        }
    }
    
    getMemorialId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.memorialId = urlParams.get('id');
        
        if (!this.memorialId) {
            this.showNotification('ID de perfil memorial no encontrado', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }
    
    setupEventListeners() {
        // Tab navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        
        if (navTabs.length === 0) {
            console.warn('No navigation tabs found');
            return;
        }
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetTab = e.currentTarget.dataset.tab;
                if (targetTab) {
                    this.switchTab(targetTab);
                }
            });
        });
        
        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.showShareModal();
            });
        }
        
        // Light candle buttons
        const lightCandleBtn = document.getElementById('lightCandleBtn');
        if (lightCandleBtn) {
            lightCandleBtn.addEventListener('click', () => {
                this.showCandleModal();
            });
        }
        
        const lightNewCandleBtn = document.getElementById('lightNewCandleBtn');
        if (lightNewCandleBtn) {
            lightNewCandleBtn.addEventListener('click', () => {
                this.showCandleModal();
            });
        }
        
        // Auth buttons for candle modal
        const loginForCandle = document.getElementById('loginForCandle');
        if (loginForCandle) {
            loginForCandle.addEventListener('click', () => {
                this.redirectToLogin('candle');
            });
        }
        
        const registerForCandle = document.getElementById('registerForCandle');
        if (registerForCandle) {
            registerForCandle.addEventListener('click', () => {
                this.redirectToRegister('candle');
            });
        }
        
        // Add message button
        const addMessageBtn = document.getElementById('addMessageBtn');
        if (addMessageBtn) {
            addMessageBtn.addEventListener('click', () => {
                this.showMessageModal();
            });
        }
        
        // Auth buttons for message modal
        const loginForMessage = document.getElementById('loginForMessage');
        if (loginForMessage) {
            loginForMessage.addEventListener('click', () => {
                this.redirectToLogin('message');
            });
        }
        
        const registerForMessage = document.getElementById('registerForMessage');
        if (registerForMessage) {
            registerForMessage.addEventListener('click', () => {
                this.redirectToRegister('message');
            });
        }
        
        // Message form
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitMessage();
            });
        }
        
        // Candle form
        const candleForm = document.getElementById('candleForm');
        if (candleForm) {
            candleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitCandle();
            });
        }
        
        // Modal close buttons
        const closeMessageModal = document.getElementById('closeMessageModal');
        if (closeMessageModal) {
            closeMessageModal.addEventListener('click', () => {
                this.hideMessageModal();
            });
        }
        
        const closeCandleModal = document.getElementById('closeCandleModal');
        if (closeCandleModal) {
            closeCandleModal.addEventListener('click', () => {
                this.hideCandleModal();
            });
        }
        
        const closeShareModal = document.getElementById('closeShareModal');
        if (closeShareModal) {
            closeShareModal.addEventListener('click', () => {
                this.hideShareModal();
            });
        }
        
        // Share buttons
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                this.shareContent(platform);
            });
        });
        
        // Music toggle
        const musicToggle = document.getElementById('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    setupScrollEffects() {
        const header = document.getElementById('memorialHeader');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    async loadMemorialData() {
        try {
            this.showLoading();
            
            console.log('Cargando memorial con ID:', this.memorialId);
            
            // Verificar que el cliente de Supabase esté disponible
            if (!client) {
                throw new Error('Cliente de Supabase no disponible');
            }
            
            // Obtener memorial desde Supabase
            const result = await client.getMemorial(this.memorialId);
            
            if (!result.success) {
                throw new Error(result.message || 'Error al cargar memorial');
            }
            
            const data = result.memorial;
            console.log('Datos del memorial cargados:', data);
            
            // Verificar que el memorial sea público
            if (!data.is_public || !data.is_active) {
                this.showNotification('Este memorial no está disponible públicamente', 'error');
                return;
            }
            
            // Incrementar vistas
            await client.incrementMemorialViews(this.memorialId);
            
            // Transformar los datos al formato esperado
            this.memorialData = {
                id: data.id,
                name: data.name,
                birth_date: data.birth_date,
                death_date: data.death_date,
                birth_place: data.location,
                death_place: data.death_place,
                biography: data.biography,
                epitaph: data.epitaph,
                is_public: data.is_public,
                allow_messages: data.allow_messages,
                allow_candles: data.allow_candles,
                theme_color: data.theme_color,
                background_music: data.background_music,
                view_count: data.view_count || 0,
                candles_count: data.candles_count || 0,
                messages_count: data.messages_count || 0,
                images: data.images || [],
                timeline: data.timeline || [],
                messages: data.messages || [],
                candles: data.candles || []
            };
            
            this.populateMemorialData();
            this.loadMessages();
            this.loadCandles();
            // Generar QR con un pequeño retraso para asegurar que la librería esté cargada
            setTimeout(() => this.generateQRCode(), 100);
            this.setupBackgroundMusic();
            
        } catch (error) {
            console.error('Error loading memorial:', error);
            this.showNotification('Error al cargar el perfil memorial', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    loadSampleData() {
        // Datos de ejemplo para memorial público
        this.memorialData = {
            id: this.memorialId,
            name: 'María González',
            birth_date: '1945-03-15',
            death_date: '2023-11-20',
            epitaph: 'Siempre en nuestros corazones',
            biography: 'María fue una mujer extraordinaria que dedicó su vida a su familia y a ayudar a los demás. Su sonrisa iluminaba cualquier habitación y su bondad no conocía límites. Será recordada por su generosidad, su sabiduría y el amor incondicional que brindaba a todos los que la conocían.',
            birth_place: 'Buenos Aires, Argentina',
            death_place: 'Buenos Aires, Argentina',
            view_count: 156,
            candles_count: 23,
            messages_count: 8,
            background_music: null,
            images: [
                {
                    id: 1,
                    url: 'https://via.placeholder.com/400x400/667eea/ffffff?text=María',
                    caption: 'María en su juventud'
                },
                {
                    id: 2,
                    url: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Familia',
                    caption: 'Con su familia'
                }
            ],
            timeline: [
                {
                    year: '1945',
                    event: 'Nacimiento en Buenos Aires'
                },
                {
                    year: '1965',
                    event: 'Se casa con Juan González'
                },
                {
                    year: '1970',
                    event: 'Nace su primer hijo'
                },
                {
                    year: '2023',
                    event: 'Fallece en paz rodeada de su familia'
                }
            ]
        };
        
        this.populateMemorialData();
        this.loadSampleMessages();
        this.loadSampleCandles();
        this.generateQRCode();
    }
    
    populateMemorialData() {
        if (!this.memorialData) return;
        
        // Update page title
        document.title = `${this.memorialData.name} - Perfil Memorial - Despedida Eterna`;
        
        // Hero section
        document.getElementById('memorialName').textContent = this.memorialData.name;
        document.getElementById('memorialNameCandle').textContent = this.memorialData.name;
        
        // Dates
        if (this.memorialData.birth_date) {
            document.querySelector('.birth-date').textContent = new Date(this.memorialData.birth_date).getFullYear();
        }
        if (this.memorialData.death_date) {
            document.querySelector('.death-date').textContent = new Date(this.memorialData.death_date).getFullYear();
        }
        
        // Epitaph
        if (this.memorialData.epitaph) {
            document.getElementById('memorialEpitaph').textContent = this.memorialData.epitaph;
        } else {
            document.getElementById('memorialEpitaph').style.display = 'none';
        }
        
        // Stats
        document.getElementById('viewCount').textContent = this.memorialData.view_count || 0;
        document.getElementById('candleCount').textContent = this.memorialData.candles_count || 0;
        document.getElementById('messageCount').textContent = this.memorialData.messages_count || 0;
        
        // Hero image
        const primaryImage = this.memorialData.images?.find(img => img.isPrimary || img.is_primary) || this.memorialData.images?.[0];
        if (primaryImage) {
            // Construir la URL correcta para la imagen principal
            let imageUrl = primaryImage.url || primaryImage.image_url;
            if (imageUrl.startsWith('/uploads/')) {
                const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                imageUrl = baseUrl + imageUrl;
            } else if (imageUrl.startsWith('assets/')) {
                imageUrl = imageUrl;
            } else if (imageUrl.startsWith('http')) {
                imageUrl = imageUrl;
            } else {
                const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                imageUrl = baseUrl + '/' + imageUrl.replace(/^\/+/, '');
            }
            
            document.getElementById('heroImage').src = imageUrl;
            document.getElementById('heroBackground').style.backgroundImage = `url(${imageUrl})`;
        }
        
        // Biography
        if (this.memorialData.biography) {
            document.getElementById('biographyText').innerHTML = this.memorialData.biography.replace(/\n/g, '<br>');
        } else {
            document.getElementById('biographyText').innerHTML = '<p class="text-center text-muted">No hay biografía disponible</p>';
        }
        
        // Places
        if (this.memorialData.birth_place) {
            document.getElementById('birthPlace').textContent = this.memorialData.birth_place;
        }
        if (this.memorialData.death_place) {
            document.getElementById('deathPlace').textContent = this.memorialData.death_place;
        }
        
        // Gallery
        this.populateGallery();
        
        // Timeline
        this.populateTimeline();
        
        // Theme color
        if (this.memorialData.theme_color) {
            document.documentElement.style.setProperty('--theme-color', this.memorialData.theme_color);
        }
    }
    
    populateGallery() {
        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = '';
        
        if (!this.memorialData.images || this.memorialData.images.length === 0) {
            grid.innerHTML = '<p class="text-center text-muted">No hay imágenes disponibles</p>';
            return;
        }
        
        this.memorialData.images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            // Construir la URL correcta según el tipo de ruta
            let imageUrl = image.url || image.image_url;
            if (imageUrl.startsWith('/uploads/')) {
                // Rutas del backend que necesitan la URL base del servidor (sin /api)
                const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                imageUrl = baseUrl + imageUrl;
            } else if (imageUrl.startsWith('assets/')) {
                // Rutas del frontend que son relativas al HTML
                imageUrl = imageUrl;
            } else if (imageUrl.startsWith('http')) {
                // URLs completas
                imageUrl = imageUrl;
            } else {
                // Por defecto, asumir que es una ruta del backend
                const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                imageUrl = baseUrl + '/' + imageUrl.replace(/^\/+/, '');
            }
            
            item.innerHTML = `
                <img src="${imageUrl}" alt="${image.caption || `Imagen ${index + 1}`}" 
                     data-lightbox="gallery" data-title="${image.caption || ''}">
                ${image.caption ? `<div class="gallery-caption">${image.caption}</div>` : ''}
            `;
            
            grid.appendChild(item);
        });
        
        // Reinicializar Lightbox después de cargar las imágenes
        this.initializeLightbox();
    }
    
    initializeLightbox() {
        try {
            // Destruir instancia anterior de Lightbox si existe
            if (window.lightboxInstance) {
                window.lightboxInstance.destroy();
            }
            
            // Inicializar nueva instancia de Lightbox
            if (typeof lightbox !== 'undefined') {
                window.lightboxInstance = lightbox.option({
                    'resizeDuration': 200,
                    'wrapAround': true,
                    'albumLabel': 'Imagen %1 de %2'
                });
            }
        } catch (error) {
            console.warn('Error initializing Lightbox:', error);
        }
    }
    
    populateTimeline() {
        const container = document.getElementById('timelineContainer');
        container.innerHTML = '';
        
        if (!this.memorialData.timeline || this.memorialData.timeline.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay eventos en el timeline</p>';
            return;
        }
        
        this.memorialData.timeline.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';

            // Formatear fecha
            let dateStr = '';
            if (item.date) {
                const dateObj = new Date(item.date);
                dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : item.date;
            }

            // Construir la URL correcta para la imagen si existe
            let imageUrl = '';
            if (item.imageUrl || item.image_url) {
                let imgUrl = item.imageUrl || item.image_url;
                // Si no empieza con /uploads/ y no es absoluta ni assets/, anteponer /uploads/
                if (!imgUrl.startsWith('/') && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
                    imgUrl = '/uploads/' + imgUrl;
                }
                if (imgUrl.startsWith('/uploads/')) {
                    const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                    imageUrl = baseUrl + imgUrl;
                } else if (imgUrl.startsWith('assets/')) {
                    imageUrl = imgUrl;
                } else if (imgUrl.startsWith('http')) {
                    imageUrl = imgUrl;
                } else {
                    const baseUrl = window.API_BASE_URL || 'http://localhost:3000'; // Assuming API_BASE_URL is available or use a default
                    imageUrl = baseUrl + '/' + imgUrl.replace(/^\/+/,'');
                }
            }
            
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-year">${dateStr}</div>
                    <div class="timeline-event"><strong>${item.title || ''}</strong></div>
                    ${item.description ? `<div class="timeline-description">${item.description}</div>` : ''}
                    ${imageUrl ? `<img src="${imageUrl}" class="timeline-img" alt="Imagen evento">` : ''}
                </div>
                <div class="timeline-dot"></div>
            `;
            
            container.appendChild(timelineItem);
        });
    }
    
    async loadMessages() {
        // Los mensajes ya vienen incluidos en la respuesta principal del memorial
        if (this.memorialData && this.memorialData.messages) {
            this.messages = this.memorialData.messages;
            this.populateMessages();
        } else {
            // Si no hay mensajes en los datos del memorial, mostrar lista vacía
            console.log('No hay mensajes disponibles en los datos del memorial');
            this.messages = [];
                this.populateMessages();
            }
    }
    
    loadSampleMessages() {
        this.messages = [
            {
                id: 1,
                visitor_name: 'Ana López',
                message: 'María fue una gran amiga. Siempre tenía una palabra de aliento para todos. La extrañaremos mucho.',
                created_at: '2023-11-25T10:30:00Z',
                is_anonymous: false
            },
            {
                id: 2,
                visitor_name: 'Carlos Rodríguez',
                message: 'Mi más sentido pésame a toda la familia. María era una persona muy especial.',
                created_at: '2023-11-24T15:45:00Z',
                is_anonymous: false
            },
            {
                id: 3,
                visitor_name: 'Anónimo',
                message: 'Que descanse en paz. Sus enseñanzas vivirán para siempre en nuestros corazones.',
                created_at: '2023-11-23T09:15:00Z',
                is_anonymous: true
            }
        ];
        this.populateMessages();
    }
    
    populateMessages() {
        const list = document.getElementById('messagesList');
        list.innerHTML = '';
        
        if (!this.messages || this.messages.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No hay mensajes aún. Sé el primero en dejar un mensaje.</p>';
            return;
        }
        
        this.messages.forEach(message => {
            const item = document.createElement('div');
            item.className = 'message-item';
            
            // Manejar tanto el formato del memorial público como el formato de ejemplo
            const author = message.visitorName || (message.is_anonymous ? 'Anónimo' : message.visitor_name);
            const date = new Date(message.createdAt || message.created_at).toLocaleDateString();
            
            item.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${author}</span>
                    <span class="message-date">${date}</span>
                </div>
                <p class="message-text">${message.message}</p>
            `;
            
            list.appendChild(item);
        });
        
        // Update message count
        document.getElementById('messageCount').textContent = this.messages.length;
    }
    
    async loadCandles() {
        // Las velas ya vienen incluidas en la respuesta principal del memorial
        if (this.memorialData && this.memorialData.candles) {
            this.candles = this.memorialData.candles;
            this.populateCandles();
        } else {
            // Si no hay velas en los datos del memorial, mostrar lista vacía
            console.log('No hay velas disponibles en los datos del memorial');
            this.candles = [];
            this.populateCandles();
        }
    }
    
    loadSampleCandles() {
        this.candles = [
            {
                id: 1,
                visitorName: 'Juan González',
                message: 'Te extraño mucho, mamá',
                createdAt: '2023-11-25T12:00:00Z'
            },
            {
                id: 2,
                visitorName: 'María Elena',
                message: 'Que brille tu luz por siempre',
                createdAt: '2023-11-24T18:30:00Z'
            },
            {
                id: 3,
                visitorName: 'Roberto',
                message: 'En memoria de una gran persona',
                createdAt: '2023-11-23T14:15:00Z'
            }
        ];
        this.populateCandles();
    }
    
    populateCandles() {
        const grid = document.getElementById('candlesGrid');
        grid.innerHTML = '';
        
        if (!this.candles || this.candles.length === 0) {
            grid.innerHTML = '<p class="text-center text-muted">No hay velas encendidas aún. Sé el primero en encender una vela.</p>';
            return;
        }
        
        this.candles.forEach(candle => {
            const item = document.createElement('div');
            item.className = 'virtual-candle';
            
            // Manejar tanto el formato del memorial público como el formato de ejemplo
            const visitorName = candle.visitorName || candle.visitor_name || 'Anónimo';
            const message = candle.message || '';
            const createdAt = candle.createdAt || candle.created_at;
            
            item.innerHTML = `
                <div class="candle-animation">
                    <div class="candle">
                        <div class="flame"></div>
                        <div class="wick"></div>
                        <div class="wax"></div>
                    </div>
                </div>
                <div class="candle-info">
                    <div class="candle-author">${visitorName}</div>
                    ${message ? `<div class="candle-message">${message}</div>` : ''}
                    <div class="candle-date">${this.formatDate(createdAt)}</div>
                </div>
            `;
            
            grid.appendChild(item);
        });
        
        // Update candle count
        this.updateCandleCount();
    }
    
    updateCandleCount() {
        const count = this.candles ? this.candles.length : 0;
        document.getElementById('candleCount').textContent = count;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    switchTab(tabName) {
        if (!tabName) {
            console.error('No tab name provided');
            return;
        }
        
        // Hide all tabs
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show target tab
        const targetTab = document.getElementById(`${tabName}Tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error(`Target tab not found: ${tabName}Tab`);
        }
        
        // Activate nav tab
        const navTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (navTab) {
            navTab.classList.add('active');
        } else {
            console.error(`Navigation tab not found: ${tabName}`);
        }
        
        this.currentTab = tabName;
    }
    
    showMessageModal() {
        document.getElementById('messageModal').classList.add('active');
        // Verificar si el usuario está autenticado
        if (this.isAuthenticated()) {
            this.showForm('message');
        } else {
            this.showAuthCheck('message');
        }
    }
    
    hideMessageModal() {
        document.getElementById('messageModal').classList.remove('active');
        document.getElementById('messageForm').reset();
        // Resetear a la vista de auth check
        this.showAuthCheck('message');
    }
    
    showAuthCheck(type) {
        const authCheck = document.getElementById(`${type}AuthCheck`);
        const form = document.getElementById(`${type}Form`);
        
        if (authCheck && form) {
            authCheck.style.display = 'block';
            form.style.display = 'none';
        }
    }
    
    showForm(type) {
        const authCheck = document.getElementById(`${type}AuthCheck`);
        const form = document.getElementById(`${type}Form`);
        
        if (authCheck && form) {
            authCheck.style.display = 'none';
            form.style.display = 'block';
        }
    }
    
    redirectToLogin(type) {
        // Guardar la URL actual para regresar después del login
        const currentUrl = window.location.href;
        localStorage.setItem('returnUrl', currentUrl);
        localStorage.setItem('returnAction', type);
        
        // Redirigir al login
        window.location.href = '/login.html';
    }
    
    redirectToRegister(type) {
        // Guardar la URL actual para regresar después del registro
        const currentUrl = window.location.href;
        localStorage.setItem('returnUrl', currentUrl);
        localStorage.setItem('returnAction', type);
        
        // Redirigir al registro
        window.location.href = '/register.html';
    }
    
    isAuthenticated() {
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }
        
        // Verificar si el token no ha expirado
        try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenData.exp && tokenData.exp < currentTime) {
                // Token expirado, limpiarlo
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error parsing token:', error);
            // Token inválido, limpiarlo
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    }
    
    checkReturnFromAuth() {
        // Verificar si el usuario regresó después de autenticarse
        const returnAction = localStorage.getItem('returnAction');
        const returnUrl = localStorage.getItem('returnUrl');
        
        if (returnAction && returnUrl && this.isAuthenticated()) {
            // Limpiar los datos de retorno
            localStorage.removeItem('returnAction');
            localStorage.removeItem('returnUrl');
            
            // Mostrar el modal correspondiente con el formulario
            if (returnAction === 'message') {
                this.showMessageModal();
            } else if (returnAction === 'candle') {
                this.showCandleModal();
            }
        }
    }
    
    async submitMessage() {
        const form = document.getElementById('messageForm');
        const formData = new FormData(form);
        
        // Verificar autenticación
        if (!this.isAuthenticated()) {
            this.showNotification('Debes estar autenticado para enviar mensajes', 'error');
            return;
        }
        
        try {
            const response = await client.addMessage(this.memorialId, {
                visitorName: formData.get('visitorName'),
                message: formData.get('messageText'),
                isAnonymous: formData.get('isAnonymous') === 'on'
            });
            
            if (response.success) {
                this.showNotification('Mensaje enviado exitosamente', 'success');
                this.hideMessageModal();
                await this.loadMessages();
            } else {
                this.showNotification(response.message || 'Error al enviar el mensaje', 'error');
            }
        } catch (error) {
            console.error('Error submitting message:', error);
            this.showNotification('Error al enviar el mensaje', 'error');
        }
    }
    
    showCandleModal() {
        document.getElementById('candleModal').classList.add('active');
        // Verificar si el usuario está autenticado
        if (this.isAuthenticated()) {
            this.showForm('candle');
        } else {
            this.showAuthCheck('candle');
        }
    }
    
    hideCandleModal() {
        document.getElementById('candleModal').classList.remove('active');
        document.getElementById('candleForm').reset();
    }
    
    async submitCandle() {
        const form = document.getElementById('candleForm');
        const formData = new FormData(form);
        
        // Verificar autenticación
        if (!this.isAuthenticated()) {
            this.showNotification('Debes estar autenticado para encender velas', 'error');
            return;
        }
        
        try {
            const response = await client.addCandle(this.memorialId, {
                visitorName: formData.get('candleName'),
                message: formData.get('candleMessage') || null
            });
            
            if (response.success) {
                this.showNotification('Vela encendida exitosamente', 'success');
                this.hideCandleModal();
                await this.loadCandles();
                // Actualizar contador de velas
                this.updateCandleCount();
            } else {
                this.showNotification(response.message || 'Error al encender la vela', 'error');
            }
        } catch (error) {
            console.error('Error submitting candle:', error);
            this.showNotification('Error al encender la vela', 'error');
        }
    }
    
    showShareModal() {
        document.getElementById('shareModal').classList.add('active');
    }
    
    hideShareModal() {
        document.getElementById('shareModal').classList.remove('active');
    }
    
    shareContent(platform) {
        const url = window.location.href;
        const title = `${this.memorialData.name} - Perfil Memorial`;
        const text = `Honra la memoria de ${this.memorialData.name} en Despedida Eterna`;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showNotification('Enlace copiado al portapapeles', 'success');
                });
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    generateQRCode() {
        try {
            // Verificar que la librería QRCode esté disponible
            if (typeof QRCode === 'undefined') {
                console.warn('QRCode library not available, skipping QR generation');
                return;
            }
            
            const url = window.location.href;
            
            // Generate QR for floating element
            const qrCodeElement = document.getElementById('qrCode');
            if (qrCodeElement) {
                // Limpiar el elemento antes de generar el QR
                qrCodeElement.innerHTML = '';
                new QRCode(qrCodeElement, {
                    text: url,
                    width: 80,
                    height: 80,
                    colorDark: '#000000',
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
            
            // Generate QR for share modal
            const shareQRCodeElement = document.getElementById('shareQRCode');
            if (shareQRCodeElement) {
                // Limpiar el elemento antes de generar el QR
                shareQRCodeElement.innerHTML = '';
                new QRCode(shareQRCodeElement, {
                    text: url,
                    width: 150,
                    height: 150,
                    colorDark: '#000000',
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        } catch (error) {
            console.warn('Error generating QR code:', error);
        }
    }
    
    setupBackgroundMusic() {
        if (this.memorialData.background_music) {
            const musicPlayer = document.getElementById('musicPlayer');
            const audio = document.getElementById('backgroundMusic');
            
            audio.src = this.memorialData.background_music;
            musicPlayer.style.display = 'flex';
            
            // Auto-play with user interaction
            document.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play().catch(() => {
                        // Auto-play blocked
                    });
                }
            }, { once: true });
        }
    }
    
    toggleMusic() {
        const audio = document.getElementById('backgroundMusic');
        const toggle = document.getElementById('musicToggle');
        
        if (audio.paused) {
            audio.play();
            toggle.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            toggle.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.showNotification('Sesión cerrada exitosamente', 'success');
        window.location.href = '/';
    }
}

// Initialize memorial view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que estamos en la página correcta
    if (document.querySelector('.content-nav')) {
        try {
    window.memorialView = new MemorialView();
            console.log('MemorialView initialized successfully');
        } catch (error) {
            console.error('Error initializing MemorialView:', error);
        }
    } else {
        console.log('Not on memorial page, skipping initialization');
    }
}); 