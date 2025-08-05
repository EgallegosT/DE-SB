// admin-dashboard.js

var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

// Event listener para el botón de logout (se ejecuta inmediatamente)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Buscando botón logout:', logoutBtn);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Click en botón logout detectado');
            if (window.logout) {
                window.logout();
            } else {
                console.error('Función logout no está disponible');
            }
        });
        console.log('Event listener agregado al botón logout');
    } else {
        console.error('No se encontró el botón logout');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Navegación entre secciones
    const links = document.querySelectorAll('.sidebar-link');
    const sectionTitle = document.getElementById('section-title');
    const sectionContent = document.getElementById('section-content');

    // Función helper para obtener el nombre de la sección
    function getSectionDisplayName(section) {
        const sectionNames = {
            'usuarios': 'Usuarios',
            'memoriales': 'Memoriales',
            'eventos': 'Eventos',
            'productos': 'Productos',
            'log': 'Log de Actividad',
            'configuracion': 'Configuración'
        };
        return sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
    }

    // Navegación entre secciones mejorada
    function activarSeccion(section) {
        // Quitar clase active de todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
        // Activar la sección correspondiente
        const sectionId = section + 'Section';
        const sec = document.getElementById(sectionId);
        if (sec) sec.classList.add('active');
        
        // Actualizar título de la página
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            const sectionName = getSectionDisplayName(section);
            pageTitle.textContent = sectionName;
            
            // Actualizar también el título del documento (pestaña del navegador)
            document.title = `${sectionName} - Panel de Administración - Despedida Eterna`;
        }
        
        // Actualizar hash
        window.location.hash = section;
    }

    // Modificar el listener de los links
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const section = link.getAttribute('data-section');
            activarSeccion(section);
            loadSection(section);
        });
    });

    // Soporte para navegación por hash
    function navegarPorHash() {
        const hash = window.location.hash.replace('#', '');
        const section = hash || 'usuarios';
        
        // Activar el link correspondiente
        links.forEach(l => {
            if (l.getAttribute('data-section') === section) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
        
        // Activar la sección y actualizar título
        activarSeccion(section);
        loadSection(section);
    }
    window.addEventListener('hashchange', navegarPorHash);

    // Inicializar según hash
    navegarPorHash();

    // Verificar si el usuario es admin (placeholder, implementar con JWT/backend)
    // Si no es admin, redirigir
    // if (!usuarioEsAdmin()) {
    //     window.location.href = '/login.html';
    // }

    // Asegurar que el título se actualice al cargar la página
    const initialSection = window.location.hash.replace('#', '') || 'usuarios';
    const initialSectionName = getSectionDisplayName(initialSection);
    
    // Actualizar título inicial
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = initialSectionName;
    }
    document.title = `${initialSectionName} - Panel de Administración - Despedida Eterna`;

    // Botón de añadir nuevo en cada sección
    function renderAddButton(section, onClickFn) {
        return `<div style="display:flex;justify-content:flex-end;margin-bottom:1.2rem;">
            <button class="btn btn-primary" onclick="${onClickFn}()">
                <i class="fas fa-plus"></i> Añadir nuevo
            </button>
        </div>`;
    }

    // USUARIOS
    function loadSection(section) {
        sectionContent.innerHTML = '<p>Cargando ' + section + '...</p>';
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        if (section === 'usuarios') {
            // Obtener estadísticas globales
            fetch(`${API_BASE_URL}/users/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    actualizarStatCards({});
                    return;
                }
                return res.json();
            })
            .then(stats => {
                if (stats) actualizarStatCards(stats);
            });
            // Obtener usuarios
            fetch(`${API_BASE_URL}/users/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    sectionContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los usuarios.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.users) {
                    sectionContent.innerHTML = renderAddButton('usuarios', 'mostrarModalNuevoUsuario') + renderUsersTable(data.users);
                } else if (data && data.error) {
                    sectionContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los usuarios.'}</p>`;
                }
            })
            .catch(() => {
                sectionContent.innerHTML = '<p>Error al cargar los usuarios.</p>';
            });
        } else if (section === 'memoriales') {
            const memorialesContent = document.getElementById('memoriales-content');
            if (memorialesContent) memorialesContent.innerHTML = renderAddButton('memoriales', 'mostrarModalNuevoMemorial') + '<p>Cargando memoriales...</p>';
            fetch(`${API_BASE_URL}/memorials/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    if (memorialesContent) memorialesContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los memoriales.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.memorials) {
                    if (memorialesContent) memorialesContent.innerHTML = renderAddButton('memoriales', 'mostrarModalNuevoMemorial') + renderMemorialsTable(data.memorials);
                } else if (data && data.error) {
                    if (memorialesContent) memorialesContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los memoriales.'}</p>`;
                }
            })
            .catch(() => {
                if (memorialesContent) memorialesContent.innerHTML = '<p>Error al cargar los memoriales.</p>';
            });
        } else if (section === 'eventos') {
            const eventosContent = document.getElementById('eventos-content');
            if (eventosContent) eventosContent.innerHTML = renderAddButton('eventos', 'mostrarModalNuevoEvento') + '<p>Cargando eventos...</p>';
            fetch(`${API_BASE_URL}/events/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    if (eventosContent) eventosContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los eventos.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.events) {
                    if (eventosContent) eventosContent.innerHTML = renderAddButton('eventos', 'mostrarModalNuevoEvento') + renderEventosTable(data.events);
                } else if (data && data.error) {
                    if (eventosContent) eventosContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los eventos.'}</p>`;
                }
            })
            .catch(() => {
                if (eventosContent) eventosContent.innerHTML = '<p>Error al cargar los eventos.</p>';
            });
        } else if (section === 'productos') {
            const productosContent = document.getElementById('productos-content');
            if (productosContent) productosContent.innerHTML = renderAddButton('productos', 'mostrarModalNuevoProducto') + '<p>Cargando productos...</p>';
            // Grid de stats
            fetch(`${API_BASE_URL}/products/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(stats => {
                if (productosContent) productosContent.innerHTML = renderAddButton('productos', 'mostrarModalNuevoProducto') + renderProductosStats(stats) + productosContent.innerHTML;
            });
            // Tabla de productos
            fetch(`${API_BASE_URL}/products/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    if (productosContent) productosContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los productos.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.products) {
                    if (productosContent) productosContent.innerHTML = renderAddButton('productos', 'mostrarModalNuevoProducto') + renderProductosStats(window._lastProductosStats) + renderProductosTable(data.products);
                } else if (data && data.error) {
                    if (productosContent) productosContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los productos.'}</p>`;
                }
            })
            .catch(() => {
                if (productosContent) productosContent.innerHTML = '<p>Error al cargar los productos.</p>';
            });
        } else if (section === 'log') {
            const logContent = document.getElementById('log-content');
            if (logContent) logContent.innerHTML = '<p>Cargando log de actividad...</p>';
            
            // Cargar estadísticas del log
            fetch(`${API_BASE_URL}/activity-log/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(stats => {
                if (logContent) {
                    const statsHtml = renderLogStats(stats.stats);
                    logContent.innerHTML = statsHtml + logContent.innerHTML;
                }
            })
            .catch(() => {
                if (logContent) logContent.innerHTML = '<p>Error al cargar estadísticas del log.</p>';
            });
            
            // Cargar logs de actividad
            fetch(`${API_BASE_URL}/activity-log/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    if (logContent) logContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los logs.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.logs) {
                    if (logContent) logContent.innerHTML = renderLogStats(window._lastLogStats) + renderLogTable(data.logs, data.pagination);
                } else if (data && data.error) {
                    if (logContent) logContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los logs.'}</p>`;
                }
            })
            .catch(() => {
                if (logContent) logContent.innerHTML = '<p>Error al cargar los logs de actividad.</p>';
            });
        } else if (section === 'configuracion') {
            const configContent = document.getElementById('configuracion-content');
            if (configContent) configContent.innerHTML = '<p>Cargando configuración...</p>';
            
            fetch(`${API_BASE_URL}/system-config/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(async res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!res.ok) {
                    const error = await res.json().catch(() => ({}));
                    if (configContent) configContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar las configuraciones.'}</p>`;
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.configs) {
                    if (configContent) configContent.innerHTML = renderConfiguracion(data.configs);
                } else if (data && data.error) {
                    if (configContent) configContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar las configuraciones.'}</p>`;
                }
            })
            .catch(() => {
                if (configContent) configContent.innerHTML = '<p>Error al cargar la configuración.</p>';
            });
        } else {
            sectionContent.innerHTML = `<p>Sección <b>${section}</b> en construcción.</p>`;
        }
    }

    function renderUsersTable(users) {
        window._adminUsers = users;
        let html = '<table class="admin-table"><thead><tr><th>ID</th><th>Email</th><th>Nombre</th><th>WhatsApp</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
        users.forEach(u => {
            html += `<tr>
                <td>${u.id}</td>
                <td>${u.email}</td>
                <td>${u.first_name} ${u.last_name}</td>
                <td>${u.phone || '-'}</td>
                <td>${u.role}</td>
                <td>${u.is_active ? 'Sí' : 'No'}</td>
                <td>
                    <button class="action-btn" title="Editar usuario" onclick="editarUsuario(${u.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Eliminar usuario" onclick="eliminarUsuario(${u.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="action-btn" title="${u.is_active ? 'Inactivar' : 'Activar'} usuario" onclick="toggleActivoUsuario(${u.id}, ${u.is_active})">
                        <i class="fas fa-user-slash"></i>
                    </button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    function renderMemorialsTable(memorials) {
        window._adminMemorials = memorials;
        let html = '<table class="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Usuario</th><th>Activo</th><th>Creado</th><th>Acciones</th></tr></thead><tbody>';
        memorials.forEach(m => {
            html += `<tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.user_first_name || ''} ${m.user_last_name || ''} <br><small>${m.user_email || ''}</small></td>
                <td>${m.is_active ? 'Sí' : 'No'}</td>
                <td>${m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</td>
                <td>
                    <button class="action-btn" title="Editar memorial" onclick="editarMemorial(${m.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" title="Eliminar memorial" onclick="eliminarMemorial(${m.id})"><i class="fas fa-trash-alt"></i></button>
                    <button class="action-btn" title="${m.is_active ? 'Inactivar' : 'Activar'} memorial" onclick="toggleActivoMemorial(${m.id}, ${m.is_active})"><i class="fas fa-user-slash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    function renderEventosTable(events) {
        window._adminEvents = events;
        let html = '<table class="admin-table"><thead><tr><th>ID</th><th>Título</th><th>Usuario</th><th>Fecha</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
        events.forEach(e => {
            html += `<tr>
                <td>${e.id}</td>
                <td>${e.title}</td>
                <td>${e.user_first_name || ''} ${e.user_last_name || ''} <br><small>${e.user_email || ''}</small></td>
                <td>${e.event_date ? new Date(e.event_date).toLocaleDateString() : ''}</td>
                <td>${e.is_active ? 'Sí' : 'No'}</td>
                <td>
                    <button class="action-btn" title="Editar evento" onclick="editarEvento(${e.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" title="Eliminar evento" onclick="eliminarEvento(${e.id})"><i class="fas fa-trash-alt"></i></button>
                    <button class="action-btn" title="${e.is_active ? 'Inactivar' : 'Activar'} evento" onclick="toggleActivoEvento(${e.id}, ${e.is_active})"><i class="fas fa-user-slash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    function renderProductosTable(products) {
        window._adminProducts = products;
        let html = '<table class="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
        products.forEach(p => {
            html += `<tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>$${p.price}</td>
                <td>${p.category || ''}</td>
                <td>${p.is_active ? 'Sí' : 'No'}</td>
                <td>
                    <button class="action-btn" title="Editar producto" onclick="editarProducto(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" title="Eliminar producto" onclick="eliminarProducto(${p.id})"><i class="fas fa-trash-alt"></i></button>
                    <button class="action-btn" title="${p.is_active ? 'Inactivar' : 'Activar'} producto" onclick="toggleActivoProducto(${p.id}, ${p.is_active})"><i class="fas fa-user-slash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    function renderProductosStats(stats) {
        window._lastProductosStats = stats;
        if (!stats) return '';
        return `<div class="stats-grid" style="margin-bottom:2rem;">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-box"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.totalActive || 0}</h3>
                    <p class="stat-label">Publicados</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-box-open"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.totalInactive || 0}</h3>
                    <p class="stat-label">Inactivos</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.totalSales || 0}</h3>
                    <p class="stat-label">Ventas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">$${stats.totalRevenue || 0}</h3>
                    <p class="stat-label">Ingresos</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.topProduct ? stats.topProduct.sales : 0}</h3>
                    <p class="stat-label">Más vendido: ${stats.topProduct ? stats.topProduct.name : '-'}</p>
                </div>
            </div>
        </div>`;
    }

    function renderLogStats(stats) {
        window._lastLogStats = stats;
        if (!stats) return '';
        return `<div class="stats-grid" style="margin-bottom:2rem;">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clipboard-list"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.totalLogs || 0}</h3>
                    <p class="stat-label">Total Logs</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.todayLogs || 0}</h3>
                    <p class="stat-label">Hoy</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-week"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.weekLogs || 0}</h3>
                    <p class="stat-label">Esta Semana</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-bar"></i></div>
                <div class="stat-content">
                    <h3 class="stat-number">${stats.actions ? stats.actions.length : 0}</h3>
                    <p class="stat-label">Tipos de Acción</p>
                </div>
            </div>
        </div>`;
    }

    function renderLogTable(logs, pagination) {
        if (!logs || logs.length === 0) {
            return '<p>No hay logs de actividad para mostrar.</p>';
        }

        let html = '<table class="admin-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalles</th><th>IP</th></tr></thead><tbody>';
        
        logs.forEach(log => {
            const actionIcon = getActionIcon(log.action);
            const entityIcon = getEntityIcon(log.entityType);
            const formattedDate = new Date(log.createdAt).toLocaleString('es-ES');
            
            html += `<tr>
                <td><small>${formattedDate}</small></td>
                <td>
                    <div><strong>${log.userEmail || 'Sistema'}</strong></div>
                    <small>ID: ${log.userId || 'N/A'}</small>
                </td>
                <td>
                    <span class="action-badge ${log.action.toLowerCase()}">
                        <i class="${actionIcon}"></i> ${log.action}
                    </span>
                </td>
                <td>
                    <div>
                        <i class="${entityIcon}"></i> ${log.entityType || 'Sistema'}
                    </div>
                    <small>${log.entityName || ''}</small>
                </td>
                <td><small>${log.details || ''}</small></td>
                <td><small>${log.ipAddress || ''}</small></td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        
        // Agregar paginación si existe
        if (pagination && pagination.totalPages > 1) {
            html += renderPagination(pagination);
        }
        
        return html;
    }

    function getActionIcon(action) {
        const icons = {
            'LOGIN': 'fas fa-sign-in-alt',
            'LOGOUT': 'fas fa-sign-out-alt',
            'CREATE': 'fas fa-plus',
            'UPDATE': 'fas fa-edit',
            'DELETE': 'fas fa-trash-alt',
            'ACTIVATE': 'fas fa-check-circle',
            'DEACTIVATE': 'fas fa-times-circle',
            'UPLOAD': 'fas fa-upload',
            'PAYMENT': 'fas fa-credit-card',
            'DOWNLOAD': 'fas fa-download',
            'VIEW': 'fas fa-eye'
        };
        return icons[action] || 'fas fa-info-circle';
    }

    function getEntityIcon(entityType) {
        const icons = {
            'USER': 'fas fa-user',
            'MEMORIAL': 'fas fa-heart',
            'EVENT': 'fas fa-calendar',
            'PRODUCT': 'fas fa-box',
            'ORDER': 'fas fa-shopping-cart',
            'IMAGE': 'fas fa-image',
            'SYSTEM': 'fas fa-cog'
        };
        return icons[entityType] || 'fas fa-cube';
    }

    function renderPagination(pagination) {
        let html = '<div class="pagination" style="margin-top: 1rem; text-align: center;">';
        
        if (pagination.hasPrevPage) {
            html += `<button class="btn btn-outline" onclick="loadLogPage(${pagination.currentPage - 1})">Anterior</button>`;
        }
        
        html += `<span style="margin: 0 1rem;">Página ${pagination.currentPage} de ${pagination.totalPages}</span>`;
        
        if (pagination.hasNextPage) {
            html += `<button class="btn btn-outline" onclick="loadLogPage(${pagination.currentPage + 1})">Siguiente</button>`;
        }
        
        html += '</div>';
        return html;
    }

    function renderConfiguracion(configs) {
        if (!configs || Object.keys(configs).length === 0) {
            return '<p>No hay configuraciones disponibles.</p>';
        }

        let html = '<div class="config-container">';
        
        // Crear pestañas para cada categoría
        const categories = Object.keys(configs);
        html += '<div class="config-tabs">';
        categories.forEach((category, index) => {
            const categoryName = getCategoryDisplayName(category);
            html += `<button class="config-tab ${index === 0 ? 'active' : ''}" onclick="showConfigCategory('${category}')">
                <i class="${getCategoryIcon(category)}"></i> ${categoryName}
            </button>`;
        });
        html += '</div>';

        // Contenido de las configuraciones
        html += '<div class="config-content">';
        categories.forEach((category, index) => {
            html += `<div class="config-category ${index === 0 ? 'active' : ''}" id="category-${category}">`;
            html += `<h3><i class="${getCategoryIcon(category)}"></i> ${getCategoryDisplayName(category)}</h3>`;
            
            configs[category].forEach(config => {
                html += renderConfigField(config);
            });
            
            html += '</div>';
        });
        html += '</div>';
        
        html += '</div>';
        return html;
    }

    function renderConfigField(config) {
        let html = '<div class="config-field">';
        html += `<div class="config-field-header">`;
        html += `<label class="config-label">${config.displayName}`;
        if (config.isRequired) {
            html += ' <span class="required">*</span>';
        }
        html += '</label>';
        if (config.description) {
            html += `<div class="config-description">${config.description}</div>`;
        }
        html += '</div>';
        
        html += '<div class="config-field-input">';
        
        switch (config.type) {
            case 'boolean':
                html += `<div class="toggle-switch">
                    <input type="checkbox" id="config-${config.key}" 
                           ${config.value === 'true' || config.value === '1' ? 'checked' : ''}
                           onchange="updateConfig('${config.key}', this.checked)">
                    <label for="config-${config.key}"></label>
                </div>`;
                break;
                
            case 'number':
                html += `<input type="number" class="config-input" 
                               value="${config.value}" 
                               onchange="updateConfig('${config.key}', this.value)"
                               ${config.isRequired ? 'required' : ''}>`;
                break;
                
            case 'email':
                html += `<input type="email" class="config-input" 
                               value="${config.value}" 
                               onchange="updateConfig('${config.key}', this.value)"
                               ${config.isRequired ? 'required' : ''}>`;
                break;
                
            case 'url':
                html += `<input type="url" class="config-input" 
                               value="${config.value}" 
                               onchange="updateConfig('${config.key}', this.value)"
                               ${config.isRequired ? 'required' : ''}>`;
                break;
                
            default:
                html += `<input type="text" class="config-input" 
                               value="${config.value}" 
                               onchange="updateConfig('${config.key}', this.value)"
                               ${config.isRequired ? 'required' : ''}>`;
        }
        
        html += '</div>';
        html += '</div>';
        
        return html;
    }

    function getCategoryDisplayName(category) {
        const names = {
            'payment': 'Pagos',
            'analytics': 'Analytics',
            'email': 'Email',
            'site': 'Sitio Web',
            'security': 'Seguridad',
            'files': 'Archivos',
            'notifications': 'Notificaciones',
            'social': 'Redes Sociales',
            'backup': 'Backup'
        };
        return names[category] || category;
    }

    function getCategoryIcon(category) {
        const icons = {
            'payment': 'fas fa-credit-card',
            'analytics': 'fas fa-chart-line',
            'email': 'fas fa-envelope',
            'site': 'fas fa-globe',
            'security': 'fas fa-shield-alt',
            'files': 'fas fa-file-upload',
            'notifications': 'fas fa-bell',
            'social': 'fas fa-share-alt',
            'backup': 'fas fa-database'
        };
        return icons[category] || 'fas fa-cog';
    }

    // Función para mostrar categoría de configuración
    window.showConfigCategory = function(category) {
        // Ocultar todas las categorías
        document.querySelectorAll('.config-category').forEach(cat => {
            cat.classList.remove('active');
        });
        
        // Desactivar todas las pestañas
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Mostrar categoría seleccionada
        document.getElementById(`category-${category}`).classList.add('active');
        
        // Activar pestaña seleccionada
        event.target.classList.add('active');
    };

    // Función para actualizar configuración
    window.updateConfig = function(key, value) {
        const token = localStorage.getItem('token');
        
        fetch(`${API_BASE_URL}/system-config/admin/${key}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: value.toString() })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                showAdminToast({
                    message: data.message,
                    icon: 'check-circle',
                    type: 'warning',
                    confirmText: 'OK',
                    cancelText: '',
                    onConfirm: null
                });
            } else if (data.error) {
                showAdminToast({
                    message: data.message || 'Error al actualizar configuración',
                    icon: 'exclamation-triangle',
                    type: 'danger',
                    confirmText: 'OK',
                    cancelText: '',
                    onConfirm: null
                });
            }
        })
        .catch(() => {
            showAdminToast({
                message: 'Error al actualizar configuración',
                icon: 'exclamation-triangle',
                type: 'danger',
                confirmText: 'OK',
                cancelText: '',
                onConfirm: null
            });
        });
    };

    function actualizarStatCards(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalMemorials').textContent = stats.totalMemorials || 0;
        document.getElementById('totalEvents').textContent = stats.totalEvents || 0;
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
    }

    // Handlers globales para acciones (puedes implementar la lógica real después)
    window.editarUsuario = function(id) {
        const user = window._adminUsers?.find(u => u.id === id);
        if (!user) return alert('Usuario no encontrado');
        mostrarModalEditarUsuario(user);
    };

    // Toast moderno con acción
    window.showAdminToast = function({message, icon, type = 'warning', confirmText, cancelText, onConfirm}) {
        // Eliminar cualquier toast anterior
        document.querySelectorAll('.admin-toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon"><i class="fas fa-${icon}"></i></span>
            <span class="toast-message">${message}</span>
            <div class="toast-actions">
                <button class="toast-btn confirm${type === 'warning' ? ' warning' : ''}">${confirmText}</button>
                <button class="toast-btn cancel">${cancelText}</button>
            </div>
        `;
        document.body.appendChild(toast);
        toast.querySelector('.toast-btn.confirm').onclick = () => {
            toast.remove();
            onConfirm && onConfirm();
        };
        toast.querySelector('.toast-btn.cancel').onclick = () => toast.remove();
    }

    window.eliminarUsuario = function(id) {
        showAdminToast({
            message: '¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.',
            icon: 'trash-alt',
            type: 'danger',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/users/admin/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Usuario eliminado', icon: 'check-circle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('usuarios')});
                })
                .catch(() => showAdminToast({message: 'Error al eliminar usuario', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };
    window.toggleActivoUsuario = function(id, isActive) {
        const accion = isActive ? 'suspender' : 'activar';
        showAdminToast({
            message: `¿Seguro que deseas ${accion} este usuario?`,
            icon: isActive ? 'user-slash' : 'user-check',
            type: 'warning',
            confirmText: `Sí, ${accion}`,
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/users/admin/${id}/active`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_active: !isActive })
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Estado actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('usuarios')});
                })
                .catch(() => showAdminToast({message: 'Error al cambiar estado del usuario', icon: 'exclamation-triangle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };

    // Modal de edición de usuario (mejor UX)
    function mostrarModalEditarUsuario(user) {
        let modal = document.getElementById('modalEditarUsuario');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarUsuario';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;">
                    <div class="modal-header">
                        <h3>Editar Usuario</h3>
                        <button class="modal-close" onclick="document.getElementById('modalEditarUsuario').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarUsuario">
                            <div class="form-group">
                                <label>Nombre</label>
                                <input type="text" name="first_name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Apellido</label>
                                <input type="text" name="last_name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" name="phone" class="form-control" placeholder="+34 600 000 000">
                            </div>
                            <div class="form-group">
                                <label>Rol</label>
                                <select name="role" class="form-control">
                                    <option value="user">Usuario</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Activo</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalEditarUsuario').remove();document.body.style.overflow='';">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        // Rellenar datos
        const form = modal.querySelector('#formEditarUsuario');
        form.first_name.value = user.first_name;
        form.last_name.value = user.last_name;
        form.email.value = user.email;
        form.phone.value = user.phone || '';
        form.role.value = user.role;
        form.is_active.value = user.is_active ? '1' : '0';
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                first_name: form.first_name.value,
                last_name: form.last_name.value,
                email: form.email.value,
                phone: form.phone.value,
                role: form.role.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            fetch(`${API_BASE_URL}/users/admin/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Usuario actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('usuarios')});
                document.getElementById('modalEditarUsuario').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al actualizar usuario', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.textContent = 'Guardar';
            });
        };
    }

    window.editarMemorial = function(id) {
        const memorial = window._adminMemorials?.find(m => m.id === id);
        if (!memorial) return alert('Memorial no encontrado');
        mostrarModalEditarMemorial(memorial);
    };
    window.eliminarMemorial = function(id) {
        showAdminToast({
            message: '¿Seguro que deseas eliminar este memorial? Esta acción no se puede deshacer.',
            icon: 'trash-alt',
            type: 'danger',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/memorials/admin/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Memorial eliminado', icon: 'check-circle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('memoriales')});
                })
                .catch(() => showAdminToast({message: 'Error al eliminar memorial', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };
    window.toggleActivoMemorial = function(id, isActive) {
        const accion = isActive ? 'suspender' : 'activar';
        showAdminToast({
            message: `¿Seguro que deseas ${accion} este memorial?`,
            icon: isActive ? 'user-slash' : 'user-check',
            type: 'warning',
            confirmText: `Sí, ${accion}`,
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/memorials/admin/${id}/active`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_active: !isActive })
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Estado actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('memoriales')});
                })
                .catch(() => showAdminToast({message: 'Error al cambiar estado del memorial', icon: 'exclamation-triangle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };

    function mostrarModalEditarMemorial(memorial) {
        let modal = document.getElementById('modalEditarMemorial');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarMemorial';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;">
                    <div class="modal-header">
                        <h3>Editar Memorial</h3>
                        <button class="modal-close" onclick="document.getElementById('modalEditarMemorial').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarMemorial">
                            <div class="form-group">
                                <label>Nombre</label>
                                <input type="text" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Activo</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalEditarMemorial').remove();document.body.style.overflow='';">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        // Rellenar datos
        const form = modal.querySelector('#formEditarMemorial');
        form.name.value = memorial.name;
        form.is_active.value = memorial.is_active ? '1' : '0';
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                name: form.name.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            fetch(`${API_BASE_URL}/memorials/admin/${memorial.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Memorial actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('memoriales')});
                document.getElementById('modalEditarMemorial').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al actualizar memorial', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.textContent = 'Guardar';
            });
        };
    }

    window.editarEvento = function(id) {
        const evento = window._adminEvents?.find(e => e.id === id);
        if (!evento) return alert('Evento no encontrado');
        mostrarModalEditarEvento(evento);
    };
    window.eliminarEvento = function(id) {
        showAdminToast({
            message: '¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.',
            icon: 'trash-alt',
            type: 'danger',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/events/admin/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Evento eliminado', icon: 'check-circle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('eventos')});
                })
                .catch(() => showAdminToast({message: 'Error al eliminar evento', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };
    window.toggleActivoEvento = function(id, isActive) {
        const accion = isActive ? 'suspender' : 'activar';
        showAdminToast({
            message: `¿Seguro que deseas ${accion} este evento?`,
            icon: isActive ? 'user-slash' : 'user-check',
            type: 'warning',
            confirmText: `Sí, ${accion}`,
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/events/admin/${id}/active`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_active: !isActive })
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Estado actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('eventos')});
                })
                .catch(() => showAdminToast({message: 'Error al cambiar estado del evento', icon: 'exclamation-triangle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };

    function mostrarModalEditarEvento(evento) {
        let modal = document.getElementById('modalEditarEvento');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarEvento';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;">
                    <div class="modal-header">
                        <h3>Editar Evento</h3>
                        <button class="modal-close" onclick="document.getElementById('modalEditarEvento').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarEvento">
                            <div class="form-group">
                                <label>Título</label>
                                <input type="text" name="title" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Fecha</label>
                                <input type="date" name="event_date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Activo</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalEditarEvento').remove();document.body.style.overflow='';">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        // Rellenar datos
        const form = modal.querySelector('#formEditarEvento');
        form.title.value = evento.title;
        form.event_date.value = evento.event_date ? evento.event_date.split('T')[0] : '';
        form.is_active.value = evento.is_active ? '1' : '0';
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                title: form.title.value,
                event_date: form.event_date.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            fetch(`${API_BASE_URL}/events/admin/${evento.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Evento actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('eventos')});
                document.getElementById('modalEditarEvento').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al actualizar evento', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.textContent = 'Guardar';
            });
        };
    }

    window.editarProducto = function(id) {
        const producto = window._adminProducts?.find(p => p.id === id);
        if (!producto) return alert('Producto no encontrado');
        mostrarModalEditarProducto(producto);
    };
    window.eliminarProducto = function(id) {
        showAdminToast({
            message: '¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.',
            icon: 'trash-alt',
            type: 'danger',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/products/admin/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Producto eliminado', icon: 'check-circle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('productos')});
                })
                .catch(() => showAdminToast({message: 'Error al eliminar producto', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };
    window.toggleActivoProducto = function(id, isActive) {
        const accion = isActive ? 'suspender' : 'activar';
        showAdminToast({
            message: `¿Seguro que deseas ${accion} este producto?`,
            icon: isActive ? 'user-slash' : 'user-check',
            type: 'warning',
            confirmText: `Sí, ${accion}`,
            cancelText: 'Cancelar',
            onConfirm: () => {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/products/admin/${id}/active`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_active: !isActive })
                })
                .then(res => res.json())
                .then(data => {
                    showAdminToast({message: data.message || 'Estado actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('productos')});
                })
                .catch(() => showAdminToast({message: 'Error al cambiar estado del producto', icon: 'exclamation-triangle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: null}));
            }
        });
    };

    function mostrarModalEditarProducto(producto) {
        let modal = document.getElementById('modalEditarProducto');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalEditarProducto';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:400px;">
                    <div class="modal-header">
                        <h3>Editar Producto</h3>
                        <button class="modal-close" onclick="document.getElementById('modalEditarProducto').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarProducto">
                            <div class="form-group">
                                <label>Nombre</label>
                                <input type="text" name="name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Precio</label>
                                <input type="number" name="price" class="form-control" required min="0" step="0.01">
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <input type="text" name="category" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Activo</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalEditarProducto').remove();document.body.style.overflow='';">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        // Rellenar datos
        const form = modal.querySelector('#formEditarProducto');
        form.name.value = producto.name;
        form.price.value = producto.price;
        form.category.value = producto.category || '';
        form.is_active.value = producto.is_active ? '1' : '0';
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                name: form.name.value,
                price: form.price.value,
                category: form.category.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            fetch(`${API_BASE_URL}/products/admin/${producto.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Producto actualizado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('productos')});
                document.getElementById('modalEditarProducto').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al actualizar producto', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.textContent = 'Guardar';
            });
        };
    }

    // MODALES DE ALTA
    window.mostrarModalNuevoUsuario = function() {
        let modal = document.getElementById('modalNuevoUsuario');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalNuevoUsuario';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Nuevo Usuario</h3>
                        <button class="modal-close" onclick="document.getElementById('modalNuevoUsuario').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoUsuario">
                            <div class="form-group">
                                <label class="required">Nombre</label>
                                <input type="text" name="first_name" class="form-control" required placeholder="Ingresa el nombre">
                            </div>
                            <div class="form-group">
                                <label class="required">Apellido</label>
                                <input type="text" name="last_name" class="form-control" required placeholder="Ingresa el apellido">
                            </div>
                            <div class="form-group">
                                <label class="required">Email</label>
                                <input type="email" name="email" class="form-control" required placeholder="usuario@ejemplo.com">
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" name="phone" class="form-control" placeholder="+34 600 000 000">
                            </div>
                            <div class="form-group">
                                <label class="required">Rol</label>
                                <select name="role" class="form-control">
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="required">Estado</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="required">Contraseña</label>
                                <input type="password" name="password" class="form-control" required placeholder="Mínimo 6 caracteres">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Crear Usuario
                                </button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalNuevoUsuario').remove();document.body.style.overflow='';">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        const form = modal.querySelector('#formNuevoUsuario');
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                first_name: form.first_name.value,
                last_name: form.last_name.value,
                email: form.email.value,
                phone: form.phone.value,
                role: form.role.value,
                is_active: form.is_active.value === '1' ? 1 : 0,
                password: form.password.value
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
            fetch(`${API_BASE_URL}/users/admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Usuario creado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('usuarios')});
                document.getElementById('modalNuevoUsuario').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al crear usuario', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Crear Usuario';
            });
        };
    };

    window.mostrarModalNuevoMemorial = function() {
        let modal = document.getElementById('modalNuevoMemorial');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalNuevoMemorial';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-circle"></i> Nuevo Memorial</h3>
                        <button class="modal-close" onclick="document.getElementById('modalNuevoMemorial').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoMemorial">
                            <div class="form-group">
                                <label class="required">Nombre del Memorial</label>
                                <input type="text" name="name" class="form-control" required placeholder="Nombre del ser querido">
                            </div>
                            <div class="form-group">
                                <label class="required">Usuario Propietario</label>
                                <select name="user_id" class="form-control">
                                    <option value="">Selecciona un usuario</option>
                                    ${window._adminUsers?.map(u => `<option value="${u.id}">${u.first_name} ${u.last_name} (${u.email})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="required">Estado</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Crear Memorial
                                </button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalNuevoMemorial').remove();document.body.style.overflow='';">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        const form = modal.querySelector('#formNuevoMemorial');
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                name: form.name.value,
                user_id: form.user_id.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
            fetch(`${API_BASE_URL}/memorials/admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Memorial creado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('memoriales')});
                document.getElementById('modalNuevoMemorial').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al crear memorial', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Crear Memorial';
            });
        };
    };

    window.mostrarModalNuevoEvento = function() {
        let modal = document.getElementById('modalNuevoEvento');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalNuevoEvento';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-calendar-plus"></i> Nuevo Evento</h3>
                        <button class="modal-close" onclick="document.getElementById('modalNuevoEvento').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoEvento">
                            <div class="form-group">
                                <label class="required">Título del Evento</label>
                                <input type="text" name="title" class="form-control" required placeholder="Ej: Aniversario de nacimiento">
                            </div>
                            <div class="form-group">
                                <label class="required">Fecha del Evento</label>
                                <input type="date" name="event_date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label class="required">Usuario Propietario</label>
                                <select name="user_id" class="form-control">
                                    <option value="">Selecciona un usuario</option>
                                    ${window._adminUsers?.map(u => `<option value="${u.id}">${u.first_name} ${u.last_name} (${u.email})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="required">Estado</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Crear Evento
                                </button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalNuevoEvento').remove();document.body.style.overflow='';">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        const form = modal.querySelector('#formNuevoEvento');
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                title: form.title.value,
                event_date: form.event_date.value,
                user_id: form.user_id.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
            fetch(`${API_BASE_URL}/events/admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Evento creado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('eventos')});
                document.getElementById('modalNuevoEvento').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al crear evento', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Crear Evento';
            });
        };
    };

    window.mostrarModalNuevoProducto = function() {
        let modal = document.getElementById('modalNuevoProducto');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalNuevoProducto';
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-box"></i> Nuevo Producto</h3>
                        <button class="modal-close" onclick="document.getElementById('modalNuevoProducto').remove();document.body.style.overflow='';"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="formNuevoProducto">
                            <div class="form-group">
                                <label class="required">Nombre del Producto</label>
                                <input type="text" name="name" class="form-control" required placeholder="Ej: Arreglo Floral Memorial">
                            </div>
                            <div class="form-group">
                                <label class="required">Precio</label>
                                <div class="price-input">
                                    <input type="number" name="price" class="form-control" required min="0" step="0.01" placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Categoría</label>
                                <input type="text" name="category" class="form-control" placeholder="Ej: Flores, Velas, Placas">
                            </div>
                            <div class="form-group">
                                <label class="required">Usuario Propietario</label>
                                <select name="user_id" class="form-control">
                                    <option value="">Selecciona un usuario</option>
                                    ${window._adminUsers?.map(u => `<option value="${u.id}">${u.first_name} ${u.last_name} (${u.email})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="required">Estado</label>
                                <select name="is_active" class="form-control">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Crear Producto
                                </button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('modalNuevoProducto').remove();document.body.style.overflow='';">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.body.style.overflow = 'hidden';
        const form = modal.querySelector('#formNuevoProducto');
        form.onsubmit = function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const data = {
                name: form.name.value,
                price: form.price.value,
                category: form.category.value,
                user_id: form.user_id.value,
                is_active: form.is_active.value === '1' ? 1 : 0
            };
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
            fetch(`${API_BASE_URL}/products/admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                showAdminToast({message: data.message || 'Producto creado', icon: 'check-circle', type: 'warning', confirmText: 'OK', cancelText: '', onConfirm: () => loadSection('productos')});
                document.getElementById('modalNuevoProducto').remove();
                document.body.style.overflow = '';
            })
            .catch(() => showAdminToast({message: 'Error al crear producto', icon: 'exclamation-triangle', type: 'danger', confirmText: 'OK', cancelText: '', onConfirm: null}))
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Crear Producto';
            });
        };
    };

    // Función para cargar páginas del log
    window.loadLogPage = function(page) {
        const token = localStorage.getItem('token');
        const logContent = document.getElementById('log-content');
        
        if (logContent) logContent.innerHTML = '<p>Cargando página...</p>';
        
        fetch(`${API_BASE_URL}/activity-log/admin/all?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(async res => {
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/login.html';
                return;
            }
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                if (logContent) logContent.innerHTML = `<p>Error: ${error.message || 'No se pudieron cargar los logs.'}</p>`;
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data && data.logs) {
                if (logContent) logContent.innerHTML = renderLogStats(window._lastLogStats) + renderLogTable(data.logs, data.pagination);
            } else if (data && data.error) {
                if (logContent) logContent.innerHTML = `<p>Error: ${data.message || 'No se pudieron cargar los logs.'}</p>`;
            }
        })
        .catch(() => {
            if (logContent) logContent.innerHTML = '<p>Error al cargar los logs de actividad.</p>';
        });
    };

    // Funciones de sidebar
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar && sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    window.closeSidebar = function() {
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
    };

    function openSidebar() {
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

    function closeSidebar() {
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

    // Event listener para cerrar sidebar al hacer clic fuera de él
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            closeSidebar();
        }
    });

    // Función de logout
    window.logout = async function() {
        console.log('Función logout ejecutada');
        showAdminToast({
            message: '¿Estás seguro de que quieres cerrar sesión?',
            icon: 'sign-out-alt',
            type: 'warning',
            confirmText: 'Sí, Cerrar Sesión',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        await fetch(`${API_BASE_URL}/auth/logout`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error durante logout:', error);
                } finally {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                }
            }
        });
    }

}); 