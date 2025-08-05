function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadEvent() {
    const eventId = getQueryParam('id');
    if (!eventId) {
        document.getElementById('eventTitle').textContent = 'ID de evento no especificado';
        document.getElementById('eventDescription').textContent = '';
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/api/events/${eventId}`);
        if (!res.ok) throw new Error('No se encontró el evento');
        const data = await res.json();
        const event = data.event;

        document.getElementById('eventTitle').textContent = event.title;
        document.getElementById('eventDate').innerHTML = `<i class='fas fa-calendar'></i> ${new Date(event.eventDate).toLocaleString()}`;
        document.getElementById('eventLocation').innerHTML = `<i class='fas fa-map-marker-alt'></i> ${event.location || 'No especificado'}`;
        document.getElementById('eventType').innerHTML = `<i class='fas fa-globe'></i> ${event.isVirtual ? 'Virtual' : 'Presencial'}`;
        document.getElementById('eventDescription').textContent = event.description || '';
        document.getElementById('eventOrganizer').textContent = event.organizerName || 'No especificado';
        document.getElementById('eventAddress').textContent = event.address || 'No especificada';
        document.getElementById('eventMaxGuests').textContent = event.maxGuests || 'Sin límite';
        document.getElementById('eventVirtualLink').innerHTML = event.isVirtual && event.virtualLink
            ? `<a href='${event.virtualLink}' target='_blank'>${event.virtualLink}</a>`
            : 'No disponible';
        document.getElementById('eventItinerary').textContent = event.itinerary || 'No especificado';

        // Mapa si hay coordenadas
        if (event.latitude && event.longitude) {
            document.getElementById('eventMap').innerHTML = `
                <iframe width="100%" height="250" style="border:0;border-radius:12px;"
                    src="https://maps.google.com/maps?q=${event.latitude},${event.longitude}&z=15&output=embed"
                    allowfullscreen="" loading="lazy"></iframe>
            `;
        } else {
            document.getElementById('eventMap').innerHTML = '<p>Ubicación no disponible</p>';
        }
        // Imagen destacada (si tienes una propiedad para imagen)
        if (event.imageUrl) {
            document.getElementById('eventImage').src = event.imageUrl;
        }
    } catch (err) {
        document.getElementById('eventTitle').textContent = 'No se pudo cargar el evento';
        document.getElementById('eventDescription').textContent = err.message;
    }
}

document.addEventListener('DOMContentLoaded', loadEvent);