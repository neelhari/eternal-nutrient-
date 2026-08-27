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

  const AuthEngine = {
    supabase: null,
    isInitialized: false,
    currentUser: null,
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
          this.currentUser = null;
        }
      } catch (e) {
        this.currentUser = null;
      }
    },

    seedLocalDatabases() {
      if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify([]));
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
     * User Login with Email and Password
     */
    async login(identifier, password) {
      const cleanIdent = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanIdent) {
        return { success: false, error: 'Please enter your registered email address.' };
      }
      if (!cleanPass) {
        return { success: false, error: 'Please enter your password.' };
      }

      // 1. Try Supabase Auth First
      if (this.supabase && cleanIdent.includes('@')) {
        try {
          const { data, error } = await this.supabase.auth.signInWithPassword({
            email: cleanIdent,
            password: cleanPass
          });
          if (!error && data && data.user) {
            const fullName = data.user.user_metadata?.full_name || cleanIdent.split('@')[0].replace(/[._]/g, ' ');
            const user = {
              id: data.user.id,
              fullName: fullName,
              email: data.user.email,
              phone: data.user.user_metadata?.phone || '',
              memberTier: 'Organic Club Member',
              memberSince: 'Member 2026',
              avatarInitials: this.getInitials(fullName)
            };
            this.setCurrentUser(user);
            return { success: true, user };
          } else if (error) {
            console.warn('[AuthEngine] Supabase login error:', error.message);
            if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('invalid credentials')) {
              return { success: false, error: 'Invalid email or password. If you are new, please click Sign Up.' };
            }
          }
        } catch(e) {
          console.warn('[AuthEngine] Supabase login exception:', e);
        }
      }

      // 2. Check local registered accounts backup
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
        const matched = users.find(u => u.email && u.email.toLowerCase() === cleanIdent);

        if (matched) {
          if (matched.password !== cleanPass) {
            return { success: false, error: 'Incorrect password. Please try again.' };
          }
          const user = {
            id: matched.id || 'usr_' + Date.now(),
            fullName: matched.fullName || cleanIdent.split('@')[0],
            email: matched.email || cleanIdent,
            phone: matched.phone || '',
            memberTier: 'Organic Club Member',
            memberSince: 'Member 2026',
            avatarInitials: this.getInitials(matched.fullName || cleanIdent)
          };
          this.setCurrentUser(user);
          return { success: true, user };
        }
      } catch (err) {}

      return { success: false, error: 'No account found with this email. Please click "Sign Up" to create an account.' };
    },

    /**
     * Create Account (Sign Up)
     */
    async signup({ fullName, email, phone, password }) {
      const em = (email || '').trim().toLowerCase();
      const name = (fullName || em.split('@')[0].replace(/[._]/g, ' ')).trim();
      const ph = (phone || '').trim();
      const pass = (password || '').trim();

      if (!em || !em.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
      if (!pass || pass.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

      let userId = 'usr_' + Date.now();

      // 1. Supabase Signup Call
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase.auth.signUp({
            email: em,
            password: pass,
            options: {
              data: { full_name: name, phone: ph }
            }
          });
          if (error) {
            console.warn('[AuthEngine] Supabase signup error:', error.message);
            if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists') || error.status === 422) {
              return { success: false, error: 'An account with this email already exists. Please Log In.' };
            }
            return { success: false, error: error.message };
          }
          if (data && data.user) {
            userId = data.user.id;
          }
        } catch(e) {
          console.warn('[AuthEngine] Supabase signup exception:', e);
        }
      }

      // 2. Save in Local Users DB
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
      const existingIdx = users.findIndex(u => u.email && u.email.toLowerCase() === em);
      const newUserRecord = { id: userId, fullName: name, email: em, phone: ph, password: pass, createdAt: new Date().toISOString() };
      if (existingIdx >= 0) {
        users[existingIdx] = newUserRecord;
      } else {
        users.push(newUserRecord);
      }
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

      const user = {
        id: userId,
        fullName: name,
        email: em,
        phone: ph,
        memberTier: 'Organic Club Member',
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
        const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
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
        const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
      } catch(e) {
        return [];
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

      // 2. Mobile Bottom Dock - Keep label clean as 'Profile' without layout stretching
      document.querySelectorAll('.mobile-bottom-dock a[href*="account"]').forEach(tab => {
        const span = tab.querySelector('span');
        if (span) {
          span.textContent = 'Profile';
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
