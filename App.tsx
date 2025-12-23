import React, { useState, useEffect } from 'react';
import { GlobalState, ViewState, EncodingRule, NotificationType } from './types';
import Sidebar from './components/Sidebar';
import ParticleBackground from './components/ParticleBackground';
import RuleConfigManager from './views/RuleConfigManager';
import StandardEntryForm from './views/StandardEntryForm';
import ItemDataTable from './views/ItemDataTable';
import Dashboard from './views/Dashboard';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Preset Categories
const INITIAL_CATEGORIES: EncodingRule[] = [
  { id: 'c_stationery', label: '文具', code: '' },
  { id: 'c_electronics', label: '电子产品', code: '' },
  { id: 'c_bottle', label: '水杯', code: '' },
];

// Fixed Locations
const FIXED_LOCATIONS: EncodingRule[] = [
  { id: 'l_spring', label: '春楼', code: '' },
  { id: 'l_summer', label: '夏楼', code: '' },
  { id: 'l_autumn', label: '秋楼', code: '' },
  { id: 'l_winter', label: '冬楼', code: '' },
  { id: 'l_canteen', label: '食堂', code: '' },
  { id: 'l_gym', label: '体育馆', code: '' },
  { id: 'l_playground', label: '操场', code: '' },
  { id: 'l_court', label: '篮球场', code: '' },
];

const App: React.FC = () => {
  // Global State
  const [globalState, setGlobalState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem('smart-campus-state-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      categories: INITIAL_CATEGORIES,
      locations: FIXED_LOCATIONS,
      lostItems: []
    };
  });

  // Default view changed to CONFIG as requested
  const [currentView, setCurrentView] = useState<ViewState>('CONFIG');
  
  // Notification State
  const [notification, setNotification] = useState<{type: NotificationType, message: string} | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('smart-campus-state-v2', JSON.stringify(globalState));
  }, [globalState]);

  // Notification Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
  };

  const renderView = () => {
    const commonProps = {
      state: globalState,
      setState: setGlobalState,
      showNotification
    };

    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard {...commonProps} />;
      case 'CONFIG':
        return <RuleConfigManager {...commonProps} />;
      case 'ENTRY':
        return <StandardEntryForm {...commonProps} />;
      case 'LIST':
        return <ItemDataTable {...commonProps} />;
      default:
        return <RuleConfigManager {...commonProps} />;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'DASHBOARD': return '数据概览';
      case 'CONFIG': return '编码规则配置';
      case 'ENTRY': return '失物录入';
      case 'LIST': return '失物管理列表';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <ParticleBackground />
      
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-white/80 px-8 py-4 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto p-8 z-10 animate-fade-in relative">
          {renderView()}
        </main>
        
        {/* Global Toast Notification */}
        {notification && (
          <div className={`fixed top-24 right-8 z-50 p-4 rounded shadow-xl animate-[slide-in-right_0.3s_ease-out] flex items-center gap-3 max-w-md border-l-4 transition-all ${
            notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-900' :
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
            'bg-blue-50 border-blue-500 text-blue-900'
          }`}>
             <div className={`p-1 rounded-full ${
               notification.type === 'error' ? 'bg-red-100 text-red-600' :
               notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
               'bg-blue-100 text-blue-600'
             }`}>
               {notification.type === 'error' ? <AlertCircle size={20} /> : 
                notification.type === 'success' ? <CheckCircle size={20} /> : 
                <Info size={20} />}
             </div>
             <div>
               <h3 className="font-bold text-sm">
                 {notification.type === 'error' ? '操作无效' : notification.type === 'success' ? '操作成功' : '提示'}
               </h3>
               <p className="text-sm opacity-90 mt-0.5">{notification.message}</p>
             </div>
             <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
               <X size={18} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;