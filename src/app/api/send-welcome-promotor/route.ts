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
        // 1. Generate XLSX
        // -----------------------
        const wb = XLSX.utils.book_new();
        // Format data for Excel: [Código, Estado, Invitado]
        const wsData = [
            ['Código', 'Estado', 'Invitado'],
            ...codesList.map((c: any) => [
                c.codigo,
                c.usado ? 'Canjeado' : 'Disponible',
                c.invitado ? `${c.invitado.nombres} ${c.invitado.apellidoPaterno}` : '-',
            ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Códigos');
        const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // -----------------------
        // 2. Generate PDF
        // -----------------------
        // Create new PDF document
        const doc = new jsPDF();

        // -- Header --
        doc.setFontSize(22);
        doc.setTextColor(236, 72, 153); // Pink-400 equivalent approx (#ec4899)
        doc.text('Bira Party - Glow Edition', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('CÓDIGOS DE PROMOTOR', 15, 35);

        // -- Info Section --
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        doc.text(`Actividad: GLOW PARTY – Fiesta Neón del Tío Bira 😎`, 15, 45);

        // Two columns for meta info
        doc.text(`Fecha: 28/02/2026`, 15, 55);
        doc.text(`Promotor: ${names}`, 15, 60);

        doc.text(`General:`, 105, 55, { align: 'center' });
        doc.text(`Los códigos pueden ser canjeados hasta: 01:00 AM - 01/03/2026`, 105, 60, { align: 'center' });

        doc.setTextColor(59, 130, 246); // Blue link color
        doc.textWithLink('https://biraparty.lat', 105, 70, { url: 'https://biraparty.lat', align: 'center' });
        doc.setTextColor(80, 80, 80); // Reset

        // -- Table of Codes --
        const tableBody = [];
        const half = Math.ceil(codesList.length / 2);
        for (let i = 0; i < half; i++) {
            const c1 = codesList[i];
            const c2 = codesList[i + half];
            tableBody.push([
                c1 ? c1.codigo : '',
                c2 ? c2.codigo : ''
            ]);
        }

        autoTable(doc, {
            startY: 80,
            head: [['Códigos (Lista 1)', 'Códigos (Lista 2)']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            styles: { halign: 'center' },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;

        // -- Footer --
        doc.setFontSize(10);
        doc.text('síguenos y entérate de más:', 105, finalY, { align: 'center' });
        doc.text('Tiktok: Biraparty', 20, finalY + 10);
        doc.text('Instagram: @Biraparty', 120, finalY + 10);

        doc.setFontSize(9);
        doc.text('Ubicacion: Jr Piura 266 al lado del restaurante "El califa"', 105, finalY + 25, { align: 'center' });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // -----------------------
        // 3. Send Email
        // -----------------------
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // "Black Card" HTML Design
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
            .logo-placeholder { font-size: 40px; font-weight: bold; color: transparent; -webkit-text-stroke: 1px #fff; opacity: 0.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-image">
               <!-- Basic text logo logic -->
               <div style="font-size: 24px; color: #f472b6; font-weight: bold; letter-spacing: 2px;">FOMO</div>
            </div>
            
            <div class="card">
              <h1 class="title">¡Hola <span class="highlight">${names.split(' ')[0]}</span>!</h1>
              
              <div class="subtitle">
                Te adjuntamos tus códigos para<br>
                <strong style="color: #ffffff; font-size: 18px; display: block; margin-top: 10px;">BIRA | GLOW PARTY</strong>
                <span style="font-size: 14px; color: #a1a1aa;">SUMMER SEASON pres. AL SON DEL CARNAVAL</span>
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
            from: 'notification@biraparty.lat',
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
        console.error('Error sending welcome email:', error);
        return NextResponse.json(
            { message: 'Error sending email', error: error.message },
            { status: 500 }
        );
    }
}
