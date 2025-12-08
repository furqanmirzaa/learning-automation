"use strict";
// src/services/discord.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discordService = exports.DiscordService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class DiscordService {
    constructor() {
        this.webhookUrl = config_1.config.discord.webhookUrl;
    }
    async sendEmailNotification(email) {
        try {
            const content = this.formatEmailMessage(email);
            await axios_1.default.post(this.webhookUrl, {
                content,
            });
            console.log('[DISCORD] Notification sent successfully');
        }
        catch (error) {
            console.error('[DISCORD ERROR]', error);
            throw new Error('Failed to send Discord notification');
        }
    }
    formatEmailMessage(email) {
        return `📧 **New Email Received**  
From: **${email.from}**  
Subject: **${email.subject}**  
Message:  
${email.text}`;
    }
}
exports.DiscordService = DiscordService;
// Singleton instance
exports.discordService = new DiscordService();
