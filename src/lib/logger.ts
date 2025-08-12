// Simplified logger to avoid pino thread-stream issues
const isDev = process.env.NODE_ENV === 'development';

/**
 * Simplified logger to avoid pino worker exit errors
 * - In development, uses console with colors
 * - In production, uses structured console output
 */
export const logger = {
  info: (data: any, message?: string) => {
    if (isDev) {
      console.log(`ℹ️ ${message || ''} `, data);
    } else {
      console.log(JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }));
    }
  },
  error: (data: any, message?: string) => {
    if (isDev) {
      console.error(`❌ ${message || ''} `, data);
    } else {
      console.error(JSON.stringify({ level: 'error', message, data, timestamp: new Date().toISOString() }));
    }
  },
  warn: (data: any, message?: string) => {
    if (isDev) {
      console.warn(`⚠️ ${message || ''} `, data);
    } else {
      console.warn(JSON.stringify({ level: 'warn', message, data, timestamp: new Date().toISOString() }));
    }
  },
  debug: (data: any, message?: string) => {
    if (isDev) {
      console.debug(`🐛 ${message || ''} `, data);
    } else {
      console.debug(JSON.stringify({ level: 'debug', message, data, timestamp: new Date().toISOString() }));
    }
  }
}; 