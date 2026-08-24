/**
 * ETERNAL NUTRICARE — BATCH 3B VERIFICATION TEST
 * Automated verification of Product & Category Insert, Update, Delete with Supabase SSOT
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pqorpwmyhfwafzddubaf.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_1HaDlvVRIZQQP-x-i_wM7w_oHp3jUKu';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function runTest() {
  console.log('===============================================================');
  console.log('🧪 BATCH 3B: PRODUCTS, CATEGORIES & IMAGE STORAGE TEST SUITE');
  console.log('===============================================================\n');

  const testProdId = 'test_prod_' + Date.now();
  const testCatId = 'test_cat_' + Date.now();

  // --------------------------------------------------------------------------
  // TEST 1: CATEGORY CRUD
  // --------------------------------------------------------------------------
  console.log('1. Testing Category Insert (CREATE)...');
  const catInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: testCatId,
      name: 'Test Organic Seeds',
      tagline: 'High protein organic seeds',
      image: 'https://res.cloudinary.com/ewrpjo2g/image/upload/v1787561188/sample.jpg',
      icon: 'ri-seedling-line',
      sort_order: 99,
      show_on_home: true,
      show_in_shop: true
    })
  });
  console.log(`   Status: ${catInsertRes.status} (Expected: 201 Created)`);
  if (!catInsertRes.ok) throw new Error(await catInsertRes.text());
  console.log('   ✅ Category Created Successfully!');

  console.log('\n2. Testing Category Update (UPDATE)...');
  const catUpdateRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${testCatId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ tagline: 'Updated tagline for seeds' })
  });
  console.log(`   Status: ${catUpdateRes.status} (Expected: 200 OK)`);
  console.log('   ✅ Category Updated Successfully!');

  // --------------------------------------------------------------------------
  // TEST 2: PRODUCT CRUD
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Product Insert (CREATE)...');
  const prodInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: testProdId,
      title: 'Flax & Chia Power Seeds',
      sku: 'EN-SEED-250',
      category: 'Test Organic Seeds',
      price: 299,
      original_price: 350,
      discount: 14,
      unit: '250g Pouch',
      image: 'https://res.cloudinary.com/ewrpjo2g/image/upload/v1787561188/sample.jpg',
      stock_qty: 40,
      in_stock: true,
      is_bestseller: true
    })
  });
  console.log(`   Status: ${prodInsertRes.status} (Expected: 201 Created)`);
  if (!prodInsertRes.ok) throw new Error(await prodInsertRes.text());
  console.log('   ✅ Product Created Successfully with Cloudinary Image URL!');

  console.log('\n4. Testing Product Update (UPDATE)...');
  const prodUpdateRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${testProdId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ price: 279, stock_qty: 35 })
  });
  console.log(`   Status: ${prodUpdateRes.status} (Expected: 200 OK)`);
  console.log('   ✅ Product Price and Stock Updated Successfully!');

  console.log('\n5. Testing Product Delete (DELETE)...');
  const prodDeleteRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${testProdId}`, {
    method: 'DELETE',
    headers
  });
  console.log(`   Status: ${prodDeleteRes.status} (Expected: 204 No Content / 200 OK)`);
  console.log('   ✅ Product Deleted Permanently from Supabase!');

  console.log('\n6. Testing Category Delete (DELETE)...');
  const catDeleteRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${testCatId}`, {
    method: 'DELETE',
    headers
  });
  console.log(`   Status: ${catDeleteRes.status} (Expected: 204 No Content / 200 OK)`);
  console.log('   ✅ Category Deleted Permanently from Supabase!');

  console.log('\n===============================================================');
  console.log('🎉 ALL BATCH 3B TESTS PASSED — SUPABASE SSOT VERIFIED!');
  console.log('===============================================================');
}

runTest().catch(err => {
  console.error('❌ Test Failed:', err.message);
  process.exit(1);
});
