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
          <p className="muted">
            El consentimiento no queda en un formulario suelto: <b>actualiza el estado del mapa y el tablero</b>.
          </p>
        </div>
        <button className="btn" onClick={onGoDashboard} type="button">
          Ver dashboard →
        </button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Datos (CSV) → Scoring → Heatmap</div>
            <div className="muted small">Sin backend · Persistencia local</div>
          </div>
          <div className="cardBody">
            <div className="hint" style={{ marginTop: 0 }}>
              Coloca en <b>public/data</b>: <code>riesgos.csv</code> y <code>claves.csv</code>
            </div>

            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btnPrimary" type="button" onClick={loadDefaultFromPublic}>
                Cargar CSV demo (public/data)
              </button>

              <label className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Subir riesgos.csv
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => uploadCSV("riesgos", e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Subir claves.csv
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => uploadCSV("claves", e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {!ready && !error && <div className="muted" style={{ marginTop: 10 }}>Cargando…</div>}
            {error && <div className="errorBox">{error}</div>}

            {model && (
              <div className="metaGrid" style={{ marginTop: 12 }}>
                <div className="meta">
                  <div className="muted small">Dimensiones</div>
                  <div className="metaValue">{model.dimensions.length}</div>
                </div>
                <div className="meta">
                  <div className="muted small">Situaciones</div>
                  <div className="metaValue">{model.rows.length}</div>
                </div>
                <div className="meta">
                  <div className="muted small">No autorizados (consent.)</div>
                  <div className="metaValue">{noAut}</div>
                </div>
                <div className="meta">
                  <div className="muted small">Expiran pronto (consent.)</div>
                  <div className="metaValue">{expSoon}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Interpretación (CLAVES)</div>
            <div className="muted small">Extraído del CSV</div>
          </div>
          <div className="cardBody">
            {!model ? (
              <div className="empty">Carga los CSV para ver escalas/rangos.</div>
            ) : (
              <div className="keysGrid">
                <div className="keysBlock">
                  <div className="keysTitle">Probabilidad (1–5)</div>
                  {model.keys.probability.map((p) => (
                    <div key={p.value} className="keysRow">
                      <span className="keysBadge">{p.value}</span>
                      <div>
                        <div className="keysLabel">{p.label}</div>
                        <div className="muted small">{p.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="keysBlock">
                  <div className="keysTitle">Impacto (1–5)</div>
                  {model.keys.impact.map((p) => (
                    <div key={p.value} className="keysRow">
                      <span className="keysBadge">{p.value}</span>
                      <div>
                        <div className="keysLabel">{p.label}</div>
                        <div className="muted small">{p.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="keysBlock span2">
                  <div className="keysTitle">Evaluación por score (P×I)</div>
                  <div className="rangeGrid">
                    {model.keys.scoreBands.map((b) => (
                      <div key={`${b.min}-${b.max}`} className="rangeCard">
                        <div className="rangeTop">
                          <div className="rangeName">{b.name}</div>
                          <div className="rangeNums">
                            {b.min}–{b.max}
                          </div>
                        </div>
                        <div className="muted small">{b.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card span2">
          <div className="cardHeader">
            <div className="cardTitle">Mapa de calor 5×5</div>
            <div className="muted small">Dimensiones + conteo de situaciones (clic para drill-down)</div>
          </div>
          <div className="cardBody">
            {!model ? <div className="empty">Carga los CSV para generar el mapa.</div> : <RiskHeatmap5x5 model={model} />}
          </div>
        </div>
      </div>
    </div>
  );
}