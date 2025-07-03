import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Eye, Code, Layers, Play, Square } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useCodeEditor } from '../hooks/useCodeEditor';

export function PreviewPanel() {
  const [previewMode, setPreviewMode] = useState<'visual' | 'code' | 'layers'>('visual');
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRunning, setIsRunning] = useState(true);
  const [previewContent, setPreviewContent] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { currentProject } = useProject();
  const { files, getActiveFile } = useCodeEditor();

  const generatePreviewHTML = () => {
    const activeFile = getActiveFile();
    const code = activeFile?.content || currentProject?.code || getDefaultCode();
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${currentProject?.name || 'FORGE IA'}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .preview-container { min-height: 100vh; }
        .error-boundary { 
            padding: 20px; 
            background: #fee; 
            border: 1px solid #fcc; 
            border-radius: 8px; 
            margin: 20px;
            color: #c33;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useEffect, createElement } = React;
        
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            
            componentDidCatch(error, errorInfo) {
                console.error('Preview Error:', error, errorInfo);
            }
            
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', { className: 'error-boundary' }, [
                        React.createElement('h3', { key: 'title' }, 'Erreur de Preview'),
                        React.createElement('p', { key: 'message' }, this.state.error?.message || 'Une erreur est survenue'),
                        React.createElement('button', { 
                            key: 'retry',
                            onClick: () => this.setState({ hasError: false, error: null }),
                            style: { padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }
                        }, 'Réessayer')
                    ]);
                }
                
                return this.props.children;
            }
        }
        
        try {
            ${transformCodeForPreview(code)}
        } catch (error) {
            console.error('Code execution error:', error);
            ReactDOM.render(
                React.createElement(ErrorBoundary, {}, 
                    React.createElement('div', { className: 'error-boundary' }, [
                        React.createElement('h3', { key: 'title' }, 'Erreur de Compilation'),
                        React.createElement('p', { key: 'message' }, error.message),
                        React.createElement('pre', { key: 'stack', style: { fontSize: '12px', overflow: 'auto' } }, error.stack)
                    ])
                ),
                document.getElementById('root')
            );
        }
    </script>
