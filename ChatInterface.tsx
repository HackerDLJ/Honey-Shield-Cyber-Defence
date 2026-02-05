
import React, { useState, useRef, useEffect } from 'react';
import { Incident, Message } from '../types';
import { PERSONAS } from '../constants';
import { Send, Bot, Loader2, ShieldCheck, PhoneForwarded } from 'lucide-react';
import { generateHoneypotResponse } from '../geminiService';

interface ChatInterfaceProps {
  incident: Incident;
  onNewMessage: (msg: Message) => void;
  isSimulating: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ incident, onNewMessage, isSimulating }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const persona = PERSONAS[incident.persona];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [incident.messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'scammer',
      text: input,
      timestamp: new Date(),
    };

    onNewMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const aiResponseText = await generateHoneypotResponse(
      incident.persona,
      incident.messages,
      input
    );

    const delay = Math.random() * 1500 + 800;
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'honeypot',
        text: aiResponseText,
        timestamp: new Date(),
      };
      onNewMessage(aiMsg);
      setIsTyping(false);
    }, delay);
  };

  const handleDisconnect = () => {
    alert("Terminating secure tunnel and purging local intercept traces...");
  };

  const handleClearLogs = () => {
    alert("Local view logs cleared. Remote forensic data remains secure.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl px-6 py-5 border-b border-slate-800/60 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shadow-lg shadow-black/40" />
            <div className="absolute -top-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white tracking-tight">{persona.name}</h3>
              <span className="text-[10px] font-black bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">Agent Active</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <PhoneForwarded size={12} className="text-slate-600" />
              Monitoring: {incident.scammerNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
          <ShieldCheck size={14} className="text-rose-400" />
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Tunnel Secure</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10">
        {incident.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <div className="p-8 bg-slate-800/40 rounded-[48px] mb-4">
              <Bot size={48} className="text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Awaiting Connection</p>
          </div>
        ) : (
          incident.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'scammer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative max-w-[85%] rounded-2xl px-5 py-4 text-[14px] leading-relaxed transition-all duration-300 ${
                msg.role === 'scammer' 
                  ? 'bg-slate-800/80 text-slate-200 rounded-tr-none border border-slate-700/50 shadow-lg' 
                  : 'bg-rose-700 text-white rounded-tl-none shadow-xl shadow-rose-950/30 font-medium'
              }`}>
                {msg.text}
                <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity ${msg.role === 'scammer' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 border border-slate-700/50 text-slate-400 rounded-2xl px-5 py-3 rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Processing Response</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-black/40 backdrop-blur-xl border-t border-slate-800/60">
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-2 transition-all focus-within:border-rose-500/40 focus-within:ring-4 focus-within:ring-rose-500/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Simulate scammer message..."
            className="flex-1 bg-transparent px-4 py-2 text-sm font-medium focus:outline-none placeholder:text-slate-700"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-rose-500" /> Real-time agent monitoring
          </p>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={handleClearLogs} 
              className="text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
            >
              Clear Logs
            </button>
            <button 
              type="button" 
              onClick={handleDisconnect} 
              className="text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors"
            >
              Disconnect Tunnel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
