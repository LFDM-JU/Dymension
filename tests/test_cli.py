from dymension.cli import greet, main


def test_greet():
    assert greet("Julien") == "Bonjour, Julien !"


def test_main_default(capsys):
    assert main([]) == 0
    assert capsys.readouterr().out.strip() == "Bonjour, monde !"
