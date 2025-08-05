// event-guest-confirm.js

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const guestInfo = document.getElementById('guestInfo');
  const confirmForm = document.getElementById('confirmForm');
  const resultMsg = document.getElementById('resultMsg');
  const declineBtn = document.getElementById('declineBtn');
  const API_BASE = 'http://localhost:3000/api';

  if (!token) {
    guestInfo.innerHTML = '<p>Enlace inválido. Falta el token.</p>';
    return;
  }

  // Cargar datos del invitado
  async function loadGuest() {
    try {
      const res = await fetch(`${API_BASE}/guests/confirm/${token}`);
      if (!res.ok) {
        guestInfo.innerHTML = '<p>No se encontró el invitado o el enlace es inválido.</p>';
        return;
      }
      const data = await res.json();
      guestInfo.innerHTML = `<p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>WhatsApp:</strong> ${data.phone || 'No disponible'}</p>`;
      confirmForm.style.display = '';
    } catch (err) {
      guestInfo.innerHTML = '<p>Error al cargar los datos del invitado.</p>';
    }
  }

  // Confirmar asistencia
  confirmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(confirmForm);
    const body = {
      rsvp_status: 'confirmed',
      guest_count: parseInt(formData.get('guest_count')) || 1,
      message: formData.get('message')
    };
    try {
      const res = await fetch(`${API_BASE}/guests/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        resultMsg.textContent = '¡Gracias por confirmar tu asistencia!';
        confirmForm.style.display = 'none';
      } else {
        const errData = await res.json();
        resultMsg.textContent = errData.message || 'Error al confirmar asistencia.';
      }
    } catch (err) {
      resultMsg.textContent = 'Error de red al confirmar asistencia.';
    }
  });

  // Rechazar asistencia
  declineBtn.addEventListener('click', async () => {
    const body = {
      rsvp_status: 'declined',
      guest_count: 0,
      message: 'No podré asistir'
    };
    try {
      const res = await fetch(`${API_BASE}/guests/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        resultMsg.textContent = 'Lamentamos que no puedas asistir. ¡Gracias por avisar!';
        confirmForm.style.display = 'none';
      } else {
        const errData = await res.json();
        resultMsg.textContent = errData.message || 'Error al registrar tu respuesta.';
      }
    } catch (err) {
      resultMsg.textContent = 'Error de red al registrar tu respuesta.';
    }
  });

  loadGuest();
}); 