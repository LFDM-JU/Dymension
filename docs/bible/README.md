# TRILOGIE « ABYSSES » : BIBLE ARTISTIQUE ET TECHNIQUE

> Trois jeux multijoueurs pour TikTok Live, format vertical 9:16.
> Un seul manifeste : **le stickman devient une relique de luxe**, et chaque spectateur y devient un personnage.

| # | Jeu | Direction | Fantasme joueur | Fichier |
|---|-----|-----------|-----------------|---------|
| I | Le Pont Piégé | *Abysse des Condamnés* | « J'ai eu le courage (ou la lâcheté) qu'il fallait » | [01-pont-piege.md](01-pont-piege.md) |
| II | La Guerre de Territoire | *Le Siège des Titans* | « Mon armée, ma bannière, mon titan » | [02-siege-des-titans.md](02-siege-des-titans.md) |
| III | L'Arène Battle Royale | *L'Épreuve du Néant* | « Dernier debout sous les projecteurs » | [03-epreuve-du-neant.md](03-epreuve-du-neant.md) |

Ce document pose les **fondations communes** : le stickman, le runtime, le post-traitement, la grille UI 9:16, le mixage audio et les mécaniques TikTok transverses. Chaque bible de jeu s'y réfère au lieu de les redéfinir.

---

## 0. Parti pris de direction

1. **La lumière raconte le danger.** Dans les trois jeux, l'information de gameplay passe d'abord par la lumière : une rune qui s'éteint, un sol qui rougit, un projecteur qui s'allume. Le texte ne vient qu'en dernier recours.
2. **La silhouette avant tout.** Un stickman ne vaut que par sa lecture en silhouette sur un téléphone de 6 pouces. On éclaire donc toujours en contre-jour, avec un rim light net. Aucun fond n'a la même valeur que les personnages.
3. **Le poids plutôt que la vitesse.** Hit-stops, inertie, poussière, silences : le spectaculaire vient du contraste entre le calme et l'impact, pas du bruit permanent.
4. **Le spectateur est dans l'image.** Sa PFP n'est pas un badge d'UI : c'est la tête de son personnage, éclairée par la scène, abîmée par les coups et gravée dans le décor quand il meurt.
5. **Zéro chat recopié à l'écran.** Le viewer voit déjà le chat natif TikTok. Le jeu ne montre que les **actes** (voir §5).

---

## 1. LE STICKMAN AAA NEXT-GEN : spécification de référence

### 1.1 Squelette et proportions

- **Rig de 17 os** : bassin, colonne ×2, cou, 2 × (clavicule, bras, avant-bras, main), 2 × (cuisse, tibia, pied).
- **Hauteur de référence** : 1,80 m (unité monde = 1 m). Les membres sont des **capsules effilées** : 5,5 cm de rayon à la racine, 3,2 cm à l'extrémité. Elles sont modélisées avec un léger galbe, jamais en cylindres parfaits. Un cylindre lit « prototype », un galbe lit « objet usiné ».
- **Articulations** : 13 **rotules mécaniques** (sphère de 7 cm dans une bague sertie). Chaque rotule est une source émissive (voir 1.3).
- **Lecture en silhouette** : épaules élargies de 10 % par rapport à un humain réel, colonne légèrement cambrée. La pose neutre est héroïque : poids sur une jambe, menton relevé.

### 1.2 Matériaux PBR par faction

Chaque joueur possède un **rang persistant** entre les trois jeux (voir §6.1). Ce rang détermine le matériau de son squelette, qui se gagne et ne s'achète pas.

