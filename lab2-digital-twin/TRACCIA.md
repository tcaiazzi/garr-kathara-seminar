# Lab 2 — Digital twin: validare una change request (50 minuti)

## Lo scenario

Un ente ha due sedi collegate da un piccolo backbone regionale di quattro router ad anello, in esercizio con OSPF. Il team di rete ha in coda una **change request**: attivare una terza sede.

Prima di toccare la produzione, la change si prova sul **gemello digitale**: un lab Kathará con gli stessi dispositivi, gli stessi collegamenti, gli stessi indirizzi e le stesse configurazioni della rete reale. Il checker fa da collaudo: verifica che la novità funzioni **e** che il resto della rete continui a comportarsi esattamente come prima.

Il lab ha quattro fasi:

1. conoscere la rete di produzione (10');
2. leggere il ticket (5');
3. applicare la change sul twin (20');
4. verificare e collaudare con il checker (15').

---

## Scheda di rete — Backbone regionale in produzione

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

Ogni router ha una loopback `10.255.0.N/32` su `lo` (r1 → 10.255.0.1, …, r4 → 10.255.0.4), usata come router-id OSPF.

### Come è configurata la produzione

1. **OSPF in area 0** su tutti i router; sono annunciate le reti di backbone, le loopback e le LAN di sede.
2. Le interfacce verso le **LAN di sede sono passive**: nessuna adiacenza OSPF verso gli utenti.
3. Il traffico tra sede A e sede B passa **per r2** (percorso primario); il percorso via r4 è di **backup**. Costi: **10** su n12 e n23, **100** su n34 e n41.
4. Ogni router raggiunge le **loopback** di tutti gli altri.
5. I link di backbone sono **punto-punto** in OSPF (niente elezione DR/BDR).

---

## Fase 1 — Conoscere la rete di produzione (10')

La cartella `produzione/` contiene il twin della rete in esercizio, già configurato. Copiatelo nella vostra cartella di lavoro e avviatelo.

Linux / macOS:

```
mkdir -p labs/lab2
cp -r lab2-digital-twin/produzione labs/lab2/mio-lab2
cd labs/lab2/mio-lab2
kathara lstart
```

Windows (PowerShell):

```
New-Item -ItemType Directory -Force labs\lab2
Copy-Item -Recurse lab2-digital-twin\produzione labs\lab2\mio-lab2
cd labs\lab2\mio-lab2
kathara lstart
```

Esplorate la rete. Su un router (`kathara connect r1`, poi `vtysh` per la CLI di FRR):

```
show ip ospf neighbor          ! adiacenze: due vicini per router, Full/-
show ip ospf interface         ! area, costo, tipo di rete, passive
show ip route ospf             ! rotte imparate via OSPF
```

Da pca:

```
traceroute -n 192.168.20.10    ! il secondo hop è 10.0.0.2 (r2)
```

**Prova di failover.** Spegnete n12 **a entrambe le estremità**: in Kathará un dominio di collisione è uno switch virtuale, e se spegnete un solo lato l'altro non se ne accorge.

```
kathara exec r1 "ip link set eth1 down"
kathara exec r2 "ip link set eth0 down"
kathara exec pca "traceroute -n 192.168.20.10"    # ora passa per r4
kathara exec r1 "ip link set eth1 up"
kathara exec r2 "ip link set eth0 up"
```

Domande per orientarsi: qual è il next-hop di r1 verso la sede B, e con che costo? Perché r2 ha due next-hop verso la loopback di r4?

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
> | Host di sede `pcc`, `eth0` | 192.168.30.10/24, gateway 192.168.30.1 |
> | Immagine di `pcc` | `kathara/base` |
>
> **Requisiti**
>
> 1. La rete della sede C è annunciata in OSPF, **area 0**.
> 2. L'interfaccia di r4 verso la sede C è **passiva**.
> 3. La sede C raggiunge le sedi A e B, e viceversa.
> 4. **Nessun impatto sul resto della rete**: adiacenze, costi e percorsi esistenti restano invariati; in particolare il traffico tra A e B passa ancora per r2.
>
> **Criterio di accettazione.** Il collaudo `lab2-digital-twin/checker/correction.yaml` passa al 100%.

Dopo la change, la topologia diventa così:

```
 pca ─────────── r1 ───────── n12 ───────── r2
       lanA       │                          │
                 n41                        n23
                  │                          │
                 r4 ───────── n34 ───────── r3 ─────────── pcb
                  │                                 lanB
                  │ lanC 192.168.30.0/24   (CR-042)
                 pcc
               sede C
```

---

## Fase 3 — Applicare la change sul twin (20')

Lavorate nella vostra copia, `labs/lab2/mio-lab2`. La change tocca **quattro file**:

| File | Cosa cambia |
|---|---|
| `lab.conf` | il nuovo dispositivo `pcc` sul dominio `lanC`, e la nuova interfaccia di r4 sullo stesso dominio |
| `r4.startup` | l'indirizzo della nuova interfaccia di r4 |
| `pcc.startup` (nuovo) | indirizzo e default route dell'host della sede C |
| `r4/etc/frr/frr.conf` | la nuova LAN in OSPF, come interfaccia passiva |

Poi riavviate il twin, che rilegge anche `lab.conf`:

```
kathara lrestart
```

<details>
<summary>Suggerimento 1 · la sintassi che serve</summary>

- In `lab.conf` le interfacce di un dispositivo sono numerate senza buchi: r4 ha già `eth0` ed `eth1`, quindi la nuova è `r4[2]`.
- Un host ha bisogno di un indirizzo e di una default route, come `pca` e `pcb`: guardate i loro file `.startup`.
- In FRR, come per le LAN di r1 e r3: un blocco `interface ethX` con `ip ospf passive` e un'istruzione `network <rete>/<prefisso> area 0` sotto `router ospf`.

</details>

<details>
<summary>Suggerimento 2 · le righe da aggiungere su r4</summary>

```
! LAN della sede C (CR-042): annunciata ma passiva
interface eth2
 ip ospf passive
!
router ospf
 ...
 network 192.168.30.0/24 area 0
```

</details>

---

## Fase 4 — Verificare e collaudare (15')

Prima a mano. Da pcc:

```
traceroute -n 192.168.10.10    ! verso la sede A: r4, poi r1 (10.0.0.14)
traceroute -n 192.168.20.10    ! verso la sede B: r4, poi r3 (10.0.0.9)
```

Su r1, in `vtysh`, `show ip route ospf` deve mostrare la nuova rete 192.168.30.0/24 via 10.0.0.13 (r4). E la non regressione: da pca, `traceroute -n 192.168.20.10` passa ancora per 10.0.0.2.

Poi il collaudo. Fermate il twin (`kathara lclean`) e, dalla radice del repository, con il virtualenv attivo:

```
python -m kathara_lab_checker --config lab2-digital-twin/checker/correction.yaml --lab labs/lab2/mio-lab2 --no-cache --report-type csv
```

Il checker attende 60 secondi per la convergenza OSPF prima di eseguire i test. Il dettaglio degli errori è in `labs/lab2/mio-lab2/mio-lab2_result_failed.csv`.

Cosa verifica:

- **la change:**
  - pcc e lanC nella topologia, con i loro indirizzi;
  - `eth2` di r4 in area 0 e passiva;
  - la rotta verso 192.168.30.0/24 su tutti i router;
  - la raggiungibilità tra le tre sedi;
  - i percorsi da pcc verso A e B;
- **la non regressione:**
  - adiacenze, costi e tipo di rete invariati;
  - tabelle di routing complete;
  - loopback raggiungibili;
  - il traffico A↔B ancora via r2.

Se lanciate il checker sulla cartella `produzione/` così com'è, i test della non regressione passano e quelli della change falliscono: è il punto di partenza giusto.

### Errori frequenti

- **pcc non compare**: `lab.conf` è stato modificato ma il lab non è stato riavviato con `kathara lrestart`.
- **r4 non ha `eth2`**: in `lab.conf` manca `r4[2]="lanC"`, o la numerazione salta un numero.
- **La sede C non raggiunge A e B**: manca `network 192.168.30.0/24 area 0` su r4, oppure pcc non ha la default route.
- **Il test sulle interfacce OSPF di r4 fallisce**: `eth2` non è passiva.
- **Falliscono test che prima passavano**: la change ha toccato altro, per esempio un costo. Il collaudo serve proprio a scoprirlo prima della produzione.
- **Su r2 la rete della sede C ha due next-hop**: non è un errore. I percorsi via r1 e via r3 costano uguale (ECMP), e il checker lo sa.

---

## Per chi finisce prima: change request "BFD sul backbone"

Il team di produzione segnala un altro problema. Su alcuni collegamenti in fibra, un guasto lascia l'interfaccia *up* ma il traffico non passa più. OSPF se ne accorge solo allo scadere del dead interval (40 secondi), e per tutto quel tempo il traffico viene perso. La change request è:

> Abilitare **BFD** su tutti i link di backbone, associato a OSPF, con i timer di default.

Da fare, sulla rete che include già la sede C:

1. attivare il demone `bfdd` in `daemons` (`bfdd=yes`) su tutti i router;
2. aggiungere `ip ospf bfd` alle interfacce di backbone (non alle LAN di sede);
3. verificare con `show bfd peers` (in `vtysh`) che tutte le sessioni siano `up`;
4. collaudare con il checker dedicato:

```
python -m kathara_lab_checker --config lab2-digital-twin/checker/correction-bfd.yaml --lab labs/lab2/mio-lab2 --no-cache --report-type csv
```

Nel Lab 3 misureremo l'effetto di questa modifica sul twin.

---

## Esercizio extra: configurare OSPF da zero

Chi vuole esercitarsi sulla configurazione OSPF partendo da router senza configurazione trova scheletro, traccia e checker in [extra-ospf-da-zero/](extra-ospf-da-zero/TRACCIA.md).
