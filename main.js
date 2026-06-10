// ============================================================
//  EWN HLM - እውን ህልም  | Main App Logic
//  Stack: GitHub Pages + Firebase + Telegram Bot
// ============================================================

// ============================================================
//  APP CONFIG  — Load from window.__EWN_CONFIG__ (set in a
//  separate, git-ignored config.js file) so secrets never
//  live in this source file.
//
//  In your git-ignored config.js, define:
//    window.__EWN_CONFIG__ = {
//      firebaseApiKey:        "YOUR_API_KEY",
//      firebaseAuthDomain:    "YOUR_PROJECT.firebaseapp.com",
//      firebaseDatabaseURL:   "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
//      firebaseProjectId:     "YOUR_PROJECT_ID",
//      firebaseStorageBucket: "YOUR_PROJECT.appspot.com",
//      firebaseMessagingSenderId: "YOUR_SENDER_ID",
//      firebaseAppId:         "YOUR_APP_ID",
//      telegramBotToken:      "YOUR_BOT_TOKEN",
//      telegramChatId:        "YOUR_CHAT_ID",
//    };
//
//  Add config.js to .gitignore — NEVER commit real secrets.
// ============================================================
const _cfg = window.__EWN_CONFIG__ || {};

const FIREBASE_CONFIG = {
  apiKey:            _cfg.firebaseApiKey            || '',
  authDomain:        _cfg.firebaseAuthDomain        || '',
  databaseURL:       _cfg.firebaseDatabaseURL       || '',
  projectId:         _cfg.firebaseProjectId         || '',
  storageBucket:     _cfg.firebaseStorageBucket     || '',
  messagingSenderId: _cfg.firebaseMessagingSenderId || '',
  appId:             _cfg.firebaseAppId             || ''
};

const TELEGRAM_BOT_TOKEN = _cfg.telegramBotToken || '';
const TELEGRAM_CHAT_ID   = _cfg.telegramChatId   || '';

// ---- CATEGORY DEFINITIONS ----
const CATEGORIES = [
  { id: 'all',          emoji: '🛍️', labelKey: 'all' },
  { id: 'phones',       emoji: '📱', labelKey: 'phones' },
  { id: 'kitchen',      emoji: '🍳', labelKey: 'kitchen' },
  { id: 'laptops',      emoji: '💻', labelKey: 'laptops' },
  { id: 'beauty_health',emoji: '💄', labelKey: 'beauty_health' },
  { id: 'accessories',  emoji: '⚡', labelKey: 'accessories' }
];

// Screens that require authentication
const PROTECTED_SCREENS = ['likes', 'profile', 'cart', 'orders', 'notifications'];

// Smart header scroll state (module-level so navigate() can reset)
let lastScrollY = 0;
let headerHidden = false;

// ============================================================
//  TRANSLATIONS
// ============================================================
const i18n = {
  am: {
    home: "መነሻ", cart: "ጋሪ", orders: "ትዕዛዞች", profile: "መገለጫ",
    search: "ምርቶችን ይፈልጉ...", location: "አካባቢ", getting_location: "አካባቢዎን እያገኘን...",
    categories: "ምድቦች", all: "ሁሉም",
    phones: "ስልኮች", kitchen: "የማእድቤት እቃዎች",
    laptops: "ላፕቶፕ", beauty_health: "ውበት", accessories: "ልዩ ዕቃዎች",
    special_offers: "ልዩ ቅናሾች", featured: "ተመረጡ ምርቶች",
    see_all: "ሁሉንም ይዩ", add_to_cart: "ጋሪ ውስጥ ጨምር", buy_now: "አሁን ግዛ",
    etb: "ብር", condition: "ሁኔታ", colors: "ቀለሞች",
    cart_empty: "ጋሪዎ ባዶ ነው", cart_empty_sub: "ምርቶችን ጠቅ አድርጎ ጋሪ ያስገቡ",
    cart_total: "ጠቅላላ", checkout: "ትዕዛዝ ያስቀምጡ",
    no_orders: "ምንም ትዕዛዝ የለም", no_orders_sub: "ትዕዛዝ ሲሰጡ እዚህ ይታያል",
    shop_now: "አሁን ይሸምቱ", my_likes: "ወዳጆቼ", no_likes: "ወዳጅ ምርቶች የሉም",
    refer: "ወዳጅዎን ያጋሩ፣ ያትርፉ", refer_sub: "ጓደኛዎን ሳቡ ሽልማት ያግኙ",
    language: "ቋንቋ", language_sub: "ቋንቋ ይቀይሩ",
    help: "የእርዳታ ማዕከል", help_sub: "ድጋፍ ያግኙ",
    theme: "ቀለም ገጽታ", theme_sub: "ብርሃን / ጨለማ ቅርጸት",
    logout: "ውጣ", logout_sub: "ከሂሳብዎ ይውጡ",
    pending: "በመጠባበቅ", processing: "እየተሰራ", delivered: "ደረሰ",
    order_sent: "ትዕዛዞ ተቀብሏል! ✅", added_cart: "ጋሪ ገባ! 🛒",
    order_confirm: "ትዕዛዝ ማረጋገጫ",
    banner_title: "ሕልምዎ እውን የሚሆንበት\nየዲጂታል ገበያ!!",
    banner_sub: "አሁን ይሸምቱ",
    app_tagline: "እውን ሕልም - ሕልምዎ እውን የሚሆንበት የዲጂታል ገበያ!!",
    no_products: "ምንም ምርት አልተገኘም",
    out_of_stock: "አልቋል", discounted: "ቅናሽ",
    login_title: "እንኳን ደህና መጡ", login_sub: "ለመቀጠል ስም እና ስልክ ያስገቡ",
    full_name: "ሙሉ ስም", phone_number: "ስልክ ቁጥር",
    login_btn: "ግባ / ይመዝገቡ", login_required: "እባክዎ መጀመሪያ ይመዝገቡ",
    notifications: "ማሳወቂያዎች", notifications_sub: "የቅርብ ጊዜ ማሳወቂያዎች",
    back: "ተመለስ",
    color_optional: "ቀለም (አማራጭ)", color_selected: "✓ ተመረጠ",
    buy_item: "አሁን ግዛ"
  },
  en: {
    home: "Home", cart: "Cart", orders: "Orders", profile: "Profile",
    search: "Search products...", location: "Location", getting_location: "Getting your location...",
    categories: "Categories", all: "All",
    phones: "Phones", kitchen: "Kitchen",
    laptops: "Laptops", beauty_health: "Beauty", accessories: "Accessories",
    special_offers: "Special Offers", featured: "Featured Products",
    see_all: "See All", add_to_cart: "Add to Cart", buy_now: "Buy Now",
    etb: "ETB", condition: "Condition", colors: "Colors",
    cart_empty: "Your cart is empty", cart_empty_sub: "Tap products to add them to cart",
    cart_total: "Total", checkout: "Place Order",
    no_orders: "No orders yet", no_orders_sub: "Your orders will appear here",
    shop_now: "Shop Now", my_likes: "My Favorites", no_likes: "No favorite products yet",
    refer: "Refer & Earn", refer_sub: "Refer friends and earn rewards",
    language: "Language", language_sub: "Change language",
    help: "Help Center", help_sub: "Get support",
    theme: "Theme", theme_sub: "Switch light / dark mode",
    logout: "Logout", logout_sub: "Sign out of your account",
    pending: "Pending", processing: "Processing", delivered: "Delivered",
    order_sent: "Order placed! ✅", added_cart: "Added to cart! 🛒",
    order_confirm: "Order Confirmation",
    banner_title: "The Digital Market\nWhere Dreams Come True!",
    banner_sub: "Shop Now",
    app_tagline: "Ewn Hlm - Your Digital Market Where Dreams Come True!!",
    no_products: "No products found",
    out_of_stock: "Out of Stock", discounted: "Sale",
    login_title: "Welcome", login_sub: "Enter your name and phone to continue",
    full_name: "Full Name", phone_number: "Phone Number",
    login_btn: "Login / Register", login_required: "Please register first",
    notifications: "Notifications", notifications_sub: "Recent notifications",
    back: "Back",
    color_optional: "Color (optional)", color_selected: "✓ Selected",
    buy_item: "Buy Now"
  }
};

