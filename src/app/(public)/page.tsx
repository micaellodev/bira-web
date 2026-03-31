import BiraLogo from "@/components/icons/Biralogo";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center gap-8 text-center w-full justify-center px-4 min-h-[85vh]">
      {/* Content wrapper with floating effect */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg p-10 rounded-3xl backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,255,255,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Glow effect behind the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl -z-10" />

        {/* Logo */}
        <div className="transform transition-all duration-[3000ms] ease-in-out hover:scale-105 relative w-full flex justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          <BiraLogo className="w-full max-w-[250px] sm:max-w-xs drop-shadow-2xl" />
        </div>

        {/* Maintenance Message */}
        <div className="space-y-6 w-full flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 [text-shadow:0_2px_10px_rgb(0_0_0/0.8)] tracking-tight">
            Volveremos Pronto
          </h1>
          
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <p className="text-gray-200 font-semibold text-xl sm:text-2xl pt-2 [text-shadow:0_2px_4px_rgb(0_0_0/0.8)]">
            Sobrino, nos estaremos viendo pronto.
          </p>

          <div className="mt-8 px-6 py-2 rounded-full border border-white/10 bg-white/5 animate-pulse">
            <span className="text-cyan-300/90 text-sm font-medium tracking-wider uppercase">
              Estamos en mantenimiento
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}