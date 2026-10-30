# Lab 3 — Il twin diventa codice (35 minuti)

Nei primi due lab il twin era una cartella di file, gestita a mano con `kathara lstart`. Qui passiamo al **codice Python**: prima scriviamo il nostro primo lab con le API di Kathará, poi usiamo uno script che avvia il *nostro* twin del Lab 2 e lo rompe, apposta, per misurare l'effetto sul traffico.

| Parte | Tempo |
|---|---|
| A · Il nostro primo lab con le API | 15' |
| B · Testiamo la nostra rete OSPF | 20' |
| Extra per casa · BFD sul backbone | — |

## Prerequisiti

Virtualenv del seminario attivo e pacchetti installati (vedi [setup/INSTALL.md](../setup/INSTALL.md)). Tutti i comandi si lanciano **dalla radice del repository**.

---

## Parte A — Il nostro primo lab con le API

`primo_lab.py` ricostruisce da codice la topologia del Lab 1 (pc1 – r1 – r2 – pc2), la avvia, fa un ping da pc1 a pc2 e alla fine la ferma. I dati della topologia sono già scritti in testa al file, nel dizionario `DEVICES`. Mancano cinque chiamate alle API, segnate come TODO:

| TODO | Cosa fa | Chiamata |
|---|---|---|
| 1 | crea il dispositivo | `lab.new_machine(...)` |
| 2 | collega un'interfaccia a un dominio di collisione | `lab.connect_machine_to_link(...)` |
| 3 | scrive il file `.startup` | `lab.create_startup_file_from_list(...)` |
| 4 | avvia il lab | `manager.deploy_lab(...)` |
| 5 | esegue il ping da pc1 | `manager.exec(...)` |

Ogni TODO è una chiamata `todo(...)` da sostituire con quella giusta. Lanciamo lo script dopo ogni modifica: si ferma al primo TODO che manca e ci dice quale.

```
python lab3-api/primo_lab.py
```

Alla fine dobbiamo vedere il modello pronto (4 dispositivi e 3 domini, in memoria), il ping riuscito e la riga `pc1 raggiunge pc2!`. Lo script ferma il lab da solo, anche in caso di errore.

<details>
<summary>Suggerimento · gli argomenti delle chiamate</summary>

Nel ciclo su `DEVICES` abbiamo già `name`, `domain`, `number` e la lista `startup`; la costante `IMAGE` è l'immagine. Le chiamate su `lab` costruiscono il modello, quelle su `manager` agiscono su Docker.

```python
machine = lab.new_machine(name, image=IMAGE)
lab.connect_machine_to_link(name, domain, machine_iface_number=number)
lab.create_startup_file_from_list(machine, startup)
manager.deploy_lab(lab)
stdout, _, exit_code = manager.exec("pc1", "ping -c 3 192.168.2.10", lab=lab, wait=True, stream=False)
```

`wait=True` aspetta che pc1 abbia finito di eseguire il suo startup; `stream=False` restituisce l'output tutto insieme.

</details>

La soluzione completa è in [soluzione/primo_lab.py](soluzione/primo_lab.py).

---

## Parte B — Testiamo la nostra rete OSPF

In produzione non possiamo staccare una fibra per vedere cosa succede: significa creare un disservizio agli utenti. Le domande però restano: se cade n12, quanto traffico perdiamo? Dopo quanto passa su r4? E cosa succede quando il link torna?

Sul twin, con gli stessi demoni e le stesse configurazioni della produzione, facciamo un esperimento: si rompe a comando, si misura, si ripete. Lo automatizza `chaos.py`, che prende la **nostra cartella del Lab 2**, quella con la sede C, e:

1. **prepara il twin**: legge la cartella (default `labs/lab2/ospf`) e riavvia il lab da zero; se è già in esecuzione lo ferma prima;
2. **aspetta la convergenza**: adiacenze OSPF Full su tutti i router, mostrando quelle che salgono router per router, poi tabelle di routing stabili per 5 s;
3. **rompe e ripristina**: dopo 10 s abbatte n12 su entrambe le estremità; dopo 30 s (60 con `--silent`) lo ripristina;
4. **osserva e fa il conto**: ancora 20 s di osservazione, poi ping inviati e persi. Il twin resta acceso.

```
python lab3-api/chaos.py                                  # labs/lab2/ospf, n12 giù per 30 s
python lab3-api/chaos.py --lab-dir labs/lab2/ospf         # la stessa cosa, esplicita
```

Alla fine il twin resta acceso; per fermarlo, `kathara lclean -d labs/lab2/ospf`. Con **Ctrl+C** lo script si ferma e ripristina comunque il link guasto: il twin non resta mai rotto.

