


import React, { useState, useEffect, useRef } from 'react';
import { IndustryTree } from './components/IndustryTree';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetail } from './components/IdeaDetail';
import { LandingPage } from './components/LandingPage';
import { INITIAL_INDUSTRIES } from './constants';
import { IndustryNode, Idea, ViewState, CompanyStage } from './types';
import { generateIdeasForIndustries } from './services/geminiService';
import { 
  Rocket, Search, Filter, Briefcase, Users, MessageSquareText, 
  BarChart3, UserCog, Timer, Globe, List, LayoutGrid, ChevronRight
} from 'lucide-react';

export default function App() {
  const [industries, setIndustries] = useState<IndustryNode[]>(INITIAL_INDUSTRIES);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [selectedDept, setSelectedDept] = useState("Все отделы");
  const [userRole, setUserRole] = useState("");
  const [selectedStage, setSelectedStage] = useState<CompanyStage>("Growth");
  const [customContext, setCustomContext] = useState("");
  
  const [viewState, setViewState] = useState<ViewState>(ViewState.INDUSTRIES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isGenerating) {
        setCountdown(20);
        timerRef.current = window.setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isGenerating]);

  const handleGenerateIdeas = async () => {
    const selected = industries.filter(i => i.selected).map(i => i.label);
    if (selected.length === 0 && !customContext) return alert("Укажите специфику или выберите отрасль!");
    
    setIsGenerating(true);
    setViewState(ViewState.IDEAS);
    try {
        const ideas = await generateIdeasForIndustries(selected, selectedDept, customContext, selectedStage, userRole || "Собственник");
        setGeneratedIdeas(ideas);
    } catch (e) {
        alert("Ошибка генерации. Попробуйте еще раз.");
    } finally {
        setIsGenerating(false);
    }
  };

  /**
   * Fix: Implement recursive industry node addition to support AI expansion functionality
   */
  const handleAddSubIndustry = (parentId: string, newNodes: IndustryNode[]) => {
    setIndustries(prev => {
      const updateNodes = (nodes: IndustryNode[]): IndustryNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), ...newNodes] };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateNodes(node.children) };
          }
          return node;
        });
      };
      return updateNodes(prev);
    });
  };

  const publishedIdeas = generatedIdeas.filter(i => i.isPublished);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <aside className={`w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-30 transition-all ${viewState === ViewState.LANDING_GENERATOR ? '-ml-80' : ''}`}>
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-black text-2xl uppercase tracking-tighter italic">
             <Rocket className="text-blue-600 fill-blue-600" /> IdeaForge
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-black tracking-widest uppercase">Business Intelligence OS</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <nav className="flex flex-col gap-1 mb-6">
                <button 
                    onClick={() => setViewState(ViewState.INDUSTRIES)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-black text-[11px] uppercase transition-all ${viewState === ViewState.INDUSTRIES ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Filter size={14} /> Конструктор идей
                </button>
                <button 
                    onClick={() => setViewState(ViewState.CATALOG)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-black text-[11px] uppercase transition-all ${viewState === ViewState.CATALOG ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Globe size={14} /> Каталог решений ({publishedIdeas.length})
                </button>
            </nav>

            <div className="space-y-4 pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Роль / Контекст</label>
                <input type="text" value={userRole} onChange={(e) => setUserRole(e.target.value)} placeholder="Напр. Директор по закупкам" className="w-full p-4 border border-slate-100 rounded-2xl text-xs font-bold bg-slate-50 outline-none" />
                
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Описание ситуации</label>
                <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)} placeholder="Где именно ищем проблемы? Напр: Высокий процент брака..." className="w-full h-24 p-4 border border-slate-100 rounded-2xl text-xs font-medium bg-slate-50 outline-none resize-none" />
                
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Стадия и Отдел</label>
                <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value as CompanyStage)} className="w-full p-4 border border-slate-100 rounded-2xl text-xs font-bold outline-none mb-2">
                    <option value="Startup">Стартап</option>
                    <option value="Growth">Рост</option>
                    <option value="Mature">Оптимизация</option>
                    <option value="Transformation">Кризис-менеджмент</option>
                </select>
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full p-4 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                    {["Все отделы", "Продажи", "Логистика", "HR", "IT", "Финансы", "Производство"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <IndustryTree 
              nodes={industries} 
              onToggleSelect={(id) => setIndustries(prev => prev.map(n => n.id === id ? {...n, selected: !n.selected} : n))} 
              onAddSubIndustry={handleAddSubIndustry} 
            />
        </div>

        <div className="p-6 border-t border-slate-50">
          <button onClick={handleGenerateIdeas} disabled={isGenerating} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black transition-all flex justify-center items-center gap-3 shadow-2xl active:scale-[0.98]">
            {isGenerating ? <><Timer size={20} className="animate-pulse" /> {countdown}с</> : <><Search size={20} /> Найти боли и решения</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f1f5f9]">
        {viewState === ViewState.INDUSTRIES && (
           <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 animate-fade-in">
              <div className="w-32 h-32 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-6 animate-pulse"><Rocket size={64}/></div>
              <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">IdeaForge<br/>OS Engine</h1>
              <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">Система поиска скрытых убытков и автоматического проектирования стратегий роста для бизнеса любого масштаба.</p>
           </div>
        )}

        {viewState === ViewState.IDEAS && (
          <div className="p-10 max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-5xl font-black text-slate-900 mb-12 flex items-center gap-4 tracking-tighter italic uppercase">
                <Briefcase size={48} className="text-blue-600" /> Сгенерированные стратегии
            </h2>
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem]">
                    <div className="w-16 h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-black text-slate-900 uppercase italic">Проектируем архитектуру решений...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {generatedIdeas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />
                    ))}
                </div>
            )}
          </div>
        )}

        {viewState === ViewState.CATALOG && (
            <div className="p-10 max-w-7xl mx-auto animate-fade-in">
                <h2 className="text-5xl font-black text-slate-900 mb-12 flex items-center gap-4 tracking-tighter italic uppercase">
                    <Globe size={48} className="text-green-600" /> Архив готовых решений
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publishedIdeas.length > 0 ? publishedIdeas.map(idea => (
                        <div key={idea.id} className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl transition-all group">
                            <div className="text-[9px] font-black text-slate-400 uppercase mb-4">Опубликовано: {new Date(idea.publishedAt!).toLocaleDateString()}</div>
                            <h3 className="text-lg font-black uppercase italic mb-2 leading-tight group-hover:text-blue-600">{idea.problemStatement}</h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium line-clamp-2">{idea.description}</p>
                            <button onClick={() => { setSelectedIdea(idea); setViewState(ViewState.IDEA_DETAIL); }} className="text-blue-600 font-black text-[10px] uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                                Посмотреть страницу решения <ChevronRight size={12}/>
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="font-black text-slate-400 uppercase italic">Каталог пока пуст. Проанализируйте идеи, чтобы сохранить их здесь.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {viewState === ViewState.IDEA_DETAIL && selectedIdea && (
            <IdeaDetail 
              idea={selectedIdea} 
              onBack={() => setViewState(ViewState.IDEAS)}
              onUpdateIdea={(i) => { 
                setGeneratedIdeas(prev => prev.map(old => old.id === i.id ? i : old)); 
                setSelectedIdea(i); 
              }}
              onGenerateLanding={(idea, info) => setViewState(ViewState.LANDING_GENERATOR)}
            />
        )}

        {/* Fix: Render LandingPage when in LANDING_GENERATOR view state */}
        {viewState === ViewState.LANDING_GENERATOR && selectedIdea && (
            <LandingPage 
              idea={selectedIdea}
              onBack={() => setViewState(ViewState.IDEA_DETAIL)}
              onSave={(i) => {
                setGeneratedIdeas(prev => prev.map(old => old.id === i.id ? i : old));
                setSelectedIdea(i);
              }}
              selectedQueries={selectedIdea.searchQueries?.map(q => q.query) || []}
              selectedFeatures={selectedIdea.microIdeas?.map(m => m.title) || []}
              contactInfo={{ companyName: 'Моя Компания', phone: '+7 (999) 000-00-00', email: 'hello@company.ru' }}
            />
        )}
      </main>
    </div>
  );
}
