# Preparazione del PC

Completa questa guida **prima del seminario**: i download pesano qualche GB e in aula non ci sarà tempo per farli. Alla fine lancia lo script di verifica (punto 5): se stampa "Tutto pronto per il seminario!" sei a posto.

> Servono i **permessi di amministratore** sul PC per installare Docker e Kathará. Se usi un PC aziendale senza questi permessi, chiedi supporto in anticipo o organizzati per lavorare in coppia con un collega.

## 1. Docker

| Sistema | Cosa installare |
|---|---|
| Windows | Docker Desktop (con backend WSL 2) |
| macOS | Docker Desktop (Intel o Apple Silicon) |
| Linux | Docker Engine, e aggiungi il tuo utente al gruppo `docker` |

Istruzioni ufficiali: https://docs.docker.com/get-docker/

Su Windows e macOS, **avvia Docker Desktop** e attendi che sia pronto prima di proseguire.

## 2. Kathará

Segui la sezione *Installation* del repository ufficiale per il tuo sistema: https://github.com/KatharaFramework/Kathara#installation

Verifica l'installazione:

```
kathara check
```

L'ultima riga deve essere `✓ Container run successfully.`

## 3. Python ≥ 3.11 e virtualenv

Il checker automatico dei lab (`kathara-lab-checker`) richiede **Python 3.11 o superiore**. Controlla la versione con `python3 --version` (su Windows: `py --version`).

- **Windows**: installa Python da https://www.python.org/downloads/ e spunta "Add python.exe to PATH".
- **macOS**: il `python3` di sistema è troppo vecchio (3.9). Installa Python da https://www.python.org/downloads/ oppure con `brew install python@3.12`.
- **Linux**: le distribuzioni recenti (Ubuntu ≥ 23.04, Debian 12) hanno già Python ≥ 3.11. Potrebbe servire il pacchetto `python3-venv`.

Usiamo un **virtualenv**. Su molte distribuzioni Linux un `pip install` fuori da un virtualenv fallisce con l'errore `externally-managed-environment`. Dalla cartella del repository:

```
python3 -m venv .venv
```

Attivalo ogni volta che apri un nuovo terminale per il seminario:

| Sistema | Comando di attivazione |
|---|---|
| Linux / macOS | `source .venv/bin/activate` |
| Windows (PowerShell) | `.venv\Scripts\Activate.ps1` |

A virtualenv attivo il comando è semplicemente `python` (anche su Windows).

## 4. Pacchetti Python

Con il virtualenv attivo:

```
python -m pip install -r requirements.txt
```

Il comando installa `kathara-lab-checker` e le API Python di Kathará (pacchetto `kathara`), usate nel Lab 3.

## 5. Immagini e verifica finale

Scarica in anticipo le immagini usate nei lab:

```
docker pull kathara/base
docker pull kathara/frr
```

Poi, sempre con il virtualenv attivo e dalla cartella del repository:

```
python setup/verifica.py
```

Lo script controlla Python, i pacchetti, Docker, le immagini e avvia un mini-lab di prova. Per ogni voce marcata `KO` stampa l'indicazione per correggerla.
