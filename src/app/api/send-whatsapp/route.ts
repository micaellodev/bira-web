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
        const type = body.type || 'promoter'; // Default to promoter for backward compatibility

        if (type === 'guest') {
            const qrLink = body.qrLink || 'https://biraparty.lat';
            const firstName = names.split(' ')[0];

            // Extract TicketID/UUID from QR Link
            // Assumes format: .../qr/TICKET_ID
            const ticketId = qrLink.split('/').pop() || 'error-no-id';

            console.log(`[NextAPI] Preparing Template 'bira_confirmacion_ticket' for ${formattedPhone}`);

            try {
                const response = await axios.post(`${backendUrl}/whatsapp/send`, {
                    to: formattedPhone,
                    type: 'template',
                    templateName: 'bira_confirmacion_ticket',
                    languageCode: 'es',
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                { type: 'text', text: firstName }      // {{1}} Name
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: '*BIRA | GLOW PARTY*' }, // {{1}} Event Name
                                { type: 'text', text: ticketId }               // {{2}} Ticket ID
                            ]
                        },
                        {
                            type: 'button',
                            sub_type: 'url',
                            index: 0,
                            parameters: [
                                { type: 'text', text: ticketId }           // Dynamic URL suffix
                            ]
                        }
                    ]
                });
                return NextResponse.json({ message: 'WhatsApp Template sent successfully', data: response.data }, { status: 200 });
            } catch (backendError: any) {
                console.error('[NextAPI] Template request failed:', backendError.response?.data || backendError.message);
                throw backendError;
            }
        } else {
            // Updated Promoter Message (Template)
            console.log(`[NextAPI] Preparing Template 'material_promotores_bira' for ${formattedPhone}`);
            const firstName = names.split(' ')[0];

            try {
                const response = await axios.post(`${backendUrl}/whatsapp/send`, {
                    to: formattedPhone,
                    type: 'template',
                    templateName: 'material_promotores_bira',
                    languageCode: 'es',
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                { type: 'text', text: firstName }      // {{1}} Name in Header
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: 'BIRA | GLOW PARTY' }, // {{1}} Event Name
                                { type: 'text', text: email }                // {{2}} Email
                            ]
                        }
                    ]
                });
                return NextResponse.json({ message: 'WhatsApp Template sent successfully', data: response.data }, { status: 200 });
            } catch (backendError: any) {
                console.error('[NextAPI] Backend request failed:', backendError.message);
                if (backendError.response) {
                    return NextResponse.json(
                        { message: 'Error from backend CRM', detail: backendError.response.data },
                        { status: backendError.response.status || 500 }
                    );
                }
                throw backendError;
            }
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
