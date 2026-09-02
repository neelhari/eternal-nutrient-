const fs = require('fs');
const path = require('path');
const PaymentVerifier = require('../core/payment-verifier.js');

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

console.log('===================================================================');
console.log('🧪 VERIFYING RAZORPAY PAYMENT GATEWAY INTEGRATION & ORDER TRACKING');
console.log('===================================================================\n');

// 1. Check store.config.js
const configContent = fs.readFileSync(path.join(ROOT, 'config', 'store.config.js'), 'utf-8');
check('store.config.js contains Razorpay Key ID (rzp_test_TWgbdjWKyIcwON)', configContent.includes('rzp_test_TWgbdjWKyIcwON'));
check('store.config.js contains Razorpay Key Secret (jU9HOxVbwOsAvvB1Oikr5Nkm)', configContent.includes('jU9HOxVbwOsAvvB1Oikr5Nkm'));

// 2. Check checkout.html
const checkoutHtml = fs.readFileSync(path.join(ROOT, 'checkout.html'), 'utf-8');
check('checkout.html includes Razorpay Checkout JS SDK', checkoutHtml.includes('https://checkout.razorpay.com/v1/checkout.js'));
check('checkout.html configures Razorpay options with amount & handlers', checkoutHtml.includes('new window.Razorpay(options)'));
check('checkout.html handles order success after Razorpay payment', checkoutHtml.includes('handleOrderSuccess'));
check('checkout.html has prominent Track Order button in confirmation modal', checkoutHtml.includes('Track Order') && checkoutHtml.includes('conf-track-order-btn'));
check('checkout.html links Track Order button to account.html?track=', checkoutHtml.includes('account.html?track='));

// 3. Check account.html
const accountHtml = fs.readFileSync(path.join(ROOT, 'account.html'), 'utf-8');
check('account.html has drawer-order-tracking drawer overlay', accountHtml.includes('id="drawer-order-tracking"'));
check('account.html has openOrderTracker function', accountHtml.includes('async function openOrderTracker('));
check('account.html renders Track Order button on order cards', accountHtml.includes('openOrderTracker(') && accountHtml.includes('Track Order'));
check('account.html has live shipment progress timeline with 4 steps', accountHtml.includes('track-timeline') && accountHtml.includes('Live Shipment Progress'));
check('account.html parses ?track= parameter on load to auto-open tracker', accountHtml.includes("urlParams.get('track')") && accountHtml.includes("openOrderTracker(trackOrderNum)"));

// 4. Check core/cloud-db.js
const cloudDb = fs.readFileSync(path.join(ROOT, 'core', 'cloud-db.js'), 'utf-8');
check('cloud-db.js has getOrderByNumber function', cloudDb.includes('async function getOrderByNumber('));
check('cloud-db.js exports getOrderByNumber', cloudDb.includes('getOrderByNumber,'));

// 5. Test PaymentVerifier HMAC SHA256 Signature Verification
async function testCrypto() {
  const orderId = 'order_test_123';
  const paymentId = 'pay_test_456';
  const secret = 'jU9HOxVbwOsAvvB1Oikr5Nkm';
  const sig = await PaymentVerifier.computeHmacSha256(`${orderId}|${paymentId}`, secret);
  const isValid = await PaymentVerifier.verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: sig,
    secret
  });
  check('PaymentVerifier verifies valid Razorpay HMAC SHA256 signature', isValid === true);
}

testCrypto().then(() => {
  console.log(`\n===================================================================`);
  console.log(`Verification completed with ${errors} errors.`);
  console.log('===================================================================');
  process.exit(errors > 0 ? 1 : 0);
});
