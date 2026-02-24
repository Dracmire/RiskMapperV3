import React from "react";
import { useStudents } from "../state/useStudents";
import { RiskHeatmap5x5 } from "../components/RiskHeatmap5x5";
import { useRiskData } from "../risk/useRiskData";
import { Modal } from "../components/Modal";

export function RiskMap({ onGoDashboard }: { onGoDashboard: () => void }) {
  const { students } = useStudents();
  const { model, loadDefaultFromPublic, uploadCSV, ready, error } = useRiskData();
  const [legendOpen, setLegendOpen] = React.useState(false);

  const noAut = students.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
  const expSoon = students.filter((s) => (new Date(s.expiraEn).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30).length;

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Risk Map</h1>
          <p className="muted">Mapa de calor 5×5 (scoring desde CSV). Clic en un cuadrante para ver detalle.</p>
        </div>
        <div className="headerActions">
          <button className="btnGhost" type="button" onClick={() => setLegendOpen(true)}>
            Ver leyenda
          </button>
          <button className="btn" onClick={onGoDashboard} type="button">
            Ver dashboard →
          </button>
        </div>
      </div>

      {/* Barra compacta de acciones + numeritos */}
      <div className="riskTopBar card">
        <div className="riskTopBarLeft">
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

          {!ready && !error && <span className="muted">Cargando…</span>}
          {error && <span className="errorInline">{error}</span>}
        </div>

        <div className="riskTopBarRight">
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

      {/* PROTAGONISTA */}
      <div className="riskMain">
        {!model ? (
          <div className="card">
            <div className="cardBody">
              <div className="empty">
                Carga <b>riesgos.csv</b> y <b>claves.csv</b> (o usa “Cargar CSV demo”).
              </div>
            </div>
          </div>
        ) : (
          <RiskHeatmap5x5 model={model} />
        )}
      </div>

      <Modal open={legendOpen} title="Leyenda / Interpretación (CLAVES)" onClose={() => setLegendOpen(false)}>
        {!model ? (
          <p>Carga los CSV para ver la leyenda.</p>
        ) : (
          <>
            <p className="muted">Esto se extrae de <b>claves.csv</b>.</p>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Probabilidad (1–5)</div>
                {model.keys.probability.map((p) => (
                  <div key={p.value} className="legendRow">
                    <span className="keysBadge">{p.value}</span>
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Impacto (1–5)</div>
                {model.keys.impact.map((p) => (
                  <div key={p.value} className="legendRow">
                    <span className="keysBadge">{p.value}</span>
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Bandas por score (P×I)</div>
                <div className="legendBands">
                  {model.keys.scoreBands.map((b) => (
                    <div key={`${b.min}-${b.max}`} className="legendBand">
                      <div style={{ fontWeight: 900 }}>{b.name}</div>
                      <div className="muted small">{b.min}–{b.max}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}