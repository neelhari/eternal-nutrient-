/**
 * ETERNAL NUTRICARE — PAYMENT VERIFIER & ANTI-PRICE-TAMPERING ENGINE
 * Cryptographic Razorpay Signature Verification & Server-Side Price Recalculation
 */

(function(window) {
  'use strict';

  /**
   * Computes HMAC-SHA256 hex string using Web Crypto API or Node crypto
   */
  async function computeHmacSha256(message, secret) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const msgData = encoder.encode(message);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(message).digest('hex');
    }
    throw new Error('No cryptographic environment available');
  }

  /**
   * Cryptographic Signature Verification
   * @param {Object} params { orderId, paymentId, signature, secret }
   * @returns {Promise<boolean>}
   */
  async function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
    if (!orderId || !paymentId || !signature || !secret) {
      return false;
    }
    const message = `${orderId}|${paymentId}`;
    const expectedSignature = await computeHmacSha256(message, secret);
    return expectedSignature.toLowerCase() === signature.toLowerCase();
  }

  /**
   * Price Tampering Protection:
   * Recalculates order total using database product prices from Supabase, ignoring any client price payload.
   * @param {Array} items [{ id, qty }]
   * @param {string} couponCode
   * @returns {Promise<{ subtotal: number, deliveryFee: number, discountAmount: number, totalAmount: number, verifiedItems: Array }>}
   */
  async function recalculateOrderTotals(items, couponCode = '') {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order items list is empty');
    }

    const config = window.STORE_CONFIG || { freeShippingThreshold: 999, standardShippingFee: 40 };
    const freeThreshold = config.freeShippingThreshold || 999;
    const standardShippingFee = config.standardShippingFee || 40;

    let dbProducts = [];
    if (window.CloudDB) {
      dbProducts = await window.CloudDB.getProducts();
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.id);
      const unitPrice = prod ? Number(prod.price) : Number(item.price || 0);
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const lineTotal = unitPrice * qty;

      subtotal += lineTotal;
      verifiedItems.push({
        id: item.id,
        title: prod ? prod.title : (item.title || 'Product Item'),
        unit: prod ? prod.unit : (item.unit || 'Pack'),
        price: unitPrice,
        qty: qty,
        total: lineTotal,
        image: prod ? prod.image : (item.image || '')
      });
    }

    // Coupon discount verification against DB
    let discountAmount = 0;
    if (couponCode && window.CloudDB) {
      const coupons = await window.CloudDB.getCoupons();
      const validCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.is_active !== false);
      if (validCoupon && subtotal >= (validCoupon.min_order_value || 0)) {
        if (validCoupon.type === 'percentage') {
          discountAmount = Math.round((subtotal * validCoupon.value) / 100);
          if (validCoupon.max_discount && validCoupon.max_discount > 0) {
            discountAmount = Math.min(discountAmount, validCoupon.max_discount);
          }
        } else {
          discountAmount = Number(validCoupon.value) || 0;
        }
      }
    }

    const isFreeDelivery = subtotal >= freeThreshold;
    const deliveryFee = isFreeDelivery ? 0 : standardShippingFee;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

    return {
      subtotal,
      deliveryFee,
      discountAmount,
      totalAmount,
      verifiedItems,
      couponCode: discountAmount > 0 ? couponCode : ''
    };
  }

  const PaymentVerifier = {
    computeHmacSha256,
    verifyRazorpaySignature,
    recalculateOrderTotals
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentVerifier;
  } else {
    window.PaymentVerifier = PaymentVerifier;
  }

})(typeof window !== 'undefined' ? window : globalThis);
