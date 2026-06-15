/* =====================================================================
   Ewn Hlm – main.js  v2.1
   Changes:
   1. Login-first flow  (auth page shown before app)
   2. Login ➜ phone check → PIN; SignUp ➜ phone+name+PIN+recovery
   3. Cross-link: Login↔SignUp; phone already registered ↔ not found
   4. Route guard: protected pages blocked until authenticated
   5. Location: NO direct browser prompt – banner only, 24h throttle
   6. Auth page: language toggle + dark/light toggle
   ===================================================================== */

'use strict';

/* ──────────────────────────────────────────────
   TRANSLATIONS
────────────────────────────────────────────── */
const TRANSLATIONS = {
  am: {
    home:'መነሻ', cart:'ጋሪ', orders:'ትዕዛዞቼ', profile:'መገለጫ',
    categories:'ምድቦች', see_all:'ሁሉንም ይዩ',
    banner_title:'ሕልምዎ እውን የሚሆንበት\nየዲጂታል ገበያ!!', banner_sub:'አሁን ይሸምቱ →',
    location:'አካባቢ', getting_location:'አካባቢዎን እያገኘን...',
    language:'ቋንቋ', language_sub:'ቋንቋ ይቀይሩ',
    theme:'ቀለም ገጽታ', theme_sub:'ብርሃን / ጨለማ ቅርጸት',
    help:'የእርዳታ ማዕከል', help_sub:'ድጋፍ ያግኙ',
    refer:'ወዳጅዎን ያጋሩ፣ ያትርፉ', refer_sub:'ጓደኛዎን ሳቡ ሽልማት ያግኙ',
    install_app:'አፕ ይጫኑ', install_app_sub:'ወደ ስልክዎ ያክሉ',
    logout:'ውጣ', logout_sub:'ከሂሳብዎ ይውጡ', back:'← ተመለስ',
    update_required_title:'አዲስ ዝመና ይገኛል',
    update_required_msg:'ለመቀጠል እባክዎ መተግበሪያውን ያዘምኑ',
    update_now:'አሁን ዝምኑ',
    guard_title:'ለመቀጠል ይግቡ',
    guard_sub:'ይህን ገጽ ለማየት መጀመሪያ Login ወይም SignUp ያድርጉ።',
    guard_btn:'ግባ / ይመዝገቡ',
  },
  en: {
    home:'Home', cart:'Cart', orders:'My Orders', profile:'Profile',
    categories:'Categories', see_all:'See All',
    banner_title:'Your dream marketplace\nis here!!', banner_sub:'Shop Now →',
    location:'Location', getting_location:'Getting your location...',
    language:'Language', language_sub:'Change language',
    theme:'Theme', theme_sub:'Light / Dark mode',
    help:'Help Center', help_sub:'Get support',
    refer:'Refer & Earn', refer_sub:'Invite friends, earn rewards',
    install_app:'Install App', install_app_sub:'Add to your phone',
    logout:'Logout', logout_sub:'Sign out of your account', back:'← Back',
    update_required_title:'Update Required',
    update_required_msg:'Please update the app to continue',
    update_now:'Update Now',
    guard_title:'Sign In Required',
    guard_sub:'Please log in or sign up to view this page.',
    guard_btn:'Login / Sign Up',
  }
};

const AUTH_TRANSLATIONS = {
  am: {
    login_tab:'ግባ', signup_tab:'ይመዝገቡ',
    phone_label:'ስልክ ቁጥር', name_label:'ሙሉ ስም',
    pin_label:'PIN ኮድ (4 ዓ.ቁ)', confirm_pin_label:'PIN ያረጋግጡ',
    recovery_label:'የማስታወሻ ጥያቄ', answer_label:'መልስ',
    q_birth_year:'የትውልድ ዓ.ም', q_mother:'የእናት ስም', q_city:'የተወለዱበት ከተማ',
    continue_btn:'ቀጥል', register_btn:'ይመዝገቡ',
    no_account:'አዲስ ነዎት?', go_signup:'ይመዝገቡ',
    have_account:'መለያ አለዎት?', go_login:'ይግቡ',
  },
  en: {
    login_tab:'Login', signup_tab:'Sign Up',
    phone_label:'Phone Number', name_label:'Full Name',
    pin_label:'PIN Code (4 digits)', confirm_pin_label:'Confirm PIN',
    recovery_label:'Recovery Question', answer_label:'Answer',
    q_birth_year:'Year of Birth', q_mother:"Mother's Name", q_city:'City of Birth',
    continue_btn:'Continue', register_btn:'Register',
    no_account:'New here?', go_signup:'Sign Up',
    have_account:'Have an account?', go_login:'Log In',
  }
};

