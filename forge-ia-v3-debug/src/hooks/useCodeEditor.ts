import { useState, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
  path: string;
  isFolder?: boolean;
  parentId?: string;
  expanded?: boolean;
}

interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  parentId?: string;
  expanded?: boolean;
  children?: FileTreeNode[];
}

export function useCodeEditor() {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: 'src',
      name: 'src',
      content: '',
      language: 'folder',
      modified: false,
      path: 'src',
      isFolder: true,
      expanded: true
    },
    {
      id: 'app-tsx',
      name: 'App.tsx',
      content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to FORGE IA</h1>
        <p className="text-gray-600">Your intelligent development orchestrator is ready!</p>
      </div>
    </div>
  );
}

export default App;`,
      language: 'typescript',
      modified: false,
      path: 'src/App.tsx',
      parentId: 'src'
    },
    {
      id: 'main-tsx',
      name: 'main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
      language: 'typescript',
      modified: false,
      path: 'src/main.tsx',
      parentId: 'src'
    },
    {
      id: 'public',
      name: 'public',
      content: '',
      language: 'folder',
      modified: false,
      path: 'public',
      isFolder: true,
      expanded: false
    },
    {
      id: 'package-json',
      name: 'package.json',
      content: `{
  "name": "forge-ia-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}`,
      language: 'json',
      modified: false,
      path: 'package.json'
    }
  ]);

  const [activeFileId, setActiveFileId] = useState<string>('app-tsx');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const getActiveFile = useCallback(() => {
    return files.find(file => file.id === activeFileId);
  }, [files, activeFileId]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, content, modified: true }
        : file
    ));
  }, []);

  const createFile = useCallback((name: string, content: string = '', language: string = 'typescript') => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      content,
      language,
      modified: false,
      path: name, // TODO: calculate correct path,
      parentId: 'src' // TODO: Handle parent ID
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    return newFile;
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== fileId);
      if (activeFileId === fileId && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });
  }, [activeFileId]);

  const saveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, modified: false }
        : file
    ));
  }, []);

  const formatCode = useCallback(async () => {
    if (editorRef.current) {
      await editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const setEditorRef = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  return {
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
  };
}