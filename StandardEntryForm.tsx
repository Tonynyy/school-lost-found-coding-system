import React, { useState, useEffect } from 'react';
import { ViewProps, LostItemData } from '../types';
import { Save, AlertCircle, Clock, User, Hash, MapPin, Calendar, Users, RotateCcw } from 'lucide-react';

const StandardEntryForm: React.FC<ViewProps> = ({ state, setState, showNotification }) => {
  // Item Basic Info
  const [itemName, setItemName] = useState('');
  
  // Encoding Components
  const [typeId, setTypeId] = useState('');
  const [locId, setLocId] = useState('');
  const [floor, setFloor] = useState('1');
  
  // Time Info
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [dateTimeInput, setDateTimeInput] = useState('');

  // Person Info
  const [grade, setGrade] = useState('1');
  const [classNum, setClassNum] = useState('01');
  const [studentId, setStudentId] = useState('01');
  
  // Generated
  const [generatedCode, setGeneratedCode] = useState('');

  // Define outdoor locations that don't have floors
  const outdoorLocations = ['l_playground', 'l_court'];

  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const getLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  };

  // Auto-update time
  useEffect(() => {
    if (!isAutoTime) return;

    const updateTime = () => {
      setDateTimeInput(getLocalISOString(new Date()));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000); 
    return () => clearInterval(timer);
  }, [isAutoTime]);

  // Derived time string for encoding: YYMMDDHHMM
  const getTimeCode = () => {
    if (!dateTimeInput) return '0000000000';
    // dateTimeInput format: YYYY-MM-DDTHH:mm
    const yy = dateTimeInput.slice(2, 4);
    const mm = dateTimeInput.slice(5, 7);
    const dd = dateTimeInput.slice(8, 10);
    const hh = dateTimeInput.slice(11, 13);
    const min = dateTimeInput.slice(14, 16);
    return `${yy}${mm}${dd}${hh}${min}`;
  };

  const currentTimeStr = getTimeCode();

  // Auto-generate code when inputs change
  useEffect(() => {
    const typeRule = state.categories.find(c => c.id === typeId);
    const locRule = state.locations.find(l => l.id === locId);
    
    // Safety check: if rules exist and have codes
    const typeCode = typeRule?.code || '?';
    const locCode = locRule?.code || '?';
    
    // Format: T-LF-YYMMDDHHMM-GCCNN
    const personCode = `${grade}${classNum}${studentId}`;
    const code = `${typeCode}-${locCode}${floor}-${currentTimeStr}-${personCode}`;
    
    setGeneratedCode(code);
  }, [typeId, locId, floor, grade, classNum, studentId, currentTimeStr, state.categories, state.locations]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoTime(false);
    setDateTimeInput(e.target.value);
  };

  const resetAutoTime = () => {
    setIsAutoTime(true);
    setDateTimeInput(getLocalISOString(new Date()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !typeId || !locId) return;
    
    // Validate that codes are set
    const typeRule = state.categories.find(c => c.id === typeId);
    const locRule = state.locations.find(l => l.id === locId);
    
    if (!typeRule?.code || !locRule?.code) {
      showNotification('error', "错误：所选的分类或地点尚未在“规则配置”中设置代码。");
      return;
    }

    const newItem: LostItemData = {
      id: crypto.randomUUID(),
      typeId,
      locId,
      itemName,
      floor,
      grade,
      classNum,
      studentId,
      timestamp: new Date(dateTimeInput).getTime(), // Use selected time
      finder: `${grade}年${classNum}班 ${studentId}号`, 
      generatedCode,
      status: 'lost'
    };

    setState(prev => ({
      ...prev,
      lostItems: [newItem, ...prev.lostItems]
    }));

    setItemName('');
    setIsAutoTime(true); 
    showNotification('success', `物品登记成功！已生成编码：${generatedCode}`);
  };

  // Generate options helpers
  const grades = ['1', '2', '3', '4', '5', '6'];
  const classes = Array.from({length: 13}, (_, i) => (i + 1).toString().padStart(2, '0')); // 01-13
  const students = Array.from({length: 44}, (_, i) => (i + 1).toString().padStart(2, '0')); // 01-44
  
  // Dynamic Floors based on Location
  const isOutdoor = outdoorLocations.includes(locId);
  const floors = isOutdoor ? ['0'] : ['1', '2', '3', '4', '5'];

  // Get current codes for display
  const currentTypeRule = state.categories.find(c => c.id === typeId);
  const typeCodeDisplay = currentTypeRule?.code || '?';
  const currentLocRule = state.locations.find(l => l.id === locId);
  const locCodeDisplay = currentLocRule?.code || '?';
  const personCodeDisplay = `${grade}${classNum}${studentId}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
             <h2 className="text-lg font-bold text-slate-800">新失物登记</h2>
             <p className="text-xs text-slate-500 mt-1">请完整填写以下信息，系统将自动生成标准编码。</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* 1. Item Info */}
            <div>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Hash size={16} /> 1. 物品与分类
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">物品名称</label>
                   <input
                    required
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="如：黑色水笔"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">物品分类 (1位代码)</label>
                  <select 
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    value={typeId}
                    onChange={e => setTypeId(e.target.value)}
                  >
                    <option value="">请选择分类...</option>
                    {state.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label} ({c.code || '未配置'})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Location Info */}
            <div>
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={16} /> 2. 地点信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">发现地点 (1位代码)</label>
                    <select 
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      value={locId}
                      onChange={e => {
                        const newId = e.target.value;
                        setLocId(newId);
                        // Determine target floor based on new location type
                        const newIsOutdoor = outdoorLocations.includes(newId);
                        if (newIsOutdoor) {
                          setFloor('0');
                        } else {
                          setFloor('1'); // Default to 1 for indoor
                        }
                      }}
                    >
                      <option value="">请选择地点...</option>
                      {state.locations.map(l => (
                        <option key={l.id} value={l.id}>{l.label} ({l.code || '未配置'})</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      楼层 (1位) {isOutdoor && <span className="text-amber-500 font-normal ml-1">室外固定为0层</span>}
                    </label>
                    <select 
                      className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        isOutdoor ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
                      }`}
                      value={floor}
                      onChange={e => setFloor(e.target.value)}
                      disabled={isOutdoor}
                    >
                      {floors.map(f => <option key={f} value={f}>{f}层</option>)}
                    </select>
                 </div>
              </div>
            </div>

            {/* 3. Time Info */}
            <div>
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={16} /> 3. 拾获时间 (自动获取/手动修改)
              </h3>
              <div className="flex items-end gap-3">
                 <div className="flex-1 max-w-sm">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">时间设定</label>
                    <input
                      type="datetime-local"
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white ${isAutoTime ? 'text-slate-500 border-slate-200 bg-slate-50' : 'border-amber-300 text-slate-900'}`}
                      value={dateTimeInput}
                      onChange={handleTimeChange}
                    />
                 </div>
                 {!isAutoTime && (
                   <button 
                     type="button"
                     onClick={resetAutoTime}
                     className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 transition-colors h-[42px]"
                     title="重置为自动当前时间"
                   >
                     <RotateCcw size={14} />
                     自动同步
                   </button>
                 )}
                 {isAutoTime && (
                    <div className="h-[42px] flex items-center text-xs text-amber-600 bg-amber-50 px-3 rounded-lg border border-amber-100 animate-pulse">
                      <Clock size={14} className="mr-1" />
                      自动同步中
                    </div>
                 )}
              </div>
            </div>

            {/* 4. Finder Info */}
            <div>
              <h3 className="text-sm font-bold text-pink-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={16} /> 4. 拾获人信息 (生成编码后缀)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">年级 (1位)</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                    >
                      {grades.map(g => <option key={g} value={g}>{g}年级</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">班级 (2位)</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      value={classNum}
                      onChange={e => setClassNum(e.target.value)}
                    >
                      {classes.map(c => <option key={c} value={c}>{c}班</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">学号 (2位)</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                    >
                      {students.map(s => <option key={s} value={s}>{s}号</option>)}
                    </select>
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Save size={18} />
                确认登记并生成编码
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Code Preview Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl border border-slate-800 sticky top-24">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               实时编码结构解析
             </h3>
             <span className="flex items-center gap-1 text-xs text-slate-500 font-mono"><Clock size={10} /> {currentTimeStr || '...'}</span>
          </div>

          <div className="space-y-4">
            {/* Type Block */}
            <div className="bg-indigo-900/20 border-l-4 border-indigo-500 rounded p-3 transition-colors hover:bg-indigo-900/30">
              <div className="flex justify-between items-start">
                 <div>
                    <div className="text-lg font-bold text-white mb-1">物品分类</div>
                    <div className="text-xs text-indigo-300">来源: 用户规则配置</div>
                 </div>
                 <div className="text-2xl font-mono font-bold text-indigo-400 bg-slate-950/50 px-3 py-1 rounded border border-indigo-500/30 min-w-[3rem] text-center">
                    {typeCodeDisplay}
                 </div>
              </div>
            </div>

            {/* Location Block */}
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 rounded p-3 transition-colors hover:bg-emerald-900/30">
              <div className="flex justify-between items-start">
                 <div>
                    <div className="text-lg font-bold text-white mb-1">地点 + 楼层</div>
                    <div className="text-xs text-emerald-300">来源: 固定地点映射</div>
                 </div>
                 <div className="text-2xl font-mono font-bold text-emerald-400 bg-slate-950/50 px-3 py-1 rounded border border-emerald-500/30 min-w-[3rem] text-center">
                    {locCodeDisplay}{floor}
                 </div>
              </div>
            </div>

            {/* Time Block */}
            <div className={`bg-amber-900/20 border-l-4 border-amber-500 rounded p-3 transition-colors ${isAutoTime ? 'hover:bg-amber-900/30' : 'bg-amber-800/40 ring-1 ring-amber-500/50'}`}>
              <div className="flex justify-between items-start">
                 <div>
                    <div className="text-lg font-bold text-white mb-1">时间戳</div>
                    <div className="text-xs text-amber-300">
                      {isAutoTime ? '自动获取系统时间' : '用户手动指定'}
                    </div>
                 </div>
                 <div className="text-lg font-mono font-bold text-amber-400 bg-slate-950/50 px-2 py-1 rounded border border-amber-500/30 min-w-[3rem] text-center">
                    {currentTimeStr || '...'}
                 </div>
              </div>
            </div>

            {/* Person Block */}
            <div className="bg-pink-900/20 border-l-4 border-pink-500 rounded p-3 transition-colors hover:bg-pink-900/30">
              <div className="flex justify-between items-start">
                 <div>
                    <div className="text-lg font-bold text-white mb-1">拾获人信息</div>
                    <div className="text-xs text-pink-300">年级+班级+学号</div>
                 </div>
                 <div className="text-xl font-mono font-bold text-pink-400 bg-slate-950/50 px-2 py-1 rounded border border-pink-500/30 min-w-[3rem] text-center">
                    {personCodeDisplay}
                 </div>
              </div>
            </div>
          </div>

          {/* Full Code Preview (De-emphasized) */}
          <div className="mt-6 pt-4 border-t border-slate-800">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 text-center">完整组合编码</div>
             <div className="bg-black/40 p-3 rounded text-center border border-white/5">
                <span className="font-mono text-sm text-slate-400 break-all">
                  {generatedCode || '等待数据...'}
                </span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StandardEntryForm;