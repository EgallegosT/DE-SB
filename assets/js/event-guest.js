// event-guest.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('guestForm');
  const guestList = document.getElementById('guestList');

  // Obtener eventId de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  if (!eventId) {
    alert('No se encontró el ID del evento.');
    form.style.display = 'none';
    return;
  }

  const API_BASE = 'http://localhost:3000/api';
  const token = localStorage.getItem('token');
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  // Función para cargar invitados
  async function loadGuests() {
    guestList.innerHTML = '<li>Cargando...</li>';
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/guests`, {
        headers: { 'Accept': 'application/json', ...authHeaders }
      });
      if (res.status === 401) {
        guestList.innerHTML = '<li>No autorizado. Inicia sesión para ver los invitados.</li>';
        return;
      }
      const data = await res.json();
      guestList.innerHTML = '';
      if (Array.isArray(data.guests) && data.guests.length > 0) {
        data.guests.forEach(guest => {
          const li = document.createElement('li');
          li.className = 'guest-item';
          const nombre = guest.name || '';
          const telefono = guest.phone || '';
          const estado = guest.rsvp_status || 'pending';
          // Enlace único de confirmación
          const enlace = `https://tusitio.com/event-guest-confirm.html?token=${guest.unique_token}`;
          // Mensaje para WhatsApp
          const mensaje = encodeURIComponent(`¡Hola ${nombre}! Te invito a mi evento. Por favor confirma tu asistencia aquí: ${enlace}`);
          const waLink = `https://wa.me/${telefono}?text=${mensaje}`;
          li.innerHTML = `
            <div class="guest-info">
              <span class="guest-name">${nombre}</span>
              <span class="guest-phone">(${telefono})</span>
              <span class="guest-status">- Estado: ${estado}</span>
            </div>
            <button class="share-btn" onclick="window.open('${waLink}', '_blank')">
              <img src='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/whatsapp.svg' alt='WhatsApp' style='width:20px;vertical-align:middle;margin-right:4px;'> Compartir
            </button>
          `;
          guestList.appendChild(li);
        });
      } else {
        guestList.innerHTML = '<li>No hay invitados registrados.</li>';
      }
    } catch (err) {
      guestList.innerHTML = '<li>Error al cargar invitados.</li>';
    }
  }

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      guestCount: parseInt(formData.get('guest_count')) || 1,
      message: formData.get('message')
    };
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        alert('No autorizado. Inicia sesión para agregar invitados.');
        return;
      }
      if (res.ok) {
        form.reset();
        loadGuests();
        alert('Invitado agregado exitosamente');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error al agregar invitado');
      }
    } catch (err) {
      alert('Error de red al agregar invitado');
    }
  });

  // Cargar invitados al iniciar
  loadGuests();
}); 