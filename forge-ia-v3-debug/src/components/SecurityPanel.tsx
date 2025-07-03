import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Key, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Settings,
  Users,
  Activity
} from 'lucide-react';

interface SecurityIssue {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  solution: string;
  status: 'open' | 'fixed' | 'ignored';
}

interface SecurityMetrics {
  overallScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastScan: string;
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
  };
}

export function SecurityPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'dependencies' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsScanning(true);
    
    // Simulation de scan de sécurité
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockMetrics: SecurityMetrics = {
      overallScore: 87,
      vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 5
      },
      lastScan: new Date().toISOString(),
      dependencies: {
        total: 45,
        outdated: 8,
        vulnerable: 2
      }
    };

    const mockIssues: SecurityIssue[] = [
      {
        id: '1',
        type: 'high',
        title: 'Clé API exposée dans le code',
        description: 'Une clé API OpenAI est directement codée dans le fichier source',
        file: 'src/services/aiService.ts',
        line: 12,
        solution: 'Déplacer la clé vers les variables d\'environnement',
        status: 'open'
      },
      {
        id: '2',
        type: 'medium',
        title: 'Dépendance vulnérable détectée',
        description: 'La version de react-scripts contient une vulnérabilité connue',
        solution: 'Mettre à jour vers la version 5.0.1 ou supérieure',
        status: 'open'
      },
      {
        id: '3',
        type: 'medium',
        title: 'Headers de sécurité manquants',
        description: 'Les headers X-Frame-Options et CSP ne sont pas configurés',
        solution: 'Configurer les headers de sécurité dans Nginx',
        status: 'open'
      },
      {
        id: '4',
        type: 'low',
        title: 'Console.log en production',
        description: 'Des appels console.log sont présents dans le code de production',
        file: 'src/components/ChatPanel.tsx',
        line: 45,
        solution: 'Supprimer ou conditionner les logs de debug',
        status: 'open'
      }
    ];

    setMetrics(mockMetrics);
    setIssues(mockIssues);
    setIsScanning(false);
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    console.log('Démarrage du scan de sécurité...');
    
    // Simulation du scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await loadSecurityData();
  };

  const fixIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: 'fixed' } : issue
    ));
    console.log('Correction de la vulnérabilité:', issueId);
  };

  const ignoreIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: 'ignored' } : issue
    ));
  };

  const exportSecurityReport = () => {
    const report = {
      metrics,
      issues,
      generatedAt: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        openIssues: issues.filter(i => i.status === 'open').length,
        fixedIssues: issues.filter(i => i.status === 'fixed').length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (type: SecurityIssue['type']) => {
    const colors = {
      critical: 'text-red-400 bg-red-500/20 border-red-500/30',
      high: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      low: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    };
    return colors[type];
  };

  const getSeverityIcon = (type: SecurityIssue['type']) => {
    if (type === 'critical' || type === 'high') return AlertTriangle;
    return Shield;
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Shield },
    { id: 'vulnerabilities', label: 'Vulnérabilités', icon: AlertTriangle },
    { id: 'dependencies', label: 'Dépendances', icon: Activity },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Sécurité & Conformité</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={runSecurityScan}
              disabled={isScanning}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scan en cours...' : 'Scanner'}</span>
            </button>
            <button
              onClick={exportSecurityReport}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Rapport</span>
            </button>
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
        {activeTab === 'overview' && metrics && (
          <div className="p-4">
            {/* Security Score */}
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Score de Sécurité Global</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metrics.overallScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                  metrics.overallScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {metrics.overallScore}/100
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full ${
                    metrics.overallScore >= 90 ? 'bg-emerald-500' :
                    metrics.overallScore >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metrics.overallScore}%` }}
                ></div>
              </div>
              
              <p className="text-gray-400 text-sm">
                Dernière analyse: {new Date(metrics.lastScan).toLocaleString()}
              </p>
            </div>

            {/* Vulnerabilities Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-sm font-medium">Critiques</p>
                    <p className="text-2xl font-bold text-white">{metrics.vulnerabilities.critical}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium">Élevées</p>
                    <p className="text-2xl font-bold text-white">{metrics.vulnerabilities.high}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Moyennes</p>
                    <p className="text-2xl font-bold text-white">{metrics.vulnerabilities.medium}</p>
                  </div>
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Faibles</p>
                    <p className="text-2xl font-bold text-white">{metrics.vulnerabilities.low}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Dependencies Status */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-4">État des Dépendances</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.dependencies.total}</p>
                  <p className="text-gray-400 text-sm">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{metrics.dependencies.outdated}</p>
                  <p className="text-gray-400 text-sm">Obsolètes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{metrics.dependencies.vulnerable}</p>
                  <p className="text-gray-400 text-sm">Vulnérables</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div className="p-4">
            <div className="space-y-4">
              {issues.filter(issue => issue.status === 'open').map((issue) => {
                const SeverityIcon = getSeverityIcon(issue.type);
                return (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <SeverityIcon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium text-white">{issue.title}</h5>
                          <p className="text-gray-300 text-sm mt-1">{issue.description}</p>
                          {issue.file && (
                            <p className="text-gray-400 text-xs mt-2">
                              {issue.file}:{issue.line}
                            </p>
                          )}
                          <div className="mt-3 p-3 bg-gray-700/50 rounded border-l-2 border-blue-500">
                            <p className="text-blue-400 text-sm font-medium">Solution recommandée:</p>
                            <p className="text-gray-300 text-sm mt-1">{issue.solution}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => fixIssue(issue.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
                        >
                          Corriger
                        </button>
                        <button
                          onClick={() => ignoreIssue(issue.id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                        >
                          Ignorer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {issues.filter(issue => issue.status === 'open').length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                  <p className="text-lg font-medium text-emerald-400">Aucune vulnérabilité ouverte</p>
                  <p className="text-sm mt-2">Votre application est sécurisée !</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && (
          <div className="p-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-4">Dépendances Vulnérables</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <div>
                    <p className="text-white font-medium">react-scripts</p>
                    <p className="text-gray-400 text-sm">Version actuelle: 4.0.3 → Recommandée: 5.0.1</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                    Mettre à jour
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <div>
                    <p className="text-white font-medium">lodash</p>
                    <p className="text-gray-400 text-sm">Version actuelle: 4.17.20 → Recommandée: 4.17.21</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="space-y-6">
              {/* API Keys Management */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">Gestion des Clés API</h4>
                  <button
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-sm">{showApiKeys ? 'Masquer' : 'Afficher'}</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <Key className="w-4 h-4 text-blue-400" />
                      <span className="text-white">OpenAI API Key</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {showApiKeys ? 'sk-ant-api03-...' : '••••••••••••••••'}
                      </span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" title="Configurée"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <Key className="w-4 h-4 text-purple-400" />
                      <span className="text-white">Claude API Key</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {showApiKeys ? 'sk-ant-api03-...' : '••••••••••••••••'}
                      </span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" title="Configurée"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-4">Paramètres de Sécurité</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Scan automatique des vulnérabilités</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Alertes de sécurité par email</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Vérification des dépendances</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Mode strict HTTPS</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                </div>
              </div>

              {/* Compliance */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-4">Conformité</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">RGPD</span>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">SOC 2</span>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">ISO 27001</span>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
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