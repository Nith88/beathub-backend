require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const correlationIdMiddleware = require('./middleware/correlation');
const { register, httpRequestCounter, httpRequestDurationMicroseconds } = require('./utils/metrics');

const songRoutes = require('./routes/songroutes.js');
const analyticsRouter = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const song = require('./routes/songs.js');

const app = express();

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware);

// Metrics middleware to track HTTP requests
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestCounter.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        path: req.route?.path || req.path,
        status: res.statusCode,
      },
      duration
    );
  });

  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beathub', {
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => logger.error('MongoDB Connection Error:', err));

// Mount routes
app.use('/api/songs', songRoutes);

// Analytics routes
// Mount Analytics Routes
app.use('/api/analytics', analyticsRouter);
// Auth routes
app.use('/api/auth', authRoutes);

app.use('/api', song);

// Start server
app.listen(process.env.PORT || 3000, () => {
  logger.info('Server running on port ' + (process.env.PORT || 3000));
});