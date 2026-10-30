# Lab 1, esercizio extra — Due VLAN tra le sedi

> Esercizio facoltativo, per chi ha finito il Lab 1 prima degli altri o vuole continuare a casa.

## Lo scenario

Nelle due sedi ci sono quattro computer, ognuno collegato a una **porta dedicata** dello switch della sua sede:

- sede A: **pc1** e **pc4**, collegati a s1;
- sede B: **pc2** e **pc3**, collegati a s2.

I computer devono essere raggruppati in due reti logiche che attraversano le sedi:

- la **VLAN 100** unisce i computer **pari**, pc2 e pc4;
- la **VLAN 101** unisce i computer **dispari**, pc1 e pc3.

Come nelle reti reali, **gli host non sanno di essere in una VLAN**: hanno solo un indirizzo su `eth0`. È lo switch a decidere la VLAN in base alla porta su cui arriva il frame (porta di **accesso**) e ad aggiungere il tag 802.1Q quando il frame passa sul collegamento n12 tra s1 e s2 (il **trunk**).

L'esercizio è solo di **livello 2**: al posto dei router del Lab 1 ci sono due switch, s1 e s2, senza indirizzi IP e senza rotte.

## Topologia

```
        sede A                                                  sede B

 pc1 ── lan1 ── eth0 ┐                                   ┌ eth1 ── lan2 ── pc2
 VLAN 101            │                                   │            VLAN 100
                     s1 eth1 ═══════ n12 · trunk ═══════ eth0 s2
 pc4 ── lan4 ── eth2 ┘    VLAN 100 e 101 taggate (802.1Q)└ eth2 ── lan3 ── pc3
 VLAN 100                                                             VLAN 101
```

## Piano di indirizzamento

Ogni VLAN ha la sua subnet: il numero della VLAN si ritrova nell'indirizzo.

| Dispositivo | Interfaccia | Dominio | Ruolo | VLAN | Indirizzo |
|---|---|---|---|---|---|
| pc1 | eth0 | lan1 | host | 101 | 10.101.0.1/24 |
| pc4 | eth0 | lan4 | host | 100 | 10.100.0.4/24 |
| pc2 | eth0 | lan2 | host | 100 | 10.100.0.2/24 |
| pc3 | eth0 | lan3 | host | 101 | 10.101.0.3/24 |
| s1 | eth0 | lan1 | accesso | 101 | — |
| s1 | eth1 | n12 | trunk | 100, 101 | — |
| s1 | eth2 | lan4 | accesso | 100 | — |
| s2 | eth0 | n12 | trunk | 100, 101 | — |
| s2 | eth1 | lan2 | accesso | 100 | — |
| s2 | eth2 | lan3 | accesso | 101 | — |

- Gli host hanno solo l'indirizzo, **senza gateway**. Immagine `kathara/base` per tutti.
- Gli switch **non hanno indirizzi IP**: per ogni VLAN servono una sottointerfaccia sul trunk e un **bridge** che la unisce alla porta di accesso.
- Nomi delle sottointerfacce: `ethX.VID`, per esempio `eth1.100` è la VLAN 100 su eth1. Il checker usa questi nomi.

## 1. Partiamo dal template

La cartella `lab1-statico/extra-vlan/partenza/` contiene il lab di partenza: il `lab.conf` è già completo, con i sei dispositivi e i cinque domini di collisione della tabella, e ogni dispositivo ha il suo file `.startup`, per ora solo con un commento. Dalla radice del repository copiamolo nella nostra cartella di lavoro ed entriamoci.

Linux / macOS:

```
mkdir -p labs/lab1
cp -r lab1-statico/extra-vlan/partenza labs/lab1/vlan
cd labs/lab1/vlan
```

Windows (PowerShell):

```
New-Item -ItemType Directory -Force labs\lab1
Copy-Item -Recurse lab1-statico\extra-vlan\partenza labs\lab1\vlan
cd labs\lab1\vlan
```

Leggiamo `lab.conf` e confrontiamolo con la tabella: quale interfaccia di s1 e s2 è una porta di accesso e quale è il trunk? Poi completiamo i sei file `.startup`; `lab.conf` non va modificato.

