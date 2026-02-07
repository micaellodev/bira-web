
export function generateEmailHtml(names: string, qrLink: string, promoterName?: string): string {
  const firstName = names.split(' ')[0].toUpperCase();
  const fullNameUpper = names.toUpperCase();
  const safePromoterName = promoterName || 'Bira Party';

  // Generate QR Code URL (using a public API for embedding in email) - Increased size to 250x250
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink)}&color=ec4899&bgcolor=0f172a&margin=10`;

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Entrada - Bira Party</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            background-color: #020617; /* Very dark background */
            font-family: 'Outfit', 'Helvetica', sans-serif;
            color: #ffffff;
          }
          .container {
            max-width: 400px;
            margin: 40px auto;
            background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #ec4899; /* Pink border */
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
            text-align: center;
            position: relative;
          }
          /* Top decorative curve */
          .top-curve {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 30px;
            background-color: #020617;
            border-bottom-left-radius: 20px;
            border-bottom-right-radius: 20px;
            border-bottom: 1px solid #ec4899;
            border-left: 1px solid #ec4899;
            border-right: 1px solid #ec4899;
            border-top: none;
            z-index: 10;
          }
          
          .logo-container {
            margin-top: 50px;
            margin-bottom: 20px;
          }
          
          .guest-name {
            font-size: 28px;
            font-weight: 900;
            color: #fce7f3; /* Light pinkish white */
            text-transform: uppercase;
            line-height: 1.1;
            padding: 0 20px;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
          
          .qr-container {
            margin: 30px auto;
            padding: 10px;
            background-color: #0f172a;
            border-radius: 16px;
            display: inline-block;
            border: 2px solid #ec4899;
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
          }
          
          .promoter-label {
            font-size: 12px;
            color: #94a3b8; /* Slate-400 */
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .promoter-name {
             font-size: 16px;
             color: #ec4899; /* Pink-500 */
             font-weight: 700;
             margin-bottom: 40px;
          }
          
          .footer-timer {
             background-color: #000000;
             padding: 15px;
             font-size: 12px;
             color: #ec4899;
             border-top: 1px solid #331e3b;
             text-transform: uppercase;
             letter-spacing: 2px;
          }
          
          .button {
            background-color: #ec4899;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 30px;
            font-size: 14px;
          }

          /* Fallback for email clients that strip styles */
          a { color: #ec4899; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="top-curve"></div>
          
  <div class="logo-container">
             <img src="https://biraparty.lat/icon_template_email.png" alt="Bira Party" width="100" style="display: block; margin: 0 auto;">
          </div>
          
          <div class="guest-name">
            ${fullNameUpper}
          </div>
          
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="Tu Código QR" width="220" height="220" style="display: block;" />
          </div>
          
          <div class="promoter-label">PROMOTOR:</div>
          <div class="promoter-name">${safePromoterName}</div>
          
          <div>
            <a href="${qrLink}" class="button">Ver Entrada Web</a>
          </div>
          
          <div class="footer-timer">
            OPENS IN: 28 FEB 2026
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
           <p>Si no puedes ver el código QR, haz clic en el botón "Ver Entrada Web".</p>
           <p>© 2026 Bira Party. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;
}

export function generateEmailText(names: string, qrLink: string, promoterName?: string): string {
  const firstName = names.split(' ')[0].toUpperCase();
  const fullNameUpper = names.toUpperCase();
  const safePromoterName = promoterName || 'Bira Party';

  // Generate QR Code URL for text version
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink)}&color=ec4899&bgcolor=0f172a&margin=10`;

  return `
      ¡Hola ${firstName}!
      
      Tu entrada para Bira Party está confirmada.
      
      Nombre: ${fullNameUpper}
      Promotor: ${safePromoterName}
      
      Puedes ver tu código QR y los detalles de tu acceso en el siguiente enlace:
      ${qrLink}
      
      Enlace directo a la imagen del código QR:
      ${qrCodeUrl}
      
      Te esperamos el 28 de Febrero de 2026.
    `;
}
