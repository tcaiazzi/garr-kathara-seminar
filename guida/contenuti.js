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
  <text class="t-name" x="75" y="76">pca</text>
  <text class="t-sub" x="75" y="96">192.168.10.10</text>
  <text class="t-name t-on-router" x="305" y="76">r1</text>
  <text class="t-sub t-on-router" x="305" y="96">lo 10.255.0.1</text>
  <text class="t-name t-on-router" x="615" y="76">r2</text>
  <text class="t-sub t-on-router" x="615" y="96">lo 10.255.0.2</text>
  <text class="t-name t-on-router" x="305" y="336">r4</text>
  <text class="t-sub t-on-router" x="305" y="356">lo 10.255.0.4</text>
  <text class="t-name t-on-router" x="615" y="336">r3</text>
  <text class="t-sub t-on-router" x="615" y="356">lo 10.255.0.3</text>
  <text class="t-name" x="835" y="336">pcb</text>
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
  <text class="t-name" x="305" y="496">pcc</text>
  <text class="t-sub" x="305" y="516">192.168.30.10</text>
  <text class="t-cr-text t-start" x="318" y="410">lanC · CR-042</text>
  <text class="t-subnet t-start" x="318" y="430">192.168.30.0/24</text>
  <text class="t-site" x="305" y="550">SEDE C (NUOVA)</text>
</svg>`);

// Lab 1, esercizio extra: due VLAN tra le sedi, trunk su n12
const TOPOLOGIA_LAB1_VLAN = `
<svg viewBox="0 0 900 290" role="img" aria-label="Lab 1 con le VLAN: pc1 (VLAN 101) e pc4 (VLAN 100) su lanA verso r1; pc2 (VLAN 100) e pc3 (VLAN 101) su lanB verso r2; trunk 802.1Q con le VLAN 100 e 101 sul link n12 tra r1 e r2">
  <line class="t-link" x1="200" y1="58" x2="200" y2="218"/>
  <line class="t-link" x1="160" y1="58" x2="200" y2="58"/>
  <line class="t-link" x1="160" y1="218" x2="200" y2="218"/>
  <line class="t-link" x1="200" y1="138" x2="280" y2="138"/>
  <line class="t-link" x1="700" y1="58" x2="700" y2="218"/>
  <line class="t-link" x1="700" y1="58" x2="740" y2="58"/>
  <line class="t-link" x1="700" y1="218" x2="740" y2="218"/>
  <line class="t-link" x1="620" y1="138" x2="700" y2="138"/>
  <line class="t-trunk" x1="400" y1="138" x2="500" y2="138"/>
  <rect class="t-host t-v101-box" x="40" y="30" width="120" height="56" rx="10"/>
  <rect class="t-host t-v100-box" x="40" y="190" width="120" height="56" rx="10"/>
  <rect class="t-router" x="280" y="110" width="120" height="56" rx="10"/>
  <rect class="t-router" x="500" y="110" width="120" height="56" rx="10"/>
  <rect class="t-host t-v100-box" x="740" y="30" width="120" height="56" rx="10"/>
  <rect class="t-host t-v101-box" x="740" y="190" width="120" height="56" rx="10"/>
  <text class="t-name" x="100" y="56">pc1</text>
  <text class="t-v101-text" x="100" y="76">VLAN 101</text>
  <text class="t-name" x="100" y="216">pc4</text>
  <text class="t-v100-text" x="100" y="236">VLAN 100</text>
  <text class="t-name t-on-router" x="340" y="144">r1</text>
  <text class="t-name t-on-router" x="560" y="144">r2</text>
  <text class="t-name" x="800" y="56">pc2</text>
  <text class="t-v100-text" x="800" y="76">VLAN 100</text>
  <text class="t-name" x="800" y="216">pc3</text>
  <text class="t-v101-text" x="800" y="236">VLAN 101</text>
  <text class="t-domain" x="200" y="270">lanA</text>
  <text class="t-domain" x="700" y="270">lanB</text>
  <text class="t-domain" x="450" y="122">n12 · trunk</text>
  <text class="t-subnet" x="450" y="162">VLAN 100 + 101</text>
