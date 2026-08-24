/**
 * ETERNAL NUTRICARE — ENTERPRISE ADMIN PANEL CONTROLLER
 * Full Reactive UI State Management, Modals, 1s Action Latency Simulator & Toast System
 * (Phase 1 Frontend Only — Structured for Seamless Phase 2 Supabase/Backend Integration)
 */

window.AdminController = (function() {

  const db = window.ADMIN_MOCK_DB;
  let activeTab = 'dashboard';
  let pendingDeleteTarget = null;
  let currentInspectedOrder = null;

  // =========================================================================
  // =========================================================================
  // 0. SUPABASE AUTHENTICATION & LOCKSCREEN ENGINE
  // =========================================================================
  let currentAdminUser = null;

  async function checkAdminSession() {
    const config = window.STORE_CONFIG || {};
    const lockscreen = document.getElementById('admin-auth-lockscreen');
    if (!lockscreen) return;

    if (typeof window.supabase !== 'undefined' && config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('https://')) {
      try {
        const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        const { data: { session }, error } = await client.auth.getSession();
        
        if (session && session.user) {
          currentAdminUser = session.user;
          lockscreen.classList.remove('open');
          lockscreen.style.display = 'none';
          document.body.style.overflow = '';
          updateAdminProfileDisplay(session.user.email);
          showToast(`Welcome back, ${session.user.email}`, 'info');
          return;
        }
      } catch (err) {
        console.warn('Session check error:', err.message);
      }
    }

    // Show lockscreen if not authenticated
    lockscreen.classList.add('open');
    lockscreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  async function handleAdminLogin(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-admin-login');
    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value;

    if (!email || !password) {
      showToast('Please enter your admin email and password.', 'error');
      return;
    }

    const config = window.STORE_CONFIG || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseUrl.startsWith('https://')) {
      // In preview mode before user pastes Supabase keys
      withActionSpinner(btn, () => {
        const lockscreen = document.getElementById('admin-auth-lockscreen');
        if (lockscreen) {
          lockscreen.classList.remove('open');
          lockscreen.style.display = 'none';
        }
        document.body.style.overflow = '';
        showToast('Preview access granted (Connect Supabase in config to enforce real JWT)', 'info');
      }, 'Authenticated!');
      return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Authenticating...`;

    try {
      const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data, error } = await client.auth.signInWithPassword({ email, password });

      btn.disabled = false;
      btn.innerHTML = originalText;

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      if (data && data.session) {
        currentAdminUser = data.user;
        const lockscreen = document.getElementById('admin-auth-lockscreen');
        if (lockscreen) {
          lockscreen.classList.remove('open');
          lockscreen.style.display = 'none';
        }
        document.body.style.overflow = '';
        updateAdminProfileDisplay(data.user.email);
        showToast('Admin authentication successful! Access granted.', 'success');
      }
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showToast(err.message || 'Authentication error', 'error');
    }
  }

  async function handleAdminLogout() {
    const config = window.STORE_CONFIG || {};
    if (typeof window.supabase !== 'undefined' && config.supabaseUrl && config.supabaseAnonKey) {
      try {
        const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        await client.auth.signOut();
      } catch (err) {
        console.warn('Logout notice:', err.message);
      }
    }

    currentAdminUser = null;
    const lockscreen = document.getElementById('admin-auth-lockscreen');
    if (lockscreen) {
      lockscreen.classList.add('open');
      lockscreen.style.display = 'flex';
    }
    document.body.style.overflow = 'hidden';
    showToast('You have been logged out of the Admin Portal.', 'info');
  }

  function updateAdminProfileDisplay(email) {
    const nameEl = document.querySelector('.admin-user-name');
    const roleEl = document.querySelector('.admin-user-role');
    const avatarEl = document.querySelector('.admin-avatar-circle');
    if (nameEl) nameEl.innerText = email || 'Admin User';
    if (roleEl) roleEl.innerText = 'Verified Administrator';
    if (avatarEl && email) avatarEl.innerText = email.charAt(0).toUpperCase();
  }

  // =========================================================================
  // 1. ASYNC ACTION SIMULATION & SPINNER ENGINE (STRICT 1-SECOND CONSTRAINT)
  // =========================================================================
  function withActionSpinner(btnElement, asyncCallback, successMessage) {
    if (!btnElement) {
      if (asyncCallback) asyncCallback();
      if (successMessage) showToast(successMessage, 'success');
      return;
    }

    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.classList.add('btn-loading');
    btnElement.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 6px; font-size: 16px;"></i> Processing...`;

    setTimeout(() => {
      try {
        if (asyncCallback) asyncCallback();
        btnElement.disabled = false;
        btnElement.classList.remove('btn-loading');
        btnElement.innerHTML = originalContent;
        if (successMessage) showToast(successMessage, 'success');
      } catch (err) {
        btnElement.disabled = false;
        btnElement.classList.remove('btn-loading');
        btnElement.innerHTML = originalContent;
        showToast('Action failed: ' + err.message, 'error');
      }
    }, 1000); // Strict 1-second simulated delay as requested in prompt
  }

  // =========================================================================
  // 2. UNIVERSAL TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function showToast(message, type = 'success') {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast-bubble toast-${type}`;

    let icon = 'ri-checkbox-circle-fill';
    if (type === 'error') icon = 'ri-error-warning-fill';
    if (type === 'info') icon = 'ri-information-fill';
    if (type === 'warning') icon = 'ri-alert-fill';

    toast.innerHTML = `
      <i class="${icon} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close-btn" onclick="this.parentElement.remove()"><i class="ri-close-line"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 3. TAB ROUTER & NAVIGATION
  // =========================================================================
  function switchTab(tabId) {
    activeTab = tabId;

    // Update active nav button in sidebar
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all view panels
    document.querySelectorAll('.admin-view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${tabId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Close mobile drawer if open
    closeMobileSidebar();

    // Re-render target view data
    renderActiveView(tabId);
  }

  function renderActiveView(tabId) {
    switch (tabId) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'products':
        renderProductsTable();
        break;
      case 'categories':
        renderCategoriesView();
        break;
      case 'orders':
        renderOrdersTable();
        break;
      case 'inventory':
        renderInventoryTable();
        break;
      case 'banners':
        renderBannersView();
        break;
      case 'collections':
        renderCollectionsView();
        break;
      case 'festive':
        renderFestiveSpecialsView();
        break;
      case 'marquee':
        renderMarqueeView();
        break;
      case 'coupons':
        renderCouponsView();
        break;
      case 'customers':
        renderCustomersView();
        break;
      case 'settings':
        renderSettingsView();
        break;
      case 'shipping':
        renderShippingView();
        break;
    }
  }

  // =========================================================================
  // 4. DASHBOARD OVERVIEW RENDERER
  // =========================================================================
  function renderDashboard() {
    const orders = db.orders || [];
    const products = db.products || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    let allTimeRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    orders.forEach(o => {
      const amt = Number(o.totalAmount || o.total_amount || 0);
      const oDate = new Date(o.date || o.created_at || Date.now());
      const oTime = oDate.getTime();

      allTimeRevenue += amt;
      if (oTime >= startOfToday) todayRevenue += amt;
      if (oTime >= startOfWeek) weekRevenue += amt;
      if (oTime >= startOfMonth) monthRevenue += amt;

      const st = (o.orderStatus || o.order_status || '').toLowerCase();
      if (st.includes('delivered') || st.includes('completed')) {
        completedOrders++;
      } else if (!st.includes('cancelled') && !st.includes('refunded')) {
        pendingOrders++;
      }
    });

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(allTimeRevenue / totalOrders) : 0;
    const activeProducts = products.filter(p => p.inStock).length;
    const lowStockCount = products.filter(p => p.stockQty <= 10).length;

    // Top metric cards
    document.getElementById('stat-today-revenue').innerText = `₹${todayRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-week-revenue').innerText = `₹${weekRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-month-revenue').innerText = `₹${monthRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-alltime-revenue').innerText = `₹${allTimeRevenue.toLocaleString('en-IN')}`;
    
    document.getElementById('stat-total-orders').innerText = totalOrders;
    document.getElementById('stat-pending-orders').innerText = pendingOrders;
    document.getElementById('stat-completed-orders').innerText = completedOrders;
    document.getElementById('stat-aov').innerText = `₹${averageOrderValue.toLocaleString('en-IN')}`;
    document.getElementById('stat-active-products').innerText = activeProducts;
    document.getElementById('stat-low-stock').innerText = lowStockCount;

    // Leaderboard (Real Products from DB)
    const topProducts = products.filter(p => p.isBestseller).length > 0
      ? products.filter(p => p.isBestseller).slice(0, 4)
      : products.slice(0, 4);

    const leaderboardContainer = document.getElementById('dash-top-products-list');
    if (leaderboardContainer) {
      if (topProducts.length === 0) {
        leaderboardContainer.innerHTML = '<div class="p-3 text-muted">No products cataloged yet.</div>';
      } else {
        leaderboardContainer.innerHTML = topProducts.map((p, idx) => `
          <div class="leaderboard-item-row">
            <span class="rank-badge rank-${idx + 1}">#${idx + 1}</span>
            <img src="${p.image}" alt="${p.title}" class="leaderboard-thumb">
            <div class="leaderboard-info">
              <div class="leaderboard-title">${p.title}</div>
              <div class="leaderboard-meta">${p.category} • ${p.unit}</div>
            </div>
            <div class="leaderboard-sales">
              <div class="sales-val">₹${p.price}</div>
              <span class="stock-pill ${p.stockQty > 10 ? 'in-stock' : 'low-stock'}">${p.stockQty} in stock</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Recent Orders in Dashboard
    const recentOrders = orders.slice(0, 5);
    const recentOrdersContainer = document.getElementById('dash-recent-orders-list');
    if (recentOrdersContainer) {
      if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<div class="p-3 text-muted text-center"><i class="ri-shopping-bag-3-line" style="font-size: 24px; display: block; margin-bottom: 6px;"></i>No orders placed yet. Orders will appear here live.</div>';
      } else {
        recentOrdersContainer.innerHTML = recentOrders.map(o => `
          <div class="recent-order-row" onclick="AdminController.openOrderInspector('${o.id}')">
            <div class="order-id-block">
              <span class="order-num">${o.orderNumber}</span>
              <span class="order-time">${new Date(o.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="order-cust-block">
              <div class="cust-name">${o.customerName}</div>
              <div class="cust-phone">${o.customerPhone}</div>
            </div>
            <div class="order-amount-block">
              <div class="amount-val">₹${o.totalAmount}</div>
              <span class="order-status-chip status-${(o.orderStatus || 'confirmed').toLowerCase().replace(/\s+/g, '-')}">${o.orderStatus || 'Confirmed'}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Low stock alert banner
    const lowStockItems = products.filter(p => p.stockQty <= 10);
    const alertBox = document.getElementById('dash-low-stock-alert');
    if (alertBox) {
      if (lowStockItems.length > 0) {
        alertBox.style.display = 'flex';
        alertBox.innerHTML = `
          <i class="ri-alarm-warning-fill alert-leading-icon"></i>
          <div class="alert-content-wrap">
            <strong>Low Inventory Warning:</strong> ${lowStockItems.map(p => `<b>${p.title}</b> (${p.stockQty} left)`).join(', ')}.
          </div>
          <button class="btn btn-sm btn-outline-warning" onclick="AdminController.switchTab('inventory')">Manage Stock</button>
        `;
      } else {
        alertBox.style.display = 'none';
      }
    }
  }

  // =========================================================================
  // 5. PRODUCTS MANAGEMENT
  // =========================================================================
  let selectedProductIds = new Set();
  let currentProductPage = 1;
  let productsPerPage = 10;
  let currentProductViewMode = 'table';

  function getCategoryBadgeClass(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('honey')) return 'badge-cat-honey';
    if (cat.includes('laddu')) return 'badge-cat-laddu';
    if (cat.includes('chikki')) return 'badge-cat-chikki';
    if (cat.includes('biscuit') || cat.includes('cookie')) return 'badge-cat-biscuits';
    if (cat.includes('rava') || cat.includes('millet')) return 'badge-cat-rava';
    if (cat.includes('pickle')) return 'badge-cat-pickles';
    return 'badge-cat-default';
  }

  function getPackagingSubtitle(category, unit) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('honey')) return 'Glass Jar';
    if (cat.includes('laddu')) return 'Artisanal Box';
    if (cat.includes('chikki')) return 'Crunchy Pack';
    if (cat.includes('biscuit') || cat.includes('cookie')) return 'Fresh Pack';
    if (cat.includes('rava') || cat.includes('grain')) return 'Grain Pouch';
    if (cat.includes('pickle')) return 'Ceramic Jar';
    return 'Fresh Pack';
  }

  function renderProductsTable() {
    const filterCat = document.getElementById('prod-filter-category')?.value || 'All';
    const filterStock = document.getElementById('prod-filter-stock')?.value || 'All';
    const filterStatus = document.getElementById('prod-filter-status')?.value || 'All';
    const searchVal = document.getElementById('prod-search-input')?.value.toLowerCase().trim() || '';

    let list = [...db.products];

    if (filterCat !== 'All') {
      list = list.filter(p => p.category === filterCat);
    }
    if (filterStock === 'InStock') {
      list = list.filter(p => p.inStock);
    } else if (filterStock === 'OutOfStock') {
      list = list.filter(p => !p.inStock || p.stockQty === 0);
    } else if (filterStock === 'LowStock') {
      list = list.filter(p => p.stockQty <= 10);
    }

    if (filterStatus === 'Active') {
      list = list.filter(p => p.inStock);
    } else if (filterStatus === 'Inactive') {
      list = list.filter(p => !p.inStock);
    }

    if (searchVal) {
      list = list.filter(p => p.title.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));
    }

    // Update pagination count
    const totalCount = db.products.length;
    const showingText = document.getElementById('catalog-pagination-showing-text');
    if (showingText) {
      showingText.innerText = `Showing ${list.length} of ${totalCount} products`;
    }

    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty-state">
            <i class="ri-inbox-line"></i>
            <div>No matching products found in catalog.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const catBadgeClass = getCategoryBadgeClass(p.category);
      const mrp = p.originalPrice || (p.price + 50);
      const discPct = p.discount || (mrp > p.price ? Math.round(((mrp - p.price) / mrp) * 100) : 17);
      const lowThreshold = p.lowStockThreshold || 10;
      const isLow = p.stockQty <= lowThreshold && p.stockQty > 0;
      const isOut = p.stockQty === 0;

      // Clean unit display (handles multiple pack sizes cleanly)
      let unitDisplay = p.unit || '500g';
      if (Array.isArray(p.variants) && p.variants.length > 1) {
        unitDisplay = p.variants.map(v => v.size || v.unit).join(' • ');
      }

      return `
        <tr>
          <td>
            <div class="table-product-lockup" style="cursor: pointer;" onclick="AdminController.openProductModal('${p.id}')" title="Click to Edit Product">
              <img src="${p.image}" alt="${p.title}" class="prod-photo-thumb">
              <div>
                <div class="prod-title-text">${p.title}</div>
                <div class="prod-sku-text">SKU: ${p.sku}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="cat-pill-chip ${catBadgeClass}">${p.category}</span>
          </td>
          <td>
            <div class="price-bold-main">₹${p.price}</div>
            <div class="price-sub-mrp-disc">
              <span class="mrp-strike-tag">MRP ₹${mrp}</span>
              <span class="disc-green-tag">${discPct}% OFF</span>
            </div>
          </td>
          <td>
            <div class="unit-bold-main">${unitDisplay}</div>
          </td>
          <td>
            <div class="stock-dot-status ${isOut ? 'stock-out' : (isLow ? 'stock-low' : '')}">
              <span class="stock-pulse-dot"></span>
              <span>${p.stockQty} in stock</span>
            </div>
            <div class="stock-low-subtext">Low: ${lowThreshold}</div>
          </td>
          <td>
            <div class="merch-badges-stack">
              ${p.isBestseller ? '<span class="merch-badge-chip merch-bestseller">★ Bestseller</span>' : ''}
              ${p.isNewArrival ? '<span class="merch-badge-chip merch-new">⚡ New Arrival</span>' : ''}
            </div>
          </td>
          <td>
            <label class="switch-ios" title="Toggle Active Status">
              <input type="checkbox" ${p.inStock ? 'checked' : ''} onchange="AdminController.toggleProductStock('${p.id}', this)">
              <span class="slider-ios"></span>
            </label>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="action-icon-square" onclick="AdminController.openProductModal('${p.id}')" title="Edit Product">
              <i class="ri-pencil-line"></i>
            </button>
            <button class="action-icon-square action-delete" onclick="AdminController.promptDeleteProduct('${p.id}')" title="Delete Product">
              <i class="ri-delete-bin-line"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Populate category dropdown inside filter bar
    const catFilter = document.getElementById('prod-filter-category');
    if (catFilter && catFilter.options.length <= 1) {
      catFilter.innerHTML = '<option value="All">All Categories</option>' + db.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
  }

  function resetProductFilters() {
    const search = document.getElementById('prod-search-input');
    const cat = document.getElementById('prod-filter-category');
    const stock = document.getElementById('prod-filter-stock');
    const status = document.getElementById('prod-filter-status');
    if (search) search.value = '';
    if (cat) cat.value = 'All';
    if (stock) stock.value = 'All';
    if (status) status.value = 'All';
    renderProductsTable();
    showToast('Product filters reset.', 'info');
  }

  function toggleSelectProduct(productId, isChecked) {
    if (isChecked) {
      selectedProductIds.add(productId);
    } else {
      selectedProductIds.delete(productId);
    }
    updateBulkSelectionLabel();
  }

  function toggleSelectAllProducts(isChecked) {
    if (isChecked) {
      db.products.forEach(p => selectedProductIds.add(p.id));
    } else {
      selectedProductIds.clear();
    }
    renderProductsTable();
    updateBulkSelectionLabel();
  }

  function updateBulkSelectionLabel() {
    const label = document.getElementById('bulk-selected-count-label');
    if (label) {
      label.innerText = `${selectedProductIds.size} selected`;
    }
  }

  function showBulkActionsMenu(event) {
    if (selectedProductIds.size === 0) {
      showToast('Select one or more products to perform bulk actions.', 'info');
      return;
    }
    showToast(`Bulk actions available for ${selectedProductIds.size} products.`, 'info');
  }

  function switchProductViewMode(mode) {
    currentProductViewMode = mode;
    const btnTable = document.getElementById('btn-view-table');
    const btnGrid = document.getElementById('btn-view-grid');
    if (btnTable && btnGrid) {
      btnTable.classList.toggle('active', mode === 'table');
      btnGrid.classList.toggle('active', mode === 'grid');
    }
    showToast(`Switched to ${mode} view.`, 'info');
  }

  function changeProductPage(page) {
    showToast(`Navigated to page ${page}.`, 'info');
  }

  function setProductsPerPage(count) {
    productsPerPage = parseInt(count) || 10;
    renderProductsTable();
    showToast(`Showing ${productsPerPage} products per page.`, 'info');
  }

  function addPackSizeRow(size = '', price = '', mrp = '', stock = 50) {
    const container = document.getElementById('prod-variants-container');
    if (!container) return;

    const rowId = 'var-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const row = document.createElement('div');
    row.id = rowId;
    row.className = 'variant-item-row';
    row.style.cssText = 'display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 1fr 40px; gap: 10px; align-items: center;';
    
    row.innerHTML = `
      <input type="text" class="form-input var-size-input" placeholder="e.g. 500g Glass Jar" value="${size}" required>
      <input type="number" class="form-input var-price-input" placeholder="349" value="${price !== '' ? price : ''}" required>
      <input type="number" class="form-input var-mrp-input" placeholder="420" value="${mrp !== '' ? mrp : ''}">
      <input type="number" class="form-input var-stock-input" placeholder="50" value="${stock !== '' ? stock : 50}" required>
      <button type="button" class="action-icon-square action-delete" onclick="AdminController.removePackSizeRow('${rowId}')" title="Delete Size" style="margin: 0;">
        <i class="ri-delete-bin-line"></i>
      </button>
    `;
    container.appendChild(row);
  }

  function removePackSizeRow(rowId) {
    const container = document.getElementById('prod-variants-container');
    if (!container) return;
    if (container.children.length <= 1) {
      showToast('Every product must have at least one pack size & price.', 'error');
      return;
    }
    const row = document.getElementById(rowId);
    if (row) row.remove();
  }

  let currentProductGallery = [];

  function renderGalleryStrip() {
    const strip = document.getElementById('prod-gallery-strip');
    const mainImgInput = document.getElementById('prod-form-image');
    if (!strip) return;

    if (currentProductGallery.length === 0) {
      strip.innerHTML = `
        <div style="width: 100%; text-align: center; color: #94A3B8; font-size: 12.5px; padding: 14px 0;">
          <i class="ri-image-add-line" style="font-size: 24px; display: block; margin-bottom: 4px; color: #CBD5E1;"></i>
          No photos uploaded yet. Click <strong>"+ Upload Photos"</strong> or paste an image URL above.
        </div>
      `;
      if (mainImgInput) mainImgInput.value = '';
      return;
    }

    if (mainImgInput) mainImgInput.value = currentProductGallery[0];

    strip.innerHTML = currentProductGallery.map((url, idx) => `
      <div class="gallery-thumb-item ${idx === 0 ? 'is-primary' : ''}" onclick="AdminController.setAsPrimaryImage(${idx})" title="${idx === 0 ? 'Primary Cover Photo' : 'Click to set as Primary Cover'}">
        <img src="${url}" class="gallery-thumb-img" alt="Gallery Photo ${idx + 1}">
        ${idx === 0 ? '<span class="gallery-primary-tag">Primary</span>' : ''}
        <button type="button" class="gallery-delete-btn" onclick="event.stopPropagation(); AdminController.removeGalleryImage(${idx})" title="Remove photo">
          <i class="ri-close-line"></i>
        </button>
      </div>
    `).join('');
  }

  function setAsPrimaryImage(index) {
    if (index < 0 || index >= currentProductGallery.length || index === 0) return;
    const selected = currentProductGallery.splice(index, 1)[0];
    currentProductGallery.unshift(selected);
    renderGalleryStrip();
    showToast('Cover photo updated!', 'info');
  }

  function removeGalleryImage(index) {
    if (index < 0 || index >= currentProductGallery.length) return;
    currentProductGallery.splice(index, 1);
    renderGalleryStrip();
    showToast('Photo removed.', 'info');
  }

  function addGalleryImageUrl() {
    const input = document.getElementById('prod-gallery-url-input');
    const url = input?.value.trim();
    if (!url) {
      showToast('Please paste a valid image URL.', 'error');
      return;
    }
    currentProductGallery.push(url);
    if (input) input.value = '';
    renderGalleryStrip();
    showToast('Photo URL added to gallery!', 'success');
  }

  async function uploadProductGallery(input) {
    if (!input || !input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    
    showToast(`Uploading ${files.length} photo(s) to Cloudinary...`, 'info');

    const config = window.STORE_CONFIG || {};
    const cloudName = config.cloudinaryCloudName || 'ewrpjo2g';
    const uploadPreset = config.cloudinaryUploadPreset || 'eternal_products';

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.secure_url) {
          const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
          currentProductGallery.push(optimizedUrl);
        } else {
          currentProductGallery.push(await new Promise(r => {
            const rd = new FileReader();
            rd.onload = e => r(e.target.result);
            rd.readAsDataURL(file);
          }));
        }
      } catch (err) {
        console.warn('Cloudinary upload notice:', err.message);
        currentProductGallery.push(await new Promise(r => {
          const rd = new FileReader();
          rd.onload = e => r(e.target.result);
          rd.readAsDataURL(file);
        }));
      }
    }

    renderGalleryStrip();
    showToast(`${files.length} photo(s) added to gallery!`, 'success');
    input.value = '';
  }

  function openProductModal(productId = null) {
    const modal = document.getElementById('modal-product-form');
    if (!modal) return;

    // Reset form
    document.getElementById('form-product').reset();
    document.getElementById('prod-modal-id').value = productId || '';
    document.getElementById('prod-modal-title-heading').innerText = productId ? 'Edit Product' : 'Add New Product';

    // Populate category dropdown inside modal
    const catSelect = document.getElementById('prod-form-category');
    if (catSelect) {
      catSelect.innerHTML = db.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    const varContainer = document.getElementById('prod-variants-container');
    if (varContainer) varContainer.innerHTML = '';

    if (productId) {
      const prod = db.products.find(p => p.id === productId);
      if (prod) {
        document.getElementById('prod-form-title').value = prod.title || '';
        document.getElementById('prod-form-category').value = prod.category || db.categories[0]?.name || '';
        document.getElementById('prod-form-description').value = prod.description || '';
        document.getElementById('prod-form-in-stock').checked = prod.inStock !== false;
        document.getElementById('prod-form-is-bestseller').checked = !!prod.isBestseller;
        const featEl = document.getElementById('prod-form-is-featured');
        if (featEl) featEl.checked = !!prod.isFeatured;
        const newEl = document.getElementById('prod-form-is-new');
        if (newEl) newEl.checked = !!prod.isNewArrival;

        // Initialize Gallery
        if (Array.isArray(prod.gallery) && prod.gallery.length > 0) {
          currentProductGallery = [...prod.gallery];
        } else if (prod.image) {
          currentProductGallery = [prod.image];
        } else {
          currentProductGallery = ['assets/prod_honey_studio.jpg'];
        }
        renderGalleryStrip();

        // Render pack sizes (variants)
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          prod.variants.forEach(v => {
            addPackSizeRow(v.size || v.unit || '500g', v.price, v.mrp || v.originalPrice || v.price, v.stock ?? v.stockQty ?? 50);
          });
        } else {
          addPackSizeRow(prod.unit || '500g Glass Jar', prod.price, prod.originalPrice || prod.price, prod.stockQty ?? 50);
        }
      }
    } else {
      currentProductGallery = ['assets/prod_honey_studio.jpg'];
      renderGalleryStrip();
      
      // Default single variant row for new product
      addPackSizeRow('500g Glass Jar', '', '', 50);
    }

    openModal('modal-product-form');
  }

  async function withActionSpinner(btn, actionFn) {
    let originalHtml = '';
    if (btn) {
      originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Saving...`;
    }
    try {
      await actionFn();
    } catch (err) {
      console.error('Action error:', err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }
  }

  async function saveProductForm(btn) {
    const title = document.getElementById('prod-form-title')?.value.trim();
    const category = document.getElementById('prod-form-category')?.value;
    const description = document.getElementById('prod-form-description')?.value.trim() || '';
    const inStock = document.getElementById('prod-form-in-stock')?.checked ?? true;
    const isBestseller = document.getElementById('prod-form-is-bestseller')?.checked ?? false;
    const isNewArrival = document.getElementById('prod-form-is-new')?.checked ?? false;
    const prodId = document.getElementById('prod-modal-id')?.value;

    if (!title) {
      showToast('Please enter a product name.', 'error');
      return;
    }

    // Collect variants from the Pack Sizes table
    const varRows = document.querySelectorAll('#prod-variants-container .variant-item-row');
    if (varRows.length === 0) {
      showToast('Please add at least one pack size and price.', 'error');
      return;
    }

    const variants = [];
    let primaryPrice = 0;
    let primaryMRP = 0;
    let primaryUnit = '';
    let totalStock = 0;

    for (let i = 0; i < varRows.length; i++) {
      const sizeInput = varRows[i].querySelector('.var-size-input');
      const priceInput = varRows[i].querySelector('.var-price-input');
      const mrpInput = varRows[i].querySelector('.var-mrp-input');
      const stockInput = varRows[i].querySelector('.var-stock-input');

      const size = sizeInput?.value.trim() || 'Standard Pack';
      const price = Number(priceInput?.value) || 0;
      const mrp = Number(mrpInput?.value) || price;
      const stock = Number(stockInput?.value) || 0;

      if (price <= 0) {
        showToast(`Please enter a valid selling price for ${size}.`, 'error');
        priceInput?.focus();
        return;
      }

      if (i === 0) {
        primaryPrice = price;
        primaryMRP = mrp;
        primaryUnit = size;
      }

      totalStock += stock;

      variants.push({
        size,
        price,
        mrp,
        stock
      });
    }

    const discount = primaryMRP > primaryPrice ? Math.round(((primaryMRP - primaryPrice) / primaryMRP) * 100) : 0;
    
    // Existing product or new SKU
    let existing = prodId ? db.products.find(p => p.id === prodId) : null;
    const generatedSku = existing?.sku || `EN-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const finalGallery = currentProductGallery.length > 0 ? [...currentProductGallery] : ['assets/prod_honey_studio.jpg'];
    const primaryImage = finalGallery[0];

    const productPayload = {
      id: prodId || ('prod_' + Date.now()),
      title,
      sku: generatedSku,
      category,
      image: primaryImage,
      gallery: finalGallery,
      price: primaryPrice,
      original_price: primaryMRP,
      discount,
      unit: primaryUnit,
      stock_qty: totalStock,
      in_stock: inStock && totalStock > 0,
      is_bestseller: isBestseller,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      description,
      variants,
      rating: existing?.rating || 4.9,
      reviews_count: existing?.reviewsCount || 24,
      sort_order: existing?.sortOrder || 1
    };

    await withActionSpinner(btn, async () => {
      // Save to Supabase Cloud / Mock DB
      if (window.CloudDB) {
        await window.CloudDB.saveProduct(productPayload);
      }

      // Update in-memory db
      const normalized = normalizeProductFromDB(productPayload);
      normalized.variants = variants;

      if (prodId) {
        const idx = db.products.findIndex(p => p.id === prodId);
        if (idx !== -1) db.products[idx] = normalized;
      } else {
        db.products.unshift(normalized);
      }

      closeModal();
      renderProductsTable();
      renderInventoryTable();
      showToast(`Product "${title}" saved successfully!`, 'success');
    });
  }

  function normalizeProductFromDB(p) {
    return {
      id: p.id,
      title: p.title || '',
      sku: p.sku || '',
      category: p.category || 'General',
      image: p.image || (Array.isArray(p.gallery) && p.gallery[0]) || 'assets/prod_honey_studio.jpg',
      gallery: p.gallery || (p.image ? [p.image] : []),
      price: Number(p.price) || 0,
      originalPrice: Number(p.original_price ?? p.price ?? 0),
      discount: Number(p.discount) || 0,
      unit: p.unit || 'Pack',
      badge: p.badge || '',
      rating: Number(p.rating) || 4.9,
      reviewsCount: Number(p.reviews_count ?? 12),
      highlights: p.highlights || [],
      inStock: p.in_stock !== false,
      stockQty: Number(p.stock_qty ?? 50),
      isBestseller: !!p.is_bestseller,
      isFeatured: !!p.is_featured,
      isNewArrival: !!p.is_new_arrival,
      sortOrder: Number(p.sort_order || 1),
      shortSummary: p.short_summary || '',
      description: p.description || '',
      benefits: p.benefits || '',
      ingredients: p.ingredients || '',
      nutritionalInfo: p.nutritional_info || '',
      storageInstructions: p.storage_instructions || ''
    };
  }

  function normalizeCategoryFromDB(c) {
    return {
      id: c.id,
      name: c.name || '',
      tagline: c.tagline || '',
      image: c.image || 'assets/prod_cookie_studio.jpg',
      icon: c.icon || 'ri-apps-2-line',
      sortOrder: Number(c.sort_order || 1),
      showOnHome: c.show_on_home !== false,
      showInShop: c.show_in_shop !== false
    };
  }

  function normalizeOrderFromDB(o) {
    return {
      id: o.id,
      orderNumber: o.order_number || o.id,
      date: o.created_at || new Date().toISOString(),
      customerName: o.customer_name || 'Customer',
      customerPhone: o.customer_phone || '',
      customerEmail: o.customer_email || '',
      deliveryAddress: typeof o.delivery_address === 'object' ? o.delivery_address : { address: o.delivery_address || '' },
      items: Array.isArray(o.items) ? o.items.map(i => ({
        id: i.id,
        title: i.title,
        unit: i.unit || 'Pack',
        price: Number(i.price) || 0,
        qty: Number(i.qty) || 1,
        total: (Number(i.price) || 0) * (Number(i.qty) || 1)
      })) : [],
      subtotal: Number(o.subtotal) || 0,
      deliveryFee: Number(o.delivery_fee) || 0,
      discountAmount: Number(o.discount_amount) || 0,
      totalAmount: Number(o.total_amount) || 0,
      paymentMethod: o.payment_method || 'COD',
      paymentStatus: o.payment_status || 'Pending',
      orderStatus: o.order_status || 'Order Confirmed',
      trackingId: o.tracking_id || '',
      adminNotes: o.admin_notes || ''
    };
  }

  async function loadCloudData() {
    if (window.CloudDB && window.CloudDB.isSupabaseActive()) {
      try {
        const [cloudProds, cloudCats, cloudOrders, cloudCusts] = await Promise.all([
          window.CloudDB.getProducts(),
          window.CloudDB.getCategories(),
          window.CloudDB.getOrders(),
          window.CloudDB.getCustomers()
        ]);
        if (cloudProds) {
          db.products = cloudProds.map(normalizeProductFromDB);
        }
        if (cloudCats) {
          db.categories = cloudCats.map(normalizeCategoryFromDB);
        }
        if (cloudOrders) {
          db.orders = cloudOrders.map(normalizeOrderFromDB);
        }
        if (cloudCusts) {
          db.customers = cloudCusts;
        }
        renderActiveView(activeTab);
      } catch (e) {
        console.warn('Initial cloud load notice:', e.message);
      }
    }
  }

  async function saveProductForm(btnElement) {
    const id = document.getElementById('prod-modal-id').value;
    const title = document.getElementById('prod-form-title').value.trim();
    if (!title) {
      showToast('Product title is required.', 'error');
      return;
    }

    const price = parseFloat(document.getElementById('prod-form-price').value) || 0;
    const mrp = parseFloat(document.getElementById('prod-form-mrp').value) || price;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const highlights = document.getElementById('prod-form-highlights').value.split(',').map(s => s.trim()).filter(Boolean);
    const image = document.getElementById('prod-form-image').value.trim() || 'assets/prod_honey_studio.jpg';
    const prodId = id || 'prod_' + Date.now();

    const dbPayload = {
      id: prodId,
      title,
      sku: document.getElementById('prod-form-sku').value.trim() || 'EN-GEN-' + Math.floor(Math.random() * 900),
      category: document.getElementById('prod-form-category').value,
      image: image,
      gallery: [image],
      price,
      original_price: mrp,
      discount,
      unit: document.getElementById('prod-form-unit').value.trim() || 'Pack',
      badge: document.getElementById('prod-form-badge').value.trim(),
      rating: parseFloat(document.getElementById('prod-form-rating').value) || 4.8,
      reviews_count: parseInt(document.getElementById('prod-form-reviews').value) || 12,
      stock_qty: parseInt(document.getElementById('prod-form-stock').value) || 20,
      sort_order: parseInt(document.getElementById('prod-form-sort').value) || 1,
      is_bestseller: document.getElementById('prod-form-is-bestseller').checked,
      is_featured: document.getElementById('prod-form-is-featured').checked,
      is_new_arrival: document.getElementById('prod-form-is-new').checked,
      in_stock: document.getElementById('prod-form-in-stock').checked,
      short_summary: document.getElementById('prod-form-summary').value.trim(),
      description: document.getElementById('prod-form-description').value.trim(),
      benefits: document.getElementById('prod-form-benefits').value.trim(),
      ingredients: document.getElementById('prod-form-ingredients').value.trim(),
      nutritional_info: document.getElementById('prod-form-nutrition').value.trim(),
      storage_instructions: document.getElementById('prod-form-storage').value.trim(),
      highlights,
      updated_at: new Date().toISOString()
    };

    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.classList.add('btn-loading');
    btnElement.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 6px; font-size: 16px;"></i> Saving to Cloud...`;

    try {
      if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
        const { data, error } = await window.CloudDB.supabase.from('products').upsert(dbPayload).select();
        if (error) {
          btnElement.disabled = false;
          btnElement.classList.remove('btn-loading');
          btnElement.innerHTML = originalContent;
          showToast(`Database Error: ${error.message}`, 'error');
          return; // Keep modal open, do NOT update local state
        }
      }

      // Success flow
      const localObj = normalizeProductFromDB(dbPayload);
      const idx = db.products.findIndex(p => p.id === prodId);
      if (idx !== -1) {
        db.products[idx] = localObj;
      } else {
        db.products.unshift(localObj);
      }

      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;

      closeModal();
      renderProductsTable();
      renderDashboard();
      showToast(id ? 'Product updated successfully in Supabase!' : 'New product created successfully in Supabase!', 'success');
    } catch (err) {
      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  async function toggleProductStock(productId, checkbox) {
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return;
    prod.inStock = checkbox.checked;

    if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
      await window.CloudDB.supabase.from('products').update({ in_stock: checkbox.checked, updated_at: new Date().toISOString() }).eq('id', productId);
    }
    showToast(`${prod.title} marked as ${prod.inStock ? 'In-Stock' : 'Out-of-Stock'}`, 'info');
    renderProductsTable();
    renderDashboard();
  }

  function promptDeleteProduct(productId) {
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return;
    pendingDeleteTarget = { type: 'product', id: productId, name: prod.title };
    
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to permanently delete <strong>${prod.title}</strong>? This action will remove it permanently from Supabase.`;
    openModal('modal-confirm-delete');
  }

  async function uploadProductImage(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    showToast('Uploading product image to Cloudinary...', 'info');

    try {
      if (window.CloudinaryUpload) {
        const res = await window.CloudinaryUpload.uploadImageFile(file);
        if (res && res.url) {
          document.getElementById('prod-form-image').value = res.url;
          updateImagePreview('prod-form-image', 'prod-form-img-preview');
          showToast('Image uploaded successfully to Cloudinary!', 'success');
          return;
        }
      }
      if (window.ImageUploader) {
        const url = await window.ImageUploader.upload(file);
        document.getElementById('prod-form-image').value = url;
        updateImagePreview('prod-form-image', 'prod-form-img-preview');
        showToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Image upload notice: ' + err.message, 'warning');
    }
  }

  // =========================================================================
  // 6. CATEGORIES MANAGEMENT
  // =========================================================================
  function renderCategoriesView() {
    const grid = document.getElementById('categories-cards-grid');
    if (!grid) return;

    grid.innerHTML = db.categories.map(c => `
      <div class="category-admin-card">
        <div class="cat-card-header">
          <img src="${c.image}" alt="${c.name}" class="cat-card-thumb">
          <div class="cat-card-details">
            <div class="cat-card-name">${c.name}</div>
            <div class="cat-card-tagline">${c.tagline}</div>
          </div>
          <div class="cat-card-order-badge">Order: ${c.sortOrder}</div>
        </div>

        <div class="cat-visibility-controls">
          <label class="cat-vis-chip">
            <input type="checkbox" ${c.showOnHome ? 'checked' : ''} onchange="AdminController.toggleCategoryVisibility('${c.id}', 'home', this.checked)">
            <span>Show on Home</span>
          </label>
          <label class="cat-vis-chip">
            <input type="checkbox" ${c.showInShop ? 'checked' : ''} onchange="AdminController.toggleCategoryVisibility('${c.id}', 'shop', this.checked)">
            <span>Show in Shop</span>
          </label>
        </div>

        <div class="cat-card-actions">
          <button class="btn btn-sm btn-subtle" onclick="AdminController.openCategoryModal('${c.id}')"><i class="ri-pencil-line"></i> Edit</button>
          <button class="btn btn-sm btn-danger-subtle" onclick="AdminController.promptDeleteCategory('${c.id}')"><i class="ri-delete-bin-line"></i> Delete</button>
        </div>
      </div>
    `).join('');
  }

  function openCategoryModal(categoryId = null) {
    document.getElementById('form-category').reset();
    document.getElementById('cat-modal-id').value = categoryId || '';
    document.getElementById('cat-modal-title-heading').innerText = categoryId ? 'Edit Category' : 'Add New Category';

    if (categoryId) {
      const cat = db.categories.find(c => c.id === categoryId);
      if (cat) {
        document.getElementById('cat-form-name').value = cat.name;
        document.getElementById('cat-form-tagline').value = cat.tagline;
        document.getElementById('cat-form-image').value = cat.image;
        document.getElementById('cat-form-sort').value = cat.sortOrder;
        document.getElementById('cat-form-show-home').checked = cat.showOnHome;
        document.getElementById('cat-form-show-shop').checked = cat.showInShop;
        updateImagePreview('cat-form-image', 'cat-form-img-preview');
      }
    } else {
      document.getElementById('cat-form-image').value = 'assets/prod_cookie_studio.jpg';
      updateImagePreview('cat-form-image', 'cat-form-img-preview');
    }

    openModal('modal-category-form');
  }

  async function saveCategoryForm(btnElement) {
    const id = document.getElementById('cat-modal-id').value;
    const name = document.getElementById('cat-form-name').value.trim();
    if (!name) {
      showToast('Category name is required.', 'error');
      return;
    }

    const catId = id || 'cat_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dbPayload = {
      id: catId,
      name,
      tagline: document.getElementById('cat-form-tagline').value.trim(),
      image: document.getElementById('cat-form-image').value.trim() || 'assets/prod_honey_studio.jpg',
      icon: 'ri-apps-2-line',
      sort_order: parseInt(document.getElementById('cat-form-sort').value) || 1,
      show_on_home: document.getElementById('cat-form-show-home').checked,
      show_in_shop: document.getElementById('cat-form-show-shop').checked,
      updated_at: new Date().toISOString()
    };

    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.classList.add('btn-loading');
    btnElement.innerHTML = `<i class="ri-loader-4-line ri-spin" style="margin-right: 6px; font-size: 16px;"></i> Saving to Cloud...`;

    try {
      if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
        const { data, error } = await window.CloudDB.supabase.from('categories').upsert(dbPayload).select();
        if (error) {
          btnElement.disabled = false;
          btnElement.classList.remove('btn-loading');
          btnElement.innerHTML = originalContent;
          showToast(`Database Error: ${error.message}`, 'error');
          return; // Keep modal open, do NOT update local state
        }
      }

      const localObj = normalizeCategoryFromDB(dbPayload);
      const idx = db.categories.findIndex(c => c.id === catId);
      if (idx !== -1) {
        db.categories[idx] = localObj;
      } else {
        db.categories.push(localObj);
      }

      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;

      closeModal();
      renderCategoriesView();
      renderProductsTable();
      showToast(id ? 'Category updated in Supabase!' : 'New category created in Supabase!', 'success');
    } catch (err) {
      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;
      showToast(`Error: ${err.message}`, 'error');
    }
  }

  async function toggleCategoryVisibility(catId, target, isChecked) {
    const cat = db.categories.find(c => c.id === catId);
    if (!cat) return;
    if (target === 'home') cat.showOnHome = isChecked;
    if (target === 'shop') cat.showInShop = isChecked;

    if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
      const updateField = target === 'home' ? { show_on_home: isChecked, updated_at: new Date().toISOString() } : { show_in_shop: isChecked, updated_at: new Date().toISOString() };
      await window.CloudDB.supabase.from('categories').update(updateField).eq('id', catId);
    }
    showToast(`Updated visibility for ${cat.name}`, 'info');
  }

  function promptDeleteCategory(catId) {
    const cat = db.categories.find(c => c.id === catId);
    if (!cat) return;
    pendingDeleteTarget = { type: 'category', id: catId, name: cat.name };
    
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to delete category <strong>${cat.name}</strong> from Supabase?`;
    openModal('modal-confirm-delete');
  }

  async function uploadCategoryImage(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    showToast('Uploading category image to Cloudinary...', 'info');

    try {
      if (window.CloudinaryUpload) {
        const res = await window.CloudinaryUpload.uploadImageFile(file);
        if (res && res.url) {
          document.getElementById('cat-form-image').value = res.url;
          updateImagePreview('cat-form-image', 'cat-form-img-preview');
          showToast('Category image uploaded to Cloudinary!', 'success');
          return;
        }
      }
      if (window.ImageUploader) {
        const url = await window.ImageUploader.upload(file);
        document.getElementById('cat-form-image').value = url;
        updateImagePreview('cat-form-image', 'cat-form-img-preview');
        showToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Image upload notice: ' + err.message, 'warning');
    }
  }

  // =========================================================================
  // 7. HERO CAROUSEL BANNERS CMS
  // =========================================================================
  function renderBannersView() {
    const container = document.getElementById('banners-cards-grid');
    if (!container) return;

    container.innerHTML = db.heroBanners.map(b => `
      <div class="cms-banner-card">
        <div class="banner-preview-img-box">
          <img src="${b.desktopImage}" alt="${b.headline}" class="banner-preview-img">
          <span class="banner-status-badge ${b.isActive ? 'active' : 'inactive'}">${b.isActive ? 'Active' : 'Draft'}</span>
          <span class="banner-order-badge">Slide #${b.displayOrder}</span>
        </div>
        <div class="banner-card-body">
          <div class="banner-eyebrow">${b.eyebrow}</div>
          <h4 class="banner-headline">${b.headline}</h4>
          <p class="banner-tagline">${b.tagline}</p>
          <div class="banner-cta-chip">
            <i class="ri-link"></i> ${b.btnText} ➔ <code>${b.targetLink}</code>
          </div>
        </div>
        <div class="banner-card-footer">
          <button class="btn btn-sm btn-subtle" onclick="AdminController.openBannerModal('${b.id}')"><i class="ri-pencil-line"></i> Edit</button>
          <button class="btn btn-sm btn-danger-subtle" onclick="AdminController.promptDeleteBanner('${b.id}')"><i class="ri-delete-bin-line"></i> Delete</button>
        </div>
      </div>
    `).join('');
  }

  function openBannerModal(bannerId = null) {
    document.getElementById('form-banner').reset();
    document.getElementById('banner-modal-id').value = bannerId || '';
    document.getElementById('banner-modal-title-heading').innerText = bannerId ? 'Edit Hero Banner' : 'Add New Hero Banner';

    if (bannerId) {
      const b = db.heroBanners.find(x => x.id === bannerId);
      if (b) {
        document.getElementById('banner-form-eyebrow').value = b.eyebrow;
        document.getElementById('banner-form-headline').value = b.headline;
        document.getElementById('banner-form-tagline').value = b.tagline;
        document.getElementById('banner-form-desktop-img').value = b.desktopImage;
        document.getElementById('banner-form-mobile-img').value = b.mobileImage;
        document.getElementById('banner-form-btn-text').value = b.btnText;
        document.getElementById('banner-form-target-link').value = b.targetLink;
        document.getElementById('banner-form-order').value = b.displayOrder;
        document.getElementById('banner-form-active').checked = b.isActive;
        updateImagePreview('banner-form-desktop-img', 'banner-form-img-preview');
      }
    } else {
      document.getElementById('banner-form-desktop-img').value = 'assets/hero_banner.jpg';
      updateImagePreview('banner-form-desktop-img', 'banner-form-img-preview');
    }

    openModal('modal-banner-form');
  }

  function saveBannerForm(btnElement) {
    const id = document.getElementById('banner-modal-id').value;
    const headline = document.getElementById('banner-form-headline').value.trim();
    if (!headline) {
      showToast('Banner headline is required.', 'error');
      return;
    }

    withActionSpinner(btnElement, () => {
      const payload = {
        id: id || 'ban_' + Date.now(),
        eyebrow: document.getElementById('banner-form-eyebrow').value.trim(),
        headline,
        tagline: document.getElementById('banner-form-tagline').value.trim(),
        desktopImage: document.getElementById('banner-form-desktop-img').value.trim() || 'assets/hero_banner.jpg',
        mobileImage: document.getElementById('banner-form-mobile-img').value.trim() || 'assets/hero_banner.jpg',
        btnText: document.getElementById('banner-form-btn-text').value.trim() || 'Shop Now',
        targetLink: document.getElementById('banner-form-target-link').value.trim() || 'categories.html',
        displayOrder: parseInt(document.getElementById('banner-form-order').value) || 1,
        isActive: document.getElementById('banner-form-active').checked
      };

      if (id) {
        const idx = db.heroBanners.findIndex(b => b.id === id);
        if (idx !== -1) db.heroBanners[idx] = payload;
      } else {
        db.heroBanners.push(payload);
      }

      closeModal();
      renderBannersView();
    }, id ? 'Hero banner updated successfully!' : 'New hero banner created!');
  }

  function promptDeleteBanner(bannerId) {
    const b = db.heroBanners.find(x => x.id === bannerId);
    if (!b) return;
    pendingDeleteTarget = { type: 'banner', id: bannerId, name: b.headline };
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to delete banner <strong>${b.headline}</strong>?`;
    openModal('modal-confirm-delete');
  }

  // =========================================================================
  // 8. SEASONAL & FESTIVE SPECIALS CMS
  // =========================================================================
  async function uploadImageToCloudinary(file) {
    const config = window.STORE_CONFIG?.cloudinary || {
      cloudName: 'ewrpjo2g',
      uploadPreset: 'eternal_products'
    };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset || 'eternal_products');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName || 'ewrpjo2g'}/image/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to upload image to Cloudinary');
    }
    const data = await res.json();
    return data.secure_url;
  }

  function renderFestiveSpecialsView() {
    const f = db.festiveSpecials;
    const container = document.getElementById('festive-cards-container');
    if (!container) return;

    const eyebrowInput = document.getElementById('festive-banner-eyebrow-input');
    const headlineInput = document.getElementById('festive-banner-headline-input');
    const activeToggle = document.getElementById('festive-active-toggle');

    if (eyebrowInput) eyebrowInput.value = f.eyebrow || '';
    if (headlineInput) headlineInput.value = f.headline || '';
    if (activeToggle) activeToggle.checked = f.isActive !== false;

    const categoriesList = db.categories || [];

    container.innerHTML = f.cards.map((c, i) => `
      <div class="festive-admin-card-item">
        <div class="festive-card-image-box">
          <img src="${c.image}" alt="${c.title}" class="festive-card-thumb" id="festive-preview-img-${i}">
          <button type="button" class="festive-upload-overlay-btn" id="btn-upload-festive-${i}" onclick="AdminController.triggerFestivePhotoUpload(${i})">
            <i class="ri-camera-lens-line"></i> <span>Change Photo</span>
          </button>
          <input type="file" id="festive-file-input-${i}" accept="image/*" style="display: none;" onchange="AdminController.handleFestivePhotoUpload(${i}, this)">
        </div>

        <div class="festive-card-fields">
          <div>
            <div class="festive-field-label">Display Title</div>
            <input type="text" class="form-input form-input-sm" value="${c.title}" onchange="AdminController.updateFestiveCard(${i}, 'title', this.value)" placeholder="e.g. Rakhi Specials">
          </div>

          <div>
            <div class="festive-field-label">Tagline / Sub-Label</div>
            <input type="text" class="form-input form-input-sm" value="${c.subLabel}" onchange="AdminController.updateFestiveCard(${i}, 'subLabel', this.value)" placeholder="e.g. Dates Laddus">
          </div>

          <div>
            <div class="festive-field-label">Link to Category</div>
            <select class="form-select form-select-sm" onchange="AdminController.updateFestiveCard(${i}, 'targetCategory', this.value)">
              ${categoriesList.map(cat => `<option value="${cat.name}" ${cat.name === c.targetCategory ? 'selected' : ''}>${cat.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <div class="festive-field-label">Image URL</div>
            <input type="text" class="form-input form-input-sm" value="${c.image}" onchange="AdminController.updateFestiveCardImageURL(${i}, this.value)" placeholder="https://res.cloudinary.com/...">
          </div>
        </div>
      </div>
    `).join('');
  }

  function triggerFestivePhotoUpload(index) {
    const fileInput = document.getElementById(`festive-file-input-${index}`);
    if (fileInput) fileInput.click();
  }

  async function handleFestivePhotoUpload(index, inputElement) {
    const file = inputElement.files?.[0];
    if (!file) return;

    const btn = document.getElementById(`btn-upload-festive-${index}`);
    const originalBtnHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Uploading...`;
    }

    try {
      const cdnUrl = await uploadImageToCloudinary(file);
      if (db.festiveSpecials.cards[index]) {
        db.festiveSpecials.cards[index].image = cdnUrl;
      }
      const previewImg = document.getElementById(`festive-preview-img-${index}`);
      if (previewImg) previewImg.src = cdnUrl;

      showToast(`Photo uploaded to Cloudinary for Card #${index + 1}!`, 'success');
      renderFestiveSpecialsView();
    } catch (err) {
      showToast(`Cloudinary Upload Error: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
      }
    }
  }

  function updateFestiveCardImageURL(index, url) {
    if (db.festiveSpecials.cards[index]) {
      db.festiveSpecials.cards[index].image = url.trim();
      const previewImg = document.getElementById(`festive-preview-img-${index}`);
      if (previewImg) previewImg.src = url.trim();
      showToast('Image URL updated.', 'info');
    }
  }

  function updateFestiveCard(index, field, value) {
    if (db.festiveSpecials.cards[index]) {
      db.festiveSpecials.cards[index][field] = value.trim();
      showToast('Card updated. Click Save Spotlight Changes to apply.', 'info');
    }
  }

  function toggleFestiveActive(isActive) {
    db.festiveSpecials.isActive = isActive;
    showToast(`Festive banner is now ${isActive ? 'ACTIVE' : 'HIDDEN'} on store.`, isActive ? 'success' : 'warning');
  }

  function saveFestiveSpecialsForm(btnElement) {
    withActionSpinner(btnElement, () => {
      db.festiveSpecials.eyebrow = document.getElementById('festive-banner-eyebrow-input').value.trim();
      db.festiveSpecials.headline = document.getElementById('festive-banner-headline-input').value.trim();
      db.festiveSpecials.isActive = document.getElementById('festive-active-toggle')?.checked !== false;
    }, 'Festive Spotlight banner updated and applied to store!');
  }

  // =========================================================================
  // 9. CONTINUOUS MARQUEE RIBBON CMS
  // =========================================================================
  function renderMarqueeView() {
    const container = document.getElementById('marquee-items-list');
    if (!container) return;

    container.innerHTML = db.announcementItems.map((ann, idx) => `
      <div class="marquee-item-row">
        <span class="drag-handle"><i class="ri-draggable"></i></span>
        <i class="${ann.icon} marquee-item-icon"></i>
        <input type="text" class="form-input form-input-sm marquee-text-input" value="${ann.text}" onchange="AdminController.updateMarqueeText('${ann.id}', this.value)">
        <label class="switch-toggle switch-sm" title="Active">
          <input type="checkbox" ${ann.isActive ? 'checked' : ''} onchange="AdminController.toggleMarqueeActive('${ann.id}', this.checked)">
          <span class="slider round"></span>
        </label>
        <button class="icon-action-btn delete-btn" onclick="AdminController.deleteMarqueeItem('${ann.id}')"><i class="ri-delete-bin-line"></i></button>
      </div>
    `).join('');
  }

  function updateMarqueeText(id, text) {
    const item = db.announcementItems.find(a => a.id === id);
    if (item) {
      item.text = text;
      showToast('Announcement text updated.', 'info');
    }
  }

  function toggleMarqueeActive(id, isActive) {
    const item = db.announcementItems.find(a => a.id === id);
    if (item) {
      item.isActive = isActive;
      showToast(`Announcement ${isActive ? 'enabled' : 'disabled'}.`, 'info');
    }
  }

  function addMarqueeItem() {
    const newItem = {
      id: 'ann_' + Date.now(),
      text: 'New organic store announcement...',
      icon: 'ri-leaf-fill',
      isActive: true,
      sortOrder: db.announcementItems.length + 1
    };
    db.announcementItems.push(newItem);
    renderMarqueeView();
    showToast('New announcement ticker item added!', 'success');
  }

  function deleteMarqueeItem(id) {
    db.announcementItems = db.announcementItems.filter(a => a.id !== id);
    renderMarqueeView();
    showToast('Announcement item removed.', 'info');
  }

  // =========================================================================
  // 10. ORDERS MANAGEMENT & INSPECTOR
  // =========================================================================
  function renderOrdersTable() {
    const statusFilter = document.getElementById('order-filter-status')?.value || 'All';
    const searchVal = document.getElementById('order-search-input')?.value.toLowerCase().trim() || '';

    let list = [...db.orders];

    if (statusFilter !== 'All') {
      list = list.filter(o => o.orderStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchVal) {
      list = list.filter(o => o.orderNumber.toLowerCase().includes(searchVal) || o.customerName.toLowerCase().includes(searchVal) || o.customerPhone.includes(searchVal));
    }

    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-empty-state"><i class="ri-shopping-bag-3-line"></i><div>No matching orders found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(o => `
      <tr onclick="AdminController.openOrderInspector('${o.id}')" style="cursor: pointer;">
        <td>
          <span class="table-order-num">${o.orderNumber}</span>
          <div class="table-order-time">${new Date(o.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td>
          <div class="order-cust-name">${o.customerName}</div>
          <div class="order-cust-phone">${o.customerPhone}</div>
        </td>
        <td>
          <span class="order-items-count">${o.items.reduce((s, x) => s + x.qty, 0)} Items</span>
        </td>
        <td>
          <div class="order-total-val">₹${o.totalAmount}</div>
          <div class="order-pay-method">${o.paymentMethod}</div>
        </td>
        <td>
          <span class="pay-status-pill pay-${o.paymentStatus.toLowerCase()}">${o.paymentStatus}</span>
        </td>
        <td>
          <span class="order-status-chip status-${o.orderStatus.toLowerCase().replace(/\s+/g, '-')}">${o.orderStatus}</span>
        </td>
        <td class="table-actions-col" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-outline-primary" onclick="AdminController.openOrderInspector('${o.id}')">View</button>
        </td>
      </tr>
    `).join('');
  }

  function openOrderInspector(orderId) {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return;
    currentInspectedOrder = order;

    document.getElementById('insp-order-num').innerText = order.orderNumber;
    document.getElementById('insp-order-date').innerText = new Date(order.date).toLocaleString('en-IN');
    document.getElementById('insp-order-status-select').value = order.orderStatus;
    document.getElementById('insp-pay-status-select').value = order.paymentStatus;
    
    // Customer Info
    document.getElementById('insp-cust-name').innerText = order.customerName;
    document.getElementById('insp-cust-phone').innerText = order.customerPhone;
    document.getElementById('insp-cust-phone-link').href = `tel:${order.customerPhone}`;
    document.getElementById('insp-cust-email').innerText = order.customerEmail;
    
    // Address
    const addr = order.deliveryAddress;
    document.getElementById('insp-cust-address').innerText = `${addr.flat}, ${addr.street}, ${addr.area}, ${addr.landmark ? 'Landmark: ' + addr.landmark + ', ' : ''}${addr.city} - ${addr.pincode}`;
    
    // Line Items
    document.getElementById('insp-items-table-body').innerHTML = order.items.map(item => `
      <tr>
        <td>
          <strong>${item.title}</strong>
          <div class="text-muted" style="font-size: 11.5px;">${item.unit}</div>
        </td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">₹${item.price}</td>
        <td style="text-align: right; font-weight: 700;">₹${item.total}</td>
      </tr>
    `).join('');

    // Summary
    document.getElementById('insp-subtotal').innerText = `₹${order.subtotal}`;
    document.getElementById('insp-delivery-fee').innerText = order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`;
    document.getElementById('insp-discount').innerText = order.discountAmount === 0 ? '₹0' : `-₹${order.discountAmount}`;
    document.getElementById('insp-final-total').innerText = `₹${order.totalAmount}`;
    
    // Notes & Tracking
    document.getElementById('insp-admin-notes').value = order.adminNotes || '';
    document.getElementById('insp-tracking-id').value = order.trackingId || '';

    openModal('modal-order-inspector');
  }

  async function saveOrderInspector(btnElement) {
    if (!currentInspectedOrder) return;
    const orderStatus = document.getElementById('insp-order-status-select').value;
    const paymentStatus = document.getElementById('insp-pay-status-select').value;
    const adminNotes = document.getElementById('insp-admin-notes').value;
    const trackingId = document.getElementById('insp-tracking-id').value;

    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.classList.add('btn-loading');
    btnElement.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Saving to Cloud...`;

    try {
      if (window.CloudDB) {
        await window.CloudDB.updateOrderStatus(currentInspectedOrder.id, {
          order_status: orderStatus,
          payment_status: paymentStatus,
          admin_notes: adminNotes,
          tracking_id: trackingId
        });
      }

      currentInspectedOrder.orderStatus = orderStatus;
      currentInspectedOrder.paymentStatus = paymentStatus;
      currentInspectedOrder.adminNotes = adminNotes;
      currentInspectedOrder.trackingId = trackingId;

      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;

      renderOrdersTable();
      renderDashboard();
      closeModal();
      showToast(`Order ${currentInspectedOrder.orderNumber} updated in Supabase!`, 'success');
    } catch (err) {
      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;
      showToast(`Update error: ${err.message}`, 'error');
    }
  }

  function sendWhatsAppUpdate() {
    if (!currentInspectedOrder) return;
    const cleanPhone = currentInspectedOrder.customerPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${currentInspectedOrder.customerName}!\n\nYour Eternal Nutricare Order *${currentInspectedOrder.orderNumber}* status is now: *${currentInspectedOrder.orderStatus.toUpperCase()}*.\nTotal: ₹${currentInspectedOrder.totalAmount}\n${currentInspectedOrder.trackingId ? 'Tracking ID: ' + currentInspectedOrder.trackingId + '\n' : ''}\nThank you for choosing pure, natural & organic living with Eternal Nutricare!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  }

  // =========================================================================
  // 11. COUPONS & DISCOUNTS MANAGEMENT
  // =========================================================================
  function renderCouponsView() {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    tbody.innerHTML = db.coupons.map(c => `
      <tr>
        <td>
          <span class="coupon-code-pill">${c.code}</span>
        </td>
        <td>
          <span class="coupon-type-badge">${c.type === 'percentage' ? c.value + '% OFF' : '₹' + c.value + ' FLAT'}</span>
        </td>
        <td>₹${c.minOrderValue}</td>
        <td>${c.maxDiscount ? '₹' + c.maxDiscount : 'No Limit'}</td>
        <td>${c.expiryDate}</td>
        <td>
          <div class="usage-progress-bar">
            <span>${c.totalUsed} / ${c.usageLimit}</span>
          </div>
        </td>
        <td>
          <label class="switch-toggle switch-sm">
            <input type="checkbox" ${c.isActive ? 'checked' : ''} onchange="AdminController.toggleCouponActive('${c.id}', this.checked)">
            <span class="slider round"></span>
          </label>
        </td>
        <td class="table-actions-col">
          <button class="icon-action-btn edit-btn" onclick="AdminController.openCouponModal('${c.id}')"><i class="ri-pencil-line"></i></button>
          <button class="icon-action-btn delete-btn" onclick="AdminController.promptDeleteCoupon('${c.id}')"><i class="ri-delete-bin-line"></i></button>
        </td>
      </tr>
    `).join('');
  }

  function openCouponModal(couponId = null) {
    document.getElementById('form-coupon').reset();
    document.getElementById('coupon-modal-id').value = couponId || '';
    document.getElementById('coupon-modal-title-heading').innerText = couponId ? 'Edit Coupon' : 'Create Coupon';

    if (couponId) {
      const c = db.coupons.find(x => x.id === couponId);
      if (c) {
        document.getElementById('coupon-form-code').value = c.code;
        document.getElementById('coupon-form-type').value = c.type;
        document.getElementById('coupon-form-val').value = c.value;
        document.getElementById('coupon-form-mov').value = c.minOrderValue;
        document.getElementById('coupon-form-cap').value = c.maxDiscount || '';
        document.getElementById('coupon-form-expiry').value = c.expiryDate;
        document.getElementById('coupon-form-limit').value = c.usageLimit;
        document.getElementById('coupon-form-active').checked = c.isActive;
      }
    } else {
      document.getElementById('coupon-form-mov').value = 999;
      document.getElementById('coupon-form-expiry').value = '2026-12-31';
      document.getElementById('coupon-form-limit').value = 500;
    }

    openModal('modal-coupon-form');
  }

  function saveCouponForm(btnElement) {
    const id = document.getElementById('coupon-modal-id').value;
    const code = document.getElementById('coupon-form-code').value.toUpperCase().trim();
    if (!code) {
      showToast('Coupon code is required.', 'error');
      return;
    }

    withActionSpinner(btnElement, () => {
      const payload = {
        id: id || 'cp_' + Date.now(),
        code,
        type: document.getElementById('coupon-form-type').value,
        value: parseFloat(document.getElementById('coupon-form-val').value) || 10,
        minOrderValue: parseFloat(document.getElementById('coupon-form-mov').value) || 999,
        maxDiscount: parseFloat(document.getElementById('coupon-form-cap').value) || 0,
        expiryDate: document.getElementById('coupon-form-expiry').value,
        usageLimit: parseInt(document.getElementById('coupon-form-limit').value) || 500,
        totalUsed: id ? (db.coupons.find(x => x.id === id)?.totalUsed || 0) : 0,
        isActive: document.getElementById('coupon-form-active').checked
      };

      if (id) {
        const idx = db.coupons.findIndex(x => x.id === id);
        if (idx !== -1) db.coupons[idx] = payload;
      } else {
        db.coupons.push(payload);
      }

      closeModal();
      renderCouponsView();
    }, id ? 'Coupon updated!' : 'Coupon created!');
  }

  function toggleCouponActive(id, isActive) {
    const c = db.coupons.find(x => x.id === id);
    if (c) {
      c.isActive = isActive;
      showToast(`Coupon ${c.code} is now ${isActive ? 'Active' : 'Inactive'}.`, 'info');
    }
  }

  function promptDeleteCoupon(couponId) {
    const c = db.coupons.find(x => x.id === couponId);
    if (!c) return;
    pendingDeleteTarget = { type: 'coupon', id: couponId, name: c.code };
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to delete coupon <strong>${c.code}</strong>?`;
    openModal('modal-confirm-delete');
  }

  // =========================================================================
  // 12. INVENTORY LEDGER
  // =========================================================================
  function renderInventoryTable() {
    const products = db.products || [];

    // Update KPI summary cards
    const totalSKUs = products.length;
    const healthyCount = products.filter(p => p.stockQty > 10).length;
    const lowCount = products.filter(p => p.stockQty > 0 && p.stockQty <= 10).length;
    const outCount = products.filter(p => p.stockQty === 0).length;

    const elTotal = document.getElementById('inv-stat-total-skus');
    const elHealthy = document.getElementById('inv-stat-healthy');
    const elLow = document.getElementById('inv-stat-low');
    const elOut = document.getElementById('inv-stat-out');

    if (elTotal) elTotal.innerText = totalSKUs;
    if (elHealthy) elHealthy.innerText = healthyCount;
    if (elLow) elLow.innerText = lowCount;
    if (elOut) elOut.innerText = outCount;

    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    const searchVal = document.getElementById('inv-search-input')?.value.toLowerCase().trim() || '';
    const stockFilter = document.getElementById('inv-filter-stock')?.value || 'All';

    let list = [...products];

    if (stockFilter === 'Healthy') {
      list = list.filter(p => p.stockQty > 10);
    } else if (stockFilter === 'LowStock') {
      list = list.filter(p => p.stockQty > 0 && p.stockQty <= 10);
    } else if (stockFilter === 'OutOfStock') {
      list = list.filter(p => p.stockQty === 0);
    }

    if (searchVal) {
      list = list.filter(p => p.title.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="table-empty-state">
            <i class="ri-archive-line"></i>
            <div>No matching products found in inventory.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td>
          <div class="table-product-lockup">
            <img src="${p.image}" alt="${p.title}" class="table-prod-img">
            <div>
              <div class="table-prod-title">${p.title}</div>
              <div class="table-prod-sku">SKU: ${p.sku} • ${p.unit}</div>
            </div>
          </div>
        </td>
        <td><span class="table-category-badge">${p.category}</span></td>
        <td>
          <div class="stock-counter-badge ${p.stockQty > 10 ? 'in-stock' : (p.stockQty > 0 ? 'low-stock' : 'out-of-stock')}">
            <span class="stock-dot"></span>
            <strong>${p.stockQty} Units</strong>
          </div>
        </td>
        <td>
          <div class="quick-stock-stepper">
            <button class="stepper-btn" onclick="AdminController.adjustStock('${p.id}', -5, this)">-5</button>
            <button class="stepper-btn" onclick="AdminController.adjustStock('${p.id}', -1, this)">-1</button>
            <input type="number" class="stepper-input" value="${p.stockQty}" onchange="AdminController.setStockDirect('${p.id}', this.value)">
            <button class="stepper-btn" onclick="AdminController.adjustStock('${p.id}', 1, this)">+1</button>
            <button class="stepper-btn" onclick="AdminController.adjustStock('${p.id}', 10, this)">+10</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async function adjustStock(productId, delta, btnElement) {
    const p = db.products.find(x => x.id === productId);
    if (!p) return;

    const newStock = Math.max(0, p.stockQty + delta);
    p.stockQty = newStock;
    p.inStock = newStock > 0;

    renderInventoryTable();
    renderDashboard();

    if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
      try {
        await window.CloudDB.supabase.from('products').update({
          stock_qty: newStock,
          in_stock: newStock > 0,
          updated_at: new Date().toISOString()
        }).eq('id', productId);
        showToast(`"${p.title}" stock updated to ${newStock} units in Supabase.`, 'success');
      } catch (err) {
        showToast(`Cloud stock sync notice: ${err.message}`, 'error');
      }
    } else {
      showToast(`Stock updated to ${newStock} units.`, 'info');
    }
  }

  async function setStockDirect(productId, val) {
    const p = db.products.find(x => x.id === productId);
    if (!p) return;

    const newStock = Math.max(0, parseInt(val) || 0);
    p.stockQty = newStock;
    p.inStock = newStock > 0;

    renderInventoryTable();
    renderDashboard();

    if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
      try {
        await window.CloudDB.supabase.from('products').update({
          stock_qty: newStock,
          in_stock: newStock > 0,
          updated_at: new Date().toISOString()
        }).eq('id', productId);
        showToast(`"${p.title}" stock set to ${newStock} units in Supabase.`, 'success');
      } catch (err) {
        showToast(`Cloud stock sync notice: ${err.message}`, 'error');
      }
    } else {
      showToast(`Stock updated to ${newStock} units.`, 'info');
    }
  }

  // =========================================================================
  // 13. CUSTOMER DIRECTORY (CRM)
  // =========================================================================
  async function renderCustomersView() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    let customers = db.customers;
    if (window.CloudDB) {
      try {
        const cloudCusts = await window.CloudDB.getCustomers();
        if (cloudCusts && cloudCusts.length > 0) {
          customers = cloudCusts;
          db.customers = cloudCusts;
        }
      } catch (e) {
        console.warn('Customer list cloud fetch notice:', e.message);
      }
    }

    if (customers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-empty-state"><i class="ri-user-smile-line"></i><div>No registered customers or orders yet.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>
          <div class="cust-avatar-lockup">
            <div class="cust-initial-avatar">${(c.name || 'C').charAt(0).toUpperCase()}</div>
            <div>
              <div class="cust-tbl-name">${c.name}</div>
              <div class="cust-tbl-email">${c.email || 'No email provided'}</div>
            </div>
          </div>
        </td>
        <td><a href="tel:${c.phone}" class="cust-phone-link"><i class="ri-phone-line"></i> ${c.phone || '—'}</a></td>
        <td><strong>${c.totalOrders} Orders</strong></td>
        <td><strong>₹${Number(c.lifetimeSpend || 0).toLocaleString('en-IN')}</strong></td>
        <td>${c.lastOrderDate}</td>
        <td><span class="pay-status-pill pay-${c.totalOrders > 0 ? 'paid' : 'pending'}">${c.status || 'Active'}</span></td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // 14. STORE SETTINGS & SHIPPING
  // =========================================================================
  function renderSettingsView() {
    const s = db.storeSettings;
    document.getElementById('set-biz-name').value = s.businessName;
    document.getElementById('set-brand-name').value = s.brandName;
    document.getElementById('set-tagline').value = s.tagline;
    document.getElementById('set-owner-name').value = s.ownerName;
    document.getElementById('set-phone-primary').value = s.primaryPhone;
    document.getElementById('set-phone-secondary').value = s.secondaryPhone;
    document.getElementById('set-wa-primary').value = s.primaryWhatsApp;
    document.getElementById('set-wa-secondary').value = s.secondaryWhatsApp;
    document.getElementById('set-email').value = s.supportEmail;
    document.getElementById('set-address').value = s.registeredAddress;
    document.getElementById('set-gstin').value = s.gstin;
    document.getElementById('set-udyam').value = s.udyamNumber;
    document.getElementById('set-fssai').value = s.fssaiNumber;

    // Trust stats
    s.trustStats.forEach((ts, idx) => {
      const countEl = document.getElementById(`set-ts-${idx + 1}-count`);
      const labelEl = document.getElementById(`set-ts-${idx + 1}-label`);
      if (countEl) countEl.value = ts.count;
      if (labelEl) labelEl.value = ts.label;
    });
  }

  function saveBusinessSettingsForm(btnElement) {
    withActionSpinner(btnElement, () => {
      const s = db.storeSettings;
      s.businessName = document.getElementById('set-biz-name').value.trim();
      s.brandName = document.getElementById('set-brand-name').value.trim();
      s.tagline = document.getElementById('set-tagline').value.trim();
      s.ownerName = document.getElementById('set-owner-name').value.trim();
      s.primaryPhone = document.getElementById('set-phone-primary').value.trim();
      s.secondaryPhone = document.getElementById('set-phone-secondary').value.trim();
      s.primaryWhatsApp = document.getElementById('set-wa-primary').value.trim();
      s.secondaryWhatsApp = document.getElementById('set-wa-secondary').value.trim();
      s.supportEmail = document.getElementById('set-email').value.trim();
      s.registeredAddress = document.getElementById('set-address').value.trim();
      s.gstin = document.getElementById('set-gstin').value.trim();
      s.udyamNumber = document.getElementById('set-udyam').value.trim();
      s.fssaiNumber = document.getElementById('set-fssai').value.trim();

      // Update trust stats
      s.trustStats.forEach((ts, idx) => {
        const countEl = document.getElementById(`set-ts-${idx + 1}-count`);
        const labelEl = document.getElementById(`set-ts-${idx + 1}-label`);
        if (countEl) ts.count = countEl.value.trim();
        if (labelEl) ts.label = labelEl.value.trim();
      });
    }, 'Business & legal settings saved successfully!');
  }

  function renderShippingView() {
    const s = db.storeSettings;
    document.getElementById('ship-mov').value = s.minOrderValue;
    document.getElementById('ship-free-threshold').value = s.freeShippingThreshold;
    document.getElementById('ship-std-fee').value = s.standardShippingFee;
    document.getElementById('ship-pincodes').value = s.serviceablePincodes;
    document.getElementById('ship-store-live').checked = s.isStoreLive;
    document.getElementById('ship-pause-msg').value = s.pauseNoticeMessage;
  }

  function saveShippingSettingsForm(btnElement) {
    withActionSpinner(btnElement, () => {
      const s = db.storeSettings;
      s.minOrderValue = parseFloat(document.getElementById('ship-mov').value) || 999;
      s.freeShippingThreshold = parseFloat(document.getElementById('ship-free-threshold').value) || 999;
      s.standardShippingFee = parseFloat(document.getElementById('ship-std-fee').value) || 40;
      s.serviceablePincodes = document.getElementById('ship-pincodes').value.trim();
      s.isStoreLive = document.getElementById('ship-store-live').checked;
      s.pauseNoticeMessage = document.getElementById('ship-pause-msg').value.trim();

      updateStoreStatusIndicator();
    }, 'Shipping & store rules saved successfully!');
  }

  // =========================================================================
  // 15. STORE STATUS TOGGLE (LIVE / PAUSED)
  // =========================================================================
  function updateStoreStatusIndicator() {
    const indicator = document.getElementById('header-store-status-pill');
    if (!indicator) return;
    if (db.storeSettings.isStoreLive) {
      indicator.className = 'header-status-pill status-live';
      indicator.innerHTML = `<span class="pulse-dot"></span><span>Store Open</span>`;
    } else {
      indicator.className = 'header-status-pill status-paused';
      indicator.innerHTML = `<span class="pulse-dot paused"></span><span>Orders Paused</span>`;
    }
  }

  function toggleStoreStatusHeader() {
    db.storeSettings.isStoreLive = !db.storeSettings.isStoreLive;
    updateStoreStatusIndicator();
    showToast(`Store is now ${db.storeSettings.isStoreLive ? 'OPEN & accepting orders' : 'PAUSED'}`, db.storeSettings.isStoreLive ? 'success' : 'warning');
  }

  // =========================================================================
  // 16. MODAL & DRAWER HELPERS
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(event) {
    if (event && event.target && !event.target.classList.contains('admin-modal-overlay') && !event.target.classList.contains('modal-close-trigger')) {
      return;
    }
    document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }

  async function confirmDeleteAction(btnElement) {
    if (!pendingDeleteTarget) return;

    const { type, id, name } = pendingDeleteTarget;
    const originalContent = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.classList.add('btn-loading');
    btnElement.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Deleting from Cloud...`;

    try {
      if (type === 'product') {
        if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
          const { error } = await window.CloudDB.supabase.from('products').delete().eq('id', id);
          if (error) {
            btnElement.disabled = false;
            btnElement.classList.remove('btn-loading');
            btnElement.innerHTML = originalContent;
            showToast(`Delete Error: ${error.message}`, 'error');
            return;
          }
        }
        db.products = db.products.filter(p => p.id !== id);
        renderProductsTable();
        renderDashboard();
        showToast(`Product "${name}" permanently deleted from Supabase.`, 'success');
      } else if (type === 'category') {
        if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
          const { error } = await window.CloudDB.supabase.from('categories').delete().eq('id', id);
          if (error) {
            btnElement.disabled = false;
            btnElement.classList.remove('btn-loading');
            btnElement.innerHTML = originalContent;
            showToast(`Delete Error: ${error.message}`, 'error');
            return;
          }
        }
        db.categories = db.categories.filter(c => c.id !== id);
        renderCategoriesView();
        renderProductsTable();
        showToast(`Category "${name}" permanently deleted from Supabase.`, 'success');
      } else if (type === 'banner') {
        db.heroBanners = db.heroBanners.filter(b => b.id !== id);
        renderBannersView();
        showToast('Banner deleted.', 'success');
      } else if (type === 'coupon') {
        if (window.CloudDB && window.CloudDB.isSupabaseActive() && window.CloudDB.supabase) {
          await window.CloudDB.supabase.from('coupons').delete().eq('id', id);
        }
        db.coupons = db.coupons.filter(c => c.id !== id);
        renderCouponsView();
        showToast('Coupon deleted.', 'success');
      }

      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;
      closeModal();
      pendingDeleteTarget = null;
    } catch (err) {
      btnElement.disabled = false;
      btnElement.classList.remove('btn-loading');
      btnElement.innerHTML = originalContent;
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  function updateImagePreview(inputId, previewImgId) {
    const val = document.getElementById(inputId)?.value.trim();
    const img = document.getElementById(previewImgId);
    if (img && val) {
      img.src = val;
    }
  }

  function toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  }

  function closeMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  // =========================================================================
  // 17. GLOBAL SEARCH (CTRL+K)
  // =========================================================================
  function initGlobalSearch() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('modal-global-search');
        document.getElementById('global-command-input')?.focus();
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  function handleGlobalCommandSearch(query) {
    const q = query.toLowerCase().trim();
    const resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.innerHTML = `
        <div class="cmd-section-header">Quick Navigation</div>
        <div class="cmd-result-item" onclick="AdminController.switchTab('products'); AdminController.closeModal();"><i class="ri-shopping-bag-3-line"></i> Manage Products</div>
        <div class="cmd-result-item" onclick="AdminController.switchTab('orders'); AdminController.closeModal();"><i class="ri-file-list-3-line"></i> Orders & Delivery</div>
        <div class="cmd-result-item" onclick="AdminController.switchTab('banners'); AdminController.closeModal();"><i class="ri-image-line"></i> Hero Banners CMS</div>
        <div class="cmd-result-item" onclick="AdminController.switchTab('settings'); AdminController.closeModal();"><i class="ri-settings-3-line"></i> Store & Legal Settings</div>
      `;
      return;
    }

    const matchedProducts = db.products.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    const matchedOrders = db.orders.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));

    let html = '';
    if (matchedProducts.length > 0) {
      html += `<div class="cmd-section-header">Products (${matchedProducts.length})</div>`;
      html += matchedProducts.map(p => `
        <div class="cmd-result-item" onclick="AdminController.switchTab('products'); AdminController.openProductModal('${p.id}');">
          <img src="${p.image}" class="cmd-item-thumb">
          <span>${p.title} <small class="text-muted">(SKU: ${p.sku})</small></span>
          <span class="cmd-item-price">₹${p.price}</span>
        </div>
      `).join('');
    }

    if (matchedOrders.length > 0) {
      html += `<div class="cmd-section-header">Orders (${matchedOrders.length})</div>`;
      html += matchedOrders.map(o => `
        <div class="cmd-result-item" onclick="AdminController.switchTab('orders'); AdminController.openOrderInspector('${o.id}');">
          <i class="ri-receipt-line"></i>
          <span>${o.orderNumber} - ${o.customerName}</span>
          <span class="cmd-item-price">₹${o.totalAmount}</span>
        </div>
      `).join('');
    }

    if (!html) {
      html = `<div class="p-4 text-center text-muted">No results found for "${query}".</div>`;
    }

    resultsContainer.innerHTML = html;
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  function init() {
    checkAdminSession();
    loadCloudData();
    renderDashboard();
    updateStoreStatusIndicator();
    initGlobalSearch();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    // Auth & Lockscreen
    checkAdminSession,
    handleAdminLogin,
    handleAdminLogout,

    loadCloudData,
    switchTab,
    renderActiveView,
    withActionSpinner,
    showToast,
    openModal,
    closeModal,
    confirmDeleteAction,
    updateImagePreview,
    toggleMobileSidebar,
    closeMobileSidebar,
    toggleStoreStatusHeader,
    
    // Products
    renderProductsTable,
    openProductModal,
    saveProductForm,
    addPackSizeRow,
    removePackSizeRow,
    uploadProductGallery,
    addGalleryImageUrl,
    setAsPrimaryImage,
    removeGalleryImage,
    toggleProductStock,
    promptDeleteProduct,
    uploadProductImage,
    resetProductFilters,
    toggleSelectProduct,
    toggleSelectAllProducts,
    showBulkActionsMenu,
    switchProductViewMode,
    changeProductPage,
    setProductsPerPage,

    // Categories
    renderCategoriesView,
    openCategoryModal,
    saveCategoryForm,
    toggleCategoryVisibility,
    promptDeleteCategory,
    uploadCategoryImage,

    // Banners
    renderBannersView,
    openBannerModal,
    saveBannerForm,
    promptDeleteBanner,

    // Festive Specials CMS
    renderFestiveSpecialsView,
    updateFestiveCard,
    updateFestiveCardImageURL,
    triggerFestivePhotoUpload,
    handleFestivePhotoUpload,
    toggleFestiveActive,
    saveFestiveSpecialsForm,
    uploadImageToCloudinary,

    // Marquee
    renderMarqueeView,
    updateMarqueeText,
    toggleMarqueeActive,
    addMarqueeItem,
    deleteMarqueeItem,

    // Orders
    renderOrdersTable,
    openOrderInspector,
    saveOrderInspector,
    sendWhatsAppUpdate,

    // Coupons
    renderCouponsView,
    openCouponModal,
    saveCouponForm,
    toggleCouponActive,
    promptDeleteCoupon,

    // Inventory
    renderInventoryTable,
    adjustStock,
    setStockDirect,

    // Customers
    renderCustomersView,

    // Settings
    renderSettingsView,
    saveBusinessSettingsForm,
    renderShippingView,
    saveShippingSettingsForm,

    // Search
    handleGlobalCommandSearch
  };

})();
