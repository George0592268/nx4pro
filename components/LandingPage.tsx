
import React, { useState, useEffect } from 'react';
import { Idea, LandingPageContent, ContactInfo } from '../types';
import { generateLandingContent, generateProjectImage } from '../services/geminiService';
import { ArrowLeft, Send, Phone, Mail, User, Building, ShieldCheck, Share2, Rocket, Globe, Lock, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface Props {
  idea: Idea;
  onBack: () => void;
  onSave?: (idea: Idea) => void;
}

export const LandingPage: React.FC<Props> = ({ idea, onBack }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'content'>('form');
  const [contacts, setContacts] = useState<ContactInfo>({ name: '', companyName: '', phone: '', email: '' });
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    
    const [data, img] = await Promise.all([
      generateLandingContent(idea, contacts),
      generateProjectImage(idea.title + " " + idea.description)
    ]);
    
    setContent(data);
    setHeroImage(img);
    setStep('content');
  };

  const copyLink = () => {
    const fakeLink = `https://forge-protocol.io/deal/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(fakeLink);
    alert('Инвестиционная ссылка скопирована!');
  };

  if (step === 'form') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-[4rem] p-16 shadow-2xl animate-fade-in border border-slate-100">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 text-slate-900">Инициация сделки (Founder)</h2>
            <p className="text-slate-500 mb-12 font-medium italic text-lg leading-relaxed">Введите ваши данные, чтобы ИИ подготовил инвестиционный оффер с визуализацией продукта.</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                        <User className="absolute left-6 top-6 text-slate-300" size={24} />
                        <input required value={contacts.name} onChange={e => setContacts({...contacts, name: e.target.value})} placeholder="Ваше ФИО" className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold text-lg" />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-6 top-6 text-slate-300" size={24} />
                        <input required value={contacts.companyName} onChange={e => setContacts({...contacts, companyName: e.target.value})} placeholder="Компания" className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold text-lg" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                        <Phone className="absolute left-6 top-6 text-slate-300" size={24} />
                        <input required value={contacts.phone} onChange={e => setContacts({...contacts, phone: e.target.value})} placeholder="+7 (___) ___" className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold text-lg" />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-6 top-6 text-slate-300" size={24} />
                        <input required value={contacts.email} onChange={e => setContacts({...contacts, email: e.target.value})} placeholder="Email" className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 font-bold text-lg" />
                    </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase italic text-xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-2xl active:scale-[0.98]">
                    Упаковать проект и визуал <Rocket size={28} />
                </button>
            </form>
            <button onClick={onBack} className="w-full mt-8 text-slate-400 font-black uppercase italic text-[10px] hover:text-slate-900 transition-all tracking-widest">Вернуться к аудиту</button>
        </div>
    </div>
  );

  if (step === 'loading') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans text-center px-6">
        <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mb-10"></div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter animate-pulse">Генерируем интерфейс продукта...</h2>
        <p className="mt-4 text-slate-400 font-medium italic text-lg max-w-md">Используем Imagen 4 для создания визуального концепта вашего будущего IT-актива.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans animate-fade-in pb-40 overflow-x-hidden">
      <div className="fixed top-8 left-0 w-full z-50 px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
             <button onClick={onBack} className="bg-white/95 backdrop-blur-2xl p-4 rounded-full shadow-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"><ArrowLeft size={28} /></button>
             <button onClick={copyLink} className="bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase italic text-sm flex items-center gap-3 shadow-2xl hover:scale-105 transition-all">
                <Share2 size={20}/> Поделиться оффером
             </button>
          </div>
      </div>

      <header className="bg-slate-950 text-white pt-60 pb-40 px-10 relative overflow-hidden rounded-b-[10rem]">
          <div className="absolute top-0 left-0 w-full h-full opacity-40">
              {heroImage ? (
                <img src={heroImage} alt="Product Concept" className="w-full h-full object-cover blur-sm scale-110" />
              ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)]"></div>
              )}
          </div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-3 bg-blue-500/20 text-blue-400 px-8 py-3 rounded-full text-xs font-black uppercase mb-12 border border-blue-500/20 backdrop-blur-xl">
                  <Globe size={18} /> ForgeProtocol AI-Visualization v1.0
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-12">{content?.headline}</h1>
              <p className="text-2xl md:text-4xl text-slate-300 font-medium italic mb-20 max-w-5xl mx-auto leading-tight">{content?.subheadline}</p>
              
              {heroImage && (
                <div className="mt-12 rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl max-w-4xl mx-auto group">
                   <img src={heroImage} alt="AI Concept" className="w-full transition-transform duration-700 group-hover:scale-105" />
                   <div className="bg-white/10 backdrop-blur-md p-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <ImageIcon size={14}/> Нейросетевая концепция интерфейса
                   </div>
                </div>
              )}
          </div>
      </header>

      <section className="py-40 px-10 bg-white">
          <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-24 items-center">
                  <div>
                      <h2 className="text-6xl font-black uppercase italic mb-10 tracking-tighter leading-[0.9] text-slate-900">Видение Основателя</h2>
                      <p className="text-2xl text-slate-500 font-medium leading-relaxed italic border-l-[12px] border-blue-600 pl-12 mb-12">
                        {content?.founderStory}
                      </p>
                      <div className="flex items-center gap-4 text-slate-900 font-black uppercase italic">
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0"><User size={24}/></div>
                         <div>
                            <div className="text-lg">{contacts.name}</div>
                            <div className="text-[10px] text-slate-400 tracking-widest">Founder & CEO, {contacts.companyName}</div>
                         </div>
                      </div>
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

      <section className="py-20 px-10 text-center">
          <button className="bg-slate-900 text-white px-24 py-12 rounded-full font-black uppercase italic text-3xl shadow-3xl hover:bg-blue-600 transition-all hover:scale-105">
              Стать со-инвестором
          </button>
          <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 font-black uppercase text-xs">
              <ShieldCheck className="text-green-500" size={24} /> Юридическая защита сделки обеспечена
          </div>
      </section>
    </div>
  );
};
