var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editEventForm');
    const loading = document.getElementById('editEventLoading');
    const errorBox = document.getElementById('editEventError');
    const errorMsg = document.getElementById('editEventErrorMsg');
    const successBox = document.getElementById('editEventSuccess');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const virtualLinkGroup = document.getElementById('virtualLinkGroup');
    
    // Utilidad para obtener el id de la URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    const eventId = getQueryParam('id');
    if (!eventId) {
        showError('ID de evento no especificado');
        return;
    }

    // Mostrar/ocultar loading, error, éxito
    function showLoading() {
        loading.style.display = 'block';
        errorBox.style.display = 'none';
        successBox.style.display = 'none';
    }
    function hideLoading() {
        loading.style.display = 'none';
    }
    function showError(msg) {
        errorMsg.textContent = msg;
        errorBox.style.display = 'block';
        loading.style.display = 'none';
        successBox.style.display = 'none';
    }
    function showSuccess() {
        successBox.style.display = 'block';
        errorBox.style.display = 'none';
        loading.style.display = 'none';
    }

    // Mostrar/ocultar campo virtualLink
    function toggleVirtualLink(isVirtual) {
        virtualLinkGroup.style.display = isVirtual ? 'block' : 'none';
    }
    document.getElementById('isVirtual').addEventListener('change', (e) => {
        toggleVirtualLink(e.target.value === '1');
    });

    // Cargar datos del evento
    async function loadEvent() {
        showLoading();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('No se encontró el evento');
            const data = await res.json();
            const event = data.event;
            // Poblar campos
            form.title.value = event.title || '';
            form.description.value = event.description || '';
            // Formato para input datetime-local: yyyy-MM-ddTHH:mm
            if (event.eventDate) {
                const dt = new Date(event.eventDate);
                form.eventDate.value = dt.toISOString().slice(0,16);
            } else {
                form.eventDate.value = '';
            }
            form.location.value = event.location || '';
            form.address.value = event.address || '';
            form.latitude.value = event.latitude || '';
            form.longitude.value = event.longitude || '';
            form.itinerary.value = event.itinerary || '';
            form.isPublic.value = event.isPublic ? '1' : '0';
            form.isVirtual.value = event.isVirtual ? '1' : '0';
            form.virtualLink.value = event.virtualLink || '';
            form.maxGuests.value = event.maxGuests || '';
            toggleVirtualLink(event.isVirtual);
        } catch (err) {
            showError(err.message);
        } finally {
            hideLoading();
        }
    }

    // Guardar cambios
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        try {
            const token = localStorage.getItem('token');
            const data = {
                title: form.title.value.trim(),
                description: form.description.value.trim(),
                eventDate: form.eventDate.value ? form.eventDate.value.replace('T', ' ') + ':00' : null,
                location: form.location.value.trim(),
                address: form.address.value.trim(),
                latitude: form.latitude.value || null,
                longitude: form.longitude.value || null,
                itinerary: form.itinerary.value.trim(),
                isPublic: form.isPublic.value === '1',
                isVirtual: form.isVirtual.value === '1',
                virtualLink: form.isVirtual.value === '1' ? form.virtualLink.value.trim() : null,
                maxGuests: form.maxGuests.value ? parseInt(form.maxGuests.value) : null
            };
            const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Error al actualizar el evento');
            }
            showSuccess();
            setTimeout(() => window.location.href = 'dashboard.html', 1200);
        } catch (err) {
            showError(err.message);
        } finally {
            hideLoading();
        }
    });

    // Cancelar edición
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // Inicializar
    loadEvent();
});