/* ──────────────────────────────────────────────
   STATE
────────────────────────────────────────────── */
let currentLang = localStorage.getItem('lang') || 'am';
let isDark = localStorage.getItem('theme') === 'dark';
let currentUser = null; // { phone, name }
let loginStep = 'phone'; // 'phone' | 'pin'
let loginPhoneChecked = false;
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let likes = JSON.parse(localStorage.getItem('likes') || '[]');
let currentNav = 'home';
let deferredPwaPrompt = null;

const LOCATION_ASKED_KEY = 'loc_last_asked';
const LOCATION_SAVED_KEY = 'loc_saved';

/* ──────────────────────────────────────────────
   BOOT
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  applyAuthLangBtn();
  setupPinInputs();
  initSplash();
});

function initSplash() {
  setTimeout(() => {
    document.getElementById('splash').style.opacity = '0';
    document.getElementById('splash').style.transition = 'opacity 0.4s';
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      bootApp();
    }, 400);
  }, 1800);
}

function bootApp() {
  // Check if already logged in
  const saved = localStorage.getItem('auth_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      enterApp();
    } catch(e) {
      showAuthPage();
    }
  } else {
    showAuthPage();
  }
}

/* ──────────────────────────────────────────────
   AUTH PAGE
────────────────────────────────────────────── */
function showAuthPage() {
  document.getElementById('auth-page').style.display = 'block';
  document.getElementById('app').style.display = 'none';
  applyAuthTranslations();
}

function hideAuthPage() {
  document.getElementById('auth-page').style.display = 'none';
}

function switchAuthTab(tab) {
  clearAuthMsg();
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-signup').classList.toggle('active', tab === 'signup');

  // If switching to signup pre-fill phone from login input if exists
  if (tab === 'signup') {
    const lp = document.getElementById('login-phone').value.trim();
    if (lp) document.getElementById('signup-phone').value = lp;
  }
  if (tab === 'login') {
    // reset login step
    loginStep = 'phone';
    loginPhoneChecked = false;
    document.getElementById('login-pin-group').style.display = 'none';
    document.getElementById('login-btn').textContent = AUTH_TRANSLATIONS[currentLang].continue_btn;
  }
}

/* ----- LOGIN FLOW ----- */
function validatePhone(input) {
  // auto format
  input.value = input.value.replace(/[^0-9+]/g,'');
}

