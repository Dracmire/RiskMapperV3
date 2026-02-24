// src/screens/RiskMap.tsx
import { useStudents } from "../state/useStudents";
import { RiskHeatmap5x5 } from "../components/RiskHeatmap5x5";
import { useRiskData } from "../risk/useRiskData";

export function RiskMap() {
  const { students } = useStudents();
  const { model, loadDefaultFromPublic, uploadCSV, ready, error } = useRiskData();

  const noAut = students.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
  const expSoon = students.filter(
    (s) => (new Date(s.expiraEn).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30
  ).length;

  return (
    <div className="page">
      
      <div className="riskShell">
        <div className="riskCenter card">
          <div className="cardHeader">
            aaaa
          </div>
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

            <div className="riskMiniStats">
              <div className="miniStat"><div className="miniLabel">Dimensiones</div><div className="miniValue">{model?.dimensions.length ?? "—"}</div></div>
              <div className="miniStat"><div className="miniLabel">Situaciones</div><div className="miniValue">{model?.rows.length ?? "—"}</div></div>
              <div className="miniStat"><div className="miniLabel">No autorizados</div><div className="miniValue">{noAut}</div></div>
              <div className="miniStat"><div className="miniLabel">Expiran ≤30d</div><div className="miniValue">{expSoon}</div></div>
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