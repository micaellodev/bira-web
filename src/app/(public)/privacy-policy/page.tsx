import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">Última actualización: {new Date().toLocaleDateString()}</p>

                    <p className="mb-4">
                        Bienvenido a Bira ("nosotros", "nuestro", o "nos"). Nos comprometemos a proteger su información personal y su derecho a la privacidad.
                        Si tiene alguna pregunta o inquietud sobre este aviso de privacidad o nuestras prácticas con respecto a su información personal,
                        comuníquese con nosotros a dmicaellozoppi@outlook.com.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. ¿Qué información recopilamos?</h2>
                    <p className="mb-4">
                        Recopilamos información personal que usted nos proporciona voluntariamente cuando se registra en el Servicio,
                        expresa interés en obtener información sobre nosotros o nuestros productos y servicios, cuando participa en actividades en el Servicio
                        o cuando se comunica con nosotros.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. ¿Cómo usamos su información?</h2>
                    <p className="mb-4">
                        Procesamos su información para fines basados en intereses comerciales legítimos, el cumplimiento de nuestro contrato con usted,
                        el cumplimiento de nuestras obligaciones legales y/o su consentimiento.
                        Utilizamos la información personal recopilada a través de nuestro Servicio para una variedad de fines comerciales que se describen a continuación:
                    </p>
                    <ul className="list-disc pl-5 mb-4">
                        <li>Para facilitar la creación de cuentas y el proceso de inicio de sesión.</li>
                        <li>Para enviarle comunicaciones de marketing y promocionales.</li>
                        <li>Para cumplir y gestionar sus pedidos.</li>
                        <li>Para enviarle información administrativa.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. ¿Compartimos su información con alguien?</h2>
                    <p className="mb-4">
                        Solo compartimos información con su consentimiento, para cumplir con las leyes, para brindarle servicios,
                        para proteger sus derechos o para cumplir con obligaciones comerciales.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Cookies y otras tecnologías de seguimiento</h2>
                    <p className="mb-4">
                        Podemos utilizar cookies y tecnologías de seguimiento similares para acceder o almacenar información.
                        En nuestro Aviso de cookies se incluye información específica sobre cómo utilizamos dichas tecnologías y cómo puede rechazar determinadas cookies.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Contacto</h2>
                    <p className="mb-4">
                        Si tiene preguntas o comentarios sobre esta política, puede enviarnos un correo electrónico a dmicaellozoppi@outlook.com.
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-white">
                    <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        &larr; Volver al inicio
                    </Link>
                    <span className="text-sm text-gray-500">Bira &copy; {new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    );
}