// ============================================================
//  APP STATE
// ============================================================
const state = {
  lang: localStorage.getItem('ewn_lang') || 'am',
  theme: localStorage.getItem('ewn_theme') || 'light',
  currentScreen: 'home',
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('ewn_cart') || '[]'),
  likes: JSON.parse(localStorage.getItem('ewn_likes') || '[]'),
  orders: JSON.parse(localStorage.getItem('ewn_orders') || '[]'),
  activeCategory: 'all',
  user: JSON.parse(localStorage.getItem('ewn_user') || 'null'),
  searchQuery: '',
  carouselIndex: 0,
  selectedColor: null   // tracks the color picked in the currently-open modal
};

// ============================================================
//  UTILITIES
// ============================================================
const t = (key) => (i18n[state.lang] || i18n.am)[key] || key;

function isAuthenticated() {
  return !!(state.user && state.user.name && state.user.phone);
}

function formatPrice(n) {
  return n.toLocaleString('am-ET') + ' ' + t('etb');
}

// Legacy category ID migration map
const CATEGORY_MIGRATION = {
  electronics: 'phones', fashion: 'kitchen', home: 'laptops',
  food: 'kitchen', beauty: 'beauty_health'
};

/** Normalize product: support legacy single `image` field and old categories */
function normalizeProduct(p) {
  const images = p.images?.length ? p.images : (p.image ? [p.image] : []);
  const category = CATEGORY_MIGRATION[p.category] || p.category;
  const { seller, ...rest } = p; // strip legacy seller field
  return {
    ...rest,
    category,
    images,
    image: images[0] || '',
    colors: p.colors || [],
    discountedPrice: p.discountedPrice || null,
    hidden: !!p.hidden,
    outOfStock: !!p.outOfStock
  };
}

function getProductImages(p) {
  const norm = normalizeProduct(p);
  return norm.images.length ? norm.images : ['https://via.placeholder.com/300x300/0d5c42/ffffff?text=Product'];
}

