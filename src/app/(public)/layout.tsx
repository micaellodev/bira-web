import { Footer } from "@/components/Footer";
import { AudioBackground } from "@/components/AudioBackground";
import { VideoBackground } from "@/components/home/VideoBackground";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex flex-col items-center text-white w-full overflow-hidden">
            {/* Video Background — carga solo el video del dispositivo actual */}
            <VideoBackground />

            {/* Audio Background */}
            <AudioBackground />


            <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
                {children}
            </div>
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    );
}
