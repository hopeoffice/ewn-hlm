// ============================================================
// main.js  —  Customer-facing Product Display
// Fetches products from Cloud Firestore and renders them to the UI.
// All cart features continue to work because doc.id is used as
// the product identifier everywhere.
// ============================================================

// ── Imports ──────────────────────────────────────────────────────────────────
import { db } from "./firebase-init.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── DOM container where product cards are injected ───────────────────────────
// Adjust the selector to match your index.html (e.g. "#product-list", ".products-grid")
const productContainer = document.getElementById("product-list");

// ── Load & render all products ────────────────────────────────────────────────
async function loadProducts() {
  try {
    // 1. Reference the 'products' collection
    const productsCol = collection(db, "products");

    // 2. Fetch all documents in one read
    const querySnapshot = await getDocs(productsCol);

    if (querySnapshot.empty) {
      productContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    // 3. Clear any existing content / loading placeholder
    productContainer.innerHTML = "";

    // 4. Loop through documents and render each product card
    querySnapshot.forEach((docSnapshot) => {
      // doc.id  → the original Realtime DB key (e.g. "-Nabc123")
      //            used as the product ID for Add-to-Cart buttons
      const productId = docSnapshot.id;

      // doc.data() → the product fields (name, price, image, description, …)
      const product = docSnapshot.data();

      // Build a product card — adjust HTML/classes to match your style.css
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img
          src="${product.image || "placeholder.png"}"
          alt="${product.name || "Product"}"
          class="product-image"
          loading="lazy"
        />
        <div class="product-info">
          <h3 class="product-name">${product.name || "Unnamed Product"}</h3>
          <p class="product-price">${formatPrice(product.price)}</p>
          ${product.description
            ? `<p class="product-desc">${product.description}</p>`
            : ""}
        </div>
        <button
          class="add-to-cart-btn"
          data-id="${productId}"
          data-name="${product.name || ""}"
          data-price="${product.price || 0}"
          data-image="${product.image || ""}"
        >
          Add to Cart
        </button>
      `;

      productContainer.appendChild(card);
    });

    // 5. Attach cart listeners AFTER cards are in the DOM
    attachCartListeners();

  } catch (error) {
    console.error("Error loading products from Firestore:", error);
    productContainer.innerHTML =
      "<p>Failed to load products. Please try again later.</p>";
  }
}

// ── Cart logic ────────────────────────────────────────────────────────────────
// Reads data-* attributes from each button so the product ID is always
// the original Realtime DB key → no cart breakage after migration.

function attachCartListeners() {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = {
        id:    btn.dataset.id,       // original RTDB key, now Firestore doc ID
        name:  btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        qty:   1,
      };
      addToCart(item);
    });
  });
}

// ── Minimal cart implementation (adapt to your existing cart code) ────────────
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push(item);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  showToast(`${item.name} added to cart ✓`);
}

function updateCartUI() {
  // Update cart badge / total — adjust selector to match your HTML
  const badge = document.getElementById("cart-count");
  if (badge) {
    const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
    badge.textContent = totalQty;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price) {
  if (price == null) return "";
  return `ETB ${parseFloat(price).toFixed(2)}`;
}

function showToast(msg) {
  // Simple toast — replace with your own notification component if you have one
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:20px; right:20px; background:#333; color:#fff;
    padding:10px 18px; border-radius:6px; font-size:0.9rem; z-index:9999;
    animation: fadeout 2.5s forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// ── Init ──────────────────────────────────────────────────────────────────────
// Restore cart badge on page load, then fetch products
updateCartUI();
loadProducts();
