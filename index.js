require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const songRoutes = require('./routes/songroutes.js');
const analyticsRouter = require('./routes/analytics');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beathub_test', {
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Mount routes
app.use('/api/songs', songRoutes);

// Analytics routes
// Mount Analytics Routes
app.use('/api/analytics', analyticsRouter);
// Auth routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});