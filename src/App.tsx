// Importation des hooks fondamentaux de React pour l'état, la référence et les effets de cycles de vie
import React, { useState, useEffect } from 'react';
// Importation de la zone de glisser-déposer de fichiers
import { Dropzone } from './components/Dropzone';
// Importation de la prévisualisation éditable du formulaire
import { FormPreview } from './components/FormPreview';
// Importation des types unifiés de l'application
import { FormDefinition, Project, AppQuota } from './types';
// Importation des modules de gestion d'identité Google SSO et de cache de jetons
import { initAuth, googleSignIn, getAccessToken, logout } from './lib/auth';
// Importation de la fonction d'extraction d'API vers Google Forms
import { createGoogleForm } from './lib/gforms';
// Importation des services d'écriture locale et de gestion réactive des quotas
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  duplicateProject, 
  getQuota, 
  incrementQuota, 
  updateQuota 
} from './lib/storage';
// Importation des vues spécifiques imbriquées de l'application
import { DashboardView } from './components/DashboardView';
import { MesFormulairesView } from './components/MesFormulairesView';
import { ParametresView } from './components/ParametresView';
// Importation des icônes esthétiques et robustes de la librairie Lucide pour enrichir l'UI
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusCircle, 
  Settings, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight, 
  ExternalLink,
  Trash2,
  Copy,
  FolderOpen,
  LogOut,
  User,
  AlertCircle
} from 'lucide-react';
// Importation du type utilisateur de Firebase Authentication
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // Navigation active de l'application (Par défaut, le superbe tableau de bord)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forms' | 'new' | 'settings'>('dashboard');
  
  // Projet en cours d'édition / d'affichage détaillé pour l'exportation
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // État local synchronisé supportant la liste de tous les projets de l'utilisateur
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  
  // État local réactif des quotas de scans autorisés
  const [quotaState, setQuotaState] = useState<AppQuota>({ used: 0, max: 10, lastResetDate: '' });

  // Indicateurs de chargement (Analyse IA d'un côté, création Google Forms de l'autre)
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  
  // Stockage d'événements d'erreurs techniques pour accompagnement utilisateur
  const [error, setError] = useState<string | null>(null);
  // Lien vers le formulaire Google Forms de réponse publique généré avec succès
  const [formLink, setFormLink] = useState<string | null>(null);

  // État de l'utilisateur Firebase connecté
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // Drapeau indiquant s'il faut forcer la reconnexion Suite Google
  const [needsAuth, setNeedsAuth] = useState(false);
  // Statut d'autorisation d'écriture requis par Google Forms API
  const [authStatus, setAuthStatus] = useState<'pending' | 'authorized' | 'unauthorized'>('unauthorized');

  // Contrôleur d'ouverture du volet de tiroir de menu mobile (Responsive Drawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Cycles de vie d'initialisation de l'application ---
  useEffect(() => {
    // 1. Chargement initial des enregistrements de projets depuis LocalStorage
    setProjectsList(getProjects());
    
    // 2. Chargement initial et contrôle de réinitialisation journalière automatique des quotas
    setQuotaState(getQuota());

    // 3. Abonnement réactif à la surveillance de l'état d'authentification SSO Google
    const unsubscribe = initAuth(
      async (firebaseUser, cachedToken) => {
        setUser(firebaseUser); // Hydratation du profil utilisateur
        setNeedsAuth(false); // Réclusion des requêtes de reconnexion
        setAuthStatus('authorized'); // Validation du port
      },
      () => {
        setUser(null); // Vidage
        setNeedsAuth(true); // Sollicitation
        setAuthStatus('unauthorized'); // Révocation d'office
      }
    );
    
    // Libération de l'écouteur d'événements à la destruction du composant parent
    return () => unsubscribe();
  }, []);

  // --- Gestionnaires d'authentification ---
  // Lancement manuel du protocole Google SSO popup sécurisé
  const handleLogin = async () => {
    setError(null);
    try {
      const authRes = await googleSignIn();
      if (authRes) {
        setUser(authRes.user);
        setNeedsAuth(false);
        setAuthStatus('authorized');
      }
    } catch (err: any) {
      setError("Protocole d'identification Google annulé par l'utilisateur ou bloqué.");
      setAuthStatus('unauthorized');
    }
  };

  // Fermeture de session et nettoyage du stockage local de cookies/sessions
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setNeedsAuth(true);
      setAuthStatus('unauthorized');
      setFormLink(null);
    } catch (err) {
      setError("Échec lors de la déconnexion sécurisée.");
    }
  };

  // --- Gestionnaires du Store projet ---
  // Traitement et modification réactive de l'arbre d'un projet localement
  const handleSaveActiveProject = (updatedDef: FormDefinition) => {
    if (!activeProject) return;
    
    // Construction de l'instance de projet modifiée
    const updatedProj: Project = {
      ...activeProject,
      name: updatedDef.title || activeProject.name,
      formDef: updatedDef,
      createdAt: new Date().toISOString()
    };

    // Sauvegarde en mémoire locale
    const newList = saveProject(updatedProj);
    setProjectsList(newList); // Synchronisation globale de l'état UI
    setActiveProject(updatedProj); // Rafraîchissement de l'état de prévisu actif
  };

  // Déclencheur de duplication sécure d'un projet
  const handleDuplicate = (id: string) => {
    const newList = duplicateProject(id);
    setProjectsList(newList); // Mise à jour de la grille
  };

  // Déclencheur de suppression définitive d'un projet
  const handleDelete = (id: string) => {
    const newList = deleteProject(id);
    setProjectsList(newList); // Mise à jour
    if (activeProject && activeProject.id === id) {
      setActiveProject(null); // On ferme l'éditeur
    }
  };

  // Mise à jour adaptative de la configuration de quota utilisateur
  const handleUpdateQuota = (newQuotaConfig: Partial<AppQuota>) => {
    const updated = updateQuota(newQuotaConfig);
    setQuotaState(updated);
  };

  // --- Traitement du Document Source / IA d'Extraction ---
  const handleFileSelect = async (file: File) => {
    // Garde-fou 1 : Test d'éligibilité du quota de scan avant sollicitation de l'API de Google
    const currentQuota = getQuota();
    if (currentQuota.used >= currentQuota.max) {
      setError(`Limite de quota atteinte (${currentQuota.max}/${currentQuota.max} scans consommés). Rendez-vous dans les Paramètres pour simuler une mise à niveau haut volume.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFormLink(null);
    setActiveProject(null);

    // Formulation de l'enveloppe binaire multiparts pour envoi au serveur Express
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Requête réseau vers notre contrôleur d'extraction Gemini
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'extraction par intelligence artificielle.");
      }

      // Structure par défaut si absent
      if (!data.questions) data.questions = [];

      // Consommation et mise à jour de la jauge locale de quota
      const freshQuota = incrementQuota();
      setQuotaState(freshQuota);

      // Instanciation du nouveau projet à partir du résultat JSON structuré
      const newProjID = `project-${Date.now()}`;
      const newProj: Project = {
        id: newProjID,
        name: data.title || file.name.split('.')[0] || 'Nouveau Formulaire Scout',
        status: 'draft',
        createdAt: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        formDef: data
      };

      // Sauvegarde instantanée en local
      const updatedList = saveProject(newProj);
      setProjectsList(updatedList);
      
      // Sélection comme projet actif à l'écran
      setActiveProject(newProj);
      setFormLink(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur réseau indéterminée lors de l\'envoi du fichier.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Intégration et Exportation Google Forms API ---
  const handleCreateGoogleForm = async () => {
    if (!activeProject) return;

    let token = await getAccessToken();

    // Authentification de secours à la volée si le token d'autorisation est orphelin
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
        setError("L'authentification Google Forms est requise pour pouvoir écrire les lignes sur votre Drive.");
        return;
      }
    }

    if (!token) {
      setError("Session Google introuvable.");
      return;
    }

    setIsCreatingForm(true);
    setError(null);

    try {
      // Invocation asynchrone de la routine d'envoi Google Forms API v1
      const { formId, responderUri } = await createGoogleForm(activeProject.formDef, token);

      // Mise à jour du statut du projet vers 'exporté' avec son lien de réponse
      const updatedProj: Project = {
        ...activeProject,
        status: 'exported',
        googleFormId: formId,
        googleFormUrl: responderUri,
        createdAt: new Date().toISOString()
      };

      // Enregistrement de la mise à jour
      const saved = saveProject(updatedProj);
      setProjectsList(saved);
      setActiveProject(updatedProj);
      setFormLink(responderUri);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('403')) {
        setError("Vos droits d'écriture Google pour cette session ont expiré. Veuillez réactiver votre connexion.");
        setAuthStatus('unauthorized');
      } else {
        setError("L'API Google Forms s'est fermée avec une exception technique : " + err.message);
      }
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Utilitaire d'assistance à la navigation pour nettoyer les buffers à la volée
  const handleSwitchTab = (tab: 'dashboard' | 'forms' | 'new' | 'settings') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // On ferme la prévisualisation d'un projet pour éviter les collisions visuelles, à moins de forcer "Nouveau"
    if (tab !== 'new') {
      setActiveProject(null);
    }
    setError(null);
    setFormLink(null);
  };

  // Sélection d'un projet pour affichage éditable direct depuis la liste
  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setFormLink(project.googleFormUrl || null);
    setActiveTab('new'); // Basculement sur l'interface de modélisation
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row font-sans text-zinc-800">
      
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION - Version Desktop */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-72 bg-zinc-950 text-white flex-shrink-0 border-r border-zinc-850 flex-col justify-between py-8 px-5">
        
        {/* En-tête de Marque / Logo */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-extrabold font-mono text-xl">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-white tracking-tight leading-none">Doc2Form</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">AI CORE ENGINE</span>
            </div>
          </div>

          {/* Sommet de Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => handleSwitchTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>
            <button
              onClick={() => handleSwitchTab('forms')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'forms'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Mes Formulaires</span>
            </button>
            <button
              onClick={() => handleSwitchTab('new')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'new'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nouveau Projet</span>
            </button>
            <button
              onClick={() => handleSwitchTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>

        {/* Pied de page Sidebar : Informations Profil branché */}
        <div className="pt-6 border-t border-zinc-800">
          {user ? (
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-3 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-zinc-700" />
                ) : (
                  <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs rounded-full">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <h6 className="text-xs font-bold text-zinc-100 truncate">{user.displayName || 'Utilisateur'}</h6>
                  <p className="text-[9px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 px-1.5 ml-2 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Accès Google SSO</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE INTERFACE BAR */}
      {/* ========================================================= */}
      <header className="md:hidden bg-zinc-950 text-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-zinc-850">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold font-mono text-sm">D</span>
          </div>
          <span className="text-base font-extrabold tracking-tight">Doc2Form</span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Rideau mobile d'options de navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bg-zinc-950 text-white border-b border-zinc-800 z-10 px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => handleSwitchTab('dashboard')}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg text-xs font-bold leading-none ${activeTab === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-zinc-900'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>
          <button
            onClick={() => handleSwitchTab('forms')}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg text-xs font-bold leading-none ${activeTab === 'forms' ? 'bg-indigo-600' : 'hover:bg-zinc-900'}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mes Formulaires</span>
          </button>
          <button
            onClick={() => handleSwitchTab('new')}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg text-xs font-bold leading-none ${activeTab === 'new' ? 'bg-indigo-600' : 'hover:bg-zinc-900'}`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
          <button
            onClick={() => handleSwitchTab('settings')}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg text-xs font-bold leading-none ${activeTab === 'settings' ? 'bg-indigo-600' : 'hover:bg-zinc-900'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
          
          <div className="pt-3 border-t border-zinc-800">
            {user ? (
              <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg">
                <span className="text-xs truncate">{user.email}</span>
                <button onClick={handleLogout} className="text-red-400 text-xs font-semibold">Déconnexion</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="w-full py-2 bg-indigo-600 font-bold rounded-lg text-xs text-center">Connexion Google</button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COEUR D'WORKSPACE APPLICATIF */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#FAFAFA]">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto pb-24">
          
          {/* Alerte et affichage d'erreur technique */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 animate-in fade-in slide-in-from-top-1 duration-300">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium">
                <span className="font-bold">Anomalie système : </span>
                {error}
                {needsAuth && (
                  <button 
                    onClick={handleLogin}
                    className="block mt-2 font-bold text-indigo-600 hover:underline"
                  >
                    S'identifier / Forcer reconnexion maintenant
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rendu dynamique ciblé de l'onglet actif */}
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projectsList}
              quota={quotaState}
              onNavigate={handleSwitchTab}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          )}

          {activeTab === 'forms' && (
            <MesFormulairesView
              projects={projectsList}
              onSelectProject={handleOpenProject}
              onDeleteProject={handleDelete}
              onDuplicateProject={handleDuplicate}
              onNavigate={handleSwitchTab}
            />
          )}

          {activeTab === 'settings' && (
            <ParametresView
              user={user}
              quota={quotaState}
              onUpdateQuota={handleUpdateQuota}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'new' && (
            <div className="space-y-8">
              
              {/* S'il n'y a aucun projet en cours d'édition, on affiche la Dropzone d'importation */}
              {!activeProject && !formLink && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-100">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extraction instantanée intelligente</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Nouveau Projet d'Extraction
                    </h2>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1">
                      Téléchargez votre examen, questionnaire ou document textuel au format PDF, DOCX ou Image. Notre modèle IA de Gemini en structurera les options en 3 secondes.
                    </p>
                  </div>

                  {/* Zone réceptrice de fichiers */}
                  <div className="max-w-2xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} isLoading={isLoading} />
                    
                    {isLoading && (
                      <div className="mt-8 flex flex-col items-center text-zinc-500 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <p className="text-sm font-semibold tracking-wide text-zinc-700 animate-pulse">L'IA de Gemini structure le document au format Forms...</p>
                        <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 animate-infinite-loading rounded-full" style={{ width: '70%', animationDuration: '2s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Si un projet est actif et n'a pas encore de lien d'exportation finalisé, on affiche l'éditeur */}
              {activeProject && !formLink && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <span>Édition de projet : {activeProject.name}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                          {activeProject.formDef.questions?.length || 0} questions
                        </span>
                      </h3>
                      {activeProject.fileName && (
                        <p className="text-xs text-zinc-400 mt-0.5">Source : {activeProject.fileName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setActiveProject(null);
                        setError(null);
                      }}
                      className="text-xs border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-650 px-3 py-2 rounded-lg transition-colors shadow-sm self-start"
                    >
                      Désélectionner le projet
                    </button>
                  </div>

                  {/* Prévisualisation dynamique et édition du formulaire à chaud */}
                  <FormPreview form={activeProject.formDef} onChange={handleSaveActiveProject} />

                  {/* Notification de sécurité d'Authentification Google SSO */}
                  {!user && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold">Jeton Google Forms requis</p>
                        <p className="text-amber-700">Vous devez connecter votre compte Google pour autoriser l'applet à créer de façon automatique et sécurisée le formulaire sur vos services Drive.</p>
                        <button 
                          onClick={handleLogin}
                          className="mt-3 bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] transition-colors"
                        >
                          Se connecter à Google maintenant
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions de footer d'exportation vers Google Forms API */}
                  <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-zinc-400 truncate max-w-sm">
                      {user ? `Connecté sous : ${user.email}` : "Vous devez associer votre compte Google avant l'export."}
                    </span>
                    
                    <button
                      onClick={handleCreateGoogleForm}
                      disabled={isCreatingForm}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/15"
                      id="create-form-action-btn"
                    >
                      {isCreatingForm ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Génération de l'API Google Forms...</span>
                        </>
                      ) : (
                        <>
                          <span>Exporter vers Google Forms</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* Rendu final de félicitations / Succès de création du Google Form */}
              {formLink && (
                <div className="bg-white p-8 rounded-2xl border border-zinc-250 shadow-sm text-center max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Formulaire généré !
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">
                    Votre document d'origine a été restructuré avec robustesse et est désormais importé en ligne sur votre espace Google Drive personnel.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={formLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors inline-flex items-center justify-center"
                      id="success-view-form-btn"
                    >
                      Ouvrir mon Google Form
                    </a>
                    <button
                      onClick={() => {
                        setActiveProject(null);
                        setFormLink(null);
                        setActiveTab('forms'); // On revient à l'historique complet
                      }}
                      className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                    >
                      Retourner à l'historique
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
