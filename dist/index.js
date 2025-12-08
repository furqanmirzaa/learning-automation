"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const emailListener_route_1 = __importDefault(require("./routes/emailListener.route"));
const errorHandler_1 = require("./middleware/errorHandler");
// Validate configuration on startup
(0, config_1.validateConfig)();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.nodeEnv,
    });
});
// API Routes
app.use('/api/email-listener', emailListener_route_1.default);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(config_1.config.port, () => {
    console.log(`🚀 Server running on port ${config_1.config.port}`);
    console.log(`📝 Environment: ${config_1.config.nodeEnv}`);
    console.log(`✅ Ready to accept requests`);
});
