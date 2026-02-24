import React from "react";
import type { RiskModel } from "../risk/model";
import { bandForScore } from "../risk/model";

export function RiskHeatmap5x5({ model }: { model: RiskModel }) {
  const [selected, setSelected] = React.useState<{ prob: number; imp: number } | null>(null);

  // Por celda: dimensiones + conteo total de situaciones
  const grid = React.useMemo(() => {
    const m: { dims: typeof model.dimensions; situations: number }[][] =
      Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => ({ dims: [], situations: 0 })));

    for (const d of model.dimensions) {
      m[d.imp][d.prob].dims = [...m[d.imp][d.prob].dims, d];
      m[d.imp][d.prob].situations += d.situationsCount;
    }

    for (let imp = 1; imp <= 5; imp++) {
      for (let prob = 1; prob <= 5; prob++) {
        m[imp][prob].dims.sort((a, b) => b.score - a.score);
      }
    }

    return m;
  }, [model.dimensions]);

  const selectedCell = React.useMemo(() => {
    if (!selected) return null;
    return grid[selected.imp]?.[selected.prob] ?? null;
  }, [selected, grid]);

  const colorFor = (score: number) => {
    const band = bandForScore(model.keys, score);
    const name = band?.name?.toUpperCase() ?? "";
    if (name.includes("ACEPT")) return "rgba(45, 212, 191, .30)";
    if (name.includes("TOLER")) return "rgba(34, 211, 238, .25)";
    if (name.includes("MODER")) return "rgba(251, 191, 36, .30)";
    if (name.includes("IMPORT")) return "rgba(251, 146, 60, .30)";
    if (name.includes("INACEPT")) return "rgba(244, 63, 94, .30)";
    return "rgba(255,255,255,.06)";
  };

  return (
  <div className="heatLayout">
    <div className="heatBoard card">
      

      <div className="cardBody">
        <div className="heatBoardInner">
          <div className="heatAxisY">Impacto</div>

          <div className="heatGrid">
            {[5, 4, 3, 2, 1].map((imp) => (
              <React.Fragment key={imp}>
                {[1, 2, 3, 4, 5].map((prob) => {
                  const score = prob * imp;
                  const cell = grid[imp][prob];
                  const isSel = selected?.prob === prob && selected?.imp === imp;

                  return (
                    <button
                      key={`${imp}-${prob}`}
                      type="button"
                      className={"heatCell" + (isSel ? " heatCellSel" : "")}
                      style={{ background: colorFor(score) }}
                      onClick={() => setSelected({ prob, imp })}
                    >
                      <div className="heatCellScore">{score}</div>
                      <div className="heatCellCount">{cell.situations}</div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="heatAxisX">Probabilidad</div>

          {/* Leyenda mini flotante */}
          
        </div>
      </div>
    </div>

    <div className="heatSide card">
      <div className="cardHeader">
        <div className="cardTitle">Detalle</div>
        <div className="muted small">{selected ? `P=${selected.prob} · I=${selected.imp}` : "Selecciona un cuadrante"}</div>
      </div>
      <div className="cardBody heatSideBody">
        {!selected || !selectedCell ? (
          <div className="empty">Clic en una celda para ver dimensiones y lista.</div>
        ) : (
          <>
            <div className="sideHeadline">
              {selectedCell.dims.length} dimensiones · {selectedCell.situations} situaciones
            </div>

            {/* Lista completa, pero más apretada */}
            <div className="heatList">
              {selectedCell.dims.map((d) => {
                const band = bandForScore(model.keys, d.score);
                return (
                  <div key={d.dimension} className="heatDim">
                    <div className="heatDimTop">
                      <div className="cellMain">{d.dimension}</div>
                      <div className="pill" style={{ borderColor: "rgba(255,255,255,.18)", background: "rgba(0,0,0,.10)" }}>
                        {band ? band.name : `Score ${d.score}`}
                      </div>
                    </div>

                    <div className="muted small" style={{ margin: "6px 0 8px" }}>
                      Peor caso: P {d.prob} · I {d.imp} · {d.score} · {d.situationsCount} sit.
                    </div>

                    <div className="heatSituations">
                      {d.rows.map((r, idx) => (
                        <div key={idx} className="heatListItem">
                          <div className="cellMain">{r.situation}</div>
                          <div className="muted small">P {r.prob} · I {r.imp} · {r.score}{r.frecuencia ? ` · ${r.frecuencia}` : ""}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  )};