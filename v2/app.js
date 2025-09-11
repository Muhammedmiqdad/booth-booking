/* app.js v2 — localStorage, keyboard nav, ARIA */
(function(){
  const ROWS = ['A','B','C','D'];
  const COLS = 6;
  const preBooked = ['A2','B5','C3','D1'];

  const booths = [];
  for (let r=0;r<ROWS.length;r++){
    for (let c=1;c<=COLS;c++){
      const id = `${ROWS[r]}${c}`;
      const price = 50 + (r*5) + (c*3);
      booths.push({ id, price, booked: preBooked.includes(id), selected:false });
    }
  }

  const floorEl = document.getElementById('floor');
  const cartItemsEl = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');
  const clearCartBtn = document.getElementById('clear-cart');
  const checkoutBtn = document.getElementById('checkout');
  const noticeEl = document.getElementById('notice');

  let cart = [];

  // Load/Save localStorage
  function loadCart(){
    const raw = localStorage.getItem('booth_booking_cart_v2');
    if (!raw) return;
    try {
      cart = JSON.parse(raw);
      cart.forEach(item => {
        const b = booths.find(x => x.id === item.id);
        if (b) b.selected = true;
      });
    } catch {}
  }
  function saveCart(){
    localStorage.setItem('booth_booking_cart_v2', JSON.stringify(cart));
  }

  // Render booths
  function renderFloor(){
    floorEl.innerHTML = '';
    booths.forEach((b, idx) => {
      const art = document.createElement('article');
      art.className = 'booth';
      art.setAttribute('data-id', b.id);
      art.setAttribute('data-index', idx);
      art.tabIndex = b.booked ? -1 : 0;
      art.setAttribute('aria-pressed', b.selected ? 'true':'false');

      if (b.booked) art.classList.add('booked');

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
      btn.textContent = b.selected ? 'Added':'Add Booth';
      btn.disabled = b.booked || b.selected;
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        addToCart(b.id);
      });

      overlay.append(price, btn);
      art.append(label, overlay);
      floorEl.appendChild(art);

      art.addEventListener('keydown', e=>{
        if (b.booked) return;
        if (e.key==='Enter' || e.key===' ') {
          e.preventDefault();
          addToCart(b.id);
        }
      });
    });
  }

  // Cart logic
  function addToCart(id){
    const booth = booths.find(x=>x.id===id);
    if (!booth || booth.booked) return;
    if (cart.some(x=>x.id===id)) return;
    booth.selected = true;
    cart.push({id:booth.id, price:booth.price});
    updateCart();
    saveCart();
  }
  function removeFromCart(id){
    cart = cart.filter(x=>x.id!==id);
    const booth = booths.find(x=>x.id===id);
    if (booth) booth.selected=false;
    updateCart();
    saveCart();
  }
  function updateCart(){
    cartItemsEl.innerHTML = '';
    cart.forEach(item=>{
      const li = document.createElement('li');
      li.className='cart-item';
      li.textContent=`${item.id} — ${item.price} KWD`;
      const rem=document.createElement('button');
      rem.className='remove-btn';
      rem.textContent='Remove';
      rem.onclick=()=>removeFromCart(item.id);
      li.appendChild(rem);
      cartItemsEl.appendChild(li);
    });
    const total = cart.reduce((s,i)=>s+i.price,0);
    totalPriceEl.textContent=total;
  }

  clearCartBtn.onclick=()=>{
    cart=[]; booths.forEach(b=>b.selected=false);
    updateCart(); saveCart();
  };
  checkoutBtn.onclick=()=>{
    if(cart.length){ alert('Checkout simulated!'); cart=[]; booths.forEach(b=>b.selected=false); updateCart(); saveCart();}
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    loadCart();
    renderFloor();
    updateCart();
  });
})();