| Faction / rang | Albedo | Métal | Rugosité | Détail de surface | Rotules (émissif) |
|---|---|---|---|---|---|
| **Obsidienne** (défaut) | `#0B0A0F` | 0 | 0,32 | Micro-conchoïdes (normal map de verre volcanique), clearcoat 0,6 | `#FF5A1F` braise |
| **Carbone tressé** | `#15181D` | 0,2 | 0,28 → 0,45 | Tissage 2×2 **anisotrope** (rotation d'anisotropie selon l'axe de l'os), clearcoat 1,0 / 0,05 | `#25F4EE` cyan |
| **Or runique** | `#C9A227` | 1 | 0,22 | Runes gravées (masque de cavité, AO pincé), usure sur les arêtes (curvature) | `#FFD27A` or chaud |
| **Chrome liquide** (champions) | `#E8ECF2` | 1 | 0,04 | Surface qui **coule** : déplacement de vertex par bruit de flux (flow map + curl noise, 0,4 cm d'amplitude), réfléchit l'environnement | `#B388FF` violet |

Règles communes :
- **Fresnel rim** systématique (`pow(1 - N·V, 4) × 0,6`) teinté de la couleur de faction. Il garantit la lecture sur fond sombre.
- **Salissure contextuelle** : un masque dynamique `wetness`, `dust` ou `soot` (0–1) par personnage, écrit par le jeu. La pluie du Siège assombrit l'albedo et baisse la rugosité, la poussière du Pont éclaircit les arêtes, la suie de l'Arène noircit les os après un quasi-impact.

### 1.3 Rotules luminescentes : lumière « GI » tenable en temps réel

On ne calcule pas une vraie GI par rotule pour 100 personnages : ce serait 1 300 lumières. La cascade est la suivante :
1. **Émissif + bloom** sur toutes les rotules (coût nul).
2. **Lumière de personnage** : une seule point light par stickman, placée au torse, de couleur faction, 1,2 m de rayon. Elle est pulsée au rythme de l'action (×1,6 sur une frappe) et éclaire les os voisins et le sol.
3. **Personnages « héros »** (8 max : caméra proche, top 3, cible d'un plan) : 5 point lights (bassin, mains, genoux) en *clustered forward*, plus un **SSGI** qui fait rebondir leur lumière sur le sol et les murs.
4. **Au sol** : un décal additif doux (« flaque de lumière ») sous chaque personnage non héros, pour simuler le rebond à coût quasi nul.

### 1.4 La tête-PFP : « le Sceau »

**Géométrie.** Un disque de 34 cm, épaisseur 1,5 cm, flotte 6 cm au-dessus du cou. Il est tenu par :
- une **bague de sertissage** usinée (même matériau que la faction, gravée du pseudo en lettrage de faction) ;
- **trois anneaux gyroscopiques** imbriqués, sur des axes à 90°, qui tournent lentement en idle et se **stabilisent** en mouvement : ressort amorti (k = 120, d = 14) qui ramène le disque face caméra avec un retard organique. Sur un impact, les anneaux s'emballent pendant 0,4 s.

**Matériau du portrait.** C'est un vrai matériau PBR, pas un sprite :
- `albedo = PFP` (sRGB, mip-mappée), `roughness 0,18`, `clearcoat 1`, `clearcoat roughness 0,05`, spéculaire de verre ;
- **normal map de verre bombé** (léger dôme) : la lumière de scène glisse sur la photo ;
- *émissif = PFP × 0,08* uniquement, pour que le portrait reste lisible dans le noir sans ignorer l'éclairage.

Conséquence recherchée : **une boule de feu qui passe à gauche peint réellement le côté gauche du portrait en orange**, grâce à l'éclairage direct, au spéculaire clearcoat et au bloom. Aucun trucage : c'est l'éclairage PBR standard appliqué à la photo.

**Shader de verre brisé** (dégâts critiques) :
- une texture de fissures **Voronoï pré-calculée** (distance aux arêtes et ID de cellule) ;
- un uniforme `damage ∈ [0,1]` révèle les fissures depuis le point d'impact (`impactUV`), avec une propagation radiale sur 90 ms ;
- chaque cellule reçoit un **décalage d'UV** (réfraction) et une micro-rotation de normale : le portrait se fragmente en facettes qui accrochent chacune la lumière différemment ;
- arêtes des fissures : léger **dédoublement chromatique** (R et B décalés de 1,5 px) et liseré blanc spéculaire ;
- à `damage = 1` (mort), les cellules se détachent en **éclats physiques** (instanced mesh, 24 à 40 éclats, UV hérités du portrait). Chaque éclat emporte son morceau de visage.

**Chargement des PFP.** Le pont Live télécharge l'avatar (`user.profilePicture`), le met en cache (les URL TikTok sont signées et expirent) et le sert en 256×256 sur `/avatar/:id` pour contourner le CORS. Côté GPU, les portraits vivent dans un **texture array** de 256 couches. Si la PFP manque, on génère un **sigil procédural** (runes selon le hash de l'ID).

### 1.5 Animation : mocap + ragdoll actif

- **Base mocap** : banque de poses martiales (garde d'escrimeur, fente, parade haute, charge au bouclier, chute arrière, relevé). Les clips sont retargetés sur le rig de 17 os.
- **Ragdoll actif** : chaque os est un corps rigide (capsule) relié par des joints à limites anatomiques. Des **moteurs PD** tirent le ragdoll vers la pose animée : raideur 1,0 en contrôle, qui chute à 0,05 à l'impact puis remonte sur 0,6 s. C'est ce qui donne ce mélange d'animation d'auteur et de physique crédible.
- **Hit-stop** : gel global à `timeScale = 0` pendant **60 ms** (coup moyen), **110 ms** (coup lourd) ou **160 ms** (coup critique ou mort). Pendant le gel, la caméra continue de trembler légèrement et les particules d'impact sont déjà émises. Le cerveau lit donc l'impact avant la reprise.
- **Inertie** : les impulsions d'impact respectent la masse (8 kg par stickman, 60 kg pour les Titans). Les corps glissent au sol avec une **friction de Coulomb** (μ = 0,6 sur la pierre, 0,25 dans la boue) et émettent de la poussière proportionnelle à la vitesse de glissement.
- **LOD de simulation** : ragdoll complet pour les 24 personnages les plus proches de la caméra, ragdoll simplifié à 5 corps au-delà, **VAT** (Vertex Animation Textures) instanciées pour les foules du Siège.

---

## 2. Runtime : recommandation de Lead Tech

### 2.1 Verdict

| Critère | **Unreal Engine 5 (build natif)** | **Three.js WebGPU (navigateur)** |
|---|---|---|
| Volumétrie, GI, reflets | Lumen, MegaLights, brouillard volumétrique natif, Lumen HW-RT | Froxels maison, SSGI/SSR approximés |
| Particules | Niagara (millions, GPU, collisions sur le depth buffer) | GPU compute (TSL), 100–300k raisonnable |
| Physique / destruction | Chaos (fracture, ragdolls) | Rapier (WASM), une centaine de corps actifs |
| Foules (Siège, 800 unités) | Mass Entity + VAT, confortable | Possible en VAT instancié, peu de marge |
| Itération et déploiement | Build lourd, PC streamer | Instantané, une URL |

**Recommandation : UE5 pour la production de la trilogie**, rendu sur le PC du streamer et capturé en fenêtre par OBS ou TikTok LIVE Studio. Le **pont Live Node existant (`live-bridge/`) reste la source de vérité** : UE5 s'y abonne en WebSocket et consomme exactement le format d'événement normalisé déjà en place.
Le **Pixel Streaming n'est pas nécessaire**. Le jeu tourne là où l'on capture le flux, et le Pixel Streaming ne sert qu'à diffuser vers un navigateur distant.

**Three.js WebGPU reste la voie de prototypage et de repli** : très crédible pour *Le Pont* et *L'Arène* (scènes contenues), trop juste pour *Le Siège* avec pluie, boue et 800 unités.
À savoir : le navigateur intégré à OBS (CEF) n'a pas toujours WebGPU activé. Pour une version web, on lance Chrome en fenêtre dédiée et on capture la fenêtre.

### 2.2 Cible de performance

- **Sortie : 1080×1920 à 60 i/s**, rendu interne en 1440×2560 puis sous-échantillonné, ou 1080×1920 avec TSR/DLSS en mode Qualité.
- **Matériel de référence** : RTX 4070 / Ryzen 7, tout en encodant le stream (NVENC, donc GPU partagé).

Budget de frame (16,6 ms, dont 3 ms réservées à l'encodage et à OBS) :

| Poste | ms |
|---|---|
| Géométrie + ombres (CSM 3 cascades + 4 ombres locales) | 3,5 |
| Éclairage + GI + reflets | 3,0 |
| Volumétrie (brouillard, god rays) | 1,5 |
| Particules | 1,5 |
| Physique (CPU, en parallèle) | – |
| Post-traitement | 2,0 |
| Marge | 2,1 |

### 2.3 Chaîne de post-traitement commune

Ordre de la chaîne : TAA/TSR → SSR → GTAO → brouillard volumétrique → DOF bokeh → motion blur par objet → bloom physique → tonemapping **AgX** → LUT par jeu → aberration chromatique → grain → vignette → saleté d'objectif.

- **DOF** piloté par la caméra (distance focale réelle, ouverture f/1.4 à f/4) : c'est lui qui permet les *rack focus*.
- **Motion blur** : obturateur à 180° en nominal, 270° pendant les ralentis stylisés (traînées « Matrix »).
- **Bloom** : seuil 1,0 en HDR (seuls les émissifs et les spéculaires fleurissent), intensité 0,35 hors climax.
- **Aberration chromatique** : 0 en nominal, jusqu'à 0,6 % sur les impacts (enveloppe de 200 ms). Jamais permanente.
- **Grain** : 3 % luminance seulement, *toujours* actif. Il masque le banding du brouillard dans la compression TikTok.
- **Contrainte de compression** : TikTok Live compresse fort (environ 3–6 Mb/s). On évite donc les **aplats de dégradé sombre** (banding) et les **particules fines sur tout l'écran** (bouillie de macroblocs). On préfère des particules moins nombreuses mais plus grosses et plus lumineuses. La grammaire VFX de chaque bible en tient compte.

---

## 3. Grille UI verticale 9:16 commune

### 3.1 Zones réservées par l'app TikTok

Sur l'app viewer, TikTok superpose ses propres éléments au flux. Coordonnées approximatives sur un canevas 1080×1920, **à valider sur une capture réelle du compte** avant de figer les maquettes :

```
 0 ┌──────────────────────────────┐
   │ ░ HÔTE / VIEWERS / CLASSEMENT ░│  y 0–280    : interdit (UI TikTok)
280├──────────────────────────────┤
   │                              │
   │     ZONE HÉROS (sûre)        │  y 280–1080 : cœur de l'action, HUD diégétique
   │                              │
1080├──────────────────┬───────────┤
   │ ░ CHAT NATIF ░    │  sûre     │  y 1080–1760, x 0–760 : chat TikTok (semi-opaque)
   │ ░ (bas gauche) ░  │  (droite) │  x 760–1080 : colonne sûre pour jauges verticales
1760├──────────────────┴───────────┤
   │ ░ SAISIE / CADEAUX / PARTAGE ░│  y 1760–1920 : interdit
1920└──────────────────────────────┘
```

Conséquences de mise en scène :
- **Le bas gauche est une zone de « décor calme »** : brouillard, sol, abysse. On n'y met rien d'important, car le chat natif s'y superpose et **c'est très bien ainsi** : le chat devient une brume de texte au-dessus d'une brume réelle.
- **L'action se cadre dans le tiers supérieur et le centre** (y 280–1080). Les compositions de caméra de chaque jeu placent le point focal vers y ≈ 700.
- **La colonne droite (x 760–1080, y 1080–1760)** accueille les jauges verticales et les classements, toujours sous forme d'objets du monde (colonnes, bannières, chaînes).

### 3.2 Typographie

| Usage | Pont & Siège | Arène |
|---|---|---|
| Titres, annonces | **Cinzel Decorative** (OFL), capitales, tracking +8 % | **Chakra Petch** Bold (OFL) |
| Chiffres, compteurs | Cinzel, chiffres elzéviriens | **JetBrains Mono** Bold |
| Pseudos | Inter SemiBold, capitales | Inter SemiBold |

- **Hauteur de capitale minimale : 44 px** sur le canevas de 1080 px (lisible sur téléphone après compression).
- Les textes de monde sont **gravés** (normal map + émissif dans le creux), jamais posés à plat. Les annonces plein écran utilisent un contour de 6 % de la taille du corps et une ombre portée floue (pas de contour noir « cartoon »).

### 3.3 Le « feed d'actes » : remplacer le chat par des traces dans le monde

Chaque commande reconnue produit une **trace diégétique** au lieu d'une ligne de texte :
- un **glyphe** (icône de la commande) accompagné du pseudo, qui s'élève de la tête-sceau du joueur puis se dissout en particules de la couleur de sa faction (1,2 s) ;
- les **commandes de masse** (500 « charge » en 3 s) ne créent pas 500 glyphes. On agrège : un seul glyphe géant, puis une **onde de lettres** qui parcourt l'armée ;
- les **cadeaux** ont droit à une **inscription gravée** persistante dans le décor du jeu, qui fait office de mur des donateurs : dalle du pont, bannière du siège, anneau de l'arène.

---

## 4. Audio : architecture de mixage commune

- **Bus** : `MUSIQUE`, `AMBIANCE`, `SFX_MONDE`, `SFX_IMPACT`, `UI`, `VOIX`.
- **Compression par sidechain** : `SFX_IMPACT` → `MUSIQUE` et `AMBIANCE` (−6 dB, attaque de 5 ms, relâchement de 250 ms). Chaque coup lourd **creuse le mix** pour se faire de la place.
- **Couche sub des impacts** : sinus à 40 Hz avec enveloppe de pitch 70 → 38 Hz sur 180 ms, saturé (tube) puis compressé (ratio 8:1). C'est lui qui « frappe la cage thoracique ». Il est doublé d'un transitoire de 2–5 kHz pour la lecture sur **haut-parleur de téléphone**, qui ne restitue rien sous 200 Hz. **Chaque impact doit fonctionner sur un haut-parleur de téléphone** : on vérifie tout le mixage à travers un filtre passe-haut de 300 Hz.
- **Silences** : un silence est un événement. Avant chaque révélation (chute de dalle, frappe orbitale), le mix entier descend à −24 dB en 400 ms et **seul un son reste** : battement, souffle, vent. Il dure de 0,6 à 1,2 s, puis l'impact tombe.
- **Loudness** : sortie master à −14 LUFS intégrés (norme des plateformes), true peak −1 dBTP, limiteur en bout de chaîne.
- **Musique adaptative** : stems verticaux (couches ajoutées selon la tension, 0–4) et transitions horizontales calées sur la mesure. La tension est un float global de 0 à 1 exposé par chaque jeu.
- **Sources** : le sound design AAA exige des **enregistrements** (bibliothèques sous licence : pierre, métal, foley d'armure, chœurs) retravaillés en couches. La synthèse Web Audio du prototype PUMP IT ne sert ici qu'aux maquettes.

---

## 5. Mécaniques TikTok transverses

| Signal TikTok | Rôle dans la trilogie | Garde-fous |
|---|---|---|
| **Commentaire-commande** | Action individuelle (choix, rejoindre, ordre) | 1 commande comptée par seconde et par joueur, tolérance aux fautes (`1`, `un`, `①`) |
| **Likes** | Énergie **collective** : les combos de likes déclenchent des événements de monde (météo, éruptions, surcharges) | Seuils calculés sur une fenêtre glissante et **normalisés par l'audience** (voir 5.1) |
| **Cadeaux** | Moments de **spectacle personnel** : le donateur devient visible (titan, bannière, résurrection) | Jamais une victoire achetée. Tout avantage est limité à une fois par partie et reste **contrable** |
| **Partages / follows** | Petits bonus visibles (renforts, éclats de lumière) | – |

### 5.1 Normalisation par l'audience

Un seuil fixe (« 1 000 likes ») est trivial avec 5 000 viewers et impossible avec 40. Tous les seuils sont donc indexés sur **l'activité récente** :

```
seuil = max(plancher, k × moyenne_glissante_likes_par_10s_sur_3min)
```

avec k ≈ 2,5. L'objectif est **un événement météo toutes les 60–90 s**, quelle que soit la taille du live.

### 5.2 Conformité

Les règles LIVE de TikTok encadrent les incitations aux cadeaux. **Vérifier la version en vigueur des règles LIVE et de monétisation avant la mise en ligne.** Principes de conception retenus pour rester du bon côté :
- un cadeau n'achète **ni la victoire ni l'élimination d'un autre joueur** ;
- tout ce qui compte pour gagner reste **accessible gratuitement** par le chat ;
- l'effet d'un cadeau est **surtout visuel** : il met le donateur en scène plus qu'il ne l'avantage.

Côté modération, les PFP s'affichent en grand (Titan, empreinte thermique, bannières). Le streamer dispose donc d'une **liste noire d'IDs** et d'un **mode sigils** qui remplace toutes les PFP par des sigils procéduraux.

---

## 6. Méta-progression de la trilogie

### 6.1 Rang persistant, matériau gagné

Les trois jeux partagent un profil par ID TikTok, stocké côté pont :

| Rang | Condition | Matériau |
|---|---|---|
| Condamné | 1re participation | Obsidienne |
| Vétéran | 10 parties **ou** 1 top 10 | Carbone tressé |
| Élu | 1 victoire dans n'importe quel jeu | Or runique |
| Légende | 1 victoire dans **chacun** des 3 jeux | Chrome liquide + gyroscopes à trainée lumineuse |

Le chrome liquide devient **visible et rare à l'écran**. C'est l'objet de désir qui fait revenir d'un live à l'autre.

### 6.2 Continuité visuelle

- Même stickman, même sceau et mêmes rotules dans les trois jeux : **un joueur reconnaît son personnage** d'un jeu à l'autre.
- Les Légendes laissent une trace permanente : leur nom est gravé sur le linteau du pont, sur une bannière du Siège et sur l'anneau d'orichalque de l'Arène.
