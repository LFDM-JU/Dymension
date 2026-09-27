# II. LA GUERRE DE TERRITOIRE : « Le Siège des Titans »

> *« Ils n'ont pas de visage. Ils ont les vôtres. »*

Fondations communes (stickman, runtime, UI, audio) : voir [README](README.md).

## En 3 points
1. **Mécanique** : deux armées, la **Légion de Cendre** et l'**Ordre d'Azur**, s'affrontent dans un défilé. Chaque viewer rejoint un camp et devient un soldat à son effigie. Le flux de commandes du chat (`charge`, `mur`, `volée`) **pousse la ligne de front**.
2. **Victoire / défaite** : pousser le front jusqu'à la **herse** ennemie et l'enfoncer. À défaut, le camp qui tient le plus de terrain à la fin des **4 minutes** l'emporte.
3. **Levier** : le tribalisme d'équipe, la **bannière personnelle** et les **Titans** à l'effigie des donateurs. Le **Rallye de la dernière chance** permet des retournements spectaculaires, et les morts se vengent en **Corbeaux**.

---

## 1. Atmosphère et environnement

### 1.1 Géographie : un champ de bataille vertical

Le format 9:16 dicte la géographie. **Le front progresse verticalement dans l'image.**
- La **Légion de Cendre** tient la **forteresse basse**, en bas de l'image, au premier plan : remparts de basalte noirci, herse de fer rouillé et braseros.
- L'**Ordre d'Azur** tient la **forteresse haute**, en haut de l'image, dans la profondeur : bastion de pierre claire sur un éperon, vitraux bleus éclairés de l'intérieur.
- **Entre les deux**, le **Défilé des Titans** : un couloir de 60 m de large et 300 m de long, encaissé entre deux **falaises de 150 m**. Des **statues colossales** de titans, brisées, y sont taillées dans la roche : une main tient encore une épée de 40 m plantée dans le sol, que les armées contournent.
- **Caméra en plongée à 55°** : les deux forteresses sont visibles aux extrémités du cadre. La perspective écrase la distance.

**Équité de lecture.** La forteresse haute est plus loin, donc plus petite. On compense : l'Ordre d'Azur a des bannières **plus hautes**, des vitraux plus lumineux, et la caméra **recadre en permanence le front au centre** (y ≈ 700). Les deux camps occupent ainsi toujours une surface d'écran comparable.

### 1.2 Météo : la tempête est un personnage

