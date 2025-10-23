/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before the app starts
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Define required environment variables
const REQUIRED_ENV_VARS = {
    // Database
    DATABASE_URL: {
        required: true,
        description: 'PostgreSQL database connection URL',
        example: 'postgresql://user:password@localhost:5432/database'
    },

    // JWT Secrets
    TOKEN_SECRET: {
        required: true,
        description: 'JWT access token secret key',
        minLength: 32,
        example: 'your-super-secret-jwt-key-at-least-32-characters'
    },

    REFRESH_SECRET: {
        required: true,
        description: 'JWT refresh token secret key',
        minLength: 32,
        example: 'your-super-secret-refresh-key-at-least-32-characters'
    },

    // CORS
    CORS_ORIGIN: {
        required: true,
        description: 'Allowed CORS origin for frontend',
        example: 'http://localhost:5173'
    },

    // Redis (optional but recommended)
    REDIS_URL: {
        required: false,
        description: 'Redis connection URL',
        default: 'redis://127.0.0.1:6379',
        example: 'redis://localhost:6379'
    },

    // Security
    COOKIE_SECURE: {
        required: false,
        description: 'Set secure cookies (true for production)',
        default: 'false',
        validValues: ['true', 'false']
    },

    // Environment
    NODE_ENV: {
        required: false,
        description: 'Node environment',
        default: 'development',
        validValues: ['development', 'production', 'test']
    },

    APP_ENV: {
        required: false,
        description: 'Application environment',
        default: 'dev',
        validValues: ['dev', 'prod', 'test']
    }
};

// Optional but recommended environment variables
const RECOMMENDED_ENV_VARS = {
    PGSSLMODE: {
        description: 'PostgreSQL SSL mode',
        example: 'require',
        validValues: ['disable', 'prefer', 'require']
    },

    REDIS_TLS: {
        description: 'Enable Redis TLS',
        example: 'true',
        validValues: ['true', 'false']
    },

    RATE_LIMIT_SECRET: {
        description: 'Secret for rate limiting',
        example: 'your-rate-limit-secret'
    }
};

/**
 * Validate a single environment variable
 */
function validateEnvVar(key, config) {
    const value = process.env[key];
    const errors = [];
    const warnings = [];

    // Check if required variable is missing
    if (config.required && !value) {
        errors.push(`❌ ${key} is required but not set`);
        return { errors, warnings };
    }

    // If variable is not set and not required, use default
    if (!value && config.default) {
        process.env[key] = config.default;
        warnings.push(`⚠️  ${key} not set, using default: ${config.default}`);
        return { errors, warnings };
    }

    // If variable is not set and not required, skip validation
    if (!value) {
        return { errors, warnings };
    }

    // Validate minimum length
    if (config.minLength && value.length < config.minLength) {
        errors.push(`❌ ${key} must be at least ${config.minLength} characters long`);
    }

    // Validate allowed values
    if (config.validValues && !config.validValues.includes(value)) {
        errors.push(`❌ ${key} must be one of: ${config.validValues.join(', ')}`);
    }

    // Special validations
    if (key === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
        errors.push(`❌ ${key} must be a valid PostgreSQL URL starting with 'postgresql://'`);
    }

    if (key === 'CORS_ORIGIN' && !value.startsWith('http')) {
        errors.push(`❌ ${key} must be a valid URL starting with 'http'`);
    }

    return { errors, warnings };
}

/**
 * Validate all environment variables
 */
export function validateEnvironment() {
    console.log('🔍 Validating environment variables...\n');

    const allErrors = [];
    const allWarnings = [];
    const missingRecommended = [];

    // Validate required environment variables
    for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
        const { errors, warnings } = validateEnvVar(key, config);
        allErrors.push(...errors);
        allWarnings.push(...warnings);
    }

    // Check recommended environment variables
    for (const [key, config] of Object.entries(RECOMMENDED_ENV_VARS)) {
        if (!process.env[key]) {
            missingRecommended.push(key);
        }
    }

    // Print results
    if (allWarnings.length > 0) {
        console.log('⚠️  Warnings:');
        allWarnings.forEach(warning => console.log(`   ${warning}`));
        console.log('');
    }

    if (allErrors.length > 0) {
        console.log('❌ Environment validation failed:');
        allErrors.forEach(error => console.log(`   ${error}`));
        console.log('');

        console.log('📋 Required environment variables:');
        for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
            if (config.required) {
                console.log(`   ${key}: ${config.description}`);
                console.log(`   Example: ${key}=${config.example}`);
                console.log('');
            }
        }

        throw new Error('Environment validation failed. Please set the required environment variables.');
    }

    if (missingRecommended.length > 0) {
        console.log('💡 Recommended environment variables (not required but recommended):');
        missingRecommended.forEach(key => {
            const config = RECOMMENDED_ENV_VARS[key];
            console.log(`   ${key}: ${config.description}`);
            console.log(`   Example: ${key}=${config.example}`);
        });
        console.log('');
    }

    console.log('✅ Environment validation passed!');
    console.log('');

    // Log current environment configuration
    console.log('🔧 Current environment configuration:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   APP_ENV: ${process.env.APP_ENV || 'dev'}`);
    console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   TOKEN_SECRET: ${process.env.TOKEN_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   REFRESH_SECRET: ${process.env.REFRESH_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   REDIS_URL: ${process.env.REDIS_URL || 'redis://127.0.0.1:6379'}`);
    console.log(`   COOKIE_SECURE: ${process.env.COOKIE_SECURE || 'false'}`);
    console.log('');
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(key, defaultValue = null, required = false) {
    const value = process.env[key];

    if (required && !value) {
        throw new Error(`Required environment variable ${key} is not set`);
    }

    return value || defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction() {
    return process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'prod';
}

/**
 * Check if running in development
 */
export function isDevelopment() {
    return process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'dev';
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
    return {
        url: process.env.DATABASE_URL,
        sslMode: process.env.PGSSLMODE || 'disable'
    };
}

/**
 * Get Redis configuration
 */
export function getRedisConfig() {
    return {
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
        db: Number(process.env.REDIS_DB || '0'),
        tls: process.env.REDIS_TLS === 'true'
    };
}

/**
 * Get JWT configuration
 */
export function getJWTConfig() {
    return {
        tokenSecret: process.env.TOKEN_SECRET,
        refreshSecret: process.env.REFRESH_SECRET
    };
}

/**
 * Get CORS configuration
 */
export function getCORSConfig() {
    return {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
    };
}
