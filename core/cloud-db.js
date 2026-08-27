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
    if (window.__en_supabaseClient) {
      supabaseClient = window.__en_supabaseClient;
      isSupabaseActive = true;
      return;
    }
    if (typeof window.supabase !== 'undefined' && config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('https://')) {
      try {
        supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        window.__en_supabaseClient = supabaseClient;
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

  function setClient(client) {
    if (client) {
      supabaseClient = client;
      window.__en_supabaseClient = client;
      isSupabaseActive = true;
      console.log('✅ CloudDB client synchronized with active authenticated session.');
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

  const KNOWN_PRODUCT_COLUMNS = new Set([
    'id', 'title', 'sku', 'category', 'image', 'gallery', 'price', 'original_price',
    'discount', 'unit', 'badge', 'rating', 'reviews_count', 'highlights', 'in_stock',
    'stock_qty', 'is_bestseller', 'is_featured', 'is_new_arrival', 'sort_order',
    'short_summary', 'description', 'benefits', 'ingredients', 'nutritional_info',
    'storage_instructions', 'created_at', 'updated_at'
  ]);

  function sanitizeProductForDB(prod) {
    const payload = {};
    for (const key of Object.keys(prod)) {
      if (KNOWN_PRODUCT_COLUMNS.has(key)) {
        payload[key] = prod[key];
      }
    }
    return payload;
  }

  async function saveProduct(prod) {
    if (isSupabaseActive && supabaseClient) {
      try {
        const dbPayload = sanitizeProductForDB(prod);
        const { data, error } = await supabaseClient.from('products').upsert(dbPayload).select();
        if (!error && data) {
          if (mock) {
            const idx = mock.products.findIndex(p => p.id === prod.id);
            if (idx !== -1) mock.products[idx] = { ...mock.products[idx], ...prod };
            else mock.products.unshift(prod);
          }
          return { success: true, data };
        }

        console.error('Supabase product save error:', error);
        return { success: false, error };
      } catch (err) {
        console.error('Cloud save exception:', err);
        return { success: false, error: err };
      }
    }
    // In-memory / local fallback when Supabase is not configured
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
        if (error) {
          console.error('Supabase delete error:', error);
          return { success: false, error };
        }
      } catch (err) {
        console.error('Cloud delete fallback:', err.message);
        return { success: false, error: err };
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
        if (!error && data) {
          if (mock) {
            const idx = mock.categories.findIndex(c => c.id === cat.id);
            if (idx !== -1) mock.categories[idx] = cat;
            else mock.categories.push(cat);
          }
          return { success: true, data };
        }
        return { success: false, error };
      } catch (err) {
        console.error('Cloud save fallback:', err);
        return { success: false, error: err };
      }
    }
    if (mock) {
      const idx = mock.categories.findIndex(c => c.id === cat.id);
      if (idx !== -1) mock.categories[idx] = cat;
      else mock.categories.push(cat);
    }
    return { success: true, local: true };
  }

  // 3. ORDERS & INVENTORY PIPELINE
  async function deductInventory(items) {
    if (!items || !Array.isArray(items) || items.length === 0) return;
    if (!isSupabaseActive || !supabaseClient) return;

    for (const item of items) {
      if (!item.id || !item.qty) continue;
      try {
        const { data: prod } = await supabaseClient.from('products').select('id, stock_qty').eq('id', item.id).single();
        if (prod) {
          const currentStock = Number(prod.stock_qty) || 0;
          const newStock = Math.max(0, currentStock - (Number(item.qty) || 1));
          await supabaseClient.from('products').update({
            stock_qty: newStock,
            in_stock: newStock > 0,
            updated_at: new Date().toISOString()
          }).eq('id', item.id);
        }
      } catch (err) {
        console.warn(`Inventory deduction notice for ${item.id}:`, err.message);
      }
    }
  }

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

  async function createOrder(rawOrder) {
    const orderId = rawOrder.id || `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const orderNum = rawOrder.order_number || rawOrder.orderNumber || `EN-${Math.floor(1000 + Math.random() * 9000)}`;

    const isPaid = (rawOrder.payment_status || rawOrder.paymentStatus || '').toLowerCase() === 'paid';
    const defaultStatus = isPaid ? 'Paid & Confirmed' : 'Order Confirmed';

    const normalizedOrder = {
      id: orderId,
      order_number: orderNum,
      customer_name: rawOrder.customer_name || rawOrder.customerName || 'Guest Customer',
      customer_phone: rawOrder.customer_phone || rawOrder.customerPhone || '',
      customer_email: rawOrder.customer_email || rawOrder.customerEmail || '',
      delivery_address: rawOrder.delivery_address || rawOrder.deliveryAddress || (typeof rawOrder.customerAddress === 'string' ? { address: rawOrder.customerAddress } : rawOrder.customerAddress) || {},
      items: rawOrder.items || [],
      subtotal: Number(rawOrder.subtotal) || 0,
      delivery_fee: Number(rawOrder.delivery_fee ?? rawOrder.deliveryFee ?? 0),
      discount_amount: Number(rawOrder.discount_amount ?? rawOrder.discountAmount ?? 0),
      total_amount: Number(rawOrder.total_amount ?? rawOrder.totalAmount ?? rawOrder.grandTotal ?? 0),
      coupon_code: rawOrder.coupon_code || rawOrder.couponCode || '',
      payment_method: rawOrder.payment_method || rawOrder.paymentMethod || 'COD',
      payment_status: rawOrder.payment_status || rawOrder.paymentStatus || (isPaid ? 'Paid' : 'Pending'),
      razorpay_order_id: rawOrder.razorpay_order_id || rawOrder.razorpayOrderId || '',
      razorpay_payment_id: rawOrder.razorpay_payment_id || rawOrder.razorpayPaymentId || '',
      order_status: rawOrder.order_status || rawOrder.orderStatus || defaultStatus,
      tracking_id: rawOrder.tracking_id || rawOrder.trackingId || '',
      admin_notes: rawOrder.admin_notes || rawOrder.adminNotes || rawOrder.notes || '',
      created_at: rawOrder.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').insert(normalizedOrder).select();
        if (!error && data && data.length > 0) {
          // Trigger stock deduction in database
          await deductInventory(normalizedOrder.items);
          return { success: true, data: data[0] };
        }
      } catch (err) {
        console.warn('Cloud order creation fallback:', err.message);
      }
    }
    if (mock) {
      mock.orders.unshift(normalizedOrder);
    }
    return { success: true, local: true, data: normalizedOrder };
  }

  async function updateOrderStatus(orderId, statusPayload) {
    const payload = typeof statusPayload === 'string' ? { order_status: statusPayload } : statusPayload;
    payload.updated_at = new Date().toISOString();

    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').update(payload).eq('id', orderId).select();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Cloud update fallback:', err.message);
      }
    }
    if (mock) {
      const ord = mock.orders.find(o => o.id === orderId || o.order_number === orderId);
      if (ord) Object.assign(ord, payload);
    }
    return { success: true };
  }

  // 4. DYNAMIC CUSTOMER DIRECTORY AGGREGATION
  async function getCustomers() {
    let ordersList = [];
    let profilesList = [];

    if (isSupabaseActive && supabaseClient) {
      try {
        const [ordersRes, profilesRes] = await Promise.all([
          supabaseClient.from('orders').select('*'),
          supabaseClient.from('profiles').select('*')
        ]);
        if (!ordersRes.error && ordersRes.data) ordersList = ordersRes.data;
        if (!profilesRes.error && profilesRes.data) profilesList = profilesRes.data;
      } catch (err) {
        console.warn('Customer directory cloud query fallback:', err.message);
      }
    }

    if (ordersList.length === 0 && mock) {
      return mock.customers || [];
    }

    const map = new Map();

    // Aggregate from profiles
    profilesList.forEach(p => {
      const key = p.phone || p.email || p.id;
      map.set(key, {
        id: p.id,
        name: p.full_name || 'Registered Member',
        email: p.email || '',
        phone: p.phone || '',
        totalOrders: 0,
        lifetimeSpend: 0,
        lastOrderDate: 'Registered Member',
        status: 'Active'
      });
    });

    // Aggregate from real orders
    ordersList.forEach(o => {
      const key = o.customer_phone || o.customer_email || o.customer_name;
      if (!key) return;

      const total = Number(o.total_amount) || 0;
      const orderDate = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

      if (map.has(key)) {
        const cust = map.get(key);
        cust.totalOrders += 1;
        cust.lifetimeSpend += total;
        cust.lastOrderDate = orderDate;
      } else {
        map.set(key, {
          id: 'cust_' + (o.customer_phone || Math.random().toString(36).substr(2, 6)),
          name: o.customer_name || 'Customer',
          email: o.customer_email || '',
          phone: o.customer_phone || '',
          totalOrders: 1,
          lifetimeSpend: total,
          lastOrderDate: orderDate,
          status: 'Active'
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);
  }

  // 5. COUPONS API
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

  // 6. STORE SETTINGS API
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

  async function saveStoreSettings(settings) {
    const payload = { id: 'main_store', ...settings, updated_at: new Date().toISOString() };
    if (isSupabaseActive && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('store_settings').upsert(payload).select();
        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Cloud settings save fallback:', err.message);
      }
    }
    if (mock) {
      mock.storeSettings = Object.assign(mock.storeSettings || {}, settings);
    }
    return { success: true, local: true };
  }

  return {
    isSupabaseActive: () => isSupabaseActive,
    get supabase() { return supabaseClient; },
    getClient: () => supabaseClient,
    setClient,
    init: initClient,
    getProducts,
    getProductById,
    saveProduct,
    deleteProduct,
    getCategories,
    saveCategory,
    getOrders,
    createOrder,
    updateOrderStatus,
    deductInventory,
    getCustomers,
    getCoupons,
    getStoreSettings,
    saveStoreSettings
  };

})();
