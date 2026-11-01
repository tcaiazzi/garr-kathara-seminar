// Contenuti della guida: sezioni, passi, comandi, immagini e suggerimenti.
// Solo dati: la logica è in guida.js. I testi possono contenere HTML semplice.
//
// Un comando è una stringa (uguale per tutti i sistemi) oppure un oggetto
// { unix: "...", windows: "..." } quando Linux/macOS e Windows differiscono.

const TOPOLOGIA_LAB1 = `
<svg viewBox="0 0 900 190" role="img" aria-label="Topologia del Lab 1: pc1, r1, r2 e pc2 in linea, collegati dai domini lanA, n12 e lanB">
  <line class="t-link" x1="140" y1="78" x2="270" y2="78"/>
  <line class="t-link" x1="390" y1="78" x2="520" y2="78"/>
  <line class="t-link" x1="640" y1="78" x2="760" y2="78"/>
  <rect class="t-host" x="20" y="50" width="120" height="56" rx="10"/>
  <rect class="t-router" x="270" y="50" width="120" height="56" rx="10"/>
  <rect class="t-router" x="520" y="50" width="120" height="56" rx="10"/>
  <rect class="t-host" x="760" y="50" width="120" height="56" rx="10"/>
  <text class="t-name" x="80" y="84">pc1</text>
  <text class="t-name t-on-router" x="330" y="84">r1</text>
  <text class="t-name t-on-router" x="580" y="84">r2</text>
  <text class="t-name" x="820" y="84">pc2</text>
  <text class="t-domain" x="205" y="68">lanA</text>
  <text class="t-subnet" x="205" y="98">192.168.1.0/24</text>
  <text class="t-domain" x="455" y="68">n12</text>
  <text class="t-subnet" x="455" y="98">10.0.12.0/30</text>
  <text class="t-domain" x="700" y="68">lanB</text>
  <text class="t-subnet" x="700" y="98">192.168.2.0/24</text>
  <text class="t-addr" x="80" y="132">eth0 192.168.1.10</text>
  <text class="t-addr" x="80" y="152">gw 192.168.1.1</text>
  <text class="t-addr" x="330" y="132">eth0 192.168.1.1</text>
  <text class="t-addr" x="330" y="152">eth1 10.0.12.1</text>
  <text class="t-addr" x="580" y="132">eth0 10.0.12.2</text>
  <text class="t-addr" x="580" y="152">eth1 192.168.2.1</text>
  <text class="t-addr" x="820" y="132">eth0 192.168.2.10</text>
  <text class="t-addr" x="820" y="152">gw 192.168.2.1</text>
</svg>`;

const TOPOLOGIA_LAB2 = `
<svg viewBox="0 0 900 400" role="img" aria-label="Topologia del Lab 2: anello r1, r2, r3, r4; sede A su r1, sede B su r3; percorso primario via r2 con costo 10, backup via r4 con costo 100">
  <line class="t-link" x1="130" y1="78" x2="250" y2="78"/>
  <line class="t-primary" x1="360" y1="78" x2="560" y2="78"/>
  <line class="t-primary" x1="615" y1="106" x2="615" y2="310"/>
  <line class="t-backup" x1="360" y1="338" x2="560" y2="338"/>
  <line class="t-backup" x1="305" y1="106" x2="305" y2="310"/>
  <line class="t-link" x1="670" y1="338" x2="780" y2="338"/>
  <rect class="t-host" x="20" y="50" width="110" height="56" rx="10"/>
  <rect class="t-router" x="250" y="50" width="110" height="56" rx="10"/>
  <rect class="t-router" x="560" y="50" width="110" height="56" rx="10"/>
  <rect class="t-router" x="250" y="310" width="110" height="56" rx="10"/>
  <rect class="t-router" x="560" y="310" width="110" height="56" rx="10"/>
  <rect class="t-host" x="780" y="310" width="110" height="56" rx="10"/>
  <text class="t-name" x="75" y="76">pc_a</text>
  <text class="t-sub" x="75" y="96">192.168.10.10</text>
  <text class="t-name t-on-router" x="305" y="76">r1</text>
  <text class="t-sub t-on-router" x="305" y="96">lo 10.255.0.1</text>
  <text class="t-name t-on-router" x="615" y="76">r2</text>
  <text class="t-sub t-on-router" x="615" y="96">lo 10.255.0.2</text>
  <text class="t-name t-on-router" x="305" y="336">r4</text>
  <text class="t-sub t-on-router" x="305" y="356">lo 10.255.0.4</text>
  <text class="t-name t-on-router" x="615" y="336">r3</text>
  <text class="t-sub t-on-router" x="615" y="356">lo 10.255.0.3</text>
  <text class="t-name" x="835" y="336">pc_b</text>
  <text class="t-sub" x="835" y="356">192.168.20.10</text>
  <text class="t-site" x="75" y="38">SEDE A</text>
  <text class="t-site" x="835" y="390">SEDE B</text>
  <text class="t-domain" x="190" y="66">lanA</text>
  <text class="t-subnet" x="190" y="98">192.168.10.0/24</text>
  <text class="t-domain" x="460" y="66">n12 · 10.0.0.0/30</text>
  <text class="t-cost-primary" x="460" y="98">costo 10</text>
  <text class="t-domain" x="460" y="326">n34 · 10.0.0.8/30</text>
  <text class="t-cost-backup" x="460" y="358">costo 100</text>
  <text class="t-domain t-end" x="295" y="196">n41</text>
  <text class="t-subnet t-end" x="295" y="214">10.0.0.12/30</text>
  <text class="t-cost-backup t-end" x="295" y="232">costo 100</text>
  <text class="t-domain t-start" x="625" y="196">n23</text>
  <text class="t-subnet t-start" x="625" y="214">10.0.0.4/30</text>
  <text class="t-cost-primary t-start" x="625" y="232">costo 10</text>
  <text class="t-domain" x="725" y="326">lanB</text>
  <text class="t-subnet" x="725" y="358">192.168.20.0/24</text>
</svg>`;

// La stessa topologia dopo la CR-042: sede C su r4, evidenziata
const TOPOLOGIA_LAB2_CR = TOPOLOGIA_LAB2
  .replace('viewBox="0 0 900 400"', 'viewBox="0 0 900 560"')
  .replace('aria-label="Topologia del Lab 2:', 'aria-label="Topologia del Lab 2 dopo la CR-042, con la sede C collegata a r4 sulla LAN lanC 192.168.30.0/24:')
  .replace("</svg>", `  <line class="t-cr" x1="305" y1="366" x2="305" y2="470"/>
  <rect class="t-host t-cr-box" x="250" y="470" width="110" height="56" rx="10"/>
  <text class="t-name" x="305" y="496">pc_c</text>
  <text class="t-sub" x="305" y="516">192.168.30.10</text>
  <text class="t-cr-text t-start" x="318" y="410">lanC · CR-042</text>
  <text class="t-subnet t-start" x="318" y="430">192.168.30.0/24</text>
  <text class="t-site" x="305" y="550">SEDE C (NUOVA)</text>
</svg>`);

