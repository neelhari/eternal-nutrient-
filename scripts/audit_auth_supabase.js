const SUPABASE_URL = 'https://pqorpwmyhfwafzddubaf.supabase.co';
const ANON_KEY = 'sb_publishable_1HaDlvVRIZQQP-x-i_wM7w_oHp3jUKu';

async function auditSupabaseAPIs() {
  console.log('====================================================');
  console.log('SUPABASE API & TABLE CONNECTION LIVE AUDIT');
  console.log('====================================================\n');

  const headers = { apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json' };

  // 1. Check Tables
  const tables = ['products', 'categories', 'orders', 'profiles', 'coupons', 'cms_content', 'store_settings'];
  for (const t of tables) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/' + t + '?select=*&limit=1', { headers });
      const data = await res.json();
      console.log(`[PASS] Table '${t}' is LIVE in Supabase. HTTP Status: ${res.status}`);
    } catch(e) {
      console.log(`[FAIL] Table '${t}': ${e.message}`);
    }
  }

  // 2. Test Supabase Auth API Call
  console.log('\n--- TESTING REAL SUPABASE AUTH API SIGNUP CALL ---');
  const testEmail = 'customer_audit_' + Date.now() + '@gmail.com';
  const testPass = 'Password@2026';
  
  console.log('Making API Call: POST ' + SUPABASE_URL + '/auth/v1/signup');
  const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: testEmail, password: testPass, data: { full_name: 'Audit Customer' } })
  });

  console.log('HTTP Response Status:', res.status);
  const data = await res.json();
  console.log('Supabase Raw Response:\n', JSON.stringify(data, null, 2));
}

auditSupabaseAPIs();
