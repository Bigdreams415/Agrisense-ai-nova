import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHashRouter } from '../../../hooks/useHashRouter';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentRoute } = useHashRouter();

  const pageTitle = currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1).replace("-", " ");

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 glass border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
          <h2 className="text-xl font-semibold gradient-text">{pageTitle}</h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <i className="fas fa-search text-gray-500 mr-2"></i>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none w-40"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Theme Toggle */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleTheme}
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>

          {/* Nova AI Status Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <i className="fas fa-robot text-sm"></i>
            <span className="text-sm font-medium hidden md:inline">Nova AI Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;