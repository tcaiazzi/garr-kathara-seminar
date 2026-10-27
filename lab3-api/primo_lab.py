#!/usr/bin/env python3
"""Lab 3, parte A - Il vostro primo lab con le API di Kathara.

Ricostruisce da codice la topologia del Lab 1 (pc1 - r1 - r2 - pc2), la avvia,
fa un ping da pc1 a pc2 e alla fine la ferma.

Completate i cinque TODO: ognuno e' una chiamata a todo(...) da sostituire con
la chiamata giusta alle API. Lanciate lo script dopo ogni TODO: si ferma al
primo che manca e vi dice quale.

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
        machine = todo(1, "create il dispositivo con lab.new_machine(...)")

        startup = []
        for number, (domain, address) in enumerate(device["interfaces"]):
            # TODO 2: l'interfaccia eth<number> sul dominio di collisione `domain`
            todo(2, "collegate il dispositivo al dominio con lab.connect_machine_to_link(...)")
            startup.append(f"ip address add {address} dev eth{number}")
        startup += [f"ip route add {route}" for route in device["routes"]]

        # TODO 3: il file .startup del dispositivo, con le righe in `startup`
        todo(3, "scrivete lo startup con lab.create_startup_file_from_list(...)")

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
        todo(4, "avviate il lab con manager.deploy_lab(...)")
        print("Lab avviato. Ping da pc1 verso pc2...")

        # TODO 5: il ping da pc1, aspettando che pc1 abbia finito l'avvio.
        # Con stream=False restituisce (stdout, stderr, exit_code).
        stdout, _, exit_code = todo(5, "lanciate il ping con manager.exec(...)")
        print((stdout or b"").decode())
        print("pc1 raggiunge pc2!" if exit_code == 0 else "pc1 NON raggiunge pc2: controllate indirizzi e rotte")
    finally:
        manager.undeploy_lab(lab=lab)
        print("Lab fermato")


if __name__ == "__main__":
    main()
