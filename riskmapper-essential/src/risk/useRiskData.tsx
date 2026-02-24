import React from "react";
import type { RiskModel } from "./model";
import { computeDimensions } from "./model";
import { parseClavesCSV, parseRiesgosCSV } from "./csvParse";

const KEY_RIESGOS = "riskmapper_riesgos_csv_v1";
const KEY_CLAVES = "riskmapper_claves_csv_v1";

type UploadKind = "riesgos" | "claves";

function readLocal(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

async function fetchText(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No pude cargar ${path}`);
  return await res.text();
}

type Ctx = {
  model: RiskModel | null;
  ready: boolean;
  error: string | null;
  loadDefaultFromPublic: () => Promise<void>;
  uploadCSV: (kind: UploadKind, file: File | null) => Promise<void>;
};

const RiskDataContext = React.createContext<Ctx | null>(null);

export function RiskDataProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = React.useState<RiskModel | null>(null);
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const rebuild = React.useCallback((riesgosText: string, clavesText: string) => {
    const rows = parseRiesgosCSV(riesgosText);
    const keys = parseClavesCSV(clavesText);
    const dimensions = computeDimensions(rows);
    setModel({ rows, keys, dimensions });
  }, []);

  React.useEffect(() => {
    // boot desde localStorage si existe
    setError(null);
    try {
      const riesgosText = readLocal(KEY_RIESGOS);
      const clavesText = readLocal(KEY_CLAVES);
      if (riesgosText && clavesText) rebuild(riesgosText, clavesText);
      setReady(true);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando datos");
      setReady(true);
    }
  }, [rebuild]);

  const loadDefaultFromPublic = React.useCallback(async () => {
    setError(null);
    try {
      const [riesgosText, clavesText] = await Promise.all([
        fetchText("/data/riesgos.csv"),
        fetchText("/data/claves.csv"),
      ]);
      saveLocal(KEY_RIESGOS, riesgosText);
      saveLocal(KEY_CLAVES, clavesText);
      rebuild(riesgosText, clavesText);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar /data/*.csv");
    }
  }, [rebuild]);

  const uploadCSV = React.useCallback(
    async (kind: UploadKind, file: File | null) => {
      if (!file) return;
      setError(null);
      try {
        const text = await file.text();
        if (kind === "riesgos") saveLocal(KEY_RIESGOS, text);
        if (kind === "claves") saveLocal(KEY_CLAVES, text);

        const riesgosText = kind === "riesgos" ? text : readLocal(KEY_RIESGOS);
        const clavesText = kind === "claves" ? text : readLocal(KEY_CLAVES);
        if (riesgosText && clavesText) rebuild(riesgosText, clavesText);
      } catch (e: any) {
        setError(e?.message ?? "Error leyendo archivo");
      }
    },
    [rebuild]
  );

  return (
    <RiskDataContext.Provider value={{ model, ready, error, loadDefaultFromPublic, uploadCSV }}>
      {children}
    </RiskDataContext.Provider>
  );
}

export function useRiskData() {
  const ctx = React.useContext(RiskDataContext);
  if (!ctx) throw new Error("useRiskData must be used within RiskDataProvider");
  return ctx;
}