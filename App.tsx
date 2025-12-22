
import React, { useState, useEffect, useRef } from 'react';
import { IndustryTree } from './components/IndustryTree';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetail } from './components/IdeaDetail';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { PriorityMatrix } from './components/PriorityMatrix';
import { INITIAL_INDUSTRIES } from './constants';
import { IndustryNode, Idea, ViewState } from './types';
import { generateIdeasForIndustries } from './services/geminiService';
import { 
  Menu, X, Search, Briefcase, Timer, AlertCircle, XCircle, Command, LayoutGrid, Database, Activity, Sun, Moon, Sparkles, ChevronRight, ShieldCheck, Zap, Target, TrendingUp, Presentation, BarChart3
} from 'lucide-react';

export default function App() {
  const [industries, setIndustries] = useState<IndustryNode[]>(INITIAL_INDUSTRIES);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [userRole, setUserRole] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [viewState, setViewState] = useState<ViewState>(ViewState.WELCOME);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{title: string, msg: string, isQuota?: boolean} | null>(null);
  const [countdown, setCountdown] = useState(30);
  
  const timerRef = useRef<number | null>(null);
  const apiKeyExists = !!process.env.API_KEY;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isGenerating) {
        setCountdown(30);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isGenerating]);

  const handleGenerateIdeas = async () => {
    setError(null);
    const selected = industries.filter(i => i.selected).map(i => i.label);
    
    if (!apiKeyExists) {
        setError({ title: "Ошибка ключа", msg: "API KEY не обнаружен." });
        return;
    }

    setIsGenerating(true);
    setViewState(ViewState.IDEAS);
    setIsSidebarOpen(false);

    try {
        const ideas = await generateIdeasForIndustries(
            selected, 
            "All Departments", 
            customContext, 
            "Growth", 
            userRole || "Собственник"
        );
        setGeneratedIdeas(ideas);
    } catch (e: any) {
        const isQuota = e.message.includes("429") || e.message.includes("quota");
        setError({ title: "Анализ прерван", msg: isQuota ? "Лимит API. Подождите." : e.message, isQuota });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAddSubIndustry = (parentId: string, newNodes: IndustryNode[]) => {
    setIndustries(prev => {
      const updateNodes = (nodes: IndustryNode[]): IndustryNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) return { ...node, children: [...(node.children || []), ...newNodes] };
          if (node.children) return { ...node, children: updateNodes(node.children) };
          return node;
        });
      };
      return updateNodes(prev);
    });
  };

  const switchView = (view: ViewState) => {
    setViewState(view);
    setIsSidebarOpen(false);
  };

  // Welcome Screen
  if (viewState === ViewState.WELCOME) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl w-full text-center space-y-12 md:space-y-16 animate-slide-up relative z-10">
           <div className="flex justify-center">
             <div className="p-4 md:p-5 bg-blue-600 rounded-3xl md:rounded-[2.5rem] shadow-3xl text-white transform hover:rotate-6 transition-transform">
               <Command size={40} className="md:w-14 md:h-14" />
             </div>
           </div>
           
           <div className="space-y-4 md:space-y-6">
             <h1 className="text-4xl md:text-8xl font-bold tracking-tight heading-refined leading-none">IdeaForge</h1>
             <p className="text-lg md:text-3xl opacity-60 font-medium max-w-3xl mx-auto body-refined italic leading-tight px-4">
               Операционная система для запуска IT-продуктов внутри вашего бизнеса.
             </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left px-4">
              {[
                { icon: Target, title: "Поиск ниши", desc: "Мгновенный подбор IT-решений под боли отрасли.", color: "text-blue-500" },
                { icon: Activity, title: "Глубокий аудит", desc: "Расчет ROI и детальная дорожная карта.", color: "text-purple-500" },
                { icon: Presentation, title: "Инвест-оффер", desc: "Готовое предложение с визуализацией.", color: "text-green-500" },
                { icon: ShieldCheck, title: "Защита идей", desc: "Нейронный анализ исключает провалы.", color: "text-orange-500" }
              ].map((feature, i) => (
                <div key={i} className="p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm space-y-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 bg-current bg-opacity-10 ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon size={20} className="md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-xs md:text-sm opacity-50 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
           </div>

           <div className="pt-4 md:pt-8 px-4">
             <button 
               onClick={() => switchView(ViewState.INDUSTRIES)}
               className="group w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-16 py-5 md:py-7 rounded-full font-bold text-xl md:text-2xl transition-all shadow-3xl active:scale-95 flex items-center justify-center gap-4 md:gap-6 mx-auto"
             >
               Начать <ChevronRight size={24} className="md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
             </button>
             <p className="mt-6 md:mt-8 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] opacity-30">Powered by Gemini 3 Deep Intel</p>
           </div>
        </div>
      </div>
    );
  }

  if (viewState === ViewState.INDUSTRIES && !userRole && !customContext) {
    return <Onboarding onComplete={(data) => {
      setUserRole(data.purpose);
      setCustomContext(`Бизнес-цель: ${data.purpose}. Проблема: ${data.irritation}.`);
      setViewState(ViewState.INDUSTRIES);
    }} />;
  }

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-black/5 dark:border-white/10 bg-inherit z-50">
          <button onClick={() => setViewState(ViewState.WELCOME)} className="flex items-center gap-2 font-bold text-lg tracking-tight">
             <Command size={20} className="text-blue-500" />
             <span className="heading-refined">IdeaForge</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-600 text-white rounded-lg">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-[280px] md:w-[320px] 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${viewState === ViewState.LANDING_GENERATOR ? 'md:-ml-[320px]' : ''}
        bg-opacity-95 backdrop-blur-3xl border-r border-opacity-10 flex flex-col
        ${isDarkMode ? 'border-white/10 bg-black' : 'border-black/5 bg-white'}
      `}>
        <div className="p-6 md:p-8 pb-4">
          <div className="hidden md:flex items-center justify-between mb-8">
            <button onClick={() => setViewState(ViewState.WELCOME)} className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-70 transition-all">
               <Command size={24} className="text-blue-500" />
               <span className="heading-refined">IdeaForge</span>
            </button>
          </div>
          <p className="text-[10px] font-bold tracking-[0.05em] uppercase opacity-30 italic">Intelligence OS</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <nav className="space-y-1">
                <button 
                    onClick={() => switchView(ViewState.INDUSTRIES)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.INDUSTRIES ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <LayoutGrid size={18} /> <span>Конструктор</span>
                </button>
                <button 
                    onClick={() => switchView(ViewState.CATALOG)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.CATALOG ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <Database size={18} /> <span>Каталог ({generatedIdeas.length})</span>
                </button>
                <button 
                    onClick={() => switchView(ViewState.PRIORITY_MATRIX)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.PRIORITY_MATRIX ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <BarChart3 size={18} /> <span>Приоритеты</span>
                </button>
            </nav>

            <div className="space-y-4 pt-4 border-t border-opacity-10">
                <div>
                    <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest mb-2 block">Ваша роль</label>
                    <input 
                      type="text" 
                      value={userRole} 
                      onChange={(e) => setUserRole(e.target.value)} 
                      placeholder="Напр. CEO" 
                      className={`w-full p-3 rounded-xl text-xs font-medium border transition-all outline-none focus:ring-1 ${isDarkMode ? 'bg-white/5 border-white/10 focus:ring-white/20' : 'bg-black/5 border-black/5 focus:ring-black/10'}`} 
                    />
                </div>
                <div>
                    <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest mb-2 block">Контекст бизнеса</label>
                    <textarea 
                      value={customContext} 
                      onChange={(e) => setCustomContext(e.target.value)} 
                      placeholder="Опишите ситуацию..." 
                      className={`w-full h-24 p-3 rounded-xl text-xs font-medium border transition-all outline-none resize-none focus:ring-1 ${isDarkMode ? 'bg-white/5 border-white/10 focus:ring-white/20' : 'bg-black/5 border-black/5 focus:ring-black/10'}`} 
                    />
                </div>
            </div>

            <div className="pt-2">
              <IndustryTree 
                nodes={industries} 
                onToggleSelect={(id) => setIndustries(prev => prev.map(n => n.id === id ? {...n, selected: !n.selected} : n))} 
                onAddSubIndustry={handleAddSubIndustry} 
              />
            </div>
        </div>

        <div className="p-4 border-t border-opacity-10">
          <button 
            onClick={handleGenerateIdeas} 
            disabled={isGenerating} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-sm transition-all flex justify-center items-center gap-2 hover:bg-blue-500 shadow-lg active:scale-95 disabled:opacity-30"
          >
            {isGenerating ? <Timer size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isGenerating ? `Анализ: ${countdown}с` : 'Сгенерировать идеи'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative animate-slide-up bg-inherit">
        {error && (
          <div className="m-4 md:m-8 p-6 md:p-8 rounded-3xl border border-red-500/10 bg-red-500/5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
               <AlertCircle className="text-red-500 shrink-0" size={24} />
               <div>
                 <h4 className="font-bold text-red-500 text-sm uppercase tracking-wide">{error.title}</h4>
                 <p className="text-xs md:text-sm opacity-60 font-medium">{error.msg}</p>
               </div>
            </div>
            <button onClick={() => setError(null)} className="opacity-20 hover:opacity-100 transition-all p-2"><XCircle size={20}/></button>
          </div>
        )}

        {viewState === ViewState.INDUSTRIES && !error && (
           <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-8 md:space-y-12 max-w-4xl mx-auto">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                <Activity size={32} className="text-blue-500 md:w-10 md:h-10"/>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl md:text-6xl font-bold heading-refined tracking-tight">Конструктор стратегии</h1>
                <p className="text-sm md:text-lg opacity-40 max-w-xl mx-auto body-refined font-medium italic">Выберите отрасли и процессы слева. Нажмите "Сгенерировать", чтобы запустить ИИ-аудит вашего бизнеса.</p>
              </div>
           </div>
        )}

        {viewState === ViewState.IDEAS && (
          <div className="p-6 md:p-16 max-w-[1600px] mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
               <div>
                <h2 className="text-2xl md:text-4xl font-bold heading-refined mb-2 tracking-tight">Рыночные гипотезы</h2>
                <p className="text-xs md:text-base opacity-40 font-medium italic">Результаты нейронного анализа вашей ниши</p>
               </div>
               {isGenerating && (
                 <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-[10px] md:text-xs font-bold border border-blue-500/10 w-fit">
                   <Timer size={14} className="animate-spin" /> Обработка данных...
                 </div>
               )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                {isGenerating && generatedIdeas.length === 0 ? (
                  [1,2,3].map(i => (
                    <div key={i} className={`h-[350px] md:h-[400px] rounded-5xl border animate-pulse ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}></div>
                  ))
                ) : (
                  generatedIdeas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />
                  ))
                )}
            </div>
          </div>
        )}

        {viewState === ViewState.IDEA_DETAIL && selectedIdea && (
            <IdeaDetail 
              idea={selectedIdea} 
              onBack={() => setViewState(ViewState.IDEAS)}
              onUpdateIdea={(i) => { setGeneratedIdeas(prev => prev.map(old => old.id === i.id ? i : old)); setSelectedIdea(i); }}
              onGenerateLanding={(idea) => setViewState(ViewState.LANDING_GENERATOR)}
            />
        )}

        {viewState === ViewState.LANDING_GENERATOR && selectedIdea && (
            <LandingPage idea={selectedIdea} onBack={() => setViewState(ViewState.IDEA_DETAIL)} />
        )}

        {viewState === ViewState.PRIORITY_MATRIX && (
            <PriorityMatrix 
              ideas={generatedIdeas} 
              isDarkMode={isDarkMode} 
              onSelectIdea={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} 
            />
        )}

        {viewState === ViewState.CATALOG && (
           <div className="p-6 md:p-16 max-w-[1600px] mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold heading-refined mb-8 tracking-tight">Архив идей</h2>
              {generatedIdeas.length === 0 ? (
                 <p className="opacity-30 italic">Список пока пуст.</p>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                    {generatedIdeas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />
                    ))}
                </div>
              )}
           </div>
        )}
      </main>
    </div>
  );
}
