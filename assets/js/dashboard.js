// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.userData = null;
        this.memorials = [];
        this.events = [];
        this.products = [];
        this.orders = [];
        this.subscriptions = [];
        this.notifications = [];
        
        // Cache para evitar peticiones duplicadas
        this.cache = {
            memorials: { data: null, timestamp: 0, ttl: 30000 },
            events: { data: null, timestamp: 0, ttl: 30000 },
            products: { data: null, timestamp: 0, ttl: 60000 },
            orders: { data: null, timestamp: 0, ttl: 60000 },
            subscriptions: { data: null, timestamp: 0, ttl: 60000 }
        };
        
        // Variables para los gráficos
        this.visitsChart = null;
        this.messagesChart = null;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.checkAuth();
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupCharts();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Sidebar toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Quick actions
        const createMemorialBtn = document.getElementById('createMemorialBtn');
        if (createMemorialBtn) {
            createMemorialBtn.addEventListener('click', () => {
                this.showCreateMemorialModal();
            });
        }
        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                this.showCreateEventModal();
            });
        }
        const viewStoreBtn = document.getElementById('viewStoreBtn');
        if (viewStoreBtn) {
            viewStoreBtn.addEventListener('click', () => {
                this.navigateToSection('store');
            });
        }
        const viewCartBtn = document.getElementById('viewCartBtn');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                window.location.href = '/carrito.html';
            });
        }
        const inviteFriendsBtn = document.getElementById('inviteFriendsBtn');
        if (inviteFriendsBtn) {
            inviteFriendsBtn.addEventListener('click', () => {
                this.inviteFriends();
            });
        }
        
        // Modal events
        const closeMemorialModal = document.getElementById('closeMemorialModal');
        if (closeMemorialModal) {
            closeMemorialModal.addEventListener('click', () => {
                this.hideCreateMemorialModal();
            });
        }
        const cancelMemorialBtn = document.getElementById('cancelMemorialBtn');
        if (cancelMemorialBtn) {
            cancelMemorialBtn.addEventListener('click', () => {
                this.hideCreateMemorialModal();
            });
        }
        const createMemorialForm = document.getElementById('createMemorialForm');
        if (createMemorialForm && !createMemorialForm.hasAttribute('data-listener-added')) {
            createMemorialForm.setAttribute('data-listener-added', 'true');
            createMemorialForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createMemorial();
            });
        }
        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.toggleNotificationPanel();
            });
        }
        const closeNotificationPanel = document.getElementById('closeNotificationPanel');
        if (closeNotificationPanel) {
            closeNotificationPanel.addEventListener('click', () => {
                this.hideNotificationPanel();
            });
        }
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm && !profileForm.hasAttribute('data-listener-added')) {
            profileForm.setAttribute('data-listener-added', 'true');
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
        // Event listeners para el modal de eventos
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn && !newEventBtn.hasAttribute('data-listener-added')) {
            newEventBtn.setAttribute('data-listener-added', 'true');
            newEventBtn.addEventListener('click', () => {
                this.showCreateEventModal();
            });
        }
        const newMemorialBtn = document.getElementById('newMemorialBtn');
        if (newMemorialBtn) {
            newMemorialBtn.addEventListener('click', () => {
                this.showCreateMemorialModal();
            });
        }
        const closeEventModal = document.getElementById('closeEventModal');
        if (closeEventModal) {
            closeEventModal.addEventListener('click', () => {
                this.hideCreateEventModal();
            });
        }
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        if (cancelEventBtn) {
            cancelEventBtn.addEventListener('click', () => {
                this.hideCreateEventModal();
            });
        }
        const createEventForm = document.getElementById('createEventForm');
        if (createEventForm && !createEventForm.hasAttribute('data-listener-added')) {
            createEventForm.setAttribute('data-listener-added', 'true');
            createEventForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = createEventForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                await this.createEvent();
                submitBtn.disabled = false;
            });
        }
        // Event listeners para subida de archivos en el modal de memorial
        this.setupFileUpload();
        const eventIsVirtual = document.getElementById('eventIsVirtual');
        if (eventIsVirtual) {
            eventIsVirtual.addEventListener('change', (e) => {
                const group = document.getElementById('virtualLinkGroup');
                if (e.target.value === 'true') {
                    group.style.display = '';
                } else {
                    group.style.display = 'none';
                    document.getElementById('eventVirtualLink').value = '';
                }
            });
        }
        // Event listeners para suscripciones
        const viewPlansBtn = document.getElementById('viewPlansBtn');
        if (viewPlansBtn) {
            viewPlansBtn.addEventListener('click', () => {
                this.showPlansModal();
            });
        }
        const upgradePlanBtn = document.getElementById('upgradePlanBtn');
        if (upgradePlanBtn) {
            upgradePlanBtn.addEventListener('click', () => {
                this.showPlansModal();
            });
        }
        // Foto de perfil
        const profileAvatarInput = document.getElementById('profileAvatarInput');
        const profileAvatarPreview = document.getElementById('profileAvatarPreview');
        const removeAvatarBtn = document.getElementById('removeAvatarBtn');
        if (profileAvatarInput && profileAvatarPreview) {
            profileAvatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        profileAvatarPreview.src = ev.target.result;
                        profileAvatarPreview.classList.add('changed');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (removeAvatarBtn && profileAvatarPreview) {
            removeAvatarBtn.addEventListener('click', () => {
                profileAvatarPreview.src = 'assets/images/default-avatar.png';
                profileAvatarInput.value = '';
                profileAvatarPreview.classList.add('changed');
            });
        }
        // Modal cambio contraseña
        const openChangePasswordModal = document.getElementById('openChangePasswordModal');
        const changePasswordModal = document.getElementById('changePasswordModal');
        const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
        const cancelChangePasswordBtn = document.getElementById('cancelChangePasswordBtn');
        if (openChangePasswordModal && changePasswordModal) {
            openChangePasswordModal.addEventListener('click', () => {
                changePasswordModal.classList.add('active');
            });
        }
        if (closeChangePasswordModal && changePasswordModal) {
            closeChangePasswordModal.addEventListener('click', () => {
                changePasswordModal.classList.remove('active');
            });
        }
        if (cancelChangePasswordBtn && changePasswordModal) {
            cancelChangePasswordBtn.addEventListener('click', () => {
                changePasswordModal.classList.remove('active');
            });
        }
        // Enviar cambio de contraseña
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.changePassword();
            });
        }
    }
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        // Verificación simplificada - solo verificar que existe el token
        console.log('✅ Token encontrado, continuando...');
    }
    
    async loadUserData() {
        try {
            console.log('🔄 Cargando datos del usuario...');
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                this.userData = await response.json();
                this.updateUserInterface();
                // Actualizar foto de perfil
                const profileAvatarPreview = document.getElementById('profileAvatarPreview');
                if (profileAvatarPreview && this.userData && this.userData.avatarUrl) {
                    profileAvatarPreview.src = this.userData.avatarUrl;
                }
                this.updateCartCount(); // Actualizar contador del carrito
            } else {
                console.error('❌ Error en la respuesta:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('❌ Error details:', errorData);
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.showNotification('Error al cargar datos del usuario', 'error');
        }
    }
    
  
    
    updateUserInterface() {
        console.log('🔄 updateUserInterface llamada');
        if (this.userData) {
            // Compatibilidad con camelCase y snake_case
            const firstName = this.userData.firstName || this.userData.first_name || '';
            const lastName = this.userData.lastName || this.userData.last_name || '';
            document.getElementById('userName').textContent = `${firstName} ${lastName}`;
            const avatarUrl = this.userData.avatarUrl && this.userData.avatarUrl.trim() !== ''
                ? this.userData.avatarUrl
                : 'assets/images/default-avatar.png';
            document.getElementById('userAvatar').src = avatarUrl;
            // Update profile form
            document.getElementById('firstName').value = firstName;
            document.getElementById('lastName').value = lastName;
            document.getElementById('email').value = this.userData.email;
            document.getElementById('phone').value = this.userData.phone || '';
        }
    }
    
    async loadDashboardData() {
        await Promise.all([
            this.loadMemorials(),
            this.loadEvents(),
            this.loadStats(),
            this.loadRecentActivity(),
            this.loadNotifications()
        ]);
    }
    
    async loadMemorials() {
        try {
            console.log('🔄 Cargando perfiles memoriales...');
            const grid = document.getElementById('memorialsGrid');
            
            // Mostrar estado de carga
            grid.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando perfiles memoriales...</p>
                </div>
            `;
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/memorials/my-memorials`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                this.memorials = data.memorials || [];
                console.log('✅ Perfiles memoriales cargados:', this.memorials.length);
                
                // Guardar en cache
                this.setCache('memorials', this.memorials);
                
                this.updateMemorialsGrid();
                this.updateMemorialCount();
            } else if (response.status === 429) {
                console.error('❌ Rate limit excedido');
                grid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Demasiadas solicitudes. Espera un momento y vuelve a intentar.</p>
                        <button class="btn btn-outline" onclick="setTimeout(() => dashboard.loadMemorials(), 2000)">
                            <i class="fas fa-redo"></i>
                            Reintentar en 2 segundos
                        </button>
                    </div>
                `;
            } else {
                console.error('❌ Error loading memorials:', response.status, response.statusText);
                const errorData = await response.json().catch(() => ({}));
                grid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar los perfiles memoriales</p>
                        <small>${errorData.message || `Error ${response.status}`}</small>
                        <button class="btn btn-outline" onclick="dashboard.loadMemorials()">
                            <i class="fas fa-redo"></i>
                            Reintentar
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading memorials:', error);
            const grid = document.getElementById('memorialsGrid');
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error de conexión</p>
                    <small>${error.message}</small>
                    <button class="btn btn-outline" onclick="dashboard.loadMemorials()">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
    
    async loadEvents() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/events/my-events`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.events = data.events || [];
                
                // Guardar en cache
                this.setCache('events', this.events);
                
                this.updateEventsGrid();
                this.updateEventCount();
            } else {
                console.error('Error loading events:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }
    
    async loadStats() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.updateStats(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    async loadRecentActivity() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const activities = await response.json();
                this.updateActivityList(activities);
            }
        } catch (error) {
            console.error('Error loading activity:', error);
        }
    }
    
    async loadNotifications() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.notifications = await response.json();
                this.updateNotificationCount();
                this.updateNotificationList();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    updateStats(stats) {
        document.getElementById('memorialCount').textContent = stats.stats?.totalMemorials || 0;
        document.getElementById('eventCount').textContent = stats.stats?.totalEvents || 0;
        document.getElementById('totalViews').textContent = '0'; // Por ahora hardcodeado
        document.getElementById('totalCandles').textContent = '0'; // Por ahora hardcodeado
    }
    
    updateMemorialCount() {
        document.getElementById('memorialCount').textContent = this.memorials.length;
    }
    
    updateEventCount() {
        const activeEvents = this.events.filter(event => new Date(event.event_date) > new Date());
        document.getElementById('eventCount').textContent = activeEvents.length;
    }
    
    updateMemorialsGrid() {
        const grid = document.getElementById('memorialsGrid');
        grid.innerHTML = '';
        
        if (this.memorials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-circle"></i>
                    <h3>No tienes perfiles memoriales</h3>
                    <p>Crea tu primer perfil memorial para honrar la memoria de un ser querido</p>
                    <button class="btn btn-primary" onclick="dashboard.showCreateMemorialModal()">
                        <i class="fas fa-plus"></i>
                        Crear Perfil
                    </button>
                </div>
            `;
            return;
        }
        
        this.memorials.forEach(memorial => {
            const card = this.createMemorialCard(memorial);
            grid.appendChild(card);
        });
    }
    
    createMemorialCard(memorial) {
        const card = document.createElement('div');
        card.className = 'memorial-card';
        
        // Manejar imágenes - el backend devuelve mainImage si existe
        var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
        let imageUrl = 'assets/images/default-avatar.png';
        
        if (memorial.mainImage && memorial.mainImage !== '') {
            if (memorial.mainImage.startsWith('/uploads/')) {
                // Rutas del backend que necesitan la URL base del servidor (sin /api)
                const baseUrl = API_BASE_URL.replace('/api', '');
                imageUrl = baseUrl + memorial.mainImage;
            } else if (memorial.mainImage.startsWith('assets/')) {
                // Rutas del frontend que son relativas al HTML
                imageUrl = memorial.mainImage;
            } else if (memorial.mainImage.startsWith('http')) {
                // URLs completas
                imageUrl = memorial.mainImage;
            } else {
                // Por defecto, asumir que es una ruta del backend
                const baseUrl = API_BASE_URL.replace('/api', '');
                imageUrl = baseUrl + '/' + memorial.mainImage.replace(/^\/+/, '');
            }
        }
        
        // Formatear fechas
        const birthDate = memorial.birthDate ? new Date(memorial.birthDate).toLocaleDateString() : 'N/A';
        const deathDate = memorial.deathDate ? new Date(memorial.deathDate).toLocaleDateString() : 'N/A';
        
        // Determinar si la suscripción está activa
        const isActive = memorial.isActive !== false;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${memorial.name}" class="card-image" onerror="this.src='assets/images/default-avatar.png'">
            <div class="card-content">
                <h3 class="card-title">${memorial.name}</h3>
                <div class="card-dates">
                    <span><i class="fas fa-birthday-cake"></i> ${birthDate}</span>
                    <span><i class="fas fa-cross"></i> ${deathDate}</span>
                </div>
                <p class="card-description">${memorial.biography ? memorial.biography.substring(0, 100) + '...' : 'Sin descripción'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-eye"></i> ${memorial.viewCount || 0} vistas</span>
                    <span><i class="fas fa-heart"></i> ${memorial.candleCount || 0} velas</span>
                    <span><i class="fas fa-comment"></i> ${memorial.messageCount || 0} mensajes</span>
                </div>
                <div class="card-status ${isActive ? 'active' : 'expired'}">
                    <i class="fas fa-${isActive ? 'check-circle' : 'exclamation-circle'}"></i>
                    ${isActive ? 'Activo' : 'Expirado'}
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.viewMemorial(${memorial.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.editMemorial(${memorial.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.shareMemorial(${memorial.id})">
                        <i class="fas fa-share"></i>
                        Compartir
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    updateEventsGrid() {
        const grid = document.getElementById('eventsGrid');
        grid.innerHTML = '';
        
        if (this.events.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No tienes eventos</h3>
                    <p>Crea tu primer evento para organizar una despedida especial</p>
                    <button class="btn btn-primary" onclick="dashboard.showCreateEventModal()">
                        <i class="fas fa-plus"></i>
                        Crear Evento
                    </button>
                </div>
            `;
            return;
        }
        
        this.events.forEach(event => {
            const card = this.createEventCard(event);
            grid.appendChild(card);
        });
    }
    
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        const eventDate = new Date(event.event_date);
        const isPast = eventDate < new Date();
        
        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <p class="card-description">${event.description || 'Sin descripción'}</p>
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString()}</span>
                    <span><i class="fas fa-clock"></i> ${eventDate.toLocaleTimeString()}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location || 'Ubicación no especificada'}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.viewEvent(${event.id})">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.manageGuests(${event.id})">
                        <i class="fas fa-users"></i>
                        Invitados
                    </button>
                </div>
            </div>
        `;
        
        if (isPast) {
            card.classList.add('past-event');
        }
        
        return card;
    }
    
    updateActivityList(activities) {
        const list = document.getElementById('activityList');
        list.innerHTML = '';
        
        if (activities.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No hay actividad reciente</p>';
            return;
        }
        
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const icon = this.getActivityIcon(activity.type);
            const time = this.formatTime(activity.created_at);
            
            item.innerHTML = `
                <div class="activity-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <h4 class="activity-title">${activity.title}</h4>
                    <p class="activity-time">${time}</p>
                </div>
            `;
            
            list.appendChild(item);
        });
    }
    
    getActivityIcon(type) {
        const icons = {
            'memorial_created': 'fas fa-user-circle',
            'event_created': 'fas fa-calendar-plus',
            'message_received': 'fas fa-comment',
            'candle_lit': 'fas fa-heart',
            'subscription_renewed': 'fas fa-credit-card'
        };
        return icons[type] || 'fas fa-info-circle';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) {
            return `Hace ${minutes} minutos`;
        } else if (hours < 24) {
            return `Hace ${hours} horas`;
        } else if (days < 7) {
            return `Hace ${days} días`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        
        if (unreadCount > 0) {
            document.getElementById('notificationCount').style.display = 'block';
        } else {
            document.getElementById('notificationCount').style.display = 'none';
        }
    }
    
    updateNotificationList() {
        const list = document.getElementById('notificationList');
        list.innerHTML = '';
        
        if (this.notifications.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No hay notificaciones</p>';
            return;
        }
        
        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            
            const time = this.formatTime(notification.created_at);
            
            item.innerHTML = `
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${time}</span>
                </div>
            `;
            
            if (!notification.read) {
                item.addEventListener('click', () => {
                    this.markNotificationAsRead(notification.id);
                });
            }
            
            list.appendChild(item);
        });
    }
    
    async markNotificationAsRead(notificationId) {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/users/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    navigateToSection(section) {
        // Hide all sections
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        
        // Show target section
        document.getElementById(`${section}Section`).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Update page title
        document.querySelector('.page-title').textContent = this.getSectionTitle(section);
        
        this.currentSection = section;
        
        // Load section-specific data
        this.loadSectionData(section);
    }
    
    getSectionTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'memorials': 'Perfiles Memoriales',
            'events': 'Eventos',
            'store': 'Tienda',
            'orders': 'Mis Pedidos',
            'subscriptions': 'Suscripciones',
            'profile': 'Mi Perfil'
        };
        return titles[section] || 'Dashboard';
    }
    
    async loadSectionData(section) {
        switch (section) {
            case 'memorials':
                // Usar cache si está válido
                if (this.isCacheValid('memorials')) {
                    console.log('📦 Usando cache para memoriales');
                    this.memorials = this.getCache('memorials');
                    this.updateMemorialsGrid();
                } else {
                    await this.loadMemorials();
                }
                break;
            case 'events':
                if (this.isCacheValid('events')) {
                    console.log('📦 Usando cache para eventos');
                    this.events = this.getCache('events');
                    this.updateEventsGrid();
                } else {
                    await this.loadEvents();
                }
                break;
            case 'store':
                if (this.isCacheValid('products')) {
                    console.log('📦 Usando cache para productos');
                    this.products = this.getCache('products');
                    this.updateProductsGrid();
                } else {
                    await this.loadProducts();
                }
                break;
            case 'orders':
                if (this.isCacheValid('orders')) {
                    console.log('📦 Usando cache para pedidos');
                    this.orders = this.getCache('orders');
                    this.updateOrdersList();
                } else {
                    await this.loadOrders();
                }
                break;
            case 'subscriptions':
                if (this.isCacheValid('subscriptions')) {
                    console.log('📦 Usando cache para suscripciones');
                    this.subscriptions = this.getCache('subscriptions');
                    this.updateSubscriptionsList();
                } else {
                    await this.loadSubscriptions();
                }
                break;
        }
    }
    
    async loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                const data = await response.json();
                console.log('📡 Datos recibidos de la API:', data);
                this.products = data.products || [];
                console.log('📦 Productos asignados:', this.products);
                this.updateProductsGrid();
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
    
    updateProductsGrid() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';
        
        console.log('🔍 Productos cargados:', this.products);
        
        this.products.forEach(product => {
            console.log(`📦 Producto: ${product.name}, imageUrl: ${product.imageUrl}`);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const imageUrl = product.imageUrl ? `http://localhost:3000${product.imageUrl}` : 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            console.log(`🖼️ URL final de imagen: ${imageUrl}`);
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-description">${product.description}</p>
                    <div class="card-meta">
                        <span class="price">$${product.price}</span>
                        <span class="category">${product.category}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" onclick="dashboard.addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    async loadOrders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.orders = await response.json();
                this.updateOrdersList();
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    updateOrdersList() {
        const list = document.getElementById('ordersList');
        list.innerHTML = '';
        
        if (this.orders.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No tienes pedidos</p>';
            return;
        }
        
        this.orders.forEach(order => {
            const item = document.createElement('div');
            item.className = 'order-item';
            
            item.innerHTML = `
                <div class="order-header">
                    <h4>Pedido #${order.id}</h4>
                    <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>Total:</strong> $${order.total_amount}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            `;
            
            list.appendChild(item);
        });
    }
    
    getStatusText(status) {
        const statuses = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statuses[status] || status;
    }
    
    async loadSubscriptions() {
        try {
            console.log('💳 Cargando suscripciones...');
            
            // Datos de ejemplo para demostración
            this.subscriptions = [
                {
                    id: 1,
                    plan_type: 'premium',
                    memorial_name: 'María González',
                    start_date: '2024-01-15',
                    end_date: '2024-12-15',
                    amount: 39.99,
                    payment_status: 'completed',
                    auto_renew: true
                },
                {
                    id: 2,
                    plan_type: 'standard',
                    memorial_name: 'Carlos Rodríguez',
                    start_date: '2024-02-01',
                    end_date: '2024-05-01',
                    amount: 19.99,
                    payment_status: 'completed',
                    auto_renew: false
                }
            ];
            
            this.updateSubscriptionsList();
            this.updateSubscriptionStats();
            this.loadPaymentHistory();
            
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            this.showNotification('Error al cargar suscripciones', 'error');
        }
    }
    
    updateSubscriptionsList() {
        const list = document.getElementById('subscriptionsList');
        const emptyState = document.getElementById('subscriptionsEmpty');
        
        if (!list) return;
        
        list.innerHTML = '';
        
        if (this.subscriptions.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        this.subscriptions.forEach(subscription => {
            const item = document.createElement('div');
            item.className = 'subscription-item';
            
            const endDate = new Date(subscription.end_date);
            const isExpired = endDate < new Date();
            const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
            
            item.innerHTML = `
                <div class="subscription-header">
                    <div class="subscription-info">
                        <h4>${subscription.memorial_name}</h4>
                        <span class="subscription-plan ${subscription.plan_type}">${this.getPlanText(subscription.plan_type)}</span>
                    </div>
                    <div class="subscription-status">
                        <span class="status-badge ${subscription.payment_status}">${this.getPaymentStatusText(subscription.payment_status)}</span>
                    </div>
                </div>
                <div class="subscription-details">
                    <div class="detail-row">
                        <span class="detail-label">Inicio:</span>
                        <span class="detail-value">${new Date(subscription.start_date).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Vence:</span>
                        <span class="detail-value ${isExpired ? 'expired' : ''}">${endDate.toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Precio:</span>
                        <span class="detail-value">$${subscription.amount}/mes</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Renovación:</span>
                        <span class="detail-value">${subscription.auto_renew ? 'Automática' : 'Manual'}</span>
                    </div>
                    ${!isExpired && daysUntilExpiry <= 30 ? `
                        <div class="detail-row warning">
                            <span class="detail-label">⚠️ Vence en ${daysUntilExpiry} días</span>
                        </div>
                    ` : ''}
                </div>
                <div class="subscription-actions">
                    ${!isExpired ? `
                        <button class="btn btn-outline btn-sm" onclick="dashboard.renewSubscription(${subscription.id})">
                            <i class="fas fa-sync-alt"></i> Renovar
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="dashboard.cancelSubscription(${subscription.id})">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-sm" onclick="dashboard.renewSubscription(${subscription.id})">
                            <i class="fas fa-play"></i> Reactivar
                        </button>
                    `}
                    <button class="btn btn-outline btn-sm" onclick="dashboard.viewSubscriptionDetails(${subscription.id})">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            `;
            
            list.appendChild(item);
        });
    }
    
    updateSubscriptionStats() {
        const activeCount = this.subscriptions.filter(s => new Date(s.end_date) > new Date()).length;
        const totalMemorials = this.subscriptions.length;
        const expiringSoon = this.subscriptions.filter(s => {
            const daysUntilExpiry = Math.ceil((new Date(s.end_date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length;
        const monthlySpending = this.subscriptions.reduce((total, s) => total + s.amount, 0);
        
        // Actualizar contadores
        const activeCountEl = document.getElementById('activeSubscriptionsCount');
        const totalMemorialsEl = document.getElementById('totalMemorialsCount');
        const expiringSoonEl = document.getElementById('expiringSoonCount');
        const monthlySpendingEl = document.getElementById('monthlySpending');
        
        if (activeCountEl) activeCountEl.textContent = activeCount;
        if (totalMemorialsEl) totalMemorialsEl.textContent = totalMemorials;
        if (expiringSoonEl) expiringSoonEl.textContent = expiringSoon;
        if (monthlySpendingEl) monthlySpendingEl.textContent = `$${monthlySpending.toFixed(2)}`;
    }
    
    loadPaymentHistory() {
        const paymentList = document.getElementById('paymentList');
        if (!paymentList) return;
        
        // Datos de ejemplo para el historial de pagos
        const payments = [
            {
                id: 1,
                date: '2024-01-15',
                description: 'Suscripción Premium - María González',
                amount: 39.99,
                status: 'completed'
            },
            {
                id: 2,
                date: '2024-02-01',
                description: 'Suscripción Estándar - Carlos Rodríguez',
                amount: 19.99,
                status: 'completed'
            },
            {
                id: 3,
                date: '2024-01-01',
                description: 'Suscripción Básica - Juan Pérez',
                amount: 9.99,
                status: 'failed'
            }
        ];
        
        paymentList.innerHTML = '';
        
        payments.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'payment-item';
            
            item.innerHTML = `
                <div class="payment-info">
                    <div class="payment-date">${new Date(payment.date).toLocaleDateString()}</div>
                    <div class="payment-description">${payment.description}</div>
                </div>
                <div class="payment-details">
                    <div class="payment-amount">$${payment.amount}</div>
                    <div class="payment-status ${payment.status}">${this.getPaymentStatusText(payment.status)}</div>
                </div>
            `;
            
            paymentList.appendChild(item);
        });
    }
    
    getPlanText(plan) {
        const plans = {
            'basic': 'Básico',
            'standard': 'Estándar',
            'premium': 'Premium',
            'eternal': 'Eterno'
        };
        return plans[plan] || plan;
    }
    
    getPaymentStatusText(status) {
        const statuses = {
            'pending': 'Pendiente',
            'completed': 'Completado',
            'failed': 'Fallido',
            'cancelled': 'Cancelado'
        };
        return statuses[status] || status;
    }
    
    setupCharts() {
        // Esperar un poco para asegurar que el DOM esté completamente listo
        setTimeout(() => {
            this.destroyCharts();
            this.setupVisitsChart();
            this.setupMessagesChart();
        }, 100);
    }
    
    destroyCharts() {
        // Destruir gráficos existentes
        if (this.visitsChart) {
            try {
                this.visitsChart.destroy();
            } catch (error) {
                console.warn('Error al destruir visitsChart:', error);
            }
            this.visitsChart = null;
        }
        
        if (this.messagesChart) {
            try {
                this.messagesChart.destroy();
            } catch (error) {
                console.warn('Error al destruir messagesChart:', error);
            }
            this.messagesChart = null;
        }
        
        // Verificar si Chart.js tiene registros de gráficos y limpiarlos
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.keys(Chart.instances).forEach(key => {
                try {
                    const chartInstance = Chart.instances[key];
                    if (chartInstance && typeof chartInstance.destroy === 'function') {
                        chartInstance.destroy();
                    }
                } catch (error) {
                    console.warn('Error al destruir Chart instance:', error);
                }
            });
        }
        
        // Limpiar cualquier gráfico que pueda estar en los canvas
        const visitsCanvas = document.getElementById('visitsChart');
        const messagesCanvas = document.getElementById('messagesChart');
        
        if (visitsCanvas) {
            try {
                const ctx = visitsCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, visitsCanvas.width, visitsCanvas.height);
                }
            } catch (error) {
                console.warn('Error al limpiar visitsChart canvas:', error);
            }
        }
        
        if (messagesCanvas) {
            try {
                const ctx = messagesCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, messagesCanvas.width, messagesCanvas.height);
                }
            } catch (error) {
                console.warn('Error al limpiar messagesChart canvas:', error);
            }
        }
    }
    
    setupVisitsChart() {
        const ctx = document.getElementById('visitsChart');
        if (!ctx) return;
        
        try {
            this.visitsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Visitas',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al crear visitsChart:', error);
        }
    }
    
    setupMessagesChart() {
        const ctx = document.getElementById('messagesChart');
        if (!ctx) return;
        
        try {
            this.messagesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Aprobados', 'Pendientes', 'Rechazados'],
                    datasets: [{
                        data: [12, 3, 1],
                        backgroundColor: ['#48bb78', '#ed8936', '#e53e3e']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al crear messagesChart:', error);
        }
    }
    
    showCreateMemorialModal() {
        document.getElementById('createMemorialModal').classList.add('active');
        setTimeout(() => {
            const planRadios = document.querySelectorAll('#createMemorialModal input[name="plan_type"]');
            const qrCheckbox = document.getElementById('modalHasQrPlate');
            // Eliminar listeners previos
            planRadios.forEach(radio => {
                radio.removeEventListener('change', updateModalTotal);
                radio.addEventListener('change', updateModalTotal);
            });
            if (qrCheckbox) {
                qrCheckbox.removeEventListener('change', updateModalTotal);
                qrCheckbox.addEventListener('change', updateModalTotal);
            }
            updateModalTotal();
        }, 100);
    }
    
    hideCreateMemorialModal() {
        document.getElementById('createMemorialModal').classList.remove('active');
        document.getElementById('createMemorialForm').reset();
    }
    
    async createMemorial() {
        const form = document.getElementById('createMemorialForm');
        const formData = new FormData(form);
        
        try {
            this.showLoading();
            
            // Obtener archivos seleccionados
            const fileInput = document.getElementById('memorialPhoto');
            const files = fileInput.files;
            
            // Crear FormData para enviar datos + archivos
            const submitData = new FormData();
            submitData.append('name', formData.get('name'));
            submitData.append('birthDate', formData.get('birthDate') || '');
            submitData.append('deathDate', formData.get('deathDate') || '');
            submitData.append('biography', formData.get('biography') || '');
            submitData.append('epitaph', formData.get('epitaph') || '');
            submitData.append('isPublic', 'true');
            
            // Duración seleccionada
            const duration = form.querySelector('input[name="duration"]:checked')?.value || '1m';
            submitData.append('duration', duration);
            
            // Agregar archivos si existen
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    submitData.append('memorial_images', files[i]);
                }
                console.log(`📁 Enviando ${files.length} archivo(s)`);
            }
            
            console.log('📝 Datos del memorial a enviar:', {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                deathDate: formData.get('deathDate'),
                biography: formData.get('biography'),
                epitaph: formData.get('epitaph'),
                files: files ? files.length : 0
            });
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            
            const response = await fetch(`${API_BASE_URL}/memorials`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No incluir Content-Type para FormData con archivos
                },
                body: submitData
            });
            
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Memorial creado exitosamente:', result);
                this.hideCreateMemorialModal();
                this.showNotification('Perfil memorial creado exitosamente', 'success');
                await this.loadMemorials();
                this.navigateToSection('memorials');
                // Limpiar input y previews
                const fileInput = document.getElementById('memorialPhoto');
                const filePreview = document.getElementById('filePreview');
                if (fileInput) fileInput.value = '';
                if (filePreview) filePreview.innerHTML = '';
            } else {
                const error = await response.json();
                console.error('❌ Error del servidor:', error);
                this.showNotification(error.message || 'Error al crear el perfil', 'error');
            }
        } catch (error) {
            console.error('❌ Error creating memorial:', error);
            this.showNotification('Error al crear el perfil memorial: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    toggleNotificationPanel() {
        document.getElementById('notificationPanel').classList.toggle('active');
    }
    
    hideNotificationPanel() {
        document.getElementById('notificationPanel').classList.remove('active');
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && sidebar.classList.contains('active')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.add('active');
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // Prevenir scroll del body cuando el sidebar está abierto
        document.body.style.overflow = 'hidden';
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
    }
    
    async updateProfile() {
        const form = document.getElementById('profileForm');
        const formData = new FormData(form);
        const profileAvatarInput = document.getElementById('profileAvatarInput');
        if (profileAvatarInput && profileAvatarInput.files[0]) {
            formData.append('avatar', profileAvatarInput.files[0]);
        } else if (profileAvatarPreview && profileAvatarPreview.classList.contains('changed') && profileAvatarPreview.src.includes('default-avatar.png')) {
            formData.append('remove_avatar', '1');
        }
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (response.ok) {
                this.showNotification('Perfil actualizado exitosamente', 'success');
                await this.loadUserData();
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Error al actualizar el perfil', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error al actualizar el perfil', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async logout() {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
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
    
    // Navigation methods
    viewMemorial(id) {
        window.location.href = `/memorial.html?id=${id}`;
    }
    
    editMemorial(id) {
        window.location.href = `/edit-memorial.html?id=${id}`;
    }
    
    shareMemorial(id) {
        const url = `${window.location.origin}/memorial.html?id=${id}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Enlace copiado al portapapeles', 'success');
        });
    }
    
    viewEvent(id) {
        window.location.href = `/event.html?id=${id}`;
    }
    
    editEvent(id) {
        window.location.href = `/edit-event.html?id=${id}`;
    }
    
    manageGuests(id) {
        window.location.href = `/event-guest.html?eventId=${id}`;
    }
    
    addToCart(productId) {
        // TODO: Implement shopping cart functionality
        this.showNotification('Producto agregado al carrito', 'success');
    }
    
    async renewSubscription(subscriptionId) {
        try {
            this.showLoading();
            
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/payments/create-subscription-preference`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription_id: subscriptionId
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Redirect to MercadoPago
                window.location.href = data.init_point;
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Error al renovar suscripción', 'error');
            }
        } catch (error) {
            console.error('Error renewing subscription:', error);
            this.showNotification('Error al renovar suscripción', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    inviteFriends() {
        const url = window.location.origin;
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Enlace de invitación copiado al portapapeles', 'success');
        });
    }
    
    // Métodos para manejar cache
    isCacheValid(key) {
        const cacheItem = this.cache[key];
        if (!cacheItem || !cacheItem.data) return false;
        return (Date.now() - cacheItem.timestamp) < cacheItem.ttl;
    }
    
    setCache(key, data) {
        this.cache[key] = {
            data: data,
            timestamp: Date.now(),
            ttl: this.cache[key].ttl
        };
    }
    
    getCache(key) {
        return this.cache[key]?.data || null;
    }
    
    clearCache(key) {
        if (key) {
            this.cache[key] = { data: null, timestamp: 0, ttl: this.cache[key].ttl };
        } else {
            Object.keys(this.cache).forEach(k => {
                this.cache[k] = { data: null, timestamp: 0, ttl: this.cache[k].ttl };
            });
        }
    }
    
    showCreateEventModal() {
        console.log('🔓 Abriendo modal de evento');
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Modal de evento abierto');
        } else {
            console.error('❌ Modal createEventModal no encontrado');
        }
    }
    
    hideCreateEventModal() {
        console.log('🔒 Cerrando modal de evento');
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.classList.remove('active');
            console.log('✅ Modal de evento cerrado');
        }
    }
    
    async createEvent() {
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const form = document.getElementById('createEventForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Limpiar y ajustar campos
            data.title = data.title?.trim();
            data.description = data.description?.trim() || null;
            data.location = data.location?.trim() || null;
            data.address = data.address?.trim() || null;
            data.itinerary = data.itinerary?.trim() || null;
            data.isPublic = data.isPublic === 'true';
            data.isVirtual = data.isVirtual === 'true';
            data.maxGuests = data.maxGuests ? parseInt(data.maxGuests) : null;
            // Solo enviar virtualLink si es virtual
            data.virtualLink = data.isVirtual ? (data.virtualLink?.trim() || null) : null;
            if (!data.isVirtual) {
                delete data.virtualLink;
            }
            // Convertir fecha al formato esperado por el backend
            if (data.eventDate) {
                const [date, time] = data.eventDate.split('T');
                data.eventDate = `${date} ${time ? time + ':00' : '00:00:00'}`;
            }
            
            console.log('📝 Datos del formulario:', data);
            
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Evento creado:', result);
                this.hideCreateEventModal();
                this.showNotification('Evento creado exitosamente', 'success');
                await this.loadEvents();
            } else {
                const error = await response.json();
                console.error('❌ Error del servidor:', error);
                this.showNotification(error.message || 'Error al crear el evento', 'error');
            }
        } catch (error) {
            console.error('❌ Error en createEvent:', error);
            this.showNotification('Error al crear el evento', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    setupFileUpload() {
        const fileInput = document.getElementById('memorialPhoto');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const filePreview = document.getElementById('filePreview');
        
        if (!fileInput || !fileUploadArea || !filePreview) {
            console.error('❌ Elementos de subida de archivos no encontrados');
            return;
        }
        
        // Click en el área de subida
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Click en el texto de subida
        const uploadText = fileUploadArea.querySelector('.file-upload-text');
        if (uploadText) {
            uploadText.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }
        
        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileSelection(files);
            }
        });
        
        // Cambio en el input de archivos
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.handleFileSelection(files);
            }
        });
    }
    
    handleFileSelection(files) {
        const filePreview = document.getElementById('filePreview');
        filePreview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                this.showNotification(`El archivo "${file.name}" no es una imagen válida`, 'error');
                return;
            }
            
            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification(`El archivo "${file.name}" excede el tamaño máximo de 5MB`, 'error');
                return;
            }
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'file-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="remove-file" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="file-info">${file.name}</div>
                `;
                
                // Event listener para remover archivo
                previewItem.querySelector('.remove-file').addEventListener('click', () => {
                    this.removeFile(index);
                });
                
                filePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }
    
    removeFile(index) {
        const fileInput = document.getElementById('memorialPhoto');
        const files = Array.from(fileInput.files);
        files.splice(index, 1);
        
        // Crear nuevo FileList (no es posible modificar directamente)
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        // Actualizar preview
        this.handleFileSelection(fileInput.files);
    }
    
    // Funciones adicionales para suscripciones
    showPlansModal() {
        this.showNotification('Funcionalidad de planes próximamente disponible', 'info');
        // Aquí se podría implementar un modal con los planes
    }
    
    async cancelSubscription(subscriptionId) {
        if (confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
            try {
                this.showLoading();
                // Aquí se haría la llamada a la API para cancelar
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
                
                this.showNotification('Suscripción cancelada exitosamente', 'success');
                await this.loadSubscriptions();
            } catch (error) {
                console.error('Error canceling subscription:', error);
                this.showNotification('Error al cancelar la suscripción', 'error');
            } finally {
                this.hideLoading();
            }
        }
    }
    
    viewSubscriptionDetails(subscriptionId) {
        const subscription = this.subscriptions.find(s => s.id === subscriptionId);
        if (subscription) {
            const details = `
