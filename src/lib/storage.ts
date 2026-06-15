import { Project, AppQuota } from '../types';

// Clés de LocalStorage isolées pour notre application
const PROJECTS_KEY = 'doc2form_projects_record';
const QUOTA_KEY = 'doc2form_usage_quota';

// Liste de projets d'exemple préinstallés pour donner vie au tableau de bord s'il est vide
const MOCK_PROJECTS: Project[] = [
  {
    id: 'demo-1',
    name: 'Examen de Mathématiques - Algèbre Linéaire',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString(), // Il y a 3 jours
    status: 'exported',
    fileName: 'examen_maths_l1.pdf',
    fileSize: 450122,
    googleFormId: '1AbC_Demo1_GoogleFormId',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfD_demo_link_1/viewform',
    formDef: {
      title: 'Examen de Mathématiques - Algèbre Linéaire',
      description: 'Évaluation formative du premier semestre portant sur les espaces vectoriels et les applications linéaires.',
      questions: [
        { id: 'q1', type: 'text', title: 'Quel est votre nom complet ?', required: true },
        { id: 'q2', type: 'radio', title: 'Quelle est la dimension de l\'espace vectoriel R^3 ?', options: ['1', '2', '3', 'Infini'], required: true },
        { id: 'q3', type: 'checkbox', title: 'Quelles assertions sont vraies pour une matrice inversible ?', options: ['Son déterminant est non nul', 'Son noyau est réduit à {0}', 'Elle admet une valeur propre nulle'], required: false }
      ]
    }
  },
  {
    id: 'demo-2',
    name: 'Formulaire d\'évaluation de formation IA',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1).toISOString(), // Hier
    status: 'draft',
    fileName: 'evaluation_formation.docx',
    fileSize: 189204,
    formDef: {
      title: 'Formulaire d\'évaluation de formation IA',
      description: 'Donnez-nous votre avis anonyme sur la session intensive d\'ingénierie de prompt.',
      questions: [
        { id: 'qa', type: 'dropdown', title: 'Comment évaluez-vous le rythme ?', options: ['Trop rapide', 'Idéal', 'Trop lent'], required: true },
        { id: 'qb', type: 'paragraph', title: 'Quels points d\'amélioration préconisez-vous ?', required: false }
      ]
    }
  }
];

/**
 * Récupère l'intégralité des projets stockés localement
 */
export const getProjects = (): Project[] => {
  // Tentative d'extraction des données brutes
  const raw = localStorage.getItem(PROJECTS_KEY);
  if (!raw) {
    // Si vide ou premier lancement, on persiste les projets de démonstration pour illustrer l'UI d'un Pro
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS));
    return MOCK_PROJECTS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erreur lors de la lecture des projets', e);
    return [];
  }
};

/**
 * Enregistre ou met à jour un projet dans le LocalStorage
 */
export const saveProject = (project: Project): Project[] => {
  const currentList = getProjects();
  const index = currentList.findIndex((p) => p.id === project.id);
  
  if (index >= 0) {
    // Mise à jour d'un projet pré-existant
    currentList[index] = { ...project, createdAt: new Date().toISOString() }; // Date de dernière édition
  } else {
    // Insertion d'un nouveau projet
    currentList.unshift(project);
  }
  
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(currentList));
  return currentList;
};

/**
 * Supprime chirurgicalement un projet
 */
export const deleteProject = (id: string): Project[] => {
  const currentList = getProjects();
  const updatedList = currentList.filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedList));
  return updatedList;
};

/**
 * Duplique un projet existant en clonant sa définition de formulaire
 */
export const duplicateProject = (id: string): Project[] => {
  const currentList = getProjects();
  const source = currentList.find((p) => p.id === id);
  if (!source) return currentList;

  // Création du clone exact avec ID unique généré et nom altéré
  const clone: Project = {
    ...source,
    id: `project-${Date.now()}`,
    name: `${source.name} (Copie)`,
    createdAt: new Date().toISOString(),
    status: 'draft', // On réinitialise l'état d'exportation pour le clone
    googleFormId: undefined,
    googleFormUrl: undefined,
    formDef: {
      ...source.formDef,
      title: `${source.formDef.title} (Copie)`
    }
  };

  currentList.unshift(clone); // Ajout en tout début de tableau
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(currentList));
  return currentList;
};

/**
 * Charge l'état du quota journalier
 */
export const getQuota = (): AppQuota => {
  const raw = localStorage.getItem(QUOTA_KEY);
  const defaultQuota: AppQuota = {
    used: 2, // 2 utilisés par les démos de base
    max: 10,  // Plafond standard journalier de 10 requêtes gratuites
    lastResetDate: new Date().toDateString()
  };

  if (!raw) {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(defaultQuota));
    return defaultQuota;
  }

  try {
    const quotaData: AppQuota = JSON.parse(raw);
    const today = new Date().toDateString();
    
    // Si la date du jour est différente de la dernière sauvegarde, on remet à zéro d'office !
    if (quotaData.lastResetDate !== today) {
      quotaData.used = 0;
      quotaData.lastResetDate = today;
      localStorage.setItem(QUOTA_KEY, JSON.stringify(quotaData));
    }
    
    return quotaData;
  } catch (e) {
    return defaultQuota;
  }
};

/**
 * Consomme un ticket de quota de conversion
 */
export const incrementQuota = (): AppQuota => {
  const current = getQuota();
  current.used = Math.min(current.used + 1, current.max);
  localStorage.setItem(QUOTA_KEY, JSON.stringify(current));
  return current;
};

/**
 * Permet de modifier la config de quota (simulation de mise à niveau / Reset)
 */
export const updateQuota = (quota: Partial<AppQuota>): AppQuota => {
  const current = getQuota();
  const updated = { ...current, ...quota };
  localStorage.setItem(QUOTA_KEY, JSON.stringify(updated));
  return updated;
};
