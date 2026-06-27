// Cart page logic (renders cart, allows qty update/remove)

(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return '$' + Number(n).toFixed(2);
  }

  function getLineRow(line) {
    return `
      <tr data-product-row="${line.id}">
        <td>
          <div class="d-flex gap-3 align-items-center">
            <img src="${line.product.image}" alt="${line.product.name}" width="56" height="56" style="object-fit:cover;border-radius:12px;">
            <div>
              <div class="fw-semibold">${line.product.name}</div>
              <div class="text-muted small">${line.product.category}</div>
            </div>
          </div>
        </td>
        <td class="text-nowrap">${money(line.product.price)}</td>
        <td style="min-width: 180px;">
          <div class="input-group" style="max-width: 170px;">
            <button class="btn btn-outline-secondary" type="button" data-qty-minus="${line.id}">-</button>
            <input class="form-control text-center" type="number" min="1" step="1" value="${line.qty}" data-qty-input="${line.id}" />
            <button class="btn btn-outline-secondary" type="button" data-qty-plus="${line.id}">+</button>
          </div>
        </td>
        <td class="text-nowrap fw-semibold" data-line-total="${line.id}">${money(line.lineTotal)}</td>
        <td class="text-nowrap">
          <button class="btn btn-outline-danger" type="button" data-remove="${line.id}">Remove</button>
        </td>
      </tr>
    `;
  }

  function toast(message, type) {
    const t = qs('toast');
    const msg = qs('toast-msg');
    if (!t || !msg) return;
    msg.textContent = message;
    t.classList.remove('bg-success', 'bg-danger');
    t.classList.add(type === 'error' ? 'bg-danger' : 'bg-success');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  function syncBadge() {
    qs('cart-badge') && (qs('cart-badge').textContent = String(window.CART.getCartCount()));
  }

  function syncTotals() {
    const lines = window.CART.getCartLinesWithProducts();
    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const count = lines.reduce((sum, l) => sum + l.qty, 0);

    qs('cart-item-count') && (qs('cart-item-count').textContent = String(count));
    qs('cart-subtotal') && (qs('cart-subtotal').textContent = money(subtotal));
    qs('cart-total') && (qs('cart-total').textContent = money(subtotal));
  }

  function render() {
    syncBadge();

    const tbody = qs('cart-body');
    if (!tbody) return;

    const lines = window.CART.getCartLinesWithProducts();
    tbody.innerHTML = '';

    if (!lines.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="alert alert-light text-center m-0">Your cart is empty.</div>
          </td>
        </tr>
      `;
      syncTotals();
      return;
    }

    for (const line of lines) {
      tbody.insertAdjacentHTML('beforeend', getLineRow(line));
    }

    // Bind events
    tbody.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        window.CART.removeFromCart(id);
        window.dispatchEvent(new Event('cart:changed'));
        render();
        toast('Removed from cart', 'success');
      });
    });

    tbody.querySelectorAll('[data-qty-minus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-qty-minus');
        const input = tbody.querySelector(`[data-qty-input="${id}"]`);
        const current = Number(input?.value || 1);
        window.CART.updateQty(id, Math.max(1, current - 1));
        window.dispatchEvent(new Event('cart:changed'));
        render();
      });
    });

    tbody.querySelectorAll('[data-qty-plus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-qty-plus');
        const input = tbody.querySelector(`[data-qty-input="${id}"]`);
        const current = Number(input?.value || 1);
        window.CART.updateQty(id, current + 1);
        window.dispatchEvent(new Event('cart:changed'));
        render();
      });
    });

    tbody.querySelectorAll('[data-qty-input]').forEach((input) => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-qty-input');
        const qty = Number(input.value);
        window.CART.updateQty(id, qty);
        window.dispatchEvent(new Event('cart:changed'));
        render();
      });
    });

    syncTotals();
  }

  window.addEventListener('cart:changed', () => {
    // Lightweight rerender if already on cart page
    if (qs('cart-body')) {
      render();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    render();
  });
})();

