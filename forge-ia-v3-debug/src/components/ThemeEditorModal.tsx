import React, { useState } from 'react';
import { X, Palette, Download, Upload, RotateCcw } from 'lucide-react';

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (theme: any) => void;
}

export function ThemeEditorModal({ isOpen, onClose, onApplyTheme }: ThemeEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');
  const [theme, setTheme] = useState({
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#8B5CF6',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  });

  if (!isOpen) return null;

  const presetThemes = [
    {
      name: 'Default',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6'
      }
    },
    {
      name: 'Dark',
      colors: {
        primary: '#60A5FA',
        secondary: '#34D399',
        accent: '#A78BFA',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB'
      }
    },
    {
      name: 'Sunset',
      colors: {
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#EC4899'
      }
    },
    {
      name: 'Ocean',
      colors: {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#8B5CF6'
      }
    },
    {
      name: 'Forest',
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        accent: '#84CC16'
      }
    }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleTypographyChange = (category: string, key: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [category]: typeof prev.typography[category as keyof typeof prev.typography] === 'object'
          ? { ...prev.typography[category as keyof typeof prev.typography] as any, [key]: value }
          : value
      }
    }));
  };

  const applyPresetTheme = (preset: any) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...preset.colors
      }
    }));
  };

  const generateCSS = () => {
    return `:root {
  /* Colors */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-text: ${theme.colors.text};
  --color-text-secondary: ${theme.colors.textSecondary};
  --color-border: ${theme.colors.border};
  --color-error: ${theme.colors.error};
  --color-warning: ${theme.colors.warning};
  --color-success: ${theme.colors.success};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily};
  --font-size-xs: ${theme.typography.fontSize.xs};
  --font-size-sm: ${theme.typography.fontSize.sm};
  --font-size-base: ${theme.typography.fontSize.base};
  --font-size-lg: ${theme.typography.fontSize.lg};
  --font-size-xl: ${theme.typography.fontSize.xl};
  --font-size-2xl: ${theme.typography.fontSize['2xl']};
  --font-size-3xl: ${theme.typography.fontSize['3xl']};
  
  /* Spacing */
  --spacing-xs: ${theme.spacing.xs};
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};
  --spacing-xl: ${theme.spacing.xl};
  --spacing-2xl: ${theme.spacing['2xl']};
  
  /* Border Radius */
  --radius-sm: ${theme.borderRadius.sm};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  --radius-xl: ${theme.borderRadius.xl};
  
  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
}`;
  };

  const exportTheme = () => {
    const themeData = {
      ...theme,
      css: generateCSS(),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const themeData = JSON.parse(e.target?.result as string);
            setTheme(themeData);
          } catch (error) {
            alert('Erreur lors de l\'import du thème');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'colors', label: 'Couleurs', icon: '🎨' },
    { id: 'typography', label: 'Typographie', icon: '📝' },
    { id: 'spacing', label: 'Espacement', icon: '📏' },
    { id: 'components', label: 'Composants', icon: '🧩' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Editor */}
        <div className="w-2/3 border-r border-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-400" />
              <span>Éditeur de Thème</span>
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={importTheme}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Import</span>
              </button>
              <button
                onClick={exportTheme}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'colors' && (
              <div className="space-y-6">
                {/* Preset Themes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Thèmes Prédéfinis</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {presetThemes.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPresetTheme(preset)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <div className="flex space-x-1 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.colors.primary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.colors.secondary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.colors.accent }}
                          ></div>
                        </div>
                        <p className="text-xs text-white">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Palette de Couleurs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-12 h-10 rounded-lg border border-gray-600 bg-gray-700"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Police de caractères
                  </label>
                  <select
                    value={theme.typography.fontFamily}
                    onChange={(e) => handleTypographyChange('fontFamily', '', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tailles de Police</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.typography.fontSize).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleTypographyChange('fontSize', key, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spacing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Espacement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.spacing).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setTheme(prev => ({
                            ...prev,
                            spacing: { ...prev.spacing, [key]: e.target.value }
                          }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Border Radius</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.borderRadius).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setTheme(prev => ({
                            ...prev,
                            borderRadius: { ...prev.borderRadius, [key]: e.target.value }
                          }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-400">
                  <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Personnalisation des composants</p>
                  <p className="text-sm mt-2">Fonctionnalité en développement</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/3 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h3 className="font-semibold text-white">Aperçu</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: theme.colors.background }}>
            <div className="space-y-4">
              {/* Card Preview */}
              <div 
                className="p-4 rounded-lg shadow-md"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.md
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ 
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontFamily: theme.typography.fontFamily
                  }}
                >
                  Titre de la Carte
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily
                  }}
                >
                  Ceci est un exemple de texte dans votre thème personnalisé.
                </p>
              </div>

              {/* Buttons Preview */}
              <div className="space-y-2">
                <button
                  className="w-full py-2 px-4 rounded-lg font-medium"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#FFFFFF',
                    borderRadius: theme.borderRadius.md,
                    fontFamily: theme.typography.fontFamily
                  }}
                >
                  Bouton Principal
                </button>
                <button
                  className="w-full py-2 px-4 rounded-lg font-medium border"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.primary,
                    borderColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.md,
                    fontFamily: theme.typography.fontFamily
                  }}
                >
                  Bouton Secondaire
                </button>
              </div>

              {/* Color Palette Preview */}
              <div>
                <h4 
                  className="font-medium mb-2"
                  style={{ 
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.base,
                    fontFamily: theme.typography.fontFamily
                  }}
                >
                  Palette de Couleurs
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(theme.colors).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-full h-8 rounded mb-1"
                        style={{ backgroundColor: value }}
                      ></div>
                      <p 
                        className="text-xs"
                        style={{ 
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontFamily
                        }}
                      >
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={() => setTheme({
                  colors: {
                    primary: '#3B82F6',
                    secondary: '#10B981',
                    accent: '#8B5CF6',
                    background: '#F9FAFB',
                    surface: '#FFFFFF',
                    text: '#111827',
                    textSecondary: '#6B7280',
                    border: '#E5E7EB',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    success: '#10B981'
                  },
                  typography: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      base: '1rem',
                      lg: '1.125rem',
                      xl: '1.25rem',
                      '2xl': '1.5rem',
                      '3xl': '1.875rem'
                    },
                    fontWeight: {
                      normal: '400',
                      medium: '500',
                      semibold: '600',
                      bold: '700'
                    }
                  },
                  spacing: {
                    xs: '0.25rem',
                    sm: '0.5rem',
                    md: '1rem',
                    lg: '1.5rem',
                    xl: '2rem',
                    '2xl': '3rem'
                  },
                  borderRadius: {
                    sm: '0.25rem',
                    md: '0.375rem',
                    lg: '0.5rem',
                    xl: '0.75rem'
                  },
                  shadows: {
                    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }
                })}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => {
                  onApplyTheme(theme);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Appliquer le Thème
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}