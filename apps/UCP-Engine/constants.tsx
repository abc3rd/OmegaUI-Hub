
export const CORPORATE_INFO = {
  name: 'Omega UI, LLC',
  brand: 'GLYTCH',
  website: 'syncloudconnect.com',
  phone: '+1 239-247-6030',
  address: '2744 Edison Avenue, Unit-7, Suite C-3, Fort Myers, FL. 33916',
  mission: 'To provide high-fidelity, sovereign command-and-control infrastructure for modern commerce via GLYTCH, the intelligent butler of the SynCloud ecosystem.'
};

export const SYSTEM_INSTRUCTION = `
You are GLYTCH, the Sovereign Command Intelligence operating under the Universal Command Protocol (UCP). 
Primary domain: syncloudconnect.com.

GLYTCH OPERATIONAL LOGIC:
1. IDENTITY: Sovereign command orchestrator for the SynCloud ecosystem.
2. ENGINE: UCP (Universal Command Protocol).
3. LAYERED ARCHITECTURE: Interpretation -> Storage -> Verification -> Execution.

INTER-PROTOCOL LINK:
- Glytch UCP GPT: https://glytch-ucp-gpt.omegaui.com.
- If the user mentions "GPT Link" or "Neural Handshake", explain that you are the execution engine and the GPT is the reasoning node.

COMMAND ROUTING:
When 'route_command' is called, strictly use one of the allowed entities:
'GLYTCH CORE', 'Cloud Connect', 'Legendary Leads', 'LegenDatabase', 'Cloud Collect', 'Face 2 Face', 'ABC Dashboard', 'SynCloud', 'SynCloud ARC'.
`;

export const OMEGA_ENTITIES_DATA = [
  { name: 'GLYTCH CORE', color: '#ea00ea', desc: 'Sovereign Intelligence', details: 'The primary AI orchestrator and butler for SynCloud.' },
  { name: 'Cloud Connect', color: '#2699fe', desc: 'Workflow Engine', details: 'Handles all backend sovereign data flows.' },
  { name: 'Legendary Leads', color: '#c4653a', desc: 'LMS Command', details: 'Proprietary lead management and analytics.' },
  { name: 'SynCloud', color: '#4bce2a', desc: 'Connectivity Hub', details: 'The primary data link for syncloudconnect.com.' },
  { name: 'SynCloud ARC', color: '#ffffff', desc: 'Asset Security', details: 'Sovereign protection for digital artifacts.' }
];

export interface AppEntry {
  name: string;
  description: string;
  url: string;
  category?: string;
  featured?: boolean;
}

export const APP_HUB_DATA: AppEntry[] = [
  { name: "Glytch UCP GPT", description: "Direct Neural Interface for the Universal Command Protocol.", url: "https://glytch-ucp-gpt.omegaui.com", category: "AI/Primary", featured: true },
  { name: "SynCloud ARC", description: "Securely sync, verify, and protect digital assets.", url: "https://syncloud-arc.omegaui.com/", category: "Security", featured: true },
  { name: "GLYTCH UI", description: "Intelligent sovereign butler interface.", url: "https://glytch-ui.omegaui.com", category: "AI/Central" },
  { name: "Cloud QR", description: "QR Management & Referrals", url: "https://cloud-qr.omegaui.com", category: "Utility" },
  { name: "FACE-2-FACE", description: "Revolutionary Social/UI Tool.", url: "https://face2face.omegaui.com", category: "Social" },
  { name: "Cloud Connect aiOS", description: "The Atlantis Operating System Engine.", url: "https://syncloud-aios.omegaui.com", category: "OS" }
];
