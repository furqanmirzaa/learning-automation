import axios from "axios";
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import { Request, Response } from "express";
import { imapService } from "../services/imap.service";






class EmailListenerController {
    async startListener(req: Request, res: Response) {
        try {
            // Validate email credentials before attempting connection

            const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD'];
            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

            if (missingVars.length > 0) {
                return res.status(400).json({
                    message: "Email credentials not configured",
                    error: `Missing environment variables: ${missingVars.join(', ')}`,
                    hint: "Please configure EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in your .env file"
                });
            }

            // Prevent connection to localhost
            if (process.env.EMAIL_HOST === 'localhost' || process.env.EMAIL_HOST === '127.0.0.1') {
                return res.status(400).json({
                    message: "Invalid email host configuration",
                    error: "EMAIL_HOST cannot be localhost",
                    hint: "Use a real IMAP server like imap.gmail.com or outlook.office365.com"
                });
            }

            imapService.start()
            res.status(200).json({
                message: "Listener started successfully"
            })
        } catch (error) {
            console.error("[ERROR]", error)
            res.status(500).json({
                message: "Failed to start listener",
                error: error instanceof Error ? error.message : String(error)
            })
        }
    }

    async stopListener(req: Request, res: Response) {
        try {
            imapService.stop()
            res.status(200).json({
                message: "Listener stopped successfully"
            })
        } catch (error) {
            console.error("[ERROR]", error)
            res.status(500).json({
                message: "Failed to stop listener"
            })
        }
    }
}

export const emailListenerController = new EmailListenerController()