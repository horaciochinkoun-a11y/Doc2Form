import React from 'react';
import { Project, AppQuota } from '../types';
import { Sparkles, FileText, BarChart3, Clock, ArrowRight, Layers, Trash2, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

// Spécification de l'interface des propriétés du Tableau de bord
interface DashboardViewProps {
  projects: Project[]; // Historique de tous les projets existants
  quota: AppQuota; // État des quotas courants de l'application
  onNavigate: (view: 'dashboard' | 'forms' | 'new' | 'settings') => void; // Routeur interne simplifié
  onDuplicate: (id: string) => void; // Fonction de duplication
  onDelete: (id: string) => void; // Fonction de suppression physique
}

export function DashboardView({ projects, quota, onNavigate, onDuplicate, onDelete }: DashboardViewProps) {
  // Calcul statistique : Nombre de formulaires exportés avec succès
  const exportedFormsCount = projects.filter(p => p.status === 'exported').length;
  // Calcul statistique : Nombre total de brouillons ou formulaires créés
  const totalProjects = projects.length;
  // Calcul du taux d'exportation (ratio de réussite de conversion)
  const successRate = totalProjects > 0 ? Math.round((exportedFormsCount / totalProjects) * 100) : 0;

  // Récupération des 3 projets d'historique les plus récents
  const recentProjects = [...projects].slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. En-tête de bienvenue dynamique */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-zinc-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tableau de bord expert</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ravi de vous revoir !
          </h1>
          <p className="text-sm text-zinc-300 max-w-xl">
            Analysez instantanément vos statistiques d'extraction et configurez vos formulaires intelligents avec l'IA de Gemini.
          </p>
        </div>
        <div>
          <button
            onClick={() => onNavigate('new')}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-900/50"
            id="dash-new-project-btn"
          >
            <span>Nouveau projet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Cartes de mesures statistiques (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 : Statistiques globales des formulaires */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Formulaires Créés</span>
            <span className="text-2xl font-bold text-zinc-900 block">{totalProjects}</span>
            <span className="text-xs text-zinc-500 leading-none">{exportedFormsCount} exportés sur Google Drive</span>
          </div>
        </div>

        {/* KPI 2 : Taux de réussite de conversion */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Taux d'Export</span>
            <span className="text-2xl font-bold text-zinc-900 block">{successRate}%</span>
            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${successRate}%` }} />
            </div>
          </div>
        </div>

        {/* KPI 3 : Quotas de génération restants */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Quotas du Jour</span>
            <span className="text-2xl font-bold text-zinc-900 block">{quota.max - quota.used} / {quota.max}</span>
            <span className="text-xs text-zinc-500 block">Scans IA disponibles aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* 3. Section principale : Quotas interactifs & Historique des extractions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de gauche : Quota widget */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Gestion des Quotas</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Vos requêtes d'analyse du moteur de vision par intelligence artificielle sont limitées pour garantir la fluidité sur nos serveurs de calcul.
            </p>
            
            {/* Visualisation de la jauge */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-600">Limite journalière</span>
                <span className={quota.used >= quota.max ? "text-red-600" : "text-indigo-600"}>
                  {quota.used} / {quota.max} requêtes
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    quota.used >= quota.max ? 'bg-red-500' : quota.used >= quota.max * 0.8 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min((quota.used / quota.max) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Notification de sécurité de limite */}
            <div className="flex items-start gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 mt-4">
              <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-500 leading-tight">
                Réinitialisation automatique chaque jour. Rendez-vous dans l'onglet <strong>Paramètres</strong> pour simuler une mise à niveau haut volume.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="w-full text-center py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Ajuster mon forfait quota
          </button>
        </div>

        {/* Colonne de droite : Historique récent */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Récemment Convertis</span>
              </h3>
              <button 
                onClick={() => onNavigate('forms')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Voir tout
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-12 border border-zinc-100 rounded-2xl bg-zinc-50/50">
                <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500">Aucun projet converti pour l'instant.</p>
                <button
                  onClick={() => onNavigate('new')}
                  className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Démarrer le premier scan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentProjects.map((p) => (
                  <div key={p.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-zinc-400">
                        <span>{new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        {p.fileName ? (
                          <span className="truncate max-w-[120px]">{p.fileName}</span>
                        ) : (
                          <span>Import direct</span>
                        )}
                        <span>•</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'exported' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.status === 'exported' ? 'Exporté' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions simplifiées d'administration */}
                    <div className="flex items-center space-x-2">
                      {p.googleFormUrl && (
                        <a
                          href={p.googleFormUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 rounded-lg hover:bg-zinc-100 transition-colors"
                          title="Ouvrir dans Google Forms"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onDuplicate(p.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
