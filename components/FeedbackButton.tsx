
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Send, CheckCircle2, MessageSquareText, X, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { transcribeAudio } from '../services/apiService';

interface Props {
  selectedModel: string;
}

export const FeedbackButton: React.FC<Props> = ({ selectedModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription(null);
      setIsSent(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Не удалось получить доступ к микрофону. Проверьте разрешения в браузере.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = (reader.result as string).split(',')[1];
      const text = await transcribeAudio(base64data, 'audio/webm', selectedModel);
      setTranscription(text);
      setIsProcessing(false);
    };
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSent(false);
      setTranscription(null);
    }, 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 pl-4 pr-6 py-4 bg-blue-600 text-white rounded-full shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all group border border-white/20"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquareText size={20} className="group-hover:rotate-12 transition-transform" />
          </div>
          <span className="font-bold text-sm tracking-tight">Обратная связь</span>
        </button>
      ) : (
        <div className="w-80 md:w-96 bg-white dark:bg-[#1c1c1e] rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 p-8 animate-slide-up overflow-hidden relative backdrop-blur-3xl">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-all p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>

          <div className="text-center space-y-6 pt-2">
            <div>
              <h3 className="font-bold text-lg heading-refined">Голосовой отзыв</h3>
              <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">OpenRouter NX4 Transcribe</p>
            </div>
            
            {!selectedModel.includes('gemini') && (
              <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2 text-[9px] font-bold text-yellow-600 uppercase text-left">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Xiaomi не поддерживает аудио. Используйте Gemini для этого модуля.</span>
              </div>
            )}

            {!transcription && !isProcessing && !isSent && (
              <p className="text-xs opacity-60 font-medium leading-relaxed px-4">
                {isRecording 
                  ? "Мы записываем ваш голос. Говорите прямо сейчас." 
                  : "Расскажите нам о своем опыте или предложите улучшения."}
              </p>
            )}

            <div className="flex flex-col items-center justify-center py-4">
              {isRecording && (
                <div className="text-2xl font-mono font-bold text-red-500 mb-6 animate-pulse">
                  {formatTime(recordingTime)}
                </div>
              )}

              {!isRecording && !isProcessing && !transcription && !isSent && (
                <button 
                  onClick={startRecording}
                  disabled={!selectedModel.includes('gemini')}
                  className="w-24 h-24 bg-blue-600 text-white rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] group relative disabled:opacity-20 disabled:grayscale"
                >
                  <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
                  <Mic size={32} className="relative z-10" />
                  <span className="text-[9px] font-bold uppercase mt-2 relative z-10">Начать</span>
                </button>
              )}

              {isRecording && (
                <button 
                  onClick={stopRecording}
                  className="w-24 h-24 bg-red-600 text-white rounded-full flex flex-col items-center justify-center hover:bg-red-500 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)] relative group"
                >
                  <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse opacity-40"></div>
                  <Square size={32} className="relative z-10" />
                  <span className="text-[9px] font-bold uppercase mt-2 relative z-10">Стоп</span>
                </button>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="relative">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                  </div>
                  <span className="text-[10px] font-bold uppercase opacity-40 tracking-[0.2em] animate-pulse">Обработка голоса...</span>
                </div>
              )}

              {isSent && (
                <div className="flex flex-col items-center gap-4 text-green-500 animate-fade-in py-6">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={40} />
                  </div>
                  <span className="text-sm font-bold block">Отправлено!</span>
                </div>
              )}
            </div>

            {transcription && !isProcessing && !isSent && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <span className="text-[9px] font-bold uppercase opacity-30 block mb-3 tracking-widest">Результат:</span>
                  <textarea 
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium leading-relaxed italic opacity-80 resize-none h-24 focus:ring-0 p-0"
                  />
                </div>
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setTranscription(null)}
                     className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                   >
                     <Trash2 size={14} /> Сбросить
                   </button>
                   <button 
                     onClick={handleSend}
                     className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                   >
                     <Send size={14} /> Отправить
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
