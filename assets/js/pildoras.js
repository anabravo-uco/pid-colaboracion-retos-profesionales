/* Catálogo de píldoras audiovisuales. CC BY-NC-SA 4.0 */
(function () {
  const P = window.PID, E = P.esc, $ = id => document.getElementById(id);
  let D, estado = { q: "", grado: "", ed: "", bil: "", disp: "" };
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  function leerURL() {
    const u = new URLSearchParams(location.search);
    Object.keys(estado).forEach(k => { if (u.get(k)) estado[k] = u.get(k); });
  }
  function escribirURL() {
    const u = new URLSearchParams();
    Object.entries(estado).forEach(([k, v]) => { if (v) u.set(k, v); });
    history.replaceState(null, "", u.toString() ? "?" + u : location.pathname);
  }
  function pasa(p, ignorarGrado) {
    if (!ignorarGrado && estado.grado && p.grado !== estado.grado) return false;
    if (estado.ed && p.edicion !== estado.ed) return false;
    if (estado.bil === "si" && !p.bilingue) return false;
    if (estado.disp === "si" && !p.youtube) return false;
    if (estado.q) {
      const t = norm([p.codigo, p.titulo, p.contenidos, p.profesional, p.destinatarios].join(" "));
      if (!norm(estado.q).split(/\s+/).every(w => t.includes(w))) return false;
    }
    return true;
  }
  const idVideo = p => p.video_id || ((String(p.youtube || "").match(/(?:v=|youtu\.be\/)([\w-]{11})/) || [])[1] || "");

  function tarjeta(p) {
    const vid = idVideo(p);
    const thumb = p.youtube && vid
      ? `<a class="thumb" href="${E(p.youtube)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img loading="lazy" src="https://i.ytimg.com/vi/${E(vid)}/hqdefault.jpg" alt="" onerror="this.remove()"><span class="play"><span>${P.ICO.play}</span></span>${p.duracion ? `<span class="dur">${E(p.duracion)}</span>` : ""}</a>`
      : `<div class="thumb vacia">${p.estado === "En preparación" ? "En preparación" : "Enlace pendiente"}</div>`;
    const titulo = p.youtube ? `<a href="${E(p.youtube)}" target="_blank" rel="noopener">${E(p.titulo)}</a>` : E(p.titulo);
    return `<article class="card" style="${P.varsGrado(p.grado)}">${thumb}
      <div class="body">
        <div class="card-top"><span class="tag">${E(p.grado)}${p.bilingue ? " · bilingüe" : ""}</span><span class="code">${E(p.codigo)}</span></div>
        <h3>${titulo}</h3>
        <p class="quien">${E(p.profesional || "")}${p.destinatarios ? ` · ${E(p.destinatarios)}` : ""}</p>
        ${p.contenidos ? `<p class="cont"><b>Contenidos:</b> ${E(p.contenidos)}</p>` : ""}
        <div class="card-foot"><span class="ins">Edición ${E(p.edicion)}</span>${p.youtube ? `<span>Ver en YouTube ↗</span>` : `<span class="ins wip">${E(p.estado || "Enlace pendiente")}</span>`}</div>
      </div></article>`;
  }

  function pintar() {
    const lista = D.pildoras.filter(p => pasa(p));
    $("count").textContent = `${lista.length} ${lista.length === 1 ? "píldora" : "píldoras"}`;
    $("reset").hidden = !Object.values(estado).some(Boolean);
    document.querySelectorAll("#chips .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.g === estado.grado)));
    if (!lista.length) { $("lista").innerHTML = `<p class="empty"><b>No hay píldoras con estos filtros.</b>Prueba a quitar alguno.</p>`; return; }
    const grados = P.ordenGrados(D).filter(g => lista.some(p => p.grado === g));
    lista.forEach(p => { if (!grados.includes(p.grado)) grados.push(p.grado); });
    $("lista").innerHTML = grados.map(g => {
      const items = lista.filter(p => p.grado === g);
      return `<section class="group" style="${P.varsGrado(g)}"><div class="group-h"><h2><i></i>${E(g)}</h2><span>${items.length} ${items.length === 1 ? "píldora" : "píldoras"}</span></div>
        <div class="grid">${items.map(tarjeta).join("")}</div></section>`;
    }).join("");
    escribirURL();
  }

  P.cargar().then(d => {
    D = d; leerURL();
    const eds = [...new Set(D.pildoras.map(p => p.edicion))].sort();
    $("fEd").insertAdjacentHTML("beforeend", eds.map(e => `<option>${E(e)}</option>`).join(""));
    const grados = P.ordenGrados(D).filter(g => D.pildoras.some(p => p.grado === g));
    $("chips").innerHTML = `<button class="chip" data-g="">Todos los grados</button>` + grados.map(g =>
      `<button class="chip" data-g="${E(g)}" style="--c:${P.colorGrado(g)[2]}"><i></i>${E(g)} <small>${D.pildoras.filter(p => p.grado === g).length}</small></button>`).join("");
    $("q").value = estado.q; $("fEd").value = estado.ed; $("fBil").value = estado.bil; $("fDisp").value = estado.disp;
    $("chips").onclick = e => { const b = e.target.closest(".chip"); if (b) { estado.grado = b.dataset.g; pintar(); } };
    $("q").oninput = e => { estado.q = e.target.value.trim(); pintar(); };
    $("fEd").onchange = e => { estado.ed = e.target.value; pintar(); };
    $("fBil").onchange = e => { estado.bil = e.target.value; pintar(); };
    $("fDisp").onchange = e => { estado.disp = e.target.value; pintar(); };
    $("reset").onclick = () => { estado = { q: "", grado: "", ed: "", bil: "", disp: "" }; ["q", "fEd", "fBil", "fDisp"].forEach(i => $(i).value = ""); pintar(); };
    const listas = (D.sitio.listas_youtube || []).filter(l => l.url);
    $("notaVideos").innerHTML = `Los vídeos están alojados en YouTube${listas.length ? ` (listas: ${listas.map(l => `<a href="${E(l.url)}" target="_blank" rel="noopener">${E(l.grado)}</a>`).join(", ")})` : ""}. Se pueden ver y enlazar libremente, pero no están incluidos en la licencia CC BY-NC-SA del proyecto ni en el depósito de Zenodo.`;
    pintar();
  }).catch(() => P.error($("lista")));
})();