async function handleLogin() {
  const btn = document.getElementById('login-btn');
  const phone = document.getElementById('login-phone').value.trim();

  if (!phone || phone.length < 10) {
    showAuthMsg(currentLang === 'am' ? 'ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Enter a valid phone number', 'error');
    return;
  }

  if (loginStep === 'phone') {
    // Check Firebase if phone exists
    btn.disabled = true;
    btn.textContent = currentLang === 'am' ? 'እየፈተሸ...' : 'Checking...';
    try {
      const snap = await firebase.database().ref('users/' + phone).once('value');
      if (snap.exists()) {
        // Phone found → show PIN
        loginStep = 'pin';
        loginPhoneChecked = true;
        document.getElementById('login-pin-group').style.display = 'block';
        document.querySelector('.login-pin-digit').focus();
        btn.textContent = currentLang === 'am' ? 'ግባ' : 'Log In';
        clearAuthMsg();
        showAuthMsg(currentLang === 'am' ? 'PIN ያስገቡ' : 'Enter your PIN', 'info');
      } else {
        // Phone NOT found → suggest signup
        showAuthMsg(
          currentLang === 'am'
            ? 'ይህ ስልክ አልተመዘገበም። እባክዎን ይመዝገቡ።'
            : 'Phone not registered. Please sign up.',
          'error'
        );
        // Show signup switch
        setTimeout(() => switchAuthTab('signup'), 1200);
      }
    } catch(e) {
      showAuthMsg(currentLang === 'am' ? 'ስህተት ተፈጥሯል። እንደገና ይሞክሩ።' : 'Error. Please try again.', 'error');
    }
    btn.disabled = false;
    if (loginStep === 'phone') btn.textContent = AUTH_TRANSLATIONS[currentLang].continue_btn;
    return;
  }

  // Step 2: verify PIN
  const pin = getPinValue('.login-pin-digit');
  if (pin.length < 4) {
    showAuthMsg(currentLang === 'am' ? '4 ዓ.ቁ PIN ያስገቡ' : 'Enter 4-digit PIN', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = currentLang === 'am' ? 'እየተረጋገጠ...' : 'Verifying...';
  try {
    const snap = await firebase.database().ref('users/' + phone).once('value');
    const data = snap.val();
    if (data && data.pin === pin) {
      currentUser = { phone, name: data.name || phone };
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
      clearAuthMsg();
      hideAuthPage();
      enterApp();
    } else {
      showAuthMsg(currentLang === 'am' ? 'PIN ትክክል አይደለም' : 'Incorrect PIN', 'error');
    }
  } catch(e) {
    showAuthMsg(currentLang === 'am' ? 'ስህተት ተፈጥሯል። እንደገና ይሞክሩ።' : 'Error. Please try again.', 'error');
  }
  btn.disabled = false;
  btn.textContent = currentLang === 'am' ? 'ግባ' : 'Log In';
}

/* ----- SIGNUP FLOW ----- */
async function handleSignup() {
  const btn = document.getElementById('signup-btn');
  const phone = document.getElementById('signup-phone').value.trim();
  const name  = document.getElementById('signup-name').value.trim();
  const pin   = getPinValue('.signup-pin-digit');
  const pinC  = getPinValue('.signup-pin-confirm-digit');
  const recQ  = document.getElementById('signup-recovery-q').value;
  const recA  = document.getElementById('signup-recovery-a').value.trim();

  if (!phone || phone.length < 10) {
    showAuthMsg(currentLang === 'am' ? 'ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Enter a valid phone number', 'error'); return;
  }
  if (!name) {
    showAuthMsg(currentLang === 'am' ? 'ሙሉ ስምዎን ያስገቡ' : 'Enter your full name', 'error'); return;
  }
  if (pin.length < 4) {
    showAuthMsg(currentLang === 'am' ? '4 ዓ.ቁ PIN ያስገቡ' : 'Enter 4-digit PIN', 'error'); return;
  }
  if (pin !== pinC) {
    showAuthMsg(currentLang === 'am' ? 'PIN ኮዶቹ አይዛመዱም' : 'PINs do not match', 'error'); return;
  }
  if (!recA) {
    showAuthMsg(currentLang === 'am' ? 'የማስታወሻ ጥያቄ መልስ ያስገቡ' : 'Enter recovery answer', 'error'); return;
  }

  btn.disabled = true;
  btn.textContent = currentLang === 'am' ? 'እየፈተሸ...' : 'Checking...';

  try {
    // Check if phone already registered
    const snap = await firebase.database().ref('users/' + phone).once('value');
    if (snap.exists()) {
      showAuthMsg(
        currentLang === 'am'
          ? 'ይህ ስልክ ቀድሞ ተመዝግቧል። ይግቡ።'
          : 'Phone already registered. Please log in.',
        'error'
      );
      btn.disabled = false;
      btn.textContent = AUTH_TRANSLATIONS[currentLang].register_btn;
      setTimeout(() => {
        document.getElementById('login-phone').value = phone;
        switchAuthTab('login');
      }, 1200);
      return;
    }

    // Save to Firebase
    await firebase.database().ref('users/' + phone).set({
      name, pin,
      recovery: { question: recQ, answer: recA },
      createdAt: Date.now()
    });

    currentUser = { phone, name };
    localStorage.setItem('auth_user', JSON.stringify(currentUser));
    showAuthMsg(currentLang === 'am' ? 'ተመዝግበዋል! በደህና ይግቡ።' : 'Registered! Welcome.', 'success');
    setTimeout(() => { hideAuthPage(); enterApp(); }, 900);
  } catch(e) {
    showAuthMsg(currentLang === 'am' ? 'ስህተት ተፈጥሯል። እንደገና ይሞክሩ።' : 'Error. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = AUTH_TRANSLATIONS[currentLang].register_btn;
  }
}

/* ----- AUTH HELPERS ----- */
function showAuthMsg(text, type) {
  const el = document.getElementById('auth-msg');
  el.className = 'auth-msg ' + type;
  el.textContent = text;
  el.style.display = 'block';
}
function clearAuthMsg() {
  const el = document.getElementById('auth-msg');
  el.style.display = 'none';
  el.textContent = '';
}

function getPinValue(selector) {
  return Array.from(document.querySelectorAll(selector)).map(i => i.value).join('');
}

function setupPinInputs() {
  // Auto-advance PIN digits
  ['login-pin-digit', 'signup-pin-digit', 'signup-pin-confirm-digit'].forEach(cls => {
    document.querySelectorAll('.' + cls).forEach((inp, idx, arr) => {
      inp.addEventListener('input', () => {
        if (inp.value.length === 1 && idx < arr.length - 1) arr[idx+1].focus();
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) arr[idx-1].focus();
      });
    });
  });
}

/* ──────────────────────────────────────────────
   ENTER APP (after auth)
────────────────────────────────────────────── */
function enterApp() {
  document.getElementById('app').style.display = 'block';
  applyLang(currentLang);
  updateProfileUI();
  loadProducts();
  renderCart();
  checkLocationBanner();
}

function isAuthenticated() {
  return currentUser !== null;
}

function logout() {
  currentUser = null;
  localStorage.removeItem('auth_user');
  document.getElementById('app').style.display = 'none';
  // Reset login form
  loginStep = 'phone';
  loginPhoneChecked = false;
  document.getElementById('login-phone').value = '';
  document.getElementById('login-pin-group').style.display = 'none';
  document.querySelectorAll('.login-pin-digit').forEach(i => i.value = '');
  clearAuthMsg();
  switchAuthTab('login');
  showAuthPage();
}

/* ──────────────────────────────────────────────
   ROUTE GUARD
────────────────────────────────────────────── */
const PROTECTED_ROUTES = ['cart', 'orders', 'profile', 'likes', 'notifications'];

function navigate(screen) {
  if (PROTECTED_ROUTES.includes(screen) && !isAuthenticated()) {
    showRouteGuard();
    return;
  }
  hideRouteGuard();
  _doNavigate(screen);
}

function _doNavigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-nav="${screen}"]`);
  if (nav) nav.classList.add('active');
  document.getElementById('main-header').style.display = screen === 'home' ? '' : 'none';
  currentNav = screen;
  if (screen === 'cart') renderCart();
  if (screen === 'orders') renderOrders();
  if (screen === 'likes') renderLikes();
}

function showRouteGuard() {
  document.getElementById('route-guard').classList.add('show');
}
function hideRouteGuard() {
  document.getElementById('route-guard').classList.remove('show');
}

/* ──────────────────────────────────────────────
   LOCATION – BANNER ONLY (no direct prompt)
────────────────────────────────────────────── */
function checkLocationBanner() {
  // If location already saved, no need to ask
  if (localStorage.getItem(LOCATION_SAVED_KEY)) {
    const saved = JSON.parse(localStorage.getItem(LOCATION_SAVED_KEY));
    updateLocationUI(saved.label || '');
    return;
  }
  // Check 24h throttle
  const lastAsked = parseInt(localStorage.getItem(LOCATION_ASKED_KEY) || '0');
  const now = Date.now();
  if (now - lastAsked < 24 * 60 * 60 * 1000) return; // not 24h yet

  // Show banner
  showLocationBanner();
}

function showLocationBanner() {
  const banner = document.getElementById('location-banner');
  const title = document.getElementById('loc-banner-title');
  const sub   = document.getElementById('loc-banner-sub');
  if (currentLang === 'am') {
    title.textContent = 'አካባቢዎን ያጋሩ';
    sub.textContent   = 'ለተሻለ አገልግሎት አካባቢዎን እንዲጋሩ ፍቃድ ይስጡ።';
  } else {
    title.textContent = 'Share your location';
    sub.textContent   = 'Allow location access for a better experience.';
  }
  banner.style.display = 'block';
}

function requestLocationPermission() {
  // Record that we asked
  localStorage.setItem(LOCATION_ASKED_KEY, Date.now().toString());
  document.getElementById('location-banner').style.display = 'none';

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      localStorage.setItem(LOCATION_SAVED_KEY, JSON.stringify({ lat, lng, label }));
      updateLocationUI(label);
      if (currentUser) {
        firebase.database().ref('users/' + currentUser.phone + '/location').set({ lat, lng, savedAt: Date.now() });
      }
    },
    () => { /* user denied in browser dialog – just silently fail */ }
  );
}

function denyLocationBanner() {
  localStorage.setItem(LOCATION_ASKED_KEY, Date.now().toString());
  document.getElementById('location-banner').style.display = 'none';
}

function updateLocationUI(label) {
  const el = document.getElementById('location-text');
  if (el) el.textContent = label || (currentLang === 'am' ? 'አካባቢ አልተወሰነም' : 'Location unknown');
}

/* ──────────────────────────────────────────────
   LANGUAGE
────────────────────────────────────────────── */
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyLang(lang);
  applyAuthTranslations();
  applyAuthLangBtn();
  // Update lang chips
  document.querySelectorAll('.lang-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.lang === lang);
  });
}

function authToggleLang() {
  setLanguage(currentLang === 'am' ? 'en' : 'am');
}

function applyAuthLangBtn() {
  const btn = document.getElementById('auth-lang-btn');
  if (btn) btn.textContent = currentLang === 'am' ? '🇬🇧 English' : '🇪🇹 አማርኛ';
}

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.documentElement.lang = lang === 'am' ? 'am' : 'en';
}

function applyAuthTranslations() {
  const t = AUTH_TRANSLATIONS[currentLang];
  document.querySelectorAll('[data-i18n-auth]').forEach(el => {
    const key = el.dataset.i18nAuth;
    if (t[key] !== undefined) el.textContent = t[key];
  });
}

/* ──────────────────────────────────────────────
   THEME
────────────────────────────────────────────── */
function applyTheme() {
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  const authBtn = document.getElementById('auth-theme-btn');
  if (authBtn) authBtn.textContent = isDark ? '☀️' : '🌙';
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.classList.toggle('on', isDark);
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
}

/* ──────────────────────────────────────────────
   PROFILE UI
────────────────────────────────────────────── */
function updateProfileUI() {
  if (!currentUser) return;
  const nameEl  = document.getElementById('profile-name');
  const phoneEl = document.getElementById('profile-phone');
  if (nameEl)  nameEl.textContent  = currentUser.name  || '';
  if (phoneEl) phoneEl.textContent = currentUser.phone || '';
}

/* ──────────────────────────────────────────────
   PRODUCTS
────────────────────────────────────────────── */
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    products = await res.json();
  } catch(e) {
    products = [];
  }
  renderCategories();
  renderProducts(products);
}

function renderCategories() {
  const cats = ['ሁሉም', ...new Set(products.map(p => p.category).filter(Boolean))];
  const el = document.getElementById('categories-scroll');
  if (!el) return;
  el.innerHTML = cats.map((c,i) =>
    `<button class="category-chip${i===0?' active':''}" onclick="filterCategory('${c}',this)">${c}</button>`
  ).join('');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'ሁሉም' ? products : products.filter(p => p.category === cat);
  renderProducts(filtered);
}

function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!list || !list.length) {
    grid.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-secondary)" class="am">ምርቶች አልተገኙም</p>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="openProduct(${p.id||0})">
      <div class="product-img-wrap">
        <img src="${p.image||''}" alt="${p.name||''}" loading="lazy" onerror="this.src='1.png'">
        <button class="like-btn${likes.includes(p.id)?'  liked':''}" onclick="toggleLike(event,${p.id})">❤️</button>
      </div>
      <div class="product-info">
        <div class="product-name am">${p.name||''}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="add-to-cart-btn am" onclick="addToCartFromGrid(event,${p.id})">+ ጋሪ</button>
      </div>
    </div>
  `).join('');
}

