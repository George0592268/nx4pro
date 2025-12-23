
import React, { useState, useEffect, useRef } from 'react';
import { Idea, BusinessProblem } from '../types';
import { deepDiveIdea } from '../services/apiService';
import { 
  ArrowLeft, ShieldAlert, Wallet, Map, TrendingUp, Search, Timer, 
  Rocket, Activity, Command, ExternalLink, Globe, CheckCircle2, ListChecks, Clock, DollarSign, ChevronRight, Calculator, Zap, ArrowDownRight,
  Loader2
} from 'lucide-react';

interface Props {
  idea: Idea;
  onBack: () => void;
  onUpdateIdea: (idea: Idea) => void;
  onGenerateLanding: (idea: Idea) => void;
  selectedModel: string;
}

const EffectCalculator: React.FC<{ problem: BusinessProblem }> = ({ problem }) => {
  const [effort, setEffort] = useState(0); 
  const baseLoss = problem.metrics?.baseLossAmount || 0;
  const remainingLoss = Math.max(0, baseLoss * (1 - Math.pow(effort / 100, 0.5)));
  const saved = baseLoss - remainingLoss;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-500">
          <Calculator size={12} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Симулятор внедрения</span>
        </div>
        <span className="text-[10px] font-bold text-blue-500">{effort}% внедрено</span>
      </div>
      
      <input type="range" min="0" max="100" value={effort} onChange={(e) => setEffort(parseInt(e.target.value))} className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[8px] font-bold uppercase opacity-30">Остаточные потери</span>
          <div className="text-xs font-bold text-red-500/80 flex items-center gap-1">
            <ArrowDownRight size={10} /> {Math.round(remainingLoss).toLocaleString()} / мес
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[8px] font-bold uppercase opacity-30">Профит (ROI)</span>
          <div className="text-xs font-bold text-green-500 flex items-center gap-1">
            <Zap size={10} /> +{Math.round(saved).toLocaleString()} / мес
          </div>
        </div>
      </div>
    </div>
  );
};

export const IdeaDetail: React.FC<Props> = ({ idea, onBack, onUpdateIdea, onGenerateLanding, selectedModel }) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'mvp' | 'roadmap' | 'investor' | 'seo'>('diagnostic');
  const [loading, setLoading] = useState(!idea.isAnalyzed);
  const [countdown, setCountdown] = useState(25);
  const [statusMsg, setStatusMsg] = useState("Инициализация глубокого анализа...");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!idea.isAnalyzed) runFullAnalysis();
  }, [idea.id]);

  const runFullAnalysis = async () => {
    setLoading(true);
    const messages = ["Сбор рыночных данных...", "Финансовый просчет...", "Генерация роадмапа..."];
    let idx = 0;
    const msgInterval = setInterval(() => setStatusMsg(messages[idx++ % messages.length]), 4000);
    timerRef.current = window.setInterval(() => setCountdown(p => p > 1 ? p - 1 : 1), 1000);

    try {
      const fullData = await deepDiveIdea(idea, selectedModel);
      onUpdateIdea({ ...idea, ...fullData, isAnalyzed: true, isPublished: true, publishedAt: new Date().toISOString() });
    } catch (e) {
        console.error("Deep Dive Error:", e);
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12 pb-40 animate-slide-up">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 font-bold uppercase text-[9px] tracking-widest transition-all">
            <ArrowLeft size={12} /> <span className="hidden sm:inline">К списку идей</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest opacity-60">
              <Command size={12} /> <span>OpenRouter Audit</span>
          </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-5xl border border-black/5 dark:border-white/10 p-6 md:p-10 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg text-white"><Rocket size={18} /></div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500">{idea.title}</span>
              </div>
              <h1 className="text-xl md:text-3xl font-bold heading-refined leading-tight tracking-tight mb-4 max-w-3xl">{idea.problemStatement}</h1>
              <div className="flex items-center gap-4 text-[10px] font-bold opacity-40 italic">
                <span>ROI: {idea.roiEstimate}</span>
                <span>•</span>
                <span>Model: {selectedModel.split('/')[1]}</span>
              </div>
          </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
          <h2 className="text-lg font-bold">{statusMsg}</h2>
          <p className="text-xs opacity-40 mt-2 italic">Анализируем через {selectedModel}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-3xl sticky top-4 md:top-6 z-30 shadow-2xl">
              {[
                { id: 'diagnostic', label: 'Аудит', icon: ShieldAlert },
                { id: 'mvp', label: 'Модули', icon: Wallet },
                { id: 'roadmap', label: 'План', icon: Map },
                { id: 'investor', label: 'Инвестор', icon: TrendingUp },
                { id: 'seo', label: 'Рынок', icon: Search }
              ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[8px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}>
                      <tab.icon size={12} /> <span>{tab.label}</span>
                  </button>
              ))}
          </div>

          <div className="animate-fade-in min-h-[40vh]">
            {activeTab === 'diagnostic' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(idea.diagnostic?.groups || []).map(group => (
                  <div key={group.id} className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <h4 className="font-bold uppercase text-[9px] tracking-widest opacity-30 mb-4">{group.title}</h4>
                    <div className="space-y-6">
                      {(group.problems || []).map((p, i) => (
                        <div key={i}>
                          <p className="font-bold text-xs mb-2 leading-snug">{p.issue}</p>
                          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] italic text-red-500/80 leading-relaxed mb-4">
                            {p.rootCause} <br/> <b>Потери: {p.metrics?.financialLoss}</b>
                          </div>
                          <EffectCalculator problem={p} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'mvp' && (
              <div className="space-y-4">
                {(idea.microIdeas || []).map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">{i+1}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base mb-1">{item.title}</h4>
                      <p className="text-xs opacity-50 mb-3">{item.description}</p>
                      <div className="flex gap-4 text-[9px] font-bold uppercase text-blue-500">
                        <span className="flex items-center gap-1"><Clock size={10}/> {item.hours}ч</span>
                        <span className="flex items-center gap-1"><DollarSign size={10}/> {item.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'investor' && (
              <div className="bg-white dark:bg-white/5 p-8 rounded-5xl border border-black/5 dark:border-white/10">
                <h3 className="text-xl font-bold mb-6">Оффер для инвестора</h3>
                <p className="text-lg italic opacity-80 leading-relaxed mb-8">"{idea.investorProposal?.pitch}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10">
                    <span className="text-[9px] font-bold text-green-500 uppercase block mb-2">Для инвестора</span>
                    <p className="text-xs font-medium">{idea.investorProposal?.investorBenefit}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                    <span className="text-[9px] font-bold text-blue-500 uppercase block mb-2">Для основателя</span>
                    <p className="text-xs font-medium">{idea.investorProposal?.initiatorBenefit}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'seo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(idea.searchQueries || []).map((q, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold block">{q.query}</span>
                      <span className="text-[8px] font-bold opacity-30 uppercase">Competition: {q.competition}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] opacity-30 block">Volume/mo</span>
                      <span className="text-xl font-black text-blue-500">{q.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
