import Fuse from 'fuse.js';

export interface SearchableItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
  type: 'component' | 'template' | 'project' | 'tool';
}

class SearchService {
  private fuse: Fuse<SearchableItem>;
  private items: SearchableItem[] = [];

  constructor() {
    this.fuse = new Fuse(this.items, {
      keys: ['name', 'category', 'tags', 'description'],
      threshold: 0.3,
      includeScore: true
    });
    this.initializeSearchData();
  }

  private initializeSearchData() {
    // Données de recherche par défaut
    this.items = [
      // Composants UI
      { id: '1', name: 'Button', category: 'UI Components', tags: ['button', 'interactive', 'form'], type: 'component' },
      { id: '2', name: 'Input', category: 'UI Components', tags: ['input', 'form', 'text'], type: 'component' },
      { id: '3', name: 'Modal', category: 'UI Components', tags: ['modal', 'dialog', 'overlay'], type: 'component' },
      { id: '4', name: 'Card', category: 'UI Components', tags: ['card', 'container', 'layout'], type: 'component' },
      
      // Templates
      { id: '5', name: 'E-commerce Template', category: 'Templates', tags: ['ecommerce', 'shop', 'store'], type: 'template' },
      { id: '6', name: 'Dashboard Template', category: 'Templates', tags: ['dashboard', 'admin', 'analytics'], type: 'template' },
      { id: '7', name: 'Blog Template', category: 'Templates', tags: ['blog', 'content', 'cms'], type: 'template' },
      
      // Outils
      { id: '8', name: 'ESLint', category: 'Tools', tags: ['linting', 'code-quality', 'javascript'], type: 'tool' },
      { id: '9', name: 'Prettier', category: 'Tools', tags: ['formatting', 'code-style'], type: 'tool' },
      { id: '10', name: 'TypeScript', category: 'Tools', tags: ['typescript', 'types', 'compiler'], type: 'tool' },
    ];

    this.updateFuseIndex();
  }

  updateSearchData(newItems: SearchableItem[]) {
    this.items = [...this.items, ...newItems];
    this.updateFuseIndex();
  }

  private updateFuseIndex() {
    this.fuse = new Fuse(this.items, {
      keys: ['name', 'category', 'tags', 'description'],
      threshold: 0.3,
      includeScore: true
    });
  }

  search(query: string): SearchableItem[] {
    if (!query.trim()) {
      return this.items.slice(0, 10); // Retourne les 10 premiers éléments si pas de recherche
    }

    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }

  getItemsByCategory(category: string): SearchableItem[] {
    return this.items.filter(item => item.category === category);
  }

  getItemsByType(type: SearchableItem['type']): SearchableItem[] {
    return this.items.filter(item => item.type === type);
  }
}

export const searchService = new SearchService();