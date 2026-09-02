/**
 * ETERNAL NUTRICARE — UNIVERSAL DISTRIBUTION REQUEST DRAWER
 * Handles Distribution / Franchise application modal across all storefront pages.
 */
(function () {
  const drawerHtml = `
  <div id="drawer-distribution" class="distribution-drawer-overlay" style="display: none;" onclick="closeDistributionDrawer(event)">
    <div class="distribution-drawer-content" onclick="event.stopPropagation()">
      <div class="distribution-drawer-header">
        <div class="distribution-header-left">
          <div class="distribution-badge"><i class="ri-customer-service-2-fill"></i> Get in Touch</div>
          <h2 class="distribution-drawer-title">Contact Us & Inquiry</h2>
        </div>
        <button type="button" class="distribution-drawer-close" onclick="closeDistributionDrawer()" aria-label="Close">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="distribution-drawer-body">
        <div class="distribution-info-banner">
          <div class="distribution-info-title">Connect with Eternal Nutricare</div>
          <div class="distribution-info-desc">
            Have questions, bulk orders, or want to partner with us? Fill out this quick inquiry and our team will connect with you within 24 hours.
          </div>
        </div>

        <form id="distribution-inquiry-form" onsubmit="submitDistributionRequest(event)">
          <div class="dist-form-group">
            <label class="dist-form-label">Full Name *</label>
            <input type="text" id="dist-name" class="dist-form-input" placeholder="e.g. Rahul Sharma" required>
          </div>

          <div class="dist-form-group">
            <label class="dist-form-label">Email Address *</label>
            <input type="email" id="dist-email" class="dist-form-input" placeholder="e.g. rahul@example.com" required>
          </div>

          <div class="dist-form-group">
            <label class="dist-form-label">Mobile Number *</label>
            <input type="tel" id="dist-mobile" class="dist-form-input" placeholder="10-digit Phone Number" required>
          </div>

          <div class="dist-form-group">
            <label class="dist-form-label">Location Address / City *</label>
            <input type="text" id="dist-location" class="dist-form-input" placeholder="City, State, Area (e.g. Indiranagar, Bengaluru)" required>
          </div>

          <div class="dist-form-group">
            <label class="dist-form-label">Note / Business Background</label>
            <textarea id="dist-note" class="dist-form-input dist-form-textarea" placeholder="Tell us about your distribution/retail network, store size, or requirements..."></textarea>
          </div>

          <button type="submit" id="btn-dist-submit" class="dist-btn-submit">
            <i class="ri-send-plane-fill"></i> <span>Submit Application</span>
          </button>
        </form>
      </div>
    </div>
  </div>
  `;

  const drawerCss = `
  .distribution-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 15, 12, 0.65);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease, visibility 0.25s ease;
  }
  .distribution-drawer-overlay.active {
    opacity: 1;
    visibility: visible;
    display: flex !important;
  }
  .distribution-drawer-content {
    background: #FFFFFF;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    border-radius: 22px 22px 0 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.22);
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-sizing: border-box;
    overflow: hidden;
  }
  .distribution-drawer-overlay.active .distribution-drawer-content {
    transform: translateY(0);
  }
  @media (min-width: 768px) {
    .distribution-drawer-overlay {
      align-items: center;
      padding: 20px;
    }
    .distribution-drawer-content {
      border-radius: 22px;
      max-height: 85vh;
      transform: scale(0.95);
      transition: transform 0.25s ease;
    }
    .distribution-drawer-overlay.active .distribution-drawer-content {
      transform: scale(1);
    }
  }
  .distribution-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid #F0ECE6;
    background: #FAF8F5;
  }
  .distribution-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #EBF4E5;
    color: #375C1A;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 999px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .distribution-drawer-title {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 17px;
    font-weight: 800;
    color: #281612;
    margin: 0;
  }
  .distribution-drawer-close {
    background: #ECE7DF;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #281612;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .distribution-drawer-close:hover {
    background: #DDD5C9;
    transform: scale(1.05);
  }
  .distribution-drawer-body {
    padding: 18px 20px 24px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
  }
  .distribution-info-banner {
    background: #F4F8F1;
    border-left: 4px solid #386618;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
  }
  .distribution-info-title {
    font-size: 13px;
    font-weight: 800;
    color: #281612;
  }
  .distribution-info-desc {
    font-size: 11.5px;
    color: #4A633F;
    margin-top: 3px;
    line-height: 1.35;
  }
  .dist-form-group {
    margin-bottom: 12px;
  }
  .dist-form-label {
    font-size: 11.5px;
    font-weight: 700;
    color: #4A3E38;
    display: block;
    margin-bottom: 4px;
  }
  .dist-form-input {
    width: 100%;
    background: #FAF9F6;
    border: 1.5px solid #EAE5DE;
    border-radius: 10px;
    padding: 9px 12px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 13px;
    color: #1E1A17;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .dist-form-input:focus {
    border-color: #281612;
    background: #FFFFFF;
  }
  .dist-form-textarea {
    height: 72px;
    resize: vertical;
  }
  .dist-btn-submit {
    width: 100%;
    background: #281612;
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(40, 22, 18, 0.25);
    margin-top: 14px;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .dist-btn-submit:hover {
    background: #3E241E;
    transform: translateY(-1px);
  }
  .dist-btn-submit:active {
    transform: scale(0.98);
  }
  `;

  function initDistributionDrawer() {
    if (!document.getElementById('drawer-distribution')) {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = drawerCss;
      document.head.appendChild(styleEl);

      const div = document.createElement('div');
      div.innerHTML = drawerHtml;
      document.body.appendChild(div.firstElementChild);
    }
  }

  window.openDistributionDrawer = function () {
    initDistributionDrawer();
    const overlay = document.getElementById('drawer-distribution');
    if (overlay) {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeDistributionDrawer = function (event) {
    if (event && event.target && event.target.id !== 'drawer-distribution' && !event.target.classList.contains('distribution-drawer-close') && !event.target.closest('.distribution-drawer-close')) {
      return;
    }
    const overlay = document.getElementById('drawer-distribution');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 250);
    }
  };

  window.submitDistributionRequest = async function (event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-dist-submit');
    const name = document.getElementById('dist-name')?.value.trim();
    const email = document.getElementById('dist-email')?.value.trim();
    const mobile = document.getElementById('dist-mobile')?.value.trim();
    const location = document.getElementById('dist-location')?.value.trim();
    const note = document.getElementById('dist-note')?.value.trim() || '';

    if (!name || !email || !mobile || !location) {
      if (typeof showToast === 'function') {
        showToast('Please fill out all required fields.');
      } else {
        alert('Please fill out all required fields.');
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Submitting...`;
    }

    const payload = {
      name,
      email,
      phone: mobile,
      location,
      note,
      status: 'New Application',
      created_at: new Date().toISOString()
    };

    try {
      if (window.CloudDB && typeof window.CloudDB.saveFranchiseInquiry === 'function') {
        await window.CloudDB.saveFranchiseInquiry(payload);
      }
    } catch (err) {
      console.warn('Distribution inquiry save notice:', err);
    }

    if (typeof showToast === 'function') {
      showToast('🎉 Distribution application submitted! Our team will contact you.');
    } else {
      alert('Distribution application submitted! Our team will contact you.');
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="ri-checkbox-circle-line"></i> Application Received!`;
    }

    setTimeout(() => {
      document.getElementById('distribution-inquiry-form')?.reset();
      window.closeDistributionDrawer();
      if (btn) {
        btn.innerHTML = `<i class="ri-send-plane-fill"></i> <span>Submit Application</span>`;
      }
    }, 2000);
  };

  // Pre-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDistributionDrawer);
  } else {
    initDistributionDrawer();
  }
})();
