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
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 9) {
            formattedPhone = '51' + formattedPhone;
        }

        console.log(`Sending WhatsApp via CRM to ${names} (${formattedPhone})`);

        // 2. Prepare Message
        const codeListString = Array.isArray(codes) ? codes.map((c: any) => `• ${c.codigo}`).join('\n') : 'No codes found';
        const messageText = `Hola ${names.split(' ')[0]}! 👋\n\nTe damos la bienvenida al equipo de BIRA | GLOW PARTY 🎉\n\nHemos enviado un correo a ${email} con tus archivos adjuntos (PDF/Excel). 📧\n\nAquí tienes tus códigos de acceso rápido:\n\n${codeListString}\n\n¡Recuerda que tienes recompensas por metas de invitados! 🍻\n\n- La Administración`;

        // 3. Send to Backend CRM
        const response = await axios.post(`${backendUrl}/whatsapp/send`, {
            to: formattedPhone,
            type: 'text',
            text: messageText
        });

        return NextResponse.json({ message: 'WhatsApp sent successfully', data: response.data }, { status: 200 });

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
