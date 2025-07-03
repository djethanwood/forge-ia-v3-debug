import React, { useState } from 'react';
import { X, Folder, Globe, Smartphone, Server, Monitor, Sparkles, Code, Palette, Database, Gamepad2, Bot, Zap, Package, FileText, Image, Music, Video, Cpu, Wrench, Layers } from 'lucide-react';
import { Project } from '../types';
import { useAI } from '../contexts/AIContext';
import { projectService } from '../services/projectService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const projectTypes = [
  { 
    id: 'web', 
    name: 'Site Web', 
    icon: Globe, 
    description: 'Sites web responsifs, landing pages, portfolios',
    frameworks: ['React + TypeScript', 'Next.js', 'Vue 3', 'Svelte', 'Vanilla JS', 'Angular'],
    formats: ['SPA', 'MPA', 'PWA', 'SSR', 'SSG']
  },
  { 
    id: 'webapp', 
    name: 'Application Web', 
    icon: Monitor, 
    description: 'Applications web complexes, dashboards, SaaS',
    frameworks: ['React + TypeScript', 'Next.js', 'Vue 3', 'Angular', 'Svelte Kit', 'Nuxt'],
    formats: ['SPA', 'PWA', 'Dashboard', 'Admin Panel', 'CRM', 'E-commerce']
  },
  { 
    id: 'mobile', 
    name: 'App Mobile', 
    icon: Smartphone, 
    description: 'Applications mobiles natives et hybrides',
    frameworks: ['React Native', 'Flutter', 'Ionic', 'Cordova', 'Capacitor', 'Xamarin'],
    formats: ['Native', 'Hybrid', 'PWA Mobile', 'Cross-platform']
  },
  { 
    id: 'api', 
    name: 'API / Backend', 
    icon: Server, 
    description: 'APIs REST, GraphQL, microservices',
    frameworks: ['Node.js + Express', 'FastAPI', 'Nest.js', 'Django', 'Flask', 'Spring Boot'],
    formats: ['REST API', 'GraphQL', 'Microservices', 'Serverless', 'gRPC']
  },
  { 
    id: 'desktop', 
    name: 'App Desktop', 
    icon: Cpu, 
    description: 'Applications desktop multiplateformes',
    frameworks: ['Electron', 'Tauri', 'Qt', 'JavaFX', 'WPF', 'Tkinter'],
    formats: ['Cross-platform', 'Windows', 'macOS', 'Linux']
  },
  { 
    id: 'game', 
    name: 'Jeu', 
    icon: Gamepad2, 
    description: 'Jeux 2D/3D, casual games, web games',
    frameworks: ['Unity', 'Godot', 'Phaser', 'Three.js', 'Babylon.js', 'Pygame'],
    formats: ['2D Game', '3D Game', 'Web Game', 'Mobile Game', 'Browser Game']
  },
  { 
    id: 'ai', 
    name: 'IA / ML', 
    icon: Bot, 
    description: 'Applications d\'intelligence artificielle',
    frameworks: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Hugging Face', 'LangChain'],
    formats: ['Chatbot', 'Image Recognition', 'NLP', 'Computer Vision', 'Recommendation System']
  },
  { 
    id: 'widget', 
    name: 'Widget', 
    icon: Package, 
    description: 'Widgets, composants réutilisables',
    frameworks: ['React', 'Vue', 'Web Components', 'Svelte', 'Lit', 'Stencil'],
    formats: ['Web Component', 'React Component', 'Vue Component', 'Embeddable Widget']
  },
  { 
    id: 'cms', 
    name: 'CMS / Blog', 
    icon: FileText, 
    description: 'Systèmes de gestion de contenu',
    frameworks: ['Strapi', 'Gatsby', 'Next.js', 'WordPress', 'Ghost', 'Sanity'],
    formats: ['Headless CMS', 'Blog', 'Static Site', 'Content Portal']
  },
  { 
    id: 'ecommerce', 
    name: 'E-commerce', 
    icon: Zap, 
    description: 'Boutiques en ligne, marketplaces',
    frameworks: ['Shopify', 'WooCommerce', 'Magento', 'Next.js Commerce', 'Medusa', 'Saleor'],
    formats: ['Online Store', 'Marketplace', 'B2B Portal', 'Subscription Service']
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio', 
    icon: Palette, 
    description: 'Portfolios créatifs, sites vitrine',
    frameworks: ['React', 'Gatsby', 'Next.js', 'Nuxt', 'Gridsome', 'Astro'],
    formats: ['Personal Portfolio', 'Creative Portfolio', 'Agency Website', 'Artist Showcase']
  },
  { 
    id: 'tool', 
    name: 'Outil / Utilitaire', 
    icon: Wrench, 
    description: 'Outils de productivité, calculateurs',
    frameworks: ['React', 'Vue', 'Svelte', 'Vanilla JS', 'Python', 'Rust'],
    formats: ['Web Tool', 'CLI Tool', 'Desktop Utility', 'Browser Extension']
  }
];

