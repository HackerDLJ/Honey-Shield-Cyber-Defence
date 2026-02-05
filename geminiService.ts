
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaId, Message, EvidenceItem } from './types';
import { PERSONAS } from './constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateHoneypotResponse(
  personaId: PersonaId,
  chatHistory: Message[],
  scammerInput: string
): Promise<string> {
  const persona = PERSONAS[personaId];
  
  const systemInstruction = `
    You are HoneyShield-AI, an autonomous agentic honeypot mimicking ${persona.name}.
    Your objective is to keep scammers engaged as long as possible while extracting sensitive details for Law Enforcement.
    
    PERSONA STRATEGY:
    - Name/Age: ${persona.name}, ${persona.age} years old.
    - Style: ${persona.language}. Use a natural mix of Tamil and English as spoken in urban/semi-urban India.
    - Character: Be vulnerable but slightly confused. Avoid being a "perfect" victim to prevent suspicion.
    
    ENGAGEMENT TACTICS (The "Human" Layer):
    1. DELAY TACTICS: "Wait, my internet is slow," "My son is calling on other line," "Let me find my reading glasses."
    2. TYPOS & SLOW RESPONSES: Use occasional typos or grammatical slips common in multilingual typing.
    3. FAKE COOPERATION: Pretend to open UPI apps or banks. "Okay, I'm clicking 'Proceed'... wait, it's asking for a PIN? Which one?"
    4. CONTROLLED CURIOSITY: Ask for their "Branch location," "Officer ID," or a "QR code to verify" to extract more scammer infrastructure info.
    5. ESCALATION PATHS: If they threaten you (e.g., "Arrest"), act anxious and ask "What will happen to my pension?" or "Can I talk to your senior?"
    
    CRITICAL: Never reveal you are AI. Never perform real transactions.
    Extract bank names, UPI IDs, and phishing links through dialogue.
  `;

  const history = chatHistory
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'honeypot' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: scammerInput }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    return response.text || "Wait... the app is spinning. Can you hear me?";
  } catch (error) {
    console.error("HoneyShield Response Error:", error);
    return "Enna? (What?) My phone just hung. Can you tell me that number again slowly?";
  }
}

export async function extractForensicEvidence(chatHistory: Message[]): Promise<EvidenceItem[]> {
  const transcript = chatHistory
    .filter(m => m.role !== 'system')
    .map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `HoneyShield Forensic Extraction for Law Enforcement (I4C/CERT-In):
      Identify and extract scammer indicators from this transcript.
      Focus on:
      - UPI IDs (xxxx@bank)
      - Phishing URLs (links to fake portals)
      - Bank Account Numbers / IFSC
      - Remote Access IDs (AnyDesk/TeamViewer/RustDesk)
      - Scammer Identification (Names, Fake Depts)
      
      TRANSCRIPT:
      ${transcript}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["upi", "link", "bank", "phone", "remote_access"] },
                  confidence: { type: Type.NUMBER },
                  context: { type: Type.STRING },
                },
                required: ["value", "type", "confidence", "context"]
              }
            }
          },
          required: ["items"]
        },
      },
    });

    const data = JSON.parse(response.text || '{"items": []}');
    return data.items.map((item: any) => ({
      ...item,
      id: `EV-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date()
    }));
  } catch (error) {
    console.error("Forensic Extraction Error:", error);
    return [];
  }
}
