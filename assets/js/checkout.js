// Checkout UI-only validation logic

(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return '$' + Number(n).toFixed(2);
  }

  function renderOrderSummary() {
    const summary = qs('order-summary');
    if (!summary) return;

    const lines = window.CART.getCartLinesWithProducts();
    if (!lines.length) {
      summary.innerHTML = `<div class="alert alert-light">Your cart is empty.</div>`;
      return;
    }

    const items = lines
      .map(
        (l) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${l.product.name} <span class="text-muted">× ${l.qty}</span></span>
          <span>${money(l.lineTotal)}</span>
        </li>
      `
      )
      .join('');

    const subtotal = window.CART.getCartSubtotal();

    summary.innerHTML = `
      <ul class="list-group mb-3">${items}</ul>
      <div class="d-flex justify-content-between">
        <span class="fw-semibold">Subtotal</span>
        <span class="fw-semibold">${money(subtotal)}</span>
      </div>
      <div class="text-muted small mt-2">Taxes/shipping not calculated (UI only).</div>
    `;
  }

  function setError(fieldId, message) {
    const field = qs(fieldId);
    const err = qs(fieldId + '-error');
    if (!field || !err) return;

    if (message) {
      field.classList.add('is-invalid');
      err.textContent = message;
      err.style.display = 'block';
    } else {
      field.classList.remove('is-invalid');
      err.textContent = '';
      err.style.display = 'none';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  function validate() {
    const checks = [];

    const name = qs('checkout-name')?.value || '';
    const email = qs('checkout-email')?.value || '';
    const phone = qs('checkout-phone')?.value || '';
    const address = qs('checkout-address')?.value || '';
    const city = qs('checkout-city')?.value || '';
    const postal = qs('checkout-postal')?.value || '';
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;

    checks.push(['checkout-name', name.trim().length >= 2 ? '' : 'Name is required.']);
    checks.push(['checkout-email', isValidEmail(email) ? '' : 'Enter a valid email.']);
    checks.push(['checkout-phone', phone.trim().length >= 7 ? '' : 'Phone is required.']);
    checks.push(['checkout-address', address.trim().length >= 5 ? '' : 'Address is required.']);
    checks.push(['checkout-city', city.trim().length >= 2 ? '' : 'City is required.']);
    // simple postal validation: 4-10 alphanum
    checks.push(['checkout-postal', /^[A-Za-z0-9\-\s]{4,10}$/.test(postal.trim()) ? '' : 'Postal code looks invalid.']);
    checks.push(['payment-method', paymentMethod ? '' : 'Select a payment method.']);

    for (const [id, msg] of checks) {
      if (id === 'payment-method') {
        const err = qs('payment-method-error');
        if (!err) continue;
        if (msg) err.textContent = msg, err.style.display = 'block';
        else err.textContent = '', err.style.display = 'none';
      } else {
        setError(id, msg);
      }
    }

    return checks.every(([, msg]) => !msg);
  }

  function clearErrors() {
    const fields = [
      'checkout-name',
      'checkout-email',
      'checkout-phone',
      'checkout-address',
      'checkout-city',
      'checkout-postal'
    ];
    for (const f of fields) setError(f, '');

    const err = qs('payment-method-error');
    if (err) err.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOrderSummary();

    const form = qs('checkout-form');
    if (!form) return;

    form.addEventListener('input', (e) => {
      const id = e.target?.id;
      if (id && id.startsWith('checkout-')) setError(id, '');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      if (!window.CART.getCartLinesWithProducts().length) {
        const container = qs('checkout-success');
        if (container) container.innerHTML = `<div class="alert alert-warning">Your cart is empty.</div>`;
        return;
      }

      if (!validate()) return;

      // UI-only: show success and clear cart
      const success = qs('checkout-success');
      if (success) {
        const name = qs('checkout-name')?.value.trim() || 'there';
        success.innerHTML = `
          <div class="alert alert-success d-flex align-items-center justify-content-between">
            <span><strong>Order placed!</strong> Thanks, ${name}. (No payment processed.)</span>
            <span class="badge text-bg-dark">UI Only</span>
          </div>
        `;
      }

      window.CART.clearCart();
      window.dispatchEvent(new Event('cart:changed'));
      renderOrderSummary();

      // Also disable submit button to prevent resubmission
      const btn = qs('checkout-submit-btn');
      if (btn) btn.disabled = true;
    });
  });
})();

