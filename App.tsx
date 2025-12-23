
import React, { useState, useEffect, useRef } from 'react';
import { IndustryTree } from './components/IndustryTree';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetail } from './components/IdeaDetail';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { PriorityMatrix } from './components/PriorityMatrix';
import { FeedbackButton } from './components/FeedbackButton';
import { INITIAL_INDUSTRIES } from './constants';
import { IndustryNode, Idea, ViewState, AVAILABLE_MODELS } from './types';
import { generateIdeasForIndustries, checkApiAvailability } from './services/apiService';
import { 
  Menu, X, Search, Briefcase, Timer, AlertCircle, XCircle, Command, LayoutGrid, Database, Activity, Sun, Moon, Sparkles, ChevronRight, ShieldCheck, Zap, Target, TrendingUp, Presentation, BarChart3, Settings as SettingsIcon, Link2, Globe, Cloud, ExternalLink, Cpu, Info
} from 'lucide-react';

export default function App() {
  const [industries, setIndustries] = useState<IndustryNode[]>(INITIAL_INDUSTRIES);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  const [userRole, setUserRole] = useState(() => localStorage.getItem('IF_USER_ROLE') || "");
  const [customContext, setCustomContext] = useState(() => localStorage.getItem('IF_CONTEXT') || "");
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('IF_MODEL') || AVAILABLE_MODELS[0].id);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  
  const [viewState, setViewState] = useState<ViewState>(ViewState.WELCOME);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [countdown, setCountdown] = useState(30);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('IF_USER_ROLE', userRole);
    localStorage.setItem('IF_CONTEXT', customContext);
    localStorage.setItem('IF_MODEL', selectedModel);
  }, [userRole, customContext, selectedModel]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    checkStatus();
  }, [isDarkMode]);

  const checkStatus = () => {
    setApiStatus('checking');
    checkApiAvailability().then(ok => setApiStatus(ok ? 'ok' : 'fail'));
  };

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
    if (selected.length === 0) {
        setError({ title: "Выбор пуст", msg: "Выберите хотя бы одну отрасль в меню слева." });
        return;
    }
    
    setIsGenerating(true);
    setViewState(ViewState.IDEAS);
    setIsSidebarOpen(false);

    try {
        const ideas = await generateIdeasForIndustries(
            selected, 
            customContext, 
            userRole || "Owner",
            selectedModel
        );
        setGeneratedIdeas(ideas);
    } catch (e: any) {
        setError({ title: "API Error", msg: e.message || "Ошибка запроса к OpenRouter." });
    } finally {
        setIsGenerating(false);
        checkStatus();
    }
  };

  const switchView = (view: ViewState) => {
    setViewState(view);
    setIsSidebarOpen(false);
  };

  if (viewState === ViewState.WELCOME) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20 flex gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>
        <div className="max-w-5xl w-full text-center space-y-12 animate-slide-up relative z-10">
           <div className="flex justify-center"><div className="p-5 bg-blue-600 rounded-[2.5rem] shadow-3xl text-white"><Command size={56} /></div></div>
           <div className="space-y-4">
             <h1 className="text-5xl md:text-8xl font-bold tracking-tight heading-refined">IdeaForge</h1>
             <p className="text-xl md:text-3xl opacity-60 font-medium max-w-2xl mx-auto body-refined italic">Бизнес-интеллект через OpenRouter.</p>
           </div>
           <div className="pt-8">
             <button onClick={() => switchView(ViewState.INDUSTRIES)} className="group bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-full font-bold text-2xl transition-all shadow-3xl flex items-center gap-6 mx-auto">
               Начать исследование <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-[#1d1d1f]'}`}>
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-[320px] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} border-r border-opacity-10 flex flex-col ${isDarkMode ? 'border-white/10 bg-black' : 'border-black/5 bg-white'}`}>
        <div className="p-8 pb-4 flex items-center justify-between">
          <button onClick={() => setViewState(ViewState.WELCOME)} className="flex items-center gap-2 font-bold text-xl heading-refined">
             <Command size={24} className="text-blue-500" /> IdeaForge
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <nav className="space-y-1">
                {[
                  { id: ViewState.INDUSTRIES, label: 'Конструктор', icon: LayoutGrid },
                  { id: ViewState.CATALOG, label: 'Каталог', icon: Database },
                  { id: ViewState.PRIORITY_MATRIX, label: 'Приоритеты', icon: BarChart3 }
                ].map(item => (
                  <button key={item.id} onClick={() => switchView(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${viewState === item.id ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : 'opacity-40 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                    <item.icon size={18} /> <span>{item.label}</span>
                  </button>
                ))}
            </nav>

            <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-40 tracking-widest text-blue-500">
                    <Cpu size={12} /> Конфигурация ИИ
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase opacity-30 px-1">Модель OpenRouter</label>
                    <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`w-full p-3 rounded-xl text-xs border outline-none cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-black'}`}
                    >
                        {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-opacity-10">
                <div className="px-2 flex items-center justify-between text-[10px] font-bold uppercase opacity-30 tracking-widest">
                  <span>Smart Session</span>
                  <Cloud size={10} className="animate-pulse text-blue-500" />
                </div>
                <input type="text" value={userRole} onChange={(e) => setUserRole(e.target.value)} placeholder="Ваша роль (напр. CEO)" className={`w-full p-3 rounded-xl text-xs border outline-none transition-all focus:border-blue-500/50 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`} />
                <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)} placeholder="Контекст бизнеса..." className={`w-full h-24 p-3 rounded-xl text-xs border outline-none resize-none transition-all focus:border-blue-500/50 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`} />
            </div>

            <IndustryTree 
              nodes={industries} 
              onToggleSelect={(id) => setIndustries(prev => prev.map(n => n.id === id ? {...n, selected: !n.selected} : n))} 
              onAddSubIndustry={(pid, nodes) => setIndustries(prev => prev.map(n => n.id === pid ? {...n, children: [...(n.children || []), ...nodes]} : n))} 
              selectedModel={selectedModel}
            />
        </div>

        <div className="p-4 border-t border-opacity-10">
          <div className="mb-4 flex flex-col gap-2 px-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase opacity-30">
                <Globe size={12} /> OpenRouter Connected
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold ${apiStatus === 'ok' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {apiStatus === 'ok' ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>
          <button onClick={handleGenerateIdeas} disabled={isGenerating} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-30">
            {isGenerating ? <Timer size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isGenerating ? `Обработка: ${countdown}с` : 'Сгенерировать стратегию'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-inherit">
        {error && (
          <div className="m-4 md:m-8 p-6 rounded-3xl border border-red-500/20 bg-red-500/5 flex items-center justify-between backdrop-blur-md animate-slide-up">
            <div className="flex items-center gap-4"><AlertCircle className="text-red-500" size={24} /><div><h4 className="font-bold text-red-500 text-sm">{error.title}</h4><p className="text-xs opacity-60">{error.msg}</p></div></div>
            <button onClick={() => setError(null)} className="opacity-20 hover:opacity-100 p-2"><XCircle size={20}/></button>
          </div>
        )}

        {viewState === ViewState.INDUSTRIES && (
           <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-8 max-w-4xl mx-auto">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}><Activity size={32} className="text-blue-500"/></div>
              <h1 className="text-3xl md:text-6xl font-bold heading-refined tracking-tighter">Инженерный центр</h1>
              <p className="text-base md:text-lg opacity-40 italic font-medium">Выберите сегменты рынка и модель OpenRouter для запуска анализа.</p>
           </div>
        )}

        {viewState === ViewState.IDEAS && (
          <div className="p-4 md:p-16 max-w-[1600px] mx-auto">
            <header className="flex justify-between items-center mb-8 md:mb-12">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold heading-refined">Сгенерированные решения</h2>
                <p className="text-xs opacity-40 font-medium mt-1 uppercase tracking-widest">Модель: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</p>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                {isGenerating && generatedIdeas.length === 0 ? [1,2,3].map(i => <div key={i} className="h-[400px] rounded-5xl border animate-pulse bg-white/5"></div>) : generatedIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />)}
            </div>
          </div>
        )}

        {viewState === ViewState.IDEA_DETAIL && selectedIdea && (
            <IdeaDetail idea={selectedIdea} onBack={() => setViewState(ViewState.IDEAS)} onUpdateIdea={(i) => { setGeneratedIdeas(prev => prev.map(old => old.id === i.id ? i : old)); setSelectedIdea(i); }} onGenerateLanding={(idea) => setViewState(ViewState.LANDING_GENERATOR)} selectedModel={selectedModel} />
        )}

        {viewState === ViewState.LANDING_GENERATOR && selectedIdea && (
            <LandingPage idea={selectedIdea} onBack={() => setViewState(ViewState.IDEA_DETAIL)} selectedModel={selectedModel} />
        )}

        {viewState === ViewState.PRIORITY_MATRIX && <PriorityMatrix ideas={generatedIdeas} isDarkMode={isDarkMode} onSelectIdea={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />}

        {viewState === ViewState.CATALOG && (
           <div className="p-4 md:p-16 max-w-[1600px] mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold heading-refined mb-8 md:mb-12">База знаний</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                {generatedIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />)}
              </div>
           </div>
        )}
      </main>

      <FeedbackButton selectedModel={selectedModel} />
    </div>
  );
}
