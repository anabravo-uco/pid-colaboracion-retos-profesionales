/* Funciones compartidas por todas las páginas de la web del proyecto. CC BY-NC-SA 4.0 */
(function () {
  const GRADOS = {
    "Educación Infantil": ["var(--inf)", "var(--inf-soft)", "#f2b705"],
    "Educación Primaria": ["var(--pri)", "var(--pri-soft)", "#00798c"],
    "Psicología": ["var(--psi)", "var(--psi-soft)", "#e8620f"]
  };
  const ACTIVIDADES = [
    { fase: "Analizar la realidad", nombre: "La competencia investigadora en educación", texto: "Formación de equipos estables, lluvia de ideas y mural colaborativo sobre cómo analizar una situación-problema." },
    { fase: "Analizar la realidad", nombre: "Ponte las gafas para observar", texto: "Visionado de la píldora asignada y análisis del contexto con una matriz DAFO para identificar la necesidad psicoeducativa.", pildoras: true },
    { fase: "Fundamentar y diseñar", nombre: "De la teoría a la práctica", texto: "Búsqueda en bases de datos científicas, definición de los conceptos clave y revisión de programas de intervención previos." },
    { fase: "Fundamentar y diseñar", nombre: "Construyendo un juicio propio", texto: "Contraste crítico entre las respuestas de la IA generativa y la evidencia científica sobre la situación-problema.", desde: "2026-27" },
    { fase: "Fundamentar y diseñar", nombre: "Dando respuestas", texto: "Formulación de objetivos y diseño de la propuesta psicoeducativa: agentes implicados, plan de trabajo y resultados esperados." },
    { fase: "Comunicar y evaluar", nombre: "Transferencia de resultados", texto: "Producto final (póster, píldora en vídeo o página web) dirigido al profesional que planteó la situación." },
    { fase: "Comunicar y evaluar", nombre: "Comunicamos ciencia", texto: "Congreso o exposición de las propuestas, coevaluación entre equipos y autoevaluación." },
    { fase: "Comunicar y evaluar", nombre: "Cada granito cuenta", texto: "Asamblea final de conclusiones y propuestas de mejora." }
  ];
  const ICO = {
    pdf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    tabla: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>',
    app: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/></svg>',
    edit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    link: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg>',
    orcid: '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#a6ce39"/><path fill="#fff" d="M8.3 7.4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zM7.6 8.9h1.4v8.6H7.6zM10.8 8.9h3.6c3.4 0 4.9 2.4 4.9 4.3 0 2.1-1.6 4.3-4.9 4.3h-3.6zm1.4 7.3h2.2c3.1 0 3.6-2.3 3.6-3 0-1.2-.7-3-3.6-3h-2.2z"/></svg>'
  };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = v => (v === null || v === undefined || v === "" || isNaN(Number(v))) ? null : Number(v);
  const fmt = n => Number(n || 0).toLocaleString("es-ES");
  const dec = n => num(n) === null ? "—" : Number(n).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const eur = n => num(n) === null ? "Pendiente" : Number(n).toLocaleString("es-ES") + " €";
  const lista = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " y " + a[a.length - 1];
  const gradoDeTitulacion = t => String(t || "").replace(/^Grado en /, "");
  const colorGrado = g => GRADOS[g] || ["var(--accent)", "var(--accent-soft)", "#123f7a"];
  const varsGrado = g => { const c = colorGrado(g); return `--c:${c[0]};--cs:${c[1]}`; };

  function rutaArchivo(p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return encodeURI(decodeURI(String(p).replace(/^\/+/, "")));
  }
  function enlaceMaterial(m) {
    if (!m) return "";
    if (m.url && /^https:\/\//i.test(m.url)) return m.url;
    return m.archivo ? rutaArchivo(m.archivo) : "";
  }
  function iconoMaterial(f) {
    f = String(f || "").toLowerCase();
    if (f.includes("pdf")) return ICO.pdf;
    if (f.includes("hoja") || f.includes("csv")) return ICO.tabla;
    if (f.includes("aplicación") || f.includes("apps script")) return ICO.app;
    if (f.includes("editable")) return ICO.edit;
    return ICO.link;
  }
  const doiUrl = d => d ? "https://doi.org/" + String(d).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") : "";
  const orcidUrl = o => o ? "https://orcid.org/" + String(o).replace(/^https?:\/\/orcid\.org\//i, "") : "";
  const nombre = p => [p.nombre, p.apellidos].filter(Boolean).join(" ");
  const iniciales = n => String(n || "").split(/[\s-]+/).filter(Boolean).map(x => x[0].toUpperCase() + ".").join(" ");
  const apa = p => `${p.apellidos}, ${iniciales(p.nombre)}`;

  /* Datos */
  async function json(nombre) {
    try {
      const r = await fetch(`datos/${nombre}.json`, { cache: "no-cache" });
      if (!r.ok) return {};
      return (await r.json()) || {};
    } catch (e) { return {}; }
  }
  const valores = o => Object.keys(o || {}).map(id => Object.assign({ id }, o[id]));

  async function cargar() {
    const [sitio, ed, pe, pi, re, tr, pr] = await Promise.all(["sitio", "ediciones", "personas", "pildoras", "recursos", "transferencia", "productos"].map(json));
    const D = {
      sitio,
      ediciones: valores(ed).filter(e => e.curso).sort((a, b) => a.curso.localeCompare(b.curso)),
      personas: valores(pe).filter(p => p.visible !== false && p.apellidos).sort((a, b) => (num(a.orden_autoria) ?? 999) - (num(b.orden_autoria) ?? 999) || a.apellidos.localeCompare(b.apellidos, "es")),
      pildoras: valores(pi).filter(p => p.visible !== false && p.titulo).sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true })),
      recursos: valores(re).filter(r => r.visible !== false && r.titulo).sort((a, b) => (num(a.orden) ?? 999) - (num(b.orden) ?? 999) || a.titulo.localeCompare(b.titulo, "es")),
      transferencia: valores(tr).filter(t => t.visible !== false && t.titulo).sort((a, b) => String(b.fecha || b.anio).localeCompare(String(a.fecha || a.anio))),
      productos: valores(pr).filter(p => p.visible !== false && p.consentimiento === true && p.titulo)
    };
    if (sitio.goatcounter) {
      const g = document.createElement("script");
      g.async = true; g.src = "https://gc.zgo.at/count.js";
      g.setAttribute("data-goatcounter", `https://${sitio.goatcounter}.goatcounter.com/count`);
      document.body.appendChild(g);
    }
    marco(D);
    return D;
  }

  /* Ediciones y equipo */
  function equipoDe(D, curso) {
    const out = [];
    D.personas.forEach(p => (p.participaciones || []).forEach(x => { if (x && x.edicion === curso) out.push(Object.assign({ persona: p }, x)); }));
    const peso = x => /coordinaci/i.test(x.papel || "") ? 0 : 1;
    return out.sort((a, b) => peso(a) - peso(b) || (num(a.persona.orden_autoria) ?? 999) - (num(b.persona.orden_autoria) ?? 999));
  }
  const coordinacionDe = (D, curso) => equipoDe(D, curso).filter(x => /coordinaci/i.test(x.papel || "")).map(x => nombre(x.persona));
  function estudiantesDe(e) {
    const s = (e.asignaturas || []).reduce((t, a) => t + (num(a.estudiantes) || 0), 0);
    return s ? { n: s, previsto: false } : (num(e.estudiantes_previstos) ? { n: num(e.estudiantes_previstos), previsto: true } : { n: 0, previsto: true });
  }
  function edicionVigente(D) {
    return D.ediciones.slice().reverse().find(e => e.estado === "En curso") || D.ediciones[D.ediciones.length - 1];
  }
  const ordenGrados = D => (D.sitio.orden_grados && D.sitio.orden_grados.length) ? D.sitio.orden_grados : Object.keys(GRADOS);

  /* Cita del depósito */
  function citaDeposito(s) {
    const ref = doiUrl(s.doi) || (location.href.split(/[?#]/)[0].replace(/[^/]*$/, ""));
    return `${esc(s.autoria_cita)} (${esc(s.anio)}). <em>${esc(s.titulo_deposito || s.titulo)}</em> (Versión ${esc(s.version)}) [Recurso educativo]. Zenodo. ${esc(ref)}`;
  }
  function insigniaDoi(s) {
    if (!s.doi) return `<p class="aviso">El DOI aparecerá aquí cuando se publique la versión ${esc(s.version)} en Zenodo.</p>`;
    const d = String(s.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    return `<a class="doi" href="${doiUrl(d)}" target="_blank" rel="noopener"><b>DOI</b><span>${esc(d)}</span></a>`;
  }

  /* Cabecera, pie y menú */
  function marco(D) {
    const s = D.sitio;
    const b = document.getElementById("brandName");
    if (b && s.titulo_corto) b.textContent = s.titulo_corto;
    const pag = document.body.dataset.page;
    document.querySelectorAll(".nav a").forEach(a => { if (a.dataset.page === pag) a.setAttribute("aria-current", "page"); });
    const f = document.getElementById("footTxt");
    if (f) f.innerHTML = `Proyecto de innovación docente · ${esc(s.departamento || "")} · ${esc(s.institucion || "")}${s.version ? ` · Versión ${esc(s.version)}` : ""}${s.correo_contacto ? ` · <a href="mailto:${esc(s.correo_contacto)}">${esc(s.correo_contacto)}</a>` : ""}${s.nota_logo ? `<br><small>${esc(s.nota_logo)}</small>` : ""}`;
    const l = document.getElementById("footLic");
    if (l && s.licencia_url) { l.href = s.licencia_url; l.textContent = s.licencia || "CC BY-NC-SA 4.0"; }
  }

  let toastT;
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }
  async function copiar(el) {
    try { await navigator.clipboard.writeText(el.innerText.trim()); toast("Cita copiada"); }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents(el);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Pulsa Ctrl+C para copiar");
    }
  }
  function error(el) {
    el.innerHTML = `<p class="error">No se han podido cargar los datos. Si estás viendo la web desde tu ordenador, ábrela desde su dirección de GitHub Pages.</p>`;
  }

  window.PID = { GRADOS, ACTIVIDADES, ICO, esc, num, fmt, dec, eur, lista, gradoDeTitulacion, colorGrado, varsGrado,
    rutaArchivo, enlaceMaterial, iconoMaterial, doiUrl, orcidUrl, nombre, apa, cargar, equipoDe, coordinacionDe,
    estudiantesDe, edicionVigente, ordenGrados, citaDeposito, insigniaDoi, copiar, toast, error };
})();
