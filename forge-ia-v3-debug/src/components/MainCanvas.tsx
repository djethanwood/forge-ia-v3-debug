import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Maximize2, Smartphone, Tablet, Monitor, Save, Download, Plus, FolderOpen, Edit, Trash2, Copy } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { CreateProjectModal } from './CreateProjectModal';

interface CanvasElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  styles: Record<string, any>;
  selected: boolean;
}

export function MainCanvas() {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { currentProject, createNewProject, openExistingProject, updateProject } = useProject();
  const { registerDropZone, handleDrop, canDrop } = useDragAndDrop();

  useEffect(() => {
    registerDropZone({
      id: 'main-canvas',
      accepts: ['component', 'template'],
      onDrop: (item) => {
        console.log('Élément déposé sur le canvas:', item);
        handleComponentDrop(item);
      }
    });
  }, [registerDropZone]);

  useEffect(() => {
    if (currentProject?.code) {
      setPreviewContent(currentProject.code);
    } else {
      setPreviewContent(getDefaultPreviewContent());
    }
  }, [currentProject]);

  // Devices avec tailles corrigées
  const devices = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '1200px', scale: 1 },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px', scale: 0.8 },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px', scale: 0.6 },
  ];

  const handleComponentDrop = (item: any) => {
    console.log('Ajout du composant:', item.name);
    
    const newElement: CanvasElement = {
      id: `element_${Date.now()}`,
      type: item.name,
      name: item.name,
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      content: getDefaultContent(item.name),
      styles: getDefaultStyles(item.name),
      selected: false
    };

    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    
    if (currentProject) {
      updateProject(currentProject.id, { 
        code: generateCodeFromElements([...canvasElements, newElement])
      });
    }
  };

  const getDefaultContent = (type: string) => {
    const contentMap: Record<string, string> = {
      'Button': 'Nouveau Bouton',
      'Input': '',
      'Card': 'Nouvelle Carte',
      'Modal': 'Nouveau Modal',
      'Text': 'Nouveau Texte'
    };
    return contentMap[type] || 'Nouvel Élément';
  };

  const getDefaultStyles = (type: string) => {
    const styleMap: Record<string, any> = {
      'Button': {
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer'
      },
      'Input': {
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '14px'
      },
      'Card': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      },
      'Text': {
        fontSize: '16px',
        color: '#374151'
      }
    };
    return styleMap[type] || {};
  };

  const generateCodeFromElements = (elements: CanvasElement[]) => {
    const elementsCode = elements.map(el => {
      switch (el.type) {
        case 'Button':
          return `<button style={{position: 'absolute', left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px', ...${JSON.stringify(el.styles)}}}>${el.content}</button>`;
        case 'Input':
          return `<input placeholder="${el.content}" style={{position: 'absolute', left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px', ...${JSON.stringify(el.styles)}}} />`;
        case 'Card':
          return `<div style={{position: 'absolute', left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px', ...${JSON.stringify(el.styles)}}}>${el.content}</div>`;
        default:
          return `<div style={{position: 'absolute', left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px', ...${JSON.stringify(el.styles)}}}>${el.content}</div>`;
      }
    }).join('\n      ');

    return `function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      ${elementsCode}
    </div>
  );
}`;
  };

  const getDefaultPreviewContent = () => {
    return `
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bienvenue dans FORGE IA
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre orchestrateur de développement intelligent est prêt. Commencez à créer des applications extraordinaires avec l'assistance de l'IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onclick="handleCreateNewProject()"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg cursor-pointer"
            >
              Créer Nouveau Projet
            </button>
            <button 
              onclick="handleOpenExistingProject()"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Ouvrir Existant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-2">Orchestration IA</h3>
              <p className="text-sm text-gray-600">Routage intelligent entre modèles IA</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="font-semibold text-gray-800 mb-2">Constructeur Visuel</h3>
              <p className="text-sm text-gray-600">Composants drag & drop</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Aperçu Live</h3>
              <p className="text-sm text-gray-600">Feedback de développement temps réel</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setCanvasElements(prev => prev.map(el => ({
      ...el,
      selected: el.id === elementId
    })));
  };

  const handleElementEdit = (elementId: string) => {
    const element = canvasElements.find(el => el.id === elementId);
    if (element) {
      setEditingElement(elementId);
      setEditValue(element.content);
    }
  };

  const handleElementSave = () => {
    if (editingElement) {
      setCanvasElements(prev => prev.map(el => 
        el.id === editingElement ? { ...el, content: editValue } : el
      ));
      setEditingElement(null);
      setEditValue('');
    }
  };

  const handleElementDelete = (elementId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      setCanvasElements(prev => prev.filter(el => el.id !== elementId));
      if (selectedElement === elementId) {
        setSelectedElement(null);
      }
    }
  };

  const handleElementDuplicate = (elementId: string) => {
    const element = canvasElements.find(el => el.id === elementId);
    if (element) {
      const newElement: CanvasElement = {
        ...element,
        id: `element_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        selected: false
      };
      setCanvasElements(prev => [...prev, newElement]);
    }
  };

  const handleRunToggle = () => {
    setIsRunning(!isRunning);
    console.log(isRunning ? 'Arrêt de l\'application' : 'Démarrage de l\'application');
  };

  const handleRefresh = () => {
    console.log('Actualisation du canvas');
    setCanvasElements([]);
    setSelectedElement(null);
    setPreviewContent(getDefaultPreviewContent());
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = async () => {
    if (currentProject) {
      const code = canvasElements.length > 0 ? generateCodeFromElements(canvasElements) : previewContent;
      await updateProject(currentProject.id, { 
        code,
        updatedAt: new Date().toISOString()
      });
      setLastSaved(new Date());
      console.log('Projet sauvegardé');
    }
  };

  const handleExport = () => {
    if (currentProject) {
      const exportData = {
        project: currentProject,
        elements: canvasElements,
        code: canvasElements.length > 0 ? generateCodeFromElements(canvasElements) : previewContent,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCreateNewProjectClick = () => {
    setShowCreateModal(true);
  };

  const handleOpenExistingProjectClick = () => {
    openExistingProject();
  };

  // Exposer les fonctions globalement pour les boutons dans le HTML
  useEffect(() => {
    (window as any).handleCreateNewProject = handleCreateNewProjectClick;
    (window as any).handleOpenExistingProject = handleOpenExistingProjectClick;
    
    return () => {
      delete (window as any).handleCreateNewProject;
      delete (window as any).handleOpenExistingProject;
    };
  }, []);

  const currentDevice = devices.find(d => d.id === viewMode);

  return (
    <>
      <div className={`flex flex-col h-full bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Device Preview Controls */}
            <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setViewMode(device.id as any)}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === device.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title={device.label}
                  >
                    <Icon className="w-3 h-3" />
                  </button>
                );
              })}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <button className="hover:text-white transition-colors px-1">50%</button>
              <span>|</span>
              <button className="hover:text-white transition-colors px-1">100%</button>
              <span>|</span>
              <button className="hover:text-white transition-colors px-1">150%</button>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateNewProjectClick}
              className="flex items-center space-x-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
              title="Créer un nouveau projet"
            >
              <Plus className="w-3 h-3" />
              <span>Nouveau</span>
            </button>

            <button
              onClick={handleOpenExistingProjectClick}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              title="Ouvrir un projet existant"
            >
              <FolderOpen className="w-3 h-3" />
              <span>Ouvrir</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              title="Sauvegarder"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              title="Exporter"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            
            <button
              onClick={handleRunToggle}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isRunning ? 'Stop' : 'Run'}</span>
            </button>
            
            <button 
              onClick={handleRefresh}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Actualiser"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            
            <button 
              onClick={handleFullscreen}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Canvas Area - Fixed Container */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-800 flex items-center justify-center">
          <div 
            className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative ${
              canDrop('main-canvas') ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            style={{ 
              width: currentDevice?.width || '1200px',
              height: '600px',
              transform: `scale(${currentDevice?.scale || 1})`,
              transformOrigin: 'center'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop('main-canvas');
            }}
          >
            {/* Canvas Content */}
            <div className="h-full flex flex-col relative">
              {/* Mock Browser Chrome */}
              <div className="flex items-center space-x-2 p-2 bg-gray-100 border-b">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white px-2 py-1 rounded text-xs text-gray-600 border">
                    localhost:3000
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isRunning ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isRunning ? 'Live' : 'Stopped'}
                </div>
              </div>

              {/* App Preview Area */}
              <div className="flex-1 relative overflow-hidden bg-gray-50">
                {canvasElements.length > 0 ? (
                  // Render canvas elements
                  canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-pointer transition-all ${
                        element.selected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        ...element.styles
                      }}
                      onClick={() => handleElementClick(element.id)}
                    >
                      {/* Element Content */}
                      {editingElement === element.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleElementSave}
                          onKeyPress={(e) => e.key === 'Enter' && handleElementSave()}
                          className="w-full h-full border-none outline-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          {element.content}
                        </div>
                      )}

                      {/* Element Controls */}
                      {element.selected && (
                        <div className="absolute -top-8 left-0 flex space-x-1 bg-gray-800 rounded px-2 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementEdit(element.id);
                            }}
                            className="text-white hover:text-blue-400 transition-colors"
                            title="Éditer"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementDuplicate(element.id);
                            }}
                            className="text-white hover:text-emerald-400 transition-colors"
                            title="Dupliquer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleElementDelete(element.id);
                            }}
                            className="text-white hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Default welcome content
                  <div 
                    className="h-full"
                    dangerouslySetInnerHTML={{ __html: `<div class="h-full">${previewContent}</div>` }}
                  />
                )}

                {/* Drop Zone Indicator */}
                {canvasElements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-gray-400 bg-white bg-opacity-80 p-4 rounded-lg">
                      <div className="text-2xl mb-2">🎨</div>
                      <p className="text-sm font-medium">Glissez des composants ici</p>
                      <p className="text-xs mt-1">Utilisez le panneau Tools pour ajouter des éléments</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            <span className={isRunning ? 'text-emerald-400' : 'text-gray-400'}>
              {isRunning ? 'Running' : 'Ready'}
            </span>
            <span>•</span>
            <span>React 18.3.1</span>
            <span>•</span>
            <span>TypeScript</span>
            {currentProject && (
              <>
                <span>•</span>
                <span>{currentProject.name}</span>
              </>
            )}
            {lastSaved && (
              <>
                <span>•</span>
                <span className="text-emerald-400">Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span>Elements: {canvasElements.length}</span>
            <span>•</span>
            <span>Selected: {selectedElement ? '1' : '0'}</span>
            <span>•</span>
            <span>Format: {viewMode}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}