// ============================================================
//  EWN HLM - እውን ህልም  | Main App Logic
//  Stack: GitHub Pages + Firebase + Telegram Bot
// ============================================================

// ---- FIREBASE CONFIG (replace with your project) ----
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ---- TELEGRAM BOT CONFIG ----
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID   = "YOUR_CHAT_ID";  // Admin channel/group ID

// ============================================================
//  TRANSLATIONS
// ============================================================
const i18n = {
  am: {
    home: "መነሻ", cart: "ጋሪ", orders: "ትዕዛዞች", profile: "መገለጫ",
    search: "ምርቶችን ይፈልጉ...", location: "አካባቢ", getting_location: "አካባቢዎን እያገኘን...",
    categories: "ምድቦች", all: "ሁሉም", electronics: "ኤሌክትሮኒክስ",
    fashion: "ፋሽን", home_cat: "ቤት", food: "ምግብ", beauty: "ውበት",
    special_offers: "ልዩ ቅናሾች", featured: "ተመረጡ ምርቶች",
    see_all: "ሁሉንም ይዩ", add_to_cart: "ጋሪ ውስጥ ጨምር", order_now: "አሁን ትዕዛዝ",
    etb: "ብር", seller: "ሻጭ", condition: "ሁኔታ",
    cart_empty: "ጋሪዎ ባዶ ነው", cart_empty_sub: "ምርቶችን ጠቅ አድርጎ ጋሪ ያስገቡ",
    cart_total: "ጠቅላላ", checkout: "ትዕዛዝ ያስቀምጡ",
    no_orders: "ምንም ትዕዛዝ የለም", no_orders_sub: "ትዕዛዝ ሲሰጡ እዚህ ይታያል",
    shop_now: "አሁን ይሸምቱ", my_likes: "ወዳጆቼ",
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
    app_tagline: "እውን ሕልም - ሕልምዎ እውን የሚሆንበት የዲጂታል ገበያ!!"
  },
  en: {
    home: "Home", cart: "Cart", orders: "Orders", profile: "Profile",
    search: "Search products...", location: "Location", getting_location: "Getting your location...",
    categories: "Categories", all: "All", electronics: "Electronics",
    fashion: "Fashion", home_cat: "Home", food: "Food", beauty: "Beauty",
    special_offers: "Special Offers", featured: "Featured Products",
    see_all: "See All", add_to_cart: "Add to Cart", order_now: "Order Now",
    etb: "ETB", seller: "Seller", condition: "Condition",
    cart_empty: "Your cart is empty", cart_empty_sub: "Tap products to add them to cart",
    cart_total: "Total", checkout: "Place Order",
    no_orders: "No orders yet", no_orders_sub: "Your orders will appear here",
    shop_now: "Shop Now", my_likes: "My Favorites",
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
    app_tagline: "Ewn Hlm - Your Digital Market Where Dreams Come True!!"
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
  user: JSON.parse(localStorage.getItem('ewn_user') || '{"name":"Daniel","phone":"0932208224"}'),
  searchQuery: ''
};

// ============================================================
//  UTILITIES
// ============================================================
const t = (key) => (i18n[state.lang] || i18n.am)[key] || key;

function formatPrice(n) {
  return n.toLocaleString('am-ET') + ' ' + t('etb');
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

function updateCartBadge() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
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
${order.items.map(i => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n')}

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
//  LOAD PRODUCTS
// ============================================================
async function loadProducts() {
  try {
    // In production, load from Firebase Realtime DB:
    // const snap = await fetch(`${FIREBASE_CONFIG.databaseURL}/products.json`);
    // state.products = Object.values(await snap.json());
    
    const res = await fetch('./products.json');
    state.products = await res.json();
  } catch {
    // Fallback sample
    state.products = [];
  }
  filterProducts();
  renderProducts();
}

// ============================================================
//  RENDER FUNCTIONS
// ============================================================

function renderCategories() {
  const cats = [
    { id: 'all', emoji: '🛍️', label: t('all') },
    { id: 'electronics', emoji: '📱', label: t('electronics') },
    { id: 'fashion', emoji: '👗', label: t('fashion') },
    { id: 'home', emoji: '🏠', label: t('home_cat') },
    { id: 'food', emoji: '🍔', label: t('food') },
    { id: 'beauty', emoji: '💄', label: t('beauty') }
  ];
  const wrap = document.getElementById('categories-scroll');
  wrap.innerHTML = cats.map(c => `
    <button class="cat-chip${state.activeCategory === c.id ? ' active' : ''}"
            onclick="selectCategory('${c.id}')">
      <span class="emoji">${c.emoji}</span>
      <span class="label">${c.label}</span>
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

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!state.filteredProducts.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:30px 0; text-align:center; font-family:var(--font-am); color:var(--text-secondary)">
      ምንም ምርት አልተገኘም
    </div>`;
    return;
  }
  const isAm = state.lang === 'am';
  grid.innerHTML = state.filteredProducts.map(p => {
    const liked = state.likes.includes(p.id);
    const name = isAm && p.nameAm ? p.nameAm : p.name;
    const desc = isAm && p.descriptionAm ? p.descriptionAm : p.description;
    return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${name}" loading="lazy">
        <button class="like-btn${liked ? ' liked' : ''}" onclick="toggleLike(event,'${p.id}')">
          ${liked ? '❤️' : '🤍'}
        </button>
        <span class="img-count">📷 1</span>
      </div>
      <div class="product-info">
        <div class="product-name am">${name}</div>
        <div class="product-desc">${desc}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
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
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  screen.innerHTML = `
    ${state.cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name am">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart('${item.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `).join('')}
    <div class="cart-footer">
      <div class="cart-total-row">
        <span class="cart-total-label am">${t('cart_total')}</span>
        <span class="cart-total-val">${formatPrice(total)}</span>
      </div>
      <button class="btn-primary am" style="width:100%" onclick="placeOrder()">
        ${t('checkout')}
      </button>
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
      <div class="order-name am">${o.items.map(i=>i.name).join(', ')}</div>
      <div class="order-price">${formatPrice(o.total)}</div>
      <div class="order-date">📅 ${new Date(o.date).toLocaleDateString('am-ET')}</div>
    </div>
  `).join('');
}

function renderProfile() {
  const nameEl = document.getElementById('profile-name');
  const phoneEl = document.getElementById('profile-phone');
  if (nameEl) nameEl.textContent = state.user.name;
  if (phoneEl) phoneEl.textContent = state.user.phone;
  
  // Sync theme toggle
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.classList.toggle('on', state.theme === 'dark');
  }

  // Update all translated labels
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

function renderLikes() {
  const screen = document.getElementById('likes-content');
  if (!screen) return;
  const liked = state.products.filter(p => state.likes.includes(p.id));
  screen.innerHTML = `<div class="screen-title am">${t('my_likes')}</div>`;
  if (!liked.length) {
    screen.innerHTML += `<div class="empty-state"><div class="empty-emoji">🤍</div>
      <div class="empty-title am">ወዳጅ ምርቶች የሉም</div></div>`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'products-grid';
  const isAm = state.lang === 'am';
  grid.innerHTML = liked.map(p => `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="like-btn liked" onclick="toggleLike(event,'${p.id}')">❤️</button>
      </div>
      <div class="product-info">
        <div class="product-name am">${isAm && p.nameAm ? p.nameAm : p.name}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
      </div>
    </div>`).join('');
  screen.appendChild(grid);
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
  state.currentScreen = screen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const screenEl = document.getElementById(`screen-${screen}`);
  if (screenEl) screenEl.classList.add('active');
  
  const navEl = document.querySelector(`[data-nav="${screen}"]`);
  if (navEl) navEl.classList.add('active');

  // Show/hide header
  const header = document.getElementById('main-header');
  if (header) header.style.display = (screen === 'home') ? 'block' : 'none';

  // Render screen content
  if (screen === 'cart') renderCart();
  if (screen === 'orders') renderOrders();
  if (screen === 'profile') renderProfile();
  if (screen === 'likes') renderLikes();

  window.scrollTo(0, 0);
}

function openProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const isAm = state.lang === 'am';
  const name = isAm && p.nameAm ? p.nameAm : p.name;
  const desc = isAm && p.descriptionAm ? p.descriptionAm : p.description;
  
  const modal = document.getElementById('product-modal');
  modal.innerHTML = `
    <div class="modal-sheet" style="position:relative">
      <img class="modal-img" src="${p.image}" alt="${name}">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-body">
        <div class="modal-name am">${name}</div>
        <div class="modal-price">${formatPrice(p.price)}</div>
        <div class="modal-desc am">${desc}</div>
        <div class="modal-seller">
          <span class="modal-seller-icon">🏪</span>
          <div>
            <div style="font-size:11px;color:var(--text-secondary)">${t('seller')}</div>
            <div class="modal-seller-name">${p.seller || 'ሻጭ'}</div>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn-cart am" onclick="addToCart('${p.id}');closeModal()">${t('add_to_cart')}</button>
          <button class="btn-order am" onclick="quickOrder('${p.id}')">${t('order_now')}</button>
        </div>
      </div>
    </div>`;
  
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
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

function addToCart(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(x => x.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const isAm = state.lang === 'am';
    state.cart.push({
      id: p.id,
      name: isAm && p.nameAm ? p.nameAm : p.name,
      price: p.price,
      image: p.image,
      qty: 1
    });
  }
  saveCart();
  showToast(t('added_cart'));
}

function changeQty(id, delta) {
  const item = state.cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(x => x.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(x => x.id !== id);
  saveCart();
  renderCart();
}

async function placeOrder() {
  if (!state.cart.length) return;
  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    items: [...state.cart],
    total: state.cart.reduce((s, i) => s + i.price * i.qty, 0),
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
  state.cart = [];
  saveCart();
  await sendOrderToTelegram(order);
  // TODO: also write to Firebase:
  // await fetch(`${FIREBASE_CONFIG.databaseURL}/orders/${order.id}.json`, { method:'PUT', body:JSON.stringify(order) });
  showToast(t('order_sent'));
  navigate('orders');
}

async function quickOrder(id) {
  closeModal();
  addToCart(id);
  await placeOrder();
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
  // Re-render everything
  renderCategories();
  filterProducts();
  renderProducts();
  renderProfile();
  // Update lang chips
  document.querySelectorAll('.lang-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // Splash → App
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    const app = document.getElementById('app');
    app.classList.add('visible');
    loadProducts();
    navigate('home');
    updateCartBadge();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  }, 2200);

  // Location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const locText = document.getElementById('location-text');
      if (locText) locText.textContent = 'አዲስ አበባ, ኢትዮጵያ';
    }, () => {
      const locText = document.getElementById('location-text');
      if (locText) locText.textContent = 'አዲስ አበባ, ኢትዮጵያ';
    });
  }
});

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
