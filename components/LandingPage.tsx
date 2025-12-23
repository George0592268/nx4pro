
import React, { useState } from 'react';
import { Idea, LandingPageContent, ContactInfo } from '../types';
import { generateLandingContent } from '../services/apiService';
import { ArrowLeft, Send, Phone, Mail, User, Building, ShieldCheck, Share2, Rocket, Globe, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface Props {
  idea: Idea;
  onBack: () => void;
  selectedModel: string;
}

export const LandingPage: React.FC<Props> = ({ idea, onBack, selectedModel }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'content'>('form');
  const [contacts, setContacts] = useState<ContactInfo>({ name: '', companyName: '', phone: '', email: '' });
  const [content, setContent] = useState<LandingPageContent | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    const data = await generateLandingContent(idea, contacts, selectedModel);
    setContent(data);
    setStep('content');
  };

  if (step === 'form') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-[4rem] p-16 shadow-2xl animate-fade-in border border-slate-100">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 text-slate-900">Инициация сделки</h2>
            <p className="text-slate-500 mb-12 font-medium italic text-lg leading-relaxed">Введите ваши данные, чтобы ИИ подготовил инвестиционный оффер.</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <input required value={contacts.name} onChange={e => setContacts({...contacts, name: e.target.value})} placeholder="Ваше ФИО" className="w-full px-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold" />
                    <input required value={contacts.companyName} onChange={e => setContacts({...contacts, companyName: e.target.value})} placeholder="Компания" className="w-full px-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase italic text-xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-2xl">
                    Упаковать проект <Rocket size={28} />
                </button>
            </form>
            <button onClick={onBack} className="w-full mt-8 text-slate-400 font-black uppercase italic text-[10px] hover:text-slate-900 transition-all tracking-widest">Вернуться к аудиту</button>
        </div>
    </div>
  );

  if (step === 'loading') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-center px-6">
        <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mb-10"></div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter animate-pulse">Генерируем оффер...</h2>
        <p className="mt-4 text-slate-400 font-medium italic text-lg">Используем {selectedModel} для создания идеального питча.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans animate-fade-in pb-40 overflow-x-hidden">
      <div className="fixed top-8 left-0 w-full z-50 px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <button onClick={onBack} className="bg-white/95 backdrop-blur-2xl p-4 rounded-full shadow-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"><ArrowLeft size={28} /></button>
          </div>
      </div>

      <header className="bg-slate-950 text-white pt-60 pb-40 px-10 relative overflow-hidden rounded-b-[10rem]">
          <div className="max-w-6xl mx-auto text-center relative z-10">
              <h1 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-12">{content?.headline}</h1>
              <p className="text-2xl md:text-4xl text-slate-300 font-medium italic mb-20 max-w-5xl mx-auto">{content?.subheadline}</p>
          </div>
      </header>

      <section className="py-40 px-10 bg-white">
          <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-24 items-center">
                  <div>
                      <h2 className="text-6xl font-black uppercase italic mb-10 tracking-tighter text-slate-900">Видение</h2>
                      <p className="text-2xl text-slate-500 font-medium leading-relaxed italic border-l-[12px] border-blue-600 pl-12">
                        {content?.founderStory}
                      </p>
                  </div>
                  <div className="bg-slate-50 p-16 rounded-[5rem] border border-slate-100 shadow-xl">
                      <h4 className="text-3xl font-black uppercase italic mb-10 text-slate-900 flex items-center gap-4"><AlertTriangle className="text-red-500"/> Критические боли</h4>
                      <div className="space-y-8">
                          {content?.painPoints.map((p, i) => (
                              <div key={i} className="flex gap-6">
                                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black italic shrink-0">!</div>
                                  <p className="font-bold text-slate-700 italic text-lg">{p}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};
