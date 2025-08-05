// pago-exitoso.js
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const memorialId = urlParams.get('memorialId');
    const type = urlParams.get('type');

    // Si es un pago de memorial, cargar información
    if (type === 'memorial' && memorialId) {
        loadMemorialInfo(memorialId);
    }

    // Configurar botón para ver memorial
    const viewMemorialBtn = document.getElementById('viewMemorialBtn');
    if (viewMemorialBtn && memorialId) {
        viewMemorialBtn.href = `/memorial.html?id=${memorialId}`;
    }
});

async function loadMemorialInfo(memorialId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/memorials/${memorialId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const memorial = await response.json();
            displayMemorialInfo(memorial);
        } else {
            console.error('Error cargando información del memorial');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMemorialInfo(memorial) {
    const memorialInfo = document.getElementById('memorialInfo');
    const memorialName = document.getElementById('memorialName');
    const memorialPlan = document.getElementById('memorialPlan');
    const memorialQr = document.getElementById('memorialQr');

    if (memorialInfo && memorialName && memorialPlan && memorialQr) {
        memorialName.textContent = memorial.name || 'N/A';
        
        // Mostrar plan
        const planNames = {
            '6m': '6 meses (Gratis)',
            '3y': '3 años',
            '10y': '10 años'
        };
        memorialPlan.textContent = planNames[memorial.plan_type] || 'N/A';
        
        // Mostrar si tiene placa QR
        memorialQr.textContent = memorial.has_qr_plate ? 'Sí' : 'No';
        
        memorialInfo.style.display = 'block';
    }
}

// Función para mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
} 