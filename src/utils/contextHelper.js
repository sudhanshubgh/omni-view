/**
 * Location & Browser Context Profiles Utility
 * Provides distinct geographic locations, simulated IPs, User-Agent profiles,
 * and session isolation parameters for sub-browsers.
 */

export const PRESET_LOCATIONS = [
  {
    id: 'us-east',
    country: 'United States',
    city: 'New York (US East)',
    code: 'US',
    flag: '🇺🇸',
    ip: '198.51.100.45',
    latitude: 40.7128,
    longitude: -74.0060,
    language: 'en-US,en;q=0.9',
    timezone: 'America/New_York'
  },
  {
    id: 'uk-london',
    country: 'United Kingdom',
    city: 'London (UK)',
    code: 'GB',
    flag: '🇬🇧',
    ip: '185.86.151.11',
    latitude: 51.5074,
    longitude: -0.1278,
    language: 'en-GB,en;q=0.9',
    timezone: 'Europe/London'
  },
  {
    id: 'jp-tokyo',
    country: 'Japan',
    city: 'Tokyo (JP)',
    code: 'JP',
    flag: '🇯🇵',
    ip: '133.242.18.99',
    latitude: 35.6762,
    longitude: 139.6503,
    language: 'ja-JP,ja;q=0.9,en;q=0.8',
    timezone: 'Asia/Tokyo'
  },
  {
    id: 'de-frankfurt',
    country: 'Germany',
    city: 'Frankfurt (DE)',
    code: 'DE',
    flag: '🇩🇪',
    ip: '138.201.56.22',
    latitude: 50.1109,
    longitude: 8.6821,
    language: 'de-DE,de;q=0.9,en;q=0.8',
    timezone: 'Europe/Berlin'
  },
  {
    id: 'au-sydney',
    country: 'Australia',
    city: 'Sydney (AU)',
    code: 'AU',
    flag: '🇦🇺',
    ip: '139.130.4.5',
    latitude: -33.8688,
    longitude: 151.2093,
    language: 'en-AU,en;q=0.9',
    timezone: 'Australia/Sydney'
  },
  {
    id: 'ca-toronto',
    country: 'Canada',
    city: 'Toronto (CA)',
    code: 'CA',
    flag: '🇨🇦',
    ip: '198.16.176.10',
    latitude: 43.6532,
    longitude: -79.3832,
    language: 'en-CA,en;q=0.9,fr-CA;q=0.8',
    timezone: 'America/Toronto'
  },
  {
    id: 'fr-paris',
    country: 'France',
    city: 'Paris (FR)',
    code: 'FR',
    flag: '🇫🇷',
    ip: '51.15.22.108',
    latitude: 48.8566,
    longitude: 2.3522,
    language: 'fr-FR,fr;q=0.9,en;q=0.8',
    timezone: 'Europe/Paris'
  },
  {
    id: 'in-mumbai',
    country: 'India',
    city: 'Mumbai (IN)',
    code: 'IN',
    flag: '🇮🇳',
    ip: '103.21.124.8',
    latitude: 19.0760,
    longitude: 72.8777,
    language: 'en-IN,hi-IN;q=0.9,en;q=0.8',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'sg-singapore',
    country: 'Singapore',
    city: 'Singapore (SG)',
    code: 'SG',
    flag: '🇸🇬',
    ip: '128.199.200.5',
    latitude: 1.3521,
    longitude: 103.8198,
    language: 'en-SG,en;q=0.9,zh-SG;q=0.8',
    timezone: 'Asia/Singapore'
  },
  {
    id: 'br-saopaulo',
    country: 'Brazil',
    city: 'São Paulo (BR)',
    code: 'BR',
    flag: '🇧🇷',
    ip: '177.126.180.4',
    latitude: -23.5505,
    longitude: -46.6333,
    language: 'pt-BR,pt;q=0.9,en;q=0.8',
    timezone: 'America/Sao_Paulo'
  }
];

