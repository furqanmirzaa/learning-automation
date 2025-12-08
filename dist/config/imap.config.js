"use strict";
// src/config/imap.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImapConfig = getImapConfig;
const index_1 = require("./index");
function getImapConfig() {
    return {
        user: index_1.config.email.user,
        password: index_1.config.email.password,
        host: index_1.config.email.imapHost,
        port: index_1.config.email.imapPort,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
    };
}
