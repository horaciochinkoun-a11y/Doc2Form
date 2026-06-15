export type QuestionType = 'text' | 'paragraph' | 'radio' | 'checkbox' | 'dropdown' | 'section';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[]; // for radio, checkbox, dropdown
  required?: boolean;
}

export interface FormDefinition {
  title: string;
  description: string;
  questions: FormQuestion[];
}
