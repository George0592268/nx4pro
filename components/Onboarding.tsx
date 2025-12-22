
import React, { useState } from 'react';
import { Rocket, Target, Zap, ShieldCheck, Flame, TrendingUp, Users, BrainCircuit, ChevronRight, Command, AlertCircle, TrendingDown } from 'lucide-react';

interface Props {
  onComplete: (data: { purpose: string; irritation: string }) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ purpose: '', irritation: '' });

  const purposes = [
    { id: 'scaling', title: 'Масштабирование', desc: 'Найти новые рынки и ниши для роста бизнеса', icon: TrendingUp },
    { id: 'efficiency', title: 'Оптимизация затрат', desc: 'Автоматизация и резкое снижение издержек', icon: Zap },
    { id: 'pivot', title: 'Поиск новых ниш', desc: 'Генерация IT-продуктов на базе текущих активов', icon: BrainCircuit },
    { id: 'productivity', title: 'Личная продуктивность', desc: 'Делегирование рутины интеллекту', icon: Users },
  ];

  const irritations = [
    { id: 'routine', title: 'Рутина и хаос', desc: 'Процессы завязаны на людях, а не на системе', icon: Flame },
    { id: 'budget', title: 'Слитый бюджет', desc: 'Непонятно, куда уходят деньги и какова рентабельность', icon: ShieldCheck },
    { id: 'slow', title: 'Медленные сотрудники', desc: 'Задачи выполняются долго и с человеческими ошибками', icon: Rocket },
    { id: 'blind', title: 'Слепое управление', desc: 'Отсутствие аналитики и данных для решений', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-black text-[#1d1d1f] dark:text-white flex flex-col items-center justify-center p-8 font-sans selection:bg-blue-500/20 overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[250px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[250px]"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        {step === 1 && (
          <div className="animate-slide-up space-y-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-8">
                <Command size={48} className="text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight heading-refined">Для чего вы будете использовать IdeaForge?</h1>
              <p className="opacity-40 text-lg font-medium max-w-xl mx-auto italic">Выберите основную цель исследования вашего бизнеса</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purposes.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { setSelections(s => ({...s, purpose: p.title})); setStep(2); }}
                  className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-10 rounded-4xl text-left hover:bg-white hover:dark:bg-white/10 hover:shadow-2xl hover:scale-[1.01] transition-all group active:scale-[0.98]"
                >
                  <p.icon className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{p.title}</h3>
                  <p className="opacity-40 text-sm font-medium leading-relaxed">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-12">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight heading-refined">Что больше всего замедляет ваш бизнес?</h1>
              <p className="opacity-40 text-lg font-medium max-w-xl mx-auto italic">Определите главную точку сопротивления</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {irritations.map(i => (
                <button 
                  key={i.id} 
                  onClick={() => { setSelections(s => ({...s, irritation: i.title})); setStep(3); }}
                  className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-10 rounded-4xl text-left hover:bg-white hover:dark:bg-white/10 hover:shadow-2xl hover:scale-[1.01] transition-all group active:scale-[0.98]"
                >
                  <i.icon className="text-red-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{i.title}</h3>
                  <p className="opacity-40 text-sm font-medium leading-relaxed">{i.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="block mx-auto text-[10px] font-bold uppercase opacity-30 hover:opacity-100 transition-all mt-8">Назад</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up space-y-20 text-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight heading-refined">Почему выбирают IdeaForge?</h1>
              <p className="opacity-40 text-xl font-medium italic">Мы решаем те проблемы, которые годами мешают вам спать спокойно</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6 bg-white/30 dark:bg-white/5 p-8 rounded-4xl border border-black/5 dark:border-white/5">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto"><TrendingDown size={32}/></div>
                <h3 className="text-xl font-bold tracking-tight">Остановка утечки денег</h3>
                <p className="opacity-50 text-sm italic font-medium leading-relaxed">90% бизнесов имеют скрытые «дыры», через которые улетает до 30% прибыли. Мы находим их и превращаем в доход через IT.</p>
              </div>
              <div className="space-y-6 bg-white/30 dark:bg-white/5 p-8 rounded-4xl border border-black/5 dark:border-white/5">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto"><Users size={32}/></div>
                <h3 className="text-xl font-bold tracking-tight">Свобода от «кадров»</h3>
                <p className="opacity-50 text-sm italic font-medium leading-relaxed">Вы больше не будете заложником настроения сотрудников. Мы конвертируем хаотичные действия людей в предсказуемую работу цифровых алгоритмов.</p>
              </div>
              <div className="space-y-6 bg-white/30 dark:bg-white/5 p-8 rounded-4xl border border-black/5 dark:border-white/5">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto"><AlertCircle size={32}/></div>
                <h3 className="text-xl font-bold tracking-tight">Гарантия спроса</h3>
                <p className="opacity-50 text-sm italic font-medium leading-relaxed">Запуск IT-продукта часто бывает «пальцем в небо». Мы используем живой поиск nx4, чтобы подтвердить, что за ваше решение реально готовы платить.</p>
              </div>
            </div>

            <button 
              onClick={() => onComplete(selections)}
              className="group bg-blue-600 hover:bg-blue-500 text-white px-16 py-6 rounded-full font-bold text-xl transition-all shadow-2xl active:scale-95 flex items-center gap-4 mx-auto"
            >
              Начать исследование <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
