require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./config/prisma');
const http = require('http');
const { initSocket } = require('./lib/socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/sellers', require('./routes/seller.routes'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/newsletter', require('./routes/newsletter.routes'));
app.use('/api/settings', require('./routes/setting.routes'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Basic Route Placeholder
app.get('/', (req, res) => {
    res.send('Go-Cycle API is live');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
