// src/services/imap.service.ts
import Imap from "node-imap";
import { simpleParser } from "mailparser";
import { sendToDiscord } from "./discord.service"; // Import the other service
import { emailQueue } from "../../services/emailQueue";
import { prisma } from "../../database/lib/prisma";

const IMAP_CONFIG = {
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    host: process.env.EMAIL_HOST || "",
    port: parseInt(process.env.EMAIL_PORT || "993"),
    tls: true
};

class ImapService {
    private imap: Imap | null = null;
    public isListenerActive: boolean = false;

    public start() {
        if (this.isListenerActive) {
            throw new Error("Listener is already active");
        }

        this.imap = new Imap(IMAP_CONFIG);
        this.setupListeners();
        this.imap.connect();
        this.isListenerActive = true;
    }

    public stop() {
        if (!this.isListenerActive || !this.imap) {
            throw new Error("Listener is not active");
        }

        this.imap.end();
        this.imap = null;
        this.isListenerActive = false;
    }

    private setupListeners() {
        if (!this.imap) return;

        this.imap.once("ready", () => {
            console.log("[IMAP] Connected. Listening for new emails...");

            this.imap?.openBox("INBOX", false, (err, box) => {
                if (err) throw err;

                this.imap?.on("mail", () => {
                    console.log("[IMAP] New email detected!");
                    // Note: Ideally, improve fetch logic here to avoid duplicates
                    const fetcher = this.imap?.seq.fetch(box.messages.total + ":*", { bodies: "" });

                    fetcher?.on("message", (msg: any) => {
                        msg.on("body", async (stream: any) => {
                            const parsed = await simpleParser(stream);
                            const email = {
                                from: parsed.from?.text || "Unknown",
                                subject: parsed.subject || "No Subject",
                                text: parsed.text || "No Content"
                            };
                            console.log("[EMAIL RECEIVED]", email);
                            // Call the discord service
                            // sendToDiscord(email);
                            const createdEmail = await prisma.email.create({
                                data: {
                                    from: email.from,
                                    subject: email.subject,
                                    body: email.text
                                }
                            })
                            const dbJob = await prisma.job.create({
                                data: {
                                    emailId: createdEmail.id,
                                    type: "EMAIL_TO_DISCORD",
                                    status: "PENDING"
                                }
                            })
                            emailQueue.add("email-jobs", { emailId: createdEmail.id, jobId: dbJob.id, type: "EMAIL_TO_DISCORD" });

                            console.log("[EMAIL SAVED]", email)
                        });
                    });
                });
            });
        });

        this.imap.once("error", (err: any) => console.error("[IMAP ERROR]", err));

        this.imap.once("end", () => {
            console.log("[IMAP] Connection ended.");
            this.isListenerActive = false;
        });
    }
}

// Export a singleton instance so state is preserved across requests
export const imapService = new ImapService();