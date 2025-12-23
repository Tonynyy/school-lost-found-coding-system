import React, { useRef, useEffect } from 'react';
import { ViewProps } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Box, MapPin, Search, Activity, Wifi, ShieldCheck, Smile, BarChart3 } from 'lucide-react';

const Dashboard: React.FC<ViewProps> = ({ state }) => {
  // Compute Stats
  const totalItems = state.lostItems.length;
  const lostCount = state.lostItems.filter(i => i.status === 'lost').length;
  const claimedCount = state.lostItems.filter(i => i.status === 'claimed').length;
  const claimRate = totalItems > 0 ? Math.round((claimedCount / totalItems) * 100) : 0;
  
  // Chart Data Preparation
  const categoryData = state.categories.map(cat => ({
    subject: cat.label,
    A: state.lostItems.filter(i => i.typeId === cat.id).length,
  }));

  // Location Distribution for Radar
  const locationData = state.locations.map(loc => ({
    subject: loc.label,
    A: state.lostItems.filter(i => i.locId === loc.id).length,
    fullMark: 20,
  }));

  // Interactive Background Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: {x: number, y: number, vx: number, vy: number, size: number}[] = [];

    const init = () => {
        const { offsetWidth, offsetHeight } = canvas.parentElement || { offsetWidth: 800, offsetHeight: 600 };
        canvas.width = offsetWidth;
        canvas.height = offsetHeight;
        
        particles = [];
        const count = Math.floor((offsetWidth * offsetHeight) / 12000); // Density
        for(let i=0; i<count; i++) {
            particles.push({
                x: Math.random() * offsetWidth,
                y: Math.random() * offsetHeight,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1
            });
        }
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        // Draw particles
        ctx.fillStyle = 'rgba(129, 140, 248, 0.4)'; // Indigo-400 ish
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if(p.x < 0 || p.x > w) p.vx *= -1;
            if(p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Connections
        ctx.lineWidth = 1;
        
        // Connect particles to particles
        for(let i=0; i<particles.length; i++) {
            for(let j=i+1; j<particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 100) {
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist/100)})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            const dx = particles[i].x - mouseRef.current.x;
            const dy = particles[i].y - mouseRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 180) {
                 ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 * (1 - dist/180)})`; // Cyan connection for mouse
                 ctx.beginPath();
                 ctx.moveTo(particles[i].x, particles[i].y);
                 ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                 ctx.stroke();
            }
        }

        animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();
    
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
  };

  const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-[80vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative text-slate-200 font-mono"
    >
      {/* Interactive Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* Static Grid Effect (Subtle Overlay) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      {/* Top HUD Bar - Simplified */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Activity size={20} />
            <span className="font-bold tracking-widest text-sm">校园失物招领数据中心</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="text-xs text-slate-500 tracking-widest">DATA CENTER</span>
        </div>
      </div>

      <div className="relative z-10 p-6 grid grid-cols-12 gap-6">
        
        {/* Dynamic Data Summary Banner */}
        <div className="col-span-12 bg-gradient-to-r from-indigo-900/60 to-slate-900/60 border border-indigo-500/40 rounded-xl p-6 flex items-start gap-4 animate-fade-in relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Smile size={120} />
           </div>
           <div className="bg-indigo-500/20 p-3 rounded-full text-indigo-300">
             <BarChart3 size={32} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-white mb-2">📊 校园数据分析摘要</h2>
             <p className="text-indigo-100 text-lg leading-relaxed">
               {totalItems === 0 ? (
                 <>目前系统暂无数据。请前往“失物录入”页面添加第一条记录吧！</>
               ) : (
                 <>
                   本学期共登记了 <strong className="text-cyan-300 text-xl mx-1">{totalItems}</strong> 件物品。
                   {lostCount > 0 ? (
                     <>其中 <strong className="text-amber-400 text-xl mx-1">{lostCount}</strong> 件物品处于<span className="text-amber-300 border-b border-amber-500/50 mx-1">遗失状态</span>，需要大家共同留意。</>
                   ) : (
                     <>所有登记的物品都已找回，太棒了！</>
                   )}
                   {claimedCount > 0 && (
                     <>已有 <strong className="text-emerald-400 text-xl mx-1">{claimedCount}</strong> 位同学成功找回了失物，找回率达 <strong className="text-emerald-400">{claimRate}%</strong>。</>
                   )}
                 </>
               )}
             </p>
           </div>
        </div>

        {/* KPI Row - Simplified to 3 Columns */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
           {/* Card 1 */}
           <div className="bg-slate-900/50 border border-indigo-500/30 p-4 rounded-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><Box size={64} /></div>
             <div className="text-xs text-indigo-400 uppercase tracking-widest mb-1">物品登记总数</div>
             <div className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors">{totalItems}</div>
             <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full animate-[pulse_3s_infinite]"></div>
             </div>
           </div>

           {/* Card 2 */}
           <div className="bg-slate-900/50 border border-amber-500/30 p-4 rounded-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><Search size={64} /></div>
             <div className="text-xs text-amber-400 uppercase tracking-widest mb-1">正在寻找中</div>
             <div className="text-3xl font-black text-white group-hover:text-amber-300 transition-colors">{lostCount}</div>
             <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalItems > 0 ? (lostCount/totalItems)*100 : 0}%` }}></div>
             </div>
           </div>

           {/* Card 3 */}
           <div className="bg-slate-900/50 border border-emerald-500/30 p-4 rounded-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity"><ShieldCheck size={64} /></div>
             <div className="text-xs text-emerald-400 uppercase tracking-widest mb-1">成功找回</div>
             <div className="text-3xl font-black text-white group-hover:text-emerald-300 transition-colors">{claimedCount}</div>
             <div className="h-1 w-full bg-slate-800 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${claimRate}%` }}></div>
             </div>
           </div>
        </div>

        {/* Main Chart Area (Left) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm relative">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Wifi size={16} className="text-cyan-400" />
                物品分类分布 (CATEGORY CHART)
              </h3>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f8fafc' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="A" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Radar Map (Right) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm relative flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" />
                地点分布雷达 (LOCATION RADAR)
              </h3>
           </div>
           
           <div className="flex-1 w-full min-h-[250px] relative">
              {/* Decorative target circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                 <div className="w-[80%] h-[80%] border border-emerald-500 rounded-full"></div>
                 <div className="w-[60%] h-[60%] border border-emerald-500 rounded-full absolute"></div>
                 <div className="w-[40%] h-[40%] border border-emerald-500 rounded-full absolute"></div>
                 <div className="w-full h-px bg-emerald-500 absolute"></div>
                 <div className="h-full w-px bg-emerald-500 absolute"></div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={locationData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="数量"
                    dataKey="A"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f8fafc' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Terminal Log */}
        <div className="col-span-12 bg-black/40 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden h-48 relative">
           <div className="absolute top-0 left-0 right-0 bg-slate-800/50 px-4 py-1 text-xs font-bold text-slate-400 border-b border-slate-700">
              最新动态日志 (SYSTEM LOG) // REAL-TIME
           </div>
           <div className="mt-6 space-y-2 overflow-y-auto h-full pr-2 pb-2 custom-scrollbar">
              {state.lostItems.length === 0 && (
                <div className="text-slate-600 italic">>> 暂无活动记录。等待数据输入...</div>
              )}
              {state.lostItems.slice(0, 10).map((item, i) => (
                <div key={item.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-slate-500">[{new Date(item.timestamp).toLocaleTimeString()}]</span>
                  <span className={item.status === 'lost' ? 'text-amber-500' : 'text-emerald-500'}>
                    {item.status === 'lost' ? '>> 登记新失物' : '>> 物品已认领'}
                  </span>
                  <span className="text-slate-300">ID: {item.generatedCode}</span>
                  <span className="text-slate-500 opacity-50"> // {item.itemName}</span>
                </div>
              ))}
              <div className="animate-pulse text-indigo-500">_</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;