# Kathará per il digital twin di rete — Seminario GARR

Materiali per un seminario hands-on di 3 ore su [Kathará](https://www.kathara.org), l'emulatore di reti basato su container. Il filo conduttore è il **digital twin di una rete di produzione**: una copia fedele della rete, su cui validare configurazioni e modifiche prima di applicarle sugli apparati reali.

**Prima del seminario** preparate il PC seguendo [setup/INSTALL.md](setup/INSTALL.md) e lanciate lo script di verifica.

**Durante i laboratori** aprite nel browser [guida/index.html](guida/index.html) (basta un doppio clic, funziona anche offline). La guida vi accompagna passo per passo: comandi da copiare per il vostro sistema operativo, schermate di cosa dovreste vedere, suggerimenti e un lettore dei report del checker. L'avanzamento resta salvato nel vostro browser.

## Programma

| Tempo | Attività | Materiali |
|---|---|---|
| 40' | Introduzione a Kathará: architettura, `lab.conf`, startup, comandi principali, checker | — |
| 25' | **Lab 1** — Riscaldamento con rotte statiche | [lab1-statico/TRACCIA.md](lab1-statico/TRACCIA.md) |
| 10' | Pausa | |
| 50' | **Lab 2** — Digital twin di un backbone OSPF | [lab2-digital-twin/TRACCIA.md](lab2-digital-twin/TRACCIA.md) |
| 35' | **Lab 3** — Il twin con le API Python: guasti programmati | [lab3-api/README.md](lab3-api/README.md) |
| 10' | Progetti e chiusura | — |
| 10' | Margine per imprevisti | |

## I lab

1. **Lab 1 — Rotte statiche.** Quattro dispositivi in linea da creare da zero. Serve a prendere confidenza con il ciclo *configuro → provo → controllo con il checker → correggo*. Per chi finisce prima c'è un esercizio facoltativo con due VLAN tra le sedi, in `lab1-statico/extra-vlan/`.
2. **Lab 2 — Digital twin.** Un backbone OSPF di quattro router ad anello che collega due sedi, già in produzione. Ricevete il twin della rete in esercizio e una change request: attivare una terza sede. Applicate la change sul twin e la collaudate con il checker, che verifica sia la novità sia la non regressione. Per chi finisce prima c'è una seconda change request facoltativa: BFD sul backbone. Chi vuole esercitarsi a configurare OSPF da zero trova un esercizio extra in `lab2-digital-twin/extra-ospf-da-zero/`.
3. **Lab 3 — API.** Scrivete il vostro primo lab con le API Python di Kathará, ricostruendo da codice la topologia del Lab 1. Poi uno script avvia il vostro twin del Lab 2, abbatte i link e misura in tempo reale l'effetto sul traffico. Confronteremo un guasto "pulito", un guasto silenzioso e lo stesso guasto con BFD.

## Struttura del repository

```
setup/              guida di installazione e script di verifica del PC
guida/              guida interattiva ai laboratori (pagina statica, si apre nel browser)
lab1-statico/       traccia, soluzione e configurazione del checker del Lab 1
lab2-digital-twin/  traccia, rete di produzione, soluzioni (CR-042 e BFD), checker ed esercizio extra del Lab 2
lab3-api/           script Python del Lab 3
requirements.txt    pacchetti Python per tutto il seminario
```

Le cartelle `soluzione/` contengono i lab completi e funzionanti. Lavorate nella cartella `labs/`, che create voi seguendo le tracce.
