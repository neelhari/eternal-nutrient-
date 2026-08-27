async function run() {
  const url = 'https://pqorpwmyhfwafzddubaf.supabase.co';
  const anonKey = 'sb_publishable_1HaDlvVRIZQQP-x-i_wM7w_oHp3jUKu';

  // 1. Authenticate with Supabase Auth
  const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'eternalncdm@gmail.com',
      password: 'EternalAdmin@2026'
    })
  });

  const authData = await authRes.json();
  console.log('Auth Status:', authRes.status);
  
  if (!authData.access_token) {
    console.error('Auth Failed:', authData);
    return;
  }

  const token = authData.access_token;
  console.log('Authenticated successfully as Admin!');

  // 2. Perform Upsert with Authenticated Bearer Token
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation'
  };

  const prods = [
    {
      id: 'prod_1787815728460',
      title: 'nikhil organic',
      sku: 'EN-MIL-867',
      category: 'Millet Biscuits',
      image: 'https://res.cloudinary.com/ewrpjo2g/image/upload/f_auto,q_auto,w_800/v1787815638/olehgvp5mikbefvioftd.png',
      gallery: ['https://res.cloudinary.com/ewrpjo2g/image/upload/f_auto,q_auto,w_800/v1787815638/olehgvp5mikbefvioftd.png'],
      price: 250,
      original_price: 500,
      discount: 50,
      unit: '500g Glass Jar',
      stock_qty: 25,
      in_stock: true,
      is_bestseller: true,
      is_featured: true,
      is_new_arrival: true,
      sort_order: 1
    },
    {
      id: 'prod_1787817347734',
      title: 'kaveri chutney',
      sku: 'EN-DAT-995',
      category: "Dates Laddu's",
      image: 'https://res.cloudinary.com/ewrpjo2g/image/upload/f_auto,q_auto,w_800/v1787817315/f89hu6ejz07jjj3bvh9y.jpg',
      gallery: ['https://res.cloudinary.com/ewrpjo2g/image/upload/f_auto,q_auto,w_800/v1787817315/f89hu6ejz07jjj3bvh9y.jpg'],
      price: 250,
      original_price: 500,
      discount: 50,
      unit: '500g Glass Jar',
      stock_qty: 96,
      in_stock: true,
      is_bestseller: true,
      is_featured: true,
      is_new_arrival: true,
      sort_order: 1
    }
  ];

  const res = await fetch(`${url}/rest/v1/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(prods)
  });

  console.log('Product Upsert Status:', res.status);
  const data = await res.json();
  console.log('Upserted Products in Supabase:', data);
}

run();
