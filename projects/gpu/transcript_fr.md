# À l'intérieur d'une puce d'IA — Reiner Pope (MatX) × Dwarkesh

**Dwarkesh :** Je retrouve Reiner Pope, PDG de MatX, une nouvelle entreprise de puces dédiées à l'IA. La dernière fois, nous parlions de ce qui se passe à l'intérieur d'un data center. Aujourd'hui, je veux comprendre ce qui se passe à l'intérieur d'une puce d'IA. Comment fonctionne réellement une puce ? En toute transparence : je suis investisseur business angel chez MatX. J'espère donc que vous avez conçu une bonne puce.

**Reiner :** Je l'espère bien.

---

## Construire un multiply-accumulate à partir de portes logiques

### Les primitives fondamentales de la conception de puces

**Reiner :** Je vais partir de la plus petite unité fondamentale en conception de puces, et nous remonterons jusqu'à ce qu'est une puce de production et ses composants. Au tout premier niveau, les primitives avec lesquelles on travaille sont les portes logiques — des choses très simples comme AND, OR et NOT. Elles sont reliées entre elles par des fils qui doivent être disposés physiquement sous forme de pistes métalliques sur la puce. La fonction principale qu'une puce d'IA doit calculer, c'est la multiplication de matrices. À l'intérieur de cette opération, la primitive fondamentale est un multiply-accumulate appliqué à des paires de nombres. Nous allons faire ce calcul à la main, puis en déduire à quoi ressemblerait le circuit correspondant.

Le plus simple est de faire un multiply-accumulate d'un nombre de quatre bits avec un autre nombre de quatre bits. On multiplie ces deux termes, puis on additionne un nombre de huit bits.

### Pourquoi le multiply-accumulate est naturel pour les puces d'IA

**Dwarkesh :** Pourquoi est-ce la primitive naturelle pour les calculs qui se font dans un ordinateur ?

**Reiner :** Il y a plusieurs raisons. C'est un peu plus efficace, mais la raison pour laquelle c'est naturel pour les puces d'IA, c'est qu'en regardant ce qui se passe dans une multiplication matricielle…

**Dwarkesh :** Qu'est-ce qu'une multiplication matricielle, en bref ?

**Reiner :** C'est une boucle imbriquée sur i, j et k, avec `output[i, k] += input[i, j] × autre_input[j, k]`. Un multiply-accumulate intervient à chaque étape d'une multiplication matricielle.

L'autre observation, c'est que la précision sera presque toujours plus élevée à l'étape d'accumulation qu'à l'étape de multiplication. C'est spécifique aux puces d'IA. On multiplie des nombres en basse précision, et quand on accumule, les erreurs s'accumulent très vite, donc il faut plus de précision à cet endroit. C'est pour ça qu'on a choisi une multiplication sur quatre bits et une addition sur huit bits.

**Dwarkesh :** Il y a deux manières de comprendre ça. Soit la valeur sera plus grande que les entrées. Soit, dans le cas d'un nombre en virgule flottante…

**Reiner :** C'est exactement le même principe. Quand on additionne ce nombre, on additionne tout un tas de nombres, et plein d'erreurs d'arrondi s'accumulent. Alors que dans la multiplication elle-même, il n'y a qu'une seule multiplication dans la chaîne, donc peu d'erreurs s'accumulent.

### La multiplication longue, à la main

**Reiner :** En tant qu'humain, on séparerait probablement le calcul en deux étapes, mais on peut tout faire d'un coup avec la multiplication longue. D'abord, pour le terme de multiplication, on multiplie le nombre de quatre bits par chaque position binaire de l'autre nombre de quatre bits.

D'abord, `1001` multiplié par le bit de poids faible donne le nombre lui-même. Décalé d'un cran, on multiplie par 0, ce qui donne un nombre entièrement nul. Décalé d'un cran de plus, on multiplie par 1, ce qui redonne `1001`. Enfin, pour la dernière position binaire, on obtient à nouveau un nombre nul. Cela nous donne une série de produits partiels à additionner. Et tant qu'on y est, on ajoute aussi l'accumulateur. On a donc une somme à cinq termes à calculer.

### Les portes AND pour les produits partiels

**Reiner :** On a besoin de produire les 16 produits partiels. Chacun se calcule en multipliant un bit du premier nombre par un bit du second. On peut faire ça avec une porte AND : le résultat vaut 1 uniquement si les deux bits d'entrée valent 1. On a donc consommé 16 portes AND. Dans le cas général, une multiplication `p` bits par `q` bits demande `p × q` ANDs.

### Les additionneurs complets et les compresseurs 3→2

**Reiner :** Maintenant, on additionne. La majeure partie du travail va se faire dans l'addition. Laisse-moi décrire l'autre porte logique qu'on utilise ici. AND est presque la plus simple porte qui existe sur une puce. À l'autre extrême, la plus grosse porte logique qu'on utilise généralement est ce qu'on appelle un **additionneur complet** (full adder).

