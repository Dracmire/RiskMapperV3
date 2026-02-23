import React from "react";
import { useStudents } from "../state/useStudents";
import type { Channels, Student } from "../state/types";
import { CONSENT_LABEL } from "../state/types";
import { computeExpiryISO } from "../data/generateStudents";
import { useToast } from "../components/Toast";

function byName(a: Student, b: Student) {
  return a.nombre.localeCompare(b.nombre, "es");
}

export function Portal() {
  const { students, updateConsent, revokeConsent } = useStudents();
  const { show, Toast } = useToast();

  const sorted = React.useMemo(() => [...students].sort(byName), [students]);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(sorted[0]?.id ?? "");

  const options = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((s) => s.nombre.toLowerCase().includes(q));
  }, [sorted, query]);

  React.useEffect(() => {
    if (!options.find((s) => s.id === selectedId)) {
      setSelectedId(options[0]?.id ?? "");
    }
  }, [options, selectedId]);

  const current = React.useMemo(() => students.find((s) => s.id === selectedId) ?? null, [students, selectedId]);

  const [canales, setCanales] = React.useState<Channels>({ web: false, rrss: false });
  const [preset, setPreset] = React.useState<"6m" | "12m" | "custom">("6m");
  const [customDate, setCustomDate] = React.useState<string>("");

  React.useEffect(() => {
    if (!current) return;
    setCanales({ ...current.canales });
    setCustomDate(current.expiraEn.slice(0, 10));
    // no cambiamos preset automáticamente; se siente más de “formulario”
  }, [current?.id]);

  const expiraISO = React.useMemo(() => {
    if (preset === "custom") return computeExpiryISO("custom", customDate);
    return computeExpiryISO(preset);
  }, [preset, customDate]);

  const onConfirm = () => {
    if (!current) return;
    updateConsent(current.id, { canales, expiraEn: expiraISO });
    show("Registro guardado");
  };

  const onRevoke = () => {
    if (!current) return;
    revokeConsent(current.id);
    setCanales({ web: false, rrss: false });
    show("Registro guardado");
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Portal de Autorización</h1>
          <p className="muted">Una pantalla, simple: elegir estudiante → confirmar o revocar.</p>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Seleccionar estudiante</div>
          </div>
          <div className="cardBody">
            <div className="formRow">
              <label className="label">Buscar por nombre</label>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Sofía González"
              />
            </div>
            <div className="formRow">
              <label className="label">Estudiante</label>
              <select className="select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {options.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — {s.curso}
                  </option>
                ))}
              </select>
              <div className="muted small">Mostrando {options.length} resultados</div>
            </div>
          </div>
        </div>

 <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Detalle y autorización</div>
          </div>
          <div className="cardBody">
            {!current ? (
              <div className="empty">No hay estudiante seleccionado.</div>
            ) : (
              <>
              <div className="infoGrid">
                  <div>
                    <div className="muted small">Nombre</div>
                    <div className="infoValue">{current.nombre}</div>
                  </div>
                  <div>
                    <div className="muted small">Curso</div>
                    <div className="infoValue">{current.curso}</div>
                  </div>
                  <div>
                    <div className="muted small">Estado actual</div>
                    <div className={"pill " + current.estadoConsentimiento}>{CONSENT_LABEL[current.estadoConsentimiento]}</div>
                  </div>
                  <div>
                    <div className="muted small">Expira</div>
                    <div className="infoValue">{new Date(current.expiraEn).toLocaleDateString("es-CL")}</div>
                  </div>
                </div>

                <div className="divider" />

                <div className="formRow">
                  <div className="label">Autorizo uso de imagen en:</div>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={canales.web}
                      onChange={(e) => setCanales((c) => ({ ...c, web: e.target.checked }))}
                      disabled={current.estadoConsentimiento === "no_autorizado" ? false : false}
                    />
                    Sitio web
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={canales.rrss}
                      onChange={(e) => setCanales((c) => ({ ...c, rrss: e.target.checked }))}
                    />
                    Redes sociales
                  </label>
                  <div className="muted small">
                    Si confirmas sin marcar canales, queda como <b>pendiente</b>.
                  </div>
                </div>

                <div className="formRow">
                  <div className="label">Vigencia</div>
                  <div className="segBtns">
                    <button
                      type="button"
                      className={"segBtn" + (preset === "6m" ? " segActive" : "")}
                      onClick={() => setPreset("6m")}
                    >
                      6 meses
                    </button>
                    <button
                      type="button"
                      className={"segBtn" + (preset === "12m" ? " segActive" : "")}
                      onClick={() => setPreset("12m")}
                    >
                      12 meses
                    </button>
                    <button
                      type="button"
                      className={"segBtn" + (preset === "custom" ? " segActive" : "")}
                      onClick={() => setPreset("custom")}
                    >
                      Fecha personalizada
                    </button>
                  </div>

                  {preset === "custom" && (
                    <input
                      className="input"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  )}

                  <div className="muted small">Se guardará con expiración: {new Date(expiraISO).toLocaleDateString("es-CL")}</div>
                </div>

                <div className="actions">
                  <button className="btnPrimary" onClick={onConfirm} type="button">
                    Confirmar autorización
                  </button>
                  <button className="btnDanger" onClick={onRevoke} type="button">
                    Revocar autorización
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Toast />
    </div>
  );
}