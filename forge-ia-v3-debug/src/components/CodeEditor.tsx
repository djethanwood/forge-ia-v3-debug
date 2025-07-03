import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Maximize2, 
  Minimize2,
  FileText,
  Plus,
  X,
  Search,
  Replace,
  FolderOpen,
  File,
  Folder,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { useCodeEditor } from '../hooks/useCodeEditor';
import { useProject } from '../contexts/ProjectContext';

export function CodeEditor() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, fileId: null as string | null });
  const [fileTree, setFileTree] = useState<any[]>([]);

  const editorRef = useRef<any>(null);
  const { 
    files, 
    activeFileId, 
    setActiveFileId, 
    getActiveFile, 
    updateFileContent, 
    createFile, 
    deleteFile, 
    saveFile,
    formatCode,
    setEditorRef 
  } = useCodeEditor();

  const { currentProject, updateProject } = useProject();

  const activeFile = getActiveFile();

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditorRef(editor);

    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowSearch(true);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      formatCode();
    });
  };

  const handleContentChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.id, value);
    }
  };

  const handleSave = async () => {
    if (activeFile) {
      saveFile(activeFile.id);

      if (currentProject) {
        await updateProject(currentProject.id, {
          code: activeFile.content,
          updatedAt: new Date().toISOString()
        });
      }

      console.log('Fichier sauvegardé:', activeFile.name);
    }
  };

  const handleRun = () => {
    setIsRunning(!isRunning);
    console.log(isRunning ? 'Arrêt du code' : 'Exécution du code');

    if (!isRunning && activeFile) {
      console.log('Code en cours d\'exécution:', activeFile.content);
    }
  };

  const handleCreateFile = () => {
    const fileName = prompt('Nom du nouveau fichier:');
    if (fileName) {
      const extension = fileName.split('.').pop()?.toLowerCase();
      const language = getLanguageFromExtension(extension || '');
      createFile(fileName, '', language);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Nom du nouveau dossier:');
    if (folderName) {
      console.log('Création du dossier:', folderName);
      // Ici vous pourriez implémenter la logique de création de dossier
    }
  };

  const handleRenameFile = (fileId: string, currentName: string) => {
    setEditingFile(fileId);
    setEditFileName(currentName);
  };

  const handleSaveRename = () => {
    if (editingFile && editFileName.trim()) {
      // Ici vous pourriez implémenter la logique de renommage
      console.log('Renommage du fichier:', editingFile, 'vers', editFileName);
      setEditingFile(null);
      setEditFileName('');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length > 1 && confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      deleteFile(fileId);
    }
  };

  const handleDuplicateFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const newName = `${file.name.split('.')[0]}_copy.${file.name.split('.').pop()}`;
      createFile(newName, file.content, file.language);
    }
  };

  const handleExportFile = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.jsx,.tsx,.css,.html,.json,.md';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const extension = file.name.split('.').pop()?.toLowerCase();
          const language = getLanguageFromExtension(extension || '');
          createFile(file.name, content, language);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSearch = () => {
    if (editorRef.current && searchQuery) {
      editorRef.current.getAction('actions.find').run();
    }
  };

  const handleReplace = () => {
    if (editorRef.current && searchQuery && replaceQuery) {
      editorRef.current.getAction('editor.action.startFindReplaceAction').run();
    }
  };

  const getLanguageFromExtension = (extension: string): string => {
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return languageMap[extension] || 'plaintext';
  };

  const buildFileTree = () => {
    // Séparer les dossiers et fichiers
    const folders = files.filter(f => f.isFolder);
    const regularFiles = files.filter(f => !f.isFolder);
    
    // Construire l'arbre
    const tree = folders.map(folder => ({
      ...folder,
      type: 'folder' as const,
      children: regularFiles.filter(f => f.parentId === folder.id)
    }));
    
    // Ajouter les fichiers racine
    const rootFiles = regularFiles.filter(f => !f.parentId);
    
    return [...tree, ...rootFiles.map(f => ({ ...f, type: 'file' as const }))];
  };

  useEffect(() => {
    if (activeFile && editorRef.current) {
      editorRef.current.setValue(activeFile.content);
    }
  }, [activeFile]);

  useEffect(() => {
    setFileTree(buildFileTree());
  }, [files]);

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, fileId: null });
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, fileId: fileId });
  };

  const renderFileTree = (items: any[], level = 0) => {
    return items.map((item, index) => (
      <div key={item.id || index} style={{ paddingLeft: `${level * 16}px` }}>
        <div 
          className={`group flex items-center justify-between p-1 hover:bg-gray-700 rounded cursor-pointer ${
            item.type === 'file' && activeFileId === item.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
          }`}
          onContextMenu={(e) => item.type === 'file' && item.id ? handleContextMenu(e, item.id) : null}
        >
          <div 
            className="flex items-center space-x-2 flex-1"
            onClick={() => {
              if (item.type === 'file' && item.id && !item.isFolder) {
                setActiveFileId(item.id);
              }
            }}
          >
            {item.type === 'folder' || item.isFolder ? (
              <Folder className="w-3 h-3 text-blue-400" />
            ) : (
              <File className="w-3 h-3 text-gray-400" />
            )}
            {editingFile === item.id ? (
              <input
                type="text"
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                className="bg-gray-600 text-white text-xs px-1 py-0.5 rounded flex-1"
                autoFocus
              />
            ) : (
              <span className="text-xs">{item.name}</span>
            )}
            {item.type === 'file' && item.modified && (
              <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
            )}
          </div>

          {/* File Actions */}
          {item.type === 'file' && item.id && !item.isFolder && (
            <div className="hidden group-hover:flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameFile(item.id, item.name);
                }}
                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                title="Renommer"
              >
                <Edit className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateFile(item.id);
                }}
                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                title="Dupliquer"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(item.id);
                }}
                className="p-0.5 text-gray-400 hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
        {item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className={`flex h-full bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* File Tree Sidebar */}
      {showFileTree && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Explorateur</h4>
              <div className="flex space-x-1">
                <button
                  onClick={handleCreateFile}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Nouveau fichier"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Nouveau dossier"
                >
                  <Folder className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowFileTree(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Fermer l'explorateur"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {renderFileTree(fileTree)}
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-3">
            {!showFileTree && (
              <button
                onClick={() => setShowFileTree(true)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Ouvrir l'explorateur"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}

            <h3 className="font-semibold text-white text-sm">Éditeur de Code</h3>

            {/* File Tabs */}
            <div className="flex items-center space-x-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                    activeFileId === file.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <FileText className="w-3 h-3" />
                  <span className="text-xs">{file.name}</span>
                  {file.modified && <div className="w-1 h-1 bg-orange-400 rounded-full"></div>}
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Editor Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Rechercher"
            >
              <Search className="w-3 h-3" />
            </button>

            <button
              onClick={formatCode}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Formater le code"
            >
              <Settings className="w-3 h-3" />
            </button>

            <button
              onClick={handleSave}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Sauvegarder"
            >
              <Save className="w-3 h-3" />
            </button>

            <button
              onClick={handleExportFile}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Exporter"
            >
              <Download className="w-3 h-3" />
            </button>

            <button
              onClick={handleImportFile}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Importer"
            >
              <Upload className="w-3 h-3" />
            </button>

            <button
              onClick={handleRun}
              className={`flex items-center space-x-1 px-2 py-1 rounded font-medium transition-colors text-xs ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isRunning ? 'Stop' : 'Run'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="p-3 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Remplacer par..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleReplace()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Rechercher
              </button>
              <button
                onClick={handleReplace}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
              >
                <Replace className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1">
          {activeFile ? (
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleContentChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
                lineNumbers: 'on',
                minimap: { enabled: true },
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun fichier ouvert</p>
                <button
                  onClick={handleCreateFile}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Créer un fichier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            {activeFile && (
              <>
                <span>{activeFile.language}</span>
                <span>•</span>
                <span>UTF-8</span>
                <span>•</span>
                <span>LF</span>
                {activeFile.modified && (
                  <>
                    <span>•</span>
                    <span className="text-orange-400">Non sauvegardé</span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isRunning && (
              <div className="flex items-center space-x-1 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>En cours d'exécution</span>
              </div>
            )}
            <span>Ligne 1, Col 1</span>
          </div>
        </div>
              {contextMenu.visible && (
        <div
          className="absolute z-50 bg-gray-800 border border-gray-700 rounded shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              if (contextMenu.fileId) {
                handleRenameFile(contextMenu.fileId, files.find(f => f.id === contextMenu.fileId)?.name || '');
                closeContextMenu();
              }
            }}
            className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
          >
            Renommer
          </button>
          <button
            onClick={() => {
              if (contextMenu.fileId) {
                handleDuplicateFile(contextMenu.fileId);
                closeContextMenu();
              }
            }}
            className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
          >
            Dupliquer
          </button>
          <button
            onClick={() => {
              if (contextMenu.fileId) {
                handleDeleteFile(contextMenu.fileId);
                closeContextMenu();
              }
            }}
            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-500 transition-colors text-sm"
          >
            Supprimer
          </button>
        </div>
      )}
      </div>
    </div>
  );
}