
import React from 'react';
import { BarChart3, Clock, ShieldAlert, Zap, Landmark, Globe } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface AnalyticsViewProps {
  stats: AnalyticsSummary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const StatCard = ({ icon: Icon, label, value, color, suffix }: any) => (
    <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl backdrop-blur-sm group hover:border-rose-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-2xl ${color} shadow-lg`}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-white tracking-tight leading-none">{value}{suffix}</span>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{label}</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
        <div className={`h-full ${color.replace('/10', '').replace('/20', '')} w-2/3 group-hover:w-full transition-all duration-1000`}></div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Global Live Feed</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Intelligence Network</h2>
          <p className="text-slate-500 mt-2 font-medium">Monitoring the Honeypot Defence grid across major telcos.</p>
        </div>
        <button className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-3 rounded-2xl text-[12px] font-bold hover:text-rose-400 transition-colors">
          Download Quarterly Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-10">
        <StatCard icon={Clock} label="Intercepted Minutes" value={stats.totalTimeWasted} suffix="" color="bg-rose-500/10 text-rose-500" />
        <StatCard icon={Landmark} label="Blocked UPI Nodes" value={stats.totalUpiBlocked} suffix="" color="bg-rose-500/10 text-rose-500" />
        <StatCard icon={ShieldAlert} label="Est. Loss Prevention" value={`₹${stats.moneySavedEstimate}`} suffix="L" color="bg-emerald-500/10 text-emerald-500" />
      </div>

      <div className="grid grid-cols-2 gap-10">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <Zap className="text-rose-500" size={20} />
            </div>
            <h3 className="text-xl font-black text-white">Threat Distribution</h3>
          </div>
          <div className="space-y-8">
            {[
              { label: 'UPI QR Fraud', value: 65, color: 'bg-rose-600' },
              { label: 'Bank Impersonation', value: 22, color: 'bg-rose-800' },
              { label: 'Aadhaar / KYC Urgency', value: 8, color: 'bg-slate-700' },
              { label: 'Courier / Customs Scam', value: 5, color: 'bg-slate-800' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-slate-800/40">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <Globe className="text-rose-500" size={20} />
              </div>
              <h3 className="text-xl font-black text-white">Scam Hub Origins</h3>
            </div>
            <div className="space-y-4">
              {['Jamtara District, JH', 'Bharatpur Region, RJ', 'Nuh Cluster, HR', 'Southeast Asia Nodes'].map((loc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-slate-800/50 hover:border-rose-900/40 transition-all cursor-default">
                  <span className="text-sm font-bold text-slate-300">{loc}</span>
                  <span className="text-[10px] font-black text-rose-500 px-3 py-1.5 bg-rose-500/10 rounded-lg uppercase tracking-widest">Intercept Active</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
             <BarChart3 size={320} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
