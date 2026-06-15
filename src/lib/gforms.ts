import { FormDefinition, FormQuestion } from '../types';

export async function createGoogleForm(
  formData: FormDefinition,
  accessToken: string
): Promise<{ formId: string; responderUri: string }> {
  
  // 1. Create empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: formData.title || 'Formulaire généré par Doc2Form',
        documentTitle: formData.title || 'Formulaire généré par Doc2Form',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Erreur création form: ${err}`);
  }

  const formRef = await createRes.json();
  const formId = formRef.formId;

  // 2. Add question items
  const requests = [];
  let index = 0;

  for (const q of formData.questions) {
    const item: any = {
      title: q.title,
    };

    if (q.type === 'section') {
      item.pageBreakItem = {};
    } else {
      item.questionItem = {
        question: {
          required: q.required || false,
        }
      };

      if (q.type === 'text') {
        item.questionItem.question.textQuestion = {};
      } else if (q.type === 'paragraph') {
         item.questionItem.question.textQuestion = { paragraph: true };
      } else if (q.type === 'radio' || q.type === 'dropdown' || q.type === 'checkbox') {
        
        let choiceType = 'RADIO';
        if (q.type === 'dropdown') choiceType = 'DROP_DOWN';
        if (q.type === 'checkbox') choiceType = 'CHECKBOX';

        item.questionItem.question.choiceQuestion = {
          type: choiceType,
          options: (q.options || ['Option 1']).map((opt) => ({ value: opt }))
        };
      } else {
        item.questionItem.question.textQuestion = {}; // Default
      }
    }

    requests.push({
      createItem: {
        item,
        location: { index }
      }
    });

    index++;
  }

  if (requests.length > 0) {
    const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error('BatchUpdate failed:', err);
      // We don't abort completely to at least return the form URL
    }
  }

  return {
    formId: formRef.formId,
    responderUri: formRef.responderUri
  };
}
