import type { RiskKeys, RiskRow } from "./model";

// Parser CSV simple (comillas, comas; también acepta ';')
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (ch === "," || ch === ";")) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((c) => c !== "")) rows.push(row);
  }

  return rows;
}

function toInt5(x: string): 1 | 2 | 3 | 4 | 5 {
  const n = Math.max(1, Math.min(5, Math.round(Number(String(x).replace(/[^0-9.-]/g, "")))));
  return n as 1 | 2 | 3 | 4 | 5;
}

function toScore(x: string, prob: number, imp: number) {
  const n = Number(String(x).replace(/[^0-9.-]/g, ""));
  if (Number.isFinite(n) && n > 0) return n;
  return prob * imp;
}

export function parseRiesgosCSV(text: string): RiskRow[] {
  const grid = parseCSV(text);

  // En tu CSV real, el header está después de filas “bonitas” del Excel.
  const headerIdx = grid.findIndex((r) =>
    r.some((c) => c.toLowerCase().includes("descripción de la situación"))
  );
  if (headerIdx < 0) throw new Error("No pude encontrar el header de la tabla en riesgos.csv");

  const header = grid[headerIdx].map((h) => h.toLowerCase());

  const idx = (needle: string) => header.findIndex((h) => h.includes(needle));

  const iDimension = idx("actividad");
  const iSituation = idx("situación");
  const iFreq = idx("frecuencia");
  const iProb = idx("probabilidad");
  const iImp = idx("impacto");
  const iScore = idx("clasificación");

  if (iDimension < 0 || iSituation < 0 || iProb < 0 || iImp < 0) {
    throw new Error("Columnas obligatorias no encontradas en riesgos.csv (actividad/situación/probabilidad/impacto)");
  }

  const out: RiskRow[] = [];

  for (let r = headerIdx + 1; r < grid.length; r++) {
    const row = grid[r];
    const dimension = (row[iDimension] ?? "").trim();
    const situation = (row[iSituation] ?? "").trim();
    if (!dimension && !situation) continue;

    const prob = toInt5(row[iProb] ?? "");
    const imp = toInt5(row[iImp] ?? "");
    const score = toScore(row[iScore] ?? "", prob, imp);
    const frecuencia = iFreq >= 0 ? (row[iFreq] ?? "").trim() : undefined;

    out.push({ dimension, situation, frecuencia, prob, imp, score });
  }

  return out;
}

export function parseClavesCSV(text: string): RiskKeys {
  const grid = parseCSV(text);

  const norm = (s: string) => (s ?? "").toLowerCase().trim();
  const rowHas = (r: string[], needle: string) => r.some((c) => norm(c).includes(needle));
  const compact = (r: string[]) => r.map((x) => (x ?? "").trim()).filter((x) => x !== "");

  // PROBABILIDAD: buscamos la fila que contiene el título de la tabla (en cualquier columna)
  const probTableIdx = grid.findIndex((r) => rowHas(r, "valoración cuantitativa de la probabilidad"));
  if (probTableIdx < 0) throw new Error("No pude ubicar la tabla de PROBABILIDAD en claves.csv");

  const probability: RiskKeys["probability"] = [];
  for (let i = probTableIdx + 1; i < grid.length; i++) {
    const r = compact(grid[i]);
    if (r.length < 3) break;
    const v = Number(r[0]);
    if (!Number.isFinite(v)) break;
    probability.push({ value: toInt5(r[0]) as any, label: r[1], description: r[2] });
  }

  // IMPACTO
  const impTableIdx = grid.findIndex((r) => rowHas(r, "valoración cuantitativa del impacto"));
  if (impTableIdx < 0) throw new Error("No pude ubicar la tabla de IMPACTO en claves.csv");

  const impact: RiskKeys["impact"] = [];
  for (let i = impTableIdx + 1; i < grid.length; i++) {
    const r = compact(grid[i]);
    if (r.length < 3) break;
    const v = Number(r[0]);
    if (!Number.isFinite(v)) break;
    impact.push({ value: toInt5(r[0]) as any, label: r[1], description: r[2] });
  }

  // EVALUACIÓN DEL RIESGO (bandas): buscamos fila que tenga celda "Escala"
  const evalTableIdx = grid.findIndex((r) => r.some((c) => norm(c) === "escala"));
  if (evalTableIdx < 0) throw new Error("No pude ubicar la tabla de EVALUACIÓN DEL RIESGO en claves.csv");

  const scoreBands: RiskKeys["scoreBands"] = [];
  for (let i = evalTableIdx + 1; i < grid.length; i++) {
    const r = compact(grid[i]);
    if (r.length < 3) break;

    const m = r[0].match(/(\d+)\s*[-–]\s*(\d+)/);
    if (!m) break;

    scoreBands.push({ min: Number(m[1]), max: Number(m[2]), name: r[1], description: r[2] });
  }

  // FRECUENCIA → PROB (si existe)
  const freqIdx = grid.findIndex((r) => r.some((c) => norm(c) === "frecuencia"));
  const frequencyMap: RiskKeys["frequencyMap"] = [];

  if (freqIdx >= 0) {
    for (let i = freqIdx + 1; i < grid.length; i++) {
      const r = compact(grid[i]);
      if (r.length < 2) break;

      const last = r[r.length - 1];
      const pv = Number(String(last).replace(/[^0-9.-]/g, ""));
      if (!Number.isFinite(pv)) break;

      frequencyMap.push({ frecuencia: r[0], prob: toInt5(String(pv)) });
    }
  }

  probability.sort((a, b) => b.value - a.value);
  impact.sort((a, b) => b.value - a.value);

  return { probability, impact, scoreBands, frequencyMap };
}