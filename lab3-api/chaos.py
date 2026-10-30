#!/usr/bin/env python3
"""Lab 3 - Guasti programmati sul digital twin del Lab 2.

Lo script avvia il twin dalla nostra cartella del Lab 2 (se e' gia' acceso lo
ferma e lo riavvia, per partire da uno stato pulito) e attende la convergenza
OSPF. Poi un monitor misura in continuo il traffico pc_a -> pc_b e il next-hop
di r1, mentre lo script abbatte un link di backbone e lo ripristina.

Uso (dalla radice del repository):
    python lab3-api/chaos.py                         # labs/lab2/ospf, n12 giu' per 30 s
    python lab3-api/chaos.py --lab-dir labs/demo/soluzione-bfd --silent
    python lab3-api/chaos.py --link n23 --down 20
    python lab3-api/chaos.py --random --cycles 3     # link e durate casuali
"""
import argparse
import json
import logging
import os
import random
import re
import threading
import time

from Kathara.manager.Kathara import Kathara
from Kathara.parser.netkit.LabParser import LabParser

TARGET = "192.168.20.10"  # pc_b
REQUIRED = {"r1", "r2", "r3", "r4", "pc_a", "pc_b"}

# Link di backbone -> estremita' (dispositivo, interfaccia)
LINKS = {
    "n12": [("r1", "eth1"), ("r2", "eth0")],
    "n23": [("r2", "eth1"), ("r3", "eth1")],
    "n34": [("r3", "eth2"), ("r4", "eth0")],
    "n41": [("r4", "eth1"), ("r1", "eth2")],
}

# Next-hop di r1 verso la sede B
NEXT_HOPS = {"10.0.0.2": "r2, primario", "10.0.0.13": "r4, backup"}

manager = Kathara.get_instance()
lab = None
start = time.monotonic()
print_lock = threading.Lock()
stop = threading.Event()
state = {"next_hop": None, "sent": 0, "lost": 0}

# Log delle fasi di preparazione, con l'orario
logger = logging.getLogger("chaos")
logger.setLevel(logging.INFO)
logger.propagate = False
_handler = logging.StreamHandler()
_handler.setFormatter(logging.Formatter("[%(asctime)s] %(message)s", datefmt="%H:%M:%S"))
logger.addHandler(_handler)


def log(message):
    """Stampa una riga della timeline con il tempo trascorso dall'inizio dei guasti."""
    with print_lock:
        print(f"[{time.monotonic() - start:6.1f}s] {message}", flush=True)


def run(device, command, wait=False):
    """Esegue un comando su un dispositivo del twin; restituisce (output, exit code)."""
    stdout, stderr, exit_code = manager.exec(device, command, lab=lab, wait=wait, stream=False)
    return (stdout or stderr or b"").decode(), exit_code


# ---------------------------------------------------------------------------
# Preparazione del twin
# ---------------------------------------------------------------------------

def load_twin(lab_dir):
    """Legge il lab dalla cartella e controlla che sia il backbone del Lab 2."""
    path = os.path.abspath(lab_dir)
    if not os.path.isfile(os.path.join(path, "lab.conf")):
        raise SystemExit(f"Nessun lab.conf in {lab_dir}: indichiamo la cartella del nostro Lab 2 con --lab-dir")
    parsed = LabParser.parse(path)
    missing = REQUIRED - set(parsed.machines)
    if missing:
        raise SystemExit(f"In {lab_dir} mancano i dispositivi {', '.join(sorted(missing))}: e' il lab giusto?")
    logger.info("Cartella %s letta: %d dispositivi, %d domini di collisione",
                lab_dir, len(parsed.machines), len(parsed.links))
    return parsed


def expected_neighbors(twin):
    """Per ogni router, quanti altri router condividono con lui un dominio di collisione."""
    routers = {name for name, m in twin.machines.items() if "frr" in str(m.meta.get("image", ""))}
    expected = {}
    for name in sorted(routers):
        peers = set()
        for link in twin.machines[name].interfaces.values():
            peers |= {m for m in link.link.machines if m in routers and m != name}
        expected[name] = len(peers)
    return expected


def full_neighbors(router):
    output, _ = run(router, "vtysh -c 'show ip ospf neighbor json'", wait=True)
    try:
        neighbors = json.loads(output or "{}").get("neighbors", {})
    except json.JSONDecodeError:
        return 0
    return sum(1 for entries in neighbors.values() for entry in entries if entry.get("converged") == "Full")


def wait_convergence(twin, timeout=120):
    """Attende le adiacenze Full su ogni link di backbone e tabelle di routing stabili."""
    expected = expected_neighbors(twin)
    begin = time.monotonic()
    logger.info("Attendo le adiacenze OSPF (attese: %s)", ", ".join(f"{r} {n}" for r, n in expected.items()))
    last = None
    while time.monotonic() - begin < timeout:
        counts = {router: full_neighbors(router) for router in expected}
        if counts != last:
            logger.info("Adiacenze Full: %s", ", ".join(f"{r} {n}/{expected[r]}" for r, n in counts.items()))
            last = counts
        if counts == expected:
            break
        time.sleep(2)
    else:
        logger.warning("Adiacenze incomplete dopo %d s: controlliamo la configurazione OSPF", timeout)

    logger.info("Attendo che le tabelle di routing restino stabili per 5 s")
    tables = None
    while time.monotonic() - begin < timeout:
        current = {router: run(router, "ip route")[0] for router in expected}
        if current == tables:
            break
        tables = current
        time.sleep(5)
    logger.info("Twin pronto in %.0f s", time.monotonic() - begin)


