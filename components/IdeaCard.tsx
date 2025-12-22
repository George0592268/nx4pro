
import React from 'react';
import { Idea } from '../types';
import { ArrowRight, AlertCircle, Zap, TrendingUp, HelpCircle } from 'lucide-react';

interface Props {
  idea: Idea;
  onSelect: (idea: Idea) => void;
}

export const IdeaCard: React.FC<Props> = ({ idea, onSelect }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 hover:shadow-2xl transition-all flex flex-col h-full group relative overflow-hidden">
      <div className="absolute top-6 right-8 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
        Урон: {idea.priorityScore}%
      </div>

      <div className="flex gap-2 mb-6">
        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-tighter">{idea.department}</span>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{idea.targetRole}</span>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 text-red-500 mb-2">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Диагноз боли</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter mb-4">
          {idea.problemStatement}
        </h3>
        
        <div className="space-y-2 mt-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <HelpCircle size={10} /> Почему вы теряете ресурсы:
            </div>
            {idea.rootCauses && idea.rootCauses.length > 0 ? (
              idea.rootCauses.map((rc, idx) => (
                <div key={idx} className="flex gap-2 text-[11px] text-slate-600 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    <span className="text-red-400 font-black">•</span> {rc}
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-400 italic">Анализируем скрытые факторы...</div>
            )}
        </div>
      </div>

      <div className="mb-8 flex-grow">
        <div className="flex items-center gap-2 text-blue-500 mb-2">
          <Zap size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Цифровое решение</span>
        </div>
        <h4 className="font-black text-slate-800 uppercase italic text-sm mb-2">{idea.title}</h4>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic line-clamp-3">
          {idea.description}
        </p>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp size={18} />
          <span className="text-sm font-black uppercase tracking-tighter">ROI {idea.roiEstimate}</span>
        </div>
      </div>

      <button 
        onClick={() => onSelect(idea)}
        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
      >
        Детальный аудит и Forge-сделка
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
