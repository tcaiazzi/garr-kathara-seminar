#!/usr/bin/env python3
"""Lab 3, parte A - Il nostro primo lab con le API di Kathara.

Ricostruisce da codice la topologia del Lab 1 (pc1 - r1 - r2 - pc2), la avvia,
fa un ping da pc1 a pc2 e alla fine la ferma.

Completiamo i cinque TODO: ognuno e' una chiamata a todo(...) da sostituire con
la chiamata giusta alle API. Lanciamo lo script dopo ogni TODO: si ferma al
primo che manca e ci dice quale.

Uso (dalla radice del repository):
    python lab3-api/primo_lab.py
"""
from Kathara.manager.Kathara import Kathara
from Kathara.model.Lab import Lab

LAB_NAME = "primo-lab"
IMAGE = "kathara/base"

# La traccia del Lab 1, come dati. Per ogni dispositivo: le interfacce in
# ordine (eth0, eth1, ...) come (dominio di collisione, indirizzo) e le rotte
# da aggiungere all'avvio.
DEVICES = {
    "pc1": {"interfaces": [("lanA", "192.168.1.10/24")],
            "routes": ["default via 192.168.1.1"]},
    "r1": {"interfaces": [("lanA", "192.168.1.1/24"), ("n12", "10.0.12.1/30")],
           "routes": ["192.168.2.0/24 via 10.0.12.2"]},
    "r2": {"interfaces": [("n12", "10.0.12.2/30"), ("lanB", "192.168.2.1/24")],
           "routes": ["192.168.1.0/24 via 10.0.12.1"]},
    "pc2": {"interfaces": [("lanB", "192.168.2.10/24")],
            "routes": ["default via 192.168.2.1"]},
}


def todo(number, hint):
    """Segnaposto: va sostituito con la chiamata giusta."""
    raise NotImplementedError(f"TODO {number} da completare: {hint}")


def build_lab():
    """Costruisce il modello Lab/Machine/Link, senza avviarlo."""
    lab = Lab(LAB_NAME)
    for name, device in DEVICES.items():
        # TODO 1: il dispositivo, con l'immagine IMAGE. Restituisce un oggetto Machine.
        machine = todo(1, "creiamo il dispositivo con lab.new_machine(...)")

        startup = []
        for number, (domain, address) in enumerate(device["interfaces"]):
            # TODO 2: l'interfaccia eth<number> sul dominio di collisione `domain`
            todo(2, "colleghiamo il dispositivo al dominio con lab.connect_machine_to_link(...)")
            startup.append(f"ip address add {address} dev eth{number}")
        startup += [f"ip route add {route}" for route in device["routes"]]

        # TODO 3: il file .startup del dispositivo, con le righe in `startup`
        todo(3, "scriviamo lo startup con lab.create_startup_file_from_list(...)")

    # Verifica la coerenza del modello (interfacce contigue, link validi, ...)
    lab.check_integrity()
    return lab


def main():
    manager = Kathara.get_instance()
    lab = build_lab()
    print(f"Modello pronto: {len(lab.machines)} dispositivi, {len(lab.links)} domini di collisione")

    # Se un'esecuzione precedente si e' interrotta a meta', ripulisce
    manager.undeploy_lab(lab_name=LAB_NAME)
    try:
        # TODO 4: l'avvio del lab
        todo(4, "avviamo il lab con manager.deploy_lab(...)")
        print("Lab avviato. Ping da pc1 verso pc2...")

        # TODO 5: il ping da pc1 verso pc2 (192.168.2.10) con manager.exec(...).
        # Parametri:
        #   machine_name  il dispositivo su cui eseguire il comando: "pc1"
        #   command       il comando, come stringa: "ping -c 3 192.168.2.10"
        #   lab           il lab in cui si trova il dispositivo: l'oggetto `lab`
        #                 (in alternativa si puo' passare lab_name o lab_hash)
        #   wait          True: prima di eseguire il comando aspetta che pc1 abbia
        #                 finito il suo .startup; senza, il ping puo' partire prima
        #                 che pc1 abbia indirizzo e default route
        #   stream        False: restituisce tutto insieme la tupla
        #                 (stdout, stderr, exit_code), con stdout e stderr in byte.
        #                 Con True (il default) restituirebbe un flusso da leggere
        #                 riga per riga
        # Documentazione del metodo:
        # https://github.com/KatharaFramework/Kathara/wiki/Kathara.manager.Kathara#method-katharaexec
        stdout, _, exit_code = todo(5, "lanciamo il ping con manager.exec(machine_name, command, lab=..., wait=..., stream=...): vediamo il commento sopra il TODO")
        print((stdout or b"").decode())
        print("pc1 raggiunge pc2!" if exit_code == 0 else "pc1 NON raggiunge pc2: controlliamo indirizzi e rotte")
    finally:
        manager.undeploy_lab(lab=lab)
        print("Lab fermato")


if __name__ == "__main__":
    main()
