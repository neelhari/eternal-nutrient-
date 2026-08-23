/**
 * ETERNAL NUTRICARE — MASTER CLOUD DATABASE CLIENT (SUPABASE ADAPTER)
 * Dual-Mode Engine: Seamless Live Supabase Sync + Zero-Error Offline Seed Fallback
 */

window.CloudDB = (function() {

  const config = window.STORE_CONFIG || {};
  let supabaseClient = null;
  let isSupabaseActive = false;

  // Initialize Supabase if keys are provided and valid
  function initClient() {
    if (typeof window.supabase !== 'undefined' && config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('https://')) {
      try {
        supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        isSupabaseActive = true;
        console.log('✅ Supabase Cloud DB Client initialized successfully.');
      } catch (err) {
        console.warn('⚠️ Supabase client initialization notice:', err.message);
        isSupabaseActive = false;
      }
    } else {
      isSupabaseActive = false;
    }
  }

  initClient();

  // Helper for mock data fallback
  const mock = window.ADMIN_MOCK_DB;

  // 1. PRODUCTS API
  async function getProducts() {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local products seed:', err.message);
      }
    }
    return mock ? mock.products : [];
  }

  async function getProductById(id) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local product seed:', err.message);
      }
    }
    return mock ? mock.products.find(p => p.id === id) : null;
  }

  async function saveProduct(prod) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').upsert(prod).select();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Cloud save fallback to local state:', err.message);
      }
    }
    // In-memory fallback
    if (mock) {
      const idx = mock.products.findIndex(p => p.id === prod.id);
      if (idx !== -1) mock.products[idx] = prod;
      else mock.products.unshift(prod);
    }
    return { success: true, local: true };
  }

  async function deleteProduct(id) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { error } = await supabaseClient.from('products').delete().eq('id', id);
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Cloud delete fallback:', err.message);
      }
    }
    if (mock) {
      mock.products = mock.products.filter(p => p.id !== id);
    }
    return { success: true };
  }

  // 2. CATEGORIES API
  async function getCategories() {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('categories').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local categories:', err.message);
      }
    }
    return mock ? mock.categories : [];
  }

  async function saveCategory(cat) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('categories').upsert(cat).select();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Cloud save fallback:', err.message);
      }
    }
    if (mock) {
      const idx = mock.categories.findIndex(c => c.id === cat.id);
      if (idx !== -1) mock.categories[idx] = cat;
      else mock.categories.push(cat);
    }
    return { success: true };
  }

  // 3. ORDERS API
  async function getOrders() {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local orders:', err.message);
      }
    }
    return mock ? mock.orders : [];
  }

  async function createOrder(order) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').insert(order).select();
        if (!error) return { success: true, data: data[0] };
      } catch (err) {
        console.warn('Cloud order creation fallback:', err.message);
      }
    }
    if (mock) {
      mock.orders.unshift(order);
    }
    return { success: true, local: true };
  }

  async function updateOrderStatus(orderId, statusPayload) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').update(statusPayload).eq('id', orderId).select();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Cloud update fallback:', err.message);
      }
    }
    if (mock) {
      const ord = mock.orders.find(o => o.id === orderId);
      if (ord) Object.assign(ord, statusPayload);
    }
    return { success: true };
  }

  // 4. COUPONS API
  async function getCoupons() {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('coupons').select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local coupons:', err.message);
      }
    }
    return mock ? mock.coupons : [];
  }

  // 5. STORE SETTINGS API
  async function getStoreSettings() {
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('store_settings').select('*').eq('id', 'main_store').single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local settings:', err.message);
      }
    }
    return mock ? mock.storeSettings : {};
  }

  return {
    isSupabaseActive: () => isSupabaseActive,
    getProducts,
    getProductById,
    saveProduct,
    deleteProduct,
    getCategories,
    saveCategory,
    getOrders,
    createOrder,
    updateOrderStatus,
    getCoupons,
    getStoreSettings
  };

})();
