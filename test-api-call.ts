
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load .env.local to get API URL
const envPath = path.join(__dirname, '.env.local');
let envVars: Record<string, string> = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        if (key) envVars[key.trim()] = valueParts.join('=').trim();
    });
} catch (e) { }

const API_URL = envVars.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// Note: NEXT_PUBLIC_API_URL might point to backend, but this is a Next.js API route, 
// so it should be relative to the Next.js server.
// If the app runs on 3000, we should target 3000.
// Let's assume standard Next.js port 3000 if not specified for the frontend itself.
const FRONTEND_URL = 'http://localhost:3000';

console.log(`Testing API at ${FRONTEND_URL}/api/send-email`);

async function testApi() {
    try {
        const response = await axios.post(`${FRONTEND_URL}/api/send-email`, {
            email: envVars.SMTP_NOREPLY_USER, // Send to self again
            names: 'Test User API',
            qrLink: 'https://biraparty.lat/qr/test-uuid'
        });
        console.log('Response:', response.status, response.data);
    } catch (error: any) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testApi();