function getDisplayPrice(p) {
  if (p.discountedPrice && p.discountedPrice < p.price) return p.discountedPrice;
  return p.price;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function saveCart() {
  localStorage.setItem('ewn_cart', JSON.stringify(state.cart));
  updateCartBadge();
}

function saveLikes() {
  localStorage.setItem('ewn_likes', JSON.stringify(state.likes));
}

function saveOrders() {
  localStorage.setItem('ewn_orders', JSON.stringify(state.orders));
}

function saveUser() {
  localStorage.setItem('ewn_user', JSON.stringify(state.user));
}

function updateCartBadge() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ============================================================
//  AUTH
// ============================================================
function openAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const nameInput = document.getElementById('auth-name');
  const phoneInput = document.getElementById('auth-phone');
  if (nameInput && state.user?.name) nameInput.value = state.user.name;
  if (phoneInput && state.user?.phone) phoneInput.value = state.user.phone;
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function submitAuth(e) {
  e.preventDefault();
  const name = document.getElementById('auth-name').value.trim();
  const phone = document.getElementById('auth-phone').value.trim();
  if (!name || !phone) return;
  state.user = { name, phone, location: state.user?.location || '' };
  saveUser();
  closeAuthModal();
  renderProfile();
  showToast(state.lang === 'am' ? `እንኳን ደህና መጡ ${name}!` : `Welcome, ${name}!`);
}

function logout() {
  state.user = null;
  saveUser();
  renderProfile();
  navigate('home');
  showToast(state.lang === 'am' ? 'በተሳካ ሁኔታ ወጥተዋል' : 'Logged out successfully');
}

function requireAuth(callback) {
  if (isAuthenticated()) {
    callback();
    return true;
  }
  showToast(t('login_required'));
  openAuthModal();
  return false;
}

// ============================================================
//  TELEGRAM ORDER NOTIFICATION
// ============================================================
async function sendOrderToTelegram(order) {
  const msg = `
🛍️ *ትዕዛዝ ደረሰ / New Order*

📋 Order ID: \`${order.id}\`
👤 ደንበኛ: ${order.customer.name}
📞 ስልክ: ${order.customer.phone}
📍 አካባቢ: ${order.customer.location || 'N/A'}

🛒 *ምርቶች / Products:*
${order.items.map(i => `• ${i.name}${i.color ? ` [${i.color}]` : ''} x${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n')}

💰 *ጠቅላላ / Total: ${formatPrice(order.total)}*
⏰ ${new Date(order.date).toLocaleString('am-ET')}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.warn('Telegram notify failed:', err);
  }
}

// ============================================================
//  LOAD PRODUCTS (localStorage admin store → products.json fallback)
// ============================================================
async function loadProducts() {
  // Bump version to refresh seed data after schema/category updates
  const PRODUCTS_VERSION = '2';
  if (localStorage.getItem('ewn_products_version') !== PRODUCTS_VERSION) {
    localStorage.removeItem('ewn_products');
    localStorage.setItem('ewn_products_version', PRODUCTS_VERSION);
  }

  try {
    const stored = localStorage.getItem('ewn_products');
    if (stored) {
      state.products = JSON.parse(stored).map(normalizeProduct);
    } else {
      const res = await fetch('./products.json');
      const data = await res.json();
      const normalized = data.map(normalizeProduct);
      localStorage.setItem('ewn_products', JSON.stringify(normalized));
      state.products = normalized;
    }
  } catch {
    state.products = [];
  }
  // Only show visible products on the storefront
  state.products = state.products.filter(p => !p.hidden);
  filterProducts();
  renderProducts();
}

// ============================================================
//  RENDER FUNCTIONS
// ============================================================

function renderCategories() {
  const wrap = document.getElementById('categories-scroll');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(c => `
    <button class="cat-chip${state.activeCategory === c.id ? ' active' : ''}"
            onclick="selectCategory('${c.id}')">
      <span class="emoji">${c.emoji}</span>
      <span class="label">${t(c.labelKey)}</span>
    </button>
  `).join('');
}

function filterProducts() {
  let p = [...state.products];
  if (state.activeCategory !== 'all') {
    p = p.filter(x => x.category === state.activeCategory);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    p = p.filter(x =>
      x.name.toLowerCase().includes(q) ||
      (x.nameAm || '').includes(q) ||
      (x.description || '').toLowerCase().includes(q)
    );
  }
  state.filteredProducts = p;
}

function renderPriceHTML(p) {
  const display = getDisplayPrice(p);
  if (p.discountedPrice && p.discountedPrice < p.price) {
    return `<div class="product-price">
      <span class="price-sale">${formatPrice(p.discountedPrice)}</span>
      <span class="price-original">${formatPrice(p.price)}</span>
    </div>`;
  }
  return `<div class="product-price">${formatPrice(display)}</div>`;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!state.filteredProducts.length) {
    grid.innerHTML = `<div class="no-products-msg am">${t('no_products')}</div>`;
    return;
  }
  const isAm = state.lang === 'am';
  grid.innerHTML = state.filteredProducts.map(p => {
    const liked = state.likes.includes(p.id);
    const name = isAm && p.nameAm ? p.nameAm : p.name;
    const desc = isAm && p.descriptionAm ? p.descriptionAm : p.description;
    const img = getProductImages(p)[0];
    const stockBadge = p.outOfStock
      ? `<span class="stock-badge out">${t('out_of_stock')}</span>` : '';
    const discountBadge = (p.discountedPrice && p.discountedPrice < p.price)
      ? `<span class="stock-badge sale">${t('discounted')}</span>` : '';
    return `
    <div class="product-card${p.outOfStock ? ' out-of-stock' : ''}" onclick="openProduct('${p.id}')">
      <div class="product-img-wrap">
        <img src="${img}" alt="${name}" loading="lazy">
        <button class="like-btn${liked ? ' liked' : ''}" onclick="toggleLike(event,'${p.id}')">
          ${liked ? '❤️' : '🤍'}
        </button>
        ${discountBadge}${stockBadge}
      </div>
      <div class="product-info">
        <div class="product-name am">${name}</div>
        <div class="product-desc">${desc || ''}</div>
        ${renderPriceHTML(p)}
      </div>
    </div>`;
  }).join('');
}

function renderCart() {
  const screen = document.getElementById('cart-content');
  if (!screen) return;
  if (!state.cart.length) {
    screen.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">🛒</div>
        <div class="empty-title am">${t('cart_empty')}</div>
        <div class="empty-sub am">${t('cart_empty_sub')}</div>
        <button class="btn-primary am" onclick="navigate('home')">${t('shop_now')}</button>
      </div>`;
    return;
  }
  screen.innerHTML = state.cart.map((item, idx) => {
    const colorSwatch = item.color
      ? `<span class="cart-item-color-swatch" style="background:${item.color}" title="${item.color}"></span>`
      : '';
    return `
    <div class="cart-item" id="cart-item-${idx}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name am">${item.name}</div>
        <div class="cart-item-meta">
          <span class="cart-item-price">${formatPrice(item.price)}</span>
          ${colorSwatch}
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${idx})">🗑️</button>
        </div>
        <button class="cart-item-buy-btn am" onclick="openCheckout(${idx})">
          ${t('buy_item')} →
        </button>
      </div>
    </div>`;
  }).join('');
}

function renderOrders() {
  const screen = document.getElementById('orders-content');
  if (!screen) return;
  if (!state.orders.length) {
    screen.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">📦</div>
        <div class="empty-title am">${t('no_orders')}</div>
        <div class="empty-sub am">${t('no_orders_sub')}</div>
        <button class="btn-primary am" onclick="navigate('home')">${t('shop_now')}</button>
      </div>`;
    return;
  }
  const statusMap = { pending: t('pending'), processing: t('processing'), delivered: t('delivered') };
  screen.innerHTML = state.orders.slice().reverse().map(o => `
    <div class="order-card">
      <div class="order-top">
        <span class="order-id">#${o.id}</span>
        <span class="order-status ${o.status}">${statusMap[o.status] || o.status}</span>
      </div>
      <div class="order-name am">${o.items.map(i => i.name).join(', ')}</div>
      <div class="order-price">${formatPrice(o.total)}</div>
      <div class="order-date">📅 ${new Date(o.date).toLocaleDateString('am-ET')}</div>
    </div>
  `).join('');
}

