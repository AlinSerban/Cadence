/**
 * Generate secure JWT secrets for environment variables
 * Run this script to generate strong secrets for your .env file
 */

import crypto from 'crypto';

console.log('🔐 Generating secure JWT secrets...\n');

// Generate 64-character random secrets
const tokenSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');
const rateLimitSecret = crypto.randomBytes(16).toString('hex');

console.log('📋 Add these to your .env file:\n');

console.log(`TOKEN_SECRET=${tokenSecret}`);
console.log(`REFRESH_SECRET=${refreshSecret}`);
console.log(`RATE_LIMIT_SECRET=${rateLimitSecret}`);

console.log('\n✅ Secrets generated successfully!');
console.log('💡 Copy the above lines to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them to version control');
