# III. L'ARÈNE BATTLE ROYALE : « L'Épreuve du Néant »

> *« Le réacteur ne vous hait pas. Il a juste faim. »*

Fondations communes (stickman, runtime, UI, audio) : voir [README](README.md).

## En 3 points
1. **Mécanique** : jusqu'à 100 viewers sont déposés sur une plateforme circulaire en marbre noir, au cœur d'un réacteur à fusion instable. Le sol est découpé en **8 secteurs** (comme un cadran). Le réacteur télégraphie ses frappes par des surchauffes au sol, et les joueurs tapent le numéro du secteur où fuir. **La distance compte** : un secteur opposé est plus long à atteindre.
2. **Victoire / défaite** : qui se trouve dans une zone frappée est **vaporisé**. Le **dernier debout** gagne. À partir du **top 3**, l'arène bascule en duel cinématique.
3. **Levier** : les morts deviennent des **Échos** qui **votent où frappe la prochaine salve**. Les vivants savent qu'ils sont chassés par ceux qu'ils ont vu mourir. Les likes surchargent le réacteur.

---

## 1. Atmosphère et environnement

### 1.1 Géographie

- **La plateforme** : un disque de **24 m de diamètre** en **marbre noir poli** (veiné d'or pâle), cerclé d'un **anneau d'orichalque** de 1,2 m de large, gravé des noms des Légendes (voir README §6.2). Elle est découpée en 8 secteurs par des **rainures d'orichalque** incrustées (2 cm) qui s'illuminent.
- **Le réacteur** : la plateforme flotte **au centre d'une sphère de confinement** de 200 m de diamètre, faite d'**anneaux magnétiques** titanesques qui tournent sur des axes différents (gyroscope colossal). C'est un écho délibéré au sceau-PFP : **l'arène est un sceau géant**.
- **Le cœur** : sous la plateforme, à −40 m, pulse le **noyau de fusion**, une sphère de plasma de 15 m. Des **filaments magnétiques** (arcs de plasma) jaillissent de sa surface et viennent lécher le dessous de la plateforme.
- **Au-delà des anneaux** : le **vortex cosmique**. Un disque d'accrétion lointain tourne lentement, avec des nébuleuses sombres et des étoiles étirées par la gravité (lentille gravitationnelle en espace écran). Le cœur du réacteur est ce qui l'alimente.
- **Débris orbitaux** : des fragments de plateformes précédentes (marbre fracturé, orichalque tordu) gravitent entre les anneaux. Certains portent encore des **empreintes thermiques** d'anciens joueurs, qui ne s'effacent jamais. C'est le lore silencieux.

### 1.2 Éclairage

| Source | Type | Couleur | Rôle |
|---|---|---|---|
| **Noyau** | Point light massive et émissif, sous la plateforme | `#FF6B2B` → `#FFFFFF` au cœur | Contre-jour **par en dessous** à travers les bords de la plateforme. Pulse à 0,5 Hz (le « cœur » du réacteur) |
| **Anneaux magnétiques** | Émissifs linéaires (bandes de LED intégrées) plus area lights | `#3DE0FF` | Rim light froid sur les personnages, reflets sur le marbre |
| **Rayons orbitaux** | Area lights cylindriques et émissifs volumétriques | `#FFFFFF` au cœur, halo `#B388FF` | Danger, éclairage dur momentané |
| **Surchauffe au sol** | Émissif du marbre et point lights au ras du sol | `#FF2D55` → `#FF9F1C` → `#FFF3B0` | Télégraphe (voir 4.2) |
| **Projecteurs du climax** | Spots volumétriques étroits, un par finaliste | `#F4F1EA` (blanc chaud) | Top 3 |

**Le marbre est un miroir.** Il est poli à une rugosité de **0,06** et le sol est un **plan unique**. On peut donc se payer des **reflets planaires exacts** (second rendu de la scène en miroir, demi-résolution, légèrement flouté selon la rugosité). C'est **la** raison pour laquelle cette arène peut atteindre une qualité « ray-tracée » même en WebGPU. Le marbre reflète :
- les anneaux cyan ;
- les rayons qui tombent (**on voit le danger arriver deux fois**, dans le ciel et dans le sol) ;
- les rotules des stickmen ;
- le vortex.

### 1.3 Brouillard et volumétrie

- **Pas de brouillard de sol** : l'arène est « propre », le vide est net. La volumétrie vit **dans les faisceaux** : rayons orbitaux, projecteurs, et **poussière ionisée** en suspension, visible seulement là où la lumière passe.
- Sous la plateforme, en revanche, un **plasma diffus** : volume émissif animé en bruit 3D, orange-rose, que l'on voit **par les interstices et les bords**.
- **Distorsion gravitationnelle** : autour du noyau et sur les rayons, réfraction en espace écran.

### 1.4 Shaders de surface

- **Marbre noir** : albedo `#07070A` avec **veines** procédurales (bruit fractal déformé par warping), or pâle `#8A7A55` et légèrement métallique. Clearcoat 1, rugosité 0,06, **micro-rayures** (normal map fine, anisotropie circulaire autour du centre) qui accrochent la lumière en arcs quand un rayon tombe.
- **Surchauffe** : un uniforme `heat ∈ [0,1]` par secteur, avec une couleur **corps noir** (blackbody) du rouge sombre au blanc-jaune. Le marbre **se fissure en toile d'araignée** en surchauffe (masque de fissures révélé par `heat`), avec une **brume de chaleur** (réfraction) au-dessus. Le secteur reste tiède et fumant 3 s après la frappe.
- **Orichalque** : métal rouge-or `#D4A04C`, rugosité 0,3, gravures runiques en cavité. Il **reflète le noyau** par en dessous.
- **Anneaux magnétiques** : carbone et métal sombre avec **bandes d'énergie** (émissif défilant), et des **arcs électriques** occasionnels entre anneaux.
- **Empreinte thermique** : voir VFX 3.2.

### 1.5 Palette chromatique

| Rôle | Nom | Hex |
|---|---|---|
| Sol, vide | Marbre du Néant | `#07070A` |
| Veines | Or pâle | `#8A7A55` |
| Anneau | Orichalque | `#D4A04C` |
| Réacteur, froid | Cyan de confinement | `#3DE0FF` |
| Noyau | Plasma | `#FF6B2B` |
| Rayons (halo) | Violet ionique | `#B388FF` |
| Danger 1 (alerte) | Rouge sombre | `#8B1A2B` |
| Danger 2 (imminent) | Magenta surchauffe | `#FF2D55` |
| Danger 3 (frappe) | Blanc fusion | `#FFF3B0` |
| Échos (morts) | Cendre spectrale | `#6E7A8A` |
| Climax | Blanc projecteur | `#F4F1EA` |

**Règle** : le cyan est **sûr et neutre**, le chaud est **danger**. Plus c'est chaud, plus c'est proche. Un viewer daltonien distingue la progression par la **luminance** (du sombre au blanc) et non par la seule teinte.

---

## 2. Mise en scène et caméra

Cadrage de base : **plongée à 62°**, plateforme cadrée en ellipse dans la zone héros (y 300–1080). Le noyau rougeoie sous le bord inférieur de l'ellipse, les anneaux traversent le haut du cadre.

| Moment | Plan | Focale | Mouvement | DOF |
|---|---|---|---|---|
| **Largage** (lobby) | Les joueurs tombent du haut de la sphère en **capsules de lumière** et atterrissent sur leur secteur (petit cratère d'énergie à l'atterrissage) | 24 mm | Plan large fixe, anneaux en mouvement | f/8 |
| **Salve normale** | Plongée à 62° | 35 mm | **Orbite très lente** (1°/s) autour de l'axe | f/4 |
| **Télégraphe** | Même plan : l'**autofocus** passe sur le secteur en surchauffe | 35 mm | Micro push-in (2 %) | Rack focus vers le danger |
| **Frappe** | Plan inchangé, **caméra à l'épaule** au moment de l'impact | 35 mm | Traumatisme 0,5 | – |
| **Élimination notable** (leader, donateur, dernière chance manquée) | Insert **ralenti ×0,25** sur la vaporisation | 85 mm | Travelling circulaire autour de la victime | f/1.4 |
| **Top 10** | Rapprochement : la plateforme remplit le cadre | 50 mm | Orbite à 3°/s | f/2.8 |
| **Top 3 (climax)** | Voir 2.1 | 50–85 mm | – | f/1.4 |
| **Victoire** | Contre-plongée depuis le marbre (le reflet du vainqueur au premier plan, le vainqueur au-dessus), projecteur qui s'élargit | 24 mm | Grue montante lente | f/2 |

### 2.1 Le climax (Top 3)

1. **Bascule (2 s)** : dès qu'il reste 3 joueurs :
   - **tous les anneaux s'éteignent** un par un, du plus lointain au plus proche, avec un *clac* électrique à chaque fois ;
   - le noyau **retient son souffle** : il se contracte et passe du orange au **rouge profond presque noir** ;
   - le vortex ralentit.
2. **Obscurité** : il ne reste que trois **projecteurs volumétriques** qui tombent du zénith, un sur chaque finaliste. Des cônes blancs chauds, bien définis dans la poussière ionisée. Le marbre reflète les trois cônes : **six colonnes de lumière** dans le noir.
3. **Caméra** : 85 mm, f/1.4. Elle alterne entre les finalistes en **rack focus** : un finaliste net, les deux autres en bokeh lumineux derrière. Hors salve, elle tourne lentement autour d'eux.
4. **Esquives en ralenti** : chaque déplacement d'un finaliste est ralenti à ×0,4, avec des **traînées de lumière** (rémanence des rotules sur 0,5 s et motion blur de 360°). Le **sceau-PFP laisse une traînée holographique** : trois images fantômes décalées du portrait qui s'estompent.
5. **Quasi-impacts** : si un rayon frappe à moins de 1,5 m d'un finaliste qui s'en sort, **le temps s'arrête** 400 ms. La caméra fait un **arc de 30°** en temps figé (effet *bullet time*) autour du finaliste et du rayon, puis la scène reprend.

---

## 3. VFX et particules

### 3.1 Rayon orbital (frappe principale)

Séquence pour un secteur ciblé (la durée totale diminue avec les vagues, voir 4.3) :
1. **Télégraphe au sol (T−3 s → T−0,5 s)** :
   - le secteur monte en `heat` (rouge sombre, magenta, blanc) ;
   - les rainures d'orichalque qui le bordent **clignotent** avec une fréquence qui accélère (2 → 12 Hz) ;
   - des **étincelles** jaillissent des rainures ;
   - le marbre se **fissure** et une brume de chaleur monte.
2. **Télégraphe au ciel (T−1,5 s)** : sur l'anneau magnétique au-dessus du secteur, un **point d'énergie se concentre**. Des particules violettes sont aspirées vers un point, par attraction inverse, avec un **halo qui gonfle**.
3. **Frappe (T)** :
   - un **pilier de lumière** tombe en 2 images : cylindre volumétrique blanc, halo violet, bords en distorsion ;
   - **hit-stop de 90 ms** ;
   - **flash** global (exposition +1,5 EV sur 60 ms) ;
   - **onde de choc translucide** au sol : anneau de réfraction qui part du secteur et traverse toute la plateforme, soulevant la poussière ionisée et **faisant vaciller les sceaux-PFP** de tous les joueurs (les gyroscopes réagissent) ;
   - **étincelles de fusion** : 800 gouttelettes de marbre fondu projetées en arcs balistiques, blanc-jaune qui refroidit en orange puis en noir. Elles **rebondissent sur le marbre** et laissent de **micro-traces** incandescentes qui refroidissent en 2 s ;
   - **fumée** qui monte du secteur (volume, gris éclairé par dessous en orange).
4. **Retombée (T+0,5 s → T+3 s)** : le secteur reste en `heat` 0,4, craquelé, avec une brume de chaleur. **Le secteur est lisible comme « brûlé »**, ce qui aide à la lecture de la vague suivante.

### 3.2 Vaporisation (effet signature)

Quand un stickman est dans une zone frappée :
1. **0 ms** : son squelette **s'illumine de l'intérieur**. Le shader passe en *émissif blackbody* (os blancs, rotules qui explosent de lumière), avec une **silhouette cramée** à la frontière.
2. **40 ms** : **désintégration**. On échantillonne la surface du mesh (squelette et disque du sceau) en **3 000 à 6 000 points** qui deviennent des **braises GPU** :
   - chaque braise hérite de la **couleur de la surface** d'origine (matériau de faction, et les **pixels du portrait** pour celles du sceau) puis vire en blackbody (blanc, orange, rouge, cendre grise) sur 1,5 à 2,5 s ;
   - **physique** : impulsion initiale depuis le point d'impact, **gravité** ×0,6, **traînée** élevée, bruit de curl, et **aspiration** vers le haut dans le rayon (l'air chaud monte). Les braises qui sortent du rayon **retombent** en pluie de cendres sur le marbre et s'y **reflètent** ;
   - les braises les plus grosses (5 %) sont de **mini-fragments du portrait** qui tournoient, avec la PFP visible un instant sur chaque éclat.
