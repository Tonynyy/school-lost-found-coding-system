import React, { useState } from 'react';
import { ViewProps, LostItemData } from '../types';
import { Search, Filter, QrCode, CheckCircle, Clock, UserCheck, Calendar } from 'lucide-react';
import QRCodeLabel from '../components/QRCodeLabel';

const ItemDataTable: React.FC<ViewProps> = ({ state, setState, showNotification }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // QR Modal State
  const [selectedItem, setSelectedItem] = useState<LostItemData | null>(null);

  // Claim Modal State
  const [claimingItem, setClaimingItem] = useState<LostItemData | null>(null);
  const [claimerName, setClaimerName] = useState('');
  const [claimDateStr, setClaimDateStr] = useState('');

  const filteredItems = state.lostItems.filter(item => {
    const matchesType = filterType === 'all' || item.typeId === filterType;
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.generatedCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.finder.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.claimedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const openClaimModal = (item: LostItemData) => {
    setClaimingItem(item);
    setClaimerName('');
    // Initialize with current time in local ISO format
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localIso = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    setClaimDateStr(localIso);
  };

  const submitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem || !claimerName || !claimDateStr) return;

    setState(prev => ({
      ...prev,
      lostItems: prev.lostItems.map(item => 
        item.id === claimingItem.id ? { 
          ...item, 
          status: 'claimed',
          claimedBy: claimerName,
          claimTimestamp: new Date(claimDateStr).getTime()
        } : item
      )
    }));
    
    showNotification('success', `物品 ${claimingItem.itemName} 已成功认领！`);
    setClaimingItem(null);
  };

  const getCategoryName = (id: string) => state.categories.find(c => c.id === id)?.label || '未知';
  const getLocationName = (id: string) => state.locations.find(l => l.id === id)?.label || '未知';

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索物品、编码、拾获/认领人..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-slate-400" size={16} />
              <select
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white appearance-none"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">所有分类</option>
                {state.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">生成的 ID</th>
                <th className="px-6 py-4">物品详情</th>
                <th className="px-6 py-4">位置信息</th>
                <th className="px-6 py-4">相关人员</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status === 'lost' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.status === 'lost' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {item.status === 'lost' ? '遗失中' : '已认领'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {item.generatedCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{item.itemName}</div>
                    <div className="text-xs text-slate-500">{getCategoryName(item.typeId)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{getLocationName(item.locId)} <span className="text-slate-400">({item.floor}楼)</span></div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(item.timestamp).toLocaleDateString()} 发现</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-slate-500">拾获: {item.finder}</span>
                      {item.status === 'claimed' && item.claimedBy && (
                        <span className="text-xs font-semibold text-emerald-600">认领: {item.claimedBy}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="生成二维码标签"
                      >
                        <QrCode size={18} />
                      </button>
                      
                      {item.status === 'lost' ? (
                        <button 
                          onClick={() => openClaimModal(item)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="登记认领信息"
                        >
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="p-1.5 text-slate-300 cursor-not-allowed"
                          title="已认领 (不可删除)"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    未找到符合条件的物品。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
          <span>显示 {filteredItems.length} 项物品</span>
          <span>系统 v1.2</span>
        </div>
      </div>

      {/* QR Modal */}
      {selectedItem && (
        <QRCodeLabel 
          item={selectedItem} 
          categoryName={getCategoryName(selectedItem.typeId)}
          locationName={getLocationName(selectedItem.locId)}
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" />
                物品认领登记
              </h3>
              <button 
                onClick={() => setClaimingItem(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="sr-only">关闭</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitClaim} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                 <div className="text-xs text-slate-500">确认物品</div>
                 <div className="font-bold text-slate-800">{claimingItem.itemName}</div>
                 <div className="text-xs font-mono text-slate-400 mt-1">{claimingItem.generatedCode}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  认领人信息 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="姓名 - 班级/工号/电话"
                  value={claimerName}
                  onChange={e => setClaimerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  认领时间 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                    type="datetime-local"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={claimDateStr}
                    onChange={e => setClaimDateStr(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setClaimingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  确认认领
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemDataTable;