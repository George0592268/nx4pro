
import React from 'react';
import { Idea } from '../types';
import { AlertCircle, Zap, TrendingUp, ChevronRight, Activity } from 'lucide-react';

interface Props {
  idea: Idea;
  onSelect: (idea: Idea) => void;
}

export const IdeaCard: React.FC<Props> = ({ idea, onSelect }) => {
  // Safety check to prevent .map errors if AI returns non-array
  const rootCauses = Array.isArray(idea.rootCauses) ? idea.rootCauses : [];

  return (
    <div className="group flex flex-col h-full rounded-5xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 p-8 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden">
      <div className="absolute top-8 right-8 text-[10px] font-bold tracking-widest opacity-20 uppercase">
        Match {idea.priorityScore}%
      </div>

      <div className="mb-6 flex">
        <span className="bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-blue-500/10">
          {idea.department}
        </span>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 text-red-500/60 mb-3">
          <AlertCircle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Проблема</span>
        </div>
        <h3 className="text-xl font-bold leading-snug mb-4 heading-refined">
          {idea.problemStatement}
        </h3>
        
        <div className="space-y-2">
            {rootCauses.slice(0, 2).map((rc, idx) => (
              <div key={idx} className="text-xs opacity-40 font-medium italic leading-relaxed">
                  — {rc}
              </div>
            ))}
        </div>
      </div>

      <div className="mb-10 flex-grow">
        <div className="flex items-center gap-2 text-blue-500/60 mb-3">
          <Zap size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Решение</span>
        </div>
        <h4 className="font-bold text-lg mb-2 tracking-tight opacity-90">{idea.title}</h4>
        <p className="text-sm opacity-50 font-medium leading-relaxed line-clamp-3">
          {idea.description}
        </p>
      </div>

      <div className="pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-green-500/80">
          <TrendingUp size={20} />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase opacity-30 tracking-widest">ROI Прогноз</span>
            <span className="text-sm font-bold tracking-tight">{idea.roiEstimate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-30">
            <Activity size={16} />
            <span className="text-[10px] font-bold uppercase">{idea.targetRole}</span>
        </div>
      </div>

      <button 
        onClick={() => onSelect(idea)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
      >
        Детальный аудит
        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
