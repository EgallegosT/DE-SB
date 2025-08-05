// Corrección para errores de JavaScript en memorial-view.js
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Lightbox de manera segura
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'albumLabel': 'Imagen %1 de %2'
        });
    }
    
    // Verificar que todos los elementos necesarios existen
    const requiredElements = [
        'shareBtn',
        'lightCandleBtn', 
        'lightNewCandleBtn',
        'addMessageBtn',
        'closeMessageModal',
        'closeCandleModal',
        'closeShareModal',
        'messageForm',
        'candleForm',
        'musicToggle'
    ];
    
    console.log('Verificando elementos requeridos...');
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Elemento no encontrado: ${elementId}`);
        }
    });
}); 