const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define your custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
  winston.format.errors({ stack: true }), // Include stack trace for errors
  winston.format.splat(), // Handles string interpolation
  winston.format.json() // Output logs as JSON
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Log level based on environment
  format: logFormat,
  transports: [
    // Console transport for development and local viewing
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize for better readability in console
        winston.format.simple() // Simple format for console (not JSON)
      ),
      silent: process.env.NODE_ENV === 'test' // Disable console logs during tests
    }),
    // File transport for production (JSON format)
    // In real production, you'd likely send these to a log aggregation service
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
  ],
  exceptionHandlers: [ // Catch uncaught exceptions
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [ // Catch unhandled promise rejections
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

// If not in production, also log to console in JSON for clarity
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json() // Full JSON logs in development console too (optional)
    ),
  }));
}

// Add child logger support for correlation IDs
logger.child = function(meta) {
  return {
    info: (message, ...args) => logger.info(message, { ...meta, ...args[0] }),
    error: (message, ...args) => logger.error(message, { ...meta, ...args[0] }),
    warn: (message, ...args) => logger.warn(message, { ...meta, ...args[0] }),
    debug: (message, ...args) => logger.debug(message, { ...meta, ...args[0] }),
  };
};

module.exports = logger;
