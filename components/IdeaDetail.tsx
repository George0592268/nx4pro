
import React, { useState, useEffect, useRef } from 'react';
import { Idea } from '../types';
import { deepDiveIdea } from '../services/geminiService';
import { 
  ArrowLeft, ShieldAlert, Wallet, Map, TrendingUp, Search, Timer, 
  Rocket, Activity, Command, ExternalLink, Globe, CheckCircle2, ListChecks, Clock, DollarSign, ChevronRight
} from 'lucide-react';

interface Props {
  idea: Idea;
  onBack: () => void;
  onUpdateIdea: (idea: Idea) => void;
  onGenerateLanding: (idea: Idea) => void;
}

export const IdeaDetail: React.FC<Props> = ({ idea, onBack, onUpdateIdea, onGenerateLanding }) => {
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
    const messages = [
      "Сканирование рынка...", 
      "Проектирование архитектуры...", 
      "Расчет финансовых моделей...", 
      "Поиск инсайтов в реальном времени...", 
      "Финальная сборка решения..."
    ];
    let idx = 0;
    const msgInterval = setInterval(() => setStatusMsg(messages[idx++ % messages.length]), 4000);
    timerRef.current = window.setInterval(() => setCountdown(p => p > 1 ? p - 1 : 1), 1000);

    try {
      const fullData = await deepDiveIdea(idea);
      if (fullData && Object.keys(fullData).length > 0) {
        onUpdateIdea({ 
          ...idea, 
          ...fullData, 
          isAnalyzed: true, 
          isPublished: true, 
          publishedAt: new Date().toISOString() 
        });
      }
    } catch (e) {
        console.error("Deep Dive Error:", e);
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const groundingSources = Array.isArray((idea as any).groundingSources) ? (idea as any).groundingSources : [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center animate-slide-up px-6">
        <div className="relative mb-8">
            <div className="w-20 h-20 border-[2px] border-black/5 dark:border-white/5 rounded-full flex items-center justify-center font-bold text-blue-500 text-xl tracking-tighter">
                {countdown}
            </div>
            <div className="absolute inset-0 border-t-[2px] border-blue-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold heading-refined mb-4 tracking-tight">{statusMsg}</h2>
        <p className="opacity-30 text-sm font-medium italic">IdeaForge Engine Processing...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12 pb-40 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 opacity-40 hover:opacity-100 font-bold uppercase text-[9px] tracking-widest transition-all">
            <ArrowLeft size={12} /> <span className="hidden sm:inline">К списку идей</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest opacity-60">
              <Command size={12} /> <span>Аудит v3.1</span>
          </div>
      </div>

      {/* Main Title Hero */}
      <div className="bg-white dark:bg-white/5 rounded-4xl md:rounded-5xl border border-black/5 dark:border-white/10 p-6 md:p-10 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-blue-500 rounded-full blur-[80px] md:blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg text-white"><Rocket size={18} /></div>
                  <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500">Рекомендуемое решение</span>
                      <h2 className="text-sm md:text-base font-bold heading-refined opacity-80">{idea.title}</h2>
                  </div>
              </div>
              <h1 className="text-xl md:text-3xl font-bold heading-refined leading-tight tracking-tight mb-4 max-w-3xl">{idea.problemStatement}</h1>
              <p className="opacity-40 text-[10px] md:text-xs italic font-medium">Прогноз окупаемости: {idea.roiEstimate}</p>
          </div>
      </div>

      {/* Grounding / Sources */}
      {groundingSources.length > 0 && (
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 md:p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-3 text-blue-500">
                  <Globe size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Рыночные подтверждения</span>
              </div>
              <div className="flex flex-wrap gap-2">
                  {groundingSources.map((source: any, idx: number) => (
                      <a key={idx} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 px-2 md:px-3 py-1.5 rounded-lg text-[9px] font-bold hover:bg-blue-500 hover:text-white transition-all max-w-full overflow-hidden">
                          <ExternalLink size={10} className="shrink-0" /> <span className="truncate">{source.web?.title || 'Источник'}</span>
                      </a>
                  ))}
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-3xl sticky top-4 md:top-6 z-30 shadow-2xl">
          {[
            { id: 'diagnostic', label: 'Аудит', icon: ShieldAlert },
            { id: 'mvp', label: 'Модули', icon: Wallet },
            { id: 'roadmap', label: 'План', icon: Map },
            { id: 'investor', label: 'Инвестор', icon: TrendingUp },
            { id: 'seo', label: 'Рынок', icon: Search }
          ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 md:py-2.5 rounded-xl font-bold text-[7px] sm:text-[8px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-md scale-[1.01]' : 'opacity-40 hover:opacity-100'}`}
              >
                  <tab.icon size={12} /> <span>{tab.label}</span>
              </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in min-h-[40vh]">
          {activeTab === 'diagnostic' && (
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-4xl md:rounded-5xl border border-black/5 dark:border-white/10">
                  <h3 className="text-lg md:text-xl font-bold heading-refined mb-6 md:mb-8 flex items-center gap-3">
                      <Activity size={20} className="text-red-500" /> Диагностика системы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {(Array.isArray(idea.diagnostic?.groups) && idea.diagnostic!.groups.length > 0) ? (
                        idea.diagnostic!.groups.map(group => (
                          <div key={group.id} className="p-5 md:p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <h4 className="font-bold uppercase text-[9px] tracking-widest opacity-30 mb-4 border-b border-black/5 dark:border-white/5 pb-2">{group.title}</h4>
                              <div className="space-y-4">
                                  {(Array.isArray(group.problems) ? group.problems : []).map((p, i) => (
                                      <div key={i}>
                                          <p className="font-bold text-xs mb-2 opacity-90 leading-snug">{p.issue}</p>
                                          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] italic text-red-500/80 leading-relaxed">
                                              {p.rootCause} <br/> <span className="text-[9px] font-bold mt-2 block opacity-60">Потери: {p.metrics?.financialLoss}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 py-16 text-center opacity-30 italic text-sm">Данные диагностики отсутствуют</div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'mvp' && (
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-4xl md:rounded-5xl border border-black/5 dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 className="text-lg md:text-xl font-bold heading-refined flex items-center gap-3">
                        <ListChecks size={20} className="text-blue-500" /> Архитектура модулей
                    </h3>
                    <div className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] italic">
                        Рекомендуемая последовательность внедрения
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                      {(Array.isArray(idea.microIdeas) && idea.microIdeas.length > 0) ? (
                        idea.microIdeas.map((item, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-4 p-5 md:p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 group hover:border-blue-500/30 transition-all duration-300">
                              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg">
                                {i + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="font-bold text-base md:text-lg heading-refined">{item.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${item.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {item.priority}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm opacity-60 font-medium leading-relaxed max-w-3xl">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap gap-6 pt-2 text-[10px] font-bold uppercase tracking-widest">
                                  <div className="flex items-center gap-2 text-blue-500">
                                    <Clock size={12} />
                                    <span>Ресурс: {item.hours || '0'} часов</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-green-500">
                                    <DollarSign size={12} />
                                    <span>Стоимость: {item.cost || 'Расчет...'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="hidden md:flex items-center">
                                <ChevronRight className="opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-16 text-center opacity-30 italic text-sm">Данные о модулях отсутствуют</div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'roadmap' && (
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-4xl md:rounded-5xl border border-black/5 dark:border-white/10">
                  <h3 className="text-lg md:text-xl font-bold heading-refined mb-8 flex items-center gap-3">
                      <Map size={20} className="text-orange-500" /> Карта внедрения
                  </h3>
                  <div className="space-y-1">
                      {(Array.isArray(idea.roadmap) && idea.roadmap.length > 0) ? (
                        idea.roadmap.map((step, i) => (
                          <div key={i} className="flex gap-4 md:gap-6 relative">
                              <div className="flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 z-10">{i + 1}</div>
                                  {i < (idea.roadmap?.length || 0) - 1 && <div className="w-px h-full bg-black/5 dark:bg-white/5 absolute top-6"></div>}
                              </div>
                              <div className="pb-8 pt-0.5 flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h4 className="font-bold text-base md:text-lg heading-refined">{step.phase}</h4>
                                    <span className="text-[9px] font-bold opacity-30 italic">{step.duration}</span>
                                  </div>
                                  <p className="text-xs md:text-sm opacity-50 font-medium mb-3 leading-relaxed">{step.description}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                      {(Array.isArray(step.tasks) ? step.tasks : []).map((t, ti) => (
                                          <span key={ti} className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-[8px] font-bold uppercase tracking-wider border border-black/5 dark:border-white/5">{t}</span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-16 text-center opacity-30 italic text-sm">План внедрения не сформирован</div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'investor' && (
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-4xl md:rounded-5xl border border-black/5 dark:border-white/10">
                  <h3 className="text-lg md:text-xl font-bold heading-refined mb-8 flex items-center gap-3">
                      <TrendingUp size={20} className="text-green-500" /> Инвестиционное предложение
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-6">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-2 block">Питч</span>
                            <p className="text-base md:text-lg font-medium leading-relaxed italic opacity-80">{idea.investorProposal?.pitch || "Готовим питч..."}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-5 rounded-3xl bg-green-500/5 border border-green-500/10">
                                  <span className="text-[9px] font-bold uppercase text-green-500 tracking-widest mb-2 block">Для инвестора</span>
                                  <p className="text-xs font-bold leading-relaxed">{idea.investorProposal?.investorBenefit || "Расчет выгоды..."}</p>
                              </div>
                              <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                  <span className="text-[9px] font-bold uppercase text-blue-500 tracking-widest mb-2 block">Для собственника</span>
                                  <p className="text-xs font-bold leading-relaxed">{idea.investorProposal?.initiatorBenefit || "Расчет выгоды..."}</p>
                              </div>
                          </div>
                      </div>
                      <div className="p-5 md:p-6 rounded-3xl md:rounded-4xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <h4 className="font-bold text-xs mb-5 heading-refined opacity-80 tracking-wide uppercase">Финансовые показатели</h4>
                          <div className="space-y-3 mb-6">
                              {(Array.isArray(idea.investorProposal?.financialHighlights) && idea.investorProposal!.financialHighlights.length > 0) ? (
                                idea.investorProposal!.financialHighlights.map((fh, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                      <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                                      <span className="text-[10px] md:text-xs font-medium opacity-70 leading-relaxed">{fh}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] opacity-30 italic">Идет расчет ROI...</p>
                              )}
                          </div>
                          <div className="pt-4 border-t border-black/5 dark:border-white/5">
                              <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-2 block">Протокольные условия</span>
                              <p className="text-[9px] font-medium italic opacity-50">{idea.investorProposal?.smartContractTerms || "Формируем условия..."}</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'seo' && (
              <div className="space-y-6">
                  <div className="bg-black text-white dark:bg-white/5 p-6 md:p-8 rounded-4xl md:rounded-5xl shadow-2xl">
                      <h4 className="text-lg md:text-xl font-bold heading-refined mb-6 tracking-tight">Рыночный спрос (Live)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          {(Array.isArray(idea.searchQueries) && idea.searchQueries.length > 0) ? (
                            idea.searchQueries.map((q, i) => (
                              <div key={i} className="flex items-center justify-between p-4 md:p-5 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                  <div className="flex flex-col min-w-0 pr-4">
                                      <span className="text-xs md:text-sm font-bold italic heading-refined truncate">{q.query}</span>
                                      <span className="text-[8px] font-bold uppercase opacity-30 mt-1">Competition: {q.competition}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <div className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Vol/mo</div>
                                      <div className="font-bold text-lg md:text-xl tracking-tight text-white">{q.volume}</div>
                                  </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 py-10 text-center opacity-30 italic text-sm">Запросы не найдены</div>
                          )}
                      </div>
                  </div>
                  <button 
                    onClick={() => onGenerateLanding(idea)} 
                    className="w-full bg-blue-600 text-white py-5 md:py-6 rounded-full font-bold uppercase tracking-[0.2em] text-sm md:text-base shadow-3xl hover:bg-blue-500 transition-all hover:scale-101 active:scale-95 flex items-center justify-center gap-3"
                  >
                      <Rocket size={20} /> <span>Генерировать оффер-страницу</span>
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};
