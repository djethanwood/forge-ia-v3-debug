import React, { useState, useRef, useCallback } from 'react';
import { 
  Layers, 
  Move, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
  Grid,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Type,
  Image as ImageIcon,
  Square,
  Circle
} from 'lucide-react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

interface UIElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: Record<string, any>;
  props: Record<string, any>;
  children: UIElement[];
  visible: boolean;
  locked: boolean;
}

export function UIBuilder() {
  const [elements, setElements] = useState<UIElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<UIElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { registerDropZone, handleDrop, canDrop } = useDragAndDrop();

  React.useEffect(() => {
    registerDropZone({
      id: 'ui-builder-canvas',
      accepts: ['component'],
      onDrop: (item) => {
        handleElementDrop(item);
      }
    });
  }, [registerDropZone]);

  const handleElementDrop = useCallback((item: any) => {
    const newElement: UIElement = {
      id: `element_${Date.now()}`,
      type: item.name,
      name: item.name,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      styles: getDefaultStyles(item.name),
      props: getDefaultProps(item.name),
      children: [],
      visible: true,
      locked: false
    };

    setElements(prev => [...prev, newElement]);
    addToHistory([...elements, newElement]);
    setSelectedElement(newElement.id);
  }, [elements]);

  const getDefaultStyles = (type: string): Record<string, any> => {
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

  const getDefaultProps = (type: string): Record<string, any> => {
    const propsMap: Record<string, any> = {
      'Button': { text: 'Button', onClick: 'handleClick' },
      'Input': { placeholder: 'Enter text...', type: 'text' },
      'Card': { title: 'Card Title', content: 'Card content' },
      'Text': { content: 'Text content' }
    };
    return propsMap[type] || {};
  };

  const addToHistory = (newElements: UIElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement: UIElement = {
        ...element,
        id: `element_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(newElement.id);
    }
  };

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const toggleElementVisibility = (elementId: string) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, visible: !el.visible } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const toggleElementLock = (elementId: string) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, locked: !el.locked } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const updateElementStyles = (elementId: string, newStyles: Record<string, any>) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, styles: { ...el.styles, ...newStyles } } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const exportDesign = () => {
    const designData = {
      elements,
      viewMode,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(designData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ui-design.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importDesign = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const designData = JSON.parse(e.target?.result as string);
            setElements(designData.elements || []);
            setViewMode(designData.viewMode || 'desktop');
            addToHistory(designData.elements || []);
          } catch (error) {
            alert('Erreur lors de l\'import du design');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const devices = [
    { id: 'mobile', icon: Smartphone, width: '375px', label: 'Mobile' },
    { id: 'tablet', icon: Tablet, width: '768px', label: 'Tablet' },
    { id: 'desktop', icon: Monitor, width: '100%', label: 'Desktop' }
  ];

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Sidebar - Layers */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white mb-2">Calques</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 rounded transition-colors ${
                showGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Afficher/Masquer la grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              title="Annuler"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              title="Refaire"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {elements.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun élément</p>
              <p className="text-xs mt-1">Glissez des composants ici</p>
            </div>
          ) : (
            <div className="space-y-1">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementVisibility(element.id);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementLock(element.id);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  
                  <span className="flex-1 text-sm truncate">{element.name}</span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElement(element.id);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-4">
            {/* Device Selection */}
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setViewMode(device.id as any)}
                    className={`p-2 rounded transition-colors ${
                      viewMode === device.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={device.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                -
              </button>
              <span className="text-sm text-gray-400 min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={importDesign}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Import</span>
            </button>
            <button
              onClick={exportDesign}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            <button
              onClick={() => console.log('Sauvegarde du design')}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Save className="w-3 h-3" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className={`bg-white shadow-lg relative overflow-hidden ${
                canDrop('ui-builder-canvas') ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
              style={{
                width: devices.find(d => d.id === viewMode)?.width || '100%',
                minHeight: '600px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop('ui-builder-canvas');
              }}
            >
              {/* Grid */}
              {showGrid && (
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 transition-all ${
                    selectedElement === element.id
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  } ${!element.visible ? 'opacity-50' : ''} ${
                    element.locked ? 'pointer-events-none' : 'cursor-move'
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    ...element.styles
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {/* Element Content */}
                  {element.type === 'Button' && (
                    <button className="w-full h-full" style={element.styles}>
                      {element.props.text}
                    </button>
                  )}
                  {element.type === 'Input' && (
                    <input
                      type={element.props.type}
                      placeholder={element.props.placeholder}
                      className="w-full h-full"
                      style={element.styles}
                    />
                  )}
                  {element.type === 'Card' && (
                    <div className="w-full h-full p-4" style={element.styles}>
                      <h3 className="font-semibold mb-2">{element.props.title}</h3>
                      <p>{element.props.content}</p>
                    </div>
                  )}
                  {element.type === 'Text' && (
                    <div className="w-full h-full" style={element.styles}>
                      {element.props.content}
                    </div>
                  )}

                  {/* Selection Handles */}
                  {selectedElement === element.id && !element.locked && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nw-resize"></div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-ne-resize"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-sw-resize"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-se-resize"></div>
                    </>
                  )}
                </div>
              ))}

              {/* Drop Zone Indicator */}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Glissez des composants ici</p>
                    <p className="text-sm mt-2">Utilisez le panneau Tools pour ajouter des éléments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Propriétés</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedElementData ? (
            <div className="space-y-4">
              {/* Element Info */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                <input
                  type="text"
                  value={selectedElementData.name}
                  onChange={(e) => {
                    const newElements = elements.map(el =>
                      el.id === selectedElement ? { ...el, name: e.target.value } : el
                    );
                    setElements(newElements);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                />
              </div>

              {/* Position & Size */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Position & Taille</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X</label>
                    <input
                      type="number"
                      value={selectedElementData.x}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === selectedElement ? { ...el, x: parseInt(e.target.value) } : el
                        );
                        setElements(newElements);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedElementData.y}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === selectedElement ? { ...el, y: parseInt(e.target.value) } : el
                        );
                        setElements(newElements);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Largeur</label>
                    <input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === selectedElement ? { ...el, width: parseInt(e.target.value) } : el
                        );
                        setElements(newElements);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hauteur</label>
                    <input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === selectedElement ? { ...el, height: parseInt(e.target.value) } : el
                        );
                        setElements(newElements);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Styles */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Styles</h4>
                <div className="space-y-2">
                  {selectedElementData.styles.backgroundColor && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Couleur de fond</label>
                      <input
                        type="color"
                        value={selectedElementData.styles.backgroundColor}
                        onChange={(e) => updateElementStyles(selectedElement!, { backgroundColor: e.target.value })}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded"
                      />
                    </div>
                  )}
                  {selectedElementData.styles.color && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Couleur du texte</label>
                      <input
                        type="color"
                        value={selectedElementData.styles.color}
                        onChange={(e) => updateElementStyles(selectedElement!, { color: e.target.value })}
                        className="w-full h-8 bg-gray-700 border border-gray-600 rounded"
                      />
                    </div>
                  )}
                  {selectedElementData.styles.fontSize && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Taille de police</label>
                      <input
                        type="text"
                        value={selectedElementData.styles.fontSize}
                        onChange={(e) => updateElementStyles(selectedElement!, { fontSize: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Props */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Propriétés</h4>
                <div className="space-y-2">
                  {Object.entries(selectedElementData.props).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1 capitalize">{key}</label>
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === selectedElement 
                              ? { ...el, props: { ...el.props, [key]: e.target.value } }
                              : el
                          );
                          setElements(newElements);
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sélectionnez un élément</p>
              <p className="text-xs mt-1">pour voir ses propriétés</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}