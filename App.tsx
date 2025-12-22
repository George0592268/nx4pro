
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
  Search, Briefcase, Timer, AlertCircle, XCircle, Command, LayoutGrid, Database, Activity, Sun, Moon, Sparkles, ChevronRight, ShieldCheck, Zap, Target, TrendingUp, Presentation, BarChart3
} from 'lucide-react';

export default function App() {
  const [industries, setIndustries] = useState<IndustryNode[]>(INITIAL_INDUSTRIES);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [userRole, setUserRole] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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

  // Welcome Screen
  if (viewState === ViewState.WELCOME) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
        <div className="absolute top-12 right-12 z-20">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>

        {/* Dynamic Background Blurs */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl w-full text-center space-y-16 animate-slide-up relative z-10">
           <div className="flex justify-center">
             <div className="p-5 bg-blue-600 rounded-[2.5rem] shadow-3xl text-white transform hover:rotate-6 transition-transform">
               <Command size={56} />
             </div>
           </div>
           
           <div className="space-y-6">
             <h1 className="text-5xl md:text-8xl font-bold tracking-tight heading-refined leading-none">IdeaForge</h1>
             <p className="text-xl md:text-3xl opacity-60 font-medium max-w-3xl mx-auto body-refined italic leading-tight">
               Операционная система для запуска IT-продуктов внутри вашего бизнеса. Мы автоматизируем поиск идей, аудит и создание офферов.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Target size={24}/></div>
                <h3 className="text-lg font-bold tracking-tight">Поиск ниши</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">Мгновенный подбор IT-решений под боли вашей отрасли.</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center"><Activity size={24}/></div>
                <h3 className="text-lg font-bold tracking-tight">Глубокий аудит</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">Расчет ROI, SEO-спроса и детальная дорожная карта.</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><Presentation size={24}/></div>
                <h3 className="text-lg font-bold tracking-tight">Инвест-оффер</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">Готовое предложение для партнеров с визуализацией.</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center"><ShieldCheck size={24}/></div>
                <h3 className="text-lg font-bold tracking-tight">Защита идей</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">Нейронный анализ исключает заведомо провальные гипотезы.</p>
              </div>
           </div>

           <div className="pt-8">
             <button 
               onClick={() => setViewState(ViewState.INDUSTRIES)}
               className="group bg-blue-600 hover:bg-blue-500 text-white px-16 py-7 rounded-full font-bold text-2xl transition-all shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 flex items-center gap-6 mx-auto"
             >
               Начать трансформацию <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] opacity-30">Powered by Gemini 3 Deep Intel</p>
           </div>
        </div>
      </div>
    );
  }

  // Onboarding condition
  if (viewState === ViewState.INDUSTRIES && !userRole && !customContext) {
    return <Onboarding onComplete={(data) => {
      setUserRole(data.purpose);
      setCustomContext(`Бизнес-цель: ${data.purpose}. Проблема: ${data.irritation}.`);
      setViewState(ViewState.INDUSTRIES);
    }} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
      <aside className={`w-[320px] bg-opacity-70 backdrop-blur-3xl border-r border-opacity-10 transition-all duration-700 flex flex-col z-30 ${viewState === ViewState.LANDING_GENERATOR ? '-ml-[320px]' : ''} ${isDarkMode ? 'border-white/10 bg-black/80' : 'border-black/5 bg-white/80'}`}>
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setViewState(ViewState.WELCOME)} className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-70 transition-all">
               <Command size={24} className="text-blue-500" />
               <span className="heading-refined">IdeaForge</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <p className="text-[10px] font-bold tracking-[0.05em] uppercase opacity-30 italic">Intelligence OS</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
            <nav className="space-y-1">
                <button 
                    onClick={() => { setViewState(ViewState.INDUSTRIES); setError(null); }} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.INDUSTRIES ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <LayoutGrid size={18} /> <span>Конструктор</span>
                </button>
                <button 
                    onClick={() => setViewState(ViewState.CATALOG)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.CATALOG ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <Database size={18} /> <span>Каталог ({generatedIdeas.length})</span>
                </button>
                <button 
                    onClick={() => setViewState(ViewState.PRIORITY_MATRIX)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === ViewState.PRIORITY_MATRIX ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                    <BarChart3 size={18} /> <span>Приоритеты</span>
                </button>
            </nav>

            <div className="space-y-6 pt-6 border-t border-opacity-10">
                <div>
                    <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3 block">Контекст и роль</label>
                    <input 
                      type="text" 
                      value={userRole} 
                      onChange={(e) => setUserRole(e.target.value)} 
                      placeholder="Ваша роль (напр. CEO)" 
                      className={`w-full p-4 rounded-xl text-sm font-medium border transition-all outline-none focus:ring-1 ${isDarkMode ? 'bg-white/5 border-white/10 focus:ring-white/20' : 'bg-black/5 border-black/5 focus:ring-black/10'}`} 
                    />
                </div>
                <div>
                    <textarea 
                      value={customContext} 
                      onChange={(e) => setCustomContext(e.target.value)} 
                      placeholder="Опишите ситуацию..." 
                      className={`w-full h-32 p-4 rounded-xl text-sm font-medium border transition-all outline-none resize-none focus:ring-1 ${isDarkMode ? 'bg-white/5 border-white/10 focus:ring-white/20' : 'bg-black/5 border-black/5 focus:ring-black/10'}`} 
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

        <div className="p-6 border-t border-opacity-10">
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

      <main className="flex-1 overflow-y-auto relative animate-slide-up">
        {error && (
          <div className="m-8 p-8 rounded-3xl border border-red-500/10 bg-red-500/5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
               <AlertCircle className="text-red-500" size={24} />
               <div>
                 <h4 className="font-bold text-red-500 text-sm uppercase tracking-wide">{error.title}</h4>
                 <p className="text-sm opacity-60 font-medium">{error.msg}</p>
               </div>
            </div>
            <button onClick={() => setError(null)} className="opacity-20 hover:opacity-100 transition-all"><XCircle size={24}/></button>
          </div>
        )}

        {viewState === ViewState.INDUSTRIES && !error && (
           <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-12 max-w-4xl mx-auto">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                <Activity size={40} className="text-blue-500"/>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold heading-refined tracking-tight">Конструктор стратегии</h1>
                <p className="text-lg opacity-40 max-w-xl mx-auto body-refined font-medium italic">Выберите отрасли и процессы слева. Нажмите "Сгенерировать", чтобы запустить ИИ-аудит вашего бизнеса.</p>
              </div>
           </div>
        )}

        {viewState === ViewState.IDEAS && (
          <div className="p-8 md:p-16 max-w-[1600px] mx-auto">
            <header className="flex items-center justify-between mb-12">
               <div>
                <h2 className="text-3xl md:text-4xl font-bold heading-refined mb-2 tracking-tight">Рыночные гипотезы</h2>
                <p className="opacity-40 font-medium italic">Результаты нейронного анализа вашей ниши</p>
               </div>
               {isGenerating && (
                 <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/10">
                   <Timer size={14} className="animate-spin" /> Обработка данных...
                 </div>
               )}
            </header>

            {isGenerating && generatedIdeas.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-[400px] rounded-5xl border animate-pulse ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}></div>
                  ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                    {generatedIdeas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />
                    ))}
                </div>
            )}
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
           <div className="p-8 md:p-16 max-w-[1600px] mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold heading-refined mb-8 tracking-tight">Архив идей</h2>
              {generatedIdeas.length === 0 ? (
                 <p className="opacity-30 italic">Список пока пуст. Сгенерируйте свои первые гипотезы в конструкторе.</p>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
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
