/* =========================================
   0. 🔴 UI HOTFIX INJECTIONS (v5 - Sidebar & Toast Fix)
   ========================================= */
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
    /* 1. 🛑 REMOVED GLOBAL OVERFLOW TO RESTORE STICKY SIDEBAR */
    html, body {
        width: 100% !important;
        max-width: 100vw !important;
        margin: 0; padding: 0;
        box-sizing: border-box;
    }
    *, *::before, *::after { box-sizing: inherit; }

    /* 2. 🛠️ ADMIN SIDEBAR FULL-HEIGHT FIX */
    .sidebar {
        height: 100vh !important;
        position: -webkit-sticky !important;
        position: sticky !important;
        top: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow-y: auto !important;
    }
    /* Push logout button to the absolute bottom */
    .sidebar [onclick*="logout"], .sidebar .logout-btn {
        margin-top: auto !important;
        margin-bottom: 20px !important;
    }

    /* 3. 🔔 TOAST/POPUP REPOSITIONING (BOTTOM RIGHT) */
    #toast-container {
        position: fixed !important;
        top: auto !important; /* Removes default top position */
        bottom: 30px !important; /* Moves to bottom */
        right: 30px !important;
        display: flex !important;
        flex-direction: column-reverse !important; /* Stacks new messages nicely */
        z-index: 9999 !important;
        align-items: flex-end !important;
    }
    .toast {
        margin-top: 10px !important;
        margin-bottom: 0 !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
    }

    #modalImg { width: 100% !important; height: 100% !important; min-height: 300px; object-fit: cover !important; border-radius: 12px; background: #f1f5f9 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="6" fill="%2394a3b8">Fetching...</text></svg>') center center no-repeat; transition: opacity 0.3s ease-in-out; }
    
    @keyframes popInUI { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes rotateSpinner { 100% { transform: rotate(360deg); } }
    @keyframes dashSpinner { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
    .success-checkmark { animation: scaleCheck 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes scaleCheck { 0% { transform: scale(0); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

    /* =========================================
       📱 MOBILE RESPONSIVE ENGINE
       ========================================= */
    @media screen and (max-width: 850px) {
        /* Apply overflow hidden ONLY on mobile to prevent horizontal scroll without breaking desktop sticky */
        html, body { overflow-x: hidden !important; }

        /* Toast on mobile: Bottom Center for better thumb reach */
        #toast-container {
            bottom: 20px !important;
            right: 50% !important;
            transform: translateX(50%) !important;
            align-items: center !important;
            width: 90% !important;
        }
        .toast { width: 100% !important; text-align: center !important; justify-content: center !important; }

        /* Mobile Sidebar */
        .sidebar {
            height: auto !important;
            min-height: auto !important;
            position: relative !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 10px !important;
            z-index: 100 !important;
        }
        .sidebar [onclick*="logout"], .sidebar .logout-btn { margin-top: 10px !important; margin-bottom: 10px !important; width: 100% !important; }

        header { padding: 10px 5px !important; height: auto !important; }
        .navbar, .nav-container { display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; gap: 10px !important; padding: 0 !important; box-sizing: border-box !important; }
        .search-container { width: 96% !important; max-width: 100% !important; margin: 0 auto !important; box-sizing: border-box !important; }
        .nav-links, #authContainer { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; align-items: center !important; width: 100% !important; gap: 6px !important; box-sizing: border-box !important; }
        .nav-btn-styled, .navbar a, .navbar button { padding: 6px 12px !important; font-size: 0.85rem !important; margin: 0 !important; white-space: nowrap !important; border-radius: 6px !important; }

        #medicineGrid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; padding: 10px !important; width: 100% !important; box-sizing: border-box !important; }
        .med-card { margin: 0 !important; width: 100% !important; box-sizing: border-box !important; }
        .med-card-img { height: 140px !important; }
        .cart-container { display: flex !important; flex-direction: column !important; padding: 10px !important; margin: 20px auto !important; width: 100% !important; box-sizing: border-box !important; }
        #cartItemsContainer { width: 100% !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
        .data-table { min-width: 600px !important; }
        #cartSummary { width: 100% !important; margin-top: 20px !important; box-sizing: border-box !important; }
        .product-modal-box { width: 95% !important; padding: 20px !important; margin: 10px !important; }
    }

    @media screen and (max-width: 480px) {
        #medicineGrid { grid-template-columns: 1fr !important; } 
    }
`;
document.head.appendChild(globalStyles);
/* =========================================
   1. ⚡ ULTRA-OPTIMIZED CACHE DATABASE LAYER 
   ========================================= */
const API_URL = 'https://medishop-e-pharmacy.onrender.com/api/data';

function parseMongooseData(raw) {
    if (!raw) return []; if (Array.isArray(raw)) return raw;
    if (raw.data && Array.isArray(raw.data)) return raw.data;
    if (typeof raw === 'object') return Object.values(raw).filter(item => item && typeof item === 'object');
    return [];
}

const DB = {
    cache: { medicines: null, users: null, orders: null, sales: null, carts: null },
    
    async fetchWithCache(url, force) {
        try {
            const cache = await caches.open('medishop-cache'); const req = new Request(url);
            if (!force) { const cachedRes = await cache.match(req); if (cachedRes) { fetch(req).then(res => { if(res.ok) cache.put(req, res); }).catch(e=>{}); return await cachedRes.json(); } }
            const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return await res.json();
        } catch(e) { const res = await fetch(url); return await res.json(); }
    },
    async invalidateCache(url) { try { const cache = await caches.open('medishop-cache'); await cache.delete(new Request(url)); } catch(e){} },

    async getMedicines(force = false) { if (this.cache.medicines && !force) return this.cache.medicines; try { const raw = await this.fetchWithCache(`${API_URL}/ms_medicines`, force); this.cache.medicines = parseMongooseData(raw).filter(m => m.name); return this.cache.medicines; } catch(e) { return null; } },
    async saveMedicines(data) { try { await fetch(`${API_URL}/ms_medicines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.medicines = data; globalMedicines = data; await this.invalidateCache(`${API_URL}/ms_medicines`); return { success: true }; } catch(e) { return { success: false }; } },
    async getUsers(force = false) { if (this.cache.users && !force) return this.cache.users; try { const raw = await this.fetchWithCache(`${API_URL}/ms_users`, force); this.cache.users = parseMongooseData(raw); return this.cache.users; } catch(e) { return []; } },
    async saveUsers(data) { try { await fetch(`${API_URL}/ms_users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.users = data; await this.invalidateCache(`${API_URL}/ms_users`); return { success: true }; } catch(e) { return { success: false }; } },
    async getOrders(force = false) { if (this.cache.orders && !force) return this.cache.orders; try { const raw = await this.fetchWithCache(`${API_URL}/ms_orders`, force); this.cache.orders = parseMongooseData(raw); return this.cache.orders; } catch(e) { return []; } },
    async saveOrders(data) { try { const res = await fetch(`${API_URL}/ms_orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if(!res.ok) throw new Error("DB Full"); this.cache.orders = data; await this.invalidateCache(`${API_URL}/ms_orders`); return { success: true }; } catch(e) { return { success: false }; } },
    async getSales(force = false) { if (this.cache.sales && !force) return this.cache.sales; try { const raw = await this.fetchWithCache(`${API_URL}/ms_sales`, force); this.cache.sales = parseMongooseData(raw); return this.cache.sales; } catch(e) { return []; } },
    async saveSales(data) { try { await fetch(`${API_URL}/ms_sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.sales = data; await this.invalidateCache(`${API_URL}/ms_sales`); return { success: true }; } catch(e) { return { success: false }; } },
    async getCarts(force = false) { if (this.cache.carts && !force) return this.cache.carts; try { const res = await fetch(`${API_URL}/ms_user_carts`); this.cache.carts = await res.json(); return this.cache.carts; } catch(e) { return {}; } },
    async saveCarts(data) { try { await fetch(`${API_URL}/ms_user_carts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.carts = data; return { success: true }; } catch(e) { return { success: false }; } }
};

// 🛡️ DATABASE AUTO-ARCHIVER: Keeps the database insanely fast.
function optimizeOrdersDB(ordersArray) {
    if (!Array.isArray(ordersArray)) return ordersArray;
    if (ordersArray.length > 10) {
        for (let i = 0; i < ordersArray.length - 10; i++) {
            if (ordersArray[i].prescriptions && Array.isArray(ordersArray[i].prescriptions)) {
                ordersArray[i].prescriptions.forEach(rx => {
                    if (rx.data && rx.data.length > 100) rx.data = "archived";
                });
            }
        }
    }
    return ordersArray;
}

async function initializeData() {
    try {
        const [users, _] = await Promise.all([DB.getUsers(), localStorage.getItem('ms_cart')]);
        let adminExists = users.find(u => u && u.user === 'admin');
        if (!adminExists) { users.push({ user: 'admin', pass: 'admin123', role: 'admin', name: 'Administrator' }); await DB.saveUsers(users); }
        if (!localStorage.getItem('ms_cart')) localStorage.setItem('ms_cart', JSON.stringify([]));
    } catch(e) { console.error(e); }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container'); if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : (type === 'info' ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-exclamation-circle"></i>');
    toast.innerHTML = `${icon} <span>${message}</span>`; container.appendChild(toast);
    requestAnimationFrame(() => { setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000); });
}

/* =========================================
   4. AUTHENTICATION
   ========================================= */
function checkUserLoginState() {
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        if (user) { authContainer.innerHTML = `<a href="profile.html" class="nav-btn-styled" title="View My Orders" style="border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; padding: 8px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;"><i class="fas fa-user-circle"></i> Hi, ${user.name}</a><button onclick="logout()" class="nav-btn-styled btn-logout" style="border: 1px solid #ef4444; background: #ef4444; color: white; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-left: 10px;"><i class="fas fa-sign-out-alt"></i> Logout</button>`; } 
        else { authContainer.innerHTML = `<a href="login.html" class="nav-btn-styled" style="border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; padding: 8px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;"><i class="fas fa-sign-in-alt"></i> Login</a><a href="register.html" class="nav-btn-styled" style="border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; padding: 8px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; margin-left: 10px;"><i class="fas fa-user-plus"></i> Register</a>`; }
    }
}

