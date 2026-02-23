export type ConsentState = "autorizado" | "pendiente" | "no_autorizado";

export type Channels = {
  web: boolean;
  rrss: boolean;
};

export type Student = {
  id: string;
  nombre: string;
  curso: string;
  estadoConsentimiento: ConsentState;
  canales: Channels;
  expiraEn: string; // ISO
  ultimaActualizacion: string; // ISO
};

export type ExpiryPreset = "6m" | "12m" | "custom";

export type ChannelKey = keyof Channels; // "web" | "rrss"

export const CHANNEL_LABEL: Record<ChannelKey, string> = {
  web: "Sitio web",
  rrss: "Redes sociales",
};

export const CONSENT_LABEL: Record<ConsentState, string> = {
  autorizado: "Autorizado",
  pendiente: "Pendiente",
  no_autorizado: "No autorizado",
};