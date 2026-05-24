// Parser for VPN configuration links and subscriptions
import { VpnConfig } from '../types';

// Helper: base64 decoder that supports UTF-8 safely
export function safeBase64Decode(str: string): string {
  try {
    // Normalise base64
    let cleanStr = str.trim().replace(/\s+/g, '');
    // Add padding if missing
    while (cleanStr.length % 4 !== 0) {
      cleanStr += '=';
    }
    // Handle URL safe base64
    cleanStr = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
    
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    try {
      // Fallback
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return atob(str);
    }
  }
}

// Check if string is base64
export function isBase64(str: string): boolean {
  if (!str || str.trim() === '') return false;
  try {
    const clean = str.trim().replace(/\s+/g, '');
    if (clean.length % 4 !== 0 && !clean.endsWith('=')) {
      // Try appending padding
      return isBase64(clean + '=');
    }
    return btoa(atob(clean)).replace(/=/g, '') === clean.replace(/=/g, '');
  } catch {
    return false;
  }
}

// Extract remarks/names from standard URI fragment
function parseRemark(fragment: string): string {
  if (!fragment) return '';
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

// Infer Geo & ISP based on remark & host
function inferGeo(remark: string, host: string): VpnConfig['geo'] {
  const remarkLower = remark.toLowerCase();
  const hostLower = host.toLowerCase();
  
  let countryCode = 'NL';
  let countryName = 'Netherlands';
  let isp = 'Hetzner Online GmbH';
  let asn = 'AS24940';
  let isCdn = false;
  let cdnName = '';

  // Geolocation lookup tables based on common patterns
  const geoMap: { keys: string[]; cc: string; cn: string; isp: string; asn: string }[] = [
    { keys: ['de', 'germany', 'آلمان', 'germ', 'hetzner'], cc: 'DE', cn: 'Germany', isp: 'Hetzner Online GmbH', asn: 'AS24940' },
    { keys: ['nl', 'netherlands', 'هلند', 'amsterdam'], cc: 'NL', cn: 'Netherlands', isp: 'OVH SAS', asn: 'AS16276' },
    { keys: ['fr', 'france', 'فرانسه', 'paris'], cc: 'FR', cn: 'France', isp: 'Scaleway', asn: 'AS12876' },
    { keys: ['fi', 'finland', 'فنلاند', 'helsinki'], cc: 'FI', cn: 'Finland', isp: 'Hetzner Online GmbH', asn: 'AS24940' },
    { keys: ['us', 'usa', 'america', 'ایالت', 'امریک', 'united states', 'digitalocean'], cc: 'US', cn: 'United States', isp: 'DigitalOcean, LLC', asn: 'AS14061' },
    { keys: ['gb', 'uk', 'london', 'انگلیس', 'بریتانیا'], cc: 'GB', cn: 'United Kingdom', isp: 'Linode, LLC', asn: 'AS63949' },
    { keys: ['sg', 'singapore', 'سنگاپور'], cc: 'SG', cn: 'Singapore', isp: 'Choopa, LLC', asn: 'AS20473' },
    { keys: ['tr', 'turkey', 'ترکیه', 'istanbul'], cc: 'TR', cn: 'Turkey', isp: 'Radore Data Center', asn: 'AS42926' },
    { keys: ['ae', 'dubai', 'دبی', 'امارات'], cc: 'AE', cn: 'United Arab Emirates', isp: 'Du Telecom', asn: 'AS41315' },
    { keys: ['ir', 'iran', 'ایران', 'تهران', 'mci', 'irancell', 'arvan'], cc: 'IR', cn: 'Iran', isp: 'Asiatech', asn: 'AS43754' },
    { keys: ['pl', 'poland', 'لهستان'], cc: 'PL', cn: 'Poland', isp: 'OVH SAS', asn: 'AS16276' },
    { keys: ['ru', 'russia', 'روسیه'], cc: 'RU', cn: 'Russia', isp: 'Yandex Enterprise', asn: 'AS13238' },
  ];

  // Try parsing by Host domain first
  const domainParts = host.split('.');
  const tld = domainParts[domainParts.length - 1]?.toLowerCase();
  
  let found = geoMap.find(item => item.keys.includes(tld));
  
  // Try parsing by remark keywords
  if (!found) {
    found = geoMap.find(item => 
      item.keys.some(key => remarkLower.includes(key) || hostLower.includes(key))
    );
  }

  if (found) {
    countryCode = found.cc;
    countryName = found.cn;
    isp = found.isp;
    asn = found.asn;
  }

  // Detect CDN
  if (hostLower.includes('cloudfront') || hostLower.includes('aws')) {
    isCdn = true;
    cdnName = 'Amazon CloudFront';
  } else if (hostLower.includes('cloudflare') || hostLower.includes('workers.dev') || remarkLower.includes('cdn') || remarkLower.includes('cf')) {
    isCdn = true;
    cdnName = 'Cloudflare';
  } else if (hostLower.includes('arvancloud') || hostLower.includes('arvan')) {
    isCdn = true;
    cdnName = 'ArvanCloud';
  }

  return { countryCode, countryName, isp, asn, isCdn, cdnName };
}

// Core parsers
export function parseConfigLink(link: string): VpnConfig | null {
  const cleanLink = link.trim();
  if (!cleanLink) return null;

  try {
    const id = 'cfg_' + Math.random().toString(36).substring(2, 11);
    
    // ----------------------------------------------------------------
    // 1. VMess Node Parse (URI format usually contains base64 JSON payload or custom URI)
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('vmess://')) {
      const payloadBase64 = cleanLink.substring(8).split('#')[0];
      const remarkFragment = cleanLink.substring(8).split('#')[1] || '';
      
      try {
        const decodedJsonStr = safeBase64Decode(payloadBase64);
        const obj = JSON.parse(decodedJsonStr);
        
        const host = obj.add || '';
        const port = Number(obj.port || 443);
        const name = obj.ps || parseRemark(remarkFragment) || `VMess Сервер ${host}:${port}`;
        const geo = inferGeo(name, host);

        return buildConfigResult({
          id,
          originalUri: cleanLink,
          protocol: 'VMess',
          name,
          server: host,
          port,
          uuidOrPassword: obj.id,
          security: obj.scy || (obj.tls === 'tls' ? 'tls' : 'none'),
          transport: obj.net || 'tcp',
          path: obj.path || '',
          host: obj.host || '',
          sni: obj.sni || obj.host || '',
          alpn: obj.alpn || '',
          fingerprint: obj.fp || '',
          allowInsecure: obj.verify_cert === false || obj.allowInsecure === true,
          geo
        });
      } catch (err) {
        // Fallback standard URI scheme parsing for VMess if not JSON
        return parseStandardUriScheme(cleanLink, 'VMess', id);
      }
    }

    // ----------------------------------------------------------------
    // 2. VLESS Node Parse
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('vless://')) {
      return parseStandardUriScheme(cleanLink, 'VLESS', id);
    }

    // ----------------------------------------------------------------
    // 3. Trojan Node Parse
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('trojan://')) {
      return parseStandardUriScheme(cleanLink, 'Trojan', id);
    }

    // ----------------------------------------------------------------
    // 4. Shadowsocks (SS) Node Parse
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('ss://')) {
      return parseShadowsocksUri(cleanLink, id);
    }

    // ----------------------------------------------------------------
    // 5. Hysteria 2 Node Parse
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('hysteria2://') || cleanLink.startsWith('hy2://')) {
      return parseStandardUriScheme(cleanLink, 'Hysteria2', id);
    }

    // ----------------------------------------------------------------
    // 6. TUIC Node Parse
    // ----------------------------------------------------------------
    if (cleanLink.startsWith('tuic://')) {
      return parseStandardUriScheme(cleanLink, 'TUIC', id);
    }

  } catch (error) {
    console.warn('Failed parsing proxy link:', cleanLink, error);
  }

  return null;
}

