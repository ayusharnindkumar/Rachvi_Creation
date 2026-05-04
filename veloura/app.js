// ============ PRODUCT DATA ============
const PRODUCTS = [
  { id:1, name:'Rose Elysium', category:'floral', price:1299, originalPrice:1599, img:'https://images.unsplash.com/photo-1612198273689-5e22faefed56?w=600&q=80', badge:'Best Seller', desc:'Velvety rose petals with a hint of oud. A timeless floral elegance.', notes:['Rose','Oud','Musk'], burnTime:'45 hrs', wax:'Soy', rating:4.9, reviews:128 },
  { id:2, name:'Sandalwood Noir', category:'woody', price:1499, originalPrice:null, img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80', badge:'New', desc:'Dark sandalwood with smoky cedarwood. For those who prefer depth.', notes:['Sandalwood','Cedar','Smoke'], burnTime:'50 hrs', wax:'Soy', rating:4.8, reviews:94 },
  { id:3, name:'Golden Bergamot', category:'citrus', price:1199, originalPrice:1399, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', badge:'Sale', desc:'Sun-kissed bergamot with lemon zest. A joyful morning ritual.', notes:['Bergamot','Lemon','Green Tea'], burnTime:'40 hrs', wax:'Coconut', rating:4.7, reviews:76 },
  { id:4, name:'Midnight Spice', category:'festive', price:1699, originalPrice:null, img:'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600&q=80', badge:'Limited', desc:'Cinnamon, clove and warm amber. Perfect for festive evenings.', notes:['Cinnamon','Clove','Amber'], burnTime:'50 hrs', wax:'Soy', rating:5.0, reviews:211 },
  { id:5, name:'Lavender Dusk', category:'floral', price:1099, originalPrice:null, img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80', badge:null, desc:'Soft lavender with chamomile and vanilla. Your bedtime companion.', notes:['Lavender','Chamomile','Vanilla'], burnTime:'45 hrs', wax:'Soy', rating:4.9, reviews:183 },
  { id:6, name:'Amber Oud', category:'woody', price:1899, originalPrice:2199, img:'https://images.unsplash.com/photo-1574259392081-cbf174cb4416?w=600&q=80', badge:'Luxury', desc:'Rich amber resin with royal oud. A statement of opulence.', notes:['Amber','Oud','Vanilla'], burnTime:'55 hrs', wax:'Soy', rating:4.8, reviews:67 },
  { id:7, name:'Sicilian Lemon', category:'citrus', price:999, originalPrice:null, img:'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80', badge:null, desc:'Zesty lemon groves with a touch of white tea freshness.', notes:['Lemon','White Tea','Mint'], burnTime:'38 hrs', wax:'Coconut', rating:4.6, reviews:52 },
  { id:8, name:'Winter Ember', category:'festive', price:1599, originalPrice:null, img:'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80', badge:'New', desc:'Warm fireside blend of pine, cinnamon and cozy vanilla smoke.', notes:['Pine','Cinnamon','Vanilla'], burnTime:'48 hrs', wax:'Soy', rating:4.9, reviews:88 },
];

// ============ CART STATE ============
let cart = JSON.parse(localStorage.getItem('veloura_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('veloura_wish') || '[]');

function saveCart(){ localStorage.setItem('veloura_cart', JSON.stringify(cart)); updateBadge(); }
function saveWish(){ localStorage.setItem('veloura_wish', JSON.stringify(wishlist)); }

function addToCart(id, qty=1){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += qty;
  else cart.push({...p, qty});
  saveCart();
  showToast(`✦ ${p.name} added to cart`);
}

function removeFromCart(id){ cart = cart.filter(x=>x.id!==id); saveCart(); }

function updateQty(id, delta){
  const item = cart.find(x=>x.id===id);
  if(item){ item.qty = Math.max(1, item.qty+delta); saveCart(); }
}

function toggleWishlist(id){
  if(wishlist.includes(id)) wishlist = wishlist.filter(x=>x!==id);
  else wishlist.push(id);
  saveWish();
}

function updateBadge(){
  const b = document.getElementById('cartBadge');
  if(b) b.textContent = cart.reduce((s,i)=>s+i.qty,0);
}

// ============ TOAST ============
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

// ============ NAVBAR ============
window.addEventListener('scroll',()=>{
  const nav = document.getElementById('navbar');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

function toggleMenu(){
  document.getElementById('navLinks')?.classList.toggle('open');
}

function toggleSearch(){
  const s = document.getElementById('searchBar');
  if(!s) return;
  s.classList.toggle('active');
  if(s.classList.contains('active')) document.getElementById('searchInput')?.focus();
}

function handleSearch(){
  const q = document.getElementById('searchInput')?.value.toLowerCase();
  if(!q){ return; }
  const matches = PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||p.category.includes(q));
  if(matches.length && q.length>2){
    window.location.href=`shop.html?search=${encodeURIComponent(q)}`;
  }
}

// ============ HERO SLIDESHOW ============
let slideIdx = 0;
function goToSlide(n){
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  if(!slides.length) return;
  slides[slideIdx].classList.remove('active');
  dots[slideIdx]?.classList.remove('active');
  slideIdx = n % slides.length;
  slides[slideIdx].classList.add('active');
  dots[slideIdx]?.classList.add('active');
}
setInterval(()=>goToSlide(slideIdx+1), 5000);

// ============ RENDER HOME PRODUCTS ============
function renderHomeProducts(){
  const grid = document.getElementById('homeProdGrid');
  if(!grid) return;
  const best = PRODUCTS.filter(p=>p.badge==='Best Seller'||p.badge==='Limited'||p.badge==='Luxury'||p.rating>=4.8).slice(0,4);
  grid.innerHTML = best.map(p=>productCardHTML(p,'dark')).join('');
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{ e.stopPropagation(); addToCart(+btn.dataset.id); });
  });
  grid.querySelectorAll('.wishlist-btn').forEach(btn=>{
    if(wishlist.includes(+btn.dataset.id)) btn.classList.add('active');
    btn.addEventListener('click',e=>{ e.stopPropagation(); toggleWishlist(+btn.dataset.id); btn.classList.toggle('active'); });
  });
}

function productCardHTML(p, theme='light'){
  const nameColor = theme==='dark'?'style="color:#fff"':'';
  return `<div class="product-card" onclick="window.location='product.html?id=${p.id}'">
    <div class="product-img-wrap">
      <img src="${p.img}" alt="${p.name}" loading="lazy"/>
      ${p.badge?`<span class="product-badge">${p.badge}</span>`:''}
      <button class="wishlist-btn" data-id="${p.id}" title="Wishlist">♡</button>
    </div>
    <div class="product-info">
      <p class="product-category">${p.category}</p>
      <h3 class="product-name" ${nameColor}>${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <div class="product-footer">
        <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
        <button class="add-btn" data-id="${p.id}">+ Add</button>
      </div>
    </div>
  </div>`;
}

// ============ SHOP PAGE ============
function initShop(){
  const grid = document.getElementById('shopGrid');
  if(!grid) return;
  const params = new URLSearchParams(location.search);
  let filtered = [...PRODUCTS];
  const catParam = params.get('cat');
  const searchParam = params.get('search');
  if(catParam) filtered = filtered.filter(p=>p.category===catParam);
  if(searchParam) filtered = filtered.filter(p=>p.name.toLowerCase().includes(searchParam)||p.desc.toLowerCase().includes(searchParam));

  // Set active filter checkboxes
  if(catParam) document.querySelectorAll(`input[value="${catParam}"]`).forEach(el=>el.checked=true);

  renderShopGrid(filtered);
  updateCount(filtered.length);

  // Filter checkboxes
  document.querySelectorAll('.cat-filter').forEach(cb=>{
    cb.addEventListener('change',()=>applyFilters());
  });
  document.getElementById('sortSelect')?.addEventListener('change',()=>applyFilters());
  document.getElementById('priceRange')?.addEventListener('input',function(){
    document.getElementById('priceVal').textContent='₹'+Number(this.value).toLocaleString('en-IN');
    applyFilters();
  });
}

function applyFilters(){
  const checked = [...document.querySelectorAll('.cat-filter:checked')].map(el=>el.value);
  const maxPrice = +document.getElementById('priceRange')?.value||9999;
  const sort = document.getElementById('sortSelect')?.value||'default';
  let filtered = PRODUCTS.filter(p=>{
    const catOk = !checked.length||checked.includes(p.category);
    const priceOk = p.price<=maxPrice;
    return catOk&&priceOk;
  });
  if(sort==='low') filtered.sort((a,b)=>a.price-b.price);
  else if(sort==='high') filtered.sort((a,b)=>b.price-a.price);
  else if(sort==='rating') filtered.sort((a,b)=>b.rating-a.rating);
  renderShopGrid(filtered);
  updateCount(filtered.length);
}

function renderShopGrid(products){
  const grid = document.getElementById('shopGrid');
  if(!grid) return;
  grid.innerHTML = products.length
    ? products.map(p=>productCardHTML(p,'light')).join('')
    : '<p style="color:#888;padding:3rem;grid-column:1/-1;text-align:center">No candles found. Try different filters.</p>';
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{e.stopPropagation();addToCart(+btn.dataset.id);});
  });
  grid.querySelectorAll('.wishlist-btn').forEach(btn=>{
    if(wishlist.includes(+btn.dataset.id)) btn.classList.add('active');
    btn.addEventListener('click',e=>{e.stopPropagation();toggleWishlist(+btn.dataset.id);btn.classList.toggle('active');});
  });
}

