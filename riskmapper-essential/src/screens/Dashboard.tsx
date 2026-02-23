import React from "react";
import { useStudents, isExpiringSoon } from "../state/useStudents";
import { CONSENT_LABEL } from "../state/types";
import type { Student } from "../state/types";
import { useToast } from "../components/Toast";
import { Modal } from "../components/Modal";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL");
}

function consentScore(s: Student) {
  if (s.estadoConsentimiento === "no_autorizado") return 2;
  if (s.estadoConsentimiento === "pendiente") return 1;
  return 0;
}

export function Dashboard() {
  const { students, resetDemo } = useStudents();
  const { show, Toast } = useToast();
  const [exportOpen, setExportOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [sortExpAsc, setSortExpAsc] = React.useState(true);

  const stats = React.useMemo(() => {
    const total = students.length;
    const autorizados = students.filter((s) => s.estadoConsentimiento === "autorizado").length;
    const pendientes = students.filter((s) => s.estadoConsentimiento === "pendiente").length;
    const noAut = students.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
    const expSoon = students.filter((s) => isExpiringSoon(s.expiraEn, 30)).length;
    return { total, autorizados, pendientes, noAut, expSoon };
  }, [students]);

  const chart = React.useMemo(() => {
    const total = stats.total || 1;
    return {
      autorizado: stats.autorizados / total,
      pendiente: stats.pendientes / total,
      no_autorizado: stats.noAut / total,
    };
  }, [stats]);

  const table = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = students;
    if (term) {
      rows = rows.filter((s) =>
        [s.nombre, s.curso, s.estadoConsentimiento].some((x) => x.toLowerCase().includes(term))
      );
    }

    rows = [...rows].sort((a, b) => {
      const da = new Date(a.expiraEn).getTime();
      const db = new Date(b.expiraEn).getTime();
      return sortExpAsc ? da - db : db - da;
    });

    return rows;
  }, [students, q, sortExpAsc]);
  const riesgos = React.useMemo(() => {
    const noAut = students
      .filter((s) => s.estadoConsentimiento === "no_autorizado")
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      .slice(0, 10);

    const expSoon = students
      .filter((s) => isExpiringSoon(s.expiraEn, 30))
      .sort((a, b) => new Date(a.expiraEn).getTime() - new Date(b.expiraEn).getTime())
      .slice(0, 10);

    return { noAut, expSoon };
  }, [students]);

  const onSolicitar = (s: Student) => {
    show(`Solicitud enviada (demo): ${s.nombre}`);
  };

   return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Dashboard de Autorizaciones</h1>
          <p className="muted">
            Aquí se ve el loop completo: <b>Portal → Registro → Risk Map → Dashboard</b>.
          </p>
        </div>
        <div className="headerActions">
          <button className="btn" onClick={() => setExportOpen(true)} type="button">
            Exportar reporte
          </button>
          <button className="btnGhost" onClick={resetDemo} type="button">
            Reiniciar demo
          </button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="kpiLabel">% Autorizados</div>
          <div className="kpiValue">{pct(stats.autorizados / (stats.total || 1))}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Pendientes</div>
          <div className="kpiValue">{stats.pendientes}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">No autorizados</div>
          <div className="kpiValue">{stats.noAut}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Expiran en 30 días</div>
          <div className="kpiValue">{stats.expSoon}</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Distribución de estados</div>
            <div className="muted">Gráfico simple (CSS)</div>
          </div>
          <div className="cardBody">
            <div className="barChart">
              <div className="barRow">
                <div className="barLabel">Autorizado</div>
                <div className="barTrack">
                  <div className="barFill fillOk" style={{ width: `${chart.autorizado * 100}%` }} />
                </div>
                <div className="barPct">{pct(chart.autorizado)}</div>
              </div>
              <div className="barRow">
                <div className="barLabel">Pendiente</div>
                <div className="barTrack">
                  <div className="barFill fillWarn" style={{ width: `${chart.pendiente * 100}%` }} />
                </div>
                <div className="barPct">{pct(chart.pendiente)}</div>
              </div>
              <div className="barRow">
                <div className="barLabel">No autorizado</div>
                <div className="barTrack">
                  <div className="barFill fillBad" style={{ width: `${chart.no_autorizado * 100}%` }} />
                </div>
                <div className="barPct">{pct(chart.no_autorizado)}</div>
              </div>
            </div>
            <div className="hint">
              Idea del MVP: <b>una sola fuente de verdad</b> para mapa y tablero.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Riesgos inmediatos</div>
          </div>
          <div className="cardBody">
            <div className="riskLists">
              <div>
                <div className="listTitle">No autorizados (top 10)</div>
                <ul className="list">
                  {riesgos.noAut.map((s) => (
                    <li key={s.id} className="listItem">
                      <span>{s.nombre}</span>
                      <span className="muted">{s.curso}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="listTitle">Expiran pronto (top 10)</div>
                <ul className="list">
                  {riesgos.expSoon.map((s) => (
                    <li key={s.id} className="listItem">
                      <span>{s.nombre}</span>
                      <span className="muted">{fmtDate(s.expiraEn)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card span2">
          <div className="cardHeader">
            <div className="cardTitle">Tabla operativa</div>
            <div className="tableTools">
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, curso o estado…"
              />
              <button className="btnGhost" type="button" onClick={() => setSortExpAsc((v) => !v)}>
                Ordenar por expira: {sortExpAsc ? "asc" : "desc"}
              </button>
            </div>
          </div>

          <div className="cardBody">
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th>Estado</th>
                    <th>Canales</th>
                    <th>Expira</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {table.slice(0, 150).map((s) => (
                    <tr key={s.id} className={consentScore(s) > 0 ? "rowRisk" : ""}>
                      <td>
                        <div className="cellMain">{s.nombre}</div>
                        <div className="muted small">Últ. act.: {fmtDate(s.ultimaActualizacion)}</div>
                      </td>
                      <td>{s.curso}</td>
                      <td>
                        <span className={"pill " + s.estadoConsentimiento}>{CONSENT_LABEL[s.estadoConsentimiento]}</span>
                      </td>
                      <td>
                        <span className="chip">Web: {s.canales.web ? "Sí" : "No"}</span>
                        <span className="chip">RRSS: {s.canales.rrss ? "Sí" : "No"}</span>
                      </td>
                      <td>
                        <span className={isExpiringSoon(s.expiraEn, 30) ? "expSoon" : ""}>{fmtDate(s.expiraEn)}</span>
                      </td>
                      <td>
                        <button className="btn" type="button" onClick={() => onSolicitar(s)}>
                          Solicitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="muted small" style={{ marginTop: 10 }}>
                Mostrando hasta 150 filas para que el demo vuele (pero el dataset completo se usa en KPIs y riesgos).
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={exportOpen} title="Exportar reporte" onClose={() => setExportOpen(false)}>
        <p>
          Se genera en PDF externamente (demo). Aquí solo mostramos el botón para cerrar el loop del MVP.
        </p>
      </Modal>

      <Toast />
    </div>
  );
}