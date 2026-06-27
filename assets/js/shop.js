// Shop page: filtering, sorting, searching + rendering cards

(function () {
  const PRODUCTS = () => window.PRODUCTS || [];

  function qs(id) {
    return document.getElementById(id);
  }

  function money(n) {
    return '$' + Number(n).toFixed(2);
  }

  function normalizeText(s) {
    return String(s || '').toLowerCase();
  }

  function getActiveState() {
    const category = qs('category-filter')?.value || 'all';
    const sort = qs('price-sort')?.value || 'default';
    const search = (qs('search-input')?.value || '').trim();
    const rating = qs('min-rating')?.value ? Number(qs('min-rating').value) : 0;
    return { category, sort, search, rating };
  }

  function apply() {
    const { category, sort, search, rating } = getActiveState();

    const searchNorm = normalizeText(search);

    let list = PRODUCTS();

    // Filter category
    if (category && category !== 'all') {
      list = list.filter((p) => normalizeText(p.category) === normalizeText(category));
    }

    // Filter rating (optional)
    if (Number.isFinite(rating) && rating > 0) {
      list = list.filter((p) => Number(p.rating || 0) >= rating);
    }

    // Search
    if (searchNorm) {
      list = list.filter((p) => {
        const hay = [p.name, p.description, p.category].map(normalizeText).join(' ');
        return hay.includes(searchNorm);
      });
    }

    // Sort
    if (sort === 'low-to-high') {
      list = list.slice().sort((a, b) => a.price - b.price);
    } else if (sort === 'high-to-low') {
      list = list.slice().sort((a, b) => b.price - a.price);
    } else if (sort === 'rating-high') {
      list = list.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    render(list);
  }

  function createCard(p) {
    const el = document.createElement('div');
    el.className = 'col';

    const img = p.image || '';

    el.innerHTML = `
      <div class="card h-100 shadow-sm product-card">
        <div class="position-relative">
          <div class="product-badge">${p.category}</div>
          <img src="${img}" class="card-img-top" alt="${p.name}" style="height: 220px; object-fit: cover;">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text text-muted" style="font-size: 14px;">${p.description}</p>
          <div class="mt-auto">
            <div class="d-flex align-items-center justify-content-between">
              <div class="fw-bold fs-5">${money(p.price)}</div>
              <div class="text-warning" aria-label="Rating">★ ${Number(p.rating || 0).toFixed(1)}</div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <a class="btn btn-outline-dark flex-fill" href="product.html?id=${p.id}">View Details</a>
              <button class="btn btn-dark flex-fill" data-add-to-cart="${p.id}">
                <i class="bi bi-cart-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    return el;
  }

  function render(list) {
    const grid = qs('products-grid');
    grid.innerHTML = '';

    if (!list.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light text-center" role="alert">
            No products found. Try changing search/filter/sort.
          </div>
        </div>
      `;
      return;
    }

    for (const p of list) {
      grid.appendChild(createCard(p));
    }

    // Bind add buttons
    grid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-add-to-cart');
        window.CART.addToCart(id, 1);
        window.dispatchEvent(new Event('cart:changed'));
        toast('Added to cart!', 'success');
      });
    });
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

  function syncCartBadge() {
    const badge = qs('cart-badge');
    if (!badge) return;
    badge.textContent = String(window.CART.getCartCount());
  }

  function initCategoryOptions() {
    const catSel = qs('category-filter');
    if (!catSel) return;

    const categories = Array.from(new Set(PRODUCTS().map((p) => p.category))).sort();
    // Keep existing options (assumes all + placeholders exist)
    for (const c of categories) {
      if ([...catSel.options].some((o) => o.value === c)) continue;
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catSel.appendChild(opt);
    }
  }

  window.addEventListener('cart:changed', syncCartBadge);

  window.Shop = { apply };

  document.addEventListener('DOMContentLoaded', () => {
    initCategoryOptions();

    // Events
    ['category-filter', 'price-sort', 'search-input', 'min-rating'].forEach((id) => {
      const el = qs(id);
      if (!el) return;
      el.addEventListener('input', () => apply());
      el.addEventListener('change', () => apply());
    });

    qs('reset-filters')?.addEventListener('click', () => {
      if (qs('category-filter')) qs('category-filter').value = 'all';
      if (qs('price-sort')) qs('price-sort').value = 'default';
      if (qs('search-input')) qs('search-input').value = '';
      if (qs('min-rating')) qs('min-rating').value = '0';
      apply();
    });

    syncCartBadge();
    apply();
  });
})();

