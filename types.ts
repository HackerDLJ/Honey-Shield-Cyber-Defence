
export type PersonaId = 'RETIRED_OFFICER' | 'STUDENT' | 'SHOPKEEPER';

export type AppCategory = 'WhatsApp' | 'Telegram' | 'OLX' | 'PhonePe' | 'GooglePay' | 'Instagram' | 'Facebook' | 'SMS' | 'Voice';

export interface Persona {
  id: PersonaId;
  name: string;
  age: number;
  description: string;
  traits: string[];
  language: string;
  avatar: string;
}

export interface Message {
  id: string;
  role: 'scammer' | 'honeypot' | 'user' | 'system';
  text: string;
  timestamp: Date;
  metadata?: {
    isDelayTactic?: boolean;
    detectedScamPatterns?: string[];
  };
}

export interface EvidenceItem {
  id: string;
  value: string;
  type: 'upi' | 'link' | 'bank' | 'phone' | 'remote_access';
  confidence: number;
  context: string;
  timestamp: Date;
}

export interface Evidence {
  items: EvidenceItem[];
  lastExtractionTime: Date | null;
  chainOfCustodyId: string;
  sessionHash: string;
}

export type DetectionSource = 'Truecaller' | 'SMS_Filter' | 'WhatsApp_Guard' | 'I4C_Network' | 'Manual';

export interface Incident {
  id: string;
  status: 'active' | 'archived' | 'flagged' | 'pending_handoff';
  scammerNumber: string;
  threatLevel: 'low' | 'medium' | 'high';
  persona: PersonaId;
  appCategory: AppCategory;
  messages: Message[];
  evidence: Evidence;
  createdAt: Date;
  timeWastedMinutes: number;
  detectionScore: number;
  source?: DetectionSource;
  sourceConfidence?: number;
}

export interface AnalyticsSummary {
  totalTimeWasted: number;
  totalUpiBlocked: number;
  totalLinksFlagged: number;
  totalRemoteAccessBlocked: number;
  activeIntercepts: number;
  moneySavedEstimate: number;
}
