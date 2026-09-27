"""Point d'entrée en ligne de commande."""

import argparse

from dymension import __version__


def greet(name: str) -> str:
    return f"Bonjour, {name} !"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="dymension")
    parser.add_argument("name", nargs="?", default="monde")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    args = parser.parse_args(argv)
    print(greet(args.name))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
