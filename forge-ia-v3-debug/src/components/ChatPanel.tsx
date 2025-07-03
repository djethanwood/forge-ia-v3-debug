import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Code, FileText, Zap, Settings, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAI } from '../contexts/AIContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'code' | 'component' | 'suggestion';
  model?: string;
  rating?: 'up' | 'down' | null;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant FORGE-IA. Je peux vous aider à créer, optimiser et déboguer votre code. Que souhaitez-vous faire aujourd\'hui ?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      model: 'claude'
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude');
  const [chatMode, setChatMode] = useState<'general' | 'code' | 'debug' | 'optimize'>('general');
  const [taskInProgress, setTaskInProgress] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, generateCode, createProject, isProcessing, chatHistory } = useAI();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Détection intelligente du type de tâche
      let response;

      if (messageText.toLowerCase().includes('crée') || 
          messageText.toLowerCase().includes('génère') ||
          messageText.toLowerCase().includes('nouveau projet')) {
        setTaskInProgress('Création de projet...');

        // Extraire les détails du projet depuis le message
        const projectSpec = {
          name: extractProjectName(messageText) || 'Nouveau Projet',
          type: extractProjectType(messageText) || 'web',
          features: extractFeatures(messageText),
          framework: extractFramework(messageText) || 'React + TypeScript'
        };

        response = await createProject(projectSpec);
      } else if (messageText.toLowerCase().includes('code') ||
                 messageText.toLowerCase().includes('fonction') ||
                 messageText.toLowerCase().includes('composant')) {
        setTaskInProgress('Génération de code...');
        const language = extractLanguage(messageText) || 'typescript';
        response = await generateCode(messageText, language);
      } else {
        setTaskInProgress('Réflexion...');
        response = await sendMessage(messageText);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data?.content || 'Désolé, je n\'ai pas pu traiter votre demande.',
        sender: 'ai',
        timestamp: new Date(),
        type: messageText.includes('code') || messageText.includes('function') ? 'code' : 'text',
        model: selectedModel,
        
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTaskInProgress(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const suggestions = [
    { text: "Créer un composant React", icon: Code },
    { text: "Optimiser ce code", icon: Zap },
    { text: "Déboguer une erreur", icon: FileText },
    { text: "Améliorer l'UI", icon: Sparkles }
  ];

  // Fonctions utilitaires pour l'extraction d'informations
  const extractProjectName = (message: string): string | null => {
    const match = message.match(/(?:nommé|appelé|qui s'appelle)\s+["']?([^"']+)["']?/i);
    return match ? match[1].trim() : null;
  };

  const extractProjectType = (message: string): string => {
    const types = {
      'site web': 'web',
      'application web': 'webapp',
      'app mobile': 'mobile',
      'api': 'api',
      'backend': 'api',
      'jeu': 'game',
      'portfolio': 'portfolio',
      'blog': 'cms',
      'e-commerce': 'ecommerce'
    };

    for (const [keyword, type] of Object.entries(types)) {
      if (message.toLowerCase().includes(keyword)) {
        return type;
      }
    }
    return 'web';
  };

  const extractFeatures = (message: string): string[] => {
    const features = [];
    const keywords = [
      'authentification', 'login', 'utilisateur', 'auth',
      'base de données', 'database', 'db',
      'temps réel', 'websocket', 'live',
      'responsive', 'mobile',
      'api', 'rest', 'graphql',
      'paiement', 'stripe', 'payment'
    ];

    keywords.forEach(keyword => {
      if (message.toLowerCase().includes(keyword)) {
        features.push(keyword);
      }
    });

    return features;
  };

  const extractFramework = (message: string): string => {
    const frameworks = {
      'react': 'React + TypeScript',
      'vue': 'Vue 3',
      'svelte': 'Svelte',
      'angular': 'Angular',
      'next': 'Next.js',
      'nuxt': 'Nuxt'
    };

    for (const [keyword, framework] of Object.entries(frameworks)) {
      if (message.toLowerCase().includes(keyword)) {
        return framework;
      }
    }
    return 'React + TypeScript';
  };

  const extractLanguage = (message: string): string => {
    const languages = ['typescript', 'javascript', 'python', 'java', 'css', 'html'];
    for (const lang of languages) {
      if (message.toLowerCase().includes(lang)) {
        return lang;
      }
    }
    return 'typescript';
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Assistant IA</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
            >
              <option value="openchat">Ollama OpenChat 7B</option>
              <option value="codellama">Code Llama 13B</option>
              <option value="claude">Claude (Améliorations)</option>
            </select>
            <button className="p-1 text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Mode */}
        <div className="flex space-x-1">
          {[
            { id: 'general', label: 'Général', icon: Bot },
            { id: 'code', label: 'Code', icon: Code },
            { id: 'debug', label: 'Debug', icon: FileText },
            { id: 'optimize', label: 'Optimiser', icon: Zap }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setChatMode(mode.id as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-xs transition-colors ${
                chatMode === mode.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <mode.icon className="w-3 h-3" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'ai' && (
                  <Bot className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.type === 'code' ? (
                    <div className="bg-gray-900 rounded p-3 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Code généré</span>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <pre className="text-sm overflow-x-auto">
                        <code>{message.content}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                      {message.model && ` • ${message.model}`}
                    </span>

                    {message.sender === 'ai' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => rateMessage(message.id, 'up')}
                          className={`p-1 rounded ${
                            message.rating === 'up' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => rateMessage(message.id, 'down')}
                          className={`p-1 rounded ${
                            message.rating === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {(isLoading || taskInProgress) && (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">
                {taskInProgress || 'IA réfléchit...'}
              </span>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Suggestions rapides:</div>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setCurrentMessage(suggestion.text)}
                className="flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
              >
                <suggestion.icon className="w-3 h-3" />
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question ou décrivez ce que vous voulez créer..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}