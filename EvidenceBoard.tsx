
import React, { useState } from 'react';
import { Evidence, EvidenceItem, Incident } from '../types';
import { 
  ClipboardCheck, 
  Link as LinkIcon, 
  CreditCard, 
  ExternalLink, 
  Fingerprint, 
  Clock, 
  MonitorDot, 
  FileSearch, 
  Scale,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface EvidenceBoardProps {
  incident: Incident;
  onRefresh: () => void;
  isExtracting: boolean;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({ incident, onRefresh, isExtracting }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportStatus, setReportStatus] = useState<'idle' | 'success'>('idle');
  
  const { evidence } = incident;
  const itemsByType = (type: EvidenceItem['type']) => 
    evidence.items.filter(item => item.type === type);

  const handleLEExport = async () => {
    setIsReporting(true);
    setReportStatus('idle');

    // Simulate forensic signing and packaging delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const transcript = incident.messages
      .map(m => `[${new Date(m.timestamp).toISOString()}] ${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const evidenceList = evidence.items
      .map(item => `- Type: ${item.type.toUpperCase()}\n  Value: ${item.value}\n  Context: ${item.context}\n  Confidence: ${(item.confidence * 100).toFixed(1)}%`)
      .join('\n\n');

    const reportContent = `
================================================================================
HONEYSHIELD FORENSIC EVIDENCE REPORT
================================================================================
Incident ID: ${incident.id}
Generated At: ${new Date().toISOString()}
Chain of Custody ID: ${evidence.chainOfCustodyId}
Session Digital Signature (Hash): ${evidence.sessionHash}
Scammer Identifier: ${incident.scammerNumber}
Target Persona: ${incident.persona}
================================================================================

EXTRACTED INDICATORS:
${evidenceList || "No indicators extracted yet."}

================================================================================
FULL INTERCEPT TRANSCRIPT:
================================================================================
${transcript}

================================================================================
END OF REPORT - CERT-In / I4C COMPLIANT FORMAT
================================================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HoneyShield_Evidence_${incident.id}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsReporting(false);
    setReportStatus('success');
    
    // Reset success state after 5 seconds
    setTimeout(() => setReportStatus('idle'), 5000);
  };

  const EvidenceSection = ({ title, type, icon: Icon, color }: { title: string, type: EvidenceItem['type'], icon: any, color: string }) => {
    const items = itemsByType(type);
    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${color} shadow-sm`}>
            <Icon size={16} />
          </div>
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
          <span className="text-[11px] font-mono text-slate-700 ml-auto font-bold">{items.length} FOUND</span>
        </div>
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="group bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl hover:border-rose-900/50 hover:bg-rose-950/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-rose-400 break-all select-all font-medium">{item.value}</code>
                  <button className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                    <ExternalLink size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  <span className="font-mono text-slate-700">{item.id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-500">LE-READY</span>
                    <span className="flex items-center gap-1 opacity-60"><Clock size={10} /> {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-600 font-medium italic px-4 py-3 border border-dashed border-slate-800/60 rounded-2xl">Awaiting extraction...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] overflow-hidden flex flex-col h-full shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/60 bg-black/60 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20">
            <Fingerprint size={24} className="text-rose-400" />
          </div>
          <div>
            <h3 className="font-black text-white text-base leading-none tracking-tight">Forensic Layer</h3>
            <p className="text-[10px] text-rose-500 font-mono mt-1.5 font-bold uppercase tracking-tight">LEA COMPLIANT</p>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isExtracting || isReporting}
          className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 p-3 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          title="Run Evidence Scan"
        >
          {isExtracting ? <Clock size={18} className="animate-spin" /> : <FileSearch size={18} />}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 border-b border-slate-800/60">
        <div className="p-4 text-center border-r border-slate-800/60">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Scam Signals</p>
          <p className="text-2xl font-black text-white">{evidence.items.length}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Legal Hash</p>
          <p className="text-[10px] font-mono text-rose-500 truncate px-2">{evidence.sessionHash}</p>
        </div>
      </div>

      {/* Main Evidence Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-black/10">
        <EvidenceSection title="UPI Gateways" type="upi" icon={ClipboardCheck} color="bg-rose-500/10 text-rose-400" />
        <EvidenceSection title="Remote Access" type="remote_access" icon={MonitorDot} color="bg-amber-500/10 text-amber-400" />
        <EvidenceSection title="Phishing Links" type="link" icon={LinkIcon} color="bg-rose-500/10 text-rose-400" />
        <EvidenceSection title="Bank Accounts" type="bank" icon={CreditCard} color="bg-sky-500/10 text-sky-400" />
      </div>

      {/* LE Layer Actions */}
      <div className="p-6 bg-black/60 backdrop-blur-xl border-t border-slate-800/60 space-y-3">
        {reportStatus === 'success' ? (
          <div className="flex items-center justify-center gap-3 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={18} />
            <span className="text-[13px] font-black uppercase tracking-widest">Report Filed Successfully</span>
          </div>
        ) : (
          <button 
            onClick={handleLEExport}
            disabled={evidence.items.length === 0 || isReporting}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white py-4 rounded-2xl text-[13px] font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-rose-950/20 border-b-2 border-rose-800"
          >
            {isReporting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                SIGNING FORENSIC BUNDLE...
              </>
            ) : (
              <>
                <Scale size={18} />
                REPORT TO CYBER CELL (I4C)
              </>
            )}
          </button>
        )}
        <div className="flex items-center justify-center gap-2 opacity-40">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Package Meets LE Standard 42-C</p>
        </div>
      </div>
    </div>
  );
};
