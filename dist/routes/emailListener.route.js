"use strict";
// src/routes/emailListener.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailListener_controller_1 = require("../controllers/emailListener.controller");
const router = (0, express_1.Router)();
// Start email listener
router.post('/start', (req, res, next) => emailListener_controller_1.emailListenerController.startListener(req, res, next));
// Stop email listener
router.post('/stop', (req, res, next) => emailListener_controller_1.emailListenerController.stopListener(req, res, next));
// Get listener status
router.get('/status', (req, res, next) => emailListener_controller_1.emailListenerController.getStatus(req, res, next));
exports.default = router;
