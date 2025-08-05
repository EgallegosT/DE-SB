// Store JavaScript
class Store {
    constructor() {
        this.products = [];
        this.cart = [];
        this.filteredProducts = [];
        this.searchTerm = '';
        this.categoryFilter = '';
        this.sortFilter = 'name';
        this.mp = null;
        
        // Inicialización asíncrona
        this.init().catch(error => {
            console.error('Error al inicializar la tienda:', error);
        });
    }
    
    async init() {
        this.setupEventListeners();
        this.loadProducts();
        await this.initializeMercadoPago();
        
        // Cargar el carrito después de que el DOM esté listo
        setTimeout(() => {
            this.loadCart();
        }, 100);
    }
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterProducts();
            });
        }
        
        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.categoryFilter = e.target.value;
                this.filterProducts();
            });
        }
        
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortFilter = e.target.value;
                this.filterProducts();
            });
        }
        
        // Cart
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.toggleCart();
            });
        }
        
        const closeCartBtn = document.getElementById('closeCartBtn');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                this.hideCart();
            });
        }
        
        // Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.showCheckoutModal();
            });
        }
        
        const closeCheckoutModal = document.getElementById('closeCheckoutModal');
        if (closeCheckoutModal) {
            closeCheckoutModal.addEventListener('click', () => {
                this.hideCheckoutModal();
            });
        }
        
        const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
        if (cancelCheckoutBtn) {
            cancelCheckoutBtn.addEventListener('click', () => {
                this.hideCheckoutModal();
            });
        }
        
        const processPaymentBtn = document.getElementById('processPaymentBtn');
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => {
                this.processPayment();
            });
        }
        
        // Product modal
        const closeProductModal = document.getElementById('closeProductModal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => {
                this.hideProductModal();
            });
        }
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
    
    async loadProducts() {
        try {
            this.showProductsLoading();
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                const data = await response.json();
                this.products = data.products || [];
                this.filteredProducts = [...this.products];
                this.renderProducts();
            } else {
                this.showNotification('Error al cargar los productos', 'error');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Error al cargar los productos', 'error');
        } finally {
            this.hideProductsLoading();
        }
    }
    
    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !this.searchTerm || 
                product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesCategory = !this.categoryFilter || 
                product.category.toLowerCase() === this.categoryFilter.toLowerCase();
            
            return matchesSearch && matchesCategory;
        });
        
        this.sortProducts();
        this.renderProducts();
    }
    
    sortProducts() {
        switch (this.sortFilter) {
            case 'price_low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                this.filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                break;
            default:
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
    }
    
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const count = document.getElementById('productsCount');
        const empty = document.getElementById('productsEmpty');
        
        count.textContent = `Mostrando ${this.filteredProducts.length} productos`;
        
        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }
        
        empty.style.display = 'none';
        grid.innerHTML = '';
        
        this.filteredProducts.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const imageUrl = product.imageUrl ? `http://localhost:3000${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}` : 'assets/images/default-product.jpg';
        
        card.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${product.name}" class="product-image">
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar al Carrito
                    </button>
                    <button class="btn btn-outline view-details-btn" onclick="store.showProductModal(${product.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    showProductModal(product) {
        const modal = document.getElementById('productModal');
        const name = document.getElementById('modalProductName');
        const detail = document.getElementById('productDetail');
        
        name.textContent = product.name;
        
        const cartItem = this.cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        const modalImageUrl = product.imageUrl ? `http://localhost:3000${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}` : 'assets/images/default-product.jpg';
        
        detail.innerHTML = `
            <div>
                <img src="${modalImageUrl}" 
                     alt="${product.name}" class="product-detail-image">
            </div>
            <div class="product-detail-content">
                <div class="product-category">${product.category}</div>
                <h3>${product.name}</h3>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-detail-actions">
                    ${quantity > 0 ? `
                        <button class="btn-quantity" onclick="store.updateQuantity(${product.id}, ${quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <div class="quantity-display">${quantity}</div>
                        <button class="btn-quantity" onclick="store.updateQuantity(${product.id}, ${quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="store.addToCart(${product.id})">
                            <i class="fas fa-plus"></i>
                            Agregar al Carrito
                        </button>
                    `}
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    // Función para agregar productos al carrito global
    addToCart(product) {
        // Usar el carrito global si existe, sino usar el local
        if (typeof window.carrito !== 'undefined') {
            window.carrito.addToCart(product);
        } else {
            // Fallback al carrito local
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    ...product,
                    quantity: 1
                });
            }
            
            this.saveCart();
            this.updateCartDisplay();
            this.updateCartTotals();
        }
        
        // Mostrar notificación
        this.showNotification('Producto agregado al carrito', 'success');
        
        // Actualizar contador del carrito en el header
        this.updateCartCount();
    }
    
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
        } else {
            const item = this.cart.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.renderProducts();
            }
        }
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.renderProducts();
    }
    
    saveCart() {
        localStorage.setItem('storeCart', JSON.stringify(this.cart));
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('storeCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
        }
    }
    
    updateCartDisplay() {
        const count = document.getElementById('cartCount');
        const items = document.getElementById('cartItems');
        const empty = document.getElementById('cartEmpty');
        const summary = document.getElementById('cartSummary');
        
        // Verificar que los elementos existen antes de usarlos
        if (!count || !items || !empty || !summary) {
            console.warn('Elementos del carrito no encontrados en el DOM');
            return;
        }
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        count.textContent = totalItems;
        
        if (this.cart.length === 0) {
            items.innerHTML = '';
            empty.style.display = 'flex';
            summary.style.display = 'none';
        } else {
            empty.style.display = 'none';
            summary.style.display = 'block';
            
            items.innerHTML = '';
            this.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                
                const cartImageUrl = item.imageUrl ? `http://localhost:3000${item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`}` : 'assets/images/default-product.jpg';
                
                cartItem.innerHTML = `
                    <img src="${cartImageUrl}" 
                         alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-content">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="btn-quantity" onclick="store.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="btn-quantity" onclick="store.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="store.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                items.appendChild(cartItem);
            });
            
            this.updateCartTotals();
        }
    }
    
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const shipping = subtotal > 0 ? 5.00 : 0; // Fixed shipping cost
        const total = subtotal + shipping;
        
        const subtotalEl = document.getElementById('cartSubtotal');
        const shippingEl = document.getElementById('cartShipping');
        const totalEl = document.getElementById('cartTotal');
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }
    
    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        sidebar.classList.toggle('active');
    }
    
    hideCart() {
        document.getElementById('cartSidebar').classList.remove('active');
    }
    
    showCheckoutModal() {
        if (this.cart.length === 0) {
            this.showNotification('Tu carrito está vacío', 'warning');
            return;
        }
        
        this.updateCheckoutSummary();
        document.getElementById('checkoutModal').classList.add('active');
    }
    
    hideCheckoutModal() {
        document.getElementById('checkoutModal').classList.remove('active');
    }
    
    updateCheckoutSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const subtotal = this.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const shipping = 5.00;
        const total = subtotal + shipping;
        
        summaryItems.innerHTML = '';
        this.cart.forEach(item => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            `;
            summaryItems.appendChild(summaryItem);
        });
        
        document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryShipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
    }
    
    async initializeMercadoPago() {
        try {
            console.log('Iniciando configuración de MercadoPago...');
            
            // Obtener la clave pública del backend
            const response = await fetch('http://localhost:3000/api/payments/public-key');
            console.log('Respuesta del backend:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                const publicKey = data.publicKey;
                
                if (publicKey && publicKey !== 'TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
                    this.mp = new MercadoPago(publicKey, { locale: 'es-AR' });
                    console.log('MercadoPago inicializado correctamente con credenciales de producción');
                } else {
                    console.log('MercadoPago no configurado - modo desarrollo');
                    this.mp = null;
                }
            } else {
                console.warn('No se pudo obtener la clave pública de MercadoPago');
                this.mp = null;
            }
        } catch (error) {
            console.warn('Error al inicializar MercadoPago:', error);
            this.mp = null;
        }
    }
    
    async processPayment() {
        const form = document.getElementById('checkoutModal').querySelector('form');
        if (!form) {
            // Create form data from inputs
            const formData = {
                shippingName: document.getElementById('shippingName').value,
                shippingEmail: document.getElementById('shippingEmail').value,
                shippingAddress: document.getElementById('shippingAddress').value,
                shippingCity: document.getElementById('shippingCity').value,
                shippingState: document.getElementById('shippingState').value,
                shippingZip: document.getElementById('shippingZip').value,
                shippingPhone: document.getElementById('shippingPhone').value
            };
            
            // Validate form
            if (!this.validateCheckoutForm(formData)) {
                return;
            }
            
            try {
                this.showLoading();
                
                const response = await fetch(`${API_BASE_URL}/payments/create-preference`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: this.cart.map(item => ({
                            id: item.id,
                            title: item.name,
                            quantity: item.quantity,
                            unit_price: parseFloat(item.price)
                        })),
                        shipping: {
                            name: formData.shippingName,
                            email: formData.shippingEmail,
                            address: formData.shippingAddress,
                            city: formData.shippingCity,
                            state: formData.shippingState,
                            zip: formData.shippingZip,
                            phone: formData.shippingPhone
                        }
                    })
                });
                
                if (response.ok) {
                    const preference = await response.json();
                    
                    // Redirect to MercadoPago
                    window.location.href = preference.init_point;
                } else {
                    const error = await response.json();
                    this.showNotification(error.message || 'Error al procesar el pago', 'error');
                }
            } catch (error) {
                console.error('Error processing payment:', error);
                this.showNotification('Error al procesar el pago', 'error');
            } finally {
                this.hideLoading();
            }
        }
    }
    
    validateCheckoutForm(formData) {
        const requiredFields = ['shippingName', 'shippingEmail', 'shippingAddress', 'shippingCity', 'shippingState', 'shippingZip', 'shippingPhone'];
        
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                this.showNotification(`El campo ${field.replace('shipping', '')} es obligatorio`, 'error');
                return false;
            }
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.shippingEmail)) {
            this.showNotification('Email inválido', 'error');
            return false;
        }
        
        return true;
    }
    
    showProductsLoading() {
        document.getElementById('productsLoading').style.display = 'block';
        document.getElementById('productsGrid').style.display = 'none';
    }
    
    hideProductsLoading() {
        document.getElementById('productsLoading').style.display = 'none';
        document.getElementById('productsGrid').style.display = 'grid';
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

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            let count = 0;
            if (typeof window.carrito !== 'undefined') {
                count = window.carrito.getItemCount();
            } else {
                count = this.cart.reduce((total, item) => total + item.quantity, 0);
            }
            cartCount.textContent = count;
        }
    }
}

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que estamos en la página correcta
    if (document.getElementById('productsGrid')) {
        window.store = new Store();
    }
}); 

// Función global para agregar productos al carrito
function addToCart(product) {
    if (typeof window.carrito !== 'undefined') {
        window.carrito.addToCart(product);
    } else if (typeof window.store !== 'undefined') {
        window.store.addToCart(product);
    } else {
        // Fallback básico
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Producto agregado al carrito');
    }
} 