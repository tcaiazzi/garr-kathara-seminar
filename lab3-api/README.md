# Lab 3 — Il digital twin con le API (35 minuti)

Nei primi due lab il twin era una cartella di file, gestita a mano con `kathara lstart`. Qui si passa al **codice Python**: prima scrivete il vostro primo lab con le API di Kathará, poi usate uno script che avvia il *vostro* twin del Lab 2 e lo mette alla prova con dei guasti programmati, misurando l'effetto sul traffico.

| Parte | Tempo | Chi |
|---|---|---|
| A · Il vostro primo lab con le API | 15' | voi |
| B · Rompete il vostro twin | 15' | voi |
| C · Lo stesso guasto, con e senza BFD | 5' | il relatore |

## Prerequisiti

Virtualenv del seminario attivo e pacchetti installati (vedi [setup/INSTALL.md](../setup/INSTALL.md)). Tutti i comandi si lanciano **dalla radice del repository**.

---

## Parte A — Il vostro primo lab con le API

`primo_lab.py` ricostruisce da codice la topologia del Lab 1 (pc1 – r1 – r2 – pc2), la avvia, fa un ping da pc1 a pc2 e alla fine la ferma. I dati della topologia sono già scritti in testa al file, nel dizionario `DEVICES`. Mancano cinque chiamate alle API, segnate come TODO:

| TODO | Cosa fa | Chiamata |
|---|---|---|
| 1 | crea il dispositivo | `lab.new_machine(...)` |
| 2 | collega un'interfaccia a un dominio di collisione | `lab.connect_machine_to_link(...)` |
| 3 | scrive il file `.startup` | `lab.create_startup_file_from_list(...)` |
| 4 | avvia il lab | `manager.deploy_lab(...)` |
| 5 | esegue il ping da pc1 | `manager.exec(...)` |

Ogni TODO è una chiamata `todo(...)` da sostituire con quella giusta. Lanciate lo script dopo ogni modifica: si ferma al primo TODO che manca e vi dice quale.

```
python lab3-api/primo_lab.py
```

Alla fine dovete vedere il ping riuscito e la riga `pc1 raggiunge pc2!`. Lo script ferma il lab da solo, anche in caso di errore.

<details>
<summary>Suggerimento · gli argomenti delle chiamate</summary>

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

## Parte B — Rompete il vostro twin

`chaos.py` prende la **vostra cartella del Lab 2**, quella con la sede C, e:

1. la avvia: se è già in esecuzione la ferma e la riavvia, per partire da uno stato pulito;
2. attende la convergenza OSPF, mostrando le adiacenze che salgono router per router;
3. avvia due monitor: un **ping al secondo** da pca a pcb e il **next-hop di r1** verso la sede B;
4. abbatte un link di backbone e poi lo ripristina, scrivendo tutto in una timeline.

```
python lab3-api/chaos.py                                  # labs/lab2/mio-lab2, n12 giù per 30 s
python lab3-api/chaos.py --lab-dir labs/lab2/mio-lab2     # la stessa cosa, esplicita
```

Nella timeline: `>>>` e `<<<` sono guasto e ripristino, `***` è un cambio di next-hop. Alla fine il twin resta acceso; per fermarlo, `kathara lclean -d labs/lab2/mio-lab2`.

| Opzione | Significato | Default |
|---|---|---|
| `--lab-dir` | cartella del lab da avviare | `labs/lab2/mio-lab2` |
| `--link` | link da abbattere: `n12`, `n23`, `n34`, `n41` | `n12` |
| `--down` | durata del guasto (s) | 30 (60 con `--silent`) |
| `--wait` | attesa prima di ogni guasto (s) | 10 |
| `--after` | osservazione dopo l'ultimo ripristino (s) | 20 |
| `--cycles` | numero di guasti | 1 |
| `--random` | link e durate casuali a ogni ciclo | no |
| `--silent` | `tc netem loss 100%` invece di `ip link set down` | no |

Con **Ctrl+C** lo script si ferma e ripristina comunque il link guasto.

Se il vostro Lab 2 non è finito, usate una copia della soluzione:

```
mkdir -p labs/demo
cp -r lab2-digital-twin/soluzione labs/demo/soluzione
python lab3-api/chaos.py --lab-dir labs/demo/soluzione
```

(Su Windows: `Copy-Item -Recurse lab2-digital-twin\soluzione labs\demo\soluzione`.) Lavorate sempre su copie dentro `labs/`: avviando un lab, Kathará crea file nella sua cartella.

### Due modi di rompere un link

- **Guasto "pulito"** (default): `ip link set ethX down` su entrambe le estremità. Il kernel segnala subito l'interfaccia giù, FRR chiude l'adiacenza e ricalcola i percorsi in pochi millisecondi.
- **Guasto silenzioso** (`--silent`): `tc qdisc add dev ethX root netem loss 100%`. L'interfaccia resta *up* ma scarta tutto il traffico, come una fibra degradata o un apparato intermedio guasto. OSPF non riceve più hello, ma se ne accorge solo allo scadere del **dead interval** (40 s).

### Cosa aspettarsi

```
[20:30:28] Cartella labs/lab2/mio-lab2 letta: 7 dispositivi, 7 domini di collisione
[20:30:28] Avvio il twin (pca, pcb, pcc, r1, r2, r3, r4)...
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

I tempi esatti variano un po' da PC a PC, e il numero di ping persi con il guasto pulito può essere 0 o 1.

---

## Parte C — Lo stesso guasto, con e senza BFD (relatore)

Il relatore copia le due soluzioni in `labs/demo/` e lancia il guasto silenzioso su entrambe:

```
mkdir -p labs/demo
cp -r lab2-digital-twin/soluzione lab2-digital-twin/soluzione-bfd labs/demo/
python lab3-api/chaos.py --lab-dir labs/demo/soluzione --silent
python lab3-api/chaos.py --lab-dir labs/demo/soluzione-bfd --silent
```

Senza BFD il next-hop cambia solo allo scadere del dead interval: circa 35-40 secondi di ping persi. Con BFD il guasto viene rilevato in meno di un secondo e non si perde nessun ping.

---

## Domande guida

1. Nel primo script, perché serve `wait=True` nell'`exec` del ping?
2. Con il guasto pulito, quanti ping si perdono? Perché così pochi?
3. Dopo il ripristino, perché il traffico torna su r2 solo dopo circa 10 secondi? (Suggerimento: cosa deve succedere prima che un'adiacenza OSPF torni Full, e ogni quanto si inviano gli hello?)
4. Perché il guasto silenzioso è molto più lento? Da quale timer dipende il tempo di reazione? Cosa succede con un guasto di 20 secondi, più breve del dead interval? Provate: `python lab3-api/chaos.py --silent --down 20`.
5. Con BFD il guasto silenzioso viene rilevato in meno di un secondo. Quali sono i timer BFD di default (`show bfd peers` in `vtysh`)? Che costo hanno in produzione?
6. Abbattete n41 (`--link n41`): cambia qualcosa nella timeline? Perché?
7. Quali altri test automatizzereste sul twin prima di ogni change?

## Pulizia

```
kathara lclean -d labs/lab2/mio-lab2
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
