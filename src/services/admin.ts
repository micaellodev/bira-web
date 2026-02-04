import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://';
const ADMIN_TOKEN_KEY = '_sys_auth_token';

// Hidden admin API path
const ADMIN_PATH = '/sys-mgmt';

export interface DashboardStats {
    totalCodes: number;
    codesRedeemed: number;
    codesValidated: number;
    totalPromoters: number;
    codesAvailable: number;
}

export interface Promotor {
    id: number;
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    stats: {
        totalCodes: number;
        codesRedeemed: number;
        codesValidated: number;
    };
}

export interface CodigoCanjeado {
    id: number;
    codigo: string;
    validadoEvento: boolean;
    invitado: {
        nombres: string;
        apellidos: string;
        documento: string;
        email: string;
        telefono: string;
    } | null;
    promotor: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    fechaCanje: string;
}

export interface CodigoValidado {
    id: number;
    codigo: string;
    invitado: {
        nombres: string;
        apellidos: string;
        documento: string;
    } | null;
    promotor: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    fechaValidacion: string;
}

export interface AnalyticsPromotor {
    nombre: string;
    totalCodigos: number;
    canjeados: number;
    validados: number;
}

export interface AnalyticsEvento {
    fecha: string;
    canjeados: number;
    validados: number;
}

export interface CodigoPromotor {
    id: number;
    codigo: string;
    usado: boolean;
    validadoEvento: boolean;
    invitado: {
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
        numeroDocumento: string;
    } | null;
}

class AdminService {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    }

    private setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }

    private getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async login(password: string): Promise<{ token: string }> {
        const response = await axios.post(
            `${API_URL}${ADMIN_PATH}/auth`,
            { password },
            { headers: { 'Content-Type': 'application/json' } }
        );
        this.setToken(response.data.token);
        return response.data;
    }

    logout(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    async getDashboard(): Promise<DashboardStats> {
        const response = await axios.get(`${API_URL}${ADMIN_PATH}/dashboard`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getPromotores(): Promise<Promotor[]> {
        const response = await axios.get(`${API_URL}${ADMIN_PATH}/promotores`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getPromotorStats(id: number) {
        const response = await axios.get(`${API_URL}${ADMIN_PATH}/promotores/${id}/stats`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getPromotorCodes(id: number): Promise<CodigoPromotor[]> {
        const response = await axios.get(`${API_URL}/codigos/promotor/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getCodigosCanjeados(): Promise<CodigoCanjeado[]> {
        const response = await axios.get(`${API_URL}${ADMIN_PATH}/codigos/canjeados`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getCodigosValidados(): Promise<CodigoValidado[]> {
        const response = await axios.get(`${API_URL}${ADMIN_PATH}/codigos/validados`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getAnalyticsPromotor(): Promise<AnalyticsPromotor[]> {
        try {
            const response = await axios.get(`${API_URL}${ADMIN_PATH}/analytics/promotores`, {
                headers: this.getHeaders(),
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to load promotor analytics (possibly blocked):', error);
            return [];
        }
    }

    async getAnalyticsEvento(): Promise<AnalyticsEvento[]> {
        try {
            const response = await axios.get(`${API_URL}${ADMIN_PATH}/analytics/evento`, {
                headers: this.getHeaders(),
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to load event analytics (possibly blocked):', error);
            return [];
        }
    }

    // Promoter management
    async createPromotor(data: {
        dni: string;
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        email: string;
        telefono: string;
    }) {
        const response = await axios.post(`${API_URL}/promotores`, data);
        return response.data;
    }

    async assignCodesToPromotor(promotorId: number, cantidad: number) {
        const response = await axios.post(`${API_URL}/codigos/generar`, {
            promotorId,
            cantidad,
        });
        return response.data;
    }

    async sendWelcomePromotor(data: { email: string; names: string; codes: any[] }) {
        const response = await axios.post('/api/send-welcome-promotor', data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }

    async sendWhatsAppWelcome(data: { phone: string; names: string; email: string; codes: any[] }) {
        const response = await axios.post('/api/send-whatsapp', data, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }

    async deletePromotor(id: number) {
        // Assuming the backend has a delete endpoint at this path
        const response = await axios.delete(`${API_URL}${ADMIN_PATH}/promotores/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
}

export const adminService = new AdminService();
