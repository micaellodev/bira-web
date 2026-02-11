
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

const host = envVars.SMTP_HOST || process.env.SMTP_HOST;
const port = Number(envVars.SMTP_PORT || process.env.SMTP_PORT);

// Set 1: NOREPLY
const noreplyUser = envVars.SMTP_NOREPLY_USER || process.env.SMTP_NOREPLY_USER;
const noreplyPass = envVars.SMTP_NOREPLY_PASS || process.env.SMTP_NOREPLY_PASS;

// Set 2: NOTIFICATION (for Welcome Promotor)
const notificationUser = envVars.SMTP_NOTIFICATION_USER || process.env.SMTP_NOTIFICATION_USER;
const notificationPass = envVars.SMTP_NOTIFICATION_PASS || process.env.SMTP_NOTIFICATION_PASS;


async function verifyCredentials(label: string, user?: string, pass?: string) {
    console.log(`\n--- Testing ${label} ---`);
    if (!host || !port || !user || !pass) {
        console.error(`Missing configuration for ${label}:`, {
            host: !!host,
            port: !!port,
            user: !!user,
            pass: !!pass
        });
        return;
    }

    console.log(`Config: Host=${host}, Port=${port}, User=${user}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false, // true for 465, false for other ports
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });

    try {
        console.log(`Verifying ${label}...`);
        await transporter.verify();
        console.log(`✅ ${label} authentication SUCCESSFUL!`);

        // Optional: Try sending to self
        /*
        console.log(`Sending test email for ${label}...`);
        const info = await transporter.sendMail({
            from: `"${label} Test" <${user}>`,
            to: user, // Send to self
            subject: `${label} Auth Test`,
            text: 'It works!',
        });
        console.log(`Message sent: %s`, info.messageId);
        */
    } catch (error: any) {
        console.error(`❌ ${label} authentication FAILED:`, error.message);
        if (error.response) console.error("Response:", error.response);
    }
}

async function runTests() {
    await verifyCredentials("SMTP_NOREPLY_USER", noreplyUser, noreplyPass);
    await verifyCredentials("SMTP_NOTIFICATION_USER", notificationUser, notificationPass);
}

runTests();
