// Importation des utilitaires Firebase nécessaires
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
// Importation de la configuration Firebase générée automatiquement
import firebaseConfig from '../../firebase-applet-config.json';

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
// Initialisation du module d'authentification Firebase
const auth = getAuth(app);

// Définition du fournisseur Google SSO
const provider = new GoogleAuthProvider();
// Ajout des scopes Google requis pour créer des formulaires et manipuler les feuilles de calcul
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Drapeau pour éviter d'écouter les changements d'état pendant une connexion en cours
let isSigningIn = false;

// Clé de persistence pour stocker le jeton d'accès dans le stockage local du navigateur
const TOKEN_CACHE_KEY = 'doc2form_google_access_token';

/**
 * Initialise l'écouteur d'état d'authentification Firebase
 * @param onAuthSuccess Callback appelé lorsque l'utilisateur est connecté avec un token
 * @param onAuthFailure Callback appelé lors d'une absence d'authentification
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Écoute des changements de connexion
  return onAuthStateChanged(auth, async (user: User | null) => {
    // Récupération éventuelle du jeton d'accès stocké localement
    const cachedToken = localStorage.getItem(TOKEN_CACHE_KEY);

    if (user && cachedToken) {
      // Si on a l'utilisateur et le jeton, la session est pleinement fonctionnelle
      if (onAuthSuccess) onAuthSuccess(user, cachedToken);
    } else {
      // Sinon on s'assure de nettoyer pour éviter des états incohérents
      if (!isSigningIn) {
        localStorage.removeItem(TOKEN_CACHE_KEY);
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Lance le flux d'authentification popup Google
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    // Déclenchement de la popup de connexion Google
    const result = await signInWithPopup(auth, provider);
    // Extraction des identifiants Google pour récupérer le jeton OAuth
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential || !credential.accessToken) {
      throw new Error("Impossible d'obtenir le token d'accès Google.");
    }

    // Sauvegarde locale du jeton pour maintenir la session au rafraîchissement
    localStorage.setItem(TOKEN_CACHE_KEY, credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Récupère le jeton d'accès Google stocké
 */
export const getAccessToken = async (): Promise<string | null> => {
  return localStorage.getItem(TOKEN_CACHE_KEY);
};

/**
 * Déconnecte l'utilisateur et réinitialise tous les états de cache
 */
export const logout = async () => {
  // Déconnexion de l'instance d'authentification Firebase
  await auth.signOut();
  // Révocation locale du jeton
  localStorage.removeItem(TOKEN_CACHE_KEY);
};