Si tu viens du logiciel, tu pourrais imaginer qu'un additionneur complet additionne deux nombres de 32 bits. En réalité, il additionne juste trois bits entre eux. Quand j'additionne trois bits, le résultat peut être 0, 1, 2 ou 3, donc je peux l'exprimer en binaire sur deux bits. Trois bits en entrée, deux bits en sortie. On appelle aussi ça un **compresseur 3→2**.

**Dwarkesh :** Juste pour être sûr de comprendre — les trois entrées, ce sont un X, un Y, et une retenue qui arrive ?

**Reiner :** Les trois entrées sont toutes des bits de la même colonne. Les deux sorties se répartissent ainsi : un bit dans la même colonne (la somme) et un bit décalé à gauche (la retenue sortante). Si les entrées sont `101`, la sortie est `10`. Si c'est `111`, alors `11`. Ce circuit capture exactement ce que nous, humains, faisons naturellement quand on additionne le long d'une colonne.

### Le multiplicateur de Dadda

**Reiner :** La méthode que je vais utiliser pour additionner sera un peu contre-intuitive pour un humain. Normalement on additionne une colonne et on retient la retenue mentalement. Ici, au lieu de retenir, on l'écrit explicitement. On part de la colonne la plus à droite et on remonte vers la gauche, en appliquant des additionneurs complets sur des triplets de bits.

Dans la colonne la plus à droite, on additionne 1 et 1, ce qui donne zéro avec une retenue de un. La colonne suivante a quatre nombres, donc on en prend trois, on applique un additionneur, et on obtient `00`. Au fur et à mesure que je consomme les bits, je les barre. On continue à appliquer des additionneurs complets sur des triplets dans chaque colonne, en retirant trois nombres et en en écrivant deux à la place, jusqu'à n'avoir plus qu'un seul nombre en sortie. Cette approche s'appelle un **multiplicateur de Dadda** — c'est la méthode standard pour faire des multiplicateurs efficaces en surface, à base d'additionneurs complets.

### Analyse de la taille du circuit

