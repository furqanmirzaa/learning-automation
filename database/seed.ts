import { prisma } from './lib/prisma';
import { JobType, JobStatus, NotificationStatus } from './generated/prisma/client';

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Clean existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.job.deleteMany();
    await prisma.discordNotification.deleteMany();
    await prisma.email.deleteMany();
    console.log('✅ Cleaned existing data\n');

    // Seed Emails
    console.log('📧 Creating sample emails...');
    const email1 = await prisma.email.create({
        data: {
            from: 'john.doe@example.com',
            subject: 'Project Update - Q4 2024',
            body: 'Hello team, here is our quarterly update on the automation project...',
            receivedAt: new Date('2024-12-01T10:00:00Z'),
        },
    });

    const email2 = await prisma.email.create({
        data: {
            from: 'alerts@github.com',
            subject: 'New PR: Feature/discord-integration',
            body: 'A new pull request has been opened by @developer...',
            receivedAt: new Date('2024-12-02T14:30:00Z'),
        },
    });

    const email3 = await prisma.email.create({
        data: {
            from: 'notifications@stripe.com',
            subject: 'Payment Received',
            body: 'You received a payment of $99.00',
            receivedAt: new Date('2024-12-03T09:15:00Z'),
        },
    });

    const email4 = await prisma.email.create({
        data: {
            from: 'support@example.com',
            subject: null,
            body: 'This is an email with no subject line.',
            receivedAt: new Date('2024-12-04T16:45:00Z'),
        },
    });

    console.log(`✅ Created 4 emails\n`);

    // Seed Discord Notifications
    console.log('🔔 Creating Discord notifications...');
    await prisma.discordNotification.create({
        data: {
            emailId: email1.id,
            content: '📬 New Email from john.doe@example.com: Project Update - Q4 2024',
            status: NotificationStatus.SENT,
            sentAt: new Date('2024-12-01T10:01:00Z'),
        },
    });

    await prisma.discordNotification.create({
        data: {
            emailId: email2.id,
            content: '📬 New Email from alerts@github.com: New PR: Feature/discord-integration',
            status: NotificationStatus.SENT,
            sentAt: new Date('2024-12-02T14:31:00Z'),
        },
    });

    await prisma.discordNotification.create({
        data: {
            emailId: email3.id,
            content: '📬 New Email from notifications@stripe.com: Payment Received',
            status: NotificationStatus.PENDING,
            sentAt: null,
        },
    });

    await prisma.discordNotification.create({
        data: {
            emailId: email4.id,
            content: '📬 New Email from support@example.com (No Subject)',
            status: NotificationStatus.FAILED,
            sentAt: null,
            error: 'Discord webhook returned 404',
        },
    });

    // Generic notification without email
    await prisma.discordNotification.create({
        data: {
            emailId: null,
            content: '⚙️ System Status: All services operational',
            status: NotificationStatus.SENT,
            sentAt: new Date('2024-12-05T08:00:00Z'),
        },
    });

    console.log(`✅ Created 5 Discord notifications\n`);

    // Seed Jobs
    console.log('⚙️ Creating queue jobs...');
    await prisma.job.create({
        data: {
            type: JobType.EMAIL_TO_DISCORD,
            status: JobStatus.COMPLETED,
            attempts: 1,
            emailId: email1.id,
            queuedAt: new Date('2024-12-01T10:00:30Z'),
            processedAt: new Date('2024-12-01T10:00:45Z'),
            finishedAt: new Date('2024-12-01T10:01:00Z'),
        },
    });

    await prisma.job.create({
        data: {
            type: JobType.EMAIL_TO_DISCORD,
            status: JobStatus.COMPLETED,
            attempts: 1,
            emailId: email2.id,
            queuedAt: new Date('2024-12-02T14:30:30Z'),
            processedAt: new Date('2024-12-02T14:30:45Z'),
            finishedAt: new Date('2024-12-02T14:31:00Z'),
        },
    });

    await prisma.job.create({
        data: {
            type: JobType.EMAIL_TO_DISCORD,
            status: JobStatus.PROCESSING,
            attempts: 1,
            emailId: email3.id,
            queuedAt: new Date('2024-12-03T09:15:30Z'),
            processedAt: new Date('2024-12-03T09:15:45Z'),
            finishedAt: null,
        },
    });

    await prisma.job.create({
        data: {
            type: JobType.EMAIL_TO_DISCORD,
            status: JobStatus.FAILED,
            attempts: 3,
            emailId: email4.id,
            error: 'Max retry attempts reached. Discord webhook unreachable.',
            queuedAt: new Date('2024-12-04T16:45:30Z'),
            processedAt: new Date('2024-12-04T16:46:00Z'),
            finishedAt: new Date('2024-12-04T16:50:00Z'),
        },
    });

    await prisma.job.create({
        data: {
            type: JobType.EMAIL_TO_DISCORD,
            status: JobStatus.PENDING,
            attempts: 0,
            emailId: null,
            queuedAt: new Date('2024-12-05T12:00:00Z'),
            processedAt: null,
            finishedAt: null,
        },
    });

    console.log(`✅ Created 5 queue jobs\n`);

    // Display summary
    console.log('📋 Seeding Summary:\n');

    const emailCount = await prisma.email.count();
    const notificationCount = await prisma.discordNotification.count();
    const jobCount = await prisma.job.count();

    console.log(`  Emails: ${emailCount}`);
    console.log(`  Discord Notifications: ${notificationCount}`);
    console.log(`  Jobs: ${jobCount}`);

    // Show relationship example
    console.log('\n🔗 Relationship Example:\n');

    const emailWithRelations = await prisma.email.findFirst({
        where: { id: email1.id },
        include: {
            notifications: true,
            jobs: true,
        },
    });

    console.log(`  Email "${emailWithRelations?.subject}":`);
    console.log(`    - Has ${emailWithRelations?.notifications.length} notification(s)`);
    console.log(`    - Has ${emailWithRelations?.jobs.length} job(s)`);

    console.log('\n✨ Database seeding completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
