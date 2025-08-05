// Dashboard JavaScript para Supabase
class DashboardSupabase {
    constructor() {
        this.currentSection = 'dashboard';
        this.userData = null;
        this.memorials = [];
        this.events = [];
        this.products = [];
        this.orders = [];
        this.subscriptions = [];
        this.notifications = [];
        
        // Cliente de Supabase
        this.client = window.supabaseClient;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando Dashboard con Supabase...');
        this.setupEventListeners();
        await this.checkAuth();
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupCharts();
    }
    
    setupEventListeners() {
        // Navigation
        console.log('🔗 Configurando event listeners de navegación...');
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('📋 Enlaces encontrados:', navLinks.length);
        
        navLinks.forEach(link => {
            console.log('🔗 Configurando enlace:', link.dataset.section);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                console.log('🖱️ Click en enlace:', section);
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
        
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.logout();
            });
        }
        
        // Memorial creation
        const createMemorialBtn = document.getElementById('createMemorialBtn');
        if (createMemorialBtn) {
            createMemorialBtn.addEventListener('click', () => {
                this.showCreateMemorialModal();
            });
        }
        
        const newMemorialBtn = document.getElementById('newMemorialBtn');
        if (newMemorialBtn) {
            newMemorialBtn.addEventListener('click', () => {
                this.showCreateMemorialModal();
            });
        }
        