// Lab 1, esercizio extra: due VLAN tra le sedi. Ogni host su una porta di
// accesso dedicata dello switch, trunk su n12
const TOPOLOGIA_LAB1_VLAN = `
<svg viewBox="0 0 900 290" role="img" aria-label="Lab 1 con le VLAN: pc1 (VLAN 101, lan1) e pc4 (VLAN 100, lan4) collegati ciascuno a una porta di accesso dello switch s1; pc2 (VLAN 100, lan2) e pc3 (VLAN 101, lan3) collegati ciascuno a una porta di accesso dello switch s2; trunk 802.1Q con le VLAN 100 e 101 sul link n12 tra s1 e s2">
  <line class="t-link" x1="140" y1="58" x2="270" y2="136"/>
  <line class="t-link" x1="140" y1="238" x2="270" y2="160"/>
  <line class="t-link" x1="630" y1="136" x2="760" y2="58"/>
  <line class="t-link" x1="630" y1="160" x2="760" y2="238"/>
  <line class="t-trunk" x1="390" y1="148" x2="510" y2="148"/>
  <rect class="t-host t-v101-box" x="20" y="30" width="120" height="56" rx="10"/>
  <rect class="t-host t-v100-box" x="20" y="210" width="120" height="56" rx="10"/>
  <rect class="t-router" x="270" y="120" width="120" height="56" rx="10"/>
  <rect class="t-router" x="510" y="120" width="120" height="56" rx="10"/>
  <rect class="t-host t-v100-box" x="760" y="30" width="120" height="56" rx="10"/>
  <rect class="t-host t-v101-box" x="760" y="210" width="120" height="56" rx="10"/>
  <text class="t-name" x="80" y="56">pc1</text>
  <text class="t-v101-text" x="80" y="76">VLAN 101</text>
  <text class="t-name" x="80" y="236">pc4</text>
  <text class="t-v100-text" x="80" y="256">VLAN 100</text>
  <text class="t-name t-on-router" x="330" y="146">s1</text>
  <text class="t-sub t-on-router" x="330" y="166">br100 · br101</text>
  <text class="t-name t-on-router" x="570" y="146">s2</text>
  <text class="t-sub t-on-router" x="570" y="166">br100 · br101</text>
  <text class="t-name" x="820" y="56">pc2</text>
  <text class="t-v100-text" x="820" y="76">VLAN 100</text>
  <text class="t-name" x="820" y="236">pc3</text>
  <text class="t-v101-text" x="820" y="256">VLAN 101</text>
  <text class="t-domain" x="196" y="76">lan1</text>
  <text class="t-addr t-end" x="262" y="112">eth0</text>
  <text class="t-domain" x="196" y="236">lan4</text>
  <text class="t-addr t-end" x="262" y="194">eth2</text>
  <text class="t-domain" x="704" y="76">lan2</text>
  <text class="t-addr t-start" x="638" y="112">eth1</text>
  <text class="t-domain" x="704" y="236">lan3</text>
  <text class="t-addr t-start" x="638" y="194">eth2</text>
  <text class="t-domain" x="450" y="134">n12 · trunk</text>
  <text class="t-subnet" x="450" y="172">VLAN 100 + 101</text>
  <text class="t-site" x="80" y="286">SEDE A</text>
  <text class="t-site" x="820" y="286">SEDE B</text>
</svg>`;

const CHECKER_LAB1 = "python -m kathara_lab_checker --config lab1-statico/checker/correction.yaml --lab labs/lab1/static-routing --no-cache --report-type csv";
const CHECKER_VLAN = "python -m kathara_lab_checker --config lab1-statico/extra-vlan/checker/correction.yaml --lab labs/lab1/vlan --no-cache --report-type csv";
const CHECKER_LAB2 = "python -m kathara_lab_checker --config lab2-digital-twin/checker/correction.yaml --lab labs/lab2/ospf --no-cache --report-type csv";
const CHECKER_BFD = "python -m kathara_lab_checker --config lab2-digital-twin/checker/correction-bfd.yaml --lab labs/lab2/ospf --no-cache --report-type csv";