3. **Empreinte thermique** : un **décal** au sol, à l'emplacement exact du stickman :
   - la **silhouette de son dernier geste** (projection du squelette sur le sol, comme les ombres d'Hiroshima) ;
   - au centre, **l'empreinte de sa PFP** convertie en **carte de chaleur** : la luminance du portrait est mappée sur un dégradé blackbody (zones claires en blanc-jaune, sombres en rouge éteint). **On reconnaît le visage, brûlé dans le marbre** ;
   - elle refroidit en **5 s** (blanc, orange, rouge, noir mat), avec une **fumée fine** qui s'en échappe. Le noir mat persiste en **ombre** 20 s supplémentaires : **la plateforme se couvre des fantômes des éliminés** ;
   - le pseudo reste gravé 3 s à côté en lettrage thermique.
4. **Élimination de masse** (plus de 10 joueurs dans une salve) : les braises de tous se **rassemblent** en un seul **tourbillon ascendant** dans le rayon, comme une colonne d'âmes, et l'audio suit (voir §6).

### 3.3 Autres dangers (vagues avancées)

- **Rayon balayeur** : un faisceau horizontal rase le sol et **tourne** autour du centre à vitesse constante. Le télégraphe est une **ligne laser rouge** au ras du marbre, 2 s avant. Des étincelles **lèchent** son passage et le marbre fond en sillon.
- **Anneau de surchauffe** : l'**anneau extérieur** de la plateforme (les 2 m du bord) monte en chaleur, réduisant l'arène. Visuel : le marbre du bord **se fend et tombe** en fragments dans le noyau (physique), et la plateforme **rétrécit réellement**.
- **Éruption du noyau** : des **filaments de plasma** jaillissent par le centre (cercle de 4 m). Télégraphe : le centre devient transparent, on voit le plasma **pousser** sous le marbre.
- **Leurre** (vagues 8+) : un secteur surchauffe puis **refroidit brusquement** à T−1 s, tandis qu'un **autre** passe au blanc en 1 s. Le télégraphe du leurre a une **fréquence de clignotement irrégulière** : les observateurs attentifs le repèrent.

### 3.4 Déplacements

- Sprint vers le secteur choisi : les rotules laissent une **légère traînée**, avec des **étincelles** au freinage sur le marbre et un **reflet** dans le sol.
- Quand un grand nombre de joueurs se déplace en même temps, le **reflet dans le marbre** devient une **pluie de lucioles** colorées selon les factions.

---

## 4. Micro-mécaniques et pacing

### 4.1 Commandes

| Commande | Effet | Qui |
|---|---|---|
| `join` / `go` | Rejoindre (lobby de 30 s, 100 places, les premiers servis) | Tous |
| `1` à `8` | Courir vers ce secteur. Le dernier ordre fait foi. | Vivants |
| `c` | Courir vers le **centre** (zone neutre, voir 4.4) | Vivants |
| `1` à `8` (en Écho) | **Vote** du secteur visé par la prochaine salve | Morts (Échos) |

### 4.2 Déplacement : la distance est une ressource

- Temps de trajet : **secteur adjacent 0,7 s**, puis +0,4 s par secteur supplémentaire. Le **secteur opposé** coûte **2,1 s**, et le **centre** 0,9 s depuis n'importe où.
- Un joueur **en transit** est **vulnérable sur tout son trajet** : s'il traverse un secteur au moment de la frappe, il est vaporisé.
- Conséquence : **lire tôt** le télégraphe et **choisir un refuge proche** bat la réaction tardive vers le « meilleur » refuge. Les joueurs qui ont trop attendu, les « retardataires », sont ceux qui meurent en transit, et **c'est visible** : on les voit courir, puis être désintégrés à un mètre de la sécurité. C'est très narratif.

### 4.3 Tension croissante

| Vague | Secteurs frappés | Télégraphe | Nouveautés |
|---|---|---|---|
| 1–2 | 2 sur 8 | 4 s | – |
| 3–4 | 3 sur 8 | 3,5 s | Les Échos votent pour 1 secteur |
| 5–6 | 4 sur 8 | 3 s | **Rayon balayeur** combiné à une salve |
| 7–8 | 4 sur 8 | 2,5 s | **Anneau de surchauffe** : le bord tombe, et le **leurre** apparaît |
| 9+ | 5 sur 8 | 2 s | Éruption du noyau (le centre n'est plus sûr), leurres fréquents |
| **Top 3** | 1 sur 3 zones (voir 4.5) | 2,5 s (plus lisible) | Duel |

- **Pause entre vagues** : 4 s, qui raccourcit jusqu'à 2,5 s. Pendant la pause, un **pouls du noyau** se fait entendre et **la caméra respire**.
- **Anti-grappe** : si plus de 50 % des vivants sont dans un même secteur, ce secteur est **garanti ciblé** à la vague suivante, avec un télégraphe **plus long** (+1 s). C'est juste, et ça force à se disperser.
- **Centre** : c'est une zone neutre sûre **jusqu'à la vague 8**, mais qui ne peut accueillir que 4 joueurs. Au-delà, les derniers arrivés sont **éjectés** (poussés par le champ magnétique) vers un secteur aléatoire.

### 4.4 Top 3 : le duel

- La plateforme est recomposée en **3 zones de lumière** (une sous chaque projecteur) et **4 zones d'ombre** entre elles. Les commandes deviennent `1` à `7`.
- À chaque salve, **une seule** zone est frappée, mais le **télégraphe est dans le noir** : seul un **son** l'annonce (battement de cœur qui se décale dans l'espace stéréo) avec une **lueur rouge très faible** au sol. **On entend le danger avant de le voir.** C'est la seule phase où l'audio porte l'information principale.
- Chaque finaliste **voit son projecteur le suivre**. Le vainqueur est le dernier debout, ou après 5 salves le joueur **le plus proche du centre**, ce qui force une **montée au centre** finale.

### 4.5 Innovations TikTok

**Échos du Néant (vengeance).** Les éliminés deviennent des **Échos** :
- visuellement, une **silhouette de cendre** (`#6E7A8A`, particules qui se reforment en boucle) debout sur leur empreinte thermique, **tournée vers leur assassin**, c'est-à-dire le joueur le plus proche au moment de leur mort ;
- en tapant un secteur, ils **votent la cible** de la prochaine salve. Le secteur le plus voté par les Échos est **ajouté** aux secteurs frappés (il ne remplace pas le choix du réacteur) ;
- **télégraphe spécifique** : le secteur voté par les Échos se couvre de **mains de cendre** qui sortent du marbre. Les vivants **savent** que les morts les chassent ;
- **Top 3** : le vote des Échos cible **un finaliste nommément** (on tape son pseudo, en autocomplétion floue). Il reçoit une **ombre de cendre** qui le suit, et son projecteur **vacille**. Au 3e vote, sa prochaine frappe a un télégraphe **plus court de 0,5 s**. **La foule des morts fait le verdict final** : moment de rivalité maximal.

**Surcharge du réacteur (combo de likes).** Une jauge de surcharge collective. À son seuil (normalisé, voir README §5.1), une **Surcharge** survient :
- visuel : **tous les anneaux passent au rouge**, le noyau **pulse en blanc**, des arcs électriques relient les anneaux au marbre et la caméra vibre en continu ;
- effet : la **prochaine salve est doublée**, mais son télégraphe est **plus long** (+1 s). Plus de morts, mais plus de chances de survivre pour les attentifs : les likers veulent du chaos, les joueurs veulent de la lisibilité, et tout le monde y gagne en spectacle ;
- la Surcharge ne peut pas se déclencher en Top 3 : **le climax reste pur**.

**Cadeaux.**

| Palier | Effet visuel | Effet de jeu |
|---|---|---|
| Petit | **Anneau d'orichalque** autour du sceau du donateur, son pseudo gravé en lettres d'or sur l'anneau de l'arène pour la partie | Aucun |
| Moyen | **Bouclier hexagonal** : dôme de cellules hexagonales cyan autour du stickman. Quand un rayon le frappe, **les cellules éclatent une à une** en ralenti, le stickman survit, et le dôme se brise en verre qui tombe et se reflète sur le marbre | Survit à **1 frappe**, une fois par partie. Indisponible en Top 3. |
| Grand | **Résurrection** : l'empreinte thermique du donateur **se rallume**, ses braises **se rassemblent à rebours** (la vaporisation jouée à l'envers, en 2 s, avec un chœur inversé), et il réapparaît en rang Chrome liquide temporaire | Revient en jeu une fois par partie. **Seulement avant le Top 10.** |

