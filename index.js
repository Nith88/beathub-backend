const express = require('express');
const mongoose = require('mongoose');

const songRoutes = require('./routes/songroutes.js');

const app = express();

// Middleware
app.use(express.json());

// MongoDB connection (example)
mongoose.connect('mongodb://127.0.0.1:27017/beathub_test', {
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Mount routes
app.use('/api/songs', songRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});