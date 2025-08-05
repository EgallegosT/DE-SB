// Memorial Form JavaScript
class MemorialForm {
    constructor() {
        this.images = [];
        this.timelineItems = [];
        this.isEditing = false;
        this.memorialId = null;
        this.uploadedImages = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkEditMode();
        this.setupImageUpload();
        this.setupTimeline();
        this.setupFormValidation();
    }
    
    setupEventListeners() {
        // Form submission
        document.getElementById('memorialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
        
        // Save draft
        document.getElementById('saveDraftBtn').addEventListener('click', () => {
            this.saveDraft();
        });
        
        // Timeline
        document.getElementById('addTimelineItem').addEventListener('click', () => {
            this.addTimelineItem();
        });
        
        // Image input
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files);
        });
        
        // Close modal
        document.getElementById('closePreviewModal').addEventListener('click', () => {
            this.hidePreviewModal();
        });
        
        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
    
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (id) {
            this.isEditing = true;
            this.memorialId = id;
            this.loadMemorialData(id);
            document.getElementById('pageTitle').textContent = 'Editar Perfil Memorial';
            document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        }
    }
    
    async loadMemorialData(id) {
        try {
            this.showLoading();
            
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/memorials/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const memorial = await response.json();
                this.populateForm(memorial);
            } else {
                this.showNotification('Error al cargar el perfil memorial', 'error');
            }
        } catch (error) {
            console.error('Error loading memorial:', error);
            this.showNotification('Error al cargar el perfil memorial', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    populateForm(memorial) {
        // Basic information
        document.getElementById('name').value = memorial.name || '';
        document.getElementById('birthDate').value = memorial.birth_date || '';
        document.getElementById('deathDate').value = memorial.death_date || '';
        document.getElementById('birthPlace').value = memorial.birth_place || '';
        document.getElementById('deathPlace').value = memorial.death_place || '';
        document.getElementById('biography').value = memorial.biography || '';
        document.getElementById('epitaph').value = memorial.epitaph || '';
        
        // Settings
        document.getElementById('themeColor').value = memorial.theme_color || '#4A5568';
        document.getElementById('backgroundMusic').value = memorial.background_music || '';
        document.getElementById('isPublic').checked = memorial.is_public !== false;
        document.getElementById('allowMessages').checked = memorial.allow_messages !== false;
        document.getElementById('allowCandles').checked = memorial.allow_candles !== false;
        
        // Images
        if (memorial.images && memorial.images.length > 0) {
            this.images = memorial.images;
            this.updateImagesGrid();
        }
        
        // Timeline
        if (memorial.timeline && memorial.timeline.length > 0) {
            this.timelineItems = memorial.timeline;
            this.updateTimeline();
        }
    }
    
    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        
        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleImageSelection(files);
        });
        
        // Click to upload
        uploadArea.addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
    }
    
    handleImageSelection(files) {
        const validFiles = Array.from(files).filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
            
            if (!isValidType) {
                this.showNotification('Solo se permiten archivos de imagen', 'error');
            }
            if (!isValidSize) {
                this.showNotification('El tamaño máximo de imagen es 5MB', 'error');
            }
            
            return isValidType && isValidSize;
        });
        
        if (validFiles.length > 0) {
            this.uploadImages(validFiles);
        }
    }
    
    async uploadImages(files) {
        console.log('🖼️ uploadImages llamado con', files.length, 'archivos');
        console.log('🔄 Versión corregida - procesando imágenes localmente');
        
        for (const file of files) {
            try {
                console.log('📁 Procesando archivo:', file.name);
                
                // Crear URL temporal para la imagen
                const imageUrl = URL.createObjectURL(file);
                
                // Agregar la imagen a la lista local
                this.images.push({
                    file: file, // Guardar el archivo para enviarlo después
                    image_url: imageUrl,
                    caption: '',
                    is_primary: this.images.length === 0
                });
                
                this.updateImagesGrid();
                this.showNotification('Imagen agregada exitosamente', 'success');
                console.log('✅ Imagen procesada exitosamente:', file.name);
            } catch (error) {
                console.error('❌ Error processing image:', error);
                this.showNotification('Error al procesar la imagen', 'error');
            }
        }
    }
    
    updateImagesGrid() {
        const grid = document.getElementById('imagesGrid');
        grid.innerHTML = '';
        
        if (this.images.length === 0) {
            grid.innerHTML = '<p class="text-center text-muted">No hay imágenes subidas</p>';
            return;
        }
        
        this.images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'image-item fade-in';
            
            item.innerHTML = `
                <img src="${image.image_url}" alt="Imagen ${index + 1}">
                ${image.is_primary ? '<span class="primary-badge">Principal</span>' : ''}
                <div class="image-overlay">
                    <div class="image-actions">
                        <button class="image-action-btn" onclick="memorialForm.setPrimaryImage(${index})" title="Establecer como principal">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="image-action-btn" onclick="memorialForm.editImageCaption(${index})" title="Editar descripción">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="image-action-btn" onclick="memorialForm.removeImage(${index})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(item);
        });
    }
    
    setPrimaryImage(index) {
        this.images.forEach((image, i) => {
            image.is_primary = i === index;
        });
        this.updateImagesGrid();
        this.showNotification('Imagen principal actualizada', 'success');
    }
    
    editImageCaption(index) {
        const image = this.images[index];
        const caption = prompt('Descripción de la imagen:', image.caption || '');
        
        if (caption !== null) {
            image.caption = caption;
            this.showNotification('Descripción actualizada', 'success');
        }
    }
    
    removeImage(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            this.images.splice(index, 1);
            
            // If we removed the primary image, make the first one primary
            if (this.images.length > 0 && !this.images.some(img => img.is_primary)) {
                this.images[0].is_primary = true;
            }
            
            this.updateImagesGrid();
            this.showNotification('Imagen eliminada', 'success');
        }
    }
    
    setupTimeline() {
        // Timeline items will be managed dynamically
    }
    
    addTimelineItem() {
        const container = document.getElementById('timelineContainer');
        const template = document.getElementById('timelineTemplate');
        const newItem = template.cloneNode(true);
        
        newItem.id = '';
        newItem.style.display = 'block';
        
        // Add remove button functionality
        newItem.querySelector('.remove-timeline-item').addEventListener('click', () => {
            newItem.remove();
        });
        
        container.appendChild(newItem);
        this.showNotification('Evento agregado al timeline', 'success');
    }
    
    updateTimeline() {
        const container = document.getElementById('timelineContainer');
        container.innerHTML = '';
        
        this.timelineItems.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Año</label>
                            <input type="number" class="form-control timeline-year" value="${item.year}" placeholder="2020">
                        </div>
                        <div class="form-group">
                            <label>Evento</label>
                            <input type="text" class="form-control timeline-event" value="${item.event}" placeholder="Descripción del evento">
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-danger btn-sm remove-timeline-item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            timelineItem.querySelector('.remove-timeline-item').addEventListener('click', () => {
                timelineItem.remove();
            });
            
            container.appendChild(timelineItem);
        });
    }
    
    getTimelineData() {
        const items = [];
        document.querySelectorAll('.timeline-item').forEach(item => {
            const year = item.querySelector('.timeline-year').value;
            const event = item.querySelector('.timeline-event').value;
            
            if (year && event) {
                items.push({ year: parseInt(year), event });
            }
        });
        return items;
    }
    
    setupFormValidation() {
        const form = document.getElementById('memorialForm');
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Remove existing error
        this.clearFieldError(field);
        
        // Validation rules
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo es obligatorio');
            return false;
        }
        
        if (fieldName === 'name' && value.length < 2) {
            this.showFieldError(field, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (fieldName === 'biography' && value.length > 2000) {
            this.showFieldError(field, 'La biografía no puede exceder 2000 caracteres');
            return false;
        }
        
        if (fieldName === 'epitaph' && value.length > 500) {
            this.showFieldError(field, 'El epitafio no puede exceder 500 caracteres');
            return false;
        }
        
        // Date validation
        if (fieldName === 'birthDate' && fieldName === 'deathDate') {
            const birthDate = document.getElementById('birthDate').value;
            const deathDate = document.getElementById('deathDate').value;
            
            if (birthDate && deathDate && new Date(birthDate) >= new Date(deathDate)) {
                this.showFieldError(field, 'La fecha de fallecimiento debe ser posterior a la fecha de nacimiento');
                return false;
            }
        }
        
        return true;
    }
    
    showFieldError(field, message) {
        field.classList.add('error');
        field.parentElement.classList.add('has-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        field.parentElement.classList.remove('has-error');
        
        const errorMessage = field.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    validateForm() {
        const form = document.getElementById('memorialForm');
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Additional validations
        if (this.images.length === 0) {
            this.showNotification('Debes subir al menos una imagen', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    async submitForm() {
        if (!this.validateForm()) {
            return;
        }
        
        try {
            this.showLoading();
            
            const formData = this.getFormData();
            const token = localStorage.getItem('token');
            
            console.log('📋 FormData obtenido:', formData);
            
            // Verificar si es un plan con costo
            const planType = document.querySelector('input[name="plan_type"]:checked')?.value;
            const hasQrPlate = document.getElementById('hasQrPlate')?.checked;
            
            console.log('🔍 Plan seleccionado:', planType);
            console.log('🔍 Placa QR seleccionada:', hasQrPlate);
            
            // Calcular costo total
            let totalCost = 0;
            if (planType === '3y') totalCost = 999;
            else if (planType === '10y') totalCost = 2999;
            if (hasQrPlate) totalCost += 2999;
            
            console.log('💰 Costo total calculado:', totalCost);
            
            // Si es plan gratuito, crear directamente
            if (totalCost === 0) {
                console.log('🆓 Plan gratuito detectado, creando memorial directamente');
                await this.createMemorialDirectly(formData, token);
                return;
            }
            
            // Si tiene costo, crear preferencia de pago
            console.log('💳 Plan con costo detectado, iniciando proceso de pago');
            await this.createMemorialWithPayment(formData, token, planType, hasQrPlate, totalCost);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Error al procesar la solicitud', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async createMemorialDirectly(formData, token) {
        try {
            // Crear FormData para enviar datos + archivos
            const submitData = new FormData();
            
            // Agregar datos del formulario
            Object.keys(formData).forEach(key => {
                if (key !== 'images' && key !== 'timeline') {
                    submitData.append(key, formData[key]);
                }
            });
            
            // Agregar imágenes si existen
            if (this.images.length > 0) {
                this.images.forEach((image, index) => {
                    if (image.file) {
                        submitData.append('memorial_images', image.file);
                    }
                });
            }
            
            const response = await fetch('/api/memorials', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No incluir Content-Type para FormData con archivos
                },
                body: submitData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showNotification('Perfil memorial creado exitosamente', 'success');
                
                setTimeout(() => {
                    window.location.href = `/memorial.html?id=${result.memorial.id}`;
                }, 1500);
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Error al crear el perfil', 'error');
            }
        } catch (error) {
            console.error('Error creating memorial:', error);
            this.showNotification('Error al crear el perfil memorial', 'error');
        }
    }
    
    async createMemorialWithPayment(formData, token, planType, hasQrPlate, totalCost) {
        try {
            console.log('🔍 Iniciando creación de memorial con pago...');
            console.log('📊 Datos del plan:', { planType, hasQrPlate, totalCost });
            
            // PRUEBA TEMPORAL - Probar autenticación primero
            console.log('🧪 Probando autenticación...');
            const testResponse = await fetch('/api/memorials/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ test: 'data' })
            });
            
            console.log('📡 Respuesta de prueba:', testResponse.status);
            if (testResponse.ok) {
                const testResult = await testResponse.json();
                console.log('✅ Prueba exitosa:', testResult);
            } else {
                const testError = await testResponse.json();
                console.error('❌ Error en prueba:', testError);
                throw new Error('Error de autenticación: ' + testError.message);
            }
            
            // Crear FormData para enviar datos + archivos
            const submitData = new FormData();
            
            // Agregar datos del formulario
            Object.keys(formData).forEach(key => {
                if (key !== 'images' && key !== 'timeline') {
                    submitData.append(key, formData[key]);
                }
            });
            
            // Agregar datos específicos del plan
            submitData.append('plan_type', planType);
            submitData.append('has_qr_plate', hasQrPlate);
            submitData.append('price_paid', totalCost);
            submitData.append('status', 'pending_payment');
            
            // Agregar imágenes si existen
            if (this.images.length > 0) {
                this.images.forEach((image, index) => {
                    if (image.file) {
                        submitData.append('memorial_images', image.file);
                    }
                });
            }
            
            console.log('📝 Datos del memorial a crear:', {
                plan_type: planType,
                has_qr_plate: hasQrPlate,
                price_paid: totalCost,
                status: 'pending_payment',
                images_count: this.images.length
            });
            
            const response = await fetch('/api/memorials', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No incluir Content-Type para FormData con archivos
                },
                body: submitData
            });
            
            console.log('📡 Respuesta del servidor (memorial):', response.status);
            
            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Error creando memorial:', error);
                throw new Error(error.message || 'Error al crear el memorial');
            }
            
            const result = await response.json();
            const memorialId = result.memorial.id;
            console.log('✅ Memorial creado con ID:', memorialId);
            
            // Crear preferencia de pago
            const paymentData = {
                title: `Memorial de ${formData.name}`,
                description: formData.biography || 'Perfil memorial personalizado',
                price: totalCost,
                hasQrPlate: hasQrPlate,
                qrPlatePrice: hasQrPlate ? 2999 : 0,
                payerEmail: this.getUserEmail(),
                memorialId: memorialId,
                planType: planType
            };
            
            console.log('💳 Datos de pago a enviar:', paymentData);
            console.log('🔗 Llamando a:', '/api/payments/create-memorial-preference');
            
            const paymentResponse = await fetch('/api/payments/create-memorial-preference', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            console.log('📡 Respuesta del servidor (pago):', paymentResponse.status);
            
            if (paymentResponse.ok) {
                const paymentResult = await paymentResponse.json();
                console.log('✅ Preferencia de pago creada:', paymentResult);
                
                // Redirigir a MercadoPago
                console.log('🔄 Redirigiendo a MercadoPago:', paymentResult.init_point);
                window.location.href = paymentResult.init_point;
            } else {
                const error = await paymentResponse.json();
                console.error('❌ Error en preferencia de pago:', error);
                throw new Error(error.message || 'Error al procesar el pago');
            }
            
        } catch (error) {
            console.error('❌ Error creating memorial with payment:', error);
            this.showNotification(error.message || 'Error al procesar el pago', 'error');
        }
    }
    
    getUserEmail() {
        // Obtener email del usuario desde localStorage o del contexto
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.email;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        return '';
    }
    
    getFormData() {
        const form = document.getElementById('memorialForm');
        const formData = new FormData(form);
        
        // Obtener el plan seleccionado
        const planType = document.querySelector('input[name="plan_type"]:checked')?.value || '6m';
        const hasQrPlate = document.getElementById('hasQrPlate')?.checked || false;
        
        return {
            name: formData.get('name'),
            birth_date: formData.get('birthDate') || null,
            death_date: formData.get('deathDate') || null,
            birth_place: formData.get('birthPlace') || null,
            death_place: formData.get('deathPlace') || null,
            biography: formData.get('biography') || null,
            epitaph: formData.get('epitaph') || null,
            theme_color: formData.get('themeColor'),
            background_music: formData.get('backgroundMusic') || null,
            is_public: formData.get('isPublic') === 'on',
            allow_messages: formData.get('allowMessages') === 'on',
            allow_candles: formData.get('allowCandles') === 'on',
            plan_type: planType,
            has_qr_plate: hasQrPlate,
            images: this.images,
            timeline: this.getTimelineData()
        };
    }
    
    async saveDraft() {
        try {
            this.showLoading();
            
            const formData = this.getFormData();
            formData.is_draft = true;
            
            const token = localStorage.getItem('token');
            const response = await fetch('/api/memorials/draft', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                this.showNotification('Borrador guardado exitosamente', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Error al guardar el borrador', 'error');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showNotification('Error al guardar el borrador', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    showPreviewModal() {
        const modal = document.getElementById('previewModal');
        const content = document.getElementById('previewContent');
        
        // Generate preview content
        const formData = this.getFormData();
        content.innerHTML = this.generatePreviewHTML(formData);
        
        modal.classList.add('active');
    }
    
    hidePreviewModal() {
        document.getElementById('previewModal').classList.remove('active');
    }
    
    generatePreviewHTML(data) {
        const primaryImage = this.images.find(img => img.is_primary) || this.images[0];
        
        return `
            <div class="memorial-preview">
                <div class="preview-header" style="background-color: ${data.theme_color}">
                    <h1>${data.name}</h1>
                    ${data.epitaph ? `<p class="epitaph">${data.epitaph}</p>` : ''}
                </div>
                
                ${primaryImage ? `
                    <div class="preview-image">
                        <img src="${primaryImage.image_url}" alt="${data.name}">
                    </div>
                ` : ''}
                
                <div class="preview-content">
                    ${data.biography ? `
                        <section class="biography">
                            <h2>Biografía</h2>
                            <p>${data.biography}</p>
                        </section>
                    ` : ''}
                    
                    ${data.timeline && data.timeline.length > 0 ? `
                        <section class="timeline">
                            <h2>Timeline de Vida</h2>
                            <div class="timeline-list">
                                ${data.timeline.map(item => `
                                    <div class="timeline-item">
                                        <span class="year">${item.year}</span>
                                        <span class="event">${item.event}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}
                </div>
            </div>
        `;
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
}

// Initialize memorial form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.memorialForm = new MemorialForm();
}); 