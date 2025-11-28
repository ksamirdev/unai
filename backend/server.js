const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Use environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unai_db'; 
const uploadsPath = process.env.UPLOAD_PATH || '/home/varun-kasnia/Documents/Programming Files/Projects/UnAI/uploads';

// =======================================================
// 1. MIDDLEWARE: Order is critical!
// =======================================================

// ✅ CORRECT CORS SETUP - Allows frontend (3000) to talk to backend (5000)
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true 
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================================================
// 2. STATIC FILE SERVING & DIRECTORY SETUP
// =======================================================

// Serve static files (using the correct path)
app.use('/uploads', express.static(uploadsPath));
app.use('/uploads/images', express.static(path.join(uploadsPath, 'images')));
app.use('/uploads/regenerated', express.static(path.join(uploadsPath, 'regenerated')));

// Create directories if they don't exist
const createDirectories = () => {
    const dirs = [
        path.join(uploadsPath, 'images'),
        path.join(uploadsPath, 'regenerated')
    ];
    // Also include relative paths if UPLOAD_PATH is not set correctly
    if (!process.env.UPLOAD_PATH) {
        dirs.push(path.join(__dirname, '../uploads/images'));
        dirs.push(path.join(__dirname, '../uploads/regenerated'));
    }

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        } else {
            console.log(`✅ Directory exists: ${dir}`);
        }
    });
};

createDirectories();


// =======================================================
// 3. ROUTES
// =======================================================

// ✅ DEBUG ROUTE - Test file access
app.get('/debug/files', (req, res) => {
    try {
        const regeneratedPath = path.join(uploadsPath, 'regenerated');
        const files = fs.existsSync(regeneratedPath) ? fs.readdirSync(regeneratedPath) : [];
        
        const fileDetails = files.map(file => {
          const filePath = path.join(regeneratedPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
            url: `http://localhost:5000/uploads/regenerated/${file}`
          };
        });
        
        res.json({
          uploadsPath,
          regeneratedPath,
          filesCount: files.length,
          files: fileDetails,
          directoryExists: fs.existsSync(regeneratedPath)
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});


// ✅ AUTHENTICATION ROUTES
try {
    const authRoutes = require('./routes/auth'); 
    app.use('/api/auth', authRoutes); 
    console.log('✅ Authentication routes loaded');
} catch (error) {
    console.error('❌ Error loading authentication routes (Check routes/auth.js):', error.message);
}


// ✅ IMAGE ROUTES
try {
    const imageRoutes = require('./routes/image');
    app.use('/api/images', imageRoutes);
    console.log('✅ Image routes loaded');
} catch (error) {
    console.error('❌ Error loading image routes:', error.message);
}

// Basic root route
app.get('/', (req, res) => {
    res.json({
        message: 'UnAI API Server',
        version: '1.0.0',
        debugEndpoint: `http://localhost:${PORT}/debug/files`
    });
});


// =======================================================
// 4. DATABASE CONNECTION & SERVER START
// =======================================================

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 UnAI Server running on port ${PORT}`);
            console.log(`📍 Debug endpoint: http://localhost:${PORT}/debug/files`);
            console.log(`📁 Serving uploads from: ${uploadsPath}`);
        });
    })
    .catch(err => {
        console.error('❌ FATAL ERROR: MongoDB connection failed:', err.message);
        // Exit process if DB connection fails
        process.exit(1); 
    });

module.exports = app;