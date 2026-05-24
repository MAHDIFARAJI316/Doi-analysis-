export interface VpnConfig {
  id: string;
  originalUri: string;
  protocol: 'VMess' | 'VLESS' | 'Trojan' | 'Shadowsocks' | 'WireGuard' | 'Hysteria2' | 'TUIC' | 'Unknown';
  name: string;
  server: string;
  port: number;
  uuidOrPassword?: string;
  security?: string;
  transport?: string;
  path?: string;
  host?: string;
  sni?: string;
  alpn?: string;
  fingerprint?: string;
  allowInsecure?: boolean;
  publicKey?: string;
  shortId?: string;
  spiderX?: string;
  flow?: string;
  method?: string; // SS encryption method
  
  // Computed Security Analytics
  securityScore: number;
  securityIssues: string[];
  securityStrengths: string[];
  
  // Computed Performance Analytics
  qualityScore: number;
  latencyMs: number;
  speedMbps: number;
  iranUsabilityPercent: number;
  suitability: {
    gaming: boolean;
    streaming: boolean;
    browsing: boolean;
    working: boolean;
  };
  
  // Network Geo Details (mocked/predicted based on domain suffix or heuristic)
  geo: {
    countryCode: string; // e.g. "DE", "FI", "FR"
    countryName: string;
    isp: string;
    asn: string;
    isCdn: boolean;
    cdnName?: string;
  };
}

export interface PatternAnalysisResult {
  naming: {
    patternDescription: string;
    embeddedInformation: string;
    emojiConsistency: number; // 0-10
    brandingStyle: string;
    overallConsistencyScore: number; // 0-10
  };
  infrastructure: {
    ipStrategy: string;
    portAllocation: string;
    domainPattern: string;
    geoDistribution: string;
  };
  protocols: {
    vmessPattern?: string;
    vlessPattern?: string;
    trojanPattern?: string;
    ssPattern?: string;
  };
  transport: {
    wsPattern?: string;
    grpcPattern?: string;
    tcpPattern?: string;
    quicPattern?: string;
  };
  tls: {
    sniStrategy: string;
    alpnStrategy: string;
    fingerprintStrategy: string;
    realityPattern?: string;
  };
  obfuscation: {
    trafficMimicking: string;
    dpiEvasion: string;
    cdnUsage: string;
  };
  provider: {
    style: 'Amateur' | 'Professional' | 'Suspicious' | 'Dynamic';
    signature: string;
    geoFocus: string;
  };
}

export interface BestPracticeRecommendation {
  title: string;
  description: string;
  example: string;
  isDos: boolean; // True for Do (Good), False for Don't (Bad/Warning)
}

export interface ExecutiveSummary {
  totalConfigs: number;
  activeCount: number;
  distinctCountries: number;
  dominantProtocol: string;
  averageSecurityScore: number;
  averageQualityScore: number;
  iranSuccessProbability: number;
  primaryRiskFactor: string;
}

export interface AnalysisResponse {
  configs: VpnConfig[];
  summary: ExecutiveSummary;
  patternAnalysis: PatternAnalysisResult;
  recommendations: BestPracticeRecommendation[];
  replicationGuide: {
    stepByStep: string[];
    sampleConfigYaml: string;
    sampleConfigJson: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
