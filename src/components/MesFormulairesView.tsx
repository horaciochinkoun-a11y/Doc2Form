import React, { useState } from 'react';
import { Project } from '../types';
import { Search, Plus, Trash2, Copy, FileSpreadsheet, FileClock, ChevronRight, HelpCircle, HardDrive, ListCollapse, ExternalLink } from 'lucide-react';

// Spécification de l'interface des propriétés de la liste de formulaires
interface MesFormulairesViewProps {
  projects: Project[]; // Tableau de tous les projets locaux persistés
  onSelectProject: (project: Project) => void; // Déclencheur d'ouverture du projet
  onDeleteProject: (id: string) => void; // Suppression d'un document
  onDuplicateProject: (id: string) => void; // Duplication d'un brouillon
  onNavigate: (view: 'dashboard' | 'forms' | 'new' | 'settings') => void; // Redirection vers d'autres vues
}

export function MesFormulairesView({
  projects,
  onSelectProject,
  onDeleteProject,
  onDuplicateProject,
  onNavigate
}: MesFormulairesViewProps) {
  // Stockage local du mot-clé recherché par l'utilisateur
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage intelligent basé sur le texte tapé dans l'outil de recherche (respectant casse & accents)
  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(term) ||
      p.formDef.title.toLowerCase().includes(term) ||
      (p.fileName && p.fileName.toLowerCase().includes(term))
    );
  });

  // Utilitaire d'affichage ergonomique des tailles de fichiers sources (Ko / Mo)
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Scan manuel';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Bloc de titre principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Mes Formulaires
          </h2>
          <p className="text-sm text-zinc-500">
            Recherchez, gérez, dupliquez ou modifiez vos formulaires prêts pour l'exportation.
          </p>
        </div>
        
        {/* Raccourci de création directe */}
        <button
          onClick={() => onNavigate('new')}
          className="flex items-center space-x-1.5 self-start sm:self-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          id="btn-new-form-list"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un formulaire</span>
        </button>
      </div>

      {/* 2. Barre d'outils interactive : Filtre de Recherche */}
      <div className="relative bg-white border border-zinc-200 rounded-xl p-2 shadow-sm flex items-center">
        <Search className="w-5 h-5 text-zinc-400 ml-2" />
        <input
          type="text"
          placeholder="Rechercher par titre de formulaire, fichier d'origine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm border-none focus:ring-0 px-3 py-2 bg-transparent text-zinc-800"
          id="project-search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-500 px-2 py-1 rounded-md transition-colors font-medium mr-2"
          >
            Effacer
          </button>
        )}
      </div>

      {/* 3. Conteneur principal de la liste des formulaires */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
              <FileClock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun formulaire enregistré'}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? "Essayez d'ajuster vos filtres de recherche ou réécrivez l'intitulé exact."
                : "Importez un document PDF ou word pour commencer votre première modélisation."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-all"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {filteredProjects.map((project) => {
              const qCount = project.formDef?.questions?.length || 0;
              return (
                <div
                  key={project.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors group cursor-pointer"
                  onClick={() => onSelectProject(project)}
                  style={{ id: `row-project-${project.id}` }}
                >
                  
                  {/* Informations du projet : Titre, date et poids */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate max-w-md">
                        {project.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                        project.status === 'exported' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {project.status === 'exported' ? 'Exporté' : 'Brouillon'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{formatFileSize(project.fileSize)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <ListCollapse className="w-3.5 h-3.5" />
                        <span>{qCount} question{qCount > 1 ? 's' : ''}</span>
                      </div>
                      <span>•</span>
                      <span>Modifié le {new Date(project.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Boutons d'actions rapides */}
                  <div 
                    className="flex items-center space-x-2 self-start md:self-center"
                    onClick={(e) => e.stopPropagation()} // Pour empêcher l'ouverture du projet lors du clic sur un bouton d'action
                  >
                    
                    {/* Lien direct Google Form s'il a déjà été généré par l'API */}
                    {project.googleFormUrl && (
                      <a
                        href={project.googleFormUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                        title="Ouvrir dans Google Forms"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Copier / Dupliquer */}
                    <button
                      onClick={() => onDuplicateProject(project.id)}
                      className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                      title="Dupliquer le projet"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Supprimer définitivement */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Voulez-vous vraiment supprimer définitivement le projet "${project.name}" ?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Astuce d'expert pour l'aide utilisateur */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start space-x-3 text-indigo-900">
        <HelpCircle className="w-5 h-5 flex-shrink-0 text-indigo-500 mt-0.5 animate-pulse" />
        <div className="text-xs space-y-1 leading-relaxed">
          <p className="font-bold">Astuce d'organisation :</p>
          <p className="text-indigo-800">Dupliquez un modèle déjà validé pour créer des variantes d'examens (Version A, B ou C) sans avoir à relancer l'analyse du fichier source par l'IA.</p>
        </div>
      </div>

    </div>
  );
}
