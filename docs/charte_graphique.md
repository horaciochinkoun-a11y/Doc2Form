# 🎨 Charte Graphique & Design System (Doc2Form)

Bienvenue dans la charte graphique et le cahier des standards de design de **Doc2Form**. Ce document agit comme la bible visuelle et technique de l'application, assurant la cohérence de la marque à travers toutes ses interfaces, ses extensions et ses supports de communication.

---

## 🏛️ 1. Identité de Marque & Ton Visuel

**Doc2Form** marie l'univers des sciences académiques, des documents d'examens traditionnels, et de la haute technologie de pointe liée à l'intelligence artificielle. Le design est épuré, structuré, et hautement professionnel.

*   **Vibe Visuelle** : Structurée, moderne, savante et rassurante.
*   **Adjectifs Clés** : Neutre, robuste, fonctionnelle, spacieuse, élitiste.
*   **Contre-exemples (Ce que nous refusons)** : Aucun dégradé de couleurs fluorescentes d'aspect "crypto-web3", aucun bouton criard, aucune surcharge d'informations système ou bruits techniques ("AI-slop"). Le design doit inspirer confiance à un recteur d'académie ou un responsable RH de faculté.

---

## 📐 2. Logo et Variantes d'Usage

### A. La Forme de Référence
La signature identitaire est représentative d'un document se transformant en pont numérique :
*   **Le Glyphe** : Un carré parfait aux angles généreusement adoucis (`rounded-xl` / `12px`), habillé d'un dégradé profond Indigo, présentant la lettre blanche **D** stylisée en caractère monospace pour évoquer la structure binaire.
*   **Taille d'affichage standard (Desktop)** : `36px * 36px` ou classe Tailwind `w-9 h-9`.
*   **Taille d'affichage réduite (Mobile & Profil)** : `28px * 28px` ou classe Tailwind `w-7 h-7`.

### B. Les Règles d'Usage Relatives (Garde-fous)
*   **Zone d'exclusion** : Le logo doit obligatoirement être ceinturé d'un espace de respiration vierge d'au moins la moitié de sa propre largeur.
*   **Couleurs interdites** : Pas d'usage sur arrière-plan texturé à fort contraste. S'il est placé sur fond sombre (ex: Barre latérale Zinc-950), le symbole D reste blanc pur et l'arrière-plan de la boîte reste d'un Indigo vif.

---

## 🎨 3. Palette de Couleurs (Échelle Hexadécimale)

Pour garantir une harmonie totale, nous nous appuyons sur une palette de couleurs contrastée et équilibrée.

### A. Couleurs Primaires & Neutres de Marque
| Nom de la Couleur | Code Hexadécimal | Rôle & Usage Sémantique |
| :--- | :--- | :--- |
| **Deep Indigo** | `#4F46E5` | Boutons primaires d'actions à fort impact, états actifs. |
| **Sleek Indigo (Hover)** | `#4338CA` | Couleur d'état de survol pour nos contrôles primaires. |
| **Dark Onyx** | `#09090B` | Arrière-plan de notre menu de navigation latéral de bureau. |
| **Workspace Canvas** | `#FAFAFA` | Fond général de l'espace de calcul et des zones d'analyses. |
| **White Pearl** | `#FFFFFF` | Conteneur des cartes, éditeurs de questions et profil. |

### B. Couleurs Sémantiques (Statuts et Retours Systèmes)
*   **Succès (Formulaires validés et exportés en un clic)** :
    *   Fond : `#ECFDF5` (Emerald-50)
    *   Bordure / Texte : `#059669` (Emerald-600)
*   **Alerte / Attente (Session expirée ou quotas resserrés)** :
    *   Fond : `#FEF3C7` (Amber-50)
    *   Bordure / Texte : `#B45309` (Amber-700)
*   **Erreur (Anomalies réseau, rejets d'importation de fichiers)** :
    *   Fond : `#FEF2F2` (Red-50)
    *   Bordure / Texte : `#DC2626` (Red-600)

---

## 🔤 4. Typographie & Rythme d'Échelle

La typographie est l'âme du design. Nous orchestrons une hiérarchie sémantique forte à l'aide de Google Fonts preloaded.

### A. Les Fontes de Référence
1.  **Display Sans (Titres Forte Attention)** : **Space Grotesk**
    *   *Intention stylistique* : Donne une finition géométrique et technologique sans pour autant paraître agressive.
    *   *Usage* : Titres principaux de sections, statistiques clés, messages de succès.
2.  **UI & Body (Lecture de Contenu, Inputs)** : **Inter**
    *   *Intention stylistique* : Lisibilité maximale, proportions idéales pour les écrans retina.
    *   *Usage* : Boutons, descriptions de questions, placeholders, texte courant.
3.  **Monospace (Données Froides, Rôles, Indices)** : **JetBrains Mono**
    *   *Intention stylistique* : Structure ordonnée.
    *   *Usage* : Indicateurs de quotas, types de formats d'importation (.PDF, .DOCX), badges système.

### B. Exemples Pratiques d'Échelle Typographique
*   **Titre Principal de Écran (H1)** : `font-sans font-extrabold tracking-tight text-3xl md:text-4xl text-zinc-900`
*   **Libellé de Question Éditée (H3)** : `font-sans font-bold text-zinc-900 text-base md:text-lg`
*   **Description de Paragraphe (Body)** : `font-sans text-sm text-zinc-500 leading-relaxed`

---

## 🧱 5. Règles d'Interface & Composants Complexes

Tous nos composants d'interface partagent une formule d'espacement fluide et uniforme.

### A. La Dropzone d'Importation
- Doit posséder une bordure discontinue (`border-dashed border-2`) avec de grands arrondis (`rounded-2xl`).
- En cas de survol de fichier (`isDragOver`), les tons d'arrière-plan transitent vers de l'Indigo très étalé (`bg-indigo-50/50`) avec une bordure de couleur de marque Indigo.

### B. Les Boutons Interactifs (BTA)
- Tous les boutons possèdent une transition temporelle d'au moins 200 microsecondes (`transition-colors duration-200`) pour amener une sensation organique à l'utilisateur.
- Les boutons d'analyse ou d'exportation intègrent un spinner asynchrone (`animate-spin`) pour bloquer les doubles clics accidentels en cas de latence réseau.

### C. Le Système de Marges et Remplissage (Paddings/Spacing)
*   **Conteneurs Principaux** : Toujours utiliser des espacements proportionnels `p-6` sur mobile et `p-10` sur écran de bureau pour laisser respirer l'application. Nos interfaces possèdent un écartement vertical de type `space-y-6` ou `space-y-8`.
*   **Arrondis de Coins** : Les cartes complexes et boutons se fixent sur la directive `rounded-xl` (12px de rayon), tandis que les boîtes d'état secondaires se limitent à `rounded-lg` (8px).

---

## 💎 6. Iconographie Harmonisée

*   **Fournisseur unique** : Toutes les icônes proviennent obligatoirement et exclusivement de la bibliothèque **Lucide React**.
*   **Style d'apparence** : Trait de type `stroke-width={2}` ou `stroke-width={2.5}` pour s'harmoniser avec la finesse d'Inter.
*   **Coloration** : Toujours en synergie avec leur environnement (ex: icône d'alerte avec texte rouge, icône de navigation avec couleur active Indigo).