function renderProfile() {
  const nameEl = document.getElementById('profile-name');
  const phoneEl = document.getElementById('profile-phone');
  const loginBtn = document.getElementById('login-prompt-btn');
  const authed = isAuthenticated();

  if (nameEl) nameEl.textContent = authed ? state.user.name : (state.lang === 'am' ? 'እንግዲህ ይመዝገቡ' : 'Guest');
  if (phoneEl) phoneEl.textContent = authed ? state.user.phone : '';
  if (loginBtn) {
    loginBtn.style.display = authed ? 'none' : 'inline-block';
    loginBtn.textContent = t('login_btn');
  }

  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.classList.toggle('on', state.theme === 'dark');

  applyI18nToPage();
}

function renderLikes() {
  const screen = document.getElementById('likes-content');
  if (!screen) return;
  const liked = state.products.filter(p => state.likes.includes(p.id));
  screen.innerHTML = `<div class="screen-title am">${t('my_likes')}</div>`;
  if (!liked.length) {
    screen.innerHTML += `<div class="empty-state"><div class="empty-emoji">🤍</div>
      <div class="empty-title am">${t('no_likes')}</div></div>`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'products-grid';
  const isAm = state.lang === 'am';
  grid.innerHTML = liked.map(p => `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-img-wrap">
        <img src="${getProductImages(p)[0]}" alt="${p.name}" loading="lazy">
        <button class="like-btn liked" onclick="toggleLike(event,'${p.id}')">❤️</button>
      </div>
      <div class="product-info">
        <div class="product-name am">${isAm && p.nameAm ? p.nameAm : p.name}</div>
        ${renderPriceHTML(p)}
      </div>
    </div>`).join('');
  screen.appendChild(grid);
}

function renderNotifications() {
  const screen = document.getElementById('notifications-content');
  if (!screen) return;
  screen.innerHTML = `
    <div class="screen-title am">${t('notifications')}</div>
    <div class="empty-state">
      <div class="empty-emoji">🔔</div>
      <div class="empty-title am">${t('notifications')}</div>
      <div class="empty-sub am">${t('notifications_sub')}</div>
    </div>`;
}

// ============================================================
//  MODAL CAROUSEL
// ============================================================
function buildCarouselHTML(images, productId) {
  if (images.length <= 1) {
    return `<div class="modal-carousel single">
      <img class="modal-carousel-img" src="${images[0]}" alt="Product">
    </div>`;
  }
  const dots = images.map((_, i) =>
    `<button class="carousel-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})" aria-label="Slide ${i + 1}"></button>`
  ).join('');
  const slides = images.map((src, i) =>
    `<div class="carousel-slide${i === 0 ? ' active' : ''}" data-index="${i}">
      <img src="${src}" alt="Product image ${i + 1}" draggable="false">
    </div>`
  ).join('');
  return `
    <div class="modal-carousel" id="modal-carousel" data-product="${productId}" data-count="${images.length}">
      <div class="carousel-track" id="carousel-track">${slides}</div>
      <button class="carousel-arrow prev" onclick="carouselNav(-1)" aria-label="Previous">‹</button>
      <button class="carousel-arrow next" onclick="carouselNav(1)" aria-label="Next">›</button>
      <div class="carousel-dots">${dots}</div>
    </div>`;
}

function goToSlide(index) {
  const carousel = document.getElementById('modal-carousel');
  if (!carousel) return;
  const count = parseInt(carousel.dataset.count, 10);
  state.carouselIndex = ((index % count) + count) % count;
  updateCarousel();
}

function carouselNav(dir) {
  const carousel = document.getElementById('modal-carousel');
  if (!carousel) return;
  const count = parseInt(carousel.dataset.count, 10);
  state.carouselIndex = (state.carouselIndex + dir + count) % count;
  updateCarousel();
}

function updateCarousel() {
  const carousel = document.getElementById('modal-carousel');
  if (!carousel) return;
  const idx = state.carouselIndex;
  carousel.querySelectorAll('.carousel-slide').forEach((s, i) => {
    s.classList.toggle('active', i === idx);
  });
  carousel.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

function initCarouselSwipe() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  let startX = 0;
  let dragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!dragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) carouselNav(diff > 0 ? 1 : -1);
    dragging = false;
  }, { passive: true });

  // Mouse drag support for desktop
  track.addEventListener('mousedown', (e) => { startX = e.clientX; dragging = true; });
  track.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) carouselNav(diff > 0 ? 1 : -1);
    dragging = false;
  });
}

function buildColorsHTML(colors) {
  if (!colors?.length) return '';
  // Each circle calls selectColor(hex); active state applied via JS
  const circles = colors.map(c => {
    // Detect very light colors so we give them a visible border by default
    const isLight = isLightColor(c);
    return `<button
      class="color-circle${isLight ? ' color-circle--light' : ''}"
      data-color="${c}"
      style="background:${c}"
      onclick="selectColor('${c}')"
      title="${c}"
      aria-label="Select color ${c}"
    ></button>`;
  }).join('');
  return `
    <div class="modal-colors">
      <div class="modal-colors-header">
        <span class="modal-colors-label am">${t('color_optional')}</span>
        <span class="modal-color-feedback am" id="color-feedback"></span>
      </div>
      <div class="color-circles" id="color-circles">${circles}</div>
    </div>`;
}

/** Toggle color selection. Clicking the active color de-selects it. */
function selectColor(hex) {
  if (state.selectedColor === hex) {
    // Deselect
    state.selectedColor = null;
    document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('active'));
    const fb = document.getElementById('color-feedback');
    if (fb) fb.textContent = '';
  } else {
    state.selectedColor = hex;
    document.querySelectorAll('.color-circle').forEach(el => {
      el.classList.toggle('active', el.dataset.color === hex);
    });
    const fb = document.getElementById('color-feedback');
    if (fb) {
      fb.textContent = t('color_selected');
      fb.style.color = 'var(--clr-accent)';
    }
  }
}

