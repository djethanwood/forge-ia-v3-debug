import React, { useState } from 'react';
import { X, Download, Github, Code, Zap, FileJson, Archive } from 'lucide-react';
import { exportService } from '../services/exportService';
import { Project, ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  files?: any; // FileStructure from types
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  files
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('zip');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'zip',
    includeAssets: true,
    minify: false,
    includeTests: false,
    includeDocs: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const exportFormats = [
    {
      id: 'zip' as const,
      name: 'ZIP Archive',
      description: 'Télécharger tous les fichiers dans une archive ZIP',
      icon: Archive,
      color: 'blue',
      recommended: true
    },
    {
      id: 'json' as const,
      name: 'JSON Export',
      description: 'Exporter la structure en format JSON',
      icon: FileJson,
      color: 'green',
      recommended: false
    },
    {
      id: 'github' as const,
      name: 'GitHub Repository',
      description: 'Créer un nouveau repository GitHub',
      icon: Github,
      color: 'gray',
      recommended: false
    },
    {
      id: 'codesandbox' as const,
      name: 'CodeSandbox',
      description: 'Ouvrir directement dans CodeSandbox',
      icon: Code,
      color: 'yellow',
      recommended: true
    },
    {
      id: 'stackblitz' as const,
      name: 'StackBlitz',
      description: 'Ouvrir directement dans StackBlitz',
      icon: Zap,
      color: 'purple',
      recommended: false
    }
  ];

  const handleExport = async () => {
    if (!project || !files) {
      setExportStatus('❌ Projet ou fichiers manquants');
      return;
    }

    setIsExporting(true);
    setExportStatus('🚀 Export en cours...');

    try {
      const exportOptions: ExportOptions = {
        ...options,
        format: selectedFormat
      };

      const result = await exportService.exportProject(project, files, exportOptions);

      if (result.success) {
        setExportStatus('✅ Export réussi !');
        setTimeout(() => {
          onClose();
          setExportStatus('');
        }, 2000);
      } else {
        setExportStatus(`❌ ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      setExportStatus(`❌ Erreur: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const updateOptions = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exporter le Projet</h2>
            {project && (
              <p className="text-gray-600 mt-1">{project.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isExporting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Format d'export
            </label>
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormat(format.id);
                      updateOptions('format', format.id);
                    }}
                    disabled={isExporting}
                    className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-6 w-6 mt-0.5 text-${format.color}-600`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{format.name}</span>
                          {format.recommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Recommandé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Options d'export
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeAssets}
                  onChange={(e) => updateOptions('includeAssets', e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Inclure les assets (images, icônes)</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.minify}
                  onChange={(e) => updateOptions('minify', e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Minifier le code</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeTests}
                  onChange={(e) => updateOptions('includeTests', e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Inclure les tests</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeDocs}
                  onChange={(e) => updateOptions('includeDocs', e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Inclure la documentation</span>
              </label>
            </div>
          </div>

          {/* Status */}
          {exportStatus && (
            <div className={`p-4 rounded-lg ${
              exportStatus.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : exportStatus.includes('❌')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {exportStatus}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !project || !files}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Export...' : 'Exporter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