// Parses standard proxy URI formats: proto://uuid@host:port?param=val#remark
function parseStandardUriScheme(uri: string, protocol: VpnConfig['protocol'], id: string): VpnConfig | null {
  try {
    const mainParts = uri.split('#');
    const remark = mainParts[1] ? parseRemark(mainParts[0].split('#').slice(1).join('#') || mainParts[1]) : '';
    
    // Extract scheme and working string
    const schemeAndBody = mainParts[0];
    const doubleSlashIndex = schemeAndBody.indexOf('://');
    if (doubleSlashIndex === -1) return null;
    
    const bodyStr = schemeAndBody.substring(doubleSlashIndex + 3);
    
    // Parse userinfo @ host:port?query
    const atIndex = bodyStr.lastIndexOf('@');
    if (atIndex === -1) return null;
    
    const uuidOrPassword = decodeURIComponent(bodyStr.substring(0, atIndex));
    const hostPortQuery = bodyStr.substring(atIndex + 1);
    
    const queryIndex = hostPortQuery.indexOf('?');
    const hostPortStr = queryIndex === -1 ? hostPortQuery : hostPortQuery.substring(0, queryIndex);
    const queryStr = queryIndex === -1 ? '' : hostPortQuery.substring(queryIndex + 1);
    
    const portColonIndex = hostPortStr.lastIndexOf(':');
    if (portColonIndex === -1) return null;
    
    const server = hostPortStr.substring(0, portColonIndex);
    const port = Number(hostPortStr.substring(portColonIndex + 1));
    
    // Parse query params
    const queryParams: Record<string, string> = {};
    if (queryStr) {
      const pairs = queryStr.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k) {
          queryParams[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || '');
        }
      }
    }
    
    const type = queryParams.type || 'tcp';
    const security = queryParams.security || 'none';
    const sni = queryParams.sni || '';
    const alpn = queryParams.alpn || '';
    const fingerprint = queryParams.fp || '';
    const pbk = queryParams.pbk || '';
    const sid = queryParams.sid || '';
    const spx = queryParams.spx || '';
    const flow = queryParams.flow || '';
    const path = queryParams.path || queryParams.servicename || '';
    const allowInsecure = queryParams.allowinsecure === '1' || queryParams.allowinsecure === 'true' || queryParams.verify_cert === 'false';
    
    const name = remark || `${protocol}-${server}:${port}`;
    const geo = inferGeo(name, server);

    return buildConfigResult({
      id,
      originalUri: uri,
      protocol,
      name,
      server,
      port,
      uuidOrPassword,
      security,
      transport: type,
      path,
      sni,
      alpn,
      fingerprint,
      allowInsecure,
      publicKey: pbk,
      shortId: sid,
      spiderX: spx,
      flow,
      geo
    });
  } catch (err) {
    console.warn('Error parsing standard scheme URI', uri, err);
    return null;
  }
}