export const PRESET_BROWSER_CONTEXTS = [
  {
    id: 'chrome-win',
    name: 'Chrome 124 (Windows 11)',
    shortLabel: 'Chrome / Win11',
    os: 'Windows 11',
    browser: 'Chrome',
    icon: '🖥️',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    platform: 'Win32',
    viewport: { width: 1920, height: 1080 }
  },
  {
    id: 'safari-mac',
    name: 'Safari 17 (macOS Sonoma)',
    shortLabel: 'Safari / macOS',
    os: 'macOS Sonoma',
    browser: 'Safari',
    icon: '🍎',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    platform: 'MacIntel',
    viewport: { width: 1440, height: 900 }
  },
  {
    id: 'firefox-linux',
    name: 'Firefox 125 (Ubuntu Linux)',
    shortLabel: 'Firefox / Linux',
    os: 'Ubuntu 24.04',
    browser: 'Firefox',
    icon: '🦊',
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    platform: 'Linux x86_64',
    viewport: { width: 1920, height: 1080 }
  },
  {
    id: 'edge-win',
    name: 'Microsoft Edge 124 (Windows 11)',
    shortLabel: 'Edge / Win11',
    os: 'Windows 11',
    browser: 'Edge',
    icon: '🌐',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    platform: 'Win32',
    viewport: { width: 2560, height: 1440 }
  },
  {
    id: 'iphone-safari',
    name: 'Mobile Safari (iPhone 15 Pro)',
    shortLabel: 'Safari / iPhone 15',
    os: 'iOS 17.4',
    browser: 'Mobile Safari',
    icon: '📱',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/605.1.15',
    platform: 'iPhone',
    viewport: { width: 393, height: 852 }
  },
  {
    id: 'android-chrome',
    name: 'Chrome Mobile (Samsung Galaxy S24)',
    shortLabel: 'Chrome / Android 14',
    os: 'Android 14',
    browser: 'Chrome Mobile',
    icon: '🤖',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    viewport: { width: 412, height: 915 }
  },
  {
    id: 'brave-mac',
    name: 'Brave Browser (macOS)',
    shortLabel: 'Brave / macOS',
    os: 'macOS Sonoma',
    browser: 'Brave',
    icon: '🦁',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    viewport: { width: 1680, height: 1050 }
  }
];

/**
 * Assigns a unique Location & Context profile pair based on sub-browser index.
 */
export function createSubBrowserIdentity(index = 0, customSeed = null) {
  const locIndex = index % PRESET_LOCATIONS.length;
  const ctxIndex = index % PRESET_BROWSER_CONTEXTS.length;
  
  const location = { ...PRESET_LOCATIONS[locIndex] };
  const context = { ...PRESET_BROWSER_CONTEXTS[ctxIndex] };
  
  const sessionId = `session-sub-${index + 1}-${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    location,
    context,
    sessionId
  };
}

/**
 * Generates a completely new random location, IP, user-agent context, and session ID.
 * Excludes current location & context IDs to guarantee a realistic identity change.
 */
export function getRandomSubBrowserIdentity(currentLocId = null, currentCtxId = null) {
  const availableLocs = PRESET_LOCATIONS.filter(l => l.id !== currentLocId);
  const availableCtxs = PRESET_BROWSER_CONTEXTS.filter(c => c.id !== currentCtxId);

  const newLoc = availableLocs[Math.floor(Math.random() * availableLocs.length)] || PRESET_LOCATIONS[0];
  const newCtx = availableCtxs[Math.floor(Math.random() * availableCtxs.length)] || PRESET_BROWSER_CONTEXTS[0];
  const newSessionId = `session-rot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    location: newLoc,
    context: newCtx,
    sessionId: newSessionId
  };
}

export function getLocationById(id) {
  return PRESET_LOCATIONS.find(l => l.id === id) || PRESET_LOCATIONS[0];
}

export function getContextById(id) {
  return PRESET_BROWSER_CONTEXTS.find(c => c.id === id) || PRESET_BROWSER_CONTEXTS[0];
}
