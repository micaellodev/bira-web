
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
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 163 100" width="100" style="display: block; margin: 0 auto;">
                <path fill="#ffffff" d="M58.37 72.01c-.52-3.57-6.4-10.48-10.8-12.14-.56-.21-.72-.93-.28-1.34 3.26-3.08 5.78-6.05 6.3-9.85.57-4.21-.73-10.91-5.33-14.2-4.6-3.29-10.69-9.73-13.79-12.7-3.1-2.97-10.15-11.9-10.56-16.34C23.48 1 23.68.2 22.56 0c-1.11-.19-3.05 4.24-3.07 4.3-.03.1-3.67 10.59-1.08 19.28 2.6 8.72 10.38 14.04 10.38 14.04s13.83 10.64 14.04 14.47c.13 2.31-.58 3.83-1.16 4.67-.35.51-.97.75-1.57.6-1.96-.49-6.84-1.66-9.97-1.91-.7-.05-1.26-.67-1.27-1.37-.03-4.16-.09-9.15-.11-11.23 0-.61-.31-1.16-.83-1.49-2.14-1.35-5.59-3.3-7.93-7.02-.03 0-1.49-1.94-2.31-3.01-.18-.23-.54-.11-.54.18-.02 9.57.39 45.95.44 50.7 0 .35.14.68.39.92.52.5 1.6 1.41 3.56 2.49 1.12.62 1.82 1.07 2.26 1.39.34.25.18.79-.24.8-1.56.06-4.79-.13-8.4-2.2-5.07-2.9-7.37-5.87-8.68-9.93-2.32-7.18 1.86-11.04.08-12.35-1.63-1.2-5.53 3-6.44 9.17-.32 2.17-.08 9.44 2.69 13.85 2.78 4.4 10.66 11.89 20.9 12.35 10.24.46 15.19-.41 19.76-2.23 4.56-1.82 11.65-6.29 13.72-11.94 2.07-5.65 1.76-8.59 1.18-12.54ZM30.14 88.13c-.69 0-1.24-.56-1.24-1.26V67.08c0-.76.66-1.34 1.41-1.25 4.55.57 18.73 2.89 21.19 9.99 2.79 8.06-13.05 12.33-21.35 12.3Z" />
                <path fill="#ffffff" d="m64.93 45.9 9.42-7.11a.687.687 0 0 1 1.1.55v40.59c0 .65.53 1.18 1.18 1.18h5.24c.65 0 1.17-.53 1.17-1.17V54.72c0-1.12.49-2.18 1.33-2.9l6.57-5.65 5.65-4.85a6.062 6.062 0 0 1 8.15.22c1.88 1.78 4.27 4.15 6.2 7.81.32.61.15 1.44-.41 1.85-4.36 3.19-6.75 4.96-8.05 5.94-.57.43-1.37.04-1.42-.67-.14-2.07-1.1-5.44-5.52-7.39-.52-.23-1.12.15-1.11.72.14 9.9-.03 34.75-.07 40.43 0 .65-.53 1.17-1.18 1.17H77.92c-7.7 0-13.95-6.24-13.95-13.95V47.87c0-.77.36-1.49.97-1.95ZM62.99 29.13l5.32 5c.62.58 1.59.55 2.18-.06L75.34 29c.58-.61.57-1.57-.03-2.16l-5-4.94c-.6-.6-1.58-.59-2.17.02l-5.19 5.35c-.51.52-.49 1.36.04 1.86ZM161.09 81.85h-20.22c-.56 0-1.01-.45-1.01-1.01V50.07a.84.84 0 0 0-.84-.85h-4.88c-.33 0-.48-.41-.23-.63 4.54-3.97 6.42-8.26 6.6-12.59.19-4.56-1.05-5.55-2.68-5.52-1.63.03-.38 3.41-3.38 6.77s-10.09 7.98-15.1 11.14-7.92 11.3-7.92 11.3-3.79 13.53.64 23.53 14.94 8 16.21 8.03c1.2.03 1.46-1.14 2.95-4.43.13-.29.53-.3.69-.03 2.98 5.1 7.29 4.43 7.29 4.43h18.05c.36 0 .68-.2.84-.52l3.74-7.61a.85.85 0 0 0-.76-1.23Zm-32.22.44c-1.65.26-5.71.4-7.45-4.15-2.14-5.61-2.41-18.88 7.09-24.35.42-.24.95.05.95.53l.12 27.13c0 .42-.3.77-.72.84Z" />
             </svg>
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
