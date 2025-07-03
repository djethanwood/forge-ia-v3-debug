import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainCanvas } from './components/MainCanvas';
import { ChatPanel } from './components/ChatPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { CodeEditor } from './components/CodeEditor';
import { DatabasePanel } from './components/DatabasePanel';
import { UIBuilder } from './components/UIBuilder';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { SecurityPanel } from './components/SecurityPanel';
import { GitPanel } from './components/GitPanel';
import { ProjectProvider } from './contexts/ProjectContext';
import AIProvider from './contexts/AIContext';
import { Project } from './types';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeView, setActiveView] = useState<'canvas' | 'code' | 'ui-builder' | 'database' | 'analytics' | 'security' | 'git' | 'settings'>('canvas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activePanel, setActivePanel] = useState<'chat' | 'tools' | 'preview'>('chat');

  const handleViewChange = (view: string) => {
    console.log(`🎯 Navigation vers: ${view}`);
    setActiveView(view as any);
  };

  const handleProjectCreated = (project: Project) => {
    console.log('✅ Nouveau projet créé:', project.name);
    setCurrentProject(project);
    setActiveView('canvas');
  };

  useEffect(() => {
    const handleViewChangeFromSidebar = (event: CustomEvent) => {
      setActiveView(event.detail.view);

      if (event.detail.view === 'code') {
        setActivePanel('preview');
      } else if (event.detail.view === 'ui-builder') {
        setActivePanel('tools');
      } else {
        setActivePanel('chat');
      }
    };

    const handleToggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };

    window.addEventListener('viewChange', handleViewChangeFromSidebar as EventListener);
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('viewChange', handleViewChangeFromSidebar as EventListener);
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  const renderMainContent = () => {
    switch (activeView) {
      case 'code':
        return <CodeEditor />;
      case 'ui-builder':
        return <UIBuilder />;
      case 'database':
        return <DatabasePanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'git':
        return <GitPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <MainCanvas />;
    }
  };

  const SettingsPanel = () => (
    <div className="flex flex-col h-full bg-gray-900 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Paramètres</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profil */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Profil</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nom</label>
              <input 
                type="text" 
                defaultValue="Développeur"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="dev@forge-ia.com"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Préférences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Mode sombre</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Sauvegarde automatique</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        {/* Clés API */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Clés API</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Claude API Key</label>
              <input 
                type="password" 
                placeholder="sk-ant-..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProjectProvider>
      <AIProvider>
        <ErrorBoundary>
          <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            <Header 
              onExport={() => console.log('Export')}
              onShare={() => console.log('Share')}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <Sidebar 
                activeView={activeView}
                onViewChange={handleViewChange}
                onProjectCreated={handleProjectCreated}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />

              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden min-w-0">
                <div className="flex-1 overflow-hidden">
                  {renderMainContent()}
                </div>

                {/* Right Panel */}
                <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden flex-shrink-0">
                  {/* Panel Tabs */}
                  <div className="flex border-b border-gray-700 bg-gray-900">
                    {[
                      { id: 'chat', label: 'Chat IA', icon: '🤖' },
                      { id: 'tools', label: 'Outils', icon: '🔧' },
                      { id: 'preview', label: 'Preview', icon: '👁️' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActivePanel(tab.id as any)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                          activePanel === tab.id
                            ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-hidden">
                    {activePanel === 'chat' && <ChatPanel />}
                    {activePanel === 'tools' && <ToolsPanel />}
                    {activePanel === 'preview' && <PreviewPanel />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </AIProvider>
    </ProjectProvider>
  );
}

export default App;