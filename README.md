# Recall — Anglais CESI

## Ouvrir le site

Décompressez tout le dossier, puis ouvrez `index.html` dans un navigateur récent (Edge, Chrome, Firefox ou Safari). Aucune installation, aucun compte, aucun serveur et aucune connexion Internet nécessaires. Gardez les fichiers ensemble.

## Contenu fidèle au PDF

Le document annonce **50 expressions**, mais ses tableaux en contiennent **51** : 21 en page 3, 28 en page 4 et 2 en page 5. Le site conserve donc **50 mots, 51 expressions et 25 définitions**, soit 126 entrées. Aucune expression n’est supprimée. L’examen blanc tire 50 des 51 expressions, avec tous les mots et toutes les définitions, pour un total de 125 questions.

Les libellés, traductions, apostrophes, accents, majuscules, ponctuation et formulations sont conservés. Seuls les retours à la ligne de mise en page et les espaces de séparation des cellules sont réunis en espaces ordinaires. Les deux-points des intitulés des définitions restent visibles. Le PDF original est fourni dans `source.pdf`.

## Entraînements

- Traduction écrite français → anglais ou anglais → français pour mots et expressions.
- Flashcards avec autoévaluation.
- QCU à quatre propositions : français → anglais ; définition anglaise → intitulé anglais.
- Partir de rien : retrouver toute la liste, dans l’ordre souhaité. Pour les définitions, seuls les intitulés anglais sont saisis ; le deux-points final est facultatif. Les entrées non retrouvées lors de la fin de session sont ajoutées aux erreurs.
- Association par lots de quatre (dernière série éventuellement plus courte).
- Mot manquant et reconstruction de la traduction anglaise.
- Terme anglais → définition anglaise et reconnaissance oui/non pour les définitions.
- Révision des erreurs et défi QCU de 90 secondes.
- Séries aléatoires de 10, 20 ou toute la liste. Partir de rien utilise toujours la liste entière. L’examen blanc utilise 125 questions ; le chrono utilise toute la catégorie jusqu’au délai ou à l’épuisement de la liste.
- Répertoire consultable avec recherche et textes complets dans les deux langues.

Les QCU reproduisent le format décrit dans les consignes ; les distracteurs proviennent des autres entrées du document, sans prétendre reproduire les questions Moodle officielles. Note indicative de l’examen complet : A = 100–125, B = 75–99, C = 50–74, D = 0–49.

## Réponses et progression

La saisie ignore la casse et les espaces en début/fin ou répétés. Les accents, la ponctuation et les traductions restent exigés ; les variantes et synonymes ne sont pas ajoutés. La réponse exacte du PDF s’affiche après validation.

Chaque réponse est enregistrée immédiatement dans `localStorage`. Une entrée est « maîtrisée » après trois bonnes réponses consécutives, tous modes confondus, y compris les autoévaluations des flashcards. Une mauvaise réponse réinitialise cette série ; une bonne réponse retire l’entrée de la liste d’erreurs. Les sessions terminées ont un bilan dans l’historique. Une fermeture ou un changement d’onglet du site conserve les réponses, mais ne reprend pas la question en cours.

Le stockage dépend du navigateur et de l’emplacement du dossier. En navigation privée ou si le stockage est bloqué, il peut être temporaire ou indisponible ; un message le signale. **Exportez votre progression depuis « Ma progression » avant de déplacer le site ou de changer de navigateur.** Le fichier exporté peut être réimporté. La réinitialisation et l’import demandent confirmation.

## Modifier les fichiers

- `index.html` : structure de la page.
- `style.css` : apparence et adaptation mobile.
- `app.js` : jeux, vérification, statistiques et sauvegarde.
- `data.js` : contenu réellement chargé par le site, sous `window.CESI_DATA`.
- `contenu.json` : copie lisible et réutilisable des données. Modifier ce fichier seul ne modifie pas le site ; reportez les changements dans `data.js`.
- `source.pdf` : document fourni, sans modification.

Chaque entrée possède un identifiant stable. Conservez-le pour garder le lien avec les statistiques existantes. Les catégories sont `words`, `expressions` et `definitions` ; ces dernières ajoutent `definitionFr` et `definitionEn`.

Le site n’utilise aucune bibliothèque, police externe, API distante ni suivi analytique. Il fonctionne directement avec des fichiers locaux, sans requête de chargement JSON. Un outil WebMCP de lecture des statistiques est exposé uniquement si le navigateur prend en charge cette interface facultative.