/** Returns true if the hex color is "light" (so we can give it a visible border) */
function isLightColor(hex) {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Perceived brightness formula
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

// ============================================================
//  ACTIONS
// ============================================================

function selectCategory(id) {
  state.activeCategory = id;
  filterProducts();
  renderProducts();
  renderCategories();
}

function navigate(screen) {
  if (PROTECTED_SCREENS.includes(screen) && !isAuthenticated()) {
    showToast(t('login_required'));
    openAuthModal();
    return;
  }

  state.currentScreen = screen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screenEl = document.getElementById(`screen-${screen}`);
  if (screenEl) screenEl.classList.add('active');

  const navEl = document.querySelector(`[data-nav="${screen}"]`);
  if (navEl) navEl.classList.add('active');

  const header = document.getElementById('main-header');
  if (header) {
    header.style.display = (screen === 'home') ? '' : 'none';
    // Reset scroll-reveal state when returning to home
    if (screen === 'home') {
      header.classList.remove('header-hidden');
      lastScrollY = 0;
      headerHidden = false;
    }
  }

  if (screen === 'cart') renderCart();
  if (screen === 'orders') renderOrders();
  if (screen === 'profile') renderProfile();
  if (screen === 'likes') renderLikes();
  if (screen === 'notifications') renderNotifications();

  window.scrollTo(0, 0);
}

function openProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const isAm = state.lang === 'am';
  const name = isAm && p.nameAm ? p.nameAm : p.name;
  const desc = isAm && p.descriptionAm ? p.descriptionAm : p.description;
  const images = getProductImages(p);
  state.carouselIndex = 0;
  state.selectedColor = null; // reset for each new product view

  const modal = document.getElementById('product-modal');
  modal.innerHTML = `
    <div class="modal-sheet">
      <button class="modal-close" onclick="closeModal()">✕</button>
      ${buildCarouselHTML(images, p.id)}
      <div class="modal-body">
        <div class="modal-name am">${name}</div>
        ${renderPriceHTML(p).replace('product-price', 'modal-price-wrap')}
        ${p.outOfStock ? `<div class="modal-stock-badge am">${t('out_of_stock')}</div>` : ''}
        <div class="modal-desc am">${desc || ''}</div>
        ${buildColorsHTML(p.colors)}
        <div class="modal-btns">
          <button class="btn-cart am" onclick="addToCart('${p.id}', state.selectedColor);closeModal()" ${p.outOfStock ? 'disabled' : ''}>${t('add_to_cart')}</button>
          <button class="btn-order am" onclick="quickOrder('${p.id}')" ${p.outOfStock ? 'disabled' : ''}>${t('buy_now')}</button>
        </div>
      </div>
    </div>`;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  initCarouselSwipe();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleLike(e, id) {
  e.stopPropagation();
  const idx = state.likes.indexOf(id);
  if (idx === -1) {
    state.likes.push(id);
    e.currentTarget.innerHTML = '❤️';
    e.currentTarget.classList.add('liked');
  } else {
    state.likes.splice(idx, 1);
    e.currentTarget.innerHTML = '🤍';
    e.currentTarget.classList.remove('liked');
  }
  saveLikes();
}

function addToCart(id, color) {
  const p = state.products.find(x => x.id === id);
  if (!p || p.outOfStock) return;
  // Each unique id+color combination gets its own cart line
  const colorKey = color || null;
  const existing = state.cart.find(x => x.id === id && x.color === colorKey);
  const price = getDisplayPrice(p);
  if (existing) {
    existing.qty++;
  } else {
    const isAm = state.lang === 'am';
    state.cart.push({
      id: p.id,
      name: isAm && p.nameAm ? p.nameAm : p.name,
      price,
      image: getProductImages(p)[0],
      qty: 1,
      color: colorKey
    });
  }
  saveCart();
  showToast(t('added_cart'));
}

function changeQty(idx, delta) {
  const item = state.cart[idx];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function removeFromCart(idx) {
  state.cart.splice(idx, 1);
  saveCart();
  renderCart();
}

async function placeOrder(singleCartItemId) {
  if (!isAuthenticated()) {
    openAuthModal();
    return;
  }

  // Determine items to order: either one specific cart line or the full cart
  let itemsToOrder;
  if (singleCartItemId !== undefined) {
    // singleCartItemId is the array index or a composite key — we use array index
    const item = state.cart[singleCartItemId];
    if (!item) return;
    itemsToOrder = [{ ...item }];
  } else {
    if (!state.cart.length) return;
    itemsToOrder = [...state.cart];
  }

  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    items: itemsToOrder,
    total: itemsToOrder.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'pending',
    date: new Date().toISOString(),
    customer: {
      name: state.user.name,
      phone: state.user.phone,
      location: state.user.location || ''
    }
  };
  state.orders.push(order);
  saveOrders();

  // Remove ordered items from cart
  if (singleCartItemId !== undefined) {
    state.cart.splice(singleCartItemId, 1);
  } else {
    state.cart = [];
  }
  saveCart();

  await sendOrderToTelegram(order);
  showToast(t('order_sent'));
  navigate('orders');
}

async function quickOrder(id) {
  if (!isAuthenticated()) {
    closeModal();
    openAuthModal();
    return;
  }
  const color = state.selectedColor;
  closeModal();
  addToCart(id, color);
  // placeOrder with no arg → orders the full cart (which now has just this item if cart was empty,
  // or the newest item appended). To buy just this one item we use its cart index.
  const idx = state.cart.findIndex(x => x.id === id && x.color === (color || null));
  await placeOrder(idx >= 0 ? idx : undefined);
}

function handleSearch(val) {
  state.searchQuery = val;
  filterProducts();
  renderProducts();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('ewn_theme', state.theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.classList.toggle('on', state.theme === 'dark');
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('ewn_lang', lang);
  applyI18nToPage();
  renderCategories();
  filterProducts();
  renderProducts();
  renderProfile();
  document.querySelectorAll('.lang-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
}

function applyI18nToPage() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t('search');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    // Allow line breaks in banner title
    if (key === 'banner_title') {
      el.innerHTML = t(key).replace('\n', '<br>');
    } else {
      el.textContent = t(key);
    }
  });
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.setAttribute('data-theme', state.theme);
  applyI18nToPage();

  setTimeout(async () => {
    document.getElementById('splash').classList.add('hidden');
    const app = document.getElementById('app');
    app.classList.add('visible');
    await loadProducts();
    renderCategories(); // Fix: render categories on initial load
    navigate('home');
    updateCartBadge();
    renderProfile();

    // Measure actual header height and set CSS variable for content offset
    const header = document.getElementById('main-header');
    if (header) {
      const setHeaderHeight = () => {
        document.documentElement.style.setProperty(
          '--header-h', header.offsetHeight + 'px'
        );
      };
      setHeaderHeight();
      window.addEventListener('resize', setHeaderHeight, { passive: true });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }, 2200);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      const locText = document.getElementById('location-text');
      if (locText) locText.textContent = 'አዲስ አበባ, ኢትዮጵያ';
    }, () => {
      const locText = document.getElementById('location-text');
      if (locText) locText.textContent = 'አዲስ አበባ, ኢትዮጵያ';
    });
  }

  // ---- Smart Scroll-to-Reveal Header ----
  window.addEventListener('scroll', () => {
    if (state.currentScreen !== 'home') return;
    const header = document.getElementById('main-header');
    if (!header) return;

    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;

    if (scrollingDown && currentScrollY > 60 && !headerHidden) {
      // Slide header out of view upward
      header.classList.add('header-hidden');
      headerHidden = true;
    } else if (!scrollingDown && headerHidden) {
      // Slide header back into view
      header.classList.remove('header-hidden');
      headerHidden = false;
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
  if (e.target.id === 'auth-overlay') closeAuthModal();
});

// ============================================================
//  PHASE 3 — CHECKOUT OVERLAY & INTERRUPTED ORDER RECOVERY
// ============================================================

// Payment account numbers per method
const PAYMENT_ACCOUNTS = {
  telebirr:   { label: 'Telebirr / ቴሌብር',   number: '0912345678' },
  cbe:        { label: 'CBE / ንግድ ባንክ',      number: '1000123456789' },
  abyssinia:  { label: 'Abyssinia / አቢሲንያ', number: '101234567890' }
};

// Shipping city options
const SHIPPING_CITIES = [
  { value: 'addis',      label: 'አዲስ አበባ (Addis Ababa)' },
  { value: 'adama',      label: 'አዳማ (Adama)' },
  { value: 'dessie',     label: 'ደሴ (Dessie)' },
  { value: 'kombolcha',  label: 'ኮምቦልቻ (Kombolcha)' }
];

// ---- State for the in-progress checkout ----
let _checkoutItems    = [];
let _checkoutSingleIdx = null; // null = full cart, number = single cart index

// -------- Open Checkout Overlay --------
function openCheckout(singleCartItemIdx) {
  if (!isAuthenticated()) { openAuthModal(); return; }

  _checkoutSingleIdx = (singleCartItemIdx !== undefined) ? singleCartItemIdx : null;
  _checkoutItems = (_checkoutSingleIdx !== null)
    ? [{ ...state.cart[_checkoutSingleIdx] }]
    : [...state.cart];

  if (!_checkoutItems.length) return;

  const total = _checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);

  const itemsHTML = _checkoutItems.map(i => `
    <div class="co-item">
      <img class="co-item-img" src="${i.image}" alt="${i.name}">
      <div class="co-item-info">
        <div class="co-item-name am">${i.name}</div>
        <div class="co-item-price">${formatPrice(i.price)} × ${i.qty}</div>
      </div>
      <div class="co-item-sub">${formatPrice(i.price * i.qty)}</div>
    </div>`).join('');

  const cityOptions = SHIPPING_CITIES.map(c =>
    `<option value="${c.value}">${c.label}</option>`).join('');

  const paymentMethods = Object.entries(PAYMENT_ACCOUNTS).map(([key, info]) => `
    <label class="co-radio-label" for="pay-${key}">
      <input type="radio" name="payMethod" id="pay-${key}" value="${key}"
             onchange="onPaymentMethodChange('${key}')">
      <span class="co-radio-box">
        <span class="co-radio-name am">${info.label}</span>
      </span>
    </label>`).join('');

  const overlay = document.getElementById('checkout-overlay');
  const modal   = document.getElementById('checkout-modal');

  modal.innerHTML = `
    <div class="co-header">
      <div class="co-title am">ትዕዛዝ / Checkout</div>
      <button class="co-close" onclick="closeCheckout()">✕</button>
    </div>

    <div class="co-body">
      <!-- Order summary -->
      <div class="co-section">
        <div class="co-section-label am">🛍️ ምርቶች</div>
        <div class="co-items-list">${itemsHTML}</div>
        <div class="co-total am">ጠቅላላ: <strong>${formatPrice(total)}</strong></div>
      </div>

      <!-- Shipping -->
      <div class="co-section">
        <div class="co-section-label am">🚚 የመላኪያ ቦታ</div>
        <select class="form-control am" id="co-city">
          <option value="">-- ከተማ ይምረጡ --</option>
          ${cityOptions}
        </select>
        <input class="form-control am" id="co-location" type="text"
               placeholder="ልዩ ቦታ (Specific Location)" style="margin-top:10px;">
      </div>

      <!-- Payment -->
      <div class="co-section">
        <div class="co-section-label am">💳 የክፍያ ዘዴ</div>
        <div class="co-payment-methods">${paymentMethods}</div>
        <div class="co-account-box" id="co-account-box" style="display:none">
          <span class="co-account-num am" id="co-account-num"></span>
          <button class="co-copy-btn am" onclick="copyAccountNumber()">📋 ቅዳ</button>
        </div>
      </div>

      <!-- Receipt Upload -->
      <div class="co-section">
        <div class="co-section-label am">📎 የክፍያ ደረሰኝ ስዕል አያይዙ</div>
        <div class="co-drop-zone" id="co-drop-zone"
             onclick="document.getElementById('co-file-input').click()"
             ondragover="event.preventDefault();this.classList.add('drag-over')"
             ondragleave="this.classList.remove('drag-over')"
             ondrop="handleReceiptDrop(event)">
          <span class="drop-icon" id="co-drop-icon">📤</span>
          <div class="drop-text am" id="co-drop-text">ፎቶ ይጎትቱ ወይም ጠቅ ያድርጉ<br><span class="drop-hint">PNG / JPG · ከፍተኛ 1MB</span></div>
        </div>
        <input type="file" id="co-file-input" accept="image/*" style="display:none"
               onchange="handleReceiptFile(this.files[0])">
        <div class="co-preview-wrap" id="co-preview-wrap" style="display:none">
          <img id="co-preview-img" class="co-preview-img" src="" alt="receipt">
          <button class="co-remove-receipt am" onclick="removeReceipt()">✕ አስወግድ</button>
        </div>
        <div class="co-file-error am" id="co-file-error" style="display:none">ፋይሉ ከ1MB መብለጥ የለበትም</div>
      </div>

      <button class="btn-primary am co-submit-btn" onclick="submitCheckout()">
        ✅ ትዕዛዝ አስቀምጥ
      </button>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (!overlay) return;

  // If no receipt was attached, save as "pending_receipt"
  const previewWrap = document.getElementById('co-preview-wrap');
  const hasReceipt  = previewWrap && previewWrap.style.display !== 'none';

  if (!hasReceipt && _checkoutItems.length) {
    const city     = (document.getElementById('co-city') || {}).value || '';
    const location = (document.getElementById('co-location') || {}).value || '';
    const pay      = document.querySelector('input[name="payMethod"]:checked');
    const payVal   = pay ? pay.value : '';

    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      items: _checkoutItems,
      total: _checkoutItems.reduce((s, i) => s + i.price * i.qty, 0),
      status: 'pending_receipt',
      date: new Date().toISOString(),
      customer: {
        name: state.user.name,
        phone: state.user.phone,
        location: city ? (city + (location ? ' – ' + location : '')) : location
      },
      paymentMethod: payVal,
      receipt: null
    };
    state.orders.push(order);
    saveOrders();
    _removeCheckoutItemsFromCart();
    showToast('ደረሰኝ እባክዎ ያያይዙ 📎');
    navigate('orders');
  }

  overlay.classList.remove('open');
  document.body.style.overflow = '';
  _checkoutItems = [];
  _checkoutSingleIdx = null;
}

function _removeCheckoutItemsFromCart() {
  if (_checkoutSingleIdx !== null) {
    state.cart.splice(_checkoutSingleIdx, 1);
  } else {
    state.cart = [];
  }
  saveCart();
}

function onPaymentMethodChange(key) {
  const box    = document.getElementById('co-account-box');
  const numEl  = document.getElementById('co-account-num');
  const info   = PAYMENT_ACCOUNTS[key];
  if (!box || !numEl || !info) return;
  numEl.textContent = info.number;
  box.style.display = 'flex';
}

function copyAccountNumber() {
  const numEl = document.getElementById('co-account-num');
  if (!numEl) return;
  navigator.clipboard.writeText(numEl.textContent).then(() => {
    showToast('ቁጥሩ ተቀድቷል ✅');
  }).catch(() => {
    showToast(numEl.textContent);
  });
}

// ---- Receipt Handling (checkout overlay) ----
let _receiptDataUrl = null;

function handleReceiptDrop(e) {
  e.preventDefault();
  const zone = document.getElementById('co-drop-zone');
  if (zone) zone.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) handleReceiptFile(file);
}

function handleReceiptFile(file) {
  const errEl = document.getElementById('co-file-error');
  if (!file) return;
  if (file.size > 1024 * 1024) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const reader = new FileReader();
  reader.onload = (ev) => {
    _receiptDataUrl = ev.target.result;
    const wrap   = document.getElementById('co-preview-wrap');
    const img    = document.getElementById('co-preview-img');
    const zone   = document.getElementById('co-drop-zone');
    const dropIcon = document.getElementById('co-drop-icon');
    const dropText = document.getElementById('co-drop-text');
    if (img)  img.src = _receiptDataUrl;
    if (wrap) wrap.style.display = 'flex';
    if (zone) zone.style.borderColor = 'var(--clr-accent)';
    if (dropIcon) dropIcon.textContent = '✅';
    if (dropText) dropText.innerHTML = '<span class="am" style="color:var(--clr-accent);font-weight:700">ደረሰኝ ተያይዟል ✅</span>';
  };
  reader.readAsDataURL(file);
}

function removeReceipt() {
  _receiptDataUrl = null;
  const wrap    = document.getElementById('co-preview-wrap');
  const img     = document.getElementById('co-preview-img');
  const zone    = document.getElementById('co-drop-zone');
  const dropIcon = document.getElementById('co-drop-icon');
  const dropText = document.getElementById('co-drop-text');
  if (wrap) wrap.style.display = 'none';
  if (img)  img.src = '';
  if (zone) zone.style.borderColor = '';
  if (dropIcon) dropIcon.textContent = '📤';
  if (dropText) dropText.innerHTML = 'ፎቶ ይጎትቱ ወይም ጠቅ ያድርጉ<br><span class="drop-hint">PNG / JPG · ከፍተኛ 1MB</span>';
  const fi = document.getElementById('co-file-input');
  if (fi) fi.value = '';
}

async function submitCheckout() {
  const city    = (document.getElementById('co-city') || {}).value;
  const locVal  = (document.getElementById('co-location') || {}).value || '';
  const payEl   = document.querySelector('input[name="payMethod"]:checked');

  if (!city) { showToast('እባክዎ ከተማ ይምረጡ'); return; }
  if (!payEl) { showToast('እባክዎ የክፍያ ዘዴ ይምረጡ'); return; }
  if (!_receiptDataUrl) { showToast('እባክዎ ደረሰኝ ስዕሉን ያያይዙ'); return; }

  const cityLabel = SHIPPING_CITIES.find(c => c.value === city)?.label || city;
  const fullLoc   = cityLabel + (locVal ? ' – ' + locVal : '');

  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    items: _checkoutItems,
    total: _checkoutItems.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'pending',
    date: new Date().toISOString(),
    customer: {
      name: state.user.name,
      phone: state.user.phone,
      location: fullLoc
    },
    paymentMethod: payEl.value,
    receipt: _receiptDataUrl
  };

  state.orders.push(order);
  saveOrders();
  _removeCheckoutItemsFromCart();
  await sendOrderToTelegram(order);

  // Close overlay cleanly (skip the interrupted-save path)
  _checkoutItems = [];
  _checkoutSingleIdx = null;
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';

  showToast(t('order_sent'));
  navigate('orders');
}

// -------- Receipt Upload for Pending Orders (Orders tab) --------
function openReceiptUploadModal(orderId) {
  const overlay = document.getElementById('receipt-modal-overlay');
  const modal   = document.getElementById('receipt-modal');
  if (!overlay || !modal) return;

  modal.innerHTML = `
    <div class="co-header">
      <div class="co-title am">ደረሰኝ አያይዙ</div>
      <button class="co-close" onclick="closeReceiptModal()">✕</button>
    </div>
    <div class="co-body" style="padding:20px">
      <div class="co-drop-zone" id="rmu-drop-zone"
           onclick="document.getElementById('rmu-file').click()"
           ondragover="event.preventDefault();this.classList.add('drag-over')"
           ondragleave="this.classList.remove('drag-over')"
           ondrop="handleRmuDrop(event,'${orderId}')">
        <span class="drop-icon" id="rmu-drop-icon">📤</span>
        <div class="drop-text am" id="rmu-drop-text">ፎቶ ይጎትቱ ወይም ጠቅ ያድርጉ<br><span class="drop-hint">PNG / JPG · ከፍተኛ 1MB</span></div>
      </div>
      <input type="file" id="rmu-file" accept="image/*" style="display:none"
             onchange="handleRmuFile(this.files[0],'${orderId}')">
      <div class="co-preview-wrap" id="rmu-preview-wrap" style="display:none">
        <img id="rmu-preview-img" class="co-preview-img" src="" alt="receipt">
      </div>
      <div class="co-file-error am" id="rmu-file-error" style="display:none">ፋይሉ ከ1MB መብለጥ የለበትም</div>
      <button class="btn-primary am" style="width:100%;margin-top:16px"
              onclick="submitReceiptForOrder('${orderId}')">✅ ደረሰኝ አስቀምጥ</button>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReceiptModal() {
  const overlay = document.getElementById('receipt-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  _rmuDataUrl = null;
}

let _rmuDataUrl = null;

function handleRmuDrop(e, orderId) {
  e.preventDefault();
  const zone = document.getElementById('rmu-drop-zone');
  if (zone) zone.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) handleRmuFile(file, orderId);
}

function handleRmuFile(file, orderId) {
  const errEl = document.getElementById('rmu-file-error');
  if (!file) return;
  if (file.size > 1024 * 1024) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const reader = new FileReader();
  reader.onload = (ev) => {
    _rmuDataUrl = ev.target.result;
    const wrap     = document.getElementById('rmu-preview-wrap');
    const img      = document.getElementById('rmu-preview-img');
    const zone     = document.getElementById('rmu-drop-zone');
    const dropIcon = document.getElementById('rmu-drop-icon');
    const dropText = document.getElementById('rmu-drop-text');
    if (img)  img.src = _rmuDataUrl;
    if (wrap) wrap.style.display = 'flex';
    if (zone) zone.style.borderColor = '#22c55e';
    if (dropIcon) dropIcon.textContent = '✅';
    if (dropText) dropText.innerHTML = '<span class="am" style="color:var(--clr-accent);font-weight:700">ደረሰኝ ተያይዟል ✅</span>';
  };
  reader.readAsDataURL(file);
}

function submitReceiptForOrder(orderId) {
  if (!_rmuDataUrl) { showToast('እባክዎ ደረሰኝ ስዕሉን ያያይዙ'); return; }

  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.receipt = _rmuDataUrl;
    order.status  = 'pending'; // upgrade from pending_receipt
    saveOrders();
  }
  closeReceiptModal();
  showToast('ደረሰኝ ተቀብሏል ✅');
  renderOrders();
}

