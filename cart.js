// ---- C&D PetStore shared cart logic ----
// Cart is stored in localStorage so it persists across Dog.html, Cat.html, and Shop.html

const CART_KEY = 'cdPetStoreCart';

function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Could not save cart:', e);
  }
}

// Called from each "Buy" button: addToCart('Mochi', 'Pomeranian (import)', 550, 'd1.jpg')
function addToCart(name, breed, price, img) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, breed: breed, price: price, img: img, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();

  const toastEl = document.getElementById('cart-toast');
  if (toastEl) {
    toastEl.textContent = name + ' added to cart!';
    toastEl.classList.add('show');
    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 1800);
  }
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter(item => item.name !== name);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function changeQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(name);
    return;
  }
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function clearCart() {
  saveCart([]);
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// Only does something on Shop.html, where #cart-items exists
function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-muted py-5">Your cart is empty. Go pick a pet! 🐾</p>';
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = '$0';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(function (item) {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return (
      '<div class="d-flex align-items-center justify-content-between border-bottom py-3 flex-wrap gap-2">' +
        '<div class="d-flex align-items-center">' +
          '<img src="' + item.img + '" alt="' + item.name + '" style="width:70px;height:70px;object-fit:contain;background:#f4f4f4;border-radius:8px;" class="me-3">' +
          '<div>' +
            '<h6 class="mb-0 fw-bold">' + item.name + '</h6>' +
            '<small class="text-muted">' + item.breed + '</small><br>' +
            '<small>$' + item.price + ' each</small>' +
          '</div>' +
        '</div>' +
        '<div class="d-flex align-items-center gap-3">' +
          '<div class="d-flex align-items-center border rounded">' +
            '<button class="btn btn-sm" onclick="changeQty(\'' + item.name + '\', -1)">-</button>' +
            '<span class="px-2">' + item.qty + '</span>' +
            '<button class="btn btn-sm" onclick="changeQty(\'' + item.name + '\', 1)">+</button>' +
          '</div>' +
          '<div class="fw-bold" style="min-width:60px;text-align:right;">$' + subtotal + '</div>' +
          '<button class="btn btn-sm btn-theme" onclick="removeFromCart(\'' + item.name + '\')"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = '$' + total;
}

document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  renderCart();
});
