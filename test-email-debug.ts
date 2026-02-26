import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
console.log(`Loading env from ${envPath}`);

let envVars: Record<string, string> = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

const config = {
    host: envVars.SMTP_HOST || process.env.SMTP_HOST,
    port: Number(envVars.SMTP_PORT || process.env.SMTP_PORT),
    user: envVars.SMTP_NOTIFICATION_USER || process.env.SMTP_NOTIFICATION_USER,
    pass: envVars.SMTP_NOREPLY_PASS || process.env.SMTP_NOREPLY_PASS,
};

console.log('Testing SMTP with config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    pass: config.pass ? '********' : 'MISSING'
});

async function sendTestEmail() {
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.user,
            pass: config.pass,
        },
        tls: {
            rejectUnauthorized: false // Sometimes helpful for debugging
        }
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection verified. Sending mail...");

        const info = await transporter.sendMail({
            from: `"BIRA Test" <${config.user}>`,
            to: config.user, // Send to self
            subject: 'Test Email from Debug Script ' + new Date().toISOString(),
            text: 'If you receive this, SMTP is working.',
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendTestEmail();