const exportFormats = [
  { id: 'zip', name: 'ZIP Archive', description: 'Archive complète du projet' },
  { id: 'github', name: 'GitHub Repository', description: 'Export vers GitHub' },
  { id: 'docker', name: 'Docker Container', description: 'Image Docker prête à déployer' },
  { id: 'vercel', name: 'Vercel Deployment', description: 'Déploiement Vercel' },
  { id: 'netlify', name: 'Netlify Site', description: 'Déploiement Netlify' },
  { id: 'firebase', name: 'Firebase Project', description: 'Projet Firebase' },
  { id: 'electron', name: 'Electron App', description: 'Application Electron' },
  { id: 'pwa', name: 'PWA Package', description: 'Progressive Web App' }
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState<typeof projectTypes[0] | null>(null);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedExportFormats, setSelectedExportFormats] = useState<string[]>(['zip']);
  const [useAIGeneration, setUseAIGeneration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Utiliser le hook useAI directement
  const { createProject } = useAI();

  if (!isOpen) return null;

  const resetForm = () => {
    setStep(1);
    setProjectName('');
    setSelectedType(null);
    setSelectedFramework('');
    setSelectedFormat('');
    setSelectedTechs([]);
    setSelectedExportFormats(['zip']);
    setUseAIGeneration(false);
    setAiPrompt('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!selectedType || !projectName.trim()) {
      setError('Informations projet incomplètes');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await projectService.createProject({
        name: projectName,
        type: selectedType.id as any,
        framework: selectedFramework,
        format: selectedFormat,
        technologies: selectedTechs,
        exportFormats: selectedExportFormats,
        useAI: useAIGeneration,
        aiPrompt
      });

      if (!result.success) {
        throw new Error(result.error || 'Erreur création projet');
      }

      if (useAIGeneration && aiPrompt.trim()) {
        try {
          const result = await createProject({
            name: projectName,
            type: selectedType.id,
            features: aiPrompt.split(',').map(f => f.trim()),
            description: `Projet ${selectedType.name} avec IA`
          });

          // Traiter le résultat de l'IA
          const newProject: Project = {
            id: Date.now().toString(),
            name: projectName,
            type: selectedType.id as any,
            description: result.data?.content || `${selectedType.description} amélioré par IA`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            components: []
          };

          onProjectCreated(newProject);
        } catch (aiError) {
          console.error('Erreur lors de la création avec IA:', aiError);
          // Continuer avec la création normale en cas d'erreur IA
          const newProject: Project = {
            id: Date.now().toString(),
            name: projectName,
            type: selectedType.id as any,
            description: selectedType.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            components: []
          };

          onProjectCreated(newProject);
        }
      }

      if (result.project) {
        onProjectCreated(result.project);
      }

      handleClose();
    } catch (error) {
      setError(`Erreur: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Nouveau Projet</h2>
              <p className="text-sm text-gray-500">Étape {step} sur 4</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Type de projet */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Mon projet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de projet *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {projectTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedType?.id === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className={`h-6 w-6 mb-2 ${
                          selectedType?.id === type.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Framework et Format */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Framework *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedType.frameworks.map((framework) => (
                    <button
                      key={framework}
                      onClick={() => setSelectedFramework(framework)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedFramework === framework
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {framework}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Format du projet *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedType.formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedFormat === format
                          ? 'bg-green-500 text-white border-green-500'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Export et Technologies */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formats d'export
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => {
                        setSelectedExportFormats(prev => 
                          prev.includes(format.id) 
                            ? prev.filter(f => f !== format.id)
                            : [...prev, format.id]
                        );
                      }}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedExportFormats.includes(format.id)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs mt-1 opacity-70">{format.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: IA et finalisation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="use-ai"
                  checked={useAIGeneration}
                  onChange={(e) => setUseAIGeneration(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="use-ai" className="font-medium text-gray-900 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    Génération IA avancée
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    L'IA générera du code personnalisé et optimisé
                  </p>
                </div>
              </div>

              {useAIGeneration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Décrivez votre projet
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: une application de gestion de tâches avec authentification, notifications temps réel, interface moderne..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Récapitulatif</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Nom:</strong> {projectName}</div>
                  <div><strong>Type:</strong> {selectedType?.name}</div>
                  <div><strong>Framework:</strong> {selectedFramework}</div>
                  <div><strong>Format:</strong> {selectedFormat}</div>
                  <div><strong>Export:</strong> {selectedExportFormats.join(', ')}</div>
                  <div><strong>IA:</strong> {useAIGeneration ? 'Activée' : 'Désactivée'}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Précédent
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>

              {step < 4 ? (
                <button
                  onClick={() => {
                    if (step === 1 && (!projectName.trim() || !selectedType)) {
                      setError('Veuillez remplir tous les champs requis');
                      return;
                    }
                    if (step === 2 && (!selectedFramework || !selectedFormat)) {
                      setError('Veuillez sélectionner un framework et un format');
                      return;
                    }
                    setError('');
                    setStep(step + 1);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4" />
                      <span>Créer le projet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};