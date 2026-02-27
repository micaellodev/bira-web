const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

//

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
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/codigos/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Código inválido...');
  }

  return res.json();
}

export interface CanjearCodigoPayload {
  codigo: string;
  nombresInvitado: string;
  dniInvitado: string;
  emailInvitado: string;
}

export async function canjearCodigo(
  data: CanjearCodigoPayload
): Promise<{ qrData: string }> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/codigos/canjear`, {
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

// Wallet API functions
export async function addToGoogleWallet(invitadoId: number): Promise<{ url: string }> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/wallet/google/${invitadoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Error generating Google Wallet pass');
  }

  return res.json();
}

export async function addToAppleWallet(invitadoId: number): Promise<Blob> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/wallet/apple/${invitadoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Error generating Apple Wallet pass');
  }

  return res.blob();
}

export interface InvitadoResponse {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  promotor?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  qrData: string;
  ticketId?: string;
  uuid?: string;
}

export async function getInvitadoByUuid(uuid: string): Promise<InvitadoResponse> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/invitados/uuid/${uuid}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Invitado no encontrado');
  }

  return res.json();
}

export interface ReservaResponse {
  uuid: string;
  ticketId: string;
  mesaId: number;
  tipoLugar: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  personas: number;
  licores: Record<string, number>;
  estado: string;
  qrData?: string;
}

export async function getReservaByUuid(uuid: string): Promise<ReservaResponse> {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/reservas/qr/${uuid}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.message || 'Reserva no encontrada');
  }

  return res.json();
}
