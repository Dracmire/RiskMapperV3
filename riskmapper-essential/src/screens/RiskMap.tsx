// src/screens/RiskMap.tsx

import { RiskHeatmap5x5 } from "../components/RiskHeatmap5x5";
import { useRiskData } from "../risk/useRiskData";

export function RiskMap() {
  const { model, loadDefaultFromPublic, uploadCSV, ready, error } = useRiskData();

  

  return (
    <div className="page">
      
      <div className="riskShell">
        <div className="riskCenter card">
          
          <div className="cardBody riskCenterBody">
            {!model ? (
              <div className="empty">
                Carga <b>riesgos.csv</b> y <b>claves.csv</b> (o usa “Cargar CSV demo”).
              </div>
            ) : (
              <RiskHeatmap5x5 model={model} />
            )}
          </div>
        </div>

        <aside className="riskRight card">
          <div className="cardHeader">
            <div className="cardTitle">Controles</div>
            <div className="muted small">CSV + bandas</div>
          </div>
          <div className="cardBody">
            <div className="riskRightButtons">
              <button className="btnPrimary" type="button" onClick={loadDefaultFromPublic}>
                Cargar Datos
              </button>

              <label className="btn">
                Subir Riesgos
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => uploadCSV("riesgos", e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="btn">
                Subir Claves
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => uploadCSV("claves", e.target.files?.[0] ?? null)}
                />
              </label>

              {!ready && !error && <div className="muted">Cargando…</div>}
              {error && <div className="errorBox">{error}</div>}
            </div>

            <div className="divider" />

<div className="riskMiniStats2">
  <div className="miniStat">
    <div className="miniLabel">Dimensiones</div>
    <div className="miniValue">{model?.dimensions.length ?? "—"}</div>
  </div>
  <div className="miniStat">
    <div className="miniLabel">Situaciones</div>
    <div className="miniValue">{model?.rows.length ?? "—"}</div>
  </div>
</div>

<div className="divider" />

            <div className="legendTinyTitle">Bandas (P×I)</div>
            {!model ? (
              <div className="muted small">Carga claves.csv</div>
            ) : (
              <div className="legendTiny">
                {model.keys.scoreBands.map((b) => (
                  <div key={`${b.min}-${b.max}`} className="legendTinyRow">
                    <span className="legendTinyName">{b.name}</span>
                    <span className="muted small">{b.min}–{b.max}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}