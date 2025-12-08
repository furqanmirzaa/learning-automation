"use strict";
// src/config/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    email: {
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
        imapHost: process.env.IMAP_HOST || 'imap.gmail.com',
        imapPort: parseInt(process.env.IMAP_PORT || '993', 10),
    },
    discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    },
};
// Validate critical configuration
function validateConfig() {
    const errors = [];
    if (!exports.config.email.user) {
        errors.push('EMAIL_USER is required');
    }
    if (!exports.config.email.password) {
        errors.push('EMAIL_PASSWORD is required');
    }
    if (!exports.config.discord.webhookUrl) {
        errors.push('DISCORD_WEBHOOK_URL is required');
    }
    if (errors.length > 0) {
        console.error('Configuration validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Invalid configuration. Please check your environment variables.');
    }
}