function updateCount(n){ const el=document.getElementById('resultCount'); if(el) el.textContent=n+' Products'; }

// ============ PRODUCT PAGE ============
function initProduct(){
  const wrap = document.getElementById('productDetail');
  if(!wrap) return;
  const id = +new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  document.title = p.name+' — Veloura Candles';

  // Gallery
  document.getElementById('mainImg').src = p.img;
  const thumbs = [p.img, ...PRODUCTS.filter(x=>x.id!==id).slice(0,3).map(x=>x.img)];
  document.getElementById('thumbs').innerHTML = thumbs.map((src,i)=>
    `<img src="${src}?w=200" class="${i===0?'active':''}" onclick="swapImg('${src}',this)" />`).join('');

  // Info
  document.getElementById('pdName').textContent = p.name;
  document.getElementById('pdCategory').textContent = p.category;
  document.getElementById('pdPrice').textContent = '₹'+p.price.toLocaleString('en-IN');
  document.getElementById('pdDesc').textContent = p.desc;
  document.getElementById('pdRating').innerHTML = '★'.repeat(Math.round(p.rating))+'☆'.repeat(5-Math.round(p.rating));
  document.getElementById('pdReviews').textContent = `(${p.reviews} reviews)`;
  document.getElementById('pdNotes').innerHTML = p.notes.map(n=>`<span class="note-tag">${n}</span>`).join('');
  document.getElementById('pdMeta').innerHTML = `<span>Burn Time: <strong>${p.burnTime}</strong></span><span>Wax: <strong>${p.wax} Wax</strong></span><span>Weight: <strong>200g</strong></span>`;

  // Qty & Add
  let qty=1;
  document.getElementById('qtyMinus').onclick=()=>{ if(qty>1){qty--;document.getElementById('qtyVal').textContent=qty;} };
  document.getElementById('qtyPlus').onclick=()=>{ qty++;document.getElementById('qtyVal').textContent=qty; };
  document.getElementById('addCartBtn').onclick=()=>addToCart(p.id,qty);
  document.getElementById('buyNowBtn').onclick=()=>{ addToCart(p.id,qty); window.location='cart.html'; };

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn,.tab-content').forEach(el=>el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Related
  const related = PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4);
  const rg = document.getElementById('relatedGrid');
  if(rg){ rg.innerHTML=related.map(x=>productCardHTML(x,'light')).join(''); }
}