// -------- Patch renderOrders to handle pending_receipt status --------
// Override renderOrders defined earlier
function renderOrders() {
  const screen = document.getElementById('orders-content');
  if (!screen) return;
  if (!state.orders.length) {
    screen.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">📦</div>
        <div class="empty-title am">${t('no_orders')}</div>
        <div class="empty-sub am">${t('no_orders_sub')}</div>
        <button class="btn-primary am" onclick="navigate('home')">${t('shop_now')}</button>
      </div>`;
    return;
  }

  const statusMap = {
    pending: t('pending'), processing: t('processing'), delivered: t('delivered'),
    pending_receipt: state.lang === 'am' ? '⚠️ ደረሰኝ ጠፍቷል' : '⚠️ Receipt Missing'
  };

  screen.innerHTML = state.orders.slice().reverse().map(o => {
    const isPendingReceipt = o.status === 'pending_receipt';
    const warningHTML = isPendingReceipt ? `
      <div class="order-pending-receipt-warn am">
        ⚠️ Please upload your payment receipt / ባክዎን ክፍያ የከፈሉበትን ደረሰኝ ያስገቡ
      </div>
      <button class="order-upload-receipt-btn am" onclick="openReceiptUploadModal('${o.id}')">
        📎 Upload Receipt / ደረሰኝ አያይዙ
      </button>` : '';
    return `
    <div class="order-card${isPendingReceipt ? ' order-card--warn' : ''}" id="ocard-${o.id}">
      <div class="order-top">
        <span class="order-id">#${o.id}</span>
        <span class="order-status ${isPendingReceipt ? 'pending_receipt' : o.status}">
          ${statusMap[o.status] || o.status}
        </span>
      </div>
      <div class="order-name am">${o.items.map(i => i.name).join(', ')}</div>
      <div class="order-price">${formatPrice(o.total)}</div>
      ${o.customer?.location ? `<div class="order-date">📍 ${o.customer.location}</div>` : ''}
      ${o.paymentMethod ? `<div class="order-date">💳 ${PAYMENT_ACCOUNTS[o.paymentMethod]?.label || o.paymentMethod}</div>` : ''}
      <div class="order-date">📅 ${new Date(o.date).toLocaleDateString('am-ET')}</div>
      ${warningHTML}
    </div>`;
  }).join('');
}

// -------- Patch quickOrder and cart buy buttons to use checkout overlay --------
// Override quickOrder to open checkout instead of directly placing order
async function quickOrder(id) {
  if (!isAuthenticated()) {
    closeModal();
    openAuthModal();
    return;
  }
  const color = state.selectedColor;
  closeModal();
  addToCart(id, color);
  const idx = state.cart.findIndex(x => x.id === id && x.color === (color || null));
  openCheckout(idx >= 0 ? idx : undefined);
}
