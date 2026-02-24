// src/screens/RiskMap.tsx

import { useStudents } from "../state/useStudents";
import { RiskHeatmap5x5 } from "../components/RiskHeatmap5x5";
import { useRiskData } from "../risk/useRiskData";

export function RiskMap({ onGoDashboard }: { onGoDashboard: () => void }) {
  const { students } = useStudents();
  const { model, loadDefaultFromPublic, uploadCSV, ready, error } = useRiskData();

  const noAut = students.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
  const expSoon = students.filter((s) => (new Date(s.expiraEn).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30).length;

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Risk Map</h1>
          <p className="muted">Mapa de calor 5×5. Clic en un cuadrante para ver detalle.</p>
        </div>
        <button className="btn" onClick={onGoDashboard} type="button">
          Ver dashboard →
        </button>
      </div>

      <div className="riskLayout">
        {/* IZQUIERDA: acciones + numeritos */}
        <div className="riskSidebar card">
          <div className="cardHeader">
            <div className="cardTitle">Datos</div>
            <div className="muted small">CSV</div>
          </div>
          <div className="cardBody">
            <div className="riskActions">
              <button className="btnPrimary" type="button" onClick={loadDefaultFromPublic}>
                Cargar CSV demo
              </button>

              <label className="btn">
                Subir riesgos.csv
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => uploadCSV("riesgos", e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="btn">
                Subir claves.csv
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

            <div className="miniStats">
              <div className="miniStat">
                <div className="miniLabel">Dimensiones</div>
                <div className="miniValue">{model?.dimensions.length ?? "—"}</div>
              </div>
              <div className="miniStat">
                <div className="miniLabel">Situaciones</div>
                <div className="miniValue">{model?.rows.length ?? "—"}</div>
              </div>
              <div className="miniStat">
                <div className="miniLabel">No autorizados</div>
                <div className="miniValue">{noAut}</div>
              </div>
              <div className="miniStat">
                <div className="miniLabel">Expiran ≤30d</div>
                <div className="miniValue">{expSoon}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTRO: HEATMAP PROTAGONISTA */}
        <div className="riskMain">
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">Mapa de calor 5×5</div>
              <div className="muted small">Número = situaciones</div>
            </div>
            <div className="cardBody">
              {!model ? (
                <div className="empty">
                  Carga <b>riesgos.csv</b> y <b>claves.csv</b> (o usa “Cargar CSV demo”).
                </div>
              ) : (
                <RiskHeatmap5x5 model={model} />
              )}
            </div>
          </div>
        </div>

        {/* DERECHA: LEYENDA PEQUEÑA (NO texto largo) */}
        <div className="riskLegend card">
          <div className="cardHeader">
            <div className="cardTitle">Leyenda</div>
            <div className="muted small">Bandas (P×I)</div>
          </div>
          <div className="cardBody">
            {!model ? (
              <div className="empty">Carga claves.csv</div>
            ) : (
              <div className="legendBandsCompact">
                {model.keys.scoreBands.map((b) => (
                  <div key={`${b.min}-${b.max}`} className="legendBandCompact">
                    <div className="legendBandName">{b.name}</div>
                    <div className="muted small">{b.min}–{b.max}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="divider" />

            <div className="muted small" style={{ lineHeight: 1.4 }}>
              Probabilidad e Impacto se interpretan desde <b>claves.csv</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}