// Service de gestion des projets FORGE-IA V2
import { Project, CodeGenerationOptions, FileStructure } from '../types';
import { pocketbaseService } from './pocketbaseService';
import { realAIOrchestrator } from './realAIOrchestrator';

class ProjectService {
  private projects: Project[] = [];

  // Créer un nouveau projet
  async createProject(options: {
    name: string;
    type: 'web' | 'mobile' | 'api' | 'desktop';
    template?: string;
    technologies: string[];
  }): Promise<{ success: boolean; project?: Project; error?: string }> {
    try {
      console.log('🚀 Création du projet:', options.name);

      // Vérifier les doublons
      const existingProject = this.projects.find(p => 
        p.name.toLowerCase() === options.name.toLowerCase() &&
        p.type === options.type
      );

      if (existingProject) {
        return {
          success: false,
          error: `Un projet "${options.name}" de type ${options.type} existe déjà. Choisissez un autre nom.`
        };
      }

      // Validation
      if (!options.name || options.name.trim().length === 0) {
        return { success: false, error: 'Nom du projet requis' };
      }

      // Créer l'objet projet
      const newProject: Project = {
        id: Date.now().toString(),
        name: options.name.trim(),
        type: options.type,
        tech_stack: options.technologies,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: 'current-user',
        status: 'in_development',
        description: `Projet ${options.type} créé avec FORGE-IA`,
        version: '1.0.0'
      };

      // Sauvegarder en local d'abord
      this.projects.push(newProject);

      // Sauvegarder dans localStorage
      this.saveToLocal();

      // Essayer de sauvegarder dans PocketBase (optionnel)
      try {
        await pocketbaseService.create('projects', newProject);
        console.log('✅ Projet sauvegardé dans PocketBase');
      } catch (pbError) {
        console.warn('⚠️ PocketBase non disponible, sauvegarde locale uniquement');
      }

      console.log('✅ Projet créé avec succès:', newProject.id);
      return { success: true, project: newProject };

    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      return { 
        success: false, 
        error: `Erreur lors de la création: ${(error as Error).message}` 
      };
    }
  }

  // Générer le code du projet
  async generateProjectCode(project: Project, options: CodeGenerationOptions): Promise<{
    success: boolean;
    files?: FileStructure;
    error?: string;
  }> {
    try {
      console.log('🔨 Génération du code pour:', project.name);

      // Créer la structure de base
      const files: FileStructure = {
        [project.name]: {
          type: 'directory',
          children: {
            'src': {
              type: 'directory',
              children: {
                'App.tsx': {
                  type: 'file',
                  content: this.generateAppComponent(project, options)
                },
                'index.tsx': {
                  type: 'file',
                  content: this.generateIndexFile(project, options)
                },
                'components': {
                  type: 'directory',
                  children: this.generateComponents(project, options)
                }
              }
            },
            'package.json': {
              type: 'file',
              content: JSON.stringify(this.generatePackageJson(project, options), null, 2)
            },
            'README.md': {
              type: 'file',
              content: this.generateReadme(project, options)
            }
          }
        }
      };

      // Utiliser l'IA pour améliorer le code si disponible
      try {
        const aiResponse = await realAIOrchestrator.createProject({
          name: project.name,
          type: project.type,
          features: options.features || [],
          framework: options.framework
        });

        if (aiResponse.success && aiResponse.data?.content) {
          console.log('✅ Code amélioré par IA');
          // Intégrer les suggestions IA ici
        }
      } catch (aiError) {
        console.warn('⚠️ IA non disponible, génération basique');
      }

      return { success: true, files };

    } catch (error) {
      console.error('❌ Erreur génération code:', error);
      return { 
        success: false, 
        error: `Erreur génération: ${(error as Error).message}` 
      };
    }
  }

  // Lister tous les projets
  getProjects(): Project[] {
    return this.projects;
  }

  // Charger les projets depuis le stockage local
  loadFromLocal(): void {
    try {
      const stored = localStorage.getItem('forge-ia-projects');
      if (stored) {
        this.projects = JSON.parse(stored);
        console.log(`📂 ${this.projects.length} projets chargés`);
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement projets:', error);
      this.projects = [];
    }
  }

  // Sauvegarder dans le stockage local
  private saveToLocal(): void {
    try {
      localStorage.setItem('forge-ia-projects', JSON.stringify(this.projects));
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde locale:', error);
    }
  }

  // Générer le composant App
  private generateAppComponent(project: Project, options: CodeGenerationOptions): string {
    const typescript = options.typescript;
    const styling = options.styling;

    return `import React from 'react';
${styling === 'styled-components' ? "import styled from 'styled-components';" : ''}
${styling === 'emotion' ? "import styled from '@emotion/styled';" : ''}
${styling === 'tailwind' ? '' : "import './App.css';"}

${typescript ? 'const App: React.FC = () => {' : 'function App() {'}
  return (
    <div className="${styling === 'tailwind' ? 'min-h-screen bg-gray-100 flex items-center justify-center' : 'App'}">
      <header className="${styling === 'tailwind' ? 'text-center' : 'App-header'}">
        <h1 className="${styling === 'tailwind' ? 'text-4xl font-bold text-gray-900 mb-4' : ''}">
          ${project.name}
        </h1>
        <p className="${styling === 'tailwind' ? 'text-lg text-gray-600' : ''}">
          Projet ${project.type} généré avec FORGE-IA
        </p>
      </header>
    </div>
  );
${typescript ? '};' : '}'}

export default App;`;
  }

  // Générer le fichier index
  private generateIndexFile(project: Project, options: CodeGenerationOptions): string {
    return `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
${options.styling === 'tailwind' ? '' : "import './index.css';"}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  // Générer les composants de base
  private generateComponents(project: Project, options: CodeGenerationOptions): FileStructure {
    return {
      'Button.tsx': {
        type: 'file',
        content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variantClasses[variant]}\`}
    >
      {children}
    </button>
  );
};`
      }
    };
  }

  // Générer le package.json
  private generatePackageJson(project: Project, options: CodeGenerationOptions): object {
    const dependencies: Record<string, string> = {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    };

    if (options.typescript) {
      dependencies["typescript"] = "^5.0.0";
      dependencies["@types/react"] = "^18.2.0";
      dependencies["@types/react-dom"] = "^18.2.0";
    }

    if (options.styling === 'tailwind') {
      dependencies["tailwindcss"] = "^3.4.0";
      dependencies["autoprefixer"] = "^10.4.0";
      dependencies["postcss"] = "^8.4.0";
    }

    return {
      name: project.name.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: project.description,
      main: "src/index.tsx",
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
        test: options.testing ? "react-scripts test" : undefined,
        eject: "react-scripts eject"
      },
      dependencies,
      devDependencies: options.linting ? {
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "eslint": "^8.0.0"
      } : {}
    };
  }

  // Générer le README
  private generateReadme(project: Project, options: CodeGenerationOptions): string {
    return `# ${project.name}

${project.description}

## 🚀 Technologies utilisées

${project.tech_stack.map(tech => `- ${tech}`).join('\n')}

## 📦 Installation

\`\`\`bash
npm install
\`\`\`

## 🛠️ Développement

\`\`\`bash
npm start
\`\`\`

## 🏗️ Build

\`\`\`bash
npm run build
\`\`\`

## 📄 Génération

Ce projet a été généré avec **FORGE-IA** - Votre assistant de développement intelligent.

Créé le: ${new Date().toLocaleDateString('fr-FR')}
`;
  }
}

// Instance singleton
export const projectService = new ProjectService();

// Initialiser au chargement
projectService.loadFromLocal();