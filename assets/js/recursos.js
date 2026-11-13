/* Recursos del proyecto. CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);
  let D, tipo = "";

  function autoria(r) {
    const a = (r.autoria || []).filter(x => x && (x.apellidos || x.nombre));
    if (a.length) return a;
    // Si el recurso no tiene autoría propia, se atribuye al equipo de su primera edición
    const ed = (r.ediciones || [])[0];
    return ed ? P.equipoDe(D, ed).map(x => Object.assign({}, x.persona, { roles: [], grado: "" })) : [];
  }
  function cita(r) {
    const s = D.sitio, a = autoria(r).map(P.apa);
    const autores = a.length ? (a.length === 1 ? a[0] : a.slice(0, -1).join(", ") + " y " + a[a.length - 1]) : s.autoria_cita;
    const ref = P.doiUrl(s.doi) || location.href.split(/[?#]/)[0] + "#" + encodeURIComponent(r.id);
    return `${E(autores)} (${E(s.anio || "")}). <em>${E(r.titulo)}</em> [${E(r.tipo || "Recurso educativo")}]. En <em>${E(s.titulo_deposito || s.titulo)}</em> (Versión ${E(s.version)}). Zenodo. ${E(ref)}`;
  }
  function iaTexto(r) {
    const ia = r.ia || {};
    if (ia.usada === "No") return "En la elaboración de este recurso no se ha utilizado inteligencia artificial generativa.";
    if (ia.usada !== "Sí") return "";
    const h = (ia.herramientas || []).filter(Boolean), f = (ia.fines || []).filter(Boolean);
    return `En su elaboración se ha utilizado IA generativa${h.length ? ` (${P.lista(h)})` : ""}${f.length ? ` para ${P.lista(f)}` : ""}${ia.grado ? ` (uso ${ia.grado.toLowerCase()})` : ""}. El equipo ha revisado y validado todo el contenido.`;
  }

  function bloque(r) {
    const g = (r.grados || []).length === 1 ? r.grados[0] : "";
    const mats = (r.materiales || []).filter(m => P.enlaceMaterial(m)).map(m => {
      const u = P.enlaceMaterial(m), ext = /^https?:/i.test(u);
      return `<li><a href="${E(u)}"${ext ? ' target="_blank" rel="noopener"' : " download"}>${P.iconoMaterial(m.formato)}<span><b>${E(m.nombre || "Abrir")}</b><small>${E(m.formato || "")}</small></span></a></li>`;
    });
    const aut = autoria(r);
    const conRoles = aut.some(a => (a.roles || []).length);
    const ia = iaTexto(r);
    return `<article class="rec" id="${E(r.id)}" style="${P.varsGrado(g)}">
      <div class="main">
        <span class="tag" style="--c:var(--accent);--cs:var(--accent-soft)">${E(r.tipo || "Recurso")}</span>
        <h3>${E(r.titulo)}</h3>
        <p class="desc">${E(r.descripcion || "")}</p>
        <div class="meta">
          ${r.actividad ? `<span>Actividad: <b>${E(r.actividad)}</b></span>` : ""}
          ${(r.ediciones || []).length ? `<span>Edición: <b>${E(r.ediciones.join(", "))}</b></span>` : ""}
          ${(r.grados || []).length ? `<span>${E(r.grados.join(" · "))}</span>` : ""}
        </div>
        <p class="cite-sm">${cita(r)}</p>
      </div>
      <div class="side">
        <h4>Materiales</h4>
        ${mats.length ? `<ul class="mats">${mats.join("")}</ul>` : `<p class="lic">Próximamente.</p>`}
        <p class="lic">Licencia: ${/^CC BY-NC-SA/.test(r.licencia || "CC BY-NC-SA") ? `<a href="${E(D.sitio.licencia_url)}" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>` : E(r.licencia)}</p>
        ${r.nota_licencia ? `<p class="lic terceros">${E(r.nota_licencia)}</p>` : ""}
        ${ia ? `<p class="lic">${E(ia)}</p>` : ""}
        ${aut.length ? `<details class="aut"><summary>Autoría${conRoles ? " (CRediT)" : ""}</summary><ul class="lista" style="margin:8px 0 0;padding-left:18px">
          ${aut.map(a => `<li>${E(P.nombre(a))}${a.orcid ? ` <a class="orcid" href="${P.orcidUrl(a.orcid)}" target="_blank" rel="noopener" aria-label="ORCID de ${E(P.nombre(a))}">${P.ICO.orcid}</a>` : ""}${(a.roles || []).length ? `<br><small>${E(a.roles.join(", "))}${a.grado ? ` · ${E(a.grado)}` : ""}</small>` : ""}</li>`).join("")}
        </ul>${conRoles ? "" : `<p class="note">Recurso del equipo de la edición ${E((r.ediciones || [])[0] || "")}.</p>`}</details>` : ""}
      </div></article>`;
  }

  function pintar() {
    const lista = D.recursos.filter(r => !tipo || r.tipo === tipo);
    document.querySelectorAll("#chips .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.t === tipo)));
    $("lista").innerHTML = lista.length ? lista.map(bloque).join("") : `<p class="empty">No hay recursos de este tipo.</p>`;
  }

  P.cargar().then(d => {
    D = d;
    const tipos = [...new Set(D.recursos.map(r => r.tipo).filter(Boolean))];
    $("chips").innerHTML = `<button class="chip" data-t="">Todos <small>${D.recursos.length}</small></button>` +
      tipos.map(t => `<button class="chip" data-t="${E(t)}">${E(t)} <small>${D.recursos.filter(r => r.tipo === t).length}</small></button>`).join("");
    $("chips").onclick = e => { const b = e.target.closest(".chip"); if (b) { tipo = b.dataset.t; pintar(); } };
    pintar();
    if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) el.scrollIntoView(); }
  }).catch(() => P.error($("lista")));
})();
