# Vérifications de livraison

- Extraction de 50 mots, 51 expressions et 25 définitions, avec 126 identifiants uniques.
- Comparaison des six ensembles complets (trois catégories × deux langues) avec les colonnes du PDF : identiques après suppression des espaces de mise en page pour la comparaison.
- Vérification de la présence des 25 textes et intitulés dans les deux langues, y compris les définitions traversant les pages 5–6 et 7–8.
- Identité entre les données chargées dans `data.js` et leur copie `contenu.json`.
- Syntaxe JavaScript vérifiée.
- Vérifications dans le navigateur via un serveur local : traduction avec casse et espaces modifiés, affichage de la réponse canonique, session complète d’association de 10 définitions, session complète de QCU, historique et conservation des statistiques après rechargement, reconstruction, rappel libre et compteur.
- Inspection visuelle de l’interface sur ordinateur et à 390 pixels de largeur.
- Contrôle des statistiques exposées par l’outil facultatif WebMCP.
- Vérification de la fin automatique à 90 secondes, du QCU terme → définition, de la reconnaissance, du retournement de flashcard, de la correction du mot manquant, de la liste des erreurs et du lancement d’un examen à 125 questions.

Le navigateur de vérification refuse les adresses `file://` pour des raisons de sécurité. L’ouverture directe par double-clic n’a donc pas été exécutée dans cet environnement. Le site utilise uniquement des scripts classiques et des ressources relatives, sans modules, `fetch`, service distant ni dépendance à un serveur. Les essais interactifs ont été faits sur HTTP local. La persistance en ouverture directe dépend de la politique de stockage de votre navigateur ; l’export/import permet de conserver une copie de vos progrès.
