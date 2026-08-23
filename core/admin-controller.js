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
    const stats = db.analytics;
    
    // Top metric cards
    document.getElementById('stat-today-revenue').innerText = `₹${stats.todayRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-week-revenue').innerText = `₹${stats.weekRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-month-revenue').innerText = `₹${stats.monthRevenue.toLocaleString('en-IN')}`;
    document.getElementById('stat-alltime-revenue').innerText = `₹${stats.allTimeRevenue.toLocaleString('en-IN')}`;
    
    document.getElementById('stat-total-orders').innerText = stats.totalOrders;
    document.getElementById('stat-pending-orders').innerText = stats.pendingOrders;
    document.getElementById('stat-completed-orders').innerText = stats.completedOrders;
    document.getElementById('stat-aov').innerText = `₹${stats.averageOrderValue.toLocaleString('en-IN')}`;
    document.getElementById('stat-active-products').innerText = db.products.filter(p => p.inStock).length;
    document.getElementById('stat-low-stock').innerText = db.products.filter(p => p.stockQty <= 10).length;

    // Leaderboard
    const topProducts = db.products.filter(p => p.isBestseller).slice(0, 4);
    const leaderboardContainer = document.getElementById('dash-top-products-list');
    if (leaderboardContainer) {
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

    // Recent Orders in Dashboard
    const recentOrders = db.orders.slice(0, 4);
    const recentOrdersContainer = document.getElementById('dash-recent-orders-list');
    if (recentOrdersContainer) {
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
            <span class="order-status-chip status-${o.orderStatus.toLowerCase().replace(/\s+/g, '-')}">${o.orderStatus}</span>
          </div>
        </div>
      `).join('');
    }

    // Low stock alert banner
    const lowStockItems = db.products.filter(p => p.stockQty <= 10);
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
  function renderProductsTable() {
    const filterCat = document.getElementById('prod-filter-category')?.value || 'All';
    const filterStock = document.getElementById('prod-filter-stock')?.value || 'All';
    const searchVal = document.getElementById('prod-search-input')?.value.toLowerCase().trim() || '';

    let list = [...db.products];

    if (filterCat !== 'All') {
      list = list.filter(p => p.category === filterCat);
    }
    if (filterStock === 'InStock') {
      list = list.filter(p => p.inStock);
    } else if (filterStock === 'OutOfStock') {
      list = list.filter(p => !p.inStock);
    } else if (filterStock === 'LowStock') {
      list = list.filter(p => p.stockQty <= 10);
    }

    if (searchVal) {
      list = list.filter(p => p.title.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));
    }

    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty-state">
            <i class="ri-inbox-line"></i>
            <div>No matching products found.</div>
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
              <div class="table-prod-sku">SKU: ${p.sku}</div>
            </div>
          </div>
        </td>
        <td><span class="table-category-badge">${p.category}</span></td>
        <td>
          <div class="table-price-val">₹${p.price}</div>
          <div class="table-mrp-val">MRP ₹${p.originalPrice} <span class="disc-pct">${p.discount}% OFF</span></div>
        </td>
        <td><span class="table-unit-text">${p.unit}</span></td>
        <td>
          <div class="stock-counter-badge ${p.stockQty > 10 ? 'in-stock' : (p.stockQty > 0 ? 'low-stock' : 'out-of-stock')}">
            <span class="stock-dot"></span>
            <span>${p.stockQty} in stock</span>
          </div>
        </td>
        <td>
          <div class="table-flags-wrap">
            ${p.isBestseller ? '<span class="flag-chip flag-bestseller"><i class="ri-star-fill"></i> Bestseller</span>' : ''}
            ${p.isFeatured ? '<span class="flag-chip flag-featured"><i class="ri-sparkling-fill"></i> Featured</span>' : ''}
            ${p.isNewArrival ? '<span class="flag-chip flag-new"><i class="ri-flashlight-fill"></i> New</span>' : ''}
          </div>
        </td>
        <td>
          <label class="switch-toggle" title="Toggle In-Stock">
            <input type="checkbox" ${p.inStock ? 'checked' : ''} onchange="AdminController.toggleProductStock('${p.id}', this)">
            <span class="slider round"></span>
          </label>
        </td>
        <td class="table-actions-col">
          <button class="icon-action-btn edit-btn" onclick="AdminController.openProductModal('${p.id}')" title="Edit Product">
            <i class="ri-pencil-line"></i>
          </button>
          <button class="icon-action-btn delete-btn" onclick="AdminController.promptDeleteProduct('${p.id}')" title="Delete Product">
            <i class="ri-delete-bin-line"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Populate category dropdown inside filter bar
    const catFilter = document.getElementById('prod-filter-category');
    if (catFilter && catFilter.options.length <= 1) {
      catFilter.innerHTML = '<option value="All">All Categories</option>' + db.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
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

    if (productId) {
      const prod = db.products.find(p => p.id === productId);
      if (prod) {
        document.getElementById('prod-form-title').value = prod.title;
        document.getElementById('prod-form-sku').value = prod.sku;
        document.getElementById('prod-form-category').value = prod.category;
        document.getElementById('prod-form-image').value = prod.image;
        document.getElementById('prod-form-price').value = prod.price;
        document.getElementById('prod-form-mrp').value = prod.originalPrice;
        document.getElementById('prod-form-unit').value = prod.unit;
        document.getElementById('prod-form-badge').value = prod.badge || '';
        document.getElementById('prod-form-rating').value = prod.rating;
        document.getElementById('prod-form-reviews').value = prod.reviewsCount;
        document.getElementById('prod-form-stock').value = prod.stockQty;
        document.getElementById('prod-form-sort').value = prod.sortOrder || 1;
        document.getElementById('prod-form-is-bestseller').checked = prod.isBestseller;
        document.getElementById('prod-form-is-featured').checked = prod.isFeatured;
        document.getElementById('prod-form-is-new').checked = prod.isNewArrival;
        document.getElementById('prod-form-in-stock').checked = prod.inStock;
        document.getElementById('prod-form-summary').value = prod.shortSummary || '';
        document.getElementById('prod-form-description').value = prod.description || '';
        document.getElementById('prod-form-benefits').value = prod.benefits || '';
        document.getElementById('prod-form-ingredients').value = prod.ingredients || '';
        document.getElementById('prod-form-nutrition').value = prod.nutritionalInfo || '';
        document.getElementById('prod-form-storage').value = prod.storageInstructions || '';
        document.getElementById('prod-form-highlights').value = (prod.highlights || []).join(', ');
        
        // Preview image
        updateImagePreview('prod-form-image', 'prod-form-img-preview');
      }
    } else {
      document.getElementById('prod-form-image').value = 'assets/prod_honey_studio.jpg';
      updateImagePreview('prod-form-image', 'prod-form-img-preview');
    }

    openModal('modal-product-form');
  }

  function saveProductForm(btnElement) {
    const id = document.getElementById('prod-modal-id').value;
    const title = document.getElementById('prod-form-title').value.trim();
    if (!title) {
      showToast('Product title is required.', 'error');
      return;
    }

    withActionSpinner(btnElement, () => {
      const price = parseFloat(document.getElementById('prod-form-price').value) || 0;
      const mrp = parseFloat(document.getElementById('prod-form-mrp').value) || price;
      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
      const highlights = document.getElementById('prod-form-highlights').value.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        id: id || 'prod_' + Date.now(),
        title,
        sku: document.getElementById('prod-form-sku').value.trim() || 'EN-GEN-' + Math.floor(Math.random() * 900),
        category: document.getElementById('prod-form-category').value,
        image: document.getElementById('prod-form-image').value.trim() || 'assets/prod_honey_studio.jpg',
        gallery: [document.getElementById('prod-form-image').value.trim() || 'assets/prod_honey_studio.jpg'],
        price,
        originalPrice: mrp,
        discount,
        unit: document.getElementById('prod-form-unit').value.trim() || 'Pack',
        badge: document.getElementById('prod-form-badge').value.trim(),
        rating: parseFloat(document.getElementById('prod-form-rating').value) || 4.8,
        reviewsCount: parseInt(document.getElementById('prod-form-reviews').value) || 12,
        stockQty: parseInt(document.getElementById('prod-form-stock').value) || 20,
        sortOrder: parseInt(document.getElementById('prod-form-sort').value) || 1,
        isBestseller: document.getElementById('prod-form-is-bestseller').checked,
        isFeatured: document.getElementById('prod-form-is-featured').checked,
        isNewArrival: document.getElementById('prod-form-is-new').checked,
        inStock: document.getElementById('prod-form-in-stock').checked,
        shortSummary: document.getElementById('prod-form-summary').value.trim(),
        description: document.getElementById('prod-form-description').value.trim(),
        benefits: document.getElementById('prod-form-benefits').value.trim(),
        ingredients: document.getElementById('prod-form-ingredients').value.trim(),
        nutritionalInfo: document.getElementById('prod-form-nutrition').value.trim(),
        storageInstructions: document.getElementById('prod-form-storage').value.trim(),
        highlights
      };

      if (id) {
        const idx = db.products.findIndex(p => p.id === id);
        if (idx !== -1) db.products[idx] = payload;
      } else {
        db.products.unshift(payload);
      }

      closeModal();
      renderProductsTable();
      renderDashboard();
    }, id ? 'Product updated successfully!' : 'New product created successfully!');
  }

  function toggleProductStock(productId, checkbox) {
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return;
    prod.inStock = checkbox.checked;
    showToast(`${prod.title} marked as ${prod.inStock ? 'In-Stock' : 'Out-of-Stock'}`, 'info');
    renderProductsTable();
    renderDashboard();
  }

  function promptDeleteProduct(productId) {
    const prod = db.products.find(p => p.id === productId);
    if (!prod) return;
    pendingDeleteTarget = { type: 'product', id: productId, name: prod.title };
    
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to permanently delete <strong>${prod.title}</strong>? This action cannot be undone.`;
    openModal('modal-confirm-delete');
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

  function saveCategoryForm(btnElement) {
    const id = document.getElementById('cat-modal-id').value;
    const name = document.getElementById('cat-form-name').value.trim();
    if (!name) {
      showToast('Category name is required.', 'error');
      return;
    }

    withActionSpinner(btnElement, () => {
      const payload = {
        id: id || 'cat_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name,
        tagline: document.getElementById('cat-form-tagline').value.trim(),
        image: document.getElementById('cat-form-image').value.trim() || 'assets/prod_honey_studio.jpg',
        icon: 'ri-apps-2-line',
        sortOrder: parseInt(document.getElementById('cat-form-sort').value) || 1,
        showOnHome: document.getElementById('cat-form-show-home').checked,
        showInShop: document.getElementById('cat-form-show-shop').checked
      };

      if (id) {
        const idx = db.categories.findIndex(c => c.id === id);
        if (idx !== -1) db.categories[idx] = payload;
      } else {
        db.categories.push(payload);
      }

      closeModal();
      renderCategoriesView();
      renderProductsTable();
    }, id ? 'Category updated successfully!' : 'New category created successfully!');
  }

  function toggleCategoryVisibility(catId, target, isChecked) {
    const cat = db.categories.find(c => c.id === catId);
    if (!cat) return;
    if (target === 'home') cat.showOnHome = isChecked;
    if (target === 'shop') cat.showInShop = isChecked;
    showToast(`Updated visibility for ${cat.name}`, 'info');
  }

  function promptDeleteCategory(catId) {
    const cat = db.categories.find(c => c.id === catId);
    if (!cat) return;
    pendingDeleteTarget = { type: 'category', id: catId, name: cat.name };
    
    document.getElementById('confirm-delete-msg').innerHTML = `Are you sure you want to delete category <strong>${cat.name}</strong>?`;
    openModal('modal-confirm-delete');
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
  // 8. FESTIVE SPECIALS & COLLECTIONS CMS
  // =========================================================================
  function renderFestiveSpecialsView() {
    const f = db.festiveSpecials;
    const container = document.getElementById('festive-cards-container');
    if (!container) return;

    document.getElementById('festive-banner-eyebrow-input').value = f.eyebrow;
    document.getElementById('festive-banner-headline-input').value = f.headline;

    container.innerHTML = f.cards.map((c, i) => `
      <div class="festive-admin-card-item">
        <img src="${c.image}" alt="${c.title}" class="festive-card-thumb">
        <div class="festive-card-fields">
          <input type="text" class="form-input form-input-sm" value="${c.title}" onchange="AdminController.updateFestiveCard(${i}, 'title', this.value)" placeholder="Card Title">
          <input type="text" class="form-input form-input-sm" value="${c.subLabel}" onchange="AdminController.updateFestiveCard(${i}, 'subLabel', this.value)" placeholder="Sub-Label">
          <input type="text" class="form-input form-input-sm" value="${c.targetCategory}" onchange="AdminController.updateFestiveCard(${i}, 'targetCategory', this.value)" placeholder="Target Category">
        </div>
      </div>
    `).join('');
  }

  function updateFestiveCard(index, field, value) {
    if (db.festiveSpecials.cards[index]) {
      db.festiveSpecials.cards[index][field] = value;
      showToast('Card updated locally. Click Save to apply.', 'info');
    }
  }

  function saveFestiveSpecialsForm(btnElement) {
    withActionSpinner(btnElement, () => {
      db.festiveSpecials.eyebrow = document.getElementById('festive-banner-eyebrow-input').value;
      db.festiveSpecials.headline = document.getElementById('festive-banner-headline-input').value;
    }, 'Festive Specials banner updated successfully!');
  }

  function renderCollectionsView() {
    const grid = document.getElementById('collections-cards-grid');
    if (!grid) return;

    grid.innerHTML = db.featuredCollections.map(c => `
      <div class="collection-admin-card">
        <img src="${c.image}" alt="${c.title}" class="col-card-thumb">
        <div class="col-card-info">
          <h4 class="col-card-title">${c.title}</h4>
          <p class="col-card-tag">${c.tagline}</p>
          <span class="col-card-badge">Target: ${c.targetCategory}</span>
        </div>
      </div>
    `).join('');
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

  function saveOrderInspector(btnElement) {
    if (!currentInspectedOrder) return;

    withActionSpinner(btnElement, () => {
      currentInspectedOrder.orderStatus = document.getElementById('insp-order-status-select').value;
      currentInspectedOrder.paymentStatus = document.getElementById('insp-pay-status-select').value;
      currentInspectedOrder.adminNotes = document.getElementById('insp-admin-notes').value;
      currentInspectedOrder.trackingId = document.getElementById('insp-tracking-id').value;

      renderOrdersTable();
      renderDashboard();
      closeModal();
    }, `Order ${currentInspectedOrder.orderNumber} updated successfully!`);
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
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = db.products.map(p => `
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

  function adjustStock(productId, delta, btnElement) {
    withActionSpinner(btnElement, () => {
      const p = db.products.find(x => x.id === productId);
      if (p) {
        p.stockQty = Math.max(0, p.stockQty + delta);
        p.inStock = p.stockQty > 0;
        renderInventoryTable();
        renderDashboard();
      }
    }, `Stock updated for product.`);
  }

  function setStockDirect(productId, val) {
    const p = db.products.find(x => x.id === productId);
    if (p) {
      p.stockQty = Math.max(0, parseInt(val) || 0);
      p.inStock = p.stockQty > 0;
      showToast(`Stock updated to ${p.stockQty} units.`, 'info');
      renderInventoryTable();
      renderDashboard();
    }
  }

  // =========================================================================
  // 13. CUSTOMER DIRECTORY (CRM)
  // =========================================================================
  function renderCustomersView() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    tbody.innerHTML = db.customers.map(c => `
      <tr>
        <td>
          <div class="cust-avatar-lockup">
            <div class="cust-initial-avatar">${c.name.charAt(0)}</div>
            <div>
              <div class="cust-tbl-name">${c.name}</div>
              <div class="cust-tbl-email">${c.email}</div>
            </div>
          </div>
        </td>
        <td><a href="tel:${c.phone}" class="cust-phone-link"><i class="ri-phone-line"></i> ${c.phone}</a></td>
        <td><strong>${c.totalOrders} Orders</strong></td>
        <td><strong>₹${c.lifetimeSpend.toLocaleString('en-IN')}</strong></td>
        <td>${c.lastOrderDate}</td>
        <td><span class="pay-status-pill pay-paid">${c.status}</span></td>
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

  function confirmDeleteAction(btnElement) {
    if (!pendingDeleteTarget) return;

    withActionSpinner(btnElement, () => {
      const { type, id, name } = pendingDeleteTarget;
      if (type === 'product') {
        db.products = db.products.filter(p => p.id !== id);
        renderProductsTable();
        renderDashboard();
      } else if (type === 'category') {
        db.categories = db.categories.filter(c => c.id !== id);
        renderCategoriesView();
        renderProductsTable();
      } else if (type === 'banner') {
        db.heroBanners = db.heroBanners.filter(b => b.id !== id);
        renderBannersView();
      } else if (type === 'coupon') {
        db.coupons = db.coupons.filter(c => c.id !== id);
        renderCouponsView();
      }
      closeModal();
      pendingDeleteTarget = null;
    }, 'Item deleted successfully.');
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
    renderDashboard();
    updateStoreStatusIndicator();
    initGlobalSearch();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
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
    toggleProductStock,
    promptDeleteProduct,

    // Categories
    renderCategoriesView,
    openCategoryModal,
    saveCategoryForm,
    toggleCategoryVisibility,
    promptDeleteCategory,

    // Banners
    renderBannersView,
    openBannerModal,
    saveBannerForm,
    promptDeleteBanner,

    // Festive & Collections
    renderFestiveSpecialsView,
    updateFestiveCard,
    saveFestiveSpecialsForm,
    renderCollectionsView,

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
