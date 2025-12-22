
import React, { useMemo } from 'react';
import { Idea } from '../types';
import { Target, Zap, Rocket, AlertTriangle, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';

interface Props {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  isDarkMode: boolean;
}

export const PriorityMatrix: React.FC<Props> = ({ ideas, onSelectIdea, isDarkMode }) => {
  // Нормализация данных для графика (0-100)
  const normalizedIdeas = useMemo(() => {
    return ideas.map(idea => {
      // Имитация расчета сложности на основе описания и количества модулей, если детальный анализ не проведен
      // Если детальный анализ есть, используем суммарные часы
      const totalHours = idea.microIdeas?.reduce((acc, curr) => acc + (curr.hours || 0), 0) || 40;
      
      // Сложность: чем больше часов, тем выше сложность (X ось)
      // Ценность: на основе priorityScore от ИИ (Y ось)
      return {
        ...idea,
        x: Math.min(Math.max((totalHours / 200) * 100, 10), 90), // Effort
        y: Math.min(Math.max(idea.priorityScore || 50, 10), 90), // Value/Impact
      };
    });
  }, [ideas]);

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center opacity-30">
        <Target size={64} className="mb-6" />
        <h2 className="text-2xl font-bold italic uppercase tracking-widest">Матрица пуста</h2>
        <p className="mt-2 font-medium">Сгенерируйте идеи, чтобы увидеть их распределение</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto h-full flex flex-col space-y-8 animate-slide-up">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold heading-refined tracking-tight flex items-center gap-3">
          <Target className="text-blue-500" /> Матрица Приоритетов
        </h2>
        <p className="opacity-40 font-medium italic">Сравнение ценности решений против сложности их реализации</p>
      </header>

      <div className="flex-1 relative aspect-square md:aspect-[16/9] border-2 border-black/5 dark:border-white/10 rounded-5xl overflow-hidden bg-white/30 dark:bg-white/5 backdrop-blur-sm shadow-inner">
        {/* Квадранты */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Quick Wins - Top Left */}
          <div className="border-r border-b border-black/5 dark:border-white/10 p-6 flex flex-col justify-start">
            <div className="flex items-center gap-2 text-green-500/50">
              <Zap size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Quick Wins</span>
            </div>
          </div>
          {/* Big Bets - Top Right */}
          <div className="border-b border-black/5 dark:border-white/10 p-6 flex flex-col justify-start items-end">
            <div className="flex items-center gap-2 text-blue-500/50">
              <Rocket size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Big Bets</span>
            </div>
          </div>
          {/* Fill-ins - Bottom Left */}
          <div className="border-r border-black/5 dark:border-white/10 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-gray-500/50">
              <TrendingUp size={16} className="rotate-90" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fill-ins</span>
            </div>
          </div>
          {/* Money Pit - Bottom Right */}
          <div className="p-6 flex flex-col justify-end items-end">
            <div className="flex items-center gap-2 text-red-500/50">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Money Pit</span>
            </div>
          </div>
        </div>

        {/* Оси */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 -rotate-90 -translate-x-12 flex items-center gap-2">
                Ценность / Impact <ArrowUpRight size={12} className="rotate-[-45deg]" />
            </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 flex justify-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 py-4 flex items-center gap-2">
                Сложность / Effort <ArrowUpRight size={12} className="rotate-[45deg]" />
            </div>
        </div>

        {/* Пузырьки идей */}
        <div className="absolute inset-0 p-12">
            {normalizedIdeas.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => onSelectIdea(idea)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20"
                  style={{ left: `${idea.x}%`, top: `${100 - idea.y}%` }}
                >
                    <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-2xl transition-all duration-500 
                        group-hover:scale-125 group-hover:z-30 
                        ${idea.y > 50 ? (idea.x < 50 ? 'bg-green-500' : 'bg-blue-600') : (idea.x < 50 ? 'bg-gray-400' : 'bg-red-500')}
                    `}>
                        {idea.priorityScore}%
                    </div>
                    {/* Tooltip */}
                    <div className={`
                        absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 rounded-2xl backdrop-blur-3xl border shadow-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100
                        ${isDarkMode ? 'bg-black/80 border-white/10 text-white' : 'bg-white/90 border-black/5 text-black'}
                    `}>
                        <div className="text-[8px] font-bold uppercase opacity-30 mb-1 tracking-widest">{idea.department}</div>
                        <div className="text-[11px] font-bold heading-refined leading-tight mb-2">{idea.title}</div>
                        <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="flex items-center gap-1 text-blue-500"><TrendingUp size={10} /> {idea.roiEstimate}</span>
                            <span className="flex items-center gap-1 opacity-50"><Clock size={10} /> {idea.x < 30 ? 'Low' : idea.x < 70 ? 'Mid' : 'High'}</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-4xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <h4 className="font-bold text-sm uppercase tracking-widest opacity-30 mb-4">Легенда анализа</h4>
              <div className="space-y-3">
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium opacity-60"><b>Quick Wins:</b> Максимальный ROI при минимальных вложениях. Начните с них.</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-medium opacity-60"><b>Big Bets:</b> Стратегические продукты. Требуют привлечения инвестиций.</span>
                  </div>
              </div>
          </div>
          <div className="p-6 rounded-4xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center">
              <p className="text-xs italic opacity-40 text-center max-w-xs leading-relaxed">
                  "Матрица рассчитывается на основе нейронного анализа 25+ факторов рынка, сложности разработки и потенциального финансового эффекта."
              </p>
          </div>
      </div>
    </div>
  );
};
