import React from 'react';
import { FormDefinition, FormQuestion } from '../types';
import { GripVertical, Trash2, PlusCircle, CheckSquare, Type, AlignLeft, ChevronDown, List, X } from 'lucide-react';

interface FormPreviewProps {
  form: FormDefinition;
  onChange: (newForm: FormDefinition) => void;
}

export function FormPreview({ form, onChange }: FormPreviewProps) {
  
  const updateTitle = (val: string) => onChange({ ...form, title: val });
  const updateDesc = (val: string) => onChange({ ...form, description: val });

  const updateQuestion = (index: number, updatedQ: FormQuestion) => {
    const newQs = [...form.questions];
    newQs[index] = updatedQ;
    onChange({ ...form, questions: newQs });
  };

  const deleteQuestion = (index: number) => {
    const newQs = form.questions.filter((_, i) => i !== index);
    onChange({ ...form, questions: newQs });
  };

  const addQuestion = () => {
    onChange({
      ...form,
      questions: [
        ...form.questions,
        { id: `q${Date.now()}`, type: 'text', title: 'Nouvelle question' }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête du formulaire */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm border-t-8 border-t-indigo-500" id="form-header">
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="w-full text-3xl font-semibold text-zinc-900 border-none focus:ring-0 p-0 mb-3"
          placeholder="Titre du formulaire"
        />
        <textarea
          value={form.description}
          onChange={(e) => updateDesc(e.target.value)}
          className="w-full text-sm text-zinc-600 border-none focus:ring-0 p-0 resize-none"
          placeholder="Description du formulaire..."
          rows={2}
        />
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {form.questions.map((q, index) => (
          <div key={q.id} className="relative bg-white p-5 rounded-xl border border-zinc-200 shadow-sm group" id={`question-${q.id}`}>
            <div className="flex start items-start space-x-3">
              <div className="mt-2 text-zinc-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestion(index, { ...q, title: e.target.value })}
                    className="flex-1 text-base font-medium text-zinc-800 border-b border-zinc-300 focus:border-indigo-500 focus:ring-0 px-0 pb-1 bg-transparent"
                    placeholder="Titre de la question"
                  />
                  
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, { ...q, type: e.target.value as any })}
                    className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700"
                  >
                    <option value="text">Réponse courte</option>
                    <option value="paragraph">Paragraphe</option>
                    <option value="radio">Choix multiple</option>
                    <option value="checkbox">Cases à cocher</option>
                    <option value="dropdown">Liste déroulante</option>
                    <option value="section">Titre / Section</option>
                  </select>
                </div>

                {/* Options pour Radio/Checkbox/Dropdown */}
                {(q.type === 'radio' || q.type === 'checkbox' || q.type === 'dropdown') && (
                  <div className="space-y-2 pl-2">
                    {(q.options || []).map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        {q.type === 'radio' && <div className="w-4 h-4 rounded-full border border-zinc-400" />}
                        {q.type === 'checkbox' && <div className="w-4 h-4 rounded-sm border border-zinc-400" />}
                        {q.type === 'dropdown' && <span className="text-zinc-400 text-sm">{optIndex + 1}.</span>}
                        
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(q.options || [])];
                            newOpts[optIndex] = e.target.value;
                            updateQuestion(index, { ...q, options: newOpts });
                          }}
                          className="flex-1 text-sm border-none focus:ring-0 p-1 hover:border-b hover:border-zinc-300 bg-transparent"
                        />
                        <button
                          onClick={() => {
                            const newOpts = [...(q.options || [])];
                            newOpts.splice(optIndex, 1);
                            updateQuestion(index, { ...q, options: newOpts });
                          }}
                          className="text-zinc-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => {
                          const newOpts = [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`];
                          updateQuestion(index, { ...q, options: newOpts });
                        }}
                        className="text-sm border-b border-dashed border-zinc-400 text-zinc-500 hover:text-indigo-600 pb-0.5"
                      >
                        Ajouter une option
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end items-center pt-3 border-t border-zinc-100 gap-4">
                  <label className="flex items-center space-x-2 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={q.required || false}
                      onChange={(e) => updateQuestion(index, { ...q, required: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Obligatoire</span>
                  </label>
                  <div className="w-px h-4 bg-zinc-200"></div>
                  <button onClick={() => deleteQuestion(index)} className="text-zinc-400 hover:text-red-500 transition-colors" title="Supprimer la question">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        id="add-question-btn"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Ajouter une question</span>
      </button>
    </div>
  );
}