async function authLogin() {
    const u = document.getElementById('username').value; const p = document.getElementById('password').value;
    const users = await DB.getUsers(); const validUser = users.find(user => user && user.user === u && user.pass === p);
    if (validUser) {
        localStorage.setItem('ms_currentUser', JSON.stringify(validUser));
        if (validUser.role === 'customer') {
            let carts = await DB.getCarts(); let userCart = carts[validUser.user] || []; let guestCart = JSON.parse(localStorage.getItem('ms_cart')) || [];
            guestCart.forEach(gItem => { const existing = userCart.find(uItem => uItem.id === gItem.id); if (existing) existing.qty += gItem.qty; else userCart.push(gItem); });
            localStorage.setItem('ms_cart', JSON.stringify(userCart)); carts[validUser.user] = userCart; DB.saveCarts(carts); 
        }
        showToast(`Welcome back, ${validUser.name}!`, 'success'); setTimeout(() => { window.location.href = validUser.role === 'admin' ? 'admin.html' : 'index.html'; }, 1000);
    } else showToast("Invalid Username or Password", 'error'); 
}

function logout() { localStorage.removeItem('ms_currentUser'); localStorage.setItem('ms_cart', JSON.stringify([])); window.location.href = 'index.html'; }
function checkAuth(role) { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if (!user || user.role !== role) window.location.href = 'login.html'; }
function validateFullNameInput(input) { input.value = input.value.replace(/[^a-zA-Z\s]/g, ''); }

async function registerUser() {
    const name = document.getElementById('regName').value.trim(); const email = document.getElementById('regEmail').value.trim(); const mobile = document.getElementById('regMobile').value.trim(); const user = document.getElementById('regUser').value.trim(); const pass = document.getElementById('regPass').value;
    if (/\d/.test(name)) return showToast("Numbers are not allowed in the Full Name field.", "error"); 
    const passCriteria = document.getElementById('passCriteriaList');
    if (passCriteria) { const unmetCriteria = passCriteria.querySelectorAll('li:not(.met)'); if (unmetCriteria.length > 0) return showToast("Please ensure your password meets all security criteria.", "error"); }
    showToast("Validating registration...", "info"); const users = await DB.getUsers();
    if(users.find(u => u && u.user === user)) return showToast("Username already exists.", "error"); 
    if(users.find(u => u && u.email === email)) return showToast("This email address is already registered.", "error"); 
    users.push({ user, pass, role: 'customer', name, email, mobile, address: '' }); await DB.saveUsers(users);
    showToast(`Welcome to MediShop, ${name}! Redirecting...`, 'success'); setTimeout(() => window.location.href = 'login.html', 1500);
}