Plan: ${this.getPlanText(subscription.plan_type)}
Memorial: ${subscription.memorial_name}
Inicio: ${new Date(subscription.start_date).toLocaleDateString()}
Vence: ${new Date(subscription.end_date).toLocaleDateString()}
Precio: $${subscription.amount}/mes
Renovación: ${subscription.auto_renew ? 'Automática' : 'Manual'}
            `;
            alert(details);
        }
    }
    
    async renewSubscription(subscriptionId) {
        try {
            this.showLoading();
            // Aquí se haría la llamada a la API para renovar
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
            
            this.showNotification('Suscripción renovada exitosamente', 'success');
            await this.loadSubscriptions();
        } catch (error) {
            console.error('Error renewing subscription:', error);
            this.showNotification('Error al renovar la suscripción', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            this.showNotification('Completa todos los campos', 'error');
            return;
        }
        if (newPassword.length < 6) {
            this.showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            if (response.ok) {
                this.showNotification('Contraseña actualizada exitosamente', 'success');
                document.getElementById('changePasswordModal').classList.remove('active');
                document.getElementById('changePasswordForm').reset();
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Error al cambiar la contraseña', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification('Error al cambiar la contraseña', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    destroy() {
        // Limpiar gráficos
        this.destroyCharts();
        
        // Limpiar event listeners si es necesario
        // (Los event listeners se limpian automáticamente cuando se destruye el objeto)
        
        // Limpiar cache
        this.cache = {
            memorials: { data: null, timestamp: 0, ttl: 30000 },
            events: { data: null, timestamp: 0, ttl: 30000 },
            products: { data: null, timestamp: 0, ttl: 60000 },
            orders: { data: null, timestamp: 0, ttl: 60000 },
            subscriptions: { data: null, timestamp: 0, ttl: 60000 }
        };
        
        // Limpiar arrays
        this.memorials = [];
        this.events = [];
        this.products = [];
        this.orders = [];
        this.subscriptions = [];
        this.notifications = [];
        
        console.log('🗑️ Dashboard destruido correctamente');
    }

    // Actualizar contador del carrito en el dashboard
    updateCartCount() {
        const cartCount = document.getElementById('dashboardCartCount');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = count;
            
            // Ocultar badge si no hay items
            if (count === 0) {
                cartCount.style.display = 'none';
            } else {
                cartCount.style.display = 'flex';
            }
        }
    }
}

function updateModalTotal() {
    let total = 0;
    const plan = document.querySelector('#createMemorialModal input[name="plan_type"]:checked')?.value;
    if (plan === '3y') total = 999;
    if (plan === '10y') total = 2999;
    const qrCheckbox = document.getElementById('modalHasQrPlate');
    if (qrCheckbox && qrCheckbox.checked) total += 2999;
    const totalDisplay = document.getElementById('modalTotalDisplay');
    if (totalDisplay) totalDisplay.textContent = `Total: $${total} MXN`;
}

const createMemorialForm = document.getElementById('createMemorialForm');
if (createMemorialForm) {
    createMemorialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let total = 0;
        const plan = document.querySelector('#createMemorialModal input[name="plan_type"]:checked')?.value;
        if (plan === '3y') total = 999;
        if (plan === '10y') total = 2999;
        const qrCheckbox = document.getElementById('modalHasQrPlate');
        const hasQrPlate = qrCheckbox && qrCheckbox.checked;
        if (hasQrPlate) total += 2999;
        if (total === 0) {
            // Crear memorial directamente (plan gratis)
            alert('Memorial creado exitosamente (plan gratis).');
            document.getElementById('createMemorialModal').classList.remove('active');
        } else {
            // Flujo de pago real con MercadoPago
            try {
                // Recolectar datos del memorial
                const name = document.getElementById('memorialName').value;
                const description = document.getElementById('memorialBiography').value;
                const payerEmail = window.dashboard?.userData?.email || '';
                // Puedes ajustar memorialId si ya lo tienes, o dejarlo vacío
                const body = {
                    title: name,
                    description: description,
                    price: plan === '3y' ? 999 : 2999,
                    hasQrPlate: hasQrPlate,
                    qrPlatePrice: hasQrPlate ? 2999 : 0,
                    payerEmail: payerEmail,
                    memorialId: ''
                };
                const token = localStorage.getItem('token');
                const response = await fetch('/api/payments/create-memorial-preference', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    const data = await response.json();
                    window.location.href = data.init_point;
                } else {
                    alert('Error al iniciar el pago. Intenta de nuevo.');
                }
            } catch (err) {
                alert('Error al conectar con el sistema de pago.');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.dashboard) {
        window.dashboard.destroy();
    }
    window.dashboard = new Dashboard();
}); 