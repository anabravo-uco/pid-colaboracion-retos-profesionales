/* Resultados, indicadores y transferencia (imprimible para memorias y CV). CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);
  const COLOR_TIPO = ["var(--c-navy)", "var(--c-teal)", "var(--c-orange)", "var(--c-red)", "#8a5a00", "#5f5670"];

  function tabla(cab, filas, pie, numCols, clase) {
    const n = i => (numCols || []).includes(i) ? ' class="n"' : "";
    return `<div class="tbl-wrap"><table class="ind ${clase || ""}"><thead><tr>${cab.map((c, i) => `<th${n(i)}>${c}</th>`).join("")}</tr></thead>
      <tbody>${filas.map(f => `<tr>${f.map((c, i) => `<td${n(i)}>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      ${pie ? `<tfoot><tr>${pie.map((c, i) => `<td${n(i)}>${c}</td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
  }
  const no = `<span class="no">—</span>`;

  function citaTransf(t) {
    if (t.cita) return E(t.cita);
    const doi = t.doi ? ` ${E(P.doiUrl(t.doi))}` : (t.url ? ` ${E(t.url)}` : "");
    const lugar = [t.medio, t.lugar].filter(Boolean).map(E).join(", ");
    const est = t.estado && t.estado !== "Publicado o presentado" ? ` [${E(t.estado.toLowerCase())}]` : "";
    return `${E(t.autores || "")} (${E(t.anio)}). <em>${E(t.titulo)}</em>${lugar ? `. ${lugar}` : ""}.${doi}${est}`;
  }

  P.cargar().then(D => {
    const s = D.sitio, eds = D.ediciones, grados = P.ordenGrados(D);
    const hoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const conDatos = eds.filter(e => !P.estudiantesDe(e).previsto);
    const totEst = conDatos.reduce((t, e) => t + P.estudiantesDe(e).n, 0);
    const totEq = eds.reduce((t, e) => t + (P.num(e.equipos) || 0), 0);
    const totFin = eds.reduce((t, e) => t + (P.num(e.financiacion) || 0), 0);
    const profes = new Set(D.pildoras.map(p => p.profesional).filter(Boolean)).size;

    // Estudiantes por edición y grado
    const porGrado = e => {
      const m = {}; (e.asignaturas || []).forEach(a => { const g = P.gradoDeTitulacion(a.titulacion); m[g] = (m[g] || 0) + (P.num(a.estudiantes) || 0); });
      return m;
    };
    const maxEst = Math.max(1, ...eds.map(e => P.estudiantesDe(e).n));
    const barras = eds.map(e => {
      const st = P.estudiantesDe(e), m = porGrado(e);
      const seg = st.previsto
        ? `<span style="width:${st.n / maxEst * 100}%;background:repeating-linear-gradient(45deg,var(--line) 0 6px,var(--surface-2) 6px 12px)" title="Previstos"></span>`
        : grados.filter(g => m[g]).map(g => `<span style="width:${m[g] / maxEst * 100}%;background:${P.colorGrado(g)[2]}" title="${E(g)}: ${m[g]}"></span>`).join("");
      return `<div class="bar-row"><b>${E(e.curso)}</b><div class="bar-track" role="img" aria-label="${E(e.curso)}: ${st.n} estudiantes${st.previsto ? " previstos" : ""}">${seg}</div><span class="tot">${st.n ? P.fmt(st.n) : "—"}${st.previsto && st.n ? "*" : ""}</span></div>`;
    }).join("");

    // Tabla resumen por edición
    const t1 = eds.map(e => {
      const st = P.estudiantesDe(e), comp = P.num(e.equipos_comparten), eq = P.num(e.equipos);
      return [`<a href="#ed-${E(e.curso)}"><b>${E(e.curso)}</b></a>`, E(e.codigo || ""), E(e.estado || ""), P.eur(e.financiacion), (e.asignaturas || []).length,
        st.n ? `${P.fmt(st.n)}${st.previsto ? "*" : ""}` : no, eq ? P.fmt(eq) : no,
        comp !== null && eq ? `${comp} (${Math.round(comp / eq * 100)} %)` : no, P.num(e.nota_media) !== null ? P.dec(e.nota_media) : no,
        D.pildoras.filter(p => p.edicion === e.curso).length || no, P.equipoDe(D, e.curso).length];
    });
    const pie1 = ["<b>Total</b>", "", "", totFin ? P.eur(totFin) : no, "", P.fmt(totEst), P.fmt(totEq), "", "", D.pildoras.length, new Set(D.personas.filter(p => (p.participaciones || []).length).map(p => p.id)).size];

    // Detalle por edición
    const detalle = eds.slice().reverse().map(e => {
      const filas = (e.asignaturas || []).map(a => [E(a.asignatura), E(P.gradoDeTitulacion(a.titulacion)), E(a.curso || ""), P.num(a.sesiones) ?? no,
        P.num(a.estudiantes) !== null ? P.fmt(a.estudiantes) : no, P.num(a.nota_media) !== null ? P.dec(a.nota_media) : no, E(a.producto || "") || no]);
      const per = [e.inicio, e.fin].filter(Boolean).map(d => new Date(d + "T12:00").toLocaleDateString("es-ES")).join(" – ");
      return `<section id="ed-${E(e.curso)}" style="scroll-margin-top:90px">
        <h3 class="ind-t">Edición ${E(e.curso)}</h3>
        <p class="note" style="margin:-6px 0 12px">${[e.codigo && `Proyecto ${E(e.codigo)}`, E(e.convocatoria || ""), per, P.coordinacionDe(D, e.curso).length && `Coordinación: ${E(P.lista(P.coordinacionDe(D, e.curso)))}`].filter(Boolean).join(" · ")}</p>
        ${filas.length ? tabla(["Asignatura", "Grado", "Curso", "Sesiones", "Estudiantes", "Nota media", "Producto final"], filas, null, [3, 4, 5]) : ""}
        ${(e.novedades || []).length ? `<div class="cols two" style="margin-top:14px"><div class="panel"><h3>Materiales y novedades</h3><ul class="lista" style="margin:0;padding-left:18px">${e.novedades.map(n => `<li>${E(n)}</li>`).join("")}</ul></div>
          ${(e.lecciones || []).length ? `<div class="panel"><h3>Lecciones aprendidas</h3><ul class="lista" style="margin:0;padding-left:18px">${e.lecciones.map(n => `<li>${E(n)}</li>`).join("")}</ul></div>` : ""}</div>` : ""}
      </section>`;
    }).join("");

    // Píldoras por grado y edición
    const t3 = grados.map(g => [E(g)].concat(eds.map(e => D.pildoras.filter(p => p.grado === g && p.edicion === e.curso).length || no), [D.pildoras.filter(p => p.grado === g).length]));

    // Transferencia
    const T = D.transferencia;
    const tipos = [...new Set(T.map(t => t.tipo))];
    const anios = [...new Set(T.map(t => t.anio))].sort().reverse();
    const transf = T.length
      ? tabla(["Tipo"].concat(anios, ["Total"]), tipos.map(tp => [E(tp)].concat(anios.map(a => T.filter(t => t.tipo === tp && t.anio === a).length || no), [`<b>${T.filter(t => t.tipo === tp).length}</b>`])), null, anios.map((_, i) => i + 1).concat([anios.length + 1]))
        + anios.map(a => `<h4 class="ind-t" style="font-size:18px">${E(a)}</h4><ul class="ref-list">${T.filter(t => t.anio === a).map(t =>
          `<li style="--c:${COLOR_TIPO[tipos.indexOf(t.tipo) % COLOR_TIPO.length]}"><span class="tipo">${E(t.tipo)}${t.alcance ? ` · ${E(t.alcance)}` : ""}</span>${citaTransf(t)}</li>`).join("")}</ul>`).join("")
      : `<p class="empty"><b>Todavía no hay contribuciones registradas.</b>Comunicaciones en congresos, publicaciones, jornadas y premios relacionados con el proyecto aparecerán aquí.</p>`;

    $("res").innerHTML = `
      <div class="page-h" style="display:flex;justify-content:space-between;gap:20px;align-items:flex-end;flex-wrap:wrap">
        <div><p class="eyebrow">Participación, resultados y transferencia</p><h1>Resultados del proyecto</h1>
        <p class="note" style="margin:0">${E(s.titulo)} · ${E(s.institucion || "")}${s.doi ? ` · DOI ${E(String(s.doi).replace(/^https?:\/\/doi\.org\//, ""))}` : ""} · Datos a ${E(hoy)}.</p></div>
        <button class="btn no-print" id="imprimir">Imprimir o guardar en PDF</button>
      </div>
      <div class="stats">
        <div class="stat"><b>${eds.length}</b><span>${eds.length === 1 ? "edición" : "ediciones"}</span></div>
        <div class="stat"><b>${P.fmt(totEst)}</b><span>estudiantes participantes</span></div>
        <div class="stat"><b>${P.fmt(totEq)}</b><span>equipos de trabajo</span></div>
        <div class="stat"><b>${D.pildoras.length}</b><span>píldoras de ${profes} profesionales</span></div>
        <div class="stat"><b>${T.length}</b><span>contribuciones de transferencia</span></div>
        <div class="stat"><b>${D.productos.length}</b><span>propuestas del alumnado publicadas</span></div>
      </div>
      <h2 class="ind-t">Estudiantes por edición y grado</h2>
      <div class="panel"><div class="bars">${barras}</div>
        <div class="legend">${grados.map(g => `<span><i style="background:${P.colorGrado(g)[2]}"></i>${E(g)}</span>`).join("")}<span><i style="background:repeating-linear-gradient(45deg,var(--line) 0 3px,var(--surface-2) 3px 6px)"></i>* Previstos en la solicitud (sin datos de matrícula)</span></div></div>
      <h2 class="ind-t">Resumen por edición</h2>
      ${tabla(["Edición", "Código", "Estado", "Financiación", "Asignaturas", "Estudiantes", "Equipos", "Comparten con prof.", "Nota media", "Píldoras nuevas", "Docentes"], t1, pie1, [3, 4, 5, 6, 7, 8, 9, 10], "compact")}
      <p class="note">«Comparten con prof.»: equipos que aceptaron enviar su propuesta al profesional que planteó la situación-problema.</p>
      <h2 class="ind-t">Píldoras por grado y edición</h2>
      ${tabla(["Grado"].concat(eds.map(e => E(e.curso)), ["Total"]), t3, null, eds.map((_, i) => i + 1).concat([eds.length + 1]))}
      <h2 class="ind-t">Transferencia y publicaciones</h2>
      ${transf}
      <h2 class="ind-t" style="margin-top:44px">Detalle de cada edición</h2>
      ${detalle}`;
    $("imprimir").onclick = () => print();
    if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) el.scrollIntoView(); }
  }).catch(() => P.error($("res")));
})();
