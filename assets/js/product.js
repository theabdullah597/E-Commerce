// Product detail page

(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return '$' + Number(n).toFixed(2);
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

  function getProductById(id) {
    const products = window.PRODUCTS || [];
    const num = Number(id);
    return products.find((p) => p.id === num) || null;
  }

  function getQueryId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function syncCartBadge() {
    const badge = qs('cart-badge');
    if (!badge) return;
    badge.textContent = String(window.CART.getCartCount());
  }

  window.addEventListener('cart:changed', syncCartBadge);

  document.addEventListener('DOMContentLoaded', () => {
    syncCartBadge();

    const id = getQueryId();
    const host = qs('product-container');
    const errorHost = qs('product-error');

    const product = getProductById(id);
    if (!product) {
      if (host) host.style.display = 'none';
      if (errorHost) {
        errorHost.innerHTML = `
          <div class="alert alert-danger">
            Invalid product id. Please return to <a href="shop.html" class="alert-link">Shop</a>.
          </div>
        `;
      }
      return;
    }

    if (!host) return;

    host.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-6">
          <div class="bg-light rounded-4 p-3">
            <img src="${product.image}" alt="${product.name}" class="w-100 rounded-3" style="height: 420px; object-fit: cover;">
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge text-bg-dark">${product.category}</span>
            <div class="text-warning fw-semibold">★ ${Number(product.rating || 0).toFixed(1)}</div>
          </div>

          <h1 class="mt-3">${product.name}</h1>
          <p class="text-muted">${product.description}</p>

          <div class="fs-4 fw-bold">${money(product.price)}</div>

          <div class="mt-4">
            <label class="form-label" for="qty-input">Quantity</label>
            <div class="input-group" style="max-width: 220px;">
              <button class="btn btn-outline-secondary" type="button" id="qty-minus">-</button>
              <input type="number" class="form-control text-center" id="qty-input" value="1" min="1" step="1">
              <button class="btn btn-outline-secondary" type="button" id="qty-plus">+</button>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button class="btn btn-dark flex-fill" id="add-to-cart-btn">Add to Cart</button>
            <a class="btn btn-outline-dark" href="cart.html">Go to Cart</a>
          </div>

          <div class="small text-muted mt-3">Cart updates are saved automatically in localStorage.</div>
        </div>
      </div>
    `;

    const qtyInput = qs('qty-input');
    const btn = qs('add-to-cart-btn');
    const minus = qs('qty-minus');
    const plus = qs('qty-plus');

    function clampQty() {
      let v = Number(qtyInput.value);
      if (!Number.isFinite(v) || v < 1) v = 1;
      qtyInput.value = v;
      return v;
    }

    minus?.addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    });
    plus?.addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value) + 1);
    });

    btn?.addEventListener('click', () => {
      const qty = clampQty();
      window.CART.addToCart(product.id, qty);
      window.dispatchEvent(new Event('cart:changed'));
      toast('Added to cart!', 'success');
    });
  });
})();

