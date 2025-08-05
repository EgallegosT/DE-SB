// =====================================================
// CLIENTE SUPABASE PARA FRONTEND - REEMPLAZA BACKEND
// =====================================================

// Configuración de Supabase
const SUPABASE_URL = 'https://ievlgjhcmmysnmgcmrup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldmxnamhjbW15c25tZ2NtcnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDMxNzMsImV4cCI6MjA2OTk3OTE3M30.wT8BBbpm7cwjQFsxDbCw1DOu0BkXXRA7UZPZfXEHK7A';

// Cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================================
// CLASE PRINCIPAL DE SUPABASE CLIENT
// =====================================================

class SupabaseClient {
    constructor() {
        this.supabase = supabase;
        this.user = null;
        this.session = null;
        
        // Inicializar
        this.init();
    }
    
    async init() {
        try {
            console.log('🔄 Inicializando cliente de Supabase...');
            
            // Obtener sesión actual
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Error obteniendo sesión:', error);
            }
            
            this.session = session;
            this.user = session?.user || null;
            
            console.log('✅ Sesión actual:', this.session ? 'Activa' : 'Inactiva');
            console.log('✅ Usuario actual:', this.user ? this.user.email : 'No autenticado');
            
            // Escuchar cambios de autenticación
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔄 Cambio de estado de autenticación:', event);
                
                this.session = session;
                this.user = session?.user || null;
                
                console.log('✅ Nueva sesión:', session ? 'Activa' : 'Inactiva');
                console.log('✅ Nuevo usuario:', this.user ? this.user.email : 'No autenticado');
                
                // Disparar evento personalizado
                window.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { user: this.user, session: this.session }
                }));
            });
            
            console.log('✅ Cliente de Supabase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando cliente de Supabase:', error);
        }
    }
    
    // =====================================================
    // AUTENTICACIÓN
    // =====================================================
    
    async register(userData) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        phone: userData.phone,
                        role: 'user'
                    }
                }
            });
            
            if (error) throw error;
            
            return {
                success: true,
                user: data.user,
                message: 'Usuario registrado exitosamente. Verifica tu email.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al registrar usuario'
            };
        }
    }
    
    async login(credentials) {
        try {
            console.log('🔄 Intentando login con:', credentials.email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });
            
            if (error) {
                console.error('❌ Error en login:', error);
                throw error;
            }
            
            // Actualizar la sesión y usuario en la instancia
            this.session = data.session;
            this.user = data.user;
            
            console.log('✅ Login exitoso para:', data.user.email);
            console.log('✅ Sesión establecida:', !!data.session);
            
            return {
                success: true,
                user: data.user,
                session: data.session,
                message: 'Inicio de sesión exitoso'
            };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error en las credenciales'
            };
        }
    }
    
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            return {
                success: true,
                message: 'Sesión cerrada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al cerrar sesión'
            };
        }
    }
    
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Email de recuperación enviado'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al enviar email de recuperación'
            };
        }
    }
    
    async updatePassword(newPassword) {
        try {
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al actualizar contraseña'
            };
        }
    }
    
    // =====================================================
    // PERFIL DE USUARIO
    // =====================================================
    
    async getProfile() {
        try {
            if (!this.user) {
                throw new Error('Usuario no autenticado');
            }
            
            // Usar los datos de Supabase Auth en lugar de la tabla users
            const profile = {
                id: this.user.id,
                email: this.user.email,
                first_name: this.user.user_metadata?.first_name || '',
                last_name: this.user.user_metadata?.last_name || '',
                phone: this.user.user_metadata?.phone || '',
                avatar_url: this.user.user_metadata?.avatar_url || '',
                is_active: true,
                email_verified: this.user.email_confirmed_at ? true : false,
                created_at: this.user.created_at,
                updated_at: this.user.updated_at
            };
            
            return {
                success: true,
                profile: profile
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener perfil'
            };
        }
    }
    
    async updateProfile(profileData) {
        try {
            if (!this.user) {
                throw new Error('Usuario no autenticado');
            }
            
            // Actualizar los metadatos del usuario en Supabase Auth
            const { data, error } = await this.supabase.auth.updateUser({
                data: {
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone: profileData.phone,
                    avatar_url: profileData.avatar_url
                }
            });
            
            if (error) throw error;
            
            // Actualizar el usuario en la instancia
            this.user = data.user;
            
            return {
                success: true,
                profile: this.user,
                message: 'Perfil actualizado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al actualizar perfil'
            };
        }
    }
    
    // =====================================================
    // UTILIDADES DE ID DE USUARIO
    // =====================================================

    async getSerialUserId() {
        if (!this.user) {
            throw new Error('Usuario no autenticado');
        }
        console.log('🔄 getSerialUserId - Intentando obtener ID serial para email:', this.user.email);
        const { data: userData, error: userError } = await this.supabase
            .from('users')
            .select('id')
            .eq('email', this.user.email)
            .single();

        if (userError) {
            console.error('❌ Error al obtener ID serial del usuario:', userError);
            throw userError;
        }
        console.log('✅ getSerialUserId - ID serial obtenido:', userData.id);
        return userData.id;
    }
    
    // =====================================================
    // MEMORIALES
    // =====================================================
    
    async getMemorials(filters = {}) {
        try {
            console.log('🔄 getMemorials - Usuario autenticado:', this.user?.id);
            console.log('🔄 getMemorials - Filtros iniciales:', filters);
            
            let query = this.supabase
                .from('memorial_profiles')
                .select(`
                    *,
                    memorial_images (
                        id,
                        image_url,
                        caption,
                        is_primary,
                        display_order
                    )
                `);
            
            // Si no se especifica user_id, usar el usuario autenticado
            if (!filters.user_id && this.user) {
                // Obtener el ID serial del usuario de la tabla users
                try {
                    filters.user_id = await this.getSerialUserId();
                    console.log('🔄 getMemorials - Usando ID serial del usuario autenticado:', filters.user_id);
                } catch (error) {
                    console.error('❌ getMemorials - No se pudo obtener el ID serial del usuario, usando UUID temporalmente:', this.user.id);
                    filters.user_id = this.user.id; 
                }
            }
            
            // Aplicar filtros
            if (filters.user_id) {
                query = query.eq('user_id', filters.user_id);
                console.log('🔄 getMemorials - Aplicando filtro user_id:', filters.user_id);
            }
            if (filters.is_public !== undefined) {
                query = query.eq('is_public', filters.is_public);
            }
            if (filters.is_active !== undefined) {
                query = query.eq('is_active', filters.is_active);
            }
            
            // Ordenar por fecha de creación
            query = query.order('created_at', { ascending: false });
            
            console.log('🔄 getMemorials - Ejecutando query...');
            const { data, error } = await query;
            
            if (error) throw error;
            
            // Procesar los datos para ordenar las imágenes por is_primary y display_order
            const processedMemorials = data.map(memorial => {
                if (memorial.memorial_images && memorial.memorial_images.length > 0) {
                    // Ordenar imágenes: primarias primero, luego por display_order
                    memorial.images = memorial.memorial_images.sort((a, b) => {
                        if (a.is_primary && !b.is_primary) return -1;
                        if (!a.is_primary && b.is_primary) return 1;
                        return a.display_order - b.display_order;
                    });
                } else {
                    memorial.images = [];
                }
                return memorial;
            });
            
            console.log('🔄 getMemorials - Memoriales procesados:', processedMemorials.length);
            
            return {
                success: true,
                memorials: processedMemorials
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener memoriales'
            };
        }
    }
    
    async getMemorial(id) {
        try {
            const { data, error } = await this.supabase
                .from('memorial_profiles')
                .select(`
                    *,
                    memorial_images (
                        id,
                        image_url,
                        caption,
                        is_primary,
                        display_order
                    )
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            // Procesar imágenes
            if (data.memorial_images && data.memorial_images.length > 0) {
                data.images = data.memorial_images.sort((a, b) => {
                    if (a.is_primary && !b.is_primary) return -1;
                    if (!a.is_primary && b.is_primary) return 1;
                    return a.display_order - b.display_order;
                });
            } else {
                data.images = [];
            }
            
            return {
                success: true,
                memorial: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener memorial'
            };
        }
    }

    async getPublicMemorials(filters = {}) {
        try {
            console.log('🔄 getPublicMemorials - Obteniendo memoriales públicos');
            
            let query = this.supabase
                .from('memorial_profiles')
                .select(`
                    *,
                    memorial_images (
                        id,
                        image_url,
                        caption,
                        is_primary,
                        display_order
                    )
                `)
                .eq('is_public', true)
                .eq('is_active', true);
            
            // Aplicar filtros adicionales
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            // Ordenar por fecha de creación
            query = query.order('created_at', { ascending: false });
            
            console.log('🔄 getPublicMemorials - Ejecutando query...');
            const { data, error } = await query;
            
            if (error) throw error;
            
            // Procesar los datos para ordenar las imágenes
            const processedMemorials = data.map(memorial => {
                if (memorial.memorial_images && memorial.memorial_images.length > 0) {
                    memorial.images = memorial.memorial_images.sort((a, b) => {
                        if (a.is_primary && !b.is_primary) return -1;
                        if (!a.is_primary && b.is_primary) return 1;
                        return a.display_order - b.display_order;
                    });
                } else {
                    memorial.images = [];
                }
                return memorial;
            });
            
            console.log('🔄 getPublicMemorials - Memoriales públicos encontrados:', processedMemorials.length);
            
            return {
                success: true,
                memorials: processedMemorials
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener memoriales públicos'
            };
        }
    }

    generateMemorialUrl(memorialId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}/memorial.html?id=${memorialId}`;
    }

    async incrementMemorialViews(memorialId) {
        try {
            const { data, error } = await this.supabase
                .from('memorial_profiles')
                .update({ view_count: this.supabase.raw('view_count + 1') })
                .eq('id', memorialId)
                .select('view_count')
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                view_count: data.view_count
            };
        } catch (error) {
            console.error('❌ Error al incrementar vistas:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async createMemorial(memorialData) {
        try {
            if (!this.user) {
                throw new Error('Usuario no autenticado');
            }
            
            // Obtener el ID serial del usuario de la tabla users
            const serialUserId = await this.getSerialUserId();
            
            const { data, error } = await this.supabase
                .from('memorial_profiles')
                .insert({
                    ...memorialData,
                    user_id: serialUserId
                })
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                memorial: data,
                message: 'Memorial creado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al crear memorial'
            };
        }
    }
    
    async saveMemorialImage(imageData) {
        try {
            const { data, error } = await this.supabase
                .from('memorial_images')
                .insert(imageData)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                image: data,
                message: 'Imagen guardada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al guardar imagen'
            };
        }
    }
    
    async updateMemorial(id, memorialData) {
        try {
            const { data, error } = await this.supabase
                .from('memorial_profiles')
                .update(memorialData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                memorial: data,
                message: 'Memorial actualizado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al actualizar memorial'
            };
        }
    }
    
    async deleteMemorial(id) {
        try {
            const { error } = await this.supabase
                .from('memorial_profiles')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Memorial eliminado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al eliminar memorial'
            };
        }
    }
    
    // =====================================================
    // TIMELINE EVENTS
    // =====================================================
    
    async getTimelineEvents(memorialId) {
        try {
            const { data, error } = await this.supabase
                .from('life_timeline')
                .select('*')
                .eq('memorial_id', memorialId)
                .order('date', { ascending: true })
                .order('display_order', { ascending: true });
            
            if (error) throw error;
            
            return {
                success: true,
                events: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener eventos del timeline'
            };
        }
    }
    
    async createTimelineEvent(eventData) {
        try {
            const { data, error } = await this.supabase
                .from('life_timeline')
                .insert(eventData)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                event: data,
                message: 'Evento del timeline creado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al crear evento del timeline'
            };
        }
    }
    
    async updateTimelineEvent(id, eventData) {
        try {
            const { data, error } = await this.supabase
                .from('life_timeline')
                .update(eventData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                event: data,
                message: 'Evento del timeline actualizado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al actualizar evento del timeline'
            };
        }
    }
    
    async deleteTimelineEvent(id) {
        try {
            const { error } = await this.supabase
                .from('life_timeline')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Evento del timeline eliminado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al eliminar evento del timeline'
            };
        }
    }
    
    // =====================================================
    // EVENTOS
    // =====================================================
    
    async getEvents(filters = {}) {
        try {
            console.log('🔄 getEvents - Usuario autenticado:', this.user?.id);
            console.log('🔄 getEvents - Filtros iniciales:', filters);
            
            let query = this.supabase
                .from('events')
                .select('*');
            
            // Si no se especifica user_id, usar el usuario autenticado
            if (!filters.user_id && this.user) {
                // Obtener el ID serial del usuario de la tabla users
                try {
                    filters.user_id = await this.getSerialUserId();
                    console.log('🔄 getEvents - Usando ID serial del usuario autenticado:', filters.user_id);
                } catch (error) {
                    console.error('❌ getEvents - No se pudo obtener el ID serial del usuario, usando UUID temporalmente:', this.user.id);
                    filters.user_id = this.user.id;
                }
            }
            
            // Aplicar filtros
            if (filters.memorial_id) {
                query = query.eq('memorial_id', filters.memorial_id);
            }
            if (filters.user_id) {
                query = query.eq('user_id', filters.user_id);
                console.log('🔄 getEvents - Aplicando filtro user_id:', filters.user_id);
            }
            if (filters.is_public !== undefined) {
                query = query.eq('is_public', filters.is_public);
            }
            
            // Ordenar por fecha
            query = query.order('event_date', { ascending: true });
            
            console.log('🔄 getEvents - Ejecutando query...');
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                events: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener eventos'
            };
        }
    }
    
    async createEvent(eventData) {
        try {
            if (!this.user) {
                throw new Error('Usuario no autenticado');
            }
            
            // Obtener el ID serial del usuario de la tabla users
            const serialUserId = await this.getSerialUserId();
            
            const { data, error } = await this.supabase
                .from('events')
                .insert({
                    ...eventData,
                    user_id: serialUserId
                })
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                event: data,
                message: 'Evento creado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al crear evento'
            };
        }
    }
    
    // =====================================================
    // PRODUCTOS Y TIENDA
    // =====================================================
    
    async getProducts(filters = {}) {
        try {
            let query = this.supabase
                .from('products')
                .select('*');
            
            // Aplicar filtros
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            // Ordenar por nombre
            query = query.order('name', { ascending: true });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                products: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener productos'
            };
        }
    }
    
    async getProduct(id) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                product: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener producto'
            };
        }
    }
    
    // =====================================================
    // STORAGE (ARCHIVOS)
    // =====================================================
    
    async uploadFile(file, bucket = 'memorials') {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = `${this.user.id}/${fileName}`;
            
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(filePath, file);
            
            if (error) throw error;
            
            // Obtener URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            
            return {
                success: true,
                url: publicUrl,
                path: filePath,
                message: 'Archivo subido exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al subir archivo'
            };
        }
    }
    
    async deleteFile(path, bucket = 'memorials') {
        try {
            const { error } = await this.supabase.storage
                .from(bucket)
                .remove([path]);
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Archivo eliminado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al eliminar archivo'
            };
        }
    }
    
    // =====================================================
    // UTILIDADES
    // =====================================================
    
    isAuthenticated() {
        // Verificar si hay usuario en la instancia
        if (this.user) {
            return true;
        }
        
        // Verificar si hay sesión activa en Supabase
        if (this.session) {
            return true;
        }
        
        // Verificar si hay sesión en localStorage (fallback)
        try {
            const session = localStorage.getItem('sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
            if (session) {
                return true;
            }
        } catch (error) {
            console.error('Error verificando sesión en localStorage:', error);
        }
        
        return false;
    }
    
    getUser() {
        return this.user;
    }
    
    getSession() {
        return this.session;
    }
    
    isAdmin() {
        return this.user?.user_metadata?.role === 'admin';
    }
    
    // =====================================================
    // NOTIFICACIONES
    // =====================================================
    
    showNotification(message, type = 'info') {
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
    }
    
    // =====================================================
    // VALIDACIONES
    // =====================================================
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePassword(password) {
        return password.length >= 6;
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price);
    }
}

// =====================================================
// INSTANCIA GLOBAL
// =====================================================

// Crear instancia global
window.supabaseClient = new SupabaseClient();

// Exportar para uso en otros archivos
window.SupabaseClient = SupabaseClient; 