def prepare_twin(lab_dir):
    """Avvia il twin da zero: se e' gia' acceso lo ferma e lo riavvia."""
    twin = load_twin(lab_dir)
    if manager.get_machines_api_objects(lab_hash=twin.hash):
        logger.info("Il lab e' gia' in esecuzione: lo fermo per ripartire da uno stato pulito")
        manager.undeploy_lab(lab_hash=twin.hash)
    logger.info("Avvio il twin (%s)...", ", ".join(sorted(twin.machines)))
    manager.deploy_lab(twin)
    logger.info("Dispositivi avviati")
    return twin


# ---------------------------------------------------------------------------
# Monitor e guasti
# ---------------------------------------------------------------------------

def describe(next_hop):
    if next_hop is None:
        return "nessuna rotta"
    return f"{next_hop} ({NEXT_HOPS.get(next_hop, '?')})"


def monitor_route():
    """Legge il next-hop di r1 verso la sede B e segnala ogni cambiamento."""
    first = True
    while not stop.is_set():
        output, _ = run("r1", f"ip route get {TARGET}")
        match = re.search(r"via (\S+)", output)
        next_hop = match.group(1) if match else None
        if first:
            log(f"next-hop iniziale di r1: {describe(next_hop)}")
            first = False
        elif next_hop != state["next_hop"]:
            log(f"*** next-hop di r1: {describe(state['next_hop'])} -> {describe(next_hop)}")
        state["next_hop"] = next_hop
        stop.wait(0.5)


def monitor_ping():
    """Un ping al secondo da pc_a a pc_b; ogni riga riporta anche il next-hop corrente."""
    while not stop.is_set():
        sample_start = time.monotonic()
        _, exit_code = run("pc_a", f"ping -c 1 -W 1 {TARGET}")
        state["sent"] += 1
        if exit_code != 0:
            state["lost"] += 1
        log(f"ping {'OK   ' if exit_code == 0 else 'PERSO'}  next-hop {describe(state['next_hop'])}")
        stop.wait(max(0.0, 1.0 - (time.monotonic() - sample_start)))


def link_down(link, silent):
    endpoints = ", ".join(f"{device}:{interface}" for device, interface in LINKS[link])
    log(f">>> GUASTO {'silenzioso ' if silent else ''}su {link} ({endpoints})")
    for device, interface in LINKS[link]:
        if silent:
            run(device, f"tc qdisc add dev {interface} root netem loss 100%")
        else:
            run(device, f"ip link set {interface} down")


def link_up(link, silent):
    log(f"<<< RIPRISTINO di {link}")
    for device, interface in LINKS[link]:
        if silent:
            run(device, f"tc qdisc del dev {interface} root")
        else:
            run(device, f"ip link set {interface} up")


def main():
    global lab, start

    parser = argparse.ArgumentParser(description="Guasti programmati sul digital twin del Lab 2")
    target = parser.add_mutually_exclusive_group()
    target.add_argument("--lab-dir", default="labs/lab2/ospf",
                        help="cartella del lab da avviare e mettere alla prova (default labs/lab2/ospf)")
    target.add_argument("--lab-name", help="usa un twin gia' avviato con le API, es. garr-twin di build_twin.py")
    parser.add_argument("--link", choices=LINKS.keys(), default="n12", help="link da abbattere (default n12)")
    parser.add_argument("--down", type=float, help="durata del guasto in secondi (default 30, 60 con --silent)")
    parser.add_argument("--wait", type=float, default=10, help="attesa prima di ogni guasto (default 10)")
    parser.add_argument("--after", type=float, default=20, help="osservazione dopo l'ultimo ripristino (default 20)")
    parser.add_argument("--cycles", type=int, default=1, help="numero di guasti (default 1)")
    parser.add_argument("--random", action="store_true", help="link e durate casuali a ogni ciclo")
    parser.add_argument("--silent", action="store_true",
                        help="perdita totale con netem invece di spegnere l'interfaccia")
    args = parser.parse_args()
    if args.down is None:
        # Il guasto silenzioso deve durare piu' del dead interval OSPF (40 s)
        args.down = 60 if args.silent else 30

    if args.lab_name:
        lab = manager.get_lab_from_api(lab_name=args.lab_name)
        if not lab.machines:
            raise SystemExit(f"Il twin '{args.lab_name}' non e' in esecuzione")
        logger.info("Uso il twin '%s' gia' in esecuzione", args.lab_name)
    else:
        lab = prepare_twin(args.lab_dir)
        wait_convergence(lab)

    logger.info("Inizio la timeline: guasto %s su %s dopo %.0f s, per %.0f s",
                "silenzioso" if args.silent else "pulito", "link casuali" if args.random else args.link,
                args.wait, args.down)
    start = time.monotonic()
    threads = [threading.Thread(target=monitor_route, daemon=True),
               threading.Thread(target=monitor_ping, daemon=True)]
    for thread in threads:
        thread.start()

    broken = None  # link attualmente guasto, da ripristinare in ogni caso
    try:
        for _ in range(args.cycles):
            link, down, wait = args.link, args.down, args.wait
            if args.random:
                link = random.choice(list(LINKS))
                down = random.uniform(10, 60 if args.silent else 40)
                wait = random.uniform(5, 15)

            time.sleep(wait)
            link_down(link, args.silent)
            broken = link
            time.sleep(down)
            link_up(link, args.silent)
            broken = None

        time.sleep(args.after)
    except KeyboardInterrupt:
        log("Interrotto da tastiera")
    finally:
        if broken:
            link_up(broken, args.silent)
        stop.set()
        for thread in threads:
            thread.join()

    print(f"\nPing inviati: {state['sent']}, persi: {state['lost']}")
    if not args.lab_name:
        print(f"Il twin resta acceso: per fermarlo, kathara lclean -d {args.lab_dir}")


if __name__ == "__main__":
    main()
