// Carrito de Compras JavaScript
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

class Carrito {
    constructor() {
        this.cart = this.loadCart();
        this.shippingCosts = {
            standard: 150,
            express: 300
        };
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
        this.updateTotals();
        this.updateCartCountInHeader();
    }

    // Cargar carrito desde localStorage
    loadCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Actualizar contador del carrito en el header
    updateCartCountInHeader() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
        }
    }

    // Agregar producto al carrito
    addToCart(product) {
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
        this.renderCart();
        this.updateTotals();
        this.updateCartCountInHeader();
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCart();
            this.updateTotals();
        }
    }

    // Remover producto del carrito
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
        this.updateTotals();
    }

    // Limpiar carrito
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.renderCart();
        this.updateTotals();
    }

    // Renderizar carrito
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        if (!cartItems || !emptyCart) {
            console.warn('No se encontró cartItems o emptyCart en el DOM');
            return;
        }
        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            emptyCart.style.display = 'block';
            return;
        }
        emptyCart.style.display = 'none';
        
            const itemsHTML = this.cart.map(item => {
                // Manejar la URL de la imagen correctamente
                let imageUrl = 'assets/images/default-product.jpg';
                if (item.imageUrl) {
                    // Si ya es una URL completa, usarla tal como está
                    if (item.imageUrl.startsWith('http')) {
                        imageUrl = item.imageUrl;
                    } else {
                        // Si es una ruta relativa, construir la URL completa
                        // Asegurar que la ruta comience con /
                        const cleanPath = item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`;
                        imageUrl = `http://localhost:3000${cleanPath}`;
                    }
                }
                
                return `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${imageUrl}" 
                        alt="${item.name}" 
                        class="cart-item-image"
                        onerror="this.src='assets/images/default-product.jpg'">
                
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description || 'Sin descripción'}</p>
                </div>
                
                <div class="cart-item-price">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="carrito.updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" 
                           class="quantity-input" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="carrito.updateQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="carrito.updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="cart-item-actions">
                    <button class="remove-item" onclick="carrito.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
            }).join('');

        cartItems.innerHTML = itemsHTML;
    }

    // Actualizar totales
    updateTotals() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Solo actualizar elementos si existen en el DOM
        const shippingTypeElement = document.querySelector('input[name="shipping"]:checked');
        if (shippingTypeElement) {
            const shippingType = shippingTypeElement.value;
            const shippingCost = this.shippingCosts[shippingType];
            const total = subtotal + shippingCost;

            const subtotalElement = document.getElementById('subtotal');
            const shippingElement = document.getElementById('shipping');
            const totalElement = document.getElementById('total');
            const checkoutBtn = document.getElementById('checkoutBtn');

            if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            if (shippingElement) shippingElement.textContent = `$${shippingCost.toFixed(2)}`;
            if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
            if (checkoutBtn) checkoutBtn.disabled = this.cart.length === 0;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Cambio en opciones de envío
        const shippingRadios = document.querySelectorAll('input[name="shipping"]');
        if (shippingRadios.length > 0) {
            shippingRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.updateTotals();
                });
            });
        }

        // Botón de checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }
    }

    // Proceder al checkout
    async proceedToCheckout() {
        if (this.cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        try {
            this.showLoading();

            const shippingType = document.querySelector('input[name="shipping"]:checked').value;
            const shippingCost = this.shippingCosts[shippingType];

            // Preparar datos para el backend
            const checkoutData = {
                items: this.cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                shipping: {
                    type: shippingType,
                    cost: shippingCost
                },
                total: this.cart.reduce((total, item) => total + (item.price * item.quantity), 0) + shippingCost
            };

            // Verificar si el usuario está autenticado
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debes iniciar sesión para continuar');
                window.location.href = '/login.html';
                return;
            }

            // Crear preferencia de pago
            const response = await fetch(`${API_BASE_URL}/payments/create-product-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(checkoutData)
            });

            if (response.ok) {
                const data = await response.json();
                // Redirigir a MercadoPago
                window.location.href = data.init_point;
            } else {
                const error = await response.json();
                alert(error.message || 'Error al procesar el pago');
            }

        } catch (error) {
            console.error('Error en checkout:', error);
            alert('Error al conectar con el sistema de pago');
        } finally {
            this.hideLoading();
        }
    }

    // Mostrar loading
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    // Ocultar loading
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    // Obtener número de items en el carrito
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Obtener total del carrito
    getTotal() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingType = document.querySelector('input[name="shipping"]:checked')?.value || 'standard';
        const shippingCost = this.shippingCosts[shippingType];
        return subtotal + shippingCost;
    }
}

// Inicializar carrito cuando el DOM esté listo
let carrito;
document.addEventListener('DOMContentLoaded', () => {
    carrito = new Carrito();
});

// Función global para agregar productos al carrito (desde otras páginas)
function addToCart(product) {
    // Corregir la ruta de la imagen si es necesario
    if (product.imageUrl && !product.imageUrl.startsWith('/uploads/')) {
        // Si solo es el nombre o falta el prefijo, lo agregamos
        if (!product.imageUrl.startsWith('http') && !product.imageUrl.startsWith('assets/')) {
            product.imageUrl = '/uploads/products/' + product.imageUrl.replace(/^products\//, '');
        }
    }
    if (carrito) {
        carrito.addToCart(product);
        // Mostrar notificación
        showNotification('Producto agregado al carrito', 'success');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Estilos para notificaciones
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 1rem;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.notification-success {
    border-left: 4px solid #2d8f2d;
}

.notification-success i {
    color: #2d8f2d;
}

.notification-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
}
`;

// Agregar estilos de notificación al head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 