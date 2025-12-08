"use strict";
// src/middleware/errorHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error, req, res, next) {
    console.error('[ERROR]', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    const response = {
        success: false,
        message: error.message || 'Internal server error',
    };
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
}
