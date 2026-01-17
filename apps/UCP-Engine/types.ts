
export type OmegaEntity = 
  | 'GLYTCH CORE'
  | 'Cloud Connect' 
  | 'Legendary Leads' 
  | 'LegenDatabase' 
  | 'Cloud Collect' 
  | 'Face 2 Face' 
  | 'ABC Dashboard' 
  | 'SynCloud'
  | 'SynCloud ARC';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface UCPPacket {
  ucp_header: {
    version: string;
    packet_id: string;
    timestamp: string;
    ttl_seconds: number;
    digital_stamp: {
      origin_signature: string;
      algorithm: string;
      key_id: string;
    };
  };
  ucp_payload: {
    intent: {
      domain: string;
      action: string;
      modality: 'immediate' | 'scheduled' | 'recurring';
    };
    parameters: Record<string, any>;
    target_application: {
      app_id: string;
      api_version: string;
      endpoint_canonical: string;
    };
  };
  ucp_driver?: {
    driver_id: string;
    translation_rules: string;
  };
}

export interface UCPSessionStats {
  energySaved: number;
  tokensSaved: number;
  latencyReduction: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ucpPacket?: UCPPacket;
  metadata?: {
    entity?: OmegaEntity;
    sovereign_auth?: boolean;
    layer_status?: {
      interpretation: 'COMPLETE' | 'CACHED';
      storage: 'HIT' | 'MISS';
      verification: 'VERIFIED';
      execution: 'DETERMINISTIC';
    };
    telemetry?: {
      energy: string;
      latency: string;
    };
  };
}

export enum OmegaTheme {
  MAGENTA = '#ea00ea',
  BLUE = '#2699fe',
  GREEN = '#4bce2a',
  GREY = '#3c3c3c',
  BRONZE = '#c4653a'
}
