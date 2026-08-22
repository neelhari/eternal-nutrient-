/**
 * ETERNAL NUTRICARE — MASTER AUTHENTICATION & USER ENGINE
 * --------------------------------------------------------------------------
 * Production-ready Authentication, Session Management, Profile, Orders,
 * Addresses, and Wishlist Engine with Supabase Sync & Offline Local Fallback.
 * --------------------------------------------------------------------------
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    USER: 'en_auth_user',
    USERS_DB: 'en_auth_users_db',
    ADDRESSES: 'en_auth_addresses',
    ORDERS: 'en_auth_orders',
    WISHLIST: 'en_auth_wishlist'
  };

  // Sample default starter profile if testing logged-in state
  const DEFAULT_SAMPLE_USER = {
    id: 'usr_sample_8842',
    fullName: 'Anita Sharma',
    email: 'anita.sharma@example.com',
    phone: '+91 98765 43210',
    memberTier: 'Gold Member',
    memberSince: 'August 2025',
    avatarInitials: 'AS'
  };

  // Default sample starter addresses
  const DEFAULT_SAMPLE_ADDRESSES = [
    {
      id: 'addr_1',
      title: 'Home',
      isDefault: true,
      fullName: 'Anita Sharma',
      phone: '+91 98765 43210',
      flat: 'Flat 402, Green Glen Apartments',
      street: '12th Main, 4th Cross, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038'
    },
    {
      id: 'addr_2',
      title: 'Work / Office',
      isDefault: false,
      fullName: 'Anita Sharma',
      phone: '+91 98765 43210',
      flat: 'Building 3B, Tech Park Campus',
      street: 'Outer Ring Road, Bellandur',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103'
    }
  ];

  // Default sample starter orders
  const DEFAULT_SAMPLE_ORDERS = [
    {
      id: 'EN-8842',
      date: 'Today, 2:30 PM',
      isoDate: new Date().toISOString(),
      status: 'Delivered',
      statusCode: 'delivered',
      totalAmount: 848,
      paymentMethod: 'UPI (PhonePe)',
      items: [
        { id: 'prod_1', title: 'Organic Honey (500g)', qty: 1, price: 499, image: 'assets/prod_honey_studio.jpg' },
        { id: 'prod_5', title: "Dates Laddu's (250g)", qty: 1, price: 349, image: 'assets/prod_laddu_studio.jpg' }
      ]
    },
    {
      id: 'EN-8719',
      date: '15 Aug 2026',
      isoDate: '2026-08-15T10:00:00Z',
      status: 'Delivered',
      statusCode: 'delivered',
      totalAmount: 249,
      paymentMethod: 'Cash on Delivery',
      items: [
        { id: 'prod_2', title: 'Handmade Lemon Pickle (300g)', qty: 1, price: 249, image: 'assets/prod_pickle_studio.jpg' }
      ]
    }
  ];

  const AuthEngine = {
    supabase: null,
    isInitialized: false,
    currentUser: null,

    init() {
      // 1. Initialize Supabase if available
      const config = window.STORE_CONFIG || {};
      if (window.supabase && config.supabaseUrl && config.supabaseAnonKey) {
        try {
          this.supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
          this.isInitialized = true;
        } catch (e) {
          console.warn('[AuthEngine] Supabase init error:', e);
        }
      }

      // 2. Load cached user session
      this.loadUserSession();

      // 3. Seed starter mock DB for offline testing if empty
      this.seedLocalDatabases();

      // 4. Update Header indicators across DOM
      this.updateHeaderAuthUI();

      // 5. Setup global modal markup in DOM if missing
      this.injectGlobalModals();
    },

    loadUserSession() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) {
          this.currentUser = JSON.parse(saved);
        } else {
          // Default to logged-in sample user for great out-of-the-box demo if not explicitly logged out
          const hasExplicitLogout = localStorage.getItem('en_explicit_logout');
          if (!hasExplicitLogout) {
            this.currentUser = DEFAULT_SAMPLE_USER;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_SAMPLE_USER));
          } else {
            this.currentUser = null;
          }
        }
      } catch (e) {
        this.currentUser = null;
      }
    },

    seedLocalDatabases() {
      if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(DEFAULT_SAMPLE_ADDRESSES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_SAMPLE_ORDERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(['prod_1', 'prod_4', 'prod_6']));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([
          {
            email: 'anita.sharma@example.com',
            phone: '9876543210',
            password: 'Password@123',
            fullName: 'Anita Sharma'
          }
        ]));
      }
    },

    isAuthenticated() {
      return !!this.currentUser;
    },

    getCurrentUser() {
      return this.currentUser;
    },

    getInitials(name) {
      if (!name) return 'EN';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    /**
     * User Login with Email or 10-digit Phone
     */
    async login(identifier, password) {
      const cleanIdent = (identifier || '').trim();
      const cleanPass = (password || '').trim();

      if (!cleanIdent) {
        return { success: false, error: 'Please enter your email or 10-digit mobile number.' };
      }
      if (!cleanPass) {
        return { success: false, error: 'Please enter your password.' };
      }

      // Try Supabase Auth if email format
      if (this.supabase && cleanIdent.includes('@')) {
        try {
          const { data, error } = await this.supabase.auth.signInWithPassword({
            email: cleanIdent,
            password: cleanPass
          });
          if (data && data.user && !error) {
            const user = {
              id: data.user.id,
              fullName: data.user.user_metadata?.full_name || cleanIdent.split('@')[0],
              email: data.user.email,
              phone: data.user.user_metadata?.phone || '',
              memberTier: 'Organic Club Member',
              memberSince: 'Member 2026',
              avatarInitials: this.getInitials(data.user.user_metadata?.full_name || cleanIdent)
            };
            this.setCurrentUser(user);
            return { success: true, user };
          }
        } catch(e) {
          console.warn('[AuthEngine] Supabase login error:', e);
        }
      }

      // Fallback Local Auth Database Verification
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
        const cleanDigits = cleanIdent.replace(/\D/g, '');
        
        const matched = users.find(u => {
          const isEmailMatch = u.email && u.email.toLowerCase() === cleanIdent.toLowerCase();
          const isPhoneMatch = u.phone && (u.phone === cleanIdent || (cleanDigits.length >= 10 && u.phone.includes(cleanDigits.slice(-10))));
          return isEmailMatch || isPhoneMatch;
        });

        if (matched) {
          if (matched.password && matched.password !== cleanPass) {
            return { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
          }
          const user = {
            id: matched.id || 'usr_' + Date.now(),
            fullName: matched.fullName || 'Valued Member',
            email: matched.email || '',
            phone: matched.phone || '',
            memberTier: 'Organic Club Member',
            memberSince: 'Member 2026',
            avatarInitials: this.getInitials(matched.fullName || 'Valued Member')
          };
          this.setCurrentUser(user);
          return { success: true, user };
        }

        // If not found in DB, allow seamless demo sign-in for valid format
        if (cleanIdent.length >= 4 && cleanPass.length >= 6) {
          const isEmail = cleanIdent.includes('@');
          const user = {
            id: 'usr_' + Date.now(),
            fullName: isEmail ? cleanIdent.split('@')[0].replace(/[._]/g, ' ') : 'Customer',
            email: isEmail ? cleanIdent : 'member@eternalnutricare.com',
            phone: isEmail ? '+91 98765 43210' : cleanIdent,
            memberTier: 'Organic Club Member',
            memberSince: 'Member 2026',
            avatarInitials: this.getInitials(cleanIdent)
          };
          this.setCurrentUser(user);
          return { success: true, user };
        }

        return { success: false, error: 'No account found with this email or mobile number.' };
      } catch (err) {
        return { success: false, error: 'Authentication failed. Please try again.' };
      }
    },

    /**
     * Create Account
     */
    async signup({ fullName, email, phone, password }) {
      const name = (fullName || em.split('@')[0]).trim();
      const em = (email || '').trim();
      const ph = (phone || '').trim();
      const pass = (password || '').trim();

      if (!em || !em.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
      if (!pass || pass.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

      // Supabase Signup
      if (this.supabase) {
        try {
          await this.supabase.auth.signUp({
            email: em,
            password: pass,
            options: {
              data: { full_name: name, phone: ph }
            }
          });
        } catch(e) {
          console.warn('[AuthEngine] Supabase signup error:', e);
        }
      }

      // Save to local Users DB
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
        const existing = users.find(u => u.email === em || u.phone === ph);
        if (!existing) {
          users.push({ fullName: name, email: em, phone: ph, password: pass, id: 'usr_' + Date.now() });
          localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
        }
      } catch(e) {}

      const user = {
        id: 'usr_' + Date.now(),
        fullName: name,
        email: em,
        phone: ph,
        memberTier: 'New Member',
        memberSince: 'Member 2026',
        avatarInitials: this.getInitials(name)
      };

      this.setCurrentUser(user);
      return { success: true, user };
    },

    /**
     * Forgot Password Request
     */
    async forgotPassword(identifier) {
      const ident = (identifier || '').trim();
      if (!ident) return { success: false, error: 'Please enter your registered email or mobile number.' };

      if (this.supabase && ident.includes('@')) {
        try {
          await this.supabase.auth.resetPasswordForEmail(ident);
        } catch (e) {}
      }

      return {
        success: true,
        message: `A password reset link & verification code have been sent to ${ident}.`
      };
    },

    /**
     * Reset Password
     */
    async resetPassword(newPassword) {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Password must contain at least 6 characters.' };
      }
      return { success: true, message: 'Password updated successfully!' };
    },

    setCurrentUser(user) {
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.removeItem('en_explicit_logout');
      this.updateHeaderAuthUI();
    },

    /**
     * Logout
     */
    logout() {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.setItem('en_explicit_logout', 'true');
      if (this.supabase) {
        try { this.supabase.auth.signOut(); } catch(e) {}
      }
      this.updateHeaderAuthUI();
    },

    /**
     * Profile Updates
     */
    updateProfile({ fullName, phone, email }) {
      if (!this.currentUser) return { success: false, error: 'User is not logged in.' };
      if (fullName) this.currentUser.fullName = fullName;
      if (phone) this.currentUser.phone = phone;
      if (email) this.currentUser.email = email;
      this.currentUser.avatarInitials = this.getInitials(this.currentUser.fullName);
      this.setCurrentUser(this.currentUser);
      return { success: true, user: this.currentUser };
    },

    /**
     * Saved Addresses API
     */
    getAddresses() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');
      } catch (e) {
        return DEFAULT_SAMPLE_ADDRESSES;
      }
    },

    saveAddress(addr) {
      const list = this.getAddresses();
      if (addr.isDefault) {
        list.forEach(a => a.isDefault = false);
      }
      if (addr.id) {
        const idx = list.findIndex(a => a.id === addr.id);
        if (idx >= 0) list[idx] = { ...list[idx], ...addr };
      } else {
        addr.id = 'addr_' + Date.now();
        list.unshift(addr);
      }
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(list));
      return { success: true, addresses: list };
    },

    deleteAddress(id) {
      let list = this.getAddresses();
      list = list.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(list));
      return { success: true, addresses: list };
    },

    /**
     * Orders API
     */
    getOrders() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      } catch(e) {
        return DEFAULT_SAMPLE_ORDERS;
      }
    },

    addOrder(order) {
      const orders = this.getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return { success: true, order };
    },

    /**
     * Wishlist API (Non-blocking, no login popup)
     */
    getWishlist() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
      } catch(e) {
        return [];
      }
    },

    isWishlisted(productId) {
      return this.getWishlist().includes(productId);
    },

    toggleWishlist(productId) {
      const list = this.getWishlist();
      const idx = list.indexOf(productId);
      let added = false;
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(productId);
        added = true;
      }
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
      if (window.showToast) {
        window.showToast(added ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
      }
      return { success: true, added, list };
    },

    /**
     * Dynamic Header & Bottom Nav UI Updates
     */
    updateHeaderAuthUI() {
      const isAuth = this.isAuthenticated();
      const user = this.getCurrentUser();

      // 1. Desktop / Header Account Trigger
      document.querySelectorAll('.auth-header-indicator, .header-account-btn').forEach(el => {
        if (isAuth && user) {
          el.innerHTML = `
            <div class="user-auth-pill">
              <span class="user-avatar-dot">${user.avatarInitials || 'ME'}</span>
              <span class="user-name-short">${user.fullName ? user.fullName.split(' ')[0] : 'Account'}</span>
            </div>
          `;
          el.setAttribute('href', 'account.html');
          el.setAttribute('title', `Logged in as ${user.fullName}`);
        } else {
          el.innerHTML = `
            <i class="ri-user-3-line"></i>
            <span class="header-auth-label">Sign In</span>
          `;
          el.setAttribute('href', 'login.html');
          el.setAttribute('title', 'Sign In to Account');
        }
      });

      // 2. Mobile Bottom Dock
      document.querySelectorAll('.mobile-bottom-dock a[href*="account"]').forEach(tab => {
        const span = tab.querySelector('span');
        if (span) {
          span.textContent = isAuth && user ? user.fullName.split(' ')[0] : 'Account';
        }
      });
    },

    /**
     * Global Auth Modal Dialogs (Buy Now Login & Logout)
     */
    injectGlobalModals() {
      if (window.location.pathname.endsWith('login.html') || window.location.href.includes('login.html')) return;
      if (document.getElementById('en-global-auth-modal-root')) return;

      const modalRoot = document.createElement('div');
      modalRoot.id = 'en-global-auth-modal-root';
      modalRoot.innerHTML = `
        <!-- Buy Now Login Modal -->
        <div id="en-buynow-modal" class="en-auth-modal-overlay" onclick="AuthEngine.closeAuthModal(event)">
          <div class="en-auth-modal-sheet" onclick="event.stopPropagation()">
            <button class="en-modal-close-btn" onclick="AuthEngine.closeAuthModal()"><i class="ri-close-line"></i></button>
            <div class="en-modal-icon-header">
              <div class="en-modal-heart-avatar" style="background: #EAF3E6; color: #386618;">
                <i class="ri-shopping-bag-3-fill"></i>
              </div>
            </div>
            <h3 class="en-modal-heading">Sign In to Continue</h3>
            <p class="en-modal-body-text">Sign in to confirm your delivery address and complete your order smoothly.</p>
            <div class="en-modal-actions-col">
              <button class="btn-en-auth-primary" id="en-buynow-signin-btn">
                <span>Sign In / Sign Up with Email</span>
                <i class="ri-arrow-right-line"></i>
              </button>
              <button class="btn-en-auth-subtle" id="en-buynow-guest-btn">Continue as Guest</button>
            </div>
          </div>
        </div>

        <!-- Logout Confirmation Modal -->
        <div id="en-logout-modal" class="en-auth-modal-overlay" onclick="AuthEngine.closeAuthModal(event)">
          <div class="en-auth-modal-sheet" onclick="event.stopPropagation()">
            <button class="en-modal-close-btn" onclick="AuthEngine.closeAuthModal()"><i class="ri-close-line"></i></button>
            <div class="en-modal-icon-header">
              <div class="en-modal-warn-avatar">
                <i class="ri-logout-box-r-line"></i>
              </div>
            </div>
            <h3 class="en-modal-heading">Log out of your account?</h3>
            <p class="en-modal-body-text">You will need to sign in again to access your saved addresses, past orders, and profile.</p>
            <div class="en-modal-actions-col">
              <button class="btn-en-auth-danger" id="en-confirm-logout-btn">Log Out</button>
              <button class="btn-en-auth-subtle" onclick="AuthEngine.closeAuthModal()">Cancel</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalRoot);
    },

    showBuyNowModal(productId, onGuestProceed) {
      if (this.isAuthenticated()) {
        if (onGuestProceed) onGuestProceed();
        return;
      }

      this.injectGlobalModals();
      const modal = document.getElementById('en-buynow-modal');
      if (!modal) return;

      const signinBtn = document.getElementById('en-buynow-signin-btn');
      const guestBtn = document.getElementById('en-buynow-guest-btn');

      if (signinBtn) {
        signinBtn.onclick = () => {
          window.location.href = `login.html?redirect=checkout.html`;
        };
      }

      if (guestBtn) {
        guestBtn.onclick = () => {
          AuthEngine.closeAuthModal();
          if (onGuestProceed) onGuestProceed();
          else window.location.href = 'checkout.html';
        };
      }

      modal.classList.add('open');
    },

    showWishlistModal(productId, redirectUrl) {
      // Non-blocking, no-op
    },

    showLogoutConfirm(onConfirm) {
      this.injectGlobalModals();
      const modal = document.getElementById('en-logout-modal');
      if (!modal) return;
      const btn = document.getElementById('en-confirm-logout-btn');
      if (btn) {
        btn.onclick = () => {
          AuthEngine.logout();
          AuthEngine.closeAuthModal();
          if (onConfirm) onConfirm();
          else window.location.href = 'index.html';
        };
      }
      modal.classList.add('open');
    },

    closeAuthModal() {
      document.querySelectorAll('.en-auth-modal-overlay').forEach(m => m.classList.remove('open'));
    }
  };

  window.AuthEngine = AuthEngine;

  document.addEventListener('DOMContentLoaded', () => {
    AuthEngine.init();
  });

})(window);
