#!/usr/bin/env python3
"""Lab 3 - Costruisce da codice il digital twin del Lab 2 e lo avvia.

Uso:
    python3 build_twin.py            # crea e avvia il twin
    python3 build_twin.py --bfd      # come sopra, con BFD sui link di backbone
    python3 build_twin.py --destroy  # ferma il twin
"""
import argparse
import ipaddress
import json
import sys
import time

from Kathara.manager.Kathara import Kathara
from Kathara.model.Lab import Lab

LAB_NAME = "garr-twin"

# La topologia della rete.
# Per ogni router: loopback e interfacce in ordine (eth0, eth1, ...).
# Ogni interfaccia e' (dominio di collisione, indirizzo, costo OSPF);
# costo None = LAN di sede, annunciata in OSPF ma passiva.
ROUTERS = {
    "r1": {
        "loopback": "10.255.0.1/32",
        "interfaces": [
            ("lanA", "192.168.10.1/24", None),
            ("n12", "10.0.0.1/30", 10),
            ("n41", "10.0.0.14/30", 100),
        ],
    },
    "r2": {
        "loopback": "10.255.0.2/32",
        "interfaces": [
            ("n12", "10.0.0.2/30", 10),
            ("n23", "10.0.0.5/30", 10),
        ],
    },
    "r3": {
        "loopback": "10.255.0.3/32",
        "interfaces": [
            ("lanB", "192.168.20.1/24", None),
            ("n23", "10.0.0.6/30", 10),
            ("n34", "10.0.0.9/30", 100),
        ],
    },
    "r4": {
        "loopback": "10.255.0.4/32",
        "interfaces": [
            ("n34", "10.0.0.10/30", 100),
            ("n41", "10.0.0.13/30", 100),
        ],
    },
}

# Host di sede: (dominio di collisione, indirizzo, gateway)
HOSTS = {
    "pc_a": ("lanA", "192.168.10.10/24", "192.168.10.1"),
    "pc_b": ("lanB", "192.168.20.10/24", "192.168.20.1"),
}


def frr_conf(name, router, bfd):
    """Genera le righe del frr.conf di un router."""
    loopback = ipaddress.ip_interface(router["loopback"])
    lines = ["frr defaults traditional", f"hostname {name}", "service integrated-vtysh-config", "!"]

    for number, (_, _, cost) in enumerate(router["interfaces"]):
        lines.append(f"interface eth{number}")
        if cost is None:
            lines.append(" ip ospf passive")
        else:
            lines.append(" ip ospf network point-to-point")
            lines.append(f" ip ospf cost {cost}")
            if bfd:
                lines.append(" ip ospf bfd")
        lines.append("!")

    lines.append("router ospf")
    lines.append(f" ospf router-id {loopback.ip}")
    lines.append(f" network {loopback.network} area 0")
    for _, address, _ in router["interfaces"]:
        lines.append(f" network {ipaddress.ip_interface(address).network} area 0")
    lines.append("!")
    return lines


def daemons(bfd):
    """Genera le righe del file /etc/frr/daemons."""
    return [
        "zebra=yes",
        "ospfd=yes",
        f"bfdd={'yes' if bfd else 'no'}",
        "vtysh_enable=yes",
        'zebra_options="  -A 127.0.0.1 -s 90000000"',
        'ospfd_options="  -A 127.0.0.1"',
        'bfdd_options="   -A 127.0.0.1"',
    ]


