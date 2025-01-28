/**
 * Logger utility for consistent logging across the application
 * @module utils/logger
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Set default log level from environment or default to INFO
const currentLogLevel = process.env.LOG_LEVEL ? 
    LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : 
    LOG_LEVELS.INFO;

/**
 * Format a log message with timestamp and metadata
 * @private
 */
function formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length ? 
        ' ' + JSON.stringify(meta) : 
        '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
}

/**
 * Check if a log level should be displayed
 * @private
 */
function shouldLog(level) {
    return LOG_LEVELS[level.toUpperCase()] <= currentLogLevel;
}

export const logger = {
    /**
     * Log an error message
     * @param {string} message - The error message
     * @param {Error|Object} [error] - Optional error object or metadata
     */
    error(message, error) {
        if (!shouldLog('ERROR')) return;
        
        const meta = error instanceof Error ? 
            { error: error.message, stack: error.stack } : 
            error;
            
        console.error(formatMessage('ERROR', message, meta));
    },

    /**
     * Log a warning message
     * @param {string} message - The warning message
     * @param {Object} [meta] - Optional metadata
     */
    warn(message, meta) {
        if (!shouldLog('WARN')) return;
        console.warn(formatMessage('WARN', message, meta));
    },

    /**
     * Log an info message
     * @param {string} message - The info message
     * @param {Object} [meta] - Optional metadata
     */
    info(message, meta) {
        if (!shouldLog('INFO')) return;
        console.info(formatMessage('INFO', message, meta));
    },

    /**
     * Log a debug message
     * @param {string} message - The debug message
     * @param {Object} [meta] - Optional metadata
     */
    debug(message, meta) {
        if (!shouldLog('DEBUG')) return;
        console.debug(formatMessage('DEBUG', message, meta));
    }
}; 