# Lab 2, esercizio extra — Configurare OSPF da zero

> Esercizio facoltativo, fuori dal flusso del seminario. Nel Lab 2 la rete di produzione è già configurata e si applica una change request (vedi `../TRACCIA.md`); qui invece si scrive la configurazione OSPF partendo da uno scheletro.

## Lo scenario

Un ente ha due sedi collegate da un piccolo backbone regionale di quattro router ad anello. Il team di rete deve introdurre OSPF sul backbone e vuole **validare la configurazione su un gemello digitale** prima di applicarla in produzione.

Il gemello digitale (lab Kathará) è già pronto: stessi dispositivi, stessi collegamenti, stessi indirizzi della rete reale. Manca solo la configurazione OSPF dei router, ed è il vostro compito. Questa è la scheda di rete che il team di produzione vi consegna.

---

## Scheda di rete — Backbone regionale

### Diagramma

```
       sede A                                                 sede B
   192.168.10.0/24                                        192.168.20.0/24

 pca ─────────── r1 ───────── n12 ───────── r2
       lanA       │        10.0.0.0/30       │
                  │                          │
                 n41                        n23
            10.0.0.12/30                10.0.0.4/30
                  │                          │
                 r4 ───────── n34 ───────── r3 ─────────── pcb
                          10.0.0.8/30               lanB
```

### Piano di indirizzamento

| Dispositivo | Interfaccia | Dominio | Indirizzo |
|---|---|---|---|
| pca | eth0 | lanA | 192.168.10.10/24 (gw 192.168.10.1) |
| pcb | eth0 | lanB | 192.168.20.10/24 (gw 192.168.20.1) |
| r1 | eth0 | lanA | 192.168.10.1/24 |
| r1 | eth1 | n12 | 10.0.0.1/30 |
| r1 | eth2 | n41 | 10.0.0.14/30 |
| r2 | eth0 | n12 | 10.0.0.2/30 |
| r2 | eth1 | n23 | 10.0.0.5/30 |
| r3 | eth0 | lanB | 192.168.20.1/24 |
| r3 | eth1 | n23 | 10.0.0.6/30 |
| r3 | eth2 | n34 | 10.0.0.9/30 |
| r4 | eth0 | n34 | 10.0.0.10/30 |
| r4 | eth1 | n41 | 10.0.0.13/30 |

### Loopback

| Router | Loopback (`lo`) | Router-id OSPF |
|---|---|---|
| r1 | 10.255.0.1/32 | 10.255.0.1 |
| r2 | 10.255.0.2/32 | 10.255.0.2 |
| r3 | 10.255.0.3/32 | 10.255.0.3 |
| r4 | 10.255.0.4/32 | 10.255.0.4 |

### Vincoli operativi

1. **OSPF in area 0** su tutti i router. Vanno annunciate le reti di backbone, le loopback e le LAN di sede.
2. Le interfacce verso le **LAN di sede devono essere passive**: nessuna adiacenza OSPF verso gli utenti.
3. Il traffico tra sede A e sede B deve passare **per r2** (percorso primario). Il percorso via r4 è solo di **backup**. Implementazione richiesta: **costo 10** su n12 e n23, **costo 100** su n34 e n41.
4. Ogni router deve raggiungere le **loopback di tutti gli altri**.
5. I link di backbone sono collegamenti **punto-punto**: configurateli come tali in OSPF (niente elezione DR/BDR).

---

## Cosa trovate nello scheletro

La cartella `scheletro/` contiene il lab già pronto:

- `lab.conf` completo: dispositivi, collegamenti e immagini (`kathara/frr` per i router, `kathara/base` per gli host);
- startup degli host completi;
- startup dei router con l'indirizzamento IP (loopback compresa) e l'avvio di FRR (`systemctl start frr`);
- `rN/etc/frr/daemons` già pronto, con `zebra` e `ospfd` attivi;
- `rN/etc/frr/frr.conf` **da completare**.

Copiate lo scheletro nella vostra cartella di lavoro.

Linux / macOS:

```
mkdir -p labs/lab2
cp -r lab2-digital-twin/extra-ospf-da-zero/scheletro labs/lab2/ospf-da-zero
```

Windows (PowerShell):

```
New-Item -ItemType Directory -Force labs\lab2
Copy-Item -Recurse lab2-digital-twin\extra-ospf-da-zero\scheletro labs\lab2\ospf-da-zero
```

## Cosa dovete fare

Completare `r1/etc/frr/frr.conf`, `r2/...`, `r3/...` e `r4/...` rispettando i cinque vincoli.

Promemoria della sintassi FRR (non è la soluzione: sta a voi decidere dove e con quali valori usare ogni comando):

```
interface ethX
 ip ospf passive                   ! interfaccia annunciata ma senza adiacenze
 ip ospf network point-to-point    ! link punto-punto
 ip ospf cost N                    ! costo OSPF dell'interfaccia
!
router ospf
 ospf router-id A.B.C.D
 network <rete>/<prefisso> area 0  ! abilita OSPF sulle interfacce in quella rete
!
```

Documentazione: https://docs.frrouting.org/en/latest/ospfd.html

## Come verificare

Avviate il twin dalla vostra cartella:

```
cd labs/lab2/ospf-da-zero
kathara lstart
```

I file del lab vengono copiati nei dispositivi **all'avvio**. Dopo ogni modifica a un `frr.conf` serve quindi `kathara lrestart`.

Comandi utili su un router (`kathara connect r1`, poi `vtysh` per la CLI di FRR):

```
show ip ospf neighbor          ! adiacenze: devono essere Full
show ip ospf interface         ! area, costo, tipo di rete, passive
show ip route ospf             ! rotte imparate via OSPF
```

Da pca:

```
traceroute -n 192.168.20.10    ! il secondo hop deve essere 10.0.0.2 (r2)
```

**Prova di failover.** Simulate un guasto su n12 spegnendo le interfacce **a entrambe le estremità**. In Kathará un dominio di collisione è uno switch virtuale: se spegnete un solo lato, l'altro non se ne accorge.

```
kathara exec r1 "ip link set eth1 down"
kathara exec r2 "ip link set eth0 down"
kathara exec pca "traceroute -n 192.168.20.10"    # ora deve passare per r4
kathara exec r1 "ip link set eth1 up"
kathara exec r2 "ip link set eth0 up"
```

## Controllo con il checker

Fermate il twin (`kathara lclean`) e, dalla radice del repository, con il virtualenv attivo:

```
python -m kathara_lab_checker --config lab2-digital-twin/extra-ospf-da-zero/checker/correction.yaml --lab labs/lab2/ospf-da-zero --no-cache --report-type csv
```

Il checker attende 60 secondi per la convergenza OSPF prima di eseguire i test. Il dettaglio degli errori è in `labs/lab2/ospf-da-zero/ospf-da-zero_result_failed.csv`.

Cosa controlla, oltre a topologia, indirizzi e file di startup:

- che `zebra` e `ospfd` siano attivi sui router (e `ospfd` no sugli host);
- le adiacenze OSPF dell'anello, tutte in stato Full;
- per ogni interfaccia: area, costo, tipo di rete punto-punto, LAN passive;
- le tabelle di routing complete di ogni dispositivo, con i next-hop che realizzano il vincolo 3;
- la raggiungibilità delle loopback e dell'altra sede;
- le loopback configurate e il percorso di pca verso pcb, che deve passare per r2.
