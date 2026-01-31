"use client";

import { CometCard } from "@/components/comet-card";
import { AuroraBackground } from "@/components/aurora-background";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Invitado {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  codigo?: string;
  promotor?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

export default function QRPage() {
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [qrData, setQrData] = useState<string>("");

  useEffect(() => {
    const invitadoRaw = sessionStorage.getItem("invitado");
    const qrRaw = sessionStorage.getItem("qrData");

    if (!invitadoRaw || !qrRaw) {
      // Si no hay datos, volver a la página principal
      window.location.href = "/";
      return;
    }

    const invitadoParsed = JSON.parse(invitadoRaw) as Invitado;
    console.log("Invitado completo:", invitadoParsed); // 👈 Agrega esto
    console.log("Promotor:", invitadoParsed.promotor);
    setInvitado(invitadoParsed);
    setQrData(qrRaw);
  }, []);

  if (!invitado) return null;

  return (
    <AuroraBackground className="min-h-screen w-full flex flex-col items-center justify-center bg-black">
      <img src="./logo.png" alt="Logo" className="w-70 -translate-y-20 mb-4" />

      <CometCard>
        <div
          className="flex w-80 flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-2 saturate-0 md:p-4"
          aria-label={`View invite ${invitado.id}`}
        >
          <div className="mx-2 flex-1">
            <div className="relative mt-2 aspect-[3/4] w-full overflow-hidden rounded-[16px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 80%, white, transparent)",
                    backgroundSize: "200% 200%",
                    opacity: 0.4,
                  }}
                />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                <div className="text-white drop-shadow-lg">
                  <h2 className="text-4xl font-bold mb-2">
                    {invitado.nombres}
                  </h2>
                  <h3 className="text-3xl font-semibold mb-4">
                    {invitado.apellidoPaterno} {invitado.apellidoMaterno}
                  </h3>
                  <p className="text-xl font-mono opacity-90 font-semibold">
                    {invitado.tipoDocumento}: {invitado.numeroDocumento}
                  </p>
                  {invitado.promotor && (
                    <p className="text-sm mt-2 opacity-90 font-semibold bg-black/20 px-2 py-1 rounded">
                      Promotor: {invitado.promotor.nombres}{" "}
                      {invitado.promotor.apellidos}
                    </p>
                  )}
                </div>

                <div className="flex justify-center mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <QRCodeSVG
                      value={qrData}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
            <div className="text-xs">Comet Invitation</div>
            <div className="text-xs text-gray-300 opacity-50">
              #{invitado.codigo || ""}
            </div>
          </div>
        </div>
      </CometCard>
    </AuroraBackground>
  );
}