// Custom Shadowsocks decoding
function parseShadowsocksUri(uri: string, id: string): VpnConfig | null {
  try {
    const mainParts = uri.split('#');
    const remark = mainParts[1] ? parseRemark(mainParts.slice(1).join('#')) : '';
    const body = mainParts[0].substring(5); // remove ss://
    
    let server = '';
    let port = 443;
    let method = '';
    let uuidOrPassword = '';

    // Old format: ss://base64(method:password@host:port)
    // New format: ss://base64(method:password)@host:port
    if (body.includes('@')) {
      const parts = body.split('@');
      const decodedUserinfo = safeBase64Decode(parts[0]);
      const hostPort = parts[1];
      
      const colonUserInfo = decodedUserinfo.indexOf(':');
      if (colonUserInfo !== -1) {
        method = decodedUserinfo.substring(0, colonUserInfo);
        uuidOrPassword = decodedUserinfo.substring(colonUserInfo + 1);
      }
      
      const hostPortParts = hostPort.split(':');
      server = hostPortParts[0];
      port = Number(hostPortParts[1]?.split('?')[0] || 443);
    } else {
      // Could be full base64 encoded
      try {
        const decoded = safeBase64Decode(body);
        if (decoded.includes('@')) {
          const parts = decoded.split('@');
          const hostPort = parts[1];
          const desc = parts[0];
          
          const colonUserInfo = desc.indexOf(':');
          if (colonUserInfo !== -1) {
            method = desc.substring(0, colonUserInfo);
            uuidOrPassword = desc.substring(colonUserInfo + 1);
          }
          
          const hostPortParts = hostPort.split(':');
          server = hostPortParts[0];
          port = Number(hostPortParts[1]?.split('?')[0] || 443);
        }
      } catch {
        // Fallback partially
        server = 'ss-server';
      }
    }

    const name = remark || `SS-${server}:${port}`;
    const geo = inferGeo(name, server);

    return buildConfigResult({
      id,
      originalUri: uri,
      protocol: 'Shadowsocks',
      name,
      server,
      port,
      uuidOrPassword,
      method,
      geo
    });
  } catch (err) {
    console.warn('Shadowsocks parsing fail', uri, err);
    return null;
  }
}

