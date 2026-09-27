# I. LE PONT PIÉGÉ : « Abysse des Condamnés »

> *« Le pont se souvient de chaque pas. Il ne pardonne que les pas justes. »*

Fondations communes (stickman, runtime, UI, audio) : voir [README](README.md).

## En 3 points
1. **Mécanique** : le pont se franchit rangée par rangée. Chaque rangée compte 3 dalles, dont une ou plusieurs sont **condamnées**. Les joueurs tapent `1`, `2` ou `3` pour choisir leur dalle.
2. **Victoire / défaite** : une dalle condamnée s'effrite sous le poids et son occupant tombe dans l'abysse. Les survivants de la dernière rangée franchissent le **Portail des Justes**, et leur score dépend de la prise de risque.
3. **Levier** : le dilemme **Éclaireur contre Suiveur**. S'engager tôt rapporte beaucoup mais renseigne les autres. Attendre est sûr mais rapporte peu. Les morts reviennent en **Âmes de l'Abysse** pour maudire les vivants.

---

## 1. Atmosphère et environnement

### 1.1 Géographie

- **Le pont** : 12 rangées de 3 dalles (dalle de 2,4 × 2,4 m, épaisseur 0,6 m), soit environ 40 m de long. Il est soutenu par des **arches brisées** qui plongent dans le vide. Les arches ne rejoignent jamais le fond : elles se perdent dans le brouillard à −60 m.
- **Parapets** : des statues de **gardiens agenouillés** (8 m, pierre érodée, visages effacés) tiennent des chaînes de bronze oxydé qui retiennent le tablier. Toutes les 3 rangées, une paire de gardiens marque un **palier**, avec une vasque de feu qui fait office de point de lumière chaude.
- **La crevasse** : des falaises verticales de basalte en orgues (colonnes hexagonales), à 25 m de part et d'autre. Des veines de lave coulent le long des failles et **éclairent par en dessous**.
- **L'horizon** : au bout du pont, le **Portail des Justes**, un arc monolithique de 20 m. Un voile de lumière froide (`#7FD1FF`) ondule dans l'ouverture. C'est la seule source froide de la scène : l'espoir est bleu, l'enfer est orange.
- **En contrebas** : une mer de nuages lents, éclairés par-dessous en rouge et orange, à −80 m. Des **silhouettes de ponts plus anciens**, effondrés, dépassent parfois du brouillard. Le lore implicite : on n'est pas les premiers.

### 1.2 Éclairage

| Source | Type | Couleur | Intensité / rôle |
|---|---|---|---|
| **Abysse (lave)** | Grande area light rectangulaire, **orientée vers le haut**, sous le pont, plus émissifs de lave | `#FF4A12` → `#B31B0B` | Key light **par en dessous** : c'est la signature du jeu. Les visages-sceaux sont éclairés comme à la bougie par le bas. |
| **Lune voilée** | Directionnelle, 25° d'élévation, de dos | `#9FB4D6` | Rim light froid sur les silhouettes, ombres longues vers la caméra |
| **Vasques des paliers** | Point lights avec scintillement (bruit 8 Hz + 1,3 Hz) | `#FFB347` | Îlots de chaleur, ombres portées dynamiques des stickmen sur les dalles |
| **Runes des dalles** | Émissif | `#7FD1FF` (saine) / `#FF3B2F` (révélée condamnée) | Information de gameplay (voir §4) |
| **Portail** | Area light + god rays | `#7FD1FF` | Contre-jour lointain, attire l'œil vers le haut du cadre |

- **GI** : l'orange de l'abysse rebondit sur le dessous des arches et sur la face inférieure des dalles. Avec Lumen, c'est gratuit. En WebGPU, on pose des *light probes* statiques et un SSGI sur la zone du pont.
- **Ombres** : ombres de contact de 2 cm sous les pieds (sans quoi les personnages « flottent »), cascade haute résolution sur les 4 rangées proches.

### 1.3 Brouillard volumétrique

- **Brouillard de hauteur exponentiel**, densité maximale à −30 m et en dessous. Le pont se situe dans la **zone de transition** : des langues de brume **lèchent** les dalles.
- **Volumétrie éclairée** : l'area light de lave diffuse dans le brouillard (anisotropie g = 0,6 vers le haut). Les rayons qui passent entre les dalles et les arches dessinent des **lames de lumière orange verticales**. Chaque dalle qui tombe **ouvre un nouveau puits de lumière**, le trou devient un projecteur venu d'en dessous : **le vide éclaire la scène**.
- **Poussière suspendue** : des braises lentes montent de l'abysse (gros éléments peu nombreux, voir la contrainte de compression du README §2.3).

