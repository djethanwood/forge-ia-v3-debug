import React, { useState } from 'react';
import { 
  Layout, 
  Type, 
  Image, 
  MousePointer, 
  Square, 
  Circle,
  Menu,
  Table,
  BarChart3,
  Calendar,
  MapPin,
  ShoppingCart,
  User,
  Bell,
  Search,
  Plus,
  Palette,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { ComponentGeneratorModal } from './ComponentGeneratorModal';
import { ThemeEditorModal } from './ThemeEditorModal';

export function ToolsPanel() {
  const [activeCategory, setActiveCategory] = useState('ui');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { startDrag, endDrag } = useDragAndDrop();

  const categories = [
    { id: 'ui', label: 'Composants UI', icon: Layout },
    { id: 'layout', label: 'Layout', icon: Square },
    { id: 'data', label: 'Données', icon: BarChart3 },
    { id: 'forms', label: 'Formulaires', icon: Type },
  ];

  const components = {
    ui: [
      { name: 'Button', icon: MousePointer, color: 'bg-blue-500', code: '<button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Button</button>' },
      { name: 'Input', icon: Type, color: 'bg-emerald-500', code: '<input type="text" className="border rounded-lg px-3 py-2" />' },
      { name: 'Modal', icon: Square, color: 'bg-purple-500', code: '<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-6 rounded-lg">Modal</div></div>' },
      { name: 'Dropdown', icon: Menu, color: 'bg-orange-500', code: '<select className="border rounded-lg px-3 py-2"><option>Option 1</option></select>' },
      { name: 'Avatar', icon: User, color: 'bg-pink-500', code: '<div className="w-10 h-10 bg-gray-300 rounded-full"></div>' },
      { name: 'Badge', icon: Bell, color: 'bg-red-500', code: '<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">Badge</span>' },
      { name: 'Search', icon: Search, color: 'bg-indigo-500', code: '<div className="relative"><input type="text" className="pl-10 pr-4 py-2 border rounded-lg" /><Search className="absolute left-3 top-2.5 w-4 h-4" /></div>' },
      { name: 'Card', icon: Square, color: 'bg-teal-500', code: '<div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-semibold">Card Title</h3><p>Card content</p></div>' },
    ],
    layout: [
      { name: 'Container', icon: Square, color: 'bg-gray-500', code: '<div className="container mx-auto px-4">Content</div>' },
      { name: 'Grid', icon: Layout, color: 'bg-blue-500', code: '<div className="grid grid-cols-3 gap-4">Grid items</div>' },
      { name: 'Flex', icon: Layout, color: 'bg-emerald-500', code: '<div className="flex space-x-4">Flex items</div>' },
      { name: 'Stack', icon: Layers, color: 'bg-purple-500', code: '<div className="space-y-4">Stacked items</div>' },
      { name: 'Sidebar', icon: Menu, color: 'bg-orange-500', code: '<div className="flex"><aside className="w-64 bg-gray-100">Sidebar</aside><main className="flex-1">Content</main></div>' },
      { name: 'Header', icon: Layout, color: 'bg-pink-500', code: '<header className="bg-white shadow-sm p-4">Header content</header>' },
      { name: 'Footer', icon: Layout, color: 'bg-red-500', code: '<footer className="bg-gray-800 text-white p-4">Footer content</footer>' },
      { name: 'Section', icon: Square, color: 'bg-indigo-500', code: '<section className="py-12"><div className="container mx-auto">Section content</div></section>' },
    ],
    data: [
      { name: 'Chart', icon: BarChart3, color: 'bg-blue-500', code: '<div className="bg-white p-4 rounded-lg shadow"><div className="h-64 bg-gray-100 rounded flex items-center justify-center">Chart Placeholder</div></div>' },
      { name: 'Table', icon: Table, color: 'bg-emerald-500', code: '<table className="w-full border-collapse border"><thead><tr><th className="border p-2">Header</th></tr></thead><tbody><tr><td className="border p-2">Data</td></tr></tbody></table>' },
      { name: 'List', icon: Menu, color: 'bg-purple-500', code: '<ul className="space-y-2"><li className="p-2 bg-gray-100 rounded">List item</li></ul>' },
      { name: 'Calendar', icon: Calendar, color: 'bg-orange-500', code: '<div className="bg-white p-4 rounded-lg shadow"><div className="grid grid-cols-7 gap-1">Calendar grid</div></div>' },
      { name: 'Map', icon: MapPin, color: 'bg-pink-500', code: '<div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">Map Placeholder</div>' },
      { name: 'Progress', icon: Circle, color: 'bg-red-500', code: '<div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style="width: 45%"></div></div>' },
      { name: 'Stats', icon: BarChart3, color: 'bg-indigo-500', code: '<div className="grid grid-cols-3 gap-4"><div className="bg-white p-4 rounded-lg shadow text-center"><div className="text-2xl font-bold">123</div><div className="text-gray-600">Stat</div></div></div>' },
      { name: 'Timeline', icon: Calendar, color: 'bg-teal-500', code: '<div className="space-y-4"><div className="flex items-center space-x-4"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><div>Timeline item</div></div></div>' },
    ],
    forms: [
      { name: 'Text Input', icon: Type, color: 'bg-blue-500', code: '<input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Enter text" />' },
      { name: 'Textarea', icon: Type, color: 'bg-emerald-500', code: '<textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Enter text"></textarea>' },
      { name: 'Select', icon: Menu, color: 'bg-purple-500', code: '<select className="w-full border rounded-lg px-3 py-2"><option>Choose option</option></select>' },
      { name: 'Checkbox', icon: Square, color: 'bg-orange-500', code: '<label className="flex items-center space-x-2"><input type="checkbox" className="rounded" /><span>Checkbox</span></label>' },
      { name: 'Radio', icon: Circle, color: 'bg-pink-500', code: '<label className="flex items-center space-x-2"><input type="radio" name="radio" /><span>Radio</span></label>' },
      { name: 'Switch', icon: Circle, color: 'bg-red-500', code: '<label className="flex items-center space-x-2"><input type="checkbox" className="sr-only" /><div className="w-10 h-6 bg-gray-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div></div></label>' },
      { name: 'Slider', icon: Type, color: 'bg-indigo-500', code: '<input type="range" className="w-full" min="0" max="100" />' },
      { name: 'Upload', icon: Plus, color: 'bg-teal-500', code: '<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><input type="file" className="hidden" /><div className="text-gray-500">Click to upload</div></div>' },
    ],
  };

  const filteredComponents = components[activeCategory as keyof typeof components].filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    startDrag({
      id: component.name,
      name: component.name,
      type: 'component',
      data: component
    });
  };

  const handleDragEnd = () => {
    endDrag();
  };

  const handleCreateComponent = () => {
    setShowGeneratorModal(true);
  };

  const handleThemeEditor = () => {
    setShowThemeModal(true);
  };

  const handleExportComponents = () => {
    const exportData = {
      components: components[activeCategory as keyof typeof components],
      category: activeCategory,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `components-${activeCategory}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateWithAI = () => {
    setShowGeneratorModal(true);
  };

  const handleComponentGenerated = (component: any) => {
    console.log('Composant généré:', component);
    // Ici vous pourriez ajouter le composant à la bibliothèque
    alert(`Composant "${component.name}" généré avec succès !`);
  };

  const handleThemeApplied = (theme: any) => {
    console.log('Thème appliqué:', theme);
    // Ici vous pourriez appliquer le thème à l'interface
    alert('Thème appliqué avec succès !');
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Tools Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Bibliothèque de Composants</h3>
            <button
              onClick={handleExportComponents}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Exporter les composants"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">Glissez les composants vers le canvas</p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un composant..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeCategory === category.id
                      ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredComponents.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredComponents.map((component, index) => {
                const Icon = component.icon;
                return (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    onDragEnd={handleDragEnd}
                    className="group cursor-grab active:cursor-grabbing bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-colors border border-gray-600 hover:border-gray-500 hover:shadow-lg"
                    title={`Glisser ${component.name} vers le canvas`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 ${component.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-300 text-center">
                        {component.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun composant trouvé</p>
              <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-700">
          <div className="space-y-2">
            <button 
              onClick={handleGenerateWithAI}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Générer avec IA</span>
            </button>
            
            <button 
              onClick={handleCreateComponent}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Composant</span>
            </button>
            
            <button 
              onClick={handleThemeEditor}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm font-medium transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Éditeur de Thème</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400">Suggestions Intelligentes</span>
            </div>
            <p className="text-xs text-gray-400">
              L'IA analyse votre layout pour suggérer des composants optimaux
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ComponentGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={handleComponentGenerated}
      />

      <ThemeEditorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onApplyTheme={handleThemeApplied}
      />
    </>
  );
}