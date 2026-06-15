// Importation des hooks React essentiels pour l'état et l'affichage
import React, { useState, useEffect } from 'react';
// Importation du composant de zone de dépôt de fichiers
import { Dropzone } from './components/Dropzone';
// Importation du composant de prévisualisation éditable du formulaire
import { FormPreview } from './components/FormPreview';
// Importation des types et structures de données
import { FormDefinition } from './types';
// Importation des modules d'authentification Google/Firebase et du cache de jeton
import { initAuth, googleSignIn, getAccessToken, logout } from './lib/auth';
// Importation de la fonction d'intégration Google Forms
import { createGoogleForm } from './lib/gforms';
// Importation de l'ensemble des icônes pour le design et l'accompagnement utilisateur
import { Loader2, ArrowRight, CheckCircle2, ShieldAlert, LogOut, KeyRound, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
// Importation du type User de Firebase Auth
import { User } from 'firebase/auth';

export default function App() {
  // Déclaration de l'état contenant la définition du formulaire analysé
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  // État du chargement de l'analyse IA de Gemini
  const [isLoading, setIsLoading] = useState(false);
  // État du chargement lors de la transmission à Google Forms API
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  // État pour afficher les erreurs utilisateur
  const [error, setError] = useState<string | null>(null);
  // État stockant le lien de réponse publique du formulaire créé
  const [formLink, setFormLink] = useState<string | null>(null);

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);
  // Indicateur si l'autorisation Google/Firebase est requise
  const [needsAuth, setNeedsAuth] = useState(false);
  // Indicateur de statut de l'autorisation d'écriture des APIs Google Forms de l'utilisateur
  const [authStatus, setAuthStatus] = useState<'pending' | 'authorized' | 'unauthorized'>('unauthorized');

  // Effet d'abonnement au changement d'état d'authentification à l'initialisation de l'application
  useEffect(() => {
    // Initialisation de la session et synchronisation avec le cache
    const unsubscribe = initAuth(
      async (u, token) => {
        // Enregistrement de l'utilisateur
        setUser(u);
        // Des doutes d'autorisation levés
        setNeedsAuth(false);
        // Le jeton étant fonctionnel, on passe le statut à autorisé
        setAuthStatus('authorized');
      },
      () => {
        // En cas d'échec ou d'absence de session, on reset les variables
        setUser(null);
        setNeedsAuth(true);
        setAuthStatus('unauthorized');
      }
    );
    // Nettoyage de l'abonnement à la destruction du composant
    return () => unsubscribe();
  }, []);

  // Déclencheur manuel de connexion Google SSO
  const handleLogin = async () => {
    setError(null);
    try {
      // Appel du service popup Google
      const authRes = await googleSignIn();
      if (authRes) {
        setUser(authRes.user);
        setNeedsAuth(false);
        setAuthStatus('authorized');
      }
    } catch (err: any) {
      // Gestion ergonomique des fermetures intempestives de popups
      setError("La connexion a échoué ou a été annulée par l'utilisateur.");
      setAuthStatus('unauthorized');
    }
  };

  // Déclencheur manuel de déconnexion complète
  const handleLogout = async () => {
    try {
      // Nettoyage Firebase et cache local du jeton
      await logout();
      setUser(null);
      setNeedsAuth(true);
      setAuthStatus('unauthorized');
      setFormLink(null);
    } catch (err: any) {
      setError("Échec lors de la déconnexion.");
    }
  };

  // Traitement du document envoyé dans la dropzone
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFormDef(null);
    setFormLink(null);

    // Envoi multipart du fichier vers notre Express backend
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Appel de l'API locale sécurisée
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'extraction');
      }
      
      if (!data.questions) data.questions = [];
      // Hydratation de l'UI avec l'arbre de questions structuré
      setFormDef(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Création effective du formulaire Google Forms via API Google
  const handleCreateForm = async () => {
    // Tentative d'acquisition du token d'accès persisté
    let token = await getAccessToken();
    
    // Si aucun jeton n'est mis en mémoire cache, on solicite une connexion
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
          setUser(authRes.user);
          setNeedsAuth(false);
          setAuthStatus('authorized');
        }
      } catch (err) {
        setError("L'authentification Google est indispensable pour exporter le formulaire.");
        return;
      }
    }

    // Garde-fous techniques de sécurité
    if (!token || !formDef) {
      setError("Informations manquantes pour configurer l'export.");
      return;
    }

    setIsCreatingForm(true);
    setError(null);
    try {
      // Envoi du JSON validé aux serveurs de l'API Google Forms
      const { responderUri } = await createGoogleForm(formDef, token);
      setFormLink(responderUri);
    } catch (err: any) {
      // Si l'erreur provient d'une révocation de permission (token invalide d'autorisation)
      if (err.message.includes('401') || err.message.includes('403')) {
        setError("Vos droits d'écriture Google Forms ont expiré. Veuillez vous reconnecter.");
        setAuthStatus('unauthorized');
      } else {
        setError("Erreur technique de l'API Google Forms : " + err.message);
      }
    } finally {
      setIsCreatingForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {/* Barre de navigation et gestion de session */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo d'application minimaliste et moderne */}
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold font-mono text-lg">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-zinc-900 tracking-tight leading-none">Doc2Form</span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">AI AGENT ENGINE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
               // Profil de l'utilisateur connecté
               <div className="flex items-center space-x-3 bg-zinc-50 border border-zinc-200 rounded-full pl-2 pr-4 py-1">
                 {user.photoURL ? (
                   <img 
                     src={user.photoURL} 
                     alt="Avatar utilisateur" 
                     referrerPolicy="no-referrer"
                     className="w-7 h-7 rounded-full shadow-sm object-cover"
                   />
                 ) : (
                   <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                     {user.displayName?.[0] || user.email?.[0] || 'U'}
                   </div>
                 )}
                 <div className="flex flex-col text-left">
                   <span className="text-xs font-semibold text-zinc-800 leading-tight">
                     {user.displayName || 'Utilisateur'}
                   </span>
                   <span className="text-[10px] text-zinc-500 leading-tight">
                     {user.email}
                   </span>
                 </div>
                 
                 {/* Séparateur subtil */}
                 <div className="w-px h-6 bg-zinc-200" />
                 
                 {/* Indicateur de validité de l'autorisation d'écriture Google Form */}
                 <div className="flex items-center" title="API Google Forms connectée de façon sécurisée">
                   <UserCheck className="w-4 h-4 text-emerald-500" />
                 </div>

                 {/* Bouton de déconnexion élégant */}
                 <button 
                   onClick={handleLogout}
                   className="p-1 hover:bg-zinc-200 rounded-full text-zinc-500 hover:text-zinc-800 transition-colors"
                   title="Se déconnecter"
                 >
                   <LogOut className="w-4 h-4" />
                 </button>
               </div>
            ) : (
               // Bouton d'invitation à la connexion
               <button 
                  onClick={handleLogin}
                  className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-full text-xs transition-all shadow-sm"
               >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Se connecter avec Google</span>
               </button>
            )}
           </div>
        </div>
      </header>

      {/* Corps principal de l'application */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          {/* Badge marketing simple et sémantique */}
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-100">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Automatisation optimisée par Gemini 3.5</span>
          </div>

          <h2 className="text-4xl font-bold text-zinc-900 mb-3 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Transformez vos documents en <span className="text-indigo-600">Google Forms</span>
          </h2>
          <p className="text-base text-zinc-600 max-w-lg mx-auto">
            Déposez un examen, questionnaire ou sondage. Notre intelligence artificielle s'occupe d'en extraire les questions et options adaptées en 3 secondes.
          </p>
        </div>

        {/* Vue Initiale Hors Analyse : Drag & Drop de sélection de fichiers */}
        {!formDef && !formLink && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Dropzone onFileSelect={handleFileSelect} isLoading={isLoading} />
            
            {isLoading && (
              <div className="mt-8 flex flex-col items-center text-zinc-500 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-semibold tracking-wide text-zinc-700 animate-pulse">L'IA de Gemini analyse la structure du document...</p>
                <div className="w-48 h-1 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 animate-infinite-loading rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerte et affichage d'erreur technique */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 duration-300">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">
              <span className="font-bold">Une anomalie est survenue : </span>
              {error}
              {needsAuth && (
                <button 
                  onClick={handleLogin}
                  className="block mt-2 font-bold text-indigo-600 hover:underline"
                >
                  S'identifier maintenant
                </button>
              )}
            </div>
          </div>
        )}

        {/* Aperçu interactif et éditable des questions générées par Gemini */}
        {formDef && !formLink && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                  <span>Questions Détectées</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                    {formDef.questions?.length || 0} éléments
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">Double-cliquez pour corriger le texte ou modifier les types d'entrées.</p>
              </div>
              <button
                onClick={() => setFormDef(null)}
                className="text-sm border border-zinc-200 bg-white hover:bg-zinc-50 font-medium text-zinc-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm text-left sm:text-right"
              >
                Recommencer l'analyse
              </button>
            </div>

            {/* Composant de prévisualisation avec les commandes d'édition */}
            <FormPreview form={formDef} onChange={setFormDef} />

            {/* Bloc d'authentification contextuelle si l'utilisateur n'est pas encore connecté  */}
            {!user && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Connexion requise pour l'exportation</p>
                  <p className="text-amber-700 text-xs mt-1">Vous devez associer un compte Google pour que l'application puisse créer de façon sécurisée le Google Form sur votre Drive.</p>
                  <button 
                    onClick={handleLogin}
                    className="mt-3 bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Associer mon compte Google
                  </button>
                </div>
              </div>
            )}

            {/* Actions principales d'exportation vers Google Forms */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500">
                {user ? `Identifié comme: ${user.email}` : "Veuillez connecter votre compte pour enregistrer l'export."}
              </span>
              
              <button
                onClick={handleCreateForm}
                disabled={isCreatingForm}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-md"
                id="create-form-btn"
              >
                {isCreatingForm ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création du Google Form...</span>
                  </>
                ) : (
                  <>
                    <span>Créer le Google Form</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Vue finale de Validation : Succès de la création de l'API Google Forms */}
        {formLink && (
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Formulaire créé avec succès !</h3>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
              Votre document a été converti et importé avec succès dans votre compte Google.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={formLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors inline-flex items-center justify-center"
                id="view-form-btn"
              >
                Ouvrir le formulaire
              </a>
              <button
                onClick={() => {
                  setFormDef(null);
                  setFormLink(null);
                }}
                className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-8 py-3 rounded-xl font-medium transition-colors"
              >
                Convertir un autre fichier
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


