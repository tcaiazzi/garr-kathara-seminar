# Emulazione di scenari di rete complessi e Digital Twin con Kathará - Workshop GARR

Questo repository contiene i materiali per il corso ["Emulazione di scenari di rete complessi e Digital Twin con Kathará"](https://learning.garr.it/enrol/index.php?id=442) per la giornata di formazione del Workshop GARR 2026.

Il corso prevede una introduzione a [Kathará](https://www.kathara.org/) e al suo utilizzo per proseguire con una parte pratica di laboratorio.

## Setup dell'ambiente di lavoro

**Prima del seminario** prepariamo il PC seguendo [setup/INSTALL.md](setup/INSTALL.md) e lanciamo lo script di verifica.

**Facoltativo**: Durante i laboratori apriamo nel browser [guida/index.html](guida/index.html) (basta un doppio clic, funziona anche offline). La guida ci accompagna passo per passo: comandi da copiare per il nostro sistema operativo, schermate di cosa dovremmo vedere, suggerimenti e un lettore dei report del checker. L'avanzamento resta salvato nel browser.

## I lab

1. **Lab 1 — Rotte statiche.** Quattro dispositivi in linea da creare da zero. Per chi finisce prima c'è un esercizio facoltativo con due VLAN tra le sedi, in `lab1-statico/extra-vlan/`.
2. **Lab 2 — Digital twin di una rete OSPF.** Una rete OSPF di quattro router ad anello che collega due sedi, già in produzione. Riceviamo il twin della rete in esercizio e un nuovo requisito: attivare una terza sede. Applichiamo il nuovo requisito sul twin e lo collaudiamo con il checker, che verifica sia la novità sia la non regressione. Chi vuole esercitarsi a configurare OSPF da zero trova un esercizio extra in `lab2-digital-twin/extra-ospf-da-zero/`.
3. **Lab 3 — Il twin diventa codice.** Un esempio di come possiamo scrivere il primo lab con le API Python di Kathará, ricostruendo da codice la topologia. Utilizziamo uno script python che avvia il nostro twin del Lab 2, abbatte i link e misura in tempo reale l'effetto sul traffico: confrontiamo un guasto "pulito" e un guasto silenzioso. 
4. **Extra — BFD nella rete OSPF.** Risolviamo il guasto silenzioso configurando BFD. La traccia è in fondo a [lab3-api/README.md](lab3-api/README.md#extra-per-casa--bfd-nella-rete-ospf).

## Struttura del repository

```
setup/              guida di installazione e script di verifica del PC
guida/              guida interattiva ai laboratori (pagina statica, si apre nel browser)
lab1-statico/       traccia, soluzione e checker del Lab 1, ed esercizio extra sulle VLAN
lab2-digital-twin/  traccia, rete di produzione, soluzioni (CR-042 e BFD), checker ed esercizio extra su OSPF da zero
lab3-api/           script Python del Lab 3 e traccia dell'extra su BFD
labs/               le nostre copie di lavoro dei lab (la creiamo seguendo le tracce)
requirements.txt    pacchetti Python per tutto il seminario
```

Le cartelle `soluzione/` contengono i lab completi e funzionanti. Lavoriamo nella cartella `labs/`, che creiamo seguendo le tracce.