function initLivePasswordChecks() {
    const passInput = document.getElementById('regPass'); const criteriaList = document.getElementById('passCriteriaList'); if (!passInput || !criteriaList) return;
    const rules = { length: { el: document.getElementById('rule-length'), regex: /.{8,}/ }, letter: { el: document.getElementById('rule-letter'), regex: /[A-Z]/ }, number: { el: document.getElementById('rule-number'), regex: /\d/ }, special: { el: document.getElementById('rule-special'), regex: /[@$!%*#?&]/ } };
    const iconPass = '<i class="fas fa-check-circle"></i>'; const iconBlank = '<i class="far fa-circle"></i>';      
    passInput.addEventListener('input', (e) => { const password = e.target.value; for (const key in rules) { const rule = rules[key]; if (rule.regex.test(password)) { rule.el.classList.add('met'); rule.el.querySelector('i').outerHTML = iconPass; } else { rule.el.classList.remove('met'); rule.el.querySelector('i').outerHTML = iconBlank; } } });
}

/* =========================================
   5. STORE RENDERING & FOOLPROOF RX BADGE
   ========================================= */
let globalMedicines = []; 

async function renderStore() { 
    const grid = document.getElementById('medicineGrid'); if(!grid) return;
   grid.innerHTML = "<div style='text-align:center; width:100%; grid-column: 1 / -1; padding: 60px 0;'><i class='fas fa-spinner fa-spin' style='font-size: 3rem; color: #0f766e;'></i><p style='color:#64748b; font-size:1.2rem; margin-top:15px;'>Fetching medicines, please wait...</p></div>";
    try { globalMedicines = await DB.getMedicines(); if (!Array.isArray(globalMedicines)) globalMedicines = []; } catch(e) { globalMedicines = []; }
    if (globalMedicines.length === 0) { grid.innerHTML = `<div style="text-align:center; width:100%; grid-column: 1 / -1; padding: 40px; background: #fffbeb; border-radius: 10px; border: 2px solid #f59e0b; color: #92400e;"><i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px;"></i><h2>Database is Empty</h2><p>Please log in to the <a href="login.html" style="color: #0f766e; font-weight:bold;">Admin Dashboard</a> and click "Add New Medicine".</p></div>`; return; }
    filterMedicines();
}

let searchTimeout;
function handleSearchInput() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { filterMedicines(); }, 300); }

function filterMedicines() { 
    if (!Array.isArray(globalMedicines)) globalMedicines = []; 
    const searchEl = document.getElementById('searchInput'); const catEl = document.getElementById('categoryFilter'); 
    const txt = searchEl ? searchEl.value.toLowerCase().trim() : ''; const cat = catEl ? catEl.value : 'All'; 
    const filtered = globalMedicines.filter(m => { if (!m || typeof m !== 'object') return false; const mName = String(m.name || '').toLowerCase(); const mCat = String(m.category || 'General').trim(); return mName.includes(txt) && (cat === 'All' || mCat.toLowerCase() === cat.toLowerCase()); }); 
    const grid = document.getElementById('medicineGrid'); if (!grid) return; 
    if(filtered.length === 0) { grid.innerHTML = "<p style='text-align:center; width:100%; grid-column: 1 / -1; color:#64748b; font-size:1.1rem; padding: 40px;'>No medicines found matching your search.</p>"; return; } 
    
    const defaultFallbackImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"; 
    
    grid.innerHTML = filtered.map(m => { 
        let safeId = m.id || m._id || Math.random(); let safeName = m.name || 'Unknown Medicine'; let safePrice = parseFloat(m.price) || 0; let safeCat = m.category || 'General'; let safeExp = m.expiry || 'N/A'; 
        let imgSrc = m.image && typeof m.image === 'string' && m.image.trim() !== '' ? m.image.trim() : defaultFallbackImg; if (imgSrc.toLowerCase().startsWith('file:///')) imgSrc = defaultFallbackImg; 
        let rating = 4 + (String(safeId).charCodeAt(0) % 2 || 0); let starHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating); let reviews = Math.floor(safePrice * 0.5) || 15; 
        
        /* 🛠️ FIXED: Added pointer-events: none to inner elements so the click GUARANTEES to hit the main card and open the modal! */
        return `<div class="med-card" onclick="openProductModal('${safeId}')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            ${m.isRx ? '<span class="rx-badge" style="pointer-events: none;">Rx Required</span>' : ''}
            <span class="med-tag" style="pointer-events: none;">${safeCat}</span>
            
            <div class="med-image-wrapper" style="pointer-events: none;">
                <img src="${imgSrc}" alt="${safeName}" class="med-card-img" loading="lazy" decoding="async" onerror="this.src='${defaultFallbackImg}'">
            </div>
            
            <div class="med-card-content" style="pointer-events: none;">
                <div class="med-name">${safeName}</div>
                ${m.manufacturer ? `<div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">By ${m.manufacturer}</div>` : ''}
                <div class="med-rating">${starHTML} <span class="reviews">(${reviews} reviews)</span></div>
                <div class="med-meta">Exp: ${safeExp}</div>
                <div class="med-price">₹${safePrice.toFixed(2)}</div>
            </div>
        </div>`; 
    }).join(''); 
}
function openProductModal(id) { 
    const product = globalMedicines.find(m => (m.id == id || m._id == id)); if(!product) return; 
    const defaultFallbackImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"; 
    let imgSrc = product.image && typeof product.image === 'string' && product.image.trim() !== '' ? product.image.trim() : defaultFallbackImg; if (imgSrc.toLowerCase().startsWith('file:///')) imgSrc = defaultFallbackImg; 
    
    const imgEl = document.getElementById('modalImg'); 
    imgEl.style.opacity = '0'; 
    imgEl.onload = function() { this.style.opacity = '1'; }; 
    imgEl.onerror = function() { this.src = defaultFallbackImg; this.style.opacity = '1'; }; 
    imgEl.src = imgSrc; 
    if (imgEl.complete) imgEl.style.opacity = '1'; 

    let safePrice = parseFloat(product.price) || 0; 
    document.getElementById('modalName').innerText = product.name || 'Unknown Medicine'; 
    
    let rxBadgeHtml = product.isRx ? `<span style="background:#ef4444; color:white; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold; margin-right:8px; display:inline-flex; align-items:center; gap:4px; box-shadow: 0 2px 5px rgba(239,68,68,0.3); vertical-align: text-bottom;"><i class="fas fa-file-medical"></i> Rx Required</span>` : '';
    document.getElementById('modalCategory').innerHTML = `${rxBadgeHtml} ${product.category || 'General'} ${product.manufacturer ? `<span style="color: #64748b;">| By ${product.manufacturer}</span>` : ''}`; 
    
    const oldBadge = document.getElementById('modalRxBadge'); 
    if(oldBadge) oldBadge.style.display = 'none';

    document.getElementById('modalPrice').innerText = safePrice.toFixed(2); 
    document.getElementById('modalBatch').innerText = product.batch || 'N/A'; 
    document.getElementById('modalExpiry').innerText = product.expiry || 'N/A'; 
    
    let rating = 4 + (String(product.id || 'A').charCodeAt(0) % 2 || 0); let reviews = Math.floor(safePrice * 0.5) || 15; document.getElementById('modalRating').innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating) + ` <span style="color:#94a3b8; font-size:0.9rem;">(${reviews} reviews)</span>`; 
    
    const stockDiv = document.getElementById('modalStockStatus'); const safeQty = parseInt(product.qty) || 0; 
    if(safeQty > 0) { stockDiv.innerHTML = '<i class="fas fa-check-circle"></i> In Stock'; stockDiv.style.color = 'var(--success)'; document.getElementById('modalBtnAdd').disabled = false; document.getElementById('modalBtnBuy').disabled = false; } else { stockDiv.innerHTML = '<i class="fas fa-times-circle"></i> Out of Stock'; stockDiv.style.color = 'var(--danger)'; document.getElementById('modalBtnAdd').disabled = true; document.getElementById('modalBtnBuy').disabled = true; } 
    
    document.getElementById('modalBtnAdd').setAttribute('onclick', `addToCart('${id}'); closeProductModal();`); document.getElementById('modalBtnBuy').setAttribute('onclick', `buyNow('${id}')`); document.getElementById('productModal').style.display = 'block'; 
}

function closeProductModal() { document.getElementById('productModal').style.display = 'none'; }
async function buyNow(id) { await addToCart(id); closeProductModal(); window.location.href = 'cart.html'; }

/* =========================================
   6. CART LOGIC
   ========================================= */
async function syncCartToDB() { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(user && user.role === 'customer') { let carts = await DB.getCarts(); carts[user.user] = JSON.parse(localStorage.getItem('ms_cart')) || []; DB.saveCarts(carts); } }

async function addToCart(id) { if(globalMedicines.length === 0) globalMedicines = await DB.getMedicines(); const product = globalMedicines.find(m => (m.id == id || m._id == id)); let cart = JSON.parse(localStorage.getItem('ms_cart')) || []; const existing = cart.find(i => (i.id == id || i._id == id)); const safeQty = parseInt(product.qty) || 0; if (existing) { if(existing.qty < safeQty) existing.qty++; else return showToast("Max stock reached!", 'error'); } else { cart.push({ id: product.id || product._id, name: product.name, manufacturer: product.manufacturer, price: product.price, qty: 1, isRx: product.isRx, image: product.image }); } localStorage.setItem('ms_cart', JSON.stringify(cart)); syncCartToDB(); updateCartCount(); showToast("Added to cart!", 'success'); }

async function updateCartItemQty(idx, change) { let cart = JSON.parse(localStorage.getItem('ms_cart')) || []; if (!cart[idx]) return; if (globalMedicines.length === 0) globalMedicines = await DB.getMedicines(); const product = globalMedicines.find(m => (m.id == cart[idx].id || m._id == cart[idx].id)); let newQty = cart[idx].qty + change; if (newQty < 1) return; const safeQty = parseInt(product ? product.qty : 0); if (product && newQty > safeQty) return showToast("Maximum stock limit reached!", 'error'); cart[idx].qty = newQty; localStorage.setItem('ms_cart', JSON.stringify(cart)); syncCartToDB(); renderCart(); updateCartCount(); }

function updateCartCount() { const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; const count = cart.reduce((sum, i) => sum + i.qty, 0); const badge = document.getElementById('cartCount'); if(badge) badge.innerText = count; }

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; const container = document.getElementById('cartItemsContainer'); const summaryBox = document.getElementById('cartSummary'); const totalSpan = document.getElementById('cartTotal'); const mainContainer = document.querySelector('.cart-container'); if(!container) return;
    if (mainContainer) { mainContainer.style.margin = '40px auto'; mainContainer.style.padding = '0 20px'; mainContainer.style.alignItems = 'start'; mainContainer.style.gap = '30px'; }
    if (cart.length === 0) { if (mainContainer) { mainContainer.style.display = 'block'; mainContainer.style.maxWidth = '800px'; } container.innerHTML = `<div style="text-align:center; padding: 60px 20px; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1; margin-top: 10px;"><i class="fas fa-cart-arrow-down" style="font-size: 4.5rem; color: #94a3b8; margin-bottom: 20px;"></i><h3 style="color: #1e293b; font-size: 1.6rem; margin-bottom: 10px;">Your Cart is Empty</h3><a href="index.html" class="btn-primary" style="text-decoration:none; padding: 12px 30px; display: inline-block; width: auto; border-radius: 8px; background: #0f766e; color: white;">Start Shopping</a></div>`; if(summaryBox) summaryBox.style.display = 'none'; return; }
    if (mainContainer) { mainContainer.style.display = 'grid'; mainContainer.style.maxWidth = '1250px'; mainContainer.style.gridTemplateColumns = '1fr 350px'; } 
    let total = 0; const defaultFallbackImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=80";
    
    container.innerHTML = `<table class="data-table" style="width:100%; background:white; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05); overflow:hidden; border-collapse:collapse;">
        <thead style="background:#f8fafc;"><tr><th style="padding:15px; text-align:left; color:#64748b; border-bottom:2px solid #e2e8f0;">Medicine</th><th style="padding:15px; color:#64748b; border-bottom:2px solid #e2e8f0;">Price</th><th style="padding:15px; color:#64748b; border-bottom:2px solid #e2e8f0;">Quantity</th><th style="padding:15px; color:#64748b; border-bottom:2px solid #e2e8f0;">Total</th><th style="padding:15px; color:#64748b; border-bottom:2px solid #e2e8f0;">Action</th></tr></thead>
        <tbody>` + cart.map((i, idx) => { 
            let safePrice = parseFloat(i.price) || 0; let itemTotal = safePrice * i.qty; total += itemTotal; let rxTag = i.isRx ? `<br><small style="color:red; font-weight:bold;">(Rx Required)</small>` : ''; let imgSrc = i.image && typeof i.image === 'string' && i.image.trim() !== '' ? i.image.trim() : defaultFallbackImg; if (imgSrc.toLowerCase().startsWith('file:///')) imgSrc = defaultFallbackImg; 
            return `<tr>
                <td style="padding:15px; border-bottom:1px solid #e2e8f0; display: flex; align-items: center; gap: 15px;"><img src="${imgSrc}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" loading="lazy" onerror="this.src='${defaultFallbackImg}'"><div><strong style="font-size: 1.05rem; color:#1e293b;">${i.name || 'Unknown'}</strong>${i.manufacturer ? `<div style="font-size: 0.85rem; color: #64748b;">${i.manufacturer}</div>` : ''}${rxTag}</div></td>
                <td style="padding:15px; border-bottom:1px solid #e2e8f0; font-weight:600; color:#1e293b;">₹${safePrice.toFixed(2)}</td>
                <td style="padding:15px; border-bottom:1px solid #e2e8f0;"><div style="display: inline-flex; align-items: center; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;"><button onclick="updateCartItemQty(${idx}, -1)" style="border:none; background:transparent; padding: 6px 12px; cursor:pointer; font-weight:bold; color:#475569; font-size:1.1rem;">-</button><span style="padding: 0 10px; font-weight: bold; color: #0f766e; min-width: 20px; text-align: center;">${i.qty}</span><button onclick="updateCartItemQty(${idx}, 1)" style="border:none; background:transparent; padding: 6px 12px; cursor:pointer; font-weight:bold; color:#475569; font-size:1.1rem;">+</button></div></td>
                <td style="padding:15px; border-bottom:1px solid #e2e8f0; color:#0f766e; font-weight:bold;">₹${itemTotal.toFixed(2)}</td>
                <td style="padding:15px; border-bottom:1px solid #e2e8f0; text-align:center;"><button onclick="removeFromCart(${idx})" style="color:#ef4444;border:none;background:none;cursor:pointer;font-size:1.2rem; transition:0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-trash-alt"></i></button></td>
            </tr>`; 
        }).join('') + `</tbody></table>`;
        
    if(totalSpan) totalSpan.innerText = `₹${total.toFixed(2)}`; if(summaryBox) summaryBox.style.display = 'block';
}

async function removeFromCart(idx) { let cart = JSON.parse(localStorage.getItem('ms_cart')); cart.splice(idx, 1); localStorage.setItem('ms_cart', JSON.stringify(cart)); syncCartToDB(); renderCart(); updateCartCount(); }

/* =========================================
   7. 🔴 ADVANCED UI CHECKOUT & PAYMENT
   ========================================= */
let pendingOrderData = { prescriptions: [], status: 'Approved', paymentMethod: 'Credit Card' };

function processOrder() { 
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); 
    if(!user) { showToast("Login required to checkout!", 'error'); setTimeout(() => window.location.href='login.html', 1500); return; } 
    if(!user.address || user.address.trim() === '') { showToast("Please add your Delivery Address in your profile first!", 'error'); setTimeout(() => window.location.href='profile.html', 2000); return; } 
    
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; if(cart.length === 0) return showToast("Cart is empty!", "error"); 
    
    const rxItems = cart.filter(i => i.isRx); pendingOrderData.prescriptions = [];

    if(rxItems.length > 0) { 
        let modalHtml = `
        <div class="product-modal-box" style="max-width:550px; width:90%; padding: 30px; border-radius: 16px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.2); position: relative; max-height: 85vh; display: flex; flex-direction: column; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-shrink: 0;">
                <h2 style="margin:0; color:#0f172a; font-size: 1.6rem; font-weight: 900; display: flex; align-items: center; gap: 10px;"><i class="fas fa-file-medical" style="color: #0f766e;"></i> Prescriptions Required</h2>
                <button onclick="closeModal('dynamicRxModal')" style="background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #94a3b8; line-height: 1; padding: 0; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</button>
            </div>
            <p style="color:#64748b; margin-top: 0; margin-bottom: 20px; font-size: 1rem; line-height: 1.5; flex-shrink: 0;">Some items in your cart require a valid doctor's prescription. Please upload them below.</p>
            <div style="overflow-y: auto; padding-right: 5px; display: flex; flex-direction: column; gap: 15px; flex-grow: 1; margin-bottom: 20px;">`;

        rxItems.forEach(item => { modalHtml += `<div style="padding:15px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:10px; transition: 0.3s;" onmouseover="this.style.borderColor='#0f766e'" onmouseout="this.style.borderColor='#cbd5e1'"><label style="font-weight:800; color:#0f172a; margin-bottom:10px; font-size:1rem; display: flex; align-items: center; gap: 8px;"><i class="fas fa-pills" style="color:#ef4444;"></i> Upload Rx for: <span style="color:#0f766e;">${item.name}</span></label><input type="file" id="rxFile_${item.id}" accept="image/*" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:8px; background:white; font-family: inherit; color: #475569; outline: none; cursor: pointer;"></div>`; });
        modalHtml += `</div><button onclick="proceedFromMultipleRx()" style="width:100%; padding:15px; border-radius:12px; background:#0f766e; color:white; font-size:1.1rem; font-weight:800; border:none; cursor:pointer; box-shadow: 0 4px 15px rgba(15,118,110,0.2); transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; flex-shrink: 0;" onmouseover="this.style.background='#0d9488'" onmouseout="this.style.background='#0f766e'"><i class="fas fa-shield-check"></i> Verify & Proceed</button></div>`;

        let modal = document.getElementById('dynamicRxModal'); if(!modal) { modal = document.createElement('div'); modal.id = 'dynamicRxModal'; document.body.appendChild(modal); }
        modal.className = 'product-modal-overlay'; modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:3000; align-items:center; justify-content:center; backdrop-filter:blur(5px);'; modal.innerHTML = modalHtml;
    } else { pendingOrderData.status = 'Approved'; openPaymentModal(); } 
}

function proceedFromMultipleRx() { 
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; const rxItems = cart.filter(i => i.isRx); let allValid = true; let filePromises = [];
    rxItems.forEach(item => { const fileInput = document.getElementById(`rxFile_${item.id}`); if(!fileInput || !fileInput.files[0]) { allValid = false; } else { const file = fileInput.files[0]; const promise = new Promise((resolve) => { const reader = new FileReader(); reader.onload = (e) => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); const compressedData = canvas.toDataURL('image/jpeg', 0.7); resolve({ itemId: item.id, name: item.name, data: compressedData }); }; img.src = e.target.result; }; reader.readAsDataURL(file); }); filePromises.push(promise); } });
    if(!allValid) return showToast("Please upload a prescription image for EVERY required medicine!", 'error'); 
    
    showToast("Compressing & Validating Rx...", "info");
    
    Promise.all(filePromises).then(results => { 
        pendingOrderData.prescriptions = results; 
        pendingOrderData.status = 'Pending'; 
        document.getElementById('dynamicRxModal').style.display = 'none'; 
        openPaymentModal(); 
    });
}

