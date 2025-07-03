class AIService {
  private isConfigured: boolean;

  constructor() {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
    
    // Vérification corrigée : on vérifie que les clés existent ET ne sont pas les valeurs par défaut
    this.isConfigured = !!(claudeKey && claudeKey.startsWith('sk-ant-')) ||
                       !!(openaiKey && openaiKey.startsWith('sk-'));
    
    if (!this.isConfigured) {
      console.warn('⚠️ Clés API IA non configurées - Mode démo activé');
    } else {
      console.log('✅ APIs IA configurées correctement');
    }
  }

  async sendMessage(message: string, selectedModel: string = 'claude'): Promise<string> {
    if (!this.isConfigured) {
      return this.getDemoResponse(message, selectedModel);
    }

    try {
      if (selectedModel === 'claude' && import.meta.env.VITE_CLAUDE_API_KEY?.startsWith('sk-ant-')) {
        return await this.callClaude(message);
      }
      
      if (selectedModel === 'codellama') {
        return await this.callOllama('codellama:13b', message);
      }
      
      if (selectedModel === 'openchat') {
        return await this.callOllama('openchat:7b', message);
      }
      
      return this.getDemoResponse(message, selectedModel);
    } catch (error) {
      console.error('Erreur API IA:', error);
      return 'Erreur lors de la communication avec l\'IA. Utilisation du mode démo.';
    }
  }

  private async callClaude(message: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLAUDE_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callOllama(model: string, message: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private getDemoResponse(message: string, model: string): string {
    return `[MODE DÉMO - ${model.toUpperCase()}] Réponse simulée pour: "${message}". Pour utiliser les vraies APIs, configurez vos clés dans les paramètres.`;
  }

  get configured(): boolean {
    return this.isConfigured;
  }
}

export const aiService = new AIService();
