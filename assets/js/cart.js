// LocalStorage-backed cart utilities for the capstone.
// Cart shape: [{ id: number, qty: number }]

(function () {
  const STORAGE_KEY = 'cart';

  function safeParse(json, fallback) {
    try {
      const v = JSON.parse(json);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function getCart() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cart = safeParse(raw, []);
    if (!Array.isArray(cart)) return [];
    // Normalize
    return cart
      .filter((x) => x && typeof x.id === 'number' && Number.isFinite(x.id))
      .map((x) => ({ id: x.id, qty: Math.max(0, Number(x.qty) || 0) }))
      .filter((x) => x.qty > 0);
  }

  function setCart(items) {
    const normalized = Array.isArray(items) ? items : [];
    const finalItems = normalized
      .map((x) => ({ id: Number(x.id), qty: Math.floor(Number(x.qty) || 0) }))
      .filter((x) => Number.isFinite(x.id) && x.id > 0 && x.qty > 0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalItems));
  }

  function getCartCount() {
    return getCart().reduce((sum, line) => sum + line.qty, 0);
  }

  function addToCart(productId, qty = 1) {
    const id = Number(productId);
    const addQty = Math.max(1, Math.floor(Number(qty) || 1));
    if (!Number.isFinite(id) || id <= 0) return;

    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === id);
    if (idx >= 0) cart[idx].qty += addQty;
    else cart.push({ id, qty: addQty });
    setCart(cart);
  }

  function removeFromCart(productId) {
    const id = Number(productId);
    if (!Number.isFinite(id)) return;
    const cart = getCart().filter((x) => x.id !== id);
    setCart(cart);
  }

  function updateQty(productId, qty) {
    const id = Number(productId);
    const newQty = Math.floor(Number(qty));
    if (!Number.isFinite(id)) return;
    const cart = getCart();

    const idx = cart.findIndex((x) => x.id === id);
    if (idx < 0) {
      if (newQty > 0) cart.push({ id, qty: newQty });
    } else {
      if (newQty <= 0) cart.splice(idx, 1);
      else cart[idx].qty = newQty;
    }
    setCart(cart);
  }

  function getCartLinesWithProducts() {
    const products = window.PRODUCTS || [];
    const map = new Map(products.map((p) => [p.id, p]));

    return getCart()
      .map((line) => {
        const product = map.get(line.id);
        if (!product) return null;
        return {
          ...line,
          product,
          lineTotal: product.price * line.qty
        };
      })
      .filter(Boolean);
  }

  function getCartSubtotal() {
    return getCartLinesWithProducts().reduce((sum, line) => sum + line.lineTotal, 0);
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.CART = {
    STORAGE_KEY,
    getCart,
    setCart,
    getCartCount,
    addToCart,
    removeFromCart,
    updateQty,
    getCartLinesWithProducts,
    getCartSubtotal,
    clearCart
  };
})();

