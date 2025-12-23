import React, { useState, useEffect } from 'react';
import { ViewProps } from '../types';
import { Check, X, HelpCircle, Trophy } from 'lucide-react';

const Learn: React.FC<ViewProps> = ({ state }) => {
  const [question, setQuestion] = useState<{ catLabel: string, locLabel: string, floor: string, answer: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);

  const generateQuestion = () => {
    // Need at least one category configured and locations existing
    const configuredCategories = state.categories.filter(c => c.code);
    const configuredLocations = state.locations.filter(l => l.code);
    
    if (configuredCategories.length === 0 || configuredLocations.length === 0) return;
    
    const randomCat = configuredCategories[Math.floor(Math.random() * configuredCategories.length)];
    const randomLoc = configuredLocations[Math.floor(Math.random() * configuredLocations.length)];
    const randomFloor = Math.floor(Math.random() * 5).toString();
    
    setQuestion({
      catLabel: randomCat.label,
      locLabel: randomLoc.label,
      floor: randomFloor,
      answer: `${randomCat.code}-${randomLoc.code}${randomFloor}`
    });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, [state.categories, state.locations]);

  const checkAnswer = () => {
    if (!question) return;
    const cleanUserAnswer = userAnswer.toUpperCase().trim();
    
    if (cleanUserAnswer === question.answer) {
      setFeedback('correct');
      setStreak(s => s + 1);
      setTimeout(generateQuestion, 2000);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
  };

  const hasConfig = state.categories.length > 0 && state.locations.some(l => l.code);

  if (!hasConfig) {
    return (
      <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
        <HelpCircle className="mx-auto text-slate-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800">需先配置规则</h2>
        <p className="text-slate-500 mt-2">请先在“规则配置”页面定义物品分类并为地点设置代码，方可开始游戏。</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold">编码逻辑挑战</h2>
           <p className="text-indigo-200">请推断出物品编码的【前缀部分】。</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-800 px-4 py-2 rounded-lg">
          <Trophy className="text-yellow-400" size={20} />
          <span className="font-bold text-xl">{streak}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500 uppercase tracking-wide text-sm font-bold mb-6">场景模拟</p>
        
        {question && (
          <div className="text-xl text-slate-800 mb-8 font-medium leading-relaxed">
            场景：在 <span className="text-emerald-600 font-bold border-b-2 border-emerald-200">{question.locLabel}</span> 的 <span className="text-emerald-600 font-bold">{question.floor}层</span> 发现了一件 <span className="text-indigo-600 font-bold border-b-2 border-indigo-200">{question.catLabel}</span>。
            <br/><br/>
            请写出它的编码前缀 (格式: T-LF)：
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mb-8">
          <input 
            type="text" 
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-48 text-center text-3xl font-mono p-3 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none uppercase placeholder-slate-200"
            placeholder="?-??"
            maxLength={6}
          />
        </div>

        <button 
          onClick={checkAnswer}
          className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
        >
          提交答案
        </button>

        {feedback === 'correct' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600 font-bold animate-bounce">
            <Check size={24} />
            回答正确！编码前缀正确。
          </div>
        )}

        {feedback === 'incorrect' && (
          <div className="mt-6 flex flex-col items-center gap-2 text-red-500 font-bold">
             <div className="flex items-center gap-2">
                <X size={24} />
                回答错误
             </div>
             <p className="text-sm font-normal text-slate-500">
               正确答案应该是：{question?.answer} (分类代码 - 地点代码 + 楼层)
             </p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 text-center">
        只需填写前缀：分类代码 - 地点代码 + 楼层数字
      </div>
    </div>
  );
};

export default Learn;