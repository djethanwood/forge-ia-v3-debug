import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Settings,
  Users,
  Key,
  Shield,
  Activity
} from 'lucide-react';
import { pocketbaseService } from '../services/pocketbaseService';

interface DatabaseTable {
  id: string;
  name: string;
  schema: any;
  recordCount: number;
  lastModified: string;
}

interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

export function DatabasePanel() {
  const [activeTab, setActiveTab] = useState<'tables' | 'records' | 'users' | 'settings'>('tables');
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [records, setRecords] = useState<DatabaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showCreateRecord, setShowCreateRecord] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadRecords(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    setIsLoading(true);
    try {
      // Simulation des tables (en production, utiliser l'API PocketBase)
      const mockTables: DatabaseTable[] = [
        {
          id: 'projects',
          name: 'projects',
          schema: {
            name: 'text',
            type: 'text',
            tech_stack: 'json',
            status: 'text',
            created: 'datetime',
            updated: 'datetime'
          },
          recordCount: 5,
          lastModified: new Date().toISOString()
        },
        {
          id: 'components',
          name: 'components',
          schema: {
            name: 'text',
            category: 'text',
            code: 'text',
            framework: 'text',
            tags: 'json'
          },
          recordCount: 12,
          lastModified: new Date().toISOString()
        },
        {
          id: 'ai_analyses',
          name: 'ai_analyses',
          schema: {
            project_id: 'relation',
            analysis_type: 'text',
            ai_model: 'text',
            findings: 'json',
            severity: 'text',
            status: 'text'
          },
          recordCount: 8,
          lastModified: new Date().toISOString()
        }
      ];
      setTables(mockTables);
    } catch (error) {
      console.error('Erreur lors du chargement des tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecords = async (tableName: string) => {
    setIsLoading(true);
    try {
      // Simulation des enregistrements
      const mockRecords: DatabaseRecord[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          type: 'web',
          status: 'active',
          created: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Mobile App',
          type: 'mobile',
          status: 'in_development',
          created: new Date().toISOString()
        }
      ];
      setRecords(mockRecords);
    } catch (error) {
      console.error('Erreur lors du chargement des enregistrements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = () => {
    const tableName = prompt('Nom de la nouvelle table:');
    if (tableName) {
      console.log('Création de la table:', tableName);
      // Ici vous ajouteriez la logique de création de table
      setShowCreateTable(false);
    }
  };

  const handleDeleteTable = (tableId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      console.log('Suppression de la table:', tableId);
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
  };

  const handleCreateRecord = () => {
    if (selectedTable) {
      console.log('Création d\'un nouvel enregistrement dans:', selectedTable);
      setShowCreateRecord(true);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      console.log('Suppression de l\'enregistrement:', recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  const handleExportData = () => {
    if (selectedTable && records.length > 0) {
      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTable}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Import de données:', data);
            // Ici vous ajouteriez la logique d'import
          } catch (error) {
            alert('Erreur lors de l\'import des données');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const tabs = [
    { id: 'tables', label: 'Tables', icon: Table },
    { id: 'records', label: 'Données', icon: Database },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'settings', label: 'Configuration', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Base de Données</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400">PocketBase Connecté</span>
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
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tables' && (
          <div className="h-full flex flex-col">
            {/* Tables Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tables ({tables.length})</span>
                <button
                  onClick={handleCreateTable}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nouvelle Table</span>
                </button>
              </div>
            </div>

            {/* Tables List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTable === table.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      }`}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Table className="w-4 h-4 text-blue-400" />
                          <div>
                            <h4 className="font-medium text-white">{table.name}</h4>
                            <p className="text-xs text-gray-400">
                              {table.recordCount} enregistrements
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Édition de la table:', table.id);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTable(table.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="h-full flex flex-col">
            {/* Records Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                  {selectedTable ? `Table: ${selectedTable}` : 'Sélectionnez une table'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleImportData}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Import</span>
                  </button>
                  <button
                    onClick={handleExportData}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleCreateRecord}
                    disabled={!selectedTable}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouveau</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les données..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Records Table */}
            <div className="flex-1 overflow-auto">
              {selectedTable ? (
                <div className="p-4">
                  {filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {Object.keys(filteredRecords[0]).map((key) => (
                              <th key={key} className="text-left p-2 text-gray-400 font-medium">
                                {key}
                              </th>
                            ))}
                            <th className="text-right p-2 text-gray-400 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.map((record) => (
                            <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              {Object.entries(record).map(([key, value]) => (
                                <td key={key} className="p-2 text-gray-300">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              ))}
                              <td className="p-2 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => console.log('Édition:', record.id)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun enregistrement trouvé</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Table className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une table pour voir les données</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Gestion des utilisateurs</p>
              <p className="text-sm mt-2">Fonctionnalité en développement</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Configuration PocketBase</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>URL:</span>
                    <span className="text-white">http://localhost:8090</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="text-white">0.19.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400">Connecté</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                    Sauvegarder la base de données
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                    Restaurer depuis une sauvegarde
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                    Optimiser la base de données
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}