// Enriches VPN config with Security analysis and Performance heuristic evaluations
function buildConfigResult(config: Partial<VpnConfig>): VpnConfig {
  const result = {
    id: config.id || '',
    originalUri: config.originalUri || '',
    protocol: config.protocol || 'Unknown',
    name: config.name || 'Unnamed node',
    server: config.server || '',
    port: Number(config.port || 443),
    uuidOrPassword: config.uuidOrPassword || '',
    security: config.security || 'none',
    transport: config.transport || 'tcp',
    path: config.path || '',
    host: config.host || '',
    sni: config.sni || '',
    alpn: config.alpn || '',
    fingerprint: config.fingerprint || '',
    allowInsecure: !!config.allowInsecure,
    publicKey: config.publicKey || '',
    shortId: config.shortId || '',
    spiderX: config.spiderX || '',
    flow: config.flow || '',
    method: config.method || '',
    geo: config.geo || { countryCode: 'NL', countryName: 'Netherlands', isp: 'Hetzner Online', asn: 'AS24940', isCdn: false },
    
    securityScore: 100,
    securityIssues: [] as string[],
    securityStrengths: [] as string[],
    qualityScore: 80,
    latencyMs: 120,
    speedMbps: 45,
    iranUsabilityPercent: 85,
    suitability: { gaming: true, streaming: true, browsing: true, working: true }
  } as VpnConfig;

  // 1. Analyze Security
  let secScore = 100;
  
  // allowInsecure vulnerability
  if (result.allowInsecure) {
    secScore -= 45;
    result.securityIssues.push('تنظیم allowInsecure فعال است؛ ترافیک در معرض حملات مرد میانی (MITM) و جعل گواهینامه است.');
  } else {
    result.securityStrengths.push('اعتبارسنجی گواهی گارددهی شده (Certificate validation is active)');
  }

  // Deprecated/outdated fields
  if (result.protocol === 'VMess' && !result.security) {
    secScore -= 15;
    result.securityIssues.push('رمزنگاری VMess تنظیم نشده است (auto default)');
  }
  
  // Weak configs
  if (result.security === 'none' && !result.publicKey && result.protocol !== 'Shadowsocks') {
    secScore -= 20;
    result.securityIssues.push('پروتکل فاقد لایه امنیتی TLS یا Reality است. انتقال ترافیک به صورت plain text انجام می‌شود.');
  }

  // Reality encryption (Ultra Secure)
  const isReality = result.security?.toLowerCase() === 'reality' || !!result.publicKey;
  if (isReality) {
    secScore += 10;
    result.securityStrengths.push('مجهز به تکنیک پیشرفته Reality TLS؛ غیرقابل کشف توسط پروب‌های فعال (Active Probing)');
  }

  // Fingerprint (uTLS)
  if (result.fingerprint) {
    result.securityStrengths.push(`استفاده از اثر انگشت شبیه‌ساز مرورگر (${result.fingerprint}) جهت خنثی‌سازی شناسایی DPI`);
  } else if (result.protocol === 'VLESS' && !isReality) {
    secScore -= 10;
    result.securityIssues.push('اثر انگشت uTLS (Fingerprint) تعریف نشده است؛ در معرض شناسایی الگوریتم‌های هوش مصنوعی مسدودساز.');
  }

  // Common/Easy-to-Block Ports
  const blockedPortsInIran = [80, 8080, 8888, 3128];
  if (blockedPortsInIran.includes(result.port)) {
    secScore -= 10;
    result.securityIssues.push(`استفاده از پورت پرترافیک عمومی (${result.port})؛ احتمال مسدودسازی سریع پورت در زیرساخت شبکه قوی ایران.`);
  }

  result.securityScore = Math.max(10, Math.min(100, secScore));

  // 2. Performance and Iran usability estimations
  let qualScore = 75;
  let latency = 130;
  let speed = 35;
  let iranPct = 80;

  // Geographic latency mappings based on Tehran distance
  const cc = result.geo.countryCode;
  if (cc === 'IR') {
    latency = 15;
    speed = 85;
    iranPct = 98;
    qualScore += 20;
  } else if (['TR', 'AE'].includes(cc)) {
    latency = 45;
    speed = 50;
    iranPct = 90;
    qualScore += 10;
  } else if (['DE', 'NL', 'FR', 'FI', 'GB', 'PL'].includes(cc)) {
    latency = 90 + Math.floor(Math.random() * 30);
    speed = 60 + Math.floor(Math.random() * 25);
    iranPct = 88;
    qualScore += 15;
  } else if (cc === 'US') {
    latency = 220 + Math.floor(Math.random() * 40);
    speed = 40 + Math.floor(Math.random() * 15);
    iranPct = 70;
    qualScore -= 10;
  } else if (cc === 'SG') {
    latency = 190 + Math.floor(Math.random() * 30);
    speed = 35 + Math.floor(Math.random() * 15);
    iranPct = 72;
    qualScore -= 5;
  }

  // Protocol/Transport influences
  if (result.transport === 'grpc') {
    speed -= 5;
    qualScore += 5; // highly stable with multiplexing
  } else if (result.transport === 'ws') {
    speed -= 8; // websocket header overhead
    latency += 15;
  } else if (result.protocol === 'Hysteria2') {
    speed += 30; // UDP-bailing congestion control
    latency -= 5;
    iranPct += 5;
  }

  // Insecure flags reduce actual performance trust
  if (result.allowInsecure) {
    qualScore -= 15;
    iranPct -= 15;
  }

  // CDN Fronting impacts
  if (result.geo.isCdn) {
    latency += 25; // CDN routing delay
    speed -= 10;
    iranPct += 12; // Excellent bypassing probability
    qualScore += 5;
  }

  result.qualityScore = Math.max(15, Math.min(100, qualScore));
  result.latencyMs = latency;
  result.speedMbps = Math.max(2, speed);
  result.iranUsabilityPercent = Math.max(20, Math.min(100, iranPct));

  // App suitability flags
  result.suitability = {
    gaming: result.latencyMs < 110 && !result.geo.isCdn && result.protocol !== 'Unknown',
    streaming: result.speedMbps > 25,
    browsing: true, // all can browse
    working: result.securityScore > 75 && result.latencyMs < 200
  };

  return result;
}