</svg>`;

const CHECKER_LAB1 = "python -m kathara_lab_checker --config lab1-statico/checker/correction.yaml --lab labs/lab1/mio-lab1 --no-cache --report-type csv";
const CHECKER_VLAN = "python -m kathara_lab_checker --config lab1-statico/extra-vlan/checker/correction.yaml --lab labs/lab1/mio-lab1-vlan --no-cache --report-type csv";
const CHECKER_LAB2 = "python -m kathara_lab_checker --config lab2-digital-twin/checker/correction.yaml --lab labs/lab2/mio-lab2 --no-cache --report-type csv";
const CHECKER_BFD = "python -m kathara_lab_checker --config lab2-digital-twin/checker/correction-bfd.yaml --lab labs/lab2/mio-lab2 --no-cache --report-type csv";

const GUIDA = [
  {
    id: "prep",
    titolo: "Preparazione",
    sottotitolo: "Tre controlli prima di iniziare",
    passi: [
      {
        id: "venv",
        titolo: "Attivate il virtualenv",
        testo: [
          "Aprite un terminale nella <b>radice del repository</b>: tutti i comandi della guida partono da lì.",
          "Attivate il virtualenv del seminario. Va fatto in ogni nuovo terminale.",
        ],
        comandi: [{ unix: "source .venv/bin/activate", windows: ".venv\\Scripts\\Activate.ps1" }],
        problemi: [
          "<b>Il virtualenv non esiste?</b> Seguite setup/INSTALL.md: <code>python3 -m venv .venv</code>, poi <code>python -m pip install -r requirements.txt</code>.",
        ],
      },
      {
        id: "verifica",
        titolo: "Verificate il PC",
        testo: ["Lo script controlla Python, i pacchetti, Docker, le immagini e avvia un mini-lab di prova."],
        comandi: ["python setup/verifica.py"],
        vedere: "L’ultima riga deve essere «Tutto pronto per il seminario!». Accanto a ogni KO c’è l’indicazione per correggerlo.",
        problemi: [
          "<b>Docker in esecuzione: KO</b>: avviate Docker Desktop (o il servizio docker su Linux) e rilanciate.",
          "<b>Immagine non scaricata</b>: <code>docker pull kathara/base</code> e <code>docker pull kathara/frr</code>.",
          "<b>kathara-lab-checker non installato</b>: il virtualenv non è attivo.",
        ],
      },
      {
        id: "labs",
        titolo: "Create la cartella di lavoro",
        testo: ["Qui vivranno i vostri lab: <code>labs/lab1/…</code> e <code>labs/lab2/…</code>."],
        comandi: ["mkdir labs"],
      },
    ],
  },
  {
    id: "lab1",
    titolo: "Lab 1",
    sottotitolo: "Rotte statiche · 25 minuti",
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
        problemi: ["Usate <b>esattamente</b> i nomi della tabella: il checker confronta dispositivi e domini uno a uno."],
      },
      {
        id: "cartella",
        titolo: "Create la cartella del lab",
        testo: ["Dalla radice del repository create la cartella del vostro lab ed entrateci."],
        comandi: [
          { unix: "mkdir -p labs/lab1/mio-lab1", windows: "New-Item -ItemType Directory -Force labs\\lab1\\mio-lab1" },
          { unix: "cd labs/lab1/mio-lab1", windows: "cd labs\\lab1\\mio-lab1" },
        ],
      },
      {
        id: "labconf",
        titolo: "Scrivete lab.conf",
        testo: [
          "Con un editor, create <code>lab.conf</code>: una riga per interfaccia nel formato <code>nome[numero]=\"dominio\"</code>, più l’immagine di ogni dispositivo.",
          "Il numero tra parentesi quadre è quello dell’interfaccia: <code>r1[1]=\"n12\"</code> significa eth1 di r1 sul dominio n12.",
        ],
        esempio: { titolo: "lab.conf (estratto)", codice: "r1[0]=\"lanA\"\nr1[1]=\"n12\"\nr1[image]=\"kathara/base\"" },
        problemi: [
          "<b>Maiuscole nei nomi dei dispositivi</b>: Kathará non le accetta, e lstart segnala un errore in lab.conf.",
          "<b>Interfacce con buchi</b>: r1[0], r1[1], …: la numerazione parte da 0 e non salta numeri.",
        ],
      },
      {
        id: "startup",
        titolo: "Scrivete i file .startup",
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
        titolo: "Avviate il lab",
        testo: [
          "Dalla cartella del lab. <code>kathara lstart</code> apre anche un terminale per ogni dispositivo.",
          "Con <code>kathara linfo --topology</code> controllate il cablaggio: ogni dominio con i suoi dispositivi.",
        ],
        comandi: ["kathara lstart", "kathara linfo --topology"],
        immagini: [{ src: "img/l1-avvio.png", alt: "Output di kathara lstart con le barre 3/3 e 4/4 e di kathara linfo --topology" }],
        vedere: "Le barre arrivano a 3/3 e 4/4: tutti i domini e tutti i dispositivi sono partiti.",
        problemi: [
          "<b>Modifiche nei container</b>: quello che digitate in un terminale sparisce al riavvio. Correggete i file .startup e usate <code>kathara lrestart</code>.",
        ],
      },
      {
        id: "prova",
        titolo: "Provate da pc1",
        testo: ["Aprite una shell su pc1 (se il terminale non è già aperto) e lanciate i tre comandi."],
        comandi: ["kathara connect pc1", "ping -c 3 192.168.2.10", "traceroute -n 192.168.2.10", "ip route"],
        immagini: [{ src: "img/l1-pc1.png", alt: "Sessione su pc1: ping riuscito, traceroute via 192.168.1.1 e 10.0.12.2, ip route" }],
        vedere: "0% packet loss; il traceroute passa da r1 (192.168.1.1) e da r2 (10.0.12.2).",
        problemi: [
          "<b>Il traceroute si ferma dopo il primo hop</b>: manca la rotta su r1.",
          "<b>Il traceroute arriva a pc2 ma il ping fallisce</b>: manca la rotta di ritorno su r2.",
          "<b>Comando al volo senza aprire una shell</b>: <code>kathara exec pc1 \"ping -c 3 192.168.2.10\"</code>, con il comando <b>tra virgolette</b>.",
        ],
      },
      {
        id: "checker",
        titolo: "Controllate con il checker",
        testo: [
          "Il checker <b>avvia il lab da solo</b>: prima fermate il vostro, poi tornate alla radice del repository.",
          "L’opzione <code>--no-cache</code> rifà il controllo anche se esiste già un report: senza, il checker salta il lab.",
        ],
        comandi: ["kathara lclean", { unix: "cd ../../..", windows: "cd ..\\..\\.." }, CHECKER_LAB1],
        immagini: [{ src: "img/l1-checker.png", alt: "Output del checker su un lab con un errore: test falliti in rosso e Passed Tests: 40/49" }],
        vedere: "In fondo, <b>Passed Tests: N/M</b>. La soluzione completa passa 48 test su 48. Nell’esempio c’è un errore voluto: su r2 manca la rotta di ritorno.",
        problemi: ["<b>«Network scenario already processed, skipping»</b>: avete dimenticato <code>--no-cache</code>."],
      },
      {
        id: "report",
        titolo: "Leggete il report e correggete",
        testo: [
          "Nella cartella del lab trovate <code>mio-lab1_result_failed.csv</code>: solo i test falliti, con il motivo. Partite da lì.",
          "Trascinatelo qui sotto per vederlo ordinato per tipo di errore. Correggete, rilanciate il checker, ripetete finché tutti i test passano.",
        ],
        immagini: [{ src: "img/l1-report.png", alt: "Contenuto di mio-lab1_result_failed.csv" }],
        lettoreCsv: true,
      },
      {
        id: "vlan",
        titolo: "Extra: due VLAN tra le sedi",
        testo: [
          "<b>Facoltativo</b>, per chi ha finito o da fare a casa. Arrivano due computer: <b>pc4</b> nella LAN di pc1 e <b>pc3</b> nella LAN di pc2.",
          "La <b>VLAN 100</b> unisce i computer pari (pc2, pc4), la <b>VLAN 101</b> i dispari (pc1, pc3). Ogni VLAN attraversa le sedi su un <b>trunk</b> 802.1Q sul link n12; su r1 e r2 un bridge per VLAN unisce la LAN e il trunk. Il routing statico del Lab 1 resta com’è.",
        ],
        topologia: TOPOLOGIA_LAB1_VLAN,
        tabella: {
          intestazione: ["Dispositivo", "Interfaccia", "Dominio", "VLAN", "Indirizzo"],
          righe: [
            ["pc1", "eth0.101", "lanA", "101", "10.101.0.1/24"],
            ["pc4", "eth0.100", "lanA", "100", "10.100.0.4/24"],
            ["pc2", "eth0.100", "lanB", "100", "10.100.0.2/24"],
            ["pc3", "eth0.101", "lanB", "101", "10.101.0.3/24"],
          ],
        },
        comandi: [
          { unix: "cp -r labs/lab1/mio-lab1 labs/lab1/mio-lab1-vlan", windows: "Copy-Item -Recurse labs\\lab1\\mio-lab1 labs\\lab1\\mio-lab1-vlan" },
          { unix: "cd labs/lab1/mio-lab1-vlan", windows: "cd labs\\lab1\\mio-lab1-vlan" },
        ],
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · la VLAN su un host",
            html: "<p>Una sottointerfaccia 802.1Q per host. Nasce spenta: va portata su a mano. pc3 e pc4 non hanno gateway.</p>",
            codice: "ip link add link eth0 name eth0.101 type vlan id 101\nip address add 10.101.0.1/24 dev eth0.101\nip link set eth0.101 up",
          },
          {
            titolo: "Suggerimento 2 · il bridge su un router",
            html: "<p>Per ogni VLAN: una sottointerfaccia verso la LAN, una verso il trunk e un bridge senza indirizzi che le unisce. Su r1 il trunk è eth1, su r2 è eth0.</p>",
            codice: "ip link add link eth0 name eth0.100 type vlan id 100\nip link add link eth1 name eth1.100 type vlan id 100\nip link add br100 type bridge\nip link set eth0.100 master br100\nip link set eth1.100 master br100\nip link set eth0.100 up\nip link set eth1.100 up\nip link set br100 up",
          },
        ],
        problemi: [
          "<b>pc3 o pc4 non compaiono</b>: dopo aver modificato <code>lab.conf</code> serve <code>kathara lrestart</code>.",
          "<b>La sottointerfaccia non risponde</b>: è rimasta spenta, anche il bridge va portato su.",
        ],
      },
      {
        id: "vlan-verifica",
        titolo: "Extra: verificate le VLAN",
        testo: [
          "I ping dentro ogni VLAN devono passare tra le sedi, e il Lab 1 deve funzionare ancora.",
          "I domini di Kathará sono hub: pc4 riceve fisicamente anche i frame della VLAN 101. Con un ping da pc1 a pc3 in corso, su pc4 confrontate <code>tcpdump -e -n -i eth0 icmp</code> e <code>tcpdump -n -i eth0.100 icmp</code>.",
        ],
        comandi: [
          "kathara exec pc1 \"ping -c 3 10.101.0.3\"",
          "kathara exec pc4 \"ping -c 3 10.100.0.2\"",
          "kathara exec pc1 \"ping -c 3 192.168.2.10\"",
          "kathara lclean",
          { unix: "cd ../../..", windows: "cd ..\\..\\.." },
          CHECKER_VLAN,
        ],
        immagini: [{ src: "img/l1x-tcpdump.png", alt: "tcpdump su pc4: su eth0 si vedono i frame taggati vlan 101 tra 10.101.0.1 e 10.101.0.3; su eth0.100 nessun pacchetto" }],
        vedere: "Su <code>eth0</code> pc4 vede i frame taggati <b>vlan 101</b>; su <code>eth0.100</code> nessun pacchetto: è il tag 802.1Q a separare le reti logiche. La soluzione passa tutti i test; è in <code>lab1-statico/extra-vlan/soluzione/</code>.",
        lettoreCsv: true,
        problemi: [
          "<b>Il ping dentro la VLAN non passa</b>: VLAN id diverso tra host e router, o sottointerfaccia non agganciata al bridge.",
          "<b>Funziona solo da una parte</b>: le VLAN vanno configurate sia su r1 sia su r2, verso la LAN e verso n12.",
        ],
      },
    ],
  },
  {
    id: "lab2",
    titolo: "Lab 2",
    sottotitolo: "Digital twin: una change request · 50 minuti",
    passi: [
      {
        id: "scheda",
        titolo: "La rete di produzione",
        testo: [
          "Due sedi collegate da un backbone di quattro router ad anello, <b>in esercizio con OSPF</b>. Il team di rete deve attivare una terza sede: prima di toccare la produzione, la change si prova sul gemello digitale.",
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
          "<b>OSPF in area 0</b> su tutti i router; annunciate backbone, loopback e LAN di sede.",
          "<b>LAN di sede passive</b>: nessuna adiacenza verso gli utenti.",
          "<b>Tra le sedi si passa per r2</b>; r4 è il backup. Costo 10 su n12 e n23, costo 100 su n34 e n41.",
          "<b>Ogni router raggiunge le loopback</b> di tutti gli altri.",
          "<b>Link di backbone punto-punto</b>: niente elezione DR/BDR.",
        ],
      },
      {
        id: "produzione",
        titolo: "Avviate il twin di produzione",
        testo: [
          "La cartella <code>produzione/</code> contiene la rete in esercizio, già configurata. Copiatela nella vostra cartella di lavoro e avviatela: da qui in poi lavorate sempre sulla vostra copia.",
        ],
        comandi: [
          { unix: "mkdir -p labs/lab2", windows: "New-Item -ItemType Directory -Force labs\\lab2" },
          { unix: "cp -r lab2-digital-twin/produzione labs/lab2/mio-lab2", windows: "Copy-Item -Recurse lab2-digital-twin\\produzione labs\\lab2\\mio-lab2" },
          { unix: "cd labs/lab2/mio-lab2", windows: "cd labs\\lab2\\mio-lab2" },
          "kathara lstart",
        ],
      },
      {
        id: "adiacenze",
        titolo: "Esplorate: le adiacenze",
        testo: ["Su un router, <code>vtysh</code> apre la CLI di FRR (il prompt diventa <code>r1#</code>)."],
        comandi: ["kathara connect r1", "vtysh", "show ip ospf neighbor", "show ip ospf interface"],
        immagini: [{ src: "img/l2-neighbor.png", alt: "r1 in vtysh: show ip ospf neighbor con 10.255.0.2 e 10.255.0.4 in stato Full/-" }],
        vedere: "Due vicini per router, tutti <b>Full/-</b>. Il Neighbor ID è il router-id, cioè la loopback del vicino.",
      },
      {
        id: "rotte",
        titolo: "Esplorate: le rotte",
        testo: ["Sempre in vtysh su r1. <code>O&gt;*</code> indica una rotta OSPF installata; tra parentesi quadre ci sono distanza amministrativa e costo."],
        comandi: ["show ip route ospf"],
        immagini: [{ src: "img/l2-route.png", alt: "r1: show ip route ospf con la sede B via 10.0.0.2 e la loopback di r4 via 10.0.0.13" }],
        vedere: "192.168.20.0/24 via <b>10.0.0.2</b> (costo 30, passando da r2); la loopback di r4 via 10.0.0.13 (costo 100). Perché r2 ha due next-hop verso la loopback di r4?",
      },
      {
        id: "failover",
        titolo: "Esplorate: il failover",
        testo: [
          "Abbattete n12 spegnendo <b>entrambe le estremità</b>: un dominio di collisione è uno switch virtuale, se spegnete un solo lato l’altro non se ne accorge.",
          "Lanciate i comandi dalla cartella del lab, uno alla volta.",
        ],
        comandi: [
          "kathara exec pca \"traceroute -n 192.168.20.10\"",
          "kathara exec r1 \"ip link set eth1 down\"",
          "kathara exec r2 \"ip link set eth0 down\"",
          "kathara exec pca \"traceroute -n 192.168.20.10\"",
          "kathara exec r1 \"ip link set eth1 up\"",
          "kathara exec r2 \"ip link set eth0 up\"",
        ],
        immagini: [
          { src: "img/l2-prima.png", alt: "Traceroute da pca prima del guasto: secondo hop 10.0.0.2", didascalia: "Prima del guasto: secondo hop 10.0.0.2 (r2)" },
          { src: "img/l2-dopo.png", alt: "Traceroute da pca con n12 giù: secondo hop 10.0.0.13", didascalia: "Con n12 giù: secondo hop 10.0.0.13 (r4)" },
        ],
        vedere: "Al ripristino il traffico torna su r2 dopo circa 10 secondi: il tempo di un hello OSPF.",
      },
      {
        id: "ticket",
        titolo: "Il ticket CR-042",
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
            ["pcc, eth0", "192.168.30.10/24 · gw 192.168.30.1"],
            ["Immagine di pcc", "kathara/base"],
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
        titolo: "Applicate la change",
        testo: ["Lavorate nella vostra copia, <code>labs/lab2/mio-lab2</code>. La change tocca <b>quattro file</b>:"],
        lista: [
          "<code>lab.conf</code>: il nuovo dispositivo <code>pcc</code> sul dominio <code>lanC</code>, e la nuova interfaccia di r4 sullo stesso dominio;",
          "<code>r4.startup</code>: l’indirizzo della nuova interfaccia di r4;",
          "<code>pcc.startup</code> (nuovo): indirizzo e default route dell’host della sede C;",
          "<code>r4/etc/frr/frr.conf</code>: la nuova LAN in OSPF, come interfaccia passiva.",
        ],
        comandi: ["kathara lrestart"],
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · la sintassi che serve",
            html:
              "<p>In <code>lab.conf</code> le interfacce sono numerate senza buchi: r4 ha già eth0 ed eth1, quindi la nuova è <code>r4[2]</code>.</p><p>Un host ha bisogno di un indirizzo e di una default route, come pca e pcb: guardate i loro file <code>.startup</code>.</p><p>In FRR, come per le LAN di r1 e r3: un blocco <code>interface ethX</code> con <code>ip ospf passive</code> e un’istruzione <code>network &lt;rete&gt;/&lt;prefisso&gt; area 0</code> sotto <code>router ospf</code>.</p>",
          },
          {
            titolo: "Suggerimento 2 · le righe da aggiungere su r4",
            html: "<p>Nel <code>frr.conf</code> di r4, prima di <code>router ospf</code> e dentro il blocco:</p>",
            codice: "! LAN della sede C (CR-042): annunciata ma passiva\ninterface eth2\n ip ospf passive\n!\nrouter ospf\n ...\n network 192.168.30.0/24 area 0",
          },
        ],
        problemi: [
          "<b>pcc non compare</b>: il lab non è stato riavviato dopo la modifica a <code>lab.conf</code> (<code>kathara lrestart</code>).",
          "<b>r4 non ha eth2</b>: in <code>lab.conf</code> manca <code>r4[2]=\"lanC\"</code>, o la numerazione salta un numero.",
        ],
      },
      {
        id: "verifica",
        titolo: "Verificate la change",
        testo: [
          "Da pcc, verso la sede A e la sede B. Poi controllate la <b>non regressione</b>: da pca il traffico verso la sede B deve passare ancora per r2.",
        ],
        comandi: ["kathara connect pcc", "traceroute -n 192.168.10.10", "traceroute -n 192.168.20.10", "kathara exec pca \"traceroute -n 192.168.20.10\""],
        immagini: [{ src: "img/l2-pcc.png", alt: "Traceroute da pcc: verso la sede A via 10.0.0.14 (r1), verso la sede B via 10.0.0.9 (r3)" }],
        vedere: "Da pcc si esce da r4 e si va direttamente verso la sede di destinazione: r1 (10.0.0.14) per la A, r3 (10.0.0.9) per la B. Da pca il secondo hop verso la B resta 10.0.0.2.",
        problemi: [
          "<b>La sede C non raggiunge A e B</b>: manca <code>network 192.168.30.0/24 area 0</code> su r4, oppure pcc non ha la default route.",
          "<b>Su r2 la rete della sede C ha due next-hop</b>: non è un errore, i percorsi via r1 e via r3 costano uguale (ECMP).",
        ],
      },
      {
        id: "checker",
        titolo: "Collaudo con il checker",
        testo: [
          "Fermate il twin e tornate alla radice del repository. Il checker attende <b>60 secondi</b> la convergenza: non è bloccato.",
          "Verifica la change (pcc e lanC, eth2 di r4 passiva, la nuova rotta su tutti i router, la raggiungibilità tra le tre sedi) e la <b>non regressione</b> (adiacenze, costi, tabelle di routing, A↔B via r2). La soluzione passa tutti i test.",
          "Trascinate qui sotto <code>mio-lab2_result_failed.csv</code> (nella cartella del lab) per vedere gli errori ordinati.",
        ],
        comandi: ["kathara lclean", { unix: "cd ../../..", windows: "cd ..\\..\\.." }, CHECKER_LAB2],
        lettoreCsv: true,
        problemi: [
          "<b>Il test sulle interfacce OSPF di r4 fallisce</b>: eth2 non è passiva.",
          "<b>Falliscono test che prima passavano</b>: la change ha toccato altro, per esempio un costo. Il collaudo serve proprio a scoprirlo prima della produzione.",
        ],
      },
      {
        id: "bfd",
        titolo: "Bonus: change request BFD",
        testo: [
          "Su alcune fibre un guasto lascia l’interfaccia up ma il traffico non passa: OSPF se ne accorge solo dopo il dead interval, <b>40 secondi di traffico perso</b>.",
          "La change request: abilitare <b>BFD</b> su tutti i link di backbone, associato a OSPF, con i timer di default. Si applica sulla rete che include già la sede C.",
        ],
        lista: [
          "<code>bfdd=yes</code> nel file daemons di ogni router;",
          "<code>ip ospf bfd</code> sulle interfacce di backbone (non sulle LAN di sede);",
          "<code>show bfd peers</code> in vtysh: tutte le sessioni <b>up</b>;",
          "collaudate con il checker dedicato (comando sotto, dalla radice del repository, con il lab fermo).",
        ],
        comandi: [CHECKER_BFD],
        vedere: "Nel Lab 3 misuriamo l’effetto di questa modifica sul twin.",
      },
    ],
  },
  {
    id: "lab3",
    titolo: "Lab 3",
    sottotitolo: "Il twin con le API · 35 minuti",
    passi: [
      {
        id: "primo",
        titolo: "Il vostro primo lab con le API",
        testo: [
          "<code>lab3-api/primo_lab.py</code> ricostruisce da codice la topologia del Lab 1 (pc1 – r1 – r2 – pc2), la avvia, fa un ping da pc1 a pc2 e alla fine la ferma. I dati della topologia sono già scritti nel dizionario <code>DEVICES</code>.",
          "Mancano cinque chiamate alle API, segnate come TODO: ognuna è una chiamata <code>todo(...)</code> da sostituire. Lanciate lo script dopo ogni modifica: si ferma al primo TODO che manca e vi dice quale.",
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
        vedere: "Il ping riuscito e la riga «pc1 raggiunge pc2!». Lo script ferma il lab da solo, anche in caso di errore.",
        suggerimenti: [
          {
            titolo: "Suggerimento 1 · come leggere i TODO",
            html: "<p>Nel ciclo su <code>DEVICES</code> avete già <code>name</code>, <code>domain</code>, <code>number</code> e la lista <code>startup</code>: sono proprio gli argomenti che servono alle chiamate. La costante <code>IMAGE</code> è l’immagine da usare.</p><p>Le chiamate su <code>lab</code> costruiscono il modello in memoria; quelle su <code>manager</code> agiscono su Docker.</p>",
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
        titolo: "Rompete il vostro twin",
        testo: [
          "<code>chaos.py</code> prende la vostra cartella del Lab 2, quella con la sede C: la avvia (se è già accesa la ferma e la riavvia), attende la convergenza OSPF mostrando le adiacenze che salgono, poi misura il traffico pca → pcb e il next-hop di r1 mentre abbatte n12 per 30 secondi.",
          "Con <b>Ctrl+C</b> lo script si ferma e ripristina comunque il link.",
        ],
        comandi: ["python lab3-api/chaos.py"],
        immagini: [{ src: "img/l3-chaos.png", alt: "Output di chaos.py: fasi di avvio del twin, adiacenze Full, guasto su n12, next-hop che passa a 10.0.0.13 e torna a 10.0.0.2" }],
        vedere: "<code>&gt;&gt;&gt;</code> e <code>&lt;&lt;&lt;</code> sono guasto e ripristino; <code>***</code> è il cambio di next-hop. Quanti ping si perdono? Dopo il ripristino, quanto ci mette il traffico a tornare su r2?",
        problemi: [
          "<b>Il vostro Lab 2 non è finito?</b> Copiate la soluzione in <code>labs/demo/soluzione</code> e lanciate <code>python lab3-api/chaos.py --lab-dir labs/demo/soluzione</code>.",
          "<b>«Nessun lab.conf»</b>: lo script cerca <code>labs/lab2/mio-lab2</code> dalla radice del repository. Indicate un’altra cartella con <code>--lab-dir</code>.",
        ],
      },
      {
        id: "silent",
        titolo: "Il guasto silenzioso",
        testo: [
          "Con <code>--silent</code> il link resta up ma scarta tutto il traffico (<code>tc netem loss 100%</code>), come una fibra degradata. OSPF se ne accorge solo allo scadere del dead interval.",
        ],
        comandi: ["python lab3-api/chaos.py --silent"],
        vedere: "Circa 35-40 secondi di ping persi prima che il next-hop passi a r4.",
      },
      {
        id: "bfd",
        titolo: "Lo stesso guasto, con BFD",
        testo: [
          "Lo mostra il relatore: il guasto silenzioso sulla soluzione senza BFD e su quella con BFD. Si lavora su copie in <code>labs/demo/</code>, perché avviando un lab Kathará crea file nella sua cartella.",
        ],
        comandi: [
          { unix: "mkdir -p labs/demo", windows: "New-Item -ItemType Directory -Force labs\\demo" },
          { unix: "cp -r lab2-digital-twin/soluzione lab2-digital-twin/soluzione-bfd labs/demo/", windows: "Copy-Item -Recurse lab2-digital-twin\\soluzione, lab2-digital-twin\\soluzione-bfd labs\\demo" },
          "python lab3-api/chaos.py --lab-dir labs/demo/soluzione --silent",
          "python lab3-api/chaos.py --lab-dir labs/demo/soluzione-bfd --silent",
        ],
        vedere: "Senza BFD: circa 35-40 secondi di ping persi. Con BFD il next-hop cambia in meno di un secondo e non si perdono ping.",
      },
      {
        id: "domande",
        titolo: "Domande guida e pulizia",
        lista: [
          "Nel primo script, perché serve <code>wait=True</code> nell’exec del ping?",
          "Con il guasto pulito, quanti ping si perdono? Perché così pochi?",
          "Dopo il ripristino, perché il traffico torna su r2 solo dopo circa 10 secondi?",
          "Perché il guasto silenzioso è così lento? E se dura 20 secondi (<code>python lab3-api/chaos.py --silent --down 20</code>)?",
          "Quali sono i timer BFD di default (<code>show bfd peers</code>)? Che costo hanno in produzione?",
          "Abbattete n41 (<code>python lab3-api/chaos.py --link n41</code>): cambia qualcosa? Perché?",
          "Quali altri test automatizzereste sul twin prima di ogni change?",
        ],
        comandi: ["kathara lclean -d labs/lab2/mio-lab2"],
        vedere: "Alla fine fermate il twin con il comando qui sopra. Per approfondire: <code>lab3-api/build_twin.py</code> costruisce la rete di produzione generando le configurazioni FRR dai dati (vedi il README del Lab 3).",
      },
    ],
  },
];

if (typeof module !== "undefined") {
  module.exports = { GUIDA };
}