        // Event creation
        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                this.showCreateEventModal();
            });
        }
        
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => {
                this.showCreateEventModal();
            });
        }
        
        // Memorial view and edit modals
        const closeViewMemorialModal = document.getElementById('closeViewMemorialModal');
        if (closeViewMemorialModal) {
            closeViewMemorialModal.addEventListener('click', () => {
                this.hideViewMemorialModal();
            });
        }
        
        const closeEditMemorialModal = document.getElementById('closeEditMemorialModal');
        if (closeEditMemorialModal) {
            closeEditMemorialModal.addEventListener('click', () => {
                this.hideEditMemorialModal();
            });
        }
        
        const cancelEditMemorialBtn = document.getElementById('cancelEditMemorialBtn');
        if (cancelEditMemorialBtn) {
            cancelEditMemorialBtn.addEventListener('click', () => {
                this.hideEditMemorialModal();
            });
        }
        
        // Edit memorial form submission
        const editMemorialForm = document.getElementById('editMemorialForm');
        if (editMemorialForm) {
            editMemorialForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateMemorial();
            });
        }
        
        // Edit memorial images upload
        const editMemorialImages = document.getElementById('editMemorialImages');
        if (editMemorialImages) {
            editMemorialImages.addEventListener('change', (e) => {
                this.handleEditMemorialFileUpload(e.target.files);
            });
        }
        
        // Timeline modal
        const closeTimelineModal = document.getElementById('closeTimelineModal');
        if (closeTimelineModal) {
            closeTimelineModal.addEventListener('click', () => {
                this.hideTimelineModal();
            });
        }
        
        const cancelTimelineBtn = document.getElementById('cancelTimelineBtn');
        if (cancelTimelineBtn) {
            cancelTimelineBtn.addEventListener('click', () => {
                this.hideTimelineModal();
            });
        }
        
        const timelineForm = document.getElementById('timelineForm');
        if (timelineForm) {
            timelineForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.saveTimelineEvent(formData);
            });
        }
        
        // Modal close buttons
        const closeMemorialModal = document.getElementById('closeMemorialModal');
        if (closeMemorialModal) {
            closeMemorialModal.addEventListener('click', () => {
                this.hideCreateMemorialModal();
            });
        }
        
        const closeEventModal = document.getElementById('closeEventModal');
        if (closeEventModal) {
            closeEventModal.addEventListener('click', () => {
                this.hideCreateEventModal();
            });
        }
        
        // Form submissions
        const createMemorialForm = document.getElementById('createMemorialForm');
        if (createMemorialForm) {
            createMemorialForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createMemorial();
            });
        }
        
        const createEventForm = document.getElementById('createEventForm');
        if (createEventForm) {
            createEventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createEvent();
            });
        }
        
        // File upload handling
        this.setupFileUploadHandlers();
    }
    
    setupFileUploadHandlers() {
        // Memorial photo upload
        const memorialPhotoInput = document.getElementById('memorialPhoto');
        if (memorialPhotoInput) {
            console.log('📁 Configurando input de archivos de memorial');
            memorialPhotoInput.addEventListener('change', (e) => {
                console.log('📁 Archivos seleccionados:', e.target.files.length);
                this.handleMemorialFileUpload(e.target.files);
            });
        }
        
        // Profile avatar upload
        const profileAvatarInput = document.getElementById('profileAvatarInput');
        if (profileAvatarInput) {
            profileAvatarInput.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    await this.uploadProfileAvatar(e.target.files[0]);
                }
            });
        }
        
        // Remove avatar button
        const removeAvatarBtn = document.getElementById('removeAvatarBtn');
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', async () => {
                await this.removeProfileAvatar();
            });
        }
    }
    
    handleFileUpload(files, previewId) {
        if (!files || files.length === 0) return;
        
        const file = files[0];
        const preview = document.getElementById(previewId);
        
        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    handleMemorialFileUpload(files) {
        console.log('📁 Procesando archivos de memorial:', files.length);
        if (!files || files.length === 0) return;
        
        const previewContainer = document.getElementById('filePreview');
        const fileInput = document.getElementById('memorialPhoto');
        if (!previewContainer || !fileInput) {
            console.error('❌ No se encontraron elementos de preview o input');
            return;
        }
        
        // Limpiar preview anterior
        previewContainer.innerHTML = '';
        
        // Crear un nuevo FileList con los archivos válidos
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        // Procesar cada archivo
        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'file-preview-item';
                previewDiv.dataset.fileIndex = index;
                previewDiv.style.cssText = `
                    display: inline-block;
                    margin: 5px;
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = `
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                `;
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                        align-items: center;
                        justify-content: center;
                `;
                removeBtn.onclick = () => {
                    // Remover el archivo del preview
                    previewDiv.remove();
                    
                    // Actualizar el input de archivos
                    this.updateMemorialFileInput();
                };
                
                previewDiv.appendChild(img);
                previewDiv.appendChild(removeBtn);
                previewContainer.appendChild(previewDiv);
            };
            reader.readAsDataURL(file);
        });
        
        // Guardar los archivos válidos para referencia
        this.memorialFiles = validFiles;
    }
    
    updateMemorialFileInput() {
        const fileInput = document.getElementById('memorialPhoto');
        const previewContainer = document.getElementById('filePreview');
        
        if (!fileInput || !previewContainer) return;
        
        // Obtener los archivos que aún están en el preview
        const remainingFiles = Array.from(previewContainer.children).map((div, index) => {
            return this.memorialFiles[index];
        }).filter(Boolean);
        
        // Crear un nuevo FileList (esto es una aproximación ya que FileList es de solo lectura)
        // En su lugar, guardamos los archivos restantes para usar en createMemorial
        this.memorialFiles = remainingFiles;
    }
    
    async checkAuth() {
        console.log('🔐 Verificando autenticación...');
        
        // Esperar un poco para que la sesión se establezca
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('👤 Usuario en cliente:', this.client.getUser());
        console.log('🔑 Sesión en cliente:', this.client.getSession());
        console.log('✅ ¿Autenticado?:', this.client.isAuthenticated());
        
        if (!this.client.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo al login');
            window.location.href = '/login.html';
            return;
        }
        console.log('✅ Usuario autenticado');
    }
    
    async loadUserData() {
        try {
            console.log('🔄 Cargando datos del usuario...');
            const result = await this.client.getProfile();
            
            if (result.success) {
                this.userData = result.profile;
                this.updateUserInterface();
                console.log('✅ Datos del usuario cargados:', this.userData);
            } else {
                console.error('❌ Error al cargar datos del usuario:', result.message);
                this.showNotification('Error al cargar datos del usuario', 'error');
            }
        } catch (error) {
            console.error('❌ Error en loadUserData:', error);
            this.showNotification('Error al cargar datos del usuario', 'error');
        }
    }
    
    updateUserInterface() {
        if (!this.userData) return;
        
        // Actualizar información del usuario en la interfaz
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const profileFirstName = document.getElementById('firstName');
        const profileLastName = document.getElementById('lastName');
        const profileEmail = document.getElementById('email');
        const profilePhone = document.getElementById('phone');
        const profileAvatarPreview = document.getElementById('profileAvatarPreview');
        
        if (userName) {
            userName.textContent = `${this.userData.first_name} ${this.userData.last_name}`;
        }
        
        if (userAvatar) {
            const avatarUrl = this.userData.avatar_url && this.userData.avatar_url.trim() !== ''
                ? this.userData.avatar_url
                : 'assets/images/default-avatar.png';
            userAvatar.src = avatarUrl;
        }
        
        if (profileFirstName) {
            profileFirstName.value = this.userData.first_name || '';
        }
        
        if (profileLastName) {
            profileLastName.value = this.userData.last_name || '';
        }
        
        if (profileEmail) {
            profileEmail.value = this.userData.email || '';
        }
        
        if (profilePhone) {
            profilePhone.value = this.userData.phone || '';
        }
        
        if (profileAvatarPreview) {
            const avatarUrl = this.userData.avatar_url && this.userData.avatar_url.trim() !== ''
                ? this.userData.avatar_url
                : 'assets/images/default-avatar.png';
            profileAvatarPreview.src = avatarUrl;
        }
        
        console.log('🔄 Actualizando interfaz de usuario...');
    }
    
    async loadDashboardData() {
        try {
            console.log('🔄 Cargando datos del dashboard...');
            await Promise.all([
                this.loadMemorials(),
                this.loadEvents(),
                this.loadStats(),
                this.loadRecentActivity(),
                this.loadNotifications()
            ]);
        } catch (error) {
            console.error('❌ Error al cargar datos del dashboard:', error);
            this.showNotification('Error al cargar datos del dashboard', 'error');
        }
    }
    
    async loadMemorials() {
        try {
            console.log('🔄 Cargando perfiles memoriales...');
            const result = await this.client.getMemorials();
            
            if (result.success) {
                this.memorials = result.memorials || [];
                this.updateMemorialsGrid();
                this.updateMemorialCount();
                console.log('✅ Memoriales cargados:', this.memorials.length);
            } else {
                console.error('❌ Error al cargar memoriales:', result.message);
                this.showNotification('Error al cargar memoriales', 'error');
            }
        } catch (error) {
            console.error('❌ Error en loadMemorials:', error);
            this.showNotification('Error al cargar memoriales', 'error');
        }
    }
    
    async loadEvents() {
        try {
            console.log('🔄 Cargando eventos...');
            const result = await this.client.getEvents();
            
            if (result.success) {
                this.events = result.events || [];
                this.updateEventsGrid();
                this.updateEventCount();
                console.log('✅ Eventos cargados:', this.events.length);
            } else {
                console.error('❌ Error al cargar eventos:', result.message);
                this.showNotification('Error al cargar eventos', 'error');
            }
        } catch (error) {
            console.error('❌ Error en loadEvents:', error);
            this.showNotification('Error al cargar eventos', 'error');
        }
    }
    
    async loadStats() {
        try {
            console.log('🔄 Cargando estadísticas...');
            const stats = {
                totalMemorials: this.memorials.length,
                totalEvents: this.events.length,
                totalVisits: this.memorials.reduce((sum, m) => sum + (m.view_count || 0), 0),
                totalMessages: 0 // TODO: Implementar conteo de mensajes
            };
            
            this.updateStats(stats);
            console.log('✅ Estadísticas cargadas:', stats);
        } catch (error) {
            console.error('❌ Error en loadStats:', error);
        }
    }
    
    async loadRecentActivity() {
        try {
            console.log('🔄 Cargando actividad reciente...');
            // TODO: Implementar carga de actividad reciente desde Supabase
            const activities = [];
            this.updateActivityList(activities);
        } catch (error) {
            console.error('❌ Error en loadRecentActivity:', error);
        }
    }
    
    async loadNotifications() {
        try {
            console.log('🔄 Cargando notificaciones...');
            // TODO: Implementar carga de notificaciones desde Supabase
            this.notifications = [];
            this.updateNotificationCount();
            this.updateNotificationList();
        } catch (error) {
            console.error('❌ Error en loadNotifications:', error);
        }
    }
    
    updateStats(stats) {
        console.log('📊 Actualizando estadísticas:', stats);
        
        const memorialCount = document.getElementById('memorialCount');
        const eventCount = document.getElementById('eventCount');
        const totalViews = document.getElementById('totalViews');
        const totalCandles = document.getElementById('totalCandles');
        
        if (memorialCount) memorialCount.textContent = stats.totalMemorials;
        if (eventCount) eventCount.textContent = stats.totalEvents;
        if (totalViews) totalViews.textContent = stats.totalVisits;
        if (totalCandles) totalCandles.textContent = stats.totalMessages;
    }
    
    updateMemorialCount() {
        const count = this.memorials.length;
        const memorialCount = document.getElementById('memorialCount');
        if (memorialCount) {
            memorialCount.textContent = count;
        }
    }
    
    updateEventCount() {
        const count = this.events.length;
        const eventCount = document.getElementById('eventCount');
        if (eventCount) {
            eventCount.textContent = count;
        }
    }
    
    updateMemorialsGrid() {
        const grid = document.getElementById('memorialsGrid');
        if (!grid) return;
        
        if (this.memorials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-circle"></i>
                    <h3>No tienes perfiles memoriales</h3>
                    <p>Crea tu primer perfil memorial para honrar la memoria de tu ser querido</p>
                    <button class="btn btn-primary" onclick="dashboard.showCreateMemorialModal()">
                        <i class="fas fa-plus"></i> Crear Perfil Memorial
                    </button>
                </div>
            `;
        } else {
            grid.innerHTML = this.memorials.map(memorial => this.createMemorialCard(memorial)).join('');
        }
    }
    
    createMemorialCard(memorial) {
        console.log('🖼️ Creando tarjeta para memorial:', memorial.id, 'con imágenes:', memorial.images?.length || 0);
        
        let primaryImage = 'assets/images/default-avatar.png';
        
        if (memorial.images && memorial.images.length > 0) {
            // Buscar la imagen primaria primero
            const primaryImg = memorial.images.find(img => img.is_primary);
            if (primaryImg) {
                primaryImage = primaryImg.image_url;
                console.log('🖼️ Usando imagen primaria:', primaryImage);
            } else {
                // Si no hay imagen primaria, usar la primera
                primaryImage = memorial.images[0].image_url;
                console.log('🖼️ Usando primera imagen:', primaryImage);
            }
        } else {
            console.log('🖼️ No hay imágenes para el memorial:', memorial.id);
        }
            
        return `
            <div class="memorial-card" data-id="${memorial.id}">
                <div class="memorial-image">
                    <img src="${primaryImage}" alt="${memorial.name}" 
                         style="width: 100%; height: 280px; object-fit: cover; border-radius: 8px 8px 0 0;"
                         onerror="this.src='assets/images/default-avatar.png'"
                         onload="console.log('✅ Imagen cargada exitosamente:', '${primaryImage}')"
                         onerror="console.log('❌ Error al cargar imagen:', '${primaryImage}')">
                    <div class="memorial-overlay">
                        <div class="memorial-actions">
                            <button class="btn btn-sm btn-primary" onclick="dashboard.viewMemorial(${memorial.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="dashboard.editMemorial(${memorial.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="dashboard.shareMemorial(${memorial.id})">
                                <i class="fas fa-share"></i> Compartir
                            </button>
                        </div>
                    </div>
                </div>
                <div class="memorial-content">
                    <h3 class="memorial-name">${memorial.name}</h3>
                    <p class="memorial-dates">
                        ${memorial.birth_date ? this.formatDate(memorial.birth_date) : ''} 
                        ${memorial.death_date ? ' - ' + this.formatDate(memorial.death_date) : ''}
                    </p>
                    <p class="memorial-bio">${memorial.biography ? memorial.biography.substring(0, 100) + '...' : 'Sin biografía'}</p>
                    <div class="memorial-stats">
                        <span class="stat">
                            <i class="fas fa-eye"></i> ${memorial.view_count || 0} visitas
                        </span>
                        <span class="stat">
                            <i class="fas fa-heart"></i> ${memorial.candles_count || 0} velas
                        </span>
                    </div>
                    <div class="memorial-status">
                        <span class="status-badge ${memorial.is_active ? 'active' : 'inactive'}">
                            ${memorial.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateEventsGrid() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;
        
        if (this.events.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No tienes eventos</h3>
                    <p>Crea tu primer evento para conmemorar a tu ser querido</p>
                    <button class="btn btn-primary" onclick="dashboard.showCreateEventModal()">
                        <i class="fas fa-plus"></i> Crear Evento
                    </button>
                </div>
            `;
        } else {
            grid.innerHTML = this.events.map(event => this.createEventCard(event)).join('');
        }
    }
    
    createEventCard(event) {
        return `
            <div class="event-card" data-id="${event.id}">
                <div class="event-header">
                    <h3 class="event-title">${event.title}</h3>
                    <span class="event-date">${this.formatDate(event.event_date)}</span>
                </div>
                <div class="event-content">
                    <p class="event-description">${event.description || 'Sin descripción'}</p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> 
                        ${event.location || 'Ubicación no especificada'}
                    </p>
                </div>
                <div class="event-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.viewEvent(${event.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="dashboard.editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="dashboard.manageGuests(${event.id})">
                        <i class="fas fa-users"></i> Invitados
                    </button>
                </div>
            </div>
        `;
    }
    
    updateActivityList(activities) {
        const list = document.getElementById('activityList');
        if (!list) return;
        
        if (activities.length === 0) {
            list.innerHTML = `
                <div class="empty-activity">
                    <i class="fas fa-info-circle"></i>
                    <p>No hay actividad reciente</p>
                </div>
            `;
        } else {
            list.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-text">${activity.description}</p>
                        <span class="activity-time">${this.formatTime(activity.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    getActivityIcon(type) {
        const icons = {
            'memorial_created': 'fas fa-user-circle',
            'memorial_updated': 'fas fa-edit',
            'event_created': 'fas fa-calendar-plus',
            'event_updated': 'fas fa-calendar-edit',
            'message_received': 'fas fa-comment',
            'candle_lit': 'fas fa-heart',
            'default': 'fas fa-info-circle'
        };
        return icons[type] || icons.default;
    }
    
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        
        return date.toLocaleDateString('es-ES');
    }
    
    updateNotificationCount() {
        const count = this.notifications.length;
        const notificationCount = document.getElementById('notificationCount');
        if (notificationCount) {
            notificationCount.textContent = count;
        }
    }
    
    updateNotificationList() {
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell"></i>
                    <p>No tienes notificaciones</p>
                </div>
            `;
        } else {
            list.innerHTML = this.notifications.map(notification => `
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <p class="notification-text">${notification.message}</p>
                        <span class="notification-time">${this.formatTime(notification.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle',
            'default': 'fas fa-bell'
        };
        return icons[type] || icons.default;
    }
    
    navigateToSection(section) {
        console.log('🧭 Navegando a sección:', section);
        
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('section');
        sections.forEach(s => s.classList.remove('active'));
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('✅ Sección mostrada:', section + 'Section');
        } else {
            console.error('❌ Sección no encontrada:', section + 'Section');
        }
        
        // Actualizar enlaces activos
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.parentElement.classList.remove('active'));
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
        
        // Actualizar título de la página
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(section);
        }
        
        // Cargar datos específicos de la sección
        this.loadSectionData(section);
        
        this.currentSection = section;
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
        console.log('🔄 Cargando datos de sección:', section);
        
        switch (section) {
            case 'memorials':
                await this.loadMemorials();
                break;
            case 'events':
                await this.loadEvents();
                break;
            case 'store':
                await this.loadProducts();
                break;
            case 'orders':
                await this.loadOrders();
                break;
            case 'subscriptions':
                await this.loadSubscriptions();
                break;
        }
    }
    
    async loadProducts() {
        try {
            console.log('🔄 Cargando productos...');
            const result = await this.client.getProducts();
            
            if (result.success) {
                this.products = result.products || [];
                this.updateProductsGrid();
            } else {
                console.error('❌ Error al cargar productos:', result.message);
            }
        } catch (error) {
            console.error('❌ Error en loadProducts:', error);
        }
    }
    
    updateProductsGrid() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        if (this.products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Próximamente tendremos productos disponibles</p>
                </div>
            `;
        } else {
            grid.innerHTML = this.products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image_url || 'assets/images/default-product.jpg'}" 
                             alt="${product.name}"
                             onerror="this.src='assets/images/default-product.jpg'">
                    </div>
                    <div class="product-content">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">$${this.formatPrice(product.price)}</div>
                        <button class="btn btn-primary" onclick="dashboard.addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    async loadOrders() {
        try {
            console.log('🔄 Cargando pedidos...');
            // TODO: Implementar carga de pedidos desde Supabase
            this.orders = [];
            this.updateOrdersList();
        } catch (error) {
            console.error('❌ Error en loadOrders:', error);
        }
    }
    
    updateOrdersList() {
        const list = document.getElementById('ordersList');
        if (!list) return;
        
        if (this.orders.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No tienes pedidos</h3>
                    <p>Cuando hagas un pedido aparecerá aquí</p>
                </div>
            `;
        } else {
            list.innerHTML = this.orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <h4>Pedido #${order.id}</h4>
                        <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                    </div>
                    <div class="order-content">
                        <p class="order-date">${this.formatDate(order.created_at)}</p>
                        <p class="order-total">Total: $${this.formatPrice(order.total)}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    getStatusText(status) {
        const statusTexts = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusTexts[status] || status;
    }
    
    async loadSubscriptions() {
        try {
            console.log('🔄 Cargando suscripciones...');
            // TODO: Implementar carga de suscripciones desde Supabase
            this.subscriptions = [];
            this.updateSubscriptionsList();
        } catch (error) {
            console.error('❌ Error en loadSubscriptions:', error);
        }
    }
    
    updateSubscriptionsList() {
        const list = document.getElementById('subscriptionsList');
        if (!list) return;
        
        if (this.subscriptions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No tienes suscripciones</h3>
                    <p>Suscríbete a un plan para crear perfiles memoriales</p>
                </div>
            `;
        } else {
            list.innerHTML = this.subscriptions.map(subscription => `
                <div class="subscription-item">
                    <div class="subscription-header">
                        <h4>Plan ${subscription.plan_type}</h4>
                        <span class="subscription-status ${subscription.status}">${subscription.status}</span>
                    </div>
                    <div class="subscription-content">
                        <p class="subscription-date">Vence: ${this.formatDate(subscription.end_date)}</p>
                        <p class="subscription-price">$${this.formatPrice(subscription.price)}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    setupCharts() {
        console.log('📊 Configurando gráficos...');
        this.setupVisitsChart();
        this.setupMessagesChart();
    }
    
    setupVisitsChart() {
        const ctx = document.getElementById('visitsChart');
        if (!ctx) return;
        
        // TODO: Implementar gráfico de visitas con datos reales
        new Chart(ctx, {
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
    }
    
    setupMessagesChart() {
        const ctx = document.getElementById('messagesChart');
        if (!ctx) return;
        
        // TODO: Implementar gráfico de mensajes con datos reales
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprobados', 'Pendientes', 'Rechazados'],
                datasets: [{
                    data: [12, 3, 1],
                    backgroundColor: ['#2d8f2d', '#f39c12', '#e74c3c']
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
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        }
    }
    
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    async logout() {
        try {
            console.log('🚪 Cerrando sesión...');
            const result = await this.client.logout();
            
            if (result.success) {
                console.log('✅ Sesión cerrada exitosamente');
                window.location.href = '/login.html';
            } else {
                console.error('❌ Error al cerrar sesión:', result.message);
                this.showNotification('Error al cerrar sesión', 'error');
            }
        } catch (error) {
            console.error('❌ Error en logout:', error);
            this.showNotification('Error al cerrar sesión', 'error');
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`📢 Notificación [${type}]:`, message);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }
    
    formatPrice(price) {
        if (!price) return '0.00';
        return parseFloat(price).toFixed(2);
    }
    
    // =====================================================
    // FUNCIONALIDADES DE MEMORIALES
    // =====================================================
    
    showCreateMemorialModal() {
        console.log('➕ Mostrar modal crear memorial');
        const modal = document.getElementById('createMemorialModal');
        if (modal) {
            modal.classList.add('active');
            this.setupMemorialFormHandlers();
        }
    }
    
    hideCreateMemorialModal() {
        const modal = document.getElementById('createMemorialModal');
        if (modal) {
            modal.classList.remove('active');
            const form = document.getElementById('createMemorialForm');
            if (form) {
                form.reset();
            }
            // Limpiar archivos de memorial
            this.memorialFiles = [];
            const previewContainer = document.getElementById('filePreview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
        }
    }
    
    setupMemorialFormHandlers() {
        // Plan selection handlers
        const planRadios = document.querySelectorAll('#createMemorialModal input[name="plan_type"]');
        const hasQrPlateCheckbox = document.getElementById('modalHasQrPlate');
        const totalDisplay = document.getElementById('modalTotalDisplay');
        
        const updateTotal = () => {
            const selectedPlan = document.querySelector('#createMemorialModal input[name="plan_type"]:checked')?.value;
            const hasQrPlate = hasQrPlateCheckbox?.checked;
            
            const planPrices = {
                '6m': 0,
                '3y': 999,
                '10y': 2999
            };
            
            const qrPlatePrice = 2999;
            const planPrice = planPrices[selectedPlan] || 0;
            const total = planPrice + (hasQrPlate ? qrPlatePrice : 0);
            
            if (totalDisplay) {
                totalDisplay.textContent = `Total: $${total} MXN`;
            }
        };
        
        planRadios.forEach(radio => {
            radio.addEventListener('change', updateTotal);
        });
        
        if (hasQrPlateCheckbox) {
            hasQrPlateCheckbox.addEventListener('change', updateTotal);
        }
        
        // Initial total calculation
        updateTotal();
    }
    
    async createMemorial() {
        try {
            console.log('🔄 Creando memorial...');
            
            const form = document.getElementById('createMemorialForm');
            if (!form) {
                throw new Error('Formulario no encontrado');
            }
            
            const formData = new FormData(form);
            
            // Validar campos requeridos
            const name = formData.get('name');
            if (!name || name.trim() === '') {
                this.showNotification('El nombre del ser querido es obligatorio', 'error');
                return;
            }
            
            // Preparar datos del memorial
            const memorialData = {
                name: name.trim(),
                birth_date: formData.get('birthDate') || null,
                death_date: formData.get('deathDate') || null,
                biography: formData.get('biography') || '',
                epitaph: formData.get('epitaph') || '',
                is_active: true,
                is_public: true,
                theme_color: '#4A5568'
            };
            
            // Obtener plan seleccionado
            const planType = form.querySelector('input[name="plan_type"]:checked')?.value || '6m';
            const hasQrPlate = form.querySelector('input[name="has_qr_plate"]')?.checked || false;
            
            // Calcular fecha de vencimiento según el plan
            const planDurations = {
                '6m': 6,
                '3y': 36,
                '10y': 120
            };
            
            const duration = planDurations[planType] || 6;
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + duration);
            memorialData.subscription_end_date = endDate.toISOString().split('T')[0];
            
            // Crear memorial en Supabase
            const result = await this.client.createMemorial(memorialData);
            
            if (result.success) {
                console.log('✅ Memorial creado:', result.memorial);
                
                // Subir imágenes si existen
                if (this.memorialFiles && this.memorialFiles.length > 0) {
                    await this.uploadMemorialImages(result.memorial.id, this.memorialFiles);
                }
                
                this.showNotification('Memorial creado exitosamente', 'success');
                this.hideCreateMemorialModal();
                
                // Recargar memoriales
                await this.loadMemorials();
                
            } else {
                console.error('❌ Error al crear memorial:', result.message);
                this.showNotification(result.message || 'Error al crear memorial', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en createMemorial:', error);
            this.showNotification('Error inesperado al crear memorial', 'error');
        }
    }
    
    async uploadMemorialImages(memorialId, files) {
        try {
            console.log('📁 Subiendo imágenes para memorial:', memorialId);
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Subir archivo a Supabase Storage
                const uploadResult = await this.client.uploadFile(file, 'memorials');
                
                if (uploadResult.success) {
                    console.log('✅ Imagen subida:', uploadResult.url);
                    
                    // Guardar referencia en la base de datos
                    const imageData = {
                        memorial_id: memorialId,
                        image_url: uploadResult.url,
                        is_primary: i === 0, // La primera imagen es la principal
                        display_order: i
                    };
                    
                                         // Guardar referencia en la base de datos
                     const saveResult = await this.client.saveMemorialImage(imageData);
                     
                     if (saveResult.success) {
                         console.log('✅ Referencia de imagen guardada:', saveResult.image);
                     } else {
                         console.error('❌ Error al guardar referencia de imagen:', saveResult.message);
                     }
                    
                } else {
                    console.error('❌ Error al subir imagen:', uploadResult.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error en uploadMemorialImages:', error);
        }
    }
    
    async editMemorial(id) {
        console.log('✏️ Editar memorial:', id);
        try {
            // Buscar el memorial en la lista actual
            const memorial = this.memorials.find(m => m.id === id);
            if (!memorial) {
                this.showNotification('Memorial no encontrado', 'error');
                return;
            }
            
            // Guardar el ID del memorial actual para edición
            this.currentMemorialId = id;
            
            // Cargar datos del memorial en el formulario
            await this.loadMemorialDataForEdit(memorial);
            
            // Mostrar modal de edición
            this.showEditMemorialModal();
            
        } catch (error) {
            console.error('❌ Error al editar memorial:', error);
            this.showNotification('Error al cargar datos del memorial', 'error');
        }
    }
    
    async viewMemorial(id) {
        console.log('👁️ Ver memorial:', id);
        try {
            // Buscar el memorial en la lista actual
            const memorial = this.memorials.find(m => m.id === id);
            if (!memorial) {
                this.showNotification('Memorial no encontrado', 'error');
                return;
            }
            
            // Guardar el ID del memorial actual para vista
            this.currentMemorialId = id;
            
            // Cargar datos del memorial para vista
            this.loadMemorialDataForView(memorial);
            
            // Mostrar modal de vista
            this.showViewMemorialModal();
            
        } catch (error) {
            console.error('❌ Error al ver memorial:', error);
            this.showNotification('Error al cargar datos del memorial', 'error');
        }
    }
    
    async shareMemorial(id) {
        console.log('📤 Compartir memorial:', id);
        try {
            const memorial = this.memorials.find(m => m.id === id);
            if (!memorial) {
                this.showNotification('Memorial no encontrado', 'error');
                return;
            }

            // Generar URL pública
            const publicUrl = this.client.generateMemorialUrl(id);
            
            // Crear modal de compartir
            this.showShareModal(memorial, publicUrl);
            
        } catch (error) {
            console.error('❌ Error al compartir memorial:', error);
            this.showNotification('Error al generar enlace de compartir', 'error');
        }
    }

    showShareModal(memorial, publicUrl) {
        // Crear modal dinámicamente
        const modalHtml = `
            <div class="modal active" id="shareMemorialModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Compartir Memorial</h3>
                        <button class="modal-close" onclick="dashboard.hideShareModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="share-info">
                            <h4>${memorial.name}</h4>
                            <p class="text-muted">Comparte este memorial con familiares y amigos</p>
                        </div>
                        
                        <div class="share-url-section">
                            <label>Enlace público:</label>
                            <div class="url-input-group">
                                <input type="text" id="shareUrlInput" value="${publicUrl}" readonly>
                                <button class="btn btn-primary" onclick="dashboard.copyShareUrl()">
                                    <i class="fas fa-copy"></i> Copiar
                                </button>
                            </div>
                        </div>
                        
                        <div class="share-options">
                            <h5>Compartir en:</h5>
                            <div class="share-buttons">
                                <button class="btn btn-outline" onclick="dashboard.shareOnWhatsApp('${publicUrl}', '${memorial.name}')">
                                    <i class="fab fa-whatsapp"></i> WhatsApp
                                </button>
                                <button class="btn btn-outline" onclick="dashboard.shareOnFacebook('${publicUrl}', '${memorial.name}')">
                                    <i class="fab fa-facebook"></i> Facebook
                                </button>
                                <button class="btn btn-outline" onclick="dashboard.shareOnTwitter('${publicUrl}', '${memorial.name}')">
                                    <i class="fab fa-twitter"></i> Twitter
                                </button>
                                <button class="btn btn-outline" onclick="dashboard.shareViaEmail('${publicUrl}', '${memorial.name}')">
                                    <i class="fas fa-envelope"></i> Email
                                </button>
                            </div>
                        </div>
                        
                        <div class="share-preview">
                            <h5>Vista previa:</h5>
                            <div class="memorial-preview-card">
                                <img src="${memorial.images && memorial.images.length > 0 ? memorial.images[0].image_url : 'assets/images/default-avatar.png'}" alt="${memorial.name}">
                                <div class="preview-info">
                                    <h6>${memorial.name}</h6>
                                    <p>${memorial.biography ? memorial.biography.substring(0, 100) + '...' : 'Memorial en Despedida Eterna'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    hideShareModal() {
        const modal = document.getElementById('shareMemorialModal');
        if (modal) {
            modal.remove();
        }
    }

    copyShareUrl() {
        const urlInput = document.getElementById('shareUrlInput');
        if (urlInput) {
            urlInput.select();
            urlInput.setSelectionRange(0, 99999); // Para móviles
            document.execCommand('copy');
            this.showNotification('Enlace copiado al portapapeles', 'success');
        }
    }

    shareOnWhatsApp(url, title) {
        const text = `Memorial de ${title} - ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }

    shareOnFacebook(url, title) {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
    }

    shareOnTwitter(url, title) {
        const text = `Memorial de ${title}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
    }

    shareViaEmail(url, title) {
        const subject = `Memorial de ${title}`;
        const body = `Te comparto el memorial de ${title}:\n\n${url}\n\nSaludos.`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(emailUrl);
    }
    
    // =====================================================
    // MÉTODOS AUXILIARES PARA VER Y EDITAR MEMORIALES
    // =====================================================
    
    loadMemorialDataForView(memorial) {
        console.log('📋 Cargando datos del memorial para vista:', memorial);
        
        // Cargar información básica
        document.getElementById('viewMemorialTitle').textContent = `Ver Memorial: ${memorial.name}`;
        document.getElementById('viewMemorialName').textContent = memorial.name;
        
        // Cargar fechas
        const birthDate = memorial.birth_date ? this.formatDate(memorial.birth_date) : '';
        const deathDate = memorial.death_date ? this.formatDate(memorial.death_date) : '';
        const datesText = birthDate && deathDate ? `${birthDate} - ${deathDate}` : 
                         birthDate ? `Nacimiento: ${birthDate}` : 
                         deathDate ? `Fallecimiento: ${deathDate}` : 'Fechas no especificadas';
        document.getElementById('viewMemorialDates').textContent = datesText;
        
        // Cargar estadísticas
        document.getElementById('viewMemorialViews').textContent = memorial.view_count || 0;
        document.getElementById('viewMemorialCandles').textContent = memorial.candles_count || 0;
        document.getElementById('viewMemorialMessages').textContent = memorial.messages_count || 0;
        
        // Cargar biografía
        document.getElementById('viewMemorialBiography').textContent = memorial.biography || 'Sin biografía disponible';
        
        // Cargar información del plan
        document.getElementById('viewMemorialPlan').textContent = this.getPlanName(memorial.plan_type);
        document.getElementById('viewMemorialStatus').textContent = memorial.is_active ? 'Activo' : 'Inactivo';
        document.getElementById('viewMemorialVisibility').textContent = memorial.is_public ? 'Público' : 'Privado';
        
        // Cargar avatar
        const avatarImg = document.getElementById('viewMemorialAvatar');
        if (memorial.images && memorial.images.length > 0) {
            const primaryImage = memorial.images.find(img => img.is_primary) || memorial.images[0];
            avatarImg.src = primaryImage.image_url;
        } else {
            avatarImg.src = 'assets/images/default-avatar.png';
        }
        
        // Cargar galería de imágenes
        this.loadMemorialGallery(memorial.images || []);
    }
    
    async loadMemorialDataForEdit(memorial) {
        console.log('📝 Cargando datos del memorial para edición:', memorial);
        
        // Guardar ID del memorial actual
        this.currentMemorialId = memorial.id;
        
        // Cargar campos del formulario
        document.getElementById('editMemorialName').value = memorial.name || '';
        document.getElementById('editMemorialBirthDate').value = memorial.birth_date || '';
        document.getElementById('editMemorialDeathDate').value = memorial.death_date || '';
        document.getElementById('editMemorialBiography').value = memorial.biography || '';
                            document.getElementById('editMemorialLocation').value = memorial.birth_place || '';
                    document.getElementById('editMemorialOccupation').value = memorial.death_place || '';
                    document.getElementById('editMemorialIsPublic').value = memorial.is_public ? 'true' : 'false';
        document.getElementById('editMemorialIsActive').value = memorial.is_active ? 'true' : 'false';
        
        // Cargar imágenes existentes
        this.loadMemorialImagesForEdit(memorial.images || []);
        
        // Cargar timeline existente
        await this.loadMemorialTimelineForEdit(memorial.id);
    }
    
    loadMemorialGallery(images) {
        const galleryContainer = document.getElementById('viewMemorialGallery');
        galleryContainer.innerHTML = '';
        
        if (images.length === 0) {
            galleryContainer.innerHTML = '<p class="text-muted">No hay imágenes disponibles</p>';
            return;
        }
        
        images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = image.image_url;
            imgElement.alt = `Imagen ${index + 1} del memorial`;
            imgElement.title = image.caption || `Imagen ${index + 1}`;
            imgElement.onclick = () => this.openImageLightbox(image.image_url, image.caption);
            galleryContainer.appendChild(imgElement);
        });
    }
    
    loadMemorialImagesForEdit(images) {
        const previewContainer = document.getElementById('editMemorialImagesPreview');
        previewContainer.innerHTML = '';
        
        // Guardar imágenes existentes
        this.existingMemorialImages = images;
        
        images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.dataset.imageId = image.id;
            
            imageItem.innerHTML = `
                <img src="${image.image_url}" alt="Imagen ${index + 1}">
                <button type="button" class="remove-image" onclick="dashboard.removeExistingImage(${image.id})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-info">
                    <small>${image.caption || `Imagen ${index + 1}`}</small>
                    ${image.is_primary ? '<br><small class="primary-badge">Principal</small>' : ''}
                </div>
            `;
            
            previewContainer.appendChild(imageItem);
        });
    }

    async loadMemorialTimelineForEdit(memorialId) {
        const timelineContainer = document.getElementById('editMemorialTimeline');
        if (!timelineContainer) return;
        
        timelineContainer.innerHTML = '';
        
        try {
            // Obtener eventos del timeline desde Supabase
            const result = await this.client.getTimelineEvents(memorialId);
            
            if (result.success) {
                this.existingMemorialTimeline = result.events;
                
                if (result.events.length === 0) {
                    timelineContainer.innerHTML = '<p class="text-muted">No hay eventos en el timeline</p>';
                    return;
                }
                
                result.events.forEach((event, index) => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'timeline-event-item';
                    eventItem.dataset.eventId = event.id;
                    
                    eventItem.innerHTML = `
                        <div class="timeline-event-content">
                            <div class="timeline-event-header">
                                <h4>${event.title}</h4>
                                <span class="timeline-event-date">${this.formatDate(event.date)}</span>
                            </div>
                            ${event.description ? `<p>${event.description}</p>` : ''}
                            ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" class="timeline-event-image">` : ''}
                        </div>
                        <div class="timeline-event-actions">
                            <button type="button" class="btn btn-sm btn-outline" onclick="dashboard.editTimelineEvent(${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-outline" onclick="dashboard.deleteTimelineEvent(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    timelineContainer.appendChild(eventItem);
                });
            } else {
                console.error('❌ Error al cargar timeline:', result.message);
                timelineContainer.innerHTML = '<p class="text-muted">Error al cargar timeline</p>';
            }
        } catch (error) {
            console.error('❌ Error en loadMemorialTimelineForEdit:', error);
            timelineContainer.innerHTML = '<p class="text-muted">Error al cargar timeline</p>';
        }
    }

    addTimelineEvent() {
        console.log('➕ Agregando evento al timeline');
        this.showTimelineModal();
    }

    editTimelineEvent(index) {
        console.log('✏️ Editando evento del timeline:', index);
        const event = this.existingMemorialTimeline[index];
        if (event) {
            this.showTimelineModal(true, event, index);
        }
    }

    async deleteTimelineEvent(index) {
        console.log('🗑️ Eliminando evento del timeline:', index);
        if (index >= 0 && index < this.existingMemorialTimeline.length) {
            const event = this.existingMemorialTimeline[index];
            if (confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"?`)) {
                try {
                    const result = await this.client.deleteTimelineEvent(event.id);
                    
                    if (result.success) {
                        this.showNotification('Evento eliminado del timeline', 'success');
                        // Recargar timeline
                        await this.loadMemorialTimelineForEdit(this.currentMemorialId);
                    } else {
                        this.showNotification(result.message || 'Error al eliminar evento', 'error');
                    }
                } catch (error) {
                    console.error('❌ Error en deleteTimelineEvent:', error);
                    this.showNotification('Error inesperado al eliminar evento', 'error');
                }
            }
        }
    }

    showTimelineModal(isEditing = false, eventData = null, eventIndex = -1) {
        const modal = document.getElementById('timelineModal');
        const title = document.getElementById('timelineModalTitle');
        const form = document.getElementById('timelineForm');
        
        if (!modal || !title || !form) {
            console.error('❌ Elementos del modal de timeline no encontrados');
            return;
        }
        
        // Configurar título
        title.textContent = isEditing ? 'Editar evento del timeline' : 'Agregar evento al timeline';
        
        // Limpiar formulario
        form.reset();
        
        // Si es edición, llenar con datos existentes
        if (isEditing && eventData) {
            document.getElementById('timelineTitle').value = eventData.title || '';
            document.getElementById('timelineDate').value = eventData.date || '';
            document.getElementById('timelineDescription').value = eventData.description || '';
        }
        
        // Guardar contexto
        this.timelineModalContext = {
            isEditing,
            eventIndex,
            eventData
        };
        
        // Mostrar modal
        modal.classList.add('active');
    }

    hideTimelineModal() {
        const modal = document.getElementById('timelineModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.timelineModalContext = null;
    }

    async saveTimelineEvent(formData) {
        const title = formData.get('title');
        const date = formData.get('date');
        const description = formData.get('description');
        
        if (!title || !date) {
            this.showNotification('El título y la fecha son obligatorios', 'error');
            return;
        }
        
        const eventData = {
            memorial_id: this.currentMemorialId,
            title: title.trim(),
            date: date,
            description: description.trim() || null,
            display_order: this.existingMemorialTimeline ? this.existingMemorialTimeline.length : 0
        };
        
        try {
            if (this.timelineModalContext && this.timelineModalContext.isEditing) {
                // Actualizar evento existente
                const index = this.timelineModalContext.eventIndex;
                if (index >= 0 && index < this.existingMemorialTimeline.length) {
                    const existingEvent = this.existingMemorialTimeline[index];
                    const result = await this.client.updateTimelineEvent(existingEvent.id, eventData);
                    
                    if (result.success) {
                        this.showNotification('Evento del timeline actualizado', 'success');
                    } else {
                        this.showNotification(result.message || 'Error al actualizar evento', 'error');
                        return;
                    }
                }
            } else {
                // Crear nuevo evento
                const result = await this.client.createTimelineEvent(eventData);
                
                if (result.success) {
                    this.showNotification('Evento del timeline creado', 'success');
                } else {
                    this.showNotification(result.message || 'Error al crear evento', 'error');
                    return;
                }
            }
            
            // Recargar timeline
            await this.loadMemorialTimelineForEdit(this.currentMemorialId);
            
            // Ocultar modal
            this.hideTimelineModal();
            
        } catch (error) {
            console.error('❌ Error en saveTimelineEvent:', error);
            this.showNotification('Error inesperado al guardar evento', 'error');
        }
    }
    
    getPlanName(planType) {
        const planNames = {
            'basic': 'Plan Básico',
            'standard': 'Plan Estándar',
            'premium': 'Plan Premium',
            'eternal': 'Plan Eterno'
        };
        return planNames[planType] || 'Plan Básico';
    }
    
    openImageLightbox(imageUrl, caption) {
        // TODO: Implementar lightbox para ver imágenes en tamaño completo
        console.log('🖼️ Abrir lightbox:', imageUrl, caption);
        this.showNotification('Función de lightbox en desarrollo', 'info');
    }
    
    removeExistingImage(imageId) {
        console.log('🗑️ Remover imagen existente:', imageId);
        
        // Remover de la lista de imágenes existentes
        this.existingMemorialImages = this.existingMemorialImages.filter(img => img.id !== imageId);
        
        // Remover del DOM
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }
        
        this.showNotification('Imagen removida', 'success');
    }
    
    showViewMemorialModal() {
        console.log('👁️ Mostrando modal de vista de memorial');
        const modal = document.getElementById('viewMemorialModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideViewMemorialModal() {
        console.log('👁️ Ocultando modal de vista de memorial');
        const modal = document.getElementById('viewMemorialModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    showEditMemorialModal() {
        console.log('✏️ Mostrando modal de edición de memorial');
        const modal = document.getElementById('editMemorialModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideEditMemorialModal() {
        console.log('✏️ Ocultando modal de edición de memorial');
        const modal = document.getElementById('editMemorialModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    async updateMemorial() {
        try {
            console.log('🔄 Actualizando memorial...');
            
            const form = document.getElementById('editMemorialForm');
            if (!form) {
                throw new Error('Formulario no encontrado');
            }
            
            const formData = new FormData(form);
            
            // Validar campos requeridos
            const name = formData.get('name');
            if (!name || name.trim() === '') {
                this.showNotification('El nombre del ser querido es obligatorio', 'error');
                return;
            }
            
            // Preparar datos del memorial
            const memorialData = {
                name: name.trim(),
                birth_date: formData.get('birthDate') || null,
                death_date: formData.get('deathDate') || null,
                biography: formData.get('biography') || '',
                birth_place: formData.get('location') || '',
                death_place: formData.get('occupation') || '',
                is_public: formData.get('isPublic') === 'true',
                is_active: formData.get('isActive') === 'true'
            };
            
            console.log('📝 Datos del memorial a actualizar:', memorialData);
            
            // Actualizar memorial en Supabase
            const result = await this.client.updateMemorial(this.currentMemorialId, memorialData);
            
            if (result.success) {
                console.log('✅ Memorial actualizado:', result.memorial);
                
                // Subir nuevas imágenes si existen
                if (this.newMemorialFiles && this.newMemorialFiles.length > 0) {
                    await this.uploadMemorialImages(this.currentMemorialId, this.newMemorialFiles);
                }
                
                this.showNotification('Memorial actualizado exitosamente', 'success');
                this.hideEditMemorialModal();
                
                // Recargar memoriales
                await this.loadMemorials();
                
            } else {
                console.error('❌ Error al actualizar memorial:', result.message);
                this.showNotification(result.message || 'Error al actualizar memorial', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en updateMemorial:', error);
            this.showNotification('Error inesperado al actualizar memorial', 'error');
        }
    }
    
    // Métodos para botones del modal de vista
    editCurrentMemorial() {
        console.log('✏️ Editar memorial actual');
        this.hideViewMemorialModal();
        this.showEditMemorialModal();
    }
    
    shareCurrentMemorial() {
        console.log('📤 Compartir memorial actual');
        if (this.currentMemorialId) {
            this.shareMemorial(this.currentMemorialId);
        } else {
            this.showNotification('No hay memorial seleccionado', 'error');
        }
    }
    
    viewMemorialPublic() {
        console.log('🌐 Ver memorial público');
        if (this.currentMemorialId) {
            const publicUrl = this.client.generateMemorialUrl(this.currentMemorialId);
            window.open(publicUrl, '_blank');
        } else {
            this.showNotification('No hay memorial seleccionado', 'error');
        }
    }
    
    handleEditMemorialFileUpload(files) {
        console.log('📁 Archivos seleccionados para edición:', files.length);
        
        if (!files || files.length === 0) return;
        
        const previewContainer = document.getElementById('editMemorialImagesPreview');
        
        // Guardar archivos para subir después
        this.newMemorialFiles = Array.from(files);
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                console.warn('⚠️ Archivo no es imagen:', file.name);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-preview-item';
                imageItem.dataset.fileName = file.name;
                imageItem.dataset.fileSize = file.size;
                
                imageItem.innerHTML = `
                    <img src="${e.target.result}" alt="Nueva imagen ${index + 1}">
                    <button type="button" class="remove-image" onclick="dashboard.removeNewImage('${file.name}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-info">
                        <small>${file.name}</small>
                        <br><small>${this.formatFileSize(file.size)}</small>
                    </div>
                `;
                
                previewContainer.appendChild(imageItem);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    removeNewImage(fileName) {
        console.log('🗑️ Remover nueva imagen:', fileName);
        
        const imageElement = document.querySelector(`[data-file-name="${fileName}"]`);
        if (imageElement) {
            imageElement.remove();
        }
        
        // Remover del array de archivos
        if (this.newMemorialFiles) {
            this.newMemorialFiles = this.newMemorialFiles.filter(file => file.name !== fileName);
        }
        
        this.showNotification('Imagen removida', 'success');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // =====================================================
    // FUNCIONALIDADES DE EVENTOS
    // =====================================================
    
    showCreateEventModal() {
        console.log('➕ Mostrar modal crear evento');
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        if (modal) {
            modal.classList.remove('active');
            const form = document.getElementById('createEventForm');
            if (form) {
                form.reset();
            }
        }
    }
    
    async createEvent() {
        try {
            console.log('🔄 Creando evento...');
            
            const form = document.getElementById('createEventForm');
            if (!form) {
                throw new Error('Formulario no encontrado');
            }
            
            const formData = new FormData(form);
            
            // Validar campos requeridos
            const title = formData.get('title');
            const eventDate = formData.get('eventDate');
            
            if (!title || title.trim() === '') {
                this.showNotification('El título del evento es obligatorio', 'error');
                return;
            }
            
            if (!eventDate) {
                this.showNotification('La fecha del evento es obligatoria', 'error');
                return;
            }
            
            // Preparar datos del evento
            const eventData = {
                title: title.trim(),
                description: formData.get('description') || '',
                event_date: eventDate,
                location: formData.get('location') || '',
                address: formData.get('address') || '',
                itinerary: formData.get('itinerary') || '',
                is_public: formData.get('isPublic') === 'true',
                is_virtual: formData.get('isVirtual') === 'true',
                virtual_link: formData.get('virtualLink') || null,
                max_guests: parseInt(formData.get('maxGuests')) || null
            };
            
            // Crear evento en Supabase
            const result = await this.client.createEvent(eventData);
            
            if (result.success) {
                console.log('✅ Evento creado:', result.event);
                this.showNotification('Evento creado exitosamente', 'success');
                this.hideCreateEventModal();
                
                // Recargar eventos
                await this.loadEvents();
                
            } else {
                console.error('❌ Error al crear evento:', result.message);
                this.showNotification(result.message || 'Error al crear evento', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en createEvent:', error);
            this.showNotification('Error inesperado al crear evento', 'error');
        }
    }
    
    async viewEvent(id) {
        console.log('👁️ Ver evento:', id);
        // TODO: Implementar vista de evento
        this.showNotification('Función de vista en desarrollo', 'info');
    }
    
    async editEvent(id) {
        console.log('✏️ Editar evento:', id);
        // TODO: Implementar edición de evento
        this.showNotification('Función de edición en desarrollo', 'info');
    }
    
    async manageGuests(id) {
        console.log('👥 Gestionar invitados:', id);
        // TODO: Implementar gestión de invitados
        this.showNotification('Función de gestión en desarrollo', 'info');
    }
    
    // =====================================================
    // FUNCIONALIDADES DE TIENDA
    // =====================================================
    
    addToCart(productId) {
        console.log('🛒 Agregar al carrito:', productId);
        // TODO: Implementar agregar al carrito
        this.showNotification('Producto agregado al carrito', 'success');
    }
    
    // =====================================================
    // FUNCIONALIDADES DE PERFIL
    // =====================================================
    
    async uploadProfileAvatar(file) {
        try {
            console.log('📁 Subiendo avatar de perfil...');
            
            // Validar archivo
            if (!file.type.startsWith('image/')) {
                this.showNotification('Solo se permiten archivos de imagen', 'error');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) { // 2MB
                this.showNotification('El archivo es demasiado grande. Máximo 2MB', 'error');
                return;
            }
            
            // Mostrar preview inmediatamente
            const preview = document.getElementById('profileAvatarPreview');
            if (preview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
            
            // Subir archivo a Supabase Storage
            const uploadResult = await this.client.uploadFile(file, 'avatars');
            
            if (uploadResult.success) {
                console.log('✅ Avatar subido:', uploadResult.url);
                
                // Actualizar perfil del usuario con la nueva URL del avatar
                const updateResult = await this.client.updateProfile({
                    avatar_url: uploadResult.url
                });
                
                if (updateResult.success) {
                    this.showNotification('Avatar actualizado exitosamente', 'success');
                    // Actualizar datos del usuario
                    this.userData = updateResult.profile;
                } else {
                    console.error('❌ Error al actualizar perfil:', updateResult.message);
                    this.showNotification('Error al actualizar perfil', 'error');
                }
                
            } else {
                console.error('❌ Error al subir avatar:', uploadResult.message);
                this.showNotification('Error al subir avatar', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en uploadProfileAvatar:', error);
            this.showNotification('Error inesperado al subir avatar', 'error');
        }
    }
    
    async removeProfileAvatar() {
        try {
            console.log('🗑️ Eliminando avatar de perfil...');
            
            // Actualizar perfil del usuario removiendo la URL del avatar
            const updateResult = await this.client.updateProfile({
                avatar_url: null
            });
            
            if (updateResult.success) {
                // Restaurar imagen por defecto
                const preview = document.getElementById('profileAvatarPreview');
                if (preview) {
                    preview.src = 'assets/images/default-avatar.png';
                }
                
                this.showNotification('Avatar eliminado exitosamente', 'success');
                // Actualizar datos del usuario
                this.userData = updateResult.profile;
            } else {
                console.error('❌ Error al eliminar avatar:', updateResult.message);
                this.showNotification('Error al eliminar avatar', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error en removeProfileAvatar:', error);
            this.showNotification('Error inesperado al eliminar avatar', 'error');
        }
    }
} 