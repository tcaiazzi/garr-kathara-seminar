# Lab 1 — Warmup: rotte statiche (25 minuti)

Obiettivo: costruire **da zero** un piccolo lab Kathará e prendere confidenza con il ciclo di lavoro che useremo per tutto il seminario:

> configuriamo → avviamo e proviamo → controlliamo con il checker → correggiamo

## Topologia

```
  192.168.1.0/24          10.0.12.0/30          192.168.2.0/24
 pc1 ─────────── r1 ─────────────────── r2 ─────────── pc2
     lanA              n12                    lanB
```

## Piano di indirizzamento

| Dispositivo | Interfaccia | Dominio di collisione | Indirizzo | Gateway |
|---|---|---|---|---|
| pc1 | eth0 | lanA | 192.168.1.10/24 | 192.168.1.1 |
| r1 | eth0 | lanA | 192.168.1.1/24 | |
| r1 | eth1 | n12 | 10.0.12.1/30 | |
| r2 | eth0 | n12 | 10.0.12.2/30 | |
| r2 | eth1 | lanB | 192.168.2.1/24 | |
| pc2 | eth0 | lanB | 192.168.2.10/24 | 192.168.2.1 |

- Immagine per tutti i dispositivi: `kathara/base`.
- Gli host usano una **default route** verso il proprio router (il `.1` della LAN).
- I router usano **rotte statiche**: r1 raggiunge 192.168.2.0/24 tramite r2, e r2 raggiunge 192.168.1.0/24 tramite r1.

**Risultato atteso:** pc1 raggiunge pc2, e viceversa.

> Usiamo esattamente i nomi di dispositivi e domini di collisione della tabella: il checker li confronta con quelli attesi.

## 1. Creiamo il lab

Dalla radice del repository creiamo la cartella del lab ed entriamoci:

```
mkdir -p labs/lab1/static-routing
cd labs/lab1/static-routing
```

Dentro la cartella servono:

- `lab.conf`: una riga per interfaccia, nel formato `nome[numero]="dominio"`, più l'immagine (`nome[image]="kathara/base"`);
- un file `<dispositivo>.startup` per ciascun dispositivo, con i comandi eseguiti all'avvio: `ip address add ...` e `ip route add ...`.

Promemoria della sintassi:

```
# lab.conf (estratto)
r1[0]="lanA"
r1[1]="n12"
r1[image]="kathara/base"
```

```
# r1.startup
ip address add 192.168.1.1/24 dev eth0
ip address add 10.0.12.1/30 dev eth1
ip route add <rete>/<prefisso> via <next-hop>
```

```
# sugli host
ip route add default via <gateway>
```

> Non serve abilitare l'IP forwarding sui router: Kathará lo attiva già su tutti i dispositivi.

## 2. Avviamo e proviamo

```
kathara lstart                # avvia il lab (apre un terminale per dispositivo)
kathara linfo --topology      # il cablaggio: ogni dominio con i suoi dispositivi
kathara connect pc1           # shell su pc1 (se non abbiamo il terminale aperto)
```

Le barre di `lstart` devono arrivare a 3/3 (domini di collisione) e 4/4 (dispositivi).

Da pc1:

```
ping -c 3 192.168.2.10        # 0% packet loss
traceroute -n 192.168.2.10    # tre hop: r1 (192.168.1.1), r2 (10.0.12.2), pc2
ip route                      # la default verso r1 e la rete connessa
```

Se qualcosa non funziona, correggiamo i file `.startup` (non i dispositivi in esecuzione: le modifiche fatte a mano si perdono al riavvio) e riavviamo con `kathara lrestart`.

> Per lanciare un comando senza aprire una shell, usiamo `kathara exec` con il comando **tra virgolette**:
> `kathara exec pc1 "ping -c 3 192.168.2.10"`

## 3. Controlliamo con il checker

Il checker **avvia il lab da solo**. Torniamo alla radice del repository e, con il virtualenv attivo, fermiamo il nostro lab e lanciamo il checker:

```
cd ../../..
kathara lclean -d labs/lab1/static-routing
python -m kathara_lab_checker --config lab1-statico/checker/correction.yaml --lab labs/lab1/static-routing --no-cache --report-type csv
```

L'opzione `--no-cache` serve a rifare il controllo anche se esiste già un report precedente. Senza di essa il checker salta il lab senza avvisare.

A fine esecuzione, a terminale compare il riepilogo (`Passed Tests: N/M`; la soluzione completa passa 48 test su 48). Nella cartella del lab troviamo tre file:

| File | Contenuto |
|---|---|
| `static-routing_result_failed.csv` | **solo i test falliti, con il motivo**: partiamo da qui |
| `static-routing_result_summary.csv` | totale dei test, superati e falliti |
| `static-routing_result_all.csv` | tutti i test |

Correggiamo, rilanciamo il checker e ripetiamo finché tutti i test passano.

## Cosa controlla il checker

- che la topologia (dispositivi e domini di collisione) sia quella attesa;
- che ogni dispositivo abbia il suo file `.startup`;
- gli indirizzi IP su ogni interfaccia;
- le tabelle di routing: default route sugli host, rotta statica verso la LAN remota sui router (le reti direttamente connesse non contano);
- la raggiungibilità: ogni dispositivo deve raggiungere ogni indirizzo del piano.

## Errori frequenti

- **Nomi diversi dalla tabella**: il checker confronta dispositivi e domini di collisione uno a uno.
- **Maiuscole nei nomi**: Kathará non accetta `pcA` come nome di dispositivo; `lstart` segnala un errore in `lab.conf`.
- **Interfacce con buchi**: `r1[0]`, `r1[1]`, …: la numerazione parte da 0 e non salta numeri.
- **Modifiche nei container**: quello che digitiamo in un terminale sparisce al riavvio; correggiamo i file `.startup`.
- **macOS, VS Code: i terminali dei dispositivi non si aprono**: macOS non lascia a VS Code il controllo dell'app Terminale. Lanciamo i comandi di Kathará da un terminale esterno, oppure diamo il permesso a VS Code seguendo [setup/INSTALL.md](../setup/INSTALL.md#macos-vs-code-e-i-terminali-dei-dispositivi).
- **Rotta verso un indirizzo**: `ip route add` vuole la rete (192.168.2.0/24); il next-hop è un vicino diretto.
- **Rotta di ritorno dimenticata**: il ping funziona solo se anche r2 sa tornare verso 192.168.1.0/24.

---

## Informazione utile: Wireshark nei laboratori

Non serve per il workshop, e l'immagine va scaricata e richiede tempo. Possiamo aggiungere al lab un dispositivo Wireshark per vedere le catture live da un'interfaccia grafica nel browser. Al `lab.conf` aggiungiamo:

```
wireshark[bridged]="true"
wireshark[port]="3000:3000"
wireshark[image]="lscr.io/linuxserver/wireshark"
wireshark[num_terms]=0
wireshark[0]="lanA"
```

1. Il dispositivo sta sul dominio da osservare (qui `lanA`), con `bridged` attivo e la porta 3000 esposta sull'host.
2. Apriamo la GUI nel browser: http://localhost:3000.
3. Scegliamo l'interfaccia: `eth0` è il dominio `lanA`, `eth1` è collegata alla rete bridged di Docker.

---

## Per chi finisce prima: due VLAN tra le sedi

Esercizio facoltativo, anche da fare a casa: quattro computer, ognuno su una porta dedicata di uno dei due switch s1 e s2, e due VLAN che attraversano le sedi su un trunk tra s1 e s2, la 100 per i computer pari e la 101 per i dispari. Gli host non sanno di essere in una VLAN: il tag lo mette lo switch. Solo livello 2, senza indirizzi sugli switch e senza rotte. Traccia, soluzione e checker sono in [extra-vlan/](extra-vlan/TRACCIA.md).
