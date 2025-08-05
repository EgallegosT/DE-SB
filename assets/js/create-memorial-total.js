// create-memorial-total.js

document.addEventListener('DOMContentLoaded', () => {
  const planRadios = document.querySelectorAll('input[name="plan_type"]');
  const qrCheckbox = document.getElementById('hasQrPlate');
  const totalDisplay = document.getElementById('totalDisplay');

  function updateTotal() {
    let total = 0;
    const plan = document.querySelector('input[name="plan_type"]:checked').value;
    if (plan === '3y') total = 999;
    if (plan === '10y') total = 2999;
    if (qrCheckbox && qrCheckbox.checked) total += 2999;
    totalDisplay.textContent = `Total: $${total} MXN`;
  }

  planRadios.forEach(radio => radio.addEventListener('change', updateTotal));
  if (qrCheckbox) qrCheckbox.addEventListener('change', updateTotal);
  updateTotal();
}); 