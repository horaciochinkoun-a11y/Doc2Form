import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';

async function generateContentWithRetry(ai: any, params: any, maxRetries = 3, initialDelay = 1500) {
  let attempt = 0; // Compteur de tentatives
  while (true) { // Boucle de retry asynchrone
    try {
      // Appel de l'API de génération du SDK de Google
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++; // Augmentation du nombre d'essais
      const errorMessage = error?.message || String(error); // Extraction du message textuel d'erreur
      console.error(`[Gemini API] Tentative ${attempt}/${maxRetries} échouée :`, errorMessage); // Trace locale de l'erreur

      // Identification s'il s'agit d'une indisponibilité temporaire (503) ou surcharge (429)
      const isTransient = errorMessage.includes('503') || 
                          errorMessage.includes('UNAVAILABLE') || 
                          errorMessage.includes('429') ||
                          errorMessage.includes('high demand') ||
                          errorMessage.includes('busy');

      // Abandon si les tentatives maximales sont épuisées ou si l'erreur est non corrigible d'office
      if (attempt >= maxRetries || !isTransient) {
        throw error; // Transmission de l'erreur au bloc supérieur
      }

      // Calcul d'un délai exponentiel renforcé par un facteur aléatoire (jitter) pour éviter les vagues simultanées
      const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.log(`[Gemini API] Retente dans ${Math.round(delay)}ms suite à une indisponibilité temporaire...`); // Log sur le serveur
      await new Promise((resolve) => setTimeout(resolve, delay)); // Sommeil asynchrone du thread courant
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Configuration Gemini
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });

  app.post('/api/extract', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const file = req.file;
      const mimeType = file.mimetype;
      let contents: any[] = [];

      const promptText = `
Tu es un expert en création de formulaires Google Forms.
Analyse le document fourni et extrais son contenu pour le convertir en une structure de formulaire JSON.
Détecte le titre principal, les sections, et chaque question avec ses choix éventuels.
Pour 'type' de chaque question, utilise l'un des suivants: 'text' (réponse courte), 'paragraph' (réponse longue), 'radio' (choix unique), 'checkbox' (choix multiple), 'dropdown' (liste), 'section' (nouvelle section/titre interne).
S'il y a des choix de réponses (A, B, C ou des puces), insiste-les dans le champ 'options' pour les types radio/checkbox/dropdown.
`;

      if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        contents = [
          {
            inlineData: {
              data: file.buffer.toString('base64'),
              mimeType: mimeType
            }
          },
          promptText
        ];
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        contents = [
          promptText + "\\n\\nContenu du document:\\n" + result.value
        ];
      } else {
        return res.status(400).json({ error: 'Type de fichier non supporté. Utilisez PDF, DOCX, ou images.' });
      }

      // Configuration du schéma de validation stricte attendu en retour (JSON) pour nos formulaires
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Titre général du formulaire" },
          description: { type: Type.STRING, description: "Description ou consignes globales" },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Un ID unique (ex: q1)" },
                type: { type: Type.STRING, description: "Type de la question: text, paragraph, radio, checkbox, dropdown, section" },
                title: { type: Type.STRING, description: "L'énoncé de la question ou le titre de la section" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Les options de réponse si applicable"
                },
                required: { type: Type.BOOLEAN, description: "Vrai si la question semble obligatoire" }
              },
              required: ["id", "type", "title"]
            }
          }
        },
        required: ["title", "description", "questions"]
      };

      let response; // Déclaration de la variable de réponse de génération de l'IA

      try {
        console.log('[Gemini API] Tentative d\'analyse principale avec gemini-3.5-flash...'); // Log d'étape
        // Appel du modèle principal stable avec notre helper résilient
        response = await generateContentWithRetry(ai, {
          model: 'gemini-3.5-flash',
          contents,
          config: {
            responseMimeType: 'application/json', // Format brut structuré attendu
            responseSchema // Schéma strict pour forcer la structure
          }
        }, 3, 1000); // 3 tentatives, délai de base 1000ms
      } catch (firstError: any) {
        console.error('[Gemini API] Échec persistant du modèle gemini-3.5-flash. Déclenchement de la bascule de repli...'); // Log d'erreur
        
        try {
          // Évaluation de secours sur le modèle léger ultra-disponible gemini-3.1-flash-lite
          response = await generateContentWithRetry(ai, {
            model: 'gemini-3.1-flash-lite',
            contents,
            config: {
              responseMimeType: 'application/json',
              responseSchema
            }
          }, 2, 1000); // 2 tentatives pour éviter de faire attendre inutilement si l'API globale est KO
        } catch (fallbackError: any) {
          console.error('[Gemini API] Échec du modèle de repli également.', fallbackError); // Log d'erreur totale
          // Levée asynchrone d'une erreur rédigée pour l'utilisateur final pour éviter de montrer le JSON technique brute
          throw new Error(
            "Le service d'analyse par intelligence artificielle est temporairement saturé. " +
            "Veuillez patienter 10 à 15 secondes, puis déposez à nouveau votre fichier pour réessayer."
          );
        }
      }

      const jsonStr = response.text?.trim() || '{}'; // Extraction de la chaîne JSON générée
      res.json(JSON.parse(jsonStr)); // Désérialisation et envoi réactif au client React

    } catch (e: any) {
      console.error('Erreur API Gemini finale:', e); // Trace serveur définitive
      // Traduction française élégante si le message d'erreur contient des indicateurs de charge serveurs Google
      let userFriendlyMessage = e.message || 'Erreur inconnue lors de la conversion'; // Message par défaut
      if (userFriendlyMessage.includes('503') || userFriendlyMessage.includes('UNAVAILABLE') || userFriendlyMessage.includes('demand')) {
        userFriendlyMessage = "Le service de traitement de Google subit actuellement une forte charge réseau. Veuillez patienter un instant et retenter votre import.";
      }
      res.status(500).json({ error: userFriendlyMessage }); // Notification d'erreur soignée au client
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