function formatPrice(n) {
  return 'ብር ' + (parseFloat(n)||0).toLocaleString();
}

function handleSearch(val) {
  const q = val.trim().toLowerCase();
  const res = q ? products.filter(p => (p.name||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q)) : products;
  renderProducts(res);
}

/* ──────────────────────────────────────────────
   PRODUCT MODAL
────────────────────────────────────────────── */
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('product-modal').innerHTML = `
    <div class="product-modal-inner">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <img src="${p.image||''}" alt="${p.name||''}" style="width:100%;border-radius:12px;max-height:260px;object-fit:cover" onerror="this.src='1.png'">
      <h2 class="am" style="margin:12px 0 4px">${p.name||''}</h2>
      <div style="color:var(--clr-primary);font-weight:700;font-size:18px;margin-bottom:8px">${formatPrice(p.price)}</div>
      <p class="am" style="color:var(--text-secondary);font-size:14px;line-height:1.6">${p.description||''}</p>
      <button class="btn-primary am" style="width:100%;margin-top:16px" onclick="addToCart(${p.id});closeModal()">🛒 ጋሪ ላይ ጨምር</button>
    </div>
  `;
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

/* ──────────────────────────────────────────────
   CART
────────────────────────────────────────────── */
function addToCart(id) {
  if (!isAuthenticated()) { showRouteGuard(); return; }
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else {
    const p = products.find(x => x.id === id);
    if (p) cart.push({ ...p, qty: 1 });
  }
  saveCart();
  showToast(currentLang === 'am' ? 'ጋሪ ላይ ተጨምሯል' : 'Added to cart');
}

