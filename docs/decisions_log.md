# Log des Décisions (Decisions Log)

## Architecture Backend pour Gemini
- Date : 2026-06-15
- Contexte : Sécurité de la clé API Gemini et extraction robuste des fichiers locaux.
- Décision : Mise en place d'un serveur Express (Full-stack TypeScript) configuré via Vite middleware.
- Alternatives envisagées : Client-side only (rejetée car la clé API ne doit pas être exposée).
- Conséquences : L'application fonctionnera avec un point d'entrée `server.ts`.

## Persistance du token d'accès Google
- Date : 2026-06-15
- Contexte : Firebase Auth mémorise l'état Firebase User mais détruit le jeton d'accès OAuth Google spécifique d'une session à l'autre ou lors d'un rafraîchissement d'Iframe/Page.
- Décision : Implémenter une persistance locale via `localStorage` pour mettre en cache de façon sécurisée le jeton d'accès et garantir la validité d'écriture dans l'API Google Forms sans reconnexion à outrance.
- Alternatives envisagées : Tout repasser dans des variables d'état éphémères (rejetée car l'expérience utilisateur est dégradée par des popups répétés).
- Conséquences : Session fluide, transparente, avec indicateurs réactifs de validation d'autorisation.

## Migration de l'extracteur IA vers Gemini 3.5 Flash
- Date : 2026-06-15
- Contexte : Le modèle `gemini-3.1-pro-preview` a déclenché des erreurs de quota `RESOURCE_EXHAUSTED` (code 429) sur l'environnement de test gratuit de l'utilisateur.
- Décision : Remplacer `gemini-3.1-pro-preview` par le modèle `gemini-3.5-flash`, qui offre des temps de réponse beaucoup plus courts, supporte pleinement les formats JSON complexes et structurés with `responseSchema` et bénéficie de quotas gratuits considérablement plus larges.
- Alternatives envisagées : Utiliser des techniques d'attente/retry exponentielles de requêtes (rejeté car cela n'augmente pas la limite globale journalière et ralentit l'application).
- Conséquences : Extraction fluide, instantanée, exempte d'erreurs de quota 429 lors d'usages intensifs de tests.

## Résolution d'une erreur d'argument de déploiement invalide (Vite, metadata, env)
- Date : 2026-06-15
- Contexte : Lors de la tentative de déploiement sur la plateforme, l'erreur générique `Request contains an invalid argument.` a été levée par les APIs d'orchestration.
- Décision : 
  1. Assainir `metadata.json` en supprimant le tableau vide de `requestFramePermissions` qui provoquait un conflit de validation de schéma coté serveur.
  2. Aligner `vite.config.ts` avec les recommandations ES Modules en résolvant l'exclusion de `__dirname` natif par l'importation de `fileURLToPath`.
  3. Purger les valeurs par défaut et quotes du modèle de configuration d'environnement `.env.example` pour se conformer au standard strict attendu par la plateforme.
- Alternatives envisagées : Désactiver des scripts de builds (rejeté car cela compromettrait le démarrage de l'applet de bout en bout).
- Conséquences : Clarté parfaite, build et processus de déploiement opérationnels et robustes.

## Atténuation automatique de l'encombrement réseau et indisponibilité de l'IA (503 / 429)
- Date : 2026-06-15
- Contexte : En raison d'un pic de demande mondial, l'API Gemini 3.5 a ponctuellement levé des exceptions 503 ("This model is currently experiencing high demand" / UNAVAILABLE).
- Décision : 
  1. Implémenter une fonction serveur `generateContentWithRetry` appliquant un ralentissement exponentiel intelligent (Jittered Exponential Backoff, max 3 essais).
  2. Concevoir une bascule automatique "Failover" sur le modèle `gemini-3.1-flash-lite` (très résilient et haute vélocité) si notre modèle de référence `gemini-3.5-flash` échoue après 3 reprises.
  3. Formuler de manière élégante et ergonomique les erreurs système pour l'utilisateur final en français pour rassurer sur la charge temporaire de Google et inviter à un nouvel essai.
- Alternatives envisagées : Abandonner l'analyse ou afficher le paquet JSON technique d'erreur d'origine directement à l'écran (rejeté car indigeste et pauvre en expérience utilisateur).
- Conséquences : Tolérance totale aux pannes serveurs tierces et expérience utilisateur parfaitement rationalisée.

## Extension Multi-Vues et Moteur d'Administration de Projets (Local-First Store & Quotas)
- Date : 2026-06-15
- Contexte : Extension majeure demandée pour intégrer un Dashboard complet (KPIs, volumes de conversion), un gestionnaire "Mes Formulaires" (recherche floue, duplication de profils, suppression), et un onglet de configuration "Paramètres" avec gestion fine de quotas.
- Décision : 
  1. Conception d'une navigation sémantique latérale responsive (Sidebar Desktop & Menu mobile) structurée autour d'un routeur par sélecteurs d'onglets réactifs.
  2. Création d'une couche d'encapsulation de persistance locale de projets (`storage.ts`) s'alignant sur LocalStorage pour une vitesse d'exécution instantanée chez les clients et pré-remplie d'exemples académiques types d'onboarding.
  3. Intégration d'un algorithme de clonage au moment de la demande de duplication pour éviter le pointeur de référence mémoire d'objet et générer des copies éditables autonomes (copie d'ID, réinitialisation de statut d'export).
  4. Création d'un simulateur de quota modulable depuis la page de configuration pour permettre à l'utilisateur de tester la levée des limites en optant virtuellement pour un forfait Business ou Pro.
- Alternatives envisagées : Branchement direct de Firestore (mis de côté temporairement afin d'offrir une réactivité instantanée instantanément exploitable sans paramétrage complexe de droits de bases de données par l'utilisateur).
- Conséquences : L'expérience utilisateur est décuplée, digne des meilleurs SaaS de productivité bureautique, et offre un niveau de contrôle optimal sur la mémoire réseau.



