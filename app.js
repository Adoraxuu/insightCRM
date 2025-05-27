// require
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const authRoutes = require('./routes/auth');

// init
const app = express();

// middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: '服務器內部錯誤',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// routes
app.get('/', (req, res) => {
    res.send('InsightCRM is live 🧠');
});

// API 
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// handle 404
app.use((req, res) => {
    res.status(404).json({ error: '找不到請求的資源' });
});

module.exports = app;