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

console.log('\n--- VERIFYING USER REQUIREMENTS ---\n');

// 1. checkout.html
const checkoutHtml = fs.readFileSync(path.join(ROOT, 'checkout.html'), 'utf-8');
check('checkout.html has stepper pill CSS', checkoutHtml.includes('.checkout-stepper-pill'));
check('checkout.html has checkout-step-btn', checkoutHtml.includes('.checkout-step-btn'));
check('checkout.html has updateCheckoutQty function', checkoutHtml.includes('function updateCheckoutQty('));
check('checkout.html default payment is online', checkoutHtml.includes("let selectedPaymentType = 'online';"));
check('checkout.html no WhatsApp in payment cards', !checkoutHtml.includes("selectPayment(this, 'whatsapp')"));
check('checkout.html no COD in payment cards', !checkoutHtml.includes('(COD / Pay on Delivery)'));
check('checkout.html placeOrderFinal does not redirect to wa.me', !checkoutHtml.includes('window.open(`https://wa.me/'));
check('checkout.html has order confirmation success modal', checkoutHtml.includes('id="order-success-modal"'));

// 2. index.html
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
check('index.html marquee does not mention COD', !indexHtml.includes('100% Safe UPI & COD Checkout'));
check('index.html marquee mentions Secure Online Payment', indexHtml.includes('100% Secure Online Payment (UPI, Cards & NetBanking)'));
check('index.html desktop nav has Shipping & Delivery', indexHtml.includes('shipping-delivery.html') && indexHtml.includes('Shipping & Delivery'));
check('index.html footer has Shipping & Delivery Policy', indexHtml.includes('Shipping & Delivery Policy'));
check('index.html has proceedToCheckout function', indexHtml.includes('function proceedToCheckout()'));
check('index.html does not call wa.me in proceedToCheckout', !indexHtml.includes('https://wa.me/'));

// 3. categories.html
const catHtml = fs.readFileSync(path.join(ROOT, 'categories.html'), 'utf-8');
check('categories.html drawer button is Proceed to Checkout', catHtml.includes('Proceed to Checkout') && catHtml.includes('proceedToCheckout()'));
check('categories.html no proceedToWhatsAppCheckout button', !catHtml.includes('proceedToWhatsAppCheckout()'));
check('categories.html proceedToCheckout navigates to checkout.html', catHtml.includes("window.location.href = 'checkout.html';"));

// 4. product.html
const prodHtml = fs.readFileSync(path.join(ROOT, 'product.html'), 'utf-8');
check('product.html footer does not mention COD', !prodHtml.includes('(UPI, Cards, COD)'));
check('product.html footer mentions 100% Safe Online Payments', prodHtml.includes('100% Safe Online Payments'));
check('product.html footer links to shipping-delivery.html', prodHtml.includes('shipping-delivery.html'));

// 5. account.html
const accountHtml = fs.readFileSync(path.join(ROOT, 'account.html'), 'utf-8');
check('account.html has Shipping & Delivery in menu card', accountHtml.includes('Shipping & Delivery') && accountHtml.includes("openDrawer('drawer-shipping')"));
check('account.html has drawer-shipping', accountHtml.includes('id="drawer-shipping"'));
check('account.html drawer-shipping has express Bangalore delivery info', accountHtml.includes('Express Bangalore Delivery'));
check('account.html drawer-shipping has free shipping rule info', accountHtml.includes('FREE Shipping on Orders ₹999+'));

// 6. shipping-delivery.html
const shipExists = fs.existsSync(path.join(ROOT, 'shipping-delivery.html'));
check('shipping-delivery.html file exists', shipExists);
if (shipExists) {
  const shipHtml = fs.readFileSync(path.join(ROOT, 'shipping-delivery.html'), 'utf-8');
  check('shipping-delivery.html contains Bangalore express delivery', shipHtml.includes('Bangalore Express Delivery'));
  check('shipping-delivery.html contains Free Shipping Threshold', shipHtml.includes('Free Shipping Threshold'));
  check('shipping-delivery.html contains Pan-India coverage', shipHtml.includes('Pan-India'));
}

console.log(`\nAudit completed with ${errors} errors.\n`);
process.exit(errors > 0 ? 1 : 0);
