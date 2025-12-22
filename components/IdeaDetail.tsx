
import React, { useState, useEffect, useRef } from 'react';
import { Idea } from '../types';
import { deepDiveIdea } from '../services/geminiService';
import { 
  ArrowLeft, ShieldAlert, Wallet, Map, TrendingUp, Search, Timer, 
  Rocket, Activity, Cpu, Lock, Info, AlertTriangle, ExternalLink, Globe
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
  const [statusMsg, setStatusMsg] = useState("Инициализация nx4Lab DeepDive...");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!idea.isAnalyzed) runFullAnalysis();
  }, [idea.id]);

  const runFullAnalysis = async () => {
    setLoading(true);
    const messages = ["Сканирование конкурентов...", "Расчет юнит-экономики...", "Поиск в Google Search...", "Сборка roadmap..."];
    let idx = 0;
    const msgInterval = setInterval(() => setStatusMsg(messages[idx++ % messages.length]), 4000);
    timerRef.current = window.setInterval(() => setCountdown(p => p > 1 ? p - 1 : 1), 1000);

    try {
      const fullData = await deepDiveIdea(idea);
      onUpdateIdea({ 
        ...idea, 
        ...fullData, 
        isAnalyzed: true, 
        isPublished: true, 
        publishedAt: new Date().toISOString() 
      });
    } catch (e) {
        console.error("Deep Dive Error:", e);
    } finally {
      setLoading(false);
      clearInterval(msgInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const groundingSources = (idea as any).groundingSources || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 text-center animate-fade-in bg-slate-950 min-h-screen text-white">
        <div className="w-24 h-24 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-8 flex items-center justify-center font-black text-blue-500 italic">
            {countdown}s
        </div>
        <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">{statusMsg}</h2>
        <p className="text-slate-500 font-mono text-xs">nx4Lab Engine in progress...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 pb-32 font-sans animate-fade-in">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase italic text-[11px] transition-colors">
            <ArrowLeft size={16} /> К списку гипотез
          </button>
          <div className="bg-slate-900 text-blue-400 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-blue-900/50 flex items-center gap-2 shadow-sm">
              <Cpu size={12} /> nx4Lab Core v3.0
          </div>
      </div>

      <div className="bg-slate-950 text-white p-14 rounded-[4rem] shadow-2xl relative overflow-hidden border border-blue-900/30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] max-w-5xl mb-8">{idea.problemStatement}</h1>
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><Rocket size={32} /></div>
                  <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Продукт nx4Lab</p>
                      <h2 className="text-2xl font-black italic uppercase text-white">{idea.title}</h2>
                  </div>
              </div>
          </div>
      </div>

      {groundingSources.length > 0 && (
          <div className="bg-white p-8 rounded-[3rem] border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-blue-600">
                  <Globe size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Источники данных (Google Search)</span>
              </div>
              <div className="flex flex-wrap gap-4">
                  {groundingSources.map((source: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={source.web?.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                      >
                          <ExternalLink size={12} /> {source.web?.title || 'Источник'}
                      </a>
                  ))}
              </div>
          </div>
      )}

      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-[3rem] sticky top-6 z-30 border border-slate-200 backdrop-blur-xl shadow-2xl">
          {[
            { id: 'diagnostic', label: 'Аудит', icon: ShieldAlert },
            { id: 'mvp', label: 'Модули', icon: Wallet },
            { id: 'roadmap', label: 'План', icon: Map },
            { id: 'investor', label: 'Deal', icon: TrendingUp },
            { id: 'seo', label: 'SEO', icon: Search }
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
              <div className="bg-white p-14 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <h3 className="text-3xl font-black uppercase italic mb-10 flex items-center gap-4 tracking-tighter">
                      <Activity className="text-red-500" /> Диагностика nx4Lab
                  </h3>
                  <div className="