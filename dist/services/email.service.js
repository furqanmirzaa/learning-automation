"use strict";
// src/services/email.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const node_imap_1 = __importDefault(require("node-imap"));
const mailparser_1 = require("mailparser");
const imap_config_1 = require("../config/imap.config");
const discord_service_1 = require("./discord.service");
class EmailService {
    constructor() {
        this.imap = null;
        this.state = {
            isActive: false,
        };
    }
    /**
     * Start the email listener
     */
    start() {
        if (this.state.isActive) {
            throw new Error('Email listener is already active');
        }
        const imapConfig = (0, imap_config_1.getImapConfig)();
        this.imap = new node_imap_1.default(imapConfig);
        this.setupEventListeners();
        this.imap.connect();
        this.state.isActive = true;
        this.state.startedAt = new Date();
        console.log('[EMAIL SERVICE] Listener started');
    }
    /**
     * Stop the email listener
     */
    stop() {
        if (!this.state.isActive) {
            throw new Error('Email listener is not active');
        }
        if (this.imap) {
            this.imap.end();
            this.imap = null;
        }
        this.state.isActive = false;
        this.state.startedAt = undefined;
        console.log('[EMAIL SERVICE] Listener stopped');
    }
    /**
     * Get current service state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Setup IMAP event listeners
     */
    setupEventListeners() {
        if (!this.imap)
            return;
        this.imap.once('ready', () => {
            console.log('[IMAP] Connected successfully');
            this.openInbox();
        });
        this.imap.once('error', (err) => {
            console.error('[IMAP ERROR]', err);
            this.state.isActive = false;
        });
        this.imap.once('end', () => {
            console.log('[IMAP] Connection ended');
            this.state.isActive = false;
            this.state.startedAt = undefined;
        });
    }
    /**
     * Open inbox and setup mail listener
     */
    openInbox() {
        if (!this.imap)
            return;
        this.imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                console.error('[IMAP] Failed to open inbox:', err);
                return;
            }
            console.log('[IMAP] INBOX opened, listening for new emails...');
            // Listen for new mail
            this.imap.on('mail', (numNewMsgs) => {
                console.log(`[IMAP] ${numNewMsgs} new email(s) detected`);
                this.fetchLatestEmail(box);
            });
        });
    }
    /**
     * Fetch and process the latest email
     */
    fetchLatestEmail(box) {
        if (!this.imap)
            return;
        const fetcher = this.imap.seq.fetch(`${box.messages.total}:*`, {
            bodies: '',
        });
        fetcher.on('message', (msg) => {
            msg.on('body', (stream) => {
                (0, mailparser_1.simpleParser)(stream)
                    .then((parsed) => {
                    const email = {
                        from: parsed.from?.text || 'Unknown',
                        subject: parsed.subject || 'No Subject',
                        text: parsed.text || 'No Content',
                    };
                    console.log('[EMAIL RECEIVED]', {
                        from: email.from,
                        subject: email.subject,
                    });
                    // Send to Discord
                    return discord_service_1.discordService.sendEmailNotification(email);
                })
                    .catch((error) => {
                    console.error('[EMAIL PROCESSING ERROR]', error);
                });
            });
        });
        fetcher.once('error', (err) => {
            console.error('[FETCH ERROR]', err);
        });
    }
}
exports.EmailService = EmailService;
// Singleton instance
exports.emailService = new EmailService();
