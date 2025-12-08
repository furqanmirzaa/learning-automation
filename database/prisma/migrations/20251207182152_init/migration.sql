-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('EMAIL_TO_DISCORD');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('IMAP_CONNECTED', 'IMAP_DISCONNECTED', 'NEW_EMAIL_DETECTED', 'JOB_QUEUED', 'JOB_FAILED', 'DISCORD_SENT', 'DISCORD_FAILED');

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordNotification" (
    "id" TEXT NOT NULL,
    "emailId" TEXT,
    "content" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "emailId" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscordNotification" ADD CONSTRAINT "DiscordNotification_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;