**Partage** : chaque partage fait tomber une **capsule de ravitaillement** qui dévie la **prochaine** frappe visant le partageur de 1 secteur (une fois par joueur).

---

## 5. UI verticale 9:16

```
 0 ┌──────────────────────────────┐
   │ (zone TikTok)                │
280├──────────────────────────────┤
   │  ◯ anneaux magnétiques ◯     │  Numéro de vague gravé en lumière sur l'anneau supérieur
   │        8   1                 │
   │     7   ⬤ (centre)  2        │  y 420–1000 : plateforme en ellipse
   │     6              3         │  Chiffres de secteurs incrustés dans l'orichalque du bord
   │        5   4                 │
   │   ░ noyau rougeoyant ░       │
1080├───────────────┬──────────────┤
   │ plasma, vide  │ ◉ 37 / 100   │  Survivants : chiffre dans un sceau vide
   │ (chat natif   │ ║▓▓▓░║ SURCH.│  Jauge de surcharge : colonne de plasma
   │  par-dessus)  │ ☠ échos : 63 │  Échos
1760└───────────────┴──────────────┘
```

- **Numéros de secteur** : **incrustés dans l'anneau d'orichalque** au bord de chaque secteur, en Chakra Petch Bold de 96 px, émissif cyan quand c'est sûr et **chaud** quand le secteur surchauffe. **Le chiffre est le télégraphe** : il suit le `heat` du secteur. Ils sont toujours orientés vers la caméra (glyphes billboard gravés).
- **Compteur de survivants** : un **sceau vide** (anneau gyroscopique sans portrait) qui tourne dans la colonne droite, avec le chiffre gravé au centre. **Chaque mort fait tressauter les gyroscopes.**
- **Jauge de surcharge** : une **colonne de plasma** verticale dans un tube de verre cerclé d'orichalque. Le plasma monte et **bouillonne** à l'approche du seuil.
- **Timer de télégraphe** : il n'existe pas en chiffres. C'est la **fréquence de clignotement** des rainures et le **son** qui accélèrent.
- **Kill feed** : pas de liste. Chaque mort produit son **empreinte thermique et son pseudo gravé** au sol, **à l'endroit de la mort**. Le kill feed, c'est la plateforme.
- **Annonces** (« VAGUE 7 », « SURCHARGE », « TOP 3 ») : Chakra Petch de 150 px en **hologramme** qui scintille (scanlines, décalage RGB, parasites) et se **désintègre en braises** comme un joueur vaporisé.
- **Victoire** : le sceau-PFP du vainqueur **grandit** jusqu'à 3 m au-dessus de lui, éclairé par le projecteur, pendant que les anneaux se rallument un à un et que le noyau **se stabilise** (passe au blanc pur, calme). Le pseudo est gravé dans l'anneau d'orichalque pour la partie suivante.

