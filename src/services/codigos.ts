// src/api/codigos.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Promotor {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface ValidarCodigoResponse {
  codigo: string;
  promotor: Promotor;
}

export async function validarCodigo(codigo: string): Promise<ValidarCodigoResponse> {
  const res = await fetch(`${API_URL}/codigos/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Código inválido');
  }

  return res.json();
}

export interface CanjearCodigoPayload {
  codigo: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: 'DNI' | 'PASAPORTE' | 'CARNET_EXTRANJERIA';
  numeroDocumento: string;
  telefono: string;
  email: string;
}

export interface CanjearCodigoResponse {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  promotor: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  codigo: string; // Código en texto plano
  uuid: string; // UUID para identificar el QR
  qrData: string; // QR encriptado
}

export async function canjearCodigo(
  data: CanjearCodigoPayload
): Promise<CanjearCodigoResponse> {
  const res = await fetch(`${API_URL}/codigos/canjear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Error al canjear');
  }

  return res.json();
}