export type QuestionType = 'text' | 'paragraph' | 'radio' | 'checkbox' | 'dropdown' | 'section';

export interface FormQuestion {
  id: string; // Identifiant unique
  type: QuestionType; // Le type HTML d'entrée du formulaire
  title: string; // Libellé / Énoncé de la question
  options?: string[]; // Pour les types choix multiple, cases à cocher, liste
  required?: boolean; // Condition d'obligation de réponse
}

export interface FormDefinition {
  title: string; // Titre du formulaire
  description: string; // Description de l'objectif
  questions: FormQuestion[]; // Questions incluses
}

export interface Project {
  id: string; // Identifiant unique du projet local
  name: string; // Nom dérivé du titre du formulaire
  createdAt: string; // Date de création ISO
  formDef: FormDefinition; // Contenu du formulaire structuré
  googleFormId?: string; // ID Google Form retourné après export
  googleFormUrl?: string; // URL publique de réponse (responderUri)
  status: 'draft' | 'exported'; // Statut d'état du projet
  fileName?: string; // Nom du fichier d'origine converti
  fileSize?: number; // Taille en octets du fichier source
}

export interface AppQuota {
  used: number; // Volume cumulé de scans consommés
  max: number; // Plafond maximal de scans autorisés
  lastResetDate: string; // Dernière réinitialisation du quota
}
