/* app.js - plain JavaScript for the booth booking mini test */
(function(){
  const ROWS = ['A','B','C','D'];
  const COLS = 6;
  const preBooked = ['A2','B5','C3','D1']; // some pre-booked booths

  const booths = [];

  // build data (simple deterministic pricing)
  for (let r=0;r<ROWS.length;r++){
    for (let c=1;c<=COLS;c++){
      const id = `${ROWS[r]}${c}`;
      const price = 50 + (r*5) + (c*3); 
      booths.push({ id, price, booked: preBooked.includes(id), selected:false });
    }
  }

  // DOM refs
  const floorEl = document.getElementById('floor');
  const cartItemsEl = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  const clearCartBtn = document.getElementById('clear-cart');

  let cart = [];

  function renderFloor(){
    floorEl.innerHTML = '';
    floorEl.style.gridTemplateColumns = `repeat(${COLS}, minmax(80px, 1fr))`;

    booths.forEach(b => {
      const art = document.createElement('article');
      art.className = 'booth';
      art.setAttribute('data-id', b.id);
      art.setAttribute('role', 'listitem');
      art.setAttribute('aria-label', `${b.id} booth, ${b.booked ? 'booked' : 'available'}`);

      if (b.booked) art.classList.add('booked');
      if (b.selected) art.classList.add('selected');

      const label = document.createElement('div');
      label.className = 'booth-label';
      label.textContent = b.id;

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = `${b.price} KWD`;

      const btn = document.createElement('button');
      btn.className = 'add-btn';
      btn.type = 'button';
      btn.textContent = 'Add Booth';
      btn.setAttribute('aria-label', `Add booth ${b.id} for ${b.price} KWD`);
      btn.disabled = b.booked;

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

      art.addEventListener('click', function(){
        if (!b.booked) btn.focus();
      });
    });
  }

  function addToCart(id){
    const booth = booths.find(x => x.id === id);
    if (!booth) return;
    if (booth.booked){
      notify('This booth is already booked.');
      return;
    }
    if (cart.some(x => x.id === id)){
      notify('Booth is already in cart.');
      return;
    }
    cart.push({ id: booth.id, price: booth.price });
    booth.selected = true;
    updateUIAfterSelection(booth.id, true);
    updateCart();
  }

  function removeFromCart(id){
    cart = cart.filter(x => x.id !== id);
    const booth = booths.find(x => x.id === id);
    if (booth) {
      booth.selected = false;
      updateUIAfterSelection(id, false);
    }
    updateCart();
  }

  function updateUIAfterSelection(id, selected){
    const art = floorEl.querySelector(`.booth[data-id="${id}"]`);
    if (!art) return;
    if (selected) art.classList.add('selected');
    else art.classList.remove('selected');
  }

  function updateCart(){
    cartItemsEl.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.textContent = `${item.id} — ${item.price} KWD`;

      const rem = document.createElement('button');
      rem.className = 'remove-btn';
      rem.type = 'button';
      rem.textContent = 'Remove';
      rem.setAttribute('aria-label', `Remove ${item.id} from cart`);
      rem.addEventListener('click', function(){
        removeFromCart(item.id);
      });

      li.appendChild(rem);
      cartItemsEl.appendChild(li);
    });
    const newTotal = cart.reduce((s,i) => s + i.price, 0);
    animateTotal(parseFloat(totalPriceEl.textContent) || 0, newTotal);
  }

  function animateTotal(oldTotal, newTotal){
    const duration = 350;
    const start = performance.now();
    function step(now){
      const t = Math.min((now - start) / duration, 1);
      const val = Math.round(oldTotal + (newTotal - oldTotal) * t);
      totalPriceEl.textContent = val;
      if (t < 1) requestAnimationFrame(step);
      else {
        totalPriceEl.classList.add('pulse');
        setTimeout(()=> totalPriceEl.classList.remove('pulse'), 300);
      }
    }
    requestAnimationFrame(step);
  }

  function notify(msg){
    let notice = document.getElementById('notice');
    if (!notice){
      notice = document.createElement('div');
      notice.id = 'notice';
      notice.setAttribute('role', 'status');
      document.body.appendChild(notice);
    }
    notice.textContent = msg;
    notice.classList.add('show');
    setTimeout(()=> notice.classList.remove('show'), 1800);
  }

  clearCartBtn.addEventListener('click', function(){
    if (cart.length === 0) { notify('Cart is already empty.'); return; }
    cart = [];
    booths.forEach(b => b.selected = false);
    document.querySelectorAll('.booth.selected').forEach(el => el.classList.remove('selected'));
    updateCart();
  });

  document.addEventListener('DOMContentLoaded', function(){
    renderFloor();
    updateCart();
  });

})();
