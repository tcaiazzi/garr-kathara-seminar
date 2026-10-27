# Lab 1, esercizio extra — Due VLAN tra le sedi

> Esercizio facoltativo, per chi ha finito il Lab 1 prima degli altri o vuole continuare a casa. Si parte dal Lab 1 funzionante.

## Lo scenario

Nelle due sedi arrivano due nuovi computer:

- **pc4**, nella LAN della sede A, insieme a pc1;
- **pc3**, nella LAN della sede B, insieme a pc2.

I computer devono essere raggruppati in due reti logiche che attraversano le sedi:

- la **VLAN 100** unisce i computer **pari**, pc2 e pc4;
- la **VLAN 101** unisce i computer **dispari**, pc1 e pc3.

Ogni VLAN mette in comunicazione un host della sede A con uno della sede B, quindi deve passare sul collegamento n12 tra r1 e r2. Il routing statico del Lab 1 tra le due LAN deve continuare a funzionare come prima.

## Topologia

```
        sede A                                               sede B
     (lanA, hub)                                          (lanB, hub)

 pc1 ──┐                                                      ┌── pc2
 VLAN  │                                                      │  VLAN
 101   ├──── r1 ═══════════ n12 · trunk ═══════════ r2 ───────┤  100
 pc4 ──┘          VLAN 100 e 101 taggate (802.1Q)             └── pc3
 VLAN                                                            VLAN
 100                                                             101
```

## Piano di indirizzamento

Ogni VLAN ha la sua subnet, come nelle reti reali: il numero della VLAN si ritrova nell'indirizzo.

| Dispositivo | Interfaccia | Dominio | VLAN | Indirizzo |
|---|---|---|---|---|
| pc1 | eth0 | lanA | — | 192.168.1.10/24 (come nel Lab 1) |
| pc1 | eth0.101 | lanA | 101 | 10.101.0.1/24 |
| pc4 | eth0.100 | lanA | 100 | 10.100.0.4/24 |
| pc2 | eth0 | lanB | — | 192.168.2.10/24 (come nel Lab 1) |
| pc2 | eth0.100 | lanB | 100 | 10.100.0.2/24 |
| pc3 | eth0.101 | lanB | 101 | 10.101.0.3/24 |

- pc3 e pc4 hanno solo l'indirizzo sulla loro VLAN e nessun gateway; immagine `kathara/base` come gli altri.
- Su **r1** e **r2** le VLAN sono solo di livello 2: per ogni VLAN servono una sottointerfaccia verso la LAN, una verso il trunk su n12 e un **bridge** che le unisce. I bridge non hanno indirizzi IP.
- Nomi delle sottointerfacce: `ethX.VID`, per esempio `eth1.100` è la VLAN 100 su eth1. Il checker usa questi nomi.

## 1. Partite dal vostro Lab 1

Linux / macOS:

```
cp -r labs/lab1/mio-lab1 labs/lab1/mio-lab1-vlan
cd labs/lab1/mio-lab1-vlan
```

Windows (PowerShell):

```
Copy-Item -Recurse labs\lab1\mio-lab1 labs\lab1\mio-lab1-vlan
cd labs\lab1\mio-lab1-vlan
```

Se il vostro Lab 1 non è completo, copiate invece `lab1-statico/soluzione`. Poi:

- aggiungete **pc3** e **pc4** in `lab.conf`, sui domini giusti;
- create `pc3.startup` e `pc4.startup`;
- completate gli startup di pc1, pc2, r1 e r2.

## 2. Promemoria della sintassi

Una **sottointerfaccia VLAN** su un host. Le sottointerfacce nascono spente: a differenza delle `ethX`, vanno portate su a mano.

```
ip link add link eth0 name eth0.101 type vlan id 101
ip address add 10.101.0.1/24 dev eth0.101
ip link set eth0.101 up
```

Un **bridge** su un router, per una VLAN: unisce la sottointerfaccia della LAN e quella del trunk.

```
ip link add link eth0 name eth0.100 type vlan id 100
ip link add link eth1 name eth1.100 type vlan id 100
ip link add br100 type bridge
ip link set eth0.100 master br100
ip link set eth1.100 master br100
ip link set eth0.100 up
ip link set eth1.100 up
ip link set br100 up
```

Attenzione a quale interfaccia è il trunk: su r1 è `eth1`, su r2 è `eth0`.

## 3. Verificate

Riavviate il lab (`kathara lrestart`) e provate:

```
kathara exec pc1 "ping -c 3 10.101.0.3"     # VLAN 101: sede A -> sede B
kathara exec pc4 "ping -c 3 10.100.0.2"     # VLAN 100: sede A -> sede B
kathara exec pc1 "ping -c 3 192.168.2.10"   # il Lab 1 funziona ancora
kathara exec r1 "bridge link"               # le sottointerfacce nei bridge
```

**Un'osservazione sull'isolamento.** I domini di collisione di Kathará sono hub: pc4 riceve fisicamente anche i frame della VLAN 101. Lasciate un ping da pc1 a pc3 in un terminale e, su pc4, confrontate:

```
tcpdump -e -n -i eth0 icmp        # si vedono i frame taggati "vlan 101"
tcpdump -n -i eth0.100 icmp       # niente: la VLAN 100 non li riceve
```

È il tag 802.1Q a separare le due reti logiche, anche sullo stesso cavo.

## 4. Controllo con il checker

Fermate il lab (`kathara lclean`) e, dalla radice del repository, con il virtualenv attivo:

```
python -m kathara_lab_checker --config lab1-statico/extra-vlan/checker/correction.yaml --lab labs/lab1/mio-lab1-vlan --no-cache --report-type csv
```

Cosa controlla:

- la topologia con pc3 e pc4;
- gli indirizzi, anche sulle sottointerfacce VLAN;
- che le rotte statiche del Lab 1 non siano cambiate;
- la raggiungibilità dentro ogni VLAN e tra le sedi;
- che su r1 e r2 le sottointerfacce verso la LAN e verso il trunk usino il VLAN id giusto.

La soluzione è in `lab1-statico/extra-vlan/soluzione/`.

## Errori frequenti

- **La sottointerfaccia non risponde**: è rimasta spenta. Serve `ip link set ethX.VID up`, anche per il bridge.
- **Il ping dentro la VLAN non passa**: il VLAN id dell'host non coincide con quello del router, oppure una sottointerfaccia non è stata agganciata al bridge (`ip link set … master brVID`).
- **Funziona solo da una parte**: il trunk è configurato su un solo router. La VLAN deve esistere sia su r1 sia su r2, verso la LAN e verso n12.
- **pc3 o pc4 non compaiono**: dopo aver modificato `lab.conf` serve `kathara lrestart`.