## 2. Promemoria della sintassi

Su un **host** non c'è niente di speciale: un indirizzo su `eth0`, come se la VLAN non esistesse.

```
# pc1.startup
ip address add 10.101.0.1/24 dev eth0
```

Su uno **switch**, per ogni VLAN: una sottointerfaccia sul trunk e un bridge che la unisce alla porta di accesso. La porta di accesso entra nel bridge così com'è, senza sottointerfaccia: tutto ciò che arriva da lì appartiene a quella VLAN.

```
# s1.startup, VLAN 101 (porta di accesso eth0, trunk eth1)
ip link add link eth1 name eth1.101 type vlan id 101
ip link add br101 type bridge
ip link set eth0 master br101
ip link set eth1.101 master br101
ip link set eth1.101 up
ip link set br101 up
```

Il frame di pc1 entra da `eth0` senza tag; il bridge lo inoltra a `eth1.101`, che lo invia su n12 con il tag 101. Su s2, `eth0.101` toglie il tag e il bridge consegna il frame alla porta di pc3.

Le sottointerfacce e i bridge nascono spenti: a differenza delle `ethX`, vanno portati su a mano. Attenzione a quale interfaccia è il trunk: su s1 è `eth1`, su s2 è `eth0`.

## 3. Verifichiamo le VLAN

Avviamo il lab (`kathara lstart`) e proviamo:

```
kathara exec pc1 "ping -c 3 10.101.0.3"     # VLAN 101: sede A -> sede B
kathara exec pc4 "ping -c 3 10.100.0.2"     # VLAN 100: sede A -> sede B
kathara exec s1 "bridge link"               # le porte nei bridge
```

**Dove compare il tag.** Lasciamo un ping da pc1 a pc3 in un terminale (`kathara exec pc1 "ping 10.101.0.3"`) e, in un altro, catturiamo su s1:

```
kathara exec s1 "tcpdump -e -n -c 2 -i eth0 icmp"   # porta di accesso: frame senza tag
kathara exec s1 "tcpdump -e -n -c 2 -i eth1 icmp"   # trunk: gli stessi frame, con "vlan 101"
```

Gli stessi pacchetti compaiono senza tag sulla porta di pc1 e con `802.1Q … vlan 101` sul trunk. pc4 invece non vede nulla: è su un'altra LAN e in un'altra VLAN.

## 4. Controlliamo con il checker

Torniamo alla radice del repository e, con il virtualenv attivo, fermiamo il lab e lanciamo il checker:

```
cd ../../..
kathara lclean -d labs/lab1/vlan
python -m kathara_lab_checker --config lab1-statico/extra-vlan/checker/correction.yaml --lab labs/lab1/vlan --no-cache --report-type csv
```

La soluzione completa passa 42 test su 42; il template di partenza così com'è ne passa 22, cioè solo quelli sulla topologia. Cosa controlla:

- la topologia con le quattro LAN;
- gli indirizzi degli host, su `eth0`;
- la raggiungibilità dentro ogni VLAN, tra le sedi;
- che ogni porta di accesso sia nel bridge della sua VLAN;
- che le sottointerfacce sul trunk usino il VLAN id giusto e siano nel bridge giusto.

La soluzione è in `lab1-statico/extra-vlan/soluzione/`.

## Errori frequenti

- **Porta di accesso nel bridge sbagliato**: per esempio `eth2` di s1 in `br101`. pc4 finisce nella VLAN 101 e non raggiunge più pc2.
- **VLAN id diversi sul trunk**: s1 e s2 devono usare lo stesso id per la stessa VLAN, altrimenti il frame arriva ma nessun bridge lo accetta.
- **Sottointerfaccia o bridge spenti**: serve `ip link set … up` per `ethX.VID` e per `brVID`.
- **Indirizzo IP sulla porta di accesso dello switch**: non serve, e una porta dentro un bridge non lo usa. Gli switch lavorano solo a livello 2.
- **Sottointerfacce VLAN sugli host**: gli host non taggano; il tag lo mette lo switch.
- **Un dispositivo non compare**: dopo aver modificato `lab.conf` serve `kathara lrestart`.