</body>
</html>`;
  };

  const transformCodeForPreview = (code: string) => {
    let transformedCode = code
      .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .replace(/function\s+App\s*\(\s*\)\s*{/, 'function App() {')
      .trim();

    if (!transformedCode.includes('function App')) {
      transformedCode = `
        function App() {
          return React.createElement('div', { 
            className: 'preview-container bg-gradient-to-br from-blue-50 to-emerald-50 p-8' 
          }, [
            React.createElement('div', { 
              key: 'content',
              className: 'max-w-4xl mx-auto text-center' 
            }, [
              React.createElement('h1', { 
                key: 'title',
                className: 'text-4xl font-bold text-gray-800 mb-4' 
              }, '${currentProject?.name || 'FORGE IA'}'),
              React.createElement('p', { 
                key: 'description',
                className: 'text-xl text-gray-600 mb-8' 
              }, 'Votre application est en cours de développement...'),
              React.createElement('div', { 
                key: 'code',
                className: 'bg-white p-6 rounded-lg shadow-md text-left' 
              }, [
                React.createElement('pre', { 
                  key: 'codeblock',
                  className: 'text-sm text-gray-800 overflow-auto' 
                }, \`${transformedCode.replace(/`/g, '\\`')}\`)
              ])
            ])
          ]);
        }
      `;
    }

    return `
      ReactDOM.render(
        React.createElement(ErrorBoundary, {}, 
          React.createElement(App, {})
        ),
        document.getElementById('root')
      );
    `;
  };

  const getDefaultCode = () => {
    return `function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenue dans FORGE IA
        </h1>
        <p className="text-gray-600 mb-6">
          Votre meta-orchestrateur de développement intelligent
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Compteur: {count}</span>
            <button 
              onClick={() => setCount(count + 1)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              +1
            </button>
          </div>
          <button 
            onClick={() => setCount(0)}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}`;
  };

  useEffect(() => {
    if (isRunning) {
      const newContent = generatePreviewHTML();
      setPreviewContent(newContent);
      setLastUpdate(new Date());
      
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.srcdoc = newContent;
      }
    }
  }, [files, currentProject, isRunning, deviceType]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        if (iframeRef.current) {
          const newContent = generatePreviewHTML();
          iframeRef.current.srcdoc = newContent;
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Devices avec tailles corrigées
  const devices = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', scale: 1 },
    { id: 'tablet', icon: Tablet, label: 'Tablet', scale: 0.75 },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', scale: 0.5 },
  ];

  const previewModes = [
    { id: 'visual', icon: Eye, label: 'Visuel' },
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'layers', icon: Layers, label: 'Couches' },
  ];

  const handleRefresh = () => {
    console.log('Actualisation de la prévisualisation');
    const newContent = generatePreviewHTML();
    setPreviewContent(newContent);
    setLastUpdate(new Date());
    
    if (iframeRef.current) {
      iframeRef.current.srcdoc = newContent;
    }
  };

  const handleExternalLink = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(previewContent || generatePreviewHTML());
      newWindow.document.close();
    }
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      handleRefresh();
    }
  };

  const renderCodePreview = () => {
    const activeFile = getActiveFile();
    const code = activeFile?.content || currentProject?.code || getDefaultCode();

    return (
      <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="p-2 border-b border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-400">{activeFile?.name || 'App.tsx'}</span>
          <div className="flex space-x-0.5">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          </div>
        </div>
        <div className="p-2 text-xs font-mono text-gray-300 overflow-auto" style={{ maxHeight: '300px' }}>
          <pre className="whitespace-pre-wrap">
            {code.split('\n').slice(0, 20).map((line, index) => (
              <div key={index} className="hover:bg-gray-800 px-1 py-0.5 rounded">
                <span className="text-gray-500 mr-2 select-none">{(index + 1).toString().padStart(2, ' ')}</span>
                <span dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/import|export|function|const|let|var|return/g, '<span class="text-purple-400">$&</span>')
                    .replace(/React|useState|useEffect/g, '<span class="text-blue-400">$&</span>')
                    .replace(/'[^']*'/g, '<span class="text-yellow-400">$&</span>')
                    .replace(/\/\/.*$/g, '<span class="text-gray-500">$&</span>')
                }} />
              </div>
            ))}
            {code.split('\n').length > 20 && (
              <div className="text-gray-500 text-center py-2">
                ... {code.split('\n').length - 20} lignes supplémentaires
              </div>
            )}
          </pre>
        </div>
      </div>
    );
  };

  const renderLayersView = () => {
    const layers = [
      { name: 'App', level: 0, type: 'component', active: true },
      { name: 'Container', level: 1, type: 'element', active: false },
      { name: 'Header', level: 2, type: 'component', active: false },
      { name: 'Content', level: 2, type: 'component', active: false },
      { name: 'Counter', level: 3, type: 'component', active: true },
      { name: 'Button', level: 4, type: 'element', active: false },
    ];

    return (
      <div className="space-y-1 p-2">
        <div className="text-xs font-medium text-gray-300 mb-2">Arbre des Composants</div>
        
        {layers.map((item, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
              item.active ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-700'
            }`}
            style={{ paddingLeft: `${item.level * 12 + 8}px` }}
            onClick={() => console.log('Sélection du composant:', item.name)}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${
              item.type === 'component' ? 'bg-blue-400' : 'bg-gray-400'
            }`}></div>
            <span className={`${item.active ? 'text-blue-400' : 'text-gray-300'}`}>
              {item.name}
            </span>
            <span className={`text-xs px-1 rounded ${
              item.type === 'component' 
                ? 'bg-blue-900/30 text-blue-400' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {item.type}
            </span>
            {item.active && (
              <div className="ml-auto">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentDevice = devices.find(d => d.id === deviceType);

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header - Compact */}
      <div className="p-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white text-sm">Aperçu Live</h3>
          <div className="flex items-center space-x-1">
            <button 
              onClick={toggleRunning}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                isRunning 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              title={isRunning ? 'Arrêter le preview' : 'Démarrer le preview'}
            >
              {isRunning ? <Square className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isRunning ? 'Stop' : 'Start'}</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button 
              onClick={handleExternalLink}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mode Tabs - Compact */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-0.5 mb-2">
          {previewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  previewMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device Controls - Compact */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-0.5">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => setDeviceType(device.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                  deviceType === device.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">{device.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === 'visual' && (
          <div className="h-full p-2">
            <div className="h-full bg-white rounded-lg overflow-hidden shadow-lg">
              {/* Mini Browser Chrome */}
              <div className="flex items-center space-x-1 p-1.5 bg-gray-100 border-b">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <div className="ml-2 flex-1 bg-white px-2 py-0.5 rounded text-xs text-gray-600">
                  localhost:3000
                </div>
                <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  isRunning ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isRunning ? 'Live' : 'Arrêté'}
                </div>
              </div>

              {/* Preview Iframe - Fixed Container avec scaling correct */}
              <div className="h-full flex items-center justify-center bg-gray-50" style={{ height: 'calc(100% - 32px)' }}>
                {isRunning ? (
                  <div 
                    className="bg-white overflow-hidden border border-gray-200"
                    style={{ 
                      width: deviceType === 'mobile' ? '375px' : deviceType === 'tablet' ? '768px' : '100%',
                      height: deviceType === 'mobile' ? '667px' : deviceType === 'tablet' ? '1024px' : '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      transform: `scale(${currentDevice?.scale || 1})`,
                      transformOrigin: 'center'
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-0"
                      srcDoc={previewContent || generatePreviewHTML()}
                      title="Live Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">Preview arrêté</p>
                      <p className="text-xs mt-1">Cliquez sur "Start" pour voir votre application</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {previewMode === 'code' && (
          <div className="h-full p-2">
            {renderCodePreview()}
          </div>
        )}

        {previewMode === 'layers' && (
          <div className="h-full overflow-y-auto">
            {renderLayersView()}
          </div>
        )}
      </div>

      {/* Preview Footer - Compact */}
      <div className="p-2 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>MAJ: {lastUpdate.toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></div>
            <span>{isRunning ? 'Sync' : 'Arrêté'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}