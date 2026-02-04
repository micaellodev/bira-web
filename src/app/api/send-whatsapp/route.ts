import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    let phone, names, email;
    try {
        const body = await req.json();
        phone = body.phone;
        names = body.names;
        email = body.email;
        const codes = body.codes;

        if (!phone || !names) {
            return NextResponse.json(
                { message: 'Phone and names are required' },
                { status: 400 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
            console.error('NEXT_PUBLIC_API_URL is missing');
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        // 1. Format Phone
        console.log(`[NextAPI] Original Phone from DB: "${phone}" (Type: ${typeof phone})`);

        let formattedPhone = String(phone).replace(/\D/g, '');
        if (formattedPhone.length === 9) {
            formattedPhone = '51' + formattedPhone;
        }

        console.log(`[NextAPI] Formatted Phone to Send: "${formattedPhone}"`);

        console.log(`[NextAPI] Using Backend URL: ${backendUrl}`);
        console.log(`[NextAPI] Sending WhatsApp to ${names} (${formattedPhone})`);

        // 2. Prepare Message
        const messageText = `✨ ¡Hola ${names.split(' ')[0]}! ✨\n\n🎉 ¡Bienvenido al equipo oficial de BIRA | GLOW PARTY!\n\nTe informamos que hemos enviado tus códigos de promotor junto con el material de apoyo a tu correo electrónico:\n\n📧 ${email}\n\n⚠️ Importante:\nRevisa tu bandeja de entrada (y Spam/No deseados) para descargar los archivos adjuntos (PDF y Excel).\n\nCualquier duda, estamos aquí para apoyarte.\n\n¡Vamos con todo! 🚀\n\n~ La Administración`;

        // 3. Send to Backend CRM
        try {
            const response = await axios.post(`${backendUrl}/whatsapp/send`, {
                to: formattedPhone,
                type: 'text',
                text: messageText
            });
            return NextResponse.json({ message: 'WhatsApp sent successfully', data: response.data }, { status: 200 });
        } catch (backendError: any) {
            console.error('[NextAPI] Backend request failed:', backendError.message);

            if (backendError.code === 'ECONNREFUSED') {
                console.error('[NextAPI] Could not connect to backend. Is it running on port 3001?');
                return NextResponse.json({
                    message: 'Backend connection failed (ECONNREFUSED). Is the backend running?',
                    detail: 'Backend offline/unreachable'
                }, { status: 502 });
            }

            // Return the actual error from backend if available
            if (backendError.response) {
                console.error('[NextAPI] Backend response data:', backendError.response.data);
                return NextResponse.json(
                    {
                        message: 'Error from backend CRM',
                        detail: backendError.response.data
                    },
                    { status: backendError.response.status || 500 }
                );
            }

            throw backendError; // Re-throw to be caught by outer catch
        }

    } catch (error: any) {
        // Detailed error logging
        const errorData = error.response?.data || error.message;
        console.error('Error sending WhatsApp via CRM:', JSON.stringify(errorData, null, 2));

        return NextResponse.json(
            {
                message: 'Error sending WhatsApp',
                detail: errorData,
                payloadSent: { phone, names }
            },
            { status: 500 }
        );
    }
}
