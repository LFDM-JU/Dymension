# Dymension — régie de jeux TikTok

Mini-jeux web mobiles 9:16 et jeux TikTok Live interactifs.

| Jeu | Formats | Pitch |
| --- | --- | --- |
| [PUMP IT](games/pump-it/) | Solo mobile + TikTok Live | Gonfle. Encaisse. N'explose pas. |

Trilogie en conception, **« Abysses »** (Le Pont Piégé, Le Siège des Titans, L'Épreuve du Néant) : voir la [bible artistique et technique](docs/bible/README.md).

## Démarrage

```bash
npm install
npm run dev            # jeu sur http://localhost:5173 (et sur l'IP locale pour tester sur téléphone)
```

## TikTok Live

```bash
npm run bridge                         # pont en mode simulation (port 8787)
npm run bridge -- --user moncompte     # pont branché sur le live de @moncompte
npm run bridge -- --crowd              # + foule simulée (likes, "pump", "stop", cadeaux)
npm run bridge -- --crowd --words "a,b" # foule qui écrit tes propres mots-clés
```

Ouvre ensuite `http://localhost:5173/?mode=live` (à ajouter comme source navigateur 1080×1920 dans OBS / TikTok Live Studio).
Pour un pont sur une autre machine : `?mode=live&bridge=http://IP:8787`.

### Simuler des événements

```bash
npm run sim -- like 50 --user lea           # 50 likes
npm run sim -- chat maxou pump              # un commentaire
npm run sim -- spam 5 stop                  # 5 viewers différents écrivent "stop"
npm run sim -- gift kenza Rose 5            # 5 roses (diamants auto pour Rose, Galaxy, Lion…)
npm run sim -- gift kenza MonCadeau 1 99    # cadeau personnalisé à 99 diamants
npm run sim -- share bob
```

## Qualité

```bash
npm run typecheck && npm test && npm run build
```
