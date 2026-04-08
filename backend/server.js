const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 🔴 1. Tell Node to load the hidden .env file
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// 🔴 2. Pull the secret link from the hidden file instead of typing it here!
const MONGO_URI = process.env.MONGO_URI;

// Connect with IPv4 forced to bypass ISP DNS blocks
mongoose.connect(MONGO_URI, {
    family: 4 
})
.then(() => console.log("☁️ Successfully connected to YOUR MongoDB Atlas Cloud!"))
.catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// ... The rest of your server.js code stays exactly the same below this!

/* =========================================
   DATABASE SCHEMA (Flexible Document Store)
   ========================================= */
const DataStoreSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    data: mongoose.Schema.Types.Mixed 
});
const DataStore = mongoose.model('DataStore', DataStoreSchema);

/* =========================================
   API ROUTES (The Bridge to your Frontend)
   ========================================= */
app.get('/api/data/:key', async (req, res) => {
    try {
        const doc = await DataStore.findOne({ key: req.params.key });
        if (!doc) {
            // Return empty object for carts, empty array for everything else
            return res.json(req.params.key === 'ms_user_carts' ? {} : []);
        }
        res.json(doc.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/data/:key', async (req, res) => {
    try {
        // 🔴 REAL-TIME TRACKER: This prints to your terminal every time the frontend sends data
        console.log(`📥 [POST Request Received] Saving data to: ${req.params.key}`);
        
        await DataStore.findOneAndUpdate(
            { key: req.params.key },
            { key: req.params.key, data: req.body },
            { upsert: true, new: true } 
        );
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Save Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
// Render provides process.env.PORT automatically in the cloud!
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});