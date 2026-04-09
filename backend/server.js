require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middleware Settings
app.use(cors());
// Crucial: Increased limit to 50mb so prescription images don't crash the server!
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Connect to MongoDB Atlas Cloud
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('☁️ Successfully connected to YOUR MongoDB Atlas Cloud!'))
    .catch(err => console.error('MongoDB connection error:', err));

// 3. Define Proper Mongoose Schemas
// { strict: false } tells MongoDB to accept whatever data format the frontend sends
const User = mongoose.model('users', new mongoose.Schema({}, { strict: false }));
const Medicine = mongoose.model('medicines', new mongoose.Schema({}, { strict: false }));
const Order = mongoose.model('orders', new mongoose.Schema({}, { strict: false }));
const Sale = mongoose.model('sales', new mongoose.Schema({}, { strict: false }));
const Cart = mongoose.model('carts', new mongoose.Schema({}, { strict: false }));

// Map frontend keys to backend models
const modelMap = {
    'ms_users': User,
    'ms_medicines': Medicine,
    'ms_orders': Order,
    'ms_sales': Sale,
    'ms_user_carts': Cart
};

// 4. GET ROUTE: Send data to the frontend
app.get('/api/data/:key', async (req, res) => {
    try {
        const Model = modelMap[req.params.key];
        if (!Model) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Fetch data and hide the backend _id and __v tags
        const data = await Model.find({}, { _id: 0, __v: 0 });
        
        // Cart data expects an object, everything else expects an array
        if (req.params.key === 'ms_user_carts') {
            res.json(data[0] || {});
        } else {
            res.json(data);
        }
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. POST ROUTE: Save data to MongoDB
app.post('/api/data/:key', async (req, res) => {
    try {
        const Model = modelMap[req.params.key];
        if (!Model) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Clear the old documents to prevent duplicates
        await Model.deleteMany({});
        
        if (Array.isArray(req.body)) {
            // Save arrays as separate individual documents
            if (req.body.length > 0) {
                await Model.insertMany(req.body);
            }
        } else {
            // Save objects as a single document
            if (Object.keys(req.body).length > 0) {
                await Model.create(req.body);
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error("POST Error:", err);
        res.status(500).json({ error: 'Server error saving data' });
    }
});

// 6. Start the Server (Cloudflare & Render Safe)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});