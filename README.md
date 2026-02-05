# Honey Shield

## Scam The Scammers

### Cyber Defence

HoneyShield is an AI-powered honeypot dashboard built with React and TypeScript. It simulates victim interactions to intercept scammers (UPI fraud, vishing, phishing), extracts forensic evidence using Gemini AI, generates CERT-In compliant reports, and visualizes impact analytics—all in a dark-themed, immersive UI.

### 🚀 Live Demo
- View on AI Studio
- Deploy your own: Fork → Vercel/Netlify

### ✨ Features
- Live Honeypot Simulation: Chat as personas (e.g., Retired Officer) to waste scammer time.
- Forensic Evidence Extraction: Auto-detect UPI links, bank details, phishing URLs with confidence scores.
- Analytics Dashboard: Track intercepted minutes, blocked UPI, estimated money saved (₹228L+).
- LE Report Export: Generate I4C-compliant bundles with chain-of-custody hashes.
- Victim Handoff: Simulate voice/SMS intercepts and AI takeover.
- App Explorer: Filter threats by WhatsApp, Telegram, PhonePe, etc..

### 🛠 Tech Stack
<img width="347" height="206" alt="Screenshot 2026-02-05 at 11 14 52 PM" src="https://github.com/user-attachments/assets/c43849d0-8423-40b6-8097-006bc044dada" />

### ⚙️ Quick Start
Prerequisites: Node.js 18+

1. Clone and Install:
```bash
git clone <your-repo> && cd honeyshield
npm install
```
2. Set API Key:
Create (.env.local):
```
GEMINI_API_KEY=your_key_here
```
3. Open [http://localhost:3000](http://localhost:3000).
Build for Prod:
```bash
npm run build
npm start
```

### 🔍 Usage
- Intercept: Select incident → Simulate scammer chat → AI responds as honeypot.
- Extract: Refresh evidence → View UPI/phishing indicators → Export LE report.
- Analyze: Switch to Analytics tab for network-wide stats.

### 🤝 Contributing
1. Fork & PR.
2. Focus: Add new personas, threat types, or ML evidence models (your AI expertise fits!).
3. Run tests: 
```
npm test
```
(add soon).
4. Hackathons: Battle-tested for Consensus-style events.

### 🙏 Acknowledgments
- Built from AI Studio export.
- Inspired by honeypot tools & fraud dashboards.
- Star ⭐ if useful for your scam defense!



<div align="center">
Project Belongs to JATABELS
</div>



