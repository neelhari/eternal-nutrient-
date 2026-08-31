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

console.log('\n--- VERIFYING MOBILE ADMIN SHIPPING & DELIVERY NAVIGATION ---\n');

// 1. admin.html mobile nav modal
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf-8');
check('admin.html has shipping card in mobile-nav-modal', adminHtml.includes('data-tab="shipping"') && adminHtml.includes("AdminController.navToTab('shipping')"));
check('admin.html has ri-truck-fill in mobile-nav-modal', adminHtml.includes('ri-truck-fill'));
check('admin.html mobile nav card has Shipping & Delivery label', adminHtml.includes('<div class="mobile-nav-card-label">Shipping & Delivery</div>'));
check('admin.html has view-shipping panel', adminHtml.includes('id="view-shipping"'));
check('admin.html has ship-mov, ship-free-threshold, ship-std-fee inputs', 
  adminHtml.includes('id="ship-mov"') && 
  adminHtml.includes('id="ship-free-threshold"') && 
  adminHtml.includes('id="ship-std-fee"'));

// 2. admin-controller.js
const adminCtrl = fs.readFileSync(path.join(ROOT, 'core', 'admin-controller.js'), 'utf-8');
check('admin-controller.js has case shipping in switch', adminCtrl.includes("case 'shipping':"));
check('admin-controller.js renderShippingView hydrates from CloudDB', adminCtrl.includes('window.CloudDB.getStoreSettings()'));
check('admin-controller.js has saveShippingSettingsForm', adminCtrl.includes('saveShippingSettingsForm'));

// 3. admin.css
const adminCss = fs.readFileSync(path.join(ROOT, 'styles', 'admin.css'), 'utf-8');
check('admin.css has responsive stacking for form-grid-2 on mobile', adminCss.includes('.form-grid-2,\n  .form-grid-3 {\n    grid-template-columns: 1fr !important;'));

console.log(`\nAudit completed with ${errors} errors.\n`);
process.exit(errors > 0 ? 1 : 0);
