import { NextRequest, NextResponse } from 'next/server';

interface ApiPeruDNIResponse {
    success: boolean;
    data: {
        numero: string;
        nombre_completo: string;
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        codigo_verificacion: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const { dni } = await request.json();

        // Validate DNI format (8 digits)
        if (!dni || !/^\d{8}$/.test(dni)) {
            return NextResponse.json(
                { error: 'DNI debe tener 8 dígitos' },
                { status: 400 }
            );
        }

        // Get API token from environment
        const apiToken = process.env.APIPERU_TOKEN;
        if (!apiToken) {
            console.error('APIPERU_TOKEN not configured');
            return NextResponse.json(
                { error: 'Servicio de consulta DNI no configurado' },
                { status: 500 }
            );
        }

        // Call API Peru
        const response = await fetch('https://apiperu.dev/api/dni', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`,
            },
            body: JSON.stringify({ dni }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Peru error:', errorText);
            return NextResponse.json(
                { error: 'No se pudo consultar el DNI' },
                { status: response.status }
            );
        }

        const data: ApiPeruDNIResponse = await response.json();

        if (!data.success || !data.data) {
            return NextResponse.json(
                { error: 'DNI no encontrado' },
                { status: 404 }
            );
        }

        // Return formatted data
        return NextResponse.json({
            success: true,
            data: {
                nombres: data.data.nombres,
                apellidoPaterno: data.data.apellido_paterno,
                apellidoMaterno: data.data.apellido_materno,
            },
        });

    } catch (error) {
        console.error('DNI lookup error:', error);
        return NextResponse.json(
            { error: 'Error al consultar DNI' },
            { status: 500 }
        );
    }
}