| Opzione | Significato | Default |
|---|---|---|
| `--lab-dir` | cartella del lab da avviare | `labs/lab2/ospf` |
| `--link` | link da abbattere: `n12`, `n23`, `n34`, `n41` | `n12` |
| `--down` | durata del guasto (s) | 30 (60 con `--silent`) |
| `--wait` | attesa prima di ogni guasto (s) | 10 |
| `--after` | osservazione dopo l'ultimo ripristino (s) | 20 |
| `--cycles` | numero di guasti | 1 |
| `--random` | link e durate casuali a ogni ciclo | no |
| `--silent` | `tc netem loss 100%` invece di `ip link set down` | no |

Se il nostro Lab 2 non è finito, usiamo una copia della soluzione:

```
mkdir -p labs/demo
cp -r lab2-digital-twin/soluzione labs/demo/soluzione
python lab3-api/chaos.py --lab-dir labs/demo/soluzione
```

(Su Windows: `Copy-Item -Recurse lab2-digital-twin\soluzione labs\demo\soluzione`.) Lavoriamo sempre su copie dentro `labs/`: avviando un lab, Kathará crea file nella sua cartella.

### Due modi di rompere un link

Su r1:eth1 e r2:eth0, le due estremità di n12:

| | Guasto pulito (default) | Guasto silenzioso (`--silent`) |
|---|---|---|
| nella realtà | fibra staccata o porta spenta: il link va giù e il router lo vede | fibra degradata o apparato in mezzo guasto: il link resta up, ma non passa nulla |
| guasto | `ip link set eth1 down` | `tc qdisc add dev eth1 root netem loss 100%` |
| ripristino | `ip link set eth1 up` | `tc qdisc del dev eth1 root` |
| chi se ne accorge | subito: il kernel segnala l'interfaccia giù, FRR chiude l'adiacenza e ricalcola i percorsi | nessuno, all'inizio: OSPF se ne accorge solo quando scade il dead interval (40 s) |
| durata | 30 s | 60 s, più del dead interval |

### Come misura: due monitor in parallelo

- **Monitor del traffico**: `ping -c 1 -W 1 192.168.20.10` da pc_a, un ping al secondo verso pc_b (timeout 1 s). OK se risponde, altrimenti PERSO: ogni ping perso vale circa un secondo di interruzione.
- **Monitor della rotta**: `ip route get 192.168.20.10` su r1, ogni mezzo secondo. Legge il next-hop di r1 verso la sede B: 10.0.0.2 è r2 (primario), 10.0.0.13 è r4 (backup). Scrive una riga `***` solo quando cambia.

Tutto passa da `exec` nei container, senza toccare la configurazione del twin. Nella timeline `>>>` e `<<<` sono guasto e ripristino, `***` è un cambio di next-hop. Il tempo di reroute va da `>>>` a `***`; i ping persi dicono quanto è durata l'interruzione per gli utenti.

### Cosa aspettarci

```
[20:30:28] Cartella labs/lab2/ospf letta: 7 dispositivi, 7 domini di collisione
[20:30:28] Avvio il twin (pc_a, pc_b, pc_c, r1, r2, r3, r4)...
[20:30:31] Attendo le adiacenze OSPF (attese: r1 2, r2 2, r3 2, r4 2)
[20:30:48] Adiacenze Full: r1 2/2, r2 2/2, r3 2/2, r4 2/2
[20:30:59] Twin pronto in 28 s
[   0.0s] next-hop iniziale di r1: 10.0.0.2 (r2, primario)
[  10.0s] >>> GUASTO su n12 (r1:eth1, r2:eth0)
[  10.4s] *** next-hop di r1: 10.0.0.2 (r2, primario) -> 10.0.0.13 (r4, backup)
[  40.1s] <<< RIPRISTINO di n12
[  50.3s] *** next-hop di r1: 10.0.0.13 (r4, backup) -> 10.0.0.2 (r2, primario)
Ping inviati: 61, persi: 1
```

| Esperimento | Tempo prima del reroute | Ping persi |
|---|---|---|
| guasto pulito, `chaos.py` | pochi decimi di secondo | 0 o 1 |
| guasto silenzioso, `chaos.py --silent` | circa 35-40 s | circa 35 |

Il guasto silenzioso aspetta il dead interval OSPF (40 s) prima del reroute. I valori esatti cambiano da PC a PC.

---

## Domande guida

