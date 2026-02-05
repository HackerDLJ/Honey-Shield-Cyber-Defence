
import React from 'react';
import { Incident } from '../types';
import { PERSONAS, THREAT_COLORS } from '../constants';
import { Clock, MessageSquare, ArrowRight, ShieldCheck, Smartphone, MessageCircle, Globe, Send, ShoppingBag, Instagram, Facebook, Phone } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  isActive: boolean;
  onClick: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, isActive, onClick }) => {
  const persona = PERSONAS[incident.persona];
  const lastMessage = incident.messages[incident.messages.length - 1];

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'Truecaller': return <Smartphone size={10} />;
      case 'WhatsApp_Guard': return <MessageCircle size={10} />;
      case 'SMS_Filter': return <MessageSquare size={10} />;
      case 'I4C_Network': return <Globe size={10} />;
      default: return <ShieldCheck size={10} />;
    }
  };

  const getAppIcon = (app: string) => {
    switch (app) {
      case 'WhatsApp': return <MessageCircle size={12} className="text-emerald-500" />;
      case 'Telegram': return <Send size={12} className="text-sky-500" />;
      case 'OLX': return <ShoppingBag size={12} className="text-blue-600" />;
      case 'PhonePe': return <Smartphone size={12} className="text-purple-500" />;
      case 'GooglePay': return <Smartphone size={12} className="text-blue-500" />;
      case 'Instagram': return <Instagram size={12} className="text-rose-500" />;
      case 'Facebook': return <Facebook size={12} className="text-blue-700" />;
      case 'SMS': return <MessageSquare size={12} className="text-amber-500" />;
      case 'Voice': return <Phone size={12} className="text-slate-400" />;
      default: return null;
    }
  };

  return (
    <div 
      onClick={() => onClick(incident.id)}
      className={`relative p-5 rounded-2xl transition-all duration-300 cursor-pointer border group overflow-hidden ${
        isActive 
          ? 'bg-rose-600/10 border-rose-500/40 shadow-xl shadow-rose-950/20' 
          : 'bg-slate-900/40 border-slate-800 hover:border-rose-900 hover:bg-rose-950/20'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 border border-slate-700" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{persona.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-black text-slate-500 font-mono tracking-tight">{incident.scammerNumber}</span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${THREAT_COLORS[incident.threatLevel]}`}>
          {incident.threatLevel}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-slate-800/60">
          {getAppIcon(incident.appCategory)}
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{incident.appCategory}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50">
          {getSourceIcon(incident.source)}
          <span className="text-[9px] font-black text-rose-400/80 uppercase tracking-widest">{incident.source?.replace('_', ' ') || 'SYSTEM'}</span>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-3 mb-4 border border-slate-800/50">
        <p className="text-[13px] text-slate-400 italic line-clamp-2 leading-relaxed">
          "{lastMessage?.text || 'Awaiting connection...'}"
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-600" />
            <span>{incident.timeWastedMinutes}m wasted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare size={12} className="text-slate-600" />
            <span>{incident.messages.length} msgs</span>
          </div>
        </div>
        <ArrowRight 
          size={16} 
          className={`transition-all duration-300 ${isActive ? 'text-rose-400 translate-x-0' : 'text-slate-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} 
        />
      </div>
    </div>
  );
};
