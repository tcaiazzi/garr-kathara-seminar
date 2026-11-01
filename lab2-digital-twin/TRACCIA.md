# Lab 2 — Digital twin di una rete OSPF (50 minuti)

## Lo scenario

Siamo i tecnici di rete di un ente con due sedi, collegate da un piccolo backbone regionale di quattro router ad anello, in esercizio con OSPF. Abbiamo in coda una **change request**: attivare una terza sede.

Prima di toccare la produzione, proviamo la modifica sul **gemello digitale**: un lab Kathará con gli stessi dispositivi, gli stessi collegamenti, gli stessi indirizzi e le stesse configurazioni della rete reale. Il checker fa da collaudo: verifica che il nuovo requisito funzioni **e** che il resto della rete continui a comportarsi esattamente come prima.

Il lab ha quattro fasi:

1. avvio ed esplorazione del lab (10');
2. il ticket (5');
3. applichiamo il nuovo requisito sul twin (20');
4. verifichiamo il nuovo requisito e lo collaudiamo con il checker (15').

---

## Scheda di rete — Backbone regionale in produzione

### Diagramma

```
       sede A                                                 sede B
   192.168.10.0/24                                        192.168.20.0/24

 pc_a ────────── r1 ───────── n12 ───────── r2
       lanA       │        10.0.0.0/30       │
                  │                          │
                 n41                        n23
            10.0.0.12/30                10.0.0.4/30
                  │                          │
                 r4 ───────── n34 ───────── r3 ─────────── pc_b
                          10.0.0.8/30               lanB
```

### Piano di indirizzamento

| Dispositivo | Interfaccia | Dominio | Indirizzo |
|---|---|---|---|
| pc_a | eth0 | lanA | 192.168.10.10/24 (gw 192.168.10.1) |
| pc_b | eth0 | lanB | 192.168.20.10/24 (gw 192.168.20.1) |
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

Ogni router ha una loopback `10.255.0.N/32` su `lo` (r1 → 10.255.0.1, …, r4 → 10.255.0.4), usata come router-id OSPF. Sui link di backbone /30 ci sono due soli indirizzi utili per link: .1/.2, .5/.6, .9/.10, .13/.14. Tutti gli indirizzi, loopback comprese, sono già negli startup della produzione.

### Come è configurata la produzione

1. **OSPF in area 0** su tutti i router; sono annunciate le reti di backbone, le loopback e le LAN di sede.
2. Le interfacce verso le **LAN di sede sono passive**: annunciate in OSPF, ma senza adiacenze verso gli utenti.
3. Il traffico tra sede A e sede B passa **per r2** (percorso primario); il percorso via r4 è di **backup**. Costi: **10** su n12 e n23, **100** su n34 e n41.
4. Ogni router raggiunge le **loopback** di tutti gli altri.
5. I link di backbone sono **punto-punto** in OSPF: niente elezione DR/BDR sui /30, le adiacenze salgono più in fretta.

Per esempio, la configurazione OSPF di r1 (`r1/etc/frr/frr.conf`):

```
interface eth0
 ip ospf passive
interface eth1
 ip ospf network point-to-point
 ip ospf cost 10
interface eth2
 ip ospf network point-to-point
 ip ospf cost 100
!
router ospf
 ospf router-id 10.255.0.1
 network 10.255.0.1/32 area 0
 network 192.168.10.0/24 area 0
 network 10.0.0.0/30 area 0
 network 10.0.0.12/30 area 0
```

`network … area 0` accende OSPF sulle interfacce in quel prefisso e lo annuncia. Un'area è un gruppo di router con la stessa LSDB: la 0 è il backbone, qui l'unica. Nel file `/etc/frr/daemons` c'è `ospfd=yes`, oltre a `zebra=yes`: senza il demone, il blocco `router ospf` non ha effetto.

---

## Fase 1 — Avvio ed esplorazione del lab (10')

La cartella `produzione/` contiene il twin della rete in esercizio, già configurato. Copiamolo nella nostra cartella di lavoro e avviamolo.

Linux / macOS:

```
mkdir -p labs/lab2
cp -r lab2-digital-twin/produzione labs/lab2/ospf
cd labs/lab2/ospf
kathara lstart
```

Windows (PowerShell):

```
New-Item -ItemType Directory -Force labs\lab2
Copy-Item -Recurse lab2-digital-twin\produzione labs\lab2\ospf
cd labs\lab2\ospf
kathara lstart
```

Esploriamo la rete. Su un router (`kathara connect r1`, poi `vtysh` per la CLI di FRR: il prompt passa da `root@r1:/#` a `r1#`):

```
show ip ospf neighbor          ! adiacenze: due vicini per router, Full/-
show ip ospf interface         ! area, costo, tipo di rete, passive
show ip route ospf             ! rotte imparate via OSPF
```

Da pc_a:

```
traceroute -n 192.168.20.10    ! il secondo hop è 10.0.0.2 (r2)
```

**Prova di failover: abbattiamo n12.** Spegniamo n12 **su entrambe le estremità**: con un solo lato down l'altro resta up, e l'adiacenza cade solo allo scadere del dead interval.

```
kathara exec r1 "ip link set eth1 down"
kathara exec r2 "ip link set eth0 down"
kathara exec pc_a "traceroute -n 192.168.20.10"    # ora passa per r4 (10.0.0.13)
kathara exec r1 "ip link set eth1 up"
kathara exec r2 "ip link set eth0 up"
```

Al ripristino il traffico torna su r2 dopo circa 10 secondi: il tempo di un hello OSPF per ricostruire l'adiacenza.

Domande per orientarci: qual è il next-hop di r1 verso la sede B, e con che costo? Perché r2 ha due next-hop verso la loopback di r4?

---

## Fase 2 — Il ticket (5')

> **CR-042 · Attivazione sede C**
>
> **Descrizione.** È pronta la nuova sede C. Va collegata al router **r4**, che ha una porta libera, su una nuova LAN.
>
> **Dati tecnici**
>
> | Elemento | Valore |
> |---|---|
> | Dominio di collisione | `lanC` |
> | Rete della sede C | 192.168.30.0/24 |
> | r4, nuova interfaccia `eth2` | 192.168.30.1/24 |
> | Host di sede `pc_c`, `eth0` | 192.168.30.10/24, gateway 192.168.30.1 |
> | Immagine di `pc_c` | `kathara/base` |
>
> **Requisiti**
>
> 1. La rete della sede C è annunciata in OSPF, **area 0**.
> 2. L'interfaccia di r4 verso la sede C è **passiva**.
> 3. La sede C raggiunge le sedi A e B, e viceversa.
> 4. **Nessun impatto sul resto della rete**: adiacenze, costi e percorsi esistenti restano invariati; in particolare il traffico tra A e B passa ancora per r2.
>
> **Criterio di accettazione.** Il collaudo `lab2-digital-twin/checker/correction.yaml` passa al 100%.

Dopo la CR-042, la topologia diventa così:

```
 pc_a ────────── r1 ───────── n12 ───────── r2
       lanA       │                          │
                 n41                        n23
                  │                          │
                 r4 ───────── n34 ───────── r3 ─────────── pc_b
                  │                                 lanB
                  │ lanC 192.168.30.0/24   (CR-042)
                 pc_c
               sede C
```

---

## Fase 3 — Applichiamo il nuovo requisito (20')

Lavoriamo sempre nella nostra copia, `labs/lab2/ospf`. Il nuovo requisito tocca **quattro file**, nessun altro:

| File | Cosa cambia |
|---|---|
| `lab.conf` | il nuovo dispositivo `pc_c` sul dominio `lanC`, e la nuova interfaccia di r4 sullo stesso dominio |
| `r4.startup` | l'indirizzo della nuova interfaccia di r4 |
| `pc_c.startup` (nuovo) | indirizzo e default route dell'host della sede C |
| `r4/etc/frr/frr.conf` | la nuova LAN in OSPF, come interfaccia passiva |

Poi riavviamo il twin, che rilegge anche `lab.conf`:

```
kathara lrestart
```

<details>
<summary>Suggerimento 1 · la sintassi che serve</summary>

- In `lab.conf` le interfacce di un dispositivo sono numerate senza buchi: r4 ha già `eth0` ed `eth1`, quindi la nuova è `r4[2]`.
- Un host vuole un indirizzo e una default route: copiamo lo schema di `pc_a.startup`.
- In FRR, come per le LAN di r1 e r3: un blocco `interface ethX` con `ip ospf passive` e un'istruzione `network <rete>/<prefisso> area 0` sotto `router ospf`.

</details>

<details>
<summary>Suggerimento 2 · le righe da aggiungere su r4</summary>

```
! LAN della sede C (CR-042)
interface eth2
 ip ospf passive
!
router ospf
 ...
 network 192.168.30.0/24 area 0
```

</details>

---

## Fase 4 — Verifichiamo il nuovo requisito (15')

Prima a mano. Da pc_c:

```
traceroute -n 192.168.10.10    ! verso la sede A: r4, poi r1 (10.0.0.14)
traceroute -n 192.168.20.10    ! verso la sede B: r4, poi r3 (10.0.0.9)
```

Su r1, in `vtysh`, `show ip route ospf` deve mostrare la nuova rete 192.168.30.0/24 via 10.0.0.13 (r4). E la non regressione: da pc_a, `kathara exec pc_a "traceroute -n 192.168.20.10"` passa ancora per 10.0.0.2 (r2).

Poi il collaudo con il checker. Torniamo alla radice del repository e, con il virtualenv attivo, fermiamo il twin e lanciamo il checker:

```
cd ../../..
kathara lclean -d labs/lab2/ospf
python -m kathara_lab_checker --config lab2-digital-twin/checker/correction.yaml --lab labs/lab2/ospf --no-cache --report-type csv
```

Il checker attende 60 secondi per la convergenza OSPF prima di eseguire i test. Il dettaglio degli errori è in `labs/lab2/ospf/ospf_result_failed.csv`.

Cosa verifica:

- **il nuovo requisito:**
  - pc_c e lanC nella topologia, con i loro indirizzi;
  - `eth2` di r4 in area 0 e passiva;
  - la rotta verso 192.168.30.0/24 su tutti i router;
  - la raggiungibilità tra le tre sedi;
  - i percorsi da pc_c verso A e B;
- **la non regressione:**
  - adiacenze, costi e punto-punto invariati;
  - tabelle di routing complete;
  - loopback raggiungibili;
  - il traffico A↔B ancora via r2.

La soluzione passa 143 test su 143. La produzione così com'è ne passa 120 su 145: i test della non regressione passano e quelli della sede C falliscono. È il punto di partenza giusto.

### Errori frequenti

- **pc_c non compare**: dopo aver modificato `lab.conf` serve `kathara lrestart`.
- **r4 non ha `eth2`**: in `lab.conf` manca `r4[2]="lanC"`, o la numerazione salta un numero.
- **La sede C è isolata**: manca `network 192.168.30.0/24 area 0` su r4, oppure pc_c non ha la default route.
- **`eth2` non passiva**: OSPF cercherebbe vicini verso gli utenti, e il checker lo segnala.
- **Falliscono test che prima passavano**: oltre al nuovo requisito è cambiato altro, per esempio un costo. È una regressione: il collaudo serve proprio a scoprirla prima della produzione.
- **Su r2 la rete della sede C ha due next-hop**: non è un errore. I percorsi via r1 e via r3 costano uguale (ECMP), e il checker lo sa.

---

## Extra per casa: BFD nella rete OSPF

La seconda change request, BFD su tutti i link di backbone, è l'extra per casa alla fine del Lab 3: lì possiamo anche misurarne l'effetto con `chaos.py`. La traccia è in [lab3-api/README.md](../lab3-api/README.md#extra-per-casa--bfd-nella-rete-ospf).

---

## Esercizio extra: configurare OSPF da zero

Chi vuole esercitarsi sulla configurazione OSPF partendo da router senza configurazione trova scheletro, traccia e checker in [extra-ospf-da-zero/](extra-ospf-da-zero/TRACCIA.md).
