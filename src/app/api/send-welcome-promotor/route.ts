import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function POST(req: Request) {
  try {
    const { email, names, codes } = await req.json();

    if (!email || !names) {
      return NextResponse.json(
        { message: 'Email and names are required' },
        { status: 400 }
      );
    }

    const codesList: any[] = Array.isArray(codes) ? codes : [];

    // -----------------------
    // 1. Generate XLSX (Refined: Only Codes)
    // -----------------------
    const wb = XLSX.utils.book_new();
    // Format data for Excel: Just the header "CÓDIGOS" and the list
    const wsData = [
      ['CÓDIGOS'],
      ...codesList.map((c: any) => [c.codigo]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Adjust column width for better visibility
    ws['!cols'] = [{ wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Códigos');
    const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // -----------------------
    // 2. Generate PDF (Refined: Single Column, Better Layout)
    // -----------------------
    const doc = new jsPDF();

    // -- Colors --
    const pink = [236, 72, 153]; // #ec4899
    const black = [0, 0, 0];
    const gray = [80, 80, 80];
    const blue = [59, 130, 246];

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(pink[0], pink[1], pink[2]);
    doc.text('Bira Party - Glow Edition', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('CÓDIGOS DE PROMOTOR', 105, 30, { align: 'center' });

    // -- Separator Line --
    doc.setDrawColor(pink[0], pink[1], pink[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // -- Info Section --
    doc.setFontSize(11);
    doc.setTextColor(gray[0], gray[1], gray[2]);

    const startInfoY = 45;
    doc.text(`Promotor:`, 20, startInfoY);
    doc.setFont("helvetica", "bold");
    doc.text(names, 45, startInfoY);
    doc.setFont("helvetica", "normal"); // Reset font

    doc.text(`Fecha del Evento: 28/02/2026`, 20, startInfoY + 7);
    doc.text(`Válido hasta: 01/03/2026 - 01:00 AM`, 20, startInfoY + 14);

    // -- Right Side Link --
    doc.text(`Canjea tus códigos en:`, 140, startInfoY);
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.textWithLink('https://biraparty.lat', 140, startInfoY + 7, { url: 'https://biraparty.lat' });
    doc.setTextColor(gray[0], gray[1], gray[2]); // Reset

    // -- 5-Column Table --
    const columns = 5;
    const tableBody = [];
    for (let i = 0; i < codesList.length; i += columns) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        row.push(codesList[i + j]?.codigo || '');
      }
      tableBody.push(row);
    }

    autoTable(doc, {
      startY: startInfoY + 25,
      // No header to save space, or just use it if user wants. User asked for list of codes.
      // We will skip header to maximize density as requested.
      body: tableBody,
      theme: 'grid',
      styles: {
        halign: 'center',
        fontSize: 10, // Slightly smaller font to fit
        cellPadding: 2,
      },
      // Use more width
      margin: { left: 15, right: 15 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // -- Rewards Section --
    doc.setFontSize(12);
    doc.setTextColor(pink[0], pink[1], pink[2]);
    doc.text('METAS Y RECOMPENSAS', 105, finalY, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(black[0], black[1], black[2]);
    const rewardsY = finalY + 7;
    doc.text('• 20 Invitados: 2 Cervezas Pilsen', 105, rewardsY, { align: 'center' });
    doc.text('• 30 Invitados: 3 Cervezas Pilsen', 105, rewardsY + 5, { align: 'center' });
    doc.text('• 50 Invitados: 1 Flor de Caña + Coca Cola + Hielo', 105, rewardsY + 10, { align: 'center' });

    const footerY = rewardsY + 25;

    // -- Footer --
    doc.setFontSize(10);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Síguenos para más información:', 105, footerY, { align: 'center' });

    doc.setTextColor(blue[0], blue[1], blue[2]);
    // Note: textWithLink doesn't support centering directly usually, so we calculate approx pos or use separate calls
    // TikTok
    doc.textWithLink('Tiktok: @Biraparty', 80, footerY + 7, { url: 'https://tiktok.com/@Biraparty', align: 'center' });
    // Instagram
    doc.textWithLink('Instagram: @Biraparty', 130, footerY + 7, { url: 'https://instagram.com/Biraparty', align: 'center' });
    // Whatsapp
    doc.textWithLink('Whatsapp: +51 991991169', 105, footerY + 14, { url: 'https://wa.me/51991991169', align: 'center' });

    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFontSize(9);
    doc.text('Ubicación: Jr Piura 266 al lado del restaurante "El califa"', 105, footerY + 25, { align: 'center' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // -----------------------
    // 3. Send Email
    // -----------------------

    // Removed sensitive debug logs

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_NOTIFICATION_USER,
        pass: process.env.SMTP_NOTIFICATION_PASS,
      },
      secure: false, // Use false for port 587
      requireTLS: true, // Use STARTTLS
    });

    // "Black Card" HTML Design (Same as before)
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap');
            body { margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header-image { width: 100%; height: auto; display: block; background-color: #000; padding: 40px 0; text-align: center; }
            .card { background-color: #000000; color: #ffffff; padding: 40px 30px; text-align: center; margin: 20px; border-radius: 20px; border: 1px solid #333; box-shadow: 0 0 30px rgba(236, 72, 153, 0.3); }
            .title { font-size: 28px; font-weight: 600; margin-bottom: 20px; color: #ffffff; }
            .highlight { color: #f472b6; }
            .subtitle { font-size: 16px; color: #e4e4e7; margin-bottom: 30px; line-height: 1.5; }
            .footer { text-align: center; padding: 20px; color: #71717a; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-image">
               <img src="https://biraparty.lat/logo.png" alt="Bira Party" style="width: 150px; height: auto; display: inline-block;" />
            </div>
            
            <div class="card">
              <h1 class="title">¡Hola <span class="highlight">${names.split(' ')[0]}</span>!</h1>
              
              <div class="subtitle">
                Te adjuntamos tus códigos para<br>
                <strong style="color: #ffffff; font-size: 18px; display: block; margin-top: 10px;">BIRA | GLOW PARTY</strong>
                <span style="font-size: 14px; color: #a1a1aa;"></span>
              </div>

              <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
                <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
                  Saludos,<br>
                  <strong style="color: #fff;">La administración</strong>
                </p>
              </div>
            </div>

            <div class="footer">
              <p>Este correo incluye archivos adjuntos con tus códigos de acceso.</p>
              <p>© 2026 Bira Party. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
        `;

    const mailOptions = {
      from: '"BIRA NOTIFICACIONES" <notification@biraparty.lat>',
      to: email,
      subject: 'BIRA | GLOW PARTY - 28/02/2026: Te enviamos tus códigos',
      html: htmlContent,
      attachments: [
        {
          filename: `codigos_${names.split(' ')[0]}.xlsx`,
          content: xlsxBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        {
          filename: `codigos_${names.split(' ')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Welcome email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending welcome email:', {
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
