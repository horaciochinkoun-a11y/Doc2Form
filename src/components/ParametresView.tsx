import React, { useState } from 'react';
import { AppQuota } from '../types';
import { UserCheck, Shield, Key, Sparkles, RefreshCw, Sliders, Check, HardDrive, Cpu, ExternalLink, HelpCircle } from 'lucide-react';
import { User } from 'firebase/auth';

// Spécification de l'interface des propriétés de la page Paramètres
interface ParametresViewProps {
  user: User | null; // Utilisateur Firebase Auth actif
  quota: AppQuota; // Quota actuel de consommation
  onUpdateQuota: (quota: Partial<AppQuota>) => void; // Fonction de mise à jour des quotas
  onLogin: () => void; // Lancement de la popup d'identification Google
  onLogout: () => void; // Déconnexion
}

export function ParametresView({
  user,
  quota,
  onUpdateQuota,
  onLogin,
  onLogout
}: ParametresViewProps) {
  // États de simulation de mise à niveau
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Fonction de simulation de mise à zéro immédiate de quota
  const handleResetQuota = () => {
    onUpdateQuota({ used: 0 });
    triggerNotification('Vos quotas journaliers ont été réinitialisés à 0.');
  };

  // Fonction de simulation d'augmentation de plafond de quota (Compte Premium)
  const handleUpgradeLimit = (newLimit: number) => {
    onUpdateQuota({ max: newLimit });
    triggerNotification(`Votre plafond de quota a été rehaussé à ${newLimit} scans/jour.`);
  };

  // Fonction de nettoyage complet du cache LocalStorage
  const handleClearCache = () => {
    if (window.confirm("Attention : Cela va supprimer tous vos projets et réinitialiser vos quotas. Continuer ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Fonction de déclenchement temporaire de bannière de validation
  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* En-tête principal */}
      <div>
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Paramètres du Système
        </h2>
        <p className="text-sm text-zinc-500">
          Supervisez l'authentification Google Forms, ajustez vos quotas d'analyse IA et purgez vos données stockées localement.
        </p>
      </div>

      {/* Bannière de notification réactive */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grille principale de configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1 : Informations Profil & Google API */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Autorisation Google Forms API</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pour exporter automatiquement vos formulaires modélisés vers Google Drive, l'application s'associe de façon sécurisée à vos services via Google Auth.
            </p>

            {user ? (
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar profile" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm rounded-full">
                      U
                    </div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-zinc-800">{user.displayName || 'Utilisateur anonyme'}</h5>
                    <p className="text-[11px] text-zinc-500">{user.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/50 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                    <span>Google Connecté</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Forms d'écriture OK</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-center space-y-3">
                <p className="text-xs text-amber-800 font-semibold">Aucun jeton d'exportation actif.</p>
                <button
                  onClick={onLogin}
                  className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                >
                  S'identifier avec Google Forms
                </button>
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={onLogout}
              className="mt-6 w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-semibold transition-all"
            >
              Révoquer les autorisations Google
            </button>
          )}
        </div>

        {/* Module 2 : Gestion des Forfaits Quotas */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Simulateur de Volume Quotas</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Modélisez ou surclassez vos plafonds de requêtes journalières de vision IA et simulez un compte d'entreprise pour lever vos restrictions de scans.
            </p>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-600 block">Choisissez un profil de volume :</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpgradeLimit(10)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${
                    quota.max === 10 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  Gratuit (10/j)
                </button>
                <button
                  onClick={() => handleUpgradeLimit(30)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${
                    quota.max === 30 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  Pro (30/j)
                </button>
                <button
                  onClick={() => handleUpgradeLimit(100)}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${
                    quota.max === 100 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  Entreprise (100)
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span>Quota actuel consommé :</span>
              <span className="font-bold text-zinc-800">{quota.used} / {quota.max}</span>
            </div>
          </div>

          <button
            onClick={handleResetQuota}
            className="mt-6 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Remettre les quotas à zéro</span>
          </button>
        </div>

      </div>

      {/* Module 3 : Diagnostic et maintenance technique */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Cpu className="w-5 h-5 text-indigo-600" />
          <span>Diagnostic Stockage & Vie Privée</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-500 leading-relaxed">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
            <span className="font-bold text-zinc-700 block">Durable</span>
            <p>Vos projets et brouillons sont conservés de manière sécure dans l'espace de stockage LocalStorage de votre propre navigateur.</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
            <span className="font-bold text-zinc-700 block">Souveraineté</span>
            <p>Notre serveur Express ne stocke jamais vos données d'examens convertis de manière définitive, garantissant une conformité RGPD absolue.</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
            <span className="font-bold text-zinc-700 block">Intégrité</span>
            <p>Les jetons d'accès OAuth Google Forms sont temporaires et renouvelés à chaque fermeture accidentelle de la session.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            <span>Type d'encapsulation de persistance : localStorage du Client</span>
          </div>
          
          <button
            onClick={handleClearCache}
            className="text-xs text-red-600 hover:text-white px-4 py-2 border border-red-200 hover:bg-red-600 rounded-lg font-semibold transition-all"
          >
            Vider le cache d'application
          </button>
        </div>
      </div>

    </div>
  );
}
