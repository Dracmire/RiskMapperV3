export type RiskRow = {
  dimension: string; // Actividad de Riesgo (DIMENSIÓN)
  situation: string; // Descripción de la Situación de Riesgo
  frecuencia?: string;
  prob: 1 | 2 | 3 | 4 | 5;
  imp: 1 | 2 | 3 | 4 | 5;
  score: number; // prob*imp (viene o se calcula)
};

export type KeyScaleRow = {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
};

export type ScoreBand = {
  min: number;
  max: number;
  name: string;
  description: string;
};

export type RiskKeys = {
  probability: KeyScaleRow[];
  impact: KeyScaleRow[];
  scoreBands: ScoreBand[];
  frequencyMap: { frecuencia: string; prob: 1 | 2 | 3 | 4 | 5 }[];
};

export type DimensionPoint = {
  dimension: string;
  // Posición por DIMENSIÓN = “peor caso” (máximo score dentro de la dimensión)
  prob: 1 | 2 | 3 | 4 | 5;
  imp: 1 | 2 | 3 | 4 | 5;
  score: number;
  situationsCount: number;
  rows: RiskRow[];
};

export type RiskModel = {
  rows: RiskRow[];
  keys: RiskKeys;
  dimensions: DimensionPoint[];
};

export function computeDimensions(rows: RiskRow[]): DimensionPoint[] {
  const byDim = new Map<string, RiskRow[]>();
  for (const r of rows) {
    const key = (r.dimension || "(Sin dimensión)").trim();
    byDim.set(key, [...(byDim.get(key) ?? []), r]);
  }

  const dims: DimensionPoint[] = [];
  for (const [dimension, list] of byDim.entries()) {
    const worst = list.reduce((a, b) => (b.score > a.score ? b : a), list[0]);
    dims.push({
      dimension,
      prob: worst.prob,
      imp: worst.imp,
      score: worst.score,
      situationsCount: list.length,
      rows: [...list].sort((a, b) => b.score - a.score),
    });
  }

  return dims.sort((a, b) => b.score - a.score || a.dimension.localeCompare(b.dimension, "es"));
}

export function bandForScore(keys: RiskKeys, score: number) {
  return keys.scoreBands.find((b) => score >= b.min && score <= b.max) ?? null;
}