const { v4: uuidv4 } = require('uuid'); // Install uuid: npm install uuid

function correlationIdMiddleware(req, res, next) {
  // Check if a correlation ID is already present in headers (e.g., from an upstream service)
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId; // Attach to the request object
  res.setHeader('X-Correlation-ID', correlationId); // Send it back in the response header

  // Override logger methods to always include correlationId
  const logger = require('../utils/logger');
  const childLogger = logger.child({ correlationId: correlationId }); // Create a child logger with default metadata
  req.logger = childLogger; // Attach child logger to request

  next();
}

module.exports = correlationIdMiddleware;
