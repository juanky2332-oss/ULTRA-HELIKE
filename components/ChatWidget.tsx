import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Medal, AlertTriangle, Lock } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: '📍 Centro de Mando Online.\n\nSoy tu estratega para los 100km. Pregúntame por:\n\n🎒 Material Obligatorio\n⚡ Ritmos por sector\n🥪 Plan de nutrición',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [offTopicStrikes, setOffTopicStrikes] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isBlocked) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const replyText = await sendMessageToGemini(messages, input);

    let finalContent = replyText;
    
    if (replyText === "OFF_TOPIC") {
      const newStrikes = offTopicStrikes + 1;
      setOffTopicStrikes(newStrikes);
      
      if (newStrikes >= 3) {
        setIsBlocked(true);
        finalContent = "⛔ BLOQUEO DE SEGURIDAD.\n\nHas excedido el límite de consultas irrelevantes. Este canal es exclusivo para corredores. Sistema bloqueado.";
      } else {
        finalContent = `⚠️ AVISO ${newStrikes}/3: Tema irrelevante.\n\nConcéntrate en la carrera. No puedo procesar información ajena a la Ultra Helike.`;
      }
    }

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: finalContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  // Helper to render formatted text with line breaks
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block min-h-[1rem]">
        {line}
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-emerald-50 rounded-[2rem] overflow-hidden shadow-2xl relative border border-stone-800">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      {/* Header */}
      <div className={`p-4 border-b border-stone-800 flex items-center gap-4 z-10 backdrop-blur-sm ${isBlocked ? 'bg-red-900/50' : 'bg-stone-900/90'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${isBlocked ? 'bg-red-600' : 'bg-emerald-600'}`}>
           {isBlocked ? <Lock className="text-white" size={20} /> : <Medal className="text-white" size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            {isBlocked ? 'SISTEMA BLOQUEADO' : 'Race Coach AI'}
            {!isBlocked && <Sparkles size={12} className="text-emerald-400 animate-pulse" />}
          </h3>
          <p className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">
            {isBlocked ? 'Acceso Denegado' : 'Estrategia 100km'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : msg.content.includes('⚠️') || msg.content.includes('⛔')
                      ? 'bg-red-900/30 border border-red-800 text-red-100 rounded-tl-sm'
                      : 'bg-stone-800 border border-stone-700 text-stone-200 rounded-tl-sm'
                }`}
              >
                {renderContent(msg.content)}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-stone-800 p-3 rounded-2xl rounded-tl-sm border border-stone-700 flex gap-1">
                <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 z-10 bg-stone-900 border-t border-stone-800">
        {isBlocked ? (
          <div className="w-full bg-red-900/20 border border-red-800 rounded-xl p-3 text-center text-red-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <AlertTriangle size={14} /> Chat Deshabilitado
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre la carrera..."
              className="w-full bg-stone-950 text-stone-100 placeholder-stone-600 border border-stone-800 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
