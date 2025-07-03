import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { realAIOrchestrator } from '../services/realAIOrchestrator';
import { ChatMessage } from '../types';

interface AIModel {
  id: string;
  name: string;
  type: 'conversational' | 'creative' | 'technical';
  maxTokens: number;
}

interface AIResponse {
  success: boolean;
  data?: { content: string };
  model: string;
  error?: string;
  tokensUsed?: number;
}

interface AIContextType {
  // État
  activeModel: AIModel | null;
  models: AIModel[];
  isProcessing: boolean;
  tokensUsed: number;
  chatHistory: ChatMessage[];

  // Actions
  sendMessage: (message: string) => Promise<AIResponse>;
  generateCode: (prompt: string, language: string) => Promise<AIResponse>;
  createProject: (spec: any) => Promise<AIResponse>;
  selectModel: (modelId: string) => void;
  clearChat: () => void;
}

// Modèles IA disponibles
const availableModels: AIModel[] = [
  {
    id: 'auto',
    name: 'Routage Intelligent',
    type: 'conversational',
    maxTokens: 4000
  },
  {
    id: 'claude',
    name: 'Claude (Créatif)',
    type: 'creative',
    maxTokens: 8000
  },
  {
    id: 'codellama',
    name: 'CodeLlama (Technique)',
    type: 'technical',
    maxTokens: 4000
  },
  {
    id: 'openchat',
    name: 'OpenChat (Conversationnel)',
    type: 'conversational',
    maxTokens: 2000
  }
];

const AIContext = createContext<AIContextType | undefined>(undefined);

const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModel, setActiveModel] = useState<AIModel>(availableModels[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(async (message: string): Promise<AIResponse> => {
    setIsProcessing(true);

    try {
      // Ajouter message utilisateur
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date(),
        model: activeModel.name
      };

      setChatHistory(prev => [...prev, userMessage]);

      // Détection automatique du type de tâche
      const taskType = message.toLowerCase().includes('crée') || message.toLowerCase().includes('génère') 
        ? 'creative' 
        : message.toLowerCase().includes('code') || message.toLowerCase().includes('fonction')
        ? 'technical'
        : 'conversational';

      const complexity = message.length > 100 ? 8 : 5;

      const response = await realAIOrchestrator.processTask({
        type: taskType,
        complexity,
        context: message
      });

      // Ajouter réponse IA
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data?.content || 'Désolé, je n\'ai pas pu traiter votre demande.',
        role: 'assistant',
        timestamp: new Date(),
        model: response.model,
        metadata: {
          tokensUsed: response.tokensUsed || 0,
          processingTime: 1000
        }
      };

      setChatHistory(prev => [...prev, aiMessage]);

      if (response.tokensUsed) {
        setTokensUsed(prev => prev + response.tokensUsed!);
      }

      return response;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);

      // Ajouter message d'erreur
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, une erreur technique s\'est produite. Veuillez réessayer.',
        role: 'assistant',
        timestamp: new Date(),
        model: 'Système'
      };

      setChatHistory(prev => [...prev, errorMessage]);

      return {
        success: false,
        error: 'Erreur technique',
        model: activeModel.id
      };
    } finally {
      setIsProcessing(false);
    }
  }, [activeModel]);

  const generateCode = useCallback(async (prompt: string, language: string): Promise<AIResponse> => {
    setIsProcessing(true);

    try {
      const response = await realAIOrchestrator.processTask({
        type: 'technical',
        complexity: 8,
        context: `Génère du code ${language} pour: ${prompt}`,
        language
      });

      if (response.tokensUsed) {
        setTokensUsed(prev => prev + response.tokensUsed!);
      }

      return response;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const createProject = useCallback(async (spec: any): Promise<AIResponse> => {
    setIsProcessing(true);

    try {
      const response = await realAIOrchestrator.createProject(spec);

      if (response.tokensUsed) {
        setTokensUsed(prev => prev + response.tokensUsed!);
      }

      return response;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const selectModel = useCallback((modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setActiveModel(model);
      console.log('🤖 Modèle changé:', model.name);
    }
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
    console.log('🧹 Conversation effacée');
  }, []);

  const value: AIContextType = {
    activeModel,
    models: availableModels,
    isProcessing,
    tokensUsed,
    chatHistory,
    sendMessage,
    generateCode,
    createProject,
    selectModel,
    clearChat
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI doit être utilisé dans un AIProvider');
  }
  return context;
};

// Export par défaut
export default AIProvider;
export { useAI, availableModels };