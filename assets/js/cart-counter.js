// Script para mostrar el contador del carrito en el header
class CartCounter {
    constructor() {
        this.init();
    }

    init() {
        this.updateCartCount();
        // Actualizar cada vez que cambie el localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.updateCartCount();
            }
        });
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = count;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CartCounter();
}); 