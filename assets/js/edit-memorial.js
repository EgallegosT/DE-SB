// Edit Memorial JS
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

class EditMemorial {
    constructor() {
        this.memorialId = this.getMemorialId();
        this.memorialData = null;
        this.images = [];
        this.newImages = [];
        this.deletedImages = [];
        this.timeline = [];
        this.newTimelineEvents = [];
        this.deletedTimelineEvents = [];
        this.editingTimelineIndex = -1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMemorialData();
    }

    getMemorialId() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            alert('ID de memorial no encontrado');
            window.location.href = 'dashboard.html';
        }
        return id;
    }

    setupEventListeners() {
        // File upload area
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('memorialPhoto');
        const uploadText = fileUploadArea.querySelector('.file-upload-text');
        if (fileUploadArea && fileInput) {
            fileUploadArea.addEventListener('click', () => fileInput.click());
            if (uploadText) uploadText.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
            fileUploadArea.addEventListener('dragover', e => { e.preventDefault(); fileUploadArea.classList.add('dragover'); });
            fileUploadArea.addEventListener('dragleave', e => { e.preventDefault(); fileUploadArea.classList.remove('dragover'); });
            fileUploadArea.addEventListener('drop', e => {
                e.preventDefault();
                fileUploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) this.handleFileSelection(files);
            });
            fileInput.addEventListener('change', e => {
                const files = e.target.files;
                if (files.length > 0) this.handleFileSelection(files);
            });
        }
        // Form submit
        document.getElementById('editMemorialForm').addEventListener('submit', e => {
            e.preventDefault();
            this.updateMemorial();
        });
        
        // Timeline events
        document.getElementById('addTimelineBtn').addEventListener('click', () => this.addTimelineEvent());
        document.getElementById('timelineModalClose').addEventListener('click', () => this.hideTimelineModal());
        document.getElementById('timelineModalCancel').addEventListener('click', () => this.hideTimelineModal());
        document.getElementById('timelineForm').addEventListener('submit', e => {
            e.preventDefault();
            this.saveTimelineEvent(new FormData(e.target));
        });
        
        // Close modal on outside click
        document.getElementById('timelineModal').addEventListener('click', e => {
            if (e.target.id === 'timelineModal') {
                this.hideTimelineModal();
            }
        });
    }

    async loadMemorialData() {
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/memorials/my-memorial/${this.memorialId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo cargar el memorial');
            const data = await response.json();
            this.memorialData = data.memorial || data;
            this.fillForm();
            this.showCurrentImages();
            this.showCurrentTimeline();
        } catch (error) {
            showToast('No se pudo cargar el memorial', 'error');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
        } finally {
            this.hideLoading();
        }
    }

    fillForm() {
        const m = this.memorialData;
        document.getElementById('name').value = m.name || '';
        
        // Formatear fechas para inputs de tipo date (solo yyyy-MM-dd)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        };
        
        document.getElementById('birthDate').value = formatDateForInput(m.birthDate || m.birth_date);
        document.getElementById('deathDate').value = formatDateForInput(m.deathDate || m.death_date);
        
        document.getElementById('birthPlace').value = m.birthPlace || m.birth_place || '';
        document.getElementById('deathPlace').value = m.deathPlace || m.death_place || '';
        document.getElementById('biography').value = m.biography || '';
        document.getElementById('epitaph').value = m.epitaph || '';
        document.getElementById('isPublic').checked = m.isPublic === 1 || m.isPublic === true || m.is_public === 1;
        document.getElementById('allowMessages').checked = m.allowMessages === 1 || m.allowMessages === true || m.allow_messages === 1;
        document.getElementById('allowCandles').checked = m.allowCandles === 1 || m.allowCandles === true || m.allow_candles === 1;
        document.getElementById('themeColor').value = m.themeColor || m.theme_color || '#4A5568';
        this.images = (m.images && Array.isArray(m.images)) ? m.images : (m.images ? m.images : []);
        if (m.images && m.images[0] && m.images[0].url) {
            // Si viene como array de objetos
            this.images = m.images;
        }
        this.timeline = (m.timeline && Array.isArray(m.timeline)) ? m.timeline : [];
    }

    showCurrentImages() {
        const container = document.getElementById('currentImages');
        container.innerHTML = '';
        if (!this.memorialData.images || this.memorialData.images.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay imágenes subidas</p>';
            return;
        }
        this.memorialData.images.forEach((img, idx) => {
            const url = img.url || img.image_url || img;
            const isPrimary = img.isPrimary || img.is_primary;
            
            // Construir la URL correcta según el tipo de ruta
            let imageUrl = url;
            if (url.startsWith('/uploads/')) {
                // Rutas del backend que necesitan la URL base del servidor (sin /api)
                const baseUrl = API_BASE_URL.replace('/api', '');
                imageUrl = baseUrl + url;
            } else if (url.startsWith('assets/')) {
                // Rutas del frontend que son relativas al HTML
                imageUrl = url;
            } else if (url.startsWith('http')) {
                // URLs completas
                imageUrl = url;
            } else {
                // Por defecto, asumir que es una ruta del backend
                const baseUrl = API_BASE_URL.replace('/api', '');
                imageUrl = baseUrl + '/' + url.replace(/^\/+/, '');
            }
            
            const item = document.createElement('div');
            item.className = 'image-item';
            item.innerHTML = `
                <img src="${imageUrl}" alt="Imagen ${idx + 1}">
                <div class="image-actions">
                    <button type="button" class="btn btn-sm ${isPrimary ? 'btn-primary' : 'btn-outline'}" data-action="primary" data-idx="${idx}">
                        <i class="fas fa-star"></i> ${isPrimary ? 'Principal' : 'Marcar principal'}
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-idx="${idx}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            // Acciones
            item.querySelector('[data-action="primary"]').addEventListener('click', () => this.setPrimaryImage(idx));
            item.querySelector('[data-action="delete"]').addEventListener('click', () => this.deleteImage(idx));
            container.appendChild(item);
        });
    }

    showCurrentTimeline() {
        const container = document.getElementById('currentTimeline');
        container.innerHTML = '';
        
        if (!this.memorialData.timeline || this.memorialData.timeline.length === 0) {
            container.innerHTML = `
                <div class="timeline-empty">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No hay eventos en el timeline</p>
                    <small>Agrega eventos importantes de la vida de tu ser querido</small>
                </div>
            `;
            return;
        }
        
        this.memorialData.timeline.forEach((event, idx) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const date = new Date(event.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            item.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-date">${date}</div>
                    <div class="timeline-title">${event.title}</div>
                    <div class="timeline-description">${event.description || ''}</div>
                </div>
                <div class="timeline-actions">
                    <button type="button" class="btn btn-sm btn-outline" data-action="edit" data-idx="${idx}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-idx="${idx}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Acciones
            item.querySelector('[data-action="edit"]').addEventListener('click', () => this.editTimelineEvent(idx));
            item.querySelector('[data-action="delete"]').addEventListener('click', () => this.deleteTimelineEvent(idx));
            container.appendChild(item);
        });
    }

    showTimelineModal(isEditing = false, eventData = null) {
        const modal = document.getElementById('timelineModal');
        const title = document.getElementById('timelineModalTitle');
        const form = document.getElementById('timelineForm');
        
        title.textContent = isEditing ? 'Editar evento del timeline' : 'Agregar evento al timeline';
        
        if (isEditing && eventData) {
            document.getElementById('timelineTitle').value = eventData.title || '';
            
            // Formatear fecha para input de tipo date
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            };
            
            document.getElementById('timelineDate').value = formatDateForInput(eventData.date);
            document.getElementById('timelineDescription').value = eventData.description || '';
        } else {
            form.reset();
        }
        
        modal.classList.add('show');
    }

    hideTimelineModal() {
        const modal = document.getElementById('timelineModal');
        modal.classList.remove('show');
        this.editingTimelineIndex = -1;
    }

    addTimelineEvent() {
        this.editingTimelineIndex = -1;
        this.showTimelineModal(false);
    }

    editTimelineEvent(idx) {
        this.editingTimelineIndex = idx;
        const event = this.memorialData.timeline[idx];
        this.showTimelineModal(true, event);
    }

    deleteTimelineEvent(idx) {
        if (confirm('¿Estás seguro de que quieres eliminar este evento del timeline?')) {
            const event = this.memorialData.timeline[idx];
            if (event.id) {
                this.deletedTimelineEvents.push(event.id);
            }
            this.memorialData.timeline.splice(idx, 1);
            this.showCurrentTimeline();
        }
    }

    async saveTimelineEvent(formData) {
        const file = formData.get('image');
        let imageUrl = null;
        if (file && file.size > 0) {
            imageUrl = await uploadTimelineImage(file);
        }
        const eventData = {
            title: formData.get('title'),
            date: formData.get('date'),
            description: formData.get('description'),
            imageUrl // solo si hay imagen
        };
        if (this.editingTimelineIndex >= 0) {
            this.memorialData.timeline[this.editingTimelineIndex] = {
                ...this.memorialData.timeline[this.editingTimelineIndex],
                ...eventData
            };
        } else {
            this.memorialData.timeline.push(eventData);
            this.newTimelineEvents.push(eventData);
        }
        this.showCurrentTimeline();
        this.hideTimelineModal();
    }

    setPrimaryImage(idx) {
        this.memorialData.images.forEach((img, i) => {
            if (i === idx) {
                img.isPrimary = true; img.is_primary = 1;
            } else {
                img.isPrimary = false; img.is_primary = 0;
            }
        });
        this.showCurrentImages();
    }

    deleteImage(idx) {
        const img = this.memorialData.images[idx];
        if (img && img.id) this.deletedImages.push(img.id);
        this.memorialData.images.splice(idx, 1);
        this.showCurrentImages();
    }

    handleFileSelection(files) {
        const filePreview = document.getElementById('filePreview');
        filePreview.innerHTML = '';
        this.newImages = Array.from(files);
        this.newImages.forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'file-preview-item';
                previewItem.innerHTML = `<img src="${e.target.result}" alt="Nueva imagen">`;
                filePreview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    async updateMemorial() {
        try {
            this.showLoading();
            const form = document.getElementById('editMemorialForm');
            const formData = new FormData(form);
            // Booleanos
            formData.set('isPublic', document.getElementById('isPublic').checked ? '1' : '0');
            formData.set('allowMessages', document.getElementById('allowMessages').checked ? '1' : '0');
            formData.set('allowCandles', document.getElementById('allowCandles').checked ? '1' : '0');
            // Color
            formData.set('themeColor', document.getElementById('themeColor').value);
            // Imágenes nuevas
            this.newImages.forEach(file => formData.append('memorial_images', file));
            // Imágenes eliminadas
            if (this.deletedImages.length > 0) {
                this.deletedImages.forEach(id => formData.append('deleted_images', id));
            }
            // Imagen principal
            const primaryIdx = this.memorialData.images.findIndex(img => img.isPrimary || img.is_primary);
            if (primaryIdx !== -1 && this.memorialData.images[primaryIdx].id) {
                formData.set('primary_image_id', this.memorialData.images[primaryIdx].id);
            }
            
            // Timeline events
            // Enviar TODOS los eventos del timeline (nuevos y editados)
            console.log('Sending timeline events:', this.memorialData.timeline);
            this.memorialData.timeline.forEach(event => {
                formData.append('timeline_events', JSON.stringify(event));
            });
            
            // Timeline events to delete
            if (this.deletedTimelineEvents.length > 0) {
                this.deletedTimelineEvents.forEach(id => {
                    formData.append('deleted_timeline_events', id);
                });
            }
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/memorials/${this.memorialId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                showToast('Perfil memorial actualizado exitosamente', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                const error = await response.json();
                showToast(error.message || 'Error al actualizar el perfil memorial', 'error');
            }
        } catch (error) {
            showToast('Error al actualizar el perfil memorial: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

async function uploadTimelineImage(file) {
    const formData = new FormData();
    formData.append('memorial_images', file);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/memorials/upload/timeline-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    if (!response.ok) throw new Error('Error al subir la imagen');
    const data = await response.json();
    return data.imageUrl;
}

document.addEventListener('DOMContentLoaded', () => {
    new EditMemorial();
});

// Toast moderno para mensajes
function showToast(message, type = 'info') {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); toast.remove(); }, 5000);
} 