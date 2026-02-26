
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateEmailHtml, generateEmailText } from '@/lib/email-template';

export async function POST(req: Request) {
  console.log("API: /api/send-email called");
  try {
    const body = await req.json();
    const { email, names, qrLink, promoterName } = body;
    console.log("API: Payload received", { email, names, qrLink, promoterName });

    if (!email || !names) {
      console.error("API: Missing email or names");
      return NextResponse.json(
        { message: 'Email and names are required' },
        { status: 400 }
      );
    }


    // Removed sensitive debug logs

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_NOTIFICATION_USER,
        pass: process.env.SMTP_NOREPLY_PASS,
      },
      secure: false, // Use false for port 587
      requireTLS: true, // Use STARTTLS
    });

    const htmlContent = generateEmailHtml(names, qrLink, promoterName);
    const textContent = generateEmailText(names, qrLink, promoterName);

    const mailOptions = {
      from: `"Bira Party" <${process.env.SMTP_NOTIFICATION_USER}>`,
      to: email,
      subject: `🎫 Tu Entrada - Bira Party`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `BIRA-${Date.now()}`,
        'List-Unsubscribe': `<mailto:${process.env.SMTP_NOTIFICATION_USER}?subject=unsubscribe>`
      },
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('API: Error sending email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return NextResponse.json(
      { message: 'Error sending email', error: error.message },
      { status: 500 }
    );
  }
}
