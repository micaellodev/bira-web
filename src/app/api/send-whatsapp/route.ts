import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { phone, names, email, codes } = await req.json();

        if (!phone || !names) {
            return NextResponse.json(
                { message: 'Phone and names are required' },
                { status: 400 }
            );
        }

        const token = process.env.MANYCHAT_API_TOKEN;
        if (!token) {
            console.error('MANYCHAT_API_TOKEN is missing');
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        // 1. Format Phone
        // Remove spaces, dashes, ensure valid format.
        // ManyChat expects phone buffer, often just numbers.
        let formattedPhone = phone.replace(/\D/g, '');
        // If length is 9 (typical Peru mobile), add 51.
        if (formattedPhone.length === 9) {
            formattedPhone = '51' + formattedPhone;
        }

        console.log(`Attempting to send WhatsApp to ${names} (${formattedPhone})`);

        // 2. Find or Create Subscriber
        // Endpoint: https://api.manychat.com/fb/subscriber/createSubscriber
        // Docs: https://api.manychat.com/swagger#/Subscriber/createSubscriber
        let subscriberId: string | null = null;
        try {
            const createRes = await axios.post(
                'https://api.manychat.com/fb/subscriber/createSubscriber',
                {
                    first_name: names.split(' ')[0],
                    last_name: names.split(' ').slice(1).join(' '),
                    phone: `+${formattedPhone}`,
                    has_opt_in_sms: true,
                    has_opt_in_email: true,
                    consent_phrase: "Welcome message"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            subscriberId = createRes.data?.data?.id;
        } catch (error: any) {
            console.error('Error creating subscriber:', error.response?.data || error.message);
            // Fallback: Try to find by info? Usually createSubscriber handles upsert.
            // If it failed, maybe the number is invalid or another issue.
        }

        if (!subscriberId) {
            // Try searching just in case create failed but user exists (unlikely with upsert behavior but possible)
            // Using createSubscriber is standard for "ensure subscriber exists".
            // If we failed here, we probably can't send.
            return NextResponse.json({ message: 'Could not create/find subscriber in ManyChat' }, { status: 500 });
        }

        // 3. Send Content
        // Endpoint: https://api.manychat.com/fb/sending/sendContent
        const codeListString = Array.isArray(codes) ? codes.map((c: any) => `• ${c.codigo}`).join('\n') : 'No codes found';

        const messageText = `Hola ${names.split(' ')[0]}! 👋\n\nTe damos la bienvenida al equipo de BIRA | GLOW PARTY 🎉\n\nHemos enviado un correo a ${email} con tus archivos adjuntos (PDF/Excel). 📧\n\nAquí tienes tus códigos de acceso rápido:\n\n${codeListString}\n\n¡Recuerda que tienes recompensas por metas de invitados! 🍻\n\n- La Administración`;

        const content = {
            subscriber_id: subscriberId,
            data: {
                version: 'v2',
                content: {
                    type: 'whatsapp', // Or 'telegram', 'facebook', but user asked for WhatsApp.
                    // Important: If ManyChat account is WhatsApp-enabled, we send 'whatsapp'.
                    // If simple text is needed regardless of channel logic complications in ManyChat:
                    messages: [
                        {
                            type: 'text',
                            text: messageText
                        }
                    ]
                }
            },
            message_tag: 'ACCOUNT_UPDATE' // Required for some Facebook messages, technically WA templates are stricter.
            // For WhatsApp, usually you need a template if outside 24h.
            // If this is a "first contact", it might fail without a template.
            // We will TRY standard text. If it fails, user needs Templates.
        };

        const sendRes = await axios.post(
            'https://api.manychat.com/fb/sending/sendContent',
            content,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({ message: 'WhatsApp sent successfully', data: sendRes.data }, { status: 200 });

    } catch (error: any) {
        console.error('Error sending WhatsApp:', error.response?.data || error.message);
        return NextResponse.json(
            { message: 'Error sending WhatsApp', error: error.response?.data || error.message },
            { status: 500 }
        );
    }
}
