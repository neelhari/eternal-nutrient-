/**
 * ETERNAL NUTRICARE - Amazon-Grade Predictive Live Search Engine
 * Instant autocomplete suggestions with rich product thumbnails, category jumps & keyboard nav.
 */

(function () {
  'use strict';

  let cachedProducts = [];
  let cachedCategories = [];

  // Inject CSS for Amazon Search Suggestions Dropdown
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .amazon-search-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      box-shadow: 0 12px 32px rgba(40, 22, 18, 0.15);
      z-index: 9999;
      max-height: 440px;
      overflow-y: auto;
      display: none;
      padding: 8px 0;
      animation: amazonDropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes amazonDropdownFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .amazon-search-header {
      padding: 6px 14px 4px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #8C7E77;
    }

    .amazon-search-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      cursor: pointer;
      text-decoration: none;
      color: #281612;
      transition: background 0.12s ease;
      border-left: 3px solid transparent;
    }

    .amazon-search-item:hover,
    .amazon-search-item.selected {
      background: #F4F8F1;
      border-left-color: #386618;
    }

    .amazon-search-thumb {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 8px;
      object-fit: cover;
      background: #F8F5F0;
      border: 1px solid #EBE7DF;
    }

    .amazon-search-details {
      flex: 1;
      min-width: 0;
    }

    .amazon-search-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #281612;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .amazon-search-title mark {
      background: transparent;
      color: #386618;
      font-weight: 800;
      text-decoration: underline;
    }

    .amazon-search-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 3px;
      font-size: 12px;
    }

    .amazon-search-cat {
      background: #EAF3E6;
      color: #2E5614;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .amazon-search-price {
      font-weight: 800;
      color: #386618;
    }

    .amazon-search-mrp {
      text-decoration: line-through;
      color: #9E9E9E;
      font-size: 11px;
    }

    .amazon-cat-jump-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      border-bottom: 1px solid #F0ECE4;
      background: #FAF9F6;
      cursor: pointer;
      text-decoration: none;
      color: #281612;
      font-size: 13px;
      font-weight: 600;
    }

    .amazon-cat-jump-row:hover {
      background: #EAF3E6;
      color: #2E5614;
    }

    .amazon-cat-jump-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #386618;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .amazon-search-view-all {
      padding: 11px 14px;
      background: #FAF9F6;
      border-top: 1px solid #EBE7DF;
      text-align: center;
      font-size: 13px;
      font-weight: 700;
      color: #386618;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 0 0 12px 12px;
      text-decoration: none;
    }

    .amazon-search-view-all:hover {
      background: #EAF3E6;
    }

    .amazon-search-empty {
      padding: 24px 16px;
      text-align: center;
      color: #8C7E77;
      font-size: 13px;
    }

    .amazon-search-empty i {
      font-size: 28px;
      display: block;
      margin-bottom: 6px;
      color: #BDBDBD;
    }
  `;
  document.head.appendChild(styleEl);

  async function ensureDataLoaded() {
    if (cachedProducts.length > 0) return;
    if (window.CloudDB && typeof window.CloudDB.getProducts === 'function') {
      try {
        const [prods, cats] = await Promise.all([
          window.CloudDB.getProducts(),
          window.CloudDB.getCategories()
        ]);
        if (prods && prods.length > 0) cachedProducts = prods;
        if (cats && cats.length > 0) cachedCategories = cats;
      } catch (e) {
        console.warn('AmazonSearch data fetch notice:', e);
      }
    }

    // Fallback to in-memory globals if available
    if (cachedProducts.length === 0 && window.ALL_PRODUCTS && Array.isArray(window.ALL_PRODUCTS)) {
      cachedProducts = window.ALL_PRODUCTS;
    } else if (cachedProducts.length === 0 && window.PRODUCTS && typeof window.PRODUCTS === 'object') {
      cachedProducts = Object.values(window.PRODUCTS);
    }
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function initSearchInput(inputEl) {
    if (!inputEl || inputEl.dataset.amazonInit) return;
    inputEl.dataset.amazonInit = 'true';

    // Wrap input container in relative positioning if not already
    const parent = inputEl.closest('.header-search-wrap') || inputEl.closest('.mobile-search-bar') || inputEl.closest('.search-input-pill') || inputEl.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'amazon-search-dropdown';
    parent.appendChild(dropdown);

    let activeIndex = -1;

    async function handleInput() {
      await ensureDataLoaded();
      const q = inputEl.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        activeIndex = -1;
        return;
      }

      // Filter products
      const matchingProducts = cachedProducts.filter(p => {
        const title = (p.title || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const badge = (p.badge || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        return title.includes(q) || cat.includes(q) || badge.includes(q) || sku.includes(q);
      }).slice(0, 6);

      // Filter matching categories
      const matchingCats = cachedCategories.filter(c => {
        return (c.name || '').toLowerCase().includes(q);
      }).slice(0, 2);

      if (matchingProducts.length === 0 && matchingCats.length === 0) {
        dropdown.innerHTML = `
          <div class="amazon-search-empty">
            <i class="ri-search-eye-line"></i>
            <div>No matching organic products for "<strong>${inputEl.value}</strong>"</div>
            <div style="font-size: 11.5px; margin-top: 4px; color: #9E9E9E;">Try searching honey, pickles, millets, laddus...</div>
          </div>
        `;
        dropdown.style.display = 'block';
        return;
      }

      let html = '';

      // 1. Category Quick Jumps
      if (matchingCats.length > 0) {
        html += matchingCats.map(c => `
          <a href="categories.html?category=${encodeURIComponent(c.name)}" class="amazon-cat-jump-row">
            <div class="amazon-cat-jump-icon"><i class="ri-apps-2-fill"></i></div>
            <div>Search in category: <strong>${highlightMatch(c.name, q)}</strong></div>
          </a>
        `).join('');
      }

      // 2. Product Items
      if (matchingProducts.length > 0) {
        html += `<div class="amazon-search-header">Products (${matchingProducts.length})</div>`;
        html += matchingProducts.map(p => {
          const img = p.image || (Array.isArray(p.gallery) && p.gallery[0]) || 'assets/prod_honey_studio.jpg';
          const price = Number(p.price) || 0;
          const mrp = Number(p.original_price || p.price || price);
          return `
            <a href="product.html?id=${p.id}" class="amazon-search-item" data-id="${p.id}">
              <img src="${img}" alt="${p.title}" class="amazon-search-thumb">
              <div class="amazon-search-details">
                <div class="amazon-search-title">${highlightMatch(p.title, q)}</div>
                <div class="amazon-search-meta">
                  <span class="amazon-search-cat">${p.category || 'Organic'}</span>
                  <span class="amazon-search-price">₹${price}</span>
                  ${mrp > price ? `<span class="amazon-search-mrp">₹${mrp}</span>` : ''}
                </div>
              </div>
            </a>
          `;
        }).join('');
      }

      // 3. View All Footer Link
      html += `
        <a href="categories.html?search=${encodeURIComponent(q)}" class="amazon-search-view-all">
          <span>See all results for "<strong>${inputEl.value}</strong>"</span>
          <i class="ri-arrow-right-line"></i>
        </a>
      `;

      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
      activeIndex = -1;
    }

    inputEl.addEventListener('input', handleInput);
    inputEl.addEventListener('focus', () => {
      if (inputEl.value.trim()) handleInput();
    });

    // Keyboard navigation (Arrow Up, Arrow Down, Enter, Escape)
    inputEl.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.amazon-search-item, .amazon-cat-jump-row, .amazon-search-view-all');
      if (!items || items.length === 0 || dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateItemSelection(items, activeIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateItemSelection(items, activeIndex);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          items[activeIndex].click();
        } else if (inputEl.value.trim()) {
          e.preventDefault();
          window.location.href = `categories.html?search=${encodeURIComponent(inputEl.value.trim())}`;
        }
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        activeIndex = -1;
      }
    });

    function updateItemSelection(items, idx) {
      items.forEach((item, i) => {
        if (i === idx) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  // Initialize on DOM Ready
  function autoInit() {
    const inputs = document.querySelectorAll('#desktop-search-input, #mobile-search-input, #category-search-input, .search-input-pill input, [data-amazon-search]');
    inputs.forEach(initSearchInput);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.AmazonSearch = {
    init: autoInit,
    initInput: initSearchInput,
    refreshData: () => { cachedProducts = []; cachedCategories = []; ensureDataLoaded(); }
  };

})();
