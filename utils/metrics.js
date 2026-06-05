const client = require('prom-client');

// Register a default metrics collector
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Collects default Node.js metrics (CPU, memory, event loop lag, etc.)

// Create custom metrics
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'], // Labels allow you to categorize metrics (e.g., per method, per path)
  registers: [register],
});

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'path', 'status'],
  buckets: [50, 100, 200, 400, 800, 1600, 3200, 6400], // Buckets for histogram
  registers: [register],
});

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDurationMicroseconds,
};