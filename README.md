# 🏥 MediShop Premium E-Pharmacy

![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![Status](https://img.shields.io/badge/Status-Optimized_&_Production_Ready-brightgreen.svg)
![Tech Stack](https://img.shields.io/badge/Tech-HTML_|_CSS_|_JS_|_Node.js_|_MongoDB-teal.svg)

MediShop is a high-performance, full-stack online pharmacy management system. It bridges the gap between patients and medical suppliers by providing a seamless, lightning-fast shopping experience for customers, and a powerful, data-driven analytical dashboard for store administrators.

## ✨ Core Features

### 🛒 For Customers
* **Smart Rx Verification:** Automatically detects restricted medicines and enforces secure prescription image uploads before checkout.
* **Lightning Fast Browsing:** Utilizes advanced browser caching to load the medicine inventory in milliseconds.
* **Order Tracking:** Personal user dashboards to track whether an order is Pending, Accepted, or Rejected by the pharmacy.
* **Dynamic Cart Management:** Real-time stock validation prevents users from adding more items than currently available in the warehouse.

### 💼 For Administrators
* **Real-Time Dashboard:** Beautiful, auto-generating charts showing daily revenue, top-selling medicines, and low-stock alerts.
* **Instant Rx Review:** View high-resolution customer prescriptions and uniquely Approve or Reject orders with a single click.
* **Inventory Control System:** Add, edit, or delete medical stock instantly.
* **Auto-Healing Database:** Built-in data archiving protects the database from overloading, ensuring 100% uptime even with massive order volumes.

## 🔐 Live Demo Access
To fully explore the capabilities of the system, you can use the following demo credentials. 

**Administrator Panel:**
* **Username:** `admin`
* **Password:** `admin123`
*(Note: In a production environment, these credentials would be securely hashed and never exposed. They are provided here strictly for academic evaluation and portfolio demonstration).*

## 🚀 Advanced Technical Optimizations
Unlike standard student projects, MediShop utilizes enterprise-level software optimizations:
1. **Local Image Compression:** Massive 5MB smartphone photos are invisibly compressed to ~100KB using native HTML5 Canvas before touching the server, saving massive database bandwidth.
2. **Optimistic UI Rendering:** Admin actions (like Approving an order) happen instantly on the screen while the database securely syncs in the background, creating a zero-latency experience.
3. **Single-Payload Architecture:** Re-engineered backend API routes accept single-order insertions rather than full-array overwrites, drastically reducing network strain.

## 🛠️ Installation & Setup

**1. Clone the repository:**
\`\`\`bash
git clone https://github.com/viraj-thakor/Medishop-E-Pharmacy.git
\`\`\`

**2. Start the Backend Server:**
\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*(Server will securely connect to MongoDB Atlas and run on port 5000)*

**3. Launch the Frontend:**
Simply open `frontend/index.html` in any modern web browser (or use Live Server in VS Code).

## 👨‍💻 Developer
Developed and engineered by **Thakor Viraj Ganpatsinh**.