- **Pluie battante** : 150 000 gouttes GPU en *streaks* étirés selon la vitesse et le motion blur, inclinées par un **vent** qui change de direction en rafales (bruit à 0,1 Hz). Des **éclaboussures** apparaissent au sol, sur les casques et sur les boucliers, par collision avec le depth buffer.
- **Gouttes sur l'objectif** : shader écran de gouttes qui glissent, avec réfraction. Elles s'intensifient sur les plans à l'épaule et disparaissent en plan large. C'est le marqueur de l'**immersion caméra-reporter**.
- **Éclairs** : de 3 à 8 par minute (plus en tension haute). Chaque éclair :
  - produit un **flash** directionnel de 80 ms (×30 d'intensité) avec **ombres dures portées** par toute l'armée, soit **800 silhouettes projetées d'un coup** : c'est un plan signature ;
  - illumine le dessous des nuages (volume de nuages éclairé par une point light interne) ;
  - est suivi d'un tonnerre retardé selon la distance (voir audio).
- **Brouillard de pluie** : volumétrie dense et basse, rasante dans le défilé. Les **torches et braseros y créent des halos** : chaque source chaude est une sphère de lumière diffuse dans la bruine.

### 1.3 Éclairage

| Source | Type | Couleur | Rôle |
|---|---|---|---|
| **Ciel d'orage** | Skylight + directionnelle faible (lune dans les nuages) | `#46546B` | Ambiance bleu-acier, silhouettes sombres |
| **Éclairs** | Directionnelle flash | `#DDE8FF` | Contraste extrême intermittent |
| **Braseros de Cendre** | Point lights avec scintillement | `#FF7A2E` | Chaleur, camp bas |
| **Vitraux d'Azur** | Area lights à travers les vitraux, god rays | `#4FA3FF` | Froid sacré, camp haut |
| **Torches des porte-étendards** | Point lights mobiles (une par bannière, 40 max) | Couleur du camp | **Chaque bannière est une source de lumière** : l'armée se lit comme une constellation |
| **Front** | Lumière dynamique d'étincelles (voir VFX) | `#FFD27A` | Le centre de l'image est toujours le plus lumineux |

**Règle de composition** : le front est la zone la plus éclairée du cadre, les falaises la plus sombre. L'œil va **toujours** au choc.

### 1.4 Shaders de surface

- **Boue** : c'est la surface héros du jeu.
  - Un **heightfield déformable** (render target de 1024², 30 cm de résolution) creusé par les pas et les corps, avec des **ornières** qui persistent toute la partie. La ligne de front laisse un **sillon** : on lit l'historique de la bataille dans la terre.
  - Matériau : albedo `#2B2119`, **flaques dynamiques** là où la hauteur est basse (eau, SSR ou Lumen, reflets des torches et des éclairs), rugosité de 0,9 (sèche) à 0,05 (flaque).
  - Gouttes qui percutent les flaques : normales animées en cercles concentriques (anneaux de pluie).
- **Roche des falaises** : granite sombre `#2E2F33` avec **ruissellements** (flow map verticale, rugosité basse dans les rigoles), mousse gorgée d'eau et cascades de ruissellement en particules sur les arêtes.
- **Armures et boucliers** (sur le stickman, voir README §1.2) :
  - **Cendre** : boucliers ronds en fer noirci, cloutés, bords rougis de chaleur (émissif `#FF5A1F` faible).
  - **Azur** : pavois en acier poli gravé, liseré d'argent `#C7D3E0`.
  - **Mouillage** : un masque `wetness` global sur tous les personnages (albedo × 0,7, rugosité × 0,4) produit des reflets spéculaires de torches sur chaque os.
- **Bannières** : **simulation de tissu** (cloth GPU, 16×24) soumise au vent et **alourdie par la pluie** (masse ×1,5). Tissu imbibé : sheen faible, couleur saturée assombrie. **La PFP du porte-étendard est brodée au centre** (voir innovations).

### 1.5 Palette chromatique

| Rôle | Nom | Hex |
|---|---|---|
| Ciel, ombre | Acier d'orage | `#1B2230` |
| Ambiance | Bruine bleutée | `#46546B` |
| Boue | Terre gorgée | `#2B2119` |
| Roche | Granite mouillé | `#2E2F33` |
| **Cendre**, primaire | Braise de guerre | `#FF5A1F` |
| **Cendre**, secondaire | Fer noirci | `#1C1614` |
| **Azur**, primaire | Azur sacré | `#4FA3FF` |
| **Azur**, secondaire | Argent terni | `#C7D3E0` |
| Front, étincelles | Or d'impact | `#FFD27A` |
| Éclair | Blanc foudre | `#DDE8FF` |
| **Rallye**, ciel | Crépuscule sanglant | `#8E0F14` |
| **Rallye**, aura | Or divin | `#FFE8A3` |

**Règle** : orange et bleu sont complémentaires, ce qui garantit une lisibilité immédiate même en bouillie de compression. **Aucun élément neutre n'utilise ces deux teintes.**

---

## 2. Mise en scène et caméra

| Moment | Plan | Focale | Mouvement | DOF |
|---|---|---|---|---|
| **Levée des armées** (lobby) | Grue sur chaque forteresse en alternance : les soldats apparaissent en rang, chacun avec son sceau-PFP | 35 mm | Travelling latéral le long des rangs | f/2, rack focus d'un sceau à l'autre à mesure qu'ils rejoignent |
| **Charge initiale** | Plan « drone » en plongée à 55°, puis descente jusqu'à hauteur d'homme au moment du choc | 24 → 50 mm | Descente de 40 m en 2,5 s | Profondeur de champ qui se resserre |
| **Mêlée courante** | Plongée à 55°, front au centre | 35 mm | Suit le front (ressort critique), léger roulis au vent | f/4 |
| **Choc de masse** | **Insert bouclier contre bouclier**, ralenti ×0,3, 0,6 s | 85 mm | Épaule, *shake* violent à l'impact | f/1.4, rack focus sur le choc |
| **Éclair** | Plan large inchangé, mais la caméra **tressaute** (0,2°) au tonnerre | – | – | – |
| **Titan** | Contre-plongée depuis la boue, **pieds du Titan** au premier plan | 18 mm | Tilt lent vers le haut jusqu'au sceau du Titan | f/8 |
| **Rallye** | Grue vers le ciel, **ouverture des nuages**, puis descente avec les rayons sur l'armée | 24 mm | 3 s aller-retour | f/5.6 |
| **Herse enfoncée** | Travelling avant **à travers la herse** qui explose, ralenti ×0,4 | 21 mm | Caméra embarquée dans la charge | f/2.8 |

**Caméra « correspondant de guerre »** : hors plans larges, la caméra porte toujours un bruit à l'épaule de faible amplitude (0,3°), avec des **pertes de mise au point** momentanées (autofocus « humain » qui chasse 150 ms) sur les chocs.

**Ralentis Matrix** : ils sont réservés aux chocs de masse, aux arrivées de Titan et au coup final sur la herse. Pendant un ralenti, **les gouttes de pluie se figent presque** (×0,05) et deviennent visibles une à une en perles lumineuses. C'est un plan signature.

---

## 3. VFX et particules

### 3.1 Le choc de masse (effet signature)

Il se déclenche quand un camp lance une **Charge** (voir 4.2) et que les deux lignes se rencontrent. Séquence :
1. **−300 ms** : les deux premiers rangs s'élancent. La boue gicle derrière les talons en **gerbes** de particules lourdes (gouttes de boue opaques, gravité ×1,5, collision et **taches** sur les armures).
2. **0 ms, contact** : **hit-stop de 160 ms** sur tout le monde sauf la pluie.
3. **Onde de choc** : une sphère aplatie **translucide** part du point de contact le long du front (60 m en 250 ms). Elle combine :
   - une réfraction en espace écran (distorsion d'anneau) ;
   - un **soulèvement de la boue** : le heightfield se soulève en vague et **projette un rideau d'eau boueuse** (nappe de particules plus mesh de rideau animé) ;
   - les **gouttes de pluie repoussées** radialement : un « trou » de pluie s'ouvre 0,3 s autour du choc ;
   - les **flaques** frappées d'anneaux concentriques.
4. **Étincelles** : **gerbes** le long de tout le front, de 1 500 à 3 000 étincelles.
   - Chaque étincelle est un ruban lumineux court (motion blur), couleur blackbody de 1 800 à 2 400 K : `#FFD27A` au cœur, `#FF7A2E` au refroidissement.
   - Elles **rebondissent** sur la boue avec une friction élevée et s'**éteignent dans l'eau** (micro-panache de vapeur).
   - Elles éclairent : 16 point lights agrégées et animées sur le front, qui éclairent les boucliers et les sceaux.
5. **Ragdolls** : les 24 soldats héros les plus proches du point d'impact passent en ragdoll actif. Certains sont **projetés** en arrière : glissade dans la boue avec **sillon** dans le heightfield et gerbe latérale.
6. **Caméra** : secousse de traumatisme (0,8, décroissance en 0,6 s), aberration chromatique de 0,6 %, puis **retour au temps normal** avec un léger *overshoot* (×1,15 pendant 150 ms).

### 3.2 Foule

- **800 soldats maximum** : 24 héros en ragdoll complet, 150 en ragdoll simplifié, le reste en **VAT instanciées** (clips de marche, charge, garde, frappe, chute, relevé) avec désynchronisation par instance.
- Les soldats **non-joueurs** (remplissage si le camp compte moins de 50 viewers) portent un sceau vierge en pierre. Les **joueurs** ont leur PFP. **Plus un camp a de viewers, plus sa ligne est « vivante » de visages** : c'est un moteur d'invitation (« venez remplir nos rangs »).
- **Morts** : les soldats tombés restent **dans la boue** 20 s (au-delà, ils sont enfoncés par les pas), avec la PFP fissurée (`damage` 0,8), puis s'enfoncent et disparaissent.

### 3.3 Volée de flèches

- Une **nuée** de 300 flèches (instanced mesh avec *trail*) tirée depuis les remparts, en **arc parabolique** qui traverse le haut de l'image. Les flèches enflammées de Cendre laissent des traînées orange et de la fumée, celles d'Azur des traînées d'argent glacé.
- À l'impact : les flèches se plantent dans la boue (persistantes) ou **rebondissent sur les boucliers** levés (étincelles et tintement). Les boucliers de l'ennemi en `mur` forment une **tortue** qui bloque 70 %.

### 3.4 Éclair (commande collective et météo)

- Le tracé de la foudre est un **L-system** procédural de 3 branches, émissif HDR ×200, affiché 3 images avec une rémanence de 200 ms.
- Au point d'impact : **cratère** dans le heightfield, anneau de **vapeur** qui monte, 20 soldats ragdollisés avec des **arcs électriques** résiduels qui courent sur leurs os (ruban de bruit sur 1 s). Les sceaux touchés **grésillent** (bruit numérique sur le portrait pendant 0,5 s).

### 3.5 Titans (cadeau)

- Un stickman de **18 m de haut**, au rang Or runique, avec un sceau-PFP de **3,5 m de diamètre** portant le visage du donateur, encerclé de gyroscopes de bronze massifs.
- **Arrivée** : il **descend de la falaise** en trois pas. Chaque pas déclenche un séisme local (caméra, onde dans les flaques), une gerbe de boue haute de 6 m, et fait tomber des rochers de la falaise.
- **Action** : il balaie la ligne ennemie avec un fléau-chaîne (arc de 90°). **Hit-stop de 200 ms**, 40 soldats projetés, étincelles sur tout l'arc.
- **Départ** : après 12 s, il plante son épée dans le sol et **se pétrifie** en statue. Il devient un **obstacle permanent** du décor jusqu'à la fin, avec le nom du donateur gravé sur le socle. C'est la nouvelle statue colossale du défilé.

---

## 4. Micro-mécaniques et pacing

### 4.1 Rejoindre

- La première commande choisit le camp : `cendre` / `azur` (ou `1` / `2`). Le camp est **verrouillé** pour la partie.
- **Équilibrage** : si un camp compte plus de 60 % des joueurs, le suivant qui tape `1` ou `2` est affecté au camp le plus faible. Il reçoit alors une **prime de mercenaire** (×1,5 d'influence), ce qui rend le camp minoritaire attractif.

### 4.2 Commandes

| Commande | Effet | Règle |
|---|---|---|
| `charge` / `⚔` | Contribue à la **poussée** du camp | 1 contribution par seconde et par joueur |
| `mur` / `🛡` | Contribue à la **garde** : réduit la poussée ennemie reçue | 1/s par joueur ; les 5 s de garde consécutives d'un joueur forment une **tortue** (sa silhouette lève le bouclier) |
| `volée` / `🏹` | Accumule vers une **volée de flèches** du camp | Déclenchée quand **15 % des joueurs du camp** l'ont tapée dans une fenêtre de 4 s |
| `rallye` | Voir 4.4 | Débloqué seulement en situation désespérée |

**Modèle de poussée** : on intègre à chaque tick une force nette sur la position du front `x ∈ [−1, +1]` :

```
P_camp = Σ contributions « charge » sur la fenêtre de 2 s
         pondérées par : rendement dégressif par joueur (1, 0,6, 0,3…),
                         prime mercenaire,
                         rallye (×2)
G_camp = idem pour « mur », plafonné à 70 % de réduction
F = P_cendre × (1 − G_azur) − P_azur × (1 − G_cendre)
dx/dt = F × k / (n_joueurs_total + 20)
```

La division par le nombre de joueurs rend le jeu **indépendant de la taille du live**. Le **rendement dégressif** empêche un spammeur isolé de peser autant que dix joueurs.

**Pierre, feuille, ciseaux implicite** : une volée contre un camp en pleine charge (sans mur) fait des ravages (×2 de dégâts, recul du front). Une volée contre un camp en tortue est quasi inutile. **Le chat doit se coordonner** (« MUR ! ils préparent une volée ! ») : on voit les arcs de flèches se *préparer* 2 s sur les remparts (archers qui bandent, flammes allumées). C'est un télégraphe diégétique.

### 4.3 Tension croissante

| Minute | Phase | Changement |
|---|---|---|
| 0:00–1:00 | **Escarmouche** | Pluie fine, rares éclairs, musique à la tension 1 |
| 1:00–2:30 | **Mêlée** | Pluie battante, **vent** qui dévie les volées (dispersion +30 %), Titans autorisés |
| 2:30–3:30 | **Tempête** | Éclairs fréquents, torches soufflées (l'obscurité monte), poussée ×1,3 pour les deux camps : **tout va plus vite** |
| 3:30–4:00 | **Dernier assaut** | Tonnerre continu, le chrono est gravé en grand sur la falaise. Le front ne peut plus reculer de plus de 10 % par seconde, pour éviter un retournement injuste dans les 3 dernières secondes. |

**Herse** : quand le front atteint `x = ±0,92`, la herse ennemie commence à **céder**. Elle a 100 points de structure, sous le choc de la poussée continue. On voit **les chaînes se tendre, le bois éclater** et des étincelles de fer. **Herse enfoncée = victoire immédiate**, avec le plan signature du travelling à travers.

### 4.4 Rallye de la dernière chance

**Condition** : le front est à ≥ 75 % vers la herse d'un camp (`|x| ≥ 0,75` de son côté) **et** ce camp ne l'a pas encore utilisé.
**Déclenchement** : **30 % des joueurs du camp menacé** tapent `rallye` dans une fenêtre de 6 s. Un **cor de guerre** qui monte en intensité et une jauge-bannière qui se déploie matérialisent l'accumulation.

**Séquence visuelle (10 s)** :
1. **0–1,5 s, le ciel se déchire.** La caméra part en grue vers le ciel. Les nuages s'ouvrent au-dessus de l'armée menacée, le ciel passe de l'acier `#1B2230` au **crépuscule sanglant** `#8E0F14`, et le soleil couchant apparaît enfin dans l'unique trouée de toute la partie. **La pluie ralentit** (×0,2) et **ses gouttes virent au rouge et or** en captant le couchant.
2. **1,5–3 s, les auras descendent.** Des **colonnes de lumière divine** (god rays volumétriques `#FFE8A3`) tombent de la trouée sur chaque porte-étendard du camp, puis s'étendent à toute l'armée. Chaque soldat reçoit :
   - une **coquille d'aura** : fresnel additif `#FFE8A3`, épaisseur de 3 cm, animée de bruit ascendant ;
   - des **particules d'or** qui montent des épaules (pétales lumineux lents) ;
   - des rotules qui passent en **blanc d'or** (émissif ×3) ;
   - des sceaux-PFP **auréolés** (halo annulaire derrière le disque, comme une icône byzantine).
3. **3 s, le cri.** L'armée lève les armes en synchronisation (pose héroïque mocap). **Hit-stop inversé** : tout se fige 300 ms, puis l'**onde divine** part de l'armée vers l'ennemi, repousse la pluie, souffle les torches adverses et fait reculer le front de 10 %.
4. **3–10 s, fureur.** Poussée ×2, et l'ennemi est **ébloui** (sa garde est réduite de 50 %). La musique bascule sur les **chœurs épiques** (voir audio). Le crépuscule persiste et reflue lentement vers l'orage.
5. **Contre-rallye** : si l'autre camp se fait à son tour acculer, il peut déclencher le sien. Le ciel se déchire une seconde fois, du côté opposé. **Deux trouées de couchant dans une même tempête** : c'est le visuel climax de la trilogie.

### 4.5 Innovations TikTok

**Corbeaux de la vengeance (morts).** Quand le soldat d'un joueur meurt (volée, éclair, Titan, ou front qui recule sur lui), le joueur devient un **Corbeau** pendant 15 s avant de réapparaître à la forteresse.
- En Corbeau, il peut taper `picore` : son corbeau (qui porte une **mini-PFP sur le poitrail**) plonge sur les **archers ennemis**. Chaque corbeau retarde la prochaine volée ennemie de 0,5 s.
- Visuel : une nuée de corbeaux noirs aux yeux de la couleur du camp, qui tourbillonnent (boids) au-dessus des remparts ennemis et dont les plumes tombent dans la pluie.
- **Rancune ciblée** : si le soldat a été tué par un Titan, `picore` vise **le Titan** : les corbeaux lui arrachent des éclats de pierre, et chaque tranche de 10 corbeaux raccourcit sa présence de 1 s.

**Tonnerre des likes (combo météo).** Les likes d'un joueur sont comptés **pour son camp**. Chaque camp a une **jauge de foudre** (voir UI). À son seuil (normalisé, voir README §5.1), **la foudre frappe la ligne ennemie** (voir VFX 3.4), avec un recul de 5 % et une vingtaine de morts. Le camp qui like le plus **commande le ciel**.

**Bannières personnelles (cadeaux).**

| Palier | Effet |
|---|---|
| Petit | Le donateur devient **porte-étendard** : sa PFP est **brodée sur une bannière** en tissu simulé, qui porte une torche. Visible toute la partie tant qu'il ne meurt pas. |
| Moyen | **Cor de guerre** : relance la jauge de volée du camp de +50 %. Une silhouette géante du donateur sonne du cor sur les remparts. |
| Grand | **Titan** à l'effigie du donateur (voir VFX 3.5). Un seul Titan par camp à la fois, 12 s. Contrable par les Corbeaux. |

**Partage** : chaque partage ajoute un **renfort** anonyme (soldat au sceau de pierre) au camp du partageur.

---

## 5. UI verticale 9:16

```
 0 ┌──────────────────────────────┐
   │ (zone TikTok)                │
280├──────────────────────────────┤
   │ ▓▓ FORTERESSE D'AZUR ▓▓  ⚡▓▓│  Jauge de foudre Azur : éclair gravé sur la tour droite
   │   bannières bleues           │
   │                              │
   │  ═══════ FRONT ═══════       │  y ≈ 700 : front recentré, étincelles
   │   bannières orange           │
   │                              │
1080├───────────────┬──────────────┤
   │ boue, pluie,  │  ║ 3:12 ║    │  Chrono gravé sur la falaise droite
   │ remparts de   │  ║ ◆◆◆◇ ║    │  Jauge de volée : 4 flèches qui s'allument
   │ Cendre (chat  │  ║ ⚡▓▓  ║    │  Jauge de foudre Cendre
   │ natif dessus) │              │
1760└───────────────┴──────────────┘
```

- **Barre de territoire** : elle n'existe pas en tant que barre. **La ligne de front est la barre.** Pour la lecture instantanée, le **sillon dans la boue** est bordé de **torches plantées** tous les 10 % de terrain, qui prennent la couleur du camp qui tient ce segment. Une rangée verticale de flammes orange ou bleues le long de la falaise gauche indique le rapport de force en un coup d'œil, comme une barre de territoire faite de feu.
- **Effectifs** : sur chaque forteresse, un **étendard géant** porte le nombre de soldats gravé en chiffres Cinzel (`412`).
- **Chrono** : gravé sur la falaise droite, les chiffres **ruissellent** d'eau. Sous 30 s, ils rougeoient.
- **Jauges de volée et de foudre** : sculptées dans les tours des forteresses (colonne droite). Les flèches et éclairs gravés s'illuminent un à un.
- **Actes** : `charge` fait lever un glyphe ⚔ au-dessus du soldat du joueur. En masse, ce sont des **vagues de lumière** qui parcourent les rangs du camp (voir README §3.3).
- **Annonces** (« RALLYE », « HERSE ENFONCÉE », « TITAN ») : lettrage Cinzel Decorative de 150 px **frappé en métal** (normal map, reflet des éclairs), qui tombe du haut du cadre avec un impact et de la poussière, puis se dissout dans la pluie.
- **Écran de victoire** : les **10 meilleurs contributeurs** du camp gagnant apparaissent en **rang d'honneur** sur les remparts, sceaux-PFP éclairés par un rayon de soleil, pseudos gravés sur les créneaux.

---

## 6. Audio

### 6.1 Nappe évolutive

| Couche | Contenu |
|---|---|
| Base | **Pluie** en 3 couches (lointaine, proche, gouttes sur le métal), vent en rafales et ruissellement |
| Armées | Clameur de foule en boucle (cris, cliquetis), dont le volume suit le nombre de joueurs de chaque camp et le panoramique leur position verticale |
| Tension 1 | Tambours de guerre graves à 70 BPM (taiko et grosse caisse orchestrale) |
| Tension 2 | Cuivres graves en ostinato, cordes en trémolo |
| Tension 3 | Percussions métalliques (enclumes), 90 BPM |
| **Rallye** | **Chœurs épiques** (chœur mixte, texte en latin inventé), cuivres majeurs et tambours doublés |

**Identité musicale par camp** : quand Cendre pousse, le mix favorise les **percussions de peau et les cuivres graves** (barbare). Quand Azur pousse, les **cloches, orgue et chœur** montent (sacré). La musique **penche** avec le front.

### 6.2 Sons signature

- **Choc de masse** : `SFX_IMPACT` en quatre couches :
  - **sub 40 Hz** saturé et compressé ;
  - **clash** de centaines de boucliers (métal et bois, 1–4 kHz, multi-couches désynchronisées) ;
  - **cliquetis** de métaux lourds en queue (chaînes, mailles) ;
  - **éclaboussure** de boue.

  Il est précédé de **200 ms de quasi-silence** : la pluie est ducée à −18 dB, il ne reste que les pas lourds. Le sidechain creuse la musique de 6 dB.
- **Éclair** : crack sec de 3–8 kHz immédiat, puis **roulement de tonnerre** retardé de 0,3 à 2 s selon la distance, 30–80 Hz, sur 3 s. Le tonnerre du coup de foudre commandé par les likes est **instantané et assourdissant** : il n'y a pas de délai quand il frappe sur toi.
- **Titan** : chaque pas est un **impact sub de 30 Hz** avec roches qui tombent et vibration de la caméra synchronisée. La voix du Titan est un **grondement de pierre** pitché très bas.
- **Rallye** : cor de guerre (accumulation), puis à la déchirure du ciel **coupure nette de la pluie** : 0,5 s de silence absolu. Viennent ensuite l'**accord du chœur** et le cri de l'armée, doublé d'un sub.
- **Herse** : grincement de chaînes sous tension, éclatement de bois, et chute de fer (métal lourd, 1,5 s de résonance).

### 6.3 Silences

- Pendant **le cri du Rallye** (hit-stop inversé) : 300 ms de silence total.
- À **la victoire** : la pluie s'arrête. Pour la première fois de la partie, **on n'entend plus que le vent**, puis le chant du camp vainqueur, a cappella.
