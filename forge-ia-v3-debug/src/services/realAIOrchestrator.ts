
// Orchestrateur IA intelligent pour FORGE-IA V2
import { AITask } from '../types';

interface AIResponse {
  success: boolean;
  data?: { content: string };
  model: string;
  error?: string;
  tokensUsed?: number;
}

class RealAIOrchestrator {
  private isConfigured: boolean;

  constructor() {
    // Vérifier la configuration des APIs
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
    
    this.isConfigured = !!(claudeKey && claudeKey.startsWith('sk-ant-')) ||
                       !!(openaiKey && openaiKey.startsWith('sk-'));
    
    if (!this.isConfigured) {
      console.warn('⚠️ Mode démo IA - Clés API non configurées');
    }
  }

  public async processTask(task: AITask): Promise<AIResponse> {
    console.log(`🤖 Traitement tâche ${task.type} (complexité: ${task.complexity})`);
    
    if (!this.isConfigured) {
      return this.getDemoResponse(task);
    }

    try {
      // Routage intelligent
      if (task.type === 'creative' || task.complexity >= 8) {
        console.log('→ Claude (Architecte Créatif)');
        return this.callClaude(this.formatPromptForClaude(task));
      }
      
      if (task.type === 'technical' || task.code) {
        console.log('→ CodeLlama (Analyste Technique)');
        return this.callOllama('codellama:13b', this.formatPromptForCodeLlama(task));
      }
      
      console.log('→ OpenChat (Conversationnel)');
      return this.callOllama('openchat:7b', task.context);
    } catch (error) {
      console.error('❌ Erreur API IA:', error);
      return this.getDemoResponse(task);
    }
  }

  private async callClaude(prompt: string): Promise<AIResponse> {
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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { content: data.content[0].text },
      model: 'Claude',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0
    };
  }

  private async callOllama(model: string, prompt: string): Promise<AIResponse> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { content: data.response },
      model: model,
      tokensUsed: data.prompt_eval_count + data.eval_count || 0
    };
  }

  private formatPromptForClaude(task: AITask): string {
    return `En tant qu'architecte créatif de FORGE-IA, ${task.context}

Si la demande concerne la création d'un projet complet, fournis:
1. Architecture recommandée
2. Technologies à utiliser  
3. Structure des fichiers
4. Code des composants principaux
5. Configuration de déploiement

Sois concret et génère du code prêt à l'emploi.`;
  }

  private formatPromptForCodeLlama(task: AITask): string {
    let prompt = `# FORGE-IA Code Generation\n\n`;
    
    if (task.code) {
      prompt += `Analyze and improve this ${task.language || 'JavaScript'} code:\n\`\`\`\n${task.code}\n\`\`\`\n\n`;
    }
    
    prompt += `Task: ${task.context}\n\n`;
    prompt += `Generate clean, production-ready code with:\n`;
    prompt += `- TypeScript types\n`;
    prompt += `- Error handling\n`;
    prompt += `- Documentation\n`;
    prompt += `- Best practices\n\nCode:`;
    
    return prompt;
  }

  private getDemoResponse(task: AITask): AIResponse {
    const responses = {
      creative: `🎨 **[MODE DÉMO]** Voici un exemple de projet ${task.context.includes('web') ? 'Web' : 'général'} :

\`\`\`typescript
// Composant React principal
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Projet FORGE-IA
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Bienvenue !</h2>
          <p className="text-gray-600">
            Votre projet a été généré avec succès par FORGE-IA.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
\`\`\`

**Technologies recommandées :**
- React + TypeScript
- Tailwind CSS
- Vite
- ESLint + Prettier

*Pour utiliser les vraies APIs IA, configurez vos clés dans les paramètres.*`,

      technical: `💻 **[MODE DÉMO]** Analyse technique pour: ${task.context}

\`\`\`typescript
// Code optimisé avec bonnes pratiques
interface ${task.context.includes('component') ? 'Component' : 'Module'}Props {
  // Props typées
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ${task.context.includes('component') ? 'Component' : 'Module'}: React.FC<${task.context.includes('component') ? 'Component' : 'Module'}Props> = ({
  title,
  description,
  className = '',
  children
}) => {
  return (
    <div className={\`p-6 bg-white rounded-lg shadow-sm \${className}\`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
};
\`\`\`

**Améliorations suggérées :**
- ✅ TypeScript pour la sécurité des types
- ✅ Props optionnelles avec valeurs par défaut
- ✅ Classes CSS modulaires
- ✅ Accessibilité intégrée

*Configuration des APIs IA requise pour analyse complète.*`,

      conversational: `💬 **[MODE DÉMO]** Je comprends votre demande : "${task.context}"

En tant qu'assistant FORGE-IA, je peux vous aider avec :

🎯 **Création de projets**
- Applications web (React, Vue, Svelte)
- APIs REST et GraphQL
- Applications mobiles

🔧 **Développement**
- Génération de composants
- Analyse de code
- Debugging et optimisation

📦 **Déploiement**
- Configuration CI/CD
- Docker et conteneurisation
- Hébergement cloud

**Pour une assistance complète, configurez vos clés API dans les paramètres.**

Que souhaitez-vous créer aujourd'hui ?`
    };

    return {
      success: true,
      data: { 
        content: responses[task.type] || responses.conversational 
      },
      model: 'Démo',
      tokensUsed: Math.floor(Math.random() * 100) + 50
    };
  }

  // Méthodes spécialisées FORGE-IA
  public async createProject(spec: {
    name: string;
    type: string;
    features: string[];
    framework: string;
  }): Promise<AIResponse> {
    const prompt = `Crée un projet ${spec.type} complet nommé "${spec.name}" avec ${spec.framework}.

Fonctionnalités requises: ${spec.features.join(', ')}

Génère:
1. Structure complète des fichiers
2. Package.json avec toutes les dépendances
3. Code source principal
4. Configuration (Vite, TypeScript, etc.)
5. README avec instructions d'installation

Format de réponse: Code prêt à copier-coller avec structure de dossiers claire.`;

    return this.processTask({
      type: 'creative',
      complexity: 10,
      context: prompt
    });
  }

  public async analyzeAndImprove(code: string, language: string): Promise<AIResponse> {
    return this.processTask({
      type: 'technical',
      complexity: 7,
      context: `Analyse ce code et améliore-le avec les meilleures pratiques`,
      code,
      language
    });
  }
}

export const realAIOrchestrator = new RealAIOrchestrator();
