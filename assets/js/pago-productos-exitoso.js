// Página de éxito para compras de productos
class PagoProductosExitoso {
    constructor() {
        this.orderId = this.getOrderId();
        this.init();
    }

    init() {
        if (this.orderId) {
            this.loadOrderDetails();
        } else {
            this.showError('No se encontró información de la orden');
        }
        
        // Limpiar carrito después del pago exitoso
        this.clearCart();
    }

    // Obtener orderId de la URL
    getOrderId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('orderId');
    }

    // Cargar detalles de la orden
    async loadOrderDetails() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.showError('Debes iniciar sesión para ver los detalles de la orden');
                return;
            }

            const response = await fetch(`/api/orders/${this.orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const order = await response.json();
                this.displayOrderDetails(order);
            } else {
                this.showError('No se pudieron cargar los detalles de la orden');
            }
        } catch (error) {
            console.error('Error cargando orden:', error);
            this.showError('Error al cargar los detalles de la orden');
        }
    }

    // Mostrar detalles de la orden
    displayOrderDetails(order) {
        const orderDetails = document.getElementById('orderDetails');
        
        if (!order || !order.items) {
            this.showError('Información de orden incompleta');
            return;
        }

        const items = JSON.parse(order.items);
        const shippingTime = order.shipping_type === 'express' ? '2-3 días hábiles' : '5-7 días hábiles';
        
        document.getElementById('shippingTime').textContent = shippingTime;

        const itemsHTML = items.map(item => `
            <div class="order-item">
                <div>
                    <strong>${item.name}</strong>
                    <br>
                    <small>Cantidad: ${item.quantity}</small>
                </div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        const shippingHTML = `
            <div class="order-item">
                <div>
                    <strong>Envío ${order.shipping_type === 'express' ? 'Express' : 'Estándar'}</strong>
                </div>
                <div>$${order.shipping_cost.toFixed(2)}</div>
            </div>
        `;

        orderDetails.innerHTML = `
            <h3>Detalles de la Orden #${order.external_reference}</h3>
            ${itemsHTML}
            ${shippingHTML}
            <div class="order-total">
                <div class="order-item">
                    <strong>Total</strong>
                    <strong>$${order.total_amount.toFixed(2)}</strong>
                </div>
            </div>
            <div style="margin-top: 16px; font-size: 0.9rem; color: #666;">
                <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-MX')}</p>
                <p><strong>Estado:</strong> <span style="color: #2d8f2d; font-weight: 600;">Pagado</span></p>
            </div>
        `;
    }

    // Mostrar error
    showError(message) {
        const orderDetails = document.getElementById('orderDetails');
        orderDetails.innerHTML = `
            <div style="text-align: center; color: #e74c3c; padding: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Limpiar carrito después del pago exitoso
    clearCart() {
        localStorage.removeItem('cart');
        
        // Si existe el carrito global, limpiarlo también
        if (typeof window.carrito !== 'undefined') {
            window.carrito.clearCart();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PagoProductosExitoso();
}); 