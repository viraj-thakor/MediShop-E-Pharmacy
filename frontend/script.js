/* =========================================
   0. 🔴 UI HOTFIX INJECTIONS (v5 - Sidebar & Toast Fix)
   ========================================= */
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
    html, body { width: 100% !important; max-width: 100vw !important; margin: 0; padding: 0; box-sizing: border-box; }
    *, *::before, *::after { box-sizing: inherit; }

    .sidebar { height: 100vh !important; position: -webkit-sticky !important; position: sticky !important; top: 0 !important; display: flex !important; flex-direction: column !important; overflow-y: auto !important; }
    .sidebar [onclick*="logout"], .sidebar .logout-btn { margin-top: auto !important; margin-bottom: 20px !important; }

    #toast-container { position: fixed !important; top: auto !important; bottom: 30px !important; right: 30px !important; display: flex !important; flex-direction: column-reverse !important; z-index: 99999 !important; align-items: flex-end !important; pointer-events: none; }
    .toast { margin-top: 10px !important; margin-bottom: 0 !important; background: rgba(255,255,255,0.95) !important; color: #1e293b !important; padding: 16px 24px !important; border-radius: 12px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important; backdrop-filter: blur(10px) !important; border: 1px solid rgba(0,0,0,0.05) !important; display: flex !important; align-items: center !important; gap: 12px !important; opacity: 0; transform: translateX(50px) !important; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; font-weight: 700 !important; font-size: 1.05rem !important; }
    .toast.show { opacity: 1 !important; transform: translateX(0) !important; }

    #modalImg { width: 100% !important; height: 100% !important; min-height: 300px; object-fit: cover !important; border-radius: 12px; background: #f1f5f9 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="6" fill="%2394a3b8">Fetching...</text></svg>') center center no-repeat; transition: opacity 0.3s ease-in-out; }
    
    @keyframes popInUI { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes rotateSpinner { 100% { transform: rotate(360deg); } }
    @keyframes dashSpinner { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
    .success-checkmark { animation: scaleCheck 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes scaleCheck { 0% { transform: scale(0); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

    @media screen and (max-width: 850px) {
        html, body { overflow-x: hidden !important; }
        #toast-container { bottom: 20px !important; right: 50% !important; transform: translateX(50%) !important; align-items: center !important; width: 90% !important; }
        .toast { width: 100% !important; justify-content: center !important; }
        .sidebar { height: auto !important; min-height: auto !important; position: relative !important; flex-direction: row !important; flex-wrap: wrap !important; align-items: center !important; justify-content: center !important; padding: 10px !important; z-index: 100 !important; }
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
    @media screen and (max-width: 480px) { #medicineGrid { grid-template-columns: 1fr !important; } }
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

    async getMedicines(force = false) { 
        if (this.cache.medicines && !force) return this.cache.medicines; 
        try { 
            const raw = await this.fetchWithCache(`${API_URL}/ms_medicines`, force); 
            let meds = parseMongooseData(raw).filter(m => m.name);
            meds.forEach(m => { if (!m.id && !m._id && m.name) { m.id = String(m.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); } });
            this.cache.medicines = meds; return this.cache.medicines; 
        } catch(e) { return null; } 
    },
    async saveMedicines(data) { try { await fetch(`${API_URL}/ms_medicines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.medicines = data; globalMedicines = data; await this.invalidateCache(`${API_URL}/ms_medicines`); return { success: true }; } catch(e) { return { success: false }; } },
    async getUsers(force = false) { if (this.cache.users && !force) return this.cache.users; try { const raw = await this.fetchWithCache(`${API_URL}/ms_users`, force); this.cache.users = parseMongooseData(raw); return this.cache.users; } catch(e) { return []; } },
    async saveUsers(data) { try { await fetch(`${API_URL}/ms_users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.users = data; await this.invalidateCache(`${API_URL}/ms_users`); return { success: true }; } catch(e) { return { success: false }; } },
    
    /* 🛠️ FIXED: Bulletproof Deterministic Data-Healer for Legacy Orders */
    async getOrders(force = false) { 
        if (this.cache.orders && !force) return this.cache.orders; 
        try { 
            const raw = await this.fetchWithCache(`${API_URL}/ms_orders`, force); 
            let parsed = parseMongooseData(raw); 
            let needsSave = false;
            parsed.forEach((o, i) => {
                if (!o.id && !o._id) { 
                    // Generates a stable, permanent ID based on Date & User so it never mutates!
                    const sDate = String(o.date || '').replace(/[^a-zA-Z0-9]/g, '');
                    const sUser = String(o.user || '').replace(/[^a-zA-Z0-9]/g, '');
                    o.id = `LGCY_${sDate}_${sUser}_${i}`; 
                    needsSave = true; 
                }
                if (!o.status) { 
                    o.status = 'Pending'; 
                    needsSave = true; 
                }
            });
            if (needsSave && parsed.length > 0) {
                fetch(`${API_URL}/ms_orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed) }).catch(()=>{});
            }
            this.cache.orders = parsed; 
            return this.cache.orders; 
        } catch(e) { return []; } 
    },
    
    async saveOrders(data) { try { const res = await fetch(`${API_URL}/ms_orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if(!res.ok) throw new Error("DB Full"); this.cache.orders = data; await this.invalidateCache(`${API_URL}/ms_orders`); return { success: true }; } catch(e) { return { success: false }; } },
    async getSales(force = false) { if (this.cache.sales && !force) return this.cache.sales; try { const raw = await this.fetchWithCache(`${API_URL}/ms_sales`, force); this.cache.sales = parseMongooseData(raw); return this.cache.sales; } catch(e) { return []; } },
    async saveSales(data) { try { await fetch(`${API_URL}/ms_sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.sales = data; await this.invalidateCache(`${API_URL}/ms_sales`); return { success: true }; } catch(e) { return { success: false }; } },
    async getCarts(force = false) { if (this.cache.carts && !force) return this.cache.carts; try { const res = await fetch(`${API_URL}/ms_user_carts`); this.cache.carts = await res.json(); return this.cache.carts; } catch(e) { return {}; } },
    async saveCarts(data) { try { await fetch(`${API_URL}/ms_user_carts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); this.cache.carts = data; return { success: true }; } catch(e) { return { success: false }; } }
};

function optimizeOrdersDB(ordersArray) {
    if (!Array.isArray(ordersArray)) return ordersArray;
    if (ordersArray.length > 10) {
        for (let i = 0; i < ordersArray.length - 10; i++) {
            if (ordersArray[i].prescriptions && Array.isArray(ordersArray[i].prescriptions)) {
                ordersArray[i].prescriptions.forEach(rx => { if (rx.data && rx.data.length > 100) rx.data = "archived"; });
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
    let container = document.getElementById('toast-container'); 
    if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    let iconColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#3b82f6'));
    let iconClass = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'));
    toast.innerHTML = `<i class="fas ${iconClass}" style="font-size: 1.5rem; color: ${iconColor};"></i> <span>${message}</span>`; 
    container.appendChild(toast);
    requestAnimationFrame(() => { 
        setTimeout(() => toast.classList.add('show'), 10); 
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000); 
    });
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
    users.push({ user, pass, role: 'customer', name, email, mobile, address: '', addresses: [] }); await DB.saveUsers(users);
    showToast(`Welcome to MediShop, ${name}! Redirecting...`, 'success'); setTimeout(() => window.location.href = 'login.html', 1500);
}

function initLivePasswordChecks() {
    const passInput = document.getElementById('regPass'); const criteriaList = document.getElementById('passCriteriaList'); if (!passInput || !criteriaList) return;
    const rules = { length: { el: document.getElementById('rule-length'), regex: /.{8,}/ }, letter: { el: document.getElementById('rule-letter'), regex: /[A-Z]/ }, number: { el: document.getElementById('rule-number'), regex: /\d/ }, special: { el: document.getElementById('rule-special'), regex: /[@$!%*#?&]/ } };
    const iconPass = '<i class="fas fa-check-circle"></i>'; const iconBlank = '<i class="far fa-circle"></i>';      
    passInput.addEventListener('input', (e) => { const password = e.target.value; for (const key in rules) { const rule = rules[key]; if (rule.regex.test(password)) { rule.el.classList.add('met'); rule.el.querySelector('i').outerHTML = iconPass; } else { rule.el.classList.remove('met'); rule.el.querySelector('i').outerHTML = iconBlank; } } });
}

/* =========================================
   5. STORE RENDERING 
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

const antiCacheStyle = document.createElement('style');
antiCacheStyle.innerHTML = `.med-image-wrapper::after { display: none !important; }`;
document.head.appendChild(antiCacheStyle);

function filterMedicines() { 
    if (!Array.isArray(globalMedicines)) globalMedicines = []; 
    globalMedicines.forEach(m => { if (!m.id && !m._id && m.name) { m.id = String(m.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); } });

    const searchEl = document.getElementById('searchInput'); const catEl = document.getElementById('categoryFilter'); 
    const txt = searchEl ? searchEl.value.toLowerCase().trim() : ''; const cat = catEl ? catEl.value : 'All'; 
    const filtered = globalMedicines.filter(m => { if (!m || typeof m !== 'object') return false; const mName = String(m.name || '').toLowerCase(); const mCat = String(m.category || 'General').trim(); return mName.includes(txt) && (cat === 'All' || mCat.toLowerCase() === cat.toLowerCase()); }); 
    const grid = document.getElementById('medicineGrid'); if (!grid) return; 
    if(filtered.length === 0) { grid.innerHTML = "<p style='text-align:center; width:100%; grid-column: 1 / -1; color:#64748b; font-size:1.1rem; padding: 40px;'>No medicines found matching your search.</p>"; return; } 
    
    const defaultFallbackImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"; 
    
    grid.innerHTML = filtered.map(m => { 
        let safeId = m.id || m._id || String(m.name).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); 
        let safeName = m.name || 'Unknown Medicine'; let safePrice = parseFloat(m.price) || 0; let safeCat = m.category || 'General'; let safeExp = m.expiry || 'N/A'; 
        let imgSrc = m.image && typeof m.image === 'string' && m.image.trim() !== '' ? m.image.trim() : defaultFallbackImg; if (imgSrc.toLowerCase().startsWith('file:///')) imgSrc = defaultFallbackImg; 
        let rating = 4 + (String(safeId).charCodeAt(0) % 2 || 0); let starHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating); let reviews = Math.floor(safePrice * 0.5) || 15; 
        
        return `<div class="med-card" onclick="window.openProductModal('${safeId}')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 20px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            ${m.isRx ? '<span class="rx-badge">Rx Required</span>' : ''}
            <span class="med-tag">${safeCat}</span>
            <div class="med-image-wrapper" style="position: relative; overflow: hidden;">
                <img src="${imgSrc}" alt="${safeName}" class="med-card-img" loading="lazy" decoding="async" onerror="this.src='${defaultFallbackImg}'">
                <div class="quick-view-bar" style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(15, 118, 110, 0.95); color: white; text-align: center; padding: 8px 0; font-weight: bold; font-size: 0.95rem;">Quick View</div>
            </div>
            <div class="med-card-content">
                <div class="med-name">${safeName}</div>
                ${m.manufacturer ? `<div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">By ${m.manufacturer}</div>` : ''}
                <div class="med-rating">${starHTML} <span class="reviews">(${reviews} reviews)</span></div>
                <div class="med-meta">Exp: ${safeExp}</div>
                <div class="med-price">₹${safePrice.toFixed(2)}</div>
            </div>
        </div>`; 
    }).join(''); 
}

window.openProductModal = function(id) { 
    if(!document.getElementById('productModal')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'productModal';
        modalDiv.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 99999; backdrop-filter: blur(4px);';
        modalDiv.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <span onclick="window.closeProductModal()" style="position: absolute; top: 15px; right: 20px; font-size: 2rem; cursor: pointer; color: #94a3b8; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</span>
                <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <img id="modalImg" src="" style="width: 100%; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; min-height: 250px;">
                        <div id="modalRxBadge" style="background:#fee2e2; color:#ef4444; padding:8px; text-align:center; font-weight:bold; border-radius:8px; margin-top:10px; display:none;">Rx Required</div>
                    </div>
                    <div style="flex: 1.5; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
                        <div><h2 id="modalName" style="margin: 0; font-size: 2rem; color: #0f172a; font-weight: 800;"></h2><div id="modalCategory" style="color: #64748b; font-size: 1.05rem; margin-top: 5px;"></div></div>
                        <div id="modalRating" style="color: #fbbf24; font-size: 1.2rem;"></div>
                        <div style="font-size: 2.5rem; font-weight: 900; color: #0f766e;">₹<span id="modalPrice"></span></div>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; font-size: 1.05rem;">
                            <div style="color: #64748b;">Batch No:</div> <div id="modalBatch" style="font-weight: 700; text-align: right; color: #1e293b;"></div>
                            <div style="color: #64748b;">Expiry Date:</div> <div id="modalExpiry" style="font-weight: 700; text-align: right; color: #1e293b;"></div>
                            <div style="color: #64748b;">Status:</div> <div id="modalStockStatus" style="font-weight: 700; text-align: right;"></div>
                        </div>
                        <div style="display: flex; gap: 15px; margin-top: 20px;">
                            <button id="modalBtnAdd" style="flex: 1; padding: 16px; background: #0f766e; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px rgba(15,118,110,0.2);" onmouseover="this.style.background='#0d9488'" onmouseout="this.style.background='#0f766e'"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                            <button id="modalBtnBuy" style="flex: 1; padding: 16px; background: #f59e0b; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px rgba(245,158,11,0.2);" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'"><i class="fas fa-bolt"></i> Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    const product = globalMedicines.find(m => (String(m.id) === String(id) || String(m._id) === String(id))); 
    if(!product) { showToast("Error: Product Data Not Found.", "error"); return; }
    
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
    
    document.getElementById('modalBtnAdd').setAttribute('onclick', `addToCart('${id}'); window.closeProductModal();`); document.getElementById('modalBtnBuy').setAttribute('onclick', `buyNow('${id}')`); 
    
    document.getElementById('productModal').style.display = 'block'; 
}

window.closeProductModal = function() { 
    const modal = document.getElementById('productModal');
    if(modal) modal.style.display = 'none'; 
}

async function buyNow(id) { await addToCart(id); window.closeProductModal(); window.location.href = 'cart.html'; }

/* =========================================
   6. CART LOGIC
   ========================================= */
async function syncCartToDB() { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(user && user.role === 'customer') { let carts = await DB.getCarts(); carts[user.user] = JSON.parse(localStorage.getItem('ms_cart')) || []; DB.saveCarts(carts); } }

async function addToCart(id) { if(globalMedicines.length === 0) globalMedicines = await DB.getMedicines(); const product = globalMedicines.find(m => (m.id == id || m._id == id)); let cart = JSON.parse(localStorage.getItem('ms_cart')) || []; const existing = cart.find(i => (i.id == id || i._id == id)); const safeQty = parseInt(product.qty) || 0; if (existing) { if(existing.qty < safeQty) existing.qty++; else return showToast("Max stock reached!", 'error'); } else { cart.push({ id: product.id || product._id, name: product.name, manufacturer: product.manufacturer, price: product.price, qty: 1, isRx: product.isRx, image: product.image }); } localStorage.setItem('ms_cart', JSON.stringify(cart)); syncCartToDB(); updateCartCount(); showToast("Added to cart!", 'success'); }

async function updateCartItemQty(idx, change) { let cart = JSON.parse(localStorage.getItem('ms_cart')) || []; if (!cart[idx]) return; if (globalMedicines.length === 0) globalMedicines = await DB.getMedicines(); const product = globalMedicines.find(m => (m.id == cart[idx].id || m._id == cart[idx].id)); let newQty = cart[idx].qty + change; if (newQty < 1) return; const safeQty = parseInt(product ? product.qty : 0); if (product && newQty > safeQty) return showToast("Maximum stock limit reached!", 'error'); cart[idx].qty = newQty; localStorage.setItem('ms_cart', JSON.stringify(cart)); syncCartToDB(); renderCart(); updateCartCount(); }

function updateCartCount() { 
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; 
    const count = cart.reduce((sum, i) => sum + i.qty, 0); 
    const badge = document.getElementById('cartCount'); 
    if(badge) {
        badge.innerText = count; 
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

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
let pendingOrderData = { prescriptions: [], status: 'Approved', paymentMethod: 'Credit Card', deliveryAddress: '' };

function processOrder() { 
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); 
    if(!user) { showToast("Login required to checkout!", 'error'); setTimeout(() => window.location.href='login.html', 1500); return; } 
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || []; 
    if(cart.length === 0) return showToast("Cart is empty!", "error"); 
    openAddressModal();
}

function openAddressModal() {
    const user = JSON.parse(localStorage.getItem('ms_currentUser'));
    let addresses = user.addresses || [];
    if (addresses.length === 0 && user.address && user.address.trim() !== '') { addresses = [user.address]; }

    let modalHtml = `
    <div class="product-modal-box" style="max-width:550px; width:90%; padding: 30px; border-radius: 16px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.2); position: relative; max-height: 85vh; display: flex; flex-direction: column; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-shrink: 0;">
            <h2 style="margin:0; color:#0f172a; font-size: 1.6rem; font-weight: 900; display: flex; align-items: center; gap: 10px;"><i class="fas fa-map-marker-alt" style="color: #0f766e;"></i> Select Delivery Address</h2>
            <button onclick="closeModal('dynamicAddressModal')" style="background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #94a3b8; line-height: 1; padding: 0; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>
        <div style="overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            ${addresses.map((addr, idx) => `
                <div style="display:flex; align-items:center; gap:10px;">
                    <div onclick="selectAddressForOrder(${idx})" style="padding:15px; border:2px solid #e2e8f0; border-radius:10px; cursor:pointer; transition:0.3s; display:flex; align-items:center; gap:12px; background:#f8fafc; flex:1;" onmouseover="this.style.borderColor='#0f766e'; this.style.background='#f0fdfa';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';">
                        <i class="fas fa-home" style="color:#0f766e; font-size:1.2rem;"></i>
                        <div style="display:flex; flex-direction:column; flex:1;">
                            <span style="font-size:0.75rem; color:#0f766e; font-weight:bold; text-transform:uppercase; margin-bottom:2px;">Address ${idx+1} ${idx===0 ? '(Default)' : ''}</span>
                            <span style="color:#1e293b; font-weight:600; line-height:1.4;">${addr}</span>
                        </div>
                        <i class="fas fa-chevron-right" style="color:#94a3b8;"></i>
                    </div>
                    <button onclick="window.deleteAddress(${idx}, true)" style="padding:15px; background:#fee2e2; color:#ef4444; border:none; border-radius:10px; cursor:pointer; transition:0.3s; height:100%;" onmouseover="this.style.background='#fca5a5'" onmouseout="this.style.background='#fee2e2'" title="Delete Address"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('')}
        </div>
        ${addresses.length < 3 ? `
        <div style="background:#fff; padding:20px; border-radius:12px; border:2px dashed #cbd5e1;">
            <h4 style="margin:0 0 10px 0; color:#0f172a; font-size:1.1rem;"><i class="fas fa-plus-circle" style="color:#0f766e;"></i> Add New Address</h4>
            <textarea id="newAddressInput" rows="3" placeholder="Enter your full delivery address..." style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:8px; resize:none; font-family:inherit; outline:none; box-sizing:border-box; margin-bottom:15px; font-size:0.95rem;"></textarea>
            <button onclick="saveNewAddress()" style="width:100%; padding:14px; background:#0f766e; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1.05rem; transition:0.3s; box-shadow: 0 4px 10px rgba(15,118,110,0.2);" onmouseover="this.style.background='#0d9488'" onmouseout="this.style.background='#0f766e'">Save & Deliver Here</button>
        </div>
        ` : `<div style="text-align:center; padding:15px; background:#fee2e2; color:#b91c1c; border-radius:8px; font-weight:bold;"><i class="fas fa-info-circle"></i> Maximum of 3 addresses reached.</div>`}
    </div>`;

    let modal = document.getElementById('dynamicAddressModal'); 
    if(!modal) { modal = document.createElement('div'); modal.id = 'dynamicAddressModal'; document.body.appendChild(modal); }
    modal.className = 'product-modal-overlay'; 
    modal.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:3000; align-items:center; justify-content:center; backdrop-filter:blur(5px);'; 
    modal.innerHTML = modalHtml;
}

window.deleteAddress = async function(index, fromCheckout = false) {
    if(!confirm("Are you sure you want to delete this address?")) return;
    let user = JSON.parse(localStorage.getItem('ms_currentUser'));
    if(!user || !user.addresses) return;
    user.addresses.splice(index, 1); user.address = user.addresses.length > 0 ? user.addresses[0] : '';
    localStorage.setItem('ms_currentUser', JSON.stringify(user));
    let allUsers = await DB.getUsers(); let uIdx = allUsers.findIndex(u => u && u.user === user.user);
    if(uIdx > -1) { allUsers[uIdx].addresses = user.addresses; allUsers[uIdx].address = user.address; await DB.saveUsers(allUsers); }
    showToast("Address deleted successfully", "info");
    if(fromCheckout) openAddressModal(); else renderUserProfile(); 
};

async function saveNewAddress() {
    const input = document.getElementById('newAddressInput').value.trim();
    if(!input) return showToast("Please enter an address.", "error");
    let user = JSON.parse(localStorage.getItem('ms_currentUser'));
    if(!user.addresses) user.addresses = user.address && user.address.trim() !== '' ? [user.address] : [];
    if(user.addresses.length >= 3) return showToast("Maximum 3 addresses allowed.", "error");
    user.addresses.push(input); user.address = user.addresses[0]; 
    localStorage.setItem('ms_currentUser', JSON.stringify(user));
    let allUsers = await DB.getUsers(); let uIdx = allUsers.findIndex(u => u && u.user === user.user);
    if(uIdx > -1) { allUsers[uIdx].addresses = user.addresses; allUsers[uIdx].address = user.address; await DB.saveUsers(allUsers); }
    showToast("Address saved!", "success");
    selectAddressForOrder(user.addresses.length - 1);
}

function selectAddressForOrder(index) {
    const user = JSON.parse(localStorage.getItem('ms_currentUser'));
    const addresses = user.addresses || (user.address ? [user.address] : []);
    pendingOrderData.deliveryAddress = addresses[index];
    closeModal('dynamicAddressModal'); processRxCheck();
}

function processRxCheck() {
    const cart = JSON.parse(localStorage.getItem('ms_cart')) || [];
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
    Promise.all(filePromises).then(results => { pendingOrderData.prescriptions = results; pendingOrderData.status = 'Pending'; document.getElementById('dynamicRxModal').style.display = 'none'; openPaymentModal(); });
}

function openPaymentModal() { const cart = JSON.parse(localStorage.getItem('ms_cart')); document.getElementById('payModalTotal').innerText = `₹` + cart.reduce((acc, i) => acc + ((parseFloat(i.price)||0) * i.qty), 0).toFixed(2); document.getElementById('paymentModal').style.display = 'flex'; switchPayTab('cc'); initPaymentMasks(); }
function switchPayTab(tabId) { document.querySelectorAll('.pay-tab').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('.pay-tab-content').forEach(content => content.classList.remove('active')); if(tabId === 'cc') { document.querySelector('.pay-tab:nth-child(1)').classList.add('active'); document.getElementById('tab-cc').classList.add('active'); pendingOrderData.paymentMethod = 'Credit Card'; } else if (tabId === 'upi') { document.querySelector('.pay-tab:nth-child(2)').classList.add('active'); document.getElementById('tab-upi').classList.add('active'); pendingOrderData.paymentMethod = 'UPI / QR'; } else { document.querySelector('.pay-tab:nth-child(3)').classList.add('active'); document.getElementById('tab-cod').classList.add('active'); pendingOrderData.paymentMethod = 'Cash on Delivery'; } }
function initPaymentMasks() { const ccNum = document.getElementById('ccNumber'); const ccExp = document.getElementById('ccExpiry'); if(ccNum) { ccNum.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim(); const icon = document.querySelector('#tab-cc .cc-icon.fa-credit-card'); if(icon) icon.className = e.target.value.startsWith('4') ? 'fab fa-cc-visa cc-icon' : (e.target.value.startsWith('5') ? 'fab fa-cc-mastercard cc-icon' : 'far fa-credit-card cc-icon'); }); } if(ccExp) { ccExp.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{2})/, '$1/').trim().slice(0,5); }); } }

function showPaymentProcessing() { 
    let loader = document.getElementById('paymentLoader'); 
    if (!loader) { loader = document.createElement('div'); loader.id = 'paymentLoader'; loader.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(248, 250, 252, 0.98); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(12px); font-family: "Segoe UI", sans-serif; transition: all 0.3s ease;'; document.body.appendChild(loader); } 
    loader.innerHTML = `<div style="background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); text-align: center; max-width: 420px; width: 90%; position:relative; animation: popInUI 0.4s cubic-bezier(0.16, 1, 0.3, 1);"><div style="position: relative; width: 90px; height: 90px; margin: 0 auto 25px auto;"><svg viewBox="0 0 50 50" style="animation: rotateSpinner 2s linear infinite; width: 100%; height: 100%;"><circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="#14b8a6" stroke-linecap="round" style="animation: dashSpinner 1.5s ease-in-out infinite;"></circle></svg></div><h2 style="color: #0f172a; font-size: 2rem; margin:0 0 10px 0; font-weight: 800; letter-spacing: -0.5px;">Processing Payment...</h2><p style="color: #64748b; font-size: 1.05rem; margin: 0; font-weight: 500;">Please do not close this window.</p></div>`;
    loader.style.opacity = '1'; loader.style.display = 'flex'; 
    const payModal = document.getElementById('paymentModal'); if(payModal) payModal.style.display = 'none'; 
}

function showPaymentSuccess(msg) { 
    let loader = document.getElementById('paymentLoader'); if(!loader) return; 
    loader.children[0].style.opacity = '0'; loader.children[0].style.transform = 'scale(0.95)'; loader.children[0].style.transition = 'all 0.2s ease';
    setTimeout(() => {
        loader.innerHTML = `<div style="background: white; padding: 50px 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); text-align: center; max-width: 420px; width: 90%; position:relative; animation: popInUI 0.4s cubic-bezier(0.16, 1, 0.3, 1);"><div class="success-checkmark" style="background: #10b981; color: white; width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; margin: 0 auto 25px auto; box-shadow: 0 10px 25px -5px rgba(16,185,129,0.4);"><i class="fas fa-check"></i></div><h2 style="color: #0f172a; font-size: 2.2rem; margin:0 0 12px 0; font-weight: 900; letter-spacing: -0.5px;">Order Placed!</h2><p style="color: #0f766e; font-size: 1.15rem; font-weight: 600; margin-bottom: 30px; background: #f0fdfa; padding: 10px; border-radius: 8px; display: inline-block;">${msg}</p><button onclick="document.getElementById('paymentLoader').style.display='none'; renderCart(); updateCartCount();" style="background:#0f766e; color:white; border:none; padding:16px 35px; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; width: 100%; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(15,118,110,0.2), 0 2px 4px -1px rgba(15,118,110,0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(15,118,110,0.3), 0 4px 6px -2px rgba(15,118,110,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(15,118,110,0.2), 0 2px 4px -1px rgba(15,118,110,0.1)';">Continue Shopping</button></div>`;
    }, 200);
}

function confirmPayment() { 
    if (pendingOrderData.paymentMethod === 'Credit Card') { 
        const ccNum = document.getElementById('ccNumber') ? document.getElementById('ccNumber').value.replace(/\s+/g, '') : ''; const ccExp = document.getElementById('ccExpiry') ? document.getElementById('ccExpiry').value : ''; const ccCvv = document.getElementById('ccCvv') ? document.getElementById('ccCvv').value : ''; 
        if (!ccNum || ccNum.length < 15) return showToast("Please enter a valid Card Number.", "error"); if (!ccExp || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(ccExp)) return showToast("Please enter a valid Expiry Date (MM/YY).", "error"); if (!ccCvv || ccCvv.length < 3) return showToast("Please enter a valid CVV.", "error"); 
    } 
    showPaymentProcessing(); setTimeout(() => { submitCheckout(); }, 500);
}

async function submitCheckout() {
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); const cart = JSON.parse(localStorage.getItem('ms_cart')); 
    let totalAmt = cart.reduce((acc, i) => acc + ((parseFloat(i.price)||0) * i.qty), 0); const now = new Date();
    const newOrder = { id: Date.now(), date: now.toLocaleString('en-IN'), user: user.name, email: user.email, mobile: user.mobile, address: pendingOrderData.deliveryAddress || user.address, items: cart, total: totalAmt, payment: pendingOrderData.paymentMethod, status: pendingOrderData.status, prescriptions: pendingOrderData.prescriptions };

    try {
        const [meds, sales, orders, carts] = await Promise.all([DB.getMedicines(true), DB.getSales(true), DB.getOrders(true), DB.getCarts(true)]);
        cart.forEach(c => { const idx = meds.findIndex(m => m && (m.id == c.id || m._id == c.id)); if(idx > -1) meds[idx].qty -= c.qty; });
        orders.push(newOrder); const optimizedOrders = optimizeOrdersDB(orders);

        if(newOrder.status === 'Approved') { 
            const todayStr = new Date().toISOString().split('T')[0];
            cart.forEach(i => { sales.push({ dateTime: now.toLocaleString('en-IN'), date: todayStr, item: i.name, qty: i.qty, total: (parseFloat(i.price)||0) * i.qty, user: user.name }); }); 
        }
        carts[user.user] = []; 
        
        const results = await Promise.all([DB.saveMedicines(meds), DB.saveOrders(optimizedOrders), DB.saveSales(sales), DB.saveCarts(carts)]);
        if (results.some(r => !r.success)) throw new Error("Database rejected payload.");

        localStorage.setItem('ms_cart', JSON.stringify([])); updateCartCount();
        let msg = newOrder.status === 'Pending' ? "Waiting for Admin Approval." : "Payment successful."; showPaymentSuccess(msg);
    } catch(e) { console.error("Save failed", e); document.getElementById('paymentLoader').style.display = 'none'; showToast("Database Overload: Failed to save. Please try again.", "error"); }
}

/* =========================================
   8. FOOTER MODALS & USER PROFILE
   ========================================= */
function showInfoModal(type) { let modal = document.getElementById('infoModal'); if (!modal) { modal = document.createElement('div'); modal.id = 'infoModal'; modal.className = 'product-modal-overlay'; modal.style.display = 'none'; modal.style.position = 'fixed'; modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%'; modal.style.background = 'rgba(0,0,0,0.7)'; modal.style.zIndex = '3000'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.innerHTML = `<div class="product-modal-box" style="background:white; padding:40px; border-radius:15px; max-width:650px; width:90%; position:relative; text-align:left; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"><span onclick="document.getElementById('infoModal').style.display='none'" style="position:absolute; top:15px; right:20px; font-size:1.8rem; cursor:pointer; color:#94a3b8; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</span><h2 id="infoModalTitle" style="color: #0f766e; margin-top: 0; margin-bottom: 20px; font-size: 1.8rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-weight: 800;"></h2><div id="infoModalContent" style="color: #475569; font-size: 1.05rem; line-height: 1.7;"></div></div>`; document.body.appendChild(modal); } const title = document.getElementById('infoModalTitle'); const content = document.getElementById('infoModalContent'); if (type === 'about') { title.innerHTML = '<i class="fas fa-info-circle"></i> About MediShop'; content.innerHTML = `<p>Welcome to <strong>MediShop</strong>, your trusted online pharmacy. Our mission is to make healthcare accessible, affordable, and convenient.</p><p>We deliver 100% genuine medicines directly to your doorstep. With features like easy prescription uploads, secure payments, and fast delivery, we strive to provide a seamless healthcare experience.</p><div style="background: #f0fdfa; padding: 15px 20px; border-left: 4px solid #0f766e; border-radius: 6px; margin: 20px 0; color: #0f172a;">This project is developed by <strong>Thakor Viraj Ganpatsinh</strong>, with the aim of prioritizing your health and making pharmacy management simple and reliable.</div><p style="font-weight:bold; color: #0f766e;">Your health, delivered safely.</p>`; } else if (type === 'support') { title.innerHTML = '<i class="fas fa-headset"></i> Contact Support'; content.innerHTML = `<p>If you need any help or have questions regarding your order or prescriptions, our support team is here to assist you.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;"><div style="margin-bottom: 12px;"><i class="fas fa-envelope" style="color: #0f766e; font-size: 1.2rem; margin-right: 10px;"></i> Email: <a href="mailto:support@medishop.com" style="color: #0f766e; text-decoration: none;">support@medishop.com</a></div><div><i class="fas fa-phone-alt" style="color: #0f766e; font-size: 1.2rem; margin-right: 10px;"></i> Phone: +91 1800-123-4567</div></div><p><strong>You can contact us for:</strong></p><ul style="padding-left: 20px; color: #334155; margin-bottom: 20px;"><li style="margin-bottom: 5px;">Prescription or order issues</li><li style="margin-bottom: 5px;">Account-related problems</li><li style="margin-bottom: 5px;">Delivery tracking</li><li style="margin-bottom: 5px;">Feedback and suggestions</li></ul><p style="font-weight: bold; color: #0f766e;">We aim to respond to all queries as quickly as possible to ensure a smooth user experience.</p>`; } else if (type === 'policy') { title.innerHTML = '<i class="fas fa-undo-alt"></i> Return Policy'; content.innerHTML = `<p>Since health and safety are our top priorities, we <strong>do not offer returns or physical product exchanges on opened or used medicines.</strong></p><p>However, we are absolutely committed to your satisfaction. If you face any issues with your delivery, you can easily contact our support team for assistance.</p><p><strong>In case of delivery problems or incorrect items, we will provide:</strong></p><ul style="padding-left: 20px; color: #334155; margin-bottom: 20px;"><li style="margin-bottom: 5px;">Replacements for damaged items</li><li style="margin-bottom: 5px;">Full support for incorrect orders</li><li style="margin-bottom: 5px;">Guidance for proper medicine storage</li></ul><div style="background: #fffbeb; padding: 15px 20px; border-left: 4px solid #f59e0b; border-radius: 6px; color: #92400e; font-weight: bold;"><i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i> Please report any issues within 7 days of receiving your order so we can resolve them promptly.</div>`; } modal.style.display = 'flex'; }

async function renderUserProfile() { 
    const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(!user) return; 
    if(document.getElementById('sidebarName')) document.getElementById('sidebarName').innerText = user.name; 
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = user.name; 
    if(document.getElementById('profileUser')) document.getElementById('profileUser').innerText = "@" + user.user; 
    if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email || "Not Provided"; 
    if(document.getElementById('profileMobile')) document.getElementById('profileMobile').innerText = user.mobile ? "+91 " + user.mobile : "Not Provided"; 
    
    if(document.getElementById('profileAddress')) {
        let addrText = `<div style="color: #64748b; font-style: italic;">No Address Provided. Please checkout or click 'Edit Profile' to add one.</div>`;
        if(user.addresses && user.addresses.length > 0) {
            addrText = user.addresses.map((a, i) => `<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px 15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;"><div><span style="display:block; font-size:0.8rem; color:#0f766e; font-weight:bold; margin-bottom:4px; text-transform:uppercase;">Address ${i+1} ${i===0 ? '(Default)' : ''}</span><span style="color:#1e293b; font-weight:600;">${a}</span></div><button onclick="window.deleteAddress(${i}, false)" style="background:#fee2e2; border:none; color:#ef4444; width:35px; height:35px; border-radius:8px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#fca5a5'" onmouseout="this.style.background='#fee2e2'" title="Delete Address"><i class="fas fa-trash-alt"></i></button></div>`).join('');
        } else if (user.address) {
             addrText = `<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px 15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:10px;"><div><span style="display:block; font-size:0.8rem; color:#0f766e; font-weight:bold; margin-bottom:4px; text-transform:uppercase;">Address 1 (Default)</span><span style="color:#1e293b; font-weight:600;">${user.address}</span></div></div>`;
        }
        document.getElementById('profileAddress').innerHTML = addrText;
    }

    const allOrders = await DB.getOrders(); const userOrders = allOrders.filter(o => o && o.user === user.name).reverse(); const tbody = document.getElementById('userOrdersBody'); if(!tbody) return; if(userOrders.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#64748b;">No orders found. Start shopping to see history here!</td></tr>'; return; } tbody.innerHTML = userOrders.map(o => { let badgeClass = ''; let badgeText = o.status; if(o.status === 'Pending') { badgeClass = 'status-pending'; badgeText = 'Processing Rx'; } else if(o.status === 'Approved') { badgeClass = 'status-approved'; badgeText = 'Completed'; } else { badgeClass = 'status-rejected'; badgeText = 'Cancelled'; } let itemList = o.items.map(i => `<span style="display:inline-block; background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.85rem; margin:2px;">${i.qty}x ${i.name}</span>`).join(' '); return `<tr><td><span class="order-id" style="font-weight:bold; color:#0f172a;">#${(o.id || o._id || 'ORD').toString().replace('LGCY_','').slice(-6).toUpperCase()}</span><br><span class="order-date" style="font-size:0.85rem; color:#64748b;">${o.date}</span></td><td>${itemList}</td><td class="order-total" style="font-weight:bold; color:#0f766e;">₹${parseFloat(o.total).toFixed(2)}</td><td><span class="status-badge ${badgeClass}" style="padding:5px 10px; border-radius:6px; font-size:0.85rem; font-weight:bold; background:${o.status==='Pending'?'#fef08a':(o.status==='Approved'?'#bbf7d0':'#fecaca')}; color:${o.status==='Pending'?'#92400e':(o.status==='Approved'?'#166534':'#991b1b')};">${badgeText}</span></td></tr>`; }).join(''); 
}

function openEditProfileModal() { const user = JSON.parse(localStorage.getItem('ms_currentUser')); if(document.getElementById('editEmail')) document.getElementById('editEmail').value = user.email || ''; if(document.getElementById('editMobile')) document.getElementById('editMobile').value = user.mobile || ''; if(document.getElementById('editAddress')) document.getElementById('editAddress').value = user.address || ''; document.getElementById('editProfileModal').style.display = 'flex'; }
function closeEditProfileModal() { document.getElementById('editProfileModal').style.display = 'none'; }
async function saveProfileDetails(e) { e.preventDefault(); const newEmail = document.getElementById('editEmail').value; const newMobile = document.getElementById('editMobile').value; const newAddress = document.getElementById('editAddress').value; let user = JSON.parse(localStorage.getItem('ms_currentUser')); user.email = newEmail; user.mobile = newMobile; if (newAddress.trim() !== '') { user.address = newAddress; if(!user.addresses) user.addresses = []; if(user.addresses.length > 0) user.addresses[0] = newAddress; else user.addresses.push(newAddress); } localStorage.setItem('ms_currentUser', JSON.stringify(user)); let allUsers = await DB.getUsers(); let userIndex = allUsers.findIndex(u => u && u.user === user.user); if(userIndex > -1) { allUsers[userIndex].email = newEmail; allUsers[userIndex].mobile = newMobile; allUsers[userIndex].address = user.address; allUsers[userIndex].addresses = user.addresses; await DB.saveUsers(allUsers); } showToast("Profile Updated Successfully!", "success"); closeEditProfileModal(); renderUserProfile(); }

/* =========================================
   9. ADMIN DASHBOARD
   ========================================= */
function showSection(id) { 
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none'); 
    const target = document.getElementById(id);
    if(target) target.style.display = 'block'; 
    document.querySelectorAll('.sidebar .menu-item').forEach(item => item.classList.remove('active')); 
    const activeBtn = document.querySelector(`.sidebar .menu-item[onclick*="${id}"]`); 
    if (activeBtn) activeBtn.classList.add('active'); 
    if(id === 'orders' || id === 'dashboard' || id === 'inventory') renderAdminDashboard(true);
}

let isEditing = false, editId = null;
if(document.getElementById('addMedicineForm')) { document.getElementById('addMedicineForm').addEventListener('submit', async (e) => { e.preventDefault(); let meds = await DB.getMedicines(); if(!Array.isArray(meds)) meds = []; const defaultImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"; let rawImg = document.getElementById('medImageURL').value.trim(); if (rawImg.toLowerCase().startsWith('file:///')) rawImg = defaultImg; const newMed = { id: isEditing ? editId : Date.now(), name: document.getElementById('medName').value, manufacturer: document.getElementById('medManufacturer').value, category: document.getElementById('medCategory').value, batch: document.getElementById('medBatch').value, expiry: document.getElementById('medExpiry').value, price: parseFloat(document.getElementById('medPrice').value) || 0, qty: parseInt(document.getElementById('medQty').value) || 0, limit: parseInt(document.getElementById('medLimit').value) || 0, isRx: document.getElementById('medRx').checked, image: rawImg !== '' ? rawImg : defaultImg }; if(isEditing) { const idx = meds.findIndex(m => m && (m.id == editId || m._id == editId)); if (rawImg === '') newMed.image = meds[idx].image || defaultImg; meds[idx] = newMed; showToast("Updated Successfully!", 'success'); } else { meds.push(newMed); showToast("Added Successfully!", 'success'); } await DB.saveMedicines(meds); cancelEdit(); renderAdminDashboard(); showSection('inventory'); }); }
function cancelEdit() { isEditing = false; editId = null; if(document.getElementById('addMedicineForm')) { document.getElementById('addMedicineForm').reset(); document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Medicine'; document.getElementById('submitMedBtn').innerHTML = '<i class="fas fa-save"></i> Save Medicine'; document.getElementById('cancelEditBtn').style.display = "none"; showSection('inventory'); } }
async function editMed(id) { const meds = await DB.getMedicines(); const m = meds.find(x => x && (x.id == id || x._id == id)); if(m) { document.getElementById('medName').value = m.name || ''; document.getElementById('medManufacturer').value = m.manufacturer || ''; document.getElementById('medCategory').value = m.category || 'General'; document.getElementById('medBatch').value = m.batch || ''; document.getElementById('medExpiry').value = m.expiry || ''; document.getElementById('medPrice').value = m.price || 0; document.getElementById('medQty').value = m.qty || 0; document.getElementById('medLimit').value = m.limit || 0; document.getElementById('medImageURL').value = m.image || ''; document.getElementById('medRx').checked = m.isRx || false; isEditing = true; editId = id; document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Update Medicine'; document.getElementById('submitMedBtn').innerHTML = '<i class="fas fa-save"></i> Update Medicine'; document.getElementById('cancelEditBtn').style.display = "inline-block"; showSection('add-medicine'); } }
async function deleteMed(id) { if(confirm("Delete this medicine permanently?")) { let meds = await DB.getMedicines(); meds = meds.filter(m => m && (m.id != id && m._id != id)); await DB.saveMedicines(meds); renderAdminDashboard(); showToast("Deleted", 'error'); } }

async function updateChart(period, salesData) {
    const canvas = document.getElementById('salesChart'); if (!canvas) return;
    let cachedSalesForChart = salesData ? salesData : await DB.getSales();
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

function showAdminPendingAlert(count) {
    let existing = document.getElementById('admin-pending-alert');
    if (existing) {
        const textEl = existing.querySelector('.pending-text');
        if(textEl) textEl.innerText = `${count} Rx order(s) pending approval.`;
        return;
    }
    const alertBox = document.createElement('div'); alertBox.id = 'admin-pending-alert';
    alertBox.innerHTML = `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="this.remove(); showSection('orders');"><i class="fas fa-bell" style="font-size: 1.8rem; color: #f59e0b;"></i><div><h4 style="margin: 0 0 5px 0; color: #92400e; font-size: 1.1rem; font-weight: bold;">Action Required</h4><p class="pending-text" style="margin: 0; color: #b45309; font-weight: 600; font-size: 0.95rem;">${count} Rx order(s) pending approval.</p></div></div>`;
    alertBox.style.cssText = 'position: fixed; top: 85px; right: 30px; z-index: 9999; animation: popInUI 0.4s ease-out;'; document.body.appendChild(alertBox);
}

function updateAdminSidebarBadge(count) {
    const userOrdersBtn = Array.from(document.querySelectorAll('.sidebar .menu-item')).find(el => el.innerText.includes('User Orders') || el.innerText.includes('Orders'));
    if (userOrdersBtn) {
        let badge = userOrdersBtn.querySelector('.admin-badge');
        if (!badge) { badge = document.createElement('span'); badge.className = 'admin-badge'; badge.style.cssText = 'background: #ef4444; color: white; padding: 2px 7px; border-radius: 12px; font-size: 0.8rem; margin-left: auto; font-weight: bold; box-shadow: 0 2px 5px rgba(239,68,68,0.4);'; userOrdersBtn.style.display = 'flex'; userOrdersBtn.style.alignItems = 'center'; userOrdersBtn.appendChild(badge); }
        badge.innerText = count; badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

let globalOrdersForAdmin = []; 
let previousOrdersString = '';

async function renderAdminDashboard(forceServerRefresh = true) {
    const drawUI = (meds, allSales, orders) => {
        const currentOrdersString = JSON.stringify(orders);
        if (forceServerRefresh && previousOrdersString === currentOrdersString) return; 
        previousOrdersString = currentOrdersString;

        globalOrdersForAdmin = Array.isArray(orders) ? orders : [];
        const safeMeds = Array.isArray(meds) ? meds : [];
        const sales = (Array.isArray(allSales) ? allSales : []).filter(s => s.item && s.item.toLowerCase() !== 'demo item');
        
        let stockVal = safeMeds.reduce((sum, m) => sum + ((parseFloat(m.price) || 0) * (parseInt(m.qty) || 0)), 0);
        let lowStock = safeMeds.filter(m => (parseInt(m.qty) || 0) < (parseInt(m.limit) || 0)).length;

        const todayStr = new Date().toISOString().split('T')[0];
        let daily = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);

        if(document.getElementById('lowStockCount')) document.getElementById('lowStockCount').innerText = lowStock;
        if(document.getElementById('totalStockValue')) document.getElementById('totalStockValue').innerText = `₹${stockVal.toFixed(2)}`;
        if(document.getElementById('dailySales')) document.getElementById('dailySales').innerText = `₹${daily.toFixed(2)}`;

        const invBody = document.getElementById('inventoryTableBody');
        if (invBody) {
            invBody.innerHTML = safeMeds.map(m => {
                let safePrice = parseFloat(m.price) || 0; let safeQty = parseInt(m.qty) || 0; let safeLimit = parseInt(m.limit) || 0; let safeId = m.id || m._id;
                return `<tr class="${safeQty < safeLimit ? 'stock-low' : ''}"><td><strong style="color:#1e293b;">${m.name || 'Unknown'}</strong><br><small style="color: #64748b;">${m.manufacturer || ''}</small></td><td><span style="background:#f1f5f9; padding:4px 10px; border-radius:15px; font-size:0.85rem; font-weight:600;">${m.category || 'General'}</span></td><td>${m.expiry || 'N/A'}</td><td style="font-weight:bold;">₹${safePrice.toFixed(2)}</td><td><span style="${safeQty < safeLimit ? 'color:red; font-weight:bold;' : 'color:#333;'}">${safeQty}</span></td><td><button onclick="editMed('${safeId}')" class="action-icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button> <button onclick="deleteMed('${safeId}')" class="action-icon-btn delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button></td></tr>`;
            }).join('');
        }

        const salesBody = document.getElementById('salesTableBody');
        if (salesBody) {
            salesBody.innerHTML = sales.slice().reverse().slice(0, 10).map(s => { 
                let safeTotal = parseFloat(s.total) || 0; 
                return `<tr><td>${s.dateTime || 'N/A'}</td><td>${s.item || 'Unknown'}</td><td><strong>${s.qty || 0}</strong></td><td style="color:var(--primary); font-weight:bold;">₹${safeTotal.toFixed(2)}</td><td>${s.user || 'Guest'}</td></tr>`; 
            }).join('');
        }

        let medSalesCount = {}; sales.forEach(s => { if(s.item) medSalesCount[s.item] = (medSalesCount[s.item] || 0) + (parseInt(s.qty) || 0); });
        let sortedMeds = Object.keys(medSalesCount).sort((a,b) => medSalesCount[b] - medSalesCount[a]).slice(0, 5);
        let doughnutData = sortedMeds.map(m => medSalesCount[m]);
        const ctxDoughnut = document.getElementById('topMedicineChart');
        if (ctxDoughnut) { if (window.topMedChart instanceof Chart) window.topMedChart.destroy(); window.topMedChart = new Chart(ctxDoughnut.getContext('2d'), { type: 'doughnut', data: { labels: sortedMeds.length ? sortedMeds : ['No Sales Yet'], datasets: [{ data: doughnutData.length ? doughnutData : [1], backgroundColor: ['#0f766e', '#14b8a6', '#2dd4bf', '#99f6e4', '#ccfbf1'], borderWidth: 2, borderColor: '#ffffff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } }); }
        updateChart('daily', sales);

        let pendingBody = document.getElementById('pendingOrdersBody');
        if (!pendingBody) {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5'));
            const targetHeading = headings.find(h => h.innerText && (h.innerText.toUpperCase().includes('CUSTOMER ORDERS') || h.innerText.toUpperCase().includes('USER ORDERS')));
            
            if (targetHeading) {
                const wrapper = targetHeading.parentElement;
                let sibling = targetHeading.nextElementSibling;
                while (sibling) { let next = sibling.nextElementSibling; sibling.remove(); sibling = next; }
                
                const tableWrapper = document.createElement('div');
                tableWrapper.style.cssText = 'overflow-x: auto; margin-top: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;';
                tableWrapper.innerHTML = `
                    <table style="width: 100%; border-collapse: collapse; min-width: 900px;">
                        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <tr>
                                <th style="padding: 15px; text-align: left; color: #64748b; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">Order Details</th>
                                <th style="padding: 15px; text-align: left; color: #64748b; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">Customer & Delivery</th>
                                <th style="padding: 15px; text-align: left; color: #64748b; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">Items & Payment Info</th>
                                <th style="padding: 15px; text-align: center; color: #64748b; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">Prescription</th>
                                <th style="padding: 15px; text-align: center; color: #64748b; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="pendingOrdersBody"></tbody>
                    </table>
                `;
                wrapper.appendChild(tableWrapper);
                pendingBody = document.getElementById('pendingOrdersBody');
            }
        }

        if(pendingBody) {
            const pendingOrders = globalOrdersForAdmin.filter(o => o.status === 'Pending').sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            pendingBody.innerHTML = pendingOrders.length ? pendingOrders.slice(0, 50).map(o => { 
                if (!o) return '';
                let safeId = o.id || o._id || 'UNKNOWN'; 
                let safeIdStr = safeId.toString();
                
                let displayId = safeIdStr.includes('LGCY') ? safeIdStr.split('_')[1].slice(-6).toUpperCase() : safeIdStr.slice(-6).toUpperCase();
                
                let safeTotal = parseFloat(o.total) || 0; 
                let safeItems = Array.isArray(o.items) ? o.items : [];
                let itemList = safeItems.map(i => `${i.name || 'Item'} (x${i.qty || 1})`).join(', ');
                
                let rxButton = ''; 
                if (Array.isArray(o.prescriptions) && o.prescriptions.length > 0) { 
                    rxButton = `<div style="display:flex; flex-direction:column; gap:8px;">`; 
                    o.prescriptions.forEach(rx => { 
                        rxButton += `<button onclick="viewSpecificRx('${safeId}', '${rx.itemId}')" class="view-rx-btn" style="padding:6px 12px; font-size:0.85rem; background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'"><i class="fas fa-file-medical"></i> Rx: ${rx.name || 'View'}</button>`; 
                    }); 
                    rxButton += `</div>`; 
                } else { 
                    rxButton = `<span style="color:#94a3b8; font-weight:600; font-size:0.95rem;">Not Required</span>`; 
                }

                let safeStatus = o.status || 'Pending';
                let actionContent = ''; 
                if(safeStatus === 'Pending') { 
                    actionContent = `<button onclick="approveOrder(this, '${safeId}')" style="background:#10b981; color:white; border:none; padding:8px 12px; border-radius:6px; margin-bottom:8px; width:100%; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'"><i class="fas fa-check"></i> Approve</button><button onclick="rejectOrder(this, '${safeId}')" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; width:100%; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'"><i class="fas fa-times"></i> Reject</button>`; 
                } else if (safeStatus === 'Approved') { 
                    actionContent = `<div style="background:#d1fae5; color:#059669; padding:8px; border-radius:6px; font-weight:800; font-size:1rem; text-align:center;"><i class="fas fa-check-circle"></i> Accepted</div>`; 
                } else { 
                    actionContent = `<div style="background:#fee2e2; color:#dc2626; padding:8px; border-radius:6px; font-weight:800; font-size:1rem; text-align:center;"><i class="fas fa-times-circle"></i> Rejected</div>`; 
                }
                
                let safePayment = String(o.payment || 'Credit Card');
                let payIcon = safePayment.toLowerCase().includes('cash') ? '<i class="fas fa-money-bill-wave" style="color:#10b981;"></i>' : '<i class="fas fa-credit-card" style="color:#3b82f6;"></i>';
                
                return `<tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.3s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'"><td style="vertical-align: top; padding: 15px;"><div style="color:#0f766e; font-size:1.05rem; font-weight: 800; margin-bottom: 4px;">ORD-${displayId}</div><div style="color:#64748b; font-size: 0.85rem; margin-bottom: 8px;">${o.date || ''}</div><div style="font-weight:900; font-size:1.2rem; color:#1e293b;">₹${safeTotal.toFixed(2)}</div></td><td style="vertical-align: top; padding: 15px;"><div style="font-weight:bold; color:#1e293b; margin-bottom: 6px; font-size:1.05rem;">${o.user || 'Unknown'}</div><div style="color:#475569; font-size: 0.9rem; margin-bottom: 4px; display:flex; align-items:center; gap:6px;"><i class="fas fa-envelope" style="color:#94a3b8; width: 14px;"></i> ${o.email || 'N/A'}</div><div style="color:#475569; font-size: 0.9rem; margin-bottom: 4px; display:flex; align-items:center; gap:6px;"><i class="fas fa-phone-alt" style="color:#94a3b8; width: 14px;"></i> ${o.mobile || 'N/A'}</div><div style="color:#475569; font-size: 0.9rem; display:flex; align-items:flex-start; gap:6px;"><i class="fas fa-map-marker-alt" style="color:#ef4444; width: 14px; margin-top:3px;"></i> <span style="line-height:1.4;">${o.address || 'N/A'}</span></div></td><td style="vertical-align: top; padding: 15px; max-width: 250px;"><div style="color:#334155; font-size:0.95rem; line-height: 1.5; margin-bottom: 12px; font-weight:500;">${itemList}</div><div style="color:#1e293b; font-weight:700; font-size: 0.9rem; background: #f1f5f9; padding: 6px 10px; border-radius: 6px; display:inline-flex; align-items:center; gap:8px;">${payIcon} ${safePayment}</div></td><td style="vertical-align: middle; padding: 15px; text-align:center;">${rxButton}</td><td style="vertical-align: middle; padding: 15px;">${actionContent}</td></tr>`; 
            }).join('') : '<tr><td colspan="5" style="text-align:center; padding:50px; color:#64748b; font-size:1.1rem; background:#f8fafc;"><i class="fas fa-check-circle" style="font-size:3rem; color:#10b981; margin-bottom:15px; display:block;"></i>All caught up! No pending orders.</td></tr>';
        }
        
        const pendingCount = globalOrdersForAdmin.filter(o => o.status === 'Pending').length;
        if (pendingCount > 0) showAdminPendingAlert(pendingCount);
        else { const alertEl = document.getElementById('admin-pending-alert'); if(alertEl) alertEl.remove(); }
        updateAdminSidebarBadge(pendingCount);
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
    const order = globalOrdersForAdmin.find(o => (String(o.id) === String(orderId) || String(o._id) === String(orderId))); 
    if(order && order.prescriptions) { 
        const rx = order.prescriptions.find(p => String(p.itemId) === String(itemId)); 
        if(rx) { 
            if (rx.data === "archived") return showToast("Image archived to save database space.", "info");
            
            let rxModal = document.getElementById('viewRxModal'); 
            if(!rxModal) {
                rxModal = document.createElement('div');
                rxModal.id = 'viewRxModal';
                rxModal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); z-index:100000; align-items:center; justify-content:center; backdrop-filter:blur(6px);';
                rxModal.innerHTML = `
                    <div style="position:relative; background:white; padding:25px; border-radius:16px; max-width:90%; max-height:90vh; display:flex; flex-direction:column; align-items:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
                        <button onclick="closeModal('viewRxModal')" style="position:absolute; top:-15px; right:-15px; background:#ef4444; color:white; border:none; width:45px; height:45px; border-radius:50%; font-size:1.8rem; cursor:pointer; box-shadow:0 4px 10px rgba(239,68,68,0.4); display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">&times;</button>
                        <h3 style="margin:0 0 20px 0; color:#0f172a; font-size:1.5rem; font-weight:800; display:flex; align-items:center; gap:10px;"><i class="fas fa-file-medical" style="color:#0f766e;"></i> Prescription Review</h3>
                        <img id="rxImagePreview" src="" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:8px; border:2px solid #e2e8f0; background:#f8fafc;">
                    </div>
                `;
                document.body.appendChild(rxModal);
            }
            
            document.getElementById('rxImagePreview').src = rx.data; 
            rxModal.style.display = 'flex'; 
        } 
    } 
}

/* 🛠️ UPGRADED: Wait Timer to guarantee you see the "Accepted" message before clearing it */
async function approveOrder(btnElement, oid) { 
    btnElement.disabled = true;
    btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing';
    
    try {
        let orders = await DB.getOrders(true); 
        let rawSales = await DB.getSales(true); 
        let sales = Array.isArray(rawSales) ? rawSales : [];

        let idx = orders.findIndex(o => o && (String(o.id) === String(oid) || String(o._id) === String(oid))); 
        
        // 🛠️ EXTREME FALLBACK: If ID lookup fails, find by matching exact date and user
        if (idx === -1) {
            const targetOrder = globalOrdersForAdmin.find(o => String(o.id) === String(oid));
            if (targetOrder) {
                idx = orders.findIndex(o => o && o.date === targetOrder.date && o.user === targetOrder.user);
            }
        }
        
        if(idx > -1) { 
            if (orders[idx].status !== 'Pending') {
                showToast(`Order already ${orders[idx].status} by another Admin.`, "warning");
                renderAdminDashboard(true);
                return;
            }
            
            orders[idx].status = 'Approved'; 
            const todayStr = new Date().toISOString().split('T')[0];
            
            let safeItems = Array.isArray(orders[idx].items) ? orders[idx].items : [];
            safeItems.forEach(i => { 
                sales.push({ 
                    dateTime: new Date().toLocaleString('en-IN'), 
                    date: todayStr, 
                    item: i.name || 'Unknown', 
                    qty: i.qty || 1, 
                    total: (parseFloat(i.price)||0) * (i.qty||1), 
                    user: orders[idx].user || 'Guest'
                }); 
            }); 
            
            const optimizedOrders = optimizeOrdersDB(orders);
            
            if(btnElement && btnElement.parentElement) { 
                btnElement.parentElement.innerHTML = `<div style="background:#d1fae5; color:#059669; padding:8px; border-radius:6px; font-weight:800; font-size:1rem; text-align:center; animation: popInUI 0.3s ease-out;"><i class="fas fa-check-circle"></i> Accepted</div>`; 
            }
            
            await Promise.all([DB.saveOrders(optimizedOrders), DB.saveSales(sales)]); 
            showToast("Order Approved!", 'success'); 
            
            setTimeout(() => {
                renderAdminDashboard(true); 
            }, 1500);

        } else {
            showToast("Order not found in Database.", 'error');
            renderAdminDashboard(true);
        }
    } catch(e) {
        showToast("Error syncing to cloud.", 'error');
        btnElement.disabled = false;
        btnElement.innerHTML = '<i class="fas fa-check"></i> Approve';
    }
}

async function rejectOrder(btnElement, oid) { 
    btnElement.disabled = true;
    btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing';
    
    try {
        let orders = await DB.getOrders(true); 
        let meds = await DB.getMedicines(true); 
        let idx = orders.findIndex(o => o && (String(o.id) === String(oid) || String(o._id) === String(oid))); 
        
        if (idx === -1) {
            const targetOrder = globalOrdersForAdmin.find(o => String(o.id) === String(oid));
            if (targetOrder) {
                idx = orders.findIndex(o => o && o.date === targetOrder.date && o.user === targetOrder.user);
            }
        }
        
        if(idx > -1) { 
            if (orders[idx].status !== 'Pending') {
                showToast(`Order already ${orders[idx].status} by another Admin.`, "warning");
                renderAdminDashboard(true);
                return;
            }
            
            orders[idx].status = 'Rejected'; 
            let safeItems = Array.isArray(orders[idx].items) ? orders[idx].items : [];
            safeItems.forEach(i => { let midx = meds.findIndex(m => m && (m.id == i.id || m._id == i.id)); if(midx > -1) meds[midx].qty += i.qty; }); 
            
            const optimizedOrders = optimizeOrdersDB(orders);
            
            if(btnElement && btnElement.parentElement) { 
                btnElement.parentElement.innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:8px; border-radius:6px; font-weight:800; font-size:1rem; text-align:center; animation: popInUI 0.3s ease-out;"><i class="fas fa-times-circle"></i> Rejected</div>`; 
            }
            
            await Promise.all([DB.saveOrders(optimizedOrders), DB.saveMedicines(meds)]); 
            showToast("Order Rejected.", 'info'); 
            
            setTimeout(() => {
                renderAdminDashboard(true); 
            }, 1500);

        } else {
            showToast("Order not found.", 'error');
            renderAdminDashboard(true);
        }
    } catch(e) {
        showToast("Error syncing to cloud.", 'error');
        btnElement.disabled = false;
        btnElement.innerHTML = '<i class="fas fa-times"></i> Reject';
    }
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
    
    if (document.getElementById('inventoryTableBody') || window.location.href.includes('admin')) {
        renderAdminDashboard(true);
        setInterval(() => renderAdminDashboard(true), 10000); 
    }
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', bootUpApp); } else { bootUpApp(); }