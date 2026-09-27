# Régie de jeux TikTok — consignes de développement

Ce dépôt produit des mini-jeux web mobiles et des jeux TikTok Live interactifs.

## Principes de conception (non négociables)
- **9:16 strict** : surface logique 1080×1920, mise à l'échelle en letterbox (voir `games/pump-it/src/main.ts`).
- **Règle des 3 secondes** : pas de tutoriel textuel ; le visuel et un slogan de 3 mots suffisent. En Live, les consignes restent affichées en permanence.
- **Sessions 15–45 s** ou boucle infinie (score, suspense, rivalité).
- **Lisibilité** : typo grasse avec contour noir, couleurs contrastées, jauges visibles, feedback son + particules + shake à chaque action.

## Méthode pour un nouveau concept
1. Écrire en 3 points : mécanique centrale, victoire/défaite, levier viral (ou interaction Live) — en tête du README du jeu.
2. Copier la structure de `games/pump-it/` dans `games/<nom>/` (workspace npm).
3. Livrer la boucle complète : menu → gameplay → game over → rejouer.
4. Documenter les commandes de test local et de simulation (touch/clavier + `npm run sim`).

## Architecture
- `games/<nom>/` : Vite + TypeScript + Canvas 2D natif. Logique pure dans `src/logic.ts` (sans DOM, rng injectable, testée avec Vitest) ; rendu dans `render.ts` ; SFX synthétisés en Web Audio dans `audio.ts`.
- `live-bridge/` : Node + `tiktok-live-connector` v2 + Socket.io. Normalise les événements TikTok en
  `{ type: like|chat|gift|share|follow, user: {id,name}, count, text?, gift?: {name, diamonds} }`, émis sur le canal `live`.
  Tous les jeux Live consomment ce format ; ne jamais lire les messages bruts TikTok dans un jeu.
- Les cadeaux combo ne sont comptés qu'à `repeatEnd` (voir `live-bridge/src/normalize.js`).

## Vérifications avant de pousser
```bash
npm run typecheck && npm test && npm run build
```

## Trilogie « Abysses » (Pont Piégé, Siège des Titans, Épreuve du Néant)
La bible artistique et technique fait référence : `docs/bible/`. Le stickman, la tête-PFP (« Sceau »), la grille UI 9:16, le mixage et les mécaniques TikTok transverses sont définis une seule fois dans `docs/bible/README.md` ; chaque jeu s'y conforme. Le pont Live (`live-bridge/`) reste la source d'événements pour tous les runtimes (web ou Unreal).

## Trilogie « Abysses » (Pont Piégé, Siège des Titans, Épreuve du Néant)
La bible artistique et technique fait référence : `docs/bible/`. Le stickman, la tête-PFP (« Sceau »), la grille UI 9:16, le mixage et les mécaniques TikTok transverses sont définis une seule fois dans `docs/bible/README.md` ; chaque jeu s'y conforme. Le pont Live (`live-bridge/`) reste la source d'événements pour tous les runtimes (web ou Unreal).
