import { Footer } from "@/components/Footer";
import { AudioBackground } from "@/components/AudioBackground";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex flex-col items-center text-white w-full overflow-hidden">
            {/* Video Background Desktop */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 scale-105"
            >
                <source src="https://pptmoljiblztxdfwjbsr.supabase.co/storage/v1/object/public/background/background.mp4" type="video/mp4" />
            </video>

            {/* Video Background Mobile */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="block md:hidden absolute inset-0 w-full h-full object-cover z-0 scale-105"
            >
                <source src="https://pptmoljiblztxdfwjbsr.supabase.co/storage/v1/object/public/background/background_phone.mp4" type="video/mp4" />
            </video>

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