def build_lab(bfd):
    """Costruisce il modello Lab/Machine/Link del twin, senza avviarlo."""
    lab = Lab(LAB_NAME)

    for name, (domain, address, gateway) in HOSTS.items():
        host = lab.new_machine(name, image="kathara/base")
        lab.connect_machine_to_link(name, domain, machine_iface_number=0)
        lab.create_startup_file_from_list(host, [
            f"ip address add {address} dev eth0",
            f"ip route add default via {gateway}",
        ])

    for name, router in ROUTERS.items():
        machine = lab.new_machine(name, image="kathara/frr")

        startup = []
        for number, (domain, address, _) in enumerate(router["interfaces"]):
            lab.connect_machine_to_link(name, domain, machine_iface_number=number)
            startup.append(f"ip address add {address} dev eth{number}")
        startup.append(f"ip address add {router['loopback']} dev lo")
        startup.append("systemctl start frr")
        lab.create_startup_file_from_list(machine, startup)

        # File copiati nel filesystem del dispositivo all'avvio
        machine.create_file_from_list(daemons(bfd), "/etc/frr/daemons")
        machine.create_file_from_list(frr_conf(name, router, bfd), "/etc/frr/frr.conf")

    # Verifica la coerenza del modello (interfacce contigue, link validi, ...)
    lab.check_integrity()
    return lab


def full_neighbors(manager, router):
    """Numero di vicini OSPF in stato Full su un router."""
    stdout, _, _ = manager.exec(router, "vtysh -c 'show ip ospf neighbor json'",
                                lab_name=LAB_NAME, wait=True, stream=False)
    try:
        neighbors = json.loads(stdout or b"{}").get("neighbors", {})
    except json.JSONDecodeError:
        return 0
    return sum(1 for entries in neighbors.values() for entry in entries if entry.get("converged") == "Full")


def routing_tables(manager):
    """Tabelle di routing di tutti i router."""
    return {name: manager.exec(name, "ip route", lab_name=LAB_NAME, stream=False)[0] for name in ROUTERS}


def wait_convergence(manager, timeout=90):
    """Attende le adiacenze Full su ogni link di backbone e tabelle di routing stabili."""
    expected = {name: sum(1 for _, _, cost in router["interfaces"] if cost is not None)
                for name, router in ROUTERS.items()}
    start = time.monotonic()
    while time.monotonic() - start < timeout:
        if all(full_neighbors(manager, name) == count for name, count in expected.items()):
            break
        time.sleep(2)

    # Adiacenze pronte: OSPF deve ancora scambiare gli LSA e ricalcolare i
    # percorsi, quindi si attende che le tabelle restino invariate per 5 s
    tables = None
    while time.monotonic() - start < timeout:
        current = routing_tables(manager)
        if current == tables:
            print(f"OSPF convergente in {time.monotonic() - start:.0f} s")
            return True
        tables = current
        time.sleep(5)
    print(f"ATTENZIONE: OSPF non convergente dopo {timeout} s")
    return False


def main():
    parser = argparse.ArgumentParser(description="Digital twin del backbone GARR di esempio")
    parser.add_argument("--bfd", action="store_true", help="abilita BFD sui link di backbone")
    parser.add_argument("--destroy", action="store_true", help="ferma il twin ed esce")
    args = parser.parse_args()

    manager = Kathara.get_instance()

    if args.destroy:
        manager.undeploy_lab(lab_name=LAB_NAME)
        print(f"Twin '{LAB_NAME}' fermato")
        return

    lab = build_lab(args.bfd)
    print(f"Modello pronto: {len(lab.machines)} dispositivi, {len(lab.links)} domini di collisione")

    # Se un twin precedente e' ancora attivo lo rimuove, poi avvia quello nuovo
    manager.undeploy_lab(lab_name=LAB_NAME)
    manager.deploy_lab(lab)
    print(f"Twin '{LAB_NAME}' avviato{' con BFD' if args.bfd else ''}, attendo la convergenza OSPF...")

    converged = wait_convergence(manager)

    for name in ROUTERS:
        stdout, _, _ = manager.exec(name, "vtysh -c 'show ip ospf neighbor'",
                                    lab_name=LAB_NAME, wait=True, stream=False)
        print(f"\n=== {name}: show ip ospf neighbor")
        print((stdout or b"").decode().strip())

    sys.exit(0 if converged else 1)


if __name__ == "__main__":
    main()