function swapImg(src,el){
  document.getElementById('mainImg').src=src;
  document.querySelectorAll('#thumbs img').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
}

// ============ CART PAGE ============
function initCart(){
  const wrap=document.getElementById('cartItems');
  if(!wrap) return;
  renderCart();
}

function renderCart(){
  const wrap=document.getElementById('cartItems');
  const summary=document.getElementById('cartSummary');
  if(!wrap) return;
  if(!cart.length){
    wrap.innerHTML='<div class="empty-cart"><h2>Your cart is empty</h2><p>Discover our luxury candle collections.</p><a href="shop.html" class="btn-gold" style="display:inline-flex;margin-top:1.5rem">Shop Now</a></div>';
    if(summary) summary.style.display='none';
    return;
  }
  if(summary) summary.style.display='block';
  wrap.innerHTML = cart.map(item=>`
    <div class="cart-item" id="ci${item.id}">
      <img src="${item.img}?w=200" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p style="color:#C9A84C;font-size:.7rem;letter-spacing:1px;text-transform:uppercase;margin:.3rem 0">${item.category}</p>
        <p>₹${item.price.toLocaleString('en-IN')}</p>
        <div class="qty-selector" style="margin-top:.7rem">
          <button onclick="changeQty(${item.id},-1)">−</button>
          <span id="qty${item.id}">${item.qty}</span>
          <button onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.5rem">
        <span class="cart-item-price">₹${(item.price*item.qty).toLocaleString('en-IN')}</span>
        <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
      </div>
    </div>`).join('');
  updateSummary();
}

function changeQty(id,delta){ updateQty(id,delta); document.getElementById('qty'+id).textContent=cart.find(x=>x.id===id)?.qty||0; updateSummary(); }
function removeItem(id){ removeFromCart(id); document.getElementById('ci'+id)?.remove(); updateSummary(); if(!cart.length) renderCart(); }

function updateSummary(){
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const ship=sub>=999?0:99;
  const el=document.getElementById;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('subtotal','₹'+sub.toLocaleString('en-IN'));
  set('shipping',ship===0?'FREE':'₹'+ship);
  set('total','₹'+(sub+ship).toLocaleString('en-IN'));
  set('cartBadge',cart.reduce((s,i)=>s+i.qty,0));
}

function subscribeNewsletter(e){
  e.preventDefault();
  showToast('✦ Welcome to the Veloura Circle!');
  e.target.reset();
}

// ============ REVEAL ANIMATIONS ============
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// ============ INIT ============
document.addEventListener('DOMContentLoaded',()=>{
  updateBadge();
  renderHomeProducts();
  initShop();
  initProduct();
  initCart();
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
});
