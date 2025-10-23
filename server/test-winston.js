/**
 * Test script to verify Winston logging system works correctly
 */

import { winstonLogger } from './utils/winstonLogger.js';

console.log('🧪 Testing Winston logging system...\n');

// Test basic logging levels
winstonLogger.error('This is a Winston error message', { userId: 123, action: 'test' });
winstonLogger.warn('This is a Winston warning message', { memoryUsage: '85%' });
winstonLogger.info('This is a Winston info message', { requestId: 'abc123' });
winstonLogger.debug('This is a Winston debug message', { query: 'SELECT * FROM users' });
winstonLogger.http('This is a Winston HTTP message', { method: 'GET', url: '/api/test' });

console.log('\n--- Testing child loggers ---\n');

// Test child loggers
const authLogger = winstonLogger.child('AUTH');
const dbLogger = winstonLogger.child('DATABASE');
const serverLogger = winstonLogger.child('SERVER');

authLogger.info('User login attempt', { email: 'test@example.com' });
authLogger.auth('user_logged_in', 123, { email: 'test@example.com' });

dbLogger.database('SELECT', 'users', 45, { userId: 123 });
dbLogger.performance('query_time', '150ms', { table: 'users' });

serverLogger.startup('Server starting up', { port: 3000, environment: 'development' });
serverLogger.system('Database connected', { host: 'localhost', port: 5432 });

console.log('\n--- Testing specialized logging ---\n');

// Test business logic logging
winstonLogger.business('card_created', { cardId: 456, userId: 123, xpValue: 25 });
winstonLogger.business('card_completed', { cardId: 456, userId: 123, xpGained: 25 });

// Test security logging
winstonLogger.security('rate_limit_exceeded', { ip: '192.168.1.1', endpoint: '/api/auth/login' });
winstonLogger.security('invalid_token', { token: 'abc123...' });

// Test performance logging
winstonLogger.performance('response_time', '250ms', { endpoint: '/api/board' });
winstonLogger.performance('memory_usage', '45MB', { heapUsed: 45, heapTotal: 128 });

console.log('\n--- Testing HTTP request simulation ---\n');

// Simulate HTTP request logging
const mockReq = {
    method: 'POST',
    url: '/api/auth/login',
    ip: '192.168.1.100',
    get: (header) => {
        if (header === 'User-Agent') return 'Mozilla/5.0 (Test Browser)';
        if (header === 'Content-Type') return 'application/json';
        if (header === 'Content-Length') return '150';
        return null;
    },
    user: { id: 123 },
    requestId: 'req-12345',
    body: { email: 'test@example.com', password: '***' }
};

const mockRes = {
    statusCode: 200,
    get: (header) => {
        if (header === 'Content-Length') return '500';
        return null;
    }
};

// Test HTTP request logging
const httpLogger = winstonLogger.child('HTTP');
httpLogger.httpRequest(mockReq, mockRes, 150);

console.log('\n✅ Winston logging test completed!');
console.log('💡 Check the output above to see Winston logging in action');
console.log('📁 Log files are being written to server/logs/ directory');
console.log('🔍 Check server/logs/ for detailed log files');
