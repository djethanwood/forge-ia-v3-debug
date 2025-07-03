import React, { useState } from 'react';
import { 
  FolderPlus, 
  Bot, 
  Wrench, 
  Eye, 
  Settings, 
  Database,
  GitBranch,
  Shield,
  BarChart3,
  Code,
  Palette,
  FileText,
  FolderOpen
} from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';
import { Project } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onProjectCreated?: (project: Project) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange,
  onProjectCreated,
  collapsed = false,
  onToggle
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    { id: 'projects', icon: FolderOpen, label: 'Projets', view: 'canvas' },
    { id: 'code', icon: Code, label: 'Éditeur Code', view: 'code' },
    { id: 'ui-builder', icon: Palette, label: 'UI Builder', view: 'ui-builder' },
    { id: 'database', icon: Database, label: 'Base de données', view: 'database' },
    { id: 'git', icon: GitBranch, label: 'Git & Versions', view: 'git' },
    { id: 'security', icon: Shield, label: 'Sécurité', view: 'security' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', view: 'analytics' }
  ];

  const handleCreateProject = () => {
    console.log('🚀 Sidebar: Ouverture modal création projet');
    setIsCreateModalOpen(true);
  };

  const handleProjectCreated = (project: Project) => {
    console.log('✅ Sidebar: Projet créé -', project.name);
    onProjectCreated?.(project);
    setIsCreateModalOpen(false);
  };

  const handleMenuClick = (item: any) => {
    console.log(`🎯 Sidebar: Navigation vers ${item.label} (${item.view})`);
    onViewChange(item.view);
  };

  if (collapsed) {
    return (
      <>
        {/* Sidebar minimale quand collapsed */}
        <div className="w-16 h-full bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 space-y-2">
          {/* Bouton Nouveau Projet */}
          <button
            onClick={handleCreateProject}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg"
            title="Nouveau Projet"
          >
            <FolderPlus className="h-6 w-6 text-white" />
          </button>

          {/* Séparateur */}
          <div className="w-8 h-px bg-gray-700 my-2"></div>

          {/* Menu items minimaux */}
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.view || activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg' 
                    : 'hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <IconComponent 
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} 
                />
              </button>
            );
          })}
        </div>

        {/* Modal de création de projet */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-80 h-full bg-gray-900 border-r border-gray-700 flex">
        {/* Mini sidebar à gauche avec icônes */}
        <div className="w-16 flex flex-col items-center py-4 space-y-2 border-r border-gray-700">
          {/* Bouton fermer sidebar */}
          <button
            onClick={onToggle}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-200"
            title="Réduire le menu"
          >
            <span className="text-white text-lg">←</span>
          </button>

          {/* Bouton Nouveau Projet */}
          <button
            onClick={handleCreateProject}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg"
            title="Nouveau Projet"
          >
            <FolderPlus className="h-6 w-6 text-white" />
          </button>

          {/* Séparateur */}
          <div className="w-8 h-px bg-gray-700 my-2"></div>

          {/* Menu items */}
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.view || activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg' 
                    : 'hover:bg-gray-800'
                }`}
                title={item.label}
              >
                <IconComponent 
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} 
                />
              </button>
            );
          })}

          {/* Bouton Settings en bas */}
          <div className="flex-1"></div>
          <button
            onClick={() => onViewChange('settings')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeView === 'settings' 
                ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
            title="Paramètres"
          >
            <Settings className={`h-5 w-5 transition-colors ${
              activeView === 'settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`} />
          </button>
        </div>

        {/* Contenu étendu de la sidebar */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">FORGE IA</h2>
            <p className="text-gray-400 text-sm">Assistant de développement intelligent</p>
          </div>

          {/* Navigation étendue */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.view || activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Actions Rapides
            </h3>
            <button
              onClick={handleCreateProject}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
            >
              <FolderPlus className="h-5 w-5" />
              <span>Nouveau Projet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de création de projet */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};
