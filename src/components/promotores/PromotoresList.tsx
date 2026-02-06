
import { Button } from '@/components/ui/button';

interface PromotorContacto {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    telefono: string;
}

async function getPromotores(): Promise<PromotorContacto[]> {
    if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error("API URL not configured");
        return [];
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotores/lista`, {
            next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
        });

        if (!response.ok) {
            throw new Error('Error al cargar promotores');
        }

        return await response.json();
    } catch (err) {
        console.error("Failed to fetch promotores:", err);
        return [];
    }
}

export async function PromotoresList() {
    const promotores = await getPromotores();
    const error = promotores.length === 0 ? "No se pudieron cargar los promotores o no hay disponibles." : null;

    const formatWhatsAppNumber = (telefono: string) => {
        return telefono.replace(/\D/g, '');
    };

    if (error && promotores.length === 0) {
        return (
            <div className="w-full max-w-md bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="text-gray-400">No hay promotores disponibles en este momento.</p>
            </div>
        );
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            {promotores.map((promotor) => (
                <div
                    key={promotor.id}
                    className="bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl p-6 space-y-4 hover:bg-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02]"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <p className="text-zinc-400 text-xs uppercase tracking-wide">Promotor</p>
                        <p className="text-white text-lg font-semibold">
                            {promotor.nombres} {promotor.apellidoPaterno} {promotor.apellidoMaterno}
                        </p>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                        <p className="text-zinc-400 text-xs uppercase tracking-wide">WhatsApp</p>
                        <p className="text-white text-base font-medium">
                            +51 {promotor.telefono}
                        </p>
                    </div>

                    {/* WhatsApp Button */}
                    <Button
                        asChild
                        variant="outline"
                        className="w-full min-h-[44px] bg-green-600 hover:bg-green-700 text-white border-0 font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-green-600/30"
                    >
                        <a
                            href={`https://wa.me/+51${formatWhatsAppNumber(promotor.telefono)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Contactar por WhatsApp
                        </a>
                    </Button>
                </div>
            ))}
        </div>
    );
}
