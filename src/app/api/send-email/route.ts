import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


export async function POST(req: Request) {
  console.log("API: /api/send-email called");
  try {
    const body = await req.json();
    const { email, names, qrLink } = body;
    console.log("API: Payload received", { email, names, qrLink });

    if (!email || !names) {
      console.error("API: Missing email or names");
      return NextResponse.json(
        { message: 'Email and names are required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_NOREPLY_USER,
        pass: process.env.SMTP_NOREPLY_PASS,
      },
    });

    const mailOptions = {
      from: `"BIRA" <${process.env.SMTP_NOREPLY_USER}>`,
      to: email,
      subject: 'Confirmación de Registro - Bira Party',
      headers: {
        'X-Entity-Ref-ID': `BIRA-${Date.now()}`, // Prevent threading/spam grouping
        'List-Unsubscribe': `<mailto:${process.env.SMTP_NOREPLY_USER}?subject=unsubscribe>`
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .button {
              background-color: #ec4899; /* Pink-500 */
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 8px;
              font-weight: bold;
            }
            .container {
              font-family: 'Arial', sans-serif;
              color: #e2e8f0; /* Slate-200 */
              background-color: #0f172a; /* Slate-900 */
              padding: 40px;
              border-radius: 16px;
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              color: #f472b6; /* Pink-400 */
              font-size: 24px;
              margin-bottom: 10px;
            }
            .text {
              line-height: 1.6;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #64748b; /* Slate-500 */
            }
          </style>
        </head>
        <body style="background-color: #020617; padding: 20px;">
          <div class="container">
            <div class="header">
              <!-- <img src="https://biraparty.lat/logo.png" alt="Bira Logo" width="150" /> -->
              <h1 style="color: white; font-size: 30px; letter-spacing: 2px;">BIRA</h1>
            </div>
            
            <h2 class="title">¡Hola ${names}!</h2>
            
            <p class="text">
              Tu registro en <strong>Bira Party</strong> ha sido confirmado exitosamente.
            </p>
            <p class="text">
              Ya tienes tu entrada asegurada. Puedes visualizar tu código QR y los detalles de tu acceso haciendo clic en el siguiente botón:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${qrLink}" class="button" style="color: white;">Ver mi QR en la Web</a>
            </div>
            
            <p class="text" style="font-size: 14px; color: #94a3b8;">
              Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br>
              <a href="${qrLink}" style="color: #f472b6;">${qrLink}</a>
            </p>
            
            <div class="footer">
              <p>Esperamos verte pronto.</p>
              <p>El equipo de Bira Party</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API: Error sending email:', error);
    return NextResponse.json(
      { message: 'Error sending email', error: error.message },
      { status: 500 }
    );
  }
}
