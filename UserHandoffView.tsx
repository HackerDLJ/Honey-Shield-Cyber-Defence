import React, { useState } from 'react';
// Added MessageCircle and AlertTriangle to imports
import { Phone, MessageSquare, Shield, ArrowRight, Loader2, PhoneForwarded, Send, User, ChevronRight, MessageCircle, AlertTriangle } from 'lucide-react';

interface UserHandoffViewProps {
  onHandoff: (type: 'voice' | 'sms', data: any) => void;
}

export const UserHandoffView: React.FC<UserHandoffViewProps> = ({ onHandoff }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'sms'>('voice');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startHandoff = (type: 'voice' | 'sms', data: any) => {
    setIsProcessing(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onHandoff(type, data);
          setIsProcessing(false);
          setProgress(0);
        }, 500);
      }
    }, 50);
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
            <RadioIcon className="text-rose-500 animate-pulse" size={16} />
            <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Victim Side Simulation</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Live Threat Hand-off</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Simulate the user experience of receiving a scam threat and handing it off to HoneyShield's autonomous defence network.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <button 
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'voice' ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <Phone size={18} /> Voice Call Intercept
          </button>
          <button 
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'sms' ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <MessageSquare size={18} /> SMS / Chat Forward
          </button>
        </div>

        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md rounded-[48px] flex flex-col items-center justify-center p-10 animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-rose-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-rose-600/40 relative">
                <Shield size={48} className="text-white relative z-10" />
                <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Establishing Secure Tunnel</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Transferring scammer to autonomous HoneyNode...</p>
              
              <div className="w-full max-w-md h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-rose-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="mt-4 text-[10px] font-black text-rose-500/60 uppercase tracking-widest">{progress}% VERIFIED</p>
            </div>
          )}

          {activeTab === 'voice' ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-[48px] p-12 flex flex-col items-center max-w-2xl mx-auto shadow-2xl">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                <User size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Unknown Caller</h3>
              <p className="text-rose-500 font-mono text-sm mb-12">+91 70020 99812</p>

              <div className="flex flex-col gap-6 w-full">
                <button 
                  onClick={() => startHandoff('voice', { number: '+91 70020 99812', initialText: "Caller claims to be from electricity department." })}
                  className="group relative w-full bg-rose-600 hover:bg-rose-500 text-white p-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-6 transition-all active:scale-95 border-b-4 border-rose-800"
                >
                  <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <PhoneForwarded size={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] opacity-70 mb-1">Scam Detected</p>
                    <p className="text-lg">Hand-off to HoneyShield</p>
                  </div>
                  <ChevronRight size={24} className="ml-auto opacity-50" />
                </button>

                <div className="flex gap-4">
                  <button className="flex-1 bg-slate-800/50 text-slate-400 p-6 rounded-[24px] font-bold text-sm border border-slate-700">
                    Mute Call
                  </button>
                  <button className="flex-1 bg-slate-950 text-slate-600 p-6 rounded-[24px] font-bold text-sm border border-slate-900">
                    End Interaction
                  </button>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <Shield size={14} className="text-emerald-500/50" />
                Telecom API Layer: SECURE_BYPASS_READY
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-[48px] p-12 flex flex-col max-w-2xl mx-auto shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <MessageCircle size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-white">WhatsApp Message</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">+91 88120 44556</p>
                 </div>
              </div>

              <div className="bg-black/40 border border-slate-800 p-6 rounded-[24px] mb-12 relative">
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "Hello, your electricity bill for current month is unpaid. Your power will be disconnected in 1 hour. Contact 8812044556 immediately to pay via APK link."
                </p>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-black/40 rotate-45 border-l border-b border-slate-800" />
              </div>

              <button 
                onClick={() => startHandoff('sms', { number: '+91 88120 44556', initialText: "Scammer threatening power disconnection via APK." })}
                className="group w-full bg-rose-600 hover:bg-rose-500 text-white p-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-6 transition-all active:scale-95 border-b-4 border-rose-800"
              >
                <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shield size={28} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] opacity-70 mb-1">Threat Identified</p>
                  <p className="text-lg">Forward to Shield Channel</p>
                </div>
                <ChevronRight size={24} className="ml-auto opacity-50" />
              </button>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                 <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                 <p className="text-[11px] font-medium text-amber-500 leading-tight">
                    Forwarding will allow HoneyShield to autonomously engage this scammer via shadow-clone channels to waste their resources.
                 </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-center opacity-40">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Hub</p>
              <p className="text-sm font-bold text-white">Mumbai-West Node</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol</p>
              <p className="text-sm font-bold text-white">TR-42 Forensic</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Uptime</p>
              <p className="text-sm font-bold text-white">99.992% Active</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const RadioIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </svg>
);
