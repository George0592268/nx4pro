
import React, { useState } from 'react';
import { Idea, LandingPageContent, ContactInfo } from '../types';
import { generateLandingContent } from '../services/geminiService';
// Added AlertTriangle to imports
import { ArrowLeft, Send, Phone, Mail, User, Building, ShieldCheck, Share2, Rocket, Globe, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  idea: Idea;
  onBack: () => void;
  onSave?: (idea: Idea) => void;
  selectedQueries?: string[];
  selectedFeatures?: string[];
  contactInfo?: Partial<ContactInfo>;
}

export const LandingPage: React.FC<Props> = ({ 
  idea, 
  onBack, 
}) => {
  const [step, setStep] = useState<'form' | 'loading' | 'content'>('form');
  const [contacts, setContacts] = useState<ContactInfo>({ name: '', companyName: '', phone: '', email: '' });
  const [content, setContent] = useState<LandingPageContent | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    const data = await generateLandingContent(idea, contacts);
    setContent(data);
    setStep('content');
  };

  const copyLink = () => {
    const fakeLink = `https://forge-protocol.io/deal/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(fakeLink);
    alert('Инвестиционная ссылка скопирована в буфер обмена!');
  };

  if (step === 'form') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-[4rem] p-16 shadow-2xl animate-fade-in border border-slate-100">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 text-slate-900">Инициация сделки (Founder)</h2>
            <p className="text-slate-500 mb-12 font-medium italic text-lg leading-relaxed">Введите ваши данные, чтобы ИИ подготовил инвестиционный оффер на платформе ForgeProtocol.</p>
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
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4 items-center">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0"><Lock size={20}/></div>
                   <p className="text-[11px] font-bold text-blue-700 uppercase italic">Нажимая кнопку, вы подтверждаете готовность выступить индустриальным партнером для разработки IT-продукта.</p>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase italic text-xl flex items-center justify-center gap-4 hover:bg-blue-600 transition-all hover:scale-[1.02] shadow-2xl active:scale-[0.98]">
                    Упаковать проект <Rocket size={28} />
                </button>
            </form>
            <button onClick={onBack} className="w-full mt-8 text-slate-400 font-black uppercase italic text-[10px] hover:text-slate-900 transition-all tracking-widest">Вернуться к аудиту</button>
        </div>
    </div>
  );

  if (step === 'loading') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_80px_rgba(59,130,246,0.5)]"></div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter animate-pulse">Развертывание Forge-Page...</h2>
        <p className="mt-4 text-slate-400 font-medium italic text-lg">Оцифровываем вашу экспертизу для инвесторов</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans animate-fade-in pb-40 overflow-x-hidden">
      {/* Top Navbar */}
      <div className="fixed top-8 left-0 w-full z-50 px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
             <button onClick={onBack} className="bg-white/95 backdrop-blur-2xl p-4 rounded-full shadow-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"><ArrowLeft size={28} /></button>
             <button onClick={copyLink} className="bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase italic text-sm flex items-center gap-3 shadow-2xl hover:scale-105 transition-all border border-white/10 group">
                <Share2 size={20} className="group-hover:rotate-12 transition-transform"/> Отправить инвесторам (Link)
             </button>
          </div>
      </div>

      {/* Futuristic Hero */}
      <header className="bg-slate-950 text-white pt-60 pb-40 px-10 relative overflow-hidden rounded-b-[10rem]">
          <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-3 bg-blue-500/10 text-blue-400 px-8 py-3 rounded-full text-xs font-black uppercase mb-12 border border-blue-500/20 backdrop-blur-xl tracking-[0.2em]">
                  <Globe size={18} /> ForgeProtocol Verified Smart-Asset
              </div>
              <h1 className="text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-12 animate-slide-up">{content?.headline}</h1>
              <p className="text-2xl md:text-5xl text-slate-300 font-medium italic mb-20 max-w-5xl mx-auto leading-[1.1] tracking-tight">{content?.subheadline}</p>
              
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-14 rounded-[5rem] inline-block text-left shadow-2xl transition-transform hover:scale-[1.02]">
                  <div className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Индустриальный Гарант (Собственник)</div>
                  <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center font-black italic text-4xl shadow-[0_20px_40px_rgba(37,99,235,0.4)]">{contacts.companyName[0]}</div>
                      <div>
                          <p className="font-black uppercase italic text-4xl mb-2 text-white">{contacts.companyName}</p>
                          <p className="text-sm text-slate-400 font-medium italic">Готовая инфраструктура для внедрения и тестирования MVP</p>
                      </div>
                  </div>
              </div>
          </div>
      </header>

      {/* Founder's Vision / Story */}
      <section className="py-40 px-10 bg-white">
          <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-24 items-center">
                  <div className="animate-slide-up">
                      <h2 className="text-6xl font-black uppercase italic mb-10 tracking-tighter leading-[0.9] text-slate-900">Почему Собственник открывает этот проект</h2>
                      <p className="text-2xl text-slate-500 font-medium leading-relaxed italic border-l-[12px] border-blue-600 pl-12 mb-12">
                        {content?.founderStory}
                      </p>
                      <div className="flex items-center gap-4 text-slate-900 font-black uppercase italic">
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0"><User size={24}/></div>
                         <div>
                            <div className="text-lg">{contacts.name}</div>
                            <div className="text-[10px] text-slate-400 tracking-widest">Founder & CEO</div>
                         </div>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-16 rounded-[5rem] border border-slate-100 shadow-xl rotate-1 animate-slide-up">
                      <h4 className="text-3xl font-black uppercase italic mb-10 text-slate-900 flex items-center gap-4"><AlertTriangle className="text-red-500"/> Боль, которую мы решаем</h4>
                      <div className="space-y-8">
                          {content?.painPoints.map((p, i) => (
                              <div key={i} className="flex gap-6 group">
                                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black italic shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all">!</div>
                                  <p className="font-bold text-slate-700 italic text-lg leading-snug">{p}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Mechanism */}
      <section className="py-40 px-10 bg-slate-950 text-white rounded-[7rem] mx-10 shadow-3xl">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-6xl font-black uppercase italic mb-6 tracking-tighter">Механика Smart-Deal</h2>
                <p className="text-slate-400 font-bold italic text-xl uppercase tracking-widest">Прозрачность. Скорость. Результат.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                  {content?.benefits.map((b, i) => (
                      <div key={i} className="bg-white/5 p-16 rounded-[4rem] border border-white/10 hover:bg-blue-600 transition-all group hover:-translate-y-4">
                          <div className="text-6xl font-black italic text-blue-500 mb-10 group-hover:text-white transition-all">0{i+1}</div>
                          <p className="text-2xl font-bold italic group-hover:text-white transition-all leading-relaxed tracking-tight">{b}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 px-10">
          <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-black uppercase italic text-center mb-20 tracking-tighter">Функционал Решения</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {content?.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-6 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
                         <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all"><CheckCircle2 size={24}/></div>
                         <span className="font-black uppercase italic text-slate-800 text-lg leading-tight tracking-tighter">{f}</span>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 px-10 text-center relative">
          <div className="max-w-5xl mx-auto relative z-10">
              <h2 className="text-7xl md:text-9xl font-black uppercase italic mb-12 tracking-tighter leading-[0.85] text-slate-900">Входите в сделку<br/>на старте</h2>
              <p className="text-slate-500 text-2xl md:text-4xl font-medium italic mb-20 leading-tight max-w-4xl mx-auto">
                  ForgeProtocol обеспечивает юридическую чистоту и автоматическое распределение дивидендов через смарт-контракты.
              </p>
              <button className="bg-slate-900 text-white px-24 py-12 rounded-full font-black uppercase italic text-3xl shadow-[0_40px_80px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all hover:scale-105 active:scale-95">
                  Присоединиться к проекту
              </button>
              <div className="mt-16 flex items-center justify-center gap-6 text-slate-400 font-black uppercase text-xs tracking-[0.4em]">
                  <ShieldCheck className="text-green-500" size={24} /> Сделка защищена Forge Escrow
              </div>
          </div>
      </section>
    </div>
  );
};
