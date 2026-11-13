/* Portada del proyecto. CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);

  P.cargar().then(D => {
    const s = D.sitio;
    if (s.presentacion) $("heroLead").textContent = s.presentacion;
    const vig = P.edicionVigente(D);
    if (vig) {
      const co = P.coordinacionDe(D, vig.curso);
      $("byline").innerHTML = `Edición <strong>${E(vig.curso)}</strong>${vig.codigo ? ` (proyecto ${E(vig.codigo)})` : ""}${co.length ? ` · Coordinación: <strong>${E(P.lista(co))}</strong>` : ""} · ${E(s.facultad || s.institucion || "")}`;
    }

    // Cifras acumuladas (solo ediciones con datos reales de estudiantes)
    const conDatos = D.ediciones.filter(e => !P.estudiantesDe(e).previsto);
    const est = conDatos.reduce((t, e) => t + P.estudiantesDe(e).n, 0);
    const equipos = D.ediciones.reduce((t, e) => t + (P.num(e.equipos) || 0), 0);
    const profes = new Set(D.pildoras.map(p => p.profesional).filter(Boolean)).size;
    const asig = new Set(D.ediciones.flatMap(e => (e.asignaturas || []).map(a => a.asignatura + "|" + a.titulacion))).size;
    const personas = new Set(D.personas.filter(p => (p.participaciones || []).length).map(p => p.id)).size;
    const cifras = [
      [D.ediciones.length, D.ediciones.length === 1 ? "edición" : "ediciones"],
      [P.fmt(est), "estudiantes participantes"],
      [P.fmt(equipos), "equipos de trabajo"],
      [D.pildoras.length, "píldoras audiovisuales"],
      [profes, "profesionales en activo"],
      [asig, "asignaturas"],
      [personas, "docentes"]
    ];
    $("stats").innerHTML = cifras.map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join("");

    $("objetivos").innerHTML = (s.objetivos || []).map((o, i) => `<div class="panel obj"><span class="n">${i + 1}</span><p>${E(o)}</p></div>`).join("");
    const colores = ["var(--c-yellow)", "var(--c-teal)", "var(--c-orange)", "var(--c-red)"];
    $("ejes").innerHTML = (s.ejes || []).map((e, i) => `<li style="--c:${colores[i % 4]}"><b>Eje ${i + 1}</b>${E(e)}</li>`).join("");
    $("metod").innerHTML = (s.metodologias || []).map(m => `<span>${E(m)}</span>`).join("");

    // Secuencia con sus materiales
    let fase = "";
    $("seq").innerHTML = P.ACTIVIDADES.map((a, i) => {
      const mats = D.recursos.filter(r => r.actividad === a.nombre).map(r => `<a href="recursos.html#${encodeURIComponent(r.id)}">${E(r.tipo === "Taller" ? r.titulo.split(".")[0] : r.titulo)}</a>`);
      if (a.pildoras) mats.unshift(`<a href="pildoras.html">Píldoras</a>`);
      const cab = a.fase !== fase ? (fase = a.fase, `<span class="fase">${E(a.fase)}</span>`) : "";
      return `<li><span class="cod">${String(i + 1).padStart(2, "0")}</span>
        <div>${cab}<b>${E(a.nombre)}${a.desde ? ` <span class="ins wip">desde ${E(a.desde)}</span>` : ""}</b><span>${E(a.texto)}</span></div>
        <div class="mat">${mats.join("")}</div></li>`;
    }).join("");

    // Ediciones
    $("edGrid").innerHTML = D.ediciones.slice().reverse().map(e => {
      const st = P.estudiantesDe(e);
      const co = P.coordinacionDe(D, e.curso);
      const cls = e.estado === "Finalizada" ? "fin" : e.estado === "Prevista" ? "prev" : "curso";
      const pild = D.pildoras.filter(p => p.edicion === e.curso).length;
      const filas = [
        co.length ? ["Coordinación", E(P.lista(co))] : null,
        ["Asignaturas", (e.asignaturas || []).length],
        st.n ? ["Estudiantes", `${P.fmt(st.n)}${st.previsto ? " <span class=\"prev-mark\">(previstos)</span>" : ""}`] : null,
        P.num(e.equipos) ? ["Equipos", P.fmt(e.equipos)] : null,
        pild ? ["Píldoras nuevas", pild] : null,
        ["Equipo docente", P.equipoDe(D, e.curso).length],
        e.version_zenodo ? ["Depósito", `versión ${E(e.version_zenodo)}${e.doi_version ? ` · <a href="${P.doiUrl(e.doi_version)}" target="_blank" rel="noopener">DOI</a>` : ""}`] : null
      ].filter(Boolean);
      return `<article class="ed">
        <div class="ed-top"><h3>${E(e.curso)}</h3><span class="estado ${cls}">${E(e.estado || "")}</span></div>
        <p class="cod">${e.codigo ? `Proyecto ${E(e.codigo)} · ` : ""}${E(e.convocatoria || "")}</p>
        ${e.resumen ? `<p class="res">${E(e.resumen)}</p>` : ""}
        <dl>${filas.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
        <a class="btn ghost sm" href="resultados.html#ed-${encodeURIComponent(e.curso)}">Ver datos de la edición</a>
      </article>`;
    }).join("");

    // Cita
    $("cita").innerHTML = P.citaDeposito(s);
    $("copiar").onclick = () => P.copiar($("cita"));
    $("doiBadge").innerHTML = P.insigniaDoi(s) + (s.comunidad_zenodo ? ` <a class="btn ghost sm" style="margin-top:10px" href="${E(s.comunidad_zenodo)}" target="_blank" rel="noopener">Comunidad en Zenodo</a>` : "") + (s.repositorio ? ` <a class="btn ghost sm" style="margin-top:10px" href="${E(s.repositorio)}" target="_blank" rel="noopener">Repositorio en GitHub</a>` : "");
    $("citaNota").textContent = "El DOI general lleva siempre a la versión más reciente del depósito. Para acreditar tu participación, cita este DOI e indica tu papel y las ediciones en que participaste.";
  }).catch(() => P.error(document.querySelector("main")));
})();
