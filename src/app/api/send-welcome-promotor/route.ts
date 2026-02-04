import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, names } = await req.json();

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
            from: 'notification@biraparty.lat', // Explicitly requested sender
            to: email,
            subject: '¡Bienvenido al equipo Bira Party!',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1>¡Hola ${names}!</h1>
          <p>Nos alegra darte la bienvenida al equipo de promotores de Bira Party.</p>
          <p>Tu cuenta ha sido creada exitosamente. Ahora puedes acceder al panel de control para gestionar tus códigos y ver tus estadísticas.</p>
          <br>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://biraparty.lat/sys-panel" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder al Panel</a>
          </div>
          <br>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <br>
          <p>Saludos,</p>
          <p>El equipo de Bira Party</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Welcome email sent successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error sending welcome email:', error);
        return NextResponse.json(
            { message: 'Error sending email', error: error.message },
            { status: 500 }
        );
    }
}
