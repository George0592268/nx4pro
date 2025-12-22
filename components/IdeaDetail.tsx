
import React, { useState, useEffect, useRef } from 'react';
import { Idea } from '../types';
import { deepDiveIdea } from '../services/geminiService';
import { 
  ArrowLeft, ShieldAlert, Wallet, Map, TrendingUp, Search, Timer, 
  Rocket, Activity, Cpu, Lock, Info, AlertTriangle
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
  const [statusMsg, setStatusMsg] = useState("Нейро-сканирование бизнес-процессов...");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!idea.isAnalyzed) runFullAnalysis();
  }, [idea.id]);

  const runFullAnalysis = async () => {
    setLoading(true);
    const messages = [
      "Вскрываем скрытые финансовые течи...",
      "Анализируем психологию персонала...",
      "Формируем ForgeProtocol Smart-Deal...",
      "Проектируем дорожную карту внедрения...",
      "Генерируем SEO-стратегию захвата рынка..."
    ];
    let idx = 0;
    const msgInterval = setInterval(() => setStatusMsg(messages[idx++ % messages.length]), 4000);
    timerRef.current = window.setInterval(() => setCountdown(p => p > 1 ? p - 1 : 1), 1000);

    try {
      const fullData = await deepDiveIdea(idea);
      // Ensure we don't overwrite the basic info but add the deep dive data
      onUpdateIdea({ 
        ...idea, 
        ...fullData, 
        isAnalyzed: true, 
        isPublished: true, 
        publishedAt: new Date().toISOString() 
      });
    } catch (e) {
        console.error("Deep Dive Component Error:", e);
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 text-center animate-fade-in bg-slate-50 min-h-screen">
        <div className="w-24 h-24 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-8 flex items-center justify-center font-black text-blue-600 italic">
            {countdown}с
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-4 tracking-tighter">{statusMsg}</h2>
        <p className="text-slate-400 font-medium max-w-sm italic">Строим фундамент вашего нового IT-актива в ForgeProtocol...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 pb-32 font-sans animate-fade-in">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase italic text-[11px] transition-colors">
            <ArrowLeft size={16} /> К списку идей
          </button>
          <div className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-blue-100 flex items-center gap-2 shadow-sm">
              <Lock size={12} /> ForgeProtocol Engine v2.5 Verified
          </div>
      </div>

      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
              <div className="mb-10">
                  <div className="text-red-400 font-black text-[11px] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldAlert size={16} /> Подтвержденный убыток бизнеса
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] max-w-5xl mb-8">{idea.problemStatement}</h1>
                  <div className="flex flex-wrap gap-3 mb-10">
                      {idea.rootCauses?.map((rc, i) => (
                          <span key={i} className="bg-white/5 border border-white/10 px-5 py-2 rounded-2xl text-[11px] font-bold italic text-slate-300">
                             Причина: {rc}
                          </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><Rocket size={32} /></div>
                      <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Цифровой актив</p>
                          <h2 className="text-2xl font-black italic uppercase text-white">{idea.title}</h2>
                      </div>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10">
                  <div>
                      <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">ROI Собственника</div>
                      <div className="text-3xl font-black text-green-400 tracking-tighter italic">∞ (Smart-Deal)</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Ваша нагрузка</div>
                      <div className="text-2xl font-black text-blue-400 uppercase italic tracking-tighter">Контроль (-80%)</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Риск по сделке</div>
                      <div className="text-2xl font-black text-amber-400 uppercase italic tracking-tighter">Гарантирован</div>
                  </div>
                  <div>
                      <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Статус</div>
                      <div className="text-2xl font-black text-white italic tracking-tighter uppercase">Готов к MVP</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Tabs UI */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-[3rem] sticky top-6 z-30 border border-slate-200 backdrop-blur-xl shadow-2xl">
          {[
            { id: 'diagnostic', label: 'Анализ первопричин', icon: ShieldAlert },
            { id: 'mvp', label: 'Смета модулей', icon: Wallet },
            { id: 'roadmap', label: 'План внедрения', icon: Map },
            { id: 'investor', label: 'Forge (Инвестиции)', icon: TrendingUp },
            { id: 'seo', label: 'Масштаб (SEO)', icon: Search }
          ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 rounded-[2rem] font-black text-[10px] transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-2xl scale-[1.03]' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
              >
                  <tab.icon size={16} /> {tab.label.toUpperCase()}
              </button>
          ))}
      </div>

      <div className="animate-fade-in min-h-[600px]">
          {activeTab === 'diagnostic' && (
              <div className="space-y-10">
                  <div className="bg-white p-14 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 bg-red-500 h-full"></div>
                      <h3 className="text-3xl font-black uppercase italic mb-10 flex items-center gap-4 tracking-tighter">
                          <Activity className="text-red-500" /> Почему ваш бизнес теряет деньги (Диагностика)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {idea.diagnostic?.groups.map(group => (
                              <div key={group.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col hover:border-red-200 transition-all group">
                                  <h4 className="text-xl font-black uppercase italic mb-8 text-slate-800 border-b border-slate-200 pb-4 group-hover:text-red-600 transition-colors">{group.title}</h4>
                                  <div className="space-y-8">
                                      {group.problems.map((p, i) => (
                                          <div key={i} className="flex flex-col gap-3">
                                              <p className="text-sm font-black text-slate-700 leading-tight uppercase tracking-tight">{p.issue}</p>
                                              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-[12px] font-bold italic text-red-700 flex gap-2">
                                                  <AlertTriangle size={14} className="shrink-0" />
                                                  <span><span className="font-black uppercase text-[10px] block mb-1">Первопричина:</span> {p.rootCause}</span>
                                              </div>
                                              <div className="text-[11px] font-black text-red-600 uppercase flex items-center gap-2 pt-2">
                                                <TrendingUp size={14}/> Финансовый урон: {p.metrics.financialLoss}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )) || <div className="col-span-full py-20 text-center italic text-slate-400">Данные диагностики не были сгенерированы. Попробуйте обновить.</div>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'mvp' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {idea.microIdeas?.map((m, i) => (
                      <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-full hover:border-blue-500 transition-all hover:shadow-2xl group">
                          <div className="flex justify-between items-start mb-8">
                              <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest group-hover:bg-blue-600 transition-colors">Module 0{i+1}</span>
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m.priority}</span>
                          </div>
                          <h4 className="text-2xl font-black uppercase italic mb-6 leading-none tracking-tighter group-hover:text-blue-600 transition-colors">{m.title}</h4>
                          <p className="text-sm text-slate-500 font-medium mb-12 flex-grow leading-relaxed italic">{m.description}</p>
                          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                              <div>
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Стоимость (RUB)</div>
                                  <div className="text-2xl font-black text-slate-900">{m.cost}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Трудозатраты</div>
                                  <div className="text-sm font-black text-slate-900 uppercase italic">{m.hours}ч DEV</div>
                              </div>
                          </div>
                      </div>
                  )) || <div className="col-span-full py-20 text-center italic text-slate-400">Смета не сгенерирована.</div>}
              </div>
          )}

          {activeTab === 'roadmap' && (
              <div className="space-y-8">
                  {idea.roadmap?.map((step, i) => (
                      <div key={i} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-12 group hover:bg-slate-900 transition-all duration-700">
                          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shrink-0 font-black text-4xl italic shadow-2xl group-hover:bg-white group-hover:text-slate-900 transition-all">
                              0{i+1}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-white transition-colors">{step.phase}</h4>
                                  <span className="bg-blue-50 text-blue-600 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-blue-100 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20 transition-all">{step.duration}</span>
                              </div>
                              <p className="text-slate-500 text-[15px] font-medium mb-8 leading-relaxed italic group-hover:text-slate-300 transition-colors">{step.description}</p>
                              <div className="flex flex-wrap gap-3">
                                  {step.tasks.map((t, idx) => (
                                      <span key={idx} className="bg-slate-100 text-[10px] font-black text-slate-600 px-4 py-2 rounded-2xl uppercase tracking-widest border border-slate-200 group-hover:bg-white/5 group-hover:text-white group-hover:border-white/10 transition-all">• {t}</span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'investor' && (
              <div className="space-y-10">
                  <div className="bg-blue-600 text-white p-16 rounded-[5rem] shadow-[0_40px_100px_rgba(37,99,235,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150"><Cpu size={300} /></div>
                      <div className="relative z-10">
                          <h3 className="text-5xl font-black uppercase italic mb-10 leading-none tracking-tighter">ForgeProtocol Smart-Deal:<br/> Снижение затрат Собственника</h3>
                          <div className="text-2xl font-bold italic mb-16 max-w-4xl leading-snug text-blue-50 border-l-[12px] border-white pl-10">
                              «Ваш бизнес — это полигон. Ваша боль — это запрос на продукт. Инвесторы финансируют разработку, а вы получаете готовое решение бесплатно в обмен на долю в созданном IT-активе».
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-12 mb-12">
                              <div className="bg-white/10 p-12 rounded-[4rem] border border-white/20 backdrop-blur-2xl">
                                  <div className="text-[12px] font-black text-blue-200 uppercase mb-6 tracking-widest">Выгода Собственника (Initiator)</div>
                                  <p className="font-bold text-xl italic leading-relaxed text-white">
                                    {idea.investorProposal?.initiatorBenefit || "Полное устранение болей бизнеса без капитальных затрат. Получение миноритарной доли в SaaS-сервисе."}
                                  </p>
                              </div>
                              <div className="bg-white/10 p-12 rounded-[4rem] border border-white/20 backdrop-blur-2xl">
                                  <div className="text-[12px] font-black text-green-300 uppercase mb-6 tracking-widest">Оффер Инвесторам (Backers)</div>
                                  <p className="font-bold text-xl italic leading-relaxed text-white">
                                    {idea.investorProposal?.investorBenefit || "Доля в IT-продукте с подтвержденным спросом и первым крупным клиентом в лице собственника."}
                                  </p>
                              </div>
                          </div>
                          
                          <div className="bg-slate-950/80 p-12 rounded-[4rem] border border-white/10 backdrop-blur-xl">
                              <div className="flex items-center gap-4 mb-8">
                                  <Lock className="text-amber-400" size={24} />
                                  <span className="text-[13px] font-black uppercase text-amber-400 tracking-widest">Механика Смарт-Контракта ForgeProtocol</span>
                              </div>
                              <p className="font-mono text-[13px] text-slate-300 leading-relaxed italic">
                                  {idea.investorProposal?.smartContractTerms || "Автоматическое распределение долей 30/70. Выплата дивидендов через реестр Forge DAO. Аудит разработки в реальном времени."}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'seo' && (
              <div className="space-y-12">
                  <div className="bg-white p-16 rounded-[5rem] border border-slate-200 shadow-sm">
                      <h4 className="text-5xl font-black uppercase italic mb-16 tracking-tighter">SEO-архитектура захвата рынка</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {idea.searchQueries?.map((q, i) => (
                              <div key={i} className="flex items-center justify-between p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all">
                                  <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl italic shadow-2xl group-hover:bg-blue-600 transition-colors">{i+1}</div>
                                      <span className="font-black uppercase italic tracking-tighter text-slate-800 text-xl leading-none">{q.query}</span>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Запросы / мес</div>
                                      <div className="font-black text-blue-600 text-2xl tracking-tighter">{q.volume}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <button onClick={() => onGenerateLanding(idea)} className="w-full bg-slate-900 text-white py-14 rounded-[6rem] font-black uppercase italic text-3xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all flex items-center justify-center gap-8 hover:scale-[1.02] active:scale-[0.98]">
                      <Rocket size={48} /> Создать страницу для партнеров (Investors Page)
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};
