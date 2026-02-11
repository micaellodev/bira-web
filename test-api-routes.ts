
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
// console.log(`Loading env from ${envPath}`);

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
    console.error("Could not read .env.local");
}

const API_URL = envVars.NEXT_PUBLIC_API_URL;
const ADMIN_PATH = '/sys-mgmt';

// We need a token. Since I can't easily login without password, 
// I'll try to use the public endpoints or just check if routes exist by checking 404 vs 401/403.
// Wait, I need to know if the route exists.
// I can try to hit the login endpoint first if I knew the password, but I don't.
// However, the user is logged in on their machine.

// I will assume the LIST endpoint works as per the code.
// I'll try to list promoters. If I get 401, I know I need auth. 
// But query to `createPromotor` was public.

async function testRoutes() {
    console.log(`API URL: ${API_URL}`);

    try {
        console.log("Testing GET /promotores (Public create check equivalent? No, create is POST)");
        // Try GET on public promotores to see if it exists?
        try {
            await axios.get(`${API_URL}/promotores`);
            console.log("GET /promotores: 200 OK (Unexpected for public?)");
        } catch (e: any) {
            console.log(`GET /promotores: ${e.response?.status} ${e.response?.statusText}`);
        }

        // Try GET on /sys-mgmt/promotores (Admin list)
        // Without token, should be 401. If 404, then route is wrong.
        try {
            await axios.get(`${API_URL}${ADMIN_PATH}/promotores`);
            console.log(`GET ${ADMIN_PATH}/promotores: 200 OK`);
        } catch (e: any) {
            console.log(`GET ${ADMIN_PATH}/promotores: ${e.response?.status} ${e.response?.statusText}`);
        }

        // Try DELETE on /sys-mgmt/promotores/123 (Dummy ID)
        // Without token. If 404, could be route missing OR id missing. 
        // If 401, route likely exists but protected.
        try {
            await axios.delete(`${API_URL}${ADMIN_PATH}/promotores/123`);
            console.log(`DELETE ${ADMIN_PATH}/promotores/123: 200 OK`);
        } catch (e: any) {
            console.log(`DELETE ${ADMIN_PATH}/promotores/123: ${e.response?.status} ${e.response?.statusText}`);
        }

        // Try DELETE on /promotores/123 (Public path?)
        try {
            await axios.delete(`${API_URL}/promotores/123`);
            console.log(`DELETE /promotores/123: 200 OK`);
        } catch (e: any) {
            console.log(`DELETE /promotores/123: ${e.response?.status} ${e.response?.statusText}`);
        }

        // Try DELETE on /sys-mgmt/promotor/123 (Singular)
        try {
            await axios.delete(`${API_URL}${ADMIN_PATH}/promotor/123`);
            console.log(`DELETE ${ADMIN_PATH}/promotor/123: 200 OK`);
        } catch (e: any) {
            console.log(`DELETE ${ADMIN_PATH}/promotor/123: ${e.response?.status} ${e.response?.statusText}`);
        }

        // Try DELETE on /promotor/123 (Singular Public)
        try {
            await axios.delete(`${API_URL}/promotor/123`);
            console.log(`DELETE /promotor/123: 200 OK`);
        } catch (e: any) {
            console.log(`DELETE /promotor/123: ${e.response?.status} ${e.response?.statusText}`);
        }

    } catch (error) {
        console.error("Global error", error);
    }
}

testRoutes();
