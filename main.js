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
    buy_item: "አሁን ግዛ",
    // Checkout
    checkout_title: "ትዕዛዝ ያስቀምጡ",
    co_summary: "📋 የትዕዛዝ ማጠቃለያ / SUMMARY",
    co_item: "ዕቃ ስም",
    co_qty: "ብዛት",
    co_price: "ሒሳብ",
    co_delivery: "ማድረሻ",
    co_total: "TOTAL COST",
    co_name: "ሙሉ ስም *",
    co_phone: "ስልክ ቁጥር *",
    co_payment: "የክፍያ ዘዴ *",
    co_region: "ክልል *",
    co_address: "አድራሻ *",
    co_account_label: "ℹ️ ቴሌብር የንግድ ስልክ (MERCHANT ACCOUNT)",
    co_receipt: "ደረሰኝ ቅጽበታዊ ገጽ *",
    co_receipt_hint: "ደረሰኝ ፎቶ ይጎትቱ ወይም ይምረጡ (ከፍ. 1ሜባ)",
    co_receipt_valid: "✅ ደረሰኝ ተቀብሏል!",
    co_receipt_large: "❌ ፋይሉ በጣም ትልቅ ነው። ከ1ሜባ ያነስ ይምረጡ።",
    co_receipt_type: "❌ ምስል ብቻ ይጫኑ (JPG, PNG, WEBP)",
    co_complete: "ትዕዛዝ ጨርስ 🚀",
    co_back: "←",
    co_copy: "ቅዳ",
    co_copied: "✓ ተቅዷል",
    co_region_aa: "አዲስ አበባ",
    co_region_other: "ሌላ ክልል",
    co_sending: "እየተላከ...",
    co_fill_fields: "እባክዎ ሁሉንም መስኮች ይሙሉ",
    co_upload_receipt: "እባክዎ ደረሰኝ ያስገቡ",
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
    buy_item: "Buy Now",
    // Checkout
    checkout_title: "Place Order",
    co_summary: "📋 ORDER SUMMARY",
    co_item: "Item",
    co_qty: "Qty",
    co_price: "Price",
    co_delivery: "Delivery",
    co_total: "TOTAL COST",
    co_name: "Full Name *",
    co_phone: "Phone Number *",
    co_payment: "Payment Method *",
    co_region: "Region *",
    co_address: "Address *",
    co_account_label: "ℹ️ Merchant Account Number",
    co_receipt: "Receipt Screenshot *",
    co_receipt_hint: "Drag & drop or tap to upload receipt (max 1MB)",
    co_receipt_valid: "✅ Receipt accepted!",
    co_receipt_large: "❌ File too large. Please choose a file under 1MB.",
    co_receipt_type: "❌ Images only (JPG, PNG, WEBP)",
    co_complete: "Complete Order 🚀",
    co_back: "←",
    co_copy: "COPY",
    co_copied: "✓ COPIED",
    co_region_aa: "Addis Ababa",
    co_region_other: "Other Region",
    co_sending: "Sending...",
    co_fill_fields: "Please fill in all fields",
    co_upload_receipt: "Please upload your receipt",
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
        <button class="cart-item-buy-btn am" onclick="openCheckoutModal(${idx})">
          ${t('buy_item')} →
        </button>
      </div>
    </div>`;
  }).join('');

  // Cart footer with total and full-cart checkout
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  screen.innerHTML += `
    <div class="cart-footer" style="padding:16px;border-top:1px solid var(--border);margin-top:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:14px;color:var(--text-secondary);font-family:var(--font-am)">${t('cart_total')}</span>
        <span style="font-size:18px;font-weight:800;color:var(--clr-accent)">${formatPrice(total)}</span>
      </div>
      <button class="btn-primary am" style="width:100%" onclick="openCheckoutModal()">${t('checkout')}</button>
    </div>`;
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
  const idx = state.cart.findIndex(x => x.id === id && x.color === (color || null));
  openCheckoutModal(idx >= 0 ? idx : undefined);
}

// ============================================================
//  CHECKOUT MODAL
// ============================================================

const PAYMENT_METHODS = [
  { id: 'telebirr', emoji: '📱', nameAm: 'ቴሌብር', nameEn: 'Telebirr', account: '0932208224' },
  { id: 'cbe',      emoji: '🏦', nameAm: 'ንግድ ባንክ (CBE)', nameEn: 'CBE (Commercial Bank)', account: '1000123456789' },
  { id: 'abyssinia',emoji: '🏦', nameAm: 'አቢሲኒያ ባንክ', nameEn: 'Bank of Abyssinia', account: '40987654321' },
];

let _checkoutCartIdx = undefined; // undefined = full cart, number = single item
let _checkoutReceiptFile = null;
let _checkoutSelectedPayment = 'telebirr';

function openCheckoutModal(cartIdx) {
  if (!isAuthenticated()) { openAuthModal(); return; }
  _checkoutCartIdx = cartIdx;
  _checkoutReceiptFile = null;
  _checkoutSelectedPayment = 'telebirr';

  // Build items list
  let items;
  if (cartIdx !== undefined) {
    const item = state.cart[cartIdx];
    if (!item) return;
    items = [item];
  } else {
    if (!state.cart.length) return;
    items = [...state.cart];
  }
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const isAm = state.lang === 'am';

  // Summary rows
  const summaryRows = items.map(i =>
    `<div class="checkout-summary-row">
      <span>${i.name}${i.color ? ` <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i.color};vertical-align:middle"></span>` : ''} × ${i.qty}</span>
      <span>${formatPrice(i.price * i.qty)}</span>
    </div>`
  ).join('');

  // Payment options
  const paymentOptions = PAYMENT_METHODS.map(pm => `
    <label class="co-payment-option${pm.id === _checkoutSelectedPayment ? ' selected' : ''}" onclick="selectCheckoutPayment('${pm.id}')">
      <input type="radio" name="co_payment" value="${pm.id}" ${pm.id === _checkoutSelectedPayment ? 'checked' : ''}>
      <div class="co-payment-logo">${pm.emoji}</div>
      <div>
        <div class="co-payment-name">${isAm ? pm.nameAm : pm.nameEn}</div>
      </div>
    </label>`).join('');

  const activeMethod = PAYMENT_METHODS.find(m => m.id === _checkoutSelectedPayment);

  const regionOptions = isAm
    ? `<option value="aa">${t('co_region_aa')}</option><option value="other">${t('co_region_other')}</option>`
    : `<option value="aa">${t('co_region_aa')}</option><option value="other">${t('co_region_other')}</option>`;

  document.getElementById('checkout-overlay').innerHTML = `
    <div class="checkout-modal">
      <button class="checkout-close" onclick="closeCheckoutModal()">✕</button>
      <div class="checkout-title">${t('checkout_title')}</div>

      <div class="co-grid">

        <!-- Row 1: Summary (full width) -->
        <div class="co-g-summary checkout-summary">
          <div class="checkout-summary-title">${t('co_summary')}</div>
          ${summaryRows}
          <div class="checkout-total-row">
            <span>${t('co_total')}</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>

        <!-- Row 2: Name | Phone | Region -->
        <div class="co-g-name co-field">
          <label class="co-label">${t('co_name')}</label>
          <input class="co-input" id="co-name" type="text" value="${state.user?.name || ''}" placeholder="${isAm ? 'ዳንኤል አበበ' : 'Daniel Abebe'}">
        </div>
        <div class="co-g-phone co-field">
          <label class="co-label">${t('co_phone')}</label>
          <input class="co-input" id="co-phone" type="tel" value="${state.user?.phone || ''}" placeholder="09xxxxxxxx">
        </div>
        <div class="co-g-region co-field">
          <label class="co-label">${t('co_region')}</label>
          <select class="co-input" id="co-region">
            <option value="aa">${t('co_region_aa')}</option>
            <option value="other">${t('co_region_other')}</option>
          </select>
        </div>

        <!-- Row 3: Payment (col 1-2) | Account box (col 3) -->
        <div class="co-g-payment co-field">
          <label class="co-label">${t('co_payment')}</label>
          <div class="co-payment-methods">${paymentOptions}</div>
        </div>
        <div class="co-g-account">
          <div class="co-account-box visible" id="co-account-box">
            <div class="co-account-label">${t('co_account_label')}</div>
            <div class="co-account-number-row">
              <div class="co-account-number" id="co-account-number">${activeMethod.account}</div>
              <button class="co-copy-btn" id="co-copy-btn" onclick="copyAccountNumber()">${t('co_copy')}</button>
            </div>
          </div>
        </div>

        <!-- Row 4: Receipt (col 1-2) | Buttons (col 3) -->
        <div class="co-g-receipt co-field">
          <label class="co-label">${t('co_receipt')}</label>
          <div class="co-receipt-upload" id="co-receipt-zone">
            <input type="file" class="co-receipt-input" id="co-receipt-input"
              accept="image/*" onchange="handleReceiptUpload(this)">
            <div class="co-receipt-icon">🖼️</div>
            <div class="co-receipt-text" id="co-receipt-text">${t('co_receipt_hint')}</div>
            <div class="co-receipt-status" id="co-receipt-status"></div>
          </div>
        </div>
        <div class="co-g-actions">
          <div style="font-size:10px;color:var(--text-secondary);font-family:var(--font-am)">${t('co_address')}</div>
          <input class="co-input" id="co-address" type="text" placeholder="${isAm ? 'ቦሌ፣ ቀበሌ 12...' : 'Bole, Kebele 12...'}">
          <button class="co-back-btn" onclick="closeCheckoutModal()">${t('co_back')}</button>
          <button class="co-submit-btn" id="co-submit-btn" onclick="submitCheckout()">${t('co_complete')}</button>
        </div>

      </div>
    </div>`;

  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function selectCheckoutPayment(id) {
  _checkoutSelectedPayment = id;
  document.querySelectorAll('.co-payment-option').forEach(el => {
    el.classList.toggle('selected', el.querySelector('input').value === id);
  });
  const method = PAYMENT_METHODS.find(m => m.id === id);
  if (method) {
    const numEl = document.getElementById('co-account-number');
    if (numEl) numEl.textContent = method.account;
    const box = document.getElementById('co-account-box');
    if (box) box.classList.add('visible');
    // Reset copy button
    const btn = document.getElementById('co-copy-btn');
    if (btn) { btn.textContent = t('co_copy'); btn.classList.remove('copied'); }
  }
}

function copyAccountNumber() {
  const method = PAYMENT_METHODS.find(m => m.id === _checkoutSelectedPayment);
  if (!method) return;
  navigator.clipboard.writeText(method.account).catch(() => {});
  const btn = document.getElementById('co-copy-btn');
  if (btn) {
    btn.textContent = t('co_copied');
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = t('co_copy');
      btn.classList.remove('copied');
    }, 2000);
  }
}

function handleReceiptUpload(input) {
  const file = input.files[0];
  const zone = document.getElementById('co-receipt-zone');
  const status = document.getElementById('co-receipt-status');
  const text = document.getElementById('co-receipt-text');

  if (!file) { _checkoutReceiptFile = null; return; }

  if (!file.type.startsWith('image/')) {
    zone.className = 'co-receipt-upload invalid';
    status.textContent = t('co_receipt_type');
    _checkoutReceiptFile = null;
    return;
  }
  if (file.size > 1024 * 1024) {
    zone.className = 'co-receipt-upload invalid';
    status.textContent = t('co_receipt_large');
    _checkoutReceiptFile = null;
    return;
  }

  _checkoutReceiptFile = file;
  zone.className = 'co-receipt-upload valid';
  text.textContent = file.name;
  status.textContent = t('co_receipt_valid');
}

async function submitCheckout() {
  const name = document.getElementById('co-name')?.value.trim();
  const phone = document.getElementById('co-phone')?.value.trim();
  const region = document.getElementById('co-region')?.value;
  const address = document.getElementById('co-address')?.value.trim();

  if (!name || !phone || !address) {
    showToast(t('co_fill_fields'));
    return;
  }
  if (!_checkoutReceiptFile) {
    showToast(t('co_upload_receipt'));
    return;
  }

  const btn = document.getElementById('co-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('co_sending'); }

  let items;
  if (_checkoutCartIdx !== undefined) {
    items = [{ ...state.cart[_checkoutCartIdx] }];
  } else {
    items = [...state.cart];
  }
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const method = PAYMENT_METHODS.find(m => m.id === _checkoutSelectedPayment);

  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    items,
    total,
    status: 'pending',
    date: new Date().toISOString(),
    customer: { name, phone, location: address, region },
    paymentMethod: method ? (state.lang === 'am' ? method.nameAm : method.nameEn) : _checkoutSelectedPayment
  };

  state.orders.push(order);
  saveOrders();

  if (_checkoutCartIdx !== undefined) {
    state.cart.splice(_checkoutCartIdx, 1);
  } else {
    state.cart = [];
  }
  saveCart();

  await sendOrderToTelegram(order);
  closeCheckoutModal();
  showToast(t('order_sent'));
  navigate('orders');
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
