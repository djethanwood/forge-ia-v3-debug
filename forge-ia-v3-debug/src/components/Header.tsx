import React, { useState, useEffect } from 'react';
import { Zap, Settings, User, Search, Sidebar, Bell } from 'lucide-react';
import { searchService, SearchableItem } from '../services/searchService';
import { useProject } from '../contexts/ProjectContext';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentProject } = useProject();

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchService.search(searchQuery);
      setSearchResults(results.slice(0, 6));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchSelect = (item: SearchableItem) => {
    console.log('Selected:', item);
    setSearchQuery('');
    setShowResults(false);

    if (item.type === 'component') {
      window.dispatchEvent(new CustomEvent('viewChange', { 
        detail: { view: 'canvas', section: 'tools' } 
      }));
    } else if (item.type === 'template') {
      window.dispatchEvent(new CustomEvent('viewChange', { 
        detail: { view: 'canvas', section: 'templates' } 
      }));
    }
  };

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('viewChange', { 
      detail: { view: 'settings' } 
    }));
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    window.dispatchEvent(new CustomEvent('viewChange', { 
      detail: { view: 'settings' } 
    }));
    setShowUserMenu(false);
  };

  const handlePreferencesClick = () => {
    window.dispatchEvent(new CustomEvent('viewChange', { 
      detail: { view: 'settings' } 
    }));
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion...');
      // Ici vous pourriez implémenter la logique de déconnexion
    }
    setShowUserMenu(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 relative flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Logo and Title - Fixed */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Sidebar className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="w-6 h-6 text-blue-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                FORGE IA
              </h1>
              <p className="text-xs text-gray-400 -mt-1">Meta-Orchestrateur</p>
            </div>
          </div>
        </div>

        {/* Current Project Display - Fixed Position */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {currentProject && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-sm text-white font-medium">{currentProject.name}</span>
              <span className="text-xs text-gray-400">({currentProject.type})</span>
            </div>
          )}
        </div>

        {/* Search Bar - Fixed Position and Width */}
        <div className="flex-1 max-w-md mx-6 relative">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
            />

            {/* Search Results - Compact */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchSelect(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm">{item.name}</div>
                        <div className="text-gray-400 text-xs">{item.category}</div>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded text-xs ${
                        item.type === 'component' ? 'bg-blue-900/30 text-blue-400' :
                        item.type === 'template' ? 'bg-emerald-900/30 text-emerald-400' :
                        item.type === 'tool' ? 'bg-orange-900/30 text-orange-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {item.type}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Fixed */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="font-medium text-white text-sm">Notifications</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div className="p-2 hover:bg-gray-700 border-b border-gray-700">
                    <div className="text-xs text-white">Nouveau composant disponible</div>
                    <div className="text-xs text-gray-400 mt-0.5">Il y a 5 minutes</div>
                  </div>
                  <div className="p-2 hover:bg-gray-700">
                    <div className="text-xs text-white">Analyse de sécurité terminée</div>
                    <div className="text-xs text-gray-400 mt-0.5">Il y a 1 heure</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSettingsClick}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative">
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 pl-2 border-l border-gray-700 cursor-pointer"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-white">Dev</span>
            </div>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                <div className="p-1">
                  <button 
                    onClick={handleProfileClick}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-700 rounded"
                  >
                    Profil
                  </button>
                  <button 
                    onClick={handlePreferencesClick}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-700 rounded"
                  >
                    Préférences
                  </button>
                  <hr className="my-1 border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-gray-700 rounded"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}