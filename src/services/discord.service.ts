// src/services/discord.service.ts
import axios from "axios";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

export const sendToDiscord = async (email: any) => {
    // Use email.body (database field) or fallback to email.text (parsed field)
    const content = `📧 **New Email Received** From: **${email.from}** Subject: **${email.subject}** Message:  
${email.body || email.text || "No content"}`;

    // Let errors propagate to caller so worker can track failures
    await axios.post(DISCORD_WEBHOOK_URL, { content });
    console.log("[DISCORD] Message sent");
};