
import React, { useState, useEffect, useRef } from 'react';
import { IndustryTree } from './components/IndustryTree';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetail } from './components/IdeaDetail';
import { LandingPage } from './components/LandingPage';
import { INITIAL_INDUSTRIES } from './constants';
import { IndustryNode, Idea, ViewState, CompanyStage } from './types';
import { generateIdeasForIndustries } from './services/geminiService';
import { 
  Rocket, Search, Filter, Briefcase, Globe, Timer, AlertCircle, XCircle, ArrowRight, Cpu, Terminal, RefreshCw, Code
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
  const [error, setError] = useState<{title: string, msg: string, isQuota?: boolean} | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [logs, setLogs] = useState<string[]>(["[system] nx4Lab Engine initialized...", "[system] Ready for neural mapping."]);
  const timerRef = useRef<number | null>(null);

  const apiKeyExists = !!process.env.API_KEY;

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));

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
        setError({ title: "Ключ не найден", msg: "API Key отсутствует." });
        return;
    }

    if (selected.length === 0 && !customContext) {
      setError({ title: "Вводные данные", msg: "Выберите отрасль или опишите ситуацию." });
      return;
    }
    
    setIsGenerating(true);
    addLog(`Starting analysis for: ${selected.join(', ')}`);
    setViewState(ViewState.IDEAS);
    
    try {
        const ideas = await generateIdeasForIndustries(
            selected, 
            selectedDept, 
            customContext, 
            selectedStage, 
            userRole || "Предприниматель"
        );
        
        if (!ideas || ideas.length === 0) {
          setError({ title: "Пустой ответ", msg: "ИИ не смог сформулировать идеи." });
        } else {
          setGeneratedIdeas(ideas);
          addLog("Success: 8 market hypotheses generated.");
        }
    } catch (e: any) {
        addLog(`Error: ${e.message}`);
        const isQuota = e.message.includes("429") || e.message.includes("quota");
        setError({ 
          title: isQuota ? "Лимит запросов" : "Ошибка анализа", 
          msg: isQuota 
            ? "Вы используете бесплатный тариф Gemini. Пожалуйста, подождите 30-60 секунд." 
            : e.message,
          isQuota
        });
    } finally {
        setIsGenerating(false);
    }
  };

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
             <div className="bg-blue-600 p-1 rounded-lg"><Code className="text-white" size={20} /></div> nx4Lab
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-black tracking-widest uppercase ml-9">idea</p>
          
          <div className="mt-6 p-3 bg-slate-900 rounded-xl font-mono text-[9px] text-blue-400 border border-slate-800 shadow-inner">
             {logs.map((log, i) => <div key={i} className="truncate">{log}</div>)}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <nav className="flex flex-col gap-1 mb-6">
                <button 
                    onClick={() => { setViewState(ViewState.INDUSTRIES); setError(null); }} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-black text-[11px] uppercase transition-all ${viewState === ViewState.INDUSTRIES ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Terminal size={14} /> CLI Конструктор
                </button>
                <button 
                    onClick={() => setViewState(ViewState.CATALOG)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-black text-[11px] uppercase transition-all ${viewState === ViewState.CATALOG ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Globe size={14} /> Реестр ({publishedIdeas.length})
                </button>
            </nav>

            <div className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Контекст (Role)</label>
                    <input type="text" value={userRole} onChange={(e) => setUserRole(e.target.value)} placeholder="Напр. CTO nx4Lab" className="w-full p-4 border border-slate-100 rounded-2xl text-xs font-bold bg-slate-50 outline-none mt-1 focus:ring-2 ring-blue-500/20" />
                </div>
                
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Data</label>
                    <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)} placeholder="Опишите ситуацию для анализа..." className="w-full h-24 p-4 border border-slate-100 rounded-2xl text-xs font-medium bg-slate-50 outline-none resize-none mt-1 focus:ring-2 ring-blue-500/20" />
                </div>
            </div>

            <IndustryTree 
              nodes={industries} 
              onToggleSelect={(id) => setIndustries(prev => prev.map(n => n.id === id ? {...n, selected: !n.selected} : n))} 
              onAddSubIndustry={handleAddSubIndustry} 
            />
        </div>

        <div className="p-6 border-t border-slate-50">
          <button onClick={handleGenerateIdeas} disabled={isGenerating} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black transition-all flex justify-center items-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-50">
            {isGenerating ? <><Timer size={20} className="animate-pulse" /> {countdown}s</> : <><Search size={20} /> Run Analysis</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f1f5f9]">
        {error && (
          <div className="m-8 p-8 bg-white border-2 border-slate-200 rounded-[2.5rem] flex items-start gap-6 text-slate-900 animate-fade-in shadow-2xl">
            <div className={`p-4 rounded-2xl shrink-0 ${error.isQuota ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                {error.isQuota ? <Timer size={32} /> : <AlertCircle size={32} />}
            </div>
            <div className="flex-1">
              <h4 className={`font-black uppercase italic text-lg mb-1 ${error.isQuota ? 'text-amber-600' : 'text-red-600'}`}>{error.title}</h4>
              <p className="text-sm font-bold text-slate-600 mb-4">{error.msg}</p>
              {error.isQuota && (
                  <button onClick={handleGenerateIdeas} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase italic hover:bg-blue-600 transition-all">
                      <RefreshCw size={14}/> Retry
                  </button>
              )}
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><XCircle size={24}/></button>
          </div>
        )}

        {viewState === ViewState.INDUSTRIES && !error && (
           <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 animate-fade-in">
              <div className="w-32 h-32 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-6 animate-pulse border-4 border-blue-500"><Terminal size={64}/></div>
              <h1 className="text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">nx4Lab<br/>Engine</h1>
              <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed italic">Neural laboratory for entrepreneurial mapping.</p>
           </div>
        )}

        {viewState === ViewState.IDEAS && (
          <div className="p-10 max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-5xl font-black text-slate-900 mb-12 flex items-center gap-4 tracking-tighter italic uppercase">
                <Briefcase size={48} className="text-blue-600" /> Hypotheses
            </h2>
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] shadow-sm border border-slate-200">
                    <div className="w-16 h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-black text-slate-900 uppercase italic">nx4Lab: Processing via Flash Core...</p>
                </div>
            ) : generatedIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {generatedIdeas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onSelect={(i) => { setSelectedIdea(i); setViewState(ViewState.IDEA_DETAIL); }} />
                    ))}
                </div>
            ) : null}
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
              onGenerateLanding={(idea) => setViewState(ViewState.LANDING_GENERATOR)}
            />
        )}

        {viewState === ViewState.LANDING_GENERATOR && selectedIdea && (
            <LandingPage 
              idea={selectedIdea}
              onBack={() => setViewState(ViewState.IDEA_DETAIL)}
            />
        )}
      </main>
    </div>
  );
}
