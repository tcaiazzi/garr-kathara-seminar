# Lab 1 — Riscaldamento con rotte statiche (25 minuti)

Obiettivo: costruire **da zero** un piccolo lab Kathará e prendere confidenza con il ciclo di lavoro che useremo per tutto il seminario:

> configuro → avvio e provo → controllo con il checker → correggo

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
- Gli host usano una **default route** verso il proprio router.
- I router usano **rotte statiche**: r1 raggiunge 192.168.2.0/24 tramite r2, e r2 raggiunge 192.168.1.0/24 tramite r1.

**Risultato atteso:** pc1 raggiunge pc2, e viceversa.

> Usa esattamente i nomi di dispositivi e domini di collisione della tabella: il checker li confronta con quelli attesi.

## 1. Crea il lab

Dalla radice del repository crea la cartella del tuo lab ed entraci:

```
mkdir -p labs/lab1/mio-lab1
cd labs/lab1/mio-lab1
```

Dentro la cartella servono:

- `lab.conf`: un dispositivo per riga, nel formato `nome[interfaccia]="dominio"`, più l'immagine (`nome[image]="kathara/base"`);
- un file `<dispositivo>.startup` per ciascun dispositivo, con i comandi eseguiti all'avvio: `ip address add ...` e `ip route add ...`.

Promemoria della sintassi:

```
# lab.conf
r1[0]="lanA"
r1[1]="n12"
r1[image]="kathara/base"
```

```
# r1.startup
ip address add 192.168.1.1/24 dev eth0
ip route add <rete>/<prefisso> via <next-hop>
```

> Non serve abilitare l'IP forwarding sui router: Kathará lo attiva già su tutti i dispositivi.

## 2. Avvia e prova

```
kathara lstart          # avvia il lab (apre un terminale per dispositivo)
kathara linfo           # elenca i dispositivi in esecuzione
kathara connect pc1     # shell su pc1 (se non hai il terminale aperto)
```

Da pc1:

```
ping -c 3 192.168.2.10
traceroute -n 192.168.2.10
ip route
```

Se qualcosa non funziona, correggi i file `.startup` (non i dispositivi in esecuzione: le modifiche fatte a mano si perdono al riavvio) e riavvia con `kathara lrestart`.

> Per lanciare un comando senza aprire una shell, usa `kathara exec` con il comando **tra virgolette**:
> `kathara exec pc1 "ping -c 3 192.168.2.10"`

## 3. Controlla con il checker

Il checker **avvia il lab da solo**, quindi prima ferma il tuo:

```
kathara lclean
```

Poi torna alla radice del repository e lancia (con il virtualenv attivo):

```
python -m kathara_lab_checker --config lab1-statico/checker/correction.yaml --lab labs/lab1/mio-lab1 --no-cache --report-type csv
```

L'opzione `--no-cache` serve a rifare il controllo anche se esiste già un report precedente. Senza di essa il checker salta il lab.

A fine esecuzione, a terminale compare il riepilogo (`Passed Tests: N/M`). Nella cartella del lab trovi tre file:

| File | Contenuto |
|---|---|
| `mio-lab1_result_summary.csv` | totale dei test, superati e falliti |
| `mio-lab1_result_failed.csv` | **solo i test falliti, con il motivo**: parti da qui |
| `mio-lab1_result_all.csv` | tutti i test |

Correggi, rilancia il checker e ripeti finché tutti i test passano.

## Cosa controlla il checker

- che la topologia (dispositivi e domini di collisione) sia quella attesa;
- che ogni dispositivo abbia il suo file `.startup`;
- gli indirizzi IP su ogni interfaccia;
- le tabelle di routing: default route sugli host, rotta statica verso la LAN remota sui router (le reti direttamente connesse non contano);
- la raggiungibilità: ogni dispositivo deve raggiungere ogni indirizzo del piano.

---

## Per chi finisce prima: due VLAN tra le sedi

Esercizio facoltativo, anche da fare a casa: si aggiungono pc3 e pc4 e due VLAN, la 100 per i computer pari e la 101 per i dispari, che attraversano le sedi su un trunk tra r1 e r2. Traccia, soluzione e checker sono in [extra-vlan/](extra-vlan/TRACCIA.md).
