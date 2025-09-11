/* v2.1 app.js — polished UI/UX, localStorage, keyboard nav, ARIA, and conversion micro-interactions */
(function(){
  const ROWS = ['A','B','C','D'];
  const COLS = 6;
  const preBooked = ['A2','B5','C3','D1']; // same demo booked set

  const booths = [];
  for (let r=0;r<ROWS.length;r++){
    for (let c=1;c<=COLS;c++){
      const id = `${ROWS[r]}${c}`;
      const price = 50 + (r*5) + (c*3); // deterministic pricing
      booths.push({ id, price, booked: preBooked.includes(id), selected:false });
    }
  }

  // DOM refs
  const floorEl = document.getElementById('floor');
  const cartItemsEl = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  const clearCartBtn = document.getElementById('clear-cart');
  const checkoutBtn = document.getElementById('checkout');
  const noticeEl = document.getElementById('notice');
  const cartCountEl = document.getElementById('cart-count');
  const availableCountEl = document.getElementById('available-count');

  let cart = [];

  const fmt = (n) => Number(n).toFixed(3);

  // persistence
  function loadCart(){
    try {
      const raw = localStorage.getItem('booth_booking_cart_v2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      cart = parsed;
      cart.forEach(i => {
        const b = booths.find(x => x.id === i.id);
        if (b) b.selected = true;
      });
    } catch (e) {
      // ignore
    }
  }
  function saveCart(){
    try { localStorage.setItem('booth_booking_cart_v2', JSON.stringify(cart)); } catch(e){}
  }

  // availability
  function updateAvailableCount(){
    const totalAvailable = booths.filter(b => !b.booked).length;
    const currentlyAvailable = booths.filter(b => !b.booked && !cart.some(ci => ci.id === b.id)).length;
    if (availableCountEl) availableCountEl.textContent = `${currentlyAvailable} of ${totalAvailable} booths available`;
  }

  function showNotice(msg){
    if (!noticeEl) return;
    noticeEl.textContent = msg;
    noticeEl.hidden = false;
    noticeEl.classList.add('show');
    setTimeout(()=> {
      noticeEl.classList.remove('show');
      noticeEl.hidden = true;
      noticeEl.textContent = '';
    }, 1600);
  }

  // render floor (CSS handles grid columns)
  function renderFloor(){
    floorEl.innerHTML = '';
    booths.forEach((b, idx) => {
      const art = document.createElement('article');
      art.className = 'booth' + (b.booked ? ' booked' : '');
      art.setAttribute('data-id', b.id);
      art.setAttribute('data-index', idx);
      art.setAttribute('role', 'button');
      art.tabIndex = b.booked ? -1 : 0;
      art.setAttribute('aria-pressed', b.selected ? 'true' : 'false');
      art.setAttribute('aria-label', `${b.id} booth, ${b.booked ? 'booked' : 'available'}`);

      const label = document.createElement('div');
      label.className = 'booth-label';
      label.textContent = b.id;

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = `${fmt(b.price)} KWD`;

      const btn = document.createElement('button');
      btn.className = 'add-btn';
      btn.type = 'button';
      btn.textContent = b.selected ? 'Added' : 'Add Booth';
      btn.disabled = b.booked || b.selected;
      btn.setAttribute('aria-disabled', btn.disabled ? 'true' : 'false');

      btn.addEventListener('click', function(e){
        e.stopPropagation();
        addToCart(b.id);
      });

      overlay.appendChild(price);
      overlay.appendChild(btn);

      if (b.booked){
        const badge = document.createElement('div');
        badge.className = 'booked-badge';
        badge.textContent = 'Booked';
        art.appendChild(badge);
      }

      art.appendChild(label);
      art.appendChild(overlay);
      floorEl.appendChild(art);

      // focus and keyboard
      art.addEventListener('click', function(){
        if (!b.booked) art.focus();
      });
      art.addEventListener('keydown', function(e){
        if (b.booked) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addToCart(b.id);
        }
      });
    });

    enableArrowNavigation();
    updateAvailableCount();
  }

  // compute columns (used by arrow navigation)
  function currentColumns(){
    const style = window.getComputedStyle(floorEl);
    const cols = style.gridTemplateColumns;
    if (!cols) return COLS;
    return cols.split(' ').length;
  }

  // arrow navigation
  function enableArrowNavigation(){
    floorEl.addEventListener('keydown', function(e){
      const active = document.activeElement;
      if (!active || !active.classList.contains('booth')) return;
      const idx = parseInt(active.getAttribute('data-index'), 10);
      const cols = currentColumns();
      let target = null;
      if (e.key === 'ArrowRight') target = idx + 1;
      else if (e.key === 'ArrowLeft') target = idx - 1;
      else if (e.key === 'ArrowDown') target = idx + cols;
      else if (e.key === 'ArrowUp') target = idx - cols;

      if (target !== null) {
        e.preventDefault();
        const next = floorEl.querySelector(`.booth[data-index="${target}"]`);
        if (next && !next.classList.contains('booked')) next.focus();
      }
    }, true);
  }

  // cart operations
  function addToCart(id){
    const booth = booths.find(x => x.id === id);
    if (!booth) return;
    if (booth.booked){ showNotice('This booth is already booked.'); return; }
    if (cart.some(x => x.id === id)){ showNotice('Booth already in cart.'); return; }

    booth.selected = true;
    cart.push({ id: booth.id, price: booth.price });
    updateUIAfterSelection(booth.id, true);
    updateCart();
    saveCart();
    pulseAdded(booth.id);
    showNotice(`${booth.id} added`);
  }

  function removeFromCart(id){
    cart = cart.filter(x => x.id !== id);
    const booth = booths.find(x => x.id === id);
    if (booth) {
      booth.selected = false;
      updateUIAfterSelection(id, false);
    }
    updateCart();
    saveCart();
    showNotice(`${id} removed`);
  }

  function updateUIAfterSelection(id, selected){
    const art = floorEl.querySelector(`.booth[data-id="${id}"]`);
    if (!art) return;
    art.setAttribute('aria-pressed', selected ? 'true' : 'false');
    const btn = art.querySelector('.add-btn');
    if (btn) {
      btn.disabled = selected;
      btn.setAttribute('aria-disabled', selected ? 'true' : 'false');
      btn.textContent = selected ? 'Added' : 'Add Booth';
    }
  }

  function updateCart(){
    cartItemsEl.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item slide-in';
      li.setAttribute('role','listitem');

      const left = document.createElement('div');
      left.textContent = item.id;
      left.style.fontWeight = '800';

      const right = document.createElement('div');
      right.textContent = `${fmt(item.price)} KWD`;

      const rem = document.createElement('button');
      rem.className = 'remove-btn';
      rem.textContent = 'Remove';
      rem.onclick = () => removeFromCart(item.id);

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '12px';
      wrapper.appendChild(right);
      wrapper.appendChild(rem);

      li.appendChild(left);
      li.appendChild(wrapper);

      cartItemsEl.appendChild(li);
    });

    const total = cart.reduce((s,i) => s + i.price, 0);
    animateTotal(parseFloat(totalPriceEl.textContent) || 0, total);

    const enabled = cart.length > 0;
    checkoutBtn.disabled = !enabled;
    checkoutBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    clearCartBtn.style.display = enabled ? 'inline-block' : 'none';
    cartCountEl.textContent = `Cart: ${cart.length}`;
    updateAvailableCount();
  }

  // total animation with flash
  function animateTotal(oldTotal, newTotal){
    const duration = 320;
    const start = performance.now();
    function step(now){
      const t = Math.min((now - start) / duration, 1);
      const val = oldTotal + (newTotal - oldTotal) * t;
      totalPriceEl.textContent = Number(val).toFixed(3);
      if (t < 1) requestAnimationFrame(step);
      else {
        const parent = totalPriceEl.closest('.cart-total') || totalPriceEl.parentElement;
        if (parent) {
          parent.classList.add('total-flash');
          setTimeout(()=> parent.classList.remove('total-flash'), 320);
        }
      }
    }
    requestAnimationFrame(step);
  }

  // visual pulse on booth when added
  function pulseAdded(id){
    const el = floorEl.querySelector(`.booth[data-id="${id}"]`);
    if (!el) return;
    el.classList.add('added');
    setTimeout(()=> el.classList.remove('added'), 420);
  }

  // clear & checkout
  clearCartBtn.addEventListener('click', ()=> {
    if (cart.length === 0) { showNotice('Cart already empty'); return; }
    cart = [];
    booths.forEach(b => b.selected = false);
    document.querySelectorAll('.booth[aria-pressed="true"]').forEach(el => el.setAttribute('aria-pressed','false'));
    updateCart();
    saveCart();
    showNotice('Cart cleared');
  });

  checkoutBtn.addEventListener('click', ()=> {
    if (cart.length === 0) { showNotice('No items to checkout'); return; }
    // placeholder behaviour: simulate checkout
    showNotice('Checkout simulated — thank you.');
    cart = [];
    booths.forEach(b => b.selected = false);
    updateCart();
    saveCart();
  });

  // init
  document.addEventListener('DOMContentLoaded', ()=> {
    loadCart();
    renderFloor();
    updateCart();
  });

})();
