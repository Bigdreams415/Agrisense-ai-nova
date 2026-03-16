import React from 'react';
import { useHashRouter } from '../../hooks/useHashRouter';
import Dashboard from './Dashboard/Dashboard';
import FarmAssistant from './FarmAssistant/FarmAssistant';
import FarmManagement from './FarmManagement/FarmManagement';
import Settings from './Settings/Settings';
import Workspace from './Workspace/Workspace';

const MainContent: React.FC = () => {
  const { currentRoute, navigate } = useHashRouter();

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'farm-assistant':
        return <FarmAssistant />;
      case 'farm-management':
        return <FarmManagement onNavigate={navigate} />;
      case 'settings':
        return <Settings />;
      default:
        return <Workspace />;
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;