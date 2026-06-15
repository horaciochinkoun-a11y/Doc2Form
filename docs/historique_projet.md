# Historique du Projet

## Présentation du projet
- **Nom du projet** : Doc2Form
- **Objectif** : Convertir des documents (PDF, DOCX) et des images en formulaires Google (Google Forms) via l'IA Gemini.
- **Utilisateurs cibles** : Enseignants, formateurs, recruteurs, créateurs de sondages.
- **Fonctionnalités principales** : 
  - Extraction de texte depuis PDF/DOCX/Images
  - Analyse intelligente pour extraire questions et choix via Gemini
  - Prévisualisation éditable du formulaire
  - Création automatique du Google Form (API Google Forms)
  - Connexion automatique (API Google Sheets)

## Architecture
- **Description** : Application client-serveur (React/Vite côté client, Express Node.js côté serveur) afin de protéger la clé API Gemini et interagir avec les APIs Google Workspace.
- **Technologies** : React, Tailwind CSS, TypeScript, Express, @google/genai.
- **Flux de données** : Upload local -> Serveur Express -> Traitement IA (Gemini) -> Retour client (UI) -> Validation -> Appel API Google Forms côté frontend via jeton OAuth.

## Décisions techniques
- **Full-stack (Express + Vite)** : Requis pour masquer la clé API Gemini sur le serveur et utiliser Google GenAI de manière sécurisée.
- **OAuth Google Workspace** : Indispensable pour créer le Google Form au nom de l'utilisateur.

## Historique des modifications
- **2026-06-15** : Initialisation du projet et configuration des accès OAuth pour Google Workspace.
- **2026-06-15.1** : (Suite à l'accord OAuth) Construction de l'architecture serveur (Express + Multer) pour sécuriser Gemini (modèle `gemini-3.1-pro-preview`). Implémentation complète de l'UI React avec Tailwind et l'éditeur de prévisualisation avant soumission à Google Forms API. L'application est opérationnelle.
- **2026-06-15.2** : Intégration d'un système de session complet. Affichage de l'avatar et de l'e-mail de l'utilisateur, ajout d'une déconnexion sécurisée, persistance du jeton d'accès via `localStorage` pour survivre aux rechargements, et contrôle de validité des autorisations en temps réel.
- **2026-06-15.3** : Résolution des erreurs de quota en migrant l'extraction de `gemini-3.1-pro-preview` vers le modèle performant et à hauts quotas `gemini-3.5-flash`. Explication détaillée et professionnelle de l'erreur d'autorisation Firebase Auth `auth/internal-error` liée à l'environnement d'Iframe cloisonné de l'AI Studio.
- **2026-06-15.4** : Correction d'une erreur d'argument non valide empêchant le déploiement sur la plateforme. Résolution des dépendances d'alias ESM de Vite, simplification chirurgicale de `metadata.json` (retrait de structures d'écouteurs d'événements de frames inutilisées) et purification du fichier `.env.example` selon les standards stricts du runtime.
- **2026-06-15.5** : Résolution des indisponibilités de l'API Google en cas d'encombrement mondial (erreur 503). Implémentation d'un mécanisme d'essais à rebours exponentiels aléatoires (Jittered Exponential Backoff, max 3) et d'un basculement de secours automatique sur le modèle très fluide `gemini-3.1-flash-lite`. Traduction rassurante et professionnelle des erreurs d'authentification et de taux de requêtes en français sur l'UI cliente.


