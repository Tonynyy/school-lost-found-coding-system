import React from 'react';
import { LayoutDashboard, Settings, PenTool, List, Box } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  // Reordered menu items: Dashboard is now last, Learn is removed
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'CONFIG', label: '规则配置', icon: <Settings size={20} /> },
    { id: 'ENTRY', label: '失物录入', icon: <PenTool size={20} /> },
    { id: 'LIST', label: '物品管理', icon: <List size={20} /> },
    { id: 'DASHBOARD', label: '数据监控大屏', icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <aside className="z-40 hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex shadow-xl">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500 text-white">
          <Box size={20} />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">校园失物招领编码系统</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;