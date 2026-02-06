'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Loader = dynamic(() => import("@/components/ui/multi-step-loader").then(mod => mod.MultiStepLoader), {
  loading: () => null,
});
import { IconSquareRoundedX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { canjearCodigo, CanjearCodigoPayload, CanjearCodigoResponse } from "@/services/codigos";


const loadingStates = [
  { text: "Verificando documento" },
  { text: "Validando información personal" },
  { text: "Confirmando email" },
  { text: "Verificando teléfono" },
  { text: "Finalizando registro" },
  { text: "Generando código qr" },
  { text: "¡Bienvenido a Bira Party!" },
];

export default function RegistroPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tipoDocumento, setTipoDocumento] = useState<CanjearCodigoPayload["tipoDocumento"]>("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem("codigo");
    if (!c) router.push("/");
    else setCodigo(c);
  }, [router]);

  if (!codigo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: CanjearCodigoPayload = {
      codigo: codigo!,
      tipoDocumento,
      numeroDocumento,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      email,
      telefono,
    };

    try {
      const res: CanjearCodigoResponse = await canjearCodigo(payload);

      // El UUID ahora viene directamente en la respuesta
      const uuid = res.uuid || "";

      // Guardar datos en sessionStorage como respaldo
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('invitado', JSON.stringify(res));
        sessionStorage.setItem('qrData', res.qrData);
      }

      setLoading(true); // activa el loader

      // Send confirmation email
      try {
        console.log("Frontend: Sending email to", email);
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            names: `${nombres} ${apellidoPaterno}`,
            qrLink: `${window.location.origin}/qr/${uuid}`
          }),
        });
        console.log("Frontend: Email API response status:", emailRes.status);
        if (!emailRes.ok) {
          const errorBody = await emailRes.text();
          console.error("Frontend: Email API failed:", errorBody);
        } else {
          console.log("Frontend: Email sent successfully");
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      setTimeout(() => {
        setLoading(false);
        // Redirect to UUID-based URL
        if (uuid) {
          router.push(`/qr/${uuid}`);
        } else {
          setError("Error: UUID no encontrado");
        }
      }, loadingStates.length * 2000);
    } catch (e: any) {
      setError(e.message || "Error al canjear");
      setLoading(false);
    }
  };

  return (
    <>
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

      {loading && (
        <button
          className="fixed top-4 right-4 text-white z-[120] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setLoading(false)}
        >
          <IconSquareRoundedX className="h-8 w-8 sm:h-10 sm:w-10" />
        </button>
      )}

      <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative z-10">
        <div className="relative z-10 shadow-input mx-auto w-full max-w-md rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={128}
              height={128}
              className="w-32 sm:w-40 drop-shadow-2xl"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Completa tu Registro de Invitación
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Ingresa tus datos para obtener tu código QR
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-red-400 font-semibold text-sm sm:text-base text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Tipo de Documento */}
            <LabelInputContainer>
              <Label htmlFor="tipoDocumento" className="text-white font-medium">
                Tipo de Documento
              </Label>
              <Select
                id="tipoDocumento"
                value={tipoDocumento}
                onChange={(e) =>
                  setTipoDocumento(e.target.value as CanjearCodigoPayload["tipoDocumento"])
                }
                className="bg-white/5 border-white/20 text-white backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40 [&>option]:bg-zinc-900 [&>option]:text-white"
              >
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
              </Select>
            </LabelInputContainer>

            {/* Número de Documento */}
            <LabelInputContainer>
              <Label htmlFor="numeroDocumento" className="text-white font-medium">
                Número de Documento
              </Label>
              <Input
                id="numeroDocumento"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="12345678"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
              />
            </LabelInputContainer>

            {/* Nombres */}
            <LabelInputContainer>
              <Label htmlFor="nombres" className="text-white font-medium">
                Nombres
              </Label>
              <Input
                id="nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Juan Carlos"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
              />
            </LabelInputContainer>

            {/* Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="apellidoPaterno" className="text-white font-medium">
                  Apellido Paterno
                </Label>
                <Input
                  id="apellidoPaterno"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  placeholder="Sánchez"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="apellidoMaterno" className="text-white font-medium">
                  Apellido Materno
                </Label>
                <Input
                  id="apellidoMaterno"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  placeholder="Durden"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
                />
              </LabelInputContainer>
            </div>

            {/* Email */}
            <LabelInputContainer>
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                type="email"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
              />
            </LabelInputContainer>

            {/* Teléfono */}
            <LabelInputContainer>
              <Label htmlFor="telefono" className="text-white font-medium">
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="999 999 999"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40"
              />
            </LabelInputContainer>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6 min-h-[48px] bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20"
            >
              Registrarme
            </Button>

            {/* Helper text */}
            <p className="text-gray-500 text-xs text-center mt-4">
              Al registrarte, aceptas nuestros términos y condiciones
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
);