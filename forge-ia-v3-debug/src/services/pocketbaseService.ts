// Service PocketBase corrigé pour FORGE-IA V2
import PocketBase from 'pocketbase';

class PocketBaseService {
  private pb: PocketBase;
  private isInitialized = false;
  private connectionStatus = 'disconnected';

  constructor() {
    const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
    console.log('🔧 PocketBase configuré sur:', pbUrl);
    
    this.pb = new PocketBase(pbUrl);
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // Tester la connexion
      await this.pb.health.check();
      this.connectionStatus = 'connected';
      this.isInitialized = true;
      console.log('✅ PocketBase connecté avec succès');
      
      // Tentative d'authentification admin si configuré
      await this.authenticateAdmin();
      
    } catch (error) {
      console.warn('⚠️ PocketBase non disponible, mode démo activé');
      this.connectionStatus = 'demo';
      this.isInitialized = false;
    }
  }

  private async authenticateAdmin() {
    try {
      const adminEmail = import.meta.env.VITE_POCKETBASE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_POCKETBASE_ADMIN_PASSWORD;
      const adminToken = import.meta.env.VITE_PB_ADMIN_TOKEN;

      if (adminToken) {
        // Utiliser le token directement
        this.pb.authStore.save(adminToken, null);
        console.log('🔑 Authentification par token réussie');
      } else if (adminEmail && adminPassword) {
        // Authentification par email/mot de passe
        await this.pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('🔑 Authentification admin réussie');
      }
    } catch (error) {
      console.warn('⚠️ Authentification admin échouée, mode lecture seule');
    }
  }

  // CRUD Operations avec gestion d'erreur robuste
  async create(collection: string, data: Record<string, any>): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('PocketBase non disponible');
      }
      
      const result = await this.pb.collection(collection).create(data);
      console.log(`✅ Créé dans ${collection}:`, result.id);
      return result;
    } catch (error) {
      console.error(`❌ Erreur création ${collection}:`, error);
      
      // Fallback: sauvegarde locale
      const localKey = `pb_${collection}_${Date.now()}`;
      const localData = { ...data, id: localKey, created: new Date().toISOString() };
      localStorage.setItem(localKey, JSON.stringify(localData));
      console.log('💾 Sauvegarde locale effectuée:', localKey);
      
      return localData;
    }
  }

  async read(collection: string, id: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('PocketBase non disponible');
      }
      
      const result = await this.pb.collection(collection).getOne(id);
      return result;
    } catch (error) {
      console.error(`❌ Erreur lecture ${collection}/${id}:`, error);
      
      // Fallback: lecture locale
      const localData = localStorage.getItem(`pb_${collection}_${id}`);
      if (localData) {
        return JSON.parse(localData);
      }
      
      throw error;
    }
  }

  async list(collection: string, options: any = {}): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('PocketBase non disponible');
      }
      
      const result = await this.pb.collection(collection).getList(
        options.page || 1,
        options.perPage || 50,
        options
      );
      
      return {
        items: result.items || [],
        totalItems: result.totalItems || 0,
        totalPages: result.totalPages || 1
      };
    } catch (error) {
      console.error(`❌ Erreur liste ${collection}:`, error);
      
      // Fallback: retourner structure vide mais valide
      return {
        items: [],
        totalItems: 0,
        totalPages: 1
      };
    }
  }

  async update(collection: string, id: string, data: Record<string, any>): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('PocketBase non disponible');
      }
      
      const result = await this.pb.collection(collection).update(id, data);
      console.log(`✅ Mis à jour ${collection}/${id}`);
      return result;
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${collection}/${id}:`, error);
      
      // Fallback: mise à jour locale
      const localKey = `pb_${collection}_${id}`;
      const existing = localStorage.getItem(localKey);
      if (existing) {
        const updated = { ...JSON.parse(existing), ...data, updated: new Date().toISOString() };
        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      }
      
      throw error;
    }
  }

  async delete(collection: string, id: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('PocketBase non disponible');
      }
      
      await this.pb.collection(collection).delete(id);
      console.log(`🗑️ Supprimé ${collection}/${id}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur suppression ${collection}/${id}:`, error);
      
      // Fallback: suppression locale
      localStorage.removeItem(`pb_${collection}_${id}`);
      return true;
    }
  }

  // Méthodes utilitaires
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.isInitialized && this.connectionStatus === 'connected';
  }

  isDemoMode(): boolean {
    return this.connectionStatus === 'demo';
  }

  // Collections spécifiques FORGE-IA
  async getProjects(): Promise<any[]> {
    try {
      const result = await this.list('projects');
      return result.items || [];
    } catch (error) {
      console.warn('📂 Chargement projets depuis localStorage');
      return this.getLocalProjects();
    }
  }

  async saveProject(project: any): Promise<any> {
    try {
      if (project.id) {
        return await this.update('projects', project.id, project);
      } else {
        return await this.create('projects', project);
      }
    } catch (error) {
      console.warn('💾 Sauvegarde projet en local');
      return this.saveLocalProject(project);
    }
  }

  // Fallbacks locaux
  private getLocalProjects(): any[] {
    try {
      const projects = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('pb_projects_')) {
          const project = JSON.parse(localStorage.getItem(key) || '{}');
          projects.push(project);
        }
      }
      return projects;
    } catch (error) {
      console.error('❌ Erreur lecture projets locaux:', error);
      return [];
    }
  }

  private saveLocalProject(project: any): any {
    try {
      const id = project.id || `local_${Date.now()}`;
      const projectData = { ...project, id, saved_locally: true };
      localStorage.setItem(`pb_projects_${id}`, JSON.stringify(projectData));
      return projectData;
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
      throw error;
    }
  }
}

// Instance singleton
export const pocketbaseService = new PocketBaseService();
export default pocketbaseService;
