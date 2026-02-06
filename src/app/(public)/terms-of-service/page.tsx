import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Condiciones del Servicio</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">Última actualización: 05/02/2026</p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Acuerdo de Términos</h2>
                    <p className="mb-4">
                        Estos Términos de Uso constituyen un acuerdo legalmente vinculante realizado entre usted, ya sea personalmente o en nombre de una entidad ("usted") y Bira ("nosotros", "nos" o "nuestro"),
                        con respecto a su acceso y uso del sitio web y la aplicación Bira.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Derechos de Propiedad Intelectual</h2>
                    <p className="mb-4">
                        A menos que se indique lo contrario, el Sitio es nuestra propiedad exclusiva y todo el código fuente, bases de datos, funcionalidad, software,
                        diseños de sitios web, audio, video, texto, fotografías y gráficos en el Sitio (colectivamente, el "Contenido") y las marcas comerciales,
                        marcas de servicio y logotipos contenidos en el mismo (las "Marcas") son propiedad nuestra o están bajo nuestro control o licencia.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Representaciones del Usuario</h2>
                    <p className="mb-4">
                        Al utilizar el Sitio, usted declara y garantiza que: (1) toda la información de registro que envíe será verdadera, precisa, actual y completa;
                        (2) mantendrá la precisión de dicha información y actualizará rápidamente dicha información de registro según sea necesario;
                        (3) tiene la capacidad legal y acepta cumplir con estos Términos de uso.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Modificaciones y Partes</h2>
                    <p className="mb-4">
                        Nos reservamos el derecho de cambiar, modificar o eliminar el contenido del Sitio en cualquier momento o por cualquier motivo a nuestra entera discreción sin previo aviso.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Contáctenos</h2>
                    <p className="mb-4">
                        Para resolver una queja sobre el Sitio o para recibir más información sobre el uso del Sitio, contáctenos en: dmicaellozoppi@outlook.com
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-white">
                    <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        &larr; Volver al inicio
                    </Link>
                    <span className="text-sm text-gray-500">Bira &copy; 2026</span>
                </div>
            </div>
        </div>
    );
}
