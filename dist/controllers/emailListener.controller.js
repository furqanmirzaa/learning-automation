"use strict";
// src/controllers/emailListener.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailListenerController = exports.EmailListenerController = void 0;
const email_service_1 = require("../services/email.service");
class EmailListenerController {
    /**
     * Start the email listener
     */
    async startListener(req, res, next) {
        try {
            const state = email_service_1.emailService.getState();
            if (state.isActive) {
                const response = {
                    success: true,
                    message: 'Email listener is already active',
                    data: state,
                };
                res.status(200).json(response);
                return;
            }
            email_service_1.emailService.start();
            const response = {
                success: true,
                message: 'Email listener started successfully',
                data: email_service_1.emailService.getState(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Stop the email listener
     */
    async stopListener(req, res, next) {
        try {
            const state = email_service_1.emailService.getState();
            if (!state.isActive) {
                const response = {
                    success: true,
                    message: 'Email listener is not active',
                    data: state,
                };
                res.status(200).json(response);
                return;
            }
            email_service_1.emailService.stop();
            const response = {
                success: true,
                message: 'Email listener stopped successfully',
                data: email_service_1.emailService.getState(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get email listener status
     */
    async getStatus(req, res, next) {
        try {
            const state = email_service_1.emailService.getState();
            const response = {
                success: true,
                message: 'Email listener status retrieved',
                data: state,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EmailListenerController = EmailListenerController;
// Singleton instance
exports.emailListenerController = new EmailListenerController();
