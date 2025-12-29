import React, { useState } from 'react';
import { ViewProps, EncodingRule } from '../types';
import { Plus, Trash2, Info, Tag, MapPin, AlertTriangle, ArrowRight, Edit2, Check, X } from 'lucide-react';

const RuleConfigManager: React.FC<ViewProps> = ({ state, setState, showNotification }) => {
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  
  // Local state to track edits before confirmation
  // Key: Rule ID (Category or Location), Value: Current input string
  const [tempCodes, setTempCodes] = useState<Record<string, string>>({});

  const addCategory = () => {
    if (!newCatLabel || !newCatCode) return;
    
    // VALIDATION ON SUBMIT: Force Uppercase
    const formattedCode = newCatCode.toUpperCase();

    // Duplicate Check
    if (state.categories.some(c => c.code === formattedCode && c.code !== '')) {
      showNotification('error', `添加失败：代码 "${formattedCode}" 已经被使用，请重新输入。`);
      setNewCatCode('');
      return;
    }

    const newRule: EncodingRule = {
      id: `c-${Date.now()}`,
      label: newCatLabel,
      code: formattedCode, 
    };
    setState(prev => ({ ...prev, categories: [...prev.categories, newRule] }));
    setNewCatLabel('');
    setNewCatCode('');
    showNotification('success', `已成功添加规则：${newCatLabel} -> [${formattedCode}]`);
  };

  const removeCategory = (id: string) => {
    setState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    const newTemps = { ...tempCodes };
    delete newTemps[id];
    setTempCodes(newTemps);
  };

  const handleCodeChange = (id: string, value: string) => {
    // Allow any input while typing (Lower/Upper/Mixed)
    setTempCodes(prev => ({ ...prev, [id]: value }));
  };

  // Save logic for Categories
  const saveCategoryCode = (id: string) => {
    const rawValue = tempCodes[id];
    if (rawValue === undefined) return;

    // 1. Force Uppercase
    const formatted = rawValue.toUpperCase();

    // 2. Duplicate Check (Categories)
    const isDuplicate = state.categories.some(c => c.id !== id && c.code === formatted);

    if (isDuplicate) {
      showNotification('error', `保存失败：分类代码【${formatted}】已存在！请重新输入。`);
      setTempCodes(prev => ({ ...prev, [id]: '' })); // Clear input
    } else {
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => 
          c.id === id ? { ...c, code: formatted } : c
        )
      }));
      
      const newTemps = { ...tempCodes };
      delete newTemps[id];
      setTempCodes(newTemps);
      
      showNotification('success', '分类规则代码已更新');
    }
  };

  // Save logic for Locations
  const saveLocationCode = (id: string) => {
    const rawValue = tempCodes[id];
    if (rawValue === undefined) return;

    // 1. Force Uppercase
    const formatted = rawValue.toUpperCase();

    // 2. Duplicate Check (Locations)
    const isDuplicate = state.locations.some(l => l.id !== id && l.code === formatted);

    if (isDuplicate) {
      showNotification('error', `保存失败：地点代码【${formatted}】已存在！请重新输入。`);
      setTempCodes(prev => ({ ...prev, [id]: '' })); // Clear input
    } else {
      setState(prev => ({
        ...prev,
        locations: prev.locations.map(loc => 
          loc.id === id ? { ...loc, code: formatted } : loc
        )
      }));
      
      const newTemps = { ...tempCodes };
      delete newTemps[id];
      setTempCodes(newTemps);
      
      showNotification('success', '地点规则代码已更新');
    }
  };

  const cancelEdit = (id: string) => {
    const newTemps = { ...tempCodes };
    delete newTemps[id];
    setTempCodes(newTemps);
  };

  const updateLabel = (id: string, value: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === id ? { ...c, label: value } : c
      )
    }));
  };

  return (
    <div className="space-y-8 relative pb-12">
      
      {/* Explanation Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="text-amber-600 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-bold">编码任务说明：</p>
          <p>请为下方的物品分类和固定地点设置对应的“编码字符”。系统将根据这些规则自动生成唯一的物品 ID。</p>
          <p className="mt-1 text-xs text-amber-600 font-bold">* 支持输入：英文字母、汉字、数字及其组合。输入完毕请点击“确定”，系统将自动转换为大写并检查重复。</p>
        </div>
      </div>

      {/* Categories Section - Fully Editable */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Tag size={18} className="text-indigo-600" />
              1. 失物类型
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="分类名称（如：乐器）"
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newCatLabel}
              onChange={e => setNewCatLabel(e.target.value)}
            />
            <input
              type="text"
              placeholder="自定义代码"
              className="px-4 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newCatCode}
              onChange={e => setNewCatCode(e.target.value)} 
            />
            <button
              onClick={addCategory}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              添加规则
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">分类名称 (点击修改)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">映射代码 (修改后点确定)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {state.categories.map(cat => {
                  const isEditing = tempCodes[cat.id] !== undefined;
                  const displayValue = isEditing ? tempCodes[cat.id] : cat.code;
                  
                  return (
                  <tr key={cat.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 relative">
                      <div className="relative w-full">
                        <input 
                           type="text"
                           value={cat.label}
                           onChange={(e) => updateLabel(cat.id, e.target.value)}
                           className="w-full bg-transparent border-b border-transparent hover:border-indigo-200 focus:border-indigo-500 focus:ring-0 px-2 py-1 pr-8 transition-all outline-none"
                        />
                        <Edit2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <input 
                           type="text"
                           value={displayValue}
                           placeholder="?"
                           onChange={(e) => handleCodeChange(cat.id, e.target.value)}
                           className={`min-w-[6rem] max-w-[12rem] text-center border rounded focus:ring-2 focus:ring-indigo-500 px-2 py-1 outline-none transition-all font-bold ${
                             !cat.code && !isEditing
                               ? 'bg-red-50 border-red-200 text-red-400 placeholder-red-300'
                               : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                           }`}
                        />
                        
                        {/* Confirm/Cancel Buttons */}
                        {isEditing ? (
                          <div className="flex items-center gap-1 animate-fade-in">
                            <button 
                              onClick={() => saveCategoryCode(cat.id)}
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                              title="确定并保存"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => cancelEdit(cat.id)}
                              className="p-1 bg-slate-200 text-slate-500 rounded hover:bg-slate-300 transition-colors"
                              title="取消修改"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                           !cat.code && (
                             <span className="text-xs text-red-400 font-normal whitespace-nowrap animate-pulse">
                               ← 需设置
                             </span>
                           )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => removeCategory(cat.id)} 
                        className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="删除规则"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )})}
                {state.categories.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400 italic">暂无规则，请在上方添加</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Locations Section - Fixed List, Editable Code */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              2. 失物地点
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.locations.map(loc => {
               const isEditing = tempCodes[loc.id] !== undefined;
               const displayValue = isEditing ? tempCodes[loc.id] : loc.code;
               
               return (
               <div key={loc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-white transition-all hover:shadow-md group">
                  <div className="text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    {loc.label}
                    {loc.code ? (
                      <span className="text-emerald-500 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">已设</span>
                    ) : (
                      <span className="text-slate-400 text-xs bg-slate-200 px-1.5 py-0.5 rounded">未配置</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono shrink-0">CODE:</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="text"
                        className={`w-full min-w-0 border-b-2 bg-transparent text-center font-mono font-bold text-lg outline-none transition-colors ${
                          !loc.code && !isEditing
                            ? 'border-red-300 focus:border-emerald-500 text-red-400 placeholder-red-300' 
                            : 'border-slate-300 focus:border-emerald-500 text-slate-900'
                        }`}
                        value={displayValue}
                        placeholder="?"
                        onChange={(e) => handleCodeChange(loc.id, e.target.value)}
                      />
                      
                      {/* Confirm/Cancel Buttons for Location */}
                      {isEditing && (
                        <div className="flex items-center gap-1 animate-fade-in shrink-0">
                          <button 
                            onClick={() => saveLocationCode(loc.id)}
                            className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                            title="确定并保存"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => cancelEdit(loc.id)}
                            className="p-1 bg-slate-200 text-slate-500 rounded hover:bg-slate-300 transition-colors"
                            title="取消修改"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            )})}
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info size={24} className="text-indigo-400" />
              数据编码结构全览
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Part 1 */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Tag size={64} />
                 </div>
                 <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">第一部分</div>
                 <div className="text-2xl font-bold text-white mb-1">物品分类</div>
                 <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm text-slate-400">代码位:</span>
                    <span className="font-mono text-lg text-indigo-400 font-bold">自定义(中/英)</span>
                 </div>
              </div>

              {/* Part 2 */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin size={64} />
                 </div>
                 <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">第二部分</div>
                 <div className="text-2xl font-bold text-white mb-1">地点 + 楼层</div>
                 <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm text-slate-400">代码位:</span>
                    <span className="font-mono text-lg text-emerald-400 font-bold">自定义 + F</span>
                 </div>
              </div>

              {/* Part 3 */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowRight size={64} />
                 </div>
                 <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">第三部分</div>
                 <div className="text-2xl font-bold text-white mb-1">自动时间戳</div>
                 <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm text-slate-400">代码位:</span>
                    <span className="font-mono text-sm text-amber-400 font-bold">YYMMDDHHMM</span>
                 </div>
              </div>

              {/* Part 4 */}
              <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Info size={64} />
                 </div>
                 <div className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-2">第四部分</div>
                 <div className="text-2xl font-bold text-white mb-1">拾获人信息</div>
                 <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm text-slate-400">代码位:</span>
                    <span className="font-mono text-sm text-pink-400 font-bold">G CC NN</span>
                 </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RuleConfigManager;