function openPaymentModal() { const cart = JSON.parse(localStorage.getItem('ms_cart')); document.getElementById('payModalTotal').innerText = `₹` + cart.reduce((acc, i) => acc + ((parseFloat(i.price)||0) * i.qty), 0).toFixed(2); document.getElementById('paymentModal').style.display = 'flex'; switchPayTab('cc'); initPaymentMasks(); }
function switchPayTab(tabId) { document.querySelectorAll('.pay-tab').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('.pay-tab-content').forEach(content => content.classList.remove('active')); if(tabId === 'cc') { document.querySelector('.pay-tab:nth-child(1)').classList.add('active'); document.getElementById('tab-cc').classList.add('active'); pendingOrderData.paymentMethod = 'Credit Card'; } else if (tabId === 'upi') { document.querySelector('.pay-tab:nth-child(2)').classList.add('active'); document.getElementById('tab-upi').classList.add('active'); pendingOrderData.paymentMethod = 'UPI / QR'; } else { document.querySelector('.pay-tab:nth-child(3)').classList.add('active'); document.getElementById('tab-cod').classList.add('active'); pendingOrderData.paymentMethod = 'Cash on Delivery'; } }
function initPaymentMasks() { const ccNum = document.getElementById('ccNumber'); const ccExp = document.getElementById('ccExpiry'); if(ccNum) { ccNum.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim(); const icon = document.querySelector('#tab-cc .cc-icon.fa-credit-card'); if(icon) icon.className = e.target.value.startsWith('4') ? 'fab fa-cc-visa cc-icon' : (e.target.value.startsWith('5') ? 'fab fa-cc-mastercard cc-icon' : 'far fa-credit-card cc-icon'); }); } if(ccExp) { ccExp.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{2})/, '$1/').trim().slice(0,5); }); } }

function showPaymentProcessing() { 
    let loader = document.getElementById('paymentLoader'); 
    if (!loader) { 
        loader = document.createElement('div'); 
        loader.id = 'paymentLoader'; 
        loader.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(248, 250, 252, 0.98); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(12px); font-family: "Segoe UI", sans-serif; transition: all 0.3s ease;'; 
        document.body.appendChild(loader); 
    } 
    loader.innerHTML = `
        <div style="background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); text-align: center; max-width: 420px; width: 90%; position:relative; animation: popInUI 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
            <div style="position: relative; width: 90px; height: 90px; margin: 0 auto 25px auto;">
                <svg viewBox="0 0 50 50" style="animation: rotateSpinner 2s linear infinite; width: 100%; height: 100%;">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="#14b8a6" stroke-linecap="round" style="animation: dashSpinner 1.5s ease-in-out infinite;"></circle>
                </svg>
            </div>
            <h2 style="color: #0f172a; font-size: 2rem; margin:0 0 10px 0; font-weight: 800; letter-spacing: -0.5px;">Processing Payment...</h2>
            <p style="color: #64748b; font-size: 1.05rem; margin: 0; font-weight: 500;">Please do not close this window.</p>
        </div>
    `;
    loader.style.opacity = '1';
    loader.style.display = 'flex'; 
    const payModal = document.getElementById('paymentModal'); if(payModal) payModal.style.display = 'none'; 
}

function showPaymentSuccess(msg) { 
    let loader = document.getElementById('paymentLoader'); if(!loader) return; 
    
    loader.children[0].style.opacity = '0';
    loader.children[0].style.transform = 'scale(0.95)';
    loader.children[0].style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
        loader.innerHTML = `
            <div style="background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); text-align: center; max-width: 420px; width: 90%; position:relative; animation: popInUI 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                <div class="success-checkmark" style="background: #10b981; color: white; width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; margin: 0 auto 25px auto; box-shadow: 0 10px 25px -5px rgba(16,185,129,0.4);">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="color: #0f172a; font-size: 2.2rem; margin:0 0 12px 0; font-weight: 900; letter-spacing: -0.5px;">Order Placed!</h2>
                <p style="color: #0f766e; font-size: 1.15rem; font-weight: 600; margin-bottom: 30px; background: #f0fdfa; padding: 10px; border-radius: 8px; display: inline-block;">${msg}</p>
                <button onclick="document.getElementById('paymentLoader').style.display='none'; renderCart(); updateCartCount();" style="background:#0f766e; color:white; border:none; padding:16px 35px; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; width: 100%; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(15,118,110,0.2), 0 2px 4px -1px rgba(15,118,110,0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(15,118,110,0.3), 0 4px 6px -2px rgba(15,118,110,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(15,118,110,0.2), 0 2px 4px -1px rgba(15,118,110,0.1)';">
                    Continue Shopping
                </button>
            </div>
        `;
    }, 200);
}

function confirmPayment() { 
    if (pendingOrderData.paymentMethod === 'Credit Card') { 
        const ccNum = document.getElementById('ccNumber') ? document.getElementById('ccNumber').value.replace(/\s+/g, '') : ''; const ccExp = document.getElementById('ccExpiry') ? document.getElementById('ccExpiry').value : ''; const ccCvv = document.getElementById('ccCvv') ? document.getElementById('ccCvv').value : ''; 
        if (!ccNum || ccNum.length < 15) return showToast("Please enter a valid Card Number.", "error"); if (!ccExp || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(ccExp)) return showToast("Please enter a valid Expiry Date (MM/YY).", "error"); if (!ccCvv || ccCvv.length < 3) return showToast("Please enter a valid CVV.", "error"); 
    } 
    
    showPaymentProcessing();
    setTimeout(() => { submitCheckout(); }, 500);
}

async function submitCheckout() {
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); 
    const cart = JSON.parse(localStorage.getItem('ms_cart')); 
    let totalAmt = cart.reduce((acc, i) => acc + ((parseFloat(i.price)||0) * i.qty), 0);
    
    const now = new Date();
    const newOrder = { 
        id: Date.now(), date: now.toLocaleString('en-IN'), user: user.name, email: user.email, mobile: user.mobile, address: user.address, 
        items: cart, total: totalAmt, payment: pendingOrderData.paymentMethod, status: pendingOrderData.status, prescriptions: pendingOrderData.prescriptions 
    };

    try {
        const [meds, sales, orders, carts] = await Promise.all([DB.getMedicines(true), DB.getSales(true), DB.getOrders(true), DB.getCarts(true)]);
        cart.forEach(c => { const idx = meds.findIndex(m => m && (m.id == c.id || m._id == c.id)); if(idx > -1) meds[idx].qty -= c.qty; });
        orders.push(newOrder);

        const optimizedOrders = optimizeOrdersDB(orders);

        if(newOrder.status === 'Approved') { cart.forEach(i => { sales.push({ dateTime: now.toLocaleString('en-IN'), date: now.toISOString().split('T')[0], item: i.name, qty: i.qty, total: (parseFloat(i.price)||0) * i.qty, user: user.name }); }); }
        carts[user.user] = []; 
        
        const results = await Promise.all([DB.saveMedicines(meds), DB.saveOrders(optimizedOrders), DB.saveSales(sales), DB.saveCarts(carts)]);
        if (results.some(r => !r.success)) throw new Error("Database rejected payload.");

        localStorage.setItem('ms_cart', JSON.stringify([]));
        updateCartCount();
        let msg = newOrder.status === 'Pending' ? "Waiting for Admin Approval." : "Payment successful.";
        showPaymentSuccess(msg);
        
    } catch(e) { 
        console.error("Save failed", e); 
        document.getElementById('paymentLoader').style.display = 'none';
        showToast("Database Overload: Failed to save. Please try again.", "error");
    }
}

/* =========================================
   8. FOOTER MODALS & USER PROFILE
   ========================================= */
