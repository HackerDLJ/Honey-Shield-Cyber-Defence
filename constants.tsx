
import { Persona } from './types';

export const PERSONAS: Record<string, Persona> = {
  RETIRED_OFFICER: {
    id: 'RETIRED_OFFICER',
    name: 'Vijay Kumar (SBI KYC Desk)',
    age: 34,
    description: 'Mimics a senior bank executive. High-value bait for KYC and PAN update scams. Contact: +91 90123 45678 [Simulated]',
    traits: ['Uses bank terminology', 'Demands immediate action', 'Fake security warnings', 'Professional but urgent'],
    language: 'Tamil, Hindi, and English',
    avatar: 'https://picsum.photos/seed/banker/200/200',
  },
  STUDENT: {
    id: 'STUDENT',
    name: 'Rakesh Mishra (CBI Cyber Cell)',
    age: 42,
    description: 'Impersonates a CBI Inspector. Bait for "Digital Arrest" / Money Laundering scams. Contact: +91 92231 00045 [Simulated]',
    traits: ['Authoritative legal tone', 'Cites fake FIR numbers', 'Uses fear of arrest', 'Demands secret video calls'],
    language: 'Tamil and English',
    avatar: 'https://picsum.photos/seed/police/200/200',
  },
  SHOPKEEPER: {
    id: 'SHOPKEEPER',
    name: 'Sandeep Singh (Indian Army)',
    age: 29,
    description: 'Impersonates an Army Officer on transfer. Bait for marketplace/OLX trust scams. Contact: +91 80009 11022 [Simulated]',
    traits: ['Uses "Jai Hind"', 'Trust-building language', 'Fake ID card verification', 'Requests advance shipping fees'],
    language: 'Tamil and English',
    avatar: 'https://picsum.photos/seed/army/200/200',
  },
};

export const THREAT_COLORS = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};
