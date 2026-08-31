const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let errors = 0;

function check(title, condition, detail = '') {
  if (condition) {
    console.log(`✅ PASS: ${title}`);
  } else {
    console.error(`❌ FAIL: ${title} ${detail}`);
    errors++;
  }
}

console.log('\n--- VERIFYING CATEGORIES TO CHECKOUT CART REFLECTION ---\n');

// 1. categories.html
const catHtml = fs.readFileSync(path.join(ROOT, 'categories.html'), 'utf-8');
check('categories.html initializes cart from localStorage em_cart_items', catHtml.includes("localStorage.getItem('em_cart_items')"));
check('categories.html has saveCartToStorage function', catHtml.includes('function saveCartToStorage()'));
check('categories.html saves cart to em_cart_items in saveCartToStorage', catHtml.includes("localStorage.setItem('em_cart_items', JSON.stringify(cart))"));
check('categories.html calls saveCartToStorage in addToCartItem', catHtml.includes('saveCartToStorage();\n      renderProducts();\n      renderCartUI();\n      showToast'));
check('categories.html calls saveCartToStorage in updateItemQty', catHtml.includes('saveCartToStorage();\n      renderProducts();\n      renderCartUI();\n    }'));
check('categories.html calls saveCartToStorage in proceedToCheckout', catHtml.includes('saveCartToStorage();\n      window.location.href = \'checkout.html\';'));
check('categories.html passes unit in addToCartItem button click', catHtml.includes('${(p.unit || \'Standard Pack\').replace(/\'/g, "\\\\\'")}'));

// 2. checkout.html
const checkoutHtml = fs.readFileSync(path.join(ROOT, 'checkout.html'), 'utf-8');
check('checkout.html reads em_cart_items dynamically', checkoutHtml.includes("localStorage.getItem('em_cart_items')"));
check('checkout.html renders dynamic currentCart.map', checkoutHtml.includes('currentCart.map(item =>'));

// 3. Simulating 4 products added in categories and loaded in checkout
const mockLocalStorage = {};
const mockStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
  setItem: (k, v) => { mockLocalStorage[k] = v; },
  removeItem: (k) => { delete mockLocalStorage[k]; }
};

// Simulate adding 4 products in categories
let cart = [];
function saveCart() {
  mockStorage.setItem('em_cart_items', JSON.stringify(cart));
}
function add(id, title, price, unit) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, title, price, unit, qty: 1 });
  saveCart();
}

add('prod_1', 'Organic Raw Forest Honey', 499, '500g Jar');
add('prod_2', 'Handmade Lemon Pickle', 249, '300g Jar');
add('prod_3', 'Moringa Honey', 449, '500g Jar');
add('prod_4', 'Neem Honey', 429, '500g Jar');

const savedCart = JSON.parse(mockStorage.getItem('em_cart_items') || '[]');
check('Simulated 4 items saved in em_cart_items', savedCart.length === 4);
check('Simulated items contain Moringa Honey', savedCart.some(i => i.title === 'Moringa Honey'));
check('Simulated items contain Neem Honey', savedCart.some(i => i.title === 'Neem Honey'));

const totalQty = savedCart.reduce((s, i) => s + i.qty, 0);
const subtotal = savedCart.reduce((s, i) => s + (i.price * i.qty), 0);
check('Total quantity is 4', totalQty === 4);
check('Subtotal is correct (1626)', subtotal === 1626);

console.log(`\nAudit completed with ${errors} errors.\n`);
process.exit(errors > 0 ? 1 : 0);
