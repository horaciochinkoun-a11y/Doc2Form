# Cahier des Charges

## Invite initiale
> L'utilisateur dépose un fichier PDF ou DOCX contenant un questionnaire...
(Voir la demande complète dans l'historique du chat)

## Exigences fonctionnelles
- Upload et extraction depuis PDF, DOCX et Images.
- Détection des questions, choix, réponses ouvertes, etc.
- Prévisualisation modifiable.
- Création effective d'un Google Form avec lien de partage.
- Intégration de Google Sheets.

## Exigences non fonctionnelles
- **Performances** : Feedback visuel (barre de progression) durant l'analyse IA.
- **Sécurité** : Clé API Gemini stockée sur le backend. Authentification OAuth sécurisée pour les accès Forms/Sheets.
- **Évolutivité** : Code modulaire permettant l'ajout de nouveaux formats de documents.

## Contraintes
- Utiliser le SDK @google/genai en backend.
- Intégration Oauth Google Workspace requise.
