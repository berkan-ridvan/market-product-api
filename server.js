const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/groceryDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Şema ve Model tanımlaması
const ItemSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    price: Number,
    rating: Number,
    url: String
});

const Item = mongoose.model('Item', ItemSchema);

// JSON dosyasından verileri yükle ve MongoDB'ye kaydet
async function loadInitialData() {
    try {
        const count = await Item.countDocuments();
        if (count === 0) {
            const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/items.json'), 'utf8'));
            // Her ürün için varsayılan resim URL'si ekle
            const itemsWithImages = jsonData.map(item => ({
                ...item,
                url: `${item.type}.jpg` // Her kategori için aynı resmi kullan
            }));
            await Item.insertMany(itemsWithImages);
            console.log('Data loaded to MongoDB');
        }
    } catch (error) {
        console.error('Data loading error:', error);
    }
}

// Resim yükleme ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// CRUD Operations

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
});

// Create new item
app.post('/api/items', upload.single('image'), async (req, res) => {
    try {
        const { title, type, description, price, rating } = req.body;
        
        // Validate required fields
        if (!title || !type || !price) {
            return res.status(400).json({ message: 'Title, type and price are required' });
        }

        const newItem = new Item({
            title,
            type,
            description: description || '',
            price,
            rating: rating || 0,
            url: req.file ? req.file.filename : 'default.jpg'
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update item
app.put('/api/items/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, type, description, price, rating } = req.body;
        
        // Validate required fields
        if (!title || !type || !price) {
            return res.status(400).json({ message: 'Title, type and price are required' });
        }

        const updateData = {
            title,
            type,
            description: description || '',
            price,
            rating: rating || 0
        };

        if (req.file) {
            updateData.url = req.file.filename;
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

// En ucuz ürünü bul
app.get('/api/cheapest', async (req, res) => {
    try {
        const { item } = req.query;
        const cheapest = await Item.find({ name: { $regex: item, $options: 'i' } })
            .sort({ price: 1 })
            .limit(1);
        res.json(cheapest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await loadInitialData();
}); 