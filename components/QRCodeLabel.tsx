import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LostItemData } from '../types';
import { X, Printer, Download, Loader, Tag, MapPin, Clock, User } from 'lucide-react';

interface QRCodeLabelProps {
  item: LostItemData;
  categoryName: string;
  locationName: string;
  onClose: () => void;
}

const QRCodeLabel: React.FC<QRCodeLabelProps> = ({ item, categoryName, locationName, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Parse code parts safely
  const parts = item.generatedCode.split('-');
  const typePart = parts[0] || '?';
  const locPart = parts[1] || '?';
  const timePart = parts[2] || '?';
  const personPart = parts[3] || '?';

  // Construct detailed data for QR scan
  const qrData = `物品ID: ${item.generatedCode}\n物品: ${item.itemName}\n位置: ${locationName} (${item.floor}层)\n时间: ${new Date(item.timestamp).toLocaleString()}\n拾获: ${item.finder}`;
  
  // Use a higher resolution for the QR code
  const encodedData = encodeURIComponent(qrData);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&charset-source=UTF-8`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${item.generatedCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('无法下载图片，请尝试右键另存为');
    } finally {
      setIsDownloading(false);
    }
  };

  // Use createPortal to render directly into body, bypassing parent z-index constraints
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #qr-print-container, #qr-print-container * {
              visibility: visible;
            }
            #qr-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background: white;
            }
            /* Hide buttons during print */
            #qr-actions {
              display: none;
            }
          }
        `}
      </style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Tag className="text-indigo-600" />
              资产标签详情
            </h3>
            <p className="text-sm text-slate-500 mt-1">请确认信息无误后打印或下载</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Body */}
        <div className="overflow-y-auto p-8 bg-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: The Physical Label Preview (Print Area) */}
            <div id="qr-print-container" className="flex flex-col gap-4">
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Printer size={16} /> 标签打印预览
               </h4>
               
               {/* The Sticker - Styled for physical printing */}
               <div className="bg-white p-6 rounded-lg border-2 border-slate-800 shadow-sm flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col gap-2 items-center">
                     <img src={qrUrl} alt="QR Code" className="w-32 h-32 object-contain border border-slate-100 rounded" />
                     <span className="text-[10px] font-mono text-slate-400">扫码查看</span>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden min-w-0 flex-1 py-1">
                     <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">智慧校园 / 失物招领</span>
                     </div>
                     
                     <div className="font-mono text-3xl font-black text-slate-900 leading-none break-all tracking-tight my-1">
                       {item.generatedCode}
                     </div>
                     
                     <div className="text-xl font-bold text-slate-800 truncate mt-1">{item.itemName}</div>
                     
                     <div className="grid grid-cols-1 gap-y-1 text-xs text-slate-600 mt-3 font-medium">
                        <div className="flex items-center gap-2"><span className="text-slate-400 min-w-[3rem]">分类:</span> {categoryName}</div>
                        <div className="flex items-center gap-2"><span className="text-slate-400 min-w-[3rem]">位置:</span> {locationName} ({item.floor}层)</div>
                        <div className="flex items-center gap-2"><span className="text-slate-400 min-w-[3rem]">时间:</span> {new Date(item.timestamp).toLocaleDateString()}</div>
                     </div>
                  </div>
               </div>
               
               <p className="text-xs text-center text-slate-400 mt-2">
                 建议打印尺寸: 10cm x 6cm (标准资产标签纸)
               </p>
            </div>

            {/* Right Column: Code Decoding */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Loader size={16} /> 编码含义解析
              </h4>
              <div className="bg-slate-800 rounded-xl p-6 text-white shadow-inner space-y-6">
                 {/* Visual Code Breakdown */}
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                   <div className="font-mono text-center text-xl md:text-2xl font-bold flex flex-wrap justify-center items-center gap-1">
                      <span className="text-indigo-400 px-1 hover:bg-indigo-500/20 rounded cursor-help" title="分类代码">{typePart}</span>
                      <span className="text-slate-600">-</span>
                      <span className="text-emerald-400 px-1 hover:bg-emerald-500/20 rounded cursor-help" title="地点代码">{locPart}</span>
                      <span className="text-slate-600">-</span>
                      <span className="text-amber-400 px-1 hover:bg-amber-500/20 rounded cursor-help" title="时间戳">{timePart}</span>
                      <span className="text-slate-600">-</span>
                      <span className="text-pink-400 px-1 hover:bg-pink-500/20 rounded cursor-help" title="人员代码">{personPart}</span>
                   </div>
                   <div className="text-center text-xs text-slate-500 mt-2">鼠标悬停查看各部分含义</div>
                 </div>

                 {/* Legend */}
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                       <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0"><Tag size={18} /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">物品分类 (Category)</div>
                          <div className="font-medium text-indigo-100 truncate">{categoryName}</div>
                          <div className="text-xs text-indigo-400/70 font-mono">代码: {typePart}</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                       <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0"><MapPin size={18} /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">位置信息 (Location)</div>
                          <div className="font-medium text-emerald-100 truncate">{locationName} ({item.floor}层)</div>
                          <div className="text-xs text-emerald-400/70 font-mono">代码: {locPart}</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                       <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0"><Clock size={18} /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">生成时间 (Timestamp)</div>
                          <div className="font-medium text-amber-100 truncate">{new Date(item.timestamp).toLocaleString()}</div>
                          <div className="text-xs text-amber-400/70 font-mono">代码: {timePart}</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                       <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg shrink-0"><User size={18} /></div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">拾获人信息 (Finder)</div>
                          <div className="font-medium text-pink-100 truncate">{item.finder}</div>
                          <div className="text-xs text-pink-400/70 font-mono">代码: {personPart}</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div id="qr-actions" className="p-6 bg-white border-t border-slate-100 flex gap-4 justify-end">
          <button 
             onClick={() => window.print()} 
             className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
          >
            <Printer size={20} />
            打印标签
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
          >
            {isDownloading ? <Loader size={20} className="animate-spin" /> : <Download size={20} />}
            {isDownloading ? '处理中...' : '下载二维码'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRCodeLabel;