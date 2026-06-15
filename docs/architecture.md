# Architecture (Doc2Form)

A destination des développeurs et curieux.

## Vue d'ensemble
L'application est une Single-page Application (SPA) construite avec React et propulsée par un serveur Express léger (via Vite middleware) qui gère les appels sécurisés à l'API Gemini.

## Organisation des dossiers
- `/src/` : Code source principal
  - `/src/components/` : Composants UI réutilisables (Dropzone, QuestionCard, Skeleton loader).
  - `/src/lib/` : Utilitaires et fonctions partagées (parsers, helpers).
  - `/src/types.ts` : Types et interfaces TypeScript.
  - `/src/main.tsx` & `/src/App.tsx` : Point d'entrée de l'application cliente.
- `server.ts` : Serveur backend Express (Traite l'upload, la réception du fichier, et la conversion via Gemini).
- `metadata.json` : Informations d'environnement et permissions requises.
- `/docs/` : Documentation complète de la base de code et de la réflexion du projet.

## Flux de données
1. **Frontend** : L'utilisateur importe un document.
2. **Backend (server.ts)** : Le serveur multer réceptionne le fichier, en extrait rudimentairement le texte ou l'image et l'envoie à Gemini avec un prompt structuré requérant un format de sortie JSON.
3. **Frontend** : L'UI reçoit le JSON contenant la structure détectée du formulaire (titre, questions, types de questions).
4. **Utilisateur** : Il corrige/édite le contenu.
5. **Google OAuth** : L'utilisateur s'authentifie grâce à Firebase Auth (s'il ne l'est pas déjà) et accorde les scopes `forms.body` et `spreadsheets`.
6. **Création du formulaire** : Le frontend appelle l'API Google au nom de l'utilisateur.

## Dépendances clés
- `@google/genai` pour l'intelligence artificielle au centre de l'app.
- `express` & `multer` pour le traitement local et un environnement sécurisé pour manipuler la clé API.
- `tailwindcss` pour un style utilitaire et rapide.
- `lucide-react` pour les icônes vectorielles.
- `firebase/auth` pour la connexion Google.
