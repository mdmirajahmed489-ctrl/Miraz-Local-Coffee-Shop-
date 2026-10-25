// Local Coffee Shop & Bakery - Interactive Master Script
// Features: Dark Mode, Cart Drawer & Online Ordering, Table Booking, Discount Banner, Contact Handler, Mobile Nav

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1. Mobile Navigation Toggle
  // ============================================================
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      navLinks.classList.toggle('open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('show');
        navLinks.classList.remove('open');
      }
    });
  }

  // ============================================================
  // 2. Dark Mode Toggle with LocalStorage Persistence
  // ============================================================
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('lcs_theme') || 'light';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  // Initial load
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-mode');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('lcs_theme', newTheme);
    });
  }

  // ============================================================
  // 3. Special Discount Banner Dismiss
  // ============================================================
  const discountBanner = document.getElementById('discountBanner');
  const bannerCloseBtn = document.getElementById('bannerCloseBtn');

  if (bannerCloseBtn && discountBanner) {
    bannerCloseBtn.addEventListener('click', () => {
      discountBanner.style.display = 'none';
    });
  }

  // ============================================================
  // 4. Cart Drawer & Online Order Management
  // ============================================================
  let cart = JSON.parse(localStorage.getItem('lcs_cart') || '[]');
  let appliedDiscount = 0; // percentage
  let appliedCouponCode = '';

  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggleBtns = document.querySelectorAll('.nav-cart-btn, .open-cart-btn, .banner-order-btn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsContainer = document.getElementById('cartItemsList');
  const cartCountBadges = document.querySelectorAll('#cartCount, .cart-badge');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const cartTotalEl = document.getElementById('cartTotal');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponInput = document.getElementById('couponCodeInput');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function saveCart() {
    localStorage.setItem('lcs_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    }
  }

  cartToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Add Item To Cart function
  window.addToCart = function (name, price, btnEl = null) {
    const parsedPrice = parseFloat(price);
    const existingIndex = cart.findIndex(item => item.name === name);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name,
        price: parsedPrice,
        quantity: 1
      });
    }

    saveCart();

    // Button visual feedback
    if (btnEl) {
      const originalText = btnEl.innerHTML;
      btnEl.innerHTML = '✓ ব্যাগে যোগ হয়েছে!';
      btnEl.style.background = '#27AE60';
      btnEl.style.color = '#FFFFFF';
      btnEl.style.borderColor = '#27AE60';
      setTimeout(() => {
        btnEl.innerHTML = originalText;
        btnEl.style.background = '';
        btnEl.style.color = '';
        btnEl.style.borderColor = '';
      }, 1800);
    }

    // Bounce floating cart button
    const floatBtn = document.querySelector('.floating-quick-cart-btn');
    if (floatBtn) {
      floatBtn.style.transform = 'scale(1.15)';
      setTimeout(() => {
        floatBtn.style.transform = '';
      }, 300);
    }

    showCustomToast(`🛒 "${name}" সফলভাবে ব্যাগে যোগ করা হয়েছে! ($${parsedPrice.toFixed(2)})`, 'success', {
      text: '⚡ এখনই অর্ডার করুন',
      onClick: 'window.openCheckoutModal()'
    });
  };

  // Attach event listeners to all Add to Cart buttons
  function attachCartButtonListeners() {
    document.querySelectorAll('.btn-add-cart, .btn-add-to-cart-action').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const name = btn.getAttribute('data-name');
        const price = btn.getAttribute('data-price');
        if (name && price) {
          window.addToCart(name, price, btn);
        }
      };
    });
  }
  attachCartButtonListeners();

  // Quick 1-Click Direct Order
  window.quickDirectOrder = function(name, price) {
    const parsedPrice = parseFloat(price);
    const existing = cart.find(item => item.name === name);
    if (!existing) {
      cart.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name,
        price: parsedPrice,
        quantity: 1
      });
      saveCart();
    }
    window.openCheckoutModal();
  };

  function updateCartUI() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
    });

    // Update floating cart badge if present
    const floatBadges = document.querySelectorAll('.floating-quick-cart-btn .float-badge');
    floatBadges.forEach(fb => {
      fb.textContent = totalItems;
    });

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-msg">
          <span class="empty-icon">☕</span>
          <h4>আপনার ব্যাগ বর্তমানে খালি</h4>
          <p style="font-size: 0.9rem; margin-top: 4px;">মেনু থেকে যেকোনো পছন্দের কফি ও পেস্ট্রি ১-ক্লিকে যোগ করুন:</p>
          <div class="cart-quick-recs">
            <h5>🔥 জনপ্রিয় কফি ও বেকারি আইটেম:</h5>
            <div class="cart-rec-item">
              <span class="cart-rec-info">☕ <strong>Caffè Latte</strong> <span class="cart-rec-price">$4.50</span></span>
              <button type="button" class="cart-rec-btn" onclick="window.addToCart('Caffè Latte', 4.50)">+ যোগ করুন</button>
            </div>
            <div class="cart-rec-item">
              <span class="cart-rec-info">☕ <strong>Cappuccino</strong> <span class="cart-rec-price">$4.00</span></span>
              <button type="button" class="cart-rec-btn" onclick="window.addToCart('Cappuccino', 4.00)">+ যোগ করুন</button>
            </div>
            <div class="cart-rec-item">
              <span class="cart-rec-info">🥐 <strong>Butter Croissant</strong> <span class="cart-rec-price">$3.00</span></span>
              <button type="button" class="cart-rec-btn" onclick="window.addToCart('Butter Croissant', 3.00)">+ যোগ করুন</button>
            </div>
            <div class="cart-rec-item">
              <span class="cart-rec-info">🎓 <strong>Exam Night Combo</strong> <span class="cart-rec-price">$5.50</span></span>
              <button type="button" class="cart-rec-btn" onclick="window.addStudentComboToCart('Exam Night Crunch Combo', 5.50)">+ যোগ করুন</button>
            </div>
          </div>
          <a href="menu.html" class="btn btn-sm" style="margin-top: 14px; width: 100%; display: block; text-align: center; text-decoration: none; background: var(--primary); color: #fff;">📖 সম্পূর্ণ মেনু দেখুন (View Full Menu)</a>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = '$0.00';
      if (cartDiscountEl) cartDiscountEl.textContent = '-$0.00';
      if (cartTotalEl) cartTotalEl.textContent = '$0.00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      return `
        <div class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="item-unit-price">$${item.price.toFixed(2)} each</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn dec-qty" onclick="changeQty('${item.id}', -1)">-</button>
            <span class="qty-count">${item.quantity}</span>
            <button class="qty-btn inc-qty" onclick="changeQty('${item.id}', 1)">+</button>
            <button class="item-delete-btn" onclick="removeItem('${item.id}')" title="Remove Item">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    const discountAmount = subtotal * (appliedDiscount / 100);
    const grandTotal = Math.max(0, subtotal - discountAmount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartDiscountEl) cartDiscountEl.textContent = `-$${discountAmount.toFixed(2)} (${appliedDiscount}%)`;
    if (cartTotalEl) cartTotalEl.textContent = `$${grandTotal.toFixed(2)}`;
  }

  window.changeQty = function (id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart();
    }
  };

  window.removeItem = function (id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  };

  // Coupon handling
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'STUDENT25' || code === 'STUDENT') {
        appliedDiscount = 25;
        appliedCouponCode = 'STUDENT25';
        showCustomToast('🎓 স্পেশাল স্টুডেন্ট প্রোমোকোড STUDENT25 সফলভাবে প্রয়োগ হয়েছে! আপনি ২৫% ছাড় পেয়েছেন।', 'success');
      } else if (code === 'COFFEE20') {
        appliedDiscount = 20;
        appliedCouponCode = 'COFFEE20';
        showCustomToast('🎉 প্রোমোকোড COFFEE20 সফলভাবে প্রয়োগ হয়েছে! আপনি ২০% ছাড় পেয়েছেন।', 'success');
      } else if (code === 'WELCOME10') {
        appliedDiscount = 10;
        appliedCouponCode = 'WELCOME10';
        showCustomToast('🎉 প্রোমোকোড WELCOME10 সফলভাবে প্রয়োগ হয়েছে! আপনি ১০% ছাড় পেয়েছেন।', 'success');
      } else if (code === '') {
        showCustomToast('অনুগ্রহ করে একটি কুপন কোড প্রবেশ করান।', 'info');
      } else {
        showCustomToast('❌ দুঃখিত, এই কুপন কোডটি সঠিক নয়। স্টুডেন্ট কোড: STUDENT25 অথবা COFFEE20', 'error');
      }
      updateCartUI();
    });
  }

  // Window helper to add Student Combos directly into Cart
  window.addStudentComboToCart = function(comboName, price, btnEl = null) {
    window.addToCart('🎓 ' + comboName, price, btnEl);
    showCustomToast(`🎓 "${comboName}" কার্টে সফলভাবে যোগ করা হয়েছে! ($${parseFloat(price).toFixed(2)})`, 'success', {
      text: '⚡ এখনই অর্ডার করুন',
      onClick: 'window.openCheckoutModal()'
    });
  };

  // Window helper to quickly apply Student 25% Promo Code
  window.applyStudentPromoQuick = function() {
    appliedDiscount = 25;
    appliedCouponCode = 'STUDENT25';
    if (couponInput) couponInput.value = 'STUDENT25';
    updateCartUI();

    showCustomModal({
      icon: '🎓',
      title: '২৫% স্পেশাল স্টুডেন্ট ডিসকাউন্ট সক্রিয়!',
      body: `
        <div style="text-align: left;">
          <div style="background: rgba(39, 174, 96, 0.12); border: 1px solid #27AE60; border-radius: var(--radius-sm); padding: 12px; margin-bottom: 1rem;">
            <div style="color: #27AE60; font-weight: 800; font-size: 1rem; margin-bottom: 4px;">🎉 প্রোমোকোড "STUDENT25" সফলভাবে প্রয়োগ করা হয়েছে!</div>
            <p style="margin: 0; font-size: 0.85rem; color: var(--dark);">আপনার অর্ডারের সর্বমোট বিলের উপর <strong>২৫% ইনস্ট্যান্ট ছাড়</strong> স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে।</p>
          </div>

          <div style="font-weight: 700; font-size: 0.92rem; margin-bottom: 8px; color: var(--primary);">⚡ জনপ্রিয় স্টুডেন্ট কম্বোসমূহ (১-ক্লিক অর্ডার):</div>
          
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--secondary); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">Exam Night Crunch</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">১টি কোল্ড ব্রু + ১টি ডার্ক চকলেট ব্রাউনি</div>
              </div>
              <button type="button" class="btn btn-sm" onclick="window.closeCustomModal(); window.quickDirectOrder('Exam Night Crunch Combo', 5.50)" style="background: var(--accent-gold); color: #1E293B; font-weight: 700; padding: 5px 10px; border-radius: 4px;">$5.50 অর্ডার</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--secondary); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">Group Study Platter</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">৩টি ক্যাপুচিনো + ৩টি বাটার ক্রোয়াসোঁ</div>
              </div>
              <button type="button" class="btn btn-sm" onclick="window.closeCustomModal(); window.quickDirectOrder('Group Study Platter (3x Coffee + 3x Pastry)', 16.50)" style="background: var(--accent-gold); color: #1E293B; font-weight: 700; padding: 5px 10px; border-radius: 4px;">$16.50 অর্ডার</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--secondary); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">Assignment Booster</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">১টি ডাবল এসপ্রেসো + ১টি সিনামন রোল</div>
              </div>
              <button type="button" class="btn btn-sm" onclick="window.closeCustomModal(); window.quickDirectOrder('Assignment Booster Combo', 5.80)" style="background: var(--accent-gold); color: #1E293B; font-weight: 700; padding: 5px 10px; border-radius: 4px;">$5.80 অর্ডার</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--secondary); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">Budget Chai & Muffin</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">১টি মসলা চাই লাতে + ১টি ব্লুবেরি মাফিন</div>
              </div>
              <button type="button" class="btn btn-sm" onclick="window.closeCustomModal(); window.quickDirectOrder('Budget Chai & Muffin Combo', 6.00)" style="background: var(--accent-gold); color: #1E293B; font-weight: 700; padding: 5px 10px; border-radius: 4px;">$6.00 অর্ডার</button>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn" onclick="window.closeCustomModal(); window.openCart();" style="flex: 1; background: var(--primary); color: #fff;">
              🛒 ব্যাগ দেখুন
            </button>
            <button type="button" class="btn" onclick="window.closeCustomModal();" style="flex: 1; background: var(--secondary); color: var(--dark); border: 1px solid var(--border-color);">
              মেনু ব্রাউজ করুন
            </button>
          </div>
        </div>
      `,
      hideCloseBtn: true
    });
  };

  // Interactive Checkout & Order Modal Flow
  window.openCheckoutModal = function() {
    if (cart.length === 0) {
      showCustomToast('আপনার ব্যাগে কোনো আইটেম নেই! মেনু থেকে আইটেম যোগ করুন।', 'info');
      openCart();
      return;
    }

    closeCart();

    const orderId = 'LCS-' + Math.floor(100000 + Math.random() * 900000);
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * (appliedDiscount / 100);
    const finalTotal = Math.max(0, subtotal - discount);

    const itemsSummaryHtml = cart.map(i => `
      <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding: 4px 0; border-bottom: 1px dashed rgba(0,0,0,0.08);">
        <span>${i.name} <strong>x${i.quantity}</strong></span>
        <strong>$${(i.price * i.quantity).toFixed(2)}</strong>
      </div>
    `).join('');

    showCustomModal({
      icon: '🛍️',
      title: 'অনলাইন অর্ডার ও ডেলিভারি তথ্য',
      body: `
        <div style="text-align: left;">
          <!-- Owner Branding Header in Checkout -->
          <div style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #1E293B, #0F172A); border: 1px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 1rem;">
            <img src="owner_merajul_islam.jpg" alt="Owner Merajul Islam" class="owner-img" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; object-position: center 20%; border: 2px solid var(--accent-gold); flex-shrink: 0;" referrerpolicy="no-referrer">
            <div style="flex: 1;">
              <div style="color: #FFF8DC; font-weight: 800; font-size: 0.95rem;">MERAJUL ISLAM (মেরাজুল ইসলাম)</div>
              <div style="color: var(--accent-gold); font-size: 0.78rem; font-weight: 600;">📍 ব্রাহ্মণবাড়িয়া • মালিক ও প্রধান রোস্টার</div>
              <div style="color: #94A3B8; font-size: 0.75rem;">হটলাইন / বিকাশ / নগদ: <strong style="color: #FFF;">01339564967</strong></div>
            </div>
          </div>

          <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 1rem;">
            <div style="font-weight: 700; color: var(--primary); font-size: 0.92rem; margin-bottom: 6px;">🛒 নির্বাচিত আইটেমসমূহ:</div>
            ${itemsSummaryHtml}
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: 800; font-size: 1.05rem; color: var(--accent-gold);">
              <span>সর্বমোট বিল:</span>
              <span>$${finalTotal.toFixed(2)} ${appliedDiscount > 0 ? `(${appliedDiscount}% ছাড়সহ)` : ''}</span>
            </div>
          </div>

          <form id="activeCheckoutForm" onsubmit="window.handleFinalOrderSubmit(event, '${orderId}', ${finalTotal.toFixed(2)})">
            <div class="form-group" style="margin-bottom: 10px;">
              <label for="custName" style="font-size: 0.85rem; font-weight: 700;">আপনার নাম (Customer Name)*</label>
              <input type="text" id="custName" placeholder="যেমন: তানভীর আহমেদ" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="custPhone" style="font-size: 0.85rem; font-weight: 700;">মোবাইল নম্বর (Phone Number)*</label>
              <input type="tel" id="custPhone" placeholder="017XXXXXXXX বা 013XXXXXXXX" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="custOrderType" style="font-size: 0.85rem; font-weight: 700;">অর্ডারের ধরন (Order Type)*</label>
              <select id="custOrderType" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--secondary); color: var(--dark);">
                <option value="Home Delivery (হোম ডেলিভারি)">🛵 হোম ডেলিভারি (Home Delivery)</option>
                <option value="Takeaway Pickup (পার্সেল পিকআপ)">🛍️ পার্সেল পিকআপ (Takeaway)</option>
                <option value="Dine-in (ক্যাফেতে বসে খাওয়া)">☕ ক্যাফেতে বসে খাওয়া (Dine-In Table)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="custAddress" style="font-size: 0.85rem; font-weight: 700;">ডেলিভারি ঠিকানা বা টেবিল নম্বর (Delivery Address / Table No)*</label>
              <input type="text" id="custAddress" placeholder="যেমন: বাসা নং ১২, রোড ৩, ব্রাহ্মণবাড়িয়া সদর অথবা টেবিল #০৪" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 4px;">পেমেন্ট মেথড নির্বাচন করুন (Payment Method)*</label>
              <div class="payment-methods-grid">
                <label class="payment-method-card selected" onclick="window.selectPaymentRadio(this, 'bKash')">
                  <input type="radio" name="payMethod" value="bKash (01339564967)" checked>
                  <span class="method-icon">📱</span>
                  <span class="method-title">বিকাশ (bKash)</span>
                  <span class="method-sub">01339564967</span>
                </label>
                <label class="payment-method-card" onclick="window.selectPaymentRadio(this, 'Nagad')">
                  <input type="radio" name="payMethod" value="Nagad (01339564967)">
                  <span class="method-icon">📱</span>
                  <span class="method-title">নগদ (Nagad)</span>
                  <span class="method-sub">01339564967</span>
                </label>
                <label class="payment-method-card" onclick="window.selectPaymentRadio(this, 'Cash')">
                  <input type="radio" name="payMethod" value="ক্যাশ অন ডেলিভারি (Cash on Delivery)">
                  <span class="method-icon">💵</span>
                  <span class="method-title">ক্যাশ অন ডেলিভারি</span>
                  <span class="method-sub">ক্যাশ পেমেন্ট</span>
                </label>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label for="custTrx" style="font-size: 0.85rem; font-weight: 700;">bKash/Nagad ট্রানজেকশন আইডি বা লাস্ট ৪ সংখ্যা (ঐচ্ছিক)</label>
              <input type="text" id="custTrx" placeholder="যেমন: TRX9847 বা 4967" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label for="custNotes" style="font-size: 0.85rem; font-weight: 700;">স্পেশাল নোট বা অনুরোধ (ঐচ্ছিক)</label>
              <input type="text" id="custNotes" placeholder="যেমন: চিনি কম, অতিরিক্ত হট কফি ইত্যাদি" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>

            <button type="submit" class="btn" style="width: 100%; padding: 12px; font-weight: 800; font-size: 1rem; background: var(--accent-gold); color: #1E293B; border-radius: 6px; border: none; cursor: pointer;">
              🚀 অর্ডার নিশ্চিত করুন ও হোয়াটসঅ্যাপে পাঠান (Confirm Order)
            </button>
          </form>
        </div>
      `
    });
  };

  // Helper for Payment Radio UI
  window.selectPaymentRadio = function(el, method) {
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const input = el.querySelector('input[type="radio"]');
    if (input) input.checked = true;
  };

  // Handle Final Order Submission
  window.handleFinalOrderSubmit = function(e, orderId, finalTotal) {
    e.preventDefault();

    const name = document.getElementById('custName')?.value || 'Guest Customer';
    const phone = document.getElementById('custPhone')?.value || '01XXXXXXXXX';
    const orderType = document.getElementById('custOrderType')?.value || 'Home Delivery';
    const address = document.getElementById('custAddress')?.value || 'Local Pickup';
    const payMethodRadio = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = payMethodRadio ? payMethodRadio.value : 'bKash (01339564967)';
    const trx = document.getElementById('custTrx')?.value || 'Not provided';
    const notes = document.getElementById('custNotes')?.value || 'None';

    const itemsSummary = cart.map(i => `${i.name} (x${i.quantity}) - $${(i.price * i.quantity).toFixed(2)}`).join('<br>');
    const itemsPlain = cart.map(i => `- ${i.name} (x${i.quantity}): $${(i.price * i.quantity).toFixed(2)}`).join('\n');

    // Build WhatsApp message for shop owner 01339564967
    const waText = `☕ *Local Coffee Shop - New Order*\n` +
      `--------------------------------\n` +
      `🆔 *Order ID:* #${orderId}\n` +
      `👤 *গ্রাহকের নাম:* ${name}\n` +
      `📱 *মোবাইল:* ${phone}\n` +
      `🛵 *অর্ডারের ধরন:* ${orderType}\n` +
      `📍 *ঠিকানা/টেবিল:* ${address}\n` +
      `💳 *পেমেন্ট মাধ্যম:* ${payMethod}\n` +
      (trx !== 'Not provided' ? `🔖 *TrxID / Last 4:* ${trx}\n` : '') +
      (notes !== 'None' ? `📝 *নোট:* ${notes}\n` : '') +
      `--------------------------------\n` +
      `🛒 *অর্ডারকৃত আইটেমসমূহ:*\n${itemsPlain}\n` +
      `--------------------------------\n` +
      `💰 *সর্বমোট বিল:* $${finalTotal} ${appliedDiscount > 0 ? `(${appliedDiscount}% ছাড়সহ)` : ''}\n` +
      `\nঅনুগ্রহ করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;

    // Save order permanently in local storage for Order Tracker
    const newOrderRecord = {
      id: orderId,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
      name: name,
      phone: phone,
      orderType: orderType,
      address: address,
      payMethod: payMethod,
      trx: trx,
      notes: notes,
      items: [...cart],
      itemsSummary: itemsSummary,
      itemsPlain: itemsPlain,
      subtotal: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      discount: appliedDiscount,
      total: finalTotal,
      status: 'received'
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('lcs_orders') || '[]');
      existingOrders.unshift(newOrderRecord);
      localStorage.setItem('lcs_orders', JSON.stringify(existingOrders));
      // Also save last active order ID
      localStorage.setItem('lcs_last_order_id', orderId);
    } catch(err) {
      console.warn('Could not save order to storage:', err);
    }

    showCustomToast('✅ অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।', 'success');

    // Automatically trigger PDF download safely
    try {
      if (typeof window.downloadReceiptPDF === 'function') {
        window.downloadReceiptPDF(orderId, encodeURIComponent(itemsPlain), finalTotal.toString());
      }
    } catch(pdfErr) {
      console.warn('PDF generation note:', pdfErr);
    }

    // Direct WhatsApp Web / App universal link
    const waUrl = `https://api.whatsapp.com/send?phone=8801339564967&text=${encodeURIComponent(waText)}`;

    // Show Confirmation Modal with Order Tracker Link
    showCustomModal({
      icon: '🎉',
      title: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!',
      body: `
        <div style="text-align: left; font-size: 0.92rem;">
          <!-- Owner Confirmation Header -->
          <div style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #1E293B, #0F172A); border: 1px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 1rem;">
            <img src="/owner_merajul_islam.jpg" alt="Owner Merajul Islam" class="owner-img" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; object-position: center 20%; border: 2px solid var(--accent-gold); flex-shrink: 0;" referrerpolicy="no-referrer">
            <div style="flex: 1;">
              <div style="color: #FFF8DC; font-weight: 800; font-size: 0.95rem;">MERAJUL ISLAM (মেরাজুল ইসলাম)</div>
              <div style="color: var(--accent-gold); font-size: 0.78rem; font-weight: 600;">মালিক ও প্রতিষ্ঠাতা • ব্রাহ্মণবাড়িয়া</div>
              <div style="color: #4ADE80; font-size: 0.75rem; font-weight: 700;">✅ আপনার #${orderId} অর্ডারটি ওনারের কাছে পাঠানো হয়েছে</div>
            </div>
          </div>

          <p style="color: var(--success); font-weight: 700; margin-bottom: 8px;">
            ✅ ধন্যবাদ ${name}! আপনার #${orderId} অর্ডারটি সফলভাবে রিসিভ করা হয়েছে।
          </p>
          <div class="modal-receipt">
            <strong>Order ID:</strong> #${orderId}<br>
            <strong>গ্রাহকের নাম:</strong> ${name} (${phone})<br>
            <strong>ঠিকানা / টেবিল:</strong> ${address}<br>
            <strong>অর্ডারের ধরন:</strong> ${orderType}<br>
            <strong>পেমেন্ট মেথড:</strong> ${payMethod}<br>
            <strong>আইটেমসমূহ:</strong><br>${itemsSummary}<br>
            <hr style="margin: 6px 0; border: 0; border-top: 1px dashed #ccc;">
            <strong>সর্বমোট পেমেন্ট:</strong> $${finalTotal} ${appliedDiscount > 0 ? `(ডিসকাউন্ট অন্তর্ভুক্ত)` : ''}
          </div>
          <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn" onclick="window.openOrderTracker('${orderId}')" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: var(--accent-gold); border: 1.5px solid var(--accent-gold); font-weight: 800; border-radius: 6px; padding: 12px; font-size: 0.95rem; cursor: pointer;">
              📦 লাইভ অর্ডারের অবস্থা ট্র্যাক করুন (Track Order #${orderId})
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="background: #25D366; color: #FFF; font-weight: 800; border-radius: 6px; text-decoration: none; text-align: center; padding: 12px; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(37,211,102,0.35);">
              💬 ওনারকে হোয়াটসঅ্যাপে অর্ডার নিশ্চিত করতে মেসেজ পাঠান
            </a>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-sm" onclick="try { window.downloadReceiptPDF('${orderId}', '${encodeURIComponent(itemsPlain)}', '${finalTotal}'); } catch(e){}" style="flex: 1; background: var(--accent-gold); color: #1E293B; font-weight: 800; border-radius: 6px;">
                📥 রসিদ PDF ডাউনলোড
              </button>
              <a href="tel:01339564967" class="btn btn-sm btn-secondary" style="flex: 1; text-align: center; text-decoration: none; font-weight: 700; border-radius: 6px;">
                📞 কল করুন (01339564967)
              </a>
            </div>
          </div>
          <p style="font-size: 0.8rem; margin-top: 12px; color: var(--dark-soft); text-align: center;">
            আমাদের মাস্টার বারিস্তা ও ডেলিভারি টিম এখনই আপনার অর্ডার প্রস্তুত করতে শুরু করেছে।
          </p>
        </div>
      `
    });

    // Clear cart
    cart = [];
    appliedDiscount = 0;
    appliedCouponCode = '';
    if (couponInput) couponInput.value = '';
    saveCart();
  };

  // Checkout handling button in Cart Drawer
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCheckoutModal();
    });
  }

  // Initialize Floating Quick Cart Button across all pages
  function injectFloatingCartButton() {
    if (document.querySelector('.floating-quick-cart-btn')) return;
    const floatBtn = document.createElement('button');
    floatBtn.type = 'button';
    floatBtn.className = 'floating-quick-cart-btn';
    floatBtn.setAttribute('title', 'আপনার অর্ডার ব্যাগ ও চেকআউট (Order Bag)');
    floatBtn.setAttribute('aria-label', 'View Cart');
    floatBtn.innerHTML = `
      <span>🛒 অর্ডার ব্যাগ</span>
      <span class="float-badge">${cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
    `;
    floatBtn.onclick = (e) => {
      e.preventDefault();
      openCart();
    };
    document.body.appendChild(floatBtn);
  }
  injectFloatingCartButton();

  // Initialize UI
  updateCartUI();

  // ============================================================
  // 5. Table Booking / Reservation Form
  // ============================================================
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = bookingForm.querySelector('[name="name"]')?.value || 'Guest';
      const guests = bookingForm.querySelector('[name="guests"]')?.value || '2';
      const date = bookingForm.querySelector('[name="date"]')?.value || new Date().toISOString().split('T')[0];
      const time = bookingForm.querySelector('[name="time"]')?.value || '6:00 PM';
      const seating = bookingForm.querySelector('[name="seating"]')?.value || 'Indoor Cozy';

      const bookingId = 'TBL-' + Math.floor(1000 + Math.random() * 9000);

      showCustomModal({
        icon: '☕',
        title: 'টেবিল বুকিং কনফার্মেশন!',
        body: `
          <p>প্রিয় <strong>${name}</strong>, লোকাল কফি শপে আপনার টেবিল সফলভাবে সংরক্ষিত হয়েছে।</p>
          <div class="modal-receipt">
            <strong>Booking ID:</strong> #${bookingId}<br>
            <strong>তারিখ:</strong> ${date}<br>
            <strong>সময়:</strong> ${time}<br>
            <strong>অতিথির সংখ্যা:</strong> ${guests} জন<br>
            <strong>আসন পছন্দ:</strong> ${seating}
          </div>
          <p style="font-size: 0.85rem;">আপনার টেবিল সময়মতো প্রস্তুত রাখা হবে। কোনো পরিবর্তন করতে চাইলে আমাদের ফোন করুন <strong>01339564967</strong> নম্বরে।</p>
        `
      });

      bookingForm.reset();
    });
  }

  // ============================================================
  // 6. Contact Form Handler
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।');
      contactForm.reset();
    });
  }

  // ============================================================
  // 7. Loyalty Card Membership Management
  // ============================================================
  const loyaltyModalOverlay = document.getElementById('loyaltyModalOverlay');
  const openLoyaltyModalBtn = document.getElementById('openLoyaltyModalBtn');
  const loyaltyPerksBtn = document.getElementById('loyaltyPerksBtn');
  const loyaltyModalCloseBtn = document.getElementById('loyaltyModalCloseBtn');
  const loyaltyJoinForm = document.getElementById('loyaltyJoinForm');
  const cardDisplayName = document.getElementById('cardDisplayName');
  const cardDisplayNumber = document.getElementById('cardDisplayNumber');

  // Load existing membership if saved
  const savedMember = JSON.parse(localStorage.getItem('lcs_loyalty_member') || 'null');
  if (savedMember) {
    if (cardDisplayName) cardDisplayName.textContent = savedMember.name.toUpperCase();
    if (cardDisplayNumber) cardDisplayNumber.textContent = savedMember.cardNumber;
  }

  function openLoyaltyModal() {
    if (loyaltyModalOverlay) loyaltyModalOverlay.classList.add('active');
  }

  function closeLoyaltyModal() {
    if (loyaltyModalOverlay) loyaltyModalOverlay.classList.remove('active');
  }

  if (openLoyaltyModalBtn) openLoyaltyModalBtn.addEventListener('click', openLoyaltyModal);
  if (loyaltyModalCloseBtn) loyaltyModalCloseBtn.addEventListener('click', closeLoyaltyModal);
  if (loyaltyModalOverlay) {
    loyaltyModalOverlay.addEventListener('click', (e) => {
      if (e.target === loyaltyModalOverlay) closeLoyaltyModal();
    });
  }

  if (loyaltyPerksBtn) {
    loyaltyPerksBtn.addEventListener('click', () => {
      showCustomModal({
        icon: '⭐',
        title: 'লোকাল কফি ক্লাব - মেম্বারশিপ সুবিধাসমূহ',
        body: `
          <div style="text-align: left; font-size: 0.92rem; line-height: 1.7;">
            <p><strong>👑 গোল্ড রোস্টার মেম্বার বেনিফিটস:</strong></p>
            <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">
              <li><strong>১ স্টার / $১:</strong> প্রতিটি অর্ডারে স্বয়ংক্রিয়ভাবে স্টার জমা হবে।</li>
              <li><strong>ফ্রি কফি রিওয়ার্ডস:</strong> প্রতি ১০ স্টার সম্পন্ন হলেই ১টি ফ্রি সিগনেচার ড্রিংক।</li>
              <li><strong>১৫% ফ্ল্যাট ছাড়:</strong> সকল হোল বিন কফি ব্যাগ ও পেস্ট্রিতে বিশেষ ছাড়।</li>
              <li><strong>জন্মদিনের উপহার:</strong> জন্মদিনের পুরো মাসে ফ্রি স্পেশাল কফি ও ডেজার্ট।</li>
              <li><strong>এক্সক্লুসিভ অ্যাক্সেস:</strong> মিরাজুল ইসলামের নতুন রোস্টেড বিন্স ও সিজনাল ফ্লেভারের ফার্স্ট টেস্টের আমন্ত্রণ।</li>
            </ul>
          </div>
        `
      });
    });
  }

  if (loyaltyJoinForm) {
    loyaltyJoinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('loyaltyNameInput');
      const phoneInput = document.getElementById('loyaltyPhoneInput');
      const favBrewSelect = document.getElementById('loyaltyFavBrew');

      const name = nameInput ? nameInput.value.trim() : 'Guest Member';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const favBrew = favBrewSelect ? favBrewSelect.value : 'Signature Espresso';
      const randomCardNum = 'LCS-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);

      const memberData = {
        name: name,
        phone: phone,
        favBrew: favBrew,
        cardNumber: randomCardNum,
        stars: 50,
        tier: 'Gold Roaster',
        joinedAt: new Date().toLocaleDateString('bn-BD')
      };

      localStorage.setItem('lcs_loyalty_member', JSON.stringify(memberData));

      if (cardDisplayName) cardDisplayName.textContent = name.toUpperCase();
      if (cardDisplayNumber) cardDisplayNumber.textContent = randomCardNum;

      closeLoyaltyModal();
      loyaltyJoinForm.reset();

      showCustomModal({
        icon: '🎉',
        title: 'অভিনন্দন! আপনার ভিআইপি মেম্বারশিপ প্রস্তুত',
        body: `
          <p>প্রিয় <strong>${name}</strong>, লোকাল কফি ক্লাবে আপনাকে স্বাগতম!</p>
          <div class="modal-receipt">
            <strong>মেম্বার আইডি:</strong> ${randomCardNum}<br>
            <strong>মেম্বারশিপ টায়ার:</strong> ⭐ GOLD ROASTER<br>
            <strong>ওয়েলকাম স্টার ব্যালেন্স:</strong> ৫০ Stars (৫০ পয়েন্ট)<br>
            <strong>পছন্দের ব্রু:</strong> ${favBrew}
          </div>
          <p style="font-size: 0.85rem;">কাউন্টারে বা অনলাইন অর্ডারে আপনার মেম্বার আইডি দেখিয়ে সাথে সাথে ১৫% ছাড় ও ফ্রি কফি পয়েন্ট গ্রহণ করুন।</p>
        `
      });
    });
  }

  // ============================================================
  // 8. 5-Star Customer Reviews with Filter & Write Review
  // ============================================================
  const defaultReviews = [
    {
      id: 'rev_1',
      name: 'তানভীর হাসান (Tanvir Hasan)',
      avatar: 'TH',
      stars: 5,
      date: '২ দিন আগে (2 days ago)',
      category: 'coffee',
      tag: '☕ সিগনেচার এসপ্রেসো ও লাতে',
      text: 'শহরের সেরা ক্যাপুচিনো এবং বাটার ক্রোয়াসোঁ! ব্রাহ্মণবাড়িয়ার সন্তান মিরাজুল ইসলাম ভাইয়ের কফি রোস্টিং টেকনিক অতুলনীয়। ৫০ জনের দক্ষ সার্ভিস টিম সবসময় মুখে হাসি নিয়ে সেবা দেয়।',
      helpful: 24,
      verified: true
    },
    {
      id: 'rev_2',
      name: 'আয়েশা রহমান (Ayesha Rahman)',
      avatar: 'AR',
      stars: 5,
      date: '৪ দিন আগে (4 days ago)',
      category: 'ambiance',
      tag: '🏡 শান্ত কাজের পরিবেশ ও ওয়াইফাই',
      text: 'শান্ত ও নান্দনিক পরিবেশ, হাই-স্পিড ওয়াইফাই এবং পারফেক্ট ক্যারামেল ম্যাকিয়াটো। ল্যাপটপে কাজের জন্য Quiet Work Zone খুবই আরামদায়ক। অনলাইনে টেবিল বুকিং দিয়ে এসে সরাসরি বসা গেছে।',
      helpful: 18,
      verified: true
    },
    {
      id: 'rev_3',
      name: 'রাহুল দাশ (Rahul Das)',
      avatar: 'RD',
      stars: 5,
      date: '১ সপ্তাহ আগে (1 week ago)',
      category: 'pastry',
      tag: '🥐 বাটার ক্রোয়াসোঁ ও ব্লুবেরি মাফিন',
      text: 'প্রতিদিন সকালে গরম ও ক্রিস্পি ক্রোয়াসোঁর সাথে ফ্রেশ ব্রিউড কফি আমার দিনের সেরা শুরু। কুপন কোড COFFEE20 দিয়ে ২০% ছাড় পেয়েছি। এদের বেকারি আইটেম শহরের যেকোনো ক্যাফের চেয়ে ফ্রেশ!',
      helpful: 31,
      verified: true
    },
    {
      id: 'rev_4',
      name: 'মেহজাবীন চৌধুরী (Mehjabeen C.)',
      avatar: 'MC',
      stars: 5,
      date: '২ সপ্তাহ আগে (2 weeks ago)',
      category: 'coffee',
      tag: '☕ ব্রাহ্মণবাড়িয়া স্পেশাল রোস্ট',
      text: 'লোকাল কফি ক্লাবের মেম্বারশিপ নিয়ে সাথে সাথে ৫০ পয়েন্ট পেয়েছিলাম। ইথিওপিয়ান অ্যারাবিকা বিন্সের অ্যারোমা অসাধারণ! বারিস্তা নাঈম খুব যত্নের সাথে কফি ব্রিউ করে দিয়েছেন।',
      helpful: 15,
      verified: true
    },
    {
      id: 'rev_5',
      name: 'সাকিব আল মাহমুদ (Sakib Al Mahmud)',
      avatar: 'SM',
      stars: 5,
      date: '৩ সপ্তাহ আগে (3 weeks ago)',
      category: 'ambiance',
      tag: '👥 ৫০+ দক্ষ ও আন্তরিক স্টাফ',
      text: 'মিরাজুল ইসলাম ভাইয়ের বলিষ্ঠ নেতৃত্বে পুরো ৫০ জনের স্টাফ টিম যে আন্তরিকতা ও প্রফেশনালিজম দেখায় তা প্রশংসনীয়। বন্ধুদের সাথে আড্ডায় বা মিটিংয়ে আমাদের নিয়মিত ঠিকানা।',
      helpful: 29,
      verified: true
    }
  ];

  let userReviews = JSON.parse(localStorage.getItem('lcs_customer_reviews') || '[]');
  let allReviews = [...userReviews, ...defaultReviews];
  let currentFilter = 'all';

  const reviewsContainer = document.getElementById('reviewsContainer');
  const reviewFilterChips = document.querySelectorAll('#reviewFilterGroup .filter-chip');
  const openReviewModalBtn = document.getElementById('openReviewModalBtn');
  const reviewModalOverlay = document.getElementById('reviewModalOverlay');
  const reviewModalCloseBtn = document.getElementById('reviewModalCloseBtn');
  const writeReviewForm = document.getElementById('writeReviewForm');
  const starSelector = document.getElementById('starSelector');
  const selectedStarRatingInput = document.getElementById('selectedStarRating');

  function renderReviews() {
    if (!reviewsContainer) return;

    let filtered = allReviews;
    if (currentFilter === '5-star') {
      filtered = allReviews.filter(r => r.stars === 5);
    } else if (currentFilter !== 'all') {
      filtered = allReviews.filter(r => r.category === currentFilter);
    }

    if (filtered.length === 0) {
      reviewsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--secondary-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <span style="font-size: 2rem;">☕</span>
          <h4 style="margin-top: 6px;">এই ক্যাটাগরিতে এখনো কোনো রিভিউ নেই</h4>
          <p style="font-size: 0.88rem; color: var(--dark-soft);">প্রথম রিভিউটি দিতে উপরের 'একটি রিভিউ দিন' বাটনে ক্লিক করুন।</p>
        </div>
      `;
      return;
    }

    reviewsContainer.innerHTML = filtered.map(rev => {
      const starString = '★'.repeat(rev.stars) + '☆'.repeat(5 - rev.stars);
      return `
        <div class="review-card-item" data-id="${rev.id}">
          <div>
            <div class="review-item-header">
              <span class="review-stars">${starString}</span>
              <span class="review-date">${rev.date}</span>
            </div>
            <span class="review-tag-badge">${rev.tag}</span>
            <p class="review-body-text">"${rev.text}"</p>
          </div>
          <div class="review-footer">
            <div class="reviewer-meta">
              <div class="reviewer-avatar">${rev.avatar}</div>
              <div class="reviewer-info">
                <h4>${rev.name}</h4>
                <span><span class="verified-badge">✓</span> ভেরিফায়েড গেস্ট</span>
              </div>
            </div>
            <button type="button" class="btn-helpful" onclick="voteHelpful('${rev.id}', this)" title="Mark as Helpful">
              👍 <span class="helpful-count">${rev.helpful}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter chips click handling
  reviewFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      reviewFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter') || 'all';
      renderReviews();
    });
  });

  // Helpful voting handler
  window.voteHelpful = function (revId, btn) {
    if (btn.classList.contains('voted')) return;
    btn.classList.add('voted');
    const countEl = btn.querySelector('.helpful-count');
    if (countEl) {
      const current = parseInt(countEl.textContent || '0', 10);
      countEl.textContent = current + 1;
    }
  };

  // Review modal open / close
  if (openReviewModalBtn) {
    openReviewModalBtn.addEventListener('click', () => {
      if (reviewModalOverlay) reviewModalOverlay.classList.add('active');
    });
  }

  if (reviewModalCloseBtn) {
    reviewModalCloseBtn.addEventListener('click', () => {
      if (reviewModalOverlay) reviewModalOverlay.classList.remove('active');
    });
  }

  if (reviewModalOverlay) {
    reviewModalOverlay.addEventListener('click', (e) => {
      if (e.target === reviewModalOverlay) {
        reviewModalOverlay.classList.remove('active');
      }
    });
  }

  // Interactive 5-Star Selector
  if (starSelector) {
    const starSpans = starSelector.querySelectorAll('span');
    starSpans.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-val') || '5', 10);
        starSpans.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-val') || '0', 10);
          if (sVal <= val) {
            s.classList.add('hovered');
          } else {
            s.classList.remove('hovered');
          }
        });
      });

      starSelector.addEventListener('mouseleave', () => {
        starSpans.forEach(s => s.classList.remove('hovered'));
      });

      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-val') || '5', 10);
        if (selectedStarRatingInput) selectedStarRatingInput.value = val;
        starSpans.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-val') || '0', 10);
          if (sVal <= val) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      });
    });
  }

  // Write Review form submit
  if (writeReviewForm) {
    writeReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = document.getElementById('revAuthorName');
      const catSelect = document.getElementById('revCategoryTag');
      const commentInput = document.getElementById('revComment');
      const rating = parseInt(selectedStarRatingInput ? selectedStarRatingInput.value : '5', 10);

      const authorName = authorInput ? authorInput.value.trim() : 'Guest';
      const category = catSelect ? catSelect.value : 'coffee';
      const comment = commentInput ? commentInput.value.trim() : '';

      const categoryLabels = {
        coffee: '☕ সিগনেচার স্পেশাল কফি',
        pastry: '🥐 বেকারি ও আর্টিশান পেস্ট্রি',
        ambiance: '🏡 ক্যাফে আবহ ও সার্ভিস'
      };

      const initials = authorName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'CU';

      const newRev = {
        id: 'rev_user_' + Date.now(),
        name: authorName,
        avatar: initials,
        stars: rating,
        date: 'আজ (Just now)',
        category: category,
        tag: categoryLabels[category] || '☕ স্পেশাল কফি',
        text: comment,
        helpful: 1,
        verified: true
      };

      userReviews.unshift(newRev);
      localStorage.setItem('lcs_customer_reviews', JSON.stringify(userReviews));
      allReviews = [...userReviews, ...defaultReviews];

      renderReviews();
      if (reviewModalOverlay) reviewModalOverlay.classList.remove('active');
      writeReviewForm.reset();

      showCustomModal({
        icon: '🌟',
        title: 'রিভিউ দেওয়ার জন্য ধন্যবাদ!',
        body: `
          <p>প্রিয় <strong>${authorName}</strong>, আপনার ৫-স্টার রিভিউ সফলভাবে প্রকাশিত হয়েছে।</p>
          <div class="modal-receipt">
            <strong>রেটিং:</strong> ${'★'.repeat(rating)} (${rating}-Star)<br>
            <strong>বিষয়:</strong> ${categoryLabels[category]}<br>
            <strong>মন্তব্য:</strong> "${comment.substring(0, 90)}..."
          </div>
          <p style="font-size: 0.85rem;">আমাদের ক্যাফে পরিবারে আপনার মতামত অত্যন্ত মূল্যবান।</p>
        `
      });
    });
  }

  // Initial render of reviews
  renderReviews();

  // ============================================================
  // 9. Interactive FAQ Accordion & Live Search
  // ============================================================
  const faqAccordion = document.getElementById('faqAccordion');
  const faqSearchInput = document.getElementById('faqSearchInput');

  if (faqAccordion) {
    const faqItems = faqAccordion.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');

          // Close all items
          faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            const btn = otherItem.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });

          // Toggle current
          if (!isActive) {
            item.classList.add('active');
            questionBtn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });

    // Live search in FAQ
    if (faqSearchInput) {
      faqSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        faqItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          if (query === '' || text.includes(query)) {
            item.style.display = 'block';
            if (query !== '') {
              item.classList.add('active');
            }
          } else {
            item.style.display = 'none';
          }
        });
      });
    }
  }

  // ============================================================
  // 10. Owner Photo Change & Live Customization System
  // ============================================================
  const DEFAULT_OWNER_PHOTO = "/owner_merajul_islam.jpg";
  const photoModalOverlay = document.getElementById('photoModalOverlay');
  const photoModalCloseBtn = document.getElementById('photoModalCloseBtn');
  const photoModalPreview = document.getElementById('photoModalPreview');
  const photoDropzone = document.getElementById('photoDropzone');
  const ownerPhotoInput = document.getElementById('ownerPhotoInput');
  const ownerPhotoUrlInput = document.getElementById('ownerPhotoUrlInput');
  const savePhotoBtn = document.getElementById('savePhotoBtn');
  const resetPhotoBtn = document.getElementById('resetPhotoBtn');

  // Trigger buttons across about and home pages
  const photoTriggers = [
    document.getElementById('ownerImgClickTrigger'),
    document.getElementById('openPhotoModalBadge'),
    document.getElementById('openPhotoModalBtn'),
    document.getElementById('ownerImgClickTriggerIndex'),
    document.getElementById('openPhotoModalBadgeIndex'),
    document.getElementById('openPhotoModalBtnIndex')
  ];

  let pendingPhotoSrc = null;

  // Apply saved owner photo on page load
  function loadSavedOwnerPhoto() {
    // Version check to force update to owner's real photo
    const PHOTO_VERSION = 'v2026_merajul_ibb_original_direct_1788312551256';
    if (localStorage.getItem('lcs_owner_photo_ver') !== PHOTO_VERSION) {
      localStorage.removeItem('lcs_owner_custom_photo');
      localStorage.setItem('lcs_owner_photo_ver', PHOTO_VERSION);
    }

    let savedCustomPhoto = localStorage.getItem('lcs_owner_custom_photo');
    // If an old stock photo URL was previously saved in localStorage, clear it
    if (savedCustomPhoto && (savedCustomPhoto.includes('unsplash') || savedCustomPhoto.includes('pexels') || savedCustomPhoto.includes('photo-15'))) {
      localStorage.removeItem('lcs_owner_custom_photo');
      savedCustomPhoto = null;
    }
    const photoToApply = savedCustomPhoto || DEFAULT_OWNER_PHOTO;

    document.querySelectorAll('.owner-img').forEach(img => {
      img.src = photoToApply;
      img.onerror = function() {
        if (this.src !== DEFAULT_OWNER_PHOTO && !this.src.endsWith(DEFAULT_OWNER_PHOTO)) {
          this.src = DEFAULT_OWNER_PHOTO;
        }
      };
    });

    if (photoModalPreview) {
      photoModalPreview.src = photoToApply;
      photoModalPreview.onerror = function() {
        this.src = DEFAULT_OWNER_PHOTO;
      };
    }
  }

  loadSavedOwnerPhoto();

  function openPhotoModal() {
    if (photoModalOverlay) {
      const currentPhoto = localStorage.getItem('lcs_owner_custom_photo') || DEFAULT_OWNER_PHOTO;
      if (photoModalPreview) photoModalPreview.src = currentPhoto;
      pendingPhotoSrc = currentPhoto;
      if (ownerPhotoUrlInput) ownerPhotoUrlInput.value = '';
      if (ownerPhotoInput) ownerPhotoInput.value = '';
      photoModalOverlay.classList.add('active');
    }
  }

  function closePhotoModal() {
    if (photoModalOverlay) {
      photoModalOverlay.classList.remove('active');
    }
  }

  photoTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPhotoModal();
      });
    }
  });

  if (photoModalCloseBtn) {
    photoModalCloseBtn.addEventListener('click', closePhotoModal);
  }

  if (photoModalOverlay) {
    photoModalOverlay.addEventListener('click', (e) => {
      if (e.target === photoModalOverlay) {
        closePhotoModal();
      }
    });
  }

  // Dropzone click triggers hidden file input
  if (photoDropzone && ownerPhotoInput) {
    photoDropzone.addEventListener('click', () => {
      ownerPhotoInput.click();
    });

    // Drag and drop handlers
    ['dragenter', 'dragover'].forEach(eventName => {
      photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoDropzone.classList.remove('dragover');
      });
    });

    photoDropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleImageFile(files[0]);
      }
    });

    ownerPhotoInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleImageFile(files[0]);
      }
    });
  }

  // Handle uploaded file converting to Data URL for instant preview
  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল নির্বাচন করুন (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      pendingPhotoSrc = result;
      if (photoModalPreview) photoModalPreview.src = result;
      if (ownerPhotoUrlInput) ownerPhotoUrlInput.value = '';
    };
    reader.readAsDataURL(file);
  }

  // URL input handler with live preview
  if (ownerPhotoUrlInput) {
    ownerPhotoUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        pendingPhotoSrc = url;
        if (photoModalPreview) photoModalPreview.src = url;
      }
    });
  }

  // Save new photo button
  if (savePhotoBtn) {
    savePhotoBtn.addEventListener('click', () => {
      const finalSrc = (ownerPhotoUrlInput && ownerPhotoUrlInput.value.trim()) 
        ? ownerPhotoUrlInput.value.trim() 
        : pendingPhotoSrc;

      if (!finalSrc) {
        alert('অনুগ্রহ করে একটি ছবি নির্বাচন করুন বা ছবির লিংক দিন।');
        return;
      }

      localStorage.setItem('lcs_owner_custom_photo', finalSrc);

      document.querySelectorAll('.owner-img').forEach(img => {
        img.src = finalSrc;
      });

      closePhotoModal();

      showCustomModal({
        icon: '📷',
        title: 'ছবি সফলভাবে পরিবর্তন করা হয়েছে!',
        body: `
          <p>মালিক <strong>মিরাজুল ইসলাম (ব্রাহ্মণবাড়িয়া)</strong>-এর নতুন ছবি সফলভাবে সংরক্ষিত হয়েছে এবং ওয়েবসাইটে দৃশ্যমান হচ্ছে।</p>
          <div style="text-align: center; margin: 12px 0;">
            <img src="${finalSrc}" alt="Updated Owner Photo" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-gold); display: inline-block;">
          </div>
        `
      });
    });
  }

  // Reset to original photo
  if (resetPhotoBtn) {
    resetPhotoBtn.addEventListener('click', () => {
      localStorage.removeItem('lcs_owner_custom_photo');
      pendingPhotoSrc = DEFAULT_OWNER_PHOTO;

      document.querySelectorAll('.owner-img').forEach(img => {
        img.src = DEFAULT_OWNER_PHOTO;
      });

      if (photoModalPreview) photoModalPreview.src = DEFAULT_OWNER_PHOTO;
      if (ownerPhotoUrlInput) ownerPhotoUrlInput.value = '';
      if (ownerPhotoInput) ownerPhotoInput.value = '';

      closePhotoModal();

      showCustomModal({
        icon: '🔄',
        title: 'ডিফল্ট ছবি রিস্টোর করা হয়েছে',
        body: '<p>মালিক মিরাজুল ইসলামের মূল অফিসিয়াল ছবিটি পুনরায় সেট করা হয়েছে।</p>'
      });
    });
  }

  // ============================================================
  // 11. Key Department Leads Management System (টিম লিডারগণ)
  // ============================================================
  const defaultTeamLeads = [
    {
      id: 'lead_1',
      name: 'Jane Smith',
      role: 'Head Barista',
      desc: '২০ জন বারিস্তার প্রধান ট্রেইনার ও এসপ্রেসো স্পেশালিস্ট',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80'
    },
    {
      id: 'lead_2',
      name: 'John Doe',
      role: 'Master Baker',
      desc: '১২ জন পেস্ট্রি শেফের প্রধান ও ক্রোয়াসোঁ মাস্টার',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80'
    },
    {
      id: 'lead_3',
      name: 'Sarah Johnson',
      role: 'General Manager',
      desc: 'ক্যাফে অপারেশনস ও কাস্টমার হসপিটালিটি হেড',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80'
    },
    {
      id: 'lead_4',
      name: 'Tanvir Ahmed',
      role: 'Lead Roaster',
      desc: 'গ্রিন বিন সোর্সিং ও রোস্ট প্রোফাইল ডিজাইনার',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80'
    }
  ];

  let currentTeamLeads = JSON.parse(localStorage.getItem('lcs_team_leads') || 'null') || [...defaultTeamLeads];

  const teamLeadsContainer = document.getElementById('teamLeadsContainer');
  const teamLeadModalOverlay = document.getElementById('teamLeadModalOverlay');
  const teamLeadModalCloseBtn = document.getElementById('teamLeadModalCloseBtn');
  const openManageLeadsBtn = document.getElementById('openManageLeadsBtn');
  const addNewLeadBtn = document.getElementById('addNewLeadBtn');
  const leadSelectorSelect = document.getElementById('leadSelectorSelect');
  const leadModalPhotoPreview = document.getElementById('leadModalPhotoPreview');
  const leadPhotoDropzone = document.getElementById('leadPhotoDropzone');
  const leadPhotoFileInput = document.getElementById('leadPhotoFileInput');
  const leadPhotoUrlInput = document.getElementById('leadPhotoUrlInput');
  const leadNameInput = document.getElementById('leadNameInput');
  const leadRoleInput = document.getElementById('leadRoleInput');
  const leadDescInput = document.getElementById('leadDescInput');
  const teamLeadEditForm = document.getElementById('teamLeadEditForm');
  const deleteLeadBtn = document.getElementById('deleteLeadBtn');
  const resetAllLeadsBtn = document.getElementById('resetAllLeadsBtn');

  let currentEditingLeadPhoto = '';

  function renderTeamLeads() {
    if (!teamLeadsContainer) return;

    teamLeadsContainer.innerHTML = currentTeamLeads.map(lead => {
      return `
        <div class="team-lead-card" data-lead-id="${lead.id}">
          <div class="team-lead-avatar-wrap" onclick="editSingleLead('${lead.id}')" title="ছবি বা তথ্য পরিবর্তন করতে ক্লিক করুন">
            <img src="${lead.photo}" alt="${lead.name}" class="profile-img" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80'">
            <div class="lead-quick-edit-badge" title="এডিট করুন">✏️</div>
          </div>
          <div>
            <h3 style="font-size: 1.18rem; margin-bottom: 2px;">${lead.name}</h3>
            <p style="color: var(--primary); font-weight: 600; font-size: 0.95rem;">${lead.role}</p>
            <p style="font-size: 0.85rem; margin-top: 6px; color: var(--dark-soft); line-height: 1.5;">${lead.desc}</p>
          </div>
          <button type="button" class="btn-card-edit-lead" onclick="editSingleLead('${lead.id}')">
            ✏️ তথ্য ও ছবি পরিবর্তন (Edit)
          </button>
        </div>
      `;
    }).join('');

    populateLeadDropdown();
  }

  function populateLeadDropdown(selectedId = null) {
    if (!leadSelectorSelect) return;

    let optionsHtml = currentTeamLeads.map(l => {
      return `<option value="${l.id}">${l.name} (${l.role})</option>`;
    }).join('');

    optionsHtml += `<option value="NEW_LEAD">➕ নতুন টিম লিডার যোগ করুন (Add New Lead)</option>`;
    leadSelectorSelect.innerHTML = optionsHtml;

    if (selectedId) {
      leadSelectorSelect.value = selectedId;
    }
  }

  function fillLeadForm(leadId) {
    if (leadId === 'NEW_LEAD') {
      if (leadNameInput) leadNameInput.value = '';
      if (leadRoleInput) leadRoleInput.value = '';
      if (leadDescInput) leadDescInput.value = '';
      if (leadPhotoUrlInput) leadPhotoUrlInput.value = '';
      currentEditingLeadPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80';
      if (leadModalPhotoPreview) leadModalPhotoPreview.src = currentEditingLeadPhoto;
      if (deleteLeadBtn) deleteLeadBtn.style.display = 'none';
      return;
    }

    const lead = currentTeamLeads.find(l => l.id === leadId) || currentTeamLeads[0];
    if (lead) {
      if (leadNameInput) leadNameInput.value = lead.name;
      if (leadRoleInput) leadRoleInput.value = lead.role;
      if (leadDescInput) leadDescInput.value = lead.desc;
      if (leadPhotoUrlInput) leadPhotoUrlInput.value = lead.photo.startsWith('data:') ? '' : lead.photo;
      currentEditingLeadPhoto = lead.photo;
      if (leadModalPhotoPreview) leadModalPhotoPreview.src = lead.photo;
      if (deleteLeadBtn) deleteLeadBtn.style.display = 'inline-block';
    }
  }

  window.editSingleLead = function(leadId) {
    if (!teamLeadModalOverlay) return;
    populateLeadDropdown(leadId);
    fillLeadForm(leadId);
    teamLeadModalOverlay.classList.add('active');
  };

  if (openManageLeadsBtn) {
    openManageLeadsBtn.addEventListener('click', () => {
      const firstId = currentTeamLeads.length > 0 ? currentTeamLeads[0].id : 'NEW_LEAD';
      window.editSingleLead(firstId);
    });
  }

  if (addNewLeadBtn) {
    addNewLeadBtn.addEventListener('click', () => {
      window.editSingleLead('NEW_LEAD');
    });
  }

  if (leadSelectorSelect) {
    leadSelectorSelect.addEventListener('change', (e) => {
      fillLeadForm(e.target.value);
    });
  }

  if (teamLeadModalCloseBtn) {
    teamLeadModalCloseBtn.addEventListener('click', () => {
      if (teamLeadModalOverlay) teamLeadModalOverlay.classList.remove('active');
    });
  }

  if (teamLeadModalOverlay) {
    teamLeadModalOverlay.addEventListener('click', (e) => {
      if (e.target === teamLeadModalOverlay) {
        teamLeadModalOverlay.classList.remove('active');
      }
    });
  }

  // File upload for Team Lead photo
  if (leadPhotoDropzone && leadPhotoFileInput) {
    leadPhotoDropzone.addEventListener('click', () => {
      leadPhotoFileInput.click();
    });

    ['dragenter', 'dragover'].forEach(evt => {
      leadPhotoDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        leadPhotoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      leadPhotoDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        leadPhotoDropzone.classList.remove('dragover');
      });
    });

    leadPhotoDropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleLeadFile(files[0]);
      }
    });

    leadPhotoFileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleLeadFile(files[0]);
      }
    });
  }

  function handleLeadFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ইমেজ ফাইল আপলোড করুন (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      currentEditingLeadPhoto = result;
      if (leadModalPhotoPreview) leadModalPhotoPreview.src = result;
      if (leadPhotoUrlInput) leadPhotoUrlInput.value = '';
    };
    reader.readAsDataURL(file);
  }

  if (leadPhotoUrlInput) {
    leadPhotoUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        currentEditingLeadPhoto = url;
        if (leadModalPhotoPreview) leadModalPhotoPreview.src = url;
      }
    });
  }

  // Save Team Lead submit handler
  if (teamLeadEditForm) {
    teamLeadEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedOption = leadSelectorSelect ? leadSelectorSelect.value : 'lead_1';
      const name = leadNameInput ? leadNameInput.value.trim() : 'Team Lead';
      const role = leadRoleInput ? leadRoleInput.value.trim() : 'Lead';
      const desc = leadDescInput ? leadDescInput.value.trim() : '';
      const photo = currentEditingLeadPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80';

      if (selectedOption === 'NEW_LEAD') {
        const newLead = {
          id: 'lead_' + Date.now(),
          name,
          role,
          desc,
          photo
        };
        currentTeamLeads.push(newLead);
      } else {
        const idx = currentTeamLeads.findIndex(l => l.id === selectedOption);
        if (idx !== -1) {
          currentTeamLeads[idx] = {
            id: selectedOption,
            name,
            role,
            desc,
            photo
          };
        }
      }

      localStorage.setItem('lcs_team_leads', JSON.stringify(currentTeamLeads));
      renderTeamLeads();

      if (teamLeadModalOverlay) teamLeadModalOverlay.classList.remove('active');

      showCustomModal({
        icon: '👥',
        title: 'টিম লিডার তথ্য সফলভাবে সংরক্ষিত!',
        body: `
          <p>টিম লিডার <strong>${name}</strong> (${role})-এর তথ্য ও ছবি সফলভাবে আপডেট করা হয়েছে।</p>
          <div style="text-align: center; margin: 10px 0;">
            <img src="${photo}" alt="${name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-gold); display: inline-block;">
          </div>
        `
      });
    });
  }

  // Delete single lead
  if (deleteLeadBtn) {
    deleteLeadBtn.addEventListener('click', () => {
      const selectedId = leadSelectorSelect ? leadSelectorSelect.value : '';
      if (!selectedId || selectedId === 'NEW_LEAD') return;

      if (confirm('আপনি কি সত্যিই এই টিম লিডারকে তালিকা থেকে মুছে ফেলতে চান?')) {
        currentTeamLeads = currentTeamLeads.filter(l => l.id !== selectedId);
        localStorage.setItem('lcs_team_leads', JSON.stringify(currentTeamLeads));
        renderTeamLeads();
        if (teamLeadModalOverlay) teamLeadModalOverlay.classList.remove('active');

        showCustomModal({
          icon: '🗑️',
          title: 'টিম লিডার মুছে ফেলা হয়েছে',
          body: '<p>নির্বাচিত লিডারকে সফলভাবে তালিকা থেকে অপসারণ করা হয়েছে।</p>'
        });
      }
    });
  }

  // Reset all leads to defaults
  if (resetAllLeadsBtn) {
    resetAllLeadsBtn.addEventListener('click', () => {
      if (confirm('আপনি কি সকল টিম লিডারদের মূল তথ্যে ফিরিয়ে নিতে চান?')) {
        localStorage.removeItem('lcs_team_leads');
        currentTeamLeads = [...defaultTeamLeads];
        renderTeamLeads();
        if (teamLeadModalOverlay) teamLeadModalOverlay.classList.remove('active');

        showCustomModal({
          icon: '🔄',
          title: 'ডিফল্ট টিম রিস্টোর করা হয়েছে',
          body: '<p>সকল মূল ডিপার্টমেন্ট হেডদের প্রোফাইল সফলভাবে রিস্টোর হয়েছে।</p>'
        });
      }
    });
  }

  // Initial render for Team Leads
  renderTeamLeads();

  // ============================================================
  // 12. Reusable Custom Modal
  // ============================================================
  window.showCustomModal = function({ icon, title, body, hideCloseBtn = false }) {
    let modalOverlay = document.getElementById('customModalOverlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'customModalOverlay';
      modalOverlay.className = 'custom-modal-overlay';
      modalOverlay.innerHTML = `
        <div class="custom-modal">
          <button type="button" class="cart-close-btn" id="modalTopCloseBtn" style="position: absolute; top: 12px; right: 12px; font-size: 1.5rem; background: transparent; border: none; cursor: pointer; color: var(--dark);" aria-label="Close">&times;</button>
          <span class="modal-icon" id="modalIcon">🎉</span>
          <h3 class="modal-title" id="modalTitle">Title</h3>
          <div class="modal-body" id="modalBody">Body Content</div>
          <button type="button" class="btn" id="modalCloseBtn" style="width: 100%;">ঠিক আছে (Close)</button>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      modalOverlay.querySelector('#modalCloseBtn').addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });

      const topCloseBtn = modalOverlay.querySelector('#modalTopCloseBtn');
      if (topCloseBtn) {
        topCloseBtn.addEventListener('click', () => {
          modalOverlay.classList.remove('active');
        });
      }

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove('active');
        }
      });
    }

    modalOverlay.querySelector('#modalIcon').textContent = icon || '☕';
    modalOverlay.querySelector('#modalTitle').textContent = title || 'Notification';
    modalOverlay.querySelector('#modalBody').innerHTML = body || '';
    
    const bottomCloseBtn = modalOverlay.querySelector('#modalCloseBtn');
    if (bottomCloseBtn) {
      bottomCloseBtn.style.display = hideCloseBtn ? 'none' : 'block';
    }

    modalOverlay.classList.add('active');
  };

  window.closeCustomModal = function() {
    const modalOverlay = document.getElementById('customModalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  };

  function showCustomModal(args) {
    window.showCustomModal(args);
  }

  // Toast Notification System
  function showCustomToast(message, type = 'info', action = null) {
    let toastContainer = document.getElementById('customToastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'customToastContainer';
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 90vw;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast toast-' + type;
    toast.style.cssText = `
      background: ${type === 'success' ? '#1E293B' : type === 'error' ? '#7F1D1D' : '#2C1810'};
      color: #fff;
      border: 1px solid var(--accent-gold);
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-size: 0.9rem;
      max-width: 420px;
      pointer-events: auto;
      animation: fadeInSlideUp 0.3s ease forwards;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    
    let actionBtnHtml = '';
    if (action && action.text && action.onClick) {
      actionBtnHtml = `
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button type="button" class="btn btn-sm" onclick="${action.onClick}" style="background: var(--accent-gold); color: #1E293B; font-weight: 800; padding: 5px 12px; border-radius: 4px; font-size: 0.82rem; cursor: pointer;">
            ${action.text}
          </button>
          <button type="button" class="btn btn-sm" onclick="window.openCart()" style="background: rgba(255,255,255,0.15); color: #fff; font-weight: 700; padding: 5px 10px; border-radius: 4px; font-size: 0.82rem; cursor: pointer;">
            🛒 ব্যাগ দেখুন
          </button>
        </div>
      `;
    }

    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <span>${message}</span>
        <button type="button" onclick="this.closest('.custom-toast').remove()" style="background: transparent; border: none; color: #94A3B8; font-size: 1.1rem; cursor: pointer;">&times;</button>
      </div>
      ${actionBtnHtml}
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, action ? 6000 : 4000);
  }
  window.showCustomToast = showCustomToast;

  // ============================================================
  // 12.1 Student Corner & Digital Pass Management
  // ============================================================
  const studentPassModalOverlay = document.getElementById('studentPassModalOverlay');
  const openStudentPassModalBtn = document.getElementById('openStudentPassModalBtn');
  const generateStudentPassBtn = document.getElementById('generateStudentPassBtn');
  const editStudentPassBtn = document.getElementById('editStudentPassBtn');
  const studentCardPreviewBox = document.getElementById('studentCardPreviewBox');
  const studentPassModalCloseBtn = document.getElementById('studentPassModalCloseBtn');
  const studentPassForm = document.getElementById('studentPassForm');
  const applyStudentPromoQuickBtn = document.getElementById('applyStudentPromoQuickBtn');

  const studentCardNameDisplay = document.getElementById('studentCardNameDisplay');
  const studentCardInstituteDisplay = document.getElementById('studentCardInstituteDisplay');
  const studentCardIdDisplay = document.getElementById('studentCardIdDisplay');

  const studentNameInput = document.getElementById('studentNameInput');
  const studentInstituteInput = document.getElementById('studentInstituteInput');
  const studentRollInput = document.getElementById('studentRollInput');
  const studentFavSubject = document.getElementById('studentFavSubject');

  // Load saved student pass if available
  function loadSavedStudentPass() {
    const savedPass = JSON.parse(localStorage.getItem('lcs_student_pass') || 'null');
    if (savedPass) {
      if (studentCardNameDisplay) studentCardNameDisplay.textContent = savedPass.name.toUpperCase();
      if (studentCardInstituteDisplay) studentCardInstituteDisplay.textContent = savedPass.institute;
      if (studentCardIdDisplay) studentCardIdDisplay.textContent = savedPass.studentId;
    }
  }
  loadSavedStudentPass();

  function openStudentPassModal() {
    // Pre-fill modal with current or saved values
    const savedPass = JSON.parse(localStorage.getItem('lcs_student_pass') || 'null');
    if (savedPass) {
      if (studentNameInput) studentNameInput.value = savedPass.name || '';
      if (studentInstituteInput) studentInstituteInput.value = savedPass.institute || '';
      if (studentRollInput) studentRollInput.value = savedPass.studentId || '';
      if (studentFavSubject) studentFavSubject.value = savedPass.department || '';
    } else {
      if (studentNameInput && !studentNameInput.value && studentCardNameDisplay) {
        studentNameInput.value = studentCardNameDisplay.textContent !== 'MD. STUDENT' ? studentCardNameDisplay.textContent : '';
      }
      if (studentInstituteInput && !studentInstituteInput.value && studentCardInstituteDisplay) {
        studentInstituteInput.value = studentCardInstituteDisplay.textContent !== 'School / College / University' ? studentCardInstituteDisplay.textContent : '';
      }
    }
    if (studentPassModalOverlay) studentPassModalOverlay.classList.add('active');
  }
  window.openStudentPassModal = openStudentPassModal;

  function closeStudentPassModal() {
    if (studentPassModalOverlay) studentPassModalOverlay.classList.remove('active');
  }

  // Live typing preview
  if (studentNameInput) {
    studentNameInput.addEventListener('input', () => {
      const val = studentNameInput.value.trim() || 'MD. STUDENT';
      if (studentCardNameDisplay) studentCardNameDisplay.textContent = val.toUpperCase();
    });
  }
  if (studentInstituteInput) {
    studentInstituteInput.addEventListener('input', () => {
      const val = studentInstituteInput.value.trim() || 'School / College / University';
      if (studentCardInstituteDisplay) studentCardInstituteDisplay.textContent = val;
    });
  }
  if (studentRollInput) {
    studentRollInput.addEventListener('input', () => {
      const val = studentRollInput.value.trim() || 'STU-2026-8849';
      if (studentCardIdDisplay) studentCardIdDisplay.textContent = val.toUpperCase();
    });
  }

  if (openStudentPassModalBtn) openStudentPassModalBtn.addEventListener('click', openStudentPassModal);
  if (generateStudentPassBtn) generateStudentPassBtn.addEventListener('click', openStudentPassModal);
  if (editStudentPassBtn) editStudentPassBtn.addEventListener('click', openStudentPassModal);
  if (studentCardPreviewBox) {
    studentCardPreviewBox.style.cursor = 'pointer';
    studentCardPreviewBox.addEventListener('click', openStudentPassModal);
  }

  if (studentPassModalCloseBtn) studentPassModalCloseBtn.addEventListener('click', closeStudentPassModal);
  if (studentPassModalOverlay) {
    studentPassModalOverlay.addEventListener('click', (e) => {
      if (e.target === studentPassModalOverlay) closeStudentPassModal();
    });
  }

  if (applyStudentPromoQuickBtn) {
    applyStudentPromoQuickBtn.addEventListener('click', () => {
      window.applyStudentPromoQuick();
    });
  }

  if (studentPassForm) {
    studentPassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = studentNameInput?.value.trim() || 'Student';
      const institute = studentInstituteInput?.value.trim() || 'College / University';
      const roll = studentRollInput?.value.trim() || 'STU-2026';
      const subject = studentFavSubject?.value.trim() || 'General';

      const passData = {
        name: name,
        institute: institute,
        studentId: roll.toUpperCase(),
        department: subject,
        promoCode: siteData.student?.promoCode || 'STUDENT25',
        discount: siteData.student?.discountPercent || 25,
        issuedAt: new Date().toLocaleDateString('bn-BD')
      };

      localStorage.setItem('lcs_student_pass', JSON.stringify(passData));
      loadSavedStudentPass();
      closeStudentPassModal();

      // Automatically apply student coupon
      appliedDiscount = siteData.student?.discountPercent || 25;
      appliedCouponCode = siteData.student?.promoCode || 'STUDENT25';
      if (couponInput) couponInput.value = appliedCouponCode;
      updateCartUI();

      showCustomModal({
        icon: '🎓',
        title: 'অভিনন্দন! আপনার ডিজিটাল স্টুডেন্ট কার্ড সক্রিয় হয়েছে',
        body: `
          <p>প্রিয় <strong>${name}</strong> (${institute}), আপনার ডিজিটাল স্টুডেন্ট কার্ড সফলভাবে আপডেট ও তৈরি হয়েছে!</p>
          <div class="modal-receipt" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff; border: 1px solid var(--accent-gold);">
            <strong style="color: var(--accent-gold);">STUDENT PASS ID:</strong> ${roll.toUpperCase()}<br>
            <strong>নাম:</strong> ${name}<br>
            <strong>শিক্ষা প্রতিষ্ঠান:</strong> ${institute}<br>
            <strong>প্রোমোকোড:</strong> <span style="color: var(--accent-gold); font-weight: 800;">${appliedCouponCode} (${appliedDiscount}% ছাড়)</span><br>
            <strong>স্টাডি বেনিফিট:</strong> ফ্রি হাই-স্পিড ওয়াইফাই + ফ্রি রিফিল + স্টাডি জোন
          </div>
          <p style="font-size: 0.85rem; margin-top: 8px;">আপনার কার্ডের তথ্য সংরক্ষিত রয়েছে এবং অর্ডারে ${appliedDiscount}% ডিসকাউন্ট সক্রিয় রয়েছে।</p>
        `
      });
    });
  }

  // ============================================================
  // 13. Universal Site Customizer & Live Edit System (সব কিছু পরিবর্তন করার সুবিধা)
  // ============================================================
  const defaultSiteData = {
    general: {
      shopName: 'Local Coffee Shop',
      ownerName: 'MERAJUL ISLAM',
      ownerDistrict: 'Brahmanbaria (ব্রাহ্মণবাড়িয়া)',
      hotline: '01339564967',
      email: 'contact@localcoffeeshop.com',
      address: '123 Coffee Street, Central Avenue, City, State 12345',
      promoCode: 'COFFEE20',
      discountPercent: 20,
      bannerText: '🎉 স্পেশাল অফার! সব কফি ও পেস্ট্রিতে ২০% ডিসকাউন্ট পেতে ব্যবহার করুন কোড: COFFEE20'
    },
    hero: {
      title: 'Welcome to Local Coffee Shop',
      subtitle: 'প্রতিটি কাপে তাজা রোস্টেড প্রিমিয়াম কফি এবং হাতে তৈরি গরম পেস্ট্রির অবিস্মরণীয় স্বাদ ও আন্তরিক আতিথেয়তা।',
      btn1Text: 'View Our Menu',
      btn1Link: 'menu.html',
      btn2Text: 'Book a Table',
      btn2Link: '#bookingSection'
    },
    story: {
      title: 'আমাদের কফি যাত্রার গল্প (Our Coffee Story)',
      p1: 'ব্রাহ্মণবাড়িয়ার সন্তান মিরাজুল ইসলামের হাত ধরে ২০২৬ সালে লোকাল কফি শপের স্বপ্নযাত্রা শুরু হয়। তাঁর সুযোগ্য নেতৃত্বে আজ ৫০ জনে সমৃদ্ধ নিবেদিতপ্রাণ টিম নিরলসভাবে কাজ করছে।',
      p2: 'আজ আমাদের শপে ৫০ জনেরও অধিক নিবেদিতপ্রাণ কর্মী কাজ করছেন—যার মধ্যে রয়েছেন ২০ জন দক্ষ বারিস্তা, ১২ জন প্রফেশনাল পেস্ট্রি শেফ এবং ১৮ জন হসপিটালিটি স্পেশালিস্ট।',
      quote: 'আমার জন্ম ব্রাহ্মণবাড়িয়ায়। কফির প্রতিটি দানা সঠিক মাত্রায় রোস্ট করা এবং তাজা ব্রিউ পরিবেশন করাই আমার জীবনের সাধনা। আমাদের ক্যাফেতে প্রতিটি অতিথি পরিবারের সদস্যের মতো সমাদৃত।',
      baristaCount: '20',
      bakerCount: '12',
      hospitalityCount: '18',
      totalStaff: '50+'
    },
    contact: {
      hoursMonFri: '7:00 AM - 9:00 PM',
      hoursSatSun: '8:00 AM - 10:00 PM'
    },
    student: {
      title: 'ছাত্র স্পেশাল স্টাডি কম্বো ও সুবিধা (Student Corner & Zone)',
      subtitle: 'পড়াশোনা, অ্যাসাইনমেন্ট ও গ্রুপ স্টাডির জন্য নিবেদিত নিরিবিলি পরিবেশ এবং বিশেষ কম্বো',
      discountPercent: 25,
      promoCode: 'STUDENT25',
      perkWifi: 'উচ্চগতির আনলিমিটেড ফ্রি ওয়াইফাই',
      perkPrint: 'প্রতিদিন ৫ পেজ ফ্রি স্টুডেন্ট প্রিন্টিং সুবিধা'
    },
    menuItems: [
      { id: 'm1', name: 'Espresso', price: 3.50, category: 'drinks', desc: 'গাঢ়, সুগন্ধযুক্ত ও খাঁটি অ্যারাবিকা এসপ্রেসো শট।', isSpecial: true },
      { id: 'm2', name: 'Caffè Latte', price: 4.50, category: 'drinks', desc: 'মসৃণ স্টিমড মিল্ক এবং ক্রিমি এসপ্রেসোর অনন্য মেলবন্ধন।', isSpecial: true },
      { id: 'm3', name: 'Cappuccino', price: 4.00, category: 'drinks', desc: 'পারফেক্ট মিল্ক ফোম এবং কোকোয়া ডাস্টসহ ক্ল্যাসিক ইতালিয়ান ক্যাপুচিনো।', isSpecial: true },
      { id: 'm4', name: 'Hot Chocolate', price: 4.00, category: 'drinks', desc: 'খাঁটি বেলজিয়ান চকলেট ও ভ্যানিলা ফ্রথ দিয়ে তৈরি মিষ্টি পানীয়।', isSpecial: false },
      { id: 'm5', name: 'Cold Brew Coffee', price: 3.50, category: 'drinks', desc: '১৬ ঘণ্টা ধরে প্রস্তুত রিফ্রেশিং ও লো-অ্যাসিড কোল্ড ব্রু।', isSpecial: false },
      { id: 'm6', name: 'Spiced Chai Latte', price: 4.50, category: 'drinks', desc: 'সুগন্ধি এলাচ, দারুচিনি ও মশলাযুক্ত ব্লেন্ডেড চা।', isSpecial: false },
      { id: 'm7', name: 'Butter Croissant', price: 3.00, category: 'pastries', desc: 'ফ্রেন্স রেসিপিতে তৈরি ক্রিস্পি ও খাস্তা গোল্ডেন বাটার ক্রোয়াসোঁ।', isSpecial: true },
      { id: 'm8', name: 'Blueberry Muffin', price: 3.50, category: 'pastries', desc: 'তাজা ব্লুবেরি এবং হালকা ভ্যানিলা ফ্লেভারে পরিপূর্ণ নরম মাফিন।', isSpecial: false },
      { id: 'm9', name: 'Chocolate Brownie', price: 3.50, category: 'pastries', desc: 'ডার্ক চকোলেট ও ওয়ালনাট দিয়ে তৈরি ফাজি ব্রাউনি।', isSpecial: false },
      { id: 'm10', name: 'Cinnamon Roll', price: 3.75, category: 'pastries', desc: 'দারুচিনি সুবাসিত উষ্ণ রোল ও ক্রিম চিজ গ্লেজ।', isSpecial: false },
      { id: 'm11', name: 'Avocado Toast', price: 6.50, category: 'pastries', desc: 'সাওয়ারডো ব্রেড, ম্যাশড অ্যাভোকাডো ও পোচড এগ।', isSpecial: false },
      { id: 'm12', name: 'Classic Eggs Benedict', price: 8.50, category: 'pastries', desc: 'ইংলিশ মাফিন, স্মোকড চিকেন, পোচড এগ ও হল্যান্ডাইজ সস।', isSpecial: false }
    ],
    seasonalSpecials: [
      {
        id: 'spec_1',
        name: 'Autumn Spiced Pumpkin Caramel Latte',
        season: 'Autumn Special (অটাম স্পেশাল)',
        seasonKey: 'autumn',
        price: 5.20,
        oldPrice: 6.50,
        savePercent: 20,
        desc: 'খাঁটি মিষ্টি কুমড়ার মশলা, ক্যারামেল ড্রিজল ও তাজা ব্রিউড এসপ্রেসোর সুস্বাদু মেলবন্ধন।',
        dietary: '🍁 Autumn Special'
      },
      {
        id: 'spec_2',
        name: 'Summer Mango Passionfruit Cold Brew',
        season: 'Summer Chill (সামার স্পেশাল)',
        seasonKey: 'summer',
        price: 4.80,
        oldPrice: 6.00,
        savePercent: 20,
        desc: '১৬ ঘণ্টা কোল্ড ব্রু কফির সাথে রিফ্রেশিং পাকা আম ও প্যাশনফ্রুটের ফ্রেশ সামার ফোম।',
        dietary: '🥭 Summer Chill'
      },
      {
        id: 'spec_3',
        name: 'Winter Hazelnut Dark Belgian Mocha',
        season: 'Winter Warmth (উইন্টার স্পেশাল)',
        seasonKey: 'winter',
        price: 5.50,
        oldPrice: 7.00,
        savePercent: 21,
        desc: 'রোস্টেড হ্যাজেলনাট, বেলজিয়ান ডার্ক চকলেট ও ডাবল শট এসপ্রেসোর উষ্ণ ও ক্রিমযুক্ত স্বাদ।',
        dietary: '❄️ Winter Warmth'
      },
      {
        id: 'spec_4',
        name: 'Spring Wild Strawberry Cream Tart',
        season: 'Spring Fresh (স্প্রিং স্পেশাল)',
        seasonKey: 'spring',
        price: 4.50,
        oldPrice: 5.50,
        savePercent: 18,
        desc: 'তাজা স্ট্রবেরি, ভ্যানিলা বিন কাস্টার্ড এবং হাতে তৈরি মুচমুচে বাটার ক্রাস্ট পেস্ট্রি।',
        dietary: '🍓 Spring Bakery'
      },
      {
        id: 'spec_5',
        name: 'Brahmanbaria Special Reserve Batch Roast',
        season: 'Founder Reserve (লিমিটেড এডিশন)',
        seasonKey: 'reserve',
        price: 6.00,
        oldPrice: 7.50,
        savePercent: 20,
        desc: 'মালিক মিরাজুল ইসলামের নিজ হাতে রোস্ট করা সীমিত সংস্করণের ১০০% প্রিমিয়াম অ্যারাবিকা।',
        dietary: '☕ 100% Single Origin'
      },
      {
        id: 'spec_6',
        name: 'Honey Cinnamon Pistachio Pastry Roll',
        season: 'Chef Special (শেফ স্পেশাল)',
        seasonKey: 'pastries',
        price: 4.20,
        oldPrice: 5.25,
        savePercent: 20,
        desc: 'পাহাড়ি খাঁটি মধু, দারুচিনির ঘ্রাণ এবং কুচানো পেস্তা বাদামের খাস্তা স্পেশাল বেকারি রোল।',
        dietary: '🍯 Fresh Baked'
      }
    ],
    gallery: [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80', caption: 'Fresh Latte Art' },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', caption: 'Cozy Coffee Shop Ambiance' },
      { id: 'g3', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80', caption: 'Pour Over Brewing' },
      { id: 'g4', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', caption: 'Espresso Extraction' },
      { id: 'g5', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', caption: 'Fresh Baked Croissants' },
      { id: 'g6', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80', caption: 'Warm Cozy Seating Area' }
    ],
    faqs: [
      { id: 'f1', q: 'আপনারা কি অনলাইন ডেলিভারি এবং টেবিল বুকিং সুবিধা প্রদান করেন?', a: 'হ্যাঁ! আমাদের ওয়েবসাইট থেকে সরাসরি কার্টে পছন্দের আইটেম যুক্ত করে অর্ডার করতে পারেন অথবা টেবিল বুকিং ফর্মের মাধ্যমে আসন সংরক্ষণ করতে পারেন।' },
      { id: 'f2', q: 'আপনাদের কফি বিন্স কোথা থেকে সংগ্রহ করা হয়?', a: 'মালিক মিরাজুল ইসলাম স্বয়ং ১০০% সিঙ্গেল অরিজিন ও ফেয়ার-ট্রেড সার্টিফাইড অর্গানিক অ্যারাবিকা বিন্স সরাসরি সোর্স করেন এবং আমাদের নিজস্ব রোস্টারিতে তাজা রোস্ট করা হয়।' },
      { id: 'f3', q: 'পেস্ট্রি কি প্রতিদিন তাজা তৈরি করা হয়?', a: 'অবশ্যই! আমাদের ১২ জন পেশাদার পেস্ট্রি শেফের টিম প্রতিদিন কাকভোরে তাজা মাখন ও প্রিমিয়াম উপকরণ দিয়ে প্রতিটি ক্রোয়াসোঁ, মাফিন ও কেক বেক করেন।' },
      { id: 'f4', q: 'ক্যাফেতে কি কোনো স্পেশাল ডিসকাউন্ট অফার আছে?', a: 'হ্যাঁ! বর্তমানে প্রোমোকোড COFFEE20 ব্যবহার করে সব অর্ডারে ২০% তাৎক্ষণিক ছাড় উপভোগ করতে পারবেন।' }
    ]
  };

  // Load user saved site data or fallback to defaults
  let siteData = JSON.parse(localStorage.getItem('lcs_site_custom_content') || 'null') || JSON.parse(JSON.stringify(defaultSiteData));

  // Merge any missing keys from updates
  if (!siteData.general) siteData.general = defaultSiteData.general;
  if (!siteData.hero) siteData.hero = defaultSiteData.hero;
  if (!siteData.story) siteData.story = defaultSiteData.story;
  if (!siteData.contact) siteData.contact = defaultSiteData.contact;
  if (!siteData.student) siteData.student = defaultSiteData.student;
  if (!siteData.menuItems) siteData.menuItems = defaultSiteData.menuItems;
  if (!siteData.seasonalSpecials || siteData.seasonalSpecials.length === 0) siteData.seasonalSpecials = defaultSiteData.seasonalSpecials;
  if (!siteData.gallery) siteData.gallery = defaultSiteData.gallery;
  if (!siteData.faqs) siteData.faqs = defaultSiteData.faqs;

  function saveSiteData() {
    localStorage.setItem('lcs_site_custom_content', JSON.stringify(siteData));
    applySiteDataToDOM();
  }

  // Apply all site data to the page DOM dynamically
  function applySiteDataToDOM() {
    // 1. General & Branding
    document.querySelectorAll('.logo').forEach(el => {
      el.innerHTML = `☕ ${siteData.general.shopName}`;
    });

    const discountBannerEl = document.getElementById('discountBanner');
    if (discountBannerEl) {
      const span = discountBannerEl.querySelector('span');
      if (span) span.innerHTML = siteData.general.bannerText;
    }

    // Footers
    document.querySelectorAll('footer p').forEach(el => {
      if (el.innerHTML.includes('Owner:')) {
        el.innerHTML = `&copy; 2026 ${siteData.general.shopName}. All rights reserved. | Owner: <strong>${siteData.general.ownerName} (${siteData.general.ownerDistrict})</strong> | 📞 Hotline: <a href="tel:${siteData.general.hotline}" style="color: #FFF8DC; font-weight: 700;">${siteData.general.hotline}</a>`;
      }
    });

    // 2. Hero Section (Home page)
    const heroSec = document.querySelector('section.hero');
    if (heroSec) {
      const h1 = heroSec.querySelector('h1');
      const p = heroSec.querySelector('p');
      const btn1 = heroSec.querySelector('.hero-actions a.btn:first-child');
      const btn2 = heroSec.querySelector('.hero-actions a.btn:last-child');
      if (h1) h1.textContent = siteData.hero.title;
      if (p) p.textContent = siteData.hero.subtitle;
      if (btn1) {
        btn1.textContent = siteData.hero.btn1Text;
        btn1.setAttribute('href', siteData.hero.btn1Link);
      }
      if (btn2) {
        btn2.textContent = siteData.hero.btn2Text;
        btn2.setAttribute('href', siteData.hero.btn2Link);
      }
    }

    // 3. Story & Staff (About page & Home Owner section)
    document.querySelectorAll('.owner-name-display').forEach(el => {
      el.textContent = siteData.general.ownerName;
    });

    document.querySelectorAll('.owner-district-display').forEach(el => {
      el.textContent = siteData.general.ownerDistrict;
    });

    document.querySelectorAll('.owner-hotline-display').forEach(el => {
      el.textContent = siteData.general.hotline;
      if (el.tagName === 'A') el.href = `tel:${siteData.general.hotline}`;
    });

    // Story paragraphs
    const storyTitleEl = document.getElementById('storyTitleDisplay');
    if (storyTitleEl) storyTitleEl.textContent = siteData.story.title;

    const storyP1El = document.getElementById('storyP1Display');
    if (storyP1El) storyP1El.textContent = siteData.story.p1;

    const storyP2El = document.getElementById('storyP2Display');
    if (storyP2El) storyP2El.textContent = siteData.story.p2;

    const quoteEl = document.getElementById('ownerQuoteDisplay');
    if (quoteEl) quoteEl.textContent = `"${siteData.story.quote}"`;

    // Staff Counters
    const baristaCountEl = document.getElementById('baristaCountDisplay');
    if (baristaCountEl) baristaCountEl.textContent = siteData.story.baristaCount;

    const bakerCountEl = document.getElementById('bakerCountDisplay');
    if (bakerCountEl) bakerCountEl.textContent = siteData.story.bakerCount;

    const hospitalityCountEl = document.getElementById('hospitalityCountDisplay');
    if (hospitalityCountEl) hospitalityCountEl.textContent = siteData.story.hospitalityCount;

    const totalStaffCountEl = document.getElementById('totalStaffCountDisplay');
    if (totalStaffCountEl) totalStaffCountEl.textContent = siteData.story.totalStaff;

    // 4. Contact & Hours
    document.querySelectorAll('.hotline-text-display').forEach(el => {
      el.textContent = siteData.general.hotline;
      if (el.tagName === 'A') el.href = `tel:${siteData.general.hotline}`;
    });

    document.querySelectorAll('.address-text-display').forEach(el => {
      el.textContent = siteData.general.address;
    });

    document.querySelectorAll('.email-text-display').forEach(el => {
      el.textContent = siteData.general.email;
    });

    document.querySelectorAll('.hours-weekday-display').forEach(el => {
      el.textContent = siteData.contact.hoursMonFri;
    });

    document.querySelectorAll('.hours-weekend-display').forEach(el => {
      el.textContent = siteData.contact.hoursSatSun;
    });

    // 4.5 Student Zone
    if (siteData.student) {
      document.querySelectorAll('.student-zone-title').forEach(el => {
        if (siteData.student.title) el.textContent = siteData.student.title;
      });
      document.querySelectorAll('.student-zone-subtitle').forEach(el => {
        if (siteData.student.subtitle) el.textContent = siteData.student.subtitle;
      });
      const discountVal = siteData.student.discountPercent || 25;
      const promoVal = siteData.student.promoCode || 'STUDENT25';

      document.querySelectorAll('.student-badge-pill').forEach(el => {
        el.textContent = `🎓 Student Special • ${discountVal}% এক্সক্লুসিভ ছাড়`;
      });
      document.querySelectorAll('.pass-status-badge').forEach(el => {
        el.textContent = `ACTIVE ${discountVal}% OFF`;
      });
      document.querySelectorAll('.pass-discount-tag').forEach(el => {
        el.textContent = `🏷️ ${discountVal}% DISCOUNT`;
      });
    }

    // 5. Dynamic Menu rendering on menu.html & index.html highlights
    renderDynamicMenu();

    // 5.5 Dynamic Seasonal Specials
    renderDynamicSeasonalSpecials();

    // 5.6 Dynamic Order Tracker In-Page & Modal UI
    renderDynamicOrderTracker();

    // 6. Dynamic Gallery rendering on gallery.html
    renderDynamicGallery();

    // 7. Dynamic FAQ rendering on index.html
    renderDynamicFaqs();
  }

  // Render Dynamic Menu
  function renderDynamicMenu() {
    // Menu page grids
    const drinksGrid = document.getElementById('dynamicDrinksGrid');
    const pastriesGrid = document.getElementById('dynamicPastriesGrid');
    const homeMenuGrid = document.getElementById('homeMenuItemsGrid');

    if (drinksGrid) {
      const drinks = siteData.menuItems.filter(item => item.category === 'drinks');
      drinksGrid.innerHTML = drinks.map(item => `
        <div class="card menu-card" data-item-id="${item.id}">
          <div class="menu-card-header">
            <h3>${item.name}</h3>
            <span class="price">$${Number(item.price).toFixed(2)}</span>
          </div>
          <p>${item.desc}</p>
          <div class="card-order-actions">
            <button type="button" class="btn-add-to-cart-action" onclick="window.addToCart('${item.name}', ${item.price})">
              🛒 ব্যাগে যোগ
            </button>
            <button type="button" class="btn-quick-direct-order" onclick="window.quickDirectOrder('${item.name}', ${item.price})">
              ⚡ দ্রুত অর্ডার
            </button>
          </div>
        </div>
      `).join('');
    }

    if (pastriesGrid) {
      const pastries = siteData.menuItems.filter(item => item.category === 'pastries');
      pastriesGrid.innerHTML = pastries.map(item => `
        <div class="card menu-card" data-item-id="${item.id}">
          <div class="menu-card-header">
            <h3>${item.name}</h3>
            <span class="price">$${Number(item.price).toFixed(2)}</span>
          </div>
          <p>${item.desc}</p>
          <div class="card-order-actions">
            <button type="button" class="btn-add-to-cart-action" onclick="window.addToCart('${item.name}', ${item.price})">
              🛒 ব্যাগে যোগ
            </button>
            <button type="button" class="btn-quick-direct-order" onclick="window.quickDirectOrder('${item.name}', ${item.price})">
              ⚡ দ্রুত অর্ডার
            </button>
          </div>
        </div>
      `).join('');
    }

    // Home Page Popular Menu Grid
    if (homeMenuGrid) {
      window.renderHomeMenuCategory = function(category) {
        let items = [];
        if (category === 'all') {
          items = [
            ...siteData.menuItems.slice(0, 4),
            { id: 'combo_1', name: 'Exam Night Crunch Combo', price: 5.50, desc: '১টি কোল্ড ব্রু + ১টি ডার্ক চকলেট ব্রাউনি' },
            { id: 'combo_2', name: 'Group Study Platter', price: 16.50, desc: '৩টি ক্যাপুচিনো + ৩টি বাটার ক্রোয়াসোঁ' }
          ];
        } else if (category === 'drinks') {
          items = siteData.menuItems.filter(item => item.category === 'drinks');
        } else if (category === 'pastries') {
          items = siteData.menuItems.filter(item => item.category === 'pastries');
        } else if (category === 'combos') {
          items = [
            { id: 'combo_1', name: 'Exam Night Crunch Combo', price: 5.50, desc: '১টি কোল্ড ব্রু + ১টি ডার্ক চকলেট ব্রাউনি (Save 21%)' },
            { id: 'combo_2', name: 'Group Study Platter', price: 16.50, desc: '৩টি ক্যাপুচিনো + ৩টি বাটার ক্রোয়াসোঁ (Save 22%)' },
            { id: 'combo_3', name: 'Assignment Booster Combo', price: 5.80, desc: '১টি ডাবল এসপ্রেসো + ১টি সিনামন রোল (Save 20%)' },
            { id: 'combo_4', name: 'Budget Chai & Muffin Combo', price: 6.00, desc: '১টি মসলা চাই লাতে + ১টি ব্লুবেরি মাফিন (Save 25%)' }
          ];
        }

        homeMenuGrid.innerHTML = items.map(item => `
          <div class="card menu-card" data-item-id="${item.id}">
            <div class="menu-card-header">
              <h3>${item.name}</h3>
              <span class="price">$${Number(item.price).toFixed(2)}</span>
            </div>
            <p>${item.desc || 'লোকাল কফি শপের খাঁটি স্বাদের স্পেশাল পরিবেশনা।'}</p>
            <div class="card-order-actions">
              <button type="button" class="btn-add-to-cart-action" onclick="window.addToCart('${item.name}', ${item.price})">
                🛒 ব্যাগে যোগ
              </button>
              <button type="button" class="btn-quick-direct-order" onclick="window.quickDirectOrder('${item.name}', ${item.price})">
                ⚡ দ্রুত অর্ডার
              </button>
            </div>
          </div>
        `).join('');
      };

      // Filter click events for Home menu
      const homeFilterBtns = document.querySelectorAll('#homeMenuFilterGroup .filter-chip');
      homeFilterBtns.forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          homeFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.getAttribute('data-cat') || 'all';
          window.renderHomeMenuCategory(cat);
        };
      });

      // Initial render of home popular items
      window.renderHomeMenuCategory('all');
    }

    // Attach Add to Cart event listeners for dynamic items
    attachCartButtonListeners();
  }

  // Render Dynamic Gallery
  function renderDynamicGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid || siteData.gallery.length === 0) return;

    galleryGrid.innerHTML = siteData.gallery.map(img => `
      <div style="position: relative; overflow: hidden; border-radius: var(--radius-md);">
        <img src="${img.url}" alt="${img.caption || 'Coffee Shop Gallery'}" style="width: 100%; height: 260px; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'">
        ${img.caption ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.65); color: #fff; padding: 6px 12px; font-size: 0.82rem; font-weight: 600;">${img.caption}</div>` : ''}
      </div>
    `).join('');
  }

  // Render Dynamic FAQs
  function renderDynamicFaqs() {
    const faqContainer = document.getElementById('dynamicFaqContainer');
    if (!faqContainer || siteData.faqs.length === 0) return;

    faqContainer.innerHTML = siteData.faqs.map((faq, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}">
        <button type="button" class="faq-question">
          <span>${faq.q}</span>
          <span class="faq-icon">${idx === 0 ? '▲' : '▼'}</span>
        </button>
        <div class="faq-answer">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('');

    // Re-bind FAQ click accordion
    faqContainer.querySelectorAll('.faq-question').forEach(qBtn => {
      qBtn.addEventListener('click', () => {
        const item = qBtn.parentElement;
        const icon = qBtn.querySelector('.faq-icon');
        const isOpen = item.classList.contains('active');

        faqContainer.querySelectorAll('.faq-item').forEach(other => {
          other.classList.remove('active');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherIcon) otherIcon.textContent = '▼';
        });

        if (!isOpen) {
          item.classList.add('active');
          if (icon) icon.textContent = '▲';
        }
      });
    });
  }

  // ============================================================
  // 13.5 Dynamic Seasonal Specials (সিজনাল স্পেশাল ও অফার)
  // ============================================================
  function renderDynamicSeasonalSpecials(activeFilter = 'all') {
    const containers = [
      document.getElementById('seasonalSpecialsContainer'),
      document.getElementById('menuSeasonalSpecialsContainer'),
      document.getElementById('homeSeasonalSpecialsContainer')
    ].filter(Boolean);

    if (containers.length === 0) return;

    let items = siteData.seasonalSpecials || [];
    if (activeFilter !== 'all') {
      items = items.filter(item => item.seasonKey === activeFilter || item.category === activeFilter);
    }

    const html = items.map(item => `
      <div class="seasonal-card" data-special-id="${item.id}">
        <span class="season-badge">SAVE ${item.savePercent || 20}%</span>
        <div>
          <span class="season-type-label">${item.season || 'Seasonal Special'}</span>
          <h3>${item.name}</h3>
          ${item.dietary ? `<span class="seasonal-dietary-badge">${item.dietary}</span>` : ''}
          <p style="font-size: 0.85rem; color: var(--dark-soft); margin-bottom: 8px;">${item.desc || ''}</p>
        </div>
        <div>
          <div class="seasonal-pricing-row">
            <span class="seasonal-price-now">$${Number(item.price).toFixed(2)}</span>
            <span class="seasonal-price-old">$${Number(item.oldPrice || (item.price * 1.25)).toFixed(2)}</span>
          </div>
          <div class="card-order-actions">
            <button type="button" class="btn-add-to-cart-action" onclick="window.addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">
              🛒 ব্যাগে যোগ
            </button>
            <button type="button" class="btn-quick-direct-order" onclick="window.quickDirectOrder('${item.name.replace(/'/g, "\\'")}', ${item.price})">
              ⚡ দ্রুত অর্ডার
            </button>
          </div>
        </div>
      </div>
    `).join('');

    containers.forEach(container => {
      container.innerHTML = html;
    });

    // Attach seasonal filter pills click handlers
    document.querySelectorAll('.season-filter-group .filter-chip').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        document.querySelectorAll('.season-filter-group .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-season') || 'all';
        renderDynamicSeasonalSpecials(filter);
      };
    });
  }
  window.renderDynamicSeasonalSpecials = renderDynamicSeasonalSpecials;

  // ============================================================
  // 13.6 Universal Live Order Tracker System (লাইভ অর্ডার ট্র্যাকার)
  // ============================================================
  const DEFAULT_SAMPLE_ORDER = {
    id: '849201',
    timestamp: Date.now() - (4 * 60 * 1000), // 4 mins ago
    dateFormatted: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
    name: 'তানভীর হাসান (Tanvir Hasan)',
    phone: '01711223344',
    orderType: 'Home Delivery (হোম ডেলিভারি)',
    address: 'বাড়ি ১২, রোড ৪, সেক্টর ৭, ঢাকা',
    payMethod: 'bKash Online (01339564967)',
    trx: 'TRX9948271B',
    notes: 'অতিরিক্ত চিনি ও টিস্যু পাঠাবেন দয়া করে',
    items: [
      { name: 'Autumn Spiced Pumpkin Caramel Latte', price: 5.20, quantity: 2 },
      { name: 'Butter Croissant', price: 3.00, quantity: 2 },
      { name: 'Cold Brew Coffee', price: 3.50, quantity: 1 }
    ],
    itemsPlain: '- Autumn Spiced Pumpkin Caramel Latte (x2): $10.40\n- Butter Croissant (x2): $6.00\n- Cold Brew Coffee (x1): $3.50',
    subtotal: 19.90,
    discount: 20,
    total: '15.92',
    status: 'brewing'
  };

  // Helper to determine status based on elapsed time or set status
  function calculateOrderStatus(order) {
    if (order.manualStatus) return order.manualStatus;
    const elapsedMinutes = (Date.now() - (order.timestamp || Date.now())) / 60000;
    if (elapsedMinutes < 2) return 'received';
    if (elapsedMinutes < 6) return 'brewing';
    if (elapsedMinutes < 12) return 'packaging';
    if (elapsedMinutes < 22) return 'out_for_delivery';
    return 'delivered';
  }

  // Get status metadata
  function getStatusMeta(status) {
    switch(status) {
      case 'received':
        return {
          stepIndex: 1,
          progressPercent: 15,
          title: '📝 অর্ডার গ্রহণ করা হয়েছে (Order Received)',
          sub: 'আপনার অর্ডারটি শপের কাউন্টারে কনফার্ম হয়েছে।',
          eta: '⏱️ আনুমানিক সময়: ২০-২৫ মিনিট',
          badgeClass: 'badge-received'
        };
      case 'brewing':
        return {
          stepIndex: 2,
          progressPercent: 40,
          title: '☕ ব্রিউইং ও তাজা পেস্ট্রি বেকিং চলছে (Brewing & Baking)',
          sub: 'মাস্টার বারিস্তা আপনার পছন্দের অ্যারাবিকা কফি তৈরি করছেন।',
          eta: '⏱️ আনুমানিক সময়: ১৫-১৮ মিনিট',
          badgeClass: 'badge-brewing'
        };
      case 'packaging':
        return {
          stepIndex: 3,
          progressPercent: 65,
          title: '📦 কোয়ালিটি চেক ও ফুড প্যাকিং সম্পন্ন (Quality Checked)',
          sub: 'গরম কফি ও ফ্রেশ বেকারি সিলযুক্ত প্যাকেটে প্যাক করা হয়েছে।',
          eta: '⏱️ আনুমানিক সময়: ১০-১২ মিনিট',
          badgeClass: 'badge-packaging'
        };
      case 'out_for_delivery':
        return {
          stepIndex: 4,
          progressPercent: 88,
          title: '🛵 ডেলিভারির পথে / কাউন্টারে পিকআপ প্রস্তুত (Out for Delivery)',
          sub: 'ডেলিভারি রাইডার আপনার ঠিকানার দিকে রওনা হয়েছেন।',
          eta: '⏱️ আনুমানিক সময়: ৫-৭ মিনিট',
          badgeClass: 'badge-delivering'
        };
      case 'delivered':
        return {
          stepIndex: 5,
          progressPercent: 100,
          title: '✅ সফলভাবে ডেলিভারি সম্পন্ন হয়েছে (Delivered & Enjoy)',
          sub: 'আপনার অর্ডারটি সফলভাবে পৌঁছে গেছে। উপভোগ করুন লোকাল কফি শপের খাঁটি স্বাদ!',
          eta: '🎉 ডেলিভারি সম্পন্ন!',
          badgeClass: 'badge-delivered'
        };
      default:
        return {
          stepIndex: 2,
          progressPercent: 40,
          title: '☕ অর্ডার প্রস্তুত হচ্ছে',
          sub: 'আপনার খাবার তৈরি হচ্ছে।',
          eta: '⏱️ আনুমানিক সময়: ১৫ মিনিট',
          badgeClass: 'badge-brewing'
        };
    }
  }

  // Render tracker HTML for a specific order
  function generateOrderTrackerHTML(order) {
    if (!order) {
      return `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 8px;">🔍</div>
          <h3 style="color: var(--dark); margin-bottom: 6px;">কোনো অর্ডার খুঁজে পাওয়া যায়নি</h3>
          <p style="color: var(--dark-soft); font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.2rem;">
            অনুগ্রহ করে সঠিক অর্ডার আইডি (যেমন: <strong>#849201</strong>) বা অর্ডার দেওয়ার মোবাইল নম্বর লিখে সার্চ করুন।
          </p>
          <button type="button" class="btn btn-sm" onclick="window.trackOrderDemo()" style="background: var(--accent-gold); color: #1E293B; font-weight: 800;">
            🧪 ডেমো লাইভ অর্ডার ট্র্যাকার টেস্ট করুন
          </button>
        </div>
      `;
    }

    const currentStatus = calculateOrderStatus(order);
    const meta = getStatusMeta(currentStatus);

    const isStep1 = meta.stepIndex >= 1;
    const isStep2 = meta.stepIndex >= 2;
    const isStep3 = meta.stepIndex >= 3;
    const isStep4 = meta.stepIndex >= 4;
    const isStep5 = meta.stepIndex >= 5;

    const waTrackUrl = `https://api.whatsapp.com/send?phone=8801339564967&text=${encodeURIComponent(`☕ *Order Status Inquiry*\n\nOrder ID: #${order.id}\nCustomer: ${order.name}\nPhone: ${order.phone}\n\nআমার #${order.id} অর্ডারের বর্তমান লাইভ অবস্থা জানতে চাচ্ছি। ধন্যবাদ!`)}`;

    return `
      <div class="order-tracker-card" style="background: var(--secondary-card); border-radius: var(--radius-md);">
        <!-- Top Status Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 1.2rem; font-weight: 800; color: var(--accent-gold);">ORDER #${order.id}</span>
              <span style="background: rgba(39, 174, 96, 0.15); color: #27AE60; font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px; border: 1px solid #27AE60;">● LIVE ACTIVE</span>
            </div>
            <p style="margin: 0; font-size: 0.82rem; color: var(--dark-soft);">
              📅 অর্ডার সময়: <strong>${order.dateFormatted || 'আজ'}</strong> • ধরণ: <strong>${order.orderType || 'ডেলিভারি'}</strong>
            </p>
          </div>
          <div style="text-align: right;">
            <div style="background: linear-gradient(135deg, #1E293B, #0F172A); color: var(--accent-gold); padding: 6px 14px; border-radius: var(--radius-sm); font-weight: 800; font-size: 0.9rem; border: 1px solid var(--accent-gold);">
              ${meta.eta}
            </div>
          </div>
        </div>

        <!-- 5-Stage Stepper -->
        <div class="tracker-stepper">
          <div class="tracker-stepper-progress" style="width: ${meta.progressPercent}%;"></div>

          <!-- Step 1 -->
          <div class="tracker-step-item ${isStep1 ? (meta.stepIndex === 1 ? 'active' : 'completed') : ''}">
            <div class="tracker-step-circle">${meta.stepIndex > 1 ? '✓' : '1'}</div>
            <div class="tracker-step-title">অর্ডার গ্রহণ</div>
            <div class="tracker-step-sub">Order Received</div>
          </div>

          <!-- Step 2 -->
          <div class="tracker-step-item ${isStep2 ? (meta.stepIndex === 2 ? 'active' : 'completed') : ''}">
            <div class="tracker-step-circle">${meta.stepIndex > 2 ? '✓' : '2'}</div>
            <div class="tracker-step-title">ব্রিউইং ও বেকিং</div>
            <div class="tracker-step-sub">Brewing & Baking</div>
          </div>

          <!-- Step 3 -->
          <div class="tracker-step-item ${isStep3 ? (meta.stepIndex === 3 ? 'active' : 'completed') : ''}">
            <div class="tracker-step-circle">${meta.stepIndex > 3 ? '✓' : '3'}</div>
            <div class="tracker-step-title">কোয়ালিটি প্যাকিং</div>
            <div class="tracker-step-sub">Packed & Ready</div>
          </div>

          <!-- Step 4 -->
          <div class="tracker-step-item ${isStep4 ? (meta.stepIndex === 4 ? 'active' : 'completed') : ''}">
            <div class="tracker-step-circle">${meta.stepIndex > 4 ? '✓' : '4'}</div>
            <div class="tracker-step-title">ডেলিভারির পথে</div>
            <div class="tracker-step-sub">Out for Delivery</div>
          </div>

          <!-- Step 5 -->
          <div class="tracker-step-item ${isStep5 ? 'completed' : ''}">
            <div class="tracker-step-circle">${isStep5 ? '✓' : '5'}</div>
            <div class="tracker-step-title">সম্পন্ন / ডেলিভার্ড</div>
            <div class="tracker-step-sub">Enjoy Coffee!</div>
          </div>
        </div>

        <!-- Current Active Status Message Card -->
        <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(139, 69, 19, 0.08)); border-left: 4px solid var(--accent-gold); border-radius: 4px; padding: 12px 16px; margin: 1.5rem 0;">
          <h4 style="margin: 0 0 4px 0; color: var(--primary); font-size: 1.05rem;">${meta.title}</h4>
          <p style="margin: 0; font-size: 0.88rem; color: var(--dark);">${meta.sub}</p>
        </div>

        <!-- Order Breakdown & Customer Info Grid -->
        <div class="grid grid-2" style="gap: 16px; margin-bottom: 1.5rem;">
          <!-- Customer & Delivery Info -->
          <div style="background: var(--secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: var(--primary); font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
              📍 ডেলিভারি ও গ্রাহক বিবরণ
            </h4>
            <div style="font-size: 0.85rem; line-height: 1.6; color: var(--dark);">
              <strong>নাম:</strong> ${order.name || 'সম্মানিত অতিথি'}<br>
              <strong>ফোন:</strong> ${order.phone || 'N/A'}<br>
              <strong>ঠিকানা / টেবিল:</strong> ${order.address || 'Local Pickup'}<br>
              <strong>পেমেন্ট মাধ্যম:</strong> ${order.payMethod || 'bKash'} (${order.trx ? `Trx: ${order.trx}` : 'Confirmed'})<br>
              ${order.notes && order.notes !== 'None' ? `<strong>বিশেষ নোট:</strong> ${order.notes}` : ''}
            </div>
          </div>

          <!-- Items Summary & Total -->
          <div style="background: var(--secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: var(--primary); font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
              🛒 অর্ডারকৃত আইটেমসমূহ
            </h4>
            <div style="font-size: 0.85rem; line-height: 1.6; color: var(--dark); max-height: 120px; overflow-y: auto;">
              ${order.items ? order.items.map(i => `<div style="display: flex; justify-content: space-between;"><span>${i.name} (x${i.quantity})</span><strong>$${(i.price * i.quantity).toFixed(2)}</strong></div>`).join('') : (order.itemsSummary || 'Signature Coffee Items')}
            </div>
            <hr style="margin: 8px 0; border: 0; border-top: 1px dashed var(--border-color);">
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; color: var(--accent-gold);">
              <span>সর্বমোট বিল:</span>
              <span>$${order.total}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="${waTrackUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="flex: 1; min-width: 200px; background: #25D366; color: #FFF; font-weight: 800; text-align: center; text-decoration: none; padding: 10px; font-size: 0.88rem; border-radius: 6px;">
            💬 হোয়াটসঅ্যাপে ওনার থেকে লাইভ আপডেট নিন
          </a>
          <button type="button" class="btn btn-secondary" onclick="window.refreshOrderStatus('${order.id}')" style="font-weight: 700; font-size: 0.88rem; border-radius: 6px;">
            🔄 রিফ্রেশ স্ট্যাটাস
          </button>
          <button type="button" class="btn btn-secondary" onclick="try { window.downloadReceiptPDF('${order.id}', '${encodeURIComponent(order.itemsPlain || '')}', '${order.total}'); } catch(e){}" style="font-weight: 700; font-size: 0.88rem; border-radius: 6px;">
            📥 রসিদ PDF
          </button>
          <a href="tel:01339564967" class="btn btn-secondary" style="font-weight: 700; font-size: 0.88rem; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            📞 হটলাইন কল
          </a>
        </div>
      </div>
    `;
  }

  // Find order by ID or phone number
  function findOrderByQuery(query) {
    if (!query) return null;
    const cleanQuery = query.toString().trim().replace(/^#/, '').toLowerCase();
    
    // Check local storage orders
    const orders = JSON.parse(localStorage.getItem('lcs_orders') || '[]');
    let match = orders.find(o => 
      (o.id && o.id.toString().toLowerCase() === cleanQuery) ||
      (o.phone && o.phone.toString().replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, '')))
    );

    if (match) return match;

    // Check demo order match
    if (cleanQuery === '849201' || cleanQuery === 'lcs-demo-8492' || cleanQuery === '01711223344' || cleanQuery === 'demo') {
      return DEFAULT_SAMPLE_ORDER;
    }

    return null;
  }

  // Initialize In-page Order Tracker
  function renderDynamicOrderTracker() {
    const inPageContainer = document.getElementById('orderTrackerContainer');
    if (!inPageContainer) return;

    // Get last active order if available or sample demo
    const lastOrderId = localStorage.getItem('lcs_last_order_id');
    const orders = JSON.parse(localStorage.getItem('lcs_orders') || '[]');
    let initialOrder = null;

    if (lastOrderId) {
      initialOrder = findOrderByQuery(lastOrderId);
    }
    if (!initialOrder && orders.length > 0) {
      initialOrder = orders[0];
    }
    if (!initialOrder) {
      initialOrder = DEFAULT_SAMPLE_ORDER;
    }

    inPageContainer.innerHTML = generateOrderTrackerHTML(initialOrder);

    // Bind In-page search form
    const searchForm = document.getElementById('orderTrackerSearchForm');
    const searchInput = document.getElementById('orderTrackerSearchInput');

    if (searchForm && searchInput) {
      searchForm.onsubmit = (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) {
          showCustomToast('অনুগ্রহ করে অর্ডার আইডি বা মোবাইল নম্বর লিখুন', 'error');
          return;
        }
        const found = findOrderByQuery(q);
        inPageContainer.innerHTML = generateOrderTrackerHTML(found);
      };
    }
  }

  // Render tracker modal on demand
  window.openOrderTracker = function(orderId) {
    let targetOrder = null;
    if (orderId) {
      targetOrder = findOrderByQuery(orderId);
    }
    if (!targetOrder) {
      const lastOrderId = localStorage.getItem('lcs_last_order_id');
      const orders = JSON.parse(localStorage.getItem('lcs_orders') || '[]');
      if (lastOrderId) targetOrder = findOrderByQuery(lastOrderId);
      if (!targetOrder && orders.length > 0) targetOrder = orders[0];
      if (!targetOrder) targetOrder = DEFAULT_SAMPLE_ORDER;
    }

    let trackerModal = document.getElementById('orderTrackerModalOverlay');
    if (!trackerModal) {
      trackerModal = document.createElement('div');
      trackerModal.className = 'custom-modal-overlay';
      trackerModal.id = 'orderTrackerModalOverlay';
      trackerModal.innerHTML = `
        <div class="custom-modal order-tracker-modal" style="max-width: 760px; width: 95%;">
          <div class="editor-modal-header" style="padding: 1.2rem 1.5rem; border-bottom: 1.5px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.6rem;">📦</span>
              <div>
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--dark);">লাইভ অর্ডার ট্র্যাকার (Live Order Tracker)</h3>
                <p style="margin: 0; font-size: 0.82rem; color: var(--dark-soft);">আপনার অর্ডারের তাৎক্ষণিক প্রস্তুতি ও ডেলিভারি স্ট্যাটাস দেখুন</p>
              </div>
            </div>
            <button type="button" class="cart-close-btn" id="closeOrderTrackerBtn" style="font-size: 1.6rem; cursor: pointer;">&times;</button>
          </div>

          <div style="padding: 1.2rem 1.5rem;">
            <!-- Live Search Bar inside Modal -->
            <form id="modalTrackerSearchForm" style="display: flex; gap: 8px; margin-bottom: 1.2rem;">
              <input type="text" id="modalTrackerSearchInput" class="order-tracker-search-input" placeholder="অর্ডার আইডি (যেমন: 849201) বা ফোন নম্বর লিখুন..." style="flex: 1; padding: 10px 14px; border: 1.5px solid var(--accent-gold); border-radius: var(--radius-sm); font-size: 0.92rem; background: var(--secondary); color: var(--dark);">
              <button type="submit" class="btn" style="background: var(--accent-gold); color: #1E293B; font-weight: 800; padding: 0 16px; border-radius: var(--radius-sm);">
                🔍 ট্র্যাক করুন
              </button>
            </form>

            <div id="modalTrackerBody">
              ${generateOrderTrackerHTML(targetOrder)}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(trackerModal);

      // Close handler
      const closeBtn = trackerModal.querySelector('#closeOrderTrackerBtn');
      if (closeBtn) {
        closeBtn.onclick = () => trackerModal.classList.remove('active');
      }
      trackerModal.onclick = (e) => {
        if (e.target === trackerModal) trackerModal.classList.remove('active');
      };

      // Search form handler inside modal
      const modalForm = trackerModal.querySelector('#modalTrackerSearchForm');
      const modalInput = trackerModal.querySelector('#modalTrackerSearchInput');
      const modalBody = trackerModal.querySelector('#modalTrackerBody');

      if (modalForm && modalInput && modalBody) {
        modalForm.onsubmit = (e) => {
          e.preventDefault();
          const q = modalInput.value.trim();
          if (!q) {
            showCustomToast('অনুগ্রহ করে অর্ডার আইডি লিখুন', 'error');
            return;
          }
          const found = findOrderByQuery(q);
          modalBody.innerHTML = generateOrderTrackerHTML(found);
        };
      }
    } else {
      const modalBody = trackerModal.querySelector('#modalTrackerBody');
      if (modalBody) {
        modalBody.innerHTML = generateOrderTrackerHTML(targetOrder);
      }
    }

    trackerModal.classList.add('active');
  };

  window.trackOrderDemo = function() {
    window.openOrderTracker('849201');
  };

  window.refreshOrderStatus = function(orderId) {
    showCustomToast('🔄 অর্ডারের লাইভ স্ট্যাটাস আপডেট করা হয়েছে!', 'info');
    window.openOrderTracker(orderId);
  };

  // Bind all nav-tracker-btn to open tracker
  document.querySelectorAll('.nav-tracker-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      window.openOrderTracker();
    };
  });

  // Inject Floating Editor Toolbar & Master Editor Modal to Page
  function injectMasterEditorUI() {
    // 1. Floating Bar
    const floatBar = document.createElement('div');
    floatBar.className = 'site-editor-float-bar';
    floatBar.id = 'siteEditorFloatBar';
    floatBar.innerHTML = `
      <button type="button" class="btn-float-customizer" id="openMasterEditorBtn" title="ওয়েবসাইটের সব কিছু এডিট ও কাস্টমাইজ করুন">
        ⚙️ কাস্টমাইজ করুন (Customize Site)
      </button>
      <button type="button" class="edit-mode-toggle-btn" id="editModeToggleBtn" title="ইনলাইন এডিট অপশন চালু বা বন্ধ করুন">
        ✏️ এডিট মোড: বন্ধ
      </button>
    `;
    document.body.appendChild(floatBar);

    // 2. Master Editor Modal
    const editorModalOverlay = document.createElement('div');
    editorModalOverlay.className = 'custom-modal-overlay';
    editorModalOverlay.id = 'masterEditorOverlay';
    editorModalOverlay.innerHTML = `
      <div class="custom-modal editor-modal">
        <div class="editor-modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.5rem;">⚙️</span>
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; color: var(--dark);">ওয়েবসাইট মাস্টার কাস্টমাইজার ও এডিটর</h3>
              <p style="margin: 0; font-size: 0.8rem; color: var(--dark-soft);">যেকোনো তথ্য, নাম, দাম, ছবি, স্টোরি ও কন্টেন্ট সরাসরি পরিবর্তন করুন</p>
            </div>
          </div>
          <button type="button" class="cart-close-btn" id="closeMasterEditorBtn" style="font-size: 1.6rem;">&times;</button>
        </div>

        <!-- Editor Tabs Navigation -->
        <div class="editor-tabs-nav">
          <button type="button" class="editor-tab-btn active" data-tab="tabGeneral">🏢 সাধারণ ও শপ তথ্য</button>
          <button type="button" class="editor-tab-btn" data-tab="tabHero">🌟 হিরো ও ব্যানার</button>
          <button type="button" class="editor-tab-btn" data-tab="tabMenu">☕ মেনু ও প্রাইসিং</button>
          <button type="button" class="editor-tab-btn" data-tab="tabStudent">🎓 ছাত্র কর্নার (Student)</button>
          <button type="button" class="editor-tab-btn" data-tab="tabStory">📖 স্টোরি ও ৫০+ স্টাফ</button>
          <button type="button" class="editor-tab-btn" data-tab="tabGallery">🖼️ গ্যালারি ফটো</button>
          <button type="button" class="editor-tab-btn" data-tab="tabContact">📞 যোগাযোগ ও সময়</button>
          <button type="button" class="editor-tab-btn" data-tab="tabFaq">❓ সচরাচর প্রশ্ন (FAQ)</button>
          <button type="button" class="editor-tab-btn" data-tab="tabBackup">🔄 ব্যাকআপ ও রিসেট</button>
        </div>

        <!-- Tab 1: General & Branding -->
        <div class="editor-tab-pane active" id="tabGeneral">
          <div class="editor-form-grid">
            <div class="form-group">
              <label>শপ / ক্যাফের নাম (Shop Name):</label>
              <input type="text" id="cfgShopName">
            </div>
            <div class="form-group">
              <label>মালিকের নাম (Owner Name):</label>
              <input type="text" id="cfgOwnerName">
            </div>
            <div class="form-group">
              <label>মালিকের জেলা / অবস্থান (Location):</label>
              <input type="text" id="cfgOwnerDistrict">
            </div>
            <div class="form-group">
              <label>হটলাইন / মোবাইল নম্বর (Hotline Phone):</label>
              <input type="tel" id="cfgHotline">
            </div>
            <div class="form-group">
              <label>ইমেইল অ্যাড্রেস (Email Address):</label>
              <input type="email" id="cfgEmail">
            </div>
            <div class="form-group">
              <label>প্রোমোকোড ও ডিসকাউন্ট (Promo Code):</label>
              <input type="text" id="cfgPromoCode">
            </div>
          </div>
          <div class="form-group">
            <label>ক্যাফের সম্পূর্ণ ঠিকানা (Address):</label>
            <input type="text" id="cfgAddress">
          </div>
          <div class="form-group">
            <label>টপ অ্যানাউন্সমেন্ট অফার ব্যানার টেক্সট (Offer Banner):</label>
            <input type="text" id="cfgBannerText">
          </div>
        </div>

        <!-- Tab 2: Hero Section -->
        <div class="editor-tab-pane" id="tabHero">
          <div class="form-group">
            <label>হিরো প্রধান শিরোনাম (Hero Title):</label>
            <input type="text" id="cfgHeroTitle">
          </div>
          <div class="form-group">
            <label>হিরো সাবটাইটেল ও বর্ণনা (Hero Subtitle):</label>
            <textarea id="cfgHeroSubtitle" rows="3"></textarea>
          </div>
          <div class="editor-form-grid">
            <div class="form-group">
              <label>বাটন ১ টেক্সট (Button 1):</label>
              <input type="text" id="cfgHeroBtn1Text">
            </div>
            <div class="form-group">
              <label>বাটন ১ লিংক (Button 1 URL):</label>
              <input type="text" id="cfgHeroBtn1Link">
            </div>
            <div class="form-group">
              <label>বাটন ২ টেক্সট (Button 2):</label>
              <input type="text" id="cfgHeroBtn2Text">
            </div>
            <div class="form-group">
              <label>বাটন ২ লিংক (Button 2 URL):</label>
              <input type="text" id="cfgHeroBtn2Link">
            </div>
          </div>
        </div>

        <!-- Tab 3: Menu Manager -->
        <div class="editor-tab-pane" id="tabMenu">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: var(--dark);">বর্তমান মেনু আইটেমসমূহ (${siteData.menuItems.length} টি)</strong>
            <button type="button" class="btn btn-sm" id="addNewMenuItemBtn">➕ নতুন মেনু আইটেম যোগ করুন</button>
          </div>
          
          <!-- New Menu Item Form (Collapsible) -->
          <div id="newMenuItemBox" style="display: none; background: rgba(139, 69, 19, 0.08); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed var(--accent-gold); margin-bottom: 12px;">
            <h4 style="margin-top: 0; color: var(--primary);">নতুন আইটেম যোগ / এডিট ফর্ম</h4>
            <input type="hidden" id="editMenuId">
            <div class="editor-form-grid">
              <div class="form-group">
                <label>আইটেমের নাম (Item Name)*:</label>
                <input type="text" id="mItemName" placeholder="যেমন: Spanish Latte">
              </div>
              <div class="form-group">
                <label>দাম (Price USD $)*:</label>
                <input type="number" step="0.25" id="mItemPrice" placeholder="4.50">
              </div>
              <div class="form-group">
                <label>ক্যাটাগরি (Category)*:</label>
                <select id="mItemCategory" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--secondary);">
                  <option value="drinks">☕ Drinks & Coffee</option>
                  <option value="pastries">🥐 Pastries & Bakery</option>
                </select>
              </div>
              <div class="form-group">
                <label>সংক্ষিপ্ত বিবরণ (Description):</label>
                <input type="text" id="mItemDesc" placeholder="স্বাদ ও ফ্লেভারের বর্ণনা...">
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-sm" id="saveMenuItemBtn">💾 সেভ করুন</button>
              <button type="button" class="btn btn-sm btn-secondary" id="cancelMenuItemBtn">বাতিল</button>
            </div>
          </div>

          <div id="menuItemsEditorList"></div>
        </div>

        <!-- Tab 3.5: Student Zone Manager -->
        <div class="editor-tab-pane" id="tabStudent">
          <div class="card" style="background: var(--secondary); margin-bottom: 1rem;">
            <h4 style="color: var(--primary); margin-top: 0;">🎓 ছাত্র স্পেশাল ডিসকাউন্ট ও পাস কনফিগারেশন</h4>
            <div class="editor-form-grid">
              <div class="form-group">
                <label>স্টুডেন্ট ডিসকাউন্ট (%) (Discount Percentage):</label>
                <input type="number" id="cfgStudentDiscount" placeholder="25">
              </div>
              <div class="form-group">
                <label>স্টুডেন্ট প্রোমোকোড (Student Promo Code):</label>
                <input type="text" id="cfgStudentPromoCode" placeholder="STUDENT25">
              </div>
            </div>
            <div class="form-group">
              <label>স্টুডেন্ট কর্নার শিরোনাম (Student Zone Title):</label>
              <input type="text" id="cfgStudentTitle" placeholder="ছাত্রদের জন্য বিশেষ কর্নার ও স্টাডি জোন">
            </div>
            <div class="form-group">
              <label>স্টুডেন্ট কর্নার সাবটাইটেল (Student Zone Subtitle):</label>
              <textarea id="cfgStudentSubtitle" rows="2" placeholder="ব্রাহ্মণবাড়িয়ার সকল ছাত্র-ছাত্রীদের পড়াশোনা ও গ্রুপ স্টাডির জন্য বিশেষ সুযোগ-সুবিধা..."></textarea>
            </div>
            <div class="editor-form-grid">
              <div class="form-group">
                <label>ওয়াইফাই সুবিধা বিবরণ (WiFi Perk):</label>
                <input type="text" id="cfgStudentPerkWifi" placeholder="উচ্চগতির আনলিমিটেড ওয়াইফাই">
              </div>
              <div class="form-group">
                <label>প্রিন্টিং সুবিধা বিবরণ (Printing Perk):</label>
                <input type="text" id="cfgStudentPerkPrint" placeholder="প্রতিদিন ৫ পেজ ফ্রি স্টুডেন্ট প্রিন্টিং">
              </div>
            </div>
          </div>
          <p style="font-size: 0.85rem; color: var(--dark-soft);">ছাত্র-ছাত্রীরা এই কোড ব্যবহার করে সরাসরি ২৫% ডিসকাউন্ট পাবে এবং স্টুডেন্ট কার্ড তৈরি করতে পারবে।</p>
        </div>

        <!-- Tab 4: Story & Staff -->
        <div class="editor-tab-pane" id="tabStory">
          <div class="form-group">
            <label>স্টোরি শিরোনাম (Story Heading):</label>
            <input type="text" id="cfgStoryTitle">
          </div>
          <div class="form-group">
            <label>১ম প্যারাগ্রাফ (Story Paragraph 1):</label>
            <textarea id="cfgStoryP1" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>২য় প্যারাগ্রাফ (Story Paragraph 2):</label>
            <textarea id="cfgStoryP2" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>মালিক মিরাজুল ইসলামের বক্তব্য / উক্তি (Founder Quote):</label>
            <textarea id="cfgFounderQuote" rows="3"></textarea>
          </div>
          <h4 style="color: var(--primary); margin: 12px 0 8px;">৫০+ টিম ও স্টাফের সংখ্যা পরিবর্তন</h4>
          <div class="editor-form-grid">
            <div class="form-group">
              <label>বারিস্তা সংখ্যা (Baristas Count):</label>
              <input type="text" id="cfgBaristaCount">
            </div>
            <div class="form-group">
              <label>পেস্ট্রি শেফ / বেকার সংখ্যা (Bakers Count):</label>
              <input type="text" id="cfgBakerCount">
            </div>
            <div class="form-group">
              <label>সার্ভিস স্টাফ সংখ্যা (Hospitality Count):</label>
              <input type="text" id="cfgHospitalityCount">
            </div>
            <div class="form-group">
              <label>সর্বমোট কর্মী সংখ্যা (Total Staff):</label>
              <input type="text" id="cfgTotalStaff">
            </div>
          </div>
        </div>

        <!-- Tab 5: Gallery Manager -->
        <div class="editor-tab-pane" id="tabGallery">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: var(--dark);">গ্যালারি ফটোসমূহ (${siteData.gallery.length} টি)</strong>
            <button type="button" class="btn btn-sm" id="addNewGalleryPhotoBtn">➕ নতুন ছবি যোগ করুন</button>
          </div>

          <div id="newGalleryPhotoBox" style="display: none; background: rgba(139, 69, 19, 0.08); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed var(--accent-gold); margin-bottom: 12px;">
            <h4 style="margin-top: 0; color: var(--primary);">নতুন গ্যালারি ফটো যোগ করুন (মোবাইল ও পিসি)</h4>
            <div class="form-group">
              <label>📱 মোবাইল বা ডিভাইস থেকে ছবি আপলোড করুন:</label>
              <input type="file" id="galleryPhotoFileInput" accept="image/*" style="display: none;">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm" id="uploadGalleryPhotoBtn" style="background: var(--accent-gold); color: #1E293B;">📷 ছবি সিলেক্ট করুন (গ্যালারি/ক্যামেরা)</button>
                <span id="galleryFileChosenName" style="font-size: 0.82rem; color: var(--dark-soft);">কোনো ফাইল বেছে নেওয়া হয়নি</span>
              </div>
            </div>
            <div class="form-group">
              <label>অথবা ছবির ওয়েব লিংক (Image URL):</label>
              <input type="url" id="gPhotoUrl" placeholder="https://images.unsplash.com/... বা ছবির লিংক">
            </div>
            <div class="form-group" style="text-align: center;">
              <img id="gPhotoPreview" src="" alt="Preview" style="max-height: 120px; border-radius: 6px; display: none; margin: 0 auto; object-fit: cover; border: 1px solid var(--border-color);">
            </div>
            <div class="form-group">
              <label>ছবির ক্যাপশন / বিবরণ (Caption):</label>
              <input type="text" id="gPhotoCaption" placeholder="যেমন: তাজা রোস্টেড এসপ্রেসো আর্ট">
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-sm" id="saveGalleryPhotoBtn">💾 ছবি যোগ করুন</button>
              <button type="button" class="btn btn-sm btn-secondary" id="cancelGalleryPhotoBtn">বাতিল</button>
            </div>
          </div>

          <div id="galleryPhotosEditorList"></div>
        </div>

        <!-- Tab 6: Contact & Hours -->
        <div class="editor-tab-pane" id="tabContact">
          <div class="editor-form-grid">
            <div class="form-group">
              <label>সোম - শুক্র খোলার সময় (Mon - Fri Hours):</label>
              <input type="text" id="cfgHoursMonFri">
            </div>
            <div class="form-group">
              <label>শনি - রবি খোলার সময় (Sat - Sun Hours):</label>
              <input type="text" id="cfgHoursSatSun">
            </div>
          </div>
          <p style="font-size: 0.85rem; color: var(--dark-soft);">হটলাইন, ইমেইল এবং শপের ঠিকানা 'সাধারণ ও শপ তথ্য' ট্যাব থেকে পরিবর্তন করুন।</p>
        </div>

        <!-- Tab 7: FAQ Manager -->
        <div class="editor-tab-pane" id="tabFaq">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: var(--dark);">সচরাচর প্রশ্ন ও উত্তর (${siteData.faqs.length} টি)</strong>
            <button type="button" class="btn btn-sm" id="addNewFaqBtn">➕ নতুন প্রশ্ন যোগ করুন</button>
          </div>

          <div id="newFaqBox" style="display: none; background: rgba(139, 69, 19, 0.08); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed var(--accent-gold); margin-bottom: 12px;">
            <h4 style="margin-top: 0; color: var(--primary);">নতুন FAQ প্রশ্ন ও উত্তর</h4>
            <input type="hidden" id="editFaqId">
            <div class="form-group">
              <label>প্রশ্ন (Question)*:</label>
              <input type="text" id="faqQInput" placeholder="যেমন: ক্যাফেতে কি ওয়াইফাই আছে?">
            </div>
            <div class="form-group">
              <label>উত্তর (Answer)*:</label>
              <textarea id="faqAInput" rows="3" placeholder="হ্যাঁ, আমাদের ক্যাফেতে ফ্রি হাই-স্পিড ওয়াইফাই সুবিধা রয়েছে..."></textarea>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-sm" id="saveFaqBtn">💾 সেভ করুন</button>
              <button type="button" class="btn btn-sm btn-secondary" id="cancelFaqBtn">বাতিল</button>
            </div>
          </div>

          <div id="faqEditorList"></div>
        </div>

        <!-- Tab 8: Backup & Reset -->
        <div class="editor-tab-pane" id="tabBackup">
          <div class="card" style="margin-bottom: 1rem; background: var(--secondary);">
            <h4 style="color: var(--primary); margin-top: 0;">🔄 ডিফল্ট ডেটা রিস্টোর</h4>
            <p style="font-size: 0.88rem; color: var(--dark-soft); margin-bottom: 10px;">যদি আপনি আপনার সমস্ত কাস্টমাইজেশন রিসেট করে ক্যাফের মূল অফিসিয়াল তথ্যে ফিরে যেতে চান:</p>
            <button type="button" class="btn btn-secondary" id="resetAllSiteDataBtn" style="color: #E74C3C; border-color: #E74C3C;">
              🔄 সম্পূর্ণ ওয়েবসাইট রিসেট করুন (Reset to Original)
            </button>
          </div>

          <div class="card" style="background: var(--secondary);">
            <h4 style="color: var(--primary); margin-top: 0;">💾 ব্যাকআপ এক্সপোর্ট ও ইমপোর্ট</h4>
            <p style="font-size: 0.88rem; color: var(--dark-soft); margin-bottom: 10px;">আপনার সমস্ত কাস্টমাইজেশন JSON ফাইল হিসেবে ডাউনলোড করে ব্যাকআপ রাখুন অথবা আগের ব্যাকআপ লোড করুন।</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm" id="exportBackupBtn">📥 ব্যাকআপ ডাউনলোড (Export JSON)</button>
              <button type="button" class="btn btn-sm btn-secondary" id="importBackupBtn">📤 ব্যাকআপ আপলোড (Import JSON)</button>
              <input type="file" id="importFileInput" accept=".json" style="display: none;">
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="editor-modal-footer">
          <button type="button" class="btn" id="saveAllMasterChangesBtn" style="padding: 0.75rem 1.8rem; font-size: 0.95rem;">
            💾 সমস্ত পরিবর্তন সংরক্ষণ করুন (Save All Changes)
          </button>
          <button type="button" class="btn btn-secondary" id="closeMasterModalBtn">
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(editorModalOverlay);

    // Bind Tab Switching
    const tabBtns = editorModalOverlay.querySelectorAll('.editor-tab-btn');
    const tabPanes = editorModalOverlay.querySelectorAll('.editor-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Populate Fields on Open
    function populateEditorForm() {
      // General
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      setVal('cfgShopName', siteData.general.shopName);
      setVal('cfgOwnerName', siteData.general.ownerName);
      setVal('cfgOwnerDistrict', siteData.general.ownerDistrict);
      setVal('cfgHotline', siteData.general.hotline);
      setVal('cfgEmail', siteData.general.email);
      setVal('cfgPromoCode', siteData.general.promoCode);
      setVal('cfgAddress', siteData.general.address);
      setVal('cfgBannerText', siteData.general.bannerText);

      // Hero
      setVal('cfgHeroTitle', siteData.hero.title);
      setVal('cfgHeroSubtitle', siteData.hero.subtitle);
      setVal('cfgHeroBtn1Text', siteData.hero.btn1Text);
      setVal('cfgHeroBtn1Link', siteData.hero.btn1Link);
      setVal('cfgHeroBtn2Text', siteData.hero.btn2Text);
      setVal('cfgHeroBtn2Link', siteData.hero.btn2Link);

      // Story
      setVal('cfgStoryTitle', siteData.story.title);
      setVal('cfgStoryP1', siteData.story.p1);
      setVal('cfgStoryP2', siteData.story.p2);
      setVal('cfgFounderQuote', siteData.story.quote);
      setVal('cfgBaristaCount', siteData.story.baristaCount);
      setVal('cfgBakerCount', siteData.story.bakerCount);
      setVal('cfgHospitalityCount', siteData.story.hospitalityCount);
      setVal('cfgTotalStaff', siteData.story.totalStaff);

      // Contact & Hours
      setVal('cfgHoursMonFri', siteData.contact.hoursMonFri);
      setVal('cfgHoursSatSun', siteData.contact.hoursSatSun);

      // Student Zone
      setVal('cfgStudentDiscount', siteData.student?.discountPercent || 25);
      setVal('cfgStudentPromoCode', siteData.student?.promoCode || 'STUDENT25');
      setVal('cfgStudentTitle', siteData.student?.title || '');
      setVal('cfgStudentSubtitle', siteData.student?.subtitle || '');
      setVal('cfgStudentPerkWifi', siteData.student?.perkWifi || '');
      setVal('cfgStudentPerkPrint', siteData.student?.perkPrint || '');

      // Render lists
      renderMenuListInEditor();
      renderGalleryListInEditor();
      renderFaqListInEditor();
    }

    // Render Menu Items inside Editor Tab
    function renderMenuListInEditor() {
      const container = document.getElementById('menuItemsEditorList');
      if (!container) return;

      container.innerHTML = siteData.menuItems.map(item => `
        <div class="editor-item-card">
          <div class="editor-item-info">
            <strong>${item.name}</strong>
            <span>$${Number(item.price).toFixed(2)} &bull; ${item.category === 'drinks' ? '☕ ড্রিংকস' : '🥐 পেস্ট্রি'}</span>
            <p>${item.desc || ''}</p>
          </div>
          <div class="editor-item-actions">
            <button type="button" class="btn-item-action" onclick="window.editMenuItem('${item.id}')">✏️ এডিট</button>
            <button type="button" class="btn-item-action delete" onclick="window.deleteMenuItem('${item.id}')">🗑️ মুছুন</button>
          </div>
        </div>
      `).join('');
    }

    // Render Gallery Photos inside Editor Tab
    function renderGalleryListInEditor() {
      const container = document.getElementById('galleryPhotosEditorList');
      if (!container) return;

      container.innerHTML = siteData.gallery.map(img => `
        <div class="editor-item-card">
          <img src="${img.url}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;">
          <div class="editor-item-info">
            <strong>${img.caption || 'Gallery Image'}</strong>
            <p style="font-size: 0.75rem; word-break: break-all;">${img.url}</p>
          </div>
          <div class="editor-item-actions">
            <button type="button" class="btn-item-action delete" onclick="window.deleteGalleryPhoto('${img.id}')">🗑️ মুছুন</button>
          </div>
        </div>
      `).join('');
    }

    // Render FAQ inside Editor Tab
    function renderFaqListInEditor() {
      const container = document.getElementById('faqEditorList');
      if (!container) return;

      container.innerHTML = siteData.faqs.map(faq => `
        <div class="editor-item-card">
          <div class="editor-item-info">
            <strong>${faq.q}</strong>
            <p>${faq.a}</p>
          </div>
          <div class="editor-item-actions">
            <button type="button" class="btn-item-action" onclick="window.editFaqItem('${faq.id}')">✏️ এডিট</button>
            <button type="button" class="btn-item-action delete" onclick="window.deleteFaqItem('${faq.id}')">🗑️ মুছুন</button>
          </div>
        </div>
      `).join('');
    }

    // Window global functions for item actions
    window.openSiteEditor = function(tabName = 'tabGeneral') {
      populateEditorForm();
      tabBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
      });
      tabPanes.forEach(p => {
        p.classList.toggle('active', p.id === tabName);
      });
      editorModalOverlay.classList.add('active');
    };

    window.closeSiteEditor = function() {
      editorModalOverlay.classList.remove('active');
    };

    window.editMenuItem = function(id) {
      const item = siteData.menuItems.find(m => m.id === id);
      if (!item) return;
      const box = document.getElementById('newMenuItemBox');
      if (box) box.style.display = 'block';
      document.getElementById('editMenuId').value = item.id;
      document.getElementById('mItemName').value = item.name;
      document.getElementById('mItemPrice').value = item.price;
      document.getElementById('mItemCategory').value = item.category;
      document.getElementById('mItemDesc').value = item.desc || '';
    };

    window.deleteMenuItem = function(id) {
      if (confirm('আপনি কি এই মেনু আইটেমটি মুছে ফেলতে চান?')) {
        siteData.menuItems = siteData.menuItems.filter(m => m.id !== id);
        renderMenuListInEditor();
        saveSiteData();
      }
    };

    window.deleteGalleryPhoto = function(id) {
      if (confirm('আপনি কি এই ছবিটি গ্যালারি থেকে সরাতে চান?')) {
        siteData.gallery = siteData.gallery.filter(g => g.id !== id);
        renderGalleryListInEditor();
        saveSiteData();
      }
    };

    window.editFaqItem = function(id) {
      const item = siteData.faqs.find(f => f.id === id);
      if (!item) return;
      const box = document.getElementById('newFaqBox');
      if (box) box.style.display = 'block';
      document.getElementById('editFaqId').value = item.id;
      document.getElementById('faqQInput').value = item.q;
      document.getElementById('faqAInput').value = item.a;
    };

    window.deleteFaqItem = function(id) {
      if (confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) {
        siteData.faqs = siteData.faqs.filter(f => f.id !== id);
        renderFaqListInEditor();
        saveSiteData();
      }
    };

    // Open/Close triggers
    const openBtn = document.getElementById('openMasterEditorBtn');
    if (openBtn) openBtn.addEventListener('click', () => window.openSiteEditor());

    const closeBtn1 = document.getElementById('closeMasterEditorBtn');
    if (closeBtn1) closeBtn1.addEventListener('click', window.closeSiteEditor);

    const closeBtn2 = document.getElementById('closeMasterModalBtn');
    if (closeBtn2) closeBtn2.addEventListener('click', window.closeSiteEditor);

    editorModalOverlay.addEventListener('click', (e) => {
      if (e.target === editorModalOverlay) window.closeSiteEditor();
    });

    // Edit Mode Toggle Button
    const editModeToggleBtn = document.getElementById('editModeToggleBtn');
    let isEditModeActive = localStorage.getItem('lcs_edit_mode_active') === 'true';

    function setEditMode(active) {
      isEditModeActive = active;
      localStorage.setItem('lcs_edit_mode_active', active);
      document.body.classList.toggle('edit-mode-active', active);
      if (editModeToggleBtn) {
        editModeToggleBtn.classList.toggle('active', active);
        editModeToggleBtn.textContent = active ? '✏️ এডিট মোড: চালু' : '✏️ এডিট মোড: বন্ধ';
      }
    }

    if (editModeToggleBtn) {
      editModeToggleBtn.addEventListener('click', () => {
        setEditMode(!isEditModeActive);
      });
    }

    // Set initial edit mode
    setEditMode(isEditModeActive);

    // Menu Item Box handlers
    const addNewMenuBtn = document.getElementById('addNewMenuItemBtn');
    const newMenuBox = document.getElementById('newMenuItemBox');
    const cancelMenuBtn = document.getElementById('cancelMenuItemBtn');
    const saveMenuItemBtn = document.getElementById('saveMenuItemBtn');

    if (addNewMenuBtn && newMenuBox) {
      addNewMenuBtn.addEventListener('click', () => {
        newMenuBox.style.display = 'block';
        document.getElementById('editMenuId').value = '';
        document.getElementById('mItemName').value = '';
        document.getElementById('mItemPrice').value = '';
        document.getElementById('mItemDesc').value = '';
      });
    }

    if (cancelMenuBtn && newMenuBox) {
      cancelMenuBtn.addEventListener('click', () => {
        newMenuBox.style.display = 'none';
      });
    }

    if (saveMenuItemBtn) {
      saveMenuItemBtn.addEventListener('click', () => {
        const id = document.getElementById('editMenuId').value;
        const name = document.getElementById('mItemName').value.trim();
        const price = parseFloat(document.getElementById('mItemPrice').value) || 3.00;
        const category = document.getElementById('mItemCategory').value;
        const desc = document.getElementById('mItemDesc').value.trim();

        if (!name) {
          alert('অনুগ্রহ করে আইটেমের নাম লিখুন');
          return;
        }

        if (id) {
          const idx = siteData.menuItems.findIndex(m => m.id === id);
          if (idx !== -1) {
            siteData.menuItems[idx] = { id, name, price, category, desc, isSpecial: siteData.menuItems[idx].isSpecial };
          }
        } else {
          siteData.menuItems.push({
            id: 'm_' + Date.now(),
            name,
            price,
            category,
            desc,
            isSpecial: false
          });
        }

        newMenuBox.style.display = 'none';
        renderMenuListInEditor();
        saveSiteData();
      });
    }

    // Gallery Photo Box handlers
    const addNewGalleryBtn = document.getElementById('addNewGalleryPhotoBtn');
    const newGalleryBox = document.getElementById('newGalleryPhotoBox');
    const cancelGalleryBtn = document.getElementById('cancelGalleryPhotoBtn');
    const saveGalleryBtn = document.getElementById('saveGalleryPhotoBtn');
    const uploadGalleryBtn = document.getElementById('uploadGalleryPhotoBtn');
    const galleryFileInput = document.getElementById('galleryPhotoFileInput');
    const gPhotoUrlInput = document.getElementById('gPhotoUrl');
    const gPhotoPreview = document.getElementById('gPhotoPreview');
    const galleryFileChosenName = document.getElementById('galleryFileChosenName');
    let pendingGalleryPhotoSrc = '';

    if (uploadGalleryBtn && galleryFileInput) {
      uploadGalleryBtn.addEventListener('click', () => galleryFileInput.click());
      galleryFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (galleryFileChosenName) galleryFileChosenName.innerText = file.name;
          const reader = new FileReader();
          reader.onload = (evt) => {
            pendingGalleryPhotoSrc = evt.target.result;
            if (gPhotoPreview) {
              gPhotoPreview.src = pendingGalleryPhotoSrc;
              gPhotoPreview.style.display = 'block';
            }
            if (gPhotoUrlInput) gPhotoUrlInput.value = '';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (gPhotoUrlInput) {
      gPhotoUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
          pendingGalleryPhotoSrc = url;
          if (gPhotoPreview) {
            gPhotoPreview.src = url;
            gPhotoPreview.style.display = 'block';
          }
          if (galleryFileChosenName) galleryFileChosenName.innerText = 'ওয়েব লিংক ব্যবহার করা হচ্ছে';
        }
      });
    }

    if (addNewGalleryBtn && newGalleryBox) {
      addNewGalleryBtn.addEventListener('click', () => {
        newGalleryBox.style.display = 'block';
        if (gPhotoUrlInput) gPhotoUrlInput.value = '';
        document.getElementById('gPhotoCaption').value = '';
        pendingGalleryPhotoSrc = '';
        if (gPhotoPreview) gPhotoPreview.style.display = 'none';
        if (galleryFileChosenName) galleryFileChosenName.innerText = 'কোনো ফাইল বেছে নেওয়া হয়নি';
        if (galleryFileInput) galleryFileInput.value = '';
      });
    }

    if (cancelGalleryBtn && newGalleryBox) {
      cancelGalleryBtn.addEventListener('click', () => {
        newGalleryBox.style.display = 'none';
      });
    }

    if (saveGalleryBtn) {
      saveGalleryBtn.addEventListener('click', () => {
        const caption = document.getElementById('gPhotoCaption').value.trim();
        const url = pendingGalleryPhotoSrc || (gPhotoUrlInput ? gPhotoUrlInput.value.trim() : '');
        
        if (!url) {
          alert('অনুগ্রহ করে মোবাইল থেকে ছবি সিলেক্ট করুন অথবা ছবির ওয়েব লিংক দিন');
          return;
        }

        siteData.gallery.push({
          id: 'g_' + Date.now(),
          url,
          caption: caption || 'Cafe Photo'
        });

        newGalleryBox.style.display = 'none';
        renderGalleryListInEditor();
        saveSiteData();
        alert('ছবি সফলভাবে গ্যালারিতে যোগ করা হয়েছে!');
      });
    }

    // FAQ Box handlers
    const addNewFaqBtn = document.getElementById('addNewFaqBtn');
    const newFaqBox = document.getElementById('newFaqBox');
    const cancelFaqBtn = document.getElementById('cancelFaqBtn');
    const saveFaqBtn = document.getElementById('saveFaqBtn');

    if (addNewFaqBtn && newFaqBox) {
      addNewFaqBtn.addEventListener('click', () => {
        newFaqBox.style.display = 'block';
        document.getElementById('editFaqId').value = '';
        document.getElementById('faqQInput').value = '';
        document.getElementById('faqAInput').value = '';
      });
    }

    if (cancelFaqBtn && newFaqBox) {
      cancelFaqBtn.addEventListener('click', () => {
        newFaqBox.style.display = 'none';
      });
    }

    if (saveFaqBtn) {
      saveFaqBtn.addEventListener('click', () => {
        const id = document.getElementById('editFaqId').value;
        const q = document.getElementById('faqQInput').value.trim();
        const a = document.getElementById('faqAInput').value.trim();

        if (!q || !a) {
          alert('অনুগ্রহ করে প্রশ্ন এবং উত্তর উভয় ফিল্ড পূরণ করুন');
          return;
        }

        if (id) {
          const idx = siteData.faqs.findIndex(f => f.id === id);
          if (idx !== -1) siteData.faqs[idx] = { id, q, a };
        } else {
          siteData.faqs.push({ id: 'f_' + Date.now(), q, a });
        }

        newFaqBox.style.display = 'none';
        renderFaqListInEditor();
        saveSiteData();
      });
    }

    // Save All Master Changes Button
    const saveAllMasterBtn = document.getElementById('saveAllMasterChangesBtn');
    if (saveAllMasterBtn) {
      saveAllMasterBtn.addEventListener('click', () => {
        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

        // General
        siteData.general.shopName = getVal('cfgShopName') || siteData.general.shopName;
        siteData.general.ownerName = getVal('cfgOwnerName') || siteData.general.ownerName;
        siteData.general.ownerDistrict = getVal('cfgOwnerDistrict') || siteData.general.ownerDistrict;
        siteData.general.hotline = getVal('cfgHotline') || siteData.general.hotline;
        siteData.general.email = getVal('cfgEmail') || siteData.general.email;
        siteData.general.promoCode = getVal('cfgPromoCode') || siteData.general.promoCode;
        siteData.general.address = getVal('cfgAddress') || siteData.general.address;
        siteData.general.bannerText = getVal('cfgBannerText') || siteData.general.bannerText;

        // Hero
        siteData.hero.title = getVal('cfgHeroTitle') || siteData.hero.title;
        siteData.hero.subtitle = getVal('cfgHeroSubtitle') || siteData.hero.subtitle;
        siteData.hero.btn1Text = getVal('cfgHeroBtn1Text') || siteData.hero.btn1Text;
        siteData.hero.btn1Link = getVal('cfgHeroBtn1Link') || siteData.hero.btn1Link;
        siteData.hero.btn2Text = getVal('cfgHeroBtn2Text') || siteData.hero.btn2Text;
        siteData.hero.btn2Link = getVal('cfgHeroBtn2Link') || siteData.hero.btn2Link;

        // Story
        siteData.story.title = getVal('cfgStoryTitle') || siteData.story.title;
        siteData.story.p1 = getVal('cfgStoryP1') || siteData.story.p1;
        siteData.story.p2 = getVal('cfgStoryP2') || siteData.story.p2;
        siteData.story.quote = getVal('cfgFounderQuote') || siteData.story.quote;
        siteData.story.baristaCount = getVal('cfgBaristaCount') || siteData.story.baristaCount;
        siteData.story.bakerCount = getVal('cfgBakerCount') || siteData.story.bakerCount;
        siteData.story.hospitalityCount = getVal('cfgHospitalityCount') || siteData.story.hospitalityCount;
        siteData.story.totalStaff = getVal('cfgTotalStaff') || siteData.story.totalStaff;

        // Contact & Hours
        siteData.contact.hoursMonFri = getVal('cfgHoursMonFri') || siteData.contact.hoursMonFri;
        siteData.contact.hoursSatSun = getVal('cfgHoursSatSun') || siteData.contact.hoursSatSun;

        // Student Zone
        if (!siteData.student) siteData.student = {};
        siteData.student.discountPercent = parseInt(getVal('cfgStudentDiscount')) || 25;
        siteData.student.promoCode = getVal('cfgStudentPromoCode') || 'STUDENT25';
        siteData.student.title = getVal('cfgStudentTitle') || siteData.student.title;
        siteData.student.subtitle = getVal('cfgStudentSubtitle') || siteData.student.subtitle;
        siteData.student.perkWifi = getVal('cfgStudentPerkWifi') || siteData.student.perkWifi;
        siteData.student.perkPrint = getVal('cfgStudentPerkPrint') || siteData.student.perkPrint;

        saveSiteData();
        window.closeSiteEditor();

        showCustomModal({
          icon: '✅',
          title: 'ওয়েবসাইট সফলভাবে আপডেট হয়েছে!',
          body: '<p>আপনার সমস্ত কাস্টমাইজেশন ও পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে এবং লাইভ ওয়েবসাইটে দৃশ্যমান হচ্ছে।</p>'
        });
      });
    }

    // Reset All to Original Defaults
    const resetAllBtn = document.getElementById('resetAllSiteDataBtn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        if (confirm('আপনি কি নিশ্চিত যে পুরো ওয়েবসাইটের সমস্ত তথ্য মূল ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
          localStorage.removeItem('lcs_site_custom_content');
          localStorage.removeItem('lcs_team_leads');
          localStorage.removeItem('lcs_owner_custom_photo');
          siteData = JSON.parse(JSON.stringify(defaultSiteData));
          saveSiteData();
          populateEditorForm();
          window.closeSiteEditor();

          showCustomModal({
            icon: '🔄',
            title: 'ওয়েবসাইট রিস্টোর সম্পন্ন',
            body: '<p>ওয়েবসাইটের সমস্ত ডাটা মূল অফিশিয়াল ডিফল্ট অবস্থায় সফলভাবে ফিরিয়ে আনা হয়েছে।</p>'
          });
        }
      });
    }

    // Export Backup JSON
    const exportBtn = document.getElementById('exportBackupBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `local_coffee_shop_backup_${Date.now()}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      });
    }

    // Import Backup JSON
    const importBtn = document.getElementById('importBackupBtn');
    const importInput = document.getElementById('importFileInput');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.general) {
              siteData = parsed;
              saveSiteData();
              populateEditorForm();
              showCustomModal({
                icon: '📥',
                title: 'ব্যাকআপ সফলভাবে লোড হয়েছে!',
                body: '<p>আপনার সংরক্ষিত JSON ব্যাকআপ থেকে সমস্ত কন্টেন্ট রিস্টোর করা হয়েছে।</p>'
              });
            } else {
              alert('অকার্যকর ব্যাকআপ ফাইল ফরম্যাট');
            }
          } catch (err) {
            alert('ফাইল পড়তে ত্রুটি হয়েছে: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // Initialize Customizer
  injectMasterEditorUI();
  applySiteDataToDOM();
});



