// Logica della guida: navigazione tra i passi, avanzamento, copia dei comandi,
// selettore del sistema operativo e lettore dei report del checker.
// Nessun backend: tutto resta nel browser (avanzamento in localStorage).

// ---------------------------------------------------------------------------
// Report del checker (funzioni pure, testabili anche con Node)
// ---------------------------------------------------------------------------

// Categorie in ordine di "causa": conviene correggere dall'alto verso il basso.
const CATEGORIE = [
  { id: "startup", titolo: "File di startup", test: /\.startup` file/, consiglio: "Il file deve chiamarsi esattamente &lt;dispositivo&gt;.startup ed essere nella cartella del lab." },
  { id: "topologia", titolo: "Topologia", test: /^Check existence of|collision domain/, consiglio: "Nomi dei dispositivi e dei domini in lab.conf devono coincidere con la traccia." },
  { id: "indirizzi", titolo: "Indirizzi IP", test: /IP address/, consiglio: "Controllate gli <code>ip address add</code> nei file .startup: indirizzo, prefisso e interfaccia." },
  { id: "demoni", titolo: "Demoni", test: /is (not )?running|daemon/i, consiglio: "Controllate il file daemons del router e che lo startup lanci <code>systemctl start frr</code>." },
  { id: "vicini", titolo: "Adiacenze OSPF", test: /^OSPF neighbor/, consiglio: "Istruzioni network che coprono le interfacce e tipo di rete punto-punto su entrambi i lati del link." },
  { id: "interfacce", titolo: "Interfacce OSPF", test: /^OSPF interface/, consiglio: "Area, costo, punto-punto e LAN passive: confrontate con i vincoli della scheda." },
  { id: "routing", titolo: "Tabelle di routing", test: /routing table/, consiglio: "<b>Partite da qui:</b> una rotta mancante o in più spiega quasi sempre i ping falliti." },
  { id: "raggiungibilita", titolo: "Raggiungibilità", test: /reachable from/, consiglio: "Spesso è solo un sintomo: risolvete prima gli errori delle categorie sopra." },
  { id: "comandi", titolo: "Controlli specifici", test: /output of the command|exit code of the command/, consiglio: "Controlli della traccia: per esempio la loopback o il percorso del traceroute." },
];
const ALTRO = { id: "altro", titolo: "Altri controlli", consiglio: "" };

function parseCsv(testo) {
  const righe = [];
  let riga = [];
  let campo = "";
  let virgolette = false;
  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (virgolette) {
      if (c === '"' && testo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        virgolette = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      virgolette = true;
    } else if (c === ",") {
      riga.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && testo[i + 1] === "\n") i++;
      riga.push(campo);
      righe.push(riga);
      riga = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || riga.length) {
    riga.push(campo);
    righe.push(riga);
  }
  return righe.filter((r) => r.some((c) => c.trim() !== ""));
}

function categoria(descrizione) {
  return CATEGORIE.find((c) => c.test.test(descrizione)) || ALTRO;
}

// Restituisce { tipo: "test", totale, passati, falliti, gruppi } oppure
// { tipo: "riepilogo", totale, passati, falliti } oppure { tipo: "sconosciuto" }.
function analizzaReport(testo) {
  const righe = parseCsv(testo);
  if (!righe.length) return { tipo: "sconosciuto" };
  const intestazione = righe[0].map((c) => c.trim());

  if (intestazione[0] === "Total Tests" && righe[1]) {
    const [totale, passati, falliti] = righe[1].map(Number);
    return { tipo: "riepilogo", totale, passati, falliti };
  }

  const iDescrizione = intestazione.indexOf("Test Description");
  const iPassato = intestazione.indexOf("Passed");
  const iMotivo = intestazione.indexOf("Reason");
  if (iDescrizione < 0 || iPassato < 0) return { tipo: "sconosciuto" };

  const test = righe.slice(1).map((r) => ({
    descrizione: r[iDescrizione] || "",
    passato: (r[iPassato] || "").trim() === "True",
    motivo: iMotivo >= 0 ? r[iMotivo] || "" : "",
  }));
  const falliti = test.filter((t) => !t.passato);
  const gruppi = [...CATEGORIE, ALTRO]
    .map((c) => ({ categoria: c, test: falliti.filter((t) => categoria(t.descrizione) === c) }))
    .filter((g) => g.test.length);
  return { tipo: "test", totale: test.length, passati: test.length - falliti.length, falliti: falliti.length, gruppi };
}

if (typeof module !== "undefined") {
  module.exports = { parseCsv, analizzaReport, categoria };
}

// ---------------------------------------------------------------------------
// Interfaccia
// ---------------------------------------------------------------------------

if (typeof document !== "undefined") {
  const CHIAVE = "garr-kathara-guida-v1";

  const stato = {
    sezione: GUIDA[0].id,
    passo: {},
    fatti: {},
    os: /Win/.test(navigator.userAgent || "") ? "windows" : "unix",
    suggerimenti: {},
  };

  function carica() {
    try {
      Object.assign(stato, JSON.parse(localStorage.getItem(CHIAVE)) || {});
    } catch (e) {
      // localStorage non disponibile: si riparte da zero, la guida funziona lo stesso
    }
  }

  function salva() {
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(stato));
    } catch (e) {
      // come sopra
    }
  }

  const $ = (sel) => document.querySelector(sel);

  function el(tag, attributi = {}, ...figli) {
    const nodo = document.createElement(tag);
    for (const [k, v] of Object.entries(attributi)) {
      if (v === null || v === undefined) continue;
      if (k === "html") nodo.innerHTML = v;
      else if (k === "testo") nodo.textContent = v;
      else if (k.startsWith("on")) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v);
    }
    for (const f of figli) if (f) nodo.append(f);
    return nodo;
  }

  const sezioneCorrente = () => GUIDA.find((s) => s.id === stato.sezione) || GUIDA[0];
  const indicePasso = (s) => Math.min(stato.passo[s.id] || 0, s.passi.length - 1);
  const chiavePasso = (s, p) => `${s.id}/${p.id}`;
  const completati = (s) => s.passi.filter((p) => stato.fatti[chiavePasso(s, p)]).length;

  function testoComando(c) {
    return typeof c === "string" ? c : c[stato.os];
  }

  async function copia(testo, bottone) {
    try {
      await navigator.clipboard.writeText(testo);
    } catch (e) {
      const area = el("textarea", {}, testo);
      area.value = testo;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    bottone.textContent = "Copiato";
    bottone.classList.add("ok");
    setTimeout(() => {
      bottone.textContent = "Copia";
      bottone.classList.remove("ok");
    }, 1500);
  }

  function bloccoCodice(testo, titolo) {
    const bottone = el("button", { class: "copia", type: "button", testo: "Copia" });
    bottone.addEventListener("click", () => copia(testo, bottone));
    return el(
      "div",
      { class: "codice" },
      titolo ? el("div", { class: "codice-titolo", testo: titolo }) : null,
      el("pre", {}, el("code", { testo: testo })),
      bottone
    );
  }

  // --- Lettore del report -------------------------------------------------

  function lettoreCsv() {
    const risultato = el("div", { class: "report", "aria-live": "polite" });
    const input = el("input", { type: "file", accept: ".csv,text/csv", id: "file-report" });
    const zona = el(
      "label",
      { class: "zona-csv", for: "file-report" },
      el("strong", { testo: "Trascinate qui il report del checker" }),
      el("span", { testo: "oppure cliccate per sceglierlo: *_result_failed.csv o *_result_all.csv. Il file non lascia il vostro PC." }),
      input
    );

    function leggi(file) {
      if (!file) return;
      const lettore = new FileReader();
      lettore.onload = () => mostraReport(analizzaReport(String(lettore.result)), file.name, risultato);
      lettore.readAsText(file);
    }

    input.addEventListener("change", () => leggi(input.files[0]));
    zona.addEventListener("dragover", (e) => {
      e.preventDefault();
      zona.classList.add("sopra");
    });
    zona.addEventListener("dragleave", () => zona.classList.remove("sopra"));
    zona.addEventListener("drop", (e) => {
      e.preventDefault();
      zona.classList.remove("sopra");
      leggi(e.dataTransfer.files[0]);
    });
    return el("section", { class: "blocco" }, el("h3", { testo: "Lettore del report" }), zona, risultato);
  }

  function mostraReport(report, nome, contenitore) {
    contenitore.replaceChildren();
    contenitore.append(el("p", { class: "report-file", testo: nome }));

    if (report.tipo === "sconosciuto") {
      contenitore.append(el("p", { class: "avviso", testo: "Non riconosco questo file: usate uno dei CSV prodotti dal checker nella cartella del lab." }));
      return;
    }
    if (report.tipo === "riepilogo") {
      contenitore.append(el("p", { class: "avviso", testo: `Superati ${report.passati} su ${report.totale}. Per il dettaglio, aprite il file _result_failed.csv.` }));
      return;
    }
    if (report.falliti === 0) {
      contenitore.append(el("p", { class: "successo", testo: `Tutti i ${report.totale} test sono superati. Ottimo lavoro!` }));
      return;
    }

    const soloFalliti = report.passati === 0;
    contenitore.append(
      el("p", {
        class: "avviso",
        testo: soloFalliti
          ? `${report.falliti} test falliti. Correggete dall’alto verso il basso: le prime categorie sono di solito la causa delle altre.`
          : `Superati ${report.passati} su ${report.totale}, falliti ${report.falliti}. Correggete dall’alto verso il basso.`,
      })
    );

    for (const gruppo of report.gruppi) {
      const lista = el("ul", {});
      for (const t of gruppo.test) {
        lista.append(el("li", {}, el("span", { class: "desc", testo: t.descrizione }), t.motivo ? el("span", { class: "motivo", testo: t.motivo }) : null));
      }
      contenitore.append(
        el(
          "div",
          { class: "gruppo" },
          el("h4", {}, el("span", { testo: gruppo.categoria.titolo }), el("span", { class: "conteggio", testo: String(gruppo.test.length) })),
          gruppo.categoria.consiglio ? el("p", { class: "consiglio", html: gruppo.categoria.consiglio }) : null,
          lista
        )
      );
    }
  }

  // --- Suggerimenti a livelli ----------------------------------------------

  function suggerimenti(sezione, passo) {
    const chiave = chiavePasso(sezione, passo);
    const sbloccati = stato.suggerimenti[chiave] || 0;
    const blocco = el("section", { class: "blocco" }, el("h3", { testo: "Suggerimenti" }));
    blocco.append(el("p", { class: "nota", testo: "Si sbloccano uno alla volta. Provate prima da soli: la soluzione completa non c’è." }));

    passo.suggerimenti.forEach((s, i) => {
      if (i < sbloccati) {
        blocco.append(el("div", { class: "suggerimento" }, el("h4", { testo: s.titolo }), el("div", { html: s.html }), s.codice ? bloccoCodice(s.codice) : null));
      } else if (i === sbloccati) {
        blocco.append(
          el("button", {
            class: "sblocca",
            type: "button",
            testo: `Mostra il ${s.titolo.split(" · ")[0].toLowerCase()}`,
            onclick: () => {
              stato.suggerimenti[chiave] = sbloccati + 1;
              salva();
              disegna();
            },
          })
        );
      }
    });
    return blocco;
  }

  // --- Pannello del passo ---------------------------------------------------

  function pannello(sezione, i) {
    const passo = sezione.passi[i];
    const art = el("article", { class: "passo" });

    art.append(el("p", { class: "occhiello", testo: `${sezione.titolo} · passo ${i + 1} di ${sezione.passi.length}` }));
    art.append(el("h2", { testo: passo.titolo }));
    for (const t of passo.testo || []) art.append(el("p", { html: t }));

    if (passo.topologia) art.append(el("div", { class: "topologia", html: passo.topologia }));

    if (passo.tabella) {
      const tabella = el("table", {});
      tabella.append(el("thead", {}, el("tr", {}, ...passo.tabella.intestazione.map((h) => el("th", { testo: h })))));
      const corpo = el("tbody", {});
      for (const r of passo.tabella.righe) corpo.append(el("tr", {}, ...r.map((c) => el("td", { testo: c }))));
      tabella.append(corpo);
      art.append(el("div", { class: "tabella" }, tabella));
    }

    if (passo.vincoli) {
      art.append(el("h3", { testo: passo.vincoliTitolo || "Vincoli operativi" }), el("ol", { class: "vincoli" }, ...passo.vincoli.map((v) => el("li", { html: v }))));
    }
    if (passo.lista) art.append(el("ol", { class: "elenco" }, ...passo.lista.map((v) => el("li", { html: v }))));

    if (passo.esempio) art.append(bloccoCodice(passo.esempio.codice, passo.esempio.titolo));
    if (passo.esempio2) art.append(bloccoCodice(passo.esempio2.codice, passo.esempio2.titolo));

    if (passo.comandi) {
      const blocco = el("section", { class: "blocco" }, el("h3", { testo: "Comandi" }));
      if (passo.comandi.some((c) => typeof c !== "string")) {
        blocco.append(el("p", { class: "nota", testo: stato.os === "windows" ? "Comandi per Windows (PowerShell)." : "Comandi per Linux e macOS." }));
      }
      for (const c of passo.comandi) blocco.append(bloccoCodice(testoComando(c)));
      art.append(blocco);
    }

    if (passo.immagini) {
      const figure = el("div", { class: "figure" });
      for (const img of passo.immagini) {
        figure.append(
          el(
            "figure",
            {},
            el("a", { href: img.src, target: "_blank", rel: "noopener" }, el("img", { src: img.src, alt: img.alt, loading: "lazy" })),
            img.didascalia ? el("figcaption", { testo: img.didascalia }) : null
          )
        );
      }
      art.append(el("section", { class: "blocco" }, el("h3", { testo: "Cosa dovreste vedere" }), figure));
    }

    if (passo.vedere) art.append(el("p", { class: "vedere", html: passo.vedere }));
    if (passo.suggerimenti) art.append(suggerimenti(sezione, passo));
    if (passo.lettoreCsv) art.append(lettoreCsv());

    if (passo.problemi) {
      art.append(el("details", { class: "problemi" }, el("summary", { testo: "Se qualcosa non va" }), el("ul", {}, ...passo.problemi.map((p) => el("li", { html: p })))));
    }

    // Navigazione
    const ultimo = i === sezione.passi.length - 1;
    const iSezione = GUIDA.indexOf(sezione);
    const prossima = GUIDA[iSezione + 1];
    const fatto = stato.fatti[chiavePasso(sezione, passo)];
    art.append(
      el(
        "nav",
        { class: "navigazione" },
        el("button", { type: "button", class: "secondario", testo: "← Indietro", onclick: () => vai(sezione.id, i - 1) }),
        el("button", {
          type: "button",
          class: "primario",
          testo: ultimo ? (prossima ? `Fatto · vai a ${prossima.titolo}` : "Fatto, laboratori finiti!") : fatto ? "Avanti →" : "Fatto, avanti →",
          onclick: () => {
            stato.fatti[chiavePasso(sezione, passo)] = true;
            if (!ultimo) vai(sezione.id, i + 1);
            else if (prossima) vai(prossima.id, stato.passo[prossima.id] || 0);
            else {
              salva();
              disegna();
            }
          },
        })
      )
    );
    if (i === 0) art.querySelector(".navigazione .secondario").disabled = true;
    return art;
  }

  // --- Disegno generale -----------------------------------------------------

  function vai(idSezione, i) {
    stato.sezione = idSezione;
    stato.passo[idSezione] = i;
    salva();
    history.replaceState(null, "", `#${idSezione}/${i + 1}`);
    disegna();
    window.scrollTo({ top: 0 });
  }

  function disegna() {
    const sezione = sezioneCorrente();
    const i = indicePasso(sezione);

    // Schede delle sezioni
    const schede = $("#schede");
    schede.replaceChildren();
    for (const s of GUIDA) {
      const n = completati(s);
      schede.append(
        el(
          "button",
          { type: "button", class: s.id === sezione.id ? "scheda attiva" : "scheda", "aria-current": s.id === sezione.id ? "page" : "false", onclick: () => vai(s.id, stato.passo[s.id] || 0) },
          el("span", { class: "scheda-titolo", testo: s.titolo }),
          el("span", { class: "barra" }, el("span", { style: `width:${(100 * n) / s.passi.length}%` })),
          el("span", { class: "scheda-conto", testo: `${n}/${s.passi.length}` })
        )
      );
    }

    // Elenco dei passi
    const elenco = $("#passi");
    elenco.replaceChildren(el("p", { class: "sottotitolo", testo: sezione.sottotitolo }));
    const ol = el("ol", {});
    sezione.passi.forEach((p, j) => {
      const fatto = stato.fatti[chiavePasso(sezione, p)];
      ol.append(
        el(
          "li",
          {},
          el(
            "button",
            { type: "button", class: [j === i ? "attivo" : "", fatto ? "fatto" : ""].join(" ").trim(), onclick: () => vai(sezione.id, j) },
            el("span", { class: "numero", testo: fatto ? "✓" : String(j + 1) }),
            el("span", { testo: p.titolo })
          )
        )
      );
    });
    elenco.append(ol);

    $("#contenuto").replaceChildren(pannello(sezione, i));

    for (const b of document.querySelectorAll("#os button")) b.setAttribute("aria-pressed", String(b.dataset.os === stato.os));
  }

  function daHash() {
    const [id, n] = location.hash.slice(1).split("/");
    const s = GUIDA.find((x) => x.id === id);
    if (s) {
      stato.sezione = s.id;
      stato.passo[s.id] = Math.max(0, Math.min((parseInt(n, 10) || 1) - 1, s.passi.length - 1));
    }
  }

  carica();
  daHash();
  for (const b of document.querySelectorAll("#os button")) {
    b.addEventListener("click", () => {
      stato.os = b.dataset.os;
      salva();
      disegna();
    });
  }
  $("#ricomincia").addEventListener("click", () => {
    if (!confirm("Azzerare l’avanzamento di tutti i laboratori?")) return;
    stato.fatti = {};
    stato.passo = {};
    stato.suggerimenti = {};
    vai(GUIDA[0].id, 0);
  });
  window.addEventListener("hashchange", () => {
    daHash();
    disegna();
  });
  disegna();
}