1. Con il guasto pulito, quanti ping si perdono? Perché così pochi?
2. Dopo il ripristino, perché il traffico torna su r2 solo dopo circa 10 secondi? (Suggerimento: cosa deve succedere prima che un'adiacenza OSPF torni Full, e ogni quanto si inviano gli hello?)
3. Perché il guasto silenzioso è così lento? E se dura 20 secondi, meno del dead interval? Proviamo: `python lab3-api/chaos.py --silent --down 20`.
4. Abbattiamo n41 (`--link n41`): cambia qualcosa nella timeline? Perché?
5. Quali altri test automatizzereste sul twin prima di ogni change?

## Pulizia

```
kathara lclean -d labs/lab2/ospf
```

---

## Extra per casa · BFD sul backbone

Facoltativo, da fare a casa (o in aula, se avanza tempo). Come risolviamo il problema del guasto silenzioso?

Su alcune fibre un guasto lascia l'interfaccia *up*, ma il traffico non passa più. OSPF se ne accorge solo allo scadere del dead interval: 40 secondi di traffico perso.

**BFD** (Bidirectional Forwarding Detection, RFC 5880) è un protocollo leggero per rilevare i guasti di link in tempi sub-secondo, prima che OSPF se ne accorga:

- **cos'è**: una sessione di hello tra due peer adiacenti. Non trasporta informazioni di routing: serve solo a rilevare guasti sul dataplane, indipendentemente da OSPF o BGP;
- **come funziona**: ogni peer invia un pacchetto BFD ogni 300 ms (default FRR). Se 3 pacchetti consecutivi non arrivano, il link è dichiarato down in meno di un secondo;
- **notifica a OSPF**: alla rilevazione del guasto BFD avvisa subito OSPF, che rimuove la rotta e riconverge senza aspettare il dead interval.

| | Tempo di rilevamento |
|---|---|
| solo OSPF | 40 s (dead interval = 4 × 10 s, default) |
| OSPF + BFD | meno di 1 s (300 ms × 3 pacchetti mancati) |

### La change request

> Abilitare **BFD** su tutti i link di backbone, associato a OSPF, con i timer di default.

La applichiamo alla nostra copia `labs/lab2/ospf`, quella con la sede C:

1. `bfdd=yes` (e le sue opzioni) nel file `daemons` di ogni router;
2. `ip ospf bfd` sulle interfacce di backbone, cioè quelle point-to-point con un vicino OSPF. Le LAN di sede sono passive: nessun peer, nessun BFD;
3. `show bfd peers` in `vtysh`: tutte le sessioni `up`.

Ecco cosa cambia nei file di r1; lo schema è lo stesso su r2, r3 e r4.

`r1/etc/frr/frr.conf`:

```
! LAN di sede: passiva, niente BFD
interface eth0
 ip ospf passive
!
! n12 verso r2
interface eth1
 ip ospf network point-to-point
 ip ospf bfd
 ip ospf cost 10
!
! n41 verso r4
interface eth2
 ip ospf network point-to-point
 ip ospf bfd
 ip ospf cost 100
```

`r1/etc/frr/daemons`:

```
zebra=yes
ospfd=yes
bfdd=yes
vtysh_enable=yes
...
bfdd_options="   -A 127.0.0.1"
```

Poi collaudiamo con il checker dedicato, dalla radice del repository e con il lab fermo:

```
kathara lclean -d labs/lab2/ospf
python -m kathara_lab_checker --config lab2-digital-twin/checker/correction-bfd.yaml --lab labs/lab2/ospf --no-cache --report-type csv
```

Infine rilanciamo il guasto silenzioso e confrontiamo i tempi con quelli senza BFD:

```
python lab3-api/chaos.py --silent
```

Con BFD il next-hop cambia in meno di un secondo e non si perde nessun ping. Domanda: quali sono i timer BFD di default (`show bfd peers` in `vtysh`)? Che costo hanno in produzione?

Per vedere solo l'effetto, senza applicare la change request, possiamo usare le due soluzioni:

```
mkdir -p labs/demo
cp -r lab2-digital-twin/soluzione lab2-digital-twin/soluzione-bfd labs/demo/
python lab3-api/chaos.py --lab-dir labs/demo/soluzione --silent
python lab3-api/chaos.py --lab-dir labs/demo/soluzione-bfd --silent
```

---

## Approfondimento: il twin generato dai dati

`build_twin.py` ricostruisce la rete di produzione del Lab 2 interamente da codice. La scheda di rete è scritta come dati (`ROUTERS`, `HOSTS`) e la configurazione FRR di ogni router è generata da quei dati, invece di essere scritta a mano. È l'approccio da seguire per costruire il twin di una rete grande.

```
python lab3-api/build_twin.py              # crea e avvia il twin "garr-twin"
python lab3-api/build_twin.py --bfd        # come sopra, con BFD sul backbone
python lab3-api/chaos.py --lab-name garr-twin
python lab3-api/build_twin.py --destroy    # ferma il twin
```