// Subscription Parser (Batch input)
export function parseSubscription(content: string): VpnConfig[] {
  if (!content) return [];
  
  let workingContent = content.trim();

  // Handle nested/un-nested Base64 subscription formats
  let attempts = 0;
  while (isBase64(workingContent) && attempts < 4) {
    try {
      workingContent = safeBase64Decode(workingContent).trim();
      attempts++;
    } catch {
      break;
    }
  }

  // Slit by lines (or commas as seen in some formats)
  const lines = workingContent.split(/[\r\n,]/);
  const configs: VpnConfig[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line contains a Clash YAML node, a JSON node, or uri
    if (
      trimmed.startsWith('vless://') ||
      trimmed.startsWith('vmess://') ||
      trimmed.startsWith('trojan://') ||
      trimmed.startsWith('ss://') ||
      trimmed.startsWith('hysteria2://') ||
      trimmed.startsWith('hy2://') ||
      trimmed.startsWith('tuic://')
    ) {
      const cfg = parseConfigLink(trimmed);
      if (cfg) {
        configs.push(cfg);
      }
    }
  }

  return configs;
}

// Generate sample configurations for user instant preview
export function generateSampleSubscription(): string {
  // Real patterns used in Iran for circumvention
  const samples = [
    // 1. High Performance Reality Germany VLESS
    `vless://7711f5ee-ccca-4444-baa4-11a2f66ff2ad@88.99.112.55:443?type=grpc&security=reality&pbk=G3-z_wshmOPhv_R3Yc9-S1_vSby1k3I6e5pIs51nS1E&sid=146afb288fa6c04f&spx=%2F&fp=chrome&sni=microsoft.com&serviceName=speed-grpc-service#🇩🇪 DE-Reality-Hetzner_NoDPI`,
    
    // 2. Cloudflare CDN WebSocket VMess Node
    `vmess://eyJhZGQiOiIxMDQuMTguMzIuNDciLCJhaWQiOiIwIiwiaG9zdCI6ImRlMS5teXZwbnByb3ZpZGVyLnNpdGUiLCJpZCI6ImI4ZDYzZmE4LTFjNWMtNGE1NS04ODVkLTRhYWI2ZjIyNzg4NCIsIm5ldCI6IndzIiwicGF0aCI6Ii9hcGkvdjIvc3RyZWFtIiwicG9ydCI6IjQ0MyIsInBzIjoi8J+HgSDwn4euIE5MLUNsb3VkZmxhcmVfV1NfVExTIiwic2N5IjoiYXV0byIsInNuaSI6ImRlMS5teXZwbnByb3ZpZGVyLnNpdGUiLCJ0bHMiOiJ0bHMiLCJmcCI6ImZpcmVmb3gifQ==`,
    
    // 3. Sequential Port Trojan Finland
    `trojan://admin-secret-99@95.217.43.201:8001?type=ws&host=fi1.highspeednodes.xyz&path=%2Ftrojan-ws&security=tls&sni=fi1.highspeednodes.xyz&fp=safari#🇫🇮 FI-Premium-Sequential_01`,
    `trojan://admin-secret-99@95.217.43.201:8002?type=ws&host=fi1.highspeednodes.xyz&path=%2Ftrojan-ws&security=tls&sni=fi1.highspeednodes.xyz&fp=safari#🇫🇮 FI-Premium-Sequential_02`,
    
    // 4. Vulnerable/Amateur allowInsecure Node
    `vless://dcf551aa-66bb-33cc-88dd-11aa22bb33cc@142.250.201.46:8080?type=ws&path=%2F&security=tls&allowInsecure=1&sni=my-unsecured-server.xyz#🔴 WARNING-WeakAllowInsecure_8080`,
    
    // 5. Shadowsocks with Cipher
    `ss://YWVzLTI1Ni1nY206cGFzc3dvcmQxMjM=@185.112.14.77:8388#🇬🇧 UK-Shadowsocks-Fast`,
  ];
  
  // Return plain-text subscription
  return samples.join('\n');
}
