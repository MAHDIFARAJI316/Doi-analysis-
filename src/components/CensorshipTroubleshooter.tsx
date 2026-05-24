import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, VpnConfig } from '../types';
import { Send, Bot, User, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

interface CensorshipTroubleshooterProps {
  contextConfigs: VpnConfig[];
}

export const CensorshipTroubleshooter: React.FC<CensorshipTroubleshooterProps> = ({ contextConfigs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'سلام! من دستیار هوشمند و تحلیلگر تخصصی کانفیگ‌ها و پروتکل‌های ضد فیلترینگ شما هستم. تمامی کدهای کانفیگ لود شده را مدل‌سازی و آنالیز کرده‌ام. هرگونه سوال در مورد پینگ بالا، فینگرپرینت DPI، راه‌اندازی درگاه Reality یا عیب‌یابی کلاینت‌ها دارید بپرسید.',
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    'چگونه گره‌ها را به Reality تبدیل کنم؟',
    'چرا تنظیم allowInsecure آسیب‌پذیر است؟',
    'چکار کنیم تا پورت‌ها توسط فیلترچی شناسایی و بلاک نشوند؟',
    'بهترین تنظیم کلاینت V2RayN / Nekobox چیست؟'
  ];

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Math.random().toString(36).substring(2, 11),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          contextConfigs
        })
      });

      if (!response.ok) {
        throw new Error('سیستم هوش مصنوعی موقتا پاسخگو نیست.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: data.id,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: `متاسفانه به دلیل اختلال ارتباطی یا عدم تنظیم کلید، امکان برقراری ارتباط با مدل وجود ندارد. راهکار مهندسی پیشنهادی بنده:

1. **عیب‌یابی پورت**: مطمئن شوید پورت سرور در فیلتر شدید مخفی باشد.
2. **بررسی گواهینامه**: فلگ allowInsecure را خاموش و SNI معتبر استفاده نمایید.`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
      
      {/* Header section of Chat */}
      <div className="bg-slate-900 p-4 flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg pulse-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">دستیار مهندسی معکوس و عیب‌یابی شبکه</h4>
            <span className="text-[10px] text-slate-400">مشاوره تخصصی آنلاین ساختارهای دور زدن DPI</span>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-indigo-505/20 px-2 py-0.5 rounded bg-white/10 text-indigo-300">
          CONTEXT_NODES: {contextConfigs.length}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
          >
            {/* Avatar code */}
            <div className={`p-2 rounded-xl shrink-0 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-150 text-slate-700'}`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-500" />}
            </div>

            {/* Content box */}
            <div className={`p-4.5 rounded-2xl flex flex-col space-y-1.5 ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tl-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tr-none shadow-sm'}`}>
              <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans font-medium">
                {msg.text}
              </p>
              <span className={`text-[9px] self-end ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-3 ml-auto max-w-[85%]">
            <div className="p-2 bg-white border border-slate-150 text-slate-700 rounded-xl">
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="bg-white border border-slate-100 p-4.5 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-500 font-sans">هوش مصنوعی در حال بازخوانی ساختارهای کانفیگ‌ها...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset fast prompt options */}
      <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto select-none">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isSending}
            className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 py-1.5 px-3 rounded-xl shrink-0 transition duration-150 disabled:opacity-50"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat input controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-slate-150 flex gap-2.5 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="هرگونه عیب‌یابی درگاه، ارور، پینگ کلاینت کلاینت‌ها را اینجا مطرح کنید..."
          disabled={isSending}
          className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:border-indigo-550 focus:bg-white text-slate-800 disabled:opacity-60 transition duration-150"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl text-white transition duration-150 disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
