#!/usr/bin/env python3
"""Verifica che il PC sia pronto per il seminario.

Da lanciare dentro il virtualenv del seminario:
    python setup/verifica.py

Controlla Python, i pacchetti, Docker, le immagini e infine avvia un mini-lab
di due dispositivi per provare un ping. Alla fine stampa un riepilogo.
"""
import shutil
import subprocess
import sys

results = []


def report(name, ok, hint=""):
    results.append(ok)
    print(f"[{'OK' if ok else 'KO'}] {name}" + ("" if ok or not hint else f"\n     -> {hint}"))


# 1. Python >= 3.11 (richiesto da kathara-lab-checker)
report(f"Python {sys.version.split()[0]}", sys.version_info >= (3, 11), "serve Python 3.11 o superiore")

# 2. Pacchetti Python
try:
    import kathara_lab_checker  # noqa: F401
    report("kathara-lab-checker installato", True)
except ImportError:
    report("kathara-lab-checker installato", False, "python -m pip install -r requirements.txt")

try:
    from Kathara.manager.Kathara import Kathara
    from Kathara.model.Lab import Lab
    report("API Python di Kathara installate", True)
except ImportError:
    report("API Python di Kathara installate", False, "python -m pip install -r requirements.txt")
    Kathara = None

# 3. Kathara da riga di comando
report("comando kathara disponibile", shutil.which("kathara") is not None,
       "installiamo Kathara: https://github.com/KatharaFramework/Kathara#installation")

# 4. Docker e immagini
docker = shutil.which("docker")
report("comando docker disponibile", docker is not None, "installiamo Docker: https://docs.docker.com/get-docker/")
if docker:
    running = subprocess.run([docker, "info"], capture_output=True).returncode == 0
    report("Docker in esecuzione", running, "avviamo Docker Desktop (o il servizio docker su Linux)")
    for image in ("kathara/base", "kathara/frr"):
        present = subprocess.run([docker, "image", "inspect", image], capture_output=True).returncode == 0
        report(f"immagine {image} scaricata", present, f"docker pull {image}")

# 5. Mini-lab: due dispositivi su un dominio di collisione, ping dall'uno all'altro
if Kathara and all(results):
    manager = Kathara.get_instance()
    lab = Lab("garr-verifica")
    for name, address in (("a", "10.99.0.1/24"), ("b", "10.99.0.2/24")):
        machine = lab.new_machine(name, image="kathara/base")
        lab.connect_machine_to_link(name, "x", machine_iface_number=0)
        lab.create_startup_file_from_list(machine, [f"ip address add {address} dev eth0"])
    try:
        manager.undeploy_lab(lab=lab)
        manager.deploy_lab(lab)
        _, _, exit_code = manager.exec("a", "ping -c 3 10.99.0.2", lab=lab, wait=True, stream=False)
        report("mini-lab avviato e ping riuscito", exit_code == 0)
    except Exception as error:
        report("mini-lab avviato e ping riuscito", False, str(error))
    finally:
        manager.undeploy_lab(lab=lab)
elif Kathara:
    print("[--] mini-lab saltato: correggiamo prima i punti KO")

print()
if all(results):
    print("Tutto pronto per il seminario!")
else:
    print("Qualcosa non va: seguiamo le indicazioni accanto ai KO e rilanciamo lo script.")
    sys.exit(1)