### 1.4 Shaders de surface

- **Pierre runique** : trois couches mélangées par masques (hauteur et courbure) :
  1. basalte gris-brun (`#3A3530`, rugosité 0,85) ;
  2. **pierre humide** dans les creux (albedo × 0,6, rugosité 0,25, **reflets de la lave** dans les flaques via SSR ou Lumen) ;
  3. mousse sèche sur les faces nord (`#2F3A2C`).
- **Runes** : gravées à 1 cm de profondeur (POM ou displacement Nanite). L'émissif ne vit **qu'au fond du creux**, de sorte que la lumière semble sortir de la pierre.
- **Fissures dynamiques** : chaque dalle possède un **masque de fissures** (texture de distance) avec un uniforme `stress ∈ [0,1]`. À mesure que des joueurs choisissent une dalle, `stress` monte : les fissures s'ouvrent, de la poussière fine tombe des bords et une lueur orange filtre depuis le dessous. **La dalle ne ment pas sur son poids, mais elle ment sur sa solidité** : les dalles saines et condamnées se fissurent pareil tant que rien n'est révélé.
- **Lave** : flow map et bruit de Voronoï animé, croûte noire (`#1A0E0A`) qui se fend sur un cœur incandescent (`#FFB347` → `#FF4A12`), émissif HDR ×40. Une **distorsion de chaleur** (réfraction en espace écran) apparaît au-dessus de chaque veine.
- **Chaînes de bronze** : bronze oxydé (vert-de-gris `#3E6B5A` dans les creux, bronze poli `#8C6A3F` sur les arêtes). Elles **se balancent** quand une dalle voisine tombe (simulation de corde, 12 segments).

### 1.5 Palette chromatique

| Rôle | Nom | Hex |
|---|---|---|
| Fond, ombres | Basalte nuit | `#0E0C0F` |
| Pierre | Pierre runique | `#3A3530` |
| Pierre, lumière rasante | Grès brûlé | `#6B5646` |
| Danger primaire | Cœur de lave | `#FF4A12` |
| Danger profond | Lave figée | `#B31B0B` |
| Chaleur, braises | Braise | `#FFB347` |
| Brouillard éclairé | Brume d'abysse | `#3B1E24` |
| Espoir, sécurité, portail | Rune froide | `#7FD1FF` |
| Texte gravé, os éclairé | Ivoire d'ossuaire | `#E8DCC4` |
| Âmes de l'Abysse | Spectre | `#9AF5D2` |

**Règle** : le bleu froid est **réservé** à la sécurité et à l'information. Il n'apparaît jamais comme décor.

---

## 2. Mise en scène et caméra

La caméra est **verticale par essence**. Le pont s'enfonce vers le haut du cadre (vers le Portail) et l'abysse occupe le bas. Point de fuite du pont à y ≈ 520 : l'action tombe dans la zone héros.

| Moment | Plan | Focale | Mouvement | DOF |
|---|---|---|---|---|
| **Ouverture de partie** (4 s) | Grue descendante : du Portail jusqu'au premier palier, en survolant l'abysse | 24 mm | Descente de 30 m, rotation de 15° | f/8, tout net |
| **Phase de choix** | Plongée à 35° derrière les joueurs, rangée active au centre | 35 mm | Travelling très lent vers l'avant (0,2 m/s) | f/2.8 sur la rangée active, arrière-plan flou |
| **Engagement de l'Éclaireur** | Insert serré sur le pied qui se pose | 85 mm | **Caméra à l'épaule** (bruit de Perlin, 0,6° / 3 Hz) | f/1.4, **rack focus** du pied à la dalle voisine |
| **Silence pré-révélation** (0,8 s) | Plan large en contre-plongée depuis *sous* le pont, entre deux arches, silhouettes en contre-jour sur le ciel | 28 mm | Immobile, légère respiration | f/4 |
| **Révélation / effritement** | Retour en plongée, **ralenti ×0,35** pendant 1,2 s | 50 mm | Micro-dolly avant | f/2 sur la dalle qui cède |
| **Chute** | La caméra **plonge avec** le joueur mis en avant (voir 2.1) | 18 mm | Chute libre, roulis de 20° | f/5.6 |
| **Franchissement du Portail** | Travelling latéral 3/4 face, les survivants traversent le voile de lumière | 50 mm | Ralenti ×0,5, flare anamorphique | f/2 |

