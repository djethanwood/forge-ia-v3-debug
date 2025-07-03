import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  Clock,
  User,
  FileText,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  hash: string;
  files: string[];
}

interface GitBranchInfo {
  name: string;
  current: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
}

export function GitPanel() {
  const [activeTab, setActiveTab] = useState<'commits' | 'branches' | 'changes' | 'remote'>('commits');
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branches, setBranches] = useState<GitBranchInfo[]>([]);
  const [uncommittedChanges, setUncommittedChanges] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');

  useEffect(() => {
    loadGitData();
  }, []);

  const loadGitData = async () => {
    setIsLoading(true);
    
    // Simulation des données Git
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockCommits: GitCommit[] = [
      {
        id: '1',
        message: 'feat: Ajout du panneau de sécurité avec scan des vulnérabilités',
        author: 'Développeur',
        date: new Date().toISOString(),
        hash: 'a1b2c3d',
        files: ['src/components/SecurityPanel.tsx', 'src/services/securityService.ts']
      },
      {
        id: '2',
        message: 'fix: Correction du drag & drop dans l\'UI Builder',
        author: 'Développeur',
        date: new Date(Date.now() - 3600000).toISOString(),
        hash: 'e4f5g6h',
        files: ['src/components/UIBuilder.tsx', 'src/hooks/useDragAndDrop.ts']
      },
      {
        id: '3',
        message: 'feat: Implémentation de l\'éditeur de code Monaco',
        author: 'Développeur',
        date: new Date(Date.now() - 7200000).toISOString(),
        hash: 'i7j8k9l',
        files: ['src/components/CodeEditor.tsx', 'package.json']
      }
    ];

    const mockBranches: GitBranchInfo[] = [
      { name: 'main', current: true, lastCommit: 'a1b2c3d', ahead: 0, behind: 0 },
      { name: 'feature/ui-builder', current: false, lastCommit: 'e4f5g6h', ahead: 2, behind: 1 },
      { name: 'feature/analytics', current: false, lastCommit: 'i7j8k9l', ahead: 1, behind: 3 }
    ];

    const mockChanges = [
      'src/components/MainCanvas.tsx',
      'src/services/aiService.ts',
      'README.md'
    ];

    setCommits(mockCommits);
    setBranches(mockBranches);
    setUncommittedChanges(mockChanges);
    setRemoteUrl('https://github.com/username/forge-ia.git');
    setIsLoading(false);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert('Veuillez saisir un message de commit');
      return;
    }

    setIsLoading(true);
    
    // Simulation du commit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCommit: GitCommit = {
      id: Date.now().toString(),
      message: commitMessage,
      author: 'Développeur',
      date: new Date().toISOString(),
      hash: Math.random().toString(36).substring(2, 9),
      files: [...uncommittedChanges]
    };

    setCommits(prev => [newCommit, ...prev]);
    setUncommittedChanges([]);
    setCommitMessage('');
    setIsLoading(false);
    
    console.log('Commit créé:', newCommit);
  };

  const handlePush = async () => {
    setIsLoading(true);
    console.log('Push vers le remote...');
    
    // Simulation du push
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Push effectué avec succès !');
  };

  const handlePull = async () => {
    setIsLoading(true);
    console.log('Pull depuis le remote...');
    
    // Simulation du pull
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Pull effectué avec succès !');
  };

  const handleCreateBranch = () => {
    const branchName = prompt('Nom de la nouvelle branche:');
    if (branchName) {
      const newBranch: GitBranchInfo = {
        name: branchName,
        current: false,
        lastCommit: commits[0]?.hash || 'HEAD',
        ahead: 0,
        behind: 0
      };
      setBranches(prev => [...prev, newBranch]);
      console.log('Branche créée:', branchName);
    }
  };

  const handleSwitchBranch = (branchName: string) => {
    setBranches(prev => prev.map(branch => ({
      ...branch,
      current: branch.name === branchName
    })));
    console.log('Basculement vers la branche:', branchName);
  };

  const handleMergeBranch = (branchName: string) => {
    if (confirm(`Fusionner la branche "${branchName}" dans la branche actuelle ?`)) {
      console.log('Fusion de la branche:', branchName);
      // Simulation de la fusion
      alert('Fusion effectuée avec succès !');
    }
  };

  const tabs = [
    { id: 'commits', label: 'Commits', icon: GitCommit },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'changes', label: 'Modifications', icon: FileText },
    { id: 'remote', label: 'Remote', icon: Upload }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Contrôle de Version Git</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadGitData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-xs text-emerald-400">Git initialisé</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'commits' && (
          <div className="p-4">
            <div className="space-y-3">
              {commits.map((commit) => (
                <div key={commit.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{commit.message}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{commit.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(commit.date).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitCommit className="w-3 h-3" />
                          <span className="font-mono">{commit.hash}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Fichiers modifiés:</p>
                        <div className="flex flex-wrap gap-1">
                          {commit.files.map((file, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Branches ({branches.length})</span>
              <button
                onClick={handleCreateBranch}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Nouvelle Branche</span>
              </button>
            </div>

            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`p-3 rounded-lg border transition-colors ${
                    branch.current
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GitBranch className={`w-4 h-4 ${branch.current ? 'text-blue-400' : 'text-gray-400'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${branch.current ? 'text-blue-400' : 'text-white'}`}>
                            {branch.name}
                          </span>
                          {branch.current && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                              Actuelle
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Dernier commit: {branch.lastCommit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {branch.ahead > 0 && (
                        <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">
                          +{branch.ahead}
                        </span>
                      )}
                      {branch.behind > 0 && (
                        <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs">
                          -{branch.behind}
                        </span>
                      )}
                      
                      {!branch.current && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleSwitchBranch(branch.name)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                          >
                            Basculer
                          </button>
                          <button
                            onClick={() => handleMergeBranch(branch.name)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          >
                            <GitMerge className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'changes' && (
          <div className="p-4">
            {/* Commit Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-white mb-3">Nouveau Commit</h4>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Message de commit..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-400">
                  {uncommittedChanges.length} fichier(s) modifié(s)
                </span>
                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || uncommittedChanges.length === 0 || isLoading}
                  className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded transition-colors"
                >
                  <GitCommit className="w-3 h-3" />
                  <span>Commit</span>
                </button>
              </div>
            </div>

            {/* Uncommitted Changes */}
            <div className="space-y-2">
              <h4 className="font-medium text-white">Modifications en attente</h4>
              {uncommittedChanges.length > 0 ? (
                uncommittedChanges.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-300">{file}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs">
                        Modifié
                      </span>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <FileText className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p>Aucune modification en attente</p>
                  <p className="text-sm mt-1">Tous les fichiers sont à jour</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'remote' && (
          <div className="p-4">
            <div className="space-y-4">
              {/* Remote URL */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Repository Remote</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="URL du repository distant"
                  />
                  <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    Configurer
                  </button>
                </div>
              </div>

              {/* Remote Actions */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Actions Remote</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePush}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Push</span>
                  </button>
                  
                  <button
                    onClick={handlePull}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pull</span>
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Statut de Synchronisation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Commits en avance</span>
                    <span className="text-emerald-400">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Commits en retard</span>
                    <span className="text-orange-400">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Dernière synchronisation</span>
                    <span className="text-gray-400">Il y a 2 heures</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}