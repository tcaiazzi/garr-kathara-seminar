# Preparazione del PC

Completiamo questa guida **prima del seminario**: i download pesano qualche GB e in aula non ci sarà tempo per farli. Alla fine lanciamo lo script di verifica (punto 5): se stampa "Tutto pronto per il seminario!" siamo a posto.

> Servono i **permessi di amministratore** sul PC per installare Docker e Kathará. Con un PC aziendale senza questi permessi, chiediamo supporto in anticipo o organizziamoci per lavorare in coppia con un collega.

## 1. Docker

| Sistema | Cosa installare |
|---|---|
| Windows | Docker Desktop (con backend WSL 2) |
| macOS | Docker Desktop (Intel o Apple Silicon) |
| Linux | Docker Engine, e aggiungiamo il nostro utente al gruppo `docker` |

Istruzioni ufficiali: https://docs.docker.com/get-docker/

Su Windows e macOS, **avviamo Docker Desktop** e attendiamo che sia pronto prima di proseguire.

## 2. Kathará

Seguiamo la sezione *Installation* del repository ufficiale per il nostro sistema: https://github.com/KatharaFramework/Kathara#installation

Verifichiamo l'installazione:

```
kathara check
```

L'ultima riga deve essere `✓ Container run successfully.`

## 3. Python ≥ 3.11 e virtualenv

Il checker automatico dei lab (`kathara-lab-checker`) richiede **Python 3.11 o superiore**. Controlliamo la versione con `python3 --version` (su Windows: `py --version`).

- **Windows**: installiamo Python da https://www.python.org/downloads/ e spuntiamo "Add python.exe to PATH".
- **macOS**: il `python3` di sistema è troppo vecchio (3.9). Installiamo Python da https://www.python.org/downloads/ oppure con `brew install python@3.12`.
- **Linux**: le distribuzioni recenti (Ubuntu ≥ 23.04, Debian 12) hanno già Python ≥ 3.11. Potrebbe servire il pacchetto `python3-venv`.

Usiamo un **virtualenv**. Su molte distribuzioni Linux un `pip install` fuori da un virtualenv fallisce con l'errore `externally-managed-environment`. Dalla cartella del repository:

```
python3 -m venv .venv
```

Attiviamolo ogni volta che apriamo un nuovo terminale per il seminario:

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

Scarichiamo in anticipo le immagini usate nei lab:

```
docker pull kathara/base
docker pull kathara/frr
```

Poi, sempre con il virtualenv attivo e dalla cartella del repository:

```
python setup/verifica.py
```

Lo script controlla Python, i pacchetti, Docker, le immagini e avvia un mini-lab di prova. Per ogni voce marcata `KO` stampa l'indicazione per correggerla.

## macOS: VS Code e i terminali dei dispositivi

Su macOS, se lanciamo `kathara lstart` dal terminale integrato di VS Code, i terminali dei dispositivi possono non aprirsi. Non è un problema di Kathará ma di permessi: macOS non permette a VS Code di controllare l'app Terminale finché non gliene diamo il permesso.

**Soluzione rapida**: lanciamo i comandi di Kathará da un terminale esterno (l'app Terminale), sempre dalla radice del repository e con il virtualenv attivo.

Per usare invece il terminale integrato di VS Code, diamogli il permesso una volta sola:

1. Dall'app Terminale (**non** da VS Code) azzeriamo i permessi di Automazione di VS Code:

   ```
   tccutil reset AppleEvents com.microsoft.VSCode
   ```

2. Chiudiamo VS Code del tutto con **Cmd+Q** e riapriamolo.
3. Dal terminale integrato di VS Code facciamo comparire la richiesta con un comando minimo:

   ```
   osascript -e 'tell application "Terminal" to do script "echo ok"'
   ```

   Compare il popup «Visual Studio Code vuole controllare Terminal»: clicchiamo **OK**. Da quel momento Terminal compare sotto VS Code in *Impostazioni di Sistema → Privacy e sicurezza → Automazione*, e `kathara lstart` funziona anche dal terminale integrato.