const GUIDA = [
  {
    id: "prep",
    titolo: "Preparazione",
    sottotitolo: "Virtualenv, requirements e verifica del PC",
    passi: [
      {
        id: "venv-crea",
        titolo: "Creiamo il virtualenv",
        testo: [
          "Apriamo un terminale nella <b>radice del repository</b> (la cartella <code>garr-kathara-seminar</code>, aperta anche nell’editor): tutti i comandi della guida partono da lì.",
          "Il virtualenv isola le dipendenze: i pacchetti del seminario non toccano il Python di sistema. Lo creiamo una volta sola.",
        ],
        comandi: [{ unix: "python3 -m venv .venv", windows: "python -m venv .venv" }],
        problemi: [
          "<b>«No module named venv»</b> o <b>«ensurepip is not available»</b>: su Debian e Ubuntu installiamo il pacchetto <code>python3-venv</code>.",
          "<b>Python troppo vecchio</b>: il checker richiede Python 3.11 o superiore (vedi setup/INSTALL.md).",
        ],
      },
      {
        id: "venv",
        titolo: "Attiviamo il virtualenv",
        testo: [
          "Va fatto <b>in ogni nuovo terminale</b>. A virtualenv attivo il prompt inizia con <code>(.venv)</code> e il comando è semplicemente <code>python</code>, anche su Windows.",
        ],
        comandi: [{ unix: "source .venv/bin/activate", windows: ".venv\\Scripts\\Activate.ps1" }],
        problemi: [
          "<b>Windows: «l’esecuzione di script è disabilitata nel sistema»</b>: lanciamo <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> e riattiviamo.",
        ],
      },
      {
        id: "requirements",
        titolo: "Installiamo i requirements",
        testo: [
          "Con il virtualenv attivo installiamo <b>kathara-lab-checker</b>, che corregge automaticamente i lab che svolgiamo, e le API Python di Kathará, usate nel Lab 3.",
        ],
        comandi: ["pip install -r requirements.txt"],
        problemi: ["<b>«externally-managed-environment»</b>: il virtualenv non è attivo; torniamo al passo precedente."],
      },
      {
        id: "verifica",
        titolo: "Verifichiamo il setup",
        testo: ["Lo script controlla Python, i pacchetti, Docker, le immagini e avvia un mini-lab di prova."],
        comandi: ["python setup/verifica.py"],
        vedere: "L’ultima riga deve essere «Tutto pronto per il seminario!». Accanto a ogni KO c’è l’indicazione per correggerlo.",
        problemi: [
          "<b>Docker in esecuzione: KO</b>: avviamo Docker Desktop (o il servizio docker su Linux) e rilanciamo.",
          "<b>Immagine non scaricata</b>: <code>docker pull kathara/base</code> e <code>docker pull kathara/frr</code>.",
          "<b>kathara-lab-checker non installato</b>: il virtualenv non è attivo, oppure non abbiamo installato i requirements.",
        ],
      },
    ],
  },
  {
    id: "lab1",
    titolo: "Lab 1",
    sottotitolo: "Warmup: rotte statiche · 25 minuti",
    passi: [
      {
        id: "topologia",
        titolo: "La topologia",
        testo: [
          "Quattro dispositivi in linea. Obiettivo: <b>pc1 raggiunge pc2</b>, e viceversa.",
          "Immagine <code>kathara/base</code> per tutti. Gli host hanno una default route; ogni router ha una sola rotta statica, verso la LAN che non vede direttamente.",
        ],
        topologia: TOPOLOGIA_LAB1,
        tabella: {
          intestazione: ["Dispositivo", "Interfaccia", "Dominio", "Indirizzo", "Gateway"],
          righe: [
            ["pc1", "eth0", "lanA", "192.168.1.10/24", "192.168.1.1"],
            ["r1", "eth0", "lanA", "192.168.1.1/24", "—"],
            ["r1", "eth1", "n12", "10.0.12.1/30", "—"],
            ["r2", "eth0", "n12", "10.0.12.2/30", "—"],
            ["r2", "eth1", "lanB", "192.168.2.1/24", "—"],
            ["pc2", "eth0", "lanB", "192.168.2.10/24", "192.168.2.1"],
          ],
        },
        problemi: ["Usiamo <b>esattamente</b> i nomi della tabella: il checker confronta dispositivi e domini uno a uno."],
      },
      {
        id: "cartella",
        titolo: "Creiamo la cartella del lab",
        testo: [
          "Dalla radice del repository creiamo la cartella del nostro lab: è lì che scriviamo, con l’editor, <code>lab.conf</code> e i file <code>.startup</code>.",
          "Il terminale invece <b>resta nella radice</b>: nei comandi di Kathará indichiamo il lab con <code>-d</code>.",
        ],
        comandi: [
          { unix: "mkdir -p labs/lab1/static-routing", windows: "New-Item -ItemType Directory -Force labs\\lab1\\static-routing" },
        ],
      },
      {
        id: "labconf",
        titolo: "Scriviamo lab.conf",
        testo: [
          "Con un editor, creiamo <code>lab.conf</code>: una riga per interfaccia nel formato <code>nome[numero]=\"dominio\"</code>, più l’immagine di ogni dispositivo.",
          "Il numero tra parentesi quadre è quello dell’interfaccia: <code>r1[1]=\"n12\"</code> significa eth1 di r1 sul dominio n12.",
        ],
        esempio: { titolo: "lab.conf (estratto)", codice: "r1[0]=\"lanA\"\nr1[1]=\"n12\"\nr1[image]=\"kathara/base\"" },
        problemi: [
          "<b>Maiuscole nei nomi dei dispositivi</b>: Kathará non le accetta (<code>pcA</code> non va), e lstart segnala un errore in lab.conf.",
          "<b>Interfacce con buchi</b>: r1[0], r1[1], …: la numerazione parte da 0 e non salta numeri.",
        ],
      },
      {
        id: "startup",
        titolo: "Scriviamo i file .startup",
        testo: [
          "Un file <code>&lt;dispositivo&gt;.startup</code> per ciascuno, con indirizzi e rotte.",
          "Non serve abilitare l’IP forwarding: Kathará lo attiva già su tutti i dispositivi.",
        ],
        esempio: {
          titolo: "r1.startup",
          codice: "ip address add 192.168.1.1/24 dev eth0\nip address add 10.0.12.1/30 dev eth1\nip route add <rete>/<prefisso> via <next-hop>",
        },
        esempio2: { titolo: "Sugli host", codice: "ip route add default via <gateway>" },
        problemi: [
          "<b>Rotta verso un indirizzo</b>: <code>ip route add</code> vuole la rete (192.168.2.0/24); il next-hop è un vicino diretto.",
          "<b>Rotta di ritorno dimenticata</b>: il ping funziona solo se anche r2 sa tornare verso 192.168.1.0/24.",
        ],
      },
      {
        id: "avvio",
        titolo: "Avviamo il lab",
        testo: [
          "Dalla radice del repository: <code>-d</code> indica la cartella del lab. <code>kathara lstart</code> apre anche un terminale per ogni dispositivo.",
          "Con <code>kathara linfo --topology</code> controlliamo il cablaggio: ogni dominio con i suoi dispositivi.",
        ],
        comandi: ["kathara lstart -d labs/lab1/static-routing", "kathara linfo -d labs/lab1/static-routing --topology"],
        immagini: [{ src: "img/l1-avvio.png", alt: "Output di kathara lstart con le barre 3/3 e 4/4 e di kathara linfo --topology" }],
        vedere: "Le barre arrivano a 3/3 e 4/4: tutti i domini e tutti i dispositivi sono partiti.",
        problemi: [
          "<b>Modifiche nei container</b>: quello che digitiamo in un terminale sparisce al riavvio. Correggiamo i file .startup e usiamo <code>kathara lrestart -d labs/lab1/static-routing</code>.",
          "<b>macOS, VS Code: i terminali dei dispositivi non si aprono</b>: macOS non lascia a VS Code il controllo dell’app Terminale. La via più semplice è lanciare i comandi di Kathará da un terminale esterno. Per usare il terminale integrato: dall’app Terminale (non da VS Code) <code>tccutil reset AppleEvents com.microsoft.VSCode</code>; chiudiamo VS Code con Cmd+Q e riapriamolo; dal terminale integrato <code>osascript -e 'tell application \"Terminal\" to do script \"echo ok\"'</code> e al popup «Visual Studio Code vuole controllare Terminal» clicchiamo OK. Dettagli in setup/INSTALL.md.",
        ],
      },
      {
        id: "prova",
        titolo: "Proviamo da pc1",
        testo: ["Apriamo una shell su pc1 (se il terminale non è già aperto) e lanciamo i tre comandi."],
        comandi: ["kathara connect -d labs/lab1/static-routing pc1", "ping -c 3 192.168.2.10", "traceroute -n 192.168.2.10", "ip route"],
        immagini: [{ src: "img/l1-pc1.png", alt: "Sessione su pc1: ping riuscito, traceroute via 192.168.1.1 e 10.0.12.2, ip route" }],
        vedere: "0% packet loss; il traceroute passa da r1 (192.168.1.1) e da r2 (10.0.12.2). In <code>ip route</code> due righe: la default verso r1 e la rete connessa.",
        problemi: [
          "<b>Il traceroute si ferma dopo il primo hop</b>: manca la rotta su r1.",
          "<b>Il traceroute arriva a pc2 ma il ping fallisce</b>: manca la rotta di ritorno su r2.",
          "<b>Comando al volo senza aprire una shell</b>: <code>kathara exec -d labs/lab1/static-routing pc1 \"ping -c 3 192.168.2.10\"</code>, con il comando <b>tra virgolette</b>.",
        ],
      },
      {
        id: "checker",
        titolo: "Controlliamo con il checker",
        testo: [
          "Il checker <b>avvia il lab da solo</b>: fermiamo prima il nostro lab.",
          "L’opzione <code>--no-cache</code> rifà il controllo anche se esiste già un report: senza, il checker salta il lab senza avvisare.",
        ],
        comandi: ["kathara lclean -d labs/lab1/static-routing", CHECKER_LAB1],
        immagini: [{ src: "img/l1-checker.png", alt: "Output del checker su un lab con un errore: test falliti in rosso e Passed Tests: 40/49" }],
        vedere: "In fondo, <b>Passed Tests: N/M</b>. La soluzione completa passa 48 test su 48. Nell’esempio c’è un errore voluto: su r2 manca la rotta di ritorno, quindi r2 non raggiunge la LAN A e pc2 non riceve risposte da lì.",
        problemi: ["<b>«Network scenario already processed, skipping»</b>: abbiamo dimenticato <code>--no-cache</code>."],
      },
      {
        id: "report",
        titolo: "Leggiamo il report e correggiamo",
        testo: [
          "Nella cartella del lab troviamo tre report: <code>static-routing_result_failed.csv</code> (solo i test falliti, con il motivo: partiamo da qui), <code>static-routing_result_summary.csv</code> (totale, superati, falliti) e <code>static-routing_result_all.csv</code> (tutti i test).",
          "Trasciniamo il report dei falliti qui sotto per vederlo ordinato per tipo di errore. Correggiamo, rilanciamo il checker, ripetiamo finché tutti i test passano.",
        ],
        immagini: [{ src: "img/l1-report.png", alt: "Contenuto di static-routing_result_failed.csv" }],
        vedere: "Tutti i test passano? Per chi finisce prima c’è un esercizio facoltativo nella scheda <b>Extra · VLAN</b>.",
        lettoreCsv: true,
      },
      {
        id: "wireshark",
        titolo: "Informazione utile: Wireshark nei laboratori",
        testo: [
          "<b>Non serve per il workshop</b>: l’immagine va scaricata e richiede tempo. Possiamo aggiungere al lab un dispositivo Wireshark per vedere le catture live da un’interfaccia grafica nel browser.",
        ],
        esempio: {
          titolo: "Righe da aggiungere a lab.conf",
          codice: "wireshark[bridged]=\"true\"\nwireshark[port]=\"3000:3000\"\nwireshark[image]=\"lscr.io/linuxserver/wireshark\"\nwireshark[num_terms]=0\nwireshark[0]=\"lanA\"",
        },
        lista: [
          "il dispositivo sta sul dominio da osservare (qui <code>lanA</code>), con <code>bridged</code> attivo e la porta 3000 esposta sull’host;",
          "apriamo la GUI nel browser: <code>http://localhost:3000</code>;",
          "scegliamo l’interfaccia: <code>eth0</code> è il dominio <code>lanA</code>, <code>eth1</code> è collegata alla rete bridged di Docker.",
        ],
      },
    ],
  },
  {
    id: "extra-vlan",
    titolo: "Extra · VLAN",
    sottotitolo: "Dopo il Lab 1: due VLAN tra le sedi · facoltativo",
    passi: [
      {
        id: "vlan",
        titolo: "Due VLAN tra le sedi",
        testo: [
          "<b>Facoltativo</b>, per chi ha finito o da fare a casa. Quattro computer, ognuno su una <b>porta dedicata</b> dello switch della sua sede: pc1 e pc4 su s1, pc2 e pc3 su s2.",
          "La <b>VLAN 100</b> unisce i computer pari (pc2, pc4), la <b>VLAN 101</b> i dispari (pc1, pc3). Ogni VLAN attraversa le sedi su un <b>trunk</b> 802.1Q sul link n12.",
          "Come nelle reti reali, <b>gli host non sanno di essere in una VLAN</b>: hanno solo un indirizzo su eth0, senza gateway. Lo switch decide la VLAN dalla porta su cui arriva il frame (porta di <b>accesso</b>) e aggiunge il tag sul trunk. Solo livello 2: al posto dei router del Lab 1 ci sono due switch, s1 e s2, senza indirizzi e senza rotte.",
          "Partiamo dal template <code>lab1-statico/extra-vlan/partenza/</code>: <code>lab.conf</code> è già completo e non va modificato; completiamo i sei file <code>.startup</code>, che per ora contengono solo un commento.",
        ],
        topologia: TOPOLOGIA_LAB1_VLAN,
        tabella: {
          intestazione: ["Dispositivo", "Interfaccia", "Dominio", "Ruolo", "VLAN", "Indirizzo"],
          righe: [
            ["pc1", "eth0", "lan1", "host", "101", "10.101.0.1/24"],
            ["pc4", "eth0", "lan4", "host", "100", "10.100.0.4/24"],
            ["pc2", "eth0", "lan2", "host", "100", "10.100.0.2/24"],
            ["pc3", "eth0", "lan3", "host", "101", "10.101.0.3/24"],
            ["s1", "eth0", "lan1", "accesso", "101", "—"],
            ["s1", "eth1", "n12", "trunk", "100, 101", "—"],
            ["s1", "eth2", "lan4", "accesso", "100", "—"],
            ["s2", "eth0", "n12", "trunk", "100, 101", "—"],
            ["s2", "eth1", "lan2", "accesso", "100", "—"],
            ["s2", "eth2", "lan3", "accesso", "101", "—"],
          ],
        },
        comandi: [
          { unix: "mkdir -p labs/lab1", windows: "New-Item -ItemType Directory -Force labs\\lab1" },
          { unix: "cp -r lab1-statico/extra-vlan/partenza labs/lab1/vlan", windows: "Copy-Item -Recurse lab1-statico\\extra-vlan\\partenza labs\\lab1\\vlan" },
        ],
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · l’host non sa niente",
            html: "<p>Su un host basta un indirizzo su <code>eth0</code>, come se la VLAN non esistesse. Niente sottointerfacce e niente gateway.</p>",
            codice: "ip address add 10.101.0.1/24 dev eth0",
          },
          {
            titolo: "Suggerimento 2 · il bridge su uno switch",
            html: "<p>Per ogni VLAN: una sottointerfaccia sul trunk e un bridge senza indirizzi che la unisce alla porta di accesso. La porta di accesso entra nel bridge così com’è: tutto ciò che arriva da lì appartiene a quella VLAN. Sottointerfacce e bridge nascono spenti. Su s1 il trunk è eth1, su s2 è eth0.</p>",
            codice: "# s1, VLAN 101: porta di accesso eth0, trunk eth1\nip link add link eth1 name eth1.101 type vlan id 101\nip link add br101 type bridge\nip link set eth0 master br101\nip link set eth1.101 master br101\nip link set eth1.101 up\nip link set br101 up",
          },
          {
            titolo: "Suggerimento 3 · la configurazione completa di s1",
            html: "<p><code>s1.startup</code>: porte di accesso <code>eth0</code> (pc1, VLAN 101) ed <code>eth2</code> (pc4, VLAN 100), trunk <code>eth1</code>. Nessun indirizzo IP.</p>",
            codice: "# VLAN 101: porta di accesso eth0 (pc1) + trunk eth1, taggato 101\nip link add link eth1 name eth1.101 type vlan id 101\nip link add br101 type bridge\nip link set eth0 master br101\nip link set eth1.101 master br101\nip link set eth1.101 up\nip link set br101 up\n\n# VLAN 100: porta di accesso eth2 (pc4) + trunk eth1, taggato 100\nip link add link eth1 name eth1.100 type vlan id 100\nip link add br100 type bridge\nip link set eth2 master br100\nip link set eth1.100 master br100\nip link set eth1.100 up\nip link set br100 up",
          },
          {
            titolo: "Suggerimento 4 · la configurazione completa di s2",
            html: "<p><code>s2.startup</code>: porte di accesso <code>eth1</code> (pc2, VLAN 100) ed <code>eth2</code> (pc3, VLAN 101), trunk <code>eth0</code>. Nessun indirizzo IP.</p>",
            codice: "# VLAN 100: porta di accesso eth1 (pc2) + trunk eth0, taggato 100\nip link add link eth0 name eth0.100 type vlan id 100\nip link add br100 type bridge\nip link set eth1 master br100\nip link set eth0.100 master br100\nip link set eth0.100 up\nip link set br100 up\n\n# VLAN 101: porta di accesso eth2 (pc3) + trunk eth0, taggato 101\nip link add link eth0 name eth0.101 type vlan id 101\nip link add br101 type bridge\nip link set eth2 master br101\nip link set eth0.101 master br101\nip link set eth0.101 up\nip link set br101 up",
          },
        ],
        notaSuggerimenti: "Si sbloccano uno alla volta. Proviamo prima da soli: gli ultimi due contengono la configurazione completa degli switch.",
        problemi: [
          "<b>Un dispositivo non compare</b>: dopo aver modificato <code>lab.conf</code> serve <code>kathara lrestart -d labs/lab1/vlan</code>.",
          "<b>La sottointerfaccia non inoltra</b>: è rimasta spenta; anche il bridge va portato su.",
          "<b>Indirizzo IP sulla porta dello switch</b>: non serve, una porta dentro un bridge non lo usa. Gli switch lavorano solo a livello 2.",
        ],
      },
      {
        id: "vlan-verifica",
        titolo: "Verifichiamo le VLAN",
        testo: [
          "Avviamo il lab dalla radice del repository. I ping dentro ogni VLAN devono passare tra le sedi; con <code>bridge link</code> vediamo quali porte sono in ogni bridge.",
          "Poi cerchiamo il tag: lasciamo un ping da pc1 a pc3 in un terminale (<code>kathara exec -d labs/lab1/vlan pc1 \"ping 10.101.0.3\"</code>) e in un altro catturiamo su s1, prima sulla porta di accesso e poi sul trunk.",
        ],
        comandi: [
          "kathara lstart -d labs/lab1/vlan",
          "kathara exec -d labs/lab1/vlan pc1 \"ping -c 3 10.101.0.3\"",
          "kathara exec -d labs/lab1/vlan pc4 \"ping -c 3 10.100.0.2\"",
          "kathara exec -d labs/lab1/vlan s1 \"bridge link\"",
          "kathara exec -d labs/lab1/vlan s1 \"tcpdump -e -n -c 2 -i eth0 icmp\"",
          "kathara exec -d labs/lab1/vlan s1 \"tcpdump -e -n -c 2 -i eth1 icmp\"",
          "kathara lclean -d labs/lab1/vlan",
          CHECKER_VLAN,
        ],
        immagini: [{ src: "img/l1x-tcpdump.png", alt: "tcpdump su s1 durante un ping da pc1 a pc3: su eth0 i frame senza tag, su eth1 gli stessi frame con 802.1Q vlan 101" }],
        vedere: "Su <code>eth0</code>, la porta di pc1, i frame passano <b>senza tag</b>; su <code>eth1</code>, il trunk, gli stessi frame hanno <b>802.1Q vlan 101</b>: il tag lo mette lo switch. pc4 non vede nulla, perché è su un’altra LAN e in un’altra VLAN. La soluzione passa 42 test su 42 (il template di partenza così com’è ne passa 22, solo la topologia); è in <code>lab1-statico/extra-vlan/soluzione/</code>.",
        lettoreCsv: true,
        problemi: [
          "<b>Il ping dentro la VLAN non passa</b>: VLAN id diverso tra s1 e s2 sul trunk, o una sottointerfaccia non agganciata al bridge.",
          "<b>pc4 non raggiunge pc2</b>: la sua porta di accesso è nel bridge sbagliato (per esempio eth2 di s1 in br101).",
          "<b>Funziona solo da una parte</b>: le VLAN vanno configurate sia su s1 sia su s2, sulla porta di accesso e sul trunk.",
        ],
      },
    ],
  },
  {
    id: "lab2",
    titolo: "Lab 2",
    sottotitolo: "Digital twin di una rete OSPF · 50 minuti",
    passi: [
      {
        id: "scheda",
        titolo: "La rete di produzione",
        testo: [
          "Siamo i tecnici di rete che devono modificare una rete in esercizio: due sedi collegate da un backbone di quattro router ad anello, <b>con OSPF</b>. Prima di toccare la produzione, proviamo la modifica sul gemello digitale.",
          "Il twin ha gli stessi dispositivi, collegamenti, indirizzi e configurazioni della rete reale. Ogni router ha una loopback 10.255.0.N/32, usata come router-id.",
        ],
        topologia: TOPOLOGIA_LAB2,
        tabella: {
          intestazione: ["Router", "eth0", "eth1", "eth2", "lo"],
          righe: [
            ["r1", "192.168.10.1/24 · lanA", "10.0.0.1/30 · n12", "10.0.0.14/30 · n41", "10.255.0.1/32"],
            ["r2", "10.0.0.2/30 · n12", "10.0.0.5/30 · n23", "—", "10.255.0.2/32"],
            ["r3", "192.168.20.1/24 · lanB", "10.0.0.6/30 · n23", "10.0.0.9/30 · n34", "10.255.0.3/32"],
            ["r4", "10.0.0.10/30 · n34", "10.0.0.13/30 · n41", "—", "10.255.0.4/32"],
          ],
        },
        vincoliTitolo: "Come è configurata la produzione",
        vincoli: [
          "<b>OSPF in area 0</b> su tutti i router; sono annunciate le reti di backbone, le loopback e le LAN di sede.",
          "<b>LAN di sede passive</b>: annunciate in OSPF, ma senza adiacenze verso gli utenti.",
          "<b>Tra le sedi si passa per r2</b>; r4 è il backup. Costo 10 su n12 e n23, costo 100 su n34 e n41.",
          "<b>Ogni router raggiunge le loopback</b> di tutti gli altri. La loopback 10.255.0.N è anche il router-id OSPF.",
          "<b>Link di backbone punto-punto</b>: niente elezione DR/BDR sui /30, le adiacenze salgono più in fretta.",
        ],
      },
      {
        id: "ospf-r1",
        titolo: "La configurazione OSPF di r1",
        testo: [
          "Così è configurato OSPF su r1, nel file <code>r1/etc/frr/frr.conf</code>. Gli altri router seguono lo stesso schema.",
        ],
        esempio: {
          titolo: "r1/etc/frr/frr.conf",
          codice: "interface eth0\n ip ospf passive\ninterface eth1\n ip ospf network point-to-point\n ip ospf cost 10\ninterface eth2\n ip ospf network point-to-point\n ip ospf cost 100\n!\nrouter ospf\n ospf router-id 10.255.0.1\n network 10.255.0.1/32 area 0\n network 192.168.10.0/24 area 0\n network 10.0.0.0/30 area 0\n network 10.0.0.12/30 area 0",
        },
        lista: [
          "<b>passive</b> su eth0, la sede A: la LAN è annunciata, ma senza Hello;",
          "<b>point-to-point</b> sui link di backbone: nessuna elezione DR/BDR;",
          "<b>cost</b>: 10 su n12 (eth1), 100 su n41 (eth2);",
          "<b>router-id</b>: la loopback di r1;",
          "<b>network … area 0</b>: accende OSPF sulle interfacce in quel prefisso e lo annuncia. Un’area è un gruppo di router con la stessa LSDB; la 0 è il backbone, qui l’unica.",
        ],
        vedere: "Nel file <code>/etc/frr/daemons</code> c’è <code>ospfd=yes</code>, oltre a <code>zebra=yes</code>: senza il demone, il blocco <code>router ospf</code> non ha effetto.",
      },
      {
        id: "produzione",
        titolo: "Fase 1: avvio ed esplorazione del lab",
        testo: [
          "La cartella <code>produzione/</code> contiene la rete in esercizio, già configurata. Copiamola nella nostra cartella di lavoro e avviamola: da qui in poi lavoriamo sempre sulla nostra copia. Il terminale resta nella radice del repository: nei comandi di Kathará indichiamo il lab con <code>-d</code>.",
        ],
        comandi: [
          { unix: "mkdir -p labs/lab2", windows: "New-Item -ItemType Directory -Force labs\\lab2" },
          { unix: "cp -r lab2-digital-twin/produzione labs/lab2/ospf", windows: "Copy-Item -Recurse lab2-digital-twin\\produzione labs\\lab2\\ospf" },
          "kathara lstart -d labs/lab2/ospf",
        ],
      },
      {
        id: "adiacenze",
        titolo: "Esploriamo: le adiacenze",
        testo: ["Su un router, <code>vtysh</code> apre la CLI di FRR: il prompt passa da <code>root@r1:/#</code> a <code>r1#</code>."],
        comandi: ["kathara connect -d labs/lab2/ospf r1", "vtysh", "show ip ospf neighbor", "show ip ospf interface"],
        immagini: [{ src: "img/l2-neighbor.png", alt: "r1 in vtysh: show ip ospf neighbor con 10.255.0.2 e 10.255.0.4 in stato Full/-" }],
        vedere: "Due vicini per router, tutti <b>Full/-</b>: adiacenza completa su link punto-punto, nessun DR. Il Neighbor ID è il router-id, cioè la loopback del vicino.",
      },
      {
        id: "rotte",
        titolo: "Esploriamo: le rotte",
        testo: ["Sempre in vtysh su r1. <code>O&gt;*</code> indica una rotta OSPF installata; tra parentesi quadre ci sono distanza amministrativa e costo. Le righe solo <code>O</code> sono reti connesse: lì vince la rotta del kernel."],
        comandi: ["show ip route ospf"],
        immagini: [{ src: "img/l2-route.png", alt: "r1: show ip route ospf con la sede B via 10.0.0.2 e la loopback di r4 via 10.0.0.13" }],
        vedere: "192.168.20.0/24 via <b>10.0.0.2</b> (costo 30, passando da r2); la loopback di r4 via 10.0.0.13 (costo 100: passando da r2 costerebbe 120). Perché r2 ha due next-hop verso la loopback di r4?",
      },
      {
        id: "failover",
        titolo: "Prova di failover: abbattiamo n12",
        testo: [
          "Spegniamo n12 su <b>entrambe le estremità</b>: con un solo lato down l’altro resta up, e l’adiacenza cade solo allo scadere del dead interval.",
          "Lanciamo i comandi dalla radice del repository, uno alla volta.",
        ],
        comandi: [
          "kathara exec -d labs/lab2/ospf pc_a \"traceroute -n 192.168.20.10\"",
          "kathara exec -d labs/lab2/ospf r1 \"ip link set eth1 down\"",
          "kathara exec -d labs/lab2/ospf r2 \"ip link set eth0 down\"",
          "kathara exec -d labs/lab2/ospf pc_a \"traceroute -n 192.168.20.10\"",
          "kathara exec -d labs/lab2/ospf r1 \"ip link set eth1 up\"",
          "kathara exec -d labs/lab2/ospf r2 \"ip link set eth0 up\"",
        ],
        immagini: [
          { src: "img/l2-prima.png", alt: "Traceroute da pc_a prima del guasto: secondo hop 10.0.0.2", didascalia: "Prima del guasto: secondo hop 10.0.0.2 (r2)" },
          { src: "img/l2-dopo.png", alt: "Traceroute da pc_a con n12 giù: secondo hop 10.0.0.13", didascalia: "Con n12 giù: secondo hop 10.0.0.13 (r4)" },
        ],
        vedere: "Con n12 giù cambia anche l’hop 3: r3 risponde dall’interfaccia su n34 (10.0.0.9) invece che su n23 (10.0.0.6). Al ripristino il traffico torna su r2 dopo circa 10 secondi: il tempo di un hello OSPF.",
      },
      {
        id: "ticket",
        titolo: "Fase 2: il ticket",
        testo: [
          "<b>CR-042 · Attivazione sede C.</b> È pronta la nuova sede C: va collegata al router <b>r4</b>, che ha una porta libera, su una nuova LAN.",
        ],
        topologia: TOPOLOGIA_LAB2_CR,
        tabella: {
          intestazione: ["Elemento", "Valore"],
          righe: [
            ["Dominio di collisione", "lanC"],
            ["Rete della sede C", "192.168.30.0/24"],
            ["r4, nuova eth2", "192.168.30.1/24"],
            ["pc_c, eth0", "192.168.30.10/24 · gw 192.168.30.1"],
            ["Immagine di pc_c", "kathara/base"],
          ],
        },
        vincoliTitolo: "Requisiti",
        vincoli: [
          "La rete della sede C è annunciata in OSPF, <b>area 0</b>.",
          "L’interfaccia di r4 verso la sede C è <b>passiva</b>.",
          "La sede C raggiunge le sedi A e B, e viceversa.",
          "<b>Nessun impatto sul resto della rete</b>: adiacenze, costi e percorsi invariati; il traffico tra A e B passa ancora per r2.",
        ],
        vedere: "<b>Criterio di accettazione</b>: il collaudo con il checker del Lab 2 passa al 100%.",
      },
      {
        id: "applica",
        titolo: "Fase 3: applichiamo il nuovo requisito",
        testo: ["Lavoriamo sempre nella nostra copia, <code>labs/lab2/ospf</code>. Il nuovo requisito tocca <b>quattro file</b>, nessun altro:"],
        lista: [
          "<code>lab.conf</code>: il nuovo dispositivo <code>pc_c</code> sul dominio <code>lanC</code>, e la nuova interfaccia di r4 sullo stesso dominio;",
          "<code>r4.startup</code>: l’indirizzo della nuova interfaccia di r4;",
          "<code>pc_c.startup</code> (nuovo): indirizzo e default route dell’host della sede C;",
          "<code>r4/etc/frr/frr.conf</code>: la nuova LAN in OSPF, come interfaccia passiva.",
        ],
        comandi: ["kathara lrestart -d labs/lab2/ospf"],
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · la sintassi che serve",
            html:
              "<p>In <code>lab.conf</code> le interfacce sono numerate senza buchi: r4 ha già eth0 ed eth1, quindi la nuova è <code>r4[2]</code>.</p><p>Un host vuole un indirizzo e una default route: copiamo lo schema di <code>pc_a.startup</code>.</p><p>In FRR, come per le LAN di r1 e r3: un blocco <code>interface ethX</code> con <code>ip ospf passive</code> e un’istruzione <code>network &lt;rete&gt;/&lt;prefisso&gt; area 0</code> sotto <code>router ospf</code>.</p>",
          },
          {
            titolo: "Suggerimento 2 · le righe da aggiungere su r4",
            html: "<p>Nel <code>frr.conf</code> di r4, prima di <code>router ospf</code> e dentro il blocco:</p>",
            codice: "! LAN della sede C (CR-042)\ninterface eth2\n ip ospf passive\n!\nrouter ospf\n ...\n network 192.168.30.0/24 area 0",
          },
        ],
        problemi: [
          "<b>pc_c non compare</b>: dopo aver modificato <code>lab.conf</code> serve <code>kathara lrestart -d labs/lab2/ospf</code>.",
          "<b>r4 non ha eth2</b>: in <code>lab.conf</code> manca <code>r4[2]=\"lanC\"</code>, o la numerazione salta un numero.",
        ],
      },
      {
        id: "verifica",
        titolo: "Fase 4: verifichiamo il nuovo requisito",
        testo: [
          "Da pc_c, verso la sede A e la sede B. Poi controlliamo la <b>non regressione</b>: da pc_a il traffico verso la sede B deve passare ancora per r2.",
        ],
        comandi: ["kathara connect -d labs/lab2/ospf pc_c", "traceroute -n 192.168.10.10", "traceroute -n 192.168.20.10", "kathara exec -d labs/lab2/ospf pc_a \"traceroute -n 192.168.20.10\""],
        immagini: [{ src: "img/l2-pcc.png", alt: "Traceroute da pc_c: verso la sede A via 10.0.0.14 (r1), verso la sede B via 10.0.0.9 (r3)" }],
        vedere: "Da pc_c si esce da r4 e si va direttamente verso la sede di destinazione: r1 (10.0.0.14) per la A, r3 (10.0.0.9) per la B. Da pc_a il secondo hop verso la B resta 10.0.0.2.",
        problemi: [
          "<b>La sede C è isolata</b>: manca <code>network 192.168.30.0/24 area 0</code> su r4, oppure pc_c non ha la default route.",
          "<b>Su r2 la rete della sede C ha due next-hop</b>: non è un errore, i percorsi via r1 e via r3 costano uguale (ECMP).",
        ],
      },
      {
        id: "checker",
        titolo: "Il collaudo con il checker",
        testo: [
          "Fermiamo il twin: il checker lo avvia da solo. Attende <b>60 secondi</b> la convergenza: non è bloccato.",
          "Verifica il nuovo requisito (pc_c e lanC con i loro indirizzi, eth2 di r4 passiva, la nuova rotta su tutti i router, le tre sedi raggiungibili, i percorsi da pc_c) e la <b>non regressione</b> (adiacenze, costi e punto-punto invariati, tabelle di routing complete, loopback raggiungibili, A↔B ancora via r2).",
          "Trasciniamo qui sotto <code>ospf_result_failed.csv</code> (nella cartella del lab) per vedere gli errori ordinati.",
        ],
        comandi: ["kathara lclean -d labs/lab2/ospf", CHECKER_LAB2],
        vedere: "La soluzione passa 143 test su 143; la produzione così com’è ne passa 120 su 145: falliscono solo i test della sede C.",
        lettoreCsv: true,
        problemi: [
          "<b>eth2 non passiva</b>: OSPF cercherebbe vicini verso gli utenti, e il test sulle interfacce OSPF di r4 fallisce.",
          "<b>Falliscono test che prima passavano</b>: oltre al nuovo requisito è cambiato altro, per esempio un costo. È una regressione: il collaudo serve proprio a scoprirla prima della produzione.",
        ],
      },
    ],
  },
  {
    id: "lab3",
    titolo: "Lab 3",
    sottotitolo: "Il twin diventa codice · 35 minuti",
    passi: [
      {
        id: "primo",
        titolo: "Il nostro primo lab con le API",
        testo: [
          "<code>lab3-api/primo_lab.py</code> ricostruisce da codice la topologia del Lab 1 (pc1 – r1 – r2 – pc2), la avvia, fa un ping da pc1 a pc2 e alla fine la ferma. I dati della topologia sono già scritti nel dizionario <code>DEVICES</code>.",
          "Mancano cinque chiamate alle API, segnate come TODO: ognuna è una chiamata <code>todo(...)</code> da sostituire. Lanciamo lo script dopo ogni modifica: si ferma al primo TODO che manca e ci dice quale.",
        ],
        lista: [
          "crea il dispositivo: <code>lab.new_machine(...)</code>;",
          "collega un’interfaccia a un dominio di collisione: <code>lab.connect_machine_to_link(...)</code>;",
          "scrive il file .startup: <code>lab.create_startup_file_from_list(...)</code>;",
          "avvia il lab: <code>manager.deploy_lab(...)</code>;",
          "esegue il ping da pc1: <code>manager.exec(...)</code>.",
        ],
        comandi: ["python lab3-api/primo_lab.py"],
        immagini: [{ src: "img/l3-primo.png", alt: "Output della soluzione di primo_lab.py: modello pronto, lab avviato, ping da pc1 a pc2 riuscito, lab fermato" }],
        vedere: "Il modello pronto (4 dispositivi e 3 domini, in memoria), il ping riuscito e la riga «pc1 raggiunge pc2!». Lo script ferma il lab da solo, anche in caso di errore.",
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · come leggere i TODO",
            html: "<p>Nel ciclo su <code>DEVICES</code> abbiamo già <code>name</code>, <code>domain</code>, <code>number</code> e la lista <code>startup</code>: sono proprio gli argomenti che servono alle chiamate. La costante <code>IMAGE</code> è l’immagine da usare.</p><p>Le chiamate su <code>lab</code> costruiscono il modello in memoria; quelle su <code>manager</code> agiscono su Docker.</p>",
          },
          {
            titolo: "Suggerimento 2 · gli argomenti delle chiamate",
            html: "<p><code>wait=True</code> aspetta che pc1 abbia finito il suo startup; <code>stream=False</code> restituisce l’output tutto insieme. La soluzione completa è in <code>lab3-api/soluzione/primo_lab.py</code>.</p>",
            codice: "machine = lab.new_machine(name, image=IMAGE)\nlab.connect_machine_to_link(name, domain, machine_iface_number=number)\nlab.create_startup_file_from_list(machine, startup)\nmanager.deploy_lab(lab)\nstdout, _, exit_code = manager.exec(\"pc1\", \"ping -c 3 192.168.2.10\", lab=lab, wait=True, stream=False)",
          },
        ],
      },
      {
        id: "chaos",
        titolo: "Testiamo la nostra rete OSPF",
        testo: [
          "In produzione non possiamo staccare una fibra per vedere cosa succede. Le domande però restano: se cade n12, quanto traffico perdiamo? Dopo quanto passa su r4? E cosa succede quando il link torna? Sul twin facciamo un esperimento: stessi demoni e stesse configurazioni, si rompe a comando, si misura, si ripete.",
          "<code>chaos.py</code> prende la nostra cartella del Lab 2, quella con la sede C, e la riavvia da zero. Aspetta la convergenza (adiacenze OSPF Full, poi tabelle di routing stabili per 5 s), dopo 10 s abbatte n12 su entrambe le estremità e dopo 30 s lo ripristina. Osserva ancora 20 s e fa il conto dei ping inviati e persi. Il twin resta acceso.",
          "Misura con due monitor in parallelo, tutto via exec nei container: un ping al secondo da pc_a verso pc_b (<code>ping -c 1 -W 1</code>) e, ogni mezzo secondo, il next-hop di r1 verso la sede B (<code>ip route get</code>). Con <b>Ctrl+C</b> lo script si ferma e ripristina comunque il link.",
        ],
        comandi: ["python lab3-api/chaos.py"],
        immagini: [{ src: "img/l3-chaos.png", alt: "Output di chaos.py: fasi di avvio del twin, adiacenze Full, guasto su n12, next-hop che passa a 10.0.0.13 e torna a 10.0.0.2" }],
        vedere: "<code>&gt;&gt;&gt;</code> e <code>&lt;&lt;&lt;</code> sono guasto e ripristino; <code>***</code> è il cambio di next-hop. Il tempo di reroute va da <code>&gt;&gt;&gt;</code> a <code>***</code>; i ping persi dicono quanto è durata l’interruzione per gli utenti. Dopo il ripristino, quanto ci mette il traffico a tornare su r2?",
        problemi: [
          "<b>Il nostro Lab 2 non è finito?</b> Copiamo la soluzione in <code>labs/demo/soluzione</code> (<code>mkdir -p labs/demo</code>, poi <code>cp -r lab2-digital-twin/soluzione labs/demo/soluzione</code>) e lanciamo <code>python lab3-api/chaos.py --lab-dir labs/demo/soluzione</code>.",
          "<b>«Nessun lab.conf»</b>: lo script cerca <code>labs/lab2/ospf</code> dalla radice del repository. Indichiamo un’altra cartella con <code>--lab-dir</code>.",
          "<b>Altre opzioni</b>: <code>--link n12|n23|n34|n41</code>, <code>--down S</code>, <code>--wait S</code>, <code>--cycles N</code>, <code>--random</code>, <code>--silent</code>. Elenco completo in <code>lab3-api/README.md</code>.",
        ],
      },
      {
        id: "silent",
        titolo: "Il guasto silenzioso",
        testo: [
          "Il guasto pulito è una fibra staccata o una porta spenta: il link va giù, il kernel lo segnala subito e FRR ricalcola i percorsi.",
          "Con <code>--silent</code> invece il link resta up ma scarta tutto il traffico (<code>tc qdisc add dev eth1 root netem loss 100%</code>), come una fibra degradata o un apparato in mezzo guasto. Nessuno se ne accorge subito: OSPF solo allo scadere del dead interval (40 s). Per questo il guasto dura 60 s.",
        ],
        comandi: ["python lab3-api/chaos.py --silent"],
        vedere: "Circa 35-40 secondi di ping persi prima che il next-hop passi a r4. Con il guasto pulito il reroute arriva in pochi decimi di secondo, con al massimo un ping perso. I valori esatti cambiano da PC a PC.",
      },
      {
        id: "domande",
        titolo: "Domande guida e pulizia",
        lista: [
          "Con il guasto pulito, quanti ping si perdono? Perché così pochi?",
          "Dopo il ripristino, perché il traffico torna su r2 solo dopo circa 10 secondi?",
          "Perché il guasto silenzioso è così lento? E se dura 20 secondi, meno del dead interval (<code>python lab3-api/chaos.py --silent --down 20</code>)?",
          "Abbattiamo n41 (<code>python lab3-api/chaos.py --link n41</code>): cambia qualcosa nella timeline? Perché?",
          "Quali altri test automatizzereste sul twin prima di ogni change?",
        ],
        comandi: ["kathara lclean -d labs/lab2/ospf"],
        vedere: "Alla fine fermiamo il twin con il comando qui sopra. Per approfondire: <code>lab3-api/build_twin.py</code> costruisce la rete di produzione generando le configurazioni FRR dai dati (vedi il README del Lab 3). Per casa: come risolvere il guasto silenzioso con BFD, nella scheda <b>Extra · BFD</b>.",
      },
    ],
  },
  {
    id: "extra-bfd",
    titolo: "Extra · BFD",
    sottotitolo: "Dopo il Lab 3: BFD nella rete OSPF · per casa",
    passi: [
      {
        id: "bfd",
        titolo: "BFD nella rete OSPF",
        testo: [
          "<b>Facoltativo</b>, da fare a casa (o in aula, se avanza tempo). Come risolviamo il problema del guasto silenzioso? Su alcune fibre un guasto lascia l’interfaccia up ma il traffico non passa: OSPF se ne accorge solo allo scadere del dead interval, <b>40 secondi di traffico perso</b>.",
          "<b>BFD</b> (Bidirectional Forwarding Detection, RFC 5880) è una sessione di hello leggeri tra due vicini, che non trasporta informazioni di routing. Con i default di FRR ogni peer manda un pacchetto ogni 300 ms; se ne mancano 3 consecutivi il link è dichiarato giù, in meno di un secondo. BFD avvisa subito OSPF, che riconverge senza aspettare il dead interval.",
          "La change request: abilitare BFD su tutti i link di backbone, associato a OSPF, con i timer di default. La applichiamo alla nostra copia <code>labs/lab2/ospf</code>, quella con la sede C.",
        ],
        lista: [
          "<code>bfdd=yes</code> (e le sue opzioni) nel file <code>daemons</code> di ogni router;",
          "<code>ip ospf bfd</code> sulle interfacce di backbone, cioè quelle point-to-point con un vicino OSPF (non sulle LAN di sede, che sono passive);",
          "riavviamo il twin con <code>kathara lrestart -d labs/lab2/ospf</code> e controlliamo <code>show bfd peers</code> in vtysh: tutte le sessioni <b>up</b>;",
          "collaudiamo con il checker dedicato, dalla radice del repository e con il lab fermo;",
          "rilanciamo <code>chaos.py --silent</code> e confrontiamo i tempi con quelli senza BFD.",
        ],
        esempio: {
          titolo: "r1/etc/frr/frr.conf (estratto)",
          codice: "interface eth1\n ip ospf network point-to-point\n ip ospf bfd\n ip ospf cost 10\n!\ninterface eth2\n ip ospf network point-to-point\n ip ospf bfd\n ip ospf cost 100",
        },
        esempio2: { titolo: "r1/etc/frr/daemons (estratto)", codice: "zebra=yes\nospfd=yes\nbfdd=yes\nvtysh_enable=yes\n...\nbfdd_options=\"   -A 127.0.0.1\"" },
        comandi: ["kathara lclean -d labs/lab2/ospf", CHECKER_BFD, "python lab3-api/chaos.py --silent"],
        vedere: "Con BFD il next-hop cambia in meno di un secondo e non si perdono ping, contro i 35-40 secondi senza BFD. Domanda: quali sono i timer BFD di default (<code>show bfd peers</code>)? Che costo hanno in produzione?",
        problemi: [
          "<b>Vogliamo solo vedere l’effetto?</b> La soluzione con BFD è in <code>lab2-digital-twin/soluzione-bfd</code>: copiamola con <code>mkdir -p labs/demo</code> e <code>cp -r lab2-digital-twin/soluzione-bfd labs/demo/</code>, poi lanciamo <code>python lab3-api/chaos.py --lab-dir labs/demo/soluzione-bfd --silent</code>.",
        ],
      },
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = { GUIDA };
}
