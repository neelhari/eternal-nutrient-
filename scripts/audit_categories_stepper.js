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

console.log('\n--- VERIFYING CATEGORIES MOBILE STEPPER FIX ---\n');

// 1. storefront.css
const storefrontCss = fs.readFileSync(path.join(ROOT, 'styles', 'storefront.css'), 'utf-8');
check('storefront.css does not contain bottom: -10px on zepto-stepper-pill-active', !storefrontCss.includes('bottom: -10px !important'));
check('storefront.css does not contain position: absolute !important on zepto-stepper-pill-active', !storefrontCss.includes('position: absolute !important;\n  bottom: -10px'));

// 2. categories.css
const categoriesCss = fs.readFileSync(path.join(ROOT, 'styles', 'categories.css'), 'utf-8');
check('categories.css has static in-place zepto-stepper-pill-active', categoriesCss.includes('position: static !important'));
check('categories.css has inline-flex display on zepto-stepper-pill-active', categoriesCss.includes('display: inline-flex !important'));
check('categories.css has zepto-item-box overflow: visible', categoriesCss.includes('overflow: visible;'));
check('categories.css has centered card-bottom-row', categoriesCss.includes('align-items: center;'));

// 3. categories.html
const categoriesHtml = fs.readFileSync(path.join(ROOT, 'categories.html'), 'utf-8');
check('categories.html conditionally renders zepto-badge-pill', categoriesHtml.includes('(p.badge && p.badge.trim())'));

console.log(`\nAudit completed with ${errors} errors.\n`);
process.exit(errors > 0 ? 1 : 0);
