/* Propuestas del alumnado (solo con autorización expresa del equipo). CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);
  let D, grado = "";

  function tarjeta(x) {
    const pil = D.pildoras.find(p => p.codigo === x.pildora);
    const u = x.url || (x.archivo ? P.rutaArchivo(x.archivo) : "");
    return `<article class="card" style="${P.varsGrado(x.grado)}"><div class="body">
      <div class="card-top"><span class="tag">${E(x.tipo || "Propuesta")}</span><span class="code">${E(x.edicion)}</span></div>
      <h3>${u ? `<a href="${E(u)}" target="_blank" rel="noopener">${E(x.titulo)}</a>` : E(x.titulo)}</h3>
      <p class="quien">${E(x.autoria || "")}${x.grado ? ` · ${E(x.grado)}` : ""}</p>
      ${x.resumen ? `<p class="cont">${E(x.resumen)}</p>` : ""}
      <div class="card-foot">${pil ? `<span class="ins">Responde a ${E(pil.codigo)} · ${E(pil.titulo)}</span>` : "<span></span>"}${u ? "<span>Abrir ↗</span>" : ""}</div>
    </div></article>`;
  }
  function pintar() {
    document.querySelectorAll("#chips .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.g === grado)));
    const l = D.productos.filter(x => !grado || x.grado === grado).sort((a, b) => b.edicion.localeCompare(a.edicion) || a.titulo.localeCompare(b.titulo, "es"));
    $("lista").innerHTML = l.length ? `<div class="grid">${l.map(tarjeta).join("")}</div>`
      : `<p class="empty"><b>Todavía no hay propuestas publicadas.</b>Se irán añadiendo a medida que los equipos autoricen su difusión.</p>`;
  }
  P.cargar().then(d => {
    D = d;
    const gs = P.ordenGrados(D).filter(g => D.productos.some(x => x.grado === g));
    $("chips").innerHTML = gs.length ? `<button class="chip" data-g="">Todos</button>` + gs.map(g => `<button class="chip" data-g="${E(g)}" style="--c:${P.colorGrado(g)[2]}"><i></i>${E(g)}</button>`).join("") : "";
    $("chips").onclick = e => { const b = e.target.closest(".chip"); if (b) { grado = b.dataset.g; pintar(); } };
    pintar();
  }).catch(() => P.error($("lista")));
})();