// Admin Mode & Direct Master Customizer (Unlocked for owner)
window.openSiteEditor = function(tabName = 'tabGeneral') {
  if (typeof populateEditorForm === 'function') {
    populateEditorForm();
  }
  const tabBtns = document.querySelectorAll('.editor-tab-btn');
  const tabPanes = document.querySelectorAll('.editor-tab-pane');
  tabBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });
  tabPanes.forEach(p => {
    p.classList.toggle('active', p.id === tabName);
  });
  const editorModalOverlay = document.getElementById('masterEditorModal');
  if (editorModalOverlay) {
    editorModalOverlay.classList.add('active');
  }
};

function handleAdminLogin() {
  window.openSiteEditor('tabGeneral');
}

function toggleAdminMode() {
  window.openSiteEditor('tabGeneral');
}

document.addEventListener("DOMContentLoaded", function () {
  const adminBtn = document.getElementById("admin-login-btn");
  if (adminBtn) {
    adminBtn.onclick = handleAdminLogin;
  }
});

    window.downloadReceiptPDF = function(orderId, encodedItems, totalAmount) {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library loading... please try again.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Local Coffee Shop - Order & Payment Receipt", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Order ID: #${orderId}`, 14, 30);
      doc.text(`Date & Time: ${new Date().toLocaleString()}`, 14, 38);
      doc.text("Owner: Merajul Islam (Brahmanbaria) | Hotline: 01339564967", 14, 46);
      doc.text("--------------------------------------------------------------------------------------------------------", 14, 52);

      doc.setFont("helvetica", "bold");
      doc.text("Items Summary:", 14, 60);

      doc.setFont("helvetica", "normal");
      const itemsText = decodeURIComponent(encodedItems).replace(/<br>/g, '\n');
      doc.text(itemsText, 14, 68, { maxWidth: 180 });

      let y = 125;
      doc.text("--------------------------------------------------------------------------------------------------------", 14, y);
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount Paid: $${totalAmount}`, 14, y);
      y += 10;
      doc.text("Payment Status: PAID ✅ (Instant Confirmation)", 14, y);

      y += 20;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Thank you for choosing Local Coffee Shop!", 14, y);

      doc.save(`Receipt-${orderId}.pdf`);
    };

    window.downloadCompleteMenuPDF = function() {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library loading... please try again.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Local Coffee Shop - Complete Menu & Summary PDF", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text("Owner: Merajul Islam (Brahmanbaria) | Hotline: 01339564967", 14, 35);
      doc.text("--------------------------------------------------------------------------------------------------------", 14, 42);

      let y = 50;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Menu Items:", 14, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      if (siteData && siteData.menuItems) {
        siteData.menuItems.forEach((item, idx) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`${idx + 1}. ${item.name} - $${item.price} [${item.category}]`, 14, y);
          y += 6;
        });
      }

      doc.save("LocalCoffeeShop-Complete-Menu.pdf");
    };

