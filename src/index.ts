// src/index.ts
import axios from 'axios';
import express, { Request, Response } from 'express';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';


const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const IMAP_CONFIG = {
    user: "furqanmirzaig@gmail.com",
    password: "fzew rhsq rrfw bfqz",
    host: "imap.gmail.com",
    port: 993,
    tls: true
};
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1447217997159727177/iYcycKQMzt4K3nrXSHJiQLJq_ATPTdDEHDcyr27fmylmMU6U-VjXtGEgCQHKkDSGLRBL"

let imap: Imap | null = null;
let isListenerActive: Boolean = false
// ---------------------------------------------
// Send Email To Discord
// ---------------------------------------------

async function sendToDiscord(email: any) {
    try {
        const content = `📧 **New Email Received**  
From: **${email.from}**  
Subject: **${email.subject}**  
Message:  
${email.text}`;

        await axios.post(DISCORD_WEBHOOK_URL, {
            content
        });

        console.log("[DISCORD] Message sent");
    } catch (err) {
        console.error("[DISCORD ERROR]", err);
    }
}

// ------------------------------------------------------
// EMAIL LISTENER
// ------------------------------------------------------
function setupImapListeners(imap: Imap) {
    function openInbox(cb: any) {
        imap.openBox("INBOX", false, cb);
    }

    imap.once("ready", () => {
        console.log("[IMAP] Connected. Listening for new emails...");

        openInbox((err: any, box: any) => {
            if (err) throw err;

            imap.on("mail", () => {
                console.log("[IMAP] New email detected!");

                const fetcher = imap.seq.fetch(box.messages.total + ":*", {
                    bodies: ""
                });

                fetcher.on("message", (msg: any) => {
                    msg.on("body", async (stream: any) => {
                        const parsed = await simpleParser(stream);

                        const email = {
                            from: parsed.from?.text || "Unknown",
                            subject: parsed.subject || "No Subject",
                            text: parsed.text || "No Content"
                        };

                        console.log("[EMAIL RECEIVED]", email);
                        sendToDiscord(email);
                    });
                });
            });
        });
    });

    imap.once("error", err => console.error("[IMAP ERROR]", err));

    imap.once("end", () => {
        console.log("[IMAP] Connection ended.");
        isListenerActive = false;
    });
}


app.get('/health', (req, res) => {
    res.send('Hello from TypeScript Express!');
});

app.post('/start-listener', (req, res) => {
    try {
        if (isListenerActive) {
            return res.status(200).json({
                message: "Listener is already active"
            })
        }

        imap = new Imap(IMAP_CONFIG)
        setupImapListeners(imap)
        imap.connect()
        isListenerActive = true
        res.status(200).json({
            message: "Listener started successfully"
        })
    } catch (error) {
        console.error("[ERROR]", error)
        res.status(500).json({
            message: "Failed to start listener"
        })
    }
})
app.post("/stop-listener", (req, res) => {
    try {
        if (!isListenerActive) {
            return res.status(200).json({
                message: "Listener is not active"
            })
        }
        imap?.end()
        imap = null
        isListenerActive = false
        res.status(200).json({
            message: "Listener stopped successfully"
        })
    } catch (error) {
        console.error("[ERROR]", error)
        res.status(500).json({
            message: "Failed to stop listener"
        })
    }
})



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});