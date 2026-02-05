import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Incident, PersonaId, Message, Evidence, AnalyticsSummary, DetectionSource, AppCategory } from './types';
import { PERSONAS } from './constants';
import { extractForensicEvidence } from './geminiService';
import { IncidentCard } from './components/IncidentCard';
import { ChatInterface } from './components/ChatInterface';
import { EvidenceBoard } from './components/EvidenceBoard';
import { AnalyticsView } from './components/AnalyticsView';
import { UserHandoffView } from './components/UserHandoffView';
import { 
  Shield, 
  LayoutDashboard, 
  History, 
  Search as SearchIcon, 
  Plus, 
  BarChart3, 
  Lock, 
  Zap, 
  Cpu, 
  ArrowRightLeft, 
  Skull, 
  X, 
  Filter, 
  RefreshCw, 
  Globe, 
  CheckCircle, 
  Smartphone, 
  MessageSquare, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  ShoppingBag, 
  Send, 
  Phone, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Info,
  ChevronRight,
  Target,
  Command,
  Clock,
  ChevronDown,
  User,
  Layout,
  Terminal,
  Database,
  Radio
} from 'lucide-react';

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'HS-7729',
    status: 'active',
    scammerNumber: '+91 70000 02025',
    threatLevel: 'high',
    persona: 'RETIRED_OFFICER',
    appCategory: 'WhatsApp',
    createdAt: new Date(),
    timeWastedMinutes: 54,
    detectionScore: 98,
    source: 'Truecaller',
    messages: [
      { id: 'm1', role: 'scammer', text: "Sir, I am calling from KBC Mumbai. You won 25 Lakhs lottery. Send ₹12,500 file charge now.", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 'm2', role: 'honeypot', text: "Yes, this is Manager Amitabh. I have your file. Where is the GST payment?", timestamp: new Date(Date.now() - 1000 * 60 * 58) }
    ],
    evidence: {
      items: [
        { id: 'ev1', value: 'kbc.win@upi', type: 'upi', confidence: 0.99, context: 'Requested file charge payment', timestamp: new Date() }
      ],
      lastExtractionTime: new Date(),
      chainOfCustodyId: 'HS-SEC-9981',
      sessionHash: '0x8f3c...2d1'
    }
  }
];

const MOCK_STATS: AnalyticsSummary = {
  totalTimeWasted: 19120,
  totalUpiBlocked: 1154,
  totalLinksFlagged: 2510,
  totalRemoteAccessBlocked: 468,
  activeIntercepts: 25,
  moneySavedEstimate: 228.4
};

const APP_METADATA: Record<AppCategory, { icon: any; color: string; description: string; risk: 'low' | 'medium' | 'high'; trend: 'up' | 'down' | 'stable'; volume: string }> = {
  WhatsApp: { icon: MessageCircle, color: 'text-emerald-500', description: 'International call & KYC fraud', risk: 'high', trend: 'up', volume: 'Heavy' },
  Telegram: { icon: Send, color: 'text-sky-500', description: 'Part-time job & crypto scams', risk: 'high', trend: 'up', volume: 'Medium' },
  OLX: { icon: ShoppingBag, color: 'text-blue-600', description: 'Marketplace & QR payment fraud', risk: 'medium', trend: 'stable', volume: 'Moderate' },
  PhonePe: { icon: Smartphone, color: 'text-purple-500', description: 'Cashback & payment requests', risk: 'high', trend: 'down', volume: 'High' },
  GooglePay: { icon: Smartphone, color: 'text-blue-500', description: 'G-Pay reward point fraud', risk: 'medium', trend: 'stable', volume: 'Low' },
  Instagram: { icon: Instagram, color: 'text-rose-500', description: 'Fake profile & romance fraud', risk: 'medium', trend: 'up', volume: 'Growing' },
  Facebook: { icon: Facebook, color: 'text-blue-700', description: 'Impersonation & gift scams', risk: 'medium', trend: 'stable', volume: 'Low' },
  SMS: { icon: MessageSquare, color: 'text-amber-500', description: 'Bank & electricity bill alerts', risk: 'high', trend: 'up', volume: 'Critical' },
  Voice: { icon: Phone, color: 'text-slate-400', description: 'Vishing & IVR impersonation', risk: 'high', trend: 'stable', volume: 'Consistent' }
};

const TrashIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" />
  </svg>
);

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(INITIAL_INCIDENTS[0].id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'archive' | 'analytics' | 'apps' | 'live-handoff'>('dashboard');
  const [selectedApp, setSelectedApp] = useState<AppCategory | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hs-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const filteredIncidents = useMemo(() => {
    let list = incidents.filter(i => 
      activeTab === 'archive' ? i.status === 'archived' : i.status !== 'archived'
    );
    
    if (activeTab === 'apps' && selectedApp) {
      list = list.filter(i => i.appCategory === selectedApp);
    }

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(i => 
      i.scammerNumber.includes(term) || 
      i.id.toLowerCase().includes(term) ||
      PERSONAS[i.persona].name.toLowerCase().includes(term) ||
      i.source?.toLowerCase().includes(term) ||
      i.appCategory.toLowerCase().includes(term)
    );
  }, [incidents, searchTerm, activeTab, selectedApp]);

  const paletteResults = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    const matchedIncidents = incidents.filter(i => 
      i.scammerNumber.includes(term) || i.id.toLowerCase().includes(term)
    ).slice(0, 3).map(i => ({ type: 'incident', icon: Target, data: i, label: i.id, sub: i.scammerNumber, color: 'text-rose-500' }));

    const matchedApps = (Object.keys(APP_METADATA) as AppCategory[]).filter(app => 
      app.toLowerCase().includes(term)
    ).slice(0, 2).map(app => ({ type: 'app', icon: Smartphone, data: app, label: app, sub: 'Protocol Stream', color: 'text-sky-500' }));

    const matchedActions = [
      { type: 'action', icon: Radio, label: 'Trigger Live Handoff', sub: 'Simulate Victim UI', action: 'handoff', color: 'text-rose-400' },
      { type: 'action', icon: RefreshCw, label: 'Sync Global Network', sub: 'I4C/CERT-In Integration', action: 'sync', color: 'text-emerald-500' },
      { type: 'action', icon: BarChart3, label: 'View Impact Analytics', sub: 'Loss Prevention Data', action: 'analytics', color: 'text-amber-500' },
      { type: 'action', icon: TrashIcon, label: 'Clear Search History', sub: 'Purge Palette History', action: 'clear', color: 'text-slate-500' }
    ].filter(a => !term || a.label.toLowerCase().includes(term) || a.sub.toLowerCase().includes(term));

    return [...matchedIncidents, ...matchedApps, ...matchedActions];
  }, [searchTerm, incidents]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleSyncNetwork = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    const categories: AppCategory[] = ['WhatsApp', 'Telegram', 'SMS', 'PhonePe', 'OLX'];
    const newIncident: Incident = {
      id: `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending_handoff',
      scammerNumber: `+91 ${Math.floor(70000 + Math.random() * 20000)} ${Math.floor(10000 + Math.random() * 80000)}`,
      threatLevel: 'high',
      persona: Math.random() > 0.5 ? 'STUDENT' : 'RETIRED_OFFICER',
      appCategory: categories[Math.floor(Math.random() * categories.length)],
      createdAt: new Date(),
      timeWastedMinutes: 0,
      detectionScore: 95 + Math.floor(Math.random() * 5),
      source: ['Truecaller', 'I4C_Network', 'SMS_Filter'][Math.floor(Math.random() * 3)] as DetectionSource,
      messages: [{ id: `sync-${Date.now()}`, role: 'scammer', text: "System sync verified. Portal active.", timestamp: new Date() }],
      evidence: { items: [], lastExtractionTime: null, chainOfCustodyId: `HS-SEC-${Math.floor(1000 + Math.random() * 8000)}`, sessionHash: `0x${Math.random().toString(16).substring(2, 10)}` }
    };
    setIncidents(prev => [newIncident, ...prev]);
    setIsSyncing(false);
    setSyncStatus('success');
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handlePaletteAction = (result: any) => {
    if (result.type === 'incident') {
      setSelectedIncidentId(result.data.id);
      setActiveTab('dashboard');
    } else if (result.type === 'app') {
      setSelectedApp(result.data);
      setActiveTab('apps');
    } else if (result.type === 'action') {
      switch (result.action) {
        case 'handoff': setActiveTab('live-handoff'); break;
        case 'sync': handleSyncNetwork(); break;
        case 'analytics': setActiveTab('analytics'); break;
        case 'archive': setActiveTab('archive'); break;
        case 'clear': 
          setRecentSearches([]); 
          localStorage.removeItem('hs-recent-searches'); 
          break;
      }
    }

    if (searchTerm && !result.action) {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('hs-recent-searches', JSON.stringify(updated));
    }
    
    setSearchTerm('');
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, paletteResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (paletteResults[selectedIndex]) {
        handlePaletteAction(paletteResults[selectedIndex]);
      }
    }
  };

  const selectedIncident = useMemo(() => 
    incidents.find(i => i.id === selectedIncidentId), 
  [incidents, selectedIncidentId]);

  const handleHandoff = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { 
          ...inc, 
          status: 'active',
          messages: [...inc.messages, { id: 'sys-1', role: 'system', text: "System: Interaction redirected to AI Honeypot.", timestamp: new Date() }]
        };
      }
      return inc;
    }));
  };

  const handleNewMessage = (msg: Message) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentId) {
        return { ...inc, messages: [...inc.messages, msg], timeWastedMinutes: inc.timeWastedMinutes + (msg.role === 'honeypot' ? 1.5 : 0) };
      }
      return inc;
    }));
  };

  const handleRefreshEvidence = async () => {
    if (!selectedIncident) return;
    setIsExtracting(true);
    const items = await extractForensicEvidence(selectedIncident.messages);
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentId) {
        return { 
          ...inc, 
          evidence: { 
            ...inc.evidence, 
            items: [...inc.evidence.items, ...items.filter(newItem => !inc.evidence.items.some(old => old.value === newItem.value))],
            lastExtractionTime: new Date()
          } 
        };
      }
      return inc;
    }));
    setIsExtracting(false);
  };

  const handleUserHandoff = (type: 'voice' | 'sms', data: any) => {
    const newInc: Incident = {
      id: `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
      scammerNumber: data.number || '+91 98765 43210',
      threatLevel: 'high',
      persona: type === 'voice' ? 'RETIRED_OFFICER' : 'STUDENT',
      appCategory: type === 'voice' ? 'Voice' : 'WhatsApp',
      createdAt: new Date(),
      timeWastedMinutes: 1,
      detectionScore: 99,
      source: 'Manual',
      messages: [
        { id: 'h-1', role: 'scammer', text: data.initialText || "Connecting live feed...", timestamp: new Date() },
        { id: 'h-sys', role: 'system', text: `System: ${type === 'voice' ? 'Call transferred to HoneyNode.' : 'Message chain forwarded to Shield Channel.'}`, timestamp: new Date() }
      ],
      evidence: { items: [], lastExtractionTime: null, chainOfCustodyId: `HS-USER-${Date.now()}`, sessionHash: `0x${Math.random().toString(16).substring(2, 8)}` }
    };
    setIncidents([newInc, ...incidents]);
    setSelectedIncidentId(newInc.id);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-100 bg-transparent selection:bg-rose-500/30">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-slate-900/50 flex flex-col bg-black/40 backdrop-blur-3xl z-30 shrink-0">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-rose-600 p-2.5 rounded-2xl shadow-2xl shadow-rose-900/40">
            <Shield className="text-white" size={26} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">HoneyShield</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em]">Cyber Defence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Threat Center', icon: LayoutDashboard },
            { id: 'live-handoff', label: 'Victim Shield', icon: Radio },
            { id: 'apps', label: 'App Explorer', icon: Smartphone },
            { id: 'analytics', label: 'Impact Data', icon: BarChart3 },
            { id: 'archive', label: 'Forensic Vault', icon: History }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-950/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl border border-slate-800 p-5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-600/5 blur-3xl" />
            <div className="relative z-10 text-center">
               <Cpu size={16} className="text-rose-500 mx-auto mb-2" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Core Version 4.2.1</p>
               <p className="text-[8px] text-slate-700 font-bold mt-2">SECURE_LINK_ACTIVE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="border-b border-slate-900/50 bg-black/20 backdrop-blur-3xl z-40 h-24 flex items-center justify-between px-12 gap-8 shrink-0">
          <div className="flex items-center flex-1 max-w-2xl gap-4 relative">
            <div className="relative flex-1 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-all duration-300 z-10">
                <SearchIcon size={20} strokeWidth={2.5} />
              </div>
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Query system... (e.g. HS-7729, WhatsApp, Sync)"
                className={`w-full bg-slate-950/60 border border-slate-800/80 rounded-[30px] pl-16 pr-32 py-5 text-[14px] font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none transition-all duration-500 shadow-2xl ${
                  isSearchFocused ? 'border-rose-500/50 ring-[12px] ring-rose-500/5 bg-slate-900/80' : 'hover:bg-slate-900/40'
                }`}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1.5 hover:bg-slate-800 rounded-full text-slate-500 hover:text-rose-400 transition-colors">
                    <X size={16} />
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border border-slate-800/80 rounded-xl shadow-lg select-none pointer-events-none">
                  <Command size={10} className="text-slate-600" />
                  <span className="text-[10px] font-black text-slate-600 tracking-tighter">K</span>
                </div>
              </div>

              {/* Command Palette Overlay */}
              {isSearchFocused && (
                <div className="absolute top-[calc(100%+16px)] left-0 right-0 bg-slate-950/95 backdrop-blur-3xl border border-slate-800 rounded-[32px] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 ring-1 ring-white/5">
                  <div className="p-4 border-b border-slate-800/60 bg-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3 px-3">
                        <Terminal size={14} className="text-rose-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forensic Command Engine</span>
                     </div>
                  </div>
                  
                  <div className="max-h-[420px] overflow-y-auto p-3 custom-scrollbar">
                    {!searchTerm && recentSearches.length > 0 && (
                      <div className="mb-4">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Clock size={12} /> Recent Trace Queries
                        </div>
                        {recentSearches.map((s, i) => (
                          <button 
                            key={i}
                            onClick={() => setSearchTerm(s)}
                            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-white/5 text-left group transition-all"
                          >
                            <SearchIcon size={14} className="text-slate-700 group-hover:text-rose-500" />
                            <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-100">{s}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {paletteResults.length > 0 ? (
                      <div className="space-y-1">
                        {paletteResults.map((res, i) => (
                          <button 
                            key={i}
                            onMouseEnter={() => setSelectedIndex(i)}
                            onClick={() => handlePaletteAction(res)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 group ${
                              selectedIndex === i ? 'bg-rose-500/10 border border-rose-500/30 shadow-inner translate-x-1' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-5">
                               <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${res.color}`}>
                                  <res.icon size={18} strokeWidth={2.5} />
                               </div>
                               <div className="text-left">
                                  <p className={`text-[14px] font-bold ${selectedIndex === i ? 'text-white' : 'text-slate-300'}`}>{res.label}</p>
                                  <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">{res.sub}</p>
                               </div>
                            </div>
                            <div className={`flex items-center gap-2 opacity-0 ${selectedIndex === i ? 'opacity-100' : ''} transition-opacity`}>
                               <span className="text-[10px] font-black bg-slate-900 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-800 uppercase text-[9px]">ENTER</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchTerm && (
                      <div className="p-16 text-center">
                         <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 opacity-50">
                            <Database size={32} className="text-slate-700" />
                         </div>
                         <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No matching results found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleSyncNetwork}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
              syncStatus === 'success' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : syncStatus === 'success' ? <CheckCircle size={16} /> : <Globe size={16} />}
            {isSyncing ? 'Syncing...' : 'Sync APIs'}
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative h-full">
          {activeTab === 'analytics' ? (
            <AnalyticsView stats={MOCK_STATS} />
          ) : activeTab === 'live-handoff' ? (
            <UserHandoffView onHandoff={handleUserHandoff} />
          ) : activeTab === 'apps' ? (
            <div className="h-full flex flex-col bg-slate-950/20">
              <div className="px-12 pt-8 pb-4 border-b border-slate-900/50 bg-black/10">
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                  {(Object.keys(APP_METADATA) as AppCategory[]).map((appId) => {
                    const meta = APP_METADATA[appId];
                    const count = incidents.filter(i => i.appCategory === appId).length;
                    const isSelected = selectedApp === appId;
                    return (
                      <button
                        key={appId}
                        onClick={() => setSelectedApp(isSelected ? null : appId)}
                        className={`flex-none w-52 flex flex-col items-center p-4 rounded-[24px] border transition-all duration-300 relative ${
                          isSelected 
                            ? 'bg-rose-600/20 border-rose-500/60' 
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl bg-black/40 mb-3 ${meta.color}`}>
                          <meta.icon size={20} />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>{appId}</span>
                        <span className="text-[8px] text-slate-600 font-bold uppercase">{meta.volume} Traffic</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden p-8 gap-8">
                <div className="w-[340px] flex flex-col gap-6">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <Target size={14} className="text-rose-500" /> Platform Intercepts
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {filteredIncidents.length > 0 ? (
                      filteredIncidents.map(inc => (
                        <IncidentCard key={inc.id} incident={inc} isActive={selectedIncidentId === inc.id} onClick={setSelectedIncidentId} />
                      ))
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-[24px] opacity-30">
                        <Info size={24} className="mb-2" />
                        <p className="text-[9px] font-black uppercase">No Data</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  {selectedIncident && (!selectedApp || selectedIncident.appCategory === selectedApp) ? (
                    <div className="flex-1">
                      <ChatInterface incident={selectedIncident} onNewMessage={handleNewMessage} isSimulating={true} />
                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-900/10 border border-slate-900 border-dashed rounded-[32px] flex flex-col items-center justify-center text-center p-10">
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Select Node for Detail</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-10 gap-10 flex h-full">
              <div className="w-[340px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar shrink-0">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                  <Zap size={14} className="text-rose-500" fill="currentColor" /> Active Nodes
                </h2>
                <div className="space-y-5 pb-10">
                  {filteredIncidents.map(inc => (
                    <IncidentCard key={inc.id} incident={inc} isActive={selectedIncidentId === inc.id} onClick={setSelectedIncidentId} />
                  ))}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col h-full">
                {selectedIncident?.status === 'pending_handoff' ? (
                  <div className="flex-1 flex flex-col bg-slate-950 border-2 border-rose-500/30 rounded-[40px] p-10 items-center justify-center text-center overflow-hidden">
                    <div className="bg-rose-500/10 p-10 rounded-[48px] mb-8 border border-rose-500/20 shadow-2xl">
                      <ArrowRightLeft size={64} className="text-rose-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">AI Activation Ready</h2>
                    <button 
                      onClick={() => handleHandoff(selectedIncident.id)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 transition-all"
                    >
                      ACTIVATE HONEYPOT <ChevronRight size={18} />
                    </button>
                  </div>
                ) : selectedIncident ? (
                  <div className="flex-1 h-full min-h-0">
                    <ChatInterface incident={selectedIncident} onNewMessage={handleNewMessage} isSimulating={true} />
                  </div>
                ) : null}
              </div>

              {selectedIncident && selectedIncident.status !== 'pending_handoff' && (
                <div className="w-[420px] shrink-0 h-full">
                  <EvidenceBoard incident={selectedIncident} onRefresh={handleRefreshEvidence} isExtracting={isExtracting} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;