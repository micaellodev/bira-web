import React from 'react';
import Link from 'next/link';

export default function DataDeletion() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Instrucciones para la Eliminación de Datos</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        De acuerdo con las reglas de la Plataforma de Facebook, debemos proporcionar un Aviso de devolución de llamada de eliminación de datos
                        o una URL de instrucciones de eliminación de datos. Si desea eliminar sus actividades para la aplicación Bira, puede seguir estas instrucciones:
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opción 1: Eliminación Automática desde Facebook</h2>
                    <ol className="list-decimal pl-5 mb-4 space-y-2">
                        <li>Vaya a la configuración de su cuenta de Facebook y privacidad. Haga clic en "Configuración".</li>
                        <li>Busque "Aplicaciones y sitios web" y verá todas las aplicaciones y sitios web que vinculó con su cuenta de Facebook.</li>
                        <li>Busque y haga clic en "Bira" en la barra de búsqueda.</li>
                        <li>Desplácese y haga clic en "Eliminar".</li>
                        <li>Felicitaciones, ha eliminado con éxito las actividades de su aplicación.</li>
                    </ol>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Opción 2: Solicitar Eliminación Directa</h2>
                    <p className="mb-4">
                        Alternativamente, puede solicitar que eliminemos todos sus datos de nuestros servidores enviando una solicitud directa.
                    </p>
                    <ol className="list-decimal pl-5 mb-4 space-y-2">
                        <li>Envíe un correo electrónico a <strong>dmicaellozoppi@outlook.com</strong> con el asunto "Solicitud de Eliminación de Datos".</li>
                        <li>Incluya su nombre completo y la dirección de correo electrónico asociada con su cuenta.</li>
                        <li>Procesaremos su solicitud dentro de los 30 días y le confirmaremos una vez que sus datos hayan sido eliminados permanentemente.</li>
                    </ol>
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
