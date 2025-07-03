import React, { useState } from 'react';
import { X, Sparkles, Code, Eye, Download } from 'lucide-react';
import { aiService } from '../services/aiService';

interface ComponentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (component: any) => void;
}

export function ComponentGeneratorModal({ isOpen, onClose, onGenerate }: ComponentGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [componentName, setComponentName] = useState('');
  const [framework, setFramework] = useState('react');
  const [styling, setStyling] = useState('tailwind');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const frameworks = [
    { id: 'react', name: 'React', description: 'Composant React avec hooks' },
    { id: 'vue', name: 'Vue', description: 'Composant Vue 3 avec Composition API' },
    { id: 'angular', name: 'Angular', description: 'Composant Angular avec TypeScript' }
  ];

  const stylingOptions = [
    { id: 'tailwind', name: 'Tailwind CSS', description: 'Classes utilitaires modernes' },
    { id: 'css', name: 'CSS Modules', description: 'CSS modulaire et scopé' },
    { id: 'styled', name: 'Styled Components', description: 'CSS-in-JS avec styled-components' }
  ];

  const examplePrompts = [
    "Un bouton avec icône et état de chargement",
    "Une carte de profil utilisateur avec avatar",
    "Un formulaire de contact avec validation",
    "Un composant de navigation responsive",
    "Une modal de confirmation avec animations",
    "Un tableau de données avec tri et pagination"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || !componentName.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setIsGenerating(true);
    
    try {
      const aiPrompt = `Génère un composant ${framework} nommé "${componentName}" avec ${styling} qui fait: ${prompt}. 
      
      Exigences:
      - Code propre et bien structuré
      - TypeScript si React/Angular
      - Props typées avec interface
      - Gestion des états si nécessaire
      - Responsive design
      - Accessibilité (ARIA)
      - Commentaires explicatifs
      
      Retourne uniquement le code du composant, sans explications.`;

      const response = await aiService.sendMessage(aiPrompt);
      setGeneratedCode(response.content);
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération du composant');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseComponent = () => {
    const component = {
      name: componentName,
      code: generatedCode,
      framework,
      styling,
      prompt,
      generatedAt: new Date().toISOString()
    };
    
    onGenerate(component);
    onClose();
    resetForm();
  };

  const handleDownload = () => {
    const extension = framework === 'react' ? 'tsx' : framework === 'vue' ? 'vue' : 'ts';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setPrompt('');
    setComponentName('');
    setGeneratedCode('');
    setShowPreview(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Générateur de Composants IA</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Component Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du composant *
              </label>
              <input
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="MonComposant"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Framework */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Framework
              </label>
              <div className="space-y-2">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      framework === fw.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <h3 className="font-medium text-white text-sm">{fw.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{fw.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Styling */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Style
              </label>
              <div className="space-y-2">
                {stylingOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setStyling(style.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      styling === style.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <h3 className="font-medium text-white text-sm">{style.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description du composant *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez le composant que vous voulez créer..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 resize-none"
              />
              
              {/* Example Prompts */}
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Exemples:</p>
                <div className="space-y-1">
                  {examplePrompts.slice(0, 3).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="block w-full text-left text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || !componentName.trim() || isGenerating}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer le Composant</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>Code Généré</span>
            </h3>
            {generatedCode && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>{showPreview ? 'Code' : 'Preview'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {generatedCode ? (
              showPreview ? (
                <div className="h-full p-6 bg-gray-50">
                  <div className="bg-white p-4 rounded-lg shadow-sm h-full flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aperçu du composant</p>
                      <p className="text-sm mt-2">Fonctionnalité en développement</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-gray-900 overflow-auto">
                  <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {generatedCode}
                  </pre>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Le code généré apparaîtra ici</p>
                  <p className="text-sm mt-2">Remplissez les champs et cliquez sur "Générer"</p>
                </div>
              </div>
            )}
          </div>

          {generatedCode && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Recommencer
                </button>
                <button
                  onClick={handleUseComponent}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Utiliser ce Composant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}