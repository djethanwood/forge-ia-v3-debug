import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalProjects: number;
  activeUsers: number;
  codeGenerated: number;
  aiInteractions: number;
  performanceScore: number;
  trends: {
    projects: number[];
    users: number[];
    interactions: number[];
  };
  topComponents: Array<{
    name: string;
    usage: number;
    trend: number;
  }>;
  aiModelUsage: Array<{
    model: string;
    requests: number;
    successRate: number;
  }>;
}

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulation de données analytics
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      totalProjects: 127,
      activeUsers: 45,
      codeGenerated: 2847,
      aiInteractions: 1523,
      performanceScore: 94,
      trends: {
        projects: [10, 15, 12, 18, 22, 25, 30, 28, 35, 40, 38, 42, 45, 48],
        users: [5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48],
        interactions: [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375]
      },
      topComponents: [
        { name: 'Button', usage: 245, trend: 12 },
        { name: 'Input', usage: 189, trend: 8 },
        { name: 'Card', usage: 156, trend: -3 },
        { name: 'Modal', usage: 134, trend: 15 },
        { name: 'Table', usage: 98, trend: 5 }
      ],
      aiModelUsage: [
        { model: 'OpenChat', requests: 856, successRate: 97 },
        { model: 'Claude', requests: 423, successRate: 95 },
        { model: 'CodeLlama', requests: 244, successRate: 92 }
      ]
    };
    
    setData(mockData);
    setIsLoading(false);
    setLastUpdate(new Date());
  };

  const exportData = () => {
    if (data) {
      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        timeRange
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forge-ia-analytics-${timeRange}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Analytics & Métriques</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAnalyticsData}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: '90d', label: '90 jours' }
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets Totaux</p>
                <p className="text-2xl font-bold text-white">{data.totalProjects}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-emerald-400">+12%</span>
              <span className="text-gray-500 ml-1">vs période précédente</span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-white">{data.activeUsers}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-emerald-400">+8%</span>
              <span className="text-gray-500 ml-1">vs période précédente</span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Code Généré</p>
                <p className="text-2xl font-bold text-white">{data.codeGenerated.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-emerald-400">+25%</span>
              <span className="text-gray-500 ml-1">lignes de code</span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Score Performance</p>
                <p className="text-2xl font-bold text-white">{data.performanceScore}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-emerald-400">+3%</span>
              <span className="text-gray-500 ml-1">amélioration</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trends Chart */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <LineChart className="w-4 h-4 mr-2" />
              Tendances d'Utilisation
            </h4>
            <div className="h-48 flex items-end space-x-1">
              {data.trends.projects.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${(value / Math.max(...data.trends.projects)) * 100}%` }}
                  title={`Jour ${index + 1}: ${value} projets`}
                ></div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              Projets créés par jour (derniers 14 jours)
            </div>
          </div>

          {/* AI Model Usage */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <PieChart className="w-4 h-4 mr-2" />
              Utilisation des Modèles IA
            </h4>
            <div className="space-y-3">
              {data.aiModelUsage.map((model, index) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];
                const percentage = (model.requests / data.aiModelUsage.reduce((sum, m) => sum + m.requests, 0)) * 100;
                
                return (
                  <div key={model.model}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{model.model}</span>
                      <span className="text-gray-400">{model.requests} req.</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`${colors[index]} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{percentage.toFixed(1)}% du total</span>
                      <span>{model.successRate}% succès</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Components */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Composants les Plus Utilisés
          </h4>
          <div className="space-y-3">
            {data.topComponents.map((component, index) => (
              <div key={component.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-300">{component.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">{component.usage} utilisations</span>
                  <span className={`text-sm ${
                    component.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {component.trend > 0 ? '+' : ''}{component.trend}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-4">Insights & Recommandations</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-blue-400 font-medium text-sm">Performance Excellente</p>
                <p className="text-gray-300 text-sm">
                  Votre score de performance de 94% est excellent. Les utilisateurs créent en moyenne 3.2 projets par session.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
              <div>
                <p className="text-emerald-400 font-medium text-sm">Croissance Utilisateurs</p>
                <p className="text-gray-300 text-sm">
                  +8% d'utilisateurs actifs ce mois. Le composant Modal gagne en popularité (+15%).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="text-orange-400 font-medium text-sm">Optimisation IA</p>
                <p className="text-gray-300 text-sm">
                  Claude a un taux de succès de 95%. Considérez l'augmentation de son utilisation pour les tâches créatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}