"use client";

import { QrCard } from "@/components/QrCard";
import React, { useEffect, useState } from "react";

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
    console.log("Invitado completo:", invitadoParsed);
    setInvitado(invitadoParsed);
    setQrData(qrRaw);
  }, []);

  if (!invitado) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden relative">
      {/* Container for the card with some breathing room */}
      <QrCard invitado={invitado} qrData={qrData} />
    </div>
  );
}
