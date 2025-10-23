/**
 * Test script to verify logging system works correctly
 */

import { logger } from './utils/logger.js';

console.log('🧪 Testing logging system...\n');

// Test basic logging levels
logger.error('This is an error message', { userId: 123, action: 'test' });
logger.warn('This is a warning message', { memoryUsage: '85%' });
logger.info('This is an info message', { requestId: 'abc123' });
logger.debug('This is a debug message', { query: 'SELECT * FROM users' });

console.log('\n--- Testing child loggers ---\n');

// Test child loggers
const authLogger = logger.child('AUTH');
const dbLogger = logger.child('DATABASE');

authLogger.info('User login attempt', { email: 'test@example.com' });
authLogger.auth('user_logged_in', 123, { email: 'test@example.com' });

dbLogger.database('SELECT', 'users', 45, { userId: 123 });
dbLogger.performance('query_time', '150ms', { table: 'users' });

console.log('\n--- Testing business logging ---\n');

// Test business logic logging
logger.business('card_created', { cardId: 456, userId: 123, xpValue: 25 });
logger.business('card_completed', { cardId: 456, userId: 123, xpGained: 25 });

console.log('\n--- Testing security logging ---\n');

// Test security logging
logger.security('rate_limit_exceeded', { ip: '192.168.1.1', endpoint: '/api/auth/login' });
logger.security('invalid_token', { token: 'abc123...' });

console.log('\n✅ Logging test completed!');
console.log('💡 Check the output above to see structured logging in action');
