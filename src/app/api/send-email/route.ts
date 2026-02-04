import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, names, qrLink } = await req.json();

        if (!email || !names) {
            return NextResponse.json(
                { message: 'Email and names are required' },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Confirmación de Registro - Bira Party',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1>¡Hola ${names}!</h1>
          <p>Tu registro en Bira Party ha sido exitoso.</p>
          <p>Adjunto encontrarás tu código QR para el ingreso.</p>
          <p>Puedes ver tu entrada aquí: <a href="${qrLink}">${qrLink}</a></p>
          <br>
          <p>Saludos,</p>
          <p>El equipo de Bira Party</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { message: 'Error sending email', error: error.message },
            { status: 500 }
        );
    }
}
