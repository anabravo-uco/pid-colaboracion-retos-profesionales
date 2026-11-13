/* Equipo por edición, profesionales y trayectoria. CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);
  let D, curso = "";

  function persona(x) {
    const p = x.persona, coord = /coordinaci/i.test(x.papel || "");
    const roles = (x.roles || []).filter(Boolean);
    return `<div class="person">
      <div class="who"><b>${E(P.nombre(p))}</b><span class="papel${coord ? " coord" : ""}">${E(x.papel || "Miembro del equipo")}</span></div>
      <p class="aff">${E([p.departamento, p.institucion].filter(Boolean).join(" · "))}${p.orcid ? ` · <a class="orcid" href="${P.orcidUrl(p.orcid)}" target="_blank" rel="noopener">${P.ICO.orcid}${E(p.orcid)}</a>` : ""}</p>
      <div class="roles">${roles.length ? roles.map(r => `<span>${E(r)}</span>`).join("") : `<span class="pend">Roles CRediT pendientes de registrar</span>`}</div>
      ${x.grado ? `<p class="note" style="margin-top:8px">Grado de participación: <span class="grado">${E(x.grado)}</span></p>` : ""}
      ${x.asignaturas ? `<p class="note" style="margin-top:4px">${E(x.asignaturas)}</p>` : ""}
    </div>`;
  }

  function pintar() {
    document.querySelectorAll("#tabs .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.c === curso)));
    const eq = P.equipoDe(D, curso), ed = D.ediciones.find(e => e.curso === curso) || {};
    $("equipo").innerHTML = eq.length
      ? `<p class="note" style="margin:0 0 12px">${E(ed.codigo ? `Proyecto ${ed.codigo}` : "")}${ed.estado ? ` · ${E(ed.estado)}` : ""} · ${eq.length} docentes</p><div class="people">${eq.map(persona).join("")}</div>`
      : `<p class="empty">Aún no hay equipo registrado para ${E(curso)}.</p>`;
  }

  function profesionales() {
    const prof = {};
    D.pildoras.filter(p => p.profesional).forEach(p => { (prof[p.profesional] = prof[p.profesional] || []).push(p); });
    const nombres = Object.keys(prof);
    $("profesionales").innerHTML = nombres.length
      ? `<ul class="prof-list">${nombres.map(n => `<li>${E(n)}<span>${E(prof[n][0].grado)} · ${E([...new Set(prof[n].map(p => p.edicion))].join(", "))} · ${prof[n].map(p => E(p.codigo)).join(", ")}</span></li>`).join("")}</ul>`
      : `<p class="empty">Aún no hay píldoras registradas.</p>`;
  }

  function trayectoria() {
    const cursos = D.ediciones.map(e => e.curso);
    const filas = D.personas.filter(p => (p.participaciones || []).length).map(p => {
      const celdas = cursos.map(c => {
        const x = (p.participaciones || []).find(y => y && y.edicion === c);
        return `<td>${x ? E(/coordinaci/i.test(x.papel || "") ? x.papel : "✓") : `<span class="no">—</span>`}</td>`;
      }).join("");
      return `<tr><td class="n">${E(p.orden_autoria ?? "")}</td><td>${E(P.nombre(p))}</td><td>${p.orcid ? `<a class="orcid" href="${P.orcidUrl(p.orcid)}" target="_blank" rel="noopener">${P.ICO.orcid}${E(p.orcid)}</a>` : `<span class="no">pendiente</span>`}</td>${celdas}</tr>`;
    }).join("");
    $("trayectoria").innerHTML = `<div class="tbl-wrap"><table class="ind"><thead><tr><th class="n">Orden</th><th>Persona</th><th>ORCID</th>${cursos.map(c => `<th>${E(c)}</th>`).join("")}</tr></thead><tbody>${filas}</tbody></table></div>`;
    $("reglaAutoria").textContent = "Orden de autoría del depósito: coordinación de la edición inicial y, después, orden alfabético; quienes se incorporan en una edición posterior se añaden al final. Nadie se retira de la autoría: quien participó en una edición sigue siendo coautor de los materiales de esa edición.";
  }

  P.cargar().then(d => {
    D = d;
    const vig = P.edicionVigente(D);
    curso = new URLSearchParams(location.search).get("ed") || (vig && vig.curso) || "";
    $("tabs").innerHTML = D.ediciones.map(e => `<button class="chip" data-c="${E(e.curso)}">Edición ${E(e.curso)} <small>${P.equipoDe(D, e.curso).length}</small></button>`).join("");
    $("tabs").onclick = e => { const b = e.target.closest(".chip"); if (b) { curso = b.dataset.c; history.replaceState(null, "", "?ed=" + encodeURIComponent(curso)); pintar(); } };
    pintar(); profesionales(); trayectoria();
  }).catch(() => P.error($("equipo")));
})();
