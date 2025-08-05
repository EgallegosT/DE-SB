// =====================================================
// MEMORIALES PÚBLICOS - ADAPTADO PARA SUPABASE
// =====================================================

// Cliente de Supabase
const client = window.supabaseClient;

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const yearInput = document.getElementById('yearInput');
const locationInput = document.getElementById('locationInput');
const sortInput = document.getElementById('sortInput');
const memorialsGrid = document.getElementById('memorialsGrid');
const paginationDiv = document.getElementById('pagination');

let currentPage = 1;
let lastQuery = {};

// Función para obtener la URL de la imagen desde Supabase Storage
function getImageUrl(imageUrl) {
    if (!imageUrl) return 'assets/images/default-avatar.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return imageUrl; // Supabase ya devuelve URLs completas
}

async function fetchMemorials(params = {}) {
    try {
        console.log('🔄 Cargando memoriales públicos...');
        
        // Mostrar loading
        memorialsGrid.innerHTML = '<div class="loading-memorials">Cargando memoriales...</div>';
        
        // Obtener memoriales públicos desde Supabase
        const result = await client.getPublicMemorials({
            search: params.search || '',
            limit: 12 // 12 memoriales por página
        });
        
        if (!result.success) {
            throw new Error(result.message || 'Error al cargar memoriales');
        }
        
        // Simular paginación (Supabase no tiene paginación nativa en este caso)
        const page = params.page || 1;
        const itemsPerPage = 12;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMemorials = result.memorials.slice(startIndex, endIndex);
        
        // Crear objeto de paginación
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(result.memorials.length / itemsPerPage),
            totalItems: result.memorials.length,
            itemsPerPage: itemsPerPage
        };
        
        renderMemorials(paginatedMemorials);
        renderPagination(pagination);
        
    } catch (error) {
        console.error('❌ Error al cargar memoriales:', error);
        memorialsGrid.innerHTML = '<div class="error-memorials">Error al cargar memoriales.</div>';
    }
}

function renderMemorials(memorials) {
    if (!memorials.length) {
        memorialsGrid.innerHTML = '<div class="no-memorials">No se encontraron memoriales públicos.</div>';
        return;
    }
    
    memorialsGrid.innerHTML = memorials.map(m => {
        // Obtener imagen principal
        const mainImage = m.images && m.images.length > 0 
            ? m.images.find(img => img.is_primary) || m.images[0]
            : null;
        
        const imageUrl = mainImage ? mainImage.image_url : 'assets/images/default-avatar.png';
        
        // Formatear fechas
        const birthYear = m.birth_date ? new Date(m.birth_date).getFullYear() : '';
        const deathYear = m.death_date ? new Date(m.death_date).getFullYear() : '';
        const datesText = birthYear && deathYear ? `${birthYear} - ${deathYear}` : 
                         birthYear ? `Nacimiento: ${birthYear}` : 
                         deathYear ? `Fallecimiento: ${deathYear}` : '';
        
        return `
            <div class="memorial-card">
                <img class="memorial-image" src="${getImageUrl(imageUrl)}" alt="${m.name}" 
                     onerror="this.src='assets/images/default-avatar.png'">
                <div class="memorial-card-content">
                    <div class="memorial-name">${m.name}</div>
                    <div class="memorial-dates">${datesText}</div>
                    <div class="memorial-epitaph">${m.epitaph || ''}</div>
                    <div class="memorial-stats">
                        <span class="stat" title="Visitas"><i class="fa-solid fa-eye"></i> ${m.view_count || 0}</span>
                        <span class="stat" title="Velas"><i class="fa-solid fa-fire"></i> ${m.candles_count || 0}</span>
                        <span class="stat" title="Mensajes"><i class="fa-solid fa-comment"></i> ${m.messages_count || 0}</span>
                    </div>
                    <a class="ver-mas" href="/memorial.html?id=${m.id}">Ver perfil &rarr;</a>
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination(pagination) {
    if (!pagination || pagination.totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= pagination.totalPages; i++) {
        html += `<button class="${i === pagination.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationDiv.innerHTML = html;
    
    Array.from(paginationDiv.querySelectorAll('button')).forEach(btn => {
        btn.addEventListener('click', () => {
            goToPage(Number(btn.dataset.page));
        });
    });
}

function goToPage(page) {
    currentPage = page;
    fetchMemorials({ ...lastQuery, page });
}

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    lastQuery = {
        search: searchInput.value.trim(),
        year: yearInput.value.trim(),
        location: locationInput.value.trim(),
        sort: sortInput.value,
        page: 1
    };
    currentPage = 1;
    fetchMemorials(lastQuery);
});

function updateHeaderButtons() {
    // Verificar si el usuario está autenticado con Supabase
    const isLoggedIn = client && client.isAuthenticated();
    const btnLogin = document.querySelector('.btn-login');
    const btnRegister = document.querySelector('.btn-register');
    const btnDashboard = document.querySelector('.btn-dashboard');
    const btnLogout = document.querySelector('.btn-logout');
    const iconsMobile = document.querySelector('.header-icons-mobile');
    const navbarActions = document.querySelector('.navbar-actions');

    if (isLoggedIn) {
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (iconsMobile) iconsMobile.style.display = 'none';

        // Agregar botón Dashboard si no existe
        if (!btnDashboard) {
            const dashboardBtn = document.createElement('a');
            dashboardBtn.href = '/dashboard.html';
            dashboardBtn.className = 'btn btn-dashboard';
            dashboardBtn.textContent = 'Dashboard';
            navbarActions.appendChild(dashboardBtn);
        }
        // Agregar botón Logout si no existe
        if (!btnLogout) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'btn btn-logout';
            logoutBtn.textContent = 'Cerrar sesión';
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                client.logout().then(() => {
                    window.location.reload();
                });
            };
            navbarActions.appendChild(logoutBtn);
        }
    } else {
        if (btnLogin) btnLogin.style.display = '';
        if (btnRegister) btnRegister.style.display = '';
        if (iconsMobile) iconsMobile.style.display = '';
        if (btnDashboard) btnDashboard.remove();
        if (btnLogout) btnLogout.remove();
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que el cliente de Supabase esté disponible
    if (window.supabaseClient) {
        updateHeaderButtons();
        fetchMemorials();
    } else {
        console.error('❌ Cliente de Supabase no disponible');
        memorialsGrid.innerHTML = '<div class="error-memorials">Error: Cliente de Supabase no disponible.</div>';
    }
}); 