**Reiner :** Quantifions la taille du circuit. On est parti de 24 bits (16 produits partiels plus l'accumulateur sur 8 bits). On a fini avec 8 bits en sortie. Chaque additionneur complet élimine un bit. Donc on a utilisé 24 − 8 = 16 additionneurs complets. Dans le cas général, ce sera `p × q` additionneurs complets.

**Dwarkesh :** Laisse-moi vérifier la logique. Les bits d'entrée, 24, c'est `p × q + (p + q)`. Les bits de sortie, c'est juste `p + q`. Donc `p × q + (p + q) − (p + q) = p × q`.

**Reiner :** Exact. Je pense que ça explique la deuxième raison qui nous a fait choisir le multiply-accumulate. La première, c'est que c'est ce qui apparaît dans la multiplication matricielle. La seconde, c'est que ça donne cette algèbre vraiment élégante en `p × q`.

Chaque étape atomique devient une porte logique, et les fils relient le tout. C'est la primitive principale, à différentes largeurs de bits, qu'on trouve dans une puce d'IA.

### Le scaling quadratique et l'arbitrage FP4 / FP8

**Dwarkesh :** Quand Nvidia annonce que telle puce fait X FP4 ou la moitié en FP8, ça suggère que les circuits sont fongibles. Mais d'après ce que tu décris, il faudrait un multiply-accumulate dédié au FP4 et un autre au FP8. Est-ce qu'on peut les rendre fongibles ?

**Reiner :** Tels qu'on les a dessinés, pas vraiment. C'est même un des choix principaux quand on conçoit une puce : combien de FP4 et combien de FP8 ? Parfois j'aborde la question du point de vue des besoins du client. Un autre angle, c'est d'équilibrer le budget énergétique entre FP4 et FP8.

**Dwarkesh :** Quand ils annoncent 2× plus de FP4 que de FP8, ils répartissent simplement la surface de manière équivalente ?

**Reiner :** En partie, oui. Et puis il y a aussi une raison liée au mouvement des données. Il y a quelque chose de très pratique dans le fait qu'on peut empaqueter deux nombres de quatre bits dans la même place qu'un nombre de huit bits.

**Dwarkesh :** À bien y penser, ça donne l'impression que la surface est quadratique avec le nombre de bits.

**Reiner :** C'est une raison majeure. Nvidia a fait un changement. Historiquement, jusqu'au B100 ou B200, chaque fois que tu divisais la précision par deux, le nombre de FLOPs doublait. Mais à cause de ce scaling quadratique, ce ratio est légèrement faux — tu devrais obtenir un gain encore plus grand. Les fiches techniques de Nvidia ont commencé à le reconnaître à partir du B300 : le FP4 est trois fois plus rapide que le FP8. Alors qu'il devrait être 4×.

L'observation centrale, c'est ce scaling quadratique avec le nombre de bits — c'est la raison unique pour laquelle l'arithmétique basse précision marche aussi bien pour les réseaux de neurones.

---

## Les multiplexeurs et le coût du mouvement des données

### Le chemin de données d'un cœur CUDA ou CPU

**Reiner :** Revenons un peu en arrière, à l'époque des GPUs avant les Tensor Cores — qui fonctionnaient en fait comme les CPUs. De manière générique, dans un cœur CUDA ou un CPU, on a un banc de registres qui stocke un certain nombre d'entrées — peut-être huit entrées de nombres sur 4 bits dans notre cas, typiquement 32 bits en pratique. Dans le cœur, on a un circuit de multiply-accumulate. Il prend trois registres arbitraires du banc de registres, fait le multiply-accumulate, et écrit le résultat dans le banc de registres. C'est le chemin de données central de la plupart des processeurs.

### Qu'est-ce qu'un mux ?

**Reiner :** On veut analyser le coût du mouvement des données entre le banc de registres et l'ALU, dans les deux sens. Il faut un circuit qui permette de sélectionner n'importe lequel des registres à tout moment. Ce circuit, c'est un **mux** (multiplexeur). Dans notre cas, il a huit entrées — une par entrée du banc de registres — et une seule sortie.

**Dwarkesh :** Le mux ne fait que sélectionner une entrée ?

**Reiner :** Juste sélectionner, c'est invisible pour le logiciel. Tu dis « je veux l'entrée numéro trois », et il y a un mux qui s'en occupe.

### Analyse du coût d'un mux

**Reiner :** Quel est le coût de ce truc ? On n'a que des AND et des OR pour le construire. On fait la version la plus bête possible : on forme un masque. Pour lire la troisième entrée, on AND chaque entrée avec 1 ou 0 selon qu'on veut la lire ou non, puis on les OR toutes ensemble.

Pour un mux à `n` entrées sur `p` bits, il faut `n × p` portes AND (chaque bit de chaque entrée est masqué) et `(n − 1) × p` portes OR (pour fusionner les lignes masquées en une seule). On a trois muxes (un par entrée du multiply-accumulate), donc le coût total du mouvement des données est de `3 × n × p` portes AND, à comparer aux `p × q` portes du circuit qui fait réellement ce qu'on veut.

Avec `n = 8` et `q = 4` : `24 × p` portes pour le mouvement de données contre `4 × p` portes dans le multiplicateur-additionneur. Tout ce travail scale avec la taille du banc de registres, et c'est plusieurs fois plus coûteux que l'unité de calcul elle-même.

### Visualiser un mux à 2 voies

**Reiner :** Prenons un mux à deux voies. On a deux entrées différentes et un sélecteur encodé en one-hot (soit « je veux celle-ci » soit « je veux l'autre »). Très laborieusement, on AND chaque bit du sélecteur avec tous les bits de la ligne d'entrée correspondante. Une ligne devient les bits d'entrée réels, l'autre devient des zéros. Ensuite on OR les lignes deux à deux pour obtenir la sortie finale. Ça ressemble un peu à une addition — mêmes ANDs qu'en multiplication, mais collapsés avec de simples ORs au lieu d'additionneurs complets.

### Le problème caché du mouvement des données

**Reiner :** Dans ce circuit, presque tout le coût — sept huitièmes — est dans la lecture et l'écriture du banc de registres, et seulement une infime fraction dans l'unité de calcul. C'est le problème à résoudre. C'était essentiellement l'état de l'art avant la génération Volta des GPUs Nvidia. C'est ce qui a motivé l'introduction des Tensor Cores, qu'on appelle de manière plus générique des **réseaux systoliques**.

On dépense presque toute la surface du circuit sur quelque chose qui ne nous intéresse pas et qui est invisible pour le programmeur, alors que ce qui nous intéresse vraiment ne représente presque rien. L'objectif : rendre la partie « logique » plus grande tout en gardant la partie « mouvement de données » à la même taille.

---

## Comment fonctionnent les réseaux systoliques

### Monter d'un niveau dans la boucle

**Reiner :** À ce stade, on n'avait câblé qu'un seul multiply-accumulate dans le matériel. L'idée du réseau systolique, c'est de remonter de deux niveaux de boucles et de câbler dans le matériel toute une multiplication matrice-vecteur. Si on a un circuit fixe de granularité beaucoup plus grosse, peut-être que les taxes qu'on paie en entrée et en sortie deviennent bien plus petites.

**Dwarkesh :** Tu suggères qu'en montant d'un cran dans la boucle de la multiplication matricielle, on peut faire pencher la balance plus vers le calcul que vers la communication.

**Reiner :** Exactement. Il y a deux effets : on fait plus de travail à chaque passage dans le banc de registres, et on peut profiter du fait que certaines choses restent fixes.

### Mapper la multiplication matrice-vecteur

**Reiner :** Considère une multiplication matrice-vecteur où chaque colonne de la matrice est multipliée par le vecteur puis sommée. Chaque entrée du vecteur de sortie est un produit scalaire. On a un multiply-accumulate par case de la matrice, donc pour une matrice 2×2 fois un vecteur, on a quatre multiply-accumulates.

On veut un compute quadratique (`x × y` au lieu d'avant), mais seulement `x` fois plus de communication. Faire entrer un vecteur de taille deux est déjà dans nos clous — mais communiquer la matrice entière à chaque cycle, ça dépasse notre budget.

### Stocker les poids localement dans des registres

**Reiner :** L'idée, c'est que dans un contexte d'IA, cette matrice reste fixe pendant longtemps. On stocke ses entrées localement dans le réseau systolique, dans des registres juste à côté de la logique. On réutilise ces nombres encore et encore pour beaucoup de vecteurs différents.

**Dwarkesh :** La nature de la multiplication matricielle, c'est qu'on peut stocker cette chose quadratique directement là où le calcul a lieu — elle a une dimension de plus que les entrées qu'on échange en permanence.

**Reiner :** Exact. Un produit scalaire est le résultat de beaucoup de multiplications, donc on peut faire entrer plein de multiplications avant qu'une seule valeur ne ressorte.

Concrètement : on injecte les éléments du vecteur en haut des colonnes et on propage les sommes vers le bas. Le 3 et le 7 du vecteur alimentent les deux multiplications de leur ligne. Les sommes s'accumulent verticalement le long des colonnes, produisant un produit scalaire par colonne.

### Charger les poids par chaîne de propagation

**Reiner :** Reste une question : comment la matrice arrive-t-elle là au départ ? Il faut bien démarrer la puce et y placer ces données. L'astuce, c'est qu'on le fait très lentement. On fait couler les poids au compte-goutte dans le réseau systolique, via une chaîne de propagation. On injecte un nombre dans la ligne du haut, et au cycle suivant il descend d'un cran. En faisant ça en parallèle sur toutes les colonnes, on garde le câblage qui traverse la frontière du réseau systolique borné à `x`, pas à `x × y`.

**Dwarkesh :** Il y a deux questions en matière de communication : le temps de communication et la bande passante. Tu dis qu'on va le charger une seule fois, donc minimisons la bande passante, parce que la bande passante équivaut à la surface du die.

**Reiner :** Exactement.

### Un thème récurrent : compute contre communication

**Dwarkesh :** C'est intéressant — la dernière fois qu'on parlait d'inférence sur plusieurs puces, le grand objectif était d'augmenter le compute par unité de bande passante mémoire. Ici aussi, on essaie d'augmenter les multiplications réelles par rapport au transport d'informations entre registres et logique.

**Reiner :** Dans les deux cas, on maximise le compute par rapport à la communication. Ça se retrouve à tous les étages. Il y a même une version encore plus proche des portes : la précision du format numérique qu'on choisit. On a vu le même effet — un terme quadratique versus un terme linéaire, à la fois dans la précision de l'ALU et dans la taille de la matrice.

Cette unité est le niveau au-dessus du circuit de multiplication. Les anciens TPUs étaient décrits comme des 128×128 de ce circuit. C'est le circuit le plus efficace connu pour implémenter une multiplication matricielle.

### Les arbitrages de dimensionnement

**Dwarkesh :** Quels sont les arbitrages non évidents qui te tiennent éveillé la nuit ?

**Reiner :** La plupart des décisions en conception de puces sont des décisions de dimensionnement. Toutes les puces d'IA ont un réseau systolique et, à côté, un banc de registres qui fournit les entrées-sorties. Les questions de dimensionnement sont couplées : quelle taille pour le réseau systolique, quelle taille pour le banc de registres ? Une façon de penser : fixer un budget de surface dédiée au mouvement de données. Par exemple 10 % pour le mouvement de données et 90 % pour le réseau systolique. Des bancs de registres plus gros sont plus flexibles et donnent plus de performance applicative, mais ils mangent la surface du réseau systolique.

---

## Cycles d'horloge et registres de pipeline

### Qu'est-ce qu'un cycle d'horloge ?

**Dwarkesh :** Comment intervient le cycle d'horloge ? Qu'est-ce qui le détermine, et qu'est-ce que c'est exactement ?

**Reiner :** De base, les puces sont incroyablement parallèles — 100 milliards de transistors. Ce qu'il faut absolument quand on a autant de parallélisme, c'est de la synchronisation entre les unités parallèles. En logiciel, on a des mécanismes de synchronisation coûteux comme les mutex. Sur une puce, on adopte une approche très différente.

À peu près toutes les nanosecondes, l'ensemble de la circuiterie de la puce s'arrête un instant pour se synchroniser. C'est ça, le cycle d'horloge. Toute la puce passe typiquement à l'opération suivante en bloc, d'un seul coup.

### Les registres et le signal d'horloge global

**Reiner :** Dans le circuit, l'horloge est médiée par des registres — des dispositifs de stockage qui contiennent un bit, 0 ou 1. Entre les registres, il y a un nuage de logique avec des entrées et des sorties. Un signal d'horloge global pilote tous les registres. Quand l'horloge bat, la valeur présente sur le fil d'entrée à cet instant précis est ce qui est stocké.

Le défi : j'aimerais que l'horloge tourne le plus vite possible. À 2 GHz, je fais deux fois plus d'opérations par seconde qu'à 1 GHz. Mais je suis très sensible au délai à travers le nuage de logique, parce que tout calcul doit avoir terminé avant le prochain top d'horloge. Un point d'optimisation majeur, c'est de raccourcir ce délai au maximum.

### L'insertion de registres de pipeline

**Dwarkesh :** Y a-t-il des cas où on prend un risque probabiliste sur le fait qu'un calcul se termine à temps ?

**Reiner :** En conception de puces standard, on prend une marge telle qu'il y a une probabilité, mais à plusieurs écarts-types. À toutes fins pratiques, c'est fiable. Il y a quelques exceptions étranges, comme les traversées de domaine d'horloge, mais sur le chemin principal, on arrive 25 % du cycle d'horloge en avance.

**Dwarkesh :** L'emplacement des registres — c'est toi qui le détermines en tant que concepteur ?

**Reiner :** Les placer fait partie d'une grosse partie du travail de conception. C'est fait par un mélange de méthodes manuelles et automatiques. La version la plus naïve : tu prends ta logique, tu la coupes en deux, et tu mets un registre entre les deux moitiés. Si tu coupes au milieu, tu doubles la fréquence d'horloge. Deux fois plus de performance, mais au prix d'un registre supplémentaire.

### Pourquoi la synchronisation est nécessaire

**Dwarkesh :** Pourquoi faut-il synchroniser toute la puce ? Dans Factorio, il n'y a pas de cycle d'horloge global — les choses sont faites quand elles sont faites.

**Reiner :** Ce dont il faut se méfier, c'est si j'ai deux chemins à travers la logique — disons un calcul `f` et un calcul `g` qui se rejoignent à `h`. À cause des variations de fabrication, sur certaines puces `f` est plus rapide, sur d'autres c'est `g`. Si un signal se propage et que les résultats de `f` et `g` doivent se rejoindre à `h`, `f` peut arriver trop tôt et croiser la valeur précédente de `g`, ou la valeur suivante.

Ça explique pourquoi des puces différentes faites au même nœud de gravure TSMC peuvent avoir des cycles d'horloge différents — selon qu'on a réussi à optimiser les chemins critiques.

### Les registres de pipeline dans les boucles de rétroaction

**Reiner :** L'insertion de registre de pipeline est un compromis pur entre vitesse d'horloge et surface. C'est le cas facile. Le cas plus difficile : quand on a un calcul qui se renvoie sur lui-même — par exemple, une addition où on somme un nouveau nombre à chaque cycle.

Si ce plus prend trop de temps, mettre un registre de pipeline au milieu change le calcul. Au lieu d'une seule somme courante, on se retrouve avec une somme courante des nombres d'indice pair et une autre des nombres d'indice impair. Cette contrainte — une boucle dans la logique, ce que toutes les puces ont quelque part — est la chose la plus difficile à gérer, et c'est elle qui fixe le cycle d'horloge.

### Pourquoi on ne peut pas juste ajouter des registres à l'infini

**Dwarkesh :** Pourquoi ne pas prendre toutes les primitives de TSMC et ajouter autant de registres qu'il faut pour atteindre la fréquence souhaitée ?

**Reiner :** En tant que concepteur de logique, c'est l'architecte de la puce qui fixe le cycle d'horloge. Les primitives de TSMC sont de l'ordre de la porte AND ou de l'additionneur complet — peut-être 10 picosecondes chacune. On peut en mettre 10 à 30 en série dans un cycle d'horloge. En principe, avec juste un registre et une porte AND dans une boucle, tu pourrais obtenir des fréquences délirantes, au-dessus de 5 ou 6 GHz.

Mais regarde la surface : la porte AND, c'est une unité de surface ; le registre, c'est peut-être huit. Presque tout ton coût devient de la synchronisation ou de la communication, comparé à la logique réelle. Tu es allé trop loin : tu as une horloge ultra-rapide, mais tu dépenses presque toute ta surface en registres de pipeline.

### Vitesse d'horloge contre débit

**Dwarkesh :** Tu suggères une dynamique où on peut avoir une horloge très rapide mais sans faire beaucoup de travail — basse latence, bas débit.

**Reiner :** Ça nuit au débit. Le débit, c'est le produit de ce qu'on fait par cycle d'horloge (l'efficacité de surface) par le nombre de cycles par seconde.

**Dwarkesh :** C'est similaire à la taille de batch : avec un petit batch, un utilisateur reçoit son prochain token très vite, mais le nombre total de tokens par heure est plus faible.

**Reiner :** Exactement. On a moins de parallélisme si on pousse la vitesse d'horloge très haut.

---

## FPGA contre ASIC

### Le cas business : coût contre flexibilité

**Dwarkesh :** Je me souviens d'avoir parlé avec un ingénieur FPGA chez Jane Street, Clark, qui m'expliquait pourquoi ils utilisent des FPGAs. Pour le trading haute fréquence, le débit compte moins que la latence, donc avoir un contrôle très précis et déterministe du cycle d'horloge est primordial. Pourquoi un FPGA plutôt qu'un ASIC ?

**Reiner :** FPGAs et ASICs utilisent largement le même modèle conceptuel. Une série de portes construites à partir de petites primitives — AND, OR, XOR — connectées par des fils, tournant à un cycle d'horloge fixe. Tout ce qu'on peut exprimer dans un FPGA, on peut l'exprimer dans un ASIC, environ un ordre de grandeur moins cher et avec une meilleure efficacité énergétique.

Le compromis : le premier FPGA te coûte 10 000 dollars, alors que le premier ASIC coûte 30 millions parce qu'il faut un tape-out complet. Le cas business du FPGA, c'est quand on veut de la latence déterministe, un runtime rapide et un haut parallélisme, mais qu'on va changer la charge de travail souvent — peut-être tous les mois — et qu'on ne veut pas payer le coût du tape-out à chaque fois.

### Les composants d'un FPGA : LUTs, registres, muxes configurables

**Reiner :** Au cœur, un FPGA a les deux composants dont on a parlé : des registres pour le stockage, et des **LUTs** (lookup tables) qui fournissent toutes les portes. Et puis il y a un troisième composant : un essaim de registres et de LUTs reliés par un grand ensemble de muxes. Devant chaque LUT et chaque registre, un mux sélectionne une entrée depuis n'importe où.

Quand on programme un FPGA, on superpose un câblage particulier : sortie de cette LUT, entrée d'une autre LUT, registre, autre LUT. **FPGA signifie Field-Programmable Gate Array.** « Field-programmed », ça veut dire que l'appareil est déployé dans un data center, posé là dans le monde réel, et c'est là qu'on vient le programmer.

La configuration du FPGA se résume au contrôle des muxes. Un petit dispositif de stockage à côté de chaque mux dit d'où il doit prendre son entrée. Programmer le FPGA, c'est configurer chacun de ces muxes.

### À l'intérieur de la lookup table

**Reiner :** La LUT a aussi un peu de contrôle qui lui dit quoi faire. Son but, c'est de prendre, de manière configurable, le rôle d'un AND, OR, XOR, ou n'importe quelle fonction. La façon dont c'est fait dans les FPGAs traditionnels : une LUT a quatre bits d'entrée et un bit de sortie. Il y a 16 fonctions différentes de 4 bits vers 1 bit. On tabule ça avec 16 entrées d'une table de vérité, stockées dans les bits de configuration. La LUT lit ses quatre bits d'entrée comme un nombre binaire, va chercher la ligne correspondante, et émet ce bit.

**Dwarkesh :** Donc plutôt qu'une lookup table, on peut juste y penser comme à une porte programmable.

**Reiner :** Exact. La taille typique des LUTs est de quatre entrées — un sweet spot. Il y a un autre arbitrage compute / communication ici : trop peu d'entrées, et il faut plus de LUTs.

### Pourquoi les FPGAs sont ~10× plus chers que les ASICs

**Reiner :** Comptons les portes dans une lookup table. La LUT est essentiellement un mux sélectionnant parmi 16 valeurs — `n = 16`, `p = 1`. Ça fait 16 ANDs et 16 ORs. Le mux qui alimente les quatre bits d'entrée de la LUT est composé de quatre petits muxes, chacun sélectionnant parmi huit registres ou LUTs voisins.

Prends un AND à quatre entrées. Dans un ASIC, c'est trois portes AND. Via une LUT, c'est 32 portes. Le surcoût vient du fait qu'énumérer toutes les combinaisons possibles d'entrées dans une table de vérité est bien moins concis qu'écrire directement la porte.

### Latence déterministe : CPUs contre FPGAs

**Dwarkesh :** Un point important que tu m'as expliqué : ils préfèrent les FPGAs aux CPUs parce que ça donne des cycles d'horloge déterministes. Pourquoi ce n'est pas garanti sur un CPU ?

**Reiner :** On peut en fait concevoir un CPU à latence déterministe. Les processeurs dans plein de puces d'IA ont une latence déterministe — Groq en a fait la publicité, les TPUs aussi dans leur cœur. Le défi, c'est d'avoir à la fois la latence déterministe et la haute vitesse. La non-déterminisme vient de choix de conception spécifiques qui ne sont pas très attractifs sur le marché.

D'une certaine manière, la latence déterministe est le point de départ le plus simple, et certains concepteurs ont ajouté des choses pour la rendre non déterministe.

---

## Cache contre scratchpad

### Le cache CPU comme source de non-déterminisme

**Reiner :** La source principale de non-déterminisme sur un CPU, c'est probablement le cache lui-même. On a le die du CPU, et la mémoire DDR à côté. À l'intérieur, un système de cache mémorise les accès récents à la DDR. Quand on exécute les instructions du CPU, chaque accès mémoire vérifie d'abord si la donnée est dans le cache. Sinon, il va la chercher en DDR.

C'est une énorme optimisation — le cache est deux ordres de grandeur plus rapide que la DDR. Sans lui, tous les programmes tourneraient cent fois plus lentement. Le cache est absolument nécessaire pour atteindre une vitesse raisonnable.

Mais que l'accès soit un cache hit dépend de l'environnement : quels autres programmes tournent, ce qui a tourné récemment, ce que fait le générateur de nombres aléatoires interne au système de cache. C'est une grande source de non-déterminisme.

### Le scratchpad : une mémoire contrôlée par logiciel

**Reiner :** Au lieu de laisser le matériel décider si l'accès passe par le cache, on peut faire prendre cette décision par le logiciel. C'est ce qu'on voit dans les TPUs. On a la HBM hors-puce et un scratchpad sur-puce. La distinction clé : une instruction lit/écrit le scratchpad, une instruction totalement différente lit/écrit la HBM. C'est le logiciel qui décide.

---

## Pourquoi les cœurs CPU sont bien plus gros que les cœurs GPU

### Von Neumann et le parallélisme

**Dwarkesh :** Prenons de la hauteur. On dit que les ordinateurs ont une architecture von Neumann, avec un traitement séquentiel de l'information. Mais le FPGA est ultra-parallèle, les accélérateurs d'IA sont ultra-parallèles, et même les CPUs le sont sur plusieurs cœurs. Dans quel sens le matériel moderne est-il encore von Neumann ?

**Reiner :** C'est une description juste pour les CPUs. Un CPU te donne environ 100 cœurs × peut-être 16 voies dans les unités vectorielles — environ 1 000 voies de parallélisme. C'est modeste comparé à un accélérateur d'IA.

### Surface du die : CPU contre GPU

**Dwarkesh :** S'il y a si peu de cœurs, à quoi sert toute la surface du die ?

**Reiner :** Les cœurs sont juste beaucoup plus gros et plus compliqués. Compare un cœur de CPU, qui occupe ~1/100 du die, à une LUT, qui ne fait que 16 portes. On voit bien pourquoi un FPGA a beaucoup plus de LUTs qu'un CPU n'a de cœurs.

Mais pourquoi y a-t-il plus de cœurs CUDA que de cœurs CPU ? À l'intérieur du CPU, une grosse partie de la surface, c'est le cache. Très peu, en fait, c'est de l'ALU — surtout des bancs de registres. Ces deux choses existent aussi dans le GPU. Ce qui n'a pas d'équivalent dans le GPU, c'est le **prédicteur de branchement**.

### Comment fonctionne le prédicteur de branchement

**Dwarkesh :** À quoi sert le prédicteur de branchement ? À exécuter les deux branches en même temps ?

**Reiner :** Le problème, c'est que traiter une instruction prend beaucoup de temps — peut-être 5 nanosecondes. Repérer qu'on a un branchement, évaluer le booléen, mettre à jour le compteur de programme, et aller lire dans la mémoire d'instructions, ça peut prendre 5 ns. Mais 5 ns, ça ne fait que 200 MHz, alors que j'aimerais tourner à 1 ou 2 GHz.

Donc il faut exécuter d'autres instructions pendant que le branchement est en train d'être évalué — je continue à exécuter les instructions qui suivent. Mais ça pouvait être la mauvaise option. Si le branchement était pris, j'aurais dû sauter ailleurs. Le rôle du prédicteur de branchement : prédire, cinq cycles à l'avance, qu'un branchement va se produire, avant même d'arriver à cette instruction.

Il y a toute une grosse zone dans le CPU qui n'est faite que de prédicteurs disant quand sera le prochain branchement et où sera sa cible. Enlever ça, et resserrer les bancs de registres, c'est ce qui fait une grosse partie du gain du GPU sur le CPU.

---

## Cerveaux et puces

### Sparsité et co-localisation

**Dwarkesh :** Si je pense au fonctionnement du cerveau par rapport à ce que tu décris — à haut niveau, alors qu'on peut faire de la sparsité structurée dans les accélérateurs pour économiser de la surface, dans le cerveau la sparsité est non structurée. N'importe quel neurone peut se connecter à n'importe quel autre, pas dans des alignements en colonnes. Et puis mémoire et calcul sont co-localisés.

**Reiner :** On pourrait dire que mémoire et calcul sont aussi co-localisés sur ces dies. C'est exactement la même co-localisation, en un sens.

### Vitesse d'horloge et énergie

**Dwarkesh :** Une autre grosse différence : le cycle d'horloge du cerveau est bien plus lent que celui des ordinateurs. En partie pour préserver l'énergie — plus l'horloge est rapide, plus la tension doit être élevée pour que le signal se stabilise.

**Reiner :** Prenons la vitesse d'horloge d'abord. Sur une puce, l'horloge est rapide parce que ça augmente le débit. Quand on compare un GPU qui exécute une charge de travail, il tourne en batch size 1 000. Le cerveau, lui, ne tourne pas en batch size 1 000 — il n'y a qu'un seul « moi ». On pourrait imaginer prendre un GPU et au lieu de le faire tourner à 1 GHz, le faire tourner à 1 MHz, ce qui ressemblerait un peu plus au cerveau. Mais sur silicium, ça ne donne *pas* un avantage de 1 000× en efficacité énergétique.

### La puissance dynamique de commutation

**Reiner :** Stocker un bit, ça revient à déposer une charge dans un condensateur quelque part dans la puce. Il se charge quand le bit passe à 1, se décharge quand il repasse à 0. Ce cycle de charge puis de décharge vers la masse est où l'énergie est consommée. C'est ce qu'on appelle la **puissance dynamique** ou **puissance de commutation**, et c'est la majorité de la consommation d'une puce. Il y a aussi des fuites parce que les isolants ne sont pas parfaits, mais on va les ignorer.

Si on cadence une puce 1 000× plus lentement, on a 1 000× moins de transitions et environ 1 000× moins de consommation — mais ce n'est pas un avantage substantiel en *efficacité* énergétique (l'énergie par opération reste à peu près la même).

---

## Un GPU, c'est juste un tas de petits TPUs

### Organisation haut-niveau d'un GPU

**Reiner :** Comparons la structure des blocs au plus haut niveau. Un GPU, c'est surtout un paquet d'unités presque identiques — les SMs. Ils ont une mémoire L2 au milieu, et encore des SMs en bas. Une grille assez régulière de cœurs.

### Organisation haut-niveau d'un TPU

**Reiner :** Un TPU a des unités logiques à grain bien plus grossier. Juste quelques unités matricielles (les gros réseaux systoliques), une unité vectorielle au milieu, et des unités matricielles en bas. Vu de haut, un GPU, c'est plein de petits TPUs pavés sur toute la puce.

**Dwarkesh :** Tu suggères que le tensor core dans un streaming multiprocessor est l'équivalent d'une MXU ?

**Reiner :** Oui, c'est très similaire.

### L'arbitrage : grandes unités contre mouvement de données

**Dwarkesh :** S'il y a moins de structure, avoir plein de petits TPUs a beaucoup de sens. Si tu as juste d'énormes multiplications matricielles, tu veux éviter le coût d'avoir des SMs individuels avec leurs propres registres et leurs propres warp schedulers.

**Reiner :** Ça se voit dans la taille à laquelle on peut faire grandir les choses. Un plus grand réseau systolique amortit mieux les coûts du banc de registres. Le design TPU permet de grands réseaux systoliques ; le design GPU te contraint à de petites unités partout.

Il y a tout de même un compromis. À cause de la séparation à gros grain dans le TPU, il faut déplacer les données de l'unité vectorielle vers les unités matricielles à travers seulement deux lignes de périmètre. Dans un GPU, on a des unités vectorielles partout, et on peut déplacer les données à travers beaucoup de lignes — en réalité, il y a bien plus de bande passante entre une unité vectorielle et une unité matricielle à l'intérieur d'un SM qu'entre les unités équivalentes dans un TPU. En revanche, dès qu'on veut opérer *entre* les SMs, ça devient compliqué et coûteux.

### Le réseau systolique scindable de MatX

**Dwarkesh :** Tu n'es pas obligé de commenter, mais on pourrait s'attendre à ce que MatX essaie de garder la structure GPU avec de plus petits réseaux systoliques entourés de SRAM, tout en jetant tout ce qu'on doit avoir dans un SM pour supporter l'architecture CUDA.

**Reiner :** On a parlé publiquement de ce qu'on appelle un **réseau systolique scindable** (splittable systolic array), qu'on peut voir comme de grands réseaux systoliques qui peuvent aussi devenir des petits réseaux systoliques.

**Dwarkesh :** Super. Bon, je crois qu'on peut s'arrêter là-dessus. Reiner, merci beaucoup.

**Reiner :** Merci, Dwarkesh.
