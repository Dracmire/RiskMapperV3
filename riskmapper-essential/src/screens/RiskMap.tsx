import React from "react";
import { useStudents, isExpiringSoon } from "../state/useStudents";
import type { ChannelKey } from "../state/types";
import { CHANNEL_LABEL } from "../state/types";

function badge(label: string, value: number) {
  return (
    <span className="badge" key={label}>
      <span className="badgeLabel">{label}</span>
      <span className="badgeValue">{value}</span>
    </span>
  );
}

function channelCounts(students: ReturnType<typeof useStudents>["students"], channel: ChannelKey) {
  const relevant = students.filter((s) => s.canales[channel]);
  const autorizados = relevant.filter((s) => s.estadoConsentimiento === "autorizado").length;
  const pendientes = relevant.filter((s) => s.estadoConsentimiento === "pendiente").length;
  const noAut = students.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
  const expSoon = relevant.filter((s) => isExpiringSoon(s.expiraEn, 30)).length;

  // Nota: para riesgo de canal, nos interesa el total de no autorizados (aunque no tengan canal marcado)
  // porque precisamente NO deberían estar marcados. Se muestra para contexto en el mapa.
  return { autorizados, pendientes, noAut, expSoon };
}

export function RiskMap({
  onGoDashboard,
}: {
  onGoDashboard: () => void;
}) {
  const { students } = useStudents();
  const [onlyNoAuth, setOnlyNoAuth] = React.useState(false);
  const [onlyExpSoon, setOnlyExpSoon] = React.useState(false);
  const [channelFilter, setChannelFilter] = React.useState<"all" | ChannelKey>("all");
  const [selectedChannel, setSelectedChannel] = React.useState<ChannelKey | null>(null);

  const filtered = React.useMemo(() => {
    return students.filter((s) => {
      if (onlyNoAuth && s.estadoConsentimiento !== "no_autorizado") return false;
      if (onlyExpSoon && !isExpiringSoon(s.expiraEn, 30)) return false;
      if (channelFilter !== "all" && !s.canales[channelFilter]) return false;
      return true;
    });
  }, [students, onlyNoAuth, onlyExpSoon, channelFilter]);

  const web = channelCounts(filtered, "web");
  const rrss = channelCounts(filtered, "rrss");

  const side = React.useMemo(() => {
    if (!selectedChannel) return null;
    const label = CHANNEL_LABEL[selectedChannel];
    const noAuthCount = filtered.filter((s) => s.estadoConsentimiento === "no_autorizado").length;
    const expSoonCount = filtered.filter((s) => s.canales[selectedChannel] && isExpiringSoon(s.expiraEn, 30)).length;

    const headline =
      selectedChannel === "web"
        ? `${noAuthCount} estudiantes sin autorización (riesgo de publicación en Web)`
        : `${noAuthCount} estudiantes sin autorización (riesgo de publicación en RRSS)`;

    const rec =
      noAuthCount > 0
        ? "Recomendación: No publicar y solicitar autorización."
        : expSoonCount > 0
          ? "Recomendación: Renovar consentimientos antes de publicar."
          : "Recomendación: Todo ok. Mantener registro actualizado.";

    return { label, headline, rec };
  }, [selectedChannel, filtered])

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
            <div className="cardTitle">Filtros rápidos</div>
          </div>
          <div className="cardBody">
            <div className="filters">
              <label className="check">
                <input type="checkbox" checked={onlyNoAuth} onChange={(e) => setOnlyNoAuth(e.target.checked)} />
                Solo no autorizados
              </label>
              <label className="check">
                <input type="checkbox" checked={onlyExpSoon} onChange={(e) => setOnlyExpSoon(e.target.checked)} />
                Expiran pronto (30 días)
              </label>
              <div className="seg">
                <span className="segLabel">Canal</span>
                <div className="segBtns">
                  <button
                    type="button"
                    className={"segBtn" + (channelFilter === "all" ? " segActive" : "")}
                    onClick={() => setChannelFilter("all")}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    className={"segBtn" + (channelFilter === "web" ? " segActive" : "")}
                    onClick={() => setChannelFilter("web")}
                  >
                    Web
                  </button>
                  <button
                    type="button"
                    className={"segBtn" + (channelFilter === "rrss" ? " segActive" : "")}
                    onClick={() => setChannelFilter("rrss")}
                  >
                    RRSS
                  </button>
                </div>
              </div>
            </div>
            <div className="hint">
              Dataset filtrado: <b>{filtered.length}</b> estudiantes.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">Mapa (demo)</div>
            <div className="muted">Clic en un canal para ver el panel lateral</div>
          </div>
          <div className="cardBody">
            <div className="map">
              <div className="node process">
                <div className="nodeTitle">Proceso</div>
                <div className="nodeMain">Uso de imágenes</div>
              </div>

              <div className="connector c1" />

              <div className="node data">
                <div className="nodeTitle">Datos</div>
                <div className="nodeMain">Imagen del estudiante</div>
              </div>

              <div className="connector c2" />
              <div className="connector c3" />

              <button
                type="button"
                className={"node channel clickable" + (selectedChannel === "web" ? " selected" : "")}
                onClick={() => setSelectedChannel("web")}
              >
                <div className="nodeTitle">Canal</div>
                <div className="nodeMain">Sitio web</div>
                <div className="badges">
                  {badge("Autorizados", web.autorizados)}
                  {badge("Pendientes", web.pendientes)}
                  {badge("No autorizados", web.noAut)}
                  {badge("Expiran pronto", web.expSoon)}
                </div>
              </button>

              <button
                type="button"
                className={"node channel clickable" + (selectedChannel === "rrss" ? " selected" : "")}
                onClick={() => setSelectedChannel("rrss")}
              >
                <div className="nodeTitle">Canal</div>
                <div className="nodeMain">Redes sociales</div>
                <div className="badges">
                  {badge("Autorizados", rrss.autorizados)}
                  {badge("Pendientes", rrss.pendientes)}
                  {badge("No autorizados", rrss.noAut)}
                  {badge("Expiran pronto", rrss.expSoon)}
                </div>
              </button>

              <div className="connector c4" />
              <div className="connector c5" />

              <div className="node owner">
                <div className="nodeTitle">Responsables</div>
                <div className="nodeMain">Administración</div>
                <div className="nodeSub">Comunicaciones</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card span2">
          <div className="cardHeader">
            <div className="cardTitle">Panel lateral (canal seleccionado)</div>
          </div>
          <div className="cardBody">
            {!side ? (
              <div className="empty">Selecciona “Sitio web” o “Redes sociales” en el mapa.</div>
            ) : (
              <div className="side">
                <div className="sideTitle">{side.label}</div>
                <div className="sideHeadline">{side.headline}</div>
                <div className="sideRec">{side.rec}</div>
                <div className="sideFoot muted">
                  Tip: cambia un consentimiento en el <b>Portal</b> y mira cómo cambian estos conteos.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}