function addToCartFromGrid(e, id) {
  e.stopPropagation();
  addToCart(id);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  const badge = document.getElementById('cart-badge');
  const total = cart.reduce((a,i) => a + i.qty, 0);
  if (badge) { badge.textContent = total; badge.style.display = total ? '' : 'none'; }
}

function renderCart() {
  const el = document.getElementById('cart-content');
  if (!el) return;
  if (!cart.length) {
    el.innerHTML = '<p style="text-align:center;padding:32px;color:var(--text-secondary)" class="am">ጋሪ ባዶ ነው</p>';
    return;
  }
  const total = cart.reduce((a,i) => a + (parseFloat(i.price)||0)*i.qty, 0);
  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img src="${i.image||''}" onerror="this.src='1.png'" style="width:64px;height:64px;border-radius:8px;object-fit:cover">
      <div style="flex:1;margin:0 12px">
        <div class="am" style="font-weight:600">${i.name||''}</div>
        <div style="color:var(--clr-primary)">${formatPrice(i.price)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <button onclick="changeQty(${i.id},-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--bg-page);cursor:pointer">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${i.id},1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--bg-page);cursor:pointer">+</button>
        </div>
      </div>
      <button onclick="removeFromCart(${i.id})" style="color:var(--clr-danger);background:none;border:none;cursor:pointer;font-size:20px">🗑</button>
    </div>
  `).join('') + `
    <div style="padding:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span class="am" style="font-weight:700;font-size:16px">ጠቅላላ</span>
      <span style="color:var(--clr-primary);font-weight:700;font-size:18px">${formatPrice(total)}</span>
    </div>
    <div style="padding:0 16px 16px">
      <button class="btn-primary am" style="width:100%" onclick="checkout()">ትዕዛዝ ይስጡ</button>
    </div>
  `;
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function checkout() {
  showToast(currentLang === 'am' ? 'ትዕዛዝ ተቀብሏል!' : 'Order placed!');
  cart = [];
  saveCart();
  renderCart();
}

/* ──────────────────────────────────────────────
   ORDERS / LIKES
────────────────────────────────────────────── */
function renderOrders() {
  const el = document.getElementById('orders-content');
  if (el) el.innerHTML = '<p style="text-align:center;padding:32px;color:var(--text-secondary)" class="am">ትዕዛዝ የለም</p>';
}

function toggleLike(e, id) {
  e.stopPropagation();
  if (!isAuthenticated()) { showRouteGuard(); return; }
  if (likes.includes(id)) likes = likes.filter(l => l !== id);
  else likes.push(id);
  localStorage.setItem('likes', JSON.stringify(likes));
  renderProducts(products);
}

function renderLikes() {
  const el = document.getElementById('likes-content');
  if (!el) return;
  const liked = products.filter(p => likes.includes(p.id));
  if (!liked.length) {
    el.innerHTML = '<p style="text-align:center;padding:32px;color:var(--text-secondary)" class="am">ምርጥ ምርቶች አልተቀመጠም</p>';
    return;
  }
  el.innerHTML = liked.map(p => `
    <div class="cart-item">
      <img src="${p.image||''}" onerror="this.src='1.png'" style="width:64px;height:64px;border-radius:8px;object-fit:cover">
      <div style="flex:1;margin:0 12px">
        <div class="am" style="font-weight:600">${p.name||''}</div>
        <div style="color:var(--clr-primary)">${formatPrice(p.price)}</div>
      </div>
      <button class="add-to-cart-btn am" onclick="addToCart(${p.id})">+ ጋሪ</button>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────
   TOAST
────────────────────────────────────────────── */
function showToast(msg, duration=2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ──────────────────────────────────────────────
   PWA
────────────────────────────────────────────── */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = '';
});

function triggerPwaInstall() {
  if (!deferredPwaPrompt) return;
  deferredPwaPrompt.prompt();
}

/* ──────────────────────────────────────────────
   APP UPDATE
────────────────────────────────────────────── */
function forceAppUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
}

/* ──────────────────────────────────────────────
   INIT THEME ON LOAD
────────────────────────────────────────────── */
(function() {
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
})();
