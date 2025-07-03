// Service d'export corrigé pour FORGE-IA V2
import { Project, ExportOptions, FileStructure } from '../types';

// Fallback si JSZip et file-saver ne sont pas disponibles
const downloadFile = (content: string | Blob, filename: string, type: string = 'text/plain') => {
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    throw new Error('Impossible de télécharger le fichier');
  }
};

class ExportService {
  
  // Export principal - supporte tous les formats
  async exportProject(
    project: Project, 
    files: FileStructure, 
    options: ExportOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📦 Export ${project.name} en format ${options.format}`);

      switch (options.format) {
        case 'json':
          return await this.exportAsJSON(project, files);
        case 'zip':
          return await this.exportAsZip(project, files, options);
        case 'github':
          return await this.exportToGitHub(project, files);
        case 'codesandbox':
          return await this.exportToCodeSandbox(project, files);
        case 'stackblitz':
          return await this.exportToStackBlitz(project, files);
        default:
          throw new Error(`Format d'export non supporté: ${options.format}`);
      }
    } catch (error) {
      console.error('❌ Erreur export:', error);
      return { 
        success: false, 
        error: `Erreur export: ${(error as Error).message}` 
      };
    }
  }

  // Export JSON simple et robuste
  private async exportAsJSON(
    project: Project, 
    files: FileStructure
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const exportData = {
        project: {
          id: project.id,
          name: project.name,
          type: project.type,
          tech_stack: project.tech_stack,
          created_at: project.created_at,
          description: project.description || `Projet ${project.type} créé avec FORGE-IA`
        },
        files: files || {},
        metadata: {
          exported_at: new Date().toISOString(),
          forge_ia_version: '2.0.0',
          export_format: 'json'
        }
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-export-${Date.now()}.json`;
      
      downloadFile(jsonContent, fileName, 'application/json');

      console.log('✅ Export JSON réussi:', fileName);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur export JSON:', error);
      return { 
        success: false, 
        error: `Erreur JSON: ${(error as Error).message}` 
      };
    }
  }

  // Export ZIP avec fallback
  private async exportAsZip(
    project: Project, 
    files: FileStructure, 
    options: ExportOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Essayer d'utiliser JSZip si disponible
      if (typeof window !== 'undefined' && (window as any).JSZip) {
        const JSZip = (window as any).JSZip;
        const zip = new JSZip();
        
        await this.addFilesToZip(zip, files, '');
        
        const content = await zip.generateAsync({
          type: 'blob',
          compression: options.minify ? 'DEFLATE' : 'STORE'
        });

        const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.zip`;
        downloadFile(content, fileName);

        console.log('✅ Export ZIP réussi:', fileName);
        return { success: true };
      } else {
        // Fallback: créer un fichier texte avec la structure
        const structure = this.generateProjectStructure(project, files);
        const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-structure.txt`;
        
        downloadFile(structure, fileName, 'text/plain');
        
        console.log('✅ Export structure réussi:', fileName);
        return { success: true };
      }

    } catch (error) {
      console.error('❌ Erreur export ZIP:', error);
      return { 
        success: false, 
        error: `Erreur ZIP: ${(error as Error).message}` 
      };
    }
  }

  // Export vers GitHub (script de déploiement)
  private async exportToGitHub(
    project: Project, 
    files: FileStructure
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deployScript = this.generateGitHubDeployScript(project, files);
      const fileName = `deploy-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-to-github.sh`;
      
      downloadFile(deployScript, fileName, 'text/plain');

      console.log('✅ Script GitHub généré:', fileName);
      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: `Erreur GitHub: ${(error as Error).message}` 
      };
    }
  }

  // Export vers CodeSandbox
  private async exportToCodeSandbox(
    project: Project, 
    files: FileStructure
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sandboxData = {
        files: this.convertToSandboxFormat(files),
        template: 'create-react-app-typescript'
      };
      
      const url = `https://codesandbox.io/s/new?file=/src/App.tsx`;
      window.open(url, '_blank');

      console.log('✅ CodeSandbox ouvert');
      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: `Erreur CodeSandbox: ${(error as Error).message}` 
      };
    }
  }

  // Export vers StackBlitz
  private async exportToStackBlitz(
    project: Project, 
    files: FileStructure
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://stackblitz.com/fork/react-ts?title=${encodeURIComponent(project.name)}`;
      window.open(url, '_blank');

      console.log('✅ StackBlitz ouvert');
      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: `Erreur StackBlitz: ${(error as Error).message}` 
      };
    }
  }

  // Utilitaires
  private async addFilesToZip(zip: any, files: FileStructure, basePath: string): Promise<void> {
    for (const [name, file] of Object.entries(files)) {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      
      if (file.type === 'directory' && file.children) {
        await this.addFilesToZip(zip, file.children, fullPath);
      } else if (file.type === 'file' && file.content) {
        zip.file(fullPath, file.content);
      }
    }
  }

  private generateProjectStructure(project: Project, files: FileStructure): string {
    let structure = `# ${project.name}\n\n`;
    structure += `Type: ${project.type}\n`;
    structure += `Technologies: ${project.tech_stack.join(', ')}\n`;
    structure += `Créé: ${project.created_at}\n\n`;
    structure += `## Structure des fichiers:\n\n`;
    
    const flattenStructure = (files: FileStructure, indent: string = ''): string => {
      let result = '';
      for (const [name, file] of Object.entries(files)) {
        result += `${indent}${file.type === 'directory' ? '📁' : '📄'} ${name}\n`;
        if (file.type === 'directory' && file.children) {
          result += flattenStructure(file.children, indent + '  ');
        }
      }
      return result;
    };
    
    structure += flattenStructure(files);
    structure += `\n## Généré par FORGE-IA V2\n`;
    structure += `Export réalisé le: ${new Date().toLocaleString('fr-FR')}\n`;
    
    return structure;
  }

  private generateGitHubDeployScript(project: Project, files: FileStructure): string {
    return `#!/bin/bash
# Script de déploiement GitHub pour ${project.name}
# Généré par FORGE-IA V2

echo "🚀 Déploiement de ${project.name} sur GitHub..."

# Créer le repository
gh repo create ${project.name.replace(/[^a-zA-Z0-9]/g, '-')} --public --description "${project.description || 'Projet généré avec FORGE-IA'}"

# Initialiser Git
git init
git add .
git commit -m "Initial commit - Generated by FORGE-IA V2"

# Ajouter remote et push
git branch -M main
git remote add origin https://github.com/\$USERNAME/${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.git
git push -u origin main

echo "✅ Projet déployé sur GitHub!"
echo "🌐 URL: https://github.com/\$USERNAME/${project.name.replace(/[^a-zA-Z0-9]/g, '-')}"
`;
  }

  private convertToSandboxFormat(files: FileStructure): Record<string, any> {
    const result: Record<string, any> = {};
    this.flattenFiles(files, '', result);
    return result;
  }

  private flattenFiles(files: FileStructure, basePath: string, result: Record<string, any>): void {
    for (const [name, file] of Object.entries(files)) {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      
      if (file.type === 'directory' && file.children) {
        this.flattenFiles(file.children, fullPath, result);
      } else if (file.type === 'file' && file.content) {
        result[fullPath] = {
          content: file.content,
          isBinary: false
        };
      }
    }
  }
}

export const exportService = new ExportService();
