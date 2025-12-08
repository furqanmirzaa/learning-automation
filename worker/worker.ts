// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import { redisConfig } from '../config/redis';
import { prisma } from '../database/lib/prisma';
import { sendToDiscord } from '../src/services/discord.service';


const worker = new Worker("email-jobs", async (job) => {
    console.log('Processing job:', job.data.emailId);
    const { emailId, jobId } = job.data;

    try {
        // Update job to PROCESSING and increment attempts
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                processedAt: new Date(),
                attempts: { increment: 1 }
            }
        })

        const email = await prisma.email.findUnique({ where: { id: emailId } })
        if (!email) {
            throw new Error("Email not found");
        }

        // Create notification record with PENDING status
        const notification = await prisma.discordNotification.create({
            data: {
                emailId: emailId,
                content: email.body || "",
                status: "PENDING"
            }
        })

        // Send to Discord (errors will propagate from discord.service)
        await sendToDiscord(email)

        // Update notification to SENT with timestamp
        await prisma.discordNotification.update({
            where: { id: notification.id },
            data: {
                status: "SENT",
                sentAt: new Date()
            }
        })

        // Mark job as COMPLETED with timestamp
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                finishedAt: new Date()
            }
        })
    } catch (error) {
        console.error("[WORKER ERROR]", error)

        // Mark job as FAILED with error message and timestamp
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                error: error instanceof Error ? error.message : String(error),
                finishedAt: new Date()
            }
        })

        // Re-throw error for BullMQ retry mechanism
        throw error;
    }

}, { connection: redisConfig });

// ============================================
// Worker Lifecycle Management
// ============================================

// Worker starts automatically when instantiated above
console.log('[WORKER] Started and listening for jobs...');

// Listen to worker events for better observability
worker.on('completed', (job) => {
    console.log(`[WORKER] ✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.log(`[WORKER] ❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
    console.error('[WORKER] Error:', err);
});

// Graceful shutdown - Clean up when process is terminated
const gracefulShutdown = async (signal: string) => {
    console.log(`\n[WORKER] ${signal} received. Closing worker gracefully...`);

    try {
        // Close worker - waits for active jobs to finish
        await worker.close();

        // Disconnect Prisma
        await prisma.$disconnect();

        console.log('[WORKER] Shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('[WORKER] Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