function showInfoModal(type) { let modal = document.getElementById('infoModal'); if (!modal) { modal = document.createElement('div'); modal.id = 'infoModal'; modal.className = 'product-modal-overlay'; modal.style.display = 'none'; modal.style.position = 'fixed'; modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%'; modal.style.background = 'rgba(0,0,0,0.7)'; modal.style.zIndex = '3000'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.innerHTML = `<div class="product-modal-box" style="background:white; padding:40px; border-radius:15px; max-width:650px; width:90%; position:relative; text-align:left; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"><span onclick="document.getElementById('infoModal').style.display='none'" style="position:absolute; top:15px; right:20px; font-size:1.8rem; cursor:pointer; color:#94a3b8; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</span><h2 id="infoModalTitle" style="color: #0f766e; margin-top: 0; margin-bottom: 20px; font-size: 1.8rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-weight: 800;"></h2><div id="infoModalContent" style="color: #475569; font-size: 1.05rem; line-height: 1.7;"></div></div>`; document.body.appendChild(modal); } const title = document.getElementById('infoModalTitle'); const content = document.getElementById('infoModalContent'); if (type === 'about') { title.innerHTML = '<i class="fas fa-info-circle"></i> About MediShop'; content.innerHTML = `<p>Welcome to <strong>MediShop</strong>, your trusted online pharmacy. Our mission is to make healthcare accessible, affordable, and convenient.</p><p>We deliver 100% genuine medicines directly to your doorstep. With features like easy prescription uploads, secure payments, and fast delivery, we strive to provide a seamless healthcare experience.</p><div style="background: #f0fdfa; padding: 15px 20px; border-left: 4px solid #0f766e; border-radius: 6px; margin: 20px 0; color: #0f172a;">This project is developed by <strong>Thakor Viraj Ganpatsinh</strong>, with the aim of prioritizing your health and making pharmacy management simple and reliable.</div><p style="font-weight:bold; color: #0f766e;">Your health, delivered safely.</p>`; } else if (type === 'support') { title.innerHTML = '<i class="fas fa-headset"></i> Contact Support'; content.innerHTML = `<p>If you need any help or have questions regarding your order or prescriptions, our support team is here to assist you.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;"><div style="margin-bottom: 12px;"><i class="fas fa-envelope" style="color: #0f766e; font-size: 1.2rem; margin-right: 10px;"></i> Email: <a href="mailto:support@medishop.com" style="color: #0f766e; text-decoration: none;">support@medishop.com</a></div><div><i class="fas fa-phone-alt" style="color: #0f766e; font-size: 1.2rem; margin-right: 10px;"></i> Phone: +91 1800-123-4567</div></div><p><strong>You can contact us for:</strong></p><ul style="padding-left: 20px; color: #334155; margin-bottom: 20px;"><li style="margin-bottom: 5px;">Prescription or order issues</li><li style="margin-bottom: 5px;">Account-related problems</li><li style="margin-bottom: 5px;">Delivery tracking</li><li style="margin-bottom: 5px;">Feedback and suggestions</li></ul><p style="font-weight: bold; color: #0f766e;">We aim to respond to all queries as quickly as possible to ensure a smooth user experience.</p>`; } else if (type === 'policy') { title.innerHTML = '<i class="fas fa-undo-alt"></i> Return Policy'; content.innerHTML = `<p>Since health and safety are our top priorities, we <strong>do not offer returns or physical product exchanges on opened or used medicines.</strong></p><p>However, we are absolutely committed to your satisfaction. If you face any issues with your delivery, you can easily contact our support team for assistance.</p><p><strong>In case of delivery problems or incorrect items, we will provide:</strong></p><ul style="padding-left: 20px; color: #334155; margin-bottom: 20px;"><li style="margin-bottom: 5px;">Replacements for damaged items</li><li style="margin-bottom: 5px;">Full support for incorrect orders</li><li style="margin-bottom: 5px;">Guidance for proper medicine storage</li></ul><div style="background: #fffbeb; padding: 15px 20px; border-left: 4px solid #f59e0b; border-radius: 6px; color: #92400e; font-weight: bold;"><i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i> Please report any issues within 7 days of receiving your order so we can resolve them promptly.</div>`; } modal.style.display = 'flex'; }
async function renderUserProfile() { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(!user) return; if(document.getElementById('sidebarName')) document.getElementById('sidebarName').innerText = user.name; if(document.getElementById('profileName')) document.getElementById('profileName').innerText = user.name; if(document.getElementById('profileUser')) document.getElementById('profileUser').innerText = "@" + user.user; if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email || "Not Provided"; if(document.getElementById('profileMobile')) document.getElementById('profileMobile').innerText = user.mobile ? "+91 " + user.mobile : "Not Provided"; if(document.getElementById('profileAddress')) document.getElementById('profileAddress').innerText = user.address || "No Address Provided. Please click 'Edit Profile' to add one."; const allOrders = await DB.getOrders(); const userOrders = allOrders.filter(o => o && o.user === user.name).reverse(); const tbody = document.getElementById('userOrdersBody'); if(!tbody) return; if(userOrders.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#64748b;">No orders found. Start shopping to see history here!</td></tr>'; return; } tbody.innerHTML = userOrders.map(o => { let badgeClass = ''; let badgeText = o.status; if(o.status === 'Pending') { badgeClass = 'status-pending'; badgeText = 'Processing Rx'; } else if(o.status === 'Approved') { badgeClass = 'status-approved'; badgeText = 'Completed'; } else { badgeClass = 'status-rejected'; badgeText = 'Cancelled'; } let itemList = o.items.map(i => `<span style="display:inline-block; background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.85rem; margin:2px;">${i.qty}x ${i.name}</span>`).join(' '); return `<tr><td><span class="order-id" style="font-weight:bold; color:#0f172a;">#${o.id.toString().slice(-6)}</span><br><span class="order-date" style="font-size:0.85rem; color:#64748b;">${o.date}</span></td><td>${itemList}</td><td class="order-total" style="font-weight:bold; color:#0f766e;">₹${parseFloat(o.total).toFixed(2)}</td><td><span class="status-badge ${badgeClass}" style="padding:5px 10px; border-radius:6px; font-size:0.85rem; font-weight:bold; background:${o.status==='Pending'?'#fef08a':(o.status==='Approved'?'#bbf7d0':'#fecaca')}; color:${o.status==='Pending'?'#92400e':(o.status==='Approved'?'#166534':'#991b1b')};">${badgeText}</span></td></tr>`; }).join(''); }
function openEditProfileModal() { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(document.getElementById('editEmail')) document.getElementById('editEmail').value = user.email || ''; if(document.getElementById('editMobile')) document.getElementById('editMobile').value = user.mobile || ''; if(document.getElementById('editAddress')) document.getElementById('editAddress').value = user.address || ''; document.getElementById('editProfileModal').style.display = 'flex'; }
function closeEditProfileModal() { document.getElementById('editProfileModal').style.display = 'none'; }
async function saveProfileDetails(e) { e.preventDefault(); const newEmail = document.getElementById('editEmail').value; const newMobile = document.getElementById('editMobile').value; const newAddress = document.getElementById('editAddress').value; let user = JSON.parse(localStorage.getItem('ms_currentUser')); user.email = newEmail; user.mobile = newMobile; user.address = newAddress; localStorage.setItem('ms_currentUser', JSON.stringify(user)); let allUsers = await DB.getUsers(); let userIndex = allUsers.findIndex(u => u && u.user === user.user); if(userIndex > -1) { allUsers[userIndex].email = newEmail; allUsers[userIndex].mobile = newMobile; allUsers[userIndex].address = newAddress; await DB.saveUsers(allUsers); } showToast("Profile Updated Successfully!", "success"); closeEditProfileModal(); renderUserProfile(); }

/* =========================================
   9. ADMIN DASHBOARD
   ========================================= */
function showSection(id) { document.querySelectorAll('.section').forEach(s => s.style.display = 'none'); document.getElementById(id).style.display = 'block'; document.querySelectorAll('.sidebar .menu-item').forEach(item => item.classList.remove('active')); const activeBtn = document.querySelector(`.sidebar .menu-item[onclick="showSection('${id}')"]`); if (activeBtn) activeBtn.classList.add('active'); }

let isEditing = false, editId = null;
if(document.getElementById('addMedicineForm')) { document.getElementById('addMedicineForm').addEventListener('submit', async (e) => { e.preventDefault(); let meds = await DB.getMedicines(); if(!Array.isArray(meds)) meds = []; const defaultImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"; let rawImg = document.getElementById('medImageURL').value.trim(); if (rawImg.toLowerCase().startsWith('file:///')) rawImg = defaultImg; const newMed = { id: isEditing ? editId : Date.now(), name: document.getElementById('medName').value, manufacturer: document.getElementById('medManufacturer').value, category: document.getElementById('medCategory').value, batch: document.getElementById('medBatch').value, expiry: document.getElementById('medExpiry').value, price: parseFloat(document.getElementById('medPrice').value) || 0, qty: parseInt(document.getElementById('medQty').value) || 0, limit: parseInt(document.getElementById('medLimit').value) || 0, isRx: document.getElementById('medRx').checked, image: rawImg !== '' ? rawImg : defaultImg }; if(isEditing) { const idx = meds.findIndex(m => m && (m.id == editId || m._id == editId)); if (rawImg === '') newMed.image = meds[idx].image || defaultImg; meds[idx] = newMed; showToast("Updated Successfully!", 'success'); } else { meds.push(newMed); showToast("Added Successfully!", 'success'); } await DB.saveMedicines(meds); cancelEdit(); renderAdminDashboard(); showSection('inventory'); }); }
function cancelEdit() { isEditing = false; editId = null; if(document.getElementById('addMedicineForm')) { document.getElementById('addMedicineForm').reset(); document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Medicine'; document.getElementById('submitMedBtn').innerHTML = '<i class="fas fa-save"></i> Save Medicine'; document.getElementById('cancelEditBtn').style.display = "none"; showSection('inventory'); } }
async function editMed(id) { const meds = await DB.getMedicines(); const m = meds.find(x => x && (x.id == id || x._id == id)); if(m) { document.getElementById('medName').value = m.name || ''; document.getElementById('medManufacturer').value = m.manufacturer || ''; document.getElementById('medCategory').value = m.category || 'General'; document.getElementById('medBatch').value = m.batch || ''; document.getElementById('medExpiry').value = m.expiry || ''; document.getElementById('medPrice').value = m.price || 0; document.getElementById('medQty').value = m.qty || 0; document.getElementById('medLimit').value = m.limit || 0; document.getElementById('medImageURL').value = m.image || ''; document.getElementById('medRx').checked = m.isRx || false; isEditing = true; editId = id; document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Update Medicine'; document.getElementById('submitMedBtn').innerHTML = '<i class="fas fa-save"></i> Update Medicine'; document.getElementById('cancelEditBtn').style.display = "inline-block"; showSection('add-medicine'); } }
async function deleteMed(id) { if(confirm("Delete this medicine permanently?")) { let meds = await DB.getMedicines(); meds = meds.filter(m => m && (m.id != id && m._id != id)); await DB.saveMedicines(meds); renderAdminDashboard(); showToast("Deleted", 'error'); } }

let cachedSalesForChart = [];
async function updateChart(period, salesData) {
    const canvas = document.getElementById('salesChart'); if (!canvas) return;
    if(salesData) cachedSalesForChart = salesData; else if(cachedSalesForChart.length === 0) cachedSalesForChart = await DB.getSales();
    const sales = (Array.isArray(cachedSalesForChart) ? cachedSalesForChart : []).filter(s => s.item && s.item.toLowerCase() !== 'demo item');
    const buttons = document.querySelectorAll('.chart-controls button'); buttons.forEach(btn => { btn.classList.remove('active'); btn.style.background = 'white'; btn.style.color = '#64748b'; btn.style.borderColor = '#e2e8f0'; });
    const activeBtn = document.querySelector(`.chart-controls button[onclick="updateChart('${period}')"]`); if(activeBtn) { activeBtn.classList.add('active'); activeBtn.style.background = '#0f766e'; activeBtn.style.color = 'white'; activeBtn.style.borderColor = '#0f766e'; }
    let labels = [], data = []; 
    if (period === 'daily') { for (let i = 6; i >= 0; i--) { let d = new Date(); d.setDate(d.getDate() - i); let dateStr = d.toISOString().split('T')[0]; labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })); data.push(sales.filter(x => x.date === dateStr).reduce((sum, item) => sum + parseFloat(item.total||0), 0)); } } 
    else if (period === 'weekly') { labels = ['3 Weeks Ago', '2 Weeks Ago', 'Last Week', 'This Week']; let totals = [0, 0, 0, 0]; const today = new Date(); sales.forEach(s => { let sDate = new Date(s.date); const diffDays = Math.floor((today - sDate) / (1000 * 60 * 60 * 24)); if (diffDays <= 7) totals[3] += parseFloat(s.total||0); else if (diffDays <= 14) totals[2] += parseFloat(s.total||0); else if (diffDays <= 21) totals[1] += parseFloat(s.total||0); else if (diffDays <= 28) totals[0] += parseFloat(s.total||0); }); data = totals; } 
    else if (period === 'monthly') { const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; const today = new Date(); for (let i = 5; i >= 0; i--) { let d = new Date(today); d.setMonth(d.getMonth() - i); labels.push(monthNames[d.getMonth()]); data.push(sales.filter(x => new Date(x.date).getMonth() === d.getMonth() && new Date(x.date).getFullYear() === d.getFullYear()).reduce((sum, item) => sum + parseFloat(item.total||0), 0)); } }
    if (window.salesChart instanceof Chart) window.salesChart.destroy();
    window.salesChart = new Chart(canvas.getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ label: 'Sales Revenue (₹)', data: data, backgroundColor: '#0f766e', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
}

let globalOrdersForAdmin = []; 

async function renderAdminDashboard(forceServerRefresh = true) {
    if(!document.getElementById('inventoryTableBody')) return;

    const drawUI = (meds, allSales, orders) => {
        globalOrdersForAdmin = orders;
        const sales = (Array.isArray(allSales) ? allSales : []).filter(s => s.item && s.item.toLowerCase() !== 'demo item');
        let lowStock = 0, stockVal = 0, daily = 0; const today = new Date().toISOString().split('T')[0];

        document.getElementById('inventoryTableBody').innerHTML = (Array.isArray(meds) ? meds : []).map(m => {
            if(!m) return ''; let safePrice = parseFloat(m.price) || 0; let safeQty = parseInt(m.qty) || 0; let safeLimit = parseInt(m.limit) || 0; stockVal += (safePrice * safeQty); if(safeQty < safeLimit) lowStock++; let safeId = m.id || m._id;
            return `<tr class="${safeQty < safeLimit ? 'stock-low' : ''}"><td><strong style="color:#1e293b;">${m.name || 'Unknown'}</strong><br><small style="color: #64748b;">${m.manufacturer || ''}</small></td><td><span style="background:#f1f5f9; padding:4px 10px; border-radius:15px; font-size:0.85rem; font-weight:600;">${m.category || 'General'}</span></td><td>${m.expiry || 'N/A'}</td><td style="font-weight:bold;">₹${safePrice.toFixed(2)}</td><td><span style="${safeQty < safeLimit ? 'color:red; font-weight:bold;' : 'color:#333;'}">${safeQty}</span></td><td><button onclick="editMed('${safeId}')" class="action-icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button> <button onclick="deleteMed('${safeId}')" class="action-icon-btn delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button></td></tr>`;
        }).join('');

        const last10Sales = sales.slice().reverse().slice(0, 10);
        document.getElementById('salesTableBody').innerHTML = last10Sales.map(s => { 
            if(!s) return ''; let safeTotal = parseFloat(s.total) || 0; if(s.date === today) daily += safeTotal; 
            return `<tr><td>${s.dateTime || 'N/A'}</td><td>${s.item || 'Unknown'}</td><td><strong>${s.qty || 0}</strong></td><td style="color:var(--primary); font-weight:bold;">₹${safeTotal.toFixed(2)}</td><td>${s.user || 'Guest'}</td></tr>`; 
        }).join('');

        let medSalesCount = {}; sales.forEach(s => { if(s.item) medSalesCount[s.item] = (medSalesCount[s.item] || 0) + (parseInt(s.qty) || 0); });
        let sortedMeds = Object.keys(medSalesCount).sort((a,b) => medSalesCount[b] - medSalesCount[a]).slice(0, 5);
        let doughnutData = sortedMeds.map(m => medSalesCount[m]);
        const ctxDoughnut = document.getElementById('topMedicineChart');
        if (ctxDoughnut) { if (window.topMedChart instanceof Chart) window.topMedChart.destroy(); window.topMedChart = new Chart(ctxDoughnut.getContext('2d'), { type: 'doughnut', data: { labels: sortedMeds.length ? sortedMeds : ['No Sales Yet'], datasets: [{ data: doughnutData.length ? doughnutData : [1], backgroundColor: ['#0f766e', '#14b8a6', '#2dd4bf', '#99f6e4', '#ccfbf1'], borderWidth: 2, borderColor: '#ffffff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } }); }
        updateChart('daily', sales);

        const pendingBody = document.getElementById('pendingOrdersBody');
        if(pendingBody) {
            const allUserOrders = (Array.isArray(orders) ? orders : []).slice().reverse().slice(0, 50);
            pendingBody.innerHTML = allUserOrders.length ? allUserOrders.map(o => { 
                let safeId = o.id || o._id; let safeTotal = parseFloat(o.total) || 0; let itemList = o.items.map(i => `${i.name} (x${i.qty})`).join(', ');
                
                let rxButton = ''; 
                if (o.prescriptions && o.prescriptions.length > 0) { 
                    rxButton = `<div style="display:flex; flex-direction:column; gap:8px;">`; 
                    o.prescriptions.forEach(rx => { 
                        rxButton += `<button onclick="viewSpecificRx('${safeId}', '${rx.itemId}')" class="view-rx-btn" style="padding:6px 12px; font-size:0.85rem;"><i class="fas fa-file-medical"></i> Rx: ${rx.name}</button>`; 
                    }); 
                    rxButton += `</div>`; 
                } else { 
                    rxButton = `<span style="color:#94a3b8; font-weight:600; font-size:0.95rem;">Not Required</span>`; 
                }

                let actionContent = ''; 
                if(o.status === 'Pending') { 
                    actionContent = `<button onclick="approveOrder(this, '${safeId}')" style="background:#16a34a; color:white; border:none; padding:6px 12px; border-radius:4px; margin-bottom:5px; width:100%; cursor:pointer; font-weight:bold;">Approve</button><button onclick="rejectOrder(this, '${safeId}')" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; width:100%; cursor:pointer; font-weight:bold;">Reject</button>`; 
                } else if (o.status === 'Approved') { 
                    actionContent = `<span style="color:#16a34a; font-weight:800; font-size:1.05rem;">Accepted</span>`; 
                } else { 
                    actionContent = `<span style="color:#dc2626; font-weight:800; font-size:1.05rem;">Rejected</span>`; 
                }
                let payIcon = o.payment.toLowerCase().includes('cash') ? '💵' : '📱';
                return `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="vertical-align: top; padding: 15px 10px;"><div style="color:#0f766e; font-size:1.05rem; font-weight: 700; margin-bottom: 4px;">ORD${safeId.toString().slice(-6)}</div><div style="color:#64748b; font-size: 0.85rem; margin-bottom: 6px;">${o.date}</div><div style="font-weight:bold; font-size:1.1rem; color:#1e293b;">₹${safeTotal.toFixed(2)}</div></td><td style="vertical-align: top; padding: 15px 10px;"><div style="font-weight:bold; color:#1e293b; margin-bottom: 4px;">${o.user}</div><div style="color:#64748b; font-size: 0.85rem; margin-bottom: 2px;"><i class="fas fa-phone-alt" style="color:#e11d48; width: 14px;"></i> ${o.mobile || 'N/A'}</div><div style="color:#64748b; font-size: 0.85rem;"><i class="fas fa-map-marker-alt" style="color:#e11d48; width: 14px;"></i> ${o.address || 'N/A'}</div></td><td style="vertical-align: top; padding: 15px 10px; max-width: 300px;"><div style="color:#334155; font-size:0.95rem; line-height: 1.4; margin-bottom: 8px;">${itemList}</div><span style="color:#0f766e; font-weight:700; font-size: 0.85rem; background: #e0f2f1; padding: 4px 8px; border-radius: 4px;">Payment: ${payIcon} ${o.payment}</span></td><td style="vertical-align: middle; padding: 15px 10px;">${rxButton}</td><td style="vertical-align: middle; padding: 15px 10px;">${actionContent}</td></tr>`; 
            }).join('') : '<tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">No orders found.</td></tr>';
        }
        document.getElementById('lowStockCount').innerText = lowStock; document.getElementById('totalStockValue').innerText = `₹${stockVal.toFixed(2)}`; document.getElementById('dailySales').innerText = `₹${daily.toFixed(2)}`;
    };

    const cachedMeds = await DB.getMedicines(false) || [];
    const cachedSales = await DB.getSales(false) || [];
    const cachedOrders = await DB.getOrders(false) || [];
    drawUI(cachedMeds, cachedSales, cachedOrders);

    if (forceServerRefresh) {
        Promise.all([DB.getMedicines(true), DB.getSales(true), DB.getOrders(true)]).then(([freshMeds, freshSales, freshOrders]) => {
            drawUI(freshMeds, freshSales, freshOrders);
        }).catch(e => console.error("Sync failed", e));
    }
}

function viewSpecificRx(orderId, itemId) { 
    const order = globalOrdersForAdmin.find(o => (o.id == orderId || o._id == orderId)); 
    if(order && order.prescriptions) { 
        const rx = order.prescriptions.find(p => p.itemId == itemId); 
        if(rx) { 
            if (rx.data === "archived") return showToast("Image archived to save database space.", "info");
            document.getElementById('rxImagePreview').src = rx.data; 
            let rxModal = document.getElementById('viewRxModal'); 
            if(rxModal) rxModal.style.display = 'flex'; 
        } 
    } 
}

async function approveOrder(btnElement, oid) { 
    if(btnElement && btnElement.parentElement) { btnElement.parentElement.innerHTML = `<span style="color:#16a34a; font-weight:800; font-size:1.05rem;">Accepted</span>`; }
    showToast("Approved!", 'success'); 
    try {
        let orders = await DB.getOrders(true); let sales = await DB.getSales(true); let idx = orders.findIndex(o => o && (o.id == oid || o._id == oid)); 
        if(idx > -1) { 
            orders[idx].status = 'Approved'; 
            orders[idx].items.forEach(i => { sales.push({ dateTime: new Date().toLocaleString('en-IN'), date: new Date().toISOString().split('T')[0], item: i.name, qty: i.qty, total: (parseFloat(i.price)||0) * i.qty, user: orders[idx].user }); }); 
            
            const optimizedOrders = optimizeOrdersDB(orders);
            await Promise.all([DB.saveOrders(optimizedOrders), DB.saveSales(sales)]); 
            
            renderAdminDashboard(false); 
        }
    } catch(e) {}
}

async function rejectOrder(btnElement, oid) { 
    if(btnElement && btnElement.parentElement) { btnElement.parentElement.innerHTML = `<span style="color:#dc2626; font-weight:800; font-size:1.05rem;">Rejected</span>`; }
    showToast("Rejected.", 'info'); 
    try {
        let orders = await DB.getOrders(true); let meds = await DB.getMedicines(true); let idx = orders.findIndex(o => o && (o.id == oid || o._id == oid)); 
        if(idx > -1) { 
            orders[idx].status = 'Rejected'; 
            orders[idx].items.forEach(i => { let midx = meds.findIndex(m => m && (m.id == i.id || m._id == i.id)); if(midx > -1) meds[midx].qty += i.qty; }); 
            
            const optimizedOrders = optimizeOrdersDB(orders);
            await Promise.all([DB.saveOrders(optimizedOrders), DB.saveMedicines(meds)]); 
            
            renderAdminDashboard(false); 
        }
    } catch(e) {}
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

/* =========================================
   10. UNIVERSAL AUTO-LOADER
   ========================================= */
async function bootUpApp() {
    if(document.getElementById('passCriteriaList')) initLivePasswordChecks();
    initializeData(); checkUserLoginState(); updateCartCount();
    if (document.getElementById('medicineGrid')) renderStore();
    if (document.getElementById('cartItemsContainer')) renderCart();
    if (document.getElementById('userOrdersBody') && window.location.href.includes('profile')) renderUserProfile();
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', bootUpApp); } else { bootUpApp(); }