---

## 6. Audio

### 6.1 Nappe évolutive

| Couche | Contenu |
|---|---|
| Base | **Bourdonnement du réacteur** : harmoniques d'un transformateur (50 Hz et harmoniques) et drone sub de 32 Hz. Les **anneaux** chantent (sinus lents, légèrement détunés, spatialisés par anneau) |
| Pouls | **Pulsation du noyau** : impact sub de 38 Hz à 0,5 Hz, qui accélère avec les vagues (jusqu'à 1,2 Hz) |
| Tension 1 | Synthés analogiques en arpèges froids (tempo lié au pouls) |
| Tension 2 | Textures granulaires de métal frotté, cordes en harmoniques |
| Tension 3 | Percussions industrielles et basse distordue |
| **Top 3** | **Tout se coupe** (voir 6.3) |

### 6.2 Sons signature

- **Télégraphe de secteur** : **grésillement électrique** montant (bruit filtré dont le passe-bande glisse de 500 Hz à 6 kHz) et **bip** dont la cadence suit le clignotement. Spatialisé : le son vient **de la direction du secteur** dans l'image stéréo.
- **Concentration du rayon** : **aspiration** inversée (souffle joué à l'envers avec un sub qui monte).
- **Frappe** : `SFX_IMPACT` en quatre couches :
  - crack électrique (5–10 kHz) ;
  - **explosion** de plasma (bruit rose, 200 Hz–3 kHz, compression violente) ;
  - **sub 40 Hz** avec enveloppe de pitch ;
  - **queue** de **métal lourd** qui résonne (les anneaux vibrent, 4 s de réverbération métallique).

  Le sidechain creuse tout le reste.
- **Vaporisation** : un **souffle de combustion** (flamme aspirée), le **crépitement** des braises (grésillement fin, stéréo large) et une **note tenue** unique par joueur (dérivée du hash de son ID : **chaque joueur meurt sur sa propre note**). En élimination de masse, les notes forment un **accord dissonant**, qui est le son de la colonne d'âmes.
- **Bouclier hexagonal** : verre brisé en ralenti avec cloches cristallines, puis sub.
- **Résurrection** : l'audio de la vaporisation **joué à l'envers**, avec une **voix de chœur inversée**, qui se résout sur un accord.

### 6.3 Le climax audio

- **Bascule Top 3** : à chaque anneau qui s'éteint, un *clac* électrique puis une **coupure** de sa note. Le mix **se vide couche par couche**, jusqu'au **silence complet** pendant 1,2 s.
- Puis **seul un battement de cœur** : caverneux, 45 BPM, sub de 40 Hz et **peau** de 80–120 Hz, réverbération de caverne de 4 s. Il accélère à chaque salve (55, 70, 90 BPM).
- **Télégraphe spatialisé** : pendant le duel, le battement **se déplace** dans l'espace stéréo vers la zone qui va être frappée. C'est l'information de gameplay principale (voir 4.4). **Au casque, on joue les yeux fermés.**
- **Esquive en ralenti** : l'audio est pitché à −7 demi-tons avec un souffle d'air.
- **Victoire** : un **dernier battement**, silence de 2 s, puis les anneaux se rallument en **accord majeur** qui monte, et le noyau passe du grondement à une **note pure et calme**. Le réacteur est apaisé.