### 2.1 La chute vertigineuse (plan signature)

1. **T+0** : la dalle cède. Hit-stop de 110 ms, puis ralenti à ×0,35.
2. **T+0,3 s** : la caméra se détache de son rail et passe **en vue plongeante zénithale**, placée au-dessus du joueur qui tombe. Le pont remonte hors du cadre vers le haut, le joueur et ses débris de dalle chutent vers le bas du cadre, où les nuages rougeoyants attendent.
3. **Déformation de l'air** : une réfraction radiale en espace écran (vitesse de chute) se combine à des **lignes de vitesse** volumétriques (fines traînées de brume étirées). Le FOV s'élargit de 18 à 14 mm (effet vertigo : *dolly zoom* inversé).
4. **T+1,1 s** : le stickman traverse la couche de nuages. Son sceau capte une dernière lueur orange, puis tout est **englouti**. La caméra s'arrête net à la surface des nuages et remonte (cut en 6 images) sur le pont.
5. **Règle d'usage** : **un seul plan de chute par révélation**, sinon le rythme meurt. Le jeu choisit le chuteur le plus **narratif**, par ordre de priorité : donateur > leader du score > Éclaireur audacieux > aléatoire. Les autres chutes se voient en plan large.

### 2.2 Ralentis « Matrix »

Les ralentis sont réservés aux **révélations** et au **franchissement final**. Pendant un ralenti :
- l'obturateur passe à 270° (traînées plus longues) ;
- les particules continuent à **vitesse réelle ×0,6** : elles ralentissent moins que les corps, ce qui crée l'effet de temps suspendu autour des personnages ;
- l'audio est pitché à −5 demi-tons avec un passe-bas à 2 kHz, puis revient d'un coup à la reprise.

---

## 3. VFX et particules

### 3.1 Effritement de dalle (effet signature)

- **Pré-fracture** : chaque dalle est découpée hors ligne en **40 à 60 fragments de Voronoï** (fracture Houdini ou Chaos), avec des faces intérieures texturées : pierre brute plus claire (`#6B5646`) et **veines internes incandescentes**. C'est la chaleur de l'abysse qui a « cuit » la dalle de l'intérieur.
- **Séquence** (durée totale 1,6 s) :
  1. **0–120 ms** : la lueur orange des fissures passe de 0 à ×20. Un nuage de poussière fine (sprites éclairés, particules douces) s'échappe des fissures.
  2. **120 ms** : la contrainte cède. Les fragments passent en **corps rigides** avec une impulsion radiale faible (la dalle **s'effondre**, elle n'explose pas) et une gravité ×1,2 pour le poids.
  3. **120–600 ms** : chaque fragment traîne une **fine fumée** (ruban) et perd ses runes, dont l'émissif s'éteint de fragment en fragment en 300 ms (« la magie s'en va »).
  4. **Débris** : 200 à 400 cailloux instanciés et 1 nuage de poussière volumétrique (densité 3D animée, 1,2 s) éclairé **par en dessous** en orange.
  5. **Chaînes voisines** : impulsion de balancement. **Dalles adjacentes** : `stress += 0,15`, avec de la poussière qui tombe des bords (le pont souffre).
- **Nouveau puits de lumière** : le trou laissé révèle l'abysse. Une lame de lumière volumétrique orange monte par l'ouverture et y restera jusqu'à la fin de la partie. **Le pont se troue et s'éclaire au fil de la partie** : l'état de la partie est lisible d'un coup d'œil.

### 3.2 Chute du stickman

- **Ragdoll pur** (moteurs PD à 0), avec une impulsion angulaire aléatoire. Les membres battent dans l'air : des forces de traînée par os créent le flottement.
- **Rotules** : leur émissif s'intensifie (×2) pendant la chute, comme des étoiles filantes qui tombent vers la lave, avec un **trail** de 0,3 s par rotule.
- **Sceau** : les anneaux gyroscopiques s'emballent, le portrait se fissure progressivement (`damage` de 0 à 0,6 pendant la chute).
- **Impact dans les nuages** : un cratère dans la mer de nuages (déformation du volume de densité), un flash orange sous la couche, puis des **braises qui remontent** 1,5 s plus tard. C'est l'écho visuel de la mort.

### 3.3 Ambiance permanente

- **Braises ascendantes** : 3 000 particules GPU en bruit de curl, taille 4–10 px, cycle de couleur `#FFB347` → `#FF4A12` → gris (mort). Leur densité **augmente avec la tension** de la partie.
- **Cendres qui tombent** du ciel : peu nombreuses, grises, rugueuses, éclairées par la lune.
- **Distorsion de chaleur** au-dessus de chaque trou dans le pont.
- **Vasques** : flammes en flipbook volumétrique (simulation de fluide pré-calculée, 64 images), avec des étincelles occasionnelles qui retombent sur les dalles et **rebondissent**.

### 3.4 Pas des stickmen

À chaque pas : une **micro-bouffée de poussière** au talon, une **étincelle** si le pied métallique racle la pierre (rang Or ou Chrome), et une **empreinte temporaire** (décal humide qui s'évapore en 3 s).

---

## 4. Micro-mécaniques et pacing

### 4.1 Commandes chat

| Commande | Effet | Qui |
|---|---|---|
| `go` / `rejoindre` | Entrer sur le pont (pendant l'ouverture ou le lobby) | Tous |
| `1` / `2` / `3` | Choisir sa dalle pour la rangée en cours. **Le dernier choix fait foi** jusqu'au verrouillage. | Vivants |
| `maudire 1` / `2` / `3` | Voter une malédiction sur une dalle de la **prochaine** rangée | Âmes de l'Abysse (morts) |

### 4.2 Déroulé d'une rangée (10 s, qui raccourcissent jusqu'à 6 s)

| Temps | Phase | Ce qui se passe |
|---|---|---|
| 0–3 s | **Fenêtre d'Éclaireur** | Ceux qui choisissent maintenant deviennent **Éclaireurs** : leur sceau s'embrase d'une couronne de flammes, gain **×3** s'ils survivent. |
| 3 s | **Premier pas** | Les Éclaireurs **s'avancent réellement** sur leur dalle. Si l'un d'eux a choisi une dalle condamnée, **elle cède sous lui immédiatement**. |
| 3–8 s | **Fenêtre des Suiveurs** | Les autres choisissent, **informés** par le sort des Éclaireurs. Gain **×1**. |
| 8–9 s | **Traînards** | Les choix tardifs comptent, mais chaque traînard ajoute `stress` à sa dalle. Au-delà d'un seuil, **même une dalle saine peut céder** (voir 4.3). |
| 9 s | **Verrouillage et silence** | Mix à −24 dB, seul le vent reste. Plan en contre-plongée sous le pont. |
| 9,8 s | **Révélation** | Les dalles condamnées restantes s'effritent. Les runes des dalles saines virent au bleu froid. |

Qui ne choisit pas reste sur la rangée précédente et **perd sa série**. Au bout de 2 rangées d'inaction, il est **happé par le vent** et tombe (anti-AFK spectaculaire).

**Le dilemme en clair** :
- s'il n'y a **aucun Éclaireur**, personne n'est renseigné : tout le monde joue à l'aveugle au multiplicateur ×1. Le pont **exige un sacrifice**, ce qui pousse à la bravoure ;
- si les Éclaireurs couvrent la dalle condamnée, les Suiveurs savent laquelle éviter : **le courage des uns nourrit les autres** ;
- si les Éclaireurs survivent tous, les Suiveurs savent seulement quelles dalles sont sûres, et **la foule s'y entasse**… d'où la règle 4.3.

### 4.3 Surcharge : la foule est un danger

Chaque dalle supporte une charge maximale (`capacité = max(3, 25 % des vivants)`).
- Au-delà, `stress` grimpe : la dalle **gronde**, les fissures s'ouvrent en orange et de la poussière tombe.
- À **150 % de sa capacité**, **même une dalle saine cède** à la révélation.

Conséquence : suivre aveuglément la masse devient risqué. Les Suiveurs doivent **se répartir**, ce qui crée des débats dans le chat (« tous sur le 3 ! », « non, le 3 est plein ! »).

### 4.4 Tension croissante

| Rangées | Dalles condamnées | Temps de choix | Événements |
|---|---|---|---|
| 1–3 | 1 sur 3 | 10 s | Initiation |
| 4–6 | 1 sur 3 | 9 s | Les malédictions des Âmes s'activent |
| 7–9 | **2 sur 3** (une seule dalle sûre) | 8 s | Les vasques s'éteignent une à une, la scène s'assombrit |
| 10–11 | 2 sur 3, **dalle sûre mobile** (voir ci-dessous) | 7 s | Vent latéral, les chaînes claquent |
| 12 | **Dalle du Jugement** : 1 seule dalle sur 3 tient, et elle est **plafonnée à 3 joueurs** | 6 s | Silence total, le portail gronde |

- **Dalle sûre mobile** : pendant la fenêtre des Suiveurs, les runes « glissent » : la dalle sûre peut **changer une fois**, et seul un léger scintillement bleu le trahit. Les Éclaireurs, eux, ont vu la vérité avant le glissement.
- **Score** : `rangée × multiplicateur (×3 Éclaireur, ×1 Suiveur) × bonus de série`. La série (rangées consécutives réussies en Éclaireur) donne +0,5 par rangée. Les survivants finaux gagnent ×2.

### 4.5 Innovations TikTok

**Âmes de l'Abysse (vengeance).** Les morts reviennent en spectres translucides (`#9AF5D2`, shader fresnel et dissolution par bruit) qui **flottent sous le pont**, visibles entre les dalles. Pour chaque rangée à partir de la 4 :
- les Âmes votent `maudire N` sur une dalle de la rangée **suivante** ;
- la dalle qui reçoit le plus de votes devient **Maudite** : des mains spectrales l'agrippent par dessous, visibles dans les interstices ;
- une dalle maudite **saine** a 35 % de chances de céder quand même. Une dalle maudite **condamnée** cède **dès l'annonce**, ce qui fait gagner de l'information aux vivants. **Les morts peuvent trahir ou aider** ;
- **la trace compte** : les pseudos des maudisseurs s'affichent autour des mains spectrales (glyphe d'acte, voir README §3.3). Rancune garantie.

**Éruption (combo de likes).** La jauge de braise (voir UI) se remplit avec les likes. À son seuil (normalisé, voir README §5.1), l'abysse **entre en éruption** :
- des geysers de lave jaillissent entre les arches, un flash orange sature la scène et les nuages s'illuminent par en dessous ;
- pendant **1,5 s**, la lumière traverse les dalles par transparence : les **fissures internes des dalles condamnées apparaissent en silhouette**. C'est un indice pour ceux qui regardent bien ;
- l'éruption ne se déclenche **qu'en fenêtre des Suiveurs**. Les likers aident donc la foule, pas les Éclaireurs, et le dilemme reste entier.

**Cadeaux.**

| Cadeau (palier) | Effet visuel | Effet de jeu |
|---|---|---|
| Petit (Rose…) | Pétales de braise autour du sceau du donateur, son nom gravé sur la dalle qu'il occupe | Aucun (visibilité pure) |
| Moyen | **Grappin de chaîne** : si le donateur tombe dans cette partie, une chaîne de bronze jaillit d'un gardien et le **rattrape** en plein vol (ralenti, étincelles), puis le hisse sur la rangée | **1 sauvetage par partie** |
| Grand | **Vasque sacrée** : le donateur allume une vasque géante sur le palier, son portrait se projette dans les flammes | Rallume les vasques éteintes : la scène redevient lisible pour tous, bien commun |

---

## 5. UI verticale 9:16

```
 0 ┌──────────────────────────────┐
   │ (zone TikTok)                │
280├──────────────────────────────┤
   │   ⟐ PORTAIL (voile bleu) ⟐   │  y 300–420 : Portail = objectif visible
   │     ║   ║   ║                │
   │    [1] [2] [3]  rangée N+1   │  y 450–600 : rangée suivante (maudite ?)
   │   [ 1 ][ 2 ][ 3 ]  ACTIVE    │  y 650–900 : rangée active, chiffres runiques gravés
   │  ⚱  sceaux des joueurs   ⚱   │
   │                              │
1080├───────────────┬──────────────┤
   │  brume, abysse│ ╔══╗ chaîne  │  x 800–1040 : Jauge de braise (chaîne verticale)
   │ (chat natif   │ ║▓▓║ de       │
   │  par-dessus)  │ ║▓▓║ braise   │
   │               │ ╠══╣ 7/12    │  Compteur de rangée gravé sur un gardien
1760└───────────────┴──────────────┘
```

- **Chiffres de dalle** : gravés dans la pierre en **chiffres runiques stylisés** mais lisibles (le 1, le 2 et le 3 restent immédiatement reconnaissables), 120 px de haut, émissif bleu froid. **C'est la seule « UI » indispensable, et elle fait partie du décor.**
- **Compteur de joueurs par dalle** : les sceaux des joueurs forment une **grappe au-dessus de chaque dalle**. La taille de la grappe *est* le compteur. Au-delà de 12 joueurs, les sceaux se regroupent en un seul sceau-mosaïque avec un chiffre gravé sur la bague.
- **Timer** : les **runes de la rangée active s'éteignent une à une** en cercle autour de chaque chiffre. Pas de barre : le temps est une rune qui meurt.
- **Jauge de braise** (likes) : une **chaîne de bronze verticale** dans la colonne droite, dont les maillons chauffent un à un du bronze au rouge puis au blanc. Au seuil, la chaîne se rompt : c'est l'éruption.
- **Progression** : la rangée actuelle est gravée sur le socle d'un gardien (`VII / XII`), en chiffres romains Cinzel.
- **Annonces** (révélation, franchissement) : lettrage Cinzel Decorative de 140 px qui **se forme en braises** puis se dissipe vers le haut. 1,5 s maximum.
- **Classement** : les 3 meilleurs Éclaireurs portent une **couronne de flammes** au-dessus du sceau, dont la taille croît avec leur série. Pas de tableau : le leader se voit dans la scène.

---

## 6. Audio

### 6.1 Nappe évolutive

| Couche | Contenu | Présente quand |
|---|---|---|
| Tension 0 | Vent grave dans les arches (bruit filtré 80–400 Hz) et craquements lointains de pierre | Toujours |
| Tension 1 | **Drone d'abysse** : sinus détunés à 36 et 55 Hz, respiration lente | Dès la rangée 1 |
| Tension 2 | Chœur féminin lointain, voyelles tenues, réverbération de cathédrale de 9 s | Rangées 4+ |
| Tension 3 | Percussions de peau très graves (taiko étouffé), une frappe toutes les 2 mesures | Rangées 7+ |
| Tension 4 | Cordes graves en *col legno* et battement cardiaque sub | Rangées 10+ |

### 6.2 Sons signature

- **Choix d'une dalle** : un frottement de pierre court, *pitché selon le numéro de dalle* (1 grave, 2 médium, 3 aigu). L'oreille apprend le pont.
- **Engagement d'un Éclaireur** : allumage de flamme (souffle et crépitement) et un coup de gong feutré.
- **Stress de dalle** : grondement continu de pierre sous contrainte (granulaire, 60–200 Hz), qui monte avec `stress`, avec des **crépitements** aigus quand les fissures s'ouvrent.
- **Effritement**, en couches :
  1. **crack** transitoire (craquement de silex, 3–6 kHz) ;
  2. **effondrement** médium (éboulis, 300 Hz–2 kHz) ;
  3. **sub 40 Hz** compressé (voir README §4) ;
  4. **queue** de cailloux qui tombent et s'éloignent (auto-pan et passe-bas dynamique).
- **Chute** : un whoosh Doppler, puis tout le mix bascule sur un **passe-bas qui descend de 8 kHz à 400 Hz** en 1 s, avec une réverbération de 6 s. C'est l'**écho étouffé** : on entend le personnage disparaître dans la ouate. Suivent **0,6 s de silence** et un grondement lointain très bas (l'abysse « avale »).
- **Sauvetage au grappin** : un fouet de chaîne métallique (métal lourd, cliquetis de maillons en cascade) et un impact de tension.
- **Franchissement du Portail** : un accord majeur du chœur, **le seul accord majeur de tout le jeu**, et un souffle de vent qui se coupe net.

### 6.3 Silences

- **Avant chaque révélation** : 0,8 s où il ne reste que le vent.
- **Avant la Dalle du Jugement** : 2 s de silence total, sans même le vent. Puis un unique battement de